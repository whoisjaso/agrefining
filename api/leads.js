const MAX_BODY_BYTES = 32_000;
const DEFAULT_TO_EMAIL = "dennis@agrefining.com";
const DEFAULT_FROM_EMAIL = "AG Refining <website@agrefining.com>";
const MATERIALS = new Set([
  "scrap_silver",
  "industrial_silver",
  "dental_material",
  "silver_oxide_batteries",
  "xray_film",
  "silver_coins",
  "unknown"
]);
const FREQUENCIES = new Set(["one_time", "recurring", "unknown"]);
const CONTACT_METHODS = new Set(["phone", "email"]);

function text(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return {};
  return JSON.parse(req.body);
}

function validate(payload) {
  const fields = {};
  if (payload.name.length < 2) fields.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) fields.email = "Enter a valid email.";
  if (payload.phone.replace(/\D/g, "").length < 7) fields.phone = "Enter a valid phone number.";
  if (!MATERIALS.has(payload.material)) fields.material = "Choose the closest material type.";
  if (payload.location.length < 2) fields.location = "Enter the pickup city or address.";
  if (payload.details.length < 20) fields.details = "Add a little more detail about the material.";
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

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Use the pickup request form." });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ message: "The request is too large. Please call AG Refining." });
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ message: "The request could not be read. Please review the form." });
  }

  const payload = {
    name: text(body.name, 120),
    business: text(body.business, 180),
    phone: text(body.phone, 80),
    email: text(body.email, 254).toLowerCase(),
    intent: ["pickup", "quote"].includes(text(body.intent, 20)) ? text(body.intent, 20) : "pickup",
    material: text(body.material, 60),
    quantity: text(body.quantity, 120),
    location: text(body.location, 180),
    frequency: FREQUENCIES.has(text(body.frequency, 30)) ? text(body.frequency, 30) : "unknown",
    preferred_contact: CONTACT_METHODS.has(text(body.preferred_contact, 20)) ? text(body.preferred_contact, 20) : "phone",
    details: text(body.details, 4000),
    company_url: text(body.company_url, 300),
    form_started: Number(body.form_started || 0),
    submission_key: text(body.submission_key, 100) || `lead-${Date.now()}`,
    attribution: cleanAttribution(body.attribution)
  };

  const elapsed = Date.now() - payload.form_started;
  if (payload.company_url || !Number.isFinite(elapsed) || elapsed < 700) {
    return res.status(200).json({ ok: true });
  }

  const fields = validate(payload);
  if (Object.keys(fields).length) {
    return res.status(422).json({ message: "Please review the highlighted fields.", fields });
  }

  try {
    const delivery = await sendResend(payload);
    if (!delivery.configured) {
      return res.status(503).json({
        message: "Online delivery is being set up. Call AG Refining or email these details instead.",
        fallback_email: process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL
      });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({
      message: "The request could not be delivered. Call AG Refining or email these details instead.",
      fallback_email: process.env.AG_LEAD_TO_EMAIL || DEFAULT_TO_EMAIL
    });
  }
}
