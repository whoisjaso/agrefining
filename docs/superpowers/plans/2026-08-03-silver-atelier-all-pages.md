# Silver Atelier All-Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild AG Refining’s complete public frontend as the light, cream-led Silver Atelier while preserving its 38-route SEO footprint, factual claims, lead API, and accessibility behavior.

**Architecture:** Keep the existing static publishing registry and serverless lead endpoint. Change generated markup through shared helpers and page-family templates in `scripts/build.mjs`, replace the accumulated CSS with one tokenized system in `src/style.css`, and simplify `src/site.js` to purposeful navigation, chrome, form, and reveal behavior. Extend output verification before each production change so the generated site, rather than implementation text, is the tested boundary.

**Tech Stack:** Node.js ESM, generated semantic HTML, native CSS, native browser JavaScript, Vercel serverless function, Sharp asset pipeline.

## Global Constraints

- Keep all 38 indexed URLs, current redirects, exact protected SEO fields, and sitemap inventory.
- Keep `Schedule a Free Pickup` as the primary CTA and phone as the fallback.
- Keep the `/api/leads` request and response contract unchanged.
- Do not strengthen claims about insurance, assay method, fees, payment timing, compliance, licenses, minimums, pickup, or shipping.
- Use `#f1ede4` as the light browser and page ground, `#faf8f2` as the raised surface, and `#171815` as graphite.
- Use champagne below 5% of a viewport and functional blue only for interaction, focus, and validation.
- Remove automatic dark mode, animated mesh, glass intake surfaces, page-exit animation, gradient text, and decorative numbering without sequence.
- Preserve 320px support, 44px coarse-pointer targets, 16px form controls, visible focus, keyboard navigation, reduced motion, and safe-area insets.
- Use no additional production dependency.
- Keep the repository-wide prohibition on em dashes and emoji.

---

### Task 1: Protect the generated Silver Atelier shell

**Files:**
- Modify: `scripts/verify.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Consumes: Existing `document()` generator, `nav`, `footer`, `mobileActions`, and generated `dist/**/*.html` files.
- Produces: A consistent `data-design="silver-atelier"` document marker, one light theme color, simplified shared chrome, and a versioned atelier stylesheet/script reference.

- [ ] **Step 1: Write the failing generated-output assertions**

Add an all-page loop after `htmlFiles` is created:

```js
for (const path of htmlFiles) {
  const source = readFileSync(path, "utf8");
  const displayPath = relative(out, path);
  if (!source.includes('data-design="silver-atelier"')) failures.push(`${displayPath}: missing Silver Atelier document marker`);
  if (!source.includes('<meta name="theme-color" content="#f1ede4">')) failures.push(`${displayPath}: missing light browser chrome`);
  if ((source.match(/class="site-header"/g) || []).length !== 1) failures.push(`${displayPath}: expected one shared header`);
  if ((source.match(/class="footer"/g) || []).length !== 1) failures.push(`${displayPath}: expected one shared footer`);
}
```

- [ ] **Step 2: Run the verification and confirm the expected failure**

Run: `npm run verify`

Expected: failure messages naming missing `Silver Atelier document marker` and `light browser chrome`.

- [ ] **Step 3: Implement the shared shell**

In `document()`:

```html
<meta name="theme-color" content="#f1ede4">
<link rel="stylesheet" href="/style.css?v=20260803-silver-atelier">
<body data-design="silver-atelier" class="...">
```

Simplify the utility rail, navigation, footer, mobile dock, and material guide while preserving their links, labels, landmarks, focus controls, and safe-area hooks. Replace shared button variants with `button-primary`, `button-secondary`, and `button-inverse`.

- [ ] **Step 4: Run verification and confirm the shell assertions pass**

Run: `npm run verify`

Expected: no shell-marker or theme-color failures; unrelated new design assertions do not exist yet.

- [ ] **Step 5: Commit the shell contract**

```bash
git add scripts/verify.mjs scripts/build.mjs
git commit -m "refactor: establish Silver Atelier shell"
```

### Task 2: Recompose the homepage conversion journey

**Files:**
- Modify: `scripts/verify.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Consumes: `featuredMaterials`, `industryPages`, `locationPages`, `homeFaqs`, and existing contact query parameters.
- Produces: `atelier-hero`, `intake-panel`, `assay-line`, `material-editorial`, `industry-index`, and `conversion-band` generated structures.

- [ ] **Step 1: Write the failing homepage behavior assertions**

After loading the generated homepage, isolate the hero and assert the intended path:

```js
const heroMatch = home.match(/<section class="atelier-hero"[\s\S]*?<\/section>/);
if (!heroMatch) failures.push("Homepage is missing the atelier hero");
else {
  const hero = heroMatch[0];
  if ((hero.match(/href="\/contact\?intent=pickup"/g) || []).length !== 1) failures.push("Homepage hero must have one pickup action");
  if (!hero.includes(`href="tel:+12818982719"`)) failures.push("Homepage hero must keep the phone fallback");
  if (hero.includes("Request a quote")) failures.push("Homepage hero contains a competing quote action");
}
if (!home.includes('class="intake-panel"')) failures.push("Homepage is missing the separate material intake panel");
if (home.includes('class="hero-review-card"')) failures.push("Homepage still contains the floating glass intake card");
```

- [ ] **Step 2: Run the verification and confirm it fails on the old homepage**

Run: `npm run verify`

Expected: failures for missing atelier hero/intake panel and the old glass card remaining.

- [ ] **Step 3: Replace the homepage structure**

Rebuild `home` in this exact order:

1. light `atelier-hero` with pickup button and phone fallback;
2. flat `intake-panel` retaining `intent`, `material`, and `quantity` query fields;
3. four trust facts;
4. alternating `material-editorial` rows using all six featured materials;
5. real six-stage `assay-process`;
6. commercial facility feature;
7. divided industry index;
8. service-area proof;
9. family provenance;
10. location and FAQ;
11. one `conversion-band`.

Use the existing factual copy and qualification language. Do not introduce metrics, awards, guarantees, or testimonials.

- [ ] **Step 4: Run verification and confirm homepage contracts pass**

Run: `npm run verify`

Expected: homepage design assertions and all existing exact SEO checks pass.

- [ ] **Step 5: Commit the homepage composition**

```bash
git add scripts/verify.mjs scripts/build.mjs
git commit -m "feat: recompose Silver Atelier homepage"
```

### Task 3: Normalize every page family around shared atelier primitives

**Files:**
- Modify: `scripts/verify.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Consumes: `servicePage()`, `coinServicePage()`, `longMaterialPage()`, `xrayHubPage()`, `houstonHubPage()`, `taxonomyPage()`, and static page bodies.
- Produces: Light `page-hero`, `assay-line`, editorial detail/list layouts, handling insets, and one shared `conversion-band` across every public family.

- [ ] **Step 1: Add failing family-level output checks**

Create literal representative route checks:

```js
const atelierFamilies = [
  ["scrap-silver-jewelry", ["page-hero", "assay-line", "conversion-band"]],
  ["sell-silver-coins-houston", ["page-hero", "assay-line", "conversion-band"]],
  ["silver-flake-buyer-houston", ["page-hero", "handling-inset", "conversion-band"]],
  ["x-ray-recycling-services-houston", ["page-hero", "pathway-list", "conversion-band"]],
  ["houston-silver-buyer", ["page-hero", "assay-line", "conversion-band"]],
  ["accepted-materials", ["page-hero", "editorial-index", "conversion-band"]],
  ["how-it-works", ["page-hero", "assay-process", "conversion-band"]],
  ["about", ["page-hero", "provenance-story", "conversion-band"]],
  ["contact", ["page-hero", "review-form", "expectation-rail"]],
  ["espanol", ["page-hero", "conversion-band"]],
  ["privacy", ["page-hero", "legal-grid"]]
];
for (const [route, classes] of atelierFamilies) {
  const source = readFileSync(join(out, route, "index.html"), "utf8");
  for (const className of classes) {
    if (!source.includes(className)) failures.push(`${route}: missing ${className}`);
  }
}
```

- [ ] **Step 2: Run verification and confirm representative families fail**

Run: `npm run verify`

Expected: failures naming the missing new primitives across route families.

- [ ] **Step 3: Add shared markup helpers**

Add focused helpers in `scripts/build.mjs`:

```js
function assayLine(label = "Ag / 47") {
  return `<div class="assay-line" aria-hidden="true"><span>${label}</span><i></i></div>`;
}

function conversionBand({ eyebrow, heading, text }) {
  return `<section class="conversion-band"><div class="shell"><p class="eyebrow">${eyebrow}</p><h2>${heading}</h2><p>${text}</p><div class="conversion-actions"><a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a><a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a></div></div></section>`;
}
```

Use them only for true process/measurement and final conversion contexts.

- [ ] **Step 4: Recompose all page families**

Update every generator and static body listed in the task interface. Preserve registry copy and exact SEO values while changing hierarchy and class names. Convert equal card walls into `editorial-index`, `pathway-list`, `detail-ledger`, or divided lists. Convert dark safety blocks into `handling-inset`. Keep contact fields, names, values, required attributes, and form status hooks unchanged.

- [ ] **Step 5: Run verification and confirm every family passes**

Run: `npm run verify`

Expected: all family checks, exact SEO checks, 39 HTML files, and 38 sitemap entries pass.

- [ ] **Step 6: Commit the cross-page structure**

```bash
git add scripts/verify.mjs scripts/build.mjs
git commit -m "feat: unify all pages under atelier structure"
```

### Task 4: Replace the visual system and simplify motion

**Files:**
- Modify: `src/style.css`
- Modify: `src/site.js`
- Modify: `scripts/check.mjs`

**Interfaces:**
- Consumes: Generated Silver Atelier class names and existing form/navigation data hooks.
- Produces: A cream-led responsive design system and purposeful interaction behavior without mesh drift, glass cards, or page-exit animation.

- [ ] **Step 1: Add failing design safety checks**

Extend `scripts/check.mjs` to evaluate the real CSS artifact:

```js
const css = readFileSync(join(root, "src", "style.css"), "utf8");
if (!css.includes("--canvas: #f1ede4")) failures.push("Silver Atelier canvas token is missing");
if (!css.includes("--graphite: #171815")) failures.push("Silver Atelier graphite token is missing");
if (/prefers-color-scheme\s*:\s*dark/.test(css)) failures.push("Automatic dark mode remains in the stylesheet");
if (/mesh-drift|gradient-text/.test(css)) failures.push("Legacy decorative effects remain in the stylesheet");
```

These checks protect rendered color-scheme and motion decisions that cannot be exercised by the existing static HTML verifier.

- [ ] **Step 2: Run the check and confirm it fails on the legacy CSS**

Run: `npm run check`

Expected: missing canvas/graphite token failures and automatic dark-mode failure.

- [ ] **Step 3: Replace `src/style.css`**

Build the new stylesheet in this order:

1. local font faces and exact palette/type/spacing/motion tokens;
2. reset, semantic defaults, focus, and reduced-motion behavior;
3. shell, shared sections, buttons, assay line, and editorial primitives;
4. header, mobile sheet, persistent dock, guide, and footer;
5. homepage compositions;
6. shared page hero, answers, ledgers, indexes, pathways, process, handling, FAQ, forms, legal, and conversion band;
7. responsive compositions at 1100px, 900px, 700px, and 480px;
8. coarse-pointer and print behavior.

Use borders and spacing before shadows, cap radii at 12px for structural surfaces, and keep the top of every page light.

- [ ] **Step 4: Remove nonessential JavaScript motion**

Delete page-exit interception and leave normal navigation intact. Keep navigation focus trapping, header/dock state, material guide dismissal, form validation/delivery/fallback, attribution, and a restrained reveal observer. Change reveal selection to major `[data-reveal]` compositions only.

- [ ] **Step 5: Run the design check and full verification**

Run: `npm run check && npm run verify`

Expected: both commands exit 0 with no design-safety or generated-output failures.

- [ ] **Step 6: Commit the complete visual system**

```bash
git add src/style.css src/site.js scripts/check.mjs
git commit -m "feat: apply Silver Atelier visual system"
```

### Task 5: Align documentation and complete visual verification

**Files:**
- Modify: `DESIGN.md`
- Modify: `README.md`
- Verify: generated `dist/`

**Interfaces:**
- Consumes: Completed templates, stylesheet, scripts, and build pipeline.
- Produces: Accurate design documentation and fresh evidence for responsive, keyboard, asset, and route behavior.

- [ ] **Step 1: Rewrite the design-system documentation**

Document the six palette roles, Manrope/Newsreader role reversal, assay line, light-only contract, restrained motion, editorial indexes, one deep conversion band, and iOS rules. Keep deployment and content-registry instructions in the README, adding only a short note that shared page families are governed by the Silver Atelier system.

- [ ] **Step 2: Run repository integrity checks**

Run:

```bash
git diff --check
npm run check
npm run verify
```

Expected: no whitespace errors, `AG_REFINING_CHECK_OK`, and `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

- [ ] **Step 3: Serve the built site and run browser checks**

Serve `dist` on loopback. Verify `/`, `/silver-flake-buyer-houston`, `/contact`, `/espanol`, and `/privacy` at 320x844, 390x844, 768x1024, 1024x900, and 1440x1000. Check no horizontal overflow, one visible `h1`, reachable CTA, visible focus, mobile navigation, form errors, and reduced motion. Capture homepage and contact screenshots at mobile and desktop widths for inspection.

- [ ] **Step 4: Inspect all changed files and route inventory**

Run:

```bash
git status --short
git diff --stat main...HEAD
git diff --check main...HEAD
```

Expected: only redesign code and documentation are changed; generated `dist` and dependencies remain ignored.

- [ ] **Step 5: Commit documentation**

```bash
git add DESIGN.md README.md
git commit -m "docs: document Silver Atelier system"
```
