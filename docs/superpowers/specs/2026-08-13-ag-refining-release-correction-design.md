# AG Refining Release Correction Design

## Page Contract

AG Refining serves Houston-area commercial, industrial, medical, recycling, and business accounts that hold silver-bearing material. The homepage must establish the material transformation, local pickup service, operational credibility, and one primary action—`Schedule a Free Pickup`—within the first screen. Phone contact remains an in-flow fallback, never a competing fixed mobile action.

## Visual System

- Deep navy `#102a43` is the continuous homepage canvas.
- Warm paper `#faf8f2` is used for high-contrast forms, cards, and contained information.
- The cinematic silver-pour hero is the signature element.
- Every eyebrow, small section label, H2, H3, and card heading is written in Title Case in HTML; body copy and legal text remain sentence case.
- Materials use separated 4:3 editorial cards with visible gutters, distinct borders, intentional crops, and no merged spreadsheet-like grid.
- Service areas use distinct hyper-realistic Houston-area imagery rather than arbitrary material photos or low-detail icons as the primary visual.

## Hero And Media

- The hero fills the complete initial viewport on mobile and desktop with no exposed cream strip or header reservation.
- The header starts hidden and reveals after scrolling; it does not reduce the initial hero height.
- Production must serve the repository's 1280×720 clips rather than the current 640×360 deployment output.
- A new 4K/2K generated hero poster provides a sharp first frame while video initializes.
- The overlay remains light enough to show real video detail while preserving readable white hero copy.
- Video, poster, and media layers have no CSS blur, brightness, contrast, or saturation filters.

## Mobile Navigation And Pickup Dock

- The top-right menu button becomes a crisp luxury control with a two-line open/close animation.
- Opening it reveals a compact panel anchored beneath the button. It never becomes a bottom sheet, full-screen mask, blurred scrim, or dark page overlay.
- Outside click, Escape, link selection, and breakpoint changes close the panel and restore focus.
- The only bottom-rising interface is one `Schedule a Free Pickup` dock. It sits above the safe-area inset, occupies only the bottom edge, appears after meaningful scrolling, hides while navigation is open, and hides before the footer.
- Hidden fixed controls are inert, `aria-hidden`, and absent from keyboard order.

## Cards And Images

- Every material card is a separate 4:3 box with the image filling its frame through `object-fit: cover` and an asset-specific focal point when required.
- Responsive 800×600 and 1280×960 WebP variants are emitted with `srcset` and `sizes`.
- Broken obsolete live paths are eliminated; every built image must load with a nonzero natural width.
- Physically inaccurate or duplicated imagery is replaced for industrial NDT film, medical X-ray film, X-ray recycling, industrial silver, mixed scrap silver, laboratory silver, coins, jewelry, sterling flatware, and electronics silver.
- Seven service-area images visually distinguish Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, and Conroe without fake signage or readable generated text.

## Footer And Information Architecture

- The footer exposes complete grouped navigation for all 17 material pages, all industry pages, all 23 service areas, process/about/contact/privacy pages, telephone, and email.
- Mobile groups use accessible disclosures to keep the footer navigable without becoming an endless undifferentiated column; desktop shows structured columns.
- All current canonical routes remain unchanged.

## Loading And Motion

- A short fail-open loader uses the real assay motif `Ag / 47` and `99.9` as a visual sequence, not a revenue or performance claim.
- It ends immediately when the hero poster is ready and always fails open within 1.2 seconds.
- Motion is limited to loader exit, header reveal, compact menu, pickup dock, and purposeful card entrances.
- Reduced-motion mode removes nonessential animation and keeps all content immediately available.

## Verification

- Test-first contracts cover full-viewport hero behavior, compact mobile navigation, bottom-dock geometry, Title Case labels, complete footer route inventory, 4:3 cards, responsive assets, and zero broken built images.
- Browser checks cover 320×800, 390×844, 768×1024, 900px, 901px, 1440×960, keyboard navigation, reduced motion, loader fail-open, footer collision, and zero horizontal overflow.
- Production is not changed until deterministic tests, route verification, media checks, and browser verification are complete.
