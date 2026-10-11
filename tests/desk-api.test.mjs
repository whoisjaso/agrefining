import assert from "node:assert/strict";
import test from "node:test";
import spotHandler, { SOURCES, fetchSpot } from "../api/spot.js";
import receiptHandler, { codeMatches, receiptEmail } from "../api/receipt.js";

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
}

const ok = (data) => async () => ({ ok: true, json: async () => data });
const routeFetch = (routes) => async (url) => {
  for (const [match, respond] of routes) if (url.includes(match)) return respond();
  throw new Error(`unexpected ${url}`);
};

test("spot uses the first healthy source", async () => {
  const spot = await fetchSpot(routeFetch([["gold-api", ok({ price: 60.949, updatedAt: "2026-10-11T18:23:07Z" })]]));
  assert.equal(spot.price, 60.949);
  assert.equal(spot.source, "gold-api");
});

test("spot fails over to Swissquote, then COMEX, and rejects implausible numbers", async () => {
  const swiss = [{ ts: 1791579600081, spreadProfilePrices: [{ bid: 60.78, ask: 60.86 }] }];
  const viaSwiss = await fetchSpot(routeFetch([
    ["gold-api", async () => ({ ok: false, status: 500 })],
    ["swissquote", ok(swiss)]
  ]));
  assert.equal(viaSwiss.source, "swissquote");
  assert.equal(viaSwiss.price, 60.82);
  assert.equal(viaSwiss.bid, 60.78);

  const viaComex = await fetchSpot(routeFetch([
    ["gold-api", ok({ price: 0.06 })],
    ["swissquote", async () => { throw new Error("timeout"); }],
    ["yahoo", ok({ chart: { result: [{ meta: { regularMarketPrice: 61.048, regularMarketTime: 1791579598 } }] } })]
  ]));
  assert.equal(viaComex.source, "comex");
  assert.equal(viaComex.price, 61.048);
});

test("spot reports a clear failure when every source is down", async () => {
  await assert.rejects(fetchSpot(async () => { throw new Error("offline"); }), (error) => {
    assert.equal(error.details.length, SOURCES.length);
    return true;
  });
});

test("spot handler only answers GET", async () => {
  const res = mockRes();
  await spotHandler({ method: "POST" }, res);
  assert.equal(res.statusCode, 405);
});

test("desk code comparison is exact", () => {
  assert.equal(codeMatches("4747", "4747"), true);
  assert.equal(codeMatches("4748", "4747"), false);
  assert.equal(codeMatches("47470", "4747"), false);
  assert.equal(codeMatches("", ""), false);
  assert.equal(codeMatches("4747", undefined), false);
});

const PDF = Buffer.from("%PDF-1.3 test receipt").toString("base64");
const validBody = { code: "4747", to: "client@example.com", name: "Ruth Ames", receiptNo: "AG-261011-ABCD", total: "$142.75", pdfBase64: PDF };

async function withEnv(env, fn) {
  const saved = {};
  for (const key of Object.keys(env)) {
    saved[key] = process.env[key];
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try { return await fn(); } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("receipt email is disabled until both secrets are configured", async () => {
  await withEnv({ RESEND_API_KEY: "re_test", DESK_ACCESS_CODE: undefined }, async () => {
    const status = mockRes();
    await receiptHandler({ method: "GET" }, status);
    assert.deepEqual(status.body, { email: false });
    const res = mockRes();
    await receiptHandler({ method: "POST", body: validBody }, res);
    assert.equal(res.statusCode, 503);
  });
});

test("receipt email rejects wrong codes and bad payloads", async () => {
  await withEnv({ RESEND_API_KEY: "re_test", DESK_ACCESS_CODE: "4747" }, async () => {
    const neverSend = async () => { throw new Error("must not send"); };
    const cases = [
      [{ ...validBody, code: "0000" }, 401],
      [{ ...validBody, to: "not-an-email" }, 422],
      [{ ...validBody, receiptNo: "<script>" }, 422],
      [{ ...validBody, pdfBase64: Buffer.from("<html>").toString("base64") }, 422],
      [{ ...validBody, pdfBase64: "" }, 422]
    ];
    for (const [body, status] of cases) {
      const res = mockRes();
      await receiptHandler({ method: "POST", body }, res, { fetchImpl: neverSend });
      assert.equal(res.statusCode, status, JSON.stringify(body).slice(0, 80));
    }
  });
});

test("receipt email sends the PDF to the client with a copy to AG Refining", async () => {
  await withEnv({ RESEND_API_KEY: "re_test", DESK_ACCESS_CODE: "4747", AG_LEAD_TO_EMAIL: undefined }, async () => {
    let sent;
    const res = mockRes();
    await receiptHandler({ method: "POST", body: validBody }, res, {
      fetchImpl: async (url, init) => { sent = { url, ...init, body: JSON.parse(init.body) }; return { ok: true }; }
    });
    assert.equal(res.statusCode, 200);
    assert.equal(sent.url, "https://api.resend.com/emails");
    assert.deepEqual(sent.body.to, ["client@example.com"]);
    assert.deepEqual(sent.body.bcc, ["dennis@agrefining.com"]);
    assert.equal(sent.body.reply_to, "dennis@agrefining.com");
    assert.equal(sent.body.attachments[0].filename, "AG-Refining-Receipt-AG-261011-ABCD.pdf");
    assert.equal(sent.body.attachments[0].content, PDF);
  });
});

test("receipt email copy is warm, short, and contains no pricing detail", () => {
  const email = receiptEmail({ name: "Ruth Ames", receiptNo: "AG-261011-ABCD", total: "$142.75" });
  assert.match(email.text, /^Hello Ruth,/);
  assert.match(email.html, /\$142\.75/);
  assert.doesNotMatch(email.text, /spot|market|spread|margin/i);
});

test("repeated wrong desk codes are throttled", async () => {
  await withEnv({ RESEND_API_KEY: "re_test", DESK_ACCESS_CODE: "4747" }, async () => {
    const neverSend = async () => { throw new Error("must not send"); };
    const req = (code) => ({ method: "POST", headers: { "x-forwarded-for": "203.0.113.9" }, body: { ...validBody, code } });
    const statuses = [];
    for (let i = 0; i < 10; i += 1) {
      const res = mockRes();
      await receiptHandler(req(String(1000 + i)), res, { fetchImpl: neverSend });
      statuses.push(res.statusCode);
    }
    assert.deepEqual(statuses.slice(0, 8), Array(8).fill(401));
    assert.deepEqual(statuses.slice(8), [429, 429]);
    const right = mockRes();
    await receiptHandler(req("4747"), right, { fetchImpl: neverSend });
    assert.equal(right.statusCode, 429, "even the right code waits out the lockout");
  });
});
