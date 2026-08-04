# AG Refining Adversarial Persona QA Loop

## Purpose

Stress-test every generated AG Refining page through independent accessibility, buyer-decision, and technical-resilience perspectives. Findings must be reproducible, tied to an observable user consequence, fixed test-first, and independently regraded. The loop is successful when the objective release gate is clean, not when every reviewer has identical aesthetic taste.

## Scope

The audit covers all 39 generated HTML documents: the 38 URLs in `dist/sitemap.xml` plus `dist/404.html`. It tests the local production build and, at the final gate, `https://agrefining.vercel.app/`. The disconnected `agrefining.com` DNS/Vercel domain is an external release dependency and is reported separately from frontend quality.

## Behavioral-risk matrix

The matrix models needs and contexts, not medical diagnoses or deterministic personality types.

### Perception and access

- low vision, 200% zoom, and narrow reflow;
- common color-vision deficiencies and monochrome state recognition;
- glare, low-contrast displays, brightness sensitivity, and high-contrast expectations;
- dyslexia, low literacy, scan-first reading, and cognitive fatigue;
- keyboard-only, switch-like navigation, limited fine-motor control, and coarse touch;
- screen-reader semantics, visible status messages, and reduced-motion preferences.

### Decision and trust

- skeptical evidence-seeker;
- risk-averse seller seeking process certainty;
- autonomy-seeking seller who wants control before contact;
- prestige-sensitive commercial buyer expecting precise presentation;
- price-sensitive seller looking for value and qualification language;
- urgency-driven mobile visitor seeking immediate contact;
- privacy-conscious medical or industrial operator;
- expert procurement or facility operator scanning for operational fit;
- novice household or estate seller unfamiliar with refining language;
- Spanish-first visitor;
- returning visitor looking for a known route or contact method.

### Device and failure context

- 320px, 390px, 768px, 1024px, and 1440px viewports;
- keyboard navigation and coarse-pointer target sizing;
- JavaScript unavailable or optional behavior failing;
- reduced motion;
- slow or failed below-fold media;
- form empty, invalid, loading, delivery failure, and recovery states;
- direct deep links, 404 recovery, and canonical route behavior.

## Route inventory

### Core and utility

`/`, `/accepted-materials`, `/industries`, `/service-areas`, `/how-it-works`, `/about`, `/contact`, `/espanol`, `/privacy`, and `/404.html`.

### Material and service

`/scrap-silver-jewelry`, `/industrial-x-ray-silver-recycling`, `/sell-silver-coins-houston`, `/silver-flake-buyer-houston`, `/laboratory-silver-buyer-houston`, `/silver-solder-buyer-houston`, `/silver-plated-materials-buyer-houston`, `/silver-oxide-watch-battery-recycling-houston`, `/medical-x-ray-recycling`, `/scrap-silver-buyer-houston`, `/dental-scrap-buyer-houston`, `/x-ray-recycling-services-houston`, `/industrial-silver-scrap`, `/sell-silver-bars-houston`, `/silver-flatware-buyer-houston`, and `/jewelry-store-silver-recycling-houston`.

### Industry

`/hospital-silver-recycling`, `/dental-lab-silver-recycling`, `/oil-gas-silver-recovery`, `/manufacturing-silver-recovery`, `/university-silver-recycling`, and `/electronics-silver-recovery`.

### Location

`/houston-silver-buyer`, `/silver-buyer-pearland`, `/silver-buyer-pasadena`, `/silver-buyer-sugar-land`, `/silver-buyer-katy`, `/silver-buyer-the-woodlands`, and `/silver-buyer-conroe`.

## Finding contract

Every accepted finding records:

- a stable ID and audit lens;
- exact route or shared component;
- persona/context and viewport;
- severity: Critical, High, Medium, or Low;
- deterministic reproduction steps;
- observed evidence and expected behavior;
- affected source and regression-test location;
- fix owner, grader, round, and status.

Critical means the primary journey is unusable, inaccessible, deceptive, or loses leads. High means a major persona cannot complete or understand the journey. Medium means a reproducible obstacle causes confusion, friction, or material visual inconsistency. Low means polish with no material task failure. Taste-only comments without evidence remain observations and cannot block release.

## Agent roles

1. The perceptual-accessibility auditor reviews all documents for semantic, contrast, zoom, keyboard, motion, error-state, and reading-order risks.
2. The trust-conversion auditor reviews all documents against the buyer-decision matrix, page contract, claim discipline, CTA consistency, language clarity, and anti-template rubric.
3. The responsive-resilience auditor reviews all documents for layout, asset, no-JavaScript, route, form, performance, metadata, and live-production risks.
4. Fix agents receive only normalized, approved findings and must write a failing regression check before changing production code.
5. Grader agents are fresh reviewers who did not implement the fix. They rerun the exact reproduction plus adjacent regression coverage and grade `PASS`, `PASS WITH LOW OBSERVATION`, or `FAIL`.

## Iteration and release gate

- Run three audit agents concurrently, then normalize duplicates before fixes.
- Do not run agents that edit the same shared files concurrently.
- Each production fix follows red, green, full verification, then independent grade.
- A failed grade creates a new bounded fix task using the grader's evidence.
- Stop after at most five fix-and-grade rounds for any finding; an unresolved item at the cap is reported explicitly rather than hidden.
- Release requires zero Critical or High findings, zero reproducible Medium findings on the homepage/contact/call/pickup paths, `npm run verify` passing, no broken routes or local assets, no horizontal overflow at required widths, keyboard and form recovery paths passing, and fresh grader approval.
- Low observations may remain only when documented with rationale and no conflict with the frontend quality rubric.
