const root = document.documentElement;
const loader = document.querySelector("[data-home-loader]");
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
let finished = false;

function setLoaderState(state) {
  root.setAttribute("data-loader-state", state);
  if (!loader) return;
  loader.setAttribute("data-loader-state", state);
  const ready = state === "ready";
  loader.setAttribute("aria-hidden", String(ready));
  loader.inert = ready;
  if (ready) loader.setAttribute("inert", "");
  else loader.removeAttribute("inert");
}

function finishLoader() {
  if (finished) return;
  finished = true;
  clearTimeout(window.__agLoaderFailOpen);
  setLoaderState("ready");
}

if (!loader || reducedMotion?.matches || root.getAttribute("data-loader-state") === "ready") {
  finishLoader();
} else {
  setLoaderState("loading");
  if (document.readyState === "complete") {
    window.requestAnimationFrame(finishLoader);
  } else {
    window.addEventListener("load", () => window.requestAnimationFrame(finishLoader), { once: true });
  }
  window.addEventListener("pagehide", finishLoader, { once: true });
}
