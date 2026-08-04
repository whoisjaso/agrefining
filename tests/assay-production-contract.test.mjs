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

test("the deployable homepage preserves conversion while adding one static assay stage", () => {
  const home = readFileSync(deployed("index.html"), "utf8");
  const hero = home.match(/<section class="atelier-hero"[\s\S]*?<\/section>/)?.[0] || "";
  const stage = home.match(/<div class="hero-media assay-stage"[\s\S]*?<div class="shell hero-commercial-grid">/)?.[0] || "";

  assert.equal((home.match(/data-assay-stage/g) || []).length, 1);
  assert.match(home, /data-assay-state="fallback"/);
  assert.match(home, /data-assay-canvas-host hidden aria-hidden="true"/);
  assert.match(home, /ag-assay-monolith-mobile\.webp/);
  assert.match(home, /ag-assay-monolith-1280\.webp/);
  assert.match(home, /fetchpriority="high"/);
  assert.doesNotMatch(stage, /loading="lazy"/);
  assert.match(home, /ag-silver-hero-1600\.webp/);
  assert.equal((hero.match(/href="\/contact\?intent=pickup"/g) || []).length, 1);
  assert.match(hero, /href="tel:\+12818982719"/);
  assert.match(stage, /alt="Cast-silver AG assay monolith with a blue line, concentric well, and Ag 47 mark"/);
  assert.doesNotMatch(stage, /<canvas\b/i);
});

test("the contract suite retains its independent lower industrial proof-image assertion", () => {
  const ownSource = readFileSync(fileURLToPath(import.meta.url), "utf8");
  const protectedAssertion = ["assert", ".match(home, /ag-silver", "-hero-1600\\.webp/);"].join("");
  assert.ok(ownSource.includes(protectedAssertion), "the lower industrial asset assertion was deleted from this suite");
});

test("owned fallback assets decode at exact intrinsic sizes within first-paint budgets", async () => {
  const cases = [
    ["ag-assay-monolith-1280.webp", 1280, 819, 180 * 1024],
    ["ag-assay-monolith-mobile.webp", 720, 461, 100 * 1024]
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

test("the exact Three core and its MIT license are packaged locally inside byte budgets", () => {
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const threeModule = deployed("assets/vendor/three.module.min.js");
  const threeCore = deployed("assets/vendor/three.core.min.js");
  const license = deployed("assets/vendor/three.LICENSE.txt");

  assert.equal(packageJson.devDependencies.three, "0.185.1");
  assert.ok(existsSync(threeModule), "local Three module is missing");
  assert.ok(existsSync(threeCore), "local Three core dependency is missing");
  assert.ok(existsSync(license), "local Three license is missing");
  assert.match(readFileSync(license, "utf8"), /MIT License/);
  assert.ok(statSync(threeModule).size <= 380 * 1024, "raw Three module exceeds 380 KiB");
  assert.ok(statSync(threeCore).size <= 380 * 1024, "raw Three core dependency exceeds 380 KiB");
  assert.match(readFileSync(threeModule, "utf8"), /["']\.\/three\.core\.min\.js["']/);
});

test("the deployable scene is small, self-hosted, and excludes addon or authoring paths", () => {
  const scenePath = deployed("assay-scene.js");
  assert.ok(existsSync(scenePath), "deployable assay scene is missing");
  const scene = readFileSync(scenePath, "utf8");
  const imports = [...scene.matchAll(/\bimport\s*\(\s*(["'][^"']+["'])\s*\)|\bimport\s+(?:[^"']+\s+from\s+)?(["'][^"']+["'])/g)]
    .map((match) => (match[1] || match[2]).slice(1, -1));

  assert.deepEqual(imports, ["/assets/vendor/three.module.min.js"]);
  assert.ok(statSync(scenePath).size <= 36 * 1024, "raw assay scene exceeds 36 KiB");
  assert.doesNotMatch(scene, /https?:\/\//);
  assert.doesNotMatch(scene, /OrbitControls|EffectComposer|BokehPass|UnrealBloomPass|RoomEnvironment|three\/examples|three\/addons/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /onFallback\("context-lost"\)/);
});

test("the procedural body stays neutral satin silver with the planned rounded cast silhouette", () => {
  const scene = readFileSync(join(root, "src", "assay-scene.js"), "utf8");
  const css = readFileSync(join(root, "src", "style.css"), "utf8");

  assert.match(scene, /const radius = 0\.16;/);
  assert.match(scene, /curveSegments: 5/);
  assert.match(scene, /bevelSegments: 4/);
  assert.match(scene, /bevelSize: 0\.1/);
  assert.match(scene, /bevelThickness: 0\.1/);
  assert.match(scene, /0\.025 \* \(1 - radial\)/);
  assert.doesNotMatch(scene, /Math\.(?:sin|cos)\(|RepeatWrapping|%\s*(?:251|307)/);
  assert.match(scene, /ClampToEdgeWrapping/);
  assert.doesNotMatch(scene, /#b6a699|#273c51|0x293c4f|0x95b8d2|rgba\(47,\s*82,\s*112/);
  assert.doesNotMatch(css, /inset:\s*52%\s+9%\s+4%/);
  assert.match(css, /\.assay-stage::before\s*\{[^}]*filter:\s*blur\(/s);
  assert.match(scene, /const compact = window\.innerWidth < 900;/);
  assert.match(scene, /selectAssayPixelRatio\(window\.innerWidth, window\.devicePixelRatio\)/);
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

test("generated bootstrap and CSS keep enhancement late, decorative, and reversible", () => {
  const home = readFileSync(deployed("index.html"), "utf8");
  const site = readFileSync(deployed("site.js"), "utf8");
  const css = readFileSync(deployed("style.css"), "utf8");

  assert.match(home, /<script src="\/site\.js\?v=20260804-assay" defer><\/script>/);
  assert.doesNotMatch(home, /<script[^>]+(?:three|assay-scene)/i);
  assert.match(site, /import\("\/assay-scene\.js\?v=20260804-assay"\)/);
  assert.match(site, /requestIdleCallback/);
  assert.match(site, /rootMargin:\s*"200px 0px"/);
  assert.match(site, /pagehide/);
  assert.match(css, /\.assay-stage\[data-assay-state="ready"\]\s+\.assay-fallback/);
  assert.match(css, /\.assay-stage\[data-assay-state="ready"\]\s+\.assay-canvas-host/);
  assert.match(css, /\.assay-stage\s*\{[^}]*z-index:\s*2/s);
  assert.match(css, /@media print[\s\S]*?\.assay-canvas-host[\s\S]*?display:\s*none\s*!important/);
  assert.match(css, /@media print[\s\S]*?\.assay-fallback[\s\S]*?opacity:\s*1\s*!important/);
});
