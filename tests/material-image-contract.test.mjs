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

const materialManifest = {
  "silver-oxide-watch-battery-recycling-houston": "material-watch-batteries",
  "scrap-silver-buyer-houston": "material-scrap-silver",
  "scrap-silver-jewelry": "material-scrap-jewelry",
  "sell-silver-coins-houston": "material-coins",
  "sell-silver-bars-houston": "material-silver-bars",
  "silver-flatware-buyer-houston": "material-sterling-flatware",
  "silver-plated-materials-buyer-houston": "material-silver-plated",
  "industrial-silver-scrap": "material-industrial-silver",
  "electronics-silver-recovery": "material-electronics",
  "silver-flake-buyer-houston": "material-silver-flake",
  "silver-solder-buyer-houston": "material-silver-solder",
  "laboratory-silver-buyer-houston": "material-lab-silver",
  "industrial-x-ray-silver-recycling": "material-industrial-ndt",
  "medical-x-ray-recycling": "material-medical-xray",
  "dental-scrap-buyer-houston": "material-dental",
  "x-ray-recycling-services-houston": "material-xray-film",
  "jewelry-store-silver-recycling-houston": "material-scrap-jewelry"
};

const homeMaterials = [
  ["scrap-silver-jewelry", "material-scrap-jewelry"],
  ["industrial-x-ray-silver-recycling", "material-industrial-ndt"],
  ["sell-silver-coins-houston", "material-coins"],
  ["silver-oxide-watch-battery-recycling-houston", "material-watch-batteries"],
  ["medical-x-ray-recycling", "material-medical-xray"],
  ["silver-flatware-buyer-houston", "material-sterling-flatware"]
];

function routeHtml(route) {
  return readFileSync(join(dist, route, "index.html"), "utf8");
}

function cardForRoute(html, route) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const card = html.match(new RegExp(`<a class="[^\"]*(?:taxonomy-card|material-row)[^\"]*" href="/${escapedRoute}"[\\s\\S]*?</a>`))?.[0];
  assert.ok(card, `missing editorial card for /${route}`);
  return card;
}

function assertResponsiveImage(markup, basename, { lazy }) {
  assert.match(markup, new RegExp(`src="/assets/${basename}-1280\\.webp"`));
  assert.match(markup, new RegExp(`srcset="/assets/${basename}-800\\.webp 800w, /assets/${basename}-1280\\.webp 1280w"`));
  assert.match(markup, /sizes="[^\"]+"/);
  assert.match(markup, /width="1280" height="960"/);
  assert.match(markup, /style="--material-focus:[^\"]+"/);
  if (lazy) assert.match(markup, /loading="lazy"/);
  else {
    assert.doesNotMatch(markup, /loading="lazy"/);
    assert.match(markup, /fetchpriority="high"/);
  }
}

test("all 17 material destinations use the intended responsive image mapping", () => {
  assert.equal(Object.keys(materialManifest).length, 17);
  for (const [route, basename] of Object.entries(materialManifest)) {
    const hero = routeHtml(route).match(/<figure class="service-visual[^>]*>[\s\S]*?<\/figure>/)?.[0] || "";
    assertResponsiveImage(hero, basename, { lazy: false });
  }
});

test("the material taxonomy renders 17 lazy responsive cards with route-specific focal positions", () => {
  const taxonomy = routeHtml("accepted-materials");
  for (const [route, basename] of Object.entries(materialManifest)) {
    assertResponsiveImage(cardForRoute(taxonomy, route), basename, { lazy: true });
  }
});

test("homepage material cards are separated boxes with lazy 4:3 responsive imagery", () => {
  const home = readFileSync(join(dist, "index.html"), "utf8");
  assert.equal((home.match(/class="material-row"/g) || []).length, 6);
  for (const [route, basename] of homeMaterials) {
    assertResponsiveImage(cardForRoute(home, route), basename, { lazy: true });
  }

  const gridRule = css.match(/\.featured-materials-grid\s*\{([^}]*)\}/)?.[1] || "";
  const cardRule = css.match(/\.material-row\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(gridRule, /gap:\s*(?:clamp\(|[1-9])/);
  assert.doesNotMatch(gridRule, /border-(?:top|bottom|left|right):/);
  assert.match(cardRule, /background:\s*var\(--paper\)/);
  assert.match(cardRule, /border:\s*1px solid var\(--line\)/);
  assert.match(css, /\.featured-material-image\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s);
});

test("every consumed material derivative is a nonempty exact 4:3 WebP", async () => {
  const basenames = [...new Set(Object.values(materialManifest))];
  for (const basename of basenames) {
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

test("material routes do not consume obsolete filenames", () => {
  const materialHtml = [
    readFileSync(join(dist, "index.html"), "utf8").match(/<section class="section material-editorial">[\s\S]*?<\/section>/)?.[0] || "",
    routeHtml("accepted-materials"),
    ...Object.keys(materialManifest).map((route) => routeHtml(route).match(/<figure class="service-visual[^>]*>[\s\S]*?<\/figure>/)?.[0] || "")
  ].join("\n");
  const obsolete = [
    /material-[^\"']+-mobile\.webp/,
    /material-commercial-scrap-/,
    /material-industrial-xray-/,
    /material-laboratory-silver-/,
    /material-silver-coins-/,
    /material-silver-jewelry-/,
    /material-sterling-hollowware-/,
    /material-watch-batteries-real-/,
    /material-dental-scrap-/,
    /width="1280" height="819"/
  ];
  for (const pattern of obsolete) assert.doesNotMatch(materialHtml, pattern);
});
