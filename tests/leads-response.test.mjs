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

test("native delivery-unavailable response asks the visitor to call, never to email it themselves", { concurrency: false }, async () => {
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
  assert.doesNotMatch(response.body, /mailto:/);
  assert.match(response.body, /Please call \(281\) 898-2719/);
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

  assert.equal(calls.length, 2, "one email to AG Refining, one confirmation to the visitor");
  const [ownerEmail, confirmation] = calls.map(([, init]) => JSON.parse(init.body));
  assert.deepEqual(ownerEmail.to, ["dennis@agrefining.com"]);
  assert.equal(ownerEmail.reply_to, "maria@example.com");
  assert.deepEqual(confirmation.to, ["maria@example.com"]);
  assert.equal(confirmation.reply_to, "dennis@agrefining.com");
  assert.match(confirmation.subject, /received your AG Refining pickup request/);
  assert.notEqual(calls[0][1].headers["Idempotency-Key"], calls[1][1].headers["Idempotency-Key"]);
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
  assert.match(receipt.body, /Got It\. We&#039;ll Call You Soon/);
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
  assert.match(unavailable.body, /Llame al \(281\) 898-2719/);
  assert.doesNotMatch(unavailable.body, /mailto:/);
  assert.match(unavailable.body, /href="\/espanol#solicitud"/);
  assert.doesNotMatch(unavailable.body, /Something went wrong on our end/);
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
  assert.equal(unavailable.payload.fallback_email, undefined);
  assert.equal(unavailable.payload.call_href, "tel:+12818982719");

  const failed = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => ({ ok: false })
  }, () => invoke({ headers: jsonHeaders, body: validLead }));
  assert.equal(failed.statusCode, 502);
  assert.equal(failed.payload.fallback_email, undefined);
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

test("preferred pickup day and time reach the owner and the visitor", { concurrency: false }, async () => {
  const { cleanPickupDate } = await import("../api/leads.js");
  const now = new Date("2026-10-11T15:00:00Z");
  assert.equal(cleanPickupDate("2026-10-14", now), "2026-10-14");
  assert.equal(cleanPickupDate("2026-10-11", now), "2026-10-11");
  assert.equal(cleanPickupDate("2026-02-30", now), "", "impossible dates are dropped");
  assert.equal(cleanPickupDate("2025-01-01", now), "", "past dates are dropped");
  assert.equal(cleanPickupDate("2030-01-01", now), "", "dates over a year out are dropped");
  assert.equal(cleanPickupDate("<b>", now), "");

  const future = new Date(Date.now() + 3 * 86400 * 1000).toISOString().slice(0, 10);
  const sent = [];
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ ...validLead, submission_key: "test-schedule-001", pickup_date: future, pickup_window: "afternoon" })
  }));
  assert.equal(response.statusCode, 200);
  assert.match(sent[0].text, /Preferred time: \w+day, \w+ \d+, in the afternoon/);
  assert.match(sent[0].html, /href="tel:2815550144"/, "owner email has a one-tap call button");
  assert.match(sent[1].text, /You asked for: \w+day, \w+ \d+, in the afternoon\./);
  assert.match(sent[1].text, /contact you to confirm/, "confirmation never promises a booked time");
  assert.doesNotMatch(sent[1].text, /guarantee|confirmed for/i);
  assert.match(sent[1].text, /Material: X-ray film/, "visitors see the form's own material name");
});

test("a failed confirmation email never fails the lead", { concurrency: false }, async () => {
  let call = 0;
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => {
      call += 1;
      if (call === 2) throw new Error("visitor mailbox rejected");
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ ...validLead, submission_key: "test-confirm-fail" })
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(call, 2);
});

test("Spanish visitors get a Spanish confirmation", { concurrency: false }, async () => {
  const sent = [];
  await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ ...validLead, locale: "es", submission_key: "test-es-confirm", pickup_window: "morning" })
  }));
  assert.match(sent[1].subject, /Recibimos su solicitud/);
  assert.match(sent[1].text, /^Hola Maria:/);
  assert.match(sent[1].text, /Usted pidió: por la mañana\./);
  assert.match(sent[1].text, /Material: Película de rayos X/);
});

test("delivery health check reports configuration without exposing secrets", { concurrency: false }, async () => {
  const on = await withDelivery({ apiKey: "synthetic-test-key" }, () => invoke({ method: "GET", query: { status: "health" }, headers: { accept: "application/json" } }));
  assert.deepEqual(on.payload, { delivery: true, recipients: 1 });
  assert.doesNotMatch(on.body, /synthetic/);
  const off = await withDelivery({ apiKey: undefined }, () => invoke({ method: "GET", query: { status: "health" }, headers: { accept: "text/html" } }));
  assert.deepEqual(off.payload, { delivery: false, recipients: 1 });
});

async function withEnv(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    return await callback();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

test("recipients come from LEAD_TO and LEAD_CC, Dennis is CC'd by default, no address is duplicated", { concurrency: false }, async () => {
  const sent = [];
  await withEnv({ LEAD_TO: "dorothy@example.com", LEAD_CC: undefined, LEAD_FROM: "AG Refining Website <leads@example.com>" }, () => withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ ...validLead, submission_key: "test-route-001", selling_as: "business" })
  })));
  assert.deepEqual(sent[0].to, ["dorothy@example.com"]);
  assert.deepEqual(sent[0].cc, ["dennis@agrefining.com"]);
  assert.equal(sent[0].from, "AG Refining Website <leads@example.com>");
  assert.equal(sent[0].reply_to, "maria@example.com");
  assert.equal(sent[0].subject, "New Seller: Maria Gomez | X-ray film | Business | Houston, TX");
  assert.equal(sent[1].reply_to, "dorothy@example.com", "visitor replies reach the first lead recipient");

  const health = await withEnv({ LEAD_TO: "dorothy@example.com", LEAD_CC: undefined }, () => withDelivery({ apiKey: "k" }, () => invoke({ method: "GET", query: { status: "health" }, headers: { accept: "application/json" } })));
  assert.deepEqual(health.payload, { delivery: true, recipients: 2 });
  assert.doesNotMatch(health.body, /dorothy|dennis/);

  const { leadRecipients } = await import("../api/leads.js");
  await withEnv({ LEAD_TO: "a@example.com, b@example.com", LEAD_CC: "", LEAD_ROUTES: '{"business":["biz@example.com"],"es":["es@example.com"]}' }, async () => {
    assert.deepEqual(leadRecipients({ selling_as: "business" }), { to: ["biz@example.com"], cc: [] });
    assert.deepEqual(leadRecipients({ selling_as: "myself" }), { to: ["a@example.com", "b@example.com"], cc: [] });
    assert.deepEqual(leadRecipients({ locale: "es" }), { to: ["es@example.com"], cc: [] });
  });
  await withEnv({ LEAD_TO: undefined, AG_LEAD_TO_EMAIL: undefined, LEAD_CC: undefined, LEAD_ROUTES: "not json" }, async () => {
    assert.deepEqual(leadRecipients({}), { to: ["dennis@agrefining.com"], cc: [] });
  });
});

test("a phone-only lead is accepted: email, area and notes are optional, and no confirmation is attempted", { concurrency: false }, async () => {
  const sent = [];
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ name: "Ray Long", phone: "713-555-0100", material: "silver_flatware", submission_key: "test-phone-only", locale: "en" })
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(sent.length, 1, "owner email only");
  assert.equal(sent[0].reply_to, undefined);
  assert.match(sent[0].text, /Email: Not provided/);
  assert.match(sent[0].text, /Received: .+ CT/);
});

test("an undelivered lead is written to the server log in full", { concurrency: false }, async () => {
  const logged = [];
  const previous = console.error;
  console.error = (line) => logged.push(String(line));
  try {
    await withDelivery({ apiKey: "synthetic-test-key", fetchImpl: async () => ({ ok: false }) }, () => invoke({
      headers: { accept: "application/json", "content-type": "application/json" },
      body: validLead
    }));
  } finally {
    console.error = previous;
  }
  assert.equal(logged.length, 1);
  assert.match(logged[0], /^LEAD_UNDELIVERED /);
  const record = JSON.parse(logged[0].slice("LEAD_UNDELIVERED ".length));
  assert.equal(record.lead.phone, "281-555-0144");
  assert.equal(record.lead.company_url, undefined);
});
