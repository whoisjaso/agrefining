# Cinematic Hero, Materials, and Service Areas Design

## Decision

Extend the existing Silver Atelier without migrating the site to React or Next.js. The production site remains a static Node build with native HTML, CSS, and JavaScript. A reusable `CinematicHeroVideo` JavaScript controller provides the requested two-layer rotator without adding hydration, a client framework, or an unused `.tsx` file.

This is a targeted evolution. It preserves all existing public route slugs, the AG Refining logo, the creme and navy system, the homepage headline, paragraph, calls to action, phone link, proof rail, forms, legal copy, and conversion paths.

## Design read

The surface is a trust-first commercial site for Houston business sellers. The visual language is cold luxury: deep navy, creme, cool silver, and restrained amber industrial light.

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 5`
- `VISUAL_DENSITY: 4`

Motion communicates a real refining sequence and navigation state. It does not decorate copy or restart the hero message.

## Scope

The release contains four independent but coordinated additions:

1. A cinematic, event-driven homepage video rotator.
2. A complete materials mega-navigation and a 17-destination materials index.
3. Shared navigation title-case and process-copy corrections.
4. A silver civic-identity system for the seven routed service areas, plus a complete coverage ledger.

## Homepage cinematic hero

### Preserved content

The following live HTML remains stationary and unchanged during playback and transitions:

- `Houston, Texas · Commercial silver buyer`
- `Your silver, valued precisely.`
- The existing lead paragraph.
- `Schedule a free pickup`.
- `See what we buy`.
- The phone link.
- The four-item proof rail.
- The existing header and mobile navigation.

Only the visual background changes.

### Native component architecture

Create `src/cinematic-hero-video.js` with an exported `CinematicHeroVideo` class and a small idempotent homepage bootstrap. The class owns one hero root, exactly two video elements, a three-item clip manifest, event listeners, the current transition, and cleanup.

The initial document contains:

1. An immediate first-poster `<picture>` or `<img>` layer.
2. A video-layer container with exactly two decorative `<video>` elements and no sources until JavaScript approves motion and data use.
3. One stable two-gradient overlay.
4. The existing hero content and proof rail.

The poster remains physically beneath the video layers for the full session. It is never removed. This prevents white and black flashes when a video is unavailable, decoding, or being replaced.

### Clip manifest

Use this exact order:

| Index | Name | MP4 | WebM | Poster |
|---:|---|---|---|---|
| 0 | Molten pour | `/videos/ag-refining-molten-pour.mp4` | `/videos/ag-refining-molten-pour.webm` | `/images/ag-refining-molten-pour-poster.webp` |
| 1 | Silver ingots | `/videos/ag-refining-silver-ingots.mp4` | `/videos/ag-refining-silver-ingots.webm` | `/images/ag-refining-silver-ingots-poster.webp` |
| 2 | Precision assay | `/videos/ag-refining-precision-assay.mp4` | `/videos/ag-refining-precision-assay.webm` | `/images/ag-refining-precision-assay-poster.webp` |

The source uploads map to those entries in their supplied order. The molten-pour upload contains an AAC stereo track. Every production transcode must explicitly remove audio.

### Playback state machine

The controller stores mutable playback state on the class instance and DOM nodes rather than in a render loop:

- active clip index;
- prepared next clip index;
- active layer slot;
- transition lock;
- visibility pause state;
- autoplay availability;
- one transition-end fallback timeout;
- all registered listener cleanup functions.

Startup behavior:

1. Exit before adding video sources when `prefers-reduced-motion: reduce` matches.
2. Exit before adding video sources when `navigator.connection.saveData` is true.
3. Assign WebM first and MP4 second to the active layer, set `preload="auto"`, and attempt muted inline playback.
4. Assign only the next clip to the standby layer and set `preload="metadata"`.
5. Keep the poster visible until the active video emits `playing`.

Rotation behavior:

1. Listen to `timeupdate` and `ended`; do not use `setInterval`.
2. When `duration - currentTime <= 0.8`, begin the next transition only if the lock is clear.
3. Start the incoming video at `currentTime = 0` and wait until it can play.
4. Crossfade both layers with opacity over 800ms using `cubic-bezier(0.4, 0, 0.2, 1)`.
5. Complete on the relevant `transitionend`, with a bounded timeout only as a safety fallback.
6. Pause and reset the outgoing layer to `currentTime = 0`.
7. Swap layer roles, advance the index, and prepare only the next clip as metadata.
8. After the assay clip, return to molten pour.

The transition lock prevents duplicate `timeupdate` and `ended` events from starting another fade.

### Visibility and failure behavior

- On `document.visibilitychange` to hidden, pause both layers and record which layer should resume.
- On visible, safely resume the active layer and the incoming layer if a transition was in progress.
- Catch every `play()` rejection. Never allow an unhandled promise rejection.
- If the first autoplay attempt fails, leave both videos transparent and preserve the molten poster.
- If an incoming clip fails, keep the outgoing frame or poster visible and retry only on the next safe event. Do not hard cut.
- On `pagehide`, component teardown, or repeated bootstrap, remove listeners, clear the transition timeout, pause both videos, remove sources, and clear the mounted marker.

### Presentation

The hero keeps `position: relative`, `overflow: hidden`, and `isolation: isolate`.

Both video layers use:

```css
position: absolute;
inset: 0;
width: 100%;
height: 100%;
object-fit: cover;
pointer-events: none;
```

Object position is calibrated per breakpoint and may be adjusted per clip to keep the operational action visible. The initial targets are 65% center on desktop, 68% center on tablet, and 72% center on mobile. The precision-assay mobile crop may shift left if browser capture shows the scale readout or tray is materially clipped.

The stable overlay is one non-animated layer above both videos:

```css
linear-gradient(
  90deg,
  rgba(3, 22, 36, 0.98) 0%,
  rgba(3, 22, 36, 0.93) 28%,
  rgba(3, 22, 36, 0.72) 46%,
  rgba(3, 22, 36, 0.26) 68%,
  rgba(3, 22, 36, 0.08) 100%
),
linear-gradient(
  180deg,
  rgba(3, 22, 36, 0.15) 0%,
  transparent 28%,
  rgba(3, 22, 36, 0.18) 100%
)
```

No scale, blur, position, brightness, or copy animation is allowed during rotation.

### Media delivery

Source authoring directories are `videos/` and `images/`; the build copies them to `dist/videos/` and `dist/images/` so the requested public URLs remain exact.

Production encodes:

- MP4: H.264 High, level 3.1, yuv420p, CRF 22, slow preset, 2-second GOP, BT.709 tags, fast start, no audio, subtitles, or data streams.
- WebM: VP9 profile 0, yuv420p, CRF 31, 2-second GOP, row multithreading, no audio.
- Posters: WebP quality 82 at the source 1280x720 dimensions.

Measured trial targets are approximately 1.6-2.0 MB per MP4, 1.1-1.3 MB per WebM, and 36-42 KB per poster.

## Materials navigation

### Shared label

The primary destination remains `Materials`. Clicking the label navigates to `/accepted-materials`.

An adjacent disclosure control opens the materials panel. The panel uses normal navigation headings, lists, and links. It must not use application-menu roles.

Desktop behavior:

- Opens on fine-pointer hover, focus-within, disclosure click, Enter, or Space.
- Closes on Escape with focus returned to the disclosure button.
- Closes on outside click or when focus leaves the wrapper.
- Closed links are hidden and inert so they do not remain in the Tab order.
- Uses only opacity and a small translate transition for 160-220ms.
- Honors reduced motion.

Mobile behavior:

- Appears as a nested disclosure inside the existing mobile sheet.
- `All materials` is the first link.
- Links remain at least 44px tall.
- The sheet remains vertically scrollable.
- Escape first closes the nested disclosure, then closes the outer navigation on a second press.
- Closing the outer sheet or crossing the 900px breakpoint resets the materials disclosure.

No-JavaScript behavior keeps the main Materials link and all nested material links reachable.

### Dropdown groups

The 17 destinations are grouped for scanning:

| Group | Label | Route |
|---|---|---|
| Featured | Silver oxide watch batteries | `/silver-oxide-watch-battery-recycling-houston` |
| Silver forms | Scrap silver | `/scrap-silver-buyer-houston` |
| Silver forms | Scrap silver jewelry | `/scrap-silver-jewelry` |
| Silver forms | Silver coins | `/sell-silver-coins-houston` |
| Silver forms | Silver bars | `/sell-silver-bars-houston` |
| Silver forms | Sterling and flatware | `/silver-flatware-buyer-houston` |
| Silver forms | Silver-plated materials | `/silver-plated-materials-buyer-houston` |
| Industrial and laboratory | Industrial silver | `/industrial-silver-scrap` |
| Industrial and laboratory | Electronics silver recovery | `/electronics-silver-recovery` |
| Industrial and laboratory | Silver flake | `/silver-flake-buyer-houston` |
| Industrial and laboratory | Silver solder | `/silver-solder-buyer-houston` |
| Industrial and laboratory | Laboratory silver | `/laboratory-silver-buyer-houston` |
| Imaging and healthcare | Industrial NDT film | `/industrial-x-ray-silver-recycling` |
| Imaging and healthcare | Medical X-ray film | `/medical-x-ray-recycling` |
| Imaging and healthcare | Dental scrap | `/dental-scrap-buyer-houston` |
| Guides and trade | X-ray recycling services | `/x-ray-recycling-services-houston` |
| Guides and trade | Jewelry-store silver recycling | `/jewelry-store-silver-recycling-houston` |

The electronics route already exists and is indexed. Cross-list it through a display-only registry. Do not append it to both `materialPages` and `industryPages`, which would duplicate route generation and sitemap entries.

## Accepted materials page

Change the page heading from `Silver materials we buy.` to exactly `We purchase.`

The grid contains exactly 17 unique destinations:

1. Silver oxide watch batteries appears first and spans both desktop columns.
2. The remaining 16 cards form exactly eight two-column rows.
3. Mobile collapses all cards to one column.
4. Electronics silver recovery appears once.
5. No placeholder, empty cell, duplicated route, or invented service is allowed.

The silver oxide feature uses its existing real battery photograph, clear battery-specific copy, and the same sharp Silver Atelier geometry. It is not a generic oversized promotional card.

## Copy and terminology

### Shared primary navigation

Use title case for multiword English primary destinations:

- `Service Areas`
- `How It Works`
- `Our Story`

Sentence-case breadcrumbs and content eyebrows can remain sentence case.

### Process page

Change the How It Works page H1 to exactly:

`Six simple steps from silver to cash.`

Keep the existing six-step sequence and conversion action.

### Homepage material labels

- Replace `Sterling and hollowware` with `Sterling and flatware`.
- Replace `Industrial X-ray film` with `Industrial NDT film`.

### Industrial terminology

Keep the existing URL `/industrial-x-ray-silver-recycling` for SEO and link stability, but remove `Industrial X-ray film` from customer-facing labels, title, heading, footer, cards, related links, and route metadata.

Use:

- Short label: `Industrial NDT film`.
- First explanatory occurrence: `Industrial NDT film (Industrial Non-Destructive Testing film)`.
- Page title: `Industrial NDT Film Silver Recycling in Houston | AG Refining`.
- Page heading: `Recover silver from industrial NDT film.`
- X-ray hub leaf title: `Industrial NDT Film Recycling`.

Medical X-ray pages keep accurate medical X-ray terminology. Internal image filenames and form values may remain unchanged where they are not customer-facing.

## Service-area identity

### Routed city artifacts

Keep the seven existing location routes. Give each city one trademark-safe silver-relief emblem:

| City | Silver identity |
|---|---|
| Houston | Buffalo Bayou curve with restrained skyline verticals |
| Pearland | Polished pear profile with one leaf |
| Pasadena | Strawberry with simplified silver seed dimples |
| Sugar Land | Sugar cane or crystal with a simplified Char House chimney |
| Katy | Rice head crossed by one rail line |
| The Woodlands | Three pine trunks with a joined canopy and negative-space path |
| Conroe | Pine growth rings intersected by rail-switch or saw-line geometry |

Do not reproduce city seals, tourism logos, sports marks, NASA insignia, corporate marks, exact Pear-Scape sculptures, festival logos, or the Imperial Sugar crown or wordmark.

Use one small external symbol sheet with normalized view boxes, simple metallic tones, and no blur or displacement filters. Decorative emblems use `aria-hidden="true"`; city names remain real HTML.

Keep operational material photography on individual city routes as evidence. The city emblem may appear as a small civic overlay or paired identity panel. Do not replace transaction evidence with a decorative mascot.

### Coverage ledger

Below the seven routed city cards, include the full promised coverage list as a compact typographic ledger:

Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and Stafford.

The ledger does not imply each city has its own route or guarantee pickup. Existing qualifying-service language remains visible.

## Accessibility and performance contracts

- Decorative videos use `aria-hidden="true"` and `tabindex="-1"` and have no alternative text.
- Videos have `autoplay`, `muted`, `playsinline`, no controls, and no audio stream.
- CTA buttons, phone, mobile navigation, and materials links remain clickable above the media layers.
- Hero dimensions are reserved before media loads.
- The first poster is present in generated HTML and receives high fetch priority.
- Reduced-motion and Save-Data users download no video sources.
- No hidden dropdown link remains keyboard-focusable.
- No horizontal overflow at 320, 390, 768, 1024, or 1440px.
- Every image has explicit width and height.
- Existing trust qualifications and form behavior remain unchanged.
- The static build remains hydration-free.

## Verification

Deterministic tests must prove:

- exact three-clip order and public paths;
- exactly two video elements;
- WebM-first and MP4-fallback assignment;
- no interval-based rotation;
- 800ms threshold and transition values;
- transition lock and outgoing reset;
- cleanup, visibility, autoplay-rejection, reduced-motion, and Save-Data behavior;
- first poster in generated HTML;
- silent production media and byte budgets;
- 17 unique material destinations, battery-first full-width layout, and electronics cross-listing;
- accessible desktop and mobile materials disclosures;
- title-case primary navigation;
- exact How It Works H1;
- corrected homepage and Industrial NDT terminology;
- seven routed emblems and the 23-name coverage ledger;
- unchanged homepage value proposition, actions, phone, and proof rail;
- unchanged route slugs and sitemap uniqueness.

Browser verification covers normal motion, reduced motion, Save-Data simulation, autoplay rejection, tab visibility changes, crossfade opacity, no flashes, no controls, navigation focus, mobile sheet behavior, CTA clickability, crop safety, and layout stability.

Target browsers are current Safari, Chrome, Edge, and mobile Safari. Local Chromium automation provides the deterministic runtime matrix; Safari-specific behavior is protected through standards-compatible markup, codec fallbacks, inline playback attributes, and no framework hydration.
