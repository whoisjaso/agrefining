import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

// The Buy Desk at /desk is a private counter app with its own tests, not a public page.
const isPrivateApp = (path) => /[\\/]dist[\\/]desk[\\/]/.test(path);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlDocuments = walk(dist)
  .filter((path) => path.endsWith(".html") && !isPrivateApp(path))
  .sort()
  .map((path) => [relative(dist, path), readFileSync(path, "utf8")]);
const contact = readFileSync(join(dist, "contact", "index.html"), "utf8");
const spanish = readFileSync(join(dist, "espanol", "index.html"), "utf8");
const home = readFileSync(join(dist, "index.html"), "utf8");
const css = readFileSync(join(dist, "style.css"), "utf8");

function textContent(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function contentsOf(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => textContent(match[1]));
}

function titleCaseLocale(html) {
  return /<html lang="es">/.test(html) ? "es" : "en";
}

// Owner rule: every word starts with a capital, small words included.
function titleCaseWords() {
  return new Set();
}

function capitalizeToken(token, locale) {
  const lower = token.toLocaleLowerCase(locale);
  const letterIndex = lower.search(/\p{L}/u);
  if (letterIndex === -1) return token;
  return `${lower.slice(0, letterIndex)}${lower[letterIndex].toLocaleUpperCase(locale)}${lower.slice(letterIndex + 1)}`;
}

function titleCaseText(value, locale) {
  const minorWords = titleCaseWords(locale);
  const words = value.split(/\s+/).filter(Boolean);

  return words.map((word, index) => {
    const parts = word.split("-");
    const casedParts = parts.map((part, partIndex) => {
      if (!part) return part;
      if (/^[A-Z0-9]{2,}$/u.test(part)) return part;

      const stripped = part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.?!]+$/gu, "");
      const lower = stripped.toLocaleLowerCase(locale);
      const globalIndex = index === 0 && partIndex === 0
        ? 0
        : index === words.length - 1 && partIndex === parts.length - 1
          ? words.length - 1
          : index;
      const shouldLower = parts.length === 1 && globalIndex !== 0 && globalIndex !== words.length - 1 && minorWords.has(lower);
      const cased = shouldLower ? part.toLocaleLowerCase(locale) : capitalizeToken(part, locale);
      return cased;
    });

    return casedParts.join("-");
  }).join(" ");
}

function titleCaseTargets(html) {
  return [
    ...contentsOf(html, /<p class="(?:eyebrow|answer-index|hero-kicker|hero-review-label|legacy-caption)">([\s\S]*?)<\/p>/g),
    ...contentsOf(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>/g),
    ...contentsOf(html, /<h3\b[^>]*>([\s\S]*?)<\/h3>/g),
    ...contentsOf(html, /<details class="material-guide">[\s\S]*?<summary>[\s\S]*?<span>([\s\S]*?)<\/span><\/summary>/g),
    ...contentsOf(html, /<a\b[^>]*>\s*<span(?:\s[^>]*)?>([\s\S]*?)<\/span>\s*<h[23]\b/g)
  ];
}

function skipCssComment(source, start) {
  const end = source.indexOf("*/", start + 2);
  assert.notEqual(end, -1, "generated CSS contains an unterminated comment");
  return end + 2;
}

function skipCssString(source, start) {
  const quote = source[start];
  let cursor = start + 1;

  while (cursor < source.length) {
    if (source[cursor] === "\\") {
      cursor += 2;
    } else if (source[cursor] === quote) {
      return cursor + 1;
    } else {
      cursor += 1;
    }
  }

  assert.fail("generated CSS contains an unterminated string");
}

function findClosingBrace(source, openBrace) {
  let depth = 1;
  let cursor = openBrace + 1;

  while (cursor < source.length) {
    if (source.startsWith("/*", cursor)) {
      cursor = skipCssComment(source, cursor);
    } else if (source[cursor] === '"' || source[cursor] === "'") {
      cursor = skipCssString(source, cursor);
    } else if (source[cursor] === "{") {
      depth += 1;
      cursor += 1;
    } else if (source[cursor] === "}") {
      depth -= 1;
      if (depth === 0) return cursor;
      cursor += 1;
    } else {
      cursor += 1;
    }
  }

  assert.fail("generated CSS contains an unbalanced declaration block");
}

function readCssRuleBlocks(source) {
  const blocks = [];
  let preludeStart = 0;
  let cursor = 0;

  while (cursor < source.length) {
    if (source.startsWith("/*", cursor)) {
      cursor = skipCssComment(source, cursor);
    } else if (source[cursor] === '"' || source[cursor] === "'") {
      cursor = skipCssString(source, cursor);
    } else if (source[cursor] === ";") {
      preludeStart = cursor + 1;
      cursor += 1;
    } else if (source[cursor] === "{") {
      const closeBrace = findClosingBrace(source, cursor);
      blocks.push({
        prelude: source.slice(preludeStart, cursor).trim(),
        body: source.slice(cursor + 1, closeBrace)
      });
      cursor = closeBrace + 1;
      preludeStart = cursor;
    } else {
      cursor += 1;
    }
  }

  return blocks;
}

function readCssDeclarations(source) {
  return new Map(
    source
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const colon = declaration.indexOf(":");
        assert.notEqual(colon, -1, `invalid CSS declaration: ${declaration}`);
        return [
          declaration.slice(0, colon).trim().toLowerCase(),
          declaration.slice(colon + 1).trim()
        ];
      })
  );
}

function readPixelMinimum(declarations, property) {
  const value = declarations.get(property);
  assert.ok(value, `.preferred-contact label must declare ${property}`);
  const pixels = value.match(/^([0-9]+(?:\.[0-9]+)?)px(?:\s*!important)?$/i);
  assert.ok(pixels, `${property} must use an explicit pixel minimum, received ${value}`);
  return Number(pixels[1]);
}

function mediaMatchesScreenWidth(prelude, width, inputProfile) {
  if (!/^@media\b/i.test(prelude) || /\bprint\b/i.test(prelude)) return false;

  const conditions = Array.from(prelude.matchAll(/\(\s*([\w-]+)\s*:\s*([^)]+?)\s*\)/gi));
  return conditions.every(([, feature, rawValue]) => {
    const value = rawValue.trim().toLowerCase();

    if (feature.toLowerCase() === "max-width") return width <= Number.parseFloat(value);
    if (feature.toLowerCase() === "min-width") return width >= Number.parseFloat(value);
    if (feature.toLowerCase() === "pointer") return inputProfile.pointer === value;
    if (feature.toLowerCase() === "hover") return inputProfile.hover === value;
    if (feature.toLowerCase() === "prefers-reduced-motion") return inputProfile.motion === value;
    return false;
  });
}

function selectorListIncludes(prelude, selector) {
  return prelude
    .split(",")
    .map((candidate) => candidate.trim().replace(/\s+/g, " "))
    .includes(selector);
}

function generatedDisplayAtWidth(selector, width, inputProfile, defaultDisplay) {
  let display = { value: defaultDisplay, important: false };

  const applyRules = (source) => {
    for (const rule of readCssRuleBlocks(source)) {
      if (!selectorListIncludes(rule.prelude, selector)) continue;
      const declared = readCssDeclarations(rule.body).get("display");
      if (!declared) continue;

      const important = /\s*!important\s*$/i.test(declared);
      if (display.important && !important) continue;
      display = {
        value: declared.replace(/\s*!important\s*$/i, "").trim().toLowerCase(),
        important
      };
    }
  };

  for (const rule of readCssRuleBlocks(css)) {
    if (/^@media\b/i.test(rule.prelude)) {
      if (mediaMatchesScreenWidth(rule.prelude, width, inputProfile)) applyRules(rule.body);
    } else if (selectorListIncludes(rule.prelude, selector)) {
      const declared = readCssDeclarations(rule.body).get("display");
      if (!declared) continue;
      const important = /\s*!important\s*$/i.test(declared);
      if (display.important && !important) continue;
      display = {
        value: declared.replace(/\s*!important\s*$/i, "").trim().toLowerCase(),
        important
      };
    }
  }

  return display.value;
}

test("the generated contract covers every published HTML document", () => {
  assert.equal(htmlDocuments.length, 58);
});

test("every generated route authors eyebrow, small-label, H2, and H3 copy in Title Case", () => {
  const mismatches = [];

  for (const [name, html] of htmlDocuments) {
    const locale = titleCaseLocale(html);
    for (const text of titleCaseTargets(html)) {
      const expected = titleCaseText(text, locale);
      if (text !== expected) mismatches.push(`${name}: "${text}" -> "${expected}"`);
    }
  }

  assert.deepEqual(mismatches, []);
});

test("interior routes keep the approved Title Case exemplars outside the homepage", () => {
  const acceptedMaterials = readFileSync(join(dist, "accepted-materials", "index.html"), "utf8");
  assert.match(acceptedMaterials, />Silver-Plated Materials<\/p>/);
  assert.match(acceptedMaterials, />Sell Silver-Plated Materials In Houston\.<\/h2>/);
  assert.match(acceptedMaterials, />Tell Us What You Have\.<\/h2>/);
  assert.match(acceptedMaterials, />Start With The Material\.<\/h2>/);

  const hospital = readFileSync(join(dist, "hospital-silver-recycling", "index.html"), "utf8");
  assert.match(hospital, />Simple Next Steps<\/p>/);
  assert.match(hospital, />Know What Happens Next\.<\/h2>/);
  assert.match(hospital, />Start With The Material<\/h3>/);
  assert.match(hospital, />Scrap Silver Jewelry<\/span>/);

  assert.match(spanish, />Servicio En Español<\/p>/);
  assert.match(spanish, />Comience Hoy<\/p>/);
  assert.match(spanish, />Solicite Una Recogida\.<\/h2>/);
});

test("Title Case normalization preserves nested inline heading markup", () => {
  const serviceAreas = readFileSync(join(dist, "service-areas", "index.html"), "utf8");
  assert.match(
    serviceAreas,
    /<h2 id="featured-service-areas">Choose Your <span class="service-area-heading-emphasis">Service Area<\/span>\.<\/h2>/
  );
});

test("the Get Paid pill is available at every width while the desktop material guide remains available", () => {
  const touchProfile = { pointer: "coarse", hover: "none", motion: "no-preference" };
  for (const width of [320, 390, 768, 900]) {
    assert.equal(generatedDisplayAtWidth(".get-paid-dock", width, touchProfile, "block"), "flex", `${width}px: the pill must be available`);
    assert.equal(
      generatedDisplayAtWidth(".material-guide", width, touchProfile, "block"),
      "none",
      `${width}px: material guide must not occupy or cover the reading workspace`
    );
  }

  const desktopProfile = { pointer: "fine", hover: "hover", motion: "no-preference" };
  assert.equal(generatedDisplayAtWidth(".get-paid-dock", 1440, desktopProfile, "block"), "flex", "the pill follows desktop visitors too");
  assert.equal(
    generatedDisplayAtWidth(".material-guide", 1440, desktopProfile, "block"),
    "block",
    "desktop material guide must remain available"
  );
});

test("static forms keep native validation before enhancement", () => {
  const contactForm = readFileSync(join(dist, "sell", "index.html"), "utf8").match(/<form[^>]*data-review-form[^>]*>[\s\S]*?<\/form>/)?.[0] || "";
  assert.match(contactForm, /action="\/api\/leads"/);
  assert.match(contactForm, /method="post"/);
  assert.doesNotMatch(contactForm, /\bnovalidate\b/i);
  assert.match(contactForm, /name="locale" value="en"/);
});

test("all static headers expose navigation when site.js is unavailable", () => {
  for (const [name, html] of htmlDocuments) {
    // The standalone sell portal has no header by design.
    if (/class="portal-page"/.test(html)) continue;
    const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "";
    const menu = header.match(/<div class="nav-links"[^>]*>/)?.[0] || "";
    const materialsPanel = header.match(/<div class="materials-panel"[^>]*>/)?.[0] || "";
    assert.match(header, /data-nav-toggle[^>]*\bhidden\b/, `${name}: enhancement toggle must start hidden`);
    assert.match(header, /data-nav-scrim[^>]*\bhidden\b/, `${name}: enhancement scrim must start hidden`);
    assert.doesNotMatch(menu, /\b(?:hidden|inert|aria-hidden)\b/, `${name}: fallback links must start exposed`);
    if (/<html lang="en">/.test(html)) {
      assert.match(header, /<a\b[^>]*href="\/accepted-materials"[^>]*>Materials<\/a>/, `${name}: Materials must remain directly navigable`);
      assert.match(header, /<button\b[^>]*aria-controls="materials-panel"[^>]*>/, `${name}: missing adjacent disclosure control`);
      assert.doesNotMatch(materialsPanel, /\b(?:hidden|inert|aria-hidden)\b/, `${name}: static material links must remain reachable`);
    }
  }
});

test("static CSS exposes the one materials panel to keyboard and fine-pointer users", () => {
  assert.match(css, /\.materials-disclosure:focus-within\s+\.materials-panel\s*\{[^}]*display:\s*(?:grid|block)/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)[\s\S]*?\.materials-disclosure:hover\s+\.materials-panel\s*\{[^}]*display:\s*(?:grid|block)/s);
});

test("Spanish stays Spanish through the lead form", () => {
  assert.match(spanish, /<html lang="es">/);
  assert.match(spanish, />Saltar al contenido<\/a>/);
  const vender = readFileSync(join(dist, "vender", "index.html"), "utf8");
  assert.match(spanish, /href="\/vender"/, "the Spanish page sends visitors to the Spanish portal");
  assert.match(vender, /<html lang="es">/);
  assert.match(vender, /id="solicitud"/);
  assert.match(vender, /<form[^>]*data-review-form[^>]*>/);
  assert.match(vender, /name="locale" value="es"/);
  assert.match(vender, /¿Cuál Es Su Nombre Completo\?/);
  assert.doesNotMatch(spanish, /href="\/contact\?intent=pickup"/);
});

test("Spanish shared chrome does not masquerade English labels as Spanish", () => {
  const chrome = [
    spanish.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "",
    spanish.match(/<nav class="mobile-actions"[\s\S]*?<\/nav>/)?.[0] || "",
    spanish.match(/<footer class="footer"[\s\S]*?<\/footer>/)?.[0] || "",
    spanish.match(/<details class="material-guide"[\s\S]*?<\/details>/)?.[0] || ""
  ].join("\n");
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const englishLabel of ["Materials", "Industries", "Service areas", "How it works", "Our story", "Get Paid For Your Silver", "Quick actions", "Identify your material", "Request a review"]) {
    assert.doesNotMatch(chrome, new RegExp(`>${escapeRegex(englishLabel)}<`), `unexpected English control: ${englishLabel}`);
  }
  assert.match(chrome, /hreflang="en"/);
  assert.match(chrome, /en ingles/);
});

test("coarse pointers receive radio-label targets at least 44px in both dimensions", () => {
  const coarsePointerMedia = readCssRuleBlocks(css).filter(
    ({ prelude }) => /^@media\b/i.test(prelude) && /\(\s*pointer\s*:\s*coarse\s*\)/i.test(prelude)
  );
  assert.ok(coarsePointerMedia.length > 0, "generated CSS must include a coarse-pointer media query");

  const preferredContactRules = coarsePointerMedia.flatMap(({ body }) =>
    readCssRuleBlocks(body).filter(({ prelude }) =>
      prelude
        .split(",")
        .map((selector) => selector.trim().replace(/\s+/g, " "))
        .includes(".preferred-contact label")
    )
  );
  assert.ok(
    preferredContactRules.length > 0,
    "the coarse-pointer media query must include a .preferred-contact label rule"
  );

  for (const { body } of preferredContactRules) {
    const declarations = readCssDeclarations(body);
    assert.ok(readPixelMinimum(declarations, "min-height") >= 44, "radio-label min-height must be at least 44px");
    assert.ok(readPixelMinimum(declarations, "min-width") >= 44, "radio-label min-width must be at least 44px");
  }
});

test("every pickup call to action opens the standalone sell portal", () => {
  for (const [name, html] of htmlDocuments) {
    const stray = html.match(/href="\/contact\?intent=(?:pickup|quote)[^"]*"/);
    assert.equal(stray, null, `${name}: ${stray?.[0]} must point at the portal`);
  }
  const homePage = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(homePage, /href="\/sell\?intent=pickup">Get Paid For Your Silver<\/a>/);
  assert.match(homePage, /<form class="intake-panel" action="\/sell" method="get"/);
  const coins = readFileSync(join(dist, "sell-silver-coins-houston", "index.html"), "utf8");
  assert.match(coins, /href="\/sell\?intent=pickup&(?:amp;)?material=silver_coins"/, "material pages carry their material into the portal");
});

test("the sell portal is a standalone page with no site chrome", () => {
  for (const [slug, lang, anchor] of [["sell", "en", "get-paid"], ["vender", "es", "solicitud"]]) {
    const page = readFileSync(join(dist, slug, "index.html"), "utf8");
    assert.match(page, new RegExp(`<html lang="${lang}">`));
    assert.match(page, /<body[^>]*class="portal-page"/);
    assert.doesNotMatch(page, /<header|<footer|site-header|class="brand"|mobile-actions|material-guide|data-nav-toggle/, `${slug}: no header, menu, logo, footer or pill`);
    assert.equal((page.match(/<section\b/g) || []).length, 1, `${slug}: the portal is the only section`);
    assert.equal((page.match(/<h1\b/g) || []).length, 1);
    assert.match(page, new RegExp(`<div id="${anchor}" class="portal-body">`));
    assert.match(page, /<form id="review-form"[^>]*data-review-form/);
    assert.match(page, /<a class="portal-close" href="\/(?:espanol)?"/, `${slug}: one way back to the site`);
    assert.doesNotMatch(page, /portal-map|data-directions|map-band|OpenStreetMap/, `${slug}: no map, address chip or directions link`);
    assert.match(page, /<p class="flow-call"><a class="phone-link" href="tel:/, `${slug}: the call link stays`);
    assert.match(page, /<picture class="portal-backdrop"><source media="\(min-aspect-ratio: 3\/4\)" srcset="\/assets\/v2\/portal-4x5\.webp" width="1080" height="1350"><img src="\/assets\/v2\/portal-9x16\.webp" alt="" width="1080" height="1920"/, `${slug}: a decorative dark backdrop with explicit sizes`);
    assert.match(page, /<div class="portal-card">\s*<form id="review-form"/, `${slug}: the questions sit on a cream card over the backdrop`);
    assert.match(page, /<meta name="theme-color" content="#060d1c">/);
    assert.match(page, /<meta name="robots" content="noindex,follow">/);
  }
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/sell<|\/vender</, "the portal is a utility page, not a search landing page");
  const css = readFileSync(join(dist, "style.css"), "utf8");
  assert.match(css, /html\.portal-locked,\s*html\.portal-locked body \{[^}]*overflow:\s*hidden;/, "the locked portal never scrolls the page");
  assert.match(css, /html\.portal-locked \.portal \{[^}]*height:\s*var\(--portal-height, 100svh\);[^}]*position:\s*fixed;/);
  assert.doesNotMatch(css, /\.portal-map/, "the portal has no map strip");
  assert.match(css, /\.portal\.is-typing \.flow-call \{[^}]*display:\s*none;/, "the call link steps aside when the keyboard is up");
  // Contact and Spanish pages keep their own content and hand off to the portal.
  const contactPage = readFileSync(join(dist, "contact", "index.html"), "utf8");
  assert.doesNotMatch(contactPage, /data-review-form/);
  assert.match(contactPage, /href="\/sell\?intent=pickup"/);
  assert.match(contactPage, /href="tel:\+12818982719"/);
});

test("the pickup form is one question per screen and still works as a plain form", () => {
  const sellPage = readFileSync(join(dist, "sell", "index.html"), "utf8");
  const form = sellPage.match(/<form id="review-form"[\s\S]*?<\/form>/)?.[0] || "";
  const steps = [...form.matchAll(/<fieldset class="flow-step field-wide" data-flow-step="([a-z_]+)">\s*<legend tabindex="-1">(?:<label for="[a-z_]+">)?([^<]+)</g)].map((match) => [match[1], match[2]]);
  assert.deepEqual(steps, [
    ["name", "What Is Your Full Name?"],
    ["phone", "Where Should Dennis Call You?"],
    ["material", "What Are You Bringing?"],
    ["quantity", "About How Much?"],
    ["location", "How Would You Like To Sell?"],
    ["email", "Want A Confirmation By Email?"]
  ], "phone comes right after the name so a drop-off still leaves a number");
  const tiles = (name) => [...form.matchAll(new RegExp(`<input id="[^"]+" type="radio" name="${name}" value="([^"]+)"`, "g"))].map((match) => match[1]);
  assert.deepEqual(tiles("material"), ["scrap_silver", "silver_coins", "dental_material", "industrial_silver", "unknown"], "tiles post the endpoint's own material values");
  assert.deepEqual(tiles("quantity"), ["A few pieces", "A box or bag", "Business volume"]);
  // The seller chooses how to complete the sale; the shop is the buyer.
  assert.deepEqual(tiles("location"), ["Bring it to the shop", "Dennis comes to me"]);
  assert.match(form, />Bring It To The Shop<small>9125 Airport Blvd\.<\/small>/);
  assert.match(form, />Dennis Comes To Me<small>For Larger Lots<\/small>/);
  assert.doesNotMatch(form, /Pickup Or Drop-Off|Drop-off/i);
  assert.doesNotMatch(form, />\s*Gold\s*</, "no gold tile until the owner confirms gold in writing");
  const nameStep = form.match(/data-flow-step="name">[\s\S]*?<\/fieldset>/)?.[0] || "";
  assert.match(nameStep, /<input id="first_name" name="first_name"[^>]*autocomplete="given-name"[^>]*required/);
  assert.match(nameStep, /<input id="last_name" name="last_name"[^>]*autocomplete="family-name"[^>]*required/);
  const phone = form.match(/<input id="phone"[^>]*>/)?.[0] || "";
  assert.match(phone, /type="tel"/);
  assert.match(phone, /inputmode="tel"/);
  assert.match(phone, /autocomplete="tel"/);
  assert.match(phone, /maxlength="14"/, "(281) 898-2719 is fourteen characters");
  assert.match(phone, /pattern="[^"]+"/, "the plain form also insists on a full US number");
  assert.match(phone, /required/);
  assert.doesNotMatch(form.match(/<input id="email"[^>]*>/)[0], /required/);
  assert.doesNotMatch(form, /<textarea|name="business"|name="pickup_date"|name="frequency"/);
  assert.doesNotMatch(form, />Required</, "nothing is labelled Required");
  assert.match(form, /No obligation\. Dennis calls you back\. Your number is saved as you go\./, "the visitor is told the number is saved before finishing");
  assert.doesNotMatch(form, /same day/i, "no response-time promise");
  assert.match(form, /data-submit-button>Get My Offer Call/);
  // Progress and step controls stay hidden until the script takes over, so the plain form is complete.
  assert.match(form, /data-flow-progress[^>]*aria-valuenow="14"[^>]*hidden/);
  assert.match(form, /data-flow-nav hidden/);
  assert.match(form, /action="\/api\/leads" method="post"/);
  assert.match(form, /<div class="flow-stage field-wide" data-flow-stage>/);
  assert.match(form, /privacy notice<\/a>/, "the privacy notice stays on the form");

  const privacyPage = readFileSync(join(dist, "privacy", "index.html"), "utf8");
  assert.match(privacyPage, /sent to AG Refining as you go, even if you do not finish/, "the privacy page discloses unfinished leads");

  const css = readFileSync(join(dist, "style.css"), "utf8");
  // The old screen slides out while the new one slides in, about half a second, with a soft ease.
  assert.match(css, /@keyframes flow-step-in \{[\s\S]*?filter:\s*blur\(8px\);[\s\S]*?transform:\s*translateX\(3rem\)/);
  assert.match(css, /\.flow-step\.is-entering \{\s*animation:\s*flow-step-in 500ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
  assert.match(css, /\.flow-step\.is-leaving \{\s*animation:\s*flow-step-out 500ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.review-form\[data-flow="ready"\] \.flow-step\.is-entering,[\s\S]*?\.flow-step\.is-leaving-back \{\s*animation:\s*none;/);

  const script = readFileSync(join(dist, "site.js"), "utf8");
  assert.match(script, /function validPhone\(value\) \{\s*return \/\^\[2-9\]\\d\{2\}\[2-9\]\\d\{6\}\$\/\.test\(phoneDigits\(value\)\);/, "ten digits with a real area code and exchange");
  assert.match(script, /next\.disabled = blocked;/, "Next stays off until the phone number is complete");
  assert.match(script, /prefers-reduced-motion: reduce[\s\S]{0,400}AudioContext/, "sounds stay silent under reduced motion");
});

test("the map band is one static image with a directions link and no map service", () => {
  const homePage = readFileSync(join(dist, "index.html"), "utf8");
  const band = homePage.match(/<section class="location-section map-band"[\s\S]*?<\/section>/)?.[0] || "";
  assert.match(band, /<img src="\/images\/ag-refining-map-hobby-airport\.webp" alt="" width="2560" height="1100" loading="lazy"/);
  assert.match(band, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&(?:amp;)?destination=[^"]+" target="_blank" rel="noopener" data-directions/);
  assert.match(band, /data-destination="9125 Airport Blvd\., Suite B-1, Houston, TX 77061"/);
  assert.match(band, />Get Directions/);
  assert.doesNotMatch(band, /<iframe|<script|maps\.googleapis|api_key|key=/);
  assert.match(band, /OpenStreetMap contributors/);
});
