import assert from "node:assert/strict";
import test from "node:test";
import spotHandler, { HISTORY_URL, SOURCES, fetchHistory, fetchSpot, parseHistory } from "../api/spot.js";
import receiptHandler, { codeMatches, receiptEmail } from "../api/receipt.js";
import { GOOGLE_REVIEW_URL, reviewTextLink, reviewUrl, safeReviewUrl } from "../src/desk/review-link.mjs";

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

const yahooDaily = {
  chart: { result: [{
    timestamp: [1788998400, 1789084800, 1789171200, 1789257600, 1789344000],
    indicators: { quote: [{ close: [58.112, null, 59.0004, 0.2, 60.4567] }] }
  }] }
};

test("30-day history parses daily closes and drops gaps and implausible values", async () => {
  assert.equal(HISTORY_URL, "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1mo");
  assert.deepEqual(parseHistory(yahooDaily), [
    { date: "2026-09-10", close: 58.112 },
    { date: "2026-09-12", close: 59 },
    { date: "2026-09-14", close: 60.457 }
  ]);
  assert.deepEqual(parseHistory({}), []);
  const history = await fetchHistory(routeFetch([["SI=F?interval=1d&range=1mo", ok(yahooDaily)]]));
  assert.equal(history.range, "30d");
  assert.equal(history.source, "comex");
  assert.equal(history.points.length, 3);
  await assert.rejects(fetchHistory(routeFetch([["yahoo", ok({ chart: { result: [] } })]])));
});

test("spot handler serves the 30-day range with an hour of edge cache", async () => {
  const res = mockRes();
  await spotHandler({ method: "GET", url: "/api/spot?range=30d" }, res, { fetchImpl: routeFetch([["range=1mo", ok(yahooDaily)]]) });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.points.length, 3);
  assert.match(res.headers["cache-control"], /s-maxage=3600/);

  const viaQuery = mockRes();
  await spotHandler({ method: "GET", query: { range: "30d" } }, viaQuery, { fetchImpl: routeFetch([["range=1mo", ok(yahooDaily)]]) });
  assert.equal(viaQuery.statusCode, 200);

  const down = mockRes();
  await spotHandler({ method: "GET", url: "/api/spot?range=30d" }, down, { fetchImpl: async () => { throw new Error("offline"); } });
  assert.equal(down.statusCode, 502);
  assert.equal(down.headers["cache-control"], "no-store");

  const bad = mockRes();
  await spotHandler({ method: "GET", url: "/api/spot?range=10y" }, bad);
  assert.equal(bad.statusCode, 400);

  const live = mockRes();
  await spotHandler({ method: "GET", url: "/api/spot" }, live, { fetchImpl: routeFetch([["gold-api", ok({ price: 61.2 })]]) });
  assert.equal(live.body.price, 61.2);
  assert.match(live.headers["cache-control"], /s-maxage=20/);
});

test("review link has one default, a safe server override, and a prefilled text", () => {
  assert.equal(GOOGLE_REVIEW_URL, "https://www.google.com/maps/search/?api=1&query=AG+Refining+9125+Airport+Blvd+Houston+TX");
  assert.equal(reviewUrl({}), GOOGLE_REVIEW_URL);
  assert.equal(reviewUrl({ GOOGLE_REVIEW_URL: "https://g.page/r/abc123/review" }), "https://g.page/r/abc123/review");
  assert.equal(reviewUrl({ GOOGLE_REVIEW_URL: "javascript:alert(1)" }), GOOGLE_REVIEW_URL);
  assert.equal(safeReviewUrl("http://example.com"), null);
  const sms = reviewTextLink("(713) 555-0142", GOOGLE_REVIEW_URL, "Ruth");
  assert.match(sms, /^sms:\+17135550142\?&body=/);
  const body = decodeURIComponent(sms.split("body=")[1]);
  assert.match(body, /^Hi Ruth, thank you for choosing AG Refining today\./);
  assert.ok(body.endsWith(GOOGLE_REVIEW_URL));
  assert.equal(reviewTextLink("555-01"), null);
  assert.equal(reviewTextLink(""), null);
  assert.match(reviewTextLink("+1 281 898 2719"), /^sms:\+12818982719/);
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
    assert.deepEqual(status.body, { email: false, reviewUrl: GOOGLE_REVIEW_URL });
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
  // One short, warm review invitation with the shared link, never pushy.
  assert.equal((email.text.match(/Google review/g) || []).length, 1);
  assert.match(email.text, new RegExp(`Google review helps other people find us: ${GOOGLE_REVIEW_URL.replace(/[?+.]/g, "\\$&")}`));
  assert.match(email.html, /<a href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=AG\+Refining/);
  assert.doesNotMatch(email.text, /\bplease\b|5.star|five.star|\bright now\b|today only/i);
  const override = receiptEmail({ name: "Ruth Ames", receiptNo: "AG-261011-ABCD", total: "$142.75", review: "https://g.page/r/abc123/review" });
  assert.match(override.text, /https:\/\/g\.page\/r\/abc123\/review/);
});

test("receipt status shares the review link override with the desk", async () => {
  await withEnv({ GOOGLE_REVIEW_URL: "https://g.page/r/abc123/review" }, async () => {
    const res = mockRes();
    await receiptHandler({ method: "GET" }, res);
    assert.equal(res.body.reviewUrl, "https://g.page/r/abc123/review");
  });
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
