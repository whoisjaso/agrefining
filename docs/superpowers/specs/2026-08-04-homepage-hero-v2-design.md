# AG Refining Homepage Hero V2 Design

## Approval basis

Jason rejected the live split-screen 3D hero and directed us to try a completely different first impression. Earlier direction delegates execution, publication, and deployment without another approval round. This spec converts that direction into an exact implementation contract.

## Page contract

- Business: AG Refining, a Houston silver buyer serving commercial, industrial, medical, institutional, and qualifying private accounts.
- Entry state: A visitor has silver-bearing material, may not know its precise category or value, and wants a trustworthy local next step.
- Hero job: Explain what AG Refining does, why the process feels safe, and what the visitor should do next within five seconds.
- Primary action: `Schedule a free pickup`.
- Acceptable fallback: `See what we buy`.
- Supported proof: Houston-based service, free pickup for qualifying accounts, on-site weighing, direct review of the offer, and payment terms confirmed with the offer.
- Prohibited claims: Guaranteed value, guaranteed pickup, guaranteed same-day payment, invented certifications, invented customer counts, or invented turnaround times.

## Chosen visual direction

Replace the pale split-screen assay monolith with a near-full-viewport cinematic photograph of controlled silver refining. The image shows a bright stream of molten silver entering a clean graphite or steel mold inside a dark industrial setting. Deep navy-black negative space supports the copy while the silver and restrained furnace warmth create one focal event.

This is not a stock “luxury object” composition. The subject is AG Refining's actual transformation: silver-bearing material becoming verified metal value.

## Composition

### Desktop

- The hero begins immediately below the existing site header.
- A full-bleed `<picture>` covers the entire hero.
- The generated subject sits to the right of center, leaving dark negative space on the left.
- A navy-to-transparent overlay protects text contrast without obscuring the refining scene.
- The copy block sits left and low enough to feel editorial rather than vertically stranded.
- A proof rail is anchored inside the bottom of the hero.
- The current material intake form moves into its own cream section immediately after the hero.

### Mobile

- A dedicated portrait crop places the silver pour in the upper half.
- Copy occupies the lower half over a stronger navy gradient.
- The primary and secondary actions stack at 320px and remain at least 44px tall.
- The proof rail becomes a compact two-column list.
- No floating dock, material guide, 3D canvas, or horizontal overflow is allowed.

## Copy

- Eyebrow: `Houston, Texas · Commercial silver buyer`
- Heading: `Your silver, valued precisely.`
- Supporting copy: `Free pickup for qualifying Houston accounts. See the weight, review the offer, and choose what happens next.`
- Primary CTA: `Schedule a free pickup`
- Secondary CTA: `See what we buy`
- Call fallback: `Call (281) 898-2719`
- Proof rail: `Houston-based`, `Free qualifying pickup`, `On-site weighing`, `Confirmed payment terms`

## Visual system

- Base navy: `#071827`
- Ink navy: `#102a43`
- Cream: `#f1ede4`
- Paper: `#faf8f2`
- Silver: `#d6dde3`
- Controlled warm highlight: image-only furnace glow; never used as a CTA color.
- Display type: existing local Manrope variable font at light-to-regular weight. The licensed Rollgates Luxury font remains unavailable and must not be claimed.
- Body type: existing local Manrope variable font.
- Shape language: square or lightly radiused controls only. No glass cards, floating orbs, glow borders, or decorative badge clutter.

## Motion and resilience

- The hero image and copy are visible without JavaScript.
- No WebGL, Three.js, canvas, parallax, or auto-playing video runs in the hero.
- Optional motion is limited to the existing button feedback and navigation.
- Reduced-motion behavior is therefore identical to the default hero.
- The desktop image is eager-loaded with `fetchpriority="high"`; below-fold images remain lazy.

## Asset contract

- Desktop file: `assets/ag-refining-hero-v2-2048.webp`, intrinsic size 2048 by 1152, maximum 280 KiB.
- Mobile file: `assets/ag-refining-hero-v2-mobile.webp`, intrinsic size 960 by 1280, maximum 180 KiB.
- Both images contain no text, logos, watermarks, fake UI, people, jewelry-store props, gold bullion, coins, or cryptocurrency cues.
- The molten material must read as silver-white metal, not lava or gold.

## Test contract

- The generated home page contains the exact V2 heading and both CTA labels.
- The hero contains one responsive picture using both V2 assets.
- The proof rail remains inside the hero.
- The intake form appears after the closing hero section.
- The home page contains no `data-assay-stage`, assay canvas host, or assay fallback markup.
- `src/site.js` contains no homepage dynamic import of `/assay-scene.js`.
- Existing 39-document, form, navigation, Spanish, touch, and content-verification contracts remain green.
- Browser verification covers 1440x960, 390x844, 320x800, JavaScript disabled, and reduced motion.

## Success criteria

A first-time visitor can say “AG Refining buys silver in Houston and I can schedule a pickup” within five seconds. The first screen feels photographic, calm, expensive, and operationally credible. Nothing in the hero resembles a generic AI SaaS page or a 3D product configurator.
