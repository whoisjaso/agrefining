import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const taxonomy = [
  ["Featured", [["Silver oxide watch batteries", "/silver-oxide-watch-battery-recycling-houston"]]],
  ["Silver forms", [
    ["Scrap silver", "/scrap-silver-buyer-houston"],
    ["Scrap silver jewelry", "/scrap-silver-jewelry"],
    ["Silver coins", "/sell-silver-coins-houston"],
    ["Silver bars", "/sell-silver-bars-houston"],
    ["Sterling and flatware", "/silver-flatware-buyer-houston"],
    ["Silver-plated materials", "/silver-plated-materials-buyer-houston"]
  ]],
  ["Industrial and laboratory", [
    ["Industrial silver", "/industrial-silver-scrap"],
    ["Electronics silver recovery", "/electronics-silver-recovery"],
    ["Silver flake", "/silver-flake-buyer-houston"],
    ["Silver solder", "/silver-solder-buyer-houston"],
    ["Laboratory silver", "/laboratory-silver-buyer-houston"]
  ]],
  ["Imaging and healthcare", [
    ["Industrial NDT film", "/industrial-x-ray-silver-recycling"],
    ["Medical X-ray film", "/medical-x-ray-recycling"],
    ["Dental scrap", "/dental-scrap-buyer-houston"]
  ]],
  ["Guides and trade", [
    ["X-ray recycling services", "/x-ray-recycling-services-houston"],
    ["Jewelry-store silver recycling", "/jewelry-store-silver-recycling-houston"]
  ]]
];

const expectedItems = taxonomy.flatMap(([, items]) => items);
const expectedPaths = expectedItems.map(([, path]) => path);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const htmlDocuments = walk(dist)
  .filter((path) => path.endsWith(".html"))
  .map((path) => readFileSync(path, "utf8"));
const englishDocuments = htmlDocuments.filter((html) => /<html lang="en">/.test(html));
const home = readFileSync(join(dist, "index.html"), "utf8");
const accepted = readFileSync(join(dist, "accepted-materials", "index.html"), "utf8");
const industrial = readFileSync(join(dist, "industrial-x-ray-silver-recycling", "index.html"), "utf8");
const medical = readFileSync(join(dist, "medical-x-ray-recycling", "index.html"), "utf8");
const xrayHub = readFileSync(join(dist, "x-ray-recycling-services-houston", "index.html"), "utf8");
const howItWorks = readFileSync(join(dist, "how-it-works", "index.html"), "utf8");
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");

function textContent(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function headerOf(html) {
  return html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "";
}

function disclosureOf(html) {
  return headerOf(html).match(/<div class="materials-disclosure"[\s\S]*?<\/div>/)?.[0] || "";
}

function anchorRecords(html, requiredClass = null) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .map(([, attributes, contents]) => ({
      attributes,
      classes: (attributes.match(/\bclass="([^"]*)"/)?.[1] || "").split(/\s+/).filter(Boolean),
      href: attributes.match(/\bhref="([^"]+)"/)?.[1] || "",
      text: textContent(contents)
    }))
    .filter(({ classes }) => !requiredClass || classes.includes(requiredClass));
}

function customerFacingText(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || "";
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)?.[1] || "";
  return `${title} ${description} ${textContent(body)}`;
}

test("English headers keep exact primary labels and an adjacent Materials disclosure control", () => {
  const expectedLabels = new Map([
    ["/accepted-materials", "Materials"],
    ["/industries", "Industries"],
    ["/service-areas", "Service Areas"],
    ["/how-it-works", "How It Works"],
    ["/about", "Our Story"]
  ]);

  for (const html of englishDocuments) {
    const header = headerOf(html);
    const disclosure = disclosureOf(html);
    assert.match(
      disclosure,
      /<a\b[^>]*href="\/accepted-materials"[^>]*>Materials<\/a>\s*<button\b[^>]*aria-expanded="false"[^>]*aria-controls="materials-panel"[^>]*>/,
      "Materials must remain a direct link followed by its disclosure button"
    );
    assert.equal((header.match(/id="materials-panel"/g) || []).length, 1, "the controlled panel id must be unique");
    for (const [href, label] of expectedLabels) {
      const link = anchorRecords(header).find((anchor) => anchor.href === href && anchor.text === label);
      assert.ok(link, `${href} must use the exact English label ${label}`);
    }
  }
});

test("the disclosure groups exactly 17 unique destinations with ordinary list semantics", () => {
  for (const html of englishDocuments) {
    const disclosure = disclosureOf(html);
    const panel = disclosure.match(/<div class="materials-panel"[\s\S]*?<\/div>/)?.[0] || "";
    const allLinks = anchorRecords(panel);
    assert.equal(allLinks[0]?.href, "/accepted-materials", "the nested mobile disclosure must begin with the materials index");
    assert.equal(allLinks[0]?.text, "All materials");
    assert.ok(allLinks[0]?.classes.includes("materials-panel-all"));
    const links = allLinks.slice(1);
    assert.deepEqual(links.map(({ href }) => href), expectedPaths);
    assert.deepEqual(links.map(({ text }) => text), expectedItems.map(([label]) => label));
    assert.equal(new Set(links.map(({ href }) => href)).size, 17);
    assert.equal(links.filter(({ href }) => href === "/electronics-silver-recovery").length, 1);
    assert.doesNotMatch(disclosure, /\brole="(?:menu|menuitem)"/);
    assert.equal((panel.match(/<ul\b/g) || []).length, taxonomy.length);

    let cursor = 0;
    for (const [group, items] of taxonomy) {
      const headingPosition = panel.indexOf(`>${group}</h`);
      assert.ok(headingPosition >= cursor, `${group} must appear in the approved order`);
      cursor = headingPosition;
      for (const [label] of items) {
        const itemPosition = panel.indexOf(`>${label}</a>`, cursor);
        assert.ok(itemPosition >= cursor, `${label} must appear under ${group}`);
        cursor = itemPosition;
      }
    }
  }
});

test("accepted materials renders the 17-item purchase index with one full-width first card", () => {
  assert.match(accepted, /<h1>We purchase\.<\/h1>/);
  const cards = anchorRecords(accepted, "taxonomy-card");
  assert.equal(cards.length, 17);
  assert.deepEqual(cards.map(({ href }) => href), expectedPaths);
  assert.equal(new Set(cards.map(({ href }) => href)).size, 17);
  assert.ok(cards[0].classes.includes("taxonomy-card-featured"));
  assert.equal(cards[0].href, "/silver-oxide-watch-battery-recycling-houston");
  for (const card of cards.slice(1)) assert.ok(!card.classes.includes("taxonomy-card-featured"));
});

test("the sitemap contains every public route once", () => {
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(locations).size, locations.length);
  for (const path of expectedPaths) {
    assert.equal(locations.filter((location) => location === `https://agrefining.com${path}`).length, 1);
  }
});

test("homepage material labels use the approved purchase taxonomy", () => {
  assert.match(home, />Sterling and flatware<\/h3>/);
  assert.match(home, />Industrial NDT film<\/h3>/);
  assert.doesNotMatch(home, />Sterling and hollowware<\/h3>/);
});

test("the industrial film page explains NDT consistently and expands the term once", () => {
  assert.match(industrial, /<title>Industrial NDT Film Silver Recycling in Houston \| AG Refining<\/title>/);
  assert.match(industrial, /<meta name="description" content="[^"]*industrial NDT film[^"]*">/);
  assert.match(industrial, /<p class="eyebrow">Industrial NDT film<\/p>/);
  assert.match(industrial, /<h1>Recover silver from industrial NDT film\.<\/h1>/);
  assert.match(industrial, /AG Refining works with Houston companies that have qualifying industrial NDT film/);
  assert.ok((customerFacingText(industrial).match(/Industrial NDT film/gi) || []).length >= 5);
  assert.equal((customerFacingText(industrial).match(/Industrial Non-Destructive Testing film/g) || []).length, 1);
});

test("all customer-facing output removes industrial X-ray wording while preserving internal routes", () => {
  const output = htmlDocuments.map(customerFacingText).join("\n");
  assert.doesNotMatch(output, /industrial x[ -]?ray/i);
  assert.ok(htmlDocuments.some((html) => html.includes('href="/industrial-x-ray-silver-recycling"')));

  assert.match(customerFacingText(home), /Industrial NDT film/);
  assert.match(customerFacingText(readFileSync(join(dist, "espanol", "index.html"), "utf8")), /Película industrial NDT/);
  assert.match(customerFacingText(readFileSync(join(dist, "oil-gas-silver-recovery", "index.html"), "utf8")), /industrial NDT film/i);
  assert.match(customerFacingText(readFileSync(join(dist, "houston-silver-buyer", "index.html"), "utf8")), /Medical and NDT film/i);
  assert.match(customerFacingText(xrayHub), /Industrial NDT Film Silver Recycling/);
});

test("medical and general X-ray terminology remains accurate", () => {
  assert.match(medical, /<title>Medical X-Ray Film Recycling in Houston \| AG Refining<\/title>/);
  assert.match(medical, /<p class="eyebrow">Medical X-ray film<\/p>/);
  assert.match(customerFacingText(medical), /silver-bearing X-ray film/);
  assert.match(xrayHub, /<title>X-Ray Recycling Services Houston \| X-Ray Film Recycling \| AG Refining<\/title>/);
  assert.match(xrayHub, /<h1>Secure X-ray film recycling in Houston\.<\/h1>/);
});

test("How It Works opens with the exact six-step promise", () => {
  assert.match(howItWorks, /<h1>Six simple steps from silver to cash\.<\/h1>/);
});
