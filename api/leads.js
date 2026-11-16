import {
  REVIEW_FORM_ENUMS,
  escapeHtml,
  materialLabel,
  normalizeLocale,
  renderReviewForm
} from "../src/review-form.mjs";

const MAX_BODY_BYTES = 32_000;
const DEFAULT_TO_EMAIL = "dennis@agrefining.com";
const DEFAULT_FROM_EMAIL = "AG Refining Website <leads@agrefining.com>";
const PHONE_DISPLAY = "(281) 898-2719";
const PHONE_HREF = "+12818982719";
const MATERIALS = new Set(REVIEW_FORM_ENUMS.materials);
const FREQUENCIES = new Set(REVIEW_FORM_ENUMS.frequencies);
const CONTACT_METHODS = new Set(REVIEW_FORM_ENUMS.contactMethods);
const PICKUP_WINDOWS = new Set(REVIEW_FORM_ENUMS.pickupWindows);

const RESPONSE_COPY = {
  en: {
    validationMessage: "Please review the highlighted fields.",
    validationHeading: "Please review the highlighted fields.",
    validationIntro: "Correct the fields below, then send the request again.",
    fields: {
      name: "Enter your name.",
      email: "Enter a valid email.",
      phone: "Enter a valid phone number.",
      material: "Choose the closest material type.",
      location: "Enter the pickup city or address.",
      details: "Add a little more detail about the material."
    },
    deliverySetup: `Something went wrong on our end. Please call ${PHONE_DISPLAY} and we'll take care of you.`,
    deliveryFailure: `Something went wrong on our end. Please call ${PHONE_DISPLAY} and we'll take care of you.`,
    deliveryHeading: "Please Give Us A Call",
    call: `Call ${PHONE_DISPLAY}`,
    returnToForm: "Return to the pickup form",
    successHeading: "Got It. We'll Call You Soon",
    successMessage: `Want to talk now? Call ${PHONE_DISPLAY}.`,
    receiptLabel: "Request receipt",
    oversized: "The request is too large. Please call AG Refining.",
    malformed: "The request could not be read. Please review the form.",
    method: "Use the pickup request form.",
    requestHeading: "Use the pickup request form.",
    skip: "Skip to content",
    siteLabel: "AG Refining"
  },
  es: {
    validationMessage: "Revise los campos indicados.",
    validationHeading: "Revise los campos indicados.",
    validationIntro: "Corrija los campos siguientes y vuelva a enviar la solicitud.",
    fields: {
      name: "Escriba su nombre.",
      email: "Escriba un correo electrónico válido.",
      phone: "Escriba un número de teléfono válido.",
      material: "Seleccione el tipo de material más cercano.",
      location: "Escriba la ciudad o dirección de recogida.",
      details: "Añada un poco más de información sobre el material."
    },
    deliverySetup: `Algo falló de nuestro lado. Llame al ${PHONE_DISPLAY} y le atendemos.`,
    deliveryFailure: `Algo falló de nuestro lado. Llame al ${PHONE_DISPLAY} y le atendemos.`,
    deliveryHeading: "Por Favor Llámenos",
    call: `Llame al ${PHONE_DISPLAY}`,
    returnToForm: "Volver al formulario de recogida",
    successHeading: "Listo. Le Llamaremos Pronto",
    successMessage: `¿Prefiere hablar ahora? Llame al ${PHONE_DISPLAY}.`,
    receiptLabel: "Comprobante de solicitud",
    oversized: "La solicitud es demasiado grande. Llame a AG Refining.",
    malformed: "No se pudo leer la solicitud. Revise el formulario.",
    method: "Use el formulario de solicitud de recogida.",
    requestHeading: "Use el formulario de solicitud de recogida.",
    skip: "Saltar al contenido",
    siteLabel: "AG Refining"
  }
};

// Recipients live in Vercel env vars only (never in the repo):
//   LEAD_TO   comma-separated primary recipients (falls back to AG_LEAD_TO_EMAIL, then dennis@agrefining.com)
//   LEAD_CC   comma-separated CC list (default dennis@agrefining.com; never duplicates a LEAD_TO address)
//   LEAD_FROM verified sender (falls back to AG_LEAD_FROM_EMAIL)
//   LEAD_REPLY_TO_SUBMITTER  "false" turns off Reply-To = the visitor's email (default on)
//   LEAD_ROUTES optional JSON {"business": [...], "individual": [...], "es": [...]}; every route defaults to LEAD_TO
function emailList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

function leadRoutes() {
  try {
    const routes = JSON.parse(process.env.LEAD_ROUTES || "{}");
    return routes && typeof routes === "object" && !Array.isArray(routes) ? routes : {};
  } catch {
    return {};
  }
}

export function leadRecipients(payload = {}) {
  const base = emailList(process.env.LEAD_TO || process.env.AG_LEAD_TO_EMAIL);
  const primary = base.length ? base : [DEFAULT_TO_EMAIL];
  const routes = leadRoutes();
  const routeKey = payload.locale === "es" && routes.es ? "es" : payload.selling_as === "business" ? "business" : payload.selling_as === "myself" ? "individual" : "";
  const routed = routeKey ? emailList([].concat(routes[routeKey] || []).join(",")) : [];
  const to = routed.length ? routed : primary;
  const ccSource = process.env.LEAD_CC === undefined ? DEFAULT_TO_EMAIL : process.env.LEAD_CC;
  const cc = emailList(ccSource).filter((address) => !to.some((item) => item.toLowerCase() === address.toLowerCase()));
  return { to, cc };
}

function senderAddress() {
  return process.env.LEAD_FROM || process.env.AG_LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}

function text(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function cleanAttribution(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => /^[a-z_]+$/i.test(key))
      .slice(0, 12)
      .map(([key, item]) => [key, text(item, 1000)])
  );
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  if (typeof raw !== "string") return {};
  const contentType = String(req.headers?.["content-type"] || "").split(";", 1)[0].trim().toLowerCase();
  if (contentType === "application/x-www-form-urlencoded") {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  if (contentType === "application/json") return JSON.parse(raw);
  throw new SyntaxError("Unsupported request body");
}

function responseFormat(req) {
  const accept = String(req.headers?.accept || "").toLowerCase();
  const contentType = String(req.headers?.["content-type"] || "").toLowerCase();
  if (accept.includes("application/json") || contentType.includes("application/json")) return "json";
  return "html";
}

function queryValue(req, name) {
  const direct = req.query?.[name];
  if (Array.isArray(direct)) return direct[0] || "";
  if (direct !== undefined && direct !== null) return String(direct);
  try {
    return new URL(req.url || "/api/leads", "https://agrefining.invalid").searchParams.get(name) || "";
  } catch {
    return "";
  }
}

function formPath(locale) {
  return locale === "es" ? "/espanol#solicitud" : "/contact";
}

function validate(payload) {
  const fields = {};
  const copy = RESPONSE_COPY[payload.locale].fields;
  if (payload.name.length < 2) fields.name = copy.name;
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) fields.email = copy.email;
  if (payload.phone.replace(/\D/g, "").length < 7) fields.phone = copy.phone;
  if (!MATERIALS.has(payload.material)) fields.material = copy.material;
  return fields;
}

// Accept only a real calendar date (YYYY-MM-DD) from today up to a year out.
export function cleanPickupDate(value, now = new Date()) {
  const raw = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const date = new Date(`${raw}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) return "";
  const today = new Date(now.getTime() - 36 * 3600 * 1000).toISOString().slice(0, 10);
  const limit = new Date(now.getTime() + 366 * 86400 * 1000).toISOString().slice(0, 10);
  return raw >= today && raw <= limit ? raw : "";
}

export function pickupSummary(payload, locale = "en") {
  if (!payload.pickup_date && payload.pickup_window === "any") return "";
  const date = payload.pickup_date
    ? new Date(`${payload.pickup_date}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
    : "";
  const phrases = locale === "es"
    ? { morning: "por la mañana", midday: "al mediodía", afternoon: "por la tarde" }
    : { morning: "in the morning", midday: "around midday", afternoon: "in the afternoon" };
  const window = phrases[payload.pickup_window] || "";
  return [date, window].filter(Boolean).join(", ");
}

function label(value) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function centralTime(date = new Date()) {
  return date.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " CT";
}

function sellingAsLabel(value) {
  return value === "business" ? "Business" : value === "myself" ? "Myself" : "Not said";
}

export function leadSubject(payload) {
  return ["New Seller: " + payload.name, materialLabel(payload.material), sellingAsLabel(payload.selling_as), payload.location || "No area given"].join(" | ");
}

export function emailContent(payload, now = new Date()) {
  const phoneHref = payload.phone.replace(/[^\d+]/g, "");
  const rows = [
    ["Name", payload.name],
    ["Phone", payload.phone],
    ["Email", payload.email || "Not provided"],
    ["Material", materialLabel(payload.material)],
    ["Selling as", sellingAsLabel(payload.selling_as)],
    ["Business", payload.business || "Not provided"],
    ["Zip or area", payload.location || "Not provided"],
    ["Amount", payload.quantity || "Not provided"],
    ["One-time or repeat", label(payload.frequency)],
    ["Preferred time", pickupSummary(payload) || "Flexible"],
    ["Extra details", payload.details || "None"],
    ["Page", payload.attribution.submission_page || payload.attribution.landing_page || "Not recorded"],
    ["Language", payload.locale === "es" ? "Spanish" : "English"],
    ["Received", centralTime(now)]
  ];
  const attribution = Object.entries(payload.attribution);
  const plainRows = rows.map(([name, value]) => `${name}: ${value}`).join("\n");
  const plainAttribution = attribution.length
    ? `\n\nWebsite attribution:\n${attribution.map(([name, value]) => `${name}: ${value}`).join("\n")}`
    : "";
  const htmlRows = rows.map(([name, value]) => {
    const cell = name === "Phone" ? `<a href="tel:${escapeHtml(phoneHref)}" style="color:#102a43;font-weight:bold">${escapeHtml(value)}</a>` : escapeHtml(value);
    return `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top">${escapeHtml(name)}</th><td style="padding:8px 0;white-space:pre-wrap">${cell}</td></tr>`;
  }).join("");
  const htmlAttribution = attribution.length
    ? `<h2 style="font-size:16px;margin:28px 0 8px">Website attribution</h2><table>${attribution.map(([name, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(name)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`).join("")}</table>`
    : "";
  const replyLink = payload.email ? ` &nbsp; <a href="mailto:${escapeHtml(payload.email)}" style="color:#1d5e96">Reply by email</a>` : "";

  return {
    text: `New seller from the AG Refining website\n\n${plainRows}${plainAttribution}`,
    html: `<div style="font-family:Arial,sans-serif;color:#14232c;line-height:1.5;font-size:16px"><h1 style="color:#061724;font-size:22px">New seller</h1><p style="margin:0 0 18px"><a href="tel:${escapeHtml(phoneHref)}" style="display:inline-block;background:#102a43;color:#faf8f2;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Call ${escapeHtml(payload.name)}</a>${replyLink}</p><table>${htmlRows}</table>${htmlAttribution}</div>`
  };
}

const CONFIRMATION_COPY = {
  en: {
    subject: "We received your AG Refining pickup request",
    hello: (name) => `Hello ${name},`,
    body: "Thank you for reaching out to AG Refining. We received your pickup request and will contact you to confirm the details and a time.",
    requested: "You asked for",
    summary: "Your request",
    material: "Material",
    location: "Pickup location",
    next: "If anything changes, simply reply to this email or call us.",
    sign: "Dennis Stevens, AG Refining"
  },
  es: {
    subject: "Recibimos su solicitud de recogida de AG Refining",
    hello: (name) => `Hola ${name}:`,
    body: "Gracias por comunicarse con AG Refining. Recibimos su solicitud de recogida y nos comunicaremos con usted para confirmar los detalles y la hora.",
    requested: "Usted pidió",
    summary: "Su solicitud",
    material: "Material",
    location: "Lugar de recogida",
    next: "Si algo cambia, responda a este correo o llámenos.",
    sign: "Dennis Stevens, AG Refining"
  }
};

export function confirmationContent(payload) {
  const copy = CONFIRMATION_COPY[payload.locale];
  const first = payload.name.split(/\s+/)[0] || payload.name;
  const schedule = pickupSummary(payload, payload.locale);
  const material = materialLabel(payload.material, payload.locale);
  const lines = [
    copy.hello(first),
    "",
    copy.body,
    schedule ? `${copy.requested}: ${schedule}.` : "",
    "",
    `${copy.material}: ${material}`,
    `${copy.location}: ${payload.location}`,
    "",
    copy.next,
    "",
    copy.sign,
    `${PHONE_DISPLAY} · ${DEFAULT_TO_EMAIL}`
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "");
  return {
    subject: copy.subject,
    text: lines.join("\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#20354c;line-height:1.6;max-width:560px">
  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#416b94;margin:0 0 18px">AG Refining · Houston</p>
  <p>${escapeHtml(copy.hello(first))}</p>
  <p>${escapeHtml(copy.body)}</p>
  ${schedule ? `<p><strong>${escapeHtml(copy.requested)}:</strong> ${escapeHtml(schedule)}</p>` : ""}
  <table style="border-collapse:collapse;margin:18px 0"><tr><th align="left" style="padding:4px 14px 4px 0;color:#586b7e;font-weight:normal">${escapeHtml(copy.material)}</th><td>${escapeHtml(material)}</td></tr><tr><th align="left" style="padding:4px 14px 4px 0;color:#586b7e;font-weight:normal">${escapeHtml(copy.location)}</th><td>${escapeHtml(payload.location)}</td></tr></table>
  <p>${escapeHtml(copy.next)}</p>
  <p style="margin-top:26px">${escapeHtml(copy.sign)}<br><a href="tel:${PHONE_HREF}" style="color:#1d5e96">${PHONE_DISPLAY}</a> · <a href="mailto:${DEFAULT_TO_EMAIL}" style="color:#1d5e96">${DEFAULT_TO_EMAIL}</a></p>
</div>`
  };
}

// Courtesy confirmation to the visitor. Never blocks or fails the lead itself.
async function sendConfirmation(payload) {
  if (!payload.email) return;
  try {
    const content = confirmationContent(payload);
    const owner = leadRecipients(payload).to[0];
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${payload.submission_key}-confirmation`
      },
      body: JSON.stringify({
        from: senderAddress(),
        to: [payload.email],
        reply_to: owner,
        subject: content.subject,
        text: content.text,
        html: content.html
      })
    });
  } catch {
    // The owner already has the lead; a missed courtesy email is not a failed request.
  }
}

async function sendResend(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { configured: false };

  const content = emailContent(payload);
  const { to, cc } = leadRecipients(payload);
  const replyToSubmitter = process.env.LEAD_REPLY_TO_SUBMITTER !== "false" && payload.email;
  const message = {
    from: senderAddress(),
    to,
    subject: leadSubject(payload),
    text: content.text,
    html: content.html
  };
  if (cc.length) message.cc = cc;
  if (replyToSubmitter) message.reply_to = payload.email;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.submission_key
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) throw new Error("Lead email delivery failed");
  await sendConfirmation(payload);
  return { configured: true };
}

// Durable record when the email cannot go out: Vercel keeps function logs (search "LEAD_UNDELIVERED").
// A KV/Blob store is the next step, pending Jason's approval.
function logUndelivered(payload, reason) {
  const { company_url, form_started, ...lead } = payload;
  console.error(`LEAD_UNDELIVERED ${JSON.stringify({ reason, received: centralTime(), lead })}`);
}

function renderLeadPage({ locale, state, heading, message, content = "" }) {
  const language = normalizeLocale(locale);
  const copy = RESPONSE_COPY[language];
  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="theme-color" content="#f1ede4">
    <meta name="robots" content="noindex,nofollow">
    <title>${escapeHtml(heading)} | AG Refining</title>
    <link rel="icon" href="/assets/ag-mark-path.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/style.css?v=20261115-phase1">
  </head>
  <body data-design="silver-atelier" class="lead-result-page">
    <a class="skip" href="#main">${copy.skip}</a>
    <main id="main" class="lead-result" data-lead-result="${escapeHtml(state)}">
      <div class="shell lead-result-shell">
        <a class="brand" href="${formPath(language)}" aria-label="${copy.siteLabel}"><img src="/assets/ag-mark-path.svg" alt="" width="48" height="48"><span class="brand-word"><strong>AG</strong> Refining</span></a>
        <p class="eyebrow">${copy.receiptLabel}</p>
        <h1>${escapeHtml(heading)}</h1>
        <p class="lead-result-message">${escapeHtml(message)}</p>
        ${content}
      </div>
    </main>
  </body>
</html>`;
}

function sendHtml(res, status, html) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(status).send(html);
}

function actionLinks(locale) {
  const copy = RESPONSE_COPY[locale];
  return `<div class="lead-result-actions"><a class="button button-primary" href="tel:${PHONE_HREF}">${copy.call}</a><a class="text-link" href="${formPath(locale)}">${copy.returnToForm}</a></div>`;
}

function requestErrorResponse(res, format, locale, status, message) {
  if (format === "json") return res.status(status).json({ message });
  const copy = RESPONSE_COPY[locale];
  return sendHtml(res, status, renderLeadPage({
    locale,
    state: "request-error",
    heading: copy.requestHeading,
    message,
    content: actionLinks(locale)
  }));
}

function receiptResponse(res, format, locale) {
  if (format === "json") return res.status(200).json({ ok: true });
  res.setHeader("Location", `/api/leads?status=received&lang=${locale}`);
  return res.status(303).end();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const format = responseFormat(req);
  const queryLocale = normalizeLocale(queryValue(req, "lang"));

  if (req.method === "GET" && queryValue(req, "status") === "health") {
    const { to, cc } = leadRecipients();
    return res.status(200).json({ delivery: Boolean(process.env.RESEND_API_KEY), recipients: to.length + cc.length });
  }

  if (req.method === "GET" && format === "html" && queryValue(req, "status") === "received") {
    const copy = RESPONSE_COPY[queryLocale];
    return sendHtml(res, 200, renderLeadPage({
      locale: queryLocale,
      state: "success",
      heading: copy.successHeading,
      message: copy.successMessage,
      content: actionLinks(queryLocale)
    }));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return requestErrorResponse(res, format, queryLocale, 405, RESPONSE_COPY[queryLocale].method);
  }

  const contentLength = Number(req.headers?.["content-length"] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return requestErrorResponse(res, format, queryLocale, 413, RESPONSE_COPY[queryLocale].oversized);
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return requestErrorResponse(res, format, queryLocale, 400, RESPONSE_COPY[queryLocale].malformed);
  }

  const locale = normalizeLocale(text(body.locale, 2));
  const copy = RESPONSE_COPY[locale];
  const frequency = text(body.frequency, 30);
  const preferredContact = text(body.preferred_contact, 20);
  const formStarted = Number(body.form_started || 0);
  const payload = {
    name: text(body.name, 120),
    business: text(body.business, 180),
    selling_as: ["myself", "business"].includes(text(body.selling_as, 20)) ? text(body.selling_as, 20) : "",
    phone: text(body.phone, 80),
    email: text(body.email, 254).toLowerCase(),
    intent: ["pickup", "quote"].includes(text(body.intent, 20)) ? text(body.intent, 20) : "pickup",
    material: text(body.material, 60),
    quantity: text(body.quantity, 120),
    location: text(body.location, 180),
    frequency: FREQUENCIES.has(frequency) ? frequency : "unknown",
    preferred_contact: CONTACT_METHODS.has(preferredContact) ? preferredContact : "phone",
    details: text(body.details, 4000),
    pickup_date: cleanPickupDate(body.pickup_date),
    pickup_window: PICKUP_WINDOWS.has(text(body.pickup_window, 20)) ? text(body.pickup_window, 20) : "any",
    company_url: text(body.company_url, 300),
    form_started: formStarted,
    submission_key: text(body.submission_key, 100) || `lead-${Date.now()}`,
    locale,
    attribution: cleanAttribution(body.attribution)
  };

  const hasTimingSignal = Number.isFinite(formStarted) && formStarted > 0;
  const tooFast = hasTimingSignal && Date.now() - formStarted < 700;
  if (payload.company_url || tooFast) return receiptResponse(res, format, locale);

  const fields = validate(payload);
  if (Object.keys(fields).length) {
    if (format === "json") return res.status(422).json({ message: copy.validationMessage, fields });
    const retryValues = { ...payload, attribution: undefined, company_url: undefined };
    const content = `<p><a class="text-link" href="${formPath(locale)}">${copy.returnToForm}</a></p>${renderReviewForm({
      locale,
      values: retryValues,
      fieldErrors: fields
    })}`;
    return sendHtml(res, 422, renderLeadPage({
      locale,
      state: "validation",
      heading: copy.validationHeading,
      message: copy.validationIntro,
      content
    }));
  }

  const failure = (status, message) => {
    if (format === "json") return res.status(status).json({ message, call: PHONE_DISPLAY, call_href: `tel:${PHONE_HREF}` });
    return sendHtml(res, status, renderLeadPage({
      locale,
      state: "delivery-failure",
      heading: copy.deliveryHeading,
      message,
      content: actionLinks(locale)
    }));
  };
  try {
    const delivery = await sendResend(payload);
    if (!delivery.configured) {
      logUndelivered(payload, "RESEND_API_KEY not set");
      return failure(503, copy.deliverySetup);
    }
    return receiptResponse(res, format, locale);
  } catch (error) {
    logUndelivered(payload, error?.message || "send failed");
    return failure(502, copy.deliveryFailure);
  }
}
