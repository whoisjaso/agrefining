import {
  REVIEW_FORM_ENUMS,
  escapeHtml,
  normalizeLocale,
  renderReviewForm
} from "../src/review-form.mjs";

const MAX_BODY_BYTES = 32_000;
const DEFAULT_TO_EMAIL = "dennis@agrefining.com";
const DEFAULT_FROM_EMAIL = "AG Refining <website@agrefining.com>";
const PHONE_DISPLAY = "(281) 898-2719";
const PHONE_HREF = "+12818982719";
const MATERIALS = new Set(REVIEW_FORM_ENUMS.materials);
const FREQUENCIES = new Set(REVIEW_FORM_ENUMS.frequencies);
const CONTACT_METHODS = new Set(REVIEW_FORM_ENUMS.contactMethods);

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
    deliverySetup: "Online delivery is being set up. Call AG Refining or email these details instead.",
    deliveryFailure: "The request could not be delivered. Call AG Refining or email these details instead.",
    deliveryHeading: "Keep your request moving.",
    emailDetails: "Email these details",
    call: `Call ${PHONE_DISPLAY}`,
    returnToForm: "Return to the pickup form",
    successHeading: "Your request was received.",
    successMessage: "AG Refining will review the details and follow up using your preferred contact method.",
    receiptLabel: "Request receipt",
    oversized: "The request is too large. Please call AG Refining.",
    malformed: "The request could not be read. Please review the form.",
    method: "Use the pickup request form.",
    requestHeading: "Use the pickup request form.",
    skip: "Skip to content",
    siteLabel: "AG Refining",
    emailSubject: "AG Refining pickup request",
    notProvided: "Not provided"
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
    deliverySetup: "El envío en línea se está configurando. Llame a AG Refining o envíe estos datos por correo.",
    deliveryFailure: "No se pudo entregar la solicitud. Llame a AG Refining o envíe estos datos por correo.",
    deliveryHeading: "Mantenga su solicitud en marcha.",
    emailDetails: "Enviar estos datos por correo",
    call: `Llame al ${PHONE_DISPLAY}`,
    returnToForm: "Volver al formulario de recogida",
    successHeading: "Recibimos su solicitud.",
    successMessage: "AG Refining revisará los datos y se comunicará por el medio de contacto que prefirió.",
    receiptLabel: "Comprobante de solicitud",
    oversized: "La solicitud es demasiado grande. Llame a AG Refining.",
    malformed: "No se pudo leer la solicitud. Revise el formulario.",
    method: "Use el formulario de solicitud de recogida.",
    requestHeading: "Use el formulario de solicitud de recogida.",
    skip: "Saltar al contenido",
    siteLabel: "AG Refining",
    emailSubject: "Solicitud de recogida de AG Refining",
    notProvided: "No indicado"
  }
};

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) fields.email = copy.email;
  if (payload.phone.replace(/\D/g, "").length < 7) fields.phone = copy.phone;
  if (!MATERIALS.has(payload.material)) fields.material = copy.material;
  if (payload.location.length < 2) fields.location = copy.location;
  if (payload.details.length < 20) fields.details = copy.details;
  return fields;
}

function label(value) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function emailContent(payload) {
  const rows = [
    ["Name", payload.name],
    ["Business", payload.business || "Not provided"],
    ["Phone", payload.phone],
    ["Email", payload.email],
    ["Request", label(payload.intent)],
    ["Material", label(payload.material)],
    ["Amount", payload.quantity || "Not provided"],
    ["Pickup location", payload.location],
    ["Frequency", label(payload.frequency)],
    ["Preferred contact", label(payload.preferred_contact)],
    ["Details", payload.details]
  ];
  const attribution = Object.entries(payload.attribution);
  const plainRows = rows.map(([name, value]) => `${name}: ${value}`).join("\n");
  const plainAttribution = attribution.length
    ? `\n\nWebsite attribution:\n${attribution.map(([name, value]) => `${name}: ${value}`).join("\n")}`
    : "";
  const htmlRows = rows.map(([name, value]) => `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top">${escapeHtml(name)}</th><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("");
  const htmlAttribution = attribution.length
    ? `<h2 style="font-size:16px;margin:28px 0 8px">Website attribution</h2><table>${attribution.map(([name, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(name)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`).join("")}</table>`
    : "";

  return {
    text: `New AG Refining pickup request\n\n${plainRows}${plainAttribution}`,
    html: `<div style="font-family:Arial,sans-serif;color:#14232c;line-height:1.5"><h1 style="color:#061724">New pickup request</h1><table>${htmlRows}</table>${htmlAttribution}</div>`
  };
}

async function sendResend(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { configured: false };

  const content = emailContent(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.submission_key
    },
    body: JSON.stringify({
      from: process.env.AG_LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL],
      reply_to: payload.email,
      subject: `Pickup request: ${label(payload.material)} from ${payload.name}`,
      text: content.text,
      html: content.html
    })
  });

  if (!response.ok) throw new Error("Lead email delivery failed");
  return { configured: true };
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
    <link rel="stylesheet" href="/style.css?v=20260803-silver-atelier">
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

function actionLinks(locale, { includeEmail = "" } = {}) {
  const copy = RESPONSE_COPY[locale];
  const emailAction = includeEmail
    ? `<a class="button button-secondary" href="${escapeHtml(includeEmail)}">${copy.emailDetails}</a>`
    : "";
  return `<div class="lead-result-actions"><a class="button button-primary" href="tel:${PHONE_HREF}">${copy.call}</a>${emailAction}<a class="text-link" href="${formPath(locale)}">${copy.returnToForm}</a></div>`;
}

function fallbackMailto(payload, recipient) {
  const copy = RESPONSE_COPY[payload.locale];
  const labels = payload.locale === "es"
    ? ["Nombre", "Empresa", "Teléfono", "Correo electrónico", "Material", "Cantidad", "Ubicación", "Frecuencia", "Detalles"]
    : ["Name", "Business", "Phone", "Email", "Material", "Amount", "Location", "Frequency", "Details"];
  const values = [
    payload.name,
    payload.business || copy.notProvided,
    payload.phone,
    payload.email,
    payload.material,
    payload.quantity || copy.notProvided,
    payload.location,
    payload.frequency,
    payload.details
  ];
  const body = labels.map((name, index) => `${name}: ${values[index]}`).join("\n");
  return `mailto:${recipient}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(body)}`;
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
    phone: text(body.phone, 80),
    email: text(body.email, 254).toLowerCase(),
    intent: ["pickup", "quote"].includes(text(body.intent, 20)) ? text(body.intent, 20) : "pickup",
    material: text(body.material, 60),
    quantity: text(body.quantity, 120),
    location: text(body.location, 180),
    frequency: FREQUENCIES.has(frequency) ? frequency : "unknown",
    preferred_contact: CONTACT_METHODS.has(preferredContact) ? preferredContact : "phone",
    details: text(body.details, 4000),
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

  try {
    const delivery = await sendResend(payload);
    if (!delivery.configured) {
      if (format === "json") {
        return res.status(503).json({
          message: copy.deliverySetup,
          fallback_email: process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL
        });
      }
      const mailto = fallbackMailto(payload, process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL);
      return sendHtml(res, 503, renderLeadPage({
        locale,
        state: "delivery-failure",
        heading: copy.deliveryHeading,
        message: copy.deliverySetup,
        content: actionLinks(locale, { includeEmail: mailto })
      }));
    }
    return receiptResponse(res, format, locale);
  } catch {
    if (format === "json") {
      return res.status(502).json({
        message: copy.deliveryFailure,
        fallback_email: process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL
      });
    }
    const mailto = fallbackMailto(payload, process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL);
    return sendHtml(res, 502, renderLeadPage({
      locale,
      state: "delivery-failure",
      heading: copy.deliveryHeading,
      message: copy.deliveryFailure,
      content: actionLinks(locale, { includeEmail: mailto })
    }));
  }
}
