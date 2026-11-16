# AG Refining design system

## The Silver Atelier: Creme and Blue

The site presents a Houston silver buyer with the composure of a premium industrial manufacturer. The system is warm, exact, tactile, and restrained. It uses real material photography, clear process language, mineral surfaces, and calibrated rules instead of generic luxury effects.

The design has one commercial job: help a qualified visitor schedule a pickup with confidence.

## Design principles

1. **Evidence before decoration.** Photography, address, process, weighing language, and family provenance establish trust.
2. **One visual contract.** Every route uses the same shell, color roles, typography, buttons, spacing, and conversion pattern.
3. **Editorial structure before cards.** Divided lists, image-led rows, and measured whitespace carry most layouts. Cards are reserved for genuinely comparable information.
4. **Luxury through control.** Small details, consistent alignment, and quiet transitions create the premium effect.
5. **Silver-specific identity.** The material taxonomy, controlled refining imagery, restrained `Ag / 47` details, and Houston operating facts make the system difficult to rebrand generically.

## Color system

The shared site is intentionally light. The homepage alone opens with a controlled deep-navy photographic hero; this is a bounded composition, not an automatic dark theme. The warm surface hierarchy remains stable across devices and routes.

| Token | Value | Role |
|---|---:|---|
| `--canvas` | `#f1ede4` | Creme page ground and browser chrome |
| `--paper` | `#faf8f2` | Forms, image mats, and quiet inset surfaces |
| `--paper-strong` | `#fffdf8` | Form controls and the brightest local surface |
| `--navy` | `#102a43` | Headings, primary actions, footer, conversion band |
| `--ink` | `#20354c` | Primary body copy |
| `--ink-soft` | `#40566d` | Lead copy and secondary text |
| `--muted` | `#586b7e` | Captions, qualifications, and metadata |
| `--steel` | `#8796a5` | Secondary rules and material metadata |
| `--steel-soft` | `#d6dde3` | Quiet media fallback surface |
| `--mineral-blue` | `#416b94` | Assay, provenance, and editorial accent |
| `--mineral-blue-soft` | `#dce7f0` | Selection and cool inset support |
| `--focus` | `#1d5e96` | Links, focus, and functional interaction state |
| `--danger` | `#984b3e` | Validation errors only |
| `--success` | `#476653` | Confirmed operational state only |

### Color rules

- Creme remains the dominant field and carries most page surfaces.
- Ink blue appears as type, controls, the footer, and one final conversion composition.
- Mineral blue stays below roughly 8 percent of a normal viewport and marks assay, provenance, and interaction details.
- Pure black, pure white, neon accents, gold glows, and gradient-filled text are prohibited.
- Internal route introductions remain light. The homepage V2 hero is the sole dark opening exception.

## Typography

Rollgates Luxury is the approved target display face. Because its commercial webfont files are not currently present in the repository, Manrope at a calibrated `360` weight carries display headings without an external font request or licensing risk. Manrope also carries navigation, body text, labels, controls, and data. Newsreader is limited to selected numeric and silver-signature moments.

- Display headings use a light luxury-sans weight, controlled tracking, and compact line height.
- `h1` scales from `3rem` to `6.8rem` and is limited to approximately 11 characters per line.
- `h2` scales from `2.15rem` to `4.35rem` and is limited to approximately 14 characters per line.
- Body text remains at least `1rem` with a maximum measure of `64ch`.
- Operational labels may use small uppercase text with wide tracking.
- Paragraphs never use uppercase styling.
- Headings use balanced wrapping. Body copy uses pretty wrapping where supported.

## Layout and spacing

The shared content shell is capped at `1280px` with a responsive gutter from `1.15rem` to `3.5rem`.

| Token | Use |
|---|---|
| `--section` | Major editorial separation, `5rem` to `9.5rem` |
| `--section-tight` | Related content grouping, `3.5rem` to `6rem` |
| `--gutter` | Safe horizontal page space |
| `--measure` | Readable text width |

Desktop compositions use deliberate asymmetry. Tablet and mobile layouts become purposeful reading columns instead of compressed desktop grids. Hairlines and whitespace establish hierarchy before background changes or elevation.

## Geometry and elevation

- `3px` is the default control radius.
- `7px` and `12px` are reserved for selected inset surfaces and grouped media.
- Pills are limited to compact status information.
- Standard content does not use glass, backdrop blur, or glow.
- Forms and truly raised controls may use one restrained two-layer shadow.
- Hover never changes layout or causes large movement.

## Signature element: assay line

The assay line is a calibrated rule with fine ticks and a compact material label such as `Ag / 47`. It is derived from weighing, measurement, and refining.

Use it for:

- selected internal page framing;
- the actual contact-to-payment sequence;
- selected transitions where measurement or progression is meaningful.

The homepage V2 hero does not use the assay line. Do not use it as a random divider, decorative graph, or fake performance metric.

## Photography

Photography is operational evidence.

- Use real or physically credible silver-bearing material and process imagery.
- Keep image dimensions explicit to prevent layout shift.
- Use stable editorial crops and responsive mobile sources where available.
- Present the furnace as a transformation image inside a controlled frame.
- Use cream mats, quiet captions, and hairline borders when an image needs separation.
- Never invent people, facilities, customer logos, credentials, equipment, or dashboards.

## Shared shell

### Header

- Slim information rail for Houston, phone, email, and Spanish.
- Cream navigation surface with one compact mark and wordmark.
- Five stable destinations: Materials, Industries, Service areas, How it works, Our story.
- One ink-blue `Schedule a Free Pickup` action.
- Accessible mobile sheet with focus management and Escape handling.

### Footer

- One ink-blue footer composition.
- Contact details, high-intent material links, service qualification, privacy, and legal copy remain visible.
- No separate collection of competing dark promotional bands.

### Mobile action model

- Fixed action docks and the material guide are hidden at `900px` and below.
- Pickup, phone, and material paths remain available as in-flow controls in the page and navigation.
- Coarse-pointer targets are at least `44px`, and no fixed control may cover reading or form content.

## Buttons and links

Only three button variants are allowed:

| Class | Use |
|---|---|
| `.button-primary` | Main pickup action; paper-on-navy in the homepage hero |
| `.button-secondary` | Lower-priority navigation, with contrast adapted to its surface |
| `.button-inverse` | Pickup action on ink-blue surfaces |

Text and phone links use a restrained underline expansion. The primary action label is `Schedule a Free Pickup`; the phone number is the fallback. The homepage may also use `See what we buy` as a clearly subordinate material path. Route heroes do not introduce competing quote language.

## Page structures

### Homepage

The approved order is:

1. cinematic deep-navy refining hero with responsive imagery and an in-hero proof rail;
2. porcelain material intake panel;
3. four operational trust facts;
4. six image-led material rows;
5. six-stage assay process;
6. facility pickup feature;
7. editorial industry index;
8. Houston service area;
9. family provenance;
10. location and FAQ;
11. one ink-blue conversion band.

The hero has one dominant pickup action, one subordinate `See what we buy` path, and one phone fallback. The hero uses a dedicated portrait source on mobile, contains no WebGL or canvas dependency, and ends before the intake section begins. The intake controls are nested inside their labels so grid placement remains stable at every width.

### Material, industry, and location pages

- Light breadcrumb and image-beside-copy hero.
- Early plain-language answer.
- Hairline-divided detail sections.
- Real process sequence and handling guidance.
- Relevant editorial links, FAQ, and one conversion band.

### Long material and coin pages

- Scannable material index and audience guidance.
- Warm handling inset for safety or identification limits.
- Gallery-like images without bullion hype or speculative graphics.
- Collector-value cautions remain explicit on coin routes.

### X-ray and Houston hubs

- Editorial pathway lists replace app-like card walls.
- Records, handling, and security guidance stay visible.
- Houston credibility uses address, service coverage, and process rather than invented metrics.

### Taxonomy pages

- Two-column editorial index on desktop.
- One reading column on mobile.
- Every route remains discoverable without a wall of identical cards.

### About, process, contact, Spanish, privacy, and 404

- About uses factual family provenance.
- How it works centers the actual six-stage sequence.
- Contact separates the accessible form workspace from an expectation rail.
- Spanish, privacy, and 404 share the same typography, spacing, shell, and action hierarchy.

## Motion

- Editorial content is never hidden behind a scroll observer or JavaScript reveal state.
- Interaction feedback uses `160ms` to `260ms` transitions.
- No floating mesh, parallax, bounce, continuous ambient movement, or page-exit animation.
- `prefers-reduced-motion` removes nonessential transitions.
- Content remains visible and usable if JavaScript does not initialize.

## Responsive and accessibility requirements

- Support `320px`, `390px`, `768px`, `1024px`, and `1440px` compositions.
- Keep form controls at `16px` or larger to prevent mobile browser zoom.
- Preserve safe-area padding, visible focus, one `h1`, semantic landmarks, labeled controls, and keyboard-safe navigation.
- Do not allow horizontal overflow, clipped focus rings, or fixed controls over content.
- Interactive state uses more than color alone.
- Form validation, loading, success, server failure, and email fallback states remain readable.

## Non-negotiables

- No em dash and no emoji anywhere in the repository.
- No automatic dark mode.
- No gradient-filled text.
- No animated mesh fields.
- No floating glass intake card.
- No decorative numbering where order has no meaning.
- No unsupported claims, fake metrics, invented credentials, or fabricated social proof.
- Every image keeps real `width` and `height` attributes.
- Every public route uses `data-design="silver-atelier"` and the shared header and footer.

`scripts/check.mjs` and `scripts/verify.mjs` enforce the critical parts of this contract across all generated pages.
