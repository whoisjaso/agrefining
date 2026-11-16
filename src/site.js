const siteHeader = document.querySelector("[data-site-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navScrim = document.querySelector("[data-nav-scrim]");
const toggleLabel = toggle?.querySelector("[data-nav-toggle-label]");
const navBackground = Array.from(document.querySelectorAll("main, .pay-pill-dock, .footer"));
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
    : (spanish ? "Abrir navegación" : "Open navigation"));
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

const footer = document.querySelector(".footer");
let chromeTicking = false;

function updateChrome() {
  chromeTicking = false;
  siteHeader?.setAttribute("data-stuck", window.scrollY > 12 ? "true" : "false");
}

window.addEventListener("scroll", () => {
  if (chromeTicking) return;
  chromeTicking = true;
  window.requestAnimationFrame(updateChrome);
}, { passive: true });
updateChrome();

// Floating "Get Paid" pill. Hidden while the hero CTA, any form, the closing CTA or the footer is on screen,
// while the menu is open and while a field has focus (keyboard up), so it never covers content or a submit button.
const payPill = document.querySelector("[data-pay-pill]");
if (payPill) {
  const heroCta = document.querySelector("[data-hero-cta]") || document.querySelector("main > section:first-of-type .button-primary");
  const hideZones = [heroCta, footer, ...document.querySelectorAll("main form, [data-review-form], .conversion-band, [data-hide-pill]")].filter(Boolean);
  const onScreen = new Set();
  let fieldFocused = false;

  const updatePill = () => {
    const navOpen = document.body.classList.contains("nav-open");
    const visible = !navOpen && !fieldFocused && onScreen.size === 0;
    payPill.dataset.visible = visible ? "true" : "false";
    payPill.setAttribute("aria-hidden", visible ? "false" : "true");
    payPill.inert = !visible;
    if (visible) payPill.removeAttribute("inert");
    else payPill.setAttribute("inert", "");
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      });
      updatePill();
    });
    hideZones.forEach((zone) => observer.observe(zone));
  } else {
    updatePill();
  }

  const isField = (target) => target instanceof HTMLElement && target.matches("input, select, textarea");
  document.addEventListener("focusin", (event) => {
    if (!isField(event.target)) return;
    fieldFocused = true;
    updatePill();
  });
  document.addEventListener("focusout", (event) => {
    if (!isField(event.target)) return;
    fieldFocused = false;
    updatePill();
  });
  new MutationObserver(updatePill).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // The outline animation rests while the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("pill-paused", document.hidden);
  });

  // On the page that holds the form, the pill scrolls to it and focuses the first field.
  const pillLink = payPill.querySelector(".pay-pill");
  pillLink?.addEventListener("click", (event) => {
    const target = new URL(pillLink.href, window.location.href);
    const form = document.querySelector("[data-review-form]");
    if (!form || target.pathname !== window.location.pathname) return;
    event.preventDefault();
    form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    form.querySelector("input:not([type=hidden]), select, textarea")?.focus({ preventScroll: true });
  });
}

const reviewForm = document.querySelector("[data-review-form]");
const formLocale = reviewForm?.dataset.locale === "es" || spanish ? "es" : "en";
const formUi = {
  en: {
    errorHeading: "Please review the following:",
    required: (label) => `${label} is required.`,
    invalidEmail: "Enter a valid email.",
    invalidField: (label) => `Enter a valid ${label.toLowerCase()}.`,
    shortDetails: "Add a little more detail so the material can be reviewed.",
    sendingStatus: "Sending your details.",
    sendingButton: "Sending...",
    success: "Got It. We'll Call You Soon. Want to talk now? Call (281) 898-2719.",
    networkError: "Something went wrong on our end. Please call (281) 898-2719 and we'll take care of you.",
    call: "Call (281) 898-2719",
    submit: "Send My Details"
  },
  es: {
    errorHeading: "Revise lo siguiente:",
    required: (label) => `${label} es obligatorio.`,
    invalidEmail: "Escriba un correo electrónico válido.",
    invalidField: (label) => `Escriba un ${label.toLowerCase()} válido.`,
    shortDetails: "Añada un poco más de información para revisar el material.",
    sendingButton: "Enviando...",
    sendingStatus: "Enviando sus datos.",
    success: "Listo. Le llamaremos pronto. ¿Prefiere hablar ahora? Llame al (281) 898-2719.",
    networkError: "Algo falló de nuestro lado. Llame al (281) 898-2719 y le atendemos.",
    call: "Llame al (281) 898-2719",
    submit: "Enviar Mis Datos"
  }
}[formLocale];

function prefillReviewForm(form) {
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const pickupDate = form.querySelector("[data-pickup-date]");
  if (pickupDate) {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    pickupDate.min = local;
  }
  ["intent", "material", "quantity", "frequency"].forEach((name) => {
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

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    if (field.name === "company_url") return;
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

function formPayload(form) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
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

// Delivery failed: the server logged the lead; the visitor gets a big call button, never a send-it-yourself link.
function showCallFallback(form, message) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;
  const text = document.createElement("span");
  text.textContent = `${message} `;
  const link = document.createElement("a");
  link.className = "button button-primary form-call";
  link.href = "tel:+12818982719";
  link.textContent = formUi.call;
  status.replaceChildren(text, link);
  status.dataset.state = "error";
}

if (reviewForm) {
  prefillReviewForm(reviewForm);
  const started = reviewForm.elements.namedItem("form_started");
  const submissionKey = reviewForm.elements.namedItem("submission_key");
  if (started) started.value = String(Date.now());
  if (submissionKey) submissionKey.value = createSubmissionKey();

  reviewForm.addEventListener("input", (event) => {
    event.target.removeAttribute?.("aria-invalid");
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const issues = validateReviewForm(form);
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
        if (response.status >= 500) {
          showCallFallback(form, result.message || formUi.networkError);
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
      setFormStatus(form, formUi.success, "success");
    } catch {
      if (responseErrorMessage) setFormStatus(form, responseErrorMessage, "error");
      else showCallFallback(form, formUi.networkError);
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
