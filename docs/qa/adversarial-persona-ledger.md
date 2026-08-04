# AG Refining Adversarial Persona QA Ledger

## Baseline

- Audit date: 2026-08-04
- Local branch: `redesign/silver-atelier-all-pages`
- Baseline local commit: `83595ff`
- Baseline tree matches production Silver Atelier tree: `fda8977da3e27659073beb6f2a9a504292b3c722`
- Production preview: `https://agrefining.vercel.app/`
- Generated scope: 39 HTML documents, 38 indexed routes plus 404

## Release gate

- [x] Zero Critical findings.
- [x] Zero High findings.
- [x] Zero reproducible Medium findings on homepage, contact, call, or pickup paths.
- [x] `npm run verify` passes with 39 HTML files and 38 indexed routes.
- [x] No broken route or local asset references.
- [x] No horizontal overflow at 320px, 390px, 768px, 1024px, or 1440px.
- [x] Keyboard navigation, focus visibility, form recovery, reduced-motion fallback, and 3D lifecycle verification pass.
- [x] Fresh grader approval is recorded for every repaired blocking finding.
- [ ] Production smoke and browser verification pass.
- [x] The external `agrefining.com` DNS/domain connection remains separated from frontend quality and the working Vercel production alias.

## Findings

| ID | Lane | Route/scope | Persona/context | Viewport | Severity | Reproduction/evidence | Expected | Regression | Fix owner | Grader | Round | Status |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---|
| AGQA-FORM-001 | Accessibility / resilience / trust | `/contact`, `/espanol`, `/api/leads` | Keyboard user, JS-disabled browser, validation or delivery failure | All | High | Submit either lead form with JavaScript disabled; the browser navigates to raw JSON and offers no accessible correction or recovery path. | Server-rendered HTML validation and success/failure recovery preserve entered context and a clear path back. | Native and enhanced contracts, 422/502/503 recovery, private 303 receipt, no-JS browser flow, and mutations pass. | `/root/fix_form_nav_i18n` | `/root/grade_form_nav_i18n_r1` | 1 | CLOSED |
| AGQA-NAV-001 | Accessibility / resilience | Shared mobile navigation on all 39 documents | Keyboard user, screen-reader user, script failure | <=900px | High | With the menu visually closed, off-canvas links remain in the tab order; with JavaScript disabled there is no usable mobile navigation fallback. | Closed navigation is removed from sequential focus; core navigation remains available without JavaScript. | Generated fallback, inert/tab-order, focus containment, Escape/scrim return, resize cleanup, and no-JS browser checks pass. | `/root/fix_form_nav_i18n` | `/root/grade_form_nav_i18n_r1` | 1 | CLOSED |
| AGQA-I18N-001 | Trust / accessibility | `/espanol` through contact submission and recovery | Spanish-first seller under time pressure | All | High | The page declares `lang=es`, but shared navigation, footer, form labels, statuses, and recovery paths return to English. | A coherent Spanish shell, lead form, status messaging, and recovery path remain Spanish end to end. | Spanish shell/form/status/recovery, English-destination disclosure, API paths, browser journey, and mutations pass. | `/root/fix_form_nav_i18n` | `/root/grade_form_nav_i18n_r1` | 1 | CLOSED |
| AGQA-CLAIM-001 | Trust / conversion | Shared home, seller, process, payment, and Spanish content | Skeptical seller comparing payment terms | All | High | Generated copy made exact `immediate payment` and `same-day payment` promises despite the site's protected claim boundary requiring conditional timing. | Payment timing is accurate, qualified, and consistent across metadata, body copy, and trust components. | Generated phrase scan plus isolated mutation test; both pass and catch reintroduction. | `/root/fix_trust_content` | `/root/grade_trust_content_r1` | 1 | CLOSED |
| AGQA-PRIV-001 | Trust / conversion | Shared confidentiality copy | Privacy-sensitive commercial seller | All | Medium | Copy said inventory and volumes “stay between us,” an absolute promise broader than operational delivery or required disclosure. | Confidentiality language is strong but qualified and supportable. | Jewelry-route qualified-copy assertion plus mutation test; pass. | `/root/fix_trust_content` | `/root/grade_trust_content_r1` | 1 | CLOSED |
| AGQA-CLAIM-002 | Trust / conversion | Pricing, process, silver, and seller routes | Price-sensitive seller comparing bids | All | Medium | Copy included unsubstantiated absolutes/superlatives: `top prices`, `No hidden fees`, and `recover full value`. | Value language explains transparent evaluation and settlement without unsupported guarantees. | Full generated superlative scan plus isolated mutation test; pass. | `/root/fix_trust_content` | `/root/grade_trust_content_r1` | 1 | CLOSED |
| AGQA-PRIV-002 | Trust / legal clarity | Contact privacy disclosure and lead payload | Privacy-sensitive form submitter | All | Medium | Disclosure said `Basic website attribution`, while the submitted payload includes landing, referrer, campaign, and submission URLs. | Plain-language disclosure names the attribution fields actually sent. | Disclosure-to-payload term assertions plus isolated mutation test; pass. | `/root/fix_trust_content` | `/root/grade_trust_content_r1` | 1 | CLOSED |
| AGQA-MED-001 | Trust / safety | Hospital seller page and contact path | Healthcare employee handling imaging material | All | Medium | The hospital page promoted medical X-ray film without a protected-record removal/authorization guardrail before its CTA. | Healthcare-specific copy requires record removal and authorized material handling before shipment or pickup. | Guardrail ordering, guidance link, prefilled material, and mutation assertions; pass. | `/root/fix_trust_content` | `/root/grade_trust_content_r1` | 1 | CLOSED |
| AGQA-TOUCH-001 | Accessibility | Preferred-contact radio controls | Touch user with limited dexterity | <=900px | Low | Radio-label targets render below the 44px coarse-pointer target used elsewhere. | Each option exposes at least a 44px interactive target on coarse pointers. | Rendered targets pass at 44px; round-two block-scoped test catches independent 40px height and width mutations. | `/root/fix_touch_test_integrity` | `/root/grade_form_nav_i18n_fast` | 2 | CLOSED |
| AGQA-3D-001 | Brand / performance / resilience | Homepage assay hero | Luxury-focused buyer on desktop, constrained-device visitor | All | High | The first WebGL render replaced a convincing fallback with a gray-blue, periodically banded surface, shallow bowl, tab-like wrap, weak shadow, and undersized framing. | The enhancement must remain identity-specific, neutral satin silver, bounded, optional, and at least as coherent as the static first paint. | Round-two visual thresholds all pass, 14/14 browser cases pass, and all six isolated mutations are caught. Hardware-GPU timing and field vitals remain explicit preview/telemetry limits. | `/root/fix_3d_visual_round2` | `/root/grade_3d_assay_hero_r2` | 2 | CLOSED |
| MOBILE-P1-001 | Accessibility | Hidden shared mobile action dock | Keyboard user on short routes | <=900px | High | The opacity-hidden dock exposed two invisible sequential focus stops on the 404 page. | Non-rendered mobile chrome exposes no sequential or programmatic focus target. | Three complete 404 Tab cycles and 819 direct descendant focus attempts expose zero hidden-surface focus. | `/root/fix_mobile_release_polish` | `/root/grade_mobile_release_polish_r1` | 1 | CLOSED |
| MOBILE-P1-002 | Accessibility / conversion | Contact and Spanish forms | Touch or keyboard lead-form user | <=900px | High | Fixed guide and dock surfaces obscured labels, inputs, and textarea regions during ordinary form scrolling. | Every form landmark remains fully visible and operable without fixed-surface intersection. | Six full form traversals cover 210 landmarks with zero intersections. | `/root/fix_mobile_release_polish` | `/root/grade_mobile_release_polish_r1` | 1 | CLOSED |
| MOBILE-P2-003 | Responsive polish | Shared material guide | Mobile reader on all routes | <=900px | Medium | The fixed guide obscured content on every generated route and competed with the shared reading gutter. | The redundant mobile guide is removed while the desktop guide remains available. | 117/117 mobile renders show zero guide area/focus/collision; 901px and 1440px desktop guide behavior passes. | `/root/fix_mobile_release_polish` | `/root/grade_mobile_release_polish_r1` | 1 | CLOSED |
| MOBILE-P2-004 | Responsive polish / conversion | Shared action dock | Mobile reader on all routes | <=900px | Medium | The fixed dock covered ordinary main content and directly caused form occlusion. | Mobile conversion stays in flow and in the menu without covering page content. | 117/117 renders retain in-flow conversion/contact paths and a visible menu CTA with zero dock area or collision. | `/root/fix_mobile_release_polish` | `/root/grade_mobile_release_polish_r1` | 1 | CLOSED |

## Observations and rejected candidates

| Candidate | Decision | Evidence |
|---|---|---|

## Iteration log

| Round | Audit/fix/grade event | Evidence |
|---:|---|---|
| 0 | Baseline manifest created and three independent audit lanes completed. | `audit-accessibility.md`, `audit-trust-conversion.md`, and `audit-responsive-resilience.md`. |
| 1 | Thirteen raw candidates normalized into nine reproducible defects; duplicate evidence merged without reducing severity. | Four High, four Medium, one Low entered above. |
| 1 | Trust/content implementer closed five findings test-first; a fresh grader independently rebuilt, scanned all 39 documents, and mutation-tested each regression. | `fix-trust-content.md`; `grade-trust-content-round1.md`; five findings CLOSED. |
| 1 | Form/navigation/Spanish implementer repaired four findings test-first; fresh browser grading passed all current UI behavior but rejected the coarse-touch test because it missed a 40px mutation. | `fix-form-nav-i18n.md`; `grade-form-nav-i18n-round1.md`; three findings CLOSED, touch held open. |
| 2 | A new implementer strengthened only the touch regression; a different grader proved both 40px mutations now fail and closed the final finding. | `fix-touch-test-integrity-round2.md`; `grade-form-nav-i18n-round2.md`; `AGQA-TOUCH-001` CLOSED. |
| 1 | The first 3D integration passed fallback and lifecycle engineering but failed the unchanged luxury material, form, lighting, and mutation thresholds. | `fix-3d-assay-hero.md`; `grade-3d-assay-hero-round1.md`; correction held. |
| 2 | A fresh 3D implementer removed periodic material response, strengthened the bowl and wrap, repaired framing and mutation guards, and a different grader passed every visual and runtime threshold. | `fix-3d-assay-hero-round2.md`; `grade-3d-assay-hero-round2.md`; `AGQA-3D-001` CLOSED. |
| 1 | A final 117-case mobile audit found four fixed-chrome focus and collision defects. A fresh implementer removed redundant mobile fixed chrome test-first; a different grader passed all routes, form landmarks, keyboard cycles, desktop guide checks, and mutations. | `audit-release-polish-mobile.md`; `fix-mobile-release-polish.md`; `grade-mobile-release-polish-round1.md`; all four MOBILE findings CLOSED. |
