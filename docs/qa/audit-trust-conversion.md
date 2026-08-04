# Trust and conversion audit - AG Refining

Audit date: 2026-08-04
Scope: existing production build only - 38 sitemap routes plus `dist/404.html` (39 documents). No production source or generated output was changed.

## Method and evidence standard

This audit applies the buyer-decision contexts in `docs/superpowers/specs/2026-08-04-adversarial-persona-qa-loop.md`, the Silver Atelier page contract, and the Apohenia quality rubric. It tested first-screen offer/audience/action comprehension, CTA continuity, material and local relevance, process/pricing/terms boundaries, privacy expectations, form burden and recovery, Spanish continuity, 404 recovery, and anti-template claim discipline.

Severity uses the QA-loop definitions: **Critical** means unusable, inaccessible, deceptive, or lead-losing primary journey; **High** means a major persona cannot complete or understand the journey; **Medium** is reproducible confusion, friction, or material inconsistency; **Low** is non-material polish. “Code-proven” means demonstrated in the generated HTML or source behavior. “Inference” means a buyer consequence or an absence of on-page substantiation; it does not assert an unverified business fact is false.

## Findings

### TRUST-001 - Spanish-first visitor is sent into an English conversion journey

- **Scope:** `/espanol`; shared header, mobile dock, footer, material guide, and `/contact` form.
- **Persona/context:** Spanish-first visitor on mobile or desktop; five-second action comprehension and completion.
- **Severity:** High.
- **Evidence type:** Code-proven.
- **Reproduction:**
  1. Open `/espanol`.
  2. Read the Spanish hero and select the Spanish conversion-band action.
  3. It opens `/contact?intent=pickup`; the contact heading, form labels, validation, submit status, phone fallback text, and shared navigation are English.
  4. On `/espanol` itself, open the navigation or scroll to the mobile dock/footer/material guide; those action labels are also English.
- **Observed evidence:** Spanish action is **“Enviar solicitud”**; shared action is **“Schedule a Free Pickup”**; the destination asks **“Tell us what silver you have.”**
- **Expected behavior:** A page declared `lang="es"` should preserve Spanish through the selected primary action and its form/status/recovery copy, or clearly offer a Spanish phone-first fallback at the action. Shared chrome on that surface should not reverse the selected language.
- **Buyer consequence:** A Spanish-first prospect can understand the offer but not the route’s primary completion flow without switching languages, which is a major journey-comprehension failure.
- **Likely affected source:** `scripts/build.mjs` `nav`, `mobileActions`, `footer`, `materialGuide`, `spanish`, and `reviewForm()`; `src/site.js` form status/error strings.

### TRUST-002 - Exact payment-timing promise exceeds the documented claim boundary

- **Scope:** `/`, `/espanol`, `/houston-silver-buyer`, and `/scrap-silver-buyer-houston`; homepage trust ledger, hero/meta copy, and the shared SEO/source registries.
- **Persona/context:** Skeptical evidence-seeker, price-sensitive seller, and risk-averse seller evaluating a time-sensitive transaction.
- **Severity:** High.
- **Evidence type:** Code-proven policy conflict.
- **Reproduction:**
  1. Open `/` and read the hero/trust ledger before scrolling.
  2. Inspect the equivalent Houston/scrap route metadata and FAQs.
  3. Compare these promises to the redesign’s protected claim boundary, which says not to invent or strengthen **exact payment timing**.
- **Observed evidence:** **“immediate payment on most qualifying transactions”** and **“Immediate payment”**; related route metadata says **“immediate payment”**.
- **Expected behavior:** State only the verified conditional process/timing boundary (for example, that timing is confirmed with the approved offer) unless the business has approved evidence for the exact timing claim. Do not convert a conditional possibility into a hero trust fact.
- **Buyer consequence:** Payment timing is a material decision input; an exact, prominent promise can create an expectation the form itself later qualifies as dependent on material, location, account type, and schedule.
- **Likely affected source:** `scripts/build.mjs` lines 341, 682, 889-895, 911, 1106, and 1878; exact-SEO checks in `scripts/verify.mjs` preserve some of this language.

### TRUST-003 - Contact form has no human-readable no-JavaScript success or recovery path

- **Scope:** `/contact`, reached by the shared primary CTA from all 39 documents.
- **Persona/context:** Urgent mobile visitor, low-connectivity visitor, or visitor with JavaScript unavailable/blocked; form delivery-failure recovery.
- **Severity:** Medium.
- **Evidence type:** Code-proven behavior; user-visible raw-response consequence is an inference from standard browser form navigation.
- **Reproduction:**
  1. Disable JavaScript or block `/site.js`.
  2. Open `/contact`, fill the required HTML fields with valid values, and submit.
  3. The `novalidate` form performs a native POST to `/api/leads`; the API responds with JSON (`{ ok: true }` or JSON error/fallback data), rather than a confirmation or recovery document.
  4. No client code is present to render `[data-form-status]`, field errors, or the “Email these details” fallback.
- **Observed evidence:** Form has **`novalidate`** and `action="/api/leads"`; API returns **`res.status(200).json({ ok: true })`** and JSON error messages.
- **Expected behavior:** The native submission path should return/redirect to a human-readable confirmation and an actionable failure fallback, while JavaScript can progressively enhance that same experience.
- **Buyer consequence:** The request may reach the endpoint, but the visitor cannot reliably tell whether it was received or how to recover, creating avoidable contact abandonment in a required resilience context.
- **Likely affected source:** `scripts/build.mjs` `reviewForm()` (lines 1830–1851), `src/site.js` submit/recovery rendering, and `api/leads.js` response handling (lines 126–187).

### TRUST-004 - “Confidential” claim is stronger than the disclosed handling path

- **Scope:** `/jewelry-store-silver-recycling-houston`; `/contact` and `/privacy` provide the applicable form/disclosure context.
- **Persona/context:** Prestige-sensitive commercial buyer and privacy-conscious operator deciding whether to disclose inventory/volume.
- **Severity:** Medium.
- **Evidence type:** Code-proven delivery path; claim conflict is an inference requiring business/legal confirmation.
- **Reproduction:**
  1. Open `/jewelry-store-silver-recycling-houston` and read the “Why AG Refining” section.
  2. Follow the CTA to `/contact`, submit a request, and trace the lead handler.
  3. The handler sends the request (including volume/details and website attribution) to `https://api.resend.com/emails`; the privacy page does not identify this delivery processor or qualify the absolute wording.
- **Observed evidence:** **“Your inventory and volumes stay between us.”**; `fetch("https://api.resend.com/emails", …)`.
- **Expected behavior:** Either substantiate and define the confidentiality commitment (including service-provider handling), or use narrower, approved wording that matches the privacy notice. Do not imply an absolute boundary the implementation does not literally maintain.
- **Buyer consequence:** The statement can materially influence a commercial seller’s willingness to share stock levels or recurring volumes.
- **Likely affected source:** `scripts/build.mjs` lines 596–600 and 1891–1905; `api/leads.js` lines 84–119.

### TRUST-005 - Value and fee superlatives are not supported by on-page evidence or a defined pricing boundary

- **Scope:** `/sell-silver-coins-houston`, `/silver-flake-buyer-houston`, `/silver-solder-buyer-houston`, `/scrap-silver-buyer-houston`, `/silver-flatware-buyer-houston`, and `/jewelry-store-silver-recycling-houston` (with metadata versions surfaced in search previews).
- **Persona/context:** Skeptical evidence-seeker, price-sensitive seller, novice household/estate seller, and expert procurement buyer comparing offers.
- **Severity:** Medium.
- **Evidence type:** Code-proven presence; lack of substantiation is an inference, not a conclusion that the claims are false.
- **Reproduction:**
  1. Open each listed route (or inspect its title/description) and locate the value/fee claim.
  2. Read the price/process sections and FAQs.
  3. They describe market-based evaluation but provide no fee disclosure, calculation example, evidence, or definition that substantiates the stronger outcome language.
- **Observed evidence:** **“top prices”**, **“competitive prices”**, **“No hidden fees”**, and **“recover the full value.”**
- **Expected behavior:** Preserve the supported process claims (confirmed material, weight, condition, recoverable silver, and current market values), and obtain evidence/approval before publishing outcome or fee assertions. Do not invent a price, fee, or valuation method as a remedy.
- **Buyer consequence:** These are price-comparison claims that can set an expectation before qualification; the later conditional language does not explain what “top,” “competitive,” “full,” or “no hidden” means.
- **Likely affected source:** `scripts/build.mjs` material-page registry around lines 71, 96, 186, 341, 477, 522, 550–553, 569–600; SEO expectations in `scripts/verify.mjs` for preserved descriptions.

### TRUST-006 - Attribution disclosure understates what is sent with a lead

- **Scope:** `/contact` and `/privacy`; applies to every CTA path that ends in the review form.
- **Persona/context:** Privacy-conscious medical/industrial operator and risk-averse seller deciding what accompanies a request.
- **Severity:** Medium.
- **Evidence type:** Code-proven.
- **Reproduction:**
  1. Load any page with a query string/referrer, then open `/contact` and submit the form.
  2. `readAttribution()` records `landing_page` as the full URL, `referrer`, supported campaign IDs, and `submission_page`.
  3. The payload is added to the email content as “Website attribution.”
  4. Compare this to the privacy notice’s general statement that **“Basic website attribution may also be stored.”**
- **Observed evidence:** **“landing_page: window.location.href”**; **“referrer: document.referrer”**; email heading **“Website attribution.”**
- **Expected behavior:** The privacy notice and near-form notice should accurately describe the attribution fields and that they accompany the lead delivery, or collection should be reduced to the approved disclosure. The notice already correctly tells users not to send sensitive records; this finding concerns the site-generated metadata.
- **Buyer consequence:** Full referring/landing URLs can contain more contextual information than a visitor reasonably reads into “basic attribution,” particularly in sensitive procurement workflows.
- **Likely affected source:** `src/site.js` lines 127–157 and 226–245; `api/leads.js` lines 39–46 and 84–92; `scripts/build.mjs` lines 1849 and 1894–1897.

### TRUST-007 - Hospital-industry route omits its own medical-record routing guardrail before the pickup action

- **Scope:** `/hospital-silver-recycling`; related specialized routes `/medical-x-ray-recycling` and `/x-ray-recycling-services-houston` do contain the needed guardrails.
- **Persona/context:** Privacy-conscious hospital operator or expert facility/procurement user arriving from an industry search result.
- **Severity:** Medium.
- **Evidence type:** Code-proven route-content difference; consequence is an inference.
- **Reproduction:**
  1. Open `/hospital-silver-recycling`.
  2. Read the hero’s material list and use its primary pickup CTA.
  3. The route names **“medical X-ray film”** but presents only the generic industry template and no protected-record/patient-information instruction before action.
  4. Compare `/medical-x-ray-recycling` and `/x-ray-recycling-services-houston`, which explicitly instruct visitors not to upload patient information and to confirm privacy/retention duties.
- **Observed evidence:** Hospital hero includes **“medical X-ray film”**; specialized X-ray route says **“Do not upload patient information.”**
- **Expected behavior:** An industry route that names medical X-ray material should route directly to the documented medical-film path or carry its concise, visible record/privacy boundary before a pickup request.
- **Buyer consequence:** A hospital visitor following the most relevant industry page can miss decision-critical handling expectations until after choosing the general contact path.
- **Likely affected source:** `scripts/build.mjs` industry registry lines 614–642 and `servicePage()` lines 1112–1171; medical/X-ray source records around lines 318–333 and 432–449.

## Coverage - all generated documents

“No distinct finding” means the page was checked under the stated trust/conversion lenses and no additional reproducible issue beyond shared findings was accepted. Shared findings are deduplicated rather than repeated as separate route defects.

| Route | Family | Result |
|---|---|---|
| `/` | Core | TRUST-002, TRUST-005; otherwise clear Houston/business offer, conditional pickup language, phone fallback |
| `/accepted-materials` | Core | No distinct finding |
| `/industries` | Core | No distinct finding |
| `/service-areas` | Core | No distinct finding |
| `/how-it-works` | Core | No distinct finding |
| `/about` | Core | No distinct finding |
| `/contact` | Core | TRUST-001, TRUST-003, TRUST-004, TRUST-006 |
| `/espanol` | Core | TRUST-001, TRUST-002 |
| `/privacy` | Core | TRUST-004, TRUST-006 |
| `/404.html` | Utility | No distinct finding; clear material and pickup recovery routes |
| `/scrap-silver-jewelry` | Material/service | No distinct finding |
| `/industrial-x-ray-silver-recycling` | Material/service | No distinct finding |
| `/sell-silver-coins-houston` | Material/service | TRUST-005; collector-value caution and no-pressure process are strengths |
| `/silver-flake-buyer-houston` | Material/service | TRUST-005; handling guardrail is a strength |
| `/laboratory-silver-buyer-houston` | Material/service | No distinct finding |
| `/silver-solder-buyer-houston` | Material/service | TRUST-005; material/safety qualifications are a strength |
| `/silver-plated-materials-buyer-houston` | Material/service | No distinct finding |
| `/silver-oxide-watch-battery-recycling-houston` | Material/service | No distinct finding |
| `/medical-x-ray-recycling` | Material/service | No distinct finding; explicit protected-information boundary is a strength |
| `/scrap-silver-buyer-houston` | Material/service | TRUST-002, TRUST-005 |
| `/dental-scrap-buyer-houston` | Material/service | No distinct finding; clinical-waste/privacy exclusions are a strength |
| `/x-ray-recycling-services-houston` | Material/service | No distinct finding; records/chain-of-custody qualification is a strength |
| `/industrial-silver-scrap` | Material/service | No distinct finding |
| `/sell-silver-bars-houston` | Material/service | No distinct finding; evaluation-before-moving guardrail is a strength |
| `/silver-flatware-buyer-houston` | Material/service | TRUST-005 |
| `/jewelry-store-silver-recycling-houston` | Material/service | TRUST-004, TRUST-005 |
| `/hospital-silver-recycling` | Industry | TRUST-007 |
| `/dental-lab-silver-recycling` | Industry | No distinct finding |
| `/oil-gas-silver-recovery` | Industry | No distinct finding |
| `/manufacturing-silver-recovery` | Industry | No distinct finding |
| `/university-silver-recycling` | Industry | No distinct finding |
| `/electronics-silver-recovery` | Industry | No distinct finding |
| `/houston-silver-buyer` | Location/hub | TRUST-002 |
| `/silver-buyer-pearland` | Location | No distinct finding |
| `/silver-buyer-pasadena` | Location | No distinct finding |
| `/silver-buyer-sugar-land` | Location | No distinct finding |
| `/silver-buyer-katy` | Location | No distinct finding |
| `/silver-buyer-the-woodlands` | Location | No distinct finding |
| `/silver-buyer-conroe` | Location | No distinct finding |

## Strengths worth preserving

- The English primary CTA text is genuinely consistent across the shared shell, hero, mobile dock, and conversion bands; it generally carries a phone fallback on high-intent long-form pages.
- The homepage answers offer, location, commercial audience, qualifying condition, and next action in its first composition. The hero intake fields set a low-friction “not sure” path.
- Material-specific pages frequently put useful constraints before action: unknown-powder, solder, battery, dental, and X-ray guardrails avoid invented compliance promises and tell visitors what not to send or move.
- The X-ray hub explicitly separates medical/dental from industrial/NDT routing and makes record-retention, documentation, and non-HIPAA-guarantee boundaries visible.
- The form clearly identifies required fields, offers phone/email preference, gives a non-final-promise qualifier beside submit, and has thoughtful JavaScript validation, success, delivery fallback, and live-status behavior.
- The 404 is concise and gives both material discovery and the shared pickup route; it does not strand a returning visitor.
- Real Houston address/phone/email, actual material photography, process language, and the family provenance surface provide more grounded local proof than generic testimonials or fabricated metrics.

## Checks and inspection commands used

- `find dist -type f -name '*.html' | sort` - confirmed 39 generated HTML documents.
- Inspected `dist/sitemap.xml` - confirmed 38 indexed routes.
- Read all generated documents through a route-level extraction of each route’s `h1`, first hero text, CTA targets, form presence, and phone fallback counts; then directly inspected Spanish and contact output.
- Read relevant generator, shared shell, form, client interaction, API, check, and verification sources: `scripts/build.mjs`, `src/site.js`, `api/leads.js`, `scripts/check.mjs`, and `scripts/verify.mjs`.
- Per parent-agent concurrency direction, did **not** run `npm run build` or mutate `dist/`; baseline `npm run verify` was reported passing immediately before this audit dispatch.

## Release recommendation

**Do not release this audit lane as clean.** There are 2 High and 5 Medium findings, including an incomplete Spanish primary journey and an exact payment-timing claim that conflicts with the approved claim boundary. Resolve/regrade the High findings first. The no-JavaScript form recovery, privacy disclosures/claim wording, medical-industry routing guardrail, and price/fee claim substantiation should then be corrected and independently graded before relying on the release gate.
