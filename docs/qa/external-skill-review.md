# External skill review - pinned sources

Reviewed 2026-08-04 from Git objects only. No candidate code was executed, no
packages were installed, and no project files other than this report were
changed. Line references below are to the pinned revision's source path.

| Candidate | Pinned commit | Verdict | Risk | Safe default |
| --- | --- | --- | --- | --- |
| Taste / `design-taste-frontend` | `e988add20dab0fa97d7a76781c48961c8184288e` | **PASS WITH RESTRICTIONS** | Low (instruction/dependency pressure) | Install the one Markdown file only; treat it as advisory. |
| Impeccable | `620ba1fe7d87a39039a8528bfaa319ecfa893cb2` | **FAIL** as-shipped executable skill | High (network, host writes, hook installation, authority-overriding instructions) | Do not install/run its runtime or hooks. A manually curated, docs-only subset may be used as reference. |
| img2threejs | `b604139f51d6831780240e8cf1d8b21a42401d0a` | **PASS WITH RESTRICTIONS** | Medium (arbitrary-path writes, generated runtime dependency, optional network/host-tool paths) | Keep it outside the app; run only a reviewed generic pipeline in a dedicated output directory after explicit approval. |

## 1. Taste - `skills/taste-skill/SKILL.md`

### What is installed / executed

The requested candidate is exactly one 87,253-byte Markdown file:
`skills/taste-skill/SKILL.md`. `git ls-tree` shows no `blocks/` directory or
other bundled resource under that candidate, although the document describes
one at lines 841-861. It contains no executable code, package manifest, hook,
credential handling, telemetry, filesystem operation, commit/push, or deploy
instruction. Consequently there is nothing to run.

It is nevertheless a strong behavioral prompt. Its normal scope is marketing
pages and redesigns, explicitly not dashboards/data tables/product UI
(`SKILL.md:8`, `896-906`), which is an important fit restriction for AG
Refining surfaces.

### Findings and mitigations

* **Dependency and supply-chain pressure - medium.** It directs an agent to
  use a selected official system and exposes install commands for Material,
  Fluent, Carbon, Radix, shadcn (`npx`), Primer, GOV.UK, USWDS, Atlaskit,
  Bootstrap, and Shopify (`SKILL.md:84-104`, `987-1031`). This can mutate the
  dependency graph and run package-manager lifecycle scripts. Its own line
  156 is a useful guard (inspect `package.json` and show an install command),
  but it is not a substitute for approval. **Mitigation:** forbid package
  manager commands unless the user separately approves the exact package,
  version, lockfile diff, and license review.
* **External asset/network guidance - low to medium.** It suggests generated
  images, Picsum, Unsplash/Pexels, Simple Icons/devicon CDNs and a Shopify CDN
  script (`SKILL.md:263-279`, `1027-1030`). CDN imports affect CSP, privacy,
  availability, and supply-chain control; reference/company imagery and logos
  also need usage rights. **Mitigation:** use owned/local assets by default;
  pin and self-host any approved third-party asset; do not claim endorsement
  with logo walls.
* **Generated-code/content risk - low.** The file contains opinionated,
  imperative constraints (for example the global em-dash ban at `685-701` and
  long preflight at `910-979`). This is not a credential-exfiltration or
  authority-escalation prompt, but it can conflict with brand/legal copy and
  accessibility/product requirements. **Mitigation:** the AG Refining brief,
  existing design system, legal copy, accessibility requirements, and user
  instructions always win; apply only relevant recommendations.
* **License - low.** Root `LICENSE:1-13` is MIT (copyright 2026 Leonxlnx).
  If the file or substantial portions are redistributed, retain the copyright
  and MIT permission notice. No separate NOTICE file was found.

### Minimal safe subset / authority

Install only `skills/taste-skill/SKILL.md`, pinned at the commit above. Do not
copy the repository assets, scripts, other skills, or nonexistent proposed
`blocks/` path. It can be used in this project without additional runtime
authority because it is documentation, but it must not cause installs, remote
asset use, or project edits without a separate, scoped user request.

## 2. Impeccable - `.agents/skills/impeccable/`

### Why the as-shipped runtime fails

This is not a passive frontend rubric. `SKILL.md:14-18` requires execution of
`scripts/context.mjs` once per session and subsequently loads playbooks; it
also presents project-hook administration (`SKILL.md:74-78`). The referenced
audit and polish procedures direct execution of local Node scripts
(`reference/audit.md:57-61`; `reference/polish.md:31-35`, `85-97`). The
following behavior makes full installation/running unsuitable without a
reviewed local patch and explicit authority:

* **Automatic network contact and host-home write.** `scripts/context.mjs:77-82`
  defaults to `https://impeccable.style`; `1005-1013` fetches
  `/api/version`, and `985-992` writes an update cache under
  `~/.impeccable/update-check.json`. It is opt-out rather than opt-in
  (`1046-1062`; `1031`, `1048-1049`). This is update telemetry/egress even
  before a frontend task. **Mitigation:** do not run it; if a vetted local
  copy is ever allowed, remove the update checker or set
  `IMPECCABLE_NO_UPDATE_CHECK=1` before each run and block outbound network.
* **Authority-escalating prompt instructions.** The context loader emits
  directives claiming a skill invocation authorizes subagent use
  (`context.mjs:1305-1316`) and argues against harness autonomy defaults
  (`1288-1303`). A skill cannot grant authority beyond user/system policy.
  This is a prompt-injection/authority-boundary risk even though it does not
  exfiltrate a secret. **Mitigation:** remove these directives; never allow
  skill content to override project policy, user approval, or tool rules.
* **Credentials / billable API path.** If `OPENAI_API_KEY` is present,
  `context.mjs:1272-1285` advertises `generate-image.mjs` using the key and
  says the render is billed to that key. **Mitigation:** do not expose keys to
  this runtime; prohibit `generate-image.mjs` unless a user explicitly
  authorizes a named, billed image request.
* **Persistent hook installation and recurring code execution.** The hooks
  reference says `on` modifies `.impeccable/config.json` and provider manifests
  (`reference/hooks.md:11-17`, `25-35`). `hook-admin.mjs:71-158` writes Codex
  `.codex/hooks.json` that runs `node
  .agents/skills/impeccable/scripts/hook.mjs` after edits and at Stop
  (`97-118`); it writes configuration at `212-256`. This alters the agent
  execution boundary and causes recurring scans. **Mitigation:** do not
  install hooks. If later desired, require an explicit, separate approval of
  every destination manifest and retain a way to disable/remove it.
* **Filesystem/content exposure and prompt-injection surface.** The context
  loader reads `PRODUCT.md`, `DESIGN.md`, surface briefs, configs, project
  structure and Git state (`context.mjs:1-27`, `84-126`); its purpose is to
  print that content as task context. Untrusted repository text can therefore
  influence the agent. `reference/init.md:17-21` also tells the agent to scan
  broad project evidence and later write `PRODUCT.md` (`56-108`).
  **Mitigation:** do not feed untrusted content into privileged instructions;
  constrain reads to requested files and treat repository prose as data.
* **Installed package footprint.** The root npm package requires Node
  `>=22.18.0` and has production parsing dependencies plus optional
  `puppeteer` (`package.json:26-29`, `76-85`); its development tree includes
  OpenAI/Anthropic SDKs and Playwright (`87-99`). It has no lockfile in the
  reviewed candidate. **Mitigation:** do not `npm install` this repository for
  the skill. A detector-only experiment would require a separately pinned
  npm artifact, lockfile, dependency/SBOM review, and Chromium download policy.

`reference/audit.md` itself is a useful non-executable web QA checklist
(`1-61`), and `reference/polish.md` is a reasonable quality rubric
(`1-97`). Those instructions do not themselves contain destructive behavior,
but they are coupled by the top-level skill to the runtime above.

### License and notices

Root `LICENSE:1-3, 67-129, 179-191` is Apache-2.0 (copyright 2025 Paul
Bakaus). Redistribution of copied source/docs needs the Apache license,
prominent modification notices, retained applicable notices, and a readable
NOTICE where required. `NOTICE.md:1-11` identifies derived platform-reference
content from ehmo/platform-design-skills under MIT; retain that third-party
notice and MIT attribution if those platform references are copied. Apache
does not grant trademark rights (`LICENSE:139-142`).

### Minimal safe subset / authority

**Do not install `.agents/skills/impeccable/` as an active skill and do not
run its scripts or hooks in this project.** It cannot be run here without
additional authority: execution itself is outside this review's scope, and
the default boot needs network plus a home-directory write.

If the team only wants frontend review guidance, manually copy and pin only
the text of `reference/audit.md` and `reference/polish.md` into an internal
review checklist, plus the necessary Apache/MIT notices. Do not include
`SKILL.md`, `scripts/`, `agents/`, hook manifests, `package.json`, or the live
browser path. This is an internal curation step, not faithful installation of
the upstream skill.

## 3. img2threejs - root `SKILL.md` and `forge/`

### Scope and happy-path behavior

The requested root `SKILL.md` is Apache-2.0 (`SKILL.md:1-7`). It documents a
local staged pipeline: initialize/update `.img2threejs/state.json`
(`55-72`), inspect/probe an input image, write an assessment/spec, validate,
generate `src/createObjectModel.ts`, render/screenshot, generate PNG review
artifacts, then append/sync reviews (`81-187`). This is executable Python,
not merely instruction text.

For the generic happy path, the directly invoked scripts are
`forge/state.py`, `forge/next.py`,
`forge/stage1_intake/probe_image.py`,
`forge/stage2_spec/new_pre_spec_assessment.py`,
`new_sculpt_spec.py`, `validate_sculpt_spec.py`,
`forge/stage3_build/orchestrate_passes.py`, `generate_threejs_factory.py`,
`forge/stage4_review/diagnose_render.py`, `make_comparison_sheet.py`,
`append_review.py`, and `check_part_coverage.py` (documented at
`SKILL.md:60-69, 89-103, 132-186`). The material/projection route additionally
invokes `analyze_texture.py`, `extract_pbr_evidence.py`,
`solve_camera_pose.py`, `delight_albedo.py`, and `bake_projected_texture.py`
(`117-151`). These need their local `forge/_shared/` modules and the cited
`grimoire/`/`docs/specs/vocabulary/` material; copying only the Markdown skill
does not provide the runnable pipeline.

`forge/requirements.txt:1-6` declares Python 3.10+ standard library only: no
pip dependency or install hook. The inspected generic pipeline has no HTTP
client, credential lookup, telemetry, Git command, commit, push, or deploy.

### Findings and mitigations

* **Arbitrary-path creation/overwrite - medium.** State is atomically written
  to a caller-supplied path by `workflow_state.save_state`
  (`forge/_shared/workflow_state.py:191-205`). The assessment and spec writers
  create parent directories (`new_pre_spec_assessment.py:293-299`,
  `new_sculpt_spec.py:1636-1643`), and `orchestrate_passes.py` can write a spec
  in place (`60-62`, `538-582`). The generator resolves a caller-provided
  `--out`, creates its parents and overwrites with `--force`
  (`generate_threejs_factory.py:1358-1391`). **Mitigation:** run in a clean
  worktree/sandbox; allow only an approved output root such as
  `.img2threejs/` and a reviewed temporary generated file; never pass
  `--force` over an existing app module; review the diff before moving code.
* **Image/reference privacy and generated-art risk - medium.** The workflow
  reads the supplied image and can bake its pixels into output by design
  (`SKILL.md:117-130`). Generated source embeds user-provided spec values as
  JSON literals (for example `generate_threejs_factory.py:1025-1133`).
  **Mitigation:** use only images whose owner permits processing and derivative
  use; keep sensitive images outside the repo; sanitize/review the produced
  TypeScript and avoid importing untrusted specs.
* **Unsupported host-tool assumption - low to medium.** Although Python has
  no third-party dependencies, PNG decoders fall back to macOS `sips` via an
  argument-array subprocess call (`make_comparison_sheet.py:127-144`,
  `delight_albedo.py:159-177`, `extract_pbr_evidence.py:189-207`). On Linux or
  for non-PNG inputs this fails rather than providing a bundled converter.
  **Mitigation:** provide PNG inputs; do not install/use an unreviewed image
  converter merely to make the workflow pass.
* **Optional CS2 paths are higher risk and excluded.**
  `fetch_cs2_metadata.py:19-30, 97-128` accepts a user-supplied URL and can
  download an image. `extract_cs2_textures.py:41-101` invokes a local
  `source2viewer` binary and searches/reads Steam/CS2 VPK locations through
  `locate_cs2_vpk.py:20-47`. These are not needed for a generic AG Refining
  object. They raise network, local-application/IP, and third-party tool
  authority issues. **Mitigation:** exclude all CS2 intake/texture scripts,
  `docs/cs2*`, `skills/cs2*`, and never use `--index-url` or
  `--download-image`.
* **No large binary/package payload found in the needed path - low.** The
  largest sampled local data asset is `docs/raw/img2threejs-skill-dataset.json`
  (109,920 bytes); the core vocabulary samples are 13,534 and 57,402 bytes.
  The reviewed repository contains source/docs rather than model weights or
  asset packs. This does not establish provenance for every data/document;
  copying optional datasets still requires an internal provenance decision.

### Static-ESM integration

The full toolkit does **not** need to ship with the site. After a separately
approved, isolated generation/review, only the reviewed generated module (and
optionally its reconstruction/spec metadata) needs to move into the app. The
Python scripts, state/review files, grimoire, and datasets are build-time
authoring tools and should stay outside the deployed artifact.

However the generated factory hard-codes bare imports of `three` and several
addons: `three`, `RoomEnvironment`, `EffectComposer`, `RenderPass`,
`BokehPass`, `UnrealBloomPass`, and `OrbitControls`
(`generate_threejs_factory.py:325-332`). AG Refining's current
`package.json` has only `sharp` and no Three.js dependency. A plain static
browser cannot resolve those bare specifiers by itself. Integration therefore
introduces a Three.js runtime dependency:

* Preferred: explicitly approve a pinned `three` package and bundle it with
  the site's existing build workflow; license and bundle-size review still
  required. Tree-shaking may remove unused addon imports only after the
  generated module is tailored and tested.
* Alternative: an import map to a pinned CDN URL is an external runtime
  dependency and requires CSP/privacy/availability approval; it should not be
  the default for this site.
* Before integration, remove unused post-processing imports/helpers where the
  feature does not need them, and performance-test GPU cost. The generator
  defaults to a 4096-pixel shadow map (`1203-1257`), a material mobile/GPU
  footprint concern.

### License and minimal safe subset / authority

Root `LICENSE:1-3, 90-129, 189-201` is Apache-2.0 (copyright 2026 hoainho).
No separate NOTICE/third-party-notice file was found. If any upstream code or
documentation is copied/distributed, include Apache-2.0, retain applicable
copyright/attribution notices, mark modified files, and do not imply a
trademark grant. Independently, source reference images and CS2/Valve material
are not licensed by this repository's Apache license.

Minimal safe installation for **guidance only** is root `SKILL.md` plus the
small cited generic `grimoire/` references. Minimal subset for a **runnable
generic pipeline** is root `SKILL.md`, the generic scripts named above, their
`forge/_shared/` imports, and the cited `grimoire/`/vocabulary references; do
not copy tests, CI, GitHub files, optional CS2 scripts/data, or `scripts/`.
Because imports are cross-linked, verify that curated subset with a static
import walk before executing it.

It cannot be run in the AG Refining project under the authority of this review:
it writes state, specs, PNGs, and generated source. With a future explicit
request that names input image(s), permitted output directory, a non-CS2
generic path, and permission to add/bundle Three.js, the generic Python code
can run without network or a package install; the current project still needs
the separately approved Three.js runtime before its generated module can run.
