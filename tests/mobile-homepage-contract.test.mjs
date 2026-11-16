import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const home = readFileSync(join(dist, "index.html"), "utf8");
const contact = readFileSync(join(dist, "contact", "index.html"), "utf8");
const spanish = readFileSync(join(dist, "espanol", "index.html"), "utf8");
const css = readFileSync(join(dist, "style.css"), "utf8");
const site = readFileSync(join(dist, "site.js"), "utf8");

function cssRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`^${escaped}\\s*\\{([^}]*)\\}`, "m"))?.[1] || "";
}

function payPill(html) {
  return html.match(/<div class="pay-pill-dock"[\s\S]*?<\/div>/)?.[0] || "";
}

test("one floating Get Paid pill per page, localized, with a round call companion", () => {
  const englishPill = payPill(home);
  const spanishPill = payPill(spanish);
  assert.match(englishPill, /data-visible="false" aria-hidden="true" inert/, "hidden until the hero CTA scrolls away");
  assert.match(englishPill, /<a class="pay-pill" href="\/contact\?intent=pickup#sell"[^>]*>Get Paid<svg/);
  assert.match(englishPill, /<a class="pay-pill-call" href="tel:\+12818982719" aria-label="Call AG Refining \(281\) 898-2719">/);
  assert.match(spanishPill, /<a class="pay-pill" href="#solicitud"[^>]*>Reciba Su Pago<svg/);
  assert.match(contact, /id="sell"/, "the pill target exists on the contact page");
  for (const html of [home, contact, spanish]) assert.equal((html.match(/class="pay-pill-dock"/g) || []).length, 1);
  assert.ok(home.indexOf('class="pay-pill-dock"') > home.indexOf("</main>"), "the pill sits after the main content in the tab order");
});

test("the pill is centered, safe-area aware, turns at a steady speed and never covers content", () => {
  const dock = cssRule(".pay-pill-dock");
  assert.match(dock, /position:\s*fixed/);
  assert.match(dock, /left:\s*50%/);
  assert.match(dock, /transform:\s*translate\(-50%, 12px\)/);
  assert.match(dock, /bottom:\s*calc\(16px \+ var\(--safe-bottom\)\)/);
  assert.match(css, /\.pay-pill-dock\[data-visible="true"\]\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translate\(-50%, 0\)/s);
  assert.match(css, /\.pay-pill::before\s*\{[^}]*animation:\s*pill-turn 3\.5s linear infinite/s);
  assert.match(css, /@keyframes pill-turn\s*\{\s*to\s*\{\s*--pill-angle:\s*360deg/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.pay-pill::before,\s*\.pay-pill::after\s*\{\s*animation:\s*none/);
  assert.match(css, /\.pill-paused \.pay-pill::before/);
  assert.match(css, /\.has-pay-pill \.footer\s*\{[^}]*padding-bottom:\s*calc\(96px/);
  assert.doesNotMatch(cssRule(".pay-pill"), /scale|bounce/);
  assert.match(site, /document\.body\.classList\.contains\("nav-open"\)/);
  assert.match(site, /main form, \[data-review-form\], \.conversion-band, \[data-hide-pill\]/);
  assert.match(site, /payPill\.inert = !visible/);
  assert.match(site, /visibilitychange/);
  assert.match(home, /<section class="conversion-band" data-hide-pill>/);
});

test("the hero fills the initial viewport without reserving header height", () => {
  for (const selector of [".atelier-hero", ".hero-commercial-grid"]) {
    const rule = cssRule(selector);
    assert.match(rule, /min-height:\s*max\(44rem,\s*100svh\)/, `${selector} must cover the full small viewport`);
    assert.doesNotMatch(rule, /100svh\s*-\s*var\(--header-height\)/);
  }
  assert.doesNotMatch(css, /(?:\.atelier-hero|\.hero-commercial-grid)\s*\{[^}]*calc\(100svh\s*-\s*var\(--header-height\)\)/s);
});

test("enhanced mobile navigation is a compact top-right panel rather than a bottom sheet", () => {
  const panel = [...css.matchAll(/^\s*\.site-header\[data-nav-enhanced="true"\]\s+\.nav-links\s*\{([^}]*)\}/gm)]
    .map((match) => match[1])
    .find((rule) => /top:\s*calc\(100%/.test(rule)) || "";
  assert.match(panel, /top:\s*calc\(100%\s*-\s*0\.35rem\)/);
  assert.match(panel, /right:\s*var\(--gutter\)/);
  assert.match(panel, /bottom:\s*auto/);
  assert.match(panel, /left:\s*auto/);
  assert.match(panel, /width:\s*min\(22rem,\s*calc\(100vw\s*-\s*\(2 \* var\(--gutter\)\)\)\)/);
  assert.match(panel, /transform-origin:\s*top right/);
  assert.doesNotMatch(panel, /width:\s*100(?:vw|%)/);
  assert.doesNotMatch(panel, /max-height:\s*(?:100|[89][0-9])vh/);
  assert.doesNotMatch(panel, /translateY\(105%\)/);
});

test("the mobile navigation scrim stays transparent and unfiltered", () => {
  const scrimRules = [...css.matchAll(/\.site-header\[data-nav-enhanced="true"\]\s+\.nav-scrim\s*\{([^}]*)\}/g)].map((match) => match[1]).join("\n");
  assert.match(scrimRules, /background:\s*transparent/);
  assert.doesNotMatch(scrimRules, /(?:backdrop-)?filter\s*:/);
});

test("the intro loader is gone: the homepage paints immediately", () => {
  assert.doesNotMatch(home, /data-home-loader|home-loader\.js|loaderState|Loading AG Refining/);
  assert.doesNotMatch(css, /\.home-loader/);
});

test("homepage keeps a cream-dominant editorial rhythm with blue carried through key bands", () => {
  assert.match(home, /<meta name="theme-color" content="#102a43">/);
  assert.match(home, /<html lang="en" class="home-document">/);
  assert.doesNotMatch(contact, /class="home-document"/);
  assert.match(css, /\.home-document,\s*\.home-page\s*\{[^}]*background:\s*#102a43/s);
  assert.match(css, /\.home-page\s+\.site-header,\s*\.home-page\s+\.site-header\[data-stuck="true"\]\s*\{[^}]*background:\s*#faf8f2/s);
  for (const selector of [
    ".home-page .assay-process",
    ".home-page .service-area-section"
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\s*\\{[^}]*background:\\s*#102a43`, "s"), `${selector} must carry the homepage blue`);
  }
  for (const selector of [
    ".home-page main",
    ".home-page .hero-intake-section",
    ".home-page .answer-home",
    ".home-page .material-editorial",
    ".home-page .industry-index",
    ".home-page .provenance-story",
    ".home-page .location-section",
    ".home-page .faq-section"
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\s*\\{[^}]*background:\\s*var\\(--(?:canvas|paper)\\)`, "s"), `${selector} must restore the cream editorial field`);
  }
});

test("the header is always visible so older visitors find the menu right away", () => {
  assert.doesNotMatch(home, /home-header-pending|home-header-reveal\.js/);
  assert.doesNotMatch(css, /\.home-header-pending/);
});

test("the cinematic layers remain unfiltered behind a materially lighter overlay", () => {
  const cinematicRules = [...css.matchAll(/(?:\.cinematic-hero-(?:media|poster|video|overlay)[^{]*)\{([^}]*)\}/g)].map((match) => match[1]).join("\n");
  assert.doesNotMatch(cinematicRules, /(?:backdrop-)?filter\s*:/);
  assert.match(css, /\.cinematic-hero-overlay\s*\{[\s\S]*?rgba\(3, 22, 36, 0\.58\) 0%[\s\S]*?rgba\(3, 22, 36, 0\.48\) 26%[\s\S]*?rgba\(3, 22, 36, 0\.32\) 44%/);
  assert.doesNotMatch(css, /\.cinematic-hero-overlay\s*\{[\s\S]*?rgba\(3, 22, 36, 0\.98\)/);
});
