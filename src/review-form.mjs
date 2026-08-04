const MATERIAL_OPTIONS = [
  ["scrap_silver", "Scrap silver", "Plata para reciclaje"],
  ["industrial_silver", "Industrial silver", "Plata industrial"],
  ["silver_flake", "Silver flake", "Escamas de plata"],
  ["laboratory_silver", "Laboratory silver", "Plata de laboratorio"],
  ["silver_solder", "Silver solder", "Soldadura de plata"],
  ["silver_plated", "Silver-plated material", "Material plateado"],
  ["silver_bars", "Silver bars", "Barras de plata"],
  ["silver_flatware", "Silver flatware", "Cubiertos de plata"],
  ["jewelry_scrap", "Jewelry store scrap", "Recortes de joyería"],
  ["dental_material", "Dental material", "Material dental"],
  ["silver_oxide_batteries", "Watch batteries", "Baterías de reloj"],
  ["xray_film", "X-ray film", "Película de rayos X"],
  ["silver_coins", "Silver coins", "Monedas de plata"],
  ["unknown", "Not sure", "No estoy seguro"]
];

const FREQUENCY_OPTIONS = [
  ["one_time", "One-time lot", "Lote único"],
  ["recurring", "Recurring material", "Material recurrente"],
  ["unknown", "Not sure", "No estoy seguro"]
];

export const REVIEW_FORM_ENUMS = Object.freeze({
  materials: Object.freeze(MATERIAL_OPTIONS.map(([value]) => value)),
  frequencies: Object.freeze(FREQUENCY_OPTIONS.map(([value]) => value)),
  contactMethods: Object.freeze(["phone", "email"])
});

const COPY = {
  en: {
    required: "Required",
    name: "Name",
    business: "Business",
    phone: "Phone",
    email: "Email",
    material: "Material",
    selectOne: "Select one",
    quantity: "Approximate amount",
    quantityPlaceholder: "Weight, boxes, drums, or pallets",
    location: "Pickup location",
    locationPlaceholder: "City or business address",
    frequency: "How often?",
    details: "What should we know?",
    detailsPlaceholder: "Describe the material, condition, source, and anything that may affect pickup.",
    preferred: "Preferred contact",
    companyWebsite: "Company website",
    phoneChoice: "Phone",
    emailChoice: "Email",
    submit: "Send request",
    errorHeading: "Please review the following:",
    note: "This request is not a final quote or pickup promise. Free pickup and fast payment depend on the material, location, account type, and schedule. Do not send patient records, passwords, financial data, or identity documents. When you submit, the form page, first landing page, referring page, and supported campaign or ad identifiers are sent with your request. See our",
    privacy: "privacy notice"
  },
  es: {
    required: "Obligatorio",
    name: "Nombre",
    business: "Empresa",
    phone: "Teléfono",
    email: "Correo electrónico",
    material: "Material",
    selectOne: "Seleccione una opción",
    quantity: "Cantidad aproximada",
    quantityPlaceholder: "Peso, cajas, tambores o palés",
    location: "Lugar de recogida",
    locationPlaceholder: "Ciudad o dirección de la empresa",
    frequency: "¿Con qué frecuencia?",
    details: "¿Qué debemos saber?",
    detailsPlaceholder: "Describa el material, su condición, procedencia y cualquier detalle que pueda afectar la recogida.",
    preferred: "Medio de contacto preferido",
    companyWebsite: "Sitio web de la empresa",
    phoneChoice: "Teléfono",
    emailChoice: "Correo electrónico",
    submit: "Enviar solicitud",
    errorHeading: "Revise los campos indicados:",
    note: "Esta solicitud no es una cotización final ni una promesa de recogida. La recogida gratuita y el pago rápido dependen del material, la ubicación, el tipo de cuenta y el horario. No envíe historiales de pacientes, contraseñas, datos financieros ni documentos de identidad. Al enviar, la página del formulario, la primera página de llegada, la página de referencia y los identificadores compatibles de campaña o anuncio se envían con su solicitud. Consulte nuestro",
    privacy: "aviso de privacidad (en ingles)"
  }
};

const KNOWN_VALUES = new Set([
  "name",
  "business",
  "phone",
  "email",
  "intent",
  "material",
  "quantity",
  "location",
  "frequency",
  "preferred_contact",
  "details",
  "form_started",
  "submission_key",
  "locale"
]);

export function normalizeLocale(value) {
  return String(value || "").trim().toLowerCase() === "es" ? "es" : "en";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeValues(values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) return {};
  return Object.fromEntries(
    Object.entries(values)
      .filter(([name]) => KNOWN_VALUES.has(name))
      .map(([name, value]) => [name, String(value ?? "")])
  );
}

function fieldState(name, errors) {
  const message = typeof errors[name] === "string" ? errors[name] : "";
  return {
    attrs: message ? ` aria-invalid="true" aria-describedby="${name}-error"` : "",
    error: message ? `<p id="${name}-error" class="field-error">${escapeHtml(message)}</p>` : ""
  };
}

function selected(value, expected) {
  return value === expected ? " selected" : "";
}

function checked(value, expected) {
  return value === expected ? " checked" : "";
}

export function renderReviewForm({
  locale = "en",
  values = {},
  fieldErrors = {},
  action = "/api/leads"
} = {}) {
  const language = normalizeLocale(locale);
  const copy = COPY[language];
  const clean = safeValues(values);
  const errors = fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors) ? fieldErrors : {};
  const intent = ["pickup", "quote"].includes(clean.intent) ? clean.intent : "pickup";
  const material = MATERIAL_OPTIONS.some(([value]) => value === clean.material) ? clean.material : "";
  const frequency = FREQUENCY_OPTIONS.some(([value]) => value === clean.frequency) ? clean.frequency : "one_time";
  const preferred = ["phone", "email"].includes(clean.preferred_contact) ? clean.preferred_contact : "phone";
  const errorEntries = Object.entries(errors).filter(([name, message]) => KNOWN_VALUES.has(name) && typeof message === "string" && message);
  const summary = errorEntries.length
    ? `<div class="form-errors field-wide" data-form-errors tabindex="-1"><p>${copy.errorHeading}</p><ul>${errorEntries.map(([name, message]) => `<li><a href="#${escapeHtml(name)}">${escapeHtml(message)}</a></li>`).join("")}</ul></div>`
    : `<div class="form-errors field-wide" data-form-errors tabindex="-1" hidden></div>`;
  const nameState = fieldState("name", errors);
  const phoneState = fieldState("phone", errors);
  const emailState = fieldState("email", errors);
  const materialState = fieldState("material", errors);
  const locationState = fieldState("location", errors);
  const detailsState = fieldState("details", errors);
  const materialOptions = MATERIAL_OPTIONS
    .map(([value, english, spanish]) => `<option value="${value}"${selected(material, value)}>${language === "es" ? spanish : english}</option>`)
    .join("");
  const frequencyOptions = FREQUENCY_OPTIONS
    .map(([value, english, spanish]) => `<option value="${value}"${selected(frequency, value)}>${language === "es" ? spanish : english}</option>`)
    .join("");
  const privacyAttributes = language === "es" ? ' hreflang="en"' : "";

  return `<form id="review-form" class="review-form" data-review-form data-locale="${language}" action="${escapeHtml(action)}" method="post">
    ${summary}
    <input type="hidden" name="locale" value="${language}">
    <input type="hidden" name="intent" value="${escapeHtml(intent)}">
    <input type="hidden" name="form_started" value="${escapeHtml(clean.form_started || "")}">
    <input type="hidden" name="submission_key" value="${escapeHtml(clean.submission_key || "")}">
    <div class="field"><label for="name">${copy.name} <span>${copy.required}</span></label><input id="name" name="name" type="text" autocomplete="name" value="${escapeHtml(clean.name || "")}" required${nameState.attrs}>${nameState.error}</div>
    <div class="field"><label for="business">${copy.business}</label><input id="business" name="business" type="text" autocomplete="organization" value="${escapeHtml(clean.business || "")}"></div>
    <div class="field"><label for="phone">${copy.phone} <span>${copy.required}</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" value="${escapeHtml(clean.phone || "")}" required${phoneState.attrs}>${phoneState.error}</div>
    <div class="field"><label for="email">${copy.email} <span>${copy.required}</span></label><input id="email" name="email" type="email" autocomplete="email" value="${escapeHtml(clean.email || "")}" required${emailState.attrs}>${emailState.error}</div>
    <div class="field"><label for="material">${copy.material} <span>${copy.required}</span></label><select id="material" name="material" required${materialState.attrs}>
      <option value=""${selected(material, "")}>${copy.selectOne}</option>${materialOptions}
    </select>${materialState.error}</div>
    <div class="field"><label for="quantity">${copy.quantity}</label><input id="quantity" name="quantity" type="text" maxlength="120" value="${escapeHtml(clean.quantity || "")}" placeholder="${copy.quantityPlaceholder}"></div>
    <div class="field"><label for="location">${copy.location} <span>${copy.required}</span></label><input id="location" name="location" type="text" maxlength="180" value="${escapeHtml(clean.location || "")}" placeholder="${copy.locationPlaceholder}" required${locationState.attrs}>${locationState.error}</div>
    <div class="field"><label for="frequency">${copy.frequency}</label><select id="frequency" name="frequency">${frequencyOptions}</select></div>
    <div class="field field-wide"><label for="details">${copy.details} <span>${copy.required}</span></label><textarea id="details" name="details" required minlength="20" placeholder="${copy.detailsPlaceholder}"${detailsState.attrs}>${escapeHtml(clean.details || "")}</textarea>${detailsState.error}</div>
    <fieldset class="field field-wide preferred-contact"><legend>${copy.preferred}</legend><label><input type="radio" name="preferred_contact" value="phone"${checked(preferred, "phone")}> ${copy.phoneChoice}</label><label><input type="radio" name="preferred_contact" value="email"${checked(preferred, "email")}> ${copy.emailChoice}</label></fieldset>
    <div class="honeypot" aria-hidden="true"><label for="company_url">${copy.companyWebsite}</label><input id="company_url" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
    <p class="form-note field-wide">${copy.note} <a href="/privacy"${privacyAttributes}>${copy.privacy}</a>.</p>
    <div class="form-actions field-wide"><button class="button button-primary" type="submit" data-submit-button>${copy.submit} <span class="icon-arrow" aria-hidden="true"></span></button><p class="form-status" data-form-status aria-live="polite"></p></div>
  </form>`;
}
