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
  return html.match(/<nav class="mobile-actions get-paid-dock"[\s\S]*?<\/nav>/)?.[0] || "";
}

test("the Get Paid pill is one localized link that routes to the right form", () => {
  const englishDock = mobileDock(home);
  const spanishDock = mobileDock(spanish);
  assert.equal((englishDock.match(/<a\b/g) || []).length, 1);
  assert.match(englishDock, /<a class="get-paid-pill" href="\/sell\?intent=pickup">[\s\S]*Get Paid/, "the pill opens the sell portal");
  assert.doesNotMatch(englishDock, /tel:|>Call</);
  assert.equal((spanishDock.match(/<a\b/g) || []).length, 1);
  assert.match(spanishDock, /<a class="get-paid-pill" href="\/vender">[\s\S]*Reciba Su Pago/);
  const coins = readFileSync(join(dist, "sell-silver-coins-houston", "index.html"), "utf8");
  assert.match(mobileDock(coins), /href="\/sell\?intent=pickup&material=silver_coins"/, "material pages open the portal with their material chosen");
  assert.match(readFileSync(join(dist, "sell", "index.html"), "utf8"), /<div id="get-paid" class="portal-body">/, "the portal carries the form");
});

test("the pill is centered, hidden on the first screen, safe-area aware, and suppressed by navigation, forms and the footer", () => {
  const dockRule = cssRule(".get-paid-dock");
  assert.match(dockRule, /left:\s*50%/);
  assert.match(dockRule, /transform:\s*translate\(-50%, 140%\)/);
  assert.match(dockRule, /bottom:\s*calc\(1\.1rem \+ var\(--safe-bottom\)\)/);
  assert.match(css, /\.get-paid-dock\[data-visible="true"\]\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translate\(-50%, 0\)/s);
  assert.match(css, /\.nav-open \.get-paid-dock\s*\{[^}]*opacity:\s*0;/s);
  assert.match(css, /\.get-paid-pill::before\s*\{[^}]*animation:\s*get-paid-orbit 2\.6s linear infinite/s);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.get-paid-dock[\s\S]*?animation:\s*none !important/);
  assert.match(site, /document\.body\.classList\.contains\("nav-open"\)/);
  assert.match(site, /footer\.getBoundingClientRect\(\)\.top/);
  assert.match(site, /offset > revealOffset\(\)/);
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

test("enhanced mobile navigation is a full-screen overlay that fades in with staggered items", () => {
  const rules = [...css.matchAll(/^\s*\.site-header\[data-nav-enhanced="true"\]\s+\.nav-links\s*\{([^}]*)\}/gm)].map((match) => match[1]);
  const panel = rules.find((rule) => /position:\s*fixed/.test(rule)) || "";
  assert.match(panel, /top:\s*0/);
  assert.match(panel, /left:\s*0/);
  assert.match(panel, /width:\s*100vw/);
  assert.match(panel, /height:\s*100dvh/);
  assert.match(panel, /opacity:\s*0/);
  assert.match(panel, /transition:\s*opacity 300ms ease-out/);
  assert.match(panel, /overscroll-behavior:\s*contain/);
  assert.match(css, /\.nav-open \.site-header\[data-nav-enhanced="true"\] \.nav-links > \* \{[^}]*transition-delay:\s*calc\(140ms \+ \(var\(--nav-step, 0\) \* 60ms\)\)/);
  assert.match(css, /\.nav-open \.site-header \.brand \{\s*visibility:\s*hidden;/, "no logo inside the open menu");
  assert.match(css, /body\.nav-open \{\s*overflow:\s*hidden;/, "the page must not scroll behind the menu");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.site-header\[data-nav-enhanced="true"\] \.nav-links,[^}]*transition:\s*none;/);
  assert.match(home, /<a class="nav-call" href="tel:\+12818982719">Call \(281\) 898-2719<\/a>/);
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

test("homepage keeps a cream-dominant editorial rhythm with blue carried through key bands", () => {
  assert.match(home, /<meta name="theme-color" content="#000000">/);
  assert.match(home, /<html lang="en" class="home-document">/);
  assert.doesNotMatch(contact, /class="home-document"/);
  // Black, never navy: iPhone Safari tints the status bar area from the page background.
  assert.match(css, /\.home-document,\s*\.home-page\s*\{[^}]*background:\s*#000/s);
  assert.match(css, /\.home-loader\s*\{[^}]*background:\s*#000/s);
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
  assert.match(css, /\.cinematic-hero-overlay\s*\{[\s\S]*?rgba\(0, 0, 0, 0\.62\) 0%[\s\S]*?rgba\(0, 0, 0, 0\.5\) 26%[\s\S]*?rgba\(0, 0, 0, 0\.32\) 44%/);
  assert.doesNotMatch(css, /rgba\(3, 22, 36/);
});

test("the production-only hidden header behavior is now part of the repository build", () => {
  assert.match(home, /document\.documentElement\.classList\.add\("home-header-pending"\)/);
  assert.match(home, /<script src="\/home-header-reveal\.js/);
  assert.match(css, /\.home-header-pending\s+\.site-header\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(calc\(-100% - 1px\)\)/s);
  const headerController = readFileSync(join(dist, "home-header-reveal.js"), "utf8");
  assert.match(headerController, /const threshold = 96/);
  assert.match(headerController, /window\.scrollY >= threshold/);
});

test("on phones the cream header steps aside when the dark footer comes into view", () => {
  const script = readFileSync(join(dist, "site.js"), "utf8");
  assert.match(script, /classList\.toggle\("at-footer", footerTop < /);
  assert.match(css, /html\.at-footer body:not\(\.nav-open\) \.site-header \{[^}]*transform:\s*translateY\(-101%\);/);
});

test("the homepage hero is the film and one button, with the headline kept for search only", () => {
  const hero = home.match(/<section class="atelier-hero">[\s\S]*?<\/section>/)?.[0] || "";
  assert.match(hero, /<h1 class="visually-hidden">Houston Silver Buyer, Valued Precisely\.<\/h1>/);
  assert.doesNotMatch(hero, /hero-lede|See the weight/);
  assert.equal((hero.match(/<a\b/g) || []).length, 1);
  assert.match(hero, />Get Paid For Your Silver<\/a>/);
});

test("every closing band carries exactly one white button and no second action", () => {
  for (const page of [home, contact, spanish]) {
    for (const band of page.match(/<section class="conversion-band[^"]*">[\s\S]*?<\/section>/g) || []) {
      assert.equal((band.match(/<a\b/g) || []).length, 1);
      assert.match(band, /class="button button-inverse"/);
      assert.doesNotMatch(band, /href="tel:/);
    }
  }
});
