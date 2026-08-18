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

function mobileDock(html) {
  return html.match(/<nav class="mobile-actions"[\s\S]*?<\/nav>/)?.[0] || "";
}

test("the mobile dock is one localized pickup link with no competing call action", () => {
  const englishDock = mobileDock(home);
  const spanishDock = mobileDock(spanish);
  assert.equal((englishDock.match(/<a\b/g) || []).length, 1);
  assert.match(englishDock, /href="\/contact\?intent=pickup"[^>]*>Schedule a Free Pickup/);
  assert.doesNotMatch(englishDock, /tel:|>Call</);
  assert.equal((spanishDock.match(/<a\b/g) || []).length, 1);
  assert.match(spanishDock, /href="#solicitud"[^>]*>Programar Una Recogida Gratis/);
  assert.doesNotMatch(spanishDock, /tel:|>Llamar</);
});

test("the mobile dock is safe-area aware and suppressed by navigation and the footer", () => {
  const dockRule = cssRule(".mobile-actions");
  assert.match(dockRule, /bottom:\s*calc\(0\.65rem \+ var\(--safe-bottom\)\)/);
  assert.match(dockRule, /left:\s*calc\(0\.65rem \+ var\(--safe-left\)\)/);
  assert.match(dockRule, /right:\s*calc\(0\.65rem \+ var\(--safe-right\)\)/);
  assert.match(css, /\.mobile-actions\s*\{[\s\S]*?transform:\s*translateY\(calc\(100% \+ 1\.5rem\)\)/);
  assert.match(css, /\.mobile-actions\[data-visible="true"\]\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translateY\(0\)/s);
  assert.match(css, /\.nav-open\s+\.mobile-actions\s*\{[^}]*opacity:\s*0;[^}]*pointer-events:\s*none/s);
  assert.match(site, /document\.body\.classList\.contains\("nav-open"\)/);
  assert.match(site, /footer\.getBoundingClientRect\(\)\.top/);
  assert.match(site, /!navMedia\.matches/);
  assert.match(site, /actionDock\.inert\s*=\s*!visible/);
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

test("the homepage loader is semantic, homepage-only, and fails open after 1.2 seconds", () => {
  assert.match(home, /<div class="home-loader" data-home-loader data-loader-state="loading" role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(home, /<span class="home-loader-assay" data-loader-assay aria-hidden="true">\s*<span class="home-loader-symbol" data-loader-symbol>Ag<\/span>\s*<span class="home-loader-atomic-number" data-loader-atomic-number>47<\/span>\s*<span class="home-loader-purity" data-loader-purity>99\.9<\/span>\s*<\/span>/);
  assert.match(home, /<span class="visually-hidden">Loading AG Refining<\/span>/);
  assert.match(home, /document\.documentElement\.dataset\.loaderState\s*=\s*"loading"/);
  assert.match(home, /__agLoaderFailOpen\s*=\s*setTimeout\([^]*?,\s*1200\)/);
  assert.match(home, /<script type="module" src="\/home-loader\.js\?v=20260813-loader"><\/script>/);
  assert.doesNotMatch(spanish, /data-home-loader|home-loader\.js|data-loader-state/);

  const loader = readFileSync(join(dist, "home-loader.js"), "utf8");
  assert.match(loader, /data-loader-state/);
  assert.match(loader, /prefers-reduced-motion:\s*reduce/);
  assert.match(loader, /clearTimeout\(window\.__agLoaderFailOpen\)/);

  const baseLoaderRule = cssRule(".home-loader");
  assert.match(baseLoaderRule, /display:\s*none/, "without JavaScript the loader must not cover the homepage");
  assert.match(css, /html\[data-loader-state="loading"\]\s+\.home-loader\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /html\[data-loader-state="ready"\]\s+\.home-loader\s*\{[^}]*opacity:\s*0;[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.home-loader-symbol\s*\{[^}]*animation:/s);
  assert.match(css, /\.home-loader-atomic-number\s*\{[^}]*animation:/s);
  assert.match(css, /\.home-loader-purity\s*\{[^}]*animation:/s);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[^]*?\.home-loader\s*\{[^}]*display:\s*none/s);
});

test("homepage chrome and every major storytelling band carry the blue system", () => {
  assert.match(home, /<meta name="theme-color" content="#102a43">/);
  assert.match(home, /<html lang="en" class="home-document">/);
  assert.doesNotMatch(contact, /class="home-document"/);
  assert.match(css, /\.home-document,\s*\.home-page\s*\{[^}]*background:\s*#102a43/s);
  assert.match(css, /\.home-page\s+\.site-header,\s*\.home-page\s+\.site-header\[data-stuck="true"\]\s*\{[^}]*background:\s*#faf8f2/s);
  for (const selector of [
    ".home-page main",
    ".home-page .hero-intake-section",
    ".home-page .answer-home",
    ".home-page .material-editorial",
    ".home-page .assay-process",
    ".home-page .industry-index",
    ".home-page .service-area-section",
    ".home-page .provenance-story",
    ".home-page .location-section",
    ".home-page .faq-section"
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\s*\\{[^}]*background:\\s*#102a43`, "s"), `${selector} must carry the homepage blue`);
  }
});

test("reduced motion keeps the homepage header visible without returning it to layout flow", () => {
  const reducedMotionRules = [...css.matchAll(/@media \(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g)]
    .map((match) => match[1])
    .join("\n");
  assert.match(reducedMotionRules, /\.home-page\s+\.site-header,\s*\.home-header-pending\s+\.site-header\s*\{[^}]*position:\s*fixed/s);
  assert.doesNotMatch(reducedMotionRules, /\.home-header-pending\s+\.site-header\s*\{[^}]*position:\s*sticky/s);
});

test("the cinematic layers remain unfiltered behind a materially lighter overlay", () => {
  const cinematicRules = [...css.matchAll(/(?:\.cinematic-hero-(?:media|poster|video|overlay)[^{]*)\{([^}]*)\}/g)].map((match) => match[1]).join("\n");
  assert.doesNotMatch(cinematicRules, /(?:backdrop-)?filter\s*:/);
  assert.match(css, /\.cinematic-hero-overlay\s*\{[\s\S]*?rgba\(3, 22, 36, 0\.58\) 0%[\s\S]*?rgba\(3, 22, 36, 0\.48\) 26%[\s\S]*?rgba\(3, 22, 36, 0\.32\) 44%/);
  assert.doesNotMatch(css, /\.cinematic-hero-overlay\s*\{[\s\S]*?rgba\(3, 22, 36, 0\.98\)/);
});

test("the production-only hidden header behavior is now part of the repository build", () => {
  assert.match(home, /document\.documentElement\.classList\.add\("home-header-pending"\)/);
  assert.match(home, /<script src="\/home-header-reveal\.js/);
  assert.match(css, /\.home-header-pending\s+\.site-header\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(calc\(-100% - 1px\)\)/s);
  const headerController = readFileSync(join(dist, "home-header-reveal.js"), "utf8");
  assert.match(headerController, /const threshold = 96/);
  assert.match(headerController, /window\.scrollY >= threshold/);
});
