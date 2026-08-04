import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/leads.js";

const validLead = {
  name: "Maria Gomez",
  business: "Gulf Medical Imaging",
  phone: "281-555-0144",
  email: "maria@example.com",
  intent: "pickup",
  material: "xray_film",
  quantity: "12 archive boxes",
  location: "Houston, TX",
  frequency: "one_time",
  preferred_contact: "email",
  details: "De-identified film cleared for an authorized material review.",
  company_url: "",
  form_started: "0",
  submission_key: "test-native-001",
  locale: "en"
};

function encoded(values) {
  return new URLSearchParams(values).toString();
}

async function invoke({
  method = "POST",
  headers = {},
  body,
  query = {},
  url = "/api/leads"
} = {}) {
  const state = {
    statusCode: 200,
    headers: {},
    body: "",
    payload: undefined
  };
  const res = {
    setHeader(name, value) {
      state.headers[String(name).toLowerCase()] = String(value);
      return res;
    },
    status(code) {
      state.statusCode = code;
      return res;
    },
    json(value) {
      state.payload = value;
      state.body = JSON.stringify(value);
      if (!state.headers["content-type"]) state.headers["content-type"] = "application/json; charset=utf-8";
      return res;
    },
    send(value = "") {
      state.body = String(value);
      return res;
    },
    end(value = "") {
      if (value !== undefined) state.body = String(value);
      return res;
    }
  };
  await handler({ method, headers, body, query, url }, res);
  return state;
}

async function withDelivery({ apiKey, fetchImpl }, callback) {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFetch = globalThis.fetch;
  if (apiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = apiKey;
  if (fetchImpl) globalThis.fetch = fetchImpl;
  try {
    return await callback();
  } finally {
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
    globalThis.fetch = previousFetch;
  }
}

test("URL-encoded invalid native submission returns escaped HTML recovery", { concurrency: false }, async () => {
  const response = await invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: encoded({
      ...validLead,
      name: "<script>alert(1)</script>",
      phone: "1",
      email: "not-an-email",
      material: "not-a-material",
      location: "",
      details: "short"
    })
  });

  assert.equal(response.statusCode, 422);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /<html lang="en">/);
  assert.match(response.body, /data-lead-result="validation"/);
  assert.match(response.body, /href="#email"/);
  assert.match(response.body, /<form[^>]*data-review-form/);
  assert.match(response.body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(response.body, /<script>alert\(1\)<\/script>/);
});

test("native delivery-unavailable response preserves phone and email recovery", { concurrency: false }, async () => {
  let fetchCalls = 0;
  const response = await withDelivery({
    apiKey: undefined,
    fetchImpl: async () => {
      fetchCalls += 1;
      return { ok: true };
    }
  }, () => invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: encoded(validLead)
  }));

  assert.equal(fetchCalls, 0);
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /data-lead-result="delivery-failure"/);
  assert.match(response.body, /href="tel:\+12818982719"/);
  assert.match(response.body, /href="mailto:dennis@agrefining\.com\?subject=/);
  assert.match(response.body, /xray_film/);
  assert.match(response.body, /Houston%2C%20TX/);
});

test("native success uses a private 303 receipt and GET does not redeliver", { concurrency: false }, async () => {
  const calls = [];
  const post = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (...args) => {
      calls.push(args);
      return { ok: true };
    }
  }, () => invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: encoded(validLead)
  }));

  assert.equal(calls.length, 1);
  assert.equal(post.statusCode, 303);
  assert.equal(post.headers.location, "/api/leads?status=received&lang=en");
  assert.doesNotMatch(post.headers.location, /Maria|Gulf|Houston|xray|maria%40/i);

  const receipt = await invoke({
    method: "GET",
    headers: { accept: "text/html" },
    query: { status: "received", lang: "en" },
    url: post.headers.location
  });
  assert.equal(receipt.statusCode, 200);
  assert.equal(receipt.headers["content-type"], "text/html; charset=utf-8");
  assert.match(receipt.body, /data-lead-result="success"/);
  assert.match(receipt.body, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(receipt.body, /request (?:was )?received/i);
  assert.match(receipt.body, /href="\/contact"/);
  assert.match(receipt.body, /href="tel:\+12818982719"/);
});

test("Spanish native validation and delivery failure stay Spanish", { concurrency: false }, async () => {
  const invalid = await invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: encoded({ ...validLead, locale: "es", email: "mal", phone: "1", details: "corto" })
  });
  assert.equal(invalid.statusCode, 422);
  assert.match(invalid.body, /<html lang="es">/);
  assert.match(invalid.body, /Revise los campos indicados/);
  assert.match(invalid.body, /correo electr[oó]nico v[aá]lido/i);
  assert.match(invalid.body, /href="\/espanol#solicitud"/);
  assert.doesNotMatch(invalid.body, /Please review the highlighted fields/);

  const unavailable = await withDelivery({ apiKey: undefined }, () => invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: encoded({ ...validLead, locale: "es" })
  }));
  assert.equal(unavailable.statusCode, 503);
  assert.match(unavailable.body, /<html lang="es">/);
  assert.match(unavailable.body, /Enviar estos datos por correo/);
  assert.match(unavailable.body, /href="\/espanol#solicitud"/);
  assert.doesNotMatch(unavailable.body, /Online delivery is being set up/);
});

test("enhanced JSON remains backward-compatible", { concurrency: false }, async () => {
  const jsonHeaders = { accept: "application/json", "content-type": "application/json" };
  const invalid = await invoke({ headers: jsonHeaders, body: { ...validLead, email: "bad" } });
  assert.equal(invalid.statusCode, 422);
  assert.equal(invalid.payload.message, "Please review the highlighted fields.");
  assert.equal(typeof invalid.payload.fields, "object");
  assert.equal(typeof invalid.payload.fields.email, "string");

  const success = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => ({ ok: true })
  }, () => invoke({ headers: jsonHeaders, body: validLead }));
  assert.equal(success.statusCode, 200);
  assert.deepEqual(success.payload, { ok: true });

  const unavailable = await withDelivery({ apiKey: undefined }, () => invoke({ headers: jsonHeaders, body: validLead }));
  assert.equal(unavailable.statusCode, 503);
  assert.equal(typeof unavailable.payload.message, "string");
  assert.equal(unavailable.payload.fallback_email, "dennis@agrefining.com");

  const failed = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => ({ ok: false })
  }, () => invoke({ headers: jsonHeaders, body: validLead }));
  assert.equal(failed.statusCode, 502);
  assert.equal(failed.payload.fallback_email, "dennis@agrefining.com");
});

test("content negotiation selects safe browser and JSON defaults", { concurrency: false }, async () => {
  const native = await invoke({
    headers: { accept: "*/*", "content-type": "application/x-www-form-urlencoded" },
    body: encoded({ ...validLead, email: "bad" })
  });
  assert.equal(native.statusCode, 422);
  assert.equal(native.headers["content-type"], "text/html; charset=utf-8");

  const json = await invoke({
    headers: { "content-type": "application/json" },
    body: { ...validLead, email: "bad" }
  });
  assert.equal(json.statusCode, 422);
  assert.equal(json.headers["content-type"], "application/json; charset=utf-8");
  assert.equal(typeof json.payload.fields.email, "string");

  const browserGet = await invoke({
    method: "GET",
    headers: { accept: "text/html" },
    query: { lang: "es" },
    url: "/api/leads?lang=es"
  });
  assert.equal(browserGet.statusCode, 405);
  assert.equal(browserGet.headers["content-type"], "text/html; charset=utf-8");
  assert.match(browserGet.body, /href="\/espanol#solicitud"/);

  const jsonGet = await invoke({ method: "GET", headers: { accept: "application/json" } });
  assert.equal(jsonGet.statusCode, 405);
  assert.equal(jsonGet.payload.message, "Use the pickup request form.");
});

test("oversized and malformed bodies stay recoverable", { concurrency: false }, async () => {
  const oversizedHtml = await invoke({
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
      "content-length": "32001"
    },
    body: ""
  });
  assert.equal(oversizedHtml.statusCode, 413);
  assert.match(oversizedHtml.body, /href="tel:\+12818982719"/);
  assert.match(oversizedHtml.body, /href="\/contact"/);

  const oversizedJson = await invoke({
    headers: { accept: "application/json", "content-type": "application/json", "content-length": "32001" },
    body: "{}"
  });
  assert.equal(oversizedJson.statusCode, 413);
  assert.equal(typeof oversizedJson.payload.message, "string");

  const malformedHtml = await invoke({
    headers: { accept: "text/html", "content-type": "text/plain" },
    body: "{"
  });
  assert.equal(malformedHtml.statusCode, 400);
  assert.match(malformedHtml.body, /href="tel:\+12818982719"/);
  assert.match(malformedHtml.body, /href="\/contact"/);

  const malformedJson = await invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: "{"
  });
  assert.equal(malformedJson.statusCode, 400);
  assert.equal(typeof malformedJson.payload.message, "string");
});

test("honeypot native submissions do not deliver or disclose their contents", { concurrency: false }, async () => {
  let fetchCalls = 0;
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => {
      fetchCalls += 1;
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "text/html", "content-type": "application/x-www-form-urlencoded" },
    body: encoded({ ...validLead, company_url: "https://spam.example/evil" })
  }));

  assert.equal(fetchCalls, 0);
  assert.equal(response.statusCode, 303);
  assert.equal(response.headers.location, "/api/leads?status=received&lang=en");
  assert.doesNotMatch(`${response.body}${response.headers.location}`, /spam|evil/i);
});
