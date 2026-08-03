const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navScrim = document.querySelector("[data-nav-scrim]");
const navBackground = Array.from(document.querySelectorAll("main, .material-guide, .mobile-actions, .footer"));
const navMedia = window.matchMedia("(min-width: 901px)");
const spanish = document.documentElement.lang.startsWith("es");
let navReturnFocus = null;

function navFocusables() {
  return [toggle, ...(nav?.querySelectorAll("a[href], button:not([disabled])") || [])].filter(Boolean);
}

function setNavBackgroundInert(inert) {
  navBackground.forEach((element) => {
    element.inert = inert;
  });
}

function closeNav(restoreFocus = false) {
  const wasOpen = document.body.classList.contains("nav-open");
  document.body.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", spanish ? "Abrir navegación" : "Open navigation");
  setNavBackgroundInert(false);
  if (wasOpen && restoreFocus) (navReturnFocus || toggle)?.focus?.();
  navReturnFocus = null;
}

function openNav() {
  if (!toggle || !nav) return;
  navReturnFocus = document.activeElement;
  document.body.classList.add("nav-open");
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", spanish ? "Cerrar navegación" : "Close navigation");
  setNavBackgroundInert(true);
  window.requestAnimationFrame(() => nav.querySelector("a[href]")?.focus());
}

toggle?.addEventListener("click", () => {
  if (document.body.classList.contains("nav-open")) closeNav(true);
  else openNav();
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeNav(false)));
navScrim?.addEventListener("click", () => closeNav(true));
document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("nav-open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeNav(true);
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
navMedia.addEventListener?.("change", (event) => {
  if (event.matches) closeNav(false);
});

const siteHeader = document.querySelector("[data-site-header]");
const actionDock = document.querySelector(".mobile-actions");
let chromeTicking = false;

function updateChrome() {
  chromeTicking = false;
  const offset = window.scrollY;
  siteHeader?.setAttribute("data-stuck", offset > 12 ? "true" : "false");
  if (!actionDock) return;
  const atFoot = window.innerHeight + offset >= document.body.scrollHeight - 140;
  actionDock.setAttribute("data-visible", offset > 320 && !atFoot ? "true" : "false");
}

window.addEventListener("scroll", () => {
  if (chromeTicking) return;
  chromeTicking = true;
  window.requestAnimationFrame(updateChrome);
}, { passive: true });
window.addEventListener("resize", updateChrome, { passive: true });
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

function prefillReviewForm(form) {
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
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
  return field.labels?.[0]?.textContent?.replace(/Required/gi, "").trim() || field.name;
}

function validateReviewForm(form) {
  const issues = [];
  const fields = Array.from(form.elements).filter((field) => field.name && !field.disabled && field.type !== "hidden");

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    if (field.name === "company_url") return;
    if (!field.checkValidity()) {
      const message = field.validity.valueMissing
        ? `${fieldLabel(field)} is required.`
        : field.validity.typeMismatch
          ? `Enter a valid ${fieldLabel(field).toLowerCase()}.`
          : field.validationMessage;
      issues.push({ field, message });
      field.setAttribute("aria-invalid", "true");
    }
  });

  const details = form.elements.namedItem("details");
  if (details && details.value.trim().length > 0 && details.value.trim().length < 20 && !issues.some((issue) => issue.field === details)) {
    details.setAttribute("aria-invalid", "true");
    issues.push({ field: details, message: "Add a little more detail so the material can be reviewed." });
  }

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
  heading.textContent = "Please review the following:";
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
    company_url: String(data.get("company_url") || "").trim(),
    form_started: String(data.get("form_started") || ""),
    submission_key: String(data.get("submission_key") || ""),
    turnstile_token: String(data.get("cf-turnstile-response") || ""),
    attribution: readAttribution()
  };
}

function fallbackMailto(payload, recipient) {
  const subject = `AG Refining ${payload.intent === "quote" ? "quote" : "pickup"} request`;
  const body = [
    `Name: ${payload.name}`,
    `Business: ${payload.business || "Not provided"}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Material: ${payload.material.replaceAll("_", " ")}`,
    `Amount: ${payload.quantity || "Not provided"}`,
    `Location: ${payload.location}`,
    `Frequency: ${payload.frequency.replaceAll("_", " ")}`,
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
  link.textContent = "Email these details";
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
      button.textContent = "Sending request...";
    }
    form.setAttribute("aria-busy", "true");
    setFormStatus(form, "Sending your material review request.");

    const payload = formPayload(form);
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
            result.message || "The request could not be sent.",
            result.fallback_email,
            payload
          );
          return;
        }
        throw new Error(result.message || "The request could not be sent.");
      }

      form.reset();
      if (started) started.value = String(Date.now());
      if (submissionKey) submissionKey.value = createSubmissionKey();
      window.turnstile?.reset?.();
      showFormIssues(form, []);
      setFormStatus(form, "Your request was received. AG Refining will review the details and follow up using your preferred contact method.", "success");
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "The request could not be sent. Please call (281) 898-2719 or try again.";
      setFormStatus(form, message, "error");
    } finally {
      form.removeAttribute("aria-busy");
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButtonMarkup || "Request a material review";
      }
    }
  });
}
