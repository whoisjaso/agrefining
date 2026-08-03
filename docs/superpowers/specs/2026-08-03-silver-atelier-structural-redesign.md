# AG Refining Silver Atelier Structural Redesign

## Purpose

Redesign every AG Refining public page around one restrained, premium system called **The Silver Atelier**. Preserve the site’s working conversion infrastructure, search footprint, factual discipline, and lead delivery while replacing the current accumulation of mesh, glass, dark bands, pills, shadows, decorative numerals, and competing calls to action.

The finished site should feel like a premium industrial product presented with Porsche-level control: warm, exact, tactile, spacious, and confident. It must still read immediately as a Houston silver buyer rather than a generic luxury brand.

## Page contract

- **Business:** AG Refining, a Houston-based family silver buyer serving commercial, industrial, medical, laboratory, jewelry, estate, and individual customers.
- **Primary audience:** A facility manager, office manager, owner, technician, or operator who has silver-bearing material but is not a refining expert.
- **Entry state:** The visitor arrives from search with a material in mind and uncertainty about legitimacy, handling, valuation, pickup, and payment.
- **Single job:** Turn a qualified visitor into a scheduled pickup request.
- **Primary action:** `Schedule a Free Pickup` everywhere.
- **Fallback action:** Call AG Refining.
- **Evidence:** Houston address and service area, qualifying on-site weighing, real material photography, the Stevens family history, clear process language, and honest limitations.
- **Claims not to invent or strengthen:** Insurance, assay method, licensing, compliance, fees, minimums, shipping acceptance, exact payment timing, and unconditional pickup.

## Protected infrastructure

The redesign must preserve:

- all 38 indexed URLs and current redirects;
- current exact SEO titles, descriptions, canonicals, structured data, robots rules, and sitemap inventory;
- the material, industry, and location registries in `scripts/build.mjs`;
- the `/api/leads` contract, Resend delivery, validation, attribution, idempotency, and email fallback;
- the form query-prefill behavior and approved material values;
- qualified wording around pickup, weighing, service, and payment;
- semantic landmarks, keyboard navigation, focus management, reduced motion, safe-area handling, and 320px minimum support;
- real image dimensions and the existing optimized asset pipeline.

## Visual direction

### Palette

Use six roles consistently:

| Role | Value | Use |
|---|---:|---|
| Mineral canvas | `#f1ede4` | Primary page ground and browser chrome |
| Porcelain | `#faf8f2` | Forms, image mats, quiet inset surfaces |
| Graphite | `#171815` | Text, primary buttons, the single deep conversion band |
| Steel | `#8d918d` | Secondary rules, captions, material metadata |
| Champagne | `#9b7b56` | Sparse value/provenance accents under 5% of a viewport |
| Functional blue | `#256c8e` | Focus, links, validation, and interactive state only |

No gradient-filled text, gold glows, green, neon, pure white, or pure black. Remove automatic dark mode so the visual contract remains consistent across devices and the top of every page stays light.

### Typography

- Use Manrope for navigation, body copy, controls, labels, data, and most headings.
- Use Newsreader only for selected editorial statements, the family quotation, and a small number of high-value display lines.
- Headlines should be compact, left aligned, and controlled rather than oversized for spectacle.
- Body copy remains readable at 16px or larger with a maximum measure near 64 characters.
- Use uppercase sparingly for operational micro-labels, never for paragraphs or promotional shouting.

### Geometry and elevation

- Prefer 0px to 12px radii for structural surfaces. Reserve pills for compact status information only.
- Use hairline boundaries and spacing before shadows.
- Forms and important raised controls may use one restrained two-layer shadow.
- Remove floating glass cards and blurred card backgrounds.
- Use a 12-column desktop grid and deliberate asymmetry rather than equal-weight card walls.

### Signature element: the assay line

The signature visual is a fine calibrated line derived from weighing and refining. It may carry small ticks, `Ag / 47`, material labels, or actual process stages. It appears in the hero, real process sequences, and selected section transitions. It must communicate progression or measurement, never decorate an unrelated card.

### Photography

- Treat photographs as evidence and material study.
- Use large editorial crops with stable aspect ratios, subtle cream mats, and concise factual captions.
- Preserve the furnace image as a transformation image, but do not use it as a dark full-screen background.
- Prefer real or physically credible material imagery over generic industrial stock.
- Do not add fake people, facilities, credentials, equipment, dashboards, or customer logos.

### Motion

- One restrained behavior: short opacity and vertical-position entrances for major compositions.
- No stagger applied to every card, no floating mesh, no bounce, no parallax, and no page-exit animation.
- Interaction feedback uses 160–240ms transitions.
- `prefers-reduced-motion` removes every nonessential transition and reveal.

## Information architecture and shared shell

### Header

- Keep a slim information rail for Houston, phone, email, and Spanish.
- Use a quiet cream navigation bar with a compact mark and wordmark.
- Keep five recognizable destinations: Materials, Industries, Service areas, How it works, Our story.
- Use one graphite `Schedule a Free Pickup` button.
- Preserve the accessible mobile bottom sheet, but simplify its surfaces and motion.

### Footer

- Use one graphite footer/conversion composition instead of multiple competing dark bands.
- Present contact details, high-intent material links, and claim qualification clearly.
- Keep privacy and legal copy visible without turning the footer into a link directory.

### Persistent mobile action

- Keep the call and pickup dock because mobile is primary.
- Use porcelain and graphite, visible focus, safe-area padding, and enough document padding so it never covers content.

## Homepage structure

1. **Light editorial hero:** clear offer, Houston qualifier, one pickup CTA, phone fallback, and furnace photography in a controlled side frame.
2. **Material intake strip:** move the material and quantity fields out of a floating glass card into a flat, full-width porcelain assessment surface.
3. **Trust facts:** Houston-based, qualifying pickup, visible weighing, and qualified payment language separated by rules.
4. **Material editorial index:** replace the repeated six-card grid with alternating image-led rows and a concise all-materials route.
5. **Process assay line:** show the real contact-to-payment sequence with calibrated progression.
6. **Commercial service feature:** explain facility pickup with one strong industrial photograph and a short operational list.
7. **Industry index:** use a divided editorial list rather than six equal cards.
8. **Service area:** compact regional proof with high-intent city links.
9. **Family provenance:** one calm editorial quotation and factual lineage.
10. **Location and FAQ:** preserve practical details and objections near conversion.
11. **Single deep conversion band:** graphite background, porcelain type, pickup action, and phone fallback.

## Page-family structure

### Standard material, industry, and location pages

- Light breadcrumb and hero.
- Image beside the offer, never behind it.
- One early answer band.
- Hairline-divided detail sections.
- True process sequence.
- Relevant related links with editorial hierarchy.
- FAQ and one final conversion band.

### Long-form material pages

- Shared light hero and image treatment.
- Quick answer followed by a scannable material-type index.
- Audience and handling guidance separated visually.
- Safety or identification guardrails use a warm stone inset, not an alarmist dark block.
- Reasons, process, FAQ, and conversion use the same shared primitives as every other page.

### Coin page

- Preserve the consumer-friendly language and collector-value caution.
- Use gallery-like image presentation and calmer evaluation steps.
- Avoid bullion hype, speculative graphics, or luxury-coin clichés.

### X-ray and Houston hubs

- Present routing choices as editorial pathways rather than app-style cards.
- Security, records, and handling guidance remain explicit.
- Houston proof uses address, service coverage, and pickup process rather than invented metrics.

### Taxonomy pages

- Use a two-column editorial index on desktop and a single reading column on mobile.
- Feature selected categories with imagery while keeping every link discoverable.
- Avoid large walls of identical rounded cards.

### How it works

- Make the actual six-stage sequence the visual centerpiece.
- Put qualifications and call-before-moving guidance at the stage where they matter.

### About

- Use provenance, not sentimentality.
- Keep John and Dennis Stevens central without inventing dates, awards, or biography.
- Tie family credibility directly to weighing, communication, and customer choice.

### Contact

- Keep the full accessible pickup form and server contract.
- Divide the page into a calm form workspace and a practical expectation rail.
- Preserve clear failure, validation, loading, success, and email-fallback states.

### Spanish, privacy, and 404

- Apply the same typography, spacing, header, footer, CTA, and light-page system.
- Preserve Spanish semantics and privacy content.
- Keep the 404 short and route visitors to materials or pickup.

## Responsive behavior

- Compose and verify at 320px, 390px, 768px, 1024px, and 1440px.
- Mobile is a deliberate single-column editorial layout, not compressed desktop.
- Maintain 44px minimum coarse-pointer targets and 16px form controls.
- Avoid horizontal scrolling, clipped focus rings, covered form errors, and fixed controls over legal text.
- Images use mobile sources where available and retain declared dimensions.

## Accessibility and resilience

- Maintain one `h1` per page, logical heading order, semantic landmarks, labeled form controls, visible status messages, and keyboard-safe navigation.
- Functional blue and underline/shape changes identify interactive state; color is never the only state signal.
- The primary path works without optional animation or storage APIs.
- The lead form retains its recovery path when online delivery is unavailable.

## Acceptance criteria

- All existing verification passes and the indexed route count remains 38.
- Every page family uses the Silver Atelier shell and shared visual primitives.
- The top 40% of every page is light.
- The homepage has one primary pickup action and phone fallback in the hero.
- No floating glass intake card, animated mesh field, gradient text, decorative fake metrics, or unrelated ornamental numbering remains.
- Automatic dark mode is removed.
- All forms, links, route targets, local assets, SEO metadata, structured data, redirects, and lead payloads remain valid.
- Keyboard, reduced-motion, mobile safe-area, loading, error, and fallback states remain supported.
- The design cannot be plausibly rebranded for an unrelated company without changing the assay line, silver imagery, Ag/47 language, material taxonomy, and process structure.
