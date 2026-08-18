import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const assets = join(root, "assets");
const css = readFileSync(join(root, "src", "style.css"), "utf8");

const serviceAreaManifest = [
  ["Houston", "/houston-silver-buyer", "service-area-houston"],
  ["Pearland", "/silver-buyer-pearland", "service-area-pearland"],
  ["Pasadena", "/silver-buyer-pasadena", "service-area-pasadena"],
  ["Sugar Land", "/silver-buyer-sugar-land", "service-area-sugar-land"],
  ["Katy", "/silver-buyer-katy", "service-area-katy"],
  ["The Woodlands", "/silver-buyer-the-woodlands", "service-area-the-woodlands"],
  ["Conroe", "/silver-buyer-conroe", "service-area-conroe"]
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

function assertResponsivePicture(markup, basename, className) {
  assert.match(markup, new RegExp(`<picture\\b[^>]*class="[^"]*${className}[^"]*"`));
  assert.match(markup, new RegExp(`src="/assets/${basename}-1280\\.webp"`));
  assert.match(markup, new RegExp(`srcset="/assets/${basename}-800\\.webp 800w, /assets/${basename}-1280\\.webp 1280w"`));
  assert.match(markup, /sizes="[^"]+"/);
  assert.match(markup, /width="1280" height="960"/);
}

test("service-area index renders seven separated city cards with responsive 4:3 imagery in route order", () => {
  const html = htmlFor("service-areas");
  const featuredStart = html.indexOf("data-featured-service-areas");
  const ledgerStart = html.indexOf("data-service-coverage");
  assert.ok(featuredStart >= 0, "service areas must expose the featured city card field");
  assert.ok(ledgerStart > featuredStart, "service-area coverage must follow the featured card field");

  const featured = html.slice(featuredStart, ledgerStart);

  const cards = [...featured.matchAll(/<a\b([^>]*)class="([^"]*\bcity-artifact\b[^"]*)"([^>]*)href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(cards.length, 7, "service areas must render exactly seven city cards");
  assert.deepEqual(cards.map(([, , , , href]) => href), serviceAreaManifest.map(([, route]) => route));

  cards.forEach(([, , classes, , href, contents], index) => {
    const [city, , basename] = serviceAreaManifest[index];
    assert.match(classes, /\bcity-artifact-card\b/, `${city} must opt into the card treatment`);
    assertResponsivePicture(contents, basename, "city-artifact-picture");
    assert.match(contents, new RegExp(`<h2[^>]*>${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/h2>`));
    const description = contents.match(/<p\b[^>]*class="[^"]*city-artifact-description[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1] || "";
    assert.match(textContent(description), /(?:pickup|service|silver)/i, `${city} needs a live route description`);
    assert.match(contents, /View city service/);
    assert.equal(href, serviceAreaManifest[index][1]);
  });
});

test("each service-area route hero consumes its matching responsive city image pair", () => {
  for (const [city, route, basename] of serviceAreaManifest) {
    const routeName = route.slice(1);
    const hero = htmlFor(routeName).match(/<section\b[^>]*class="[^"]*page-hero[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] || "";
    assert.ok(hero, `${routeName} must render a page hero`);
    assertResponsivePicture(hero, basename, "service-visual-picture");
    assert.match(hero, new RegExp(`alt="[^"]*${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"]*"`), `${routeName} alt text must name ${city}`);
  }
});

test("every service-area derivative is a nonempty exact 4:3 WebP pair", async () => {
  for (const [, , basename] of serviceAreaManifest) {
    for (const [suffix, width, height] of [["1280", 1280, 960], ["800", 800, 600]]) {
      const path = join(assets, `${basename}-${suffix}.webp`);
      assert.ok(statSync(path).size > 0, `${basename}-${suffix}.webp must be nonempty`);
      const metadata = await sharp(path).metadata();
      assert.deepEqual(
        { format: metadata.format, width: metadata.width, height: metadata.height },
        { format: "webp", width, height },
        `${basename}-${suffix}.webp must be an exact 4:3 WebP`
      );
    }
  }
});

test("service-area coverage keeps the marked 23-city ledger", () => {
  const html = htmlFor("service-areas");
  const ledger = html.match(/<ul\b[^>]*data-service-coverage(?:="")?[^>]*>[\s\S]*?<\/ul>/)?.[0] || "";
  const values = [...ledger.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, contents]) => ({
    href: attributes.match(/\bhref="([^"]+)"/)?.[1] || "",
    text: textContent(contents)
  }));
  assert.deepEqual(values, coverageLinks.map(([text, href]) => ({ text, href })));
  assert.equal(new Set(values.map(({ text }) => text)).size, 23, "service-area coverage must expose 23 distinct city anchors");
});

test("service-area CSS defines separated card layout and 4:3 crops", () => {
  const fieldRule = css.match(/\.city-artifact-field\s*\{([^}]*)\}/)?.[1] || "";
  const cardRule = css.match(/\.city-artifact\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(fieldRule, /gap:\s*(?:clamp\(|[1-9])/);
  assert.doesNotMatch(fieldRule, /border-bottom:/);
  assert.match(cardRule, /background:\s*var\(--paper\)/);
  assert.match(cardRule, /border:\s*1px solid var\(--line\)/);
  assert.match(css, /\.city-artifact-picture\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s);
});

test("service-area pages no longer reference the arbitrary material photo filenames", () => {
  const html = [
    htmlFor("service-areas"),
    ...serviceAreaManifest.map(([, route]) => htmlFor(route.slice(1)))
  ].join("\n");

  const retiredFilenames = [
    /ag-silver-pour-1280\.webp/,
    /material-sterling-hollowware-1280\.webp/,
    /material-industrial-silver-1280\.webp/,
    /material-silver-jewelry-1280\.webp/,
    /material-silver-coins-1280\.webp/,
    /material-silver-bars-1280\.webp/,
    /material-industrial-xray-1280\.webp/
  ];

  for (const pattern of retiredFilenames) assert.doesNotMatch(html, pattern);
});
