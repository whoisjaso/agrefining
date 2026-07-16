const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

function closeNav() {
  document.body.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
}

toggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeNav(); });

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.addEventListener("click", (event) => {
  if (prefersReducedMotion || document.startViewTransition) return;
  const link = event.target.closest("a[href]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = new URL(link.href, window.location.href);
  if (target.origin !== window.location.origin || target.hash || link.target || link.hasAttribute("download")) return;
  if (target.pathname === window.location.pathname) return;
  event.preventDefault();
  document.body.classList.add("page-leaving");
  window.setTimeout(() => { window.location.href = target.href; }, 150);
});

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 })
  : null;

document.querySelectorAll("[data-reveal]").forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add("is-visible");
});

const questionTrigger = document.querySelector("[data-question-trigger]");
const questionPanel = document.querySelector("[data-question-panel]");
const questionClose = document.querySelector("[data-question-close]");

function setQuestionPanel(open) {
  if (!questionTrigger || !questionPanel) return;
  questionTrigger.setAttribute("aria-expanded", String(open));
  questionPanel.hidden = !open;
  if (open) questionPanel.querySelector("a")?.focus();
  else questionTrigger.focus();
}

questionTrigger?.addEventListener("click", () => setQuestionPanel(questionTrigger.getAttribute("aria-expanded") !== "true"));
questionClose?.addEventListener("click", () => setQuestionPanel(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && questionTrigger?.getAttribute("aria-expanded") === "true") setQuestionPanel(false);
});

document.querySelector("[data-review-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lines = [
    "AG Refining material review request",
    "",
    `Name: ${data.get("name") || ""}`,
    `Business: ${data.get("business") || ""}`,
    `Phone: ${data.get("phone") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `Material: ${data.get("material") || ""}`,
    `Approximate quantity: ${data.get("quantity") || ""}`,
    `Details: ${data.get("details") || ""}`
  ];
  window.location.href = `mailto:Dorothy@agrefining.com?subject=${encodeURIComponent("Material review request")}&body=${encodeURIComponent(lines.join("\n"))}`;
});
