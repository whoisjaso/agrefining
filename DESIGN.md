# AG Refining design system

Single stylesheet at `src/style.css`, no framework, no build step for CSS. Every
value below is a token defined in `:root`. Components reference tokens, never raw
values.

## Color strategy

**Restrained.** Tinted neutrals carry the surface; champagne is the single accent
and stays under 10% of any viewport. Azure is functional rather than decorative:
it marks the things you can click.

The restraint is deliberate. The competitive set shouts in yellow-gold; a quiet
silver-grey page with one warm metal accent reads as the established business in
the category.

### Neutrals

Never `#000` or `#fff`. Every neutral carries a slight cool cast toward the
silver the business actually handles, so white surfaces sit next to photographs
of metal without looking blue by comparison.

| Token | Role |
|---|---|
| `--paper` | page ground |
| `--surface` | cards, panels, form fields |
| `--surface-2` | hover and nested surfaces |
| `--surface-sunk` | wells and inactive areas |
| `--ink` / `--ink-2` | body and secondary text |
| `--muted` / `--muted-2` | supporting and micro text |
| `--night` / `--night-2` / `--night-3` | deep bands, below the fold only |

### Accents

| Token | Role |
|---|---|
| `--gold` / `--gold-soft` / `--gold-deep` | champagne accent: eyebrows, numerals, rules, marks |
| `--azure` / `--azure-2` | interactive: links, primary buttons, focus |

Champagne signals value, azure signals action. They never swap jobs. The client
approved azure specifically, described in his own words as "luxurious baby blue".

### Mesh

Four-stop radial gradient fields, blurred and slowly drifting, with a fine grain
overlay to stop banding. Light stops (`--mesh-a` … `--mesh-d`) for the top of
every page; night stops (`--mesh-na` … `--mesh-nd`) for the deep bands lower
down. The mesh is the one piece of visual ambition on the page and it stays
behind content, never competing with it.

## Theme

**Light, primarily.** The scene: an office manager checking a supplier on an
iPhone in a bright warehouse office, mid-morning, holding a box of X-ray film
they want gone. Glare on the screen is likely. Light ground, high contrast text.

Dark mode is supported through `prefers-color-scheme` for the reader whose phone
is set that way, not as the design's default posture.

## Typography

Newsreader for display, Manrope for body, and the system UI stack
(`-apple-system`) for controls so buttons and inputs feel native on iOS rather
than webby.

Headings use `clamp()` and sit above the scale. Everything else snaps to eight
steps, no exceptions:

| Token | px | Use |
|---|---|---|
| `--fs-2xs` | 11 | micro labels |
| `--fs-xs` | 12 | eyebrows, captions |
| `--fs-sm` | 13 | fine print |
| `--fs-md` | 14 | meta, dense UI |
| `--fs-base` | 15 | secondary body |
| `--fs-body` | 16 | body, and the iOS no-zoom floor for inputs |
| `--fs-lg` | 18 | card titles, lede |
| `--fs-xl` | 21 | large lede, wordmark |

Plus `--fs-numeral` and `--fs-numeral-sm` for display figures.

Body copy caps at `--measure` (66ch). Headings get `text-wrap: balance`, body
gets `text-wrap: pretty`.

## Elevation

Two-layer shadows only: a tight contact shadow plus a wide soft one. `--lift-1`
through `--lift-3`, with `--lift-gold` and `--lift-azure` for accent buttons.
Cards at rest use `--lift-1`; hover promotes one step.

## Motion

`--ease` (expo out) for reveals, `--ease-ios` for anything a finger touched.
Durations `--fast` 180ms, `--mid` 320ms, `--slow` 620ms. Mesh drift runs 34-40s.
Nothing bounces. `prefers-reduced-motion` disables all of it.

## iOS specifics

Not optional; this is the primary platform.

- `env(safe-area-inset-*)` on header, dock, footer, and nav sheet
- Nav opens as a bottom sheet with a drag handle, not a top drawer
- Action dock is visible by default and hides at page top and over the footer, so
  it works without JavaScript
- Inputs at 16px so Safari does not zoom on focus
- Minimum 44px touch targets under `pointer: coarse`
- `:active` press states replace hover under `hover: none`

## Component notes

- **Numerals** are the structural device: they encode real sequence in the
  process rails, and position in the material index. They are not decoration and
  are not used where order carries no meaning.
- **Backdrop blur** is reserved for chrome that genuinely floats over scrolling
  content: header, nav sheet, action dock, guide. Not for cards.
- **Cards** are used for the material and industry indexes, where items are
  genuinely comparable and scannable. Everywhere else prefers hairline-divided
  lists and rails.

## Non-negotiables

- No em dashes and no emoji anywhere in the repo. `scripts/check.mjs` fails the
  build on both.
- No gradient-filled text.
- Every image needs real `width` and `height` so nothing shifts while loading.
  `scripts/optimize-asset.mjs` prints the correct values.
