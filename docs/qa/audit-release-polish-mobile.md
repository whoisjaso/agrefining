# Mobile release polish audit

## Integrity verdict

HOLD. The generated route system is visually consistent and has no horizontal overflow, but the fixed mobile controls still obscure reading and form content. The hidden mobile action dock also creates two invisible keyboard stops on the 404 route. These are release defects, not optional polish.

Score: 14/20

- Accessibility: 2/4
- Performance: 3/4, limited to rendered runtime stability in this audit
- Theming and tokens: 4/4
- Responsive resilience: 2/4
- Implementation integrity: 3/4

## Evidence scope

- Rendered the current `dist` output for all 39 HTML documents at 320x800, 390x844, and 768x1024. Total: 117 render cases.
- Measured 5,296 deterministic scroll stops. Stops included regular intervals plus headings, forms, and footer landmarks.
- Compared topmost fixed-control rectangles against visible text ranges and interactive target rectangles.
- Opened the material guide in every render case and checked viewport containment, dock collision, link stacking, and target reachability.
- Checked horizontal overflow, shared shell presence, design marker, palette, heading count, console errors, and focus clipping.
- Replayed sequential keyboard navigation on the short 404 route, where the action dock never becomes visible.

## Findings

### MOBILE-P1-001: Hidden mobile dock remains in the keyboard order

- Severity: P1
- Route: `/404.html`
- Component: `.mobile-actions[data-visible="false"]`
- Viewports: 320x800, 390x844, and 768x1024
- User context: Keyboard navigation
- Status: OPEN
- Evidence: After the visible `View materials` link, the next two Tab presses focus `Call` and `Schedule a Free Pickup` inside the hidden dock. At 390x844 the focused rectangles begin at y=858.61, below the 844px viewport. The parent dock has `data-visible="false"`, opacity 0, pointer events disabled, and a downward transform, but its links remain sequentially focusable. The same failure occurs at 320px and 768px.
- Impact: Keyboard users lose the visible focus indicator for two consecutive stops and cannot tell what control is active. This fails the visible-focus requirement in WCAG 2.4.7.
- Expected behavior: A hidden dock must not expose focusable descendants. Visibility state must update keyboard and accessibility state as well as opacity and pointer behavior.
- Regression check: On each target viewport, Tab through the complete 404 page. Every focused element must be visible within the viewport. When `data-visible="false"`, no dock descendant may receive sequential focus.
- Fix owner: Frontend implementer for mobile chrome state.
- Independent grader: Keyboard accessibility grader using real sequential Tab navigation.

### MOBILE-P1-002: Fixed chrome obscures form controls and labels

- Severity: P1
- Routes: `/contact` and `/espanol`
- Components: `.material-guide`, `.mobile-actions`, and `.review-form`
- Viewports: 320x800, 390x844, and 768x1024
- User context: Touch and pointer users completing the lead form
- Status: OPEN
- Evidence: At 390x844 and scroll y=640, the dock covers the full visible 353.22x53.59px business input while the 45.52x44px guide covers the adjacent label and the preceding name field. At 320x800 and scroll y=912, the dock covers the email input and the guide crosses the email label area. At 768x1024 and scroll y=813, the guide covers 164x46px of the details textarea and the dock covers its lower 59px. Captures: `/tmp/ag-polish-390x844-contact-640.png`, `/tmp/ag-polish-320x800-contact-912.png`, and `/tmp/ag-polish-768x1024-contact-813.png`.
- Impact: A user can see a field and then have its label, border, or editable area hidden by conversion controls during normal form scrolling. In the 390px case, the dock visually replaces the entire input target.
- Expected behavior: Fixed conversion controls must collapse, relocate, or leave a guaranteed unobscured form workspace whenever a form target intersects their occlusion zones.
- Regression check: For every form label, field, error summary, recovery action, and submit control, assert zero topmost intersection with both fixed controls at 320px, 390px, and 768px through the full form scroll range.
- Fix owner: Frontend implementer for mobile chrome and form layout.
- Independent grader: Mobile form grader using touch and keyboard paths.

### MOBILE-P2-003: Material guide obscures content on every generated route

- Severity: P2
- Routes: All 39 HTML documents
- Component: `.material-guide > summary`
- Viewports: 320x800, 390x844, and 768x1024
- User context: Mobile reading and navigation
- Status: OPEN
- Evidence: The guide was topmost over visible content on all 39 routes at every tested width. It intersected content at 1,457 of 1,928 sampled 320px stops, 1,436 of 1,864 sampled 390px stops, and 672 of 1,504 sampled 768px stops. At 390px the icon-only guide occupies x=10.39 to 55.91 while normal content begins at x=18.39. The overlap therefore covers the start of text lines. This is visible without scrolling on the homepage, where the guide covers the hero lead, and on the privacy page, where it covers the `What not to send` link. It also covers the first words of the family-story paragraph on `/about` at scroll y=320. Captures: `/tmp/ag-polish-home-top-390.png`, `/tmp/ag-polish-privacy-top-390.png`, and `/tmp/ag-polish-about-copy-390.png`.
- Impact: The guide hides words, link labels, and controls. On narrow screens it occupies the same left gutter used by all reading content.
- Expected behavior: The guide trigger must live in reserved layout space, join the mobile action dock, or hide when its fixed rectangle would cover document content. Its 44px target size must be preserved.
- Regression check: Across the full route corpus, assert zero topmost intersection between the guide trigger and visible text or interactive targets. Include the homepage and privacy page at initial 390x844 load.
- Fix owner: Frontend implementer for shared mobile chrome.
- Independent grader: Responsive visual grader using range-level collision checks and screenshots.

### MOBILE-P2-004: Mobile action dock covers ordinary main content

- Severity: P2
- Routes: All 39 documents at 320px and 390px; 38 of 39 at 768px
- Component: `.mobile-actions`
- Viewports: 320x800, 390x844, and 768x1024
- User context: Mobile reading after the first 320px of scroll
- Status: OPEN
- Evidence: The visible dock was topmost over text or targets at 1,601 of 1,928 sampled 320px stops, 1,527 of 1,864 sampled 390px stops, and 1,149 of 1,504 sampled 768px stops. Footer protection works because the dock hides near the document end, but it still covers main content while visible.
- Impact: Paragraphs, links, and controls pass underneath a 59px fixed surface. The content can be recovered by further scrolling, but it is obscured at ordinary reading positions and directly causes the form failure above.
- Expected behavior: The conversion dock needs a non-occluding responsive pattern or a reliable collision-aware visibility rule for reading and interactive regions.
- Regression check: At the same route and landmark matrix, assert zero topmost intersection with main text and interactive targets whenever the dock is visible.
- Fix owner: Frontend implementer for shared mobile chrome.
- Independent grader: Responsive interaction grader.

## Verified positives

- Horizontal overflow was 0px in all 117 render cases.
- All 117 documents retained one `h1`, one shared header, one footer, one material guide, one mobile action dock, and `data-design="silver-atelier"`.
- Palette and body typography were identical across the route corpus.
- No page or console errors occurred during the crawl.
- The open guide panel stayed fully inside the viewport in all 117 cases.
- The open guide panel had zero geometric overlap with the action dock, and all panel links remained topmost and reachable.
- Sticky desktop rails correctly became static in the mobile layouts.
- The footer reservation and dock end-of-page hiding prevented the dock from permanently covering legal copy.

## Release condition

Do not release this mobile chrome unchanged. Close both P1 findings, remove the systemic guide and dock content occlusion, then repeat the 39-route matrix with a fresh grader. A passing rerun requires zero invisible Tab stops, zero form-target intersections, zero fixed-control text intersections, zero horizontal overflow, and no regression to the open guide panel or footer behavior.
