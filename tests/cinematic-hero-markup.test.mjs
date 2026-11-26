import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

test("browser provenance resolves the current branch base dynamically", () => {
  const browserHarness = readFileSync(join(root, "tests", "cinematic-hero-browser.mjs"), "utf8");
  const expectedBase = execFileSync("git", ["merge-base", "HEAD", "main"], { cwd: root, encoding: "utf8" }).trim();
  assert.doesNotMatch(browserHarness, /const baseCommit = "[0-9a-f]{40}"/);
  assert.match(browserHarness, /merge-base/);
  assert.equal(expectedBase.length, 40);
});

test("the standard verification gate runs the site chrome browser scenarios once", () => {
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.match(packageJson.scripts.verify, /npm run test:site-chrome/);
  assert.equal(packageJson.scripts["test:site-chrome"], "node tests/site-chrome-browser.mjs");
  assert.doesNotMatch(packageJson.scripts["test:browser"], /site-chrome-browser/);
});

function outerElement(source, className) {
  const opening = new RegExp(`<([\\w-]+)\\b(?=[^>]*\\bclass=(?:"(?:[^"]*\\s)?${className}(?:\\s[^"]*)?"|'(?:[^']*\\s)?${className}(?:\\s[^']*)?'))[^>]*>`, "i").exec(source);
  if (!opening || opening.index === undefined) return null;

  const tagName = opening[1];
  const elements = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  elements.lastIndex = opening.index;
  let depth = 0;
  let tag;
  while ((tag = elements.exec(source))) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        const contentStart = opening.index + opening[0].length;
        return {
          html: source.slice(opening.index, elements.lastIndex),
          inner: source.slice(contentStart, tag.index),
          start: opening.index,
          end: elements.lastIndex
        };
      }
    } else {
      depth += 1;
    }
  }
  return null;
}

function outerElements(source, className) {
  const elements = [];
  let offset = 0;
  while (offset < source.length) {
    const element = outerElement(source.slice(offset), className);
    if (!element) break;
    elements.push({ ...element, start: element.start + offset, end: element.end + offset });
    offset += element.end;
  }
  return elements;
}

function attributes(element) {
  return element.html.match(/^<[^>]+>/)?.[0] || "";
}

function cssRule(stylesheet, selector) {
  const match = stylesheet.match(new RegExp(`${selector.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  return match?.[1] || "";
}

function directCssRules(stylesheet, selector) {
  return [...stylesheet.matchAll(new RegExp(`^\\s*${selector.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*\\{([^}]*)\\}`, "gm"))].map((match) => match[1]);
}

function homepageHero() {
  const home = readFileSync(join(dist, "index.html"), "utf8");
  const hero = outerElement(home, "atelier-hero");
  assert.ok(hero, "the generated homepage must contain the complete atelier hero");
  return { home, hero: hero.html, heroEnd: hero.end };
}

test("the generated hero directly nests the permanent poster and exactly two inert video layers", () => {
  const { hero } = homepageHero();
  const media = outerElements(hero, "cinematic-hero-media");

  assert.equal(media.length, 1, "the static V2 picture must be replaced by one cinematic media shell");
  const posters = outerElements(media[0].inner, "cinematic-hero-poster");
  const stacks = outerElements(media[0].inner, "cinematic-hero-video-stack");
  assert.equal(posters.length, 1, "the cinematic shell must retain one permanent poster");
  assert.equal(stacks.length, 1, "the cinematic shell must contain one video stack");
  const [poster] = posters;
  const [stack] = stacks;
  assert.equal(media[0].inner.slice(0, poster.start).trim(), "", "the poster must be a direct first child of the media shell");
  assert.equal(media[0].inner.slice(poster.end, stack.start).trim(), "", "the video stack must directly follow the poster");
  assert.equal(media[0].inner.slice(stack.end).trim(), "", "the video stack must be the final direct child of the media shell");
  assert.match(poster.html, /<source media="\(max-width: 767px\), \(orientation: portrait\)" srcset="\/images\/ag-refining-process-01-pile-poster-mobile\.webp" width="540" height="960">/, "phones and portrait viewports must get the 540x960 portrait poster, not the desktop asset");
  assert.match(poster.html, /<img src="\/images\/ag-refining-process-01-pile-poster\.webp" alt="" width="1920" height="1080" fetchpriority="high">/);
  assert.doesNotMatch(poster.html, /loading="lazy"/);

  const videos = outerElements(stack.inner, "cinematic-hero-video");
  assert.equal(videos.length, 2, "an added third cinematic video layer would be a visual and bandwidth regression");
  for (const [index, video] of videos.entries()) {
    const videoAttributes = attributes(video);
    assert.match(videoAttributes, new RegExp(`data-video-layer="${index}"`));
    for (const required of ["autoplay", "muted", "playsinline", 'aria-hidden="true"', 'tabindex="-1"', 'preload="none"']) {
      assert.match(videoAttributes, new RegExp(`\\b${required}`), `video ${index} must include ${required}`);
    }
    assert.doesNotMatch(videoAttributes, /\b(?:controls|loop)\b/, `video ${index} must stay inert`);
    const sources = [...video.inner.matchAll(/<source\b([^>]*)>/g)].map((match) => match[1]);
    assert.equal(sources.length, 2, `video ${index} must defer exactly two source formats`);
    assert.match(sources[0], /data-video-format="webm"/);
    assert.match(sources[0], /type='video\/webm; codecs="vp9"'/);
    assert.match(sources[1], /data-video-format="mp4"/);
    assert.match(sources[1], /type='video\/mp4; codecs="avc1\.64001F"'/);
    for (const source of sources) assert.doesNotMatch(source, /\bsrc=/, `video ${index} sources must not load in server HTML`);
  }
  assert.doesNotMatch(hero, /\/assets\/ag-refining-hero-v2-[^"']+\.webp/);
});

test("the generated hero keeps the stable overlay behind the streamlined commercial content", () => {
  const { home, hero, heroEnd } = homepageHero();
  const overlay = outerElements(hero, "cinematic-hero-overlay");
  assert.equal(overlay.length, 1, "the poster and video layers need one stable overlay");
  assert.ok(hero.indexOf('class="cinematic-hero-media"') < hero.indexOf('class="cinematic-hero-overlay"'));
  assert.ok(hero.indexOf('class="cinematic-hero-overlay"') < hero.indexOf('class="shell hero-commercial-grid"'));
  assert.equal((hero.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1);
  assert.match(hero, /<h1>Houston Silver Buyer, Valued Precisely\.<\/h1>/);
  assert.doesNotMatch(hero, /class="hero-kicker"/, "the hero kicker should be removed to keep the first screen quieter");
  // Minimal hero: one headline, one short line, one button. Nothing else competes with the film.
  assert.match(hero, /<p class="hero-lede">See the weight\. You decide\.<\/p>/);
  assert.match(hero, /href="\/contact\?intent=pickup">Schedule a Free Pickup<\/a>/);
  assert.equal((hero.match(/<a\b/g) || []).length, 1, "the hero must carry exactly one action");
  assert.doesNotMatch(hero, /href="tel:/, "the call link lives in the menu and lower on the page, not in the hero");
  assert.doesNotMatch(hero, /hero-proof-rail/, "the proof points live in the band below the hero");
  assert.match(home.slice(heroEnd), /class="trust-ledger"[\s\S]*?Houston-based[\s\S]*?Free qualifying pickup[\s\S]*?On-site weighing[\s\S]*?Confirmed payment terms/, "the four proof points must stay on the page below the hero");
  assert.ok(home.indexOf('<form class="intake-panel"') > heroEnd, "the material intake form must begin after the closing hero");
});

test("the built stylesheet isolates layered hero media with stationary overlay and responsive framing", () => {
  const stylesheet = readFileSync(join(dist, "style.css"), "utf8");
  const heroRule = cssRule(stylesheet, ".atelier-hero");
  const mediaRule = cssRule(stylesheet, ".cinematic-hero-media");
  const coverRule = cssRule(stylesheet, ".cinematic-hero-poster img,\n.cinematic-hero-video");
  const videoRule = directCssRules(stylesheet, ".cinematic-hero-video").find((rule) => rule.includes("transition:")) || "";
  const overlayRule = cssRule(stylesheet, ".cinematic-hero-overlay");
  const gridRule = cssRule(stylesheet, ".hero-commercial-grid");
  const cinematicDeclarations = [...stylesheet.matchAll(/(?:^|,)\s*\.cinematic-hero(?:-[\w]+)*(?:\s+img)?\s*\{([^}]*)\}/gm)].map((match) => match[1]);

  for (const [rule, expected] of [[heroRule, "position: relative"], [heroRule, "overflow: hidden"], [heroRule, "isolation: isolate"], [mediaRule, "position: absolute"], [mediaRule, "inset: 0"], [mediaRule, "z-index: 0"], [coverRule, "height: 100%"], [coverRule, "width: 100%"], [coverRule, "object-fit: cover"], [coverRule, "pointer-events: none"], [overlayRule, "position: absolute"], [overlayRule, "inset: 0"], [overlayRule, "pointer-events: none"], [overlayRule, "z-index: 1"], [gridRule, "z-index: 2"]]) {
    assert.match(rule, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(videoRule, /inset:\s*0/);
  assert.match(videoRule, /position:\s*absolute/);
  assert.match(videoRule, /transition:\s*opacity 800ms cubic-bezier\(0\.4, 0, 0\.2, 1\)/, "a 300ms cinematic fade would be too abrupt");
  assert.match(overlayRule, /linear-gradient\(90deg, rgba\(0, 0, 0, 0\.62\) 0%, rgba\(0, 0, 0, 0\.5\) 26%, rgba\(0, 0, 0, 0\.32\) 44%, rgba\(0, 0, 0, 0\.12\) 66%, rgba\(0, 0, 0, 0\.04\) 100%\)/, "the stationary gradient belongs on the overlay and is black, never navy");
  assert.match(overlayRule, /linear-gradient\(180deg, rgba\(0, 0, 0, 0\.16\) 0%, transparent 30%, rgba\(0, 0, 0, 0\.2\) 100%\)/);
  assert.doesNotMatch(overlayRule, /rgba\(3, 22, 36|#102a43|#071827/, "no navy tint over the film");
  assert.doesNotMatch(overlayRule, /transition:/, "the stationary overlay must not animate");
  assert.doesNotMatch(coverRule, /filter:|backdrop-filter:/, "hero media must not use CSS filters");
  assert.doesNotMatch(videoRule, /filter:|backdrop-filter:/, "hero videos must not use CSS filters");
  assert.doesNotMatch(overlayRule, /filter:|backdrop-filter:/, "the hero overlay must not use CSS filters");
  assert.doesNotMatch(videoRule, /linear-gradient/, "moving the stable overlay gradient onto a video layer would cause visual flashes");
  assert.ok(cinematicDeclarations.length > 0, "cinematic layer rules must be present");
  for (const declarations of cinematicDeclarations) assert.doesNotMatch(declarations, /z-index:\s*-/);
  assert.match(stylesheet, /\.cinematic-hero-poster img,\s*\.cinematic-hero-video[\s\S]*?object-position:\s*70% center/);
  assert.match(stylesheet, /@media \(max-width: 1100px\)[\s\S]*?\.cinematic-hero-poster img,\s*\.cinematic-hero-video[\s\S]*?object-position:\s*74% center/);
  assert.match(stylesheet, /@media \(max-width: 700px\)[\s\S]*?\.cinematic-hero-poster img,\s*\.cinematic-hero-video[\s\S]*?object-position:\s*50% center/);
  // The film plays for everyone; reduced motion only drops the crossfade, it never hides the video.
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.cinematic-hero-video,\s*\.cinematic-hero-poster\s*\{\s*transition:\s*none;\s*\}/);
  assert.doesNotMatch(stylesheet, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.cinematic-hero-video\s*\{[^}]*opacity:\s*0/);
});

// Mutation killed: compact desktop reserves 6.5rem for a header that renders at 7rem.
test("the compact-desktop materials panel clears the complete sticky header", () => {
  const stylesheet = readFileSync(join(dist, "style.css"), "utf8");
  const compactDesktop = stylesheet.match(/@media \(max-width: 1100px\)\s*\{([\s\S]*?)\n\}\n\n@media \(max-width: 900px\)/)?.[1] || "";
  assert.match(compactDesktop, /:root\s*\{[^}]*--header-height:\s*7rem;/, "901-1100px must reserve the rendered 2rem utility bar plus 5rem navigation row");
});

// Mutation killed: the eager poster disappears instantly while the first video is still fading in.
test("the first poster crossfades with the active video instead of exposing the hero background", () => {
  const stylesheet = readFileSync(join(dist, "style.css"), "utf8");
  assert.match(stylesheet, /\.cinematic-hero-poster\s*\{[^}]*opacity:\s*1;[^}]*transition:\s*opacity 800ms cubic-bezier\(0\.4, 0, 0\.2, 1\);/);
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.cinematic-hero-video,\s*\.cinematic-hero-poster\s*\{\s*transition:\s*none;/);
});

test("the single hero action keeps a comfortable tap target", () => {
  const stylesheet = readFileSync(join(dist, "style.css"), "utf8");
  assert.match(stylesheet, /\.atelier-hero \.hero-actions \.button\s*\{[^}]*min-height:\s*3\.5rem;/);
});
