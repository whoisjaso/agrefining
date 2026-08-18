# AG Refining Release Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AG Refining homepage, mobile navigation, image system, footer, and loading behavior into a sharp, coherent, mobile-first release ready for deployment today.

**Architecture:** Preserve the static-site generator and progressive-enhancement model. Split new behavior into focused `home-loader.js` and existing site chrome controllers, keep navigation/fallback HTML server-rendered, and drive all visual assets through deterministic responsive image manifests.

**Tech Stack:** Node.js static generator, semantic HTML, CSS, vanilla JavaScript, Node test runner, Playwright/Chromium, Sharp asset processing, OpenAI image generation, Vercel.

## Global Constraints

- Primary CTA label is exactly `Schedule a Free Pickup` in English and `Programar Una Recogida Gratis` in Spanish shared chrome.
- Every eyebrow, small section label, H2, H3, and card heading is Title Case in generated HTML.
- Mobile navigation is a compact top-right anchored panel and never a bottom sheet, full-screen mask, blurred layer, or dark scrim.
- The mobile pickup dock is the only interface that rises from the bottom.
- Homepage hero fills the complete initial viewport and does not reserve header height.
- Homepage canvas color is `#102a43`; paper surfaces use `#faf8f2`.
- Material cards use 4:3 images with 1280×960 and 800×600 responsive WebP variants.
- No invented testimonials, revenue figures, certifications, locations, people, or operational claims.
- All current canonical routes remain unchanged.
- Reduced-motion mode keeps content immediately available and removes nonessential animation.

---

### Task 1: Mobile Hero, Navigation, Pickup Dock, And Loader

**Files:**
- Create: `src/home-loader.js`
- Modify: `scripts/build.mjs`
- Modify: `src/site.js`
- Modify: `src/style.css`
- Test: `tests/mobile-homepage-contract.test.mjs`
- Test: `tests/site-chrome-browser.mjs`

**Interfaces:**
- Produces `data-loader-state`, `data-visible`, and `data-nav-enhanced` states consumed by CSS and browser tests.
- Preserves the existing `home-header-reveal.js` threshold and fail-open contract.

- [ ] Write failing contracts asserting a full-viewport hero, compact anchored mobile panel, transparent/unfiltered outside-click layer, one inert-aware bottom CTA, footer collision avoidance, and a 1.2-second loader fail-open.
- [ ] Run `node scripts/build.mjs && node --test tests/mobile-homepage-contract.test.mjs` and confirm failures describe the old bottom sheet and missing loader.
- [ ] Implement the semantic loader markup/module, compact top-right navigation geometry, redesigned toggle, full-viewport hero sizing, and bottom-dock state controller.
- [ ] Add reduced-motion, keyboard, safe-area, and no-JavaScript fallback behavior.
- [ ] Run targeted Node and browser tests until green.
- [ ] Commit only Task 1 files with message `Rebuild mobile hero and navigation chrome`.

### Task 2: Title Case And Exhaustive Footer

**Files:**
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `tests/generated-interaction-contract.test.mjs`
- Create: `tests/footer-navigation-contract.test.mjs`

**Interfaces:**
- Produces the complete footer route inventory and localized shared chrome used across all generated pages.

- [ ] Write failing tests that enumerate every expected material, industry, service-area, company, process, contact, and privacy destination exactly once in the footer.
- [ ] Write failing tests that reject sentence-case eyebrows, H2s, H3s, and card headings in generated homepage HTML.
- [ ] Run the targeted tests and confirm failures identify the incomplete footer and lowercase labels.
- [ ] Update source copy to intentional Title Case without CSS-only capitalization.
- [ ] Build accessible desktop footer columns and mobile disclosure groups while preserving canonical routes.
- [ ] Run route, localization, duplicate-ID, and footer tests until green.
- [ ] Commit only Task 2 files with message `Complete title case and footer navigation`.

### Task 3: Material Card And Responsive Asset System

**Files:**
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `scripts/optimize-asset.mjs`
- Create: `tests/material-image-contract.test.mjs`
- Replace: selected `assets/material-*.webp`

**Interfaces:**
- Produces a material image manifest mapping each route to 1280×960 and 800×600 assets plus focal-position metadata.

- [ ] Write failing tests for 17 distinct material destinations, separated card boxes, 4:3 dimensions, `srcset`, `sizes`, lazy loading below fold, and zero obsolete filenames.
- [ ] Generate the ten approved physically accurate material master images with the shared documentary-photography continuity prompt.
- [ ] Inspect every generated master and reject mislabeled, duplicated, distorted, branded, or text-bearing output.
- [ ] Export deterministic 1280×960 and 800×600 WebP derivatives and wire the manifest into all homepage and inner-route markup.
- [ ] Replace merged-grid CSS with separated editorial boxes and asset-specific focal positions.
- [ ] Run material, media, route, and broken-image browser tests until green.
- [ ] Commit only Task 3 files with message `Rebuild material cards and imagery`.

### Task 4: Service-Area Visual System

**Files:**
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Create: `tests/service-area-image-contract.test.mjs`
- Create: `assets/service-area-*-1280.webp`
- Create: `assets/service-area-*-800.webp`

**Interfaces:**
- Produces seven distinct responsive service-area image pairs for the index and route templates while retaining all 23 city links.

- [ ] Write failing tests for seven unique service-area image pairs, 4:3 dimensions, nonzero files, responsive markup, and all 23 route links.
- [ ] Generate and inspect distinct hyper-realistic Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, and Conroe scenes with no fake signage or legible generated text.
- [ ] Export optimized responsive WebPs and replace arbitrary material-photo mappings.
- [ ] Redesign the service-area grid as clearly separated cards with consistent crop, city label, service explanation, and route action.
- [ ] Run service-area, image, route, and browser tests until green.
- [ ] Commit only Task 4 files with message `Replace service area visual system`.

### Task 5: Final Media, Motion, And Release Verification

**Files:**
- Replace: `images/ag-refining-molten-pour-poster.webp`
- Modify: `src/style.css`
- Modify: `tests/cinematic-hero-browser.mjs`
- Modify: `tests/cinematic-media-contract.test.mjs`
- Modify: `scripts/verify.mjs`
- Create: `docs/qa/ag-refining-release-correction.md`

**Interfaces:**
- Consumes all prior markup, controller, and asset contracts and produces the release evidence record.

- [ ] Generate and inspect a 2560×1440 physically credible molten-silver loading poster with a clean left-side copy field.
- [ ] Verify production source clips retain 1280×720 or higher intrinsic resolution and no build step downscales them to 640×360.
- [ ] Calibrate overlay opacity and focal positions against all three poster/video states at mobile and desktop sizes.
- [ ] Run `npm test`, `npm run test:assay`, `npm run test:media`, `npm run check`, `node scripts/verify.mjs`, and `git diff --check`.
- [ ] Run the browser matrix at 320, 390, 768, 900, 901, and 1440 widths with keyboard and reduced-motion cases; record any environment failure separately from product assertions.
- [ ] Perform the frontend quality-rubric critique and remove at least one unnecessary visual/copy element.
- [ ] Write the QA evidence document with exact commands, counts, media dimensions, and remaining constraints.
- [ ] Commit Task 5 with message `Verify AG Refining release correction`.
