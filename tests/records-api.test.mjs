// /api/records: the optional private Vercel Blob copy of desk sales, with a mocked blob client.
import assert from "node:assert/strict";
import test from "node:test";
import { PREFIX, cloudConfigured, createHandler, pathFor, validRecord } from "../api/records.js";

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
}

// In-memory stand-in for @vercel/blob with the calls the endpoint uses.
function mockBlob({ pageSize = 2 } = {}) {
  const files = new Map();
  const calls = [];
  return {
    files,
    calls,
    async list({ prefix, cursor, limit }) {
      calls.push(["list", prefix, cursor || null, limit]);
      const names = [...files.keys()].filter((name) => name.startsWith(prefix)).sort();
      const start = cursor ? Number(cursor) : 0;
      const slice = names.slice(start, start + pageSize);
      const hasMore = start + pageSize < names.length;
      return { blobs: slice.map((pathname) => ({ pathname, url: `https://store.private.blob.vercel-storage.com/${pathname}` })), hasMore, cursor: hasMore ? String(start + pageSize) : undefined };
    },
    async get(pathname, options) {
      calls.push(["get", pathname, options.access]);
      if (!files.has(pathname)) return null;
      return { statusCode: 200, stream: new Response(files.get(pathname).body).body, blob: { contentType: "application/json" } };
    },
    async put(pathname, body, options) {
      calls.push(["put", pathname, options]);
      files.set(pathname, { body, options });
      return { pathname };
    },
    async del(pathname) {
      calls.push(["del", pathname]);
      files.delete(pathname);
    }
  };
}

const env = { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test", DESK_ACCESS_CODE: "4747" };
let ip = 0;
const nextIp = () => `203.0.113.${(ip += 1)}`;
const record = (receiptNo = "AG-261013-K7QP", extra = {}) => ({
  receiptNo,
  createdAt: "2026-10-13T15:00:00.000Z",
  seller: { name: "Ruth Ames", idNumber: "TX44120987" },
  payment: "Cash",
  items: [{ title: "Sterling silver", detail: "250 grams", offer: 356.87 }],
  total: 356.87,
  private: { spread: 67.1 },
  ...extra
});
const req = ({ method = "GET", query = {}, body, code = "4747", from = nextIp() } = {}) => ({
  method,
  query,
  body,
  headers: { "x-forwarded-for": from, ...(code == null ? {} : { "x-desk-code": code }) }
});

async function call(handler, options) {
  const res = mockRes();
  await handler(req(options), res);
  return res;
}

test("status reports whether the cloud is set up, without a code", async () => {
  const on = createHandler({ blob: mockBlob(), env });
  const res = await call(on, { query: { status: "1" }, code: null });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { cloud: true });
  assert.equal(res.headers["cache-control"], "no-store");
  assert.equal(res.headers["x-robots-tag"], "noindex");
  for (const partial of [{}, { DESK_ACCESS_CODE: "4747" }, { BLOB_READ_WRITE_TOKEN: "x" }]) {
    const off = createHandler({ blob: mockBlob(), env: partial });
    assert.deepEqual((await call(off, { query: { status: "1" } })).body, { cloud: false });
    assert.equal(cloudConfigured(partial), false);
  }
  assert.equal(cloudConfigured(env), true);
});

test("with the cloud off every other call answers 503 and never touches storage", async () => {
  const blob = mockBlob();
  const off = createHandler({ blob, env: {} });
  for (const method of ["GET", "PUT", "DELETE"]) {
    const res = await call(off, { method, body: { record: record() }, query: { receiptNo: "AG-261013-K7QP" } });
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.cloud, false);
  }
  assert.deepEqual(blob.calls, []);
});

test("the desk code is required and checked, and repeated failures are throttled per IP", async () => {
  const blob = mockBlob();
  const handler = createHandler({ blob, env });
  assert.equal((await call(handler, { code: null })).statusCode, 401);
  assert.equal((await call(handler, { code: "0000" })).statusCode, 401);
  assert.equal((await call(handler, { code: "47470" })).statusCode, 401);
  const attacker = "198.51.100.9";
  for (let i = 0; i < 8; i += 1) assert.equal((await call(handler, { code: `11${i}1`, from: attacker })).statusCode, 401);
  const blocked = await call(handler, { code: "4747", from: attacker });
  assert.equal(blocked.statusCode, 429, "even the right code waits after eight failures");
  assert.equal((await call(handler, { code: "4747" })).statusCode, 200, "other addresses are unaffected");
  assert.equal(blob.calls.filter(([name]) => name !== "list").length, 0);
});

test("PUT stores one private JSON record at sales/<receiptNo>.json, overwriting on re-sync", async () => {
  const blob = mockBlob();
  const handler = createHandler({ blob, env });
  const res = await call(handler, { method: "PUT", body: { record: record() } });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, receiptNo: "AG-261013-K7QP" });
  const [, pathname, options] = blob.calls.find(([name]) => name === "put");
  assert.equal(pathname, "sales/AG-261013-K7QP.json");
  assert.equal(pathFor("AG-261013-K7QP"), pathname);
  assert.deepEqual(options, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
  assert.deepEqual(JSON.parse(blob.files.get(pathname).body), record());
  const string = await call(handler, { method: "PUT", body: JSON.stringify({ record: record("AG-261013-K7QP", { total: 400 }) }) });
  assert.equal(string.statusCode, 200, "a raw JSON body is accepted too");
  assert.equal(JSON.parse(blob.files.get(pathname).body).total, 400);
});

test("PUT rejects records that are not completed desk sales", async () => {
  const blob = mockBlob();
  const handler = createHandler({ blob, env });
  const bad = [
    undefined,
    record("../../etc/passwd"),
    record("AG-261013-K7QP", { createdAt: "yesterday" }),
    record("AG-261013-K7QP", { items: "many" }),
    record("AG-261013-K7QP", { total: "lots" }),
    record("AG-261013-K7QP", { seller: null })
  ];
  for (const item of bad) assert.equal((await call(handler, { method: "PUT", body: { record: item } })).statusCode, 422);
  assert.equal((await call(handler, { method: "PUT", body: "{not json" })).statusCode, 400);
  const huge = record("AG-261013-K7QP", { signature: `data:image/png;base64,${"A".repeat(1_600_000)}` });
  assert.equal((await call(handler, { method: "PUT", body: { record: huge } })).statusCode, 413);
  assert.equal(blob.calls.filter(([name]) => name === "put").length, 0);
  assert.equal(validRecord(record()), "");
});

test("GET lists every page under sales/ and returns the records, newest first", async () => {
  const blob = mockBlob({ pageSize: 2 });
  const handler = createHandler({ blob, env });
  for (const [no, day] of [["AG-261001-AAAA", "01"], ["AG-261013-BBBB", "13"], ["AG-261007-CCCC", "07"]]) {
    await call(handler, { method: "PUT", body: { record: record(no, { createdAt: `2026-10-${day}T12:00:00.000Z` }) } });
  }
  blob.files.set("sales/broken.json", { body: "{nope" });
  blob.files.set("other/AG-261013-DDDD.json", { body: JSON.stringify(record("AG-261013-DDDD")) });
  const res = await call(handler, {});
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.cloud, true);
  assert.deepEqual(res.body.records.map((r) => r.receiptNo), ["AG-261013-BBBB", "AG-261007-CCCC", "AG-261001-AAAA"]);
  const lists = blob.calls.filter(([name]) => name === "list");
  assert.equal(lists.length, 2, "follows the cursor");
  assert.ok(lists.every(([, prefix]) => prefix === PREFIX));
  assert.ok(blob.calls.filter(([name]) => name === "get").every(([, , access]) => access === "private"));
});

test("DELETE removes one record by receipt number", async () => {
  const blob = mockBlob();
  const handler = createHandler({ blob, env });
  await call(handler, { method: "PUT", body: { record: record() } });
  const res = await call(handler, { method: "DELETE", query: { receiptNo: "AG-261013-K7QP" } });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(blob.calls.at(-1), ["del", "sales/AG-261013-K7QP.json"]);
  assert.equal(blob.files.size, 0);
  assert.equal((await call(handler, { method: "DELETE", query: { receiptNo: "sales/*" } })).statusCode, 422);
  assert.equal((await call(handler, { method: "DELETE", query: {} })).statusCode, 422);
});

test("unsupported methods and storage failures answer clearly", async () => {
  const handler = createHandler({ blob: mockBlob(), env });
  const post = await call(handler, { method: "POST" });
  assert.equal(post.statusCode, 405);
  assert.equal(post.headers.allow, "GET, PUT, DELETE");
  const failing = createHandler({ blob: { ...mockBlob(), list: async () => { throw new Error("blob down"); } }, env });
  const res = await call(failing, {});
  assert.equal(res.statusCode, 502);
  assert.match(res.body.message, /safe on this device/);
  // Query parsing also works from a raw URL, as on plain Node servers.
  const raw = mockRes();
  await handler({ method: "GET", url: "/api/records?status=1", headers: {} }, raw);
  assert.deepEqual(raw.body, { cloud: true });
});
