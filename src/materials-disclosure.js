export class MaterialsDisclosure {
  constructor({
    root,
    button,
    panel,
    documentTarget = document,
    resetTarget = window,
    hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)"),
    breakpointQuery = window.matchMedia("(min-width: 901px)"),
    hoverCloseDelay = 180
  }) {
    this.root = root;
    this.button = button;
    this.panel = panel;
    this.documentTarget = documentTarget;
    this.resetTarget = resetTarget;
    this.hoverQuery = hoverQuery;
    this.breakpointQuery = breakpointQuery;
    this.hoverCloseDelay = hoverCloseDelay;
    this.hoverCloseTimer = 0;
    this.open = false;
    this.openedByHover = false;
  }

  start() {
    this.root.dataset.materialsEnhanced = "true";
    this.setOpen(false);

    this.button.addEventListener("click", () => {
      const keepOpen = this.open && this.openedByHover;
      this.openedByHover = false;
      this.setOpen(keepOpen || !this.open);
    });
    this.root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !this.open) return;
      event.preventDefault();
      event.stopPropagation();
      this.setOpen(false, { returnFocus: true });
    });
    this.documentTarget.addEventListener("pointerdown", (event) => {
      if (this.open && !this.root.contains(event.target)) this.setOpen(false);
    });
    this.root.addEventListener("focusout", (event) => {
      if (this.open && !this.root.contains(event.relatedTarget)) this.setOpen(false);
    });
    this.root.addEventListener("pointerenter", () => {
      if (!this.hoverQuery.matches) return;
      this.clearHoverClose();
      if (!this.open) this.openedByHover = true;
      this.setOpen(true);
    });
    this.root.addEventListener("pointerleave", () => {
      this.openedByHover = false;
      if (this.hoverQuery.matches && !this.root.contains(this.documentTarget.activeElement)) {
        this.hoverCloseTimer = setTimeout(() => this.setOpen(false), this.hoverCloseDelay);
      }
    });
    this.panel.addEventListener("pointerenter", () => this.clearHoverClose());

    const reset = () => this.setOpen(false);
    this.hoverQuery.addEventListener?.("change", reset);
    this.breakpointQuery.addEventListener?.("change", reset);
    this.resetTarget.addEventListener("materials-disclosure-reset", reset);
  }

  setOpen(open, { returnFocus = false } = {}) {
    this.clearHoverClose();
    this.open = Boolean(open);
    if (!this.open) this.openedByHover = false;
    this.button.setAttribute("aria-expanded", String(this.open));
    this.panel.hidden = !this.open;
    this.panel.inert = !this.open;
    if (this.open) this.panel.removeAttribute("inert");
    else this.panel.setAttribute("inert", "");
    if (!this.open && returnFocus) this.button.focus();
  }

  clearHoverClose() {
    if (!this.hoverCloseTimer) return;
    clearTimeout(this.hoverCloseTimer);
    this.hoverCloseTimer = 0;
  }
}

const root = typeof document === "undefined" ? null : document.querySelector("[data-materials-disclosure]");
const button = root?.querySelector("[data-materials-disclosure-toggle]");
const panel = root?.querySelector("[data-materials-panel]");

if (root && button && panel) {
  new MaterialsDisclosure({ root, button, panel }).start();
}
