# AG Refining deployment and release preflight

Date: 2026-08-04
Repository: `whoisjaso/agrefining`
Local checkout: `/workspace/scratch/bfc565b217a9/agrefining`
Inspection mode: read-only except for this report

## Decision

**NOT GO at the time of inspection.** The existing production deployment is healthy, but the in-progress release is not yet eligible for commit, merge, or production deployment.

The immediate blockers are:

1. The QA ledger still records three open High findings: `AGQA-FORM-001`, `AGQA-NAV-001`, and `AGQA-I18N-001`. `AGQA-TOUCH-001` is also open at Low severity.
2. The shared form, navigation, Spanish, and touch repair is in progress. Its focused tests exist, but the implementation and fresh independent grade were not complete at this snapshot.
3. The 3D work has passed its strict object specification, but `docs/qa/3d-reconstruction-report.md` explicitly says the generated factory is a review-only blockout. Production integration, render capture, multi-angle review, reduced-motion and fallback checks, and visual grading remain open.
4. The worktree is dirty and contains a large intentional set of untracked audit, test, image, and reconstruction artifacts. No final release commit exists.
5. The current local branch cannot safely be reused for publication. Its same-named remote branch already fed merged PR #4 and now has different history. A normal push is expected to reject; a force-push would be unsafe.
6. The local `origin/main` reference is stale. Local `origin/main` is `66e9b37`, while GitHub and current Vercel production identify GitHub `main` as squash commit `0d0f808`.
7. No final repository-wide verification, final browser matrix, or fresh grader approval has been run over the combined form, navigation, i18n, touch, and 3D implementation.

The external `agrefining.com` domain is a separate launch dependency. It does not block publishing to `https://agrefining.vercel.app/`, but it does block treating the vanity domain and canonical SEO surface as fully launched.

## Evidence snapshot

### Local Git state

- Branch: `redesign/silver-atelier-all-pages`
- Local HEAD: `83595ff22677b2d5868c8ea45073652c54159ee8`
- Local HEAD tree: `fda8977da3e27659073beb6f2a9a504292b3c722`
- Local `origin/main`: `66e9b374e1cf4eafbd2571e8d800fef85758a7d0`
- Branch upstream: none configured
- Local branch distance from the stale `origin/main`: 10 commits ahead, 0 behind
- Remote URL: `https://github.com/whoisjaso/agrefining.git`
- `git diff --check`: clean at the inspection snapshot
- GitHub CLI: not installed
- Vercel CLI: not installed

The inspected worktree showed modified `scripts/build.mjs` and `scripts/verify.mjs`, plus untracked `.img2threejs/`, `docs/qa/`, the new QA spec and plan, and `tests/`. These are active shared-workspace files and must be re-inventoried after every agent has stopped writing.

### GitHub connector state

The GitHub connector confirmed:

- Repository: `whoisjaso/agrefining`
- Visibility: public
- Default branch: `main`
- Connector permission: admin, maintain, pull, push, and triage are all available
- PR #4: `Redesign all pages with the Silver Atelier system`
- PR #4 state: closed and merged
- PR #4 base: `main` at `66e9b37`
- PR #4 remote head: `redesign/silver-atelier-all-pages` at `f670b18`
- PR #4 squash merge commit: `0d0f80859899b0da2e290cc1eed917ac0b52b59d`
- Remote `main` and the old redesign branch are now diverged: the redesign branch is four commits ahead of their old merge base and one commit behind current `main`
- GitHub commit status for `0d0f808`: Vercel `success`

The connector could not compare local `83595ff` to the remote branch because that local commit is not addressable through the GitHub repository API. This reinforces that the current local history must not be assumed to be a fast-forward of the remote branch.

### Vercel production state

- Team ID: `team_aoVY9tdFhWyUFJTllWavdKre`
- Team slug: `whoisjasos-projects`
- Project ID: `prj_rJyiwRLmv82XacSIod4zMx63QnzJ`
- Project name: `agrefining`
- Vercel Node version: `24.x`
- Current production deployment: `dpl_6AEpsnooYHs4PmWYUtmJoujVNgPA`
- Current deployment URL: `agrefining-h3i3jg4fo-whoisjasos-projects.vercel.app`
- Current source commit: `0d0f80859899b0da2e290cc1eed917ac0b52b59d`
- Current state: `READY`
- Current target: `production`
- Current source: Git
- Current aliases:
  - `agrefining.vercel.app`
  - `agrefining-whoisjasos-projects.vercel.app`
  - `agrefining-git-main-whoisjasos-projects.vercel.app`
- Alias error: none
- Runtime error clusters in the preceding 24 hours: none reported

The current deployment is marked as a rollback candidate. Preserve its ID and source commit in the final release record before any merge.

## Build and hosting contract

### Repository configuration

`vercel.json` defines:

- build command: `npm run build`
- output directory: `dist`
- clean URLs enabled
- trailing slashes disabled
- security headers for content type sniffing, referrer policy, and browser permissions
- 13 legacy-route redirects

No `.github/workflows` files were found, so there is no repository-hosted CI gate beyond Vercel status. Local tests and the generated-output verifier are therefore mandatory before merge.

No `.vercel/project.json` exists in the checkout. The Vercel connector can address the known team and project IDs directly, but a local Vercel CLI workflow would first need an authenticated link or explicit project and organization IDs.

### Package and runtime contract

- Local Node: `v24.14.0`
- Vercel Node: `24.x`
- Package manager: npm with lockfile version 3
- Existing scripts:
  - `npm run assets`
  - `npm run build`
  - `npm run check`
  - `npm run verify`
- `npm run verify` rebuilds, runs the repository checks, and verifies generated output.
- Existing verification promises 39 HTML files and 38 indexed routes.

Use `npm ci`, not `npm install`, in a clean validation environment so `package-lock.json` is authoritative.

### Production-asset bootstrap dependency

`npm run build` first runs `scripts/fetch-assets.mjs`. Twelve required images and fonts are intentionally gitignored and are restored from `https://agrefining.vercel.app/assets` with pinned SHA-256 checks when absent.

This means a clean Vercel build depends on the current production alias remaining reachable until the new artifact finishes building. Do not remove, repoint, or break `agrefining.vercel.app` before the new deployment reaches `READY`. Any new 3D runtime asset must either be committed, generated during the build, or added to a source that already exists before the first clean deployment. It must not be added to the production bootstrap manifest while absent from current production.

### Lead delivery dependency

The README requires `RESEND_API_KEY`; `AG_LEAD_FROM_EMAIL` and `AG_LEAD_TO_EMAIL` are optional. It also requires `agrefining.com` to remain verified in Resend. The repository and available Vercel project metadata do not expose the current environment-variable values or Resend verification status.

This is not automatically a frontend deploy blocker because the planned form repair provides an accessible delivery fallback. It is still an operational verification gap. Do not claim live email delivery has been proven unless the Vercel environment and Resend domain are checked through authorized project settings or a separately approved non-production delivery test. Never submit a real production lead merely to smoke-test the deploy.

## Exact safe publication sequence

### Phase 1: Freeze and qualify the release

Do not start Git publication until all implementers and graders have finished and no agent is editing shared files.

1. Re-read the final QA ledger and all new grade reports.
2. Require zero Critical and zero High findings.
3. Require zero reproducible Medium findings on the homepage, contact, call, or pickup paths.
4. Require a fresh independent grade for the form, navigation, i18n, touch, and 3D integration batches.
5. Confirm the 3D model has a static first-paint fallback, local pinned Three.js runtime, lazy enhancement, reduced-motion behavior, coarse-pointer behavior, offscreen and hidden-page pause, context-loss recovery, and a passing visual comparison.
6. Review every untracked file. Decide explicitly whether `.img2threejs/` authoring outputs are release provenance to commit or local authoring scratch to omit. They must never be copied into `dist` unless a specific optimized runtime asset is required.

Run the release gate from the repository root:

```bash
npm ci
node --test tests/leads-response.test.mjs
npm run build
node --test tests/generated-interaction-contract.test.mjs
npm run verify
git diff --check
git status --short --branch
```

If additional 3D tests are introduced, run them before `npm run verify` and list them in the release record. The final `npm run verify` output must say `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

### Phase 2: Preserve the completed work and reconcile stale history

Do not push `redesign/silver-atelier-all-pages`, do not reopen PR #4, and do not force-push any branch.

1. From the current local branch, stage only the reviewed release manifest. Never use `git add -A` until every untracked artifact has been classified.
2. Commit the completed work locally. Record that commit as `WORK_COMMIT`.
3. Fetch current remote state:

```bash
git fetch --prune origin
git rev-parse origin/main
git rev-parse 83595ff22677b2d5868c8ea45073652c54159ee8^{tree}
git rev-parse origin/main^{tree}
git diff --stat 83595ff22677b2d5868c8ea45073652c54159ee8 origin/main
```

4. Require `origin/main` to agree with the GitHub connector's current default-branch head. At this snapshot that head is `0d0f808`, but use the newly fetched value if another release has landed.
5. If the baseline trees are identical, create a fresh release branch from `origin/main` and cherry-pick `WORK_COMMIT`:

```bash
git switch -c agent/ag-refining-luxury-release origin/main
git cherry-pick WORK_COMMIT
```

6. If the baseline trees differ, stop. Inspect and reconcile the exact diff on a new branch from `origin/main`, then rerun the complete release gate. Do not assume the old local branch can be rebased or forced onto GitHub without review.
7. After the cherry-pick, rerun `npm run verify`, all focused tests, and `git diff --check`.
8. Push only the fresh branch:

```bash
git push -u origin agent/ag-refining-luxury-release
```

The local push uses Git credentials already configured for the remote. `gh` is absent, so do not invoke the `github:yeet` CLI workflow. Use the GitHub connector for the PR and merge steps below.

### Phase 3: Create and validate the GitHub PR through the connector

1. Compare the pushed branch to `main`:

```text
github_compare_commits({
  repo_full_name: "whoisjaso/agrefining",
  base: "main",
  head: "agent/ag-refining-luxury-release"
})
```

Require the expected ahead count and the reviewed file manifest only.

2. Create a draft PR so the exact remote artifact receives a Vercel preview before merge:

```text
github_create_pull_request({
  repository_full_name: "whoisjaso/agrefining",
  base: "main",
  head: "agent/ag-refining-luxury-release",
  title: "Complete AG Refining luxury frontend release",
  body: "<summary, safety fixes, 3D integration, tests, graders, and deployment notes>",
  draft: true,
  maintainer_can_modify: true
})
```

3. Record the returned PR number and exact head SHA.
4. Poll GitHub status for that head SHA:

```text
github_get_commit_combined_status({
  repo_full_name: "whoisjaso/agrefining",
  commit_sha: "<exact PR head SHA>"
})
```

Require Vercel `success`. Because there is no GitHub Actions workflow, this status does not replace the local QA gate.

5. Locate the Vercel preview whose metadata has the same branch and commit SHA. Verify the preview before making the PR ready.
6. Re-fetch PR metadata with `github_get_pr_info`. Require the same head SHA, `base: main`, mergeable state, and no unexpected updates.
7. Mark the PR ready:

```text
github_mark_pull_request_ready_for_review({
  repository_full_name: "whoisjaso/agrefining",
  pr_number: <PR number>
})
```

8. Merge with the expected-head guard:

```text
github_merge_pull_request({
  repository_full_name: "whoisjaso/agrefining",
  pr_number: <PR number>,
  expected_head_sha: "<exact reviewed head SHA>",
  merge_method: "squash",
  commit_title: "Complete AG Refining luxury frontend release",
  commit_message: "<validated release summary>"
})
```

Require `merged: true` and record the returned merge SHA. If GitHub rejects squash because repository policy changed, re-read repository and PR metadata and choose an allowed method deliberately. Do not retry blindly.

### Phase 4: Let Git integration create production

The existing production deployment is Git-sourced from `main`, and the current Vercel status confirms this integration works. Prefer that provenance over a direct workspace deploy.

1. After merge, poll:

```text
vercel_list_deployments({
  teamId: "team_aoVY9tdFhWyUFJTllWavdKre",
  projectId: "prj_rJyiwRLmv82XacSIod4zMx63QnzJ"
})
```

2. Select only a deployment whose metadata says:
   - `githubCommitRef: main`
   - `githubCommitSha: <recorded merge SHA>`
   - `target: production`
3. Poll that deployment by ID:

```text
vercel_get_deployment({
  teamId: "team_aoVY9tdFhWyUFJTllWavdKre",
  idOrUrl: "<new deployment ID>"
})
```

4. Require all of:
   - `state` and `readyState` are `READY`
   - `target` is `production`
   - `source` is `git`
   - `aliasError` is null
   - the alias list contains `agrefining.vercel.app`
   - commit metadata matches the recorded merge SHA
5. If the deployment is `ERROR`, fetch the failing lines and stop:

```text
vercel_get_deployment_build_logs({
  teamId: "team_aoVY9tdFhWyUFJTllWavdKre",
  idOrUrl: "<new deployment ID>",
  direction: "tail",
  errorsOnly: true,
  limit: 100
})
```

Do not use `vercel_deploy_to_vercel({})` as the first production path. Its exposed connector schema does not accept an explicit target project, production flag, or source commit, so it provides weaker provenance than the already working Git integration. It is a fallback only after the workspace is clean, on the merged commit, and the controller has confirmed the connector resolves the correct project and production target.

## Preview and post-deploy smoke matrix

Run the same matrix first on the PR preview and then on `https://agrefining.vercel.app/`. Do not submit a valid production lead.

### Route coverage

| Family | Route | Required evidence |
|---|---|---|
| Homepage | `/` | Correct title and H1, cream and blue shell, fallback image paints immediately, 3D enhances without replacing the CTA, no broken media |
| Core taxonomy | `/accepted-materials` | Header, footer, all local links, no overflow |
| Material | `/silver-flake-buyer-houston` | Deep-link render, canonical, image, CTA prefill |
| Industry | `/hospital-silver-recycling` | Protected-record guardrail precedes CTA |
| Location | `/silver-buyer-pearland` | Local content, canonical, no broken assets |
| Spanish | `/espanol` | Spanish shell and in-page form, Spanish validation and recovery, explicit English-destination notices |
| Contact | `/contact` | Native validation, enhanced invalid state, keyboard recovery, no raw JSON in native flow |
| Privacy | `/privacy` | Attribution disclosure matches submitted fields |
| 404 | `/definitely-not-a-route` | Custom 404, `noindex,follow`, working recovery links |
| Redirects | `/home`, `/contact-us`, one material legacy route | Correct final destination and permanent redirect behavior |
| Runtime assets | `/style.css`, `/site.js`, 3D module, local Three.js module, fallback image | HTTP success, correct MIME type, no CDN request |

### Viewport and interaction coverage

Use 320, 390, 768, 901, 1024, and 1440 CSS pixels.

- Confirm document `scrollWidth` never exceeds `clientWidth`.
- At 320, 390, and 768, test the mobile menu with keyboard, pointer, JavaScript disabled, and `/site.js` blocked.
- With enhanced navigation closed, no hidden nav link may receive focus.
- With it open, focus enters the menu, loops correctly, Escape closes it, and focus returns to the toggle.
- At 901 and wider, resizing must clear mobile inert, hidden, tabindex, scrim, and body-lock state.
- Measure preferred-contact labels at 44 by 44 CSS pixels or larger under `pointer: coarse`.
- Test visible focus, skip link, landmark order, and all primary actions with keyboard only.
- Test `prefers-reduced-motion: reduce`; the 3D hero must remain static or use the fallback with no autonomous drift.
- Test coarse pointer, Save-Data, no WebGL, blocked Three.js, context loss, offscreen pause, and hidden-tab pause. In every failure mode the static image and CTA must remain available.
- Inspect browser console and network logs. Ignore only errors proven to come from the test harness or extension.

### Safe form and API coverage

- Submit the browser form empty with JavaScript enabled. Require linked field errors and no lead request.
- Submit the native form empty with JavaScript disabled. Require HTML 422 recovery with preserved safe context, not JSON.
- Send an invalid JSON fixture to `/api/leads`. Require the documented JSON 422 contract.
- Request the English and Spanish receipt URLs with no lead data in the query string. Require `noindex` receipt HTML.
- Check unsupported method and oversized or malformed input behavior with synthetic data.
- Exercise forced 502 and 503 only in the local stubbed Function test. Do not change production environment variables to provoke a failure.
- Never use a valid name, email, phone, material, location, and details combination against production.

## Runtime observability gate

Record the UTC release start time and inspect only the new deployment window:

```text
vercel_get_runtime_errors({
  teamId: "team_aoVY9tdFhWyUFJTllWavdKre",
  projectId: "prj_rJyiwRLmv82XacSIod4zMx63QnzJ",
  since: "<release UTC time>"
})

vercel_get_runtime_logs({
  teamId: "team_aoVY9tdFhWyUFJTllWavdKre",
  projectId: "prj_rJyiwRLmv82XacSIod4zMx63QnzJ",
  deploymentId: "<new deployment ID>",
  environment: "production",
  since: "<release UTC time>",
  group_by: "statusCode"
})
```

Require no new runtime error cluster attributable to the release and no unexplained 5xx response. Then fetch the production homepage and representative routes with `vercel_web_fetch_vercel_url` to prove the production alias, not only the immutable deployment URL, serves the new artifact.

## Rollback evidence and procedure

### Preserved recovery target

Before the release, preserve this known-good target:

- Deployment: `dpl_6AEpsnooYHs4PmWYUtmJoujVNgPA`
- Commit: `0d0f80859899b0da2e290cc1eed917ac0b52b59d`
- State: `READY`
- Target: production
- Alias error: none
- Runtime errors in the preceding 24 hours: none

### If the new build fails before READY

Do not promote or manually re-alias it. The existing production alias should remain on the current known-good deployment. Capture build logs, fix on a new branch, and repeat the preview-to-merge path.

### If the new build reaches READY but production smoke fails

The available Vercel connector exposes deploy, inspect, logs, and runtime-error tools, but no rollback or promote operation. The local Vercel CLI is also absent. Therefore, an instant automated rollback is not currently callable from this checkout.

Before merging, ensure one of these recovery authorities is available:

1. Preferred: an authorized Vercel dashboard operator rolls production back to `dpl_6AEpsnooYHs4PmWYUtmJoujVNgPA`, or an authenticated Vercel CLI runs the equivalent explicit rollback for the `whoisjasos-projects` scope.
2. Connector-only fallback: revert the release merge in Git, publish the revert through a guarded PR, merge it, and wait for the Git integration to create a new production deployment. This is slower, so it is not a substitute for an operator-ready Vercel rollback during the release window.

After rollback, repeat `vercel_get_deployment`, confirm `agrefining.vercel.app` resolves to the recovery artifact, rerun core smoke routes, and run the runtime error scan again. Record who initiated rollback, the failure evidence, recovery deployment ID, and recovery completion time.

## External and non-blocking gaps

### `agrefining.com`

The Vercel project currently lists only Vercel-owned domains. `agrefining.com` is absent even though generated canonicals and the sitemap use it and the Resend sender defaults to that domain.

- This does not block a verified release to `agrefining.vercel.app`.
- It does block declaring the vanity-domain launch, canonical SEO destination, and DNS cutover complete.
- Resolution requires external DNS/domain authority plus Vercel domain attachment and certificate verification.
- Resend verification for `agrefining.com` must remain a separate check; Vercel domain attachment does not prove email-domain verification.

### Rollgates Luxury font

The repository does not contain a licensed Rollgates Luxury webfont. The design contract deliberately uses local Manrope at a calibrated light display weight rather than downloading an unlicensed font or adding a remote font request. This is not a deployment blocker, but exact Rollgates typography remains dependent on the owner supplying a licensed webfont and web-use rights.

### Immediate release criteria

Production release becomes **GO** only when all of the following are recorded together:

- all blocking ledger findings closed by fresh graders;
- 3D production integration and visual/fallback grade passed;
- focused tests and `npm run verify` green on the exact release commit;
- clean reviewed file manifest and `git diff --check` green;
- fresh branch based on current GitHub `main`, with no force push;
- Vercel preview tied to the exact PR head SHA passes the smoke matrix;
- guarded GitHub merge returns a merge SHA;
- Vercel production deployment tied to that merge SHA reaches `READY` with the production alias and no alias error;
- post-deploy smoke and runtime error scans pass;
- the known-good rollback deployment and an executable rollback authority are recorded;
- `agrefining.com` remains explicitly reported as external until DNS/domain cutover is verified.
