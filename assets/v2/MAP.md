# Media v2 - Higgsfield top picks (not wired yet)

Prepared for Claude Code to wire in. Jason asked to use the top picks for all slots. These files are not referenced by the site, so they do not change what visitors see until someone points the markup at them.

They live in `assets/v2/` so `scripts/build.mjs` will copy them into `dist` on deploy. There is no top-level `media/` folder in this repo; `assets/`, `images/`, and `videos/` are the public media directories.

Sources are the reviewed top picks in `/workspace/agrefining-media/higgsfield-batch-1/manifest.md`. Stills were encoded with Sharp to WebP (quality about 72-76, matching `scripts/optimize-asset.mjs`). Email and Open Graph files are JPEG because those surfaces cannot rely on WebP. Loops are H.264 MP4 (`+faststart`, no audio, CRF 26) plus VP9 WebM, with poster frames.

99 files, 6.4 MB.

## Mapping

Paths are from the site root. "Replaces" is the live asset a later wiring pass should swap out. "-" means there is no current asset for that slot.

### Home hero

The live home hero is the cinematic process film, not the still `ag-silver-hero-1600.webp` (that file is still used in Organization schema and as a fallback). Both mappings are listed.

| v2 file | Page | Slot | Replaces |
|---|---|---|---|
| `hero-home-1600.webp` (1600x900) | `/` | Desktop hero still, 16:9 | `assets/ag-silver-hero-1600.webp` |
| `hero-home-2400.webp` (2400x1350) | `/` | Desktop hero still, 16:9 at 1.5x | - (new size; same slot as the 1600) |
| `hero-home-21x9-1600.webp` (1600x686) | `/` | Optional wide desktop hero, 21:9 | - (no 21:9 asset on the site today) |
| `hero-home-21x9-2400.webp` (2400x1029) | `/` | Optional wide desktop hero, 21:9 at 1.5x | - |
| `hero-home-mobile.webp` (1080x1920, 9:16) | `/` | Mobile portrait hero still | `assets/ag-silver-hero-mobile.webp` (that file is 900x506 landscape, not portrait) and/or `images/ag-refining-process-01-pile-poster-mobile.webp` (540x960) |
| `hero-home-mobile-4x5.webp` (1080x1350) | `/` | Alternate mobile tall still | - (alternate crop of the same spoon) |
| `loop-flatware.mp4`, `loop-flatware.webm` | `/` | Desktop hero loop, 1280x720, 6.04s | Does **not** replace the nine-clip process film. Candidate first clip or a simpler single-loop hero in place of `/videos/ag-refining-process-01-pile.mp4` and `.webm` |
| `loop-flatware-poster.webp` (1920x1080) | `/` | Desktop hero poster | `images/ag-refining-process-01-pile-poster.webp` if the flatware loop is used |
| `loop-flatware-mobile.mp4`, `loop-flatware-mobile.webm` | `/` | Mobile hero loop, 720x1280, 6.04s | Candidate in place of `/videos/ag-refining-process-01-pile-mobile.mp4` and `.webm` |
| `loop-flatware-poster-mobile.webp` (540x960) | `/` | Mobile hero poster | `images/ag-refining-process-01-pile-poster-mobile.webp` if the flatware loop is used |

### Inner-page heroes

`/about`, `/how-it-works`, `/contact`, and `/espanol` currently use a text-only `page-intro`. Their Open Graph image falls back to `assets/ag-silver-social.webp`. These stills are new page heroes.

| v2 file | Page | Slot | Replaces |
|---|---|---|---|
| `hero-about-1600.webp`, `hero-about-2400.webp`, `hero-about-mobile.webp` | `/about` | Page hero, 16:9 + mobile 9:16 | - (no page hero image today; OG falls back to `ag-silver-social.webp`) |
| `hero-how-it-works-1600.webp`, `hero-how-it-works-2400.webp`, `hero-how-it-works-mobile.webp` | `/how-it-works` | Page hero | - (same) |
| `hero-contact-1600.webp`, `hero-contact-2400.webp`, `hero-contact-mobile.webp` | `/contact` | Page hero | - (same) |
| `hero-espanol-1600.webp`, `hero-espanol-2400.webp`, `hero-espanol-mobile.webp` | `/espanol` | Page hero | - (same) |

### Material cards

Each subject has `-1280.webp` (1280x960) and `-800.webp` (800x600), which matches `renderMaterialPicture()` and `scripts/optimize-asset.mjs`. Live basenames come from `materialImageManifest` in `scripts/build.mjs` (that manifest wins over older hardcoded `image:` fields).

| v2 basename | Pages | Slot | Replaces | Also a candidate for |
|---|---|---|---|---|
| `material-sterling-flatware-1280/800.webp` | `/`, `/accepted-materials`, `/silver-flatware-buyer-houston` | Sterling flatware card | `assets/material-sterling-flatware-1280.webp` and `-800.webp` | |
| `material-coins-1280/800.webp` | `/`, `/accepted-materials`, `/sell-silver-coins-houston` | Coins card | `assets/material-coins-1280.webp` and `-800.webp` | `material-silver-coins-*` (older filename still on disk) |
| `material-silver-bars-1280/800.webp` | `/accepted-materials`, `/sell-silver-bars-houston` | Bars card | `assets/material-silver-bars-1280.webp` and `-800.webp` | |
| `material-scrap-jewelry-1280/800.webp` | `/`, `/accepted-materials`, `/scrap-silver-jewelry`, `/jewelry-store-silver-recycling-houston` | Scrap jewelry card | `assets/material-scrap-jewelry-1280.webp` and `-800.webp` | `material-silver-jewelry-*` |
| `material-scrap-silver-1280/800.webp` | `/accepted-materials`, `/scrap-silver-buyer-houston` | Scrap silver card | `assets/material-scrap-silver-1280.webp` and `-800.webp` | |
| `material-silver-plated-1280/800.webp` | `/accepted-materials`, `/silver-plated-materials-buyer-houston` | Silver-plated card | `assets/material-silver-plated-1280.webp` and `-800.webp` | |
| `material-silver-solder-1280/800.webp` | `/accepted-materials`, `/silver-solder-buyer-houston` | Solder card | `assets/material-silver-solder-1280.webp` and `-800.webp` | |
| `material-watch-batteries-1280/800.webp` | `/`, `/accepted-materials`, `/silver-oxide-watch-battery-recycling-houston` | Watch batteries card | `assets/material-watch-batteries-1280.webp` and `-800.webp` | `material-watch-batteries-real-*` |
| `material-dental-scrap-1280/800.webp` | `/accepted-materials`, `/dental-scrap-buyer-houston`, `/dental-lab-silver-recycling` | Dental scrap card | `assets/material-dental-scrap-1280.webp` and `-800.webp` | `material-dental-*` (the buyer-page manifest basename) |
| `material-electronics-1280/800.webp` | `/accepted-materials`, `/electronics-silver-recovery` | Electronics card | `assets/material-electronics-1280.webp` and `-800.webp` | |
| `material-industrial-ndt-1280/800.webp` | `/`, `/accepted-materials`, `/industrial-x-ray-silver-recycling` | Industrial NDT card | `assets/material-industrial-ndt-1280.webp` and `-800.webp` | |
| `material-industrial-silver-1280/800.webp` | `/accepted-materials`, `/industrial-silver-scrap`, `/manufacturing-silver-recovery` | Industrial silver card | `assets/material-industrial-silver-1280.webp` and `-800.webp` | |
| `material-industrial-xray-1280/800.webp` | `/industries`, `/oil-gas-silver-recovery` | Industrial X-ray card | `assets/material-industrial-xray-1280.webp` and `-800.webp` | |
| `material-lab-silver-1280/800.webp` | `/accepted-materials`, `/laboratory-silver-buyer-houston` | Laboratory silver card | `assets/material-lab-silver-1280.webp` and `-800.webp` | `material-laboratory-silver-*` |
| `material-medical-xray-1280/800.webp` | `/`, `/accepted-materials`, `/medical-x-ray-recycling`, `/hospital-silver-recycling` | Medical X-ray card | `assets/material-medical-xray-1280.webp` and `-800.webp` | |
| `material-silver-flake-1280/800.webp` | `/accepted-materials`, `/silver-flake-buyer-houston` | Silver flake card | `assets/material-silver-flake-1280.webp` and `-800.webp` | |

### Service-area cards

Same 1280 / 800 sizes as the live area cards.

| v2 basename | Pages | Slot | Replaces |
|---|---|---|---|
| `service-area-houston-1280/800.webp` | `/service-areas`, `/houston-silver-buyer` | Houston card | `assets/service-area-houston-1280.webp` and `-800.webp` |
| `service-area-pasadena-1280/800.webp` | `/service-areas`, `/silver-buyer-pasadena` | Pasadena card | `assets/service-area-pasadena-1280.webp` and `-800.webp` |
| `service-area-pearland-1280/800.webp` | `/service-areas`, `/silver-buyer-pearland` | Pearland card | `assets/service-area-pearland-1280.webp` and `-800.webp` |
| `service-area-katy-1280/800.webp` | `/service-areas`, `/silver-buyer-katy` | Katy card | `assets/service-area-katy-1280.webp` and `-800.webp` |
| `service-area-sugar-land-1280/800.webp` | `/service-areas`, `/silver-buyer-sugar-land` | Sugar Land card | `assets/service-area-sugar-land-1280.webp` and `-800.webp` |
| `service-area-the-woodlands-1280/800.webp` | `/service-areas`, `/silver-buyer-the-woodlands` | The Woodlands card | `assets/service-area-the-woodlands-1280.webp` and `-800.webp` |
| `service-area-conroe-1280/800.webp` | `/service-areas`, `/silver-buyer-conroe` | Conroe card | `assets/service-area-conroe-1280.webp` and `-800.webp` |
| `service-area-hobby-airport-1280/800.webp` | future `/silver-buyer-hobby-airport` | Hobby Airport card | - (this city is not on `main` yet; no live card) |
| `service-area-south-houston-1280/800.webp` | future `/silver-buyer-south-houston` | South Houston card | - (not on `main` yet) |
| `service-area-clear-lake-1280/800.webp` | future `/silver-buyer-clear-lake` | Clear Lake card | - (not on `main` yet) |

### Guide, FAQ, and process stills

Guide and FAQ pages have no unique art today. Process stills are a proposed 3-step strip for `/` or `/how-it-works` (the live home process block is text only; the cinematic hero is a nine-clip film).

| v2 file | Page | Slot | Replaces |
|---|---|---|---|
| `guide-sterling-vs-plate-1600.webp` | `/guides/sterling-vs-silver-plate` | Guide header, 16:9 | - (OG falls back to `ag-silver-social.webp`) |
| `guide-how-valued-1600.webp` | `/guides/how-silver-is-valued` | Guide header | - |
| `guide-xray-privacy-1600.webp` | `/guides/x-ray-film-privacy-checklist` | Guide header | - |
| `guide-which-coins-1600.webp` | `/guides/which-us-coins-are-silver` | Guide header | - |
| `guide-id-to-sell-1600.webp` | `/guides/id-to-sell-silver-texas` | Guide header | - |
| `guide-bars-rounds-1600.webp` | `/guides/selling-silver-bars-and-rounds-houston` | Guide header | - |
| `guide-commercial-1600.webp` | `/guides/commercial-dental-industrial-silver-houston` | Guide header | - |
| `guide-inherited-flatware-1600.webp` | `/guides/inherited-sterling-flatware-tea-sets-houston` | Guide header | - |
| `guide-price-scrap-1600.webp` | `/guides/how-silver-buyers-price-scrap-houston` | Guide header | - |
| `guide-refiner-vs-pawn-1600.webp` | `/guides/selling-silver-refiner-vs-pawn-shop-vs-online` | Guide header | - |
| `faq-1600.webp` | `/faq` | FAQ header | - (OG falls back to `ag-silver-social.webp`) |
| `process-weigh-1600.webp` | `/`, `/how-it-works` | Process step: weigh | Optional still stand-in for `images/ag-refining-process-05-weigh-poster.webp` (that poster is 1920x1080 film art, not this 16:9 still) |
| `process-test-1600.webp` | `/`, `/how-it-works` | Process step: test | Optional still stand-in for `images/ag-refining-process-03-acid-test-poster.webp` or `-04-xrf-poster.webp` |
| `process-pay-1600.webp` | `/`, `/how-it-works` | Process step: pay | - (no pay-step still or film on the site) |

### Portal, email, and Open Graph

| v2 file | Page / surface | Slot | Replaces |
|---|---|---|---|
| `portal-9x16.webp` (1080x1920) | `/sell`, `/vender` | Portal backdrop, portrait | - (the portal has no background image today) |
| `portal-4x5.webp` (1080x1350) | `/sell`, `/vender` | Portal backdrop, tall | - |
| `email-header-1200x400.jpg` | Lead emails in `api/leads.js` | Email header, 3:1 | - (emails currently use a typeset "Ag" mark, no header image) |
| `email-header-2400x800.jpg` | Lead emails | Email header, 2x | - |
| `og-default-1200x630.jpg` | Sitewide default, plus Organization schema | Open Graph / Twitter | `assets/ag-silver-social.jpg` and `assets/ag-silver-social.webp` (those are 1200x675, not 1200x630). `ogSize()` in `build.mjs` currently assumes 1200x675 for the default, so wiring this file also needs that helper updated. |
| `og-materials-1200x630.jpg` | Materials section pages | Section OG | - (those pages currently share the default social card, or a material 4:3 image) |
| `og-industries-1200x630.jpg` | Industry pages | Section OG | - (same) |
| `og-areas-1200x630.jpg` | `/service-areas` and city pages | Section OG | - (same) |
| `og-guides-1200x630.jpg` | `/guides` and individual guides | Section OG | - (same) |

## Slots with no v2 stand-in

These live assets were not in the top-pick set, so they have no file in this folder:

- `assets/material-xray-film-1280.webp` / `-800.webp` (`/x-ray-recycling-services-houston`). Closest picks are `material-medical-xray-*` or `material-industrial-ndt-*`.
- `assets/material-sterling-hollowware-*`. Closest pick is `material-sterling-flatware-*` or `material-silver-plated-*`.
- Older unused or alias filenames still on disk: `material-silver-jewelry-*`, `material-silver-coins-*`, `material-laboratory-silver-*`, `material-watch-batteries-real-*`, `material-dental-*`. The table above notes the v2 basename that should replace each one if they are still referenced after the manifest.
- The nine-clip cinematic process film (`process-02` through `process-09`, and the furnace / cooling / pour / bars posters). Only a single flatware loop is offered as a simpler hero alternative.
- Map strip: `images/ag-refining-map-hobby-airport.webp`.
- Assay scene: `assets/ag-assay-monolith-1280.webp`.
- Logo and marks: `assets/ag-mark*.svg`.

## Wiring notes

- Do not overwrite the live files in place on the first pass. Point markup at `/assets/v2/...`, then delete the old files once the pages look right.
- Material and area cards can drop in at the current width/height (1280x960 and 800x600).
- If the default OG file changes from 1200x675 to 1200x630, update `ogSize()` in `scripts/build.mjs`.
- Email header is already cropped to 3:1. Host it on a public HTTPS URL; many clients will not load WebP.
- Nothing in this folder is gold, has typography, or pretends to be Dennis's shop. The how-it-works v2 stills use the clean scale (not the flagged Walking Liberty coin). The process stills are the clean regens.
