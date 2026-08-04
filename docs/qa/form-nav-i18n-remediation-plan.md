# Form, Navigation, Spanish Journey, and Touch Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan test-first. Every production change below requires a regression that is observed failing against the current build before implementation.

**Goal:** Close `AGQA-FORM-001`, `AGQA-NAV-001`, `AGQA-I18N-001`, and `AGQA-TOUCH-001` without weakening the existing JavaScript lead path, route inventory, or Silver Atelier visual system.

**Architecture:** Treat JavaScript as progressive enhancement. Static pages expose a usable navigation and native-validating form before `site.js` runs; after successful initialization, `site.js` upgrades the navigation to the existing off-canvas interaction and the form to the existing accessible in-page submission flow. The Vercel Function content-negotiates JSON for enhanced `fetch` submissions and complete HTML for native URL-encoded posts, while a shared server/build form renderer prevents the English, Spanish, retry, and static forms from drifting.

**Tech stack:** Node.js ESM, Node's built-in test runner, generated static HTML/CSS/JavaScript, a Vercel Node Function at `/api/leads`, and final rendered-browser verification.

## Global constraints

- Preserve all 38 indexed URLs, `dist/404.html`, the existing redirects, and the `/api/leads` endpoint.
- Do not create a second Spanish URL or a new indexed success URL. Keep the Spanish journey on `/espanol` and use `/api/leads?status=received&lang=es` only as a non-indexed POST/Redirect/GET receipt.
- Keep JSON response shapes compatible with the current `src/site.js`: `{ ok: true }`, `{ message, fields }`, and `{ message, fallback_email }`.
- Never make a valid production lead during tests. Stub the Resend `fetch` boundary for success and force `RESEND_API_KEY` absent for delivery-recovery tests.
- Never reflect user input into HTML without HTML-attribute/text escaping. Never place lead values in a redirect URL.
- Keep native validation in the source markup. Add `noValidate` only after the enhanced submit handler is successfully attached.
- Keep the no-script navigation visible in normal document flow. Hide/inert it only after navigation enhancement is fully initialized.
- Preserve focus return, Escape dismissal, focus containment, body scroll lock, background inerting, mobile dock clearance, and desktop navigation behavior.
- Translate every user-facing shell, form, status, and recovery string on `/espanol`. If a Spanish-labelled link intentionally opens an English-only page, show `en ingles` visibly and add `hreflang="en"`; do not silently switch languages.
- Keep all copy in plain language and retain the existing qualification that a submission is not a final quote or pickup promise.
- Do not edit generated `dist/` files by hand. Regenerate them with `npm run build`.
- Because `scripts/build.mjs`, `src/site.js`, and `src/style.css` are also expected to receive other redesign work, this remediation must run as one sequential ownership batch after any active trust-copy or 3D batch has finished.

---

## 1. Verified baseline and root causes

### `AGQA-FORM-001`

`scripts/build.mjs` emits `<form ... method="post" novalidate>`. Without `site.js`, required-field validation is suppressed and the browser navigates to `/api/leads`. `api/leads.js` returns JSON for 422, 200, 502, and 503. The only linked error summary, live status, and prefilled email recovery are client-side functions in `src/site.js`.

### `AGQA-NAV-001`

Below 901px, CSS moves `.nav-links` off-canvas with `transform` but leaves its anchors rendered and focusable. The toggle has no native behavior, so if `site.js` is unavailable the button does nothing and the links remain off-screen. The current JavaScript manages focus only after opening; it does not make the closed link collection inert.

### `AGQA-I18N-001`

`document({ lang: "es" })` changes only the root language. The shared skip link, header, mobile actions, footer, material guide, and all form/status/recovery strings remain English. The Spanish CTA then sends the user to the English `/contact` route.

### `AGQA-TOUCH-001`

The radio itself is 16px and `.preferred-contact label` has neither a 44px minimum height nor touch padding. The existing coarse-pointer rule covers other controls but omits these labels.

---

## 2. File map and ownership boundary

### Files a single later implementer owns

- Create `tests/leads-response.test.mjs`: black-box Vercel Function contract tests.
- Create `tests/generated-interaction-contract.test.mjs`: generated HTML/CSS invariants for native form, enhancement bootstrap, Spanish continuity, and coarse-pointer CSS.
- Create `src/review-form.mjs`: shared locale dictionary, safe form rendering, and escaping helpers used by the static build and Function HTML recovery.
- Modify `package.json`: include both Node test files in `npm run verify` after `npm run build` and before the existing checks.
- Modify `scripts/build.mjs`: render locale-aware shared chrome; use the shared form renderer; embed the Spanish form on `/espanol`.
- Modify `src/site.js`: initialize nav progressively; synchronize inert/focus state; localize form validation, loading, success, and fallback UI.
- Modify `src/style.css`: default no-script mobile navigation layout, enhanced off-canvas states, HTML response layout, language notes, and 44px radio targets.
- Modify `api/leads.js`: parse URL-encoded and JSON bodies; negotiate JSON versus HTML; localize responses; render retry/recovery pages; use a safe success redirect.

### Files outside the implementer's ownership

- Do not change `docs/qa/adversarial-persona-ledger.md`; the controller records red/green evidence and assigns the independent grader.
- Do not change `.img2threejs`, generated 3D artifacts, or the homepage 3D component.
- Do not edit trust-copy findings unless the controller explicitly rebases this task after that batch.
- Do not manually modify `dist/`; it is a build artifact.

### Required sequencing

1. Wait until any agent editing `scripts/build.mjs`, `scripts/verify.mjs`, `src/site.js`, or `src/style.css` has finished.
2. Re-read the merged versions of those files before writing tests.
3. Add all focused regressions and capture red output.
4. Implement this plan as one shared-source batch.
5. Run focused tests, then the full release command.
6. Hand the original reproductions and changed files to a fresh grader.

---

## 3. Regression checks to add before production code

### 3.1 Wire the tests into the release command

After the test files exist, change the package script to this order:

```json
{
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "verify": "npm run build && npm test && npm run check && node scripts/verify.mjs"
  }
}
```

The generated-contract test intentionally runs after the build. `npm test` on its own therefore assumes `dist/` exists; the authoritative release entry point remains `npm run verify`.

### 3.2 Generated interaction contract

Create `tests/generated-interaction-contract.test.mjs` using `node:test`, `node:assert/strict`, and `node:fs`. It must read `dist/contact/index.html`, `dist/espanol/index.html`, all 39 generated HTML documents, and `dist/style.css`.

Add these exact behavioral contracts:

```js
test("static forms keep native validation before enhancement", () => {
  const contactForm = contact.match(/<form[^>]*data-review-form[^>]*>/)?.[0] || "";
  assert.match(contactForm, /action="\/api\/leads"/);
  assert.match(contactForm, /method="post"/);
  assert.doesNotMatch(contactForm, /\bnovalidate\b/i);
  assert.match(contactForm, /name="locale" value="en"/);
});

test("all static headers expose navigation when site.js is unavailable", () => {
  for (const [name, html] of htmlDocuments) {
    const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "";
    const menu = header.match(/<div class="nav-links"[^>]*>/)?.[0] || "";
    assert.match(header, /data-nav-toggle[^>]*\bhidden\b/, `${name}: enhancement toggle must start hidden`);
    assert.match(header, /data-nav-scrim[^>]*\bhidden\b/, `${name}: enhancement scrim must start hidden`);
    assert.doesNotMatch(menu, /\b(?:hidden|inert|aria-hidden)\b/, `${name}: fallback links must start exposed`);
  }
});

test("Spanish stays Spanish through the lead form", () => {
  assert.match(spanish, /<html lang="es">/);
  assert.match(spanish, />Saltar al contenido<\/a>/);
  assert.match(spanish, /id="solicitud"/);
  assert.match(spanish, /<form[^>]*data-review-form[^>]*>/);
  assert.match(spanish, /name="locale" value="es"/);
  assert.match(spanish, />Enviar solicitud/);
  assert.doesNotMatch(spanish, /href="\/contact\?intent=pickup"/);
});

test("Spanish shared chrome does not masquerade English labels as Spanish", () => {
  const chrome = [
    spanish.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "",
    spanish.match(/<nav class="mobile-actions"[\s\S]*?<\/nav>/)?.[0] || "",
    spanish.match(/<footer class="footer"[\s\S]*?<\/footer>/)?.[0] || "",
    spanish.match(/<details class="material-guide"[\s\S]*?<\/details>/)?.[0] || ""
  ].join("\n");
  for (const englishLabel of ["Materials", "Industries", "Service areas", "How it works", "Our story", "Schedule a Free Pickup", "Quick actions", "Identify your material", "Request a review"]) {
    assert.doesNotMatch(chrome, new RegExp(`>${englishLabel.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}<`), `unexpected English control: ${englishLabel}`);
  }
  assert.match(chrome, /hreflang="en"/);
  assert.match(chrome, /en ingles/);
});

test("coarse pointers receive full radio-label targets", () => {
  assert.match(
    css,
    /@media\s*\(pointer:\s*coarse\)[\s\S]*?\.preferred-contact label\s*\{[\s\S]*?min-height:\s*44px[\s\S]*?\}/
  );
});
```

Use a robust file walker rather than hard-coding the 39 paths. The first red run must be:

```bash
npm run build
node --test tests/generated-interaction-contract.test.mjs
```

Expected failures against the current code:

- the English form contains `novalidate` and no `locale` field;
- the nav toggle and scrim do not start `hidden`;
- `/espanol` contains no review form and links to `/contact`;
- English labels are present in the Spanish shared chrome;
- the coarse-pointer stylesheet has no preferred-contact rule.

Do not weaken an assertion merely to make the current build pass.

### 3.3 Vercel Function response contract

Create `tests/leads-response.test.mjs`. Invoke the real default export from `api/leads.js` with a small request/response harness. The harness must support `setHeader`, `status`, `json`, `send`, and `end`, record headers/status/body, and await the async handler. Do not mock validation or response rendering.

Use this literal valid fixture:

```js
const validLead = {
  name: "Maria Gomez",
  business: "Gulf Medical Imaging",
  phone: "281-555-0144",
  email: "maria@example.com",
  intent: "pickup",
  material: "xray_film",
  quantity: "12 archive boxes",
  location: "Houston, TX",
  frequency: "one_time",
  preferred_contact: "email",
  details: "De-identified film cleared for an authorized material review.",
  company_url: "",
  form_started: "0",
  submission_key: "test-native-001",
  locale: "en"
};
```

Add these tests in this order:

1. **URL-encoded invalid native submission returns safe HTML.** Send `Accept: text/html` and `Content-Type: application/x-www-form-urlencoded` with an invalid body and a name value containing `<script>`. Assert status 422, `Content-Type: text/html; charset=utf-8`, `<html lang="en">`, `data-lead-result="validation"`, linked field errors such as `href="#email"`, a rendered retry form, preserved safe values, and no literal `<script>`.
2. **Native delivery-unavailable response preserves recovery.** Delete `RESEND_API_KEY`, send the valid URL-encoded fixture, and assert status 503, HTML, `data-lead-result="delivery-failure"`, a `tel:+12818982719` link, a `mailto:dennis@agrefining.com` link with a percent-encoded subject/body containing the submitted material and location, and no outbound `fetch` call.
3. **Native success uses POST/Redirect/GET.** Set a synthetic `RESEND_API_KEY`, stub only global `fetch` to return `{ ok: true }`, and submit the valid URL-encoded fixture. Assert one delivery call, status 303, no lead values in `Location`, and `Location: /api/leads?status=received&lang=en`. Invoke a GET for that location and assert status 200, HTML, `data-lead-result="success"`, a noindex meta tag, receipt copy, and links back to `/contact` plus the phone number.
4. **Spanish native validation and failure remain Spanish.** Repeat invalid and forced-503 posts with `locale: "es"`. Assert `<html lang="es">`, `Revise los campos indicados`, Spanish field messages, `Enviar estos datos por correo`, and a return link to `/espanol#solicitud`. Assert the body does not contain the English headings used by the English response.
5. **Enhanced JSON remains backward-compatible.** Post a JavaScript-style object with `Accept: application/json` and `Content-Type: application/json`. Invalid input must remain 422 JSON with `{ message, fields }`; configured success must remain 200 JSON `{ ok: true }`; forced delivery failure must remain 502/503 JSON with `fallback_email`.
6. **Content negotiation has safe defaults.** A URL-encoded request with `Accept: */*` must receive HTML. A JSON-content-type request with no Accept header must receive JSON. A normal GET without `status=received` must return a human-readable HTML link to the correct form when the request accepts HTML, and the existing 405 JSON contract for JSON clients.
7. **Oversized and malformed bodies are recoverable.** Assert that 413 and 400 HTML responses contain a call link and a return-to-form link, and that their JSON equivalents retain `{ message }`.
8. **Honeypot submissions do not deliver.** A native post with `company_url` filled must perform no outbound request and return the same generic 303 receipt as a real native success, without echoing the honeypot value.

The first red run must be:

```bash
node --test tests/leads-response.test.mjs
```

Expected failures against the current handler include a 400 JSON response for a raw URL-encoded body, JSON instead of HTML for validation/failure, no Spanish branch, and 200 JSON rather than a 303 receipt on native success.

### 3.4 Mutation check for the regressions

Before implementation, the later worker must be able to name the production break caught by every check:

| Mutation | Test that must fail |
|---|---|
| Re-add static `novalidate` | `static forms keep native validation before enhancement` |
| Expose the enhancement-only toggle before listeners exist | `all static headers expose navigation when site.js is unavailable` |
| Route Spanish CTA back to `/contact` | `Spanish stays Spanish through the lead form` |
| Reintroduce English shared-control labels | Spanish shared-chrome test |
| Remove 44px radio target | coarse-pointer contract plus rendered measurement |
| Return JSON to a native form | native 422/503 tests |
| Put lead details in a redirect query | native success test |
| Break the current fetch client | enhanced JSON compatibility tests |
| Reflect unsanitized form text | HTML escaping test |
| Deliver honeypot input | honeypot no-fetch test |

---

## 4. Exact source-level implementation strategy

### 4.1 Shared, safe, bilingual form renderer

Create `src/review-form.mjs` with this public interface:

```js
export function normalizeLocale(value) // returns exactly "en" or "es"
export function escapeHtml(value)      // safe in element text and quoted attributes
export function renderReviewForm({
  locale = "en",
  values = {},
  fieldErrors = {},
  action = "/api/leads"
} = {}) // returns complete form HTML
```

The module owns the material/frequency option values and both languages' visible labels. `scripts/build.mjs` and `api/leads.js` must import this renderer. That keeps the static English form, static Spanish form, and server-rendered 422 retry form structurally identical.

The renderer must:

- emit `action="/api/leads"`, `method="post"`, `data-review-form`, and `data-locale="en|es"`;
- omit `novalidate` from source markup;
- emit hidden `locale`, `intent`, `form_started`, and `submission_key` fields;
- preserve only the known form keys on a 422 retry;
- escape every preserved value, including `textarea` text and selected/checked values;
- never preserve or echo `company_url`;
- set `aria-invalid="true"` and `aria-describedby="<field>-error"` for server-invalid fields;
- render linked error-summary items and inline `<p id="<field>-error" class="field-error">` messages;
- retain native `required`, `type="email"`, and `minlength="20"` constraints;
- retain the existing material enum values exactly so the API validation set does not drift;
- render each preferred-contact choice as one full clickable label;
- keep the privacy/qualification note, translated on Spanish, with the Spanish privacy link visibly labelled `aviso de privacidad (en ingles)` and `hreflang="en"`.

Use these Spanish control terms consistently:

| English | Spanish |
|---|---|
| Required | Obligatorio |
| Name | Nombre |
| Business | Empresa |
| Phone | Telefono |
| Email | Correo electronico |
| Material | Material |
| Select one | Seleccione una opcion |
| Approximate amount | Cantidad aproximada |
| Pickup location | Lugar de recogida |
| How often? | Con que frecuencia? |
| One-time lot | Lote unico |
| Recurring material | Material recurrente |
| Not sure | No estoy seguro |
| What should we know? | Que debemos saber? |
| Preferred contact | Medio de contacto preferido |
| Send request | Enviar solicitud |

The production source may use correct accented Spanish (`Telefono` -> `Telefono` only if the repository's character policy requires it); the user-facing output should prefer correct accents where the existing banned-character checks allow them. The prohibited character rule is the em dash, not Spanish diacritics.

### 4.2 Native form validation plus enhanced validation

In `scripts/build.mjs`, replace the local `reviewForm()` template with `renderReviewForm({ locale: "en" })` for `/contact` and `renderReviewForm({ locale: "es" })` for `/espanol`.

In `src/site.js`, attach all input and submit handlers first. Only after attachment succeeds set:

```js
reviewForm.noValidate = true;
reviewForm.dataset.enhanced = "true";
```

This order is the fail-safe boundary:

- no `site.js`: browser-native required/email/minlength validation remains active;
- script loads but throws before form setup completes: native validation remains active;
- setup completes: the existing linked error summary and fetch submission take over.

Do not add a `<noscript>` duplicate form. It would create duplicate IDs, duplicate content, and a second markup source that can drift.

### 4.3 JSON and HTML response negotiation in `/api/leads`

Extend `readBody(req)` to accept both Vercel-preparsed objects and raw bodies:

```js
function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  if (typeof raw !== "string") return {};
  const contentType = String(req.headers["content-type"] || "").split(";", 1)[0].trim().toLowerCase();
  if (contentType === "application/x-www-form-urlencoded") {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  if (contentType === "application/json") return JSON.parse(raw);
  throw new SyntaxError("Unsupported request body");
}
```

Choose response format with the request boundary, not a query flag supplied by a form:

```js
function responseFormat(req) {
  const accept = String(req.headers.accept || "").toLowerCase();
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (accept.includes("application/json") || contentType.includes("application/json")) return "json";
  return "html";
}
```

The existing enhanced client explicitly sends both JSON headers, so it remains on the JSON branch. A native form sends URL-encoded data and normally accepts HTML, including the `*/*` fallback.

Sanitize locale into the payload:

```js
locale: text(body.locale, 2).toLowerCase() === "es" ? "es" : "en"
```

Localize user-facing validation and response messages from a two-entry dictionary. Keep backend email field labels in English if desired; those are operator-facing, not part of the Spanish visitor journey.

### 4.4 Server-rendered HTML states

Add a small `renderLeadPage({ locale, state, heading, message, content })` in `api/leads.js`. It must output a complete document with:

- `<!doctype html>` and `<html lang="en|es">`;
- UTF-8, viewport, `theme-color`, and `<meta name="robots" content="noindex,nofollow">`;
- the local `/style.css` only, with no third-party assets or inline script;
- a skip link, one `<main>`, one H1, `data-lead-result="validation|delivery-failure|success|request-error"`, and clear phone/form actions;
- the same cream, navy, spacing, focus, and button tokens as the rest of Silver Atelier;
- no analytics or attribution collection on the Function response page.

State behavior:

| State | HTTP behavior | Required UI |
|---|---|---|
| Validation | 422 HTML | localized H1, linked summary, full shared retry form with safe values and errors |
| Delivery unconfigured | 503 HTML | localized explanation, phone link, prefilled email link, return-to-form link |
| Delivery failed | 502 HTML | same recovery surface with failure wording |
| Success | native POST returns 303 | `Location: /api/leads?status=received&lang=<locale>`; GET renders localized noindex receipt |
| Honeypot/too-fast | native POST returns 303 | same generic receipt, no delivery, no echoed values |
| Malformed/oversized | 400/413 HTML | human-readable explanation, phone link, correct localized form link |
| Method error | 405 | JSON clients retain JSON; HTML clients receive a form link and phone link |

The 303 receipt is important. It prevents a browser refresh from repeating a successful POST, and its URL contains only the response state and locale, never lead details. The GET receipt remains inside the existing Vercel Function route, so no new generated page or sitemap entry is needed.

On 502/503, build the `mailto:` from the sanitized payload, include the entered contact/material/location/details in the percent-encoded body, and exclude attribution, honeypot, timing, and idempotency fields. Escape the final href when inserting it into HTML.

### 4.5 Preserve the enhanced JavaScript form path

In `src/site.js`, define one UI dictionary selected from `reviewForm.dataset.locale` or the root document language. It must cover:

- error-summary heading;
- required, email-type, and short-details validation templates;
- loading button and live-region text;
- generic network error;
- success text;
- delivery-fallback link text;
- mailto subject and field labels.

Required Spanish messages:

```text
Revise lo siguiente:
<Campo> es obligatorio.
Escriba un correo electronico valido.
Anada un poco mas de informacion para revisar el material.
Enviando solicitud...
Enviando su solicitud de revision del material.
Recibimos su solicitud. AG Refining revisara los detalles y se comunicara por el medio que prefirio.
Enviar estos datos por correo
No se pudo enviar la solicitud. Llame al (281) 898-2719 o intentelo de nuevo.
```

Use correct Spanish diacritics in the actual UI. Update `fieldLabel()` so it strips both `Required` and `Obligatorio`. Add `locale` to `formPayload()`. Keep `Accept: application/json`, `Content-Type: application/json`, same-origin credentials, existing attribution, submission keys, busy state, Turnstile reset, button restoration, and current field-error linking.

Do not parse an HTML response in the enhanced path. Content negotiation guarantees JSON for the current fetch headers; if a proxy unexpectedly returns HTML, the existing JSON parse fallback should produce the localized generic error rather than inject server HTML into the page.

### 4.6 Progressive mobile navigation

Keep the current button/div structure, but invert its baseline:

1. In generated markup, add `hidden` to `[data-nav-toggle]` and `[data-nav-scrim]`.
2. With no enhancement marker, mobile `.nav-links` stays visible in normal flow and focusable; the header may expand naturally.
3. `site.js` finds all required controls, attaches toggle/scrim/link/keyboard/media listeners, synchronizes the initial state, then and only then:
   - removes `hidden` from toggle and scrim;
   - sets `data-nav-enhanced="true"` on the header.
4. CSS applies off-canvas positioning only below 901px and only under `.site-header[data-nav-enhanced="true"]`.

At `max-width: 900px`, the unenhanced fallback must:

- make `.site-header:not([data-nav-enhanced])` non-sticky so a full link list cannot trap the viewport;
- let `.nav` wrap with `height: auto` and `min-height: 5rem`;
- place `.nav-links` statically at full width with readable dividers and the pickup action;
- leave all destinations keyboard and pointer reachable;
- keep the hidden toggle and scrim out of the accessibility tree;
- avoid horizontal overflow at 320px.

At the same breakpoint, the enhanced state restores the current 5rem sticky bar and fixed bottom-sheet menu.

Create one state synchronizer in `src/site.js`:

```js
function syncNavState({ open = false, restoreFocus = false } = {}) {
  const mobile = !navMedia.matches;
  const interactive = !mobile || open;
  document.body.classList.toggle("nav-open", mobile && open);
  toggle.setAttribute("aria-expanded", String(mobile && open));
  nav.inert = !interactive;
  if (interactive) nav.removeAttribute("aria-hidden");
  else nav.setAttribute("aria-hidden", "true");
  // Also set/remove tabindex=-1 on nav controls as an inert fallback.
  // Preserve focus return only when an actually open mobile menu closes.
}
```

The implementation must use both `inert` and a stored-tabindex fallback for older assistive/browser combinations. Record each link's original tabindex before setting `-1`, then restore the exact prior value rather than blindly removing it.

State requirements:

- enhanced mobile closed: menu is visually hidden, `inert`, `aria-hidden="true"`, and no descendant is sequentially focusable;
- enhanced mobile open: menu is visible and interactive, first link receives focus, background regions are inert, and focus loops between toggle and menu controls;
- Escape/scrim: menu closes and focus returns to the opener/toggle;
- link activation: menu closes without stealing focus from navigation;
- resize to desktop: menu becomes visible and interactive, inert/aria-hidden/tabindex overrides are cleared, and body scroll unlocks;
- resize back to mobile: menu closes and becomes inert;
- no JS or blocked `/site.js`: toggle remains hidden and the static link list remains visible.

Do not use a `<noscript>` stylesheet. It would not cover the more important case where JavaScript is enabled but `/site.js` fails to load.

### 4.7 Complete Spanish shell and in-page contact journey

Refactor the current global `nav`, `footer`, `materialGuide`, and `mobileActions` strings into locale-aware render functions called by `document({ lang })`.

On `/espanol`, translate:

- skip link;
- utility text and language switch;
- primary-nav accessible name, control label, link labels, and pickup action;
- mobile quick-action accessible name and `Call` label;
- footer description, navigation labels, qualification notice, and legal label;
- material-guide summary, heading, and actions;
- the full contact aside, form, field labels/options/placeholders/note/button;
- every client and server validation/loading/success/recovery message.

The Spanish primary action in the header, mobile dock, footer, material guide, and conversion band must target `#solicitud`, not `/contact`. Add a localized contact section with `id="solicitud"` and `renderReviewForm({ locale: "es" })` directly to `/espanol`.

Because the rest of the site is not translated, Spanish shell links to English-only material/industry/process/privacy pages must include:

```html
hreflang="en"
<small class="language-note">en ingles</small>
```

The language switch itself may visibly say `<span lang="en">English</span>` and link to `/`; this is an intentional correctly marked language change.

Do not claim that English destination pages are translated. Do not point the Spanish pickup action at an English form.

### 4.8 44px preferred-contact targets

Extend the existing coarse-pointer rule:

```css
@media (pointer: coarse) {
  .preferred-contact label {
    min-height: 44px;
    min-width: 44px;
    padding-block: 0.5rem;
  }
}
```

Keep the native radio at its current visual size; the label supplies the hit area. Ensure the flex wrapping and gap still fit at 320px in both English and Spanish. Add `cursor: pointer` outside the media query only if it matches the existing control treatment.

---

## 5. Edge cases the implementation must handle

### Forms and Function

- Vercel may provide URL-encoded input as an object or raw string; support both.
- Header keys are lowercase in Node/Vercel, but tests should tolerate missing `accept` and `content-type`.
- A native form has no client attribution object; treat attribution as `{}` rather than rejecting the lead.
- A no-JavaScript form may submit `form_started=""`; do not classify it as too fast. Apply timing suppression only when a positive, finite start time was supplied.
- A server-rendered 422 retry must retain the generated `submission_key` so the corrected request has a stable Resend idempotency key.
- Unknown locale values fall back to English.
- Unknown material/frequency/contact values never become selected or checked; validation reports the material error.
- `textarea` values containing `</textarea>`, quotes, ampersands, or markup must be escaped.
- Error messages are server-owned dictionary strings; never echo a browser validation message into HTML.
- 502 and 503 must not reset or discard the visitor's recovery details.
- A successful native POST must not be repeatable by refreshing the receipt.
- A failed JSON parse must never return a stack trace.
- A direct GET to `/api/leads` must not show a blank page or raw JSON to an HTML browser.

### Navigation

- Initialization with any required nav control missing must leave the visible static fallback intact.
- A later exception in unrelated `site.js` code must not undo already attached nav listeners.
- Background inerting must be cleared on every close and desktop resize path.
- Focus must not be restored after activating a destination link; the navigation itself should proceed.
- Brand, skip link, mobile dock, footer, and material guide must not become permanently inert after resizing.
- The fallback header must not remain sticky when its expanded link list is taller than a small phone viewport.
- At 900px the mobile behavior applies; at 901px desktop behavior applies.

### Spanish and touch

- Long Spanish labels must wrap without clipping at 320px and 390px.
- `lang="es"` remains on the full Spanish document and Function pages; the word `English` alone receives `lang="en"`.
- The `en ingles` language note remains visible at 200% zoom and is not conveyed by color alone.
- Tapping anywhere inside either 44px radio label must change the radio selection.
- The radio group must remain one fieldset with one legend; do not replace native radios with scripted controls.

---

## 6. Focused green commands

After the implementation, run in this order:

```bash
node --test tests/leads-response.test.mjs
npm run build
node --test tests/generated-interaction-contract.test.mjs
npm run verify
git diff --check
```

Expected final output includes both Node test files passing, `AG_REFINING_CHECK_OK`, and `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

The implementer then reports to the controller:

- the exact red output captured before source edits;
- the exact green output;
- changed files;
- any intentional difference from this plan;
- status `READY FOR GRADE` for the four finding IDs.

---

## 7. Required rendered-browser tests for the independent grader

Automated source/output checks do not prove focus order, actual hit area, or layout. A fresh grader must run the following against a local Vercel-equivalent preview or the deployed preview. Do not submit a valid production lead; use invalid data or a stubbed local Function.

### 7.1 Mobile navigation matrix

Run on `/`, `/contact`, `/espanol`, and one deep service route.

| Width | Script state | Expected |
|---:|---|---|
| 320 | enabled | closed links are not tabbable; toggle opens; first link receives focus; Escape returns focus; no overflow |
| 390 | disabled | toggle absent; all nav destinations visible in normal flow and activatable; main content remains reachable |
| 390 | `/site.js` blocked | same behavior as disabled, proving load failure recovery rather than only `<noscript>` behavior |
| 768 | enabled | same closed/open/inert/focus behavior as 320 |
| 768 | disabled | static nav remains fully usable |
| 901 | enabled | desktop nav visible and interactive; toggle absent; no lingering inert/aria-hidden/tabindex |
| 1024 | enabled | desktop regression pass |

For enabled mobile, record these browser-observable assertions:

```text
toggle aria-expanded=false
menu inert=true and aria-hidden=true
no focused element enters #primary-links before opening
after activation: aria-expanded=true, inert=false, first menu link focused
Escape: aria-expanded=false, focus on toggle, background inert cleared
```

Resize while the menu is open from 768 to 1024 and back to 768. Verify scroll lock and all inert states clear correctly.

### 7.2 English no-JavaScript form

At 390px with JavaScript disabled:

1. Submit empty `/contact`; native required validation blocks navigation and focuses a required field.
2. Enter a syntactically valid email but a server-invalid short phone/details combination; submit and verify a styled 422 HTML page, one H1, linked errors, visible inline errors, retained safe values, and a complete retry form.
3. On a local Function with delivery disabled, submit a valid synthetic request and verify a 503 HTML recovery page with phone, prefilled email, and return-to-form actions.
4. On a stubbed-success local Function, verify the 303 receipt URL and refresh it; no second delivery call occurs.

### 7.3 Enhanced form regression

At 390px and 1440px with JavaScript enabled:

1. Empty submit shows the existing linked error summary in-page and sends no request.
2. Error-summary links move focus to their fields.
3. A forced JSON 503 produces an in-page prefilled email fallback.
4. A stubbed JSON 200 resets the form, announces success, restores the submit button, refreshes timing/submission key, and does not navigate away.
5. Query prefill for `intent`, `material`, `quantity`, and `frequency` still works.

### 7.4 Spanish end-to-end journey

At 390px and 1024px on `/espanol`:

1. Traverse skip link, header, mobile action, content, form, footer, and material guide with a screen reader or accessibility tree; all user-facing labels are Spanish except explicitly marked English destination notices.
2. Every pickup action moves to `#solicitud`; none opens English `/contact`.
3. Empty enhanced submit produces a Spanish linked error summary.
4. Forced JSON 503 and network failure produce Spanish recovery text and a Spanish mailto subject/body.
5. Stubbed JSON success announces Spanish success text.
6. With JavaScript disabled, server 422/503/receipt documents remain `lang="es"` and provide a return to `/espanol#solicitud`.

### 7.5 Coarse touch and reflow

With a 390px viewport and coarse/touch emulation:

```js
for (const label of document.querySelectorAll(".preferred-contact label")) {
  const rect = label.getBoundingClientRect();
  if (rect.height < 44 || rect.width < 44) throw new Error(`${label.textContent.trim()} target is ${rect.width}x${rect.height}`);
}
```

Tap each label away from the 16px glyph and verify the associated radio becomes checked. Repeat at 320px, at 200% zoom, and on the Spanish form. Confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth` on every tested page/state.

---

## 8. Independent grade contract

The grader must not be the implementer. Grade all four IDs separately:

- `PASS`: original reproduction is gone, focused regressions pass, adjacent cases pass, and no new accessibility or conversion problem appears.
- `PASS WITH LOW OBSERVATION`: the blocking defect is closed and the remaining issue is demonstrably polish-only; create a separate Low ledger entry.
- `FAIL`: include route, width, script state, exact keyboard/pointer sequence, expected versus actual result, and a screenshot or DOM evidence where possible.

Minimum closure evidence:

| Finding | Required proof |
|---|---|
| `AGQA-FORM-001` | native validation, HTML 422, HTML 502/503 recovery, safe 303 receipt, and unchanged enhanced JSON path |
| `AGQA-NAV-001` | closed mobile focus exclusion, complete open/close focus cycle, no-JS and blocked-script fallback, desktop resize cleanup |
| `AGQA-I18N-001` | Spanish shell, in-page Spanish form, Spanish client states, Spanish Function states, explicit English-destination notices |
| `AGQA-TOUCH-001` | measured 44px labels and successful off-glyph taps at 320/390 coarse pointer |

No finding closes from a source scan alone. The final release gate still requires the repository-wide verification and production smoke owned by the controller.
