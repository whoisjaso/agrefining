# Cinematic materials and service areas release evidence

## Scope and provenance

- Reviewed range: `71e4122163adff6267df0d6626d9d959bbb0d428` through the final Task 6 release tree. The published Git history records the immutable Task 6 release commit.
- Browser artifact: `docs/qa/cinematic-captures/cinematic-browser-matrix.json`, schema 1, generated 2026-08-10T22:43:04.517Z.
- Toolchain: Playwright Core 1.61.1, `@sparticuz/chromium` 149.0.0, Chromium 149.0.7827.0. The harness used a same-process static server and a fresh browser process for each viewport.

## Deterministic release gate

The final post-integration deterministic gate completed on the same release tree used by the passing browser matrix.

| Command | Final exit |
| --- | --- |
| `npm run build` | 0; 12 assets verified, 38 public pages built |
| `npm test` | 0; 35 generated/integration, 29 hero-runtime, and 11 materials-runtime tests passed |
| `npm run test:media` | 0; 3 media-contract tests passed |
| `npm run test:assay` | 0; 20 legacy/route/runtime tests passed |
| `npm run check` | 0; `AG_REFINING_CHECK_OK` |
| `node scripts/verify.mjs` | 0; 39 HTML files and 38 indexed pages |
| `node --check src/cinematic-hero-video.js` | 0 |
| `node --check src/site.js` | 0 |
| `git diff --check` | 0 |

The separate browser command, `node tests/cinematic-hero-browser.mjs`, wrote the matrix above with five `passed` viewport results and no product assertion failures.

## Exact media manifest

| Clip, public source order | WebM metadata | MP4 metadata | Poster |
| --- | --- | --- | --- |
| Molten pour: `/videos/ag-refining-molten-pour.webm`, then `/videos/ag-refining-molten-pour.mp4` | VP9, yuv420p, 1280x720, 24 fps, 8.042 s, 1,249,964 bytes, 0 audio streams | H.264, yuv420p, 1280x720, 24 fps, 8.041667 s, 1,977,852 bytes, 0 audio streams | `/images/ag-refining-molten-pour-poster.webp`, WebP 1280x720, 42,098 bytes |
| Silver ingots: `/videos/ag-refining-silver-ingots.webm`, then `/videos/ag-refining-silver-ingots.mp4` | VP9, yuv420p, 1280x720, 24 fps, 7.042 s, 1,092,618 bytes, 0 audio streams | H.264, yuv420p, 1280x720, 24 fps, 7.041667 s, 1,634,067 bytes, 0 audio streams | `/images/ag-refining-silver-ingots-poster.webp`, WebP 1280x720, 43,628 bytes |
| Precision assay: `/videos/ag-refining-precision-assay.webm`, then `/videos/ag-refining-precision-assay.mp4` | VP9, yuv420p, 1280x720, 24 fps, 8.042 s, 1,283,235 bytes, 0 audio streams | H.264, yuv420p, 1280x720, 24 fps, 8.041667 s, 1,658,728 bytes, 0 audio streams | `/images/ag-refining-precision-assay-poster.webp`, WebP 1280x720, 37,418 bytes |

The browser initial state assigned only molten pour and silver ingots, with WebM before MP4 in each layer. The third clip was not assigned until the first swap. Exactly two decorative videos existed, with controls absent. The observed sequence was molten pour -> silver ingots -> precision assay -> molten pour; maximum simultaneous playback was two.

## Five-viewport browser matrix

| Viewport | Result | Cycle samples | No-JS / motion / Save-Data / autoplay | Overflow and performance |
| --- | --- | ---: | --- | --- |
| Desktop 1440x960 | passed on browser attempt 1 | 1,345 | Poster visible before module and on no-JS load; 0 sources for no-JS, reduced motion, and Save-Data; rejected autoplay retained poster at opacity 1 with both videos at 0 and no unhandled rejection | 0 horizontal overflow; hero and total layout shift 0; 0 initialization long tasks |
| Compact desktop 1024x768 | passed on attempt 1 | 1,321 | Same static-preference and rejection results | 0 horizontal overflow; hero and total layout shift 0; 0 initialization long tasks |
| Tablet 768x1024 | passed on attempt 1 | 1,327 | Same static-preference and rejection results | 0 horizontal overflow; hero and total layout shift 0; 0 initialization long tasks |
| Mobile 390x844 | passed on attempt 1 | 1,299 | Same static-preference and rejection results | 0 horizontal overflow; hero and total layout shift 0; 0 initialization long tasks |
| Narrow mobile 320x800 | passed on attempt 1 | 1,297 | Same static-preference and rejection results | 0 horizontal overflow; hero and total layout shift 0; 0 initialization long tasks |

Across all viewports, the three transitions recorded an opaque active frame before each change, overlapping nonzero video opacities at the midpoint, and a single opaque incoming layer after settlement. The stable overlay background and opacity remained invariant; diagnostics recorded no console errors, page errors, failed local requests, or local HTTP errors. Pagehide destroyed the controller and left zero assigned sources.

Visibility was tested by injecting `Document.hidden` and `visibilitychange`, because headless Chromium keeps background pages visible. At the interrupted crossfade, both layers paused while hidden. On resume, the incoming layer completed and the controller settled on clip 1 with clip 2 next, without a duplicate transition.

## Capture and crop evidence

All 50 original-resolution PNG captures and their exact transition paths are recorded in `docs/qa/cinematic-captures/cinematic-browser-matrix.json`; files are under `docs/qa/cinematic-captures/`.

Settled capture sets, one per clip and viewport:

- Desktop: `desktop-1440x960-clip-1-molten-pour-settled.png`, `desktop-1440x960-transition-1-settled.png`, `desktop-1440x960-transition-2-settled.png`.
- Compact desktop: `compact-desktop-1024x768-clip-1-molten-pour-settled.png`, `compact-desktop-1024x768-transition-1-settled.png`, `compact-desktop-1024x768-transition-2-settled.png`.
- Tablet: `tablet-768x1024-clip-1-molten-pour-settled.png`, `tablet-768x1024-transition-1-settled.png`, `tablet-768x1024-transition-2-settled.png`.
- Mobile: `mobile-390x844-clip-1-molten-pour-settled.png`, `mobile-390x844-transition-1-settled.png`, `mobile-390x844-transition-2-settled.png`.
- Narrow mobile: `narrow-mobile-320x800-clip-1-molten-pour-settled.png`, `narrow-mobile-320x800-transition-1-settled.png`, `narrow-mobile-320x800-transition-2-settled.png`.

Before, midpoint, and settled frames for transitions 1 through 3 are also present for every viewport. CSS uses the approved shared crop baseline: 65% center desktop, 68% center at the tablet breakpoint, and 72% center at mobile. No clip-specific override is present. A separate original-resolution inspection estimated the visible principal-action bounds below. Values are viewport-relative `[left, top, right, bottom]` percentages; every subject intersects the required x 52-96%, y 12-88% safe region.

| Clip | 1440x960 | 1024x768 | 768x1024 | 390x844 | 320x800 |
| --- | --- | --- | --- | --- | --- |
| Molten pour | `[49,12,100,97]` | `[48,15,100,98]` | `[43,8,100,99]` | `[36,10,100,100]` | `[40,10,100,100]` |
| Silver ingots | `[36,19,100,98]` | `[27,24,100,100]` | `[31,17,100,99]` | `[0,17,100,100]` | `[0,19,100,100]` |
| Precision assay | `[50,12,100,98]` | `[44,15,100,100]` | `[54,18,100,99]` | `[70,33,100,100]` | `[71,33,100,100]` |

## Navigation and accessibility evidence

- The primary and secondary hero CTAs and phone link were topmost and keyboard reachable in every viewport; the CTAs navigated to `/contact?intent=pickup` and `/accepted-materials` respectively.
- Desktop and compact desktop materials disclosure checks covered fine-pointer hover, disclosure click, Tab into the panel, Escape close and focus return, and outside-click close. The panel did not overlap the sticky header.
- Tablet, mobile, and narrow mobile checks verified a topmost 44px-or-larger navigation toggle; first Escape closed nested Materials and second Escape closed the outer sheet.
- No-JavaScript loads retained the decoded first poster, had zero video sources, and no horizontal overflow. The static HTML keeps the normal Materials link and grouped links available before enhancement.
- Video controls were absent; media stream probing found no audio. Decorative media and city-artifact accessibility contracts are covered by the passing generated/runtime suites.

## Resource ordering and performance qualification

On the desktop normal load, the molten-pour poster requested at 5.0 ms, before `cinematic-hero-video.js` completed and before the active/next WebM requests at 43.3 ms and 43.6 ms. Silver-ingots poster and precision-assay media arrived only when their clips were prepared; precision-assay WebM first appeared at 8,702.9 ms, after the first swap. Other viewports show the same active-plus-next initial media behavior in the matrix request log.

The local Chromium evidence reports no hero-attributable layout shift, no total layout shift, and no long task during controller initialization. This is software-rendered local Chromium evidence only; it is not a claim of hardware-GPU performance or Safari/mobile-device playback performance.

## Process notes and limitations

- The final post-fix browser artifact records zero infrastructure retries and zero product failures. Earlier diagnostic runs encountered local Chromium closures, but those runs are superseded by the final matrix.
- The cloud browser could not reach container loopback `http://127.0.0.1:4173` and returned `net::ERR_BLOCKED_BY_CLIENT`. Local pinned Chromium supplied the deterministic browser matrix; public preview and real Safari/device verification are not evidenced here.
- Impeccable process deviation: Task 4 ran an early scan, then Task 6 ran the final integrated scan. That is two total scans, not one. The final integrated scan result was `[]`.
- A separate original-resolution visual audit inspected all 50 PNGs and found no white/black flash, media gap, overlay-brightness shift, copy movement, unreadable text, major subject crop, or cross-clip visual inconsistency. Numeric principal-action bounds are recorded separately when available; this local audit does not claim real Safari or hardware-device evidence.
