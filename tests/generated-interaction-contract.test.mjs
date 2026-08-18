import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlDocuments = walk(dist)
  .filter((path) => path.endsWith(".html"))
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

function titleCaseWords(locale) {
  return locale === "es"
    ? new Set(["a", "al", "ante", "bajo", "cabe", "con", "contra", "de", "del", "desde", "durante", "e", "el", "en", "entre", "hacia", "hasta", "la", "las", "lo", "los", "o", "para", "por", "según", "sin", "so", "sobre", "tras", "u", "un", "una", "unas", "unos", "y"])
    : new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "nor", "of", "on", "or", "per", "so", "the", "to", "vs", "via", "with", "yet"]);
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
  assert.equal(htmlDocuments.length, 39);
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
  assert.match(acceptedMaterials, />Sell Silver-Plated Materials in Houston\.<\/h2>/);
  assert.match(acceptedMaterials, />Tell Us What You Have\.<\/h2>/);
  assert.match(acceptedMaterials, />Start with the Material\.<\/h2>/);

  const hospital = readFileSync(join(dist, "hospital-silver-recycling", "index.html"), "utf8");
  assert.match(hospital, />Simple Next Steps<\/p>/);
  assert.match(hospital, />Know What Happens Next\.<\/h2>/);
  assert.match(hospital, />Start with the Material<\/h3>/);
  assert.match(hospital, />Scrap Silver Jewelry<\/span>/);

  assert.match(spanish, />Servicio en Español<\/p>/);
  assert.match(spanish, />Comience Hoy<\/p>/);
  assert.match(spanish, />Solicite una Recogida\.<\/h2>/);
});

test("Title Case normalization preserves nested inline heading markup", () => {
  const serviceAreas = readFileSync(join(dist, "service-areas", "index.html"), "utf8");
  assert.match(
    serviceAreas,
    /<h2 id="featured-service-areas">Choose Your <span class="service-area-heading-emphasis">Service Area<\/span>\.<\/h2>/
  );
});

test("the single pickup action is available only on mobile while the desktop material guide remains available", () => {
  const touchProfile = { pointer: "coarse", hover: "none", motion: "no-preference" };
  for (const width of [320, 390, 768, 900]) {
    assert.equal(
      generatedDisplayAtWidth(".mobile-actions", width, touchProfile, "block"),
      "flex",
      `${width}px: the mobile pickup action must be available`
    );
    assert.equal(
      generatedDisplayAtWidth(".material-guide", width, touchProfile, "block"),
      "none",
      `${width}px: material guide must not occupy or cover the reading workspace`
    );
  }

  const desktopProfile = { pointer: "fine", hover: "hover", motion: "no-preference" };
  assert.equal(
    generatedDisplayAtWidth(".mobile-actions", 901, desktopProfile, "block"),
    "none",
    "the pickup dock must disappear above the mobile breakpoint"
  );
  assert.equal(
    generatedDisplayAtWidth(".material-guide", 1440, desktopProfile, "block"),
    "block",
    "desktop material guide must remain available"
  );
});

test("static forms keep native validation before enhancement", () => {
  const contactForm = contact.match(/<form[^>]*data-review-form[^>]*>[\s\S]*?<\/form>/)?.[0] || "";
  assert.match(contactForm, /action="\/api\/leads"/);
  assert.match(contactForm, /method="post"/);
  assert.doesNotMatch(contactForm, /\bnovalidate\b/i);
  assert.match(contactForm, /name="locale" value="en"/);
});

test("all static headers expose navigation when site.js is unavailable", () => {
  for (const [name, html] of htmlDocuments) {
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
  assert.match(spanish, /id="solicitud"/);
  assert.match(spanish, /<form[^>]*data-review-form[^>]*>/);
  assert.match(spanish, /name="locale" value="es"/);
  assert.match(spanish, />Enviar solicitud/);
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
  for (const englishLabel of ["Materials", "Industries", "Service areas", "How it works", "Our story", "Schedule a Free Pickup", "Quick actions", "Identify your material", "Request a review"]) {
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
