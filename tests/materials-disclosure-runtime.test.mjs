import test from "node:test";
import assert from "node:assert/strict";

let MaterialsDisclosure;
try {
  ({ MaterialsDisclosure } = await import("../src/materials-disclosure.js"));
} catch {
  MaterialsDisclosure = undefined;
}

class FakeDocument extends EventTarget {
  activeElement = null;
}

class FakeElement extends EventTarget {
  constructor(ownerDocument) {
    super();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
    this.hidden = false;
    this.inert = false;
    this.parentElement = null;
    this.focusCount = 0;
  }

  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }

  contains(candidate) {
    for (let current = candidate; current; current = current.parentElement) {
      if (current === this) return true;
    }
    return false;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  focus() {
    this.ownerDocument.activeElement = this;
    this.focusCount += 1;
  }
}

class FakeMediaQuery extends EventTarget {
  constructor(matches) {
    super();
    this.matches = matches;
  }

  setMatches(matches) {
    this.matches = matches;
    this.dispatchEvent(new Event("change"));
  }
}

function browserEvent(type, { target, relatedTarget, key } = {}) {
  const event = new Event(type, { cancelable: true });
  if (target) Object.defineProperty(event, "target", { value: target });
  if (relatedTarget !== undefined) Object.defineProperty(event, "relatedTarget", { value: relatedTarget });
  if (key !== undefined) Object.defineProperty(event, "key", { value: key });
  return event;
}

function setup({ finePointer = false, desktop = true } = {}) {
  assert.equal(typeof MaterialsDisclosure, "function", "src/materials-disclosure.js must export MaterialsDisclosure");
  const documentTarget = new FakeDocument();
  const resetTarget = new EventTarget();
  const hoverQuery = new FakeMediaQuery(finePointer);
  const breakpointQuery = new FakeMediaQuery(desktop);
  const root = new FakeElement(documentTarget);
  const button = new FakeElement(documentTarget);
  const panel = new FakeElement(documentTarget);
  const panelLink = new FakeElement(documentTarget);
  const directLink = new FakeElement(documentTarget);
  const outside = new FakeElement(documentTarget);
  panel.append(panelLink);
  root.append(directLink, button, panel);

  const disclosure = new MaterialsDisclosure({
    root,
    button,
    panel,
    documentTarget,
    resetTarget,
    hoverQuery,
    breakpointQuery
  });
  disclosure.start();
  return { disclosure, documentTarget, resetTarget, hoverQuery, breakpointQuery, root, button, panel, panelLink, directLink, outside };
}

function click(target) {
  target.dispatchEvent(browserEvent("click", { target }));
}

test("start progressively enhances the fallback into a closed, inert disclosure", () => {
  const { root, button, panel, panelLink } = setup();
  assert.equal(root.dataset.materialsEnhanced, "true");
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(panel.hidden, true);
  assert.equal(panel.inert, true);
  assert.equal(panel.hasAttribute("inert"), true);
  assert.equal(panelLink.getAttribute("tabindex"), null, "inert ownership belongs on the panel, not every link");
});

test("button clicks deterministically toggle expanded, hidden, and inert state", () => {
  const { button, panel } = setup();
  click(button);
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(panel.hidden, false);
  assert.equal(panel.inert, false);
  assert.equal(panel.hasAttribute("inert"), false);
  click(button);
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(panel.hidden, true);
  assert.equal(panel.inert, true);
});

test("the first Escape closes the nested panel and returns focus", () => {
  const { root, button, panel } = setup();
  click(button);
  const escape = browserEvent("keydown", { target: panel, key: "Escape" });
  root.dispatchEvent(escape);
  assert.equal(panel.hidden, true);
  assert.equal(button.focusCount, 1);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(escape.cancelBubble, true);
});

test("a second Escape is unconsumed so the outer mobile sheet can close", () => {
  const { root, button } = setup();
  click(button);
  root.dispatchEvent(browserEvent("keydown", { target: button, key: "Escape" }));
  const secondEscape = browserEvent("keydown", { target: button, key: "Escape" });
  root.dispatchEvent(secondEscape);
  assert.equal(secondEscape.defaultPrevented, false);
  assert.equal(secondEscape.cancelBubble, false);
});

test("an outside pointer press closes an open disclosure", () => {
  const { documentTarget, button, panel, outside } = setup();
  click(button);
  documentTarget.dispatchEvent(browserEvent("pointerdown", { target: outside }));
  assert.equal(panel.hidden, true);
});

test("fine-pointer hover opens and closes unless focus remains within", () => {
  const { root, panel, panelLink, outside } = setup({ finePointer: true });
  root.dispatchEvent(browserEvent("pointerenter", { target: root }));
  assert.equal(panel.hidden, false);
  panelLink.focus();
  root.dispatchEvent(browserEvent("pointerleave", { target: root }));
  assert.equal(panel.hidden, false, "hover leave must not hide focused panel content");
  root.dispatchEvent(browserEvent("focusout", { target: panelLink, relatedTarget: outside }));
  assert.equal(panel.hidden, true);
});

// Mutation killed: a hover-opened panel is immediately toggled shut by the same pointer click.
test("a first fine-pointer click keeps the disclosure open after pointer entry", () => {
  const { root, button, panel } = setup({ finePointer: true });
  root.dispatchEvent(browserEvent("pointerenter", { target: root }));
  assert.equal(panel.hidden, false, "pointer entry establishes the visible hover state");

  click(button);
  assert.equal(panel.hidden, false, "the first physical click must not collapse the hover-opened panel");
  click(button);
  assert.equal(panel.hidden, true, "a subsequent click still toggles the disclosure closed");
});

test("coarse pointers do not open the disclosure on pointer entry", () => {
  const { root, panel } = setup({ finePointer: false });
  root.dispatchEvent(browserEvent("pointerenter", { target: root }));
  assert.equal(panel.hidden, true);
});

test("focus leaving the wrapper closes while focus movement inside stays open", () => {
  const { root, button, panel, panelLink, directLink, outside } = setup();
  click(button);
  root.dispatchEvent(browserEvent("focusout", { target: button, relatedTarget: panelLink }));
  assert.equal(panel.hidden, false);
  root.dispatchEvent(browserEvent("focusout", { target: panelLink, relatedTarget: directLink }));
  assert.equal(panel.hidden, false);
  root.dispatchEvent(browserEvent("focusout", { target: directLink, relatedTarget: outside }));
  assert.equal(panel.hidden, true);
});

test("hover and breakpoint changes reset any open nested state", () => {
  const { button, panel, hoverQuery, breakpointQuery } = setup({ finePointer: true });
  click(button);
  hoverQuery.setMatches(false);
  assert.equal(panel.hidden, true);
  click(button);
  breakpointQuery.setMatches(false);
  assert.equal(panel.hidden, true);
});

test("the outer mobile sheet reset event closes the nested disclosure", () => {
  const { button, panel, resetTarget } = setup();
  click(button);
  resetTarget.dispatchEvent(new Event("materials-disclosure-reset"));
  assert.equal(panel.hidden, true);
});
