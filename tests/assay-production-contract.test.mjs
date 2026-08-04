import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function deployed(name) {
  return join(dist, name);
}

function outerSection(source, className) {
  const opening = new RegExp(`<section\\b[^>]*\\bclass=(?:"[^"]*\\b${className}\\b[^"]*"|'[^']*\\b${className}\\b[^']*')[^>]*>`, "i").exec(source);
  if (!opening || opening.index === undefined) return null;

  const sections = /<\/?section\b[^>]*>/gi;
  sections.lastIndex = opening.index;
  let depth = 0;
  let tag;
  while ((tag = sections.exec(source))) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return {
          html: source.slice(opening.index, sections.lastIndex),
          start: opening.index,
          end: sections.lastIndex
        };
      }
    } else {
      depth += 1;
    }
  }
  return null;
}

function heroAnchors(hero) {
  return [...hero.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, content]) => ({
    classes: (attributes.match(/\bclass=(["'])(.*?)\1/)?.[2] || "").split(/\s+/),
    href: attributes.match(/\bhref=(["'])(.*?)\1/)?.[2],
    text: content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
  }));
}

function homepageHero() {
  const home = readFileSync(deployed("index.html"), "utf8");
  const hero = outerSection(home, "atelier-hero");
  assert.ok(hero, "the generated homepage must contain the complete outer atelier hero");
  return { home, hero: hero.html, heroEnd: hero.end };
}

test("the hero boundary includes nested sections before locating the following intake form", () => {
  const fixture = '<section class="atelier-hero"><section><form class="intake-panel"></form></section><p>Hero proof</p></section><form class="intake-panel"></form>';
  const hero = outerSection(fixture, "atelier-hero");

  assert.ok(hero);
  assert.equal(fixture.indexOf('<form class="intake-panel">', hero.end), hero.end);
});

test("the deployable homepage hero states the approved V2 value proposition", () => {
  const { hero } = homepageHero();

  assert.match(hero, /<h1>Your silver, valued precisely\.<\/h1>/);
});

test("the deployable homepage hero presents both approved V2 actions", () => {
  const { hero } = homepageHero();
  const anchors = heroAnchors(hero);
  const primary = anchors.find((anchor) => anchor.href === "/contact?intent=pickup");
  const fallback = anchors.find((anchor) => anchor.href === "/accepted-materials");

  assert.ok(primary, "the primary pickup CTA must be an anchor to /contact?intent=pickup");
  assert.ok(primary.classes.includes("button"), "the primary pickup CTA must use the shared button class");
  assert.ok(primary.classes.includes("button-primary"), "the primary pickup CTA must use the primary button class");
  assert.equal(primary.text, "Schedule a free pickup");
  assert.ok(fallback, "the fallback material CTA must be an anchor to /accepted-materials");
  assert.ok(fallback.classes.includes("button"), "the fallback material CTA must use the shared button class");
  assert.ok(fallback.classes.includes("button-secondary"), "the fallback material CTA must use the secondary button class");
  assert.equal(fallback.text, "See what we buy");
});

test("the deployable homepage hero uses one responsive V2 refining picture", () => {
  const { hero } = homepageHero();
  const pictures = hero.match(/<picture\b[\s\S]*?<\/picture>/g) || [];

  assert.equal(pictures.length, 1, "the hero must contain exactly one responsive picture");
  const [picture] = pictures;
  assert.match(picture, /<source media="\(max-width: 700px\)" srcset="\/assets\/ag-refining-hero-v2-mobile\.webp">/);
  assert.match(picture, /<img src="\/assets\/ag-refining-hero-v2-2048\.webp"/);
  assert.match(picture, /fetchpriority="high"/);
  assert.doesNotMatch(picture, /loading="lazy"/);
});

test("the deployable homepage keeps its supported proof rail inside the hero", () => {
  const { hero } = homepageHero();
  const requiredProof = ["Houston-based", "Free qualifying pickup", "On-site weighing", "Confirmed payment terms"];
  const rail = (hero.match(/<ul\b[\s\S]*?<\/ul>/g) || []).find((list) => requiredProof.every((proof) => list.includes(proof)));

  assert.ok(rail, "the proof rail must remain inside the hero");
  for (const proof of requiredProof) {
    assert.match(rail, new RegExp(`>\\s*${proof}\\s*<`));
  }
});

test("the material intake form begins after the closing homepage hero", () => {
  const { home, heroEnd } = homepageHero();
  const intakeStart = home.indexOf('<form class="intake-panel"');

  assert.ok(intakeStart > heroEnd, "the intake form must follow the closing hero section");
});

test("the generated homepage removes all assay-stage enhancement markup", () => {
  const home = readFileSync(deployed("index.html"), "utf8");

  assert.doesNotMatch(home, /data-assay-stage/);
  assert.doesNotMatch(home, /assay-canvas-host/);
  assert.doesNotMatch(home, /assay-fallback/);
});

test("the homepage omits the redundant material guide while internal pages retain it", () => {
  const home = readFileSync(deployed("index.html"), "utf8");
  const materials = readFileSync(deployed("accepted-materials/index.html"), "utf8");

  assert.doesNotMatch(home, /<details class="material-guide">/);
  assert.match(materials, /<details class="material-guide">/);
});

test("the shared site script does not boot the retired assay scene", () => {
  const site = readFileSync(join(root, "src", "site.js"), "utf8");

  assert.doesNotMatch(site, /import\(\s*["']\/assay-scene\.js(?:[?"'])/);
  assert.doesNotMatch(site, /querySelector\(\s*["']\[data-assay-stage\]["']\s*\)/);
});

test("owned V2 hero assets decode at exact intrinsic sizes within first-paint budgets", async () => {
  const cases = [
    ["ag-refining-hero-v2-2048.webp", 2048, 1152, 280 * 1024],
    ["ag-refining-hero-v2-mobile.webp", 960, 1280, 180 * 1024]
  ];

  for (const [name, width, height, byteLimit] of cases) {
    const path = join(root, "assets", name);
    assert.ok(existsSync(path), `${name} is missing`);
    const metadata = await sharp(path).metadata();
    assert.equal(metadata.width, width, `${name} width`);
    assert.equal(metadata.height, height, `${name} height`);
    assert.ok(statSync(path).size <= byteLimit, `${name} exceeds ${byteLimit} bytes`);
  }
});

test("build output keeps authoring state private and retains the 39-document route contract", () => {
  const files = walk(dist);
  const html = files.filter((path) => path.endsWith(".html"));
  assert.equal(html.length, 39);

  const deployableText = files
    .filter((path) => /\.(?:html|css|js)$/.test(path))
    .map((path) => `${relative(dist, path)}\n${readFileSync(path, "utf8")}`)
    .join("\n");
  assert.doesNotMatch(deployableText, /\.img2threejs/);
});
