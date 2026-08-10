# Cinematic Hero, Materials, and Service Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an optimized, accessible three-clip cinematic homepage hero, a complete 17-destination materials system, corrected customer-facing terminology, and a cohesive silver-artifact service-area experience without redesigning the existing hero content or shared navigation structure.

**Architecture:** Keep the existing static Node build and progressively enhance server-rendered HTML. The hero always renders its first poster and stable overlays in HTML/CSS; an exported native `CinematicHeroVideo` controller owns exactly two video layers and activates only when motion and network preferences allow it. Materials use one display-only registry so existing routes are reused without duplicate sitemap entries. Service-area artwork is one shared, same-origin SVG symbol sheet rendered as accessible decorative geometry beside live HTML city text.

**Tech Stack:** Node.js ESM, static HTML generation, CSS, browser-native media APIs, `node:test`, Sharp, FFmpeg/ffprobe, Playwright/Chromium for bounded browser verification, Vercel static hosting.

## Global Constraints

- Work only in `/workspace/scratch/bfc565b217a9/agrefining/.worktrees/cinematic-materials` on `agent/ag-refining-cinematic-materials`.
- Follow strict TDD: add the narrow contract first, run it against the unchanged production source, record the expected RED, then make the smallest production change and record GREEN.
- Do not redesign or move the existing header, hero headline, lede, CTA buttons, phone link, or proof rail. Only the hero background media and stable protective overlay change.
- Preserve exact hero live copy and links: `Your silver, valued precisely.`, `Schedule a free pickup`, `See what we buy`, and `Call (281) 898-2719`.
- Keep the hero content stationary. Transitions may animate opacity only. Do not animate text, overlay, scale, blur, crop, brightness, position, or layout.
- Use the three supplied clips in this order: molten pour, silver ingots, precision assay. Use exactly two video elements. Start a transition at about 0.8 seconds remaining, crossfade for 800 milliseconds, and reset the outgoing layer only after the swap finishes.
- The permanent first poster must render without JavaScript. Reduced-motion, Save-Data, unsupported playback, and rejected autoplay retain a static first poster with no hidden download of the other clips.
- Every production video must be muted, inline, decorative, non-focusable, audio-free, locally hosted, and available as WebM first with MP4 fallback.
- The stable hero overlay is a separate layer above poster/video and below content. It combines the approved horizontal and vertical gradients and never changes between clips.
- Maintain the AG Refining visual language: deep navy, cream, cool silver, restrained amber, premium commercial presentation, claim-qualified copy, no unsupported operational promises.
- Use ordinary navigation and disclosure semantics, not ARIA menu roles. Closed dropdown links must not remain in the tab order after JavaScript enhancement. Escape returns focus to the disclosure control.
- Preserve all existing material and industry URLs. `/electronics-silver-recovery` is the seventeenth material destination, but remains generated only once through its existing industry registry.
- On `/accepted-materials`, the H1 is exactly `We purchase.` Silver oxide is first and spans the full two-column width; the remaining 16 destinations form eight two-column rows.
- Customer-facing industrial terminology is `Industrial NDT film`, with one explanatory use of `Industrial Non-Destructive Testing film`. Preserve medical X-ray wording on medical pages and retain the industrial route slug for link stability.
- Shared English navigation labels are exactly `Materials`, `Industries`, `Service Areas`, `How It Works`, and `Our Story`.
- `/how-it-works` H1 is exactly `Six simple steps from silver to cash.`
- Homepage featured labels are exactly `Sterling and flatware` and `Industrial NDT film`.
- Service-area city motifs are: Houston bayou/skyline, Pearland pear, Pasadena strawberry, Sugar Land cane/crystal/chimney, Katy rice/rail, The Woodlands pine cluster, and Conroe growth rings/rail. Do not use seals, protected logos, sports identities, NASA branding, or exact public-art copies.
- All custom city SVGs are decorative (`aria-hidden="true"`, `focusable="false"`); city names and descriptions remain live HTML.
- Keep all 39 generated HTML documents, 38 indexed routes, lead handling, mobile navigation, forms, CTA links, and non-home material guide behavior intact.
- Do not add React, Next.js, animation libraries, CDN imports, autoplay intervals, carousel chrome, visible video controls, or new runtime dependencies.
- Keep source and reports free of em dashes and emoji so `scripts/check.mjs` remains deterministic.
- Each task ends in a commit and an independent task review before the next shared-file task begins.

---

## Task 1: Produce and verify the local cinematic media set

**Files:**

- Create: `videos/ag-refining-molten-pour.mp4`
- Create: `videos/ag-refining-molten-pour.webm`
- Create: `videos/ag-refining-silver-ingots.mp4`
- Create: `videos/ag-refining-silver-ingots.webm`
- Create: `videos/ag-refining-precision-assay.mp4`
- Create: `videos/ag-refining-precision-assay.webm`
- Create: `images/ag-refining-molten-pour-poster.webp`
- Create: `images/ag-refining-silver-ingots-poster.webp`
- Create: `images/ag-refining-precision-assay-poster.webp`
- Create: `tests/cinematic-media-contract.test.mjs`
- Modify: `scripts/build.mjs`
- Modify: `scripts/check.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing media contract**

Add `tests/cinematic-media-contract.test.mjs`. It must execute `ffprobe` against the six source videos and use `sharp().metadata()` against the three posters. Expectations are hand-authored literals:

```js
const clips = [
  ["ag-refining-molten-pour", 6, 10],
  ["ag-refining-silver-ingots", 6, 10],
  ["ag-refining-precision-assay", 6, 10]
];
```

For every MP4 and WebM assert: file exists, size is greater than 100 KiB, exactly one video stream exists, zero audio streams exist, width is 1280, height is 720, frame rate is 24 fps, and duration is within the literal clip range. Assert H.264/yuv420p and a 2.5 MiB per-file ceiling for MP4. Assert VP9/yuv420p and a 2.0 MiB per-file ceiling for WebM. These ceilings include tolerance above the measured 1.2 to 2.0 MiB trial outputs but still fail materially under-optimized files. For every poster assert WebP, 1280 by 720, greater than 10 KiB, and below 96 KiB, which keeps meaningful tolerance above the measured 36 to 43 KiB trial files. After a build, assert all nine files exist at the exact `/dist/videos/...` and `/dist/images/...` paths.

- [ ] **Step 2: Run the focused contract and record RED**

Run:

```bash
node --test tests/cinematic-media-contract.test.mjs
```

Expected RED: missing production media directories/files. A syntax error or missing test dependency is not an acceptable RED.

- [ ] **Step 3: Transcode the supplied clips without audio**

Map the uploaded sources exactly:

```text
/workspace/scratch/bfc565b217a9/upload/hf_20260806_210417_241daa64-07f3-4f37-9d48-45a91b79abae.mp4 -> molten pour
/workspace/scratch/bfc565b217a9/upload/hf_20260806_211335_2efcdaf8-8476-4db9-aff8-508339b53065.mp4 -> silver ingots
/workspace/scratch/bfc565b217a9/upload/hf_20260807_055212_ee47fbe9-5622-4064-bf7e-9f73c4bbdfe5.mp4 -> precision assay
```

Use FFmpeg with deterministic production settings. MP4 settings: H.264 High profile, level 3.1, `yuv420p`, CRF 22, slow preset, 48-frame GOP, no audio/subtitle/data streams, BT.709 tags, and faststart. WebM settings: VP9 profile 0, `yuv420p`, CRF 31, row multithreading, 48-frame GOP, and no audio/subtitle/data streams. Do not copy the uploaded originals directly because the molten clip contains AAC audio.

Create WebP posters with Sharp or FFmpeg at these exact timestamps and quality 82:

```text
molten pour: 1.250 seconds
silver ingots: 0.500 seconds
precision assay: 0.750 seconds
```

- [ ] **Step 4: Copy media during the static build and make binary scanning deterministic**

In `scripts/build.mjs`, create `dist/videos` and `dist/images`, then recursively copy the source directories. In `scripts/check.mjs`, add `.mp4` and `.webm` to the binary extension allowlist. Do not move this media into `assets/`; the public URL contract is `/videos/...` and `/images/...`.

Add a focused package script:

```json
"test:media": "node --test tests/cinematic-media-contract.test.mjs"
```

- [ ] **Step 5: Run GREEN and inspect media metadata**

Run:

```bash
npm run build
npm run test:media
npm run check
git diff --check
```

Record exact output sizes, stream counts, codecs, dimensions, frame rate, duration, and poster metadata in the task report.

- [ ] **Step 6: Commit**

```bash
git add videos images tests/cinematic-media-contract.test.mjs scripts/build.mjs scripts/check.mjs package.json
git commit -m "feat: add optimized cinematic hero media"
```

---

## Task 2: Replace the static hero picture with a layered poster/video shell

**Files:**

- Create: `tests/cinematic-hero-markup.test.mjs`
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `scripts/verify.mjs`
- Modify: `tests/assay-production-contract.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing generated-markup contract**

Add `tests/cinematic-hero-markup.test.mjs`. Build first, extract the complete `.atelier-hero`, and assert observable HTML behavior:

- one `.cinematic-hero-poster` with an eager, dimensioned `/images/ag-refining-molten-pour-poster.webp` image;
- one `.cinematic-hero-video-stack` containing exactly two video elements;
- each video has `autoplay`, `muted`, `playsinline`, `aria-hidden="true"`, `tabindex="-1"`, no `controls`, no `loop`, and two source placeholders in WebM then MP4 order with no `src` attribute in server HTML;
- one stable `.cinematic-hero-overlay` sibling above the media and below `.hero-commercial-grid`;
- exactly one hero H1 and the unchanged hero copy, CTA URLs/labels, phone link, and four proof items;
- no old `/assets/ag-refining-hero-v2-*.webp` reference inside the hero;
- the material intake form still starts after the closing hero section.

Also assert the built stylesheet provides absolute/inset-zero/full-size/object-fit-cover/pointer-events-none media, an isolated/overflow-hidden hero, 800ms opacity-only transitions, and object positions 65%, 68%, and 72% at desktop/tablet/mobile. Expectations must be literals in the test, not parsed from production constants.

- [ ] **Step 2: Run the focused contract and record RED**

```bash
npm run build
node --test tests/cinematic-hero-markup.test.mjs
```

Expected RED: old responsive picture exists and the cinematic shell/layers do not.

- [ ] **Step 3: Render the permanent poster and exactly two inert video layers**

In the existing hero, replace only `.hero-media`. Keep `.hero-commercial-grid` byte-for-byte equivalent in visible copy and order. Render this semantic shape:

```html
<div class="cinematic-hero-media" aria-hidden="true" data-cinematic-hero-media>
  <picture class="cinematic-hero-poster" data-cinematic-poster>...</picture>
  <div class="cinematic-hero-video-stack" data-cinematic-video-stack>
    <video class="cinematic-hero-video" autoplay muted playsinline aria-hidden="true" tabindex="-1" preload="none" data-video-layer="0">...</video>
    <video class="cinematic-hero-video" autoplay muted playsinline aria-hidden="true" tabindex="-1" preload="none" data-video-layer="1">...</video>
  </div>
</div>
<div class="cinematic-hero-overlay" aria-hidden="true"></div>
```

Each video contains source placeholders ordered `video/webm` then `video/mp4`, identified by `data-video-format`, but no `src`. Include the boolean `autoplay` attribute so generated intent remains explicit; the controller still calls and catches `play()` after assigning sources. Set both video `poster` attributes to the first poster as an extra no-flash fallback. Do not put meaningful alt text on decorative media.

- [ ] **Step 4: Implement the isolated stacking context and stable overlays**

Use `position: relative`, `overflow: hidden`, and `isolation: isolate` on `.atelier-hero`. Within that context use media z-index 0, overlay z-index 1, and hero content z-index 2. Do not use a negative z-index that can escape behind the body.

Use the approved stationary gradients:

```css
background:
  linear-gradient(90deg, rgba(3, 22, 36, 0.98) 0%, rgba(3, 22, 36, 0.93) 28%, rgba(3, 22, 36, 0.72) 46%, rgba(3, 22, 36, 0.26) 68%, rgba(3, 22, 36, 0.08) 100%),
  linear-gradient(180deg, rgba(3, 22, 36, 0.15) 0%, transparent 28%, rgba(3, 22, 36, 0.18) 100%);
```

Poster and videos fill the hero with `object-fit: cover`, never affect layout, and use `pointer-events: none`. Video opacity transition is exactly `800ms cubic-bezier(0.4, 0, 0.2, 1)`. The overlay has no transition. Add CSS static fallbacks for reduced motion so video layers remain hidden and the poster remains visible.

- [ ] **Step 5: Replace the obsolete hero verifier with the new contract**

Update `scripts/verify.mjs` to check the real generated result rather than the retired picture. Migrate the retired responsive-picture and V2-image-budget assertions in `tests/assay-production-contract.test.mjs` to the permanent cinematic poster and two-layer shell while preserving every unrelated assay, hero-content, form-order, and material-guide assertion. Add `test:hero-markup` to `package.json` and include it in the normal `test` script.

- [ ] **Step 6: Run GREEN and mutation checks**

```bash
npm run build
npm run test:hero-markup
node scripts/verify.mjs
npm test
npm run check
git diff --check
```

In disposable copies, prove the focused test fails if a third video is added, if the overlay gradient is moved onto a video layer, if the transition changes to 300ms, or if the secondary CTA text changes.

- [ ] **Step 7: Commit**

```bash
git add tests/cinematic-hero-markup.test.mjs tests/assay-production-contract.test.mjs scripts/build.mjs src/style.css scripts/verify.mjs package.json
git commit -m "feat: layer the cinematic hero background"
```

---

## Task 3: Implement the reusable two-layer playback controller

**Files:**

- Create: `src/cinematic-hero-video.js`
- Create: `tests/cinematic-hero-runtime.test.mjs`
- Modify: `scripts/build.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the runtime tests against the wished-for API**

Import the production module directly in Node and test the exported class using real `EventTarget`-based fake video elements with complete media-facing properties. The API is:

```js
export class CinematicHeroVideo {
  constructor(root, options = {})
  start()
  destroy()
}
```

`root` supplies the two existing video layers and poster. `options` may inject `documentRef`, `connection`, `motionQuery`, `setTimeoutFn`, and `clearTimeoutFn` for deterministic tests. Default options use the browser globals. The tests must independently verify:

- exact clip order and first clip preparation;
- only the active clip uses `preload="auto"`, only the prepared next clip uses `preload="metadata"`, and the third clip has no source on initial load;
- WebM is assigned before MP4 on each prepared layer;
- reduced motion and Save-Data return before any video source is assigned or `load()` is called;
- `timeupdate` at 0.81 seconds remaining does not transition and at 0.79 seconds remaining begins one transition;
- `ended` starts the same guarded transition path;
- repeated `timeupdate`/`ended` events cannot create parallel transitions;
- the incoming layer begins playback before role swap, opacity classes change without touching hero content, and outgoing `currentTime` becomes zero only after transition completion;
- after clip three, the prepared index wraps to clip one;
- hidden documents pause both layers and visible documents safely resume the active layer plus the incoming layer when a transition was interrupted;
- hiding during a crossfade preserves one explicit transition phase and incoming-layer identity so visibility recovery cannot strand the fade, hard cut, or start a second transition;
- rejected `play()` promises are caught, leave the poster visible, and produce no unhandled rejection;
- an incoming-layer `error` or decode failure cancels only that transition, preserves the outgoing frame/poster, clears the lock, and defers another attempt until a later safe media event;
- `destroy()` removes listeners, clears every fallback timer, pauses both layers, removes sources, and prevents later events from restarting playback;
- a second mount after destroy creates one controller, not duplicated playback.

Name the exact production mutation each test kills before writing its body. Do not assert on fake call presence alone; assert resulting layer state, source assignment, preload, indices, and current time.

- [ ] **Step 2: Run the focused tests and record RED**

```bash
node --test tests/cinematic-hero-runtime.test.mjs
```

Expected RED: `src/cinematic-hero-video.js` does not exist or does not export the specified class. Resolve import errors until the test fails specifically on missing behavior before production code is written.

- [ ] **Step 3: Implement the controller as a small explicit state machine**

Use exactly these clip records:

```js
const CLIPS = [
  { key: "molten-pour", poster: "/images/ag-refining-molten-pour-poster.webp" },
  { key: "silver-ingots", poster: "/images/ag-refining-silver-ingots-poster.webp" },
  { key: "precision-assay", poster: "/images/ag-refining-precision-assay-poster.webp" }
];
```

Derive `/videos/ag-refining-${key}.webm` and `.mp4`. Keep playback bookkeeping in class fields rather than DOM text or render cycles: `activeIndex`, `nextIndex`, `activeLayerIndex`, `incomingLayerIndex`, `transitionPhase`, `transitioning`, `destroyed`, `wasPlayingBeforeHidden`, and a set of timer/listener cleanup functions.

`start()` is idempotent. It exits before source assignment if `motionQuery.matches` or `connection.saveData` is true. Otherwise it prepares clip 0 on layer 0 with auto preload and clip 1 on layer 1 with metadata preload, attaches one listener set, and calls a caught `play()` promise. The poster remains opaque until initial playback resolves.

Use `timeupdate` and `ended`, never an interval. Begin when a finite positive duration has `duration - currentTime <= 0.8`. Prepare and play the incoming layer, then set only opacity state. Finish on the relevant `transitionend`, with a 950ms fallback timer for background-tab/browser edge cases. On completion reset the outgoing time, swap roles, compute the wrapped next index, and prepare only that next clip.

On an incoming layer `error` or rejected decode/play attempt, cancel only the pending transition, keep the outgoing video/poster visible, remove incoming visible state, clear the lock, and defer another attempt until a later safe `timeupdate` or `ended` event. Never hard cut or recursively retry inside the error handler.

On `visibilitychange`, record the active/incoming identities and transition phase, then pause both layers. On return, safely resume the active layer and the incoming layer when that recorded phase represents an interrupted crossfade; otherwise resume only the active layer. The existing transition lock remains set until the original swap completes, so recovery cannot start another fade. Skip recovery when destroyed, reduced-motion, Save-Data, or autoplay rejection has put the controller in static mode. Register `pagehide` to destroy. Never throw from a rejected media promise.

Add a focused package script and include it in the normal `test` command:

```json
"test:hero-runtime": "node --test tests/cinematic-hero-runtime.test.mjs"
```

- [ ] **Step 4: Load the module only on the homepage**

Extend the document renderer with an optional `scripts` or `moduleScripts` list. The homepage includes `/cinematic-hero-video.js` as a module; other pages do not. Copy the source module to `dist/cinematic-hero-video.js` in `scripts/build.mjs`. Auto-initialize only roots matching `[data-cinematic-hero-media]`, store the instance on the root to prevent development-remount duplication, and destroy it on `pagehide`.

- [ ] **Step 5: Run GREEN, mutation checks, and syntax checks**

```bash
node --test tests/cinematic-hero-runtime.test.mjs
npm run build
npm test
node --check src/cinematic-hero-video.js
npm run check
git diff --check
```

In disposable copies, prove tests fail for: 800ms threshold changed to 1.5s, a third simultaneous layer prepared, removal of the transition guard, removal of visibility pause, removal of play/decode rejection handling, incoming `error` allowed to hide the outgoing frame, and omission of timer cleanup.

- [ ] **Step 6: Commit**

```bash
git add src/cinematic-hero-video.js tests/cinematic-hero-runtime.test.mjs scripts/build.mjs package.json
git commit -m "feat: rotate cinematic hero footage safely"
```

---

## Task 4: Build the complete materials navigation and purchase index

**Files:**

- Create: `tests/materials-navigation-contract.test.mjs`
- Create: `tests/materials-disclosure-runtime.test.mjs`
- Create: `src/materials-disclosure.js`
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `src/site.js`
- Modify: `scripts/verify.mjs`
- Modify: `tests/generated-interaction-contract.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing generated and interaction contracts**

Add a focused contract that builds the site and asserts:

- English shared nav labels use exact title case;
- one Materials page anchor remains directly navigable and one adjacent disclosure button controls one uniquely identified panel;
- the panel has exactly 17 unique material destinations grouped under `Featured`, `Silver forms`, `Industrial and laboratory`, `Imaging and healthcare`, and `Guides and trade`;
- Silver oxide is first and `/electronics-silver-recovery` appears once;
- desktop and mobile render ordinary link/list semantics with no `role="menu"` or `role="menuitem"`;
- accepted materials H1 is `We purchase.`;
- accepted materials renders exactly 17 unique `.taxonomy-card` destinations;
- the Silver oxide card is first and carries the full-width featured class;
- the remaining 16 cards are not featured;
- no route is duplicated in the sitemap;
- the homepage labels are `Sterling and flatware` and `Industrial NDT film`;
- `/industrial-x-ray-silver-recycling` has `Industrial NDT film` in its title, meta description, eyebrow, heading, intro, and visible related content and contains the expansion `Industrial Non-Destructive Testing film` once in explanatory body copy;
- the homepage card, English and Spanish footer labels, oil-and-gas route, Houston hub card, and industrial leaf on `/x-ray-recycling-services-houston` use NDT wording rather than industrial X-ray wording;
- generated customer-facing output contains no `Industrial X-ray`, `Industrial X-Ray`, or lowercase equivalent while internal slugs, form values, and image filenames may remain stable;
- medical X-ray pages retain their medically accurate wording;
- `/how-it-works` H1 is exactly `Six simple steps from silver to cash.`

Write `tests/materials-disclosure-runtime.test.mjs` against an exported `MaterialsDisclosure` class using complete `EventTarget`-based element fakes. Assert resulting open/closed state, `aria-expanded`, `hidden`/`inert`, focus return, outside close, fine-pointer hover, focus-leave, breakpoint reset, and first-Escape nested close behavior. The second Escape must remain unconsumed so the existing outer mobile sheet can close. Keep `tests/generated-interaction-contract.test.mjs` focused on generated no-JavaScript reachability and static header integrity; do not pretend plain `node:test` is a browser DOM.

- [ ] **Step 2: Run focused tests and record RED**

```bash
npm run build
node --test tests/materials-navigation-contract.test.mjs tests/generated-interaction-contract.test.mjs
node --test tests/materials-disclosure-runtime.test.mjs
```

Expected RED must identify the current 16-card index, old casing/copy, and missing dropdown behavior.

- [ ] **Step 3: Create one display-only material taxonomy registry**

Do not mutate generation ownership. Keep `materialPages`, `industryPages`, and `allServicePages` route generation unchanged. Create `materialTaxonomyItems` with exactly these destinations and group labels:

```text
Featured
Silver oxide watch batteries -> /silver-oxide-watch-battery-recycling-houston

Silver forms
Scrap silver -> /scrap-silver-buyer-houston
Scrap silver jewelry -> /scrap-silver-jewelry
Silver coins -> /sell-silver-coins-houston
Silver bars -> /sell-silver-bars-houston
Sterling and flatware -> /silver-flatware-buyer-houston
Silver-plated materials -> /silver-plated-materials-buyer-houston

Industrial and laboratory
Industrial silver -> /industrial-silver-scrap
Electronics silver recovery -> /electronics-silver-recovery
Silver flake -> /silver-flake-buyer-houston
Silver solder -> /silver-solder-buyer-houston
Laboratory silver -> /laboratory-silver-buyer-houston

Imaging and healthcare
Industrial NDT film -> /industrial-x-ray-silver-recycling
Medical X-ray film -> /medical-x-ray-recycling
Dental scrap -> /dental-scrap-buyer-houston

Guides and trade
X-ray recycling services -> /x-ray-recycling-services-houston
Jewelry-store silver recycling -> /jewelry-store-silver-recycling-houston
```

Resolve records by existing path so card images/copy remain sourced from the authoritative page objects. Never append electronics to `materialPages`.

- [ ] **Step 4: Render and enhance the Materials disclosure**

Keep a direct `<a href="/accepted-materials">Materials</a>` plus an adjacent 44px disclosure `<button>` with `aria-expanded`, `aria-controls`, and a text alternative such as `Show material pages`. Render one panel in the nav, grouped into ordinary headings and lists. Before enhancement, CSS opens that single panel on fine-pointer wrapper hover and `:focus-within`; focusing the direct Materials link or disclosure makes the nested links visible and reachable, so no duplicate `<noscript>` list is needed. On `start()`, JavaScript closes the same panel with `hidden` and `inert`, then owns deterministic click, Escape/focus return, outside click, focus-leave, fine-pointer hover, breakpoint reset, and mobile-sheet integration. Closed enhanced links remain outside the tab order.

Implement this behavior in an exported `MaterialsDisclosure` class in `src/materials-disclosure.js`, not as untestable inline logic in the shared script. Copy it to `dist` and load it as a module on generated pages. The existing `src/site.js` outer navigation dispatches one reset event when its sheet closes or its 900px media query changes. The nested class consumes Escape only while its own panel is open; the next Escape reaches the existing outer navigation handler.

Add `test:materials-runtime` for the runtime file and include both focused materials suites in the normal `test` command.

The panel uses navy/cream/silver tokens, one crisp boundary/elevation treatment, no nested card grid, no glass blur, and no decorative motion beyond the existing short nav timing.

- [ ] **Step 5: Render the 17-card accepted materials index**

Set H1 to `We purchase.` and keep the current explanatory intro/CTA. Render Silver oxide first as `.taxonomy-card.taxonomy-card-featured` spanning both columns. Render the remaining 16 items in the approved order as eight complete two-column rows. Keep responsive single-column behavior and existing card imagery. Do not add a number badge, slider, filter, or new promise.

- [ ] **Step 6: Apply exact casing and terminology corrections**

Change English shared labels to `Service Areas`, `How It Works`, and `Our Story`. Change the homepage material labels. Update the industrial route title, meta description, eyebrow, heading, intro/body, English and Spanish footer labels, dropdown, oil-and-gas material string, Houston hub card, and the industrial leaf title/copy on `/x-ray-recycling-services-houston` to NDT wording while leaving URLs, internal form values, and asset filenames unchanged. Include `Industrial Non-Destructive Testing film` once where first explained. Preserve medically accurate X-ray wording on `/medical-x-ray-recycling`, dental/medical passages, and the general X-ray recycling service hub title.

- [ ] **Step 7: Run GREEN and interaction mutation checks**

```bash
npm run build
node --test tests/materials-navigation-contract.test.mjs tests/generated-interaction-contract.test.mjs
node --test tests/materials-disclosure-runtime.test.mjs
npm test
node scripts/verify.mjs
node --check src/site.js
node --check src/materials-disclosure.js
npm run check
git diff --check
```

In disposable copies, prove tests fail when electronics is removed, Silver oxide loses full width, a duplicate sitemap URL is introduced, closed links remain focusable, Escape no longer returns focus, or industrial customer-facing `X-ray` is restored.

- [ ] **Step 8: Commit**

```bash
git add tests/materials-navigation-contract.test.mjs tests/materials-disclosure-runtime.test.mjs tests/generated-interaction-contract.test.mjs src/materials-disclosure.js scripts/build.mjs src/style.css src/site.js scripts/verify.mjs package.json
git commit -m "feat: expand materials navigation and purchase index"
```

---

## Task 5: Add a cohesive silver city-artifact service-area system

**Files:**

- Create: `assets/service-area-emblems.svg`
- Create: `tests/service-area-artifacts-contract.test.mjs`
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `scripts/verify.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing city-artifact contract**

Build and assert observable output for `/service-areas`:

- exactly seven featured routed city links, in the current route order;
- one distinct decorative emblem use per city with IDs `city-houston`, `city-pearland`, `city-pasadena`, `city-sugar-land`, `city-katy`, `city-the-woodlands`, and `city-conroe`;
- live city names and short silver-related descriptions remain outside the SVG;
- each corresponding location page renders its own emblem and the exact existing operational image source listed below;
- the marked `[data-service-coverage]` ledger has exactly 23 `<li>` values matching this literal ordered list: Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, Stafford;
- the SVG file contains seven unique symbols, no `<text>`, no raster data URI, no `filter`, no `feTurbulence`, and a normalized `viewBox` for every symbol;
- all emitted service-area SVG instances are `aria-hidden="true"` and `focusable="false"`.

Use this literal route/image map so a random image cannot satisfy the regression test:

```js
const operationalImages = {
  "houston-silver-buyer": "ag-silver-pour-1280.webp",
  "silver-buyer-pearland": "material-sterling-hollowware-1280.webp",
  "silver-buyer-pasadena": "material-industrial-silver-1280.webp",
  "silver-buyer-sugar-land": "material-silver-jewelry-1280.webp",
  "silver-buyer-katy": "material-silver-coins-1280.webp",
  "silver-buyer-the-woodlands": "material-silver-bars-1280.webp",
  "silver-buyer-conroe": "material-industrial-xray-1280.webp"
};
```

- [ ] **Step 2: Run the contract and record RED**

```bash
npm run build
node --test tests/service-area-artifacts-contract.test.mjs
```

Expected RED: no emblem sheet, no city artifact markup, and no 23-city coverage ledger.

- [ ] **Step 3: Author one restrained SVG symbol sheet**

Use simple geometric paths and a shared `0 0 160 160` coordinate system. Every motif uses the same stroke weight, silver surface palette, and maximum three tones. Forms are:

- Houston: low bayou curve crossing a restrained three-block skyline;
- Pearland: one pear silhouette with one leaf and a subtle assay-line cut;
- Pasadena: one strawberry silhouette with restrained seed cuts;
- Sugar Land: two cane leaves, one crystal facet, and a simplified chimney block with no crown or wordmark;
- Katy: one rice head intersected by two rail lines;
- The Woodlands: three pine trunks/canopies in one cluster;
- Conroe: three growth rings intersected by one rail/saw line.

The SVG is geometry, not a shaded illustration. Do not use blur, displacement, faux grain, perspective, people, seals, or exact civic logos. Trademark/civic-similarity safety is a human visual-review item: compare the seven rendered forms with the motif brief and record that no seal, crown, NASA, sports, corporate, tourism, or exact public-art identity is reproduced. Do not claim a string scan proves trademark safety.

- [ ] **Step 4: Render seven featured artifacts plus the full coverage ledger**

Give the service-area page a specialized renderer rather than forcing unrelated taxonomy cards to branch. Each featured city is a generous editorial link with silver medallion, city name, one short motif-connected sentence, and its existing route. Keep the seven-city arrangement responsive but not a uniform icon-card dashboard: use alternating large/small editorial rows within a coherent two-column field.

Below the routed cities, add a compact typographic `Houston Metro coverage` ledger containing all 23 names. Make clear that pickup is for qualifying accounts and scheduling is confirmed first. Do not imply physical offices in every city.

On each routed location page, add the matching emblem as a small civic identifier beside the existing page hero/media. Keep operational photos and all qualification copy.

- [ ] **Step 5: Style the artifacts as one cold-silver relief family**

Use existing navy, cream, steel, and mineral-blue tokens with one controlled amber trace at most. Use borders or shadows for depth, not both on the same medallion. Keep city labels real text, body copy readable, focus states obvious, and touch targets at least 44px on coarse pointers. No per-card hover choreography; one restrained lift/highlight behavior across all seven is sufficient.

- [ ] **Step 6: Run GREEN and mutation checks**

```bash
npm run build
node --test tests/service-area-artifacts-contract.test.mjs
npm test
node scripts/verify.mjs
npm run check
git diff --check
```

In disposable copies, prove tests fail if any one city symbol is reused for a second city, Stafford is removed from the marked coverage ledger, SVG text is introduced, a routed city link changes, or a location page replaces its exact operational image source.

- [ ] **Step 7: Commit**

```bash
git add assets/service-area-emblems.svg tests/service-area-artifacts-contract.test.mjs scripts/build.mjs src/style.css scripts/verify.mjs package.json
git commit -m "feat: add silver service-area artifacts"
```

---

## Task 6: Harden and verify the integrated release

**Files:**

- Create: `tests/cinematic-hero-browser.mjs`
- Create: `docs/qa/cinematic-materials-service-areas-release.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only if a failing regression test requires it: `src/cinematic-hero-video.js`
- Modify only if a failing regression test requires it: `src/style.css`
- Modify only if a failing regression test requires it: `src/site.js`
- Modify only if a failing regression test requires it: `src/materials-disclosure.js`
- Modify only if a failing regression test requires it: `scripts/build.mjs`
- Modify only if a failing regression test requires it: focused test files from Tasks 1 through 5

- [ ] **Step 1: Write a bounded real-browser release harness**

Pin the browser toolchain and commit the lockfile:

```bash
npm install --save-dev --ignore-scripts playwright-core@1.61.1 @sparticuz/chromium@149.0.0
```

The harness must start the static server in the same Node process as Playwright and use the pinned Chromium executable/assets, not an ambient global browser. Test fresh browser processes for desktop 1440x960, compact desktop 1024x768, tablet 768x1024, mobile 390x844, and narrow mobile 320x800. Use real generated `dist` output. Include separate contexts for normal motion, reduced motion, Save-Data emulation where supported or an injected navigator connection before module load, no JavaScript, and autoplay rejection.

Observable assertions:

- first poster is visible before module execution and on a cold no-JS load;
- hero geometry, H1 rectangle, CTA rectangles, phone rectangle, and proof-rail rectangle remain unchanged across one complete three-clip cycle;
- exactly two videos exist, controls are absent, audio tracks are absent from source files, and at most two clips have assigned sources at a time;
- transitions use overlapping nonzero opacity with no frame where poster and both videos are all transparent;
- overlay computed background and opacity stay constant through transitions;
- no page error, console error, failed local request, duplicate playback, or transition after pagehide;
- tab visibility pauses both videos and resumes the active layer plus an interrupted incoming layer without skipping or duplicating a transition;
- reduced motion and Save-Data assign no video sources and retain first poster;
- autoplay rejection leaves the first poster visible without an unhandled rejection;
- CTA and mobile navigation hit targets are topmost, keyboard reachable, and clickable;
- materials disclosure click, hover, Tab, Escape, outside close, and mobile sheet behavior pass;
- no horizontal overflow at all five viewports;
- the machine-readable matrix records opacity/source/layout/error invariants only; no subjective crop or flash result is inferred from a generic screenshot.

Do not weaken a failing visual/behavior assertion to make the harness green. If the harness exposes a product defect, first add the narrowest deterministic regression test and record RED before changing production.

- [ ] **Step 2: Run the full deterministic gate**

```bash
npm run build
npm test
npm run test:media
npm run test:assay
npm run check
node scripts/verify.mjs
node --check src/cinematic-hero-video.js
node --check src/site.js
git diff --check
```

Record the known unrelated retired assay benchmark separately if its historical 50ms Node threshold flakes; do not report it as a cinematic failure and do not silently delete the test. Re-run once to distinguish a cold-host flake from a deterministic regression.

- [ ] **Step 3: Run the browser matrix and inspect original captures**

```bash
node tests/cinematic-hero-browser.mjs
```

Save machine-readable results and original-resolution captures under `docs/qa/cinematic-captures/`. For each transition capture the frame before the threshold, the 400ms midpoint, and the settled frame. Human acceptance requires no flat white or black frame, no exposed page background, and visual continuity of at least one media layer. For each clip and viewport, inspect an original-resolution settled capture and require the principal silver-processing action to intersect the right-side safe region from 52% to 96% of viewport width and from 12% to 88% of hero height. Record the observed action bounds in the report. Adjust per-clip mobile `object-position` only if this crop review fails; preserve the 65/68/72 baseline and document any evidence-backed deviation.

- [ ] **Step 4: Run media and performance evidence**

Use ffprobe to confirm all six production files remain audio-free and within the size/raster/frame-rate contract. Capture first-paint resource ordering and verify the poster is requested before module execution, only the active and next clip are requested initially, and no third-clip request occurs before the first swap. Record no layout shift attributable to the hero and measure long tasks during controller initialization. Do not claim hardware-GPU performance from software-rendered Chromium.

- [ ] **Step 5: Run the single Impeccable detection round**

Run exactly once across changed production targets:

```bash
node /root/.codex/skills/remote-skills/impeccable/scripts/detect.mjs --json scripts/build.mjs src/style.css src/site.js src/cinematic-hero-video.js src/materials-disclosure.js
```

Combine those findings with the browser captures, make at most one coherent fix batch through a new failing test, then run one confirmation browser round. Do not begin a visual tweak loop.

- [ ] **Step 6: Write the release evidence report**

`docs/qa/cinematic-materials-service-areas-release.md` must include: commit range, exact commands/exits, media manifest and stream metadata, browser matrix, object-position inspection, accessibility results, navigation disclosure results, visibility/autoplay/reduced-motion/Save-Data results, network request order, screenshot paths, any qualified limitations, and no self-assigned grade.

- [ ] **Step 7: Commit**

```bash
git add tests/cinematic-hero-browser.mjs docs/qa/cinematic-materials-service-areas-release.md docs/qa/cinematic-captures package.json package-lock.json
git add src/cinematic-hero-video.js src/materials-disclosure.js src/style.css src/site.js scripts/build.mjs
git add tests/cinematic-media-contract.test.mjs tests/cinematic-hero-markup.test.mjs tests/cinematic-hero-runtime.test.mjs tests/materials-navigation-contract.test.mjs tests/materials-disclosure-runtime.test.mjs tests/service-area-artifacts-contract.test.mjs
git commit -m "test: verify the cinematic materials release"
```

Do not include unrelated generated files or another agent's reports.

---

## Final Review and Release

- [ ] Generate one whole-branch review package from the branch merge base through HEAD.
- [ ] Dispatch a fresh high-capability reviewer for spec compliance, code quality, accessibility, performance, media behavior, content accuracy, and route integrity.
- [ ] If findings exist, dispatch one bounded fix wave containing the complete findings list, then one scoped re-review.
- [ ] Run the complete deterministic and browser gates against the final commit.
- [ ] Treat the user's existing instruction to deploy immediately as the production-release authorization. Stop only if GitHub/Vercel permissions or a load-bearing review finding requires new authority; do not ask for redundant approval.
- [ ] Push the reviewed branch through the GitHub integration and create/merge the release change without rewriting history.
- [ ] Create a Vercel preview, repeat the critical network/playback/mobile checks on the public URL, then deploy the exact reviewed commit to production.
- [ ] Verify the live homepage, `/accepted-materials`, `/service-areas`, `/how-it-works`, one industrial NDT route, one medical X-ray route, and one location route.
- [ ] Report the production URL, immutable commit SHA, exact verification summary, and any honestly unverified hardware/device limitation.
