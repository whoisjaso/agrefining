import {
  REVIEW_FORM_ENUMS,
  escapeHtml,
  materialLabel,
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
  return locale === "es" ? "/vender" : "/sell";
}

function validate(payload) {
  const fields = {};
  const copy = RESPONSE_COPY[payload.locale].fields;
  if (payload.name.length < 2) fields.name = copy.name;
  // Email is optional on the short form; when given it must be valid.
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

const ADDRESS_LINE = "9125 Airport Blvd., Suite B-1, Houston, TX 77061";

// One quiet layout for every email the site sends: the wordmark, one Title Case heading, a short
// summary, one button, a few labeled details, and a footer with the address and phone. Tables and
// inline styles only, so it holds up in Gmail and Apple Mail on a phone.
function emailShell({ lang = "en", preheader = "", heading, summary, rows = [], button, secondary = [], secondaryTitle = "", note = "" }) {
  const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const detail = ([name, value]) => `
              <tr>
                <td style="padding:14px 12px 14px 0;border-top:1px solid #e3ddd0;font-family:${font};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#6b7c8d;width:40%;vertical-align:top">${escapeHtml(name)}</td>
                <td style="padding:14px 0;border-top:1px solid #e3ddd0;font-family:${font};font-size:16px;line-height:1.45;color:#102a43;vertical-align:top">${escapeHtml(value)}</td>
              </tr>`;
  const quiet = ([name, value]) => `
              <tr>
                <td style="padding:4px 12px 4px 0;font-family:${font};font-size:12px;color:#6b7c8d;vertical-align:top">${escapeHtml(name)}</td>
                <td style="padding:4px 0;font-family:${font};font-size:12px;line-height:1.5;color:#40566d;vertical-align:top;word-break:break-word">${escapeHtml(value)}</td>
              </tr>`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f1ede4">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1ede4">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#faf8f2;border:1px solid #e3ddd0">
        <tr>
          <td style="padding:36px 32px 0;font-family:${font};font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:#102a43"><strong>AG</strong> Refining</td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;font-family:${font};font-size:28px;line-height:1.2;font-weight:400;letter-spacing:-0.4px;color:#102a43">${escapeHtml(heading)}</td>
        </tr>
        <tr>
          <td style="padding:14px 32px 0;font-family:${font};font-size:16px;line-height:1.6;color:#40566d">${escapeHtml(summary)}</td>
        </tr>${button ? `
        <tr>
          <td style="padding:28px 32px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#102a43" style="background:#102a43"><a href="${escapeHtml(button.href)}" style="display:block;padding:18px 20px;font-family:${font};font-size:16px;font-weight:600;letter-spacing:0.3px;color:#faf8f2;text-decoration:none">${escapeHtml(button.label)}</a></td>
              </tr>
            </table>
          </td>
        </tr>` : ""}${rows.length ? `
        <tr>
          <td style="padding:28px 32px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #e3ddd0">${rows.map(detail).join("")}
            </table>
          </td>
        </tr>` : ""}${note ? `
        <tr>
          <td style="padding:22px 32px 0;font-family:${font};font-size:14px;line-height:1.6;color:#40566d">${escapeHtml(note)}</td>
        </tr>` : ""}${secondary.length ? `
        <tr>
          <td style="padding:26px 32px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr><td colspan="2" style="padding:0 0 6px;font-family:${font};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#6b7c8d">${escapeHtml(secondaryTitle)}</td></tr>${secondary.map(quiet).join("")}
            </table>
          </td>
        </tr>` : ""}
        <tr>
          <td style="padding:36px 32px 32px;font-family:${font};font-size:12px;line-height:1.7;color:#6b7c8d">AG Refining<br>${ADDRESS_LINE}<br><a href="tel:${PHONE_HREF}" style="color:#6b7c8d;text-decoration:none">${PHONE_DISPLAY}</a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// The same content as plain text, for mail clients that do not show HTML.
function emailPlain({ heading, summary, rows = [], button, secondary = [], secondaryTitle = "", note = "" }) {
  const action = button ? (button.label.includes(button.plain) ? button.label : `${button.label}: ${button.plain || button.href}`) : "";
  return [
    `${heading}\n`,
    summary,
    action ? `\n${action}` : "",
    rows.length ? `\n${rows.map(([name, value]) => `${name}: ${value}`).join("\n")}` : "",
    note ? `\n${note}` : "",
    secondary.length ? `\n${secondaryTitle}\n${secondary.map(([name, value]) => `${name}: ${value}`).join("\n")}` : "",
    `\nAG Refining\n${ADDRESS_LINE}\n${PHONE_DISPLAY}`
  ].filter(Boolean).join("\n");
}

// Answers arrive as plain phrases ("A box or bag"); in an email every value reads as Title Case.
const titled = (value) => String(value || "").replace(/(^|[\s/(-])([a-záéíóúñ])/g, (_, lead, letter) => `${lead}${letter.toUpperCase()}`);
const telHref = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;
const firstNameOf = (name) => String(name || "").trim().split(/\s+/)[0] || "Them";
// Only the rows the visitor actually answered. Empty and default values are left out.
const filled = (rows) => rows.filter(([, value]) => value);

function emailContent(payload) {
  const parts = {
    lang: "en",
    preheader: `${payload.name}, ${payload.phone}`,
    heading: "New Pickup Request",
    summary: `${payload.name} finished the form and is waiting for your call.`,
    button: { label: `Call ${firstNameOf(payload.name)}`, href: telHref(payload.phone), plain: payload.phone },
    rows: [
      ["Status", "Complete"],
      ...filled([
        ["Name", payload.name],
        ["Phone", payload.phone],
        ["Bringing", label(payload.material)],
        ["Amount", titled(payload.quantity)],
        ["How They Want To Sell", titled(payload.location)],
        ["Email", payload.email],
        ["Business", payload.business],
        ["Request", payload.intent === "quote" ? "Quote" : ""],
        ["Frequency", payload.frequency === "recurring" ? "Recurring" : ""],
        ["Preferred Day", pickupSummary(payload)],
        ["Preferred Contact", payload.preferred_contact === "email" ? "Email" : ""],
        ["Note", payload.details]
      ])
    ],
    secondary: Object.entries(payload.attribution || {}),
    secondaryTitle: "How They Found Us"
  };
  return { text: emailPlain(parts), html: emailShell(parts) };
}

const CONFIRMATION_COPY = {
  en: {
    subject: "We Received Your Request | AG Refining",
    heading: (name) => `Thank You, ${name}`,
    body: "We received your request. Dennis will call you to confirm the details and a time.",
    call: `Call ${PHONE_DISPLAY}`,
    requested: "You Asked For",
    material: "Bringing",
    amount: "Amount",
    location: "How You Want To Sell",
    next: "If anything changes, reply to this email or call us."
  },
  es: {
    subject: "Recibimos Su Solicitud | AG Refining",
    heading: (name) => `Gracias, ${name}`,
    body: "Recibimos su solicitud. Dennis le llamará para confirmar los detalles y la hora.",
    call: `Llame al ${PHONE_DISPLAY}`,
    requested: "Usted Pidió",
    material: "Material",
    amount: "Cantidad",
    location: "Cómo Prefiere Vender",
    next: "Si algo cambia, responda a este correo o llámenos."
  }
};

export function confirmationContent(payload) {
  const copy = CONFIRMATION_COPY[payload.locale];
  const first = payload.name.split(/\s+/)[0] || payload.name;
  const parts = {
    lang: payload.locale,
    preheader: copy.body,
    heading: copy.heading(first),
    summary: copy.body,
    button: { label: copy.call, href: `tel:${PHONE_HREF}`, plain: PHONE_DISPLAY },
    rows: filled([
      [copy.material, titled(materialLabel(payload.material, payload.locale))],
      [copy.amount, titled(payload.quantity)],
      [copy.location, titled(payload.location)],
      [copy.requested, pickupSummary(payload, payload.locale)]
    ]),
    note: copy.next
  };
  return { subject: copy.subject, text: emailPlain(parts), html: emailShell(parts) };
}

// Courtesy confirmation to the visitor. Never blocks or fails the lead itself.
async function sendConfirmation(payload) {
  // No address, no courtesy email. The owner still gets the lead.
  if (!payload.email) return;
  try {
    const content = confirmationContent(payload);
    const owner = process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${payload.submission_key}-confirmation`
      },
      body: JSON.stringify({
        from: process.env.AG_LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL,
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

// Optional comma-separated copy list (AG_LEAD_BCC_EMAIL) so the site team sees leads too.
function leadBcc() {
  return (process.env.AG_LEAD_BCC_EMAIL || "")
    .split(",")
    .map((address) => address.trim())
    .filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address));
}

const LEAD_STAGES = new Set(["partial", "progress", "left", "complete"]);
const STEP_LABELS = {
  name: "Name",
  first_name: "First Name",
  last_name: "Last Name",
  phone: "Phone",
  material: "What They Are Bringing",
  quantity: "How Much",
  location: "How They Want To Sell",
  email: "Email"
};

// Vercel keeps function logs: search "LEAD_PROGRESS" to see how far each session got.
function logLeadProgress(payload) {
  console.log(`LEAD_PROGRESS ${JSON.stringify({
    session: payload.submission_key,
    status: payload.lead_status,
    step: payload.lead_step,
    name: payload.name,
    phone: payload.phone,
    material: payload.material,
    quantity: payload.quantity,
    location: payload.location
  })}`);
}

export function partialContent(payload) {
  const left = payload.lead_status === "left";
  const heading = left ? "Partial Lead Update" : "Partial Lead";
  const parts = {
    lang: "en",
    preheader: `${payload.name}, ${payload.phone}`,
    heading,
    summary: left
      ? `${payload.name} left before finishing. Here is what they answered.`
      : `${payload.name} started the form and gave a number. They have not finished yet.`,
    button: { label: `Call ${firstNameOf(payload.name)}`, href: telHref(payload.phone), plain: payload.phone },
    rows: [
      ["Status", left ? "Left Before Finishing" : "Still Filling In The Form"],
      ["Stopped At", STEP_LABELS[payload.lead_step] || payload.lead_step || "Phone"],
      ...filled([
        ["Name", payload.name],
        ["Phone", payload.phone],
        ["Bringing", MATERIALS.has(payload.material) ? label(payload.material) : ""],
        ["Amount", titled(payload.quantity)],
        ["How They Want To Sell", titled(payload.location)],
        ["Email", payload.email]
      ])
    ],
    note: "If a full request arrives from the same name and number, use that one."
  };
  return { subject: `${heading}: ${payload.name}, ${payload.phone}`, text: emailPlain(parts), html: emailShell(parts) };
}

// One "Partial Lead" email when a valid phone first arrives, and at most one "Partial lead update"
// if the visitor leaves later without finishing. Same sender, recipient and copy list as full leads.
async function sendPartial(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { configured: false };
  const content = partialContent(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `${payload.submission_key}-${payload.lead_status}`
    },
    body: JSON.stringify({
      from: process.env.AG_LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL],
      ...(leadBcc().length ? { bcc: leadBcc() } : {}),
      subject: content.subject,
      text: content.text,
      html: content.html
    })
  });
  if (!response.ok) throw new Error("Partial lead delivery failed");
  return { configured: true };
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
      ...(leadBcc().length ? { bcc: leadBcc() } : {}),
      ...(payload.email ? { reply_to: payload.email } : {}),
      subject: `Pickup Request: ${label(payload.material)} From ${payload.name}`,
      text: content.text,
      html: content.html
    })
  });

  if (!response.ok) throw new Error("Lead email delivery failed");
  await sendConfirmation(payload);
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
    ? ["Nombre", "Empresa", "Teléfono", "Correo electrónico", "Material", "Cantidad", "Ubicación", "Frecuencia", "Recogida preferida", "Detalles"]
    : ["Name", "Business", "Phone", "Email", "Material", "Amount", "Location", "Frequency", "Preferred pickup", "Details"];
  const values = [
    payload.name,
    payload.business || copy.notProvided,
    payload.phone,
    payload.email,
    payload.material,
    payload.quantity || copy.notProvided,
    payload.location,
    payload.frequency,
    pickupSummary(payload, payload.locale) || copy.notProvided,
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

  if (req.method === "GET" && queryValue(req, "status") === "health") {
    return res.status(200).json({ delivery: Boolean(process.env.RESEND_API_KEY) });
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
  // The one-field flow posts first and last name separately; older clients post "name".
  const firstName = text(body.first_name, 60);
  const lastName = text(body.last_name, 60);
  const stage = LEAD_STAGES.has(text(body.lead_status, 20)) ? text(body.lead_status, 20) : "complete";
  const payload = {
    name: text(body.name, 120) || [firstName, lastName].filter(Boolean).join(" "),
    lead_status: stage,
    lead_step: text(body.lead_step, 40),
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

  // Unfinished leads from the step flow. One person is one lead: the browser's session id
  // (submission_key) is the idempotency key, so a repeat of the same stage never sends twice.
  if (stage !== "complete") {
    if (payload.name.length < 1 || payload.phone.replace(/\D/g, "").length < 7) {
      return res.status(422).json({ ok: false });
    }
    logLeadProgress(payload);
    if (stage === "progress") return res.status(200).json({ ok: true });
    try {
      await sendPartial(payload);
    } catch {
      // A missed partial notice never blocks the visitor; the function log above still has it.
    }
    return res.status(200).json({ ok: true });
  }

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
