(() => {
  const root = document.documentElement;
  const header = document.querySelector("[data-site-header]");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const threshold = 96;
  let frame = 0;

  clearTimeout(window.__agHeaderFailOpen);

  if (!header || reducedMotion?.matches) {
    root.classList.remove("home-header-pending", "home-header-ready", "home-header-revealed");
    return;
  }

  const update = () => {
    frame = 0;
    root.classList.toggle("home-header-revealed", window.scrollY >= threshold);
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const revealForInteraction = () => root.classList.add("home-header-revealed");
  const cleanup = () => {
    window.removeEventListener("scroll", requestUpdate);
    header.removeEventListener("focusin", revealForInteraction);
    if (frame) window.cancelAnimationFrame(frame);
  };

  root.classList.add("home-header-ready");
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  header.addEventListener("focusin", revealForInteraction);
  window.addEventListener("pagehide", cleanup, { once: true });
})();
