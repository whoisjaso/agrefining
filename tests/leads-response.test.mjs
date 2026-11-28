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
  assert.match(receipt.body, /request (?:was )?received/i);
  assert.match(receipt.body, /href="\/sell"/);
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
  assert.match(invalid.body, /href="\/vender"/);
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
  assert.match(unavailable.body, /href="\/vender"/);
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
  assert.match(browserGet.body, /href="\/vender"/);

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
  assert.match(oversizedHtml.body, /href="\/sell"/);

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
  assert.match(malformedHtml.body, /href="\/sell"/);

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
  assert.match(sent[0].text, /Preferred pickup: \w+day, \w+ \d+, in the afternoon/);
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
  assert.deepEqual(on.payload, { delivery: true });
  assert.doesNotMatch(on.body, /synthetic/);
  const off = await withDelivery({ apiKey: undefined }, () => invoke({ method: "GET", query: { status: "health" }, headers: { accept: "text/html" } }));
  assert.deepEqual(off.payload, { delivery: false });
});

test("AG_LEAD_BCC_EMAIL copies the owner lead email only", { concurrency: false }, async () => {
  const calls = [];
  const previous = process.env.AG_LEAD_BCC_EMAIL;
  process.env.AG_LEAD_BCC_EMAIL = "team@example.com, not-an-email";
  try {
    await withDelivery({
      apiKey: "synthetic-test-key",
      fetchImpl: async (...args) => {
        calls.push(args);
        return { ok: true };
      }
    }, () => invoke({
      headers: { accept: "text/html", "content-type": "application/x-www-form-urlencoded" },
      body: encoded(validLead)
    }));
  } finally {
    if (previous === undefined) delete process.env.AG_LEAD_BCC_EMAIL;
    else process.env.AG_LEAD_BCC_EMAIL = previous;
  }
  const [ownerEmail, confirmation] = calls.map(([, init]) => JSON.parse(init.body));
  assert.deepEqual(ownerEmail.bcc, ["team@example.com"]);
  assert.equal(confirmation.bcc, undefined);
});

test("the short form delivers with only a name, phone and material", { concurrency: false }, async () => {
  const sent = [];
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      return { ok: true };
    }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ ...validLead, submission_key: "test-short-form-001", email: "", location: "", details: "", business: "", quantity: "" })
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(sent.length, 1, "the owner gets the lead; no courtesy email goes out without an address");
  assert.equal("reply_to" in sent[0], false, "no reply-to header when the visitor gave no email");
  assert.match(sent[0].text, /Email: Not provided/);
  assert.match(sent[0].text, /Note: Not provided/);
  assert.match(sent[0].html, /href="tel:/, "the owner email keeps its one-tap call button");
});

test("an unfinished lead sends one Partial email and never a courtesy email", { concurrency: false }, async () => {
  const sent = [];
  const keys = [];
  const deliver = (body) => withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body));
      keys.push(init.headers["Idempotency-Key"]);
      return { ok: true };
    }
  }, () => invoke({ headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify(body) }));

  const base = { locale: "en", first_name: "Maria", last_name: "Lopez", phone: "281 555 0144", submission_key: "session-abc", form_started: Date.now() - 5000 };
  const partial = await deliver({ ...base, lead_status: "partial", lead_step: "material" });
  assert.equal(partial.statusCode, 200);
  assert.equal(sent.length, 1);
  assert.equal(keys[0], "session-abc-partial", "one person is one lead: the session id dedupes the notice");
  assert.equal(sent[0].subject, "Partial lead: Maria Lopez, 281 555 0144");
  assert.match(sent[0].text, /Status: Partial: still filling in the form/);
  assert.match(sent[0].text, /Stopped at: What they are bringing/);
  assert.match(sent[0].html, /href="tel:2815550144"/);

  const progress = await deliver({ ...base, lead_status: "progress", lead_step: "quantity", material: "silver_coins" });
  assert.equal(progress.statusCode, 200);
  assert.equal(sent.length, 1, "progress updates are logged, not emailed");

  const left = await deliver({ ...base, lead_status: "left", lead_step: "location", material: "silver_coins", quantity: "A few pieces" });
  assert.equal(left.statusCode, 200);
  assert.equal(sent.length, 2);
  assert.equal(keys[1], "session-abc-left");
  assert.equal(sent[1].subject, "Partial lead update: Maria Lopez, 281 555 0144");
  assert.match(sent[1].text, /Bringing: Silver Coins/);
  assert.match(sent[1].text, /Amount: A few pieces/);

  const complete = await deliver({ ...base, material: "silver_coins", quantity: "A few pieces", location: "Bring it to the shop" });
  assert.equal(complete.statusCode, 200);
  assert.equal(sent.length, 3, "the finished lead sends the normal owner email");
  assert.equal(keys[2], "session-abc");
  assert.match(sent[2].subject, /^Pickup request: Silver Coins from Maria Lopez$/);
  assert.match(sent[2].text, /Status: Complete/);
  assert.match(sent[2].text, /How they want to sell: Bring it to the shop/);
});

test("an unfinished lead without a usable phone is refused and sends nothing", { concurrency: false }, async () => {
  const sent = [];
  const response = await withDelivery({
    apiKey: "synthetic-test-key",
    fetchImpl: async (_url, init) => { sent.push(JSON.parse(init.body)); return { ok: true }; }
  }, () => invoke({
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ locale: "en", first_name: "Maria", phone: "12", lead_status: "partial", submission_key: "session-bad", form_started: Date.now() - 5000 })
  }));
  assert.equal(response.statusCode, 422);
  assert.equal(sent.length, 0);
});
