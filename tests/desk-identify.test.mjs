import assert from "node:assert/strict";
import test from "node:test";
import identifyHandler, { MAX_IMAGE_BYTES, MODEL, imageType, normalizeIdentification } from "../api/identify.js";

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

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

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 7)]).toString("base64");
const PNG = Buffer.concat([Buffer.from("\x89PNG\r\n\x1a\n", "latin1"), Buffer.alloc(32, 1)]).toString("base64");
const env = { ANTHROPIC_API_KEY: "sk-ant-test", DESK_ACCESS_CODE: "4747" };
let ip = 10;
const request = (body, method = "POST") => ({ method, headers: { "x-forwarded-for": `198.51.100.${ip++}` }, body });
const neverCall = async () => { throw new Error("must not call the model"); };
const modelSays = (payload, extra = {}) => async (url, init) => {
  modelSays.last = { url, ...init, body: JSON.parse(init.body) };
  return { ok: true, json: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: typeof payload === "string" ? payload : JSON.stringify(payload) }], ...extra }) };
};

test("the reader reports itself unavailable until both secrets are set", async () => {
  await withEnv({ ANTHROPIC_API_KEY: undefined, DESK_ACCESS_CODE: "4747" }, async () => {
    const status = mockRes();
    await identifyHandler({ method: "GET" }, status);
    assert.deepEqual(status.body, { available: false });
    const res = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: JPEG }), res, { fetchImpl: neverCall });
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.available, false);
  });
  await withEnv(env, async () => {
    const status = mockRes();
    await identifyHandler({ method: "GET" }, status);
    assert.deepEqual(status.body, { available: true });
    const put = mockRes();
    await identifyHandler({ method: "PUT" }, put);
    assert.equal(put.statusCode, 405);
  });
});

test("the desk code locks the reader and repeated guesses are throttled", async () => {
  await withEnv(env, async () => {
    const wrong = mockRes();
    await identifyHandler(request({ code: "0000", imageBase64: JPEG }), wrong, { fetchImpl: neverCall });
    assert.equal(wrong.statusCode, 401);

    const statuses = [];
    for (let i = 0; i < 10; i += 1) {
      const res = mockRes();
      await identifyHandler({ method: "POST", headers: { "x-forwarded-for": "203.0.113.77" }, body: { code: String(1000 + i), imageBase64: JPEG } }, res, { fetchImpl: neverCall });
      statuses.push(res.statusCode);
    }
    assert.deepEqual(statuses.slice(0, 8), Array(8).fill(401));
    assert.deepEqual(statuses.slice(8), [429, 429]);
  });
});

test("photos must be a real JPEG or PNG under the size limit", async () => {
  await withEnv(env, async () => {
    const tooBig = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(MAX_IMAGE_BYTES + 10)]).toString("base64");
    const cases = [
      [{ code: "4747", imageBase64: "" }, 422],
      [{ code: "4747", imageBase64: "not base64!" }, 422],
      [{ code: "4747", imageBase64: Buffer.from("<html>hello</html>").toString("base64") }, 422],
      [{ code: "4747", imageBase64: tooBig }, 413]
    ];
    for (const [body, status] of cases) {
      const res = mockRes();
      await identifyHandler(request(body), res, { fetchImpl: neverCall });
      assert.equal(res.statusCode, status, JSON.stringify(body).slice(0, 60));
    }
    assert.equal(imageType(JPEG), "image/jpeg");
    assert.equal(imageType(PNG), "image/png");
  });
});

test("a clear sterling hallmark comes back as a desk selection", async () => {
  await withEnv(env, async () => {
    const res = mockRes();
    const fetchImpl = modelSays({ material: "sterling", purity: 0.925, coin: null, marks: ["925", "STERLING"], confidence: "high", note: "Clear 925 and STERLING stamps on the handle." });
    await identifyHandler(request({ code: "4747", imageBase64: `data:image/jpeg;base64,${JPEG}` }), res, { fetchImpl });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { material: "sterling", purity: 0.925, coin: null, marks: ["925", "STERLING"], confidence: "high", note: "Clear 925 and STERLING stamps on the handle." });

    const sent = modelSays.last;
    assert.equal(sent.url, "https://api.anthropic.com/v1/messages");
    assert.equal(sent.headers["x-api-key"], "sk-ant-test");
    assert.equal(sent.headers["anthropic-version"], "2023-06-01");
    assert.equal(sent.body.model, MODEL);
    assert.equal(sent.body.model, "claude-sonnet-5-5");
    assert.equal(sent.body.output_config.format.type, "json_schema");
    assert.deepEqual(sent.body.output_config.format.schema.properties.material.anyOf[0].enum.slice(0, 2), ["sterling", "coins"]);
    const image = sent.body.messages[0].content[0];
    assert.equal(image.type, "image");
    assert.equal(image.source.media_type, "image/jpeg");
    assert.equal(image.source.data, JPEG, "the data URL prefix is stripped");
  });
});

test("coins come back with a coin id and no purity", async () => {
  await withEnv(env, async () => {
    const res = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: PNG }), res, {
      fetchImpl: modelSays({ material: "coins", purity: 0.9, coin: "quarter90", marks: ["1964", "D"], confidence: "high", note: "A 1964-D Washington quarter." })
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.coin, "quarter90");
    assert.equal(res.body.purity, null);
    assert.equal(modelSays.last.body.messages[0].content[0].source.media_type, "image/png");
  });
});

test("model output outside the desk catalog falls back safely", async () => {
  await withEnv(env, async () => {
    const unknown = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: JPEG }), unknown, {
      fetchImpl: modelSays({ material: "gold", purity: 0.75, coin: "eagle", marks: ["18K"], confidence: "high", note: "Gold ring." })
    });
    assert.equal(unknown.statusCode, 200);
    assert.equal(unknown.body.material, null);
    assert.equal(unknown.body.purity, null);
    assert.equal(unknown.body.coin, null);
    assert.equal(unknown.body.confidence, "low");
    assert.match(unknown.body.note, /Choose the material by hand/);

    const garbage = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: JPEG }), garbage, { fetchImpl: modelSays("this is not json") });
    assert.equal(garbage.statusCode, 502);

    const refused = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: JPEG }), refused, { fetchImpl: modelSays({}, { stop_reason: "refusal" }) });
    assert.equal(refused.statusCode, 502);

    const down = mockRes();
    await identifyHandler(request({ code: "4747", imageBase64: JPEG }), down, { fetchImpl: async () => ({ ok: false, status: 529, json: async () => ({}) }) });
    assert.equal(down.statusCode, 502);
  });
});

test("normalization keeps only catalog purities, valid coins, and short marks", () => {
  assert.deepEqual(
    normalizeIdentification({ material: "sterling", purity: 0.5, coin: "dime90", marks: ["  925  ", 7, "", "X".repeat(80)], confidence: "certain", note: "" }),
    { material: "sterling", purity: null, coin: null, marks: ["925", "X".repeat(40)], confidence: "low", note: "Could not read the marks clearly. Choose the material by hand." }
  );
  assert.equal(normalizeIdentification({ material: "bullion", purity: 0.999, confidence: "medium", note: "ok" }).purity, 0.999);
  assert.equal(normalizeIdentification({ material: "coins", coin: "doubloon" }).coin, null);
  assert.deepEqual(normalizeIdentification(null).marks, []);
});
