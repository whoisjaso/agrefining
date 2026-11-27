const siteHeader = document.querySelector("[data-site-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navScrim = document.querySelector("[data-nav-scrim]");
const toggleLabel = toggle?.querySelector("[data-nav-toggle-label]");
const navBackground = Array.from(document.querySelectorAll("main, .material-guide, .mobile-actions, .footer"));
const navMedia = window.matchMedia("(min-width: 901px)");
const materialsResetEvent = "materials-disclosure-reset";
const spanish = document.documentElement.lang.startsWith("es");
let navReturnFocus = null;
let navEnhanced = false;
const navTabIndexes = new Map();

function navControls() {
  return Array.from(nav?.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]") || []);
}

function navFocusables() {
  return [toggle, ...navControls()].filter((control) => control && !control.hidden);
}

function setNavBackgroundInert(inert) {
  navBackground.forEach((element) => {
    element.inert = inert;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  });
}

function setNavControlsEnabled(enabled) {
  navControls().forEach((control) => {
    if (!enabled) {
      if (!navTabIndexes.has(control)) {
        navTabIndexes.set(control, {
          present: control.hasAttribute("tabindex"),
          value: control.getAttribute("tabindex")
        });
      }
      control.setAttribute("tabindex", "-1");
      return;
    }
    const original = navTabIndexes.get(control);
    if (!original) return;
    if (original.present) control.setAttribute("tabindex", original.value ?? "");
    else control.removeAttribute("tabindex");
    navTabIndexes.delete(control);
  });
}

function resetMaterialsDisclosure() {
  window.dispatchEvent(new Event(materialsResetEvent));
}

function syncNavState({ open = false, restoreFocus = false, resetMaterials = true } = {}) {
  if (!navEnhanced || !toggle || !nav) return;
  const mobile = !navMedia.matches;
  const menuOpen = mobile && open;
  const wasOpen = document.body.classList.contains("nav-open");
  const interactive = !mobile || menuOpen;
  document.body.classList.toggle("nav-open", menuOpen);
  toggle.setAttribute("aria-expanded", String(menuOpen));
  toggle.setAttribute("aria-label", menuOpen
    ? (spanish ? "Cerrar navegación" : "Close navigation")
    : (spanish ? "Menú: abrir navegación" : "Menu: open navigation"));
  if (toggleLabel) toggleLabel.textContent = menuOpen
    ? (spanish ? "Cerrar" : "Close")
    : (spanish ? "Menú" : "Menu");
  nav.inert = !interactive;
  if (interactive) {
    nav.removeAttribute("inert");
    nav.removeAttribute("aria-hidden");
  } else {
    nav.setAttribute("inert", "");
    nav.setAttribute("aria-hidden", "true");
  }
  setNavControlsEnabled(interactive);
  setNavBackgroundInert(menuOpen);
  if (wasOpen && !menuOpen && resetMaterials) resetMaterialsDisclosure();
  if (wasOpen && !menuOpen && restoreFocus) (navReturnFocus || toggle).focus?.();
  if (!menuOpen) navReturnFocus = null;
}

function openNav() {
  if (!navEnhanced || !toggle || !nav || navMedia.matches) return;
  navReturnFocus = document.activeElement;
  syncNavState({ open: true });
  window.requestAnimationFrame(() => nav.querySelector("a[href]")?.focus());
}

function initializeNav() {
  if (!siteHeader || !toggle || !nav || !navScrim) return;

  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) {
      syncNavState({ open: false, restoreFocus: true });
      updateChrome();
    }
    else {
      openNav();
      updateChrome();
    }
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    syncNavState({ open: false });
    updateChrome();
  }));
  navScrim.addEventListener("click", () => {
    syncNavState({ open: false, restoreFocus: true });
    updateChrome();
  });
  document.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      syncNavState({ open: false, restoreFocus: true });
      updateChrome();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = navFocusables();
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  navMedia.addEventListener?.("change", () => {
    syncNavState({ open: false, resetMaterials: false });
    resetMaterialsDisclosure();
    updateChrome();
  });

  navEnhanced = true;
  syncNavState({ open: false });
  siteHeader.dataset.navEnhanced = "true";
  toggle.hidden = false;
  navScrim.hidden = false;
}

initializeNav();

const actionDock = document.querySelector(".mobile-actions");
const footer = document.querySelector(".footer");
const firstSection = document.querySelector("main > section");
const reviewFormZone = document.querySelector("[data-review-form]");
let chromeTicking = false;

// The pill stays out of the first screen: it appears once most of the opening section has scrolled away.
function revealOffset() {
  const height = firstSection?.offsetHeight || 0;
  return Math.max(320, Math.round(height * 0.6));
}

function updateChrome() {
  chromeTicking = false;
  const offset = window.scrollY;
  siteHeader?.setAttribute("data-stuck", offset > 12 ? "true" : "false");
  if (!actionDock) return;
  const footerTop = footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const navOpen = document.body.classList.contains("nav-open");
  const typing = document.activeElement?.matches?.("input, select, textarea") ?? false;
  const formOnScreen = reviewFormZone ? reviewFormZone.getBoundingClientRect().top < viewportHeight && reviewFormZone.getBoundingClientRect().bottom > 0 : false;
  const visible = offset > revealOffset() && !navOpen && !typing && !formOnScreen && footerTop > viewportHeight + 24;
  actionDock.setAttribute("data-visible", visible ? "true" : "false");
  actionDock.setAttribute("aria-hidden", visible ? "false" : "true");
  actionDock.inert = !visible;
  if (visible) actionDock.removeAttribute("inert");
  else actionDock.setAttribute("inert", "");
}

window.addEventListener("scroll", () => {
  if (chromeTicking) return;
  chromeTicking = true;
  window.requestAnimationFrame(updateChrome);
}, { passive: true });
window.addEventListener("resize", updateChrome, { passive: true });
document.addEventListener("focusin", updateChrome);
document.addEventListener("focusout", () => window.requestAnimationFrame(updateChrome));
window.visualViewport?.addEventListener("resize", updateChrome, { passive: true });
window.visualViewport?.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

const materialGuide = document.querySelector(".material-guide");
const materialGuideSummary = materialGuide?.querySelector("summary");
document.addEventListener("click", (event) => {
  if (materialGuide?.open && !materialGuide.contains(event.target)) materialGuide.removeAttribute("open");
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !materialGuide?.open) return;
  materialGuide.removeAttribute("open");
  materialGuideSummary?.focus();
});

const reviewForm = document.querySelector("[data-review-form]");
const formLocale = reviewForm?.dataset.locale === "es" || spanish ? "es" : "en";
const formUi = {
  en: {
    errorHeading: "One more thing:",
    required: (label) => `Please add your ${label.toLowerCase()}.`,
    choose: (question) => `Please pick one: ${question}`,
    invalidEmail: "Enter a valid email.",
    invalidField: (label) => `Enter a valid ${label.toLowerCase()}.`,
    shortDetails: "Add a little more detail so the material can be reviewed.",
    sendingButton: "Sending request...",
    sendingStatus: "Sending your material review request.",
    success: "Your request was received. AG Refining will review the details and follow up using your preferred contact method.",
    emailDetails: "Email these details",
    networkError: "The request could not be sent. Please call (281) 898-2719 or try again.",
    submit: "Get My Offer Call",
    flowBlank: "Please type your answer to continue.",
    flowPhone: "Please add a phone number Dennis can call.",
    flowPick: "Please pick one to continue.",
    affirmFirst: (name) => (name ? `Nice to meet you, ${name}.` : ""),
    affirm: {
      first_name: "",
      last_name: "Thank you.",
      phone: "Got it. Dennis can reach you now.",
      silver: "Nice. Silver is our specialty.",
      coins: "Good. We buy coins and bullion.",
      dental: "Good. We handle dental and X-ray material.",
      industrial: "Good. We work with shops and plants.",
      unsure: "No problem. We will sort it out together.",
      "amount-1": "Perfect. Small lots are welcome.",
      "amount-2": "Perfect. We handle that size.",
      "amount-3": "Perfect. We handle business volume.",
      pickup: "Good. We will confirm pickup on the call.",
      dropoff: "Good. Dennis will set a time with you."
    },
    doneHeading: "Thank You. Your Request Is In.",
    doneSteps: ["Dennis calls the number you gave.", "You tell him what you have.", "He confirms a pickup or a time to come by."],
    doneCall: "Call (281) 898-2719",
    doneNote: "No obligation.",
    subject: (intent) => `AG Refining ${intent === "quote" ? "quote" : "pickup"} request`,
    labels: ["Name", "Business", "Phone", "Email", "Material", "Amount", "Location", "Frequency", "Preferred pickup"],
    notProvided: "Not provided"
  },
  es: {
    errorHeading: "Falta un detalle:",
    required: (label) => `Por favor agregue: ${label.toLowerCase()}.`,
    choose: (question) => `Elija una opción: ${question}`,
    invalidEmail: "Escriba un correo electrónico válido.",
    invalidField: (label) => `Escriba un ${label.toLowerCase()} válido.`,
    shortDetails: "Añada un poco más de información para revisar el material.",
    sendingButton: "Enviando solicitud...",
    sendingStatus: "Enviando su solicitud de revisión del material.",
    success: "Recibimos su solicitud. AG Refining revisará los detalles y se comunicará por el medio que prefirió.",
    emailDetails: "Enviar estos datos por correo",
    networkError: "No se pudo enviar la solicitud. Llame al (281) 898-2719 o inténtelo de nuevo.",
    submit: "Reciba Mi Llamada",
    flowBlank: "Escriba su respuesta para continuar.",
    flowPhone: "Agregue un teléfono al que Dennis pueda llamar.",
    flowPick: "Elija una opción para continuar.",
    affirmFirst: (name) => (name ? `Mucho gusto, ${name}.` : ""),
    affirm: {
      first_name: "",
      last_name: "Gracias.",
      phone: "Listo. Dennis ya puede llamarle.",
      silver: "Muy bien. La plata es nuestra especialidad.",
      coins: "Bien. Compramos monedas y lingotes.",
      dental: "Bien. Manejamos material dental y de rayos X.",
      industrial: "Bien. Trabajamos con talleres y plantas.",
      unsure: "No hay problema. Lo vemos juntos.",
      "amount-1": "Perfecto. Los lotes pequeños son bienvenidos.",
      "amount-2": "Perfecto. Manejamos ese tamaño.",
      "amount-3": "Perfecto. Manejamos volumen de negocio.",
      pickup: "Bien. Confirmamos la recogida en la llamada.",
      dropoff: "Bien. Dennis acordará una hora con usted."
    },
    doneHeading: "Gracias. Recibimos Su Solicitud.",
    doneSteps: ["Dennis llama al número que nos dio.", "Usted le cuenta qué tiene.", "Él confirma una recogida o una hora para venir."],
    doneCall: "Llame al (281) 898-2719",
    doneNote: "Sin compromiso.",
    subject: () => "Solicitud de recogida de AG Refining",
    labels: ["Nombre", "Empresa", "Teléfono", "Correo electrónico", "Material", "Cantidad", "Ubicación", "Frecuencia", "Recogida preferida"],
    notProvided: "No indicado"
  }
}[formLocale];

const MATERIAL_GROUPS = [
  ["silver", ["scrap_silver", "silver_flatware", "jewelry_scrap", "silver_plated"]],
  ["coins", ["silver_coins", "silver_bars"]],
  ["dental", ["dental_material", "xray_film"]],
  ["industrial", ["industrial_silver", "silver_flake", "laboratory_silver", "silver_solder", "silver_oxide_batteries"]],
  ["unsure", ["unknown"]]
];

function prefillReviewForm(form) {
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const pickupDate = form.querySelector("[data-pickup-date]");
  if (pickupDate) {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    pickupDate.min = local;
  }
  const requestedMaterial = params.get("material")?.trim();
  if (requestedMaterial) {
    const tiles = Array.from(form.querySelectorAll("input[type='radio'][name='material']"));
    const group = MATERIAL_GROUPS.find(([, values]) => values.includes(requestedMaterial));
    const tileInput = group ? tiles.find((input) => input.dataset.tile === group[0]) : null;
    if (tileInput) {
      // Keep the exact material from the link (for example xray_film) on its tile.
      tileInput.value = requestedMaterial;
      tileInput.checked = true;
    }
  }
  ["intent", "frequency"].forEach((name) => {
    const field = form.elements.namedItem(name);
    const requested = params.get(name)?.trim();
    if (!field || !requested) return;
    if (field instanceof HTMLSelectElement) {
      const supported = Array.from(field.options).some((option) => option.value === requested);
      if (supported) field.value = requested;
      return;
    }
    if (field instanceof HTMLInputElement) field.value = requested.slice(0, field.maxLength > 0 ? field.maxLength : 120);
  });
}

function createSubmissionKey() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const random = window.crypto?.getRandomValues
    ? Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join("")
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `web-${Date.now().toString(36)}-${random}`.slice(0, 100);
}

function readAttribution() {
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  const params = new URLSearchParams(window.location.search);
  let firstTouch = {};
  try {
    firstTouch = JSON.parse(window.sessionStorage.getItem("ag_first_touch") || "{}");
  } catch {
    firstTouch = {};
  }

  if (!firstTouch.landing_page) {
    firstTouch = {
      landing_page: window.location.href.slice(0, 1000),
      referrer: document.referrer.slice(0, 1000)
    };
    allowed.forEach((key) => {
      const value = params.get(key);
      if (value) firstTouch[key] = value.slice(0, 255);
    });
    try {
      window.sessionStorage.setItem("ag_first_touch", JSON.stringify(firstTouch));
    } catch {
      // Submissions still work when session storage is unavailable.
    }
  }

  return {
    ...firstTouch,
    submission_page: window.location.href.slice(0, 1000)
  };
}

readAttribution();

function fieldLabel(field) {
  return field.labels?.[0]?.textContent?.replace(/Required|Obligatorio/gi, "").trim() || field.name;
}

function validateReviewForm(form) {
  const issues = [];
  const fields = Array.from(form.elements).filter((field) => field.name && !field.disabled && field.type !== "hidden");

  const radioGroups = new Set();
  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    if (field.name === "company_url") return;
    if (field.type === "radio") {
      // One calm prompt per tile question, worded from the question itself.
      if (radioGroups.has(field.name)) return;
      radioGroups.add(field.name);
      if (!field.checkValidity()) {
        const question = field.closest("fieldset")?.querySelector("legend")?.textContent?.trim() || field.name;
        issues.push({ field, message: formUi.choose(question) });
      }
      return;
    }
    if (!field.checkValidity()) {
      const message = field.validity.valueMissing
        ? formUi.required(fieldLabel(field))
        : field.validity.typeMismatch
          ? (field.name === "email" ? formUi.invalidEmail : formUi.invalidField(fieldLabel(field)))
          : field.validity.tooShort && field.name === "details"
            ? formUi.shortDetails
            : formUi.invalidField(fieldLabel(field));
      issues.push({ field, message });
      field.setAttribute("aria-invalid", "true");
    }
  });

  return issues;
}

function showFormIssues(form, issues) {
  const summary = form.querySelector("[data-form-errors]");
  if (!summary) return;
  if (!issues.length) {
    summary.hidden = true;
    summary.replaceChildren();
    return;
  }

  const heading = document.createElement("p");
  heading.textContent = formUi.errorHeading;
  const list = document.createElement("ul");
  issues.forEach(({ field, message }) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${field.id}`;
    link.textContent = message;
    link.addEventListener("click", () => window.setTimeout(() => field.focus(), 0));
    item.append(link);
    list.append(item);
  });
  summary.replaceChildren(heading, list);
  summary.hidden = false;
  summary.focus();
}

function setFormStatus(form, message, state = "") {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;
  status.textContent = message;
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}

// Calm confirmation: what happens next and one tap-to-call button.
function showFormDone(form) {
  const panel = document.createElement("div");
  panel.className = "flow-done";
  panel.setAttribute("role", "status");
  panel.tabIndex = -1;
  const heading = document.createElement("h3");
  heading.textContent = formUi.doneHeading;
  const list = document.createElement("ol");
  formUi.doneSteps.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
  const call = document.createElement("a");
  call.className = "button button-primary";
  call.href = "tel:+12818982719";
  call.textContent = formUi.doneCall;
  const note = document.createElement("p");
  note.className = "flow-reassure";
  note.textContent = formUi.doneNote;
  panel.append(heading, list, call, note);
  const bar = form.querySelector("[data-flow-bar]");
  if (bar) bar.style.width = "100%";
  form.querySelector("[data-flow-progress]")?.setAttribute("aria-valuenow", "100");
  form.dataset.flowDone = "true";
  clearFlowStore();
  form.querySelectorAll(".flow-step, [data-flow-nav], [data-flow-affirm]").forEach((element) => { element.hidden = true; });
  form.append(panel);
  panel.focus();
}

// Step-by-step flow: one question per screen. Without this script the form is a plain stacked form.
const FLOW_STORE = "ag-pickup-flow-v1";
const FLOW_KEEP_MS = 14 * 24 * 60 * 60 * 1000;
const FLOW_TRANSITION_MS = 500;

function readFlowStore() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FLOW_STORE) || "null");
    if (!saved || typeof saved !== "object" || saved.locale !== formLocale) return null;
    if (!Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > FLOW_KEEP_MS) return null;
    return saved;
  } catch {
    return null;
  }
}

function clearFlowStore() {
  try { window.localStorage.removeItem(FLOW_STORE); } catch { /* storage can be blocked; the form still works */ }
}

// One-field-per-screen flow. Without this script the form is a plain stacked form.
// Answers are kept in this browser so a returning visitor resumes where they stopped. Once a valid
// phone is in, an unfinished lead is posted so the shop can call people who stop part way.
function initializeFormFlow(form) {
  const steps = Array.from(form.querySelectorAll("[data-flow-step]"));
  const progress = form.querySelector("[data-flow-progress]");
  const bar = form.querySelector("[data-flow-bar]");
  const affirm = form.querySelector("[data-flow-affirm]");
  const nav = form.querySelector("[data-flow-nav]");
  const back = form.querySelector("[data-flow-back]");
  const next = form.querySelector("[data-flow-next]");
  const sessionField = form.elements.namedItem("submission_key");
  if (steps.length < 2 || !progress || !bar || !nav || !back || !next) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const names = steps.map((step) => step.dataset.flowStep);
  const phoneIndex = names.indexOf("phone");
  const last = steps.length - 1;
  const textInput = (step) => step.querySelector("input[type='text'], input[type='tel'], input[type='email']");
  let current = 0;
  let furthest = 0;
  let partialSent = false;
  let leftSent = false;
  let leaveTimer = 0;

  const digits = (value) => String(value || "").replace(/\D/g, "").length;
  function stepProblem(index) {
    const step = steps[index];
    const input = textInput(step);
    if (!input) return step.querySelector("input[type='radio']:checked") ? "" : formUi.flowPick;
    const value = input.value.trim();
    if (input.name === "phone") return digits(value) >= 7 ? "" : formUi.flowPhone;
    if (input.name === "email") return !value || input.checkValidity() ? "" : formUi.invalidEmail;
    return value ? "" : formUi.flowBlank;
  }

  function reward(index) {
    const step = steps[index];
    if (!step) return "";
    const picked = step.querySelector("input[type='radio']:checked");
    if (picked) return formUi.affirm[picked.dataset.tile] || "";
    const input = textInput(step);
    if (input?.name === "first_name") return formUi.affirmFirst(input.value.trim());
    return formUi.affirm[input?.name] || "";
  }

  function save() {
    try {
      const values = {};
      ["first_name", "last_name", "phone", "email"].forEach((name) => { values[name] = form.elements.namedItem(name)?.value || ""; });
      ["material", "quantity", "location"].forEach((name) => { values[name] = form.querySelector(`input[name='${name}']:checked`)?.value || ""; });
      window.localStorage.setItem(FLOW_STORE, JSON.stringify({
        values, step: current, furthest, partialSent, leftSent,
        session: sessionField?.value || "", locale: formLocale, savedAt: Date.now()
      }));
    } catch { /* storage can be blocked; the form still works */ }
  }

  function restore() {
    const saved = readFlowStore();
    if (!saved) return;
    const values = saved.values || {};
    ["first_name", "last_name", "phone", "email"].forEach((name) => {
      const field = form.elements.namedItem(name);
      if (field && typeof values[name] === "string" && !field.value) field.value = values[name].slice(0, 254);
    });
    if (!form.querySelector("input[name='material']:checked") && values.material) {
      const group = MATERIAL_GROUPS.find(([, list]) => list.includes(values.material));
      const tile = group && form.querySelector(`input[name='material'][data-tile='${group[0]}']`);
      if (tile) { tile.value = values.material; tile.checked = true; }
    }
    ["quantity", "location"].forEach((name) => {
      const match = Array.from(form.querySelectorAll(`input[name='${name}']`)).find((input) => input.value === values[name]);
      if (match) match.checked = true;
    });
    if (sessionField && typeof saved.session === "string" && saved.session) sessionField.value = saved.session.slice(0, 100);
    partialSent = Boolean(saved.partialSent);
    leftSent = Boolean(saved.leftSent);
    furthest = Math.max(0, Math.min(last, Number(saved.furthest) || 0));
    current = Math.max(0, Math.min(last, Number(saved.step) || 0));
    // Never resume past a screen that still needs an answer.
    for (let index = 0; index < current; index += 1) {
      if (stepProblem(index)) { current = index; break; }
    }
  }

  function post(status, { beacon = false } = {}) {
    const payload = { ...formPayload(form), lead_status: status, lead_step: names[furthest] };
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(form.action, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      credentials: "same-origin",
      keepalive: true
    }).catch(() => {});
  }

  function show(index, { focus = true, direction = "forward", message } = {}) {
    const previous = current;
    current = Math.max(0, Math.min(last, index));
    furthest = Math.max(furthest, current);
    window.clearTimeout(leaveTimer);
    const animate = !reduced && focus && previous !== current;
    steps.forEach((step, stepIndex) => {
      step.classList.remove("is-entering", "is-entering-back", "is-leaving", "is-leaving-back");
      step.removeAttribute("aria-hidden");
      // The outgoing screen stays for the length of the transition, then goes.
      step.hidden = stepIndex !== current && !(animate && stepIndex === previous);
    });
    if (animate) {
      const leaving = steps[previous];
      const back = direction === "back";
      leaving.setAttribute("aria-hidden", "true");
      leaving.classList.add(back ? "is-leaving-back" : "is-leaving");
      // Restart the entrance animation on the new screen.
      void steps[current].offsetWidth;
      steps[current].classList.add(back ? "is-entering-back" : "is-entering");
      leaveTimer = window.setTimeout(() => {
        leaving.hidden = true;
        leaving.classList.remove("is-leaving", "is-leaving-back");
        leaving.removeAttribute("aria-hidden");
      }, FLOW_TRANSITION_MS);
    }
    const percent = Math.round(((current + 1) / (steps.length + 1)) * 100);
    bar.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(percent));
    const line = message ?? (current > 0 ? reward(current - 1) : "");
    affirm.textContent = line;
    affirm.hidden = !line;
    delete affirm.dataset.state;
    nav.hidden = false;
    back.hidden = current === 0;
    next.hidden = current === last;
    if (focus) {
      const input = textInput(steps[current]);
      (input || steps[current].querySelector("legend"))?.focus({ preventScroll: true });
      // Each new question starts at the same place on screen, just under the header.
      const anchor = form.closest("[id]") || form;
      const top = anchor.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) anchor.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
    save();
  }

  function advance() {
    const problem = stepProblem(current);
    if (problem) {
      affirm.textContent = problem;
      affirm.hidden = false;
      affirm.dataset.state = "prompt";
      textInput(steps[current])?.focus({ preventScroll: true });
      return;
    }
    if (current === last) return;
    const leaving = current;
    show(current + 1);
    if (phoneIndex >= 0 && leaving >= phoneIndex) {
      // First valid phone: one partial lead. After that, quiet progress updates for the same session.
      post(partialSent ? "progress" : "partial");
      partialSent = true;
      save();
    }
  }

  form.dataset.flow = "ready";
  progress.hidden = false;
  // On phones the question takes the whole screen (see .flow-portal).
  form.closest(".contact-form-column")?.classList.add("flow-portal");
  restore();
  show(current, { focus: false });
  if (window.location.hash === "#get-paid" || window.location.hash === "#solicitud") {
    // After the browser has finished its own jump to the anchor, put the cursor in the question.
    const focusFirst = () => window.setTimeout(() => textInput(steps[current])?.focus({ preventScroll: true }), 60);
    if (document.readyState === "complete") focusFirst();
    else window.addEventListener("load", focusFirst, { once: true });
  }

  steps.forEach((step, index) => {
    step.addEventListener("input", save);
    step.addEventListener("change", save);
    // A tap or click on a tile moves on by itself. Keyboard choices use Next, so arrow keys never jump ahead.
    step.addEventListener("click", (event) => {
      const input = event.target.closest("input[type='radio']");
      if (!input || event.detail === 0 || index === last || index !== current) return;
      window.setTimeout(advance, reduced ? 0 : 160);
    });
  });
  next.addEventListener("click", advance);
  // Enter in a text field moves on. Handled directly so it never depends on the browser's own
  // submit rules for forms with several fields.
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing || !event.target.matches?.("input[type='text'], input[type='tel'], input[type='email']")) return;
    if (current === last && !stepProblem(current)) return;
    event.preventDefault();
    advance();
  });
  back.addEventListener("click", () => show(current - 1, { direction: "back" }));
  // Enter moves to the next screen; only the last screen submits.
  form.addEventListener("submit", (event) => {
    if (form.dataset.flowDone === "true") return;
    const problem = stepProblem(current);
    if (current < last || problem) {
      event.preventDefault();
      event.stopImmediatePropagation();
      advance();
    }
  }, true);
  // Leaving the page part way: one last update so the shop knows how far this person got.
  window.addEventListener("pagehide", () => {
    // Only when there is something new to tell: an answer beyond the phone number.
    const answeredMore = Boolean(form.querySelector("input[name='material']:checked"));
    if (!partialSent || leftSent || form.dataset.flowDone === "true" || !answeredMore) return;
    leftSent = true;
    save();
    post("left", { beacon: true });
  });
  form.flowShowField = (field) => {
    const index = steps.indexOf(field?.closest?.("[data-flow-step]"));
    if (index >= 0 && index !== current) show(index, { focus: false, direction: "back" });
  };
}

function formPayload(form) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim() || [data.get("first_name"), data.get("last_name")].map((part) => String(part || "").trim()).filter(Boolean).join(" "),
    first_name: String(data.get("first_name") || "").trim(),
    last_name: String(data.get("last_name") || "").trim(),
    lead_status: "complete",
    business: String(data.get("business") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    email: String(data.get("email") || "").trim(),
    intent: String(data.get("intent") || "pickup").trim(),
    material: String(data.get("material") || "").trim(),
    quantity: String(data.get("quantity") || "").trim(),
    location: String(data.get("location") || "").trim(),
    frequency: String(data.get("frequency") || "unknown").trim(),
    preferred_contact: String(data.get("preferred_contact") || "phone").trim(),
    details: String(data.get("details") || "").trim(),
    pickup_date: String(data.get("pickup_date") || "").trim(),
    pickup_window: String(data.get("pickup_window") || "any").trim(),
    company_url: String(data.get("company_url") || "").trim(),
    form_started: String(data.get("form_started") || ""),
    submission_key: String(data.get("submission_key") || ""),
    locale: String(data.get("locale") || formLocale),
    turnstile_token: String(data.get("cf-turnstile-response") || ""),
    attribution: readAttribution()
  };
}

function fallbackMailto(payload, recipient) {
  const subject = formUi.subject(payload.intent);
  const values = [
    payload.name,
    payload.business || formUi.notProvided,
    payload.phone,
    payload.email,
    payload.material.replaceAll("_", " "),
    payload.quantity || formUi.notProvided,
    payload.location,
    payload.frequency.replaceAll("_", " "),
    [payload.pickup_date, payload.pickup_window === "any" ? "" : payload.pickup_window].filter(Boolean).join(" ") || formUi.notProvided
  ];
  const body = [
    ...formUi.labels.map((label, index) => `${label}: ${values[index]}`),
    "",
    payload.details
  ].join("\n");
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function showDeliveryFallback(form, message, recipient, payload) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;
  const text = document.createElement("span");
  text.textContent = `${message} `;
  const link = document.createElement("a");
  link.href = fallbackMailto(payload, recipient);
  link.textContent = formUi.emailDetails;
  status.replaceChildren(text, link);
  status.dataset.state = "error";
}

if (reviewForm) {
  prefillReviewForm(reviewForm);
  const started = reviewForm.elements.namedItem("form_started");
  const submissionKey = reviewForm.elements.namedItem("submission_key");
  if (started) started.value = String(Date.now());
  if (submissionKey) submissionKey.value = createSubmissionKey();
  initializeFormFlow(reviewForm);

  reviewForm.addEventListener("input", (event) => {
    event.target.removeAttribute?.("aria-invalid");
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const issues = validateReviewForm(form);
    if (issues.length) form.flowShowField?.(issues[0].field);
    showFormIssues(form, issues);
    if (issues.length) return;

    const button = form.querySelector("[data-submit-button]");
    const originalButtonMarkup = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.textContent = formUi.sendingButton;
    }
    form.setAttribute("aria-busy", "true");
    setFormStatus(form, formUi.sendingStatus);

    const payload = formPayload(form);
    let responseErrorMessage = "";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.fields && typeof result.fields === "object") {
          const serverIssues = Object.entries(result.fields).flatMap(([name, message]) => {
            const field = form.elements.namedItem(name);
            if (!field || typeof message !== "string") return [];
            field.setAttribute("aria-invalid", "true");
            return [{ field, message }];
          });
          if (serverIssues.length) showFormIssues(form, serverIssues);
        }
        if (result.fallback_email) {
          showDeliveryFallback(
            form,
            result.message || formUi.networkError,
            result.fallback_email,
            payload
          );
          return;
        }
        responseErrorMessage = typeof result.message === "string" && result.message
          ? result.message
          : formUi.networkError;
        throw new Error("Lead request failed");
      }

      form.reset();
      if (started) started.value = String(Date.now());
      if (submissionKey) submissionKey.value = createSubmissionKey();
      window.turnstile?.reset?.();
      showFormIssues(form, []);
      setFormStatus(form, "");
      showFormDone(form);
    } catch {
      setFormStatus(form, responseErrorMessage || formUi.networkError, "error");
    } finally {
      form.removeAttribute("aria-busy");
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButtonMarkup || formUi.submit;
      }
    }
  });

  reviewForm.noValidate = true;
  reviewForm.dataset.enhanced = "true";
}

// Get Directions opens the visitor's own maps app: Apple Maps on iPhone, iPad and Mac, a geo: link on
// Android, and Google Maps (the link already in the page) everywhere else.
function directionsHref(link) {
  const destination = link.dataset.destination || "";
  const place = link.dataset.place || "";
  if (!destination) return "";
  const agent = navigator.userAgent || "";
  const apple = /iPhone|iPad|iPod|Macintosh/.test(agent);
  if (apple) return `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&q=${encodeURIComponent(place || destination)}`;
  if (/Android/.test(agent)) return `geo:0,0?q=${encodeURIComponent(`${place ? `${place}, ` : ""}${destination}`)}`;
  return "";
}

document.querySelectorAll("[data-directions]").forEach((link) => {
  const href = directionsHref(link);
  if (!href) return;
  link.href = href;
  if (href.startsWith("geo:")) link.removeAttribute("target");
});

// A pickup call to action on the page that already holds the form scrolls to it instead of reloading.
document.addEventListener("click", (event) => {
  const link = event.target.closest?.("a[href*='#']");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  let url;
  try { url = new URL(link.href, window.location.href); } catch { return; }
  const samePath = url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");
  if (!samePath || url.hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target || !target.querySelector("[data-review-form]")) return;
  event.preventDefault();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", url.hash);
  const material = url.searchParams.get("material");
  const field = target.querySelector("select[name='material']");
  if (material && field && Array.from(field.options).some((option) => option.value === material)) field.value = material;
});
