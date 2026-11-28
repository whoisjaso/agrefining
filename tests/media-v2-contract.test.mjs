import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const page = (route) => readFileSync(join(dist, route, "index.html"), "utf8");

test("every Media v2 file a page references exists in the build", () => {
  const routes = ["", "about", "how-it-works", "contact", "espanol", "faq", "sell", "vender", "service-areas", "accepted-materials", "guides/how-silver-is-valued"];
  for (const route of routes) {
    for (const [, file] of page(route).matchAll(/\/assets\/(v2\/[a-z0-9-]+\.(?:webp|jpg))/g)) {
      assert.ok(existsSync(join(dist, "assets", file)), `${route || "home"}: missing ${file}`);
    }
  }
  assert.ok(!existsSync(join(dist, "assets", "v2", "MAP.md")), "the mapping note is not published");
});

test("inner pages carry one short dark hero and preload only that image", () => {
  for (const [route, base] of [["about", "hero-about"], ["how-it-works", "hero-how-it-works"], ["contact", "hero-contact"], ["espanol", "hero-espanol"]]) {
    const html = page(route);
    assert.match(html, /<section class="page-hero page-hero-art page-intro[^"]*">/);
    assert.match(html, new RegExp(`<picture class="page-hero-backdrop"><source media="\\(max-width: 700px\\)" srcset="/assets/v2/${base}-mobile-720\\.webp 720w, /assets/v2/${base}-mobile\\.webp 1080w" sizes="100vw" width="1080" height="1920"><img src="/assets/v2/${base}-1600\\.webp" srcset="/assets/v2/${base}-1600\\.webp 1600w, /assets/v2/${base}-2400\\.webp 2400w" sizes="100vw" alt="" width="1600" height="900" fetchpriority="high"`));
    const preloads = html.match(/<link rel="preload" as="image"[^>]*>/g) || [];
    assert.equal(preloads.length, 2, `${route}: one preload per breakpoint, for the hero only`);
    assert.ok(preloads.every((tag) => tag.includes(`/assets/v2/${base}-`)));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
  const css = readFileSync(join(dist, "style.css"), "utf8");
  assert.match(css, /\.page-hero-art::before \{[^}]*linear-gradient/, "a scrim keeps the words readable over the still");
});

test("guide, FAQ and pay-step stills are lazy with explicit sizes and a srcset", () => {
  const guides = readdirGuides();
  assert.equal(guides.length, 10);
  for (const route of [...guides, "faq"]) {
    const html = page(route);
    const figure = html.match(/<figure class="page-header-art">[\s\S]*?<\/figure>/)?.[0] || "";
    assert.match(figure, /<img src="\/assets\/v2\/[a-z-]+-1600\.webp" srcset="\/assets\/v2\/[a-z-]+-800\.webp 800w, \/assets\/v2\/[a-z-]+-1600\.webp 1600w" sizes="[^"]+" alt="[^"]+" width="1600" height="900" loading="lazy"/, `${route}: header still`);
    assert.doesNotMatch(html, /<link rel="preload" as="image"/, `${route}: nothing but the hero is ever preloaded`);
  }
  assert.match(page("how-it-works"), /<figure class="process-still"><img src="\/assets\/v2\/process-pay-1600\.webp"[^>]*width="1600" height="900" loading="lazy"/);
});

function readdirGuides() {
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  return [...sitemap.matchAll(/<loc>https:\/\/www\.agrefining\.com\/(guides\/[^<]+)<\/loc>/g)].map(([, route]) => route);
}

test("link previews use the 1200x630 section cards", () => {
  const cases = [["", "og-default"], ["about", "og-default"], ["accepted-materials", "og-materials"], ["sell-silver-coins-houston", "og-materials"], ["industries", "og-industries"], ["hospital-silver-recycling", "og-industries"], ["service-areas", "og-areas"], ["silver-buyer-katy", "og-areas"], ["guides", "og-guides"], ["guides/how-silver-is-valued", "og-guides"]];
  for (const [route, card] of cases) {
    const html = page(route);
    const url = `https://www.agrefining.com/assets/v2/${card}-1200x630.jpg`;
    assert.ok(html.includes(`<meta property="og:image" content="${url}">`), `${route || "home"}: og:image`);
    assert.ok(html.includes(`<meta name="twitter:image" content="${url}">`), `${route || "home"}: twitter:image`);
    assert.ok(html.includes('<meta property="og:image:width" content="1200">') && html.includes('<meta property="og:image:height" content="630">'), `${route || "home"}: 1200x630`);
  }
});

test("the home film stays and its facility still is the v2 hero still", () => {
  const home = page("");
  assert.match(home, /cinematic-hero/, "the process film is still the hero");
  assert.doesNotMatch(home, /loop-flatware/);
  assert.match(home, /<picture class="industrial-feature-picture"><source media="\(max-width: 700px\)" srcset="\/assets\/v2\/hero-home-mobile-720\.webp 720w, \/assets\/v2\/hero-home-mobile\.webp 1080w" sizes="100vw" width="1080" height="1920"><img src="\/assets\/v2\/hero-home-1600\.webp"[^>]*width="1600" height="900" loading="lazy"/);
});
