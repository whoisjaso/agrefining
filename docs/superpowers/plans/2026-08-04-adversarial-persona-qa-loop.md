# Adversarial Persona QA Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit, repair, independently grade, and production-verify all AG Refining pages against a finite adversarial persona and failure-context matrix.

**Architecture:** Three read-only audit lanes inspect the same 39 generated documents through non-overlapping lenses and write distinct reports. The controller normalizes accepted findings into one ledger, dispatches conflict-free test-first fixes, then assigns fresh graders to each completed scope. A five-round cap and objective release gate make the loop exhaustive but terminating.

**Tech Stack:** Node.js ESM build and verification scripts, generated static HTML/CSS/JavaScript, Vercel production hosting, GitHub source control, and cloud-browser verification.

## Global Constraints

- Preserve all 38 indexed URLs, `dist/404.html`, SEO fields, redirects, `/api/leads`, form attribution, image pipeline, and factual claim qualifications.
- Keep the Silver Atelier cream-and-blue visual system and one `Schedule a Free Pickup` primary action.
- Treat persona labels as user needs and behavioral contexts, never diagnoses.
- Never accept a production fix without a demonstrated failing regression check first.
- Never let an implementer grade their own work.
- Never run concurrent implementers against `scripts/build.mjs`, `src/style.css`, `src/site.js`, or the same verification file.
- Cap each finding at five fix-and-grade rounds and report any cap breach.

---

### Task 1: Establish the audit manifest and ledger

**Files:**
- Create: `docs/qa/adversarial-persona-ledger.md`
- Read: `dist/sitemap.xml`
- Read: `docs/superpowers/specs/2026-08-04-adversarial-persona-qa-loop.md`

**Interfaces:**
- Consumes: the 38 sitemap routes, generated 404, persona matrix, and severity definitions.
- Produces: stable finding IDs in the form `AGQA-<lane>-<three digits>` and a single authoritative status table.

- [ ] **Step 1: Record the baseline build**

Run:

```bash
npm run verify
git status --short --branch
git rev-parse HEAD
```

Expected: `AG_REFINING_CHECK_OK`, `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`, and a clean worktree before audit artifacts.

- [ ] **Step 2: Create the ledger schema**

Use these exact columns:

```text
ID | Lane | Route/scope | Persona/context | Viewport | Severity | Reproduction/evidence | Expected | Regression | Fix owner | Grader | Round | Status
```

- [ ] **Step 3: Record the release gate**

Copy the release-gate conditions from the specification into the ledger so the final decision is evidence-based.

### Task 2: Run the three-lane adversarial audit

**Files:**
- Create: `docs/qa/audit-accessibility.md`
- Create: `docs/qa/audit-trust-conversion.md`
- Create: `docs/qa/audit-responsive-resilience.md`
- Read: all files below `dist/`, `src/`, `scripts/`, and `api/`

**Interfaces:**
- Consumes: the route manifest and behavioral-risk matrix.
- Produces: reproducible candidate findings with severity and evidence; auditors do not edit production files.

- [ ] **Step 1: Dispatch the perceptual-accessibility auditor**

Require coverage of all 39 documents, 320px reflow, 200% zoom, keyboard order, focus, color-independent states, semantics, reduced motion, coarse-pointer targets, and form error recovery.

- [ ] **Step 2: Dispatch the trust-conversion auditor**

Require coverage of all 39 documents, the eleven decision contexts, five-second comprehension, CTA consistency, unsupported claims, privacy and certainty needs, Spanish-first comprehension, and the anti-template rubric.

- [ ] **Step 3: Dispatch the responsive-resilience auditor**

Require coverage of all 39 documents at 320/390/768/1024/1440, local routes/assets, no-JavaScript survival, image loading, metadata, form transport/recovery, and representative production parity.

- [ ] **Step 4: Reject incomplete reports**

An audit report is complete only when it lists every route family tested, exact commands or browser steps, and either findings or an explicit no-finding result for each required dimension.

### Task 3: Normalize and prioritize candidate findings

**Files:**
- Modify: `docs/qa/adversarial-persona-ledger.md`
- Read: `docs/qa/audit-accessibility.md`
- Read: `docs/qa/audit-trust-conversion.md`
- Read: `docs/qa/audit-responsive-resilience.md`

**Interfaces:**
- Consumes: candidate findings from all three audit lanes.
- Produces: deduplicated `OPEN`, `OBSERVATION`, or `REJECTED` entries with stable IDs.

- [ ] **Step 1: Reproduce every Critical, High, and Medium candidate**

Use the local production build and the exact viewport/context in the report. Mark non-reproducible candidates `REJECTED` with evidence.

- [ ] **Step 2: Merge shared-root duplicates**

When several routes fail because of the same shared component, create one finding whose scope lists all affected route families and preserve each distinct user consequence.

- [ ] **Step 3: Order the fix queue**

Order by Critical, High, core-journey Medium, other Medium, then Low. Record source-file overlap so incompatible fixes are sequential.

### Task 4: Repair accepted findings test-first

**Files:**
- Modify as scoped per finding: `scripts/check.mjs`, `scripts/verify.mjs`, `scripts/build.mjs`, `src/style.css`, or `src/site.js`
- Modify: `docs/qa/adversarial-persona-ledger.md`

**Interfaces:**
- Consumes: one normalized finding, its reproduction, and affected source scope.
- Produces: a failing regression, minimal production fix, green focused check, green full verification, and ledger evidence.

- [ ] **Step 1: Write the failing regression**

Add the smallest deterministic assertion to `scripts/check.mjs` for source-level invariants or `scripts/verify.mjs` for generated-output invariants.

- [ ] **Step 2: Prove the regression is red**

Run the narrow script and capture the expected finding-specific failure message before production code changes.

- [ ] **Step 3: Implement the minimal shared-root fix**

Change only the source files required to satisfy the accepted finding while preserving protected infrastructure.

- [ ] **Step 4: Prove focused and full checks are green**

Run:

```bash
npm run check
npm run verify
```

Expected: `AG_REFINING_CHECK_OK` and `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

- [ ] **Step 5: Update the ledger for grading**

Record the regression location, implementer, round, changed source scope, and status `READY FOR GRADE`.

### Task 5: Independently grade every repair

**Files:**
- Modify: `docs/qa/adversarial-persona-ledger.md`
- Read: the changed source, regression, generated output, and original audit evidence

**Interfaces:**
- Consumes: a `READY FOR GRADE` finding.
- Produces: `PASS`, `PASS WITH LOW OBSERVATION`, or `FAIL` with fresh evidence.

- [ ] **Step 1: Assign a fresh grader**

The grader must not be the implementer and must receive the original reproduction, expected behavior, changed files, and regression command.

- [ ] **Step 2: Rerun the exact reproduction and adjacent cases**

Test the original persona, route, viewport, and failure context plus at least one narrower and one wider adjacent viewport or one adjacent route in the same family.

- [ ] **Step 3: Apply the grade**

`PASS` closes the finding. `PASS WITH LOW OBSERVATION` closes the blocking issue and adds a separate Low ledger entry. `FAIL` returns the finding to `OPEN`, increments the round, and records precise corrective evidence.

- [ ] **Step 4: Enforce the round cap**

After round five, stop dispatching and mark the unresolved finding `CAP BREACH` for explicit user reporting.

### Task 6: Verify, publish, and verify production

**Files:**
- Modify: `docs/qa/adversarial-persona-ledger.md`
- Verify: local worktree, GitHub branch/PR, and `https://agrefining.vercel.app/`

**Interfaces:**
- Consumes: a ledger with no blocking open findings.
- Produces: an auditable release decision, source commit, deployment identity, and production evidence.

- [ ] **Step 1: Run the fresh local release gate**

Run:

```bash
npm run verify
git diff --check
git status --short --branch
```

Expected: all checks pass and only intentional audit/fix files are changed.

- [ ] **Step 2: Publish through the existing GitHub and Vercel path**

Push a reviewed branch, merge the resulting pull request, and wait for the production deployment tied to that source commit to reach `READY`.

- [ ] **Step 3: Run production smoke and browser checks**

Verify representative core, material, industry, location, Spanish, privacy, contact, 404, and stylesheet URLs; validate 320px and desktop layout, keyboard navigation, form error recovery, console errors, broken media, and horizontal overflow.

- [ ] **Step 4: Record the final release decision**

Mark every release-gate line `PASS` or identify the exact blocking dependency. Record the final GitHub commit and Vercel deployment URL. Keep the external `agrefining.com` domain cutover separate unless domain authority becomes available.
