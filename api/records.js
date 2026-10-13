// Optional cloud copy of Buy Desk sale records, kept in a PRIVATE Vercel Blob store.
//   GET    /api/records?status=1   -> { cloud: boolean }  (no code needed, reveals nothing else)
//   GET    /api/records            -> { cloud: true, records: [...] }
//   PUT    /api/records            -> body { record }, saved at sales/<receiptNo>.json
//   DELETE /api/records?receiptNo= -> removes sales/<receiptNo>.json
// Every call except the status check needs the desk code in the x-desk-code header and is
// throttled per IP with the same failure counter as /api/receipt.
// Without BLOB_READ_WRITE_TOKEN or DESK_ACCESS_CODE the cloud is simply off.
import * as blobSdk from "@vercel/blob";
import { clientKey, codeMatches, recordFailure, throttled } from "./receipt.js";

export const PREFIX = "sales/";
export const RECEIPT_PATTERN = /^AG-\d{6}-[2-9A-HJ-NP-Z]{4}$/;
const MAX_RECORD_BYTES = 1_500_000;
const READ_BATCH = 8;

export function cloudConfigured(env = process.env) {
  return Boolean(env.BLOB_READ_WRITE_TOKEN && env.DESK_ACCESS_CODE);
}

export const pathFor = (receiptNo) => `${PREFIX}${receiptNo}.json`;

function query(req) {
  if (req.query && typeof req.query === "object") return req.query;
  try {
    return Object.fromEntries(new URL(req.url || "/", "http://local").searchParams);
  } catch {
    return {};
  }
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  return typeof raw === "string" && raw ? JSON.parse(raw) : {};
}

function header(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

// The record must look like a completed desk sale before it is stored.
export function validRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return "The record is missing.";
  if (!RECEIPT_PATTERN.test(String(record.receiptNo || ""))) return "Receipt number is not valid.";
  if (Number.isNaN(Date.parse(record.createdAt))) return "The record date is not valid.";
  if (!Array.isArray(record.items)) return "The record has no items.";
  if (!Number.isFinite(Number(record.total))) return "The record total is not valid.";
  if (!record.seller || typeof record.seller !== "object") return "The record has no seller.";
  return "";
}

async function readJson(blob, pathname) {
  const result = await blob.get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  try {
    return JSON.parse(await new Response(result.stream).text());
  } catch {
    return null;
  }
}

export async function listRecords(blob) {
  const pathnames = [];
  let cursor;
  do {
    const page = await blob.list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const item of page.blobs || []) if (item.pathname?.endsWith(".json")) pathnames.push(item.pathname);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const records = [];
  for (let i = 0; i < pathnames.length; i += READ_BATCH) {
    const batch = await Promise.all(pathnames.slice(i, i + READ_BATCH).map((pathname) => readJson(blob, pathname)));
    records.push(...batch.filter((record) => record && !validRecord(record)));
  }
  return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createHandler({ blob = blobSdk, env = process.env } = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex");
    const params = query(req);
    const configured = cloudConfigured(env);

    if (req.method === "GET" && params.status != null) return res.status(200).json({ cloud: configured });
    if (!["GET", "PUT", "DELETE"].includes(req.method)) {
      res.setHeader("Allow", "GET, PUT, DELETE");
      return res.status(405).json({ message: "Use GET, PUT, or DELETE." });
    }
    if (!configured) return res.status(503).json({ cloud: false, message: "Cloud records are not set up. Records stay on this device." });

    const key = clientKey(req);
    if (throttled(key)) return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." });
    if (!codeMatches(header(req, "x-desk-code"), env.DESK_ACCESS_CODE)) {
      recordFailure(key);
      return res.status(401).json({ message: "Desk access code is not recognized." });
    }

    try {
      if (req.method === "GET") return res.status(200).json({ cloud: true, records: await listRecords(blob) });

      if (req.method === "PUT") {
        let body;
        try {
          body = readBody(req);
        } catch {
          return res.status(400).json({ message: "The record could not be read." });
        }
        const record = body?.record;
        const problem = validRecord(record);
        if (problem) return res.status(422).json({ message: problem });
        const json = JSON.stringify(record);
        if (Buffer.byteLength(json) > MAX_RECORD_BYTES) return res.status(413).json({ message: "The record is too large." });
        await blob.put(pathFor(record.receiptNo), json, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json"
        });
        return res.status(200).json({ ok: true, receiptNo: record.receiptNo });
      }

      const receiptNo = String(params.receiptNo || "");
      if (!RECEIPT_PATTERN.test(receiptNo)) return res.status(422).json({ message: "Receipt number is not valid." });
      await blob.del(pathFor(receiptNo));
      return res.status(200).json({ ok: true, receiptNo });
    } catch {
      return res.status(502).json({ message: "The cloud copy could not be reached. Records are safe on this device." });
    }
  };
}

export default createHandler();
