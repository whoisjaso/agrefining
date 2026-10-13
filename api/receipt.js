// Emails a Buy Desk receipt PDF to the seller, with a copy to AG Refining.
// Locked by DESK_ACCESS_CODE so the endpoint cannot be used as an open mail relay.
import { timingSafeEqual } from "node:crypto";
import { escapeHtml } from "../src/review-form.mjs";
import { reviewUrl } from "../src/desk/review-link.mjs";

const MAX_PDF_BYTES = 3_000_000;
const DEFAULT_TO_EMAIL = "dennis@agrefining.com";
const DEFAULT_FROM_EMAIL = "AG Refining <website@agrefining.com>";
const RECEIPT_PATTERN = /^AG-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

function text(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

// Slow down code guessing. Serverless instances are short-lived, so this is a
// deterrent layered on top of the code itself, not a guarantee.
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const failures = new Map();

export function clientKey(req) {
  return String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

export function throttled(key, now = Date.now()) {
  const entry = failures.get(key);
  if (!entry || now - entry.first > FAILURE_WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(key, now = Date.now()) {
  const entry = failures.get(key);
  if (!entry || now - entry.first > FAILURE_WINDOW_MS) failures.set(key, { first: now, count: 1 });
  else entry.count += 1;
  if (failures.size > 5000) failures.clear();
}

export function codeMatches(given, expected) {
  if (!expected) return false;
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  return typeof raw === "string" && raw ? JSON.parse(raw) : {};
}

export function receiptEmail({ name, receiptNo, total, review = reviewUrl(process.env) }) {
  const first = name.split(/\s+/)[0] || "there";
  const plain = [
    `Hello ${first},`,
    "",
    `Thank you for choosing AG Refining. Your receipt ${receiptNo} is attached for your records.`,
    total ? `Amount paid: ${total}` : "",
    "",
    "If you have more silver in the future, or know someone who does, we are always glad to help.",
    "",
    `If we took good care of you, a short Google review helps other people find us: ${review}`,
    "",
    "Dennis Stevens",
    "AG Refining · Houston, Texas",
    "(281) 898-2719 · dennis@agrefining.com"
  ].filter((line, index, all) => line || all[index - 1] !== "").join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#20354c;line-height:1.6;max-width:560px">
  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#416b94;margin:0 0 18px">AG Refining · Receipt ${escapeHtml(receiptNo)}</p>
  <p>Hello ${escapeHtml(first)},</p>
  <p>Thank you for choosing AG Refining. Your receipt is attached for your records.</p>
  ${total ? `<p style="font-size:22px;color:#102a43;margin:22px 0"><strong>${escapeHtml(total)}</strong> paid</p>` : ""}
  <p>If you have more silver in the future, or know someone who does, we are always glad to help.</p>
  <p>If we took good care of you, a short <a href="${escapeHtml(review)}" style="color:#1d5e96">Google review</a> helps other people find us.</p>
  <p style="margin-top:28px">Dennis Stevens<br>AG Refining · Houston, Texas<br><a href="tel:+12818982719" style="color:#1d5e96">(281) 898-2719</a> · <a href="mailto:dennis@agrefining.com" style="color:#1d5e96">dennis@agrefining.com</a></p>
</div>`;
  return { text: plain, html };
}

export default async function handler(req, res, { fetchImpl = fetch } = {}) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.DESK_ACCESS_CODE);

  // The desk reads the review link from here so GOOGLE_REVIEW_URL is honored on the tablet too.
  if (req.method === "GET") return res.status(200).json({ email: configured, reviewUrl: reviewUrl(process.env) });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Use POST." });
  }
  if (!configured) return res.status(503).json({ message: "Receipt email is not set up yet. Use Share or Print instead." });

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ message: "The receipt could not be read." });
  }

  const key = clientKey(req);
  if (throttled(key)) return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." });
  if (!codeMatches(body.code, process.env.DESK_ACCESS_CODE)) {
    recordFailure(key);
    return res.status(401).json({ message: "Desk access code is not recognized." });
  }

  const to = text(body.to, 254).toLowerCase();
  const name = text(body.name, 120);
  const receiptNo = text(body.receiptNo, 20);
  const total = text(body.total, 30);
  const pdf = String(body.pdfBase64 || "").replace(/^data:application\/pdf;base64,/, "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(422).json({ message: "Enter a valid email address." });
  if (!RECEIPT_PATTERN.test(receiptNo)) return res.status(422).json({ message: "Receipt number is not valid." });
  if (!pdf || !/^[A-Za-z0-9+/=]+$/.test(pdf) || pdf.length * 0.75 > MAX_PDF_BYTES) {
    return res.status(422).json({ message: "The receipt file is missing or too large." });
  }
  if (!Buffer.from(pdf.slice(0, 8), "base64").toString("latin1").startsWith("%PDF")) {
    return res.status(422).json({ message: "The receipt file is not a PDF." });
  }

  const owner = process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL;
  const content = receiptEmail({ name, receiptNo, total });
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `receipt-${receiptNo}-${to}`
      },
      body: JSON.stringify({
        from: process.env.AG_LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        to: [to],
        bcc: to === owner ? undefined : [owner],
        reply_to: owner,
        subject: `Your AG Refining receipt ${receiptNo}`,
        text: content.text,
        html: content.html,
        attachments: [{ filename: `AG-Refining-Receipt-${receiptNo}.pdf`, content: pdf }]
      })
    });
    if (!response.ok) throw new Error("Resend rejected the receipt");
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ message: "The receipt email could not be sent. Use Share or Print instead." });
  }
}
