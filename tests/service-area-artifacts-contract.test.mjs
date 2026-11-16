import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const emblemPath = join(root, "assets", "service-area-emblems.svg");

const featuredCities = [
  ["Houston", "/houston-silver-buyer", "city-houston"],
  ["Pearland", "/silver-buyer-pearland", "city-pearland"],
  ["Pasadena", "/silver-buyer-pasadena", "city-pasadena"],
  ["Sugar Land", "/silver-buyer-sugar-land", "city-sugar-land"],
  ["Katy", "/silver-buyer-katy", "city-katy"],
  ["The Woodlands", "/silver-buyer-the-woodlands", "city-the-woodlands"],
  ["Conroe", "/silver-buyer-conroe", "city-conroe"]
];

const coverageLinks = [
  ["Houston", "/houston-silver-buyer"],
  ["Pearland", "/silver-buyer-pearland"],
  ["Pasadena", "/silver-buyer-pasadena"],
  ["Sugar Land", "/silver-buyer-sugar-land"],
  ["Katy", "/silver-buyer-katy"],
  ["Cypress", "/silver-buyer-katy"],
  ["Spring", "/silver-buyer-the-woodlands"],
  ["The Woodlands", "/silver-buyer-the-woodlands"],
  ["Conroe", "/silver-buyer-conroe"],
  ["Humble", "/houston-silver-buyer"],
  ["Baytown", "/silver-buyer-pasadena"],
  ["League City", "/silver-buyer-pearland"],
  ["Friendswood", "/silver-buyer-pearland"],
  ["Missouri City", "/silver-buyer-sugar-land"],
  ["Richmond", "/silver-buyer-sugar-land"],
  ["Rosenberg", "/silver-buyer-sugar-land"],
  ["Tomball", "/silver-buyer-the-woodlands"],
  ["Bellaire", "/houston-silver-buyer"],
  ["Deer Park", "/silver-buyer-pasadena"],
  ["La Porte", "/silver-buyer-pasadena"],
  ["Texas City", "/silver-buyer-pearland"],
  ["Galveston", "/silver-buyer-pearland"],
  ["Stafford", "/silver-buyer-sugar-land"]
];

const operationalImages = {
  "houston-silver-buyer": "service-area-houston-1280.webp",
  "silver-buyer-pearland": "service-area-pearland-1280.webp",
  "silver-buyer-pasadena": "service-area-pasadena-1280.webp",
  "silver-buyer-sugar-land": "service-area-sugar-land-1280.webp",
  "silver-buyer-katy": "service-area-katy-1280.webp",
  "silver-buyer-the-woodlands": "service-area-the-woodlands-1280.webp",
  "silver-buyer-conroe": "service-area-conroe-1280.webp"
};

function htmlFor(route) {
  return readFileSync(join(dist, route, "index.html"), "utf8");
}

function textContent(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || "";
}

function anchorRecords(html, className) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .map(([, attributes, contents]) => ({
      attributes,
      classes: attribute(attributes, "class").split(/\s+/).filter(Boolean),
      contents,
      href: attribute(attributes, "href")
    }))
    .filter(({ classes }) => classes.includes(className));
}

function assertDecorativeEmblems(html, expectedCount) {
  const instances = [...html.matchAll(/<svg\b([^>]*)>[\s\S]*?<use\b[^>]*href="\/assets\/service-area-emblems\.svg#[^"]+"[^>]*>[\s\S]*?<\/svg>/g)];
  assert.equal(instances.length, expectedCount, `expected ${expectedCount} emitted service-area emblems`);
  for (const [, attributes] of instances) {
    assert.equal(attribute(attributes, "aria-hidden"), "true", "service-area emblems must be hidden from assistive technology");
    assert.equal(attribute(attributes, "focusable"), "false", "service-area emblems must not receive focus");
  }
}

test("the service-area index renders seven routed city artifacts in the approved order", () => {
  const html = htmlFor("service-areas");
  const featuredStart = html.indexOf("data-featured-service-areas");
  const ledgerStart = html.indexOf("data-service-coverage");
  assert.ok(featuredStart >= 0, "service areas must expose the featured city artifact field");
  assert.ok(ledgerStart > featuredStart, "the coverage ledger must follow the featured city field");

  const featured = html.slice(featuredStart, ledgerStart);
  const links = anchorRecords(featured, "city-artifact");
  assert.equal(links.length, 7, "service areas must render exactly seven featured city links");
  assert.deepEqual(links.map(({ href }) => href), featuredCities.map(([, route]) => route));

  const usedSymbols = [];
  links.forEach(({ contents }, index) => {
    const [city, , symbol] = featuredCities[index];
    const uses = [...contents.matchAll(/<use\b[^>]*href="\/assets\/service-area-emblems\.svg#([^"]+)"[^>]*>/g)];
    assert.deepEqual(uses.map((match) => match[1]), [symbol], `${city} must use its own emblem once`);
    usedSymbols.push(uses[0][1]);

    const liveMarkup = contents.replace(/<svg\b[\s\S]*?<\/svg>/g, "");
    assert.match(liveMarkup, new RegExp(`<h2[^>]*>${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/h2>`));
    const description = liveMarkup.match(/<p\b[^>]*class="[^"]*city-artifact-description[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] || "";
    assert.match(textContent(description), /silver/i, `${city} needs a live silver-related description`);
    assert.ok(textContent(description).split(/\s+/).length <= 18, `${city} description must remain short`);
  });
  assert.equal(new Set(usedSymbols).size, 7, "each featured city needs a distinct symbol");
  assertDecorativeEmblems(featured, 7);
});

test("the marked coverage ledger contains the exact 23-city service list and qualified pickup language", () => {
  const html = htmlFor("service-areas");
  const section = html.match(/<section\b[^>]*class="[^"]*service-coverage[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] || "";
  assert.ok(section, "service areas must render the coverage section");
  assert.match(section, /<h2[^>]*>Houston Metro Coverage<\/h2>/);
  const ledger = section.match(/<ul\b[^>]*data-service-coverage(?:="")?[^>]*>[\s\S]*?<\/ul>/)?.[0] || "";
  const values = [...ledger.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, contents]) => ({
    href: attribute(attributes, "href"),
    text: textContent(contents)
  }));
  assert.deepEqual(values, coverageLinks.map(([text, href]) => ({ text, href })));
  assert.equal(new Set(values.map(({ text }) => text)).size, 23, "coverage ledger must expose 23 distinct city anchors");

  const copy = textContent(section);
  assert.match(copy, /qualifying (?:commercial )?accounts/i);
  assert.match(copy, /confirm(?:ed|ing)?[^.]{0,80}schedul/i, "coverage copy must say scheduling is confirmed first");
  assert.doesNotMatch(copy, /(?:office|location) in (?:each|every) city/i);
});

test("the shared SVG sheet contains seven normalized and distinct geometric symbols", () => {
  assert.ok(existsSync(emblemPath), "the shared service-area emblem sheet must exist");
  const svg = readFileSync(emblemPath, "utf8");
  const symbols = [...svg.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/g)].map(([, attributes, geometry]) => ({
    id: attribute(attributes, "id"),
    viewBox: attribute(attributes, "viewBox"),
    geometry: geometry.replace(/\s+/g, " ").trim()
  }));

  assert.deepEqual(symbols.map(({ id }) => id), featuredCities.map(([, , symbol]) => symbol));
  assert.equal(new Set(symbols.map(({ geometry }) => geometry)).size, 7, "no city symbol may reuse another city's geometry");
  for (const symbol of symbols) assert.equal(symbol.viewBox, "0 0 160 160", `${symbol.id} must use the normalized viewBox`);
  assert.doesNotMatch(svg, /<text\b/i);
  assert.doesNotMatch(svg, /<image\b|data:image\//i);
  assert.doesNotMatch(svg, /\bfilter\s*=|<filter\b|<feTurbulence\b/i);
});

test("each routed location keeps its operational photo and matching decorative emblem", () => {
  for (const [, route, symbol] of featuredCities) {
    const routeName = route.slice(1);
    const html = htmlFor(routeName);
    const hero = html.match(/<section\b[^>]*class="[^"]*page-hero[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] || "";
    assert.ok(hero, `${routeName} must retain its page hero`);
    assert.match(hero, new RegExp(`<img\\b[^>]*src="/assets/${operationalImages[routeName]}"[^>]*>`), `${routeName} must keep its exact operational image`);
    assert.match(hero, new RegExp(`<use\\b[^>]*href="/assets/service-area-emblems\\.svg#${symbol}"[^>]*>`), `${routeName} must render its matching emblem`);
    assertDecorativeEmblems(hero, 1);
  }
});
