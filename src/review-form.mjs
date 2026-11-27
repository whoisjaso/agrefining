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

const WINDOW_OPTIONS = [
  ["any", "Any time", "Cualquier hora"],
  ["morning", "Morning", "Mañana"],
  ["midday", "Midday", "Mediodía"],
  ["afternoon", "Afternoon", "Tarde"]
];

const FREQUENCY_OPTIONS = [
  ["one_time", "One-time lot", "Lote único"],
  ["recurring", "Recurring material", "Material recurrente"],
  ["unknown", "Not sure", "No estoy seguro"]
];

// The step flow shows five big tiles. Each tile stands for a group of the endpoint's material values;
// a material chosen elsewhere (a material page link) keeps its exact value on the matching tile.
export const MATERIAL_TILES = Object.freeze([
  ["silver", "scrap_silver", ["scrap_silver", "silver_flatware", "jewelry_scrap", "silver_plated"]],
  ["coins", "silver_coins", ["silver_coins", "silver_bars"]],
  ["dental", "dental_material", ["dental_material", "xray_film"]],
  ["industrial", "industrial_silver", ["industrial_silver", "silver_flake", "laboratory_silver", "silver_solder", "silver_oxide_batteries"]],
  ["unsure", "unknown", ["unknown"]]
]);

export const REVIEW_FORM_ENUMS = Object.freeze({
  materials: Object.freeze(MATERIAL_OPTIONS.map(([value]) => value)),
  frequencies: Object.freeze(FREQUENCY_OPTIONS.map(([value]) => value)),
  contactMethods: Object.freeze(["phone", "email"]),
  pickupWindows: Object.freeze(WINDOW_OPTIONS.map(([value]) => value))
});

export function materialLabel(value, locale = "en") {
  const option = MATERIAL_OPTIONS.find(([key]) => key === value);
  if (!option) return String(value || "");
  return normalizeLocale(locale) === "es" ? option[2] : option[1];
}

export function pickupWindowLabel(value, locale = "en") {
  const option = WINDOW_OPTIONS.find(([key]) => key === value) || WINDOW_OPTIONS[0];
  return normalizeLocale(locale) === "es" ? option[2] : option[1];
}

const COPY = {
  en: {
    required: "Required",
    optional: "Optional",
    stepMaterial: "What Are You Bringing?",
    stepAmount: "About How Much?",
    stepPickup: "Pickup Or Drop-Off?",
    stepFirst: "What Is Your First Name?",
    stepLast: "And Your Last Name?",
    stepPhone: "Where Should Dennis Call You?",
    stepEmail: "Want A Confirmation By Email?",
    firstName: "First name",
    lastName: "Last name",
    skipHint: "Optional. Leave it blank to skip.",
    tiles: { silver: "Silver", coins: "Coins / Bullion", dental: "Dental / X-Ray", industrial: "Industrial / Scrap", unsure: "Not Sure" },
    amounts: ["A few pieces", "A box or bag", "Business volume"],
    amountLabels: ["A Few Pieces", "A Box Or Bag", "Business Volume"],
    pickupLabels: ["Pickup", "Drop-Off"],
    reassure: "No obligation. Dennis calls you back. Your number is saved as you go.",
    back: "Back",
    next: "Next",
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
    pickupDate: "Preferred pickup day",
    pickupWindow: "Preferred time",
    scheduleNote: "We will call or email to confirm the exact time.",
    details: "Note",
    detailsPlaceholder: "Anything we should know",
    preferred: "Preferred contact",
    companyWebsite: "Company website",
    phoneChoice: "Phone",
    emailChoice: "Email",
    submit: "Get My Offer Call",
    errorHeading: "Please review the following:",
    note: "This request is not a final quote or pickup promise. Free pickup and fast payment depend on the material, location, account type, and schedule. Do not send patient records, passwords, financial data, or identity documents. When you submit, the form page, first landing page, referring page, and supported campaign or ad identifiers are sent with your request. See our",
    privacy: "privacy notice"
  },
  es: {
    required: "Obligatorio",
    optional: "Opcional",
    stepMaterial: "¿Qué Va A Traer?",
    stepAmount: "¿Cuánto, Más O Menos?",
    stepPickup: "¿Recogida O Entrega?",
    stepFirst: "¿Cuál Es Su Nombre?",
    stepLast: "¿Y Su Apellido?",
    stepPhone: "¿A Dónde Le Llama Dennis?",
    stepEmail: "¿Quiere Confirmación Por Correo?",
    firstName: "Nombre",
    lastName: "Apellido",
    skipHint: "Opcional. Déjelo en blanco para omitirlo.",
    tiles: { silver: "Plata", coins: "Monedas / Lingotes", dental: "Dental / Rayos X", industrial: "Industrial / Chatarra", unsure: "No Estoy Seguro" },
    amounts: ["A few pieces", "A box or bag", "Business volume"],
    amountLabels: ["Unas Pocas Piezas", "Una Caja O Bolsa", "Volumen De Negocio"],
    pickupLabels: ["Recogida", "Entrega"],
    reassure: "Sin compromiso. Dennis le devuelve la llamada. Su número se guarda mientras avanza.",
    back: "Atrás",
    next: "Siguiente",
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
    pickupDate: "Día preferido de recogida",
    pickupWindow: "Horario preferido",
    scheduleNote: "Le llamaremos o escribiremos para confirmar la hora exacta.",
    details: "Nota",
    detailsPlaceholder: "Algo que debamos saber",
    preferred: "Medio de contacto preferido",
    companyWebsite: "Sitio web de la empresa",
    phoneChoice: "Teléfono",
    emailChoice: "Correo electrónico",
    submit: "Reciba Mi Llamada",
    errorHeading: "Revise los campos indicados:",
    note: "Esta solicitud no es una cotización final ni una promesa de recogida. La recogida gratuita y el pago rápido dependen del material, la ubicación, el tipo de cuenta y el horario. No envíe historiales de pacientes, contraseñas, datos financieros ni documentos de identidad. Al enviar, la página del formulario, la primera página de llegada, la página de referencia y los identificadores compatibles de campaña o anuncio se envían con su solicitud. Consulte nuestro",
    privacy: "aviso de privacidad (en ingles)"
  }
};

const KNOWN_VALUES = new Set([
  "name",
  "first_name",
  "last_name",
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
  "pickup_date",
  "pickup_window",
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
  const pickupWindow = WINDOW_OPTIONS.some(([value]) => value === clean.pickup_window) ? clean.pickup_window : "any";
  const pickupDate = /^\d{4}-\d{2}-\d{2}$/.test(clean.pickup_date || "") ? clean.pickup_date : "";
  const windowOptions = WINDOW_OPTIONS
    .map(([value, english, spanish]) => `<option value="${value}"${selected(pickupWindow, value)}>${language === "es" ? spanish : english}</option>`)
    .join("");
  const frequencyOptions = FREQUENCY_OPTIONS
    .map(([value, english, spanish]) => `<option value="${value}"${selected(frequency, value)}>${language === "es" ? spanish : english}</option>`)
    .join("");
  const tile = (name, value, label, isChecked, id, extra = "") => `<label class="flow-tile" for="${id}"><input id="${id}" type="radio" name="${name}" value="${escapeHtml(value)}"${isChecked ? " checked" : ""}${extra}><span>${label}</span></label>`;
  const materialTiles = MATERIAL_TILES.map(([key, fallback, group], index) => {
    const exact = group.includes(material) ? material : fallback;
    return tile("material", exact, copy.tiles[key], group.includes(material), `material-${key}`, `${index === 0 ? " required" : ""} data-tile="${key}" data-default="${fallback}"${materialState.attrs && index === 0 ? materialState.attrs : ""}`);
  }).join("");
  const amountTiles = copy.amounts.map((value, index) => tile("quantity", value, copy.amountLabels[index], clean.quantity === value, `quantity-${index + 1}`, ` data-tile="amount-${index + 1}"`)).join("");
  const pickupTiles = ["Pickup", "Drop-off"].map((value, index) => tile("location", value, copy.pickupLabels[index], clean.location === value, `location-${index + 1}`, ` data-tile="${index === 0 ? "pickup" : "dropoff"}"`)).join("");
  const nameParts = String(clean.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = clean.first_name || nameParts[0] || "";
  const lastName = clean.last_name || nameParts.slice(1).join(" ");
  const privacyAttributes = language === "es" ? ' hreflang="en"' : "";

  return `<form id="review-form" class="review-form" data-review-form data-locale="${language}" action="${escapeHtml(action)}" method="post">
    ${summary}
    <input type="hidden" name="locale" value="${language}">
    <input type="hidden" name="intent" value="${escapeHtml(intent)}">
    <input type="hidden" name="form_started" value="${escapeHtml(clean.form_started || "")}">
    <input type="hidden" name="submission_key" value="${escapeHtml(clean.submission_key || "")}">
    <div class="flow-progress field-wide" data-flow-progress role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="12" aria-label="${language === "es" ? "Progreso" : "Progress"}" hidden><span data-flow-bar style="width:12%"></span></div>
    <p class="flow-affirm field-wide" data-flow-affirm aria-live="polite" hidden></p>
    <div class="flow-stage field-wide" data-flow-stage>
    <fieldset class="flow-step field-wide" data-flow-step="first_name">
      <legend tabindex="-1"><label for="first_name">${copy.stepFirst}</label></legend>
      <div class="field"><input id="first_name" name="first_name" type="text" autocomplete="given-name" autocapitalize="words" aria-label="${copy.firstName}" value="${escapeHtml(firstName)}" required${nameState.attrs}>${nameState.error}</div>
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="last_name">
      <legend tabindex="-1"><label for="last_name">${copy.stepLast}</label></legend>
      <div class="field"><input id="last_name" name="last_name" type="text" autocomplete="family-name" autocapitalize="words" aria-label="${copy.lastName}" value="${escapeHtml(lastName)}" required></div>
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="phone">
      <legend tabindex="-1"><label for="phone">${copy.stepPhone}</label></legend>
      <div class="field"><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" aria-label="${copy.phone}" value="${escapeHtml(clean.phone || "")}" required${phoneState.attrs}>${phoneState.error}</div>
      <p class="flow-reassure">${copy.reassure}</p>
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="material">
      <legend tabindex="-1">${copy.stepMaterial}</legend>
      <div class="flow-tiles">${materialTiles}</div>
      ${materialState.error}
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="quantity">
      <legend tabindex="-1">${copy.stepAmount}</legend>
      <div class="flow-tiles">${amountTiles}</div>
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="location">
      <legend tabindex="-1">${copy.stepPickup}</legend>
      <div class="flow-tiles flow-tiles-two">${pickupTiles}</div>
    </fieldset>
    <fieldset class="flow-step field-wide" data-flow-step="email">
      <legend tabindex="-1"><label for="email">${copy.stepEmail}</label></legend>
      <div class="field"><input id="email" name="email" type="email" autocomplete="email" aria-label="${copy.email}" value="${escapeHtml(clean.email || "")}"${emailState.attrs}>${emailState.error}</div>
      <p class="flow-reassure">${copy.skipHint}</p>
      <div class="honeypot" aria-hidden="true"><label for="company_url">${copy.companyWebsite}</label><input id="company_url" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
      <div class="form-actions"><button class="button button-primary" type="submit" data-submit-button>${copy.submit} <span class="icon-arrow" aria-hidden="true"></span></button><p class="form-status" data-form-status aria-live="polite"></p></div>
      <p class="form-note">${copy.note} <a href="/privacy"${privacyAttributes}>${copy.privacy}</a>.</p>
    </fieldset>
    </div>
    <div class="flow-nav field-wide" data-flow-nav hidden><button class="flow-back" type="button" data-flow-back>${copy.back}</button><button class="button button-secondary flow-next" type="button" data-flow-next>${copy.next} <span class="icon-arrow" aria-hidden="true"></span></button></div>
  </form>`;
}
