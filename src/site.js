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
