# AG Refining Homepage Hero V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected homepage 3D hero with a cinematic, full-bleed silver-refining hero that communicates the offer and next action within five seconds.

**Architecture:** Keep the static build architecture and existing shared shell. Generate two owned responsive raster assets, replace only the homepage hero markup and its bounded CSS, remove the homepage assay bootstrap from the shared script, and move the existing intake form directly below the hero.

**Tech Stack:** Static HTML generator in Node.js, semantic HTML, CSS, local JavaScript, WebP assets, Node test runner, local Chromium.

## Global Constraints

- Primary CTA label remains `Schedule a free pickup`.
- Exact V2 heading is `Your silver, valued precisely.`.
- The hero must work without JavaScript and must not request Three.js.
- Desktop hero image is at most 280 KiB; mobile hero image is at most 180 KiB.
- No invented claims, testimonials, certifications, prices, turnaround times, or scarcity.
- Preserve all 39 HTML documents, 38 indexed routes, native form recovery, Spanish shell behavior, navigation behavior, and mobile accessibility fixes.

---

### Task 1: Produce the responsive cinematic hero assets

**Files:**
- Create: `assets/ag-refining-hero-v2-2048.webp`
- Create: `assets/ag-refining-hero-v2-mobile.webp`

**Interfaces:**
- Consumes: The composition and asset limits in the V2 design spec.
- Produces: Two optimized WebP files referenced by homepage markup and tests.

- [ ] **Step 1: Generate the desktop source image**

Use the built-in image generation tool with a 16:9 cinematic industrial-refining prompt, dark negative space on the left, the silver pour right of center, and no text or branding.

- [ ] **Step 2: Inspect the desktop source**

Reject any result that reads as gold, lava, jewelry retail, a fantasy foundry, a 3D render, or an unsafe industrial scene.

- [ ] **Step 3: Generate the mobile source image**

Use the same scene identity in a portrait composition with the pour in the upper half and dark negative space below.

- [ ] **Step 4: Optimize and verify dimensions**

Run the project's image optimization tooling or `cwebp`/Sharp-equivalent tooling already available in the repository. Verify exact dimensions and byte ceilings with `identify` and `stat`.

### Task 2: Capture the V2 contract as a failing test

**Files:**
- Modify: `tests/assay-production-contract.test.mjs`
- Modify: `scripts/verify.mjs`

**Interfaces:**
- Consumes: Exact copy, asset names, ordering, and no-3D requirements from the spec.
- Produces: A regression suite that fails on the current hero and passes only on the V2 structure.

- [ ] **Step 1: Replace the current homepage assay-stage assertions**

Assert the exact V2 heading, responsive V2 picture, proof rail, CTA labels, and intake-after-hero ordering. Assert absence of `data-assay-stage`, assay canvas host, and assay fallback markup from generated homepage HTML.

- [ ] **Step 2: Add the shared-script negative assertion**

Assert `src/site.js` does not dynamically import `/assay-scene.js` or query `[data-assay-stage]`.

- [ ] **Step 3: Run focused tests and record RED**

Run `npm run build && node --test tests/assay-production-contract.test.mjs`. Expected: failures name the missing V2 heading/assets and the still-present assay stage/import.

### Task 3: Implement the static cinematic hero

**Files:**
- Modify: `scripts/build.mjs`
- Modify: `src/style.css`
- Modify: `src/site.js`

**Interfaces:**
- Consumes: V2 assets and test contract.
- Produces: Generated homepage hero, below-hero intake section, and a shared script without homepage WebGL boot.

- [ ] **Step 1: Replace homepage hero markup**

Add a full-bleed `<picture>`, editorial copy, primary and secondary actions, call fallback, and in-hero proof rail. Close the hero before the intake form.

- [ ] **Step 2: Move the intake form into its own section**

Keep its form action, field names, required state, options, disclaimer, and CTA behavior unchanged.

- [ ] **Step 3: Replace bounded hero CSS**

Implement desktop, tablet, 700px, and 420px layouts. Preserve 44px targets, visible focus, contrast, no-JS rendering, and zero horizontal overflow.

- [ ] **Step 4: Remove the homepage assay bootstrap**

Delete the `[data-assay-stage]` bootstrap block from `src/site.js`. Do not modify lead-form or navigation behavior.

- [ ] **Step 5: Run focused tests and record GREEN**

Run `npm run build && node --test tests/assay-production-contract.test.mjs`. Expected: all V2 contract assertions pass.

### Task 4: Verify the complete release

**Files:**
- Modify only if a verified defect is found.

**Interfaces:**
- Consumes: Generated `dist` output.
- Produces: Fresh deterministic and browser evidence suitable for publication.

- [ ] **Step 1: Run the full deterministic gate**

Run `npm run verify && node --check src/site.js && git diff --check && npm audit --omit=dev --audit-level=high`.

- [ ] **Step 2: Run browser verification**

Capture and inspect 1440x960, 390x844, and 320x800. Also verify JavaScript-disabled and reduced-motion states. Check CTA reachability, crop quality, focus order, overflow, console errors, and absence of Three.js network requests.

- [ ] **Step 3: Critique against the frontend rubric**

Confirm five-second comprehension, one dominant CTA, subject-specific imagery, intentional crop, 320px reading order, and no generic AI design patterns. Remove at least one unnecessary element if the first screen remains busy.

- [ ] **Step 4: Publish and deploy**

Commit the verified tree, publish a GitHub review branch, merge only the immutable checked head, wait for Vercel `READY`, and smoke-test the public alias without creating a valid lead.
