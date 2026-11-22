# Post-review status update preserved as transcript

The native exact-revision gate rejected these coordinator status-only updates after independent Phase2 approval. Their full text is retained here; current source documents are restored to reviewed head 3bf0ff4 before gate resumption. No runtime change, altered attestation or cap bypass.


## CHANGELOG.md

# Changelog

## 2026-10-09 — GH-5 local MVP marathon preparation

- Rebased a fresh full clone onto the operator-confirmed origin/main integration branch (a8e7e574; no development branch). Promoted GH-5 with the canonical roadmap writer, registered its marathon and LocalMVP release, and prepared five strictly sequential phase briefs/YAML. Main checkout is untouched.
- Applied ponytail: reuse ESM/Python modules, existing HiQS caller and four canaries; no provider client, framework, service/queue/editor or extra CI. Preserved Later work and human/provider acceptance as pending. Codex implementation-plan QA is Approved/attested; fixed its concrete contact-sheet migration omission. All eleven selected display-asset digests match.
- Reversibility: Easy — plan/ledger/receipts only, no runtime change or paid generation. Fresh baseline pnpm test passed four canaries in 8.2s, 216 geometry boxes and 12 byte-identical artifacts. Planner write/check exited 0 with one wave/no held items/no drift; added the required pending wave QA overlay after checking the generated core. Direct preflight/full YAML admission are recorded separately; execution completion is not claimed.

## 2026-10-09 — GH-5 local MVP Phase 2

- Extended shared render tools (`tools/request.mjs`, `tools/render.mjs`) to dynamically load recipes and support adaptive text fitting (shrinks overflowing text by 10% at most 10 total attempts down to 12px, tracking bounds natively).
- Promoted the Solar System scene to `tools/recipes/solar-system.mjs` and integrated its display assets natively via the shared pipeline.
- Refactored `examples/2026-10-08-solar-system/render-diagram.mjs` and `contact-sheet.mjs` to be thin callers of the shared pipeline (publishing to owned tools/output roots via the shared atomic manifest), allowing the ad-hoc `runtime/` directory to be completely deleted.
- Native monitored build halted on an off-lane shrink-canary probe (gate not run); observer recorded check 1/6 then cancelled outstanding checks. Preserved the failed attempt and repaired through existing owners; current four-canary verification passes in 24.4s, with golden geometry/digests preserved. Independent Phase 2 review and resumption remain pending.

## 2026-10-08 — Agy QA of MVP improvement plan

- Ran the operator-requested relay-xyz plan QA with Agy / Gemini 3.1 Pro (High) in a new full clone, refreshing from PR #4 to the latest landed PR #7 baseline as origin advanced. Round 3 is supervisor-attested Approved (driver exit 0), reviewed head `10469bde095f22d7eab1afe09b2d55b055b9a4dc`; preserved prior findings and the round-2 close-mismatch rejection in the relay thread.
- Revised GH-5 to accept nutrition first with the product-hero smoke, extend the existing four canaries within the ratchet, qualify generation/render measurements separately, and use the published Solar System display assets for future offline recipe promotion. Original image inputs remain omitted; the generator does not produce the two selected refinements. All eleven selected display image digests match committed evidence.
- Reversibility: Easy — plan/recon/QA records only. Main checkout unchanged by this task; no runtime implementation or paid image calls. Verification: matched the approved plan bytes to the reviewed commit; Agy shim, review-once, lock-resolver and attestation checks pass within their recorded limits. The aggregate vendor-snapshot gate was not green and is explicitly disqualified in `relay-system/2026-10-08/gh5-qa-receipt.json`. Targeted PDDA frontmatter, roadmap coverage and changelog checks pass with zero errors/warnings; diff whitespace passes.

## 2026-10-08 — Solar System diagram with Milky Way inset

- Created a standalone 2400×1700 diagram (originally local in `artifacts/solar-system-2026-10-08/`), using the existing GH-1 Satori/resvg and Chromium render functions from origin commit `591971d`. Eleven independent transparent assets (Sun, eight planets, main asteroid belt, Milky Way) were generated through the operator-selected resolve-image skill with `gpt-image-2.5-flare`; retained prompts, recipe receipts, original images and display-size exports. Outputs include PNG, SVG, offline HTML with editable labels, fixture JSON, and an individual-assets ZIP.
- Bet: the existing backend-owned layout/render operations compose this educational scene without a production-engine change. Failure mode: inaccurate visual scale or missing assets; the poster explicitly marks sizes, spacing, density and positions schematic, and includes NASA sources. Reversibility: Easy — standalone artifact files and this changelog entry. Verified eleven distinct image nodes, source hashes and transparency, canvas dimensions, browser text overflow and label-container overlap checks; agent visually inspected the primary output. The asteroid belt uses a direct PNG node after a nested-SVG raster disappeared in the Satori output.
- Published as `examples/2026-10-08-solar-system/` with a README: final Satori and Chromium PNGs, the responsive HTML viewer, contact sheet, fixture, scripts, prompts, receipts, provenance, verification evidence, web-size assets and the pinned runtime source. Full-size originals, the SVG/scene/render-HTML (regenerable, image-inlined) and the assets ZIP stay local (about 17 MB committed of 114 MB). Absolute device paths were removed from receipts and the generator now reads `HIQS_CHAIN_CALLER`.

## 2026-10-08 — Post-landing reconciliation and restored intake

- GH-1 (#3) and GH-2 (#4) landed on `main`; the roadmap writer moved both to Completed (`roadmap reconcile-state --apply`).
- Restored work that was parked off the primary checkout so it could receive the landings (`park/primary-2026-10-08`, `park/gh5-intake-2026-10-08`): the GH-5 capture and recon map, GH-5 re-registered through `roadmap add` with its original provisional rating (new gid; the parked row was never on `main`), the marathon launch log and its changelog entry below. Moved the GH-1 and GH-2 plans to `PROJECT/3-COMPLETED/` and repointed their roadmap rows. Parked copies of the GH-1 plan, PRD and marathon plan were older than `main` and are not restored.
- Reversibility: Easy — documentation and ledger rows only. Verification: `releases check` clean; PDDA run.

## 2026-10-08 — MVP foundation assessment and improvement umbrella

- Assessed the GH-1 candidate at origin `591971d` and the local Solar System demonstration: engineering judgment 7/10 for the foundation, 4/10 for a reusable local MVP. Created [GH-5](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5) with a prioritized checklist for shared recipe/runtime operations, reliable publication, resumable/cached paid generation, faster cached redraw, measured performance, durable editing, and later remote work. Reuses GH-1 acceptance and GH-2 regression/CI scope.
- Captured the bounded source trace and issue in `PROJECT/1-INBOX/`, and parked GH-5 through the canonical releases roadmap writer with provisional ratings. The Solar System demonstration is published separately under `examples/solar-system/`; GH-1 artwork acceptance has since been recorded. No runtime changes or generation speedups are claimed.
- Bet: shared render operations and validated asset reuse remove avoidable work before deeper tuning. Failure mode: stale cache identity or geometry-only checks hide wrong/missing artwork. Reversibility: Easy — intake and planning records only. Verification: GitHub body and local capture match (29 unchecked items); frontmatter/changelog checks and diff whitespace pass. Roadmap coverage reports one unrelated missing pointer for `PROJECT/2-WORKING/SPECS-PRD.md`; GH-5's parked pointer is present.

## 2026-10-08 — GH-2: regression canaries and a test/CI ratchet

- Added four canaries for the GH-1 renderer spike, run by `pnpm test` (`tools/spike/test/canaries.test.mjs`, plain `node:test`, no new dependency):
  - a fresh render plus verify into a temp folder
  - golden geometry, plus byte digests on the recorded host
  - the committed-evidence gate
  - verifier tamper detection
  
  The only production change is a `SPIKE_OUTPUT_ROOT` override in `render.mjs` and `verify.mjs`, so tests never touch committed evidence. Recorded `output/<run>/…` paths are unchanged.
- Added the ratchet: `test-budget.json` sets the budget (1 test file, 4 tests, 60 s, 0 CI workflows), and `tools/spike/test/run.mjs` enforces it before running tests. It rejects:
  - extra test-like files
  - `describe`, `it`, `skip`, `todo` and `only`
  - unnamed or zero canaries
  - workflows beyond the budget
  - a budget change without a matching history entry
  
  It runs the suite under a process-group deadline and checks executed TAP counts. AGENTS.md points to the budget file, and the policy text lives only there.
- Bet: four end-to-end canaries catch the regressions that matter for this spike (render breakage, layout or visual drift, evidence-gate drift, verifier neutering) better than per-module unit tests. The failure mode is a regression in a path the canaries do not exercise, such as the fitting shrink loop. That would earn a budget raise with a named failure mode. Supported host is the recorded darwin-arm64 machine; other hosts skip digests and fail the platform-bound evidence gate by design.
- Reversibility: Easy (delete the test folder, budget file, script, override lines and AGENTS pointer). Verification: `pnpm test` exit 0 in 8.2 s; eleven red controls each fail at the intended check; timeout leaves no stray processes. Plan QA: `relay-system/2026-10-09/gh2-plan-qa.md` (Codex, Approved round 3).

## 2026-10-08 — GH-1 human artwork acceptance

- The operator reviewed the reference-matched baseline renders and accepted the generated artwork ("Generated artwork looks good"). Recorded in the GH-1 plan (status Accepted), the PRD §5.3 checklist and `tools/spike/REPORT.md`. Reversibility: Easy — documentation only.

## 2026-10-09 — Phase 0 spike artwork revision: reference-matched infographic

- Rebuilt the nutrition fixture and scene to follow `PROJECT/2-WORKING/layout-engine-reference.png`: bold headline with leaf ornaments, illustrated callouts flanking a large glowing leaf, four captioned items, a vertical benefits panel, and a footer pill. Seven transparent illustrations were generated with OpenAI gpt-image-2.5-flare (HiQS resolve-image recipe r2, local_candidate, reference as style input, high quality); Inter Bold (same Inter 4.0 release, OFL) added for headings; benefit icons and ornaments are hand-authored SVG. Provenance, digests and transparency checks in `tools/spike/assets/SOURCES.md` and `generated/*.result.json`; full-size originals are gitignored and web copies (640 px) committed.
- New backend findings, both caught by the existing verifier during development (figures are orchestrator observations from superseded intermediate renders, not delivered evidence): Chromium reports glyph-box overflow at line-height 1.15 that Satori cannot see, and font-size fitting cannot cure it (headline shrank 50 → 29.5 px), so Phase 1 fitting needs a line-height floor or knob; image stretch sizing differs between backends, so recipes must size images explicitly. Raster art raised warm upper medians to about 133 ms (Satori) and 260 ms (Chromium); the backend decision is unchanged.
- Render output now goes to one dated folder per run, `tools/spike/output/<YYYY-MM-DD>-xyz-layout-engine-spike/` (this run: `2026-10-08-xyz-layout-engine-spike`), and includes the exact HTML document Chromium rendered for each case; the verifier checks the newest folder and binds each HTML file to its recorded digest (tampered-HTML red control fails). Shared-process Node rss with raster art is about 488–673 MiB, so the proposed Satori worker limit moves from 512 MiB to a 1 GiB placeholder.
- Bet: generated raster illustrations plus the unchanged backend-owned geometry path reproduce the reference closely enough for human acceptance; failure mode is an artwork rejection, which only replaces assets and does not touch the engine path. Reversibility: Easy — spike assets, fixture, scene and documents in a local clone. Verification: `pnpm run spike:verify` exit 0 (new checks: bold font digest, generated asset digests and alpha; red control on a tampered web PNG fails). Codex QA of this revision: `relay-system/2026-10-09/gh1-spike-artwork-qa.md`. Human visual acceptance still pending.

## 2026-10-08 — Phase 0 spike executed: backend comparison, evidence report, and decision

- Phase 1 (fixture, assets, verifier) landed via the agy/Codex marathon driver on 2026-10-02 (retry after the containment fix). Phase 2 under agy failed containment twice (probe scripts written off-lane: repo root, then `tools/spike/test_satori.mjs`) and parked at the lane attempt cap; filed XYZ-forge #1001 (global `XYZ_HARNESS` overrides the vendored `.xyz/` root, so the issue-closed guard queried the harness repo) and #1002 (one stray scratch file discards a converging phase).
- Orchestrator built Phases 2 and 3 directly in the task clone. `tools/spike/render.mjs` renders the same scene tree through Satori→resvg and Chromium, collects backend-owned geometry (Satori `onNodeDetected`; Chromium rects, `Range`, scroll metrics), runs bounded font-size fitting (≤10) for baseline, the prescribed long-copy override, and a structured product hero, probes script coverage with the pinned font, records versions/licences with manifest provenance, stage-bounded timings, and memory caveats. `verify.mjs` binds every PNG to its digest, checks dimensions, geometry, containment-aware overlap, recomputes overflow/fit/eligibility from raw evidence, and requires licence records; eleven red controls each fail on a named assertion.
- Independent Codex post-build QA of Phase 2 (`relay-system/2026-10-08/gh1-spike-p2-postbuild.md`): three rounds, Approved and driver-attested. Round 1 caught failed licence lookups masked by prose, a mislabelled timer, over-claimed probe wording, and gate gaps; round 2 caught unhashed probe PNGs, a coverage-only English check, and an untested document-overflow flag. All fixed with receipts.
- Phase 3: `tools/spike/REPORT.md` and PRD Phase 0 findings record timings (Satori warm median 26.5 ms, Chromium 68.8 ms on M1 Max; cold 152.7 / 425.7 ms, in-process; from the delivered runtime.json), licence memo (MPL-2.0/MIT/Apache-2.0/OFL; Chrome for Testing notices unverified), script coverage (English/accented Latin covered; CJK/emoji uncovered by the pinned font), proposed resource limits, and the decision: **Satori→resvg default, Chromium declared fallback**. Human visual acceptance of the artwork remains pending; agent assessment records the fidelity gap against the reference.
- Bet: each backend's own reported geometry (Satori `onNodeDetected` boxes; Chromium rects and scroll metrics) is sufficient to drive fitting and constraint checks, so no second layout engine is needed; failure mode is a fitting defect this spike's six cases did not exercise (the shrink path never ran). Reversibility: Easy — spike-owned files, documents, and a local clone; no package published, no CI, server, queue, or editor framework added. Verification: `pnpm run spike:verify` exit 0; PDDA 0 errors; Phase 2 Codex QA Approved; Phase 3 Codex QA Approved and attested (2 rounds) at `relay-system/2026-10-08/gh1-spike-p3-postbuild.md`.

## 2026-10-02 — Phase 1 containment diagnosis and retry preparation

- Reproduced the first turn's containment failure: dependency installation wrote unignored root node_modules/. Added its standard project ignore rule before retry; preserved source allowlists and installed harness. Controls accept allowed files and still reject an unrelated source file.
- Original turn remains rejected; Codex review/verifier did not run. Phase 1 retry is authorized; phases 2/3 remain unstarted. Evidence: relay-system/2026-10-02/gh1-spike-containment-diagnosis.md.

## 2026-10-01 — Phase 0 marathon launched

- Operator confirmed the reviewed three-phase plan and Agy-builder/Codex-reviewer pairing. Dispatched in the isolated full clone; Agy claimed Phase 1. No implementation completion or artwork acceptance claimed.
- Available worker checks passed (Codex 43, Agy 65); the vendored harness does not include top-level validate.sh. Launch log and warnings are recorded in relay-system/2026-10-01/gh1-spike-launch.md.

## 2026-10-01 — Phase 0 marathon prepared

- Created umbrella issue #1, captured/promoted its bounded renderer-spike plan with three sequential briefs/YAML, registered roadmap/marathon/draft release membership, and prepared a full task clone. No build dispatched.
- Independent Codex plan review is Approved and driver-attested (reviewed head d43274edf6eb); resolved scope/asset/text-overflow/gate findings and corrected legacy receipt formatting with an EOF-only template. Installed harness runtime unchanged.
- Verified direct preflight exit 0; primary planner/deep/check exit 0 with one wave/no held or drift; full clone YAML dry-run exit 0 with Agy builder, Codex reviewer, and explicit verifier gate. PDDA run has zero errors and nine existing governance warnings. Additional clone scheduler emitted a nonblocking partial-preparation warning, preserved in readiness evidence. See `relay-system/2026-10-01/gh1-spike-readiness.md`.
- Reversibility: Easy, preparation artifacts and local-only clone. Awaiting exact-plan/order confirmation as required by start-marathon; rendering, production scope, and human artwork approval remain unverified.

## 2026-10-01 — Canonical project name

- Renamed the project to **XYZ Layout Engine** in the active PRD and guiding principles; AGENTS.md now enforces the canonical name. Updated proposed CLI/package/factory examples to `xyz-layout-engine`, `@xyz-layout-engine/*`, and `createLayoutEngine`. Historical changelog wording is preserved.
- Reversibility: Easy, documentation/example identifiers only; no published packages or runtime interfaces changed.
- Verification: installed PDDA frontmatter, status-table, and hardcoded-path checks pass with zero findings; naming consistency check confirms no former-name references remain in the active PRD, guiding principles, or AGENTS.md.

## 2026-10-01 — Backend scope and first proof of concept

- Codified the Satori/resvg versus Playwright spike, backend ownership of layout/text measurement, Composer-only missing-layer scope, and Fabric/Konva deferral until direct editing is required. Aligned implementation phases with the selected backend.
- Inspected `PROJECT/2-WORKING/layout-engine-reference.png` and designated its nutrition infographic composition as the first proof-of-concept litmus reference, with structured content, separate assets, visual acceptance, and a content-change check. Promote that fixture to the initial infographic recipe and reuse it for local/remote parity.
- Reversibility: Easy, document changes only. Bet: existing backends can supply enough geometry for fitting/constraints; Phase 0 must record any gap before implementation. No code, dependencies, tests, or CI configuration added.
- Verification: installed PDDA frontmatter, status-table, and hardcoded-path checks pass with zero findings. Reference/document links, fenced blocks, and selected-backend consistency checks pass. Rendering remains unimplemented and unverified.

## 2026-10-01

- Reviewed and revised the Composer PRD to specify local/offline and remote engine workflows through a shared library/CLI/HTTP/MCP contract. Added bounded job recovery, tenant/asset boundaries, reproducibility/cache identity, phase acceptance criteria, and explicit spike decisions.
- Sharpened AGENTS.md and GUIDING-PRINCIPLES.md around DRY, durability, maintainability, security, and measured performance, using the ponytail lens. No engine code, tests, CI configuration, or installed PDDA runtime changed.
- Bet: shared application operations with thin protocol adapters satisfy both deployment modes without duplicate engine behavior. Reversibility: Easy (documents only); revisit after the geometry and deployment spikes.
- Verification: `utils/pdda/pdda.sh run` completed in observe mode: frontmatter/status/path checks pass; one pre-existing roadmap-coverage error remains (empty releases ledger; `releases` CLI unavailable on PATH), with ten existing governance warnings. PRD anchors, relative document links, fenced blocks, and edited-file whitespace pass. No runtime behavior was tested; this is a specification-only change.

## [Unreleased]
### Added
- Reusable local library operations (\`tools/render.mjs\`, \`tools/request.mjs\`) for Satori and Chromium rendering without side-effects on import.
- Nutrition recipe explicitly versioned and exported in \`tools/recipes/nutrition.mjs\`.
### Changed
- \`tools/spike/render.mjs\` uses an atomic staging directory for output and implements a direct-execution guard.
- Validation semantics enforce input dimensions, and symlink/realpath containment.


## 2026-10-09 — GH-5 workhorse Phase 1 recovery

- Repaired the existing request/recipe/render owners: bounded confined JSON and strict nutrition fields, explicit fixed-canvas/scale subset, bounded valid PNG admission, escaped HTML and browser finally cleanup; shared requested artifacts and usable local CLI.
- Replaced mixed mutable publication with immutable runs and one atomic manifest selector; verifier/C2 resolve that shared selector while preserving manifest-free historical goldens. Added tools/spike/verify.mjs to the Phase 1 write contract for this necessary reader seam.
- Extended existing C1 for boundary/failure controls. Orchestrator pnpm test passed 4/4 in 10.8s, 216 geometry boxes and 12 byte-identical artifacts. Receipts: relay-system/2026-10-09/gh5-p1-repair/. Independent committed-code QA and continuation remain pending; failed native lane/cap preserved.
- Filed canonical XYZ Forge #1006 for opt-in bounded 600-second × 6 progress reporting. Existing heartbeat/timeouts/read-only monitors remain; no installed harness runtime edits or paid calls.

- Independent recovery QA round 1 found and reproduced cross-date last-good discovery and default comparison-root mismatch. Reused shared selectedSpikeRun for verifier/C2 and aligned defaults; existing C1 verifies no-override flow, later-date failure discovery and selected-output tampering. Updated suite: 4/4 in 11.3s; second independent QA pending.

- Independent Phase2 review caught native resvg abort for radiusX=8192. Repaired recipe-owned pre-render spatial admission; existing C1 rejects radius/centre/image-size/label escape controls. Four canaries pass in24.7s with goldens preserved; second independent Codex review Approved/attested against3bf0ff4; native gate resumption pending.


## PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md

---
gh_issue: 5
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
title: "MVP foundation: reusable recipes, resumable image generation, and faster rendering"
status: "Active (2-WORKING — preparation)"
created: 2026-10-08
doc_type: feedback
effort: 4
complexity: 4
risk: 2
phases: 5
ratings_provisional: false
updated: 2026-10-09
owner: Neochrome
branch: marathon/gh-5-mvp-foundation
reversibility: Easy — local modules and manifests; preserve spike goldens and immutable assets.
goal: >
  Deliver an offline local recipe MVP with safe publication, resumable optional asset authoring and measured redraw improvements.
---


# GH-5 — MVP foundation improvements

## Status

| What was just completed | What's next |
|---|---|
| Phase 1 remains independently accepted; Phase 2 containment failure repaired and independently Codex Approved/attested at 3bf0ff4, four canaries24.7s. Timer check1/6 and halt preserved. | Resume exact four-phase YAML: driver runs approved Phase2 gate, then builds phases3 -> 4 -> 5. Fresh 600-second x6 monitoring; final wave QA and human/provider acceptance remain pending. |

## Table of contents

- [Execution scope and ponytail decisions](#execution-scope-and-ponytail-decisions)
- [Phase 1 — Shared local operation](#phase-1--shared-local-operation)
- [Phase 2 — Offline Solar System and readable fitting](#phase-2--offline-solar-system-and-readable-fitting)
- [Phase 3 — Resumable optional generation](#phase-3--resumable-optional-generation)
- [Phase 4 — Measured redraw and durable edits](#phase-4--measured-redraw-and-durable-edits)
- [Phase 5 — Integration and handoff](#phase-5--integration-and-handoff)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)


## Verdict and purpose

**7/10 as an MVP foundation; 4/10 as a reusable, operator-ready local MVP.** These are engineering judgments, not measured scores. The renderer choice, backend-owned geometry, separate artwork/text, pinned inputs and evidence discipline are sound. The landed implementation is still a renderer spike with a focused regression suite, rather than a reusable recipe engine. Recipes remain hardcoded and editing/export is not a complete product workflow. The Solar System example source and display assets are now published by PR #7, but its renderer still imports a copied runtime and requires uncommitted originals; it is not yet a fresh-checkout offline recipe.

This umbrella tracks the shortest path from that evidence to a reliable local MVP, then the already-planned remote/product improvements. It builds on completed #1 and #2; it does not reopen their scope or authorize immediate implementation of every item below. The operator has now promoted the bounded local arc below. Keep one umbrella and five sequential phases instead of duplicate child issues; check items only with evidence. Remote/product follow-ups remain deferred.

## Evidence and limits

- **Landed baseline:** [PR #3](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/3) and [PR #4](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/4) are merged; #1 and #2 are closed. This QA uses origin/main `a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c`, including reconciliation PR #6 and [Solar System publication PR #7](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/7). The [spike report](https://github.com/HiQS-Labs/XYZ-layout-engine/blob/a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c/tools/spike/REPORT.md) records repeatable PNGs, backend geometry, long-copy/product-hero cases, pinned fonts, explicit unsupported capabilities and failure controls. It now records operator artwork acceptance on 2026-10-08. This acceptance applies to the spike, not future migrated recipes.
- **Delivered tests:** `pnpm test` owns four canaries: fresh render/verify, golden geometry/digests, committed evidence and tamper detection. `test-budget.json` caps one file, four tests, sixty seconds and zero CI workflows. These are existing capabilities, not proposed work.
- **Published demo, incomplete reproduction inputs:** [Solar System example](https://github.com/HiQS-Labs/XYZ-layout-engine/tree/a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c/examples/2026-10-08-solar-system) now contains source, fixture, prompts, receipts, rendered outputs and eleven selected web-sized images. Its README explicitly excludes full-size originals, and `render-diagram.mjs:25` reads those missing files. The selected `saturn-clean` and `asteroid-belt-diagram` refinements are also absent from the generator's initial job list. Therefore its current paid-generation instructions do not reproduce the approved scene from a fresh checkout. Prefer admitting the already supplied web images with their recorded display digests; recover originals only if needed for higher-resolution exports or exact refinement lineage. Nutrition remains the first production recipe, with product-hero as the existing smoke.

- **Measured rendering:** nutrition at 1000×1000 on M1 Max/Node 22: warm upper median Satori/resvg **133.4 ms**, Chromium **260.4 ms**, ten samples after warmup. Reported cold 252.7/614.2 ms is initialization inside an existing Node process, excluding static imports. These are stage timings, not full job latency, p95 or deployment SLAs. Shared-process Node RSS was roughly 488–673 MiB; browser RSS was unmeasured.
- **Unmeasured generation:** thirteen receipts record eleven initial assets and two refinements. The published `generate-assets.py:39`–`:41` admits the Sun first and then runs three concurrent image jobs. This is an implemented setting, not a measured optimal-concurrency baseline. The spike report's single-process/no-concurrency limit describes renderer measurements, not provider image generation. No controlled provider latency/cost/concurrency benchmark or percentage speedup is claimed.

- **Concrete friction:** the published generator aborts on existing output files (`generate-assets.py:24`–`:26`); redraw resizes all assets to 640 wide and rewrites derivatives (`render-diagram.mjs:24`–`:36`) and renders both backends (`:105`–`:120`). The missing nested-SVG belt remains a historical visual observation; no fresh reproduction is claimed by this plan QA. The landed spike's `assets.mjs:4` uses URL.pathname, retaining encoded spaces; filesystem-safe conversion remains a concrete requirement.

- **Historical artifact sizes (not remeasured in this QA):** diagram PNG 1,274,320 bytes; SVG 6,788,502; self-contained HTML 7,547,604. SVG contains embedded raster illustrations. Input/output preparation and duplicate embedding deserve measurement alongside layout/raster time.

Source inspection was used because the complete graph project inventory has no indexed XYZ Layout Engine project. The bounded trace is recorded in `PROJECT/1-INBOX/recon-mvp-foundation.md`, with a QA refresh distinguishing historical observations from the current branch. Local evidence paths above are not hosted artifact links.

## P0 — Make one reusable local MVP

- [ ] Use the landed #1/#2 evidence and recorded spike artwork acceptance as the migration baseline. Preserve pinned outputs while extracting the shared operation; record fresh acceptance for changed recipes rather than reopening the completed spike/test issues.
- [ ] Extract one reusable render operation from the spike; make CLI and demos call it without importing a module that automatically runs the experiment or copying renderer source. Preserve backend-owned layout/text measurement; domain composition stays in trusted recipes. Start with modules, not a speculative package/plugin framework.
- [ ] Promote nutrition into the first versioned recipe with normalized fixture/parameter/asset input, moving editable semantic values out of the entry-point script. Keep the existing product-hero smoke as a cross-domain regression check; P0 does not require a second production recipe. Pin supplied artwork/fonts so a fresh checkout renders offline without a paid API call.
- [ ] Implement the PRD's shared request/result schema for the local library/CLI: reject unknown fields, invalid dimensions/scale, missing assets and unsupported formats; return field-level errors, backend/version identity, validation report and artifact digests. Explicit recipe-declared fallback only.
- [ ] Fix path handling using filesystem-safe URL conversion, support directories with spaces, and constrain local asset/output paths (including symlinks) to configured roots. Validate encoded bytes, decoded pixels, SVG references and total render size; renderers must not perform uncontrolled network fetches.
- [ ] Write each run into a unique temporary directory, verify it, then atomically publish a manifest/last-good result. A failed redraw must leave the prior deliverable intact; retain bounded diagnostics and clean temporary files/browser processes.
- [ ] Extend fitting with a readable minimum font size, conservative line-height policy, missing-text detection and explicit non-fit results. Exercise actual shrink and exhausted/non-fit paths; avoid treating an in-canvas element box as proof of unclipped glyphs.
- [ ] Reuse the delivered **#2 / PR #4** suite and ratchet; do not reopen #2 or add new `test()` blocks by default. Extend C1 (fresh render/verify) with a space-containing temporary path and material non-fit/publication cases when the owning implementation exists; extend C2 (golden geometry/digests) or the existing verifier with focused image visibility evidence. Keep one file, four tests, sixty seconds and zero workflows. Each future child must name its failure mode and why the existing assertion cannot cover it; any necessary budget change follows `test-budget.json` history/issue rules. Recovery/cache tests belong to their implementing child, not this plan-only QA.
- [ ] Provide one documented install/render/edit-fixture/export command path, a supported capability table and a fresh-checkout offline walkthrough. Clearly describe PNG versus SVG with raster artwork and temporary HTML edits. Obtain human approval of the migrated nutrition output before closing P0. Product-hero remains the existing smoke; broader recipe breadth is a later gate.

## P1 — Speed up generation and redraw without hiding failures

Generation is an optional asset-authoring operation, not a prerequisite for P0 offline rendering. Reuse the published example generation harness and the operator-selected installed resolve-image/HiQS caller as the sole paid-provider boundary; do not build another provider client. Add only the minimal manifest/resume orchestration this phase needs.

### Paid image generation

- [ ] Separate asset generation from layout rendering in the supported workflow. Text, theme or placement edits must reuse approved assets and make **zero image-generation API calls**.
- [ ] Add a content-addressed asset manifest/cache keyed by exact prompt, model, generation/edit parameters, recipe version and reference-image digests. Keep originals immutable; reuse only assets whose manifest, digest and required alpha checks validate. Changed prompts/references must invalidate the relevant asset without regenerating unrelated assets.
- [ ] Make generation resumable: skip validated completed assets; submit only missing or explicitly replaced items; atomically persist per-item state/receipts. Bound retries and deadlines. An unknown paid outcome must be reconciled or reported for explicit retry, never blindly resubmitted. Expose an expected-call count and configurable call/budget cap before dispatch.
- [ ] Measure per-asset and total latency, queue/network/provider contribution where observable, refinement rate, failures and reported usage/cost where available. Establish a measured baseline using the published three-worker setting and admitted caller, then compare bounded concurrency settings only within verified provider limits. Do not assume three workers is optimal; compare total completion time and failure/cost behavior before adopting a different setting. Do not silently switch model, provider or quality.
- [ ] Add a small batch quality review before acceptance: transparent-edge/halo quality, visual style, cropping, aspect ratio and subject accuracy. Preserve exact reference/edit lineage so rejected assets can be replaced individually. A receipt saying some pixels are transparent is insufficient visual acceptance.

### Local rendering and export

- [ ] Default supported recipes to **Satori/resvg only**. Load/launch Chromium only for explicit comparison or a declared capability requirement; avoid importing unnecessary browser dependencies on the normal path. Reuse a browser within an explicitly requested batch only after measuring the benefit and cleanup behavior.
- [ ] Cache derived image sizes by source digest, requested display dimensions/scale and transformation version. Choose adequate resolution per asset instead of resizing everything to 640 wide. An unchanged-asset redraw must perform **zero derivative rewrites**; edits must invalidate exactly the affected derivatives.
- [ ] Profile fresh-process and warm end-to-end redraw separately: input/asset read, resize, encoding, layout, raster/PNG encoding, filesystem/export and verification. Use nutrition first and a representative larger supplied-assets fixture; use Solar System after its supplied-assets promotion gate; report sample count, runtime, output dimensions, isolated memory and browser memory when used. Keep provider generation timings separate.
- [ ] Compare cached and uncached workflows on the same machine and fixtures, publishing before/after total latency, output sizes and digests/approved visual tolerance. Set a numeric latency target after baseline collection; accept optimization only when the intended stage improves without degrading readability, determinism or validation. Existing 133.4 ms is a reference observation, not the target for the larger diagram.
- [ ] Reduce repeated base64/asset embedding and unnecessary diagnostic exports. Offer a compact HTML + asset-folder distribution alongside the self-contained offline option, and generate only requested formats. Preserve both portability choices explicitly.
- [ ] Establish a backend image policy for nested SVG/raster combinations: supported direct images, safe normalization or explicit rejection. Add the small visibility canary under #2; geometry checks alone must not approve a missing illustration.

## P2 — Finish the local editing and reliability experience

- [ ] Promote the published Solar System example as a follow-on recipe using its supplied web-sized assets, verified against the committed display digests, without requiring paid regeneration. Remove the copied runtime dependency. Recover originals/reference lineage only when the admitted export resolution or provenance requirement needs them; record/park unavailable higher-resolution variants. A fresh checkout must redraw the selected refined assets offline and obtain separate human artwork approval before this recipe is accepted.

- [ ] Add save-and-rerender for label/data/parameter edits with durable fixture JSON and requested PNG/SVG export. Derive controls from the recipe schema where practical; retain the simple fixture workflow. Defer a full canvas editor until direct editing is a demonstrated requirement.
- [ ] Bundle/license explicit fallback fonts for each supported script, or reject/report unsupported scripts clearly. Do not rely on machine-specific Chromium fonts. Record minimum readable typography and approved multilingual fixtures when that scope is admitted.
- [ ] Produce one consolidated provenance manifest covering source/refinement prompts and reference digests, selected asset versions, fonts, recipe/runtime/backend versions, normalized input, validation and artifact hashes. Follow the PRD fingerprint contract for cache identity; asset URLs alone are not identity.
- [ ] Enforce measured per-job input/pixel/memory/time/concurrency limits and cancellation. A synchronous raster call can outlast an event-loop timeout: use the simplest interruptible worker/process boundary only if hard enforcement requires it. Verify the failure leaves no leaked browser/process or published partial result.
- [ ] Resolve shipping dependency/font notices, including the report's unverified Chrome for Testing third-party terms before distributing that backend. Prefer the existing pinned dependencies and preserve prior recipe/runtime versions for reproducibility.

## Later — Preserve the PRD direction after local acceptance

- [ ] Add HTTP and local/remote MCP as thin adapters to the same application operations/schema; verify local/remote fingerprint/report parity. Remote selection and uploads stay explicit; no tenant-supplied executable recipes.
- [ ] Before a remote pilot, implement tenant-scoped assets/artifacts, authorization, approved URL/redirect/SSRF checks, private expiring downloads and cache isolation. Reuse shared checks rather than duplicating per-transport suites.
- [ ] Introduce durable jobs, idempotency, bounded retries and restart recovery only when accepted async/batch work needs them. Start with the simplest deployment/storage that meets the actual workload; add multi-worker queues/object storage when measured requirements justify them.
- [ ] Expand themes, commerce adapters, infographic primitives and batch UI only after the current recipes expose a concrete unmet need. Keep domain logic out of the core; add no second geometry engine, generic plugin system or full editor as prerequisite infrastructure.

## Acceptance

Each phase has its own closure gate:

- [ ] **P0 — usable local renderer:** a fresh checkout renders nutrition offline through one shared library/CLI operation, with the existing product-hero smoke retained. Editing fixture text exports requested PNG/SVG without paid calls or copied renderer source. Missing/unsupported content fails clearly, a failed run preserves the last-good output, the existing suite passes inside its ratchet, and the operator accepts the migrated nutrition artwork. Generation caching and GUI editing are not P0 dependencies.
- [ ] **P1 — measured asset reuse and speed:** text/theme/placement redraws make zero provider calls; validated completed generation items resume without duplicates; invalidation changes only affected assets; unchanged derivatives incur zero rewrites. Publish separate generation and fresh/warm redraw baselines plus before/after results, with no readability/determinism/validation regression. Where provider usage/cost is unavailable, record that limitation.
- [ ] **P2 — durable edits and broader reliability:** save/edit/rerender/export persists fixture state, admitted script support is explicit, provenance/limits/cancellation have evidence, and the Solar System recipe redraws with supplied verified assets and is independently accepted, or any unavailable higher-resolution variant is explicitly parked. Missing original artwork never blocks the completed nutrition milestone.
- [ ] **Later service work:** separate promoted children close only after the PRD's shared-contract, authorization, parity and recovery gates; they are not local-MVP prerequisites.

Follow P0 with P1 profiling/cache work (generation resume can be an early independent child), then P2. Later service/UI work is separate promotion, not a condition for this local milestone. Each promoted child needs a bounded acceptance criterion and evidence. Stop/revert an optimization on cache misidentification, duplicated paid calls, missing imagery, degraded readable text or nondeterministic output.

**Bet:** consolidating the existing render functions and reusing validated assets removes avoidable work before deeper backend tuning. **Tradeoff:** prioritize a usable local slice over immediately building all transports/themes. **Failure mode:** incomplete cache identity or overly broad reuse serves stale/wrong art; missing-pixel checks give false confidence. Intake is **Easy** to reverse; shared recipe/API/cache contracts are **Costly** and require versioned rollout.

Historical broad-umbrella provisional planning triage (superseded for the bounded local execution arc below): PDDA effort 4/5, complexity 4/5, risk 3/5, four broad phases. PRS `rated 75/55/50/25` (priority/severity/appeal/effort-cheapness; sum 205): high leverage for follow-on work, material reliability gaps but no demonstrated production incident, neutral appeal, substantial umbrella effort. Re-estimate individual children after scope selection; no priority override is assumed.

## Execution scope and ponytail decisions

The current-state map is `PROJECT/1-INBOX/recon-mvp-foundation.md`, refreshed against origin/main a8e7e574 (no runtime changes since). Recon reused — same traced subsystem and baseline. Graph inventory has no indexed project; source fallback is disclosed. Current callers are spike render/verify/canaries and the published demo/generator. Geometry belongs to Satori/Chromium; domain composition belongs to trusted recipes. State includes immutable supplied assets/fonts/receipts, mutable fixture JSON, disposable derivatives and atomically published manifests.

**Present requirement:** local offline render/edit/export plus safe optional image authoring and evidence-based speed improvements. **Simplest mechanism:** plain existing ESM/Python modules, JSON manifests, stdlib filesystem/locks/subprocesses and pinned rendering libraries. Existing spike code lacks import safety, normalization, last-good publication, durable edits and resume; these specific gaps justify the small added modules. No new runtime dependency, plugin framework, provider client, server, queue, canvas editor, CI workflow or default browser pool.

The checklist above remains the complete umbrella scope. This marathon includes P0, P1 local behavior/recovery, and P2 offline recipe/editing/provenance/font-rejection/notices. Live provider benchmarking and batch visual acceptance require an admitted caller, operator budget and human review; they stay pending rather than run paid calls autonomously. Conditional browser pools/workers are added only on measured need. The four Later items are deferred, retained here, and #5 must not be closed on marathon machine completion. Migration human acceptance is a separate pending release gate.

**Ratings:** effort 4, complexity 4, risk 2, five phases, nonprovisional for this bounded local arc. Effort/complexity remain high for shared contracts, typography, filesystem safety and recovery. Risk moved from the broad provisional 3 to 2 because remote/tenant deployment and live paid experiments are excluded, goldens remain protected, all artifacts are local/revertible, and unknown paid outcomes cannot redispatch. This does not rate the Later service arc as safe or trivial. RELEASES PRS axes remain the existing 75/55/50/25 (calc 205); no extra priority score is invented.

One umbrella/member: GH-5. Full clone `marathon-gh-5-mvp-foundation`, branch `marathon/gh-5-mvp-foundation`, base `origin/main` as confirmed by the operator (origin has no development branch). Never the primary checkout or linked worktree. Phase order p1 -> p2 -> p3 -> p4 -> p5 is strictly serial in one wave. Shared runtime, package.json, test file, report and CHANGELOG collide; no parallel lanes. Releases writers/plan status/QA checkboxes are orchestrator-only and never edited during builder flight.

**Blast:** Easy — unshipped local modules and owned manifests. Protect immutable inputs and spike goldens; stage/verify before publish; tripwires are digest/geometry drift, escaped paths, corrupt inputs, unknown paid outcomes and failed canaries. Execution diagnosis uses the debug-mantra skill (reproduce, trace, falsify, cross-reference). Halt on first failed phase; no force/attempt-cap bypass. Rollback reverts the failed phase commit and restores the prior last-good manifest; preserve evidence and recover unknown provider results before any explicit retry. New local schemas/cache versions are explicit to avoid accidental reuse; public service contracts remain deferred.

The native driver uses Agy builder and independent Codex reviewer for every phase. Plan QA is an independent Codex relay before dispatch. After all driver test gates are green, the orchestrator must mechanically run a separate final Codex wave review against the committed aggregate diff and on-disk test receipts before checking the wave QA boxes or pushing a feature/PR. Native per-phase review before its gate does not satisfy that final requirement. Each turn is capped at 1500 seconds; at most two review rounds per phase and the installed attempt cap, no automatic force. The pre-advance command is `pnpm test`. Builder must not run the pre-advance gate (the driver runs it after independent review); reviewer inspects code and tests rather than inferring correctness from a prior green spike. Every builder records stage-specific checkable evidence inside the allowed report/relay; scratch and outputs go to ignored/temp owned paths, not arbitrary repository files. No runtime governance edits.

## Phase 1 — Shared local operation

**Goal:** Shared local operation delivers the observable behavior below. Depends on none.

- [x] Extract reusable backend operations with a direct-execution guard; importing them must not run the experiment. Keep the legacy experiment's bytes/geometry and product-hero smoke unchanged. Put trusted nutrition composition behind one versioned recipe. Keep plain ESM and existing pinned dependencies; no plugin registry, monorepo or provider client.
- [x] Normalize the local library/CLI request/result against PRD semantics in tools/request.mjs. Reject unknown fields, unsupported formats/backend/fallback, invalid dimensions/scale and missing input with field-level errors. Ship only an honest local supported subset; document unsupported remote fields rather than accepting them silently. Result includes normalized input, recipe/backend versions, validation report, provenance and output digests.
- [x] Use fileURLToPath and realpath/root containment for inputs/output, including symlink escape rejection; reject remote/file references in supplied SVG, scripts/foreignObject and nested SVG+embedded raster on the supported Satori path unless explicitly normalized with proven visibility. Bound encoded bytes, decoded dimensions/pixels and total render area before decoder/layout allocation. Use existing resvg for admitted SVG/raster inspection, not a new parser dependency; never claim a regex blacklist alone makes arbitrary SVG safe. Limit to trusted bundled SVG and validated direct PNG for v1 if safe general SVG admission is uncertain.
- [x] Default to lazy Satori/resvg only. Load/launch Chromium solely for explicit comparison or recipe-declared capability; preserve finally cleanup. Stage one run under a unique same-filesystem directory; validate all requested artifacts before atomic last-good manifest publication. Do not replace a last-good deliverable on failure; preserve bounded diagnostic state and remove orphan staging files safely. Existing spike evidence is read-only.
- [x] Extend C1 within its existing test block: import no-side-effect assertion, CLI in a space-containing temp path, invalid request/escaping symlink and injected failed publication preserving prior digests. C2 retains legacy geometry/digests. Run pnpm test. Record actual commands/results in tools/MVP-REPORT.md.

**Write set:** `tools/spike/render.mjs`, `tools/spike/assets.mjs`, `tools/spike/scene.mjs`, `tools/spike/verify.mjs`, `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 1 — QA checklist

- [x] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [x] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [x] Recovery orchestrator (no active builder) executed `pnpm test` exit 0 at b914323; independent post-build Codex QA attested that head. This supersedes the failed attempt’s never-run driver gate; do not fabricate `phase.approved`. Existing budget remains, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [x] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [x] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.


Recovery receipts: relay-system/2026-10-09/gh5-p1-repair/verification.log, pdda.log, attestation.json and relay-system/2026-10-09/gh5-p1-repair.codex.md. Scale 1/fixed nutrition 1000x1000 is the explicit Phase 1 subset; Phase 2 extends trusted recipe/canvas admission.

## Phase 2 — Offline Solar System and readable fitting

**Goal:** Offline Solar System and readable fitting delivers the observable behavior below. Depends on Phase 1.

- [ ] Promote the published Solar System scene/fixture as a trusted recipe sharing the runtime. Read the eleven committed assets/web PNGs, verify the committed verification.json display digests (including saturn-clean and asteroid-belt-diagram), and preserve their generation/edit lineage. Do not call a provider or pretend missing full-size originals are present. Admit a bounded export resolution compatible with display inputs; park higher-resolution originals if unavailable.
- [ ] Make both render-diagram.mjs and contact-sheet.mjs thin shared-operation callers. Migrate the contact sheet to root shared renderer/fonts and the eleven selected committed display images (including refined IDs); preserve its committed PNG as historical evidence and direct new output to an owned temp/output path. Remove the copied runtime only after both offline entry points succeed without originals or paid calls. Share pinned fonts from the root runtime; do not duplicate them. Keep the Sun, each of eight planets, belt and Milky Way as individual images, separate editable text and backend-owned bounds. Preserve schematic/not-to-scale disclosure and original fixture/artifacts as provenance.
- [ ] Add bounded fitting (maximum ten attempts), readable minimum font size, conservative line-height policy, missing glyph/text detection and explicit non-fit response. Do not implement independent glyph metrics or arbitrary line breaking. Reject unsupported scripts using the pinned font capability evidence, without host-font fallback. Exercise real shrink and exhaustion, not only successful iteration-zero cases.
- [ ] Extend C1/C2 or the existing verifier for actual shrink/non-fit and image visibility. Visibility evidence must compare painted pixels or render a focused admitted image canary; a node rectangle or alpha metadata alone cannot pass a missing illustration. Keep one file/four tests/60 seconds. Run pnpm test and fresh Solar System CLI offline. Record agent visual evidence separately from pending human migrated-artwork acceptance.

**Write set:** `tools/recipes/solar-system.mjs`, `tools/recipes/nutrition.mjs`, `tools/render.mjs`, `tools/request.mjs`, `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `examples/2026-10-08-solar-system/contact-sheet.mjs`, `examples/2026-10-08-solar-system/README.md`, `examples/2026-10-08-solar-system/runtime/.gitignore`, `examples/2026-10-08-solar-system/runtime/SOURCE.json`, `examples/2026-10-08-solar-system/runtime/package.json`, `examples/2026-10-08-solar-system/runtime/pnpm-lock.yaml`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets.mjs`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/OFL.txt`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/SOURCES.md`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/font-bold.ttf`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/font.ttf`, `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs`, `examples/2026-10-08-solar-system/runtime/tools/spike/scene.mjs`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 2 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 3 — Resumable optional generation

**Goal:** Resumable optional generation delivers the observable behavior below. Depends on Phase 2.

- [ ] Extend the existing Python generator, not a second provider client. Keep the installed resolve-image/HiQS caller as the only paid boundary and require its explicit configured path. Accept exact job inputs, including refinement IDs, references and parameters, without rewriting published prompts/receipts during dry-run. Imported module must not dispatch calls.
- [ ] Persist a local content-addressed manifest keyed by exact prompt/model/parameters/recipe version/reference digests. Keep source images/receipts immutable; validate digest/required alpha before reuse. Resume valid completed items and dispatch only missing or explicitly replaced jobs. Atomic per-item state must record pending -> in-flight before dispatch -> complete or unknown/failed. Crash/timeout while in-flight remains unknown and requires receipt reconciliation or explicit retry; never blind paid resubmission. Concurrent same-output invocations use an exclusive local lock and refuse safely, no daemon/database queue.
- [ ] Show planned call count and enforce a configurable maximum calls/observable cost budget before dispatch; if price is unavailable, report that limitation and rely on the call cap rather than inventing cost. Bound attempt count and per-call/whole-run deadlines; retry only a proven non-submitted transient failure or explicit operator retry. Preserve Sun-first admission and the historical configurable three-worker ceiling until provider limits/measurement support a change. No silent model/provider/quality switch. Capture latency, caller-reported usage/cost and unavailable stage metrics honestly.
- [ ] Extend C1 by invoking this generator against a temporary deterministic caller stub: valid resume -> zero calls, one changed input -> one call, cap exceeded -> zero calls, interrupted in-flight -> no automatic second call, corrupt output -> explicit report/replacement, concurrent manifest ownership -> safe refusal. No live paid calls or secrets in tests. Batch visual acceptance remains a human gate; preserve reference/edit lineage. Run pnpm test; record measured stub behavior as recovery evidence, never provider speed evidence.

**Write set:** `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/README.md`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 3 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 4 — Measured redraw and durable edits

**Goal:** Measured redraw and durable edits delivers the observable behavior below. Depends on Phase 3.

- [ ] Before optimizations, measure fresh-process and warm end-to-end nutrition and promoted Solar System/supplied-asset runs on this machine. Record sample count, Node/dependency versions, dimensions, input/asset read, transform/encoding, backend layout/raster, write/export and verification timings, isolated peak Node RSS and browser RSS if used. Minimum five fresh and ten warm samples, outside the 60-second canary suite. Keep provider timings separate. Publish before/after JSON or tables in tools/MVP-REPORT.md with commands, digest/geometry comparisons and variance; no invented speedup/p95/SLA.
- [ ] Cache only derived images using source digest + dimensions/scale + transform version; validated supplied web inputs already suitable for display should be reused directly. Unchanged redraw performs zero derivative rewrites and zero paid calls; one asset/dimension change invalidates only its derivative. Verify cached digest/size/alpha before reuse. Bound cache space and clean only owned derivative entries; do not touch immutable originals or another caller's files. Avoid persistent browser/service pools unless measurements establish need and cleanup is verified.
- [ ] Expose durable fixture JSON save/edit/rerender/export through the existing CLI (one schema-validated write path, atomic save, errors preserve original). JSON editing is sufficient; don't build a full canvas editor or UI framework. Unknown labels/fields fail explicitly. Text/theme/placement edits never invoke image generation.
- [ ] Generate requested formats only. Provide compact offline HTML plus asset folder and an explicit self-contained HTML option; SVG with raster art is described accurately. HTML must safely escape text and URLs; compact references remain inside the exported folder, fonts are pinned and both distributions need no network. Verification/manifests remain mandatory; optional diagnostic dumps are explicit.
- [ ] Extend existing C1/C4 for zero derivative writes, invalidation/tamper recovery, saved edit surviving rerender, requested-format selection and offline HTML distributions; stay within ratchet. Set an optimization acceptance target after observing baseline; if no stage improves, publish that result and omit the ineffective cache complexity. Run pnpm test and record profiling separately.

**Write set:** `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/profile.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 4 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 5 — Integration and handoff

**Goal:** Integration and handoff delivers the observable behavior below. Depends on Phase 4.

- [ ] Document one pinned install/render/edit/export workflow for nutrition and Solar System on a fresh checkout without originals, paid API calls or copied runtime. Record schema/capability/font/image limits, PNG vs SVG-with-raster, durable JSON edits vs transient preview edits, compact/self-contained offline exports, expected generation calls/resume/unknown recovery and exact caller prerequisite. Gather pinned dependency/font notices; don't package/distribute Chromium before its terms/notices are verified.
- [ ] Record measured limits (input bytes, pixel/render area, fit/deadline/concurrency/cache bounds), unsupported scripts and stage diagnostics/correlation IDs. A local worker/subprocess for hard interruption is conditional on measured need; an event-loop timer must never be presented as a hard interrupt of synchronous rasterization. If a required hard limit is not enforceable, document/reject the unsupported workload, rather than claim compliance. Keep remote HTTP/MCP, tenant isolation/SSRF/private caches, durable service queues and themes/adapters/full editor in the Later queue; do not ship half-services.
- [ ] Run pnpm test, fresh offline documented workflows and relevant PDDA checks; publish receipts/report and update PRD with delivered local observations only. No unearned green boxes, human approval, issue closure or production readiness. Obtain independent Codex post-build review via the native driver and adjudicate peer findings. Prepare a ready PR only after the wave receipt gate is satisfied; do not push/merge/close from builder turns. Report nutrition and Solar System visual acceptance as pending human decisions; #5 remains open for Later requirements.

**Write set:** `README.md`, `tools/MVP-REPORT.md`, `examples/2026-10-08-solar-system/README.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`.

### Phase 5 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm test` exit 0 after all five phases, plus documented fresh offline edit/export and measured before/after report).
- [ ] Wave 1 Post-Build Codex QA Relay executed (native per-phase transcripts under `relay-system/`; final on-disk `.codex.md` receipt must have first STATUS Approved/Closed and exact reviewed head).
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated (independent Codex findings resolved; later PR findings adjudicated before landing).

Implementation-plan QA: Codex Approved and supervisor-attested, `relay-system/2026-10-09/gh5-marathon-plan.codex.md`, reviewed e5130905d2f6310b8880549a5db9a73a0ed214be. The contact-sheet finding is resolved; final acceptance-markup/debug-mantra cleanup and scheduling overlay receive a final independent Agy readiness check. Earlier Agy checklist approval is retained separately. Final integration requires all five native review+test gates, root-bound `check_marathon_qa.py --pre-pr --wave 1 --doc PROJECT/2-WORKING/MARATHON-PLAN-2026-10-09.md`, and applicable PDDA checks before feature push/ready PR. Human migrated-artwork approval and live provider benchmarks are separate pending checks. No automatic closeout/merge/closure.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/main"
  },
  "gate": "pnpm test",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/render.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/request.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/recipes/nutrition.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/recipes/solar-system.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/profile.mjs"
    },
    {
      "type": "path_absent",
      "path": "README.md"
    },
    {
      "type": "path_absent",
      "path": "tools/MVP-REPORT.md"
    }
  ],
  "artifacts": [
    "package.json",
    "tools/spike/render.mjs",
    "tools/spike/assets.mjs",
    "tools/spike/scene.mjs",
    "tools/spike/verify.mjs",
    "tools/spike/test/canaries.test.mjs",
    "examples/2026-10-08-solar-system/render-diagram.mjs",
    "examples/2026-10-08-solar-system/contact-sheet.mjs",
    "examples/2026-10-08-solar-system/generate-assets.py",
    "examples/2026-10-08-solar-system/README.md",
    "CHANGELOG.md",
    "PROJECT/2-WORKING/SPECS-PRD.md",
    "tools/render.mjs",
    "tools/request.mjs",
    "tools/recipes/nutrition.mjs",
    "tools/recipes/solar-system.mjs",
    "tools/profile.mjs",
    "README.md",
    "tools/MVP-REPORT.md",
    "examples/2026-10-08-solar-system/runtime/.gitignore",
    "examples/2026-10-08-solar-system/runtime/SOURCE.json",
    "examples/2026-10-08-solar-system/runtime/package.json",
    "examples/2026-10-08-solar-system/runtime/pnpm-lock.yaml",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets.mjs",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/OFL.txt",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/SOURCES.md",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/font-bold.ttf",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/font.ttf",
    "examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs",
    "examples/2026-10-08-solar-system/runtime/tools/spike/scene.mjs"
  ],
  "artifacts_new": [
    "tools/render.mjs",
    "tools/request.mjs",
    "tools/recipes/nutrition.mjs",
    "tools/recipes/solar-system.mjs",
    "tools/profile.mjs",
    "README.md",
    "tools/MVP-REPORT.md"
  ],
  "remediation": {
    "source": "issue#5",
    "criteria": "Offline shared nutrition and Solar System library/CLI render/edit/export with validated confined inputs, explicit capabilities, atomic last-good publication, bounded readable fitting, no paid redraw, exact-content generation resume and derivative cache, recorded before/after measurements and four existing canaries; Later services and human/live-provider acceptance stay pending."
  },
  "lanes": {
    "agy_safe": [],
    "orchestrator_only": [
      "releases.db",
      "releases.sql"
    ],
    "index_only": []
  }
}
```

## Phase 1 recovery — 2026-10-09
The native first attempt halted at cap-progressing-extended (exit4); no driver test gate ran. Preserve that lane and its ESCALATION.md. The operator explicitly requested workhorse repair, independent QA and then restart with 600-second × 6 observation intervals. Current surgical recovery is Easy and recorded in relay-system/2026-10-09/gh5-p1-repair/plan.md; both independent consult seats answered, disagreements adjudicated there. Reader integration adds tools/spike/verify.mjs to Phase 1/contract write sets so publication and readers share selectedRun. This changes selection only, preserving all historical validation/goldens. The orchestrator can run pnpm test while the builder is inactive; native failed-phase status will not be forged. Recovery acceptance and remaining-phase readiness are pending independent committed-code QA. Native monitoring gap filed in XYZ Forge #1006; no consumer harness runtime modification.

## Continuation admission
The same GH-5 umbrella/ledger/full clone is reused. Original Phase 1 is not re-fired, renamed, self-approved or reset. The canonical executable YAML now contains only the previously unstarted phases gh5-p2 -> gh5-p3 -> gh5-p4 -> gh5-p5; Phase 1 is an evidenced external prerequisite in the Phase 2 brief. Review/time/attempt caps remain unchanged. The original five-phase YAML/receipts remain in Git history.

The operator explicitly authorized continuation after repair and QA. The session-local observer uses the existing marathon launcher, records live read-only state at 600 seconds x 6, distinguishes liveness from accepted progress, emits terminal state within five seconds and cancels outstanding checks. Six checks end the scheduled observation window, not the authorized executor. Fake-clock controls passed at 600/1200/1800/2400/3000/3600 seconds and early halt; no real executor was launched during smoke. Observer source/receipt: relay-system/2026-10-09/gh5-continuation/. No installed harness edit, second executor or new daemon. Monitoring feature issue: https://github.com/HiQS-Labs/XYZ-forge/issues/1006.

Final wave green-suite/post-build Codex QA/checklist are still required before any feature push or ready PR; phases 2–5 and human/live-provider acceptance remain pending.


### Phase 2 monitored halt and native resumption — 2026-10-09
The four-phase continuation actually fired. Phase2 halted on containment exit6 (extra shrink-canary probe), with no gate run; remaining phases never started. Check1/6 recorded at600s and terminal observation cancelled outstanding5. Original failed receipts/history retained. Orchestrator repaired within the same phase owners and four-test budget; independent Codex round1 caught/reproduced native geometry abort, recipe-specific pre-raster spatial constraints fixed it, round2 Approved/attested against3bf0ff4. Existing suite exit0 four canaries24.7s,216 boxes/12 byte-identical artifacts. Receipts: relay-system/2026-10-09/gh5-p2-repair/ and original marathon-system phase relay. No self-approval, new phase identity, force or cap reset. Resumption uses the unchanged YAML/plain driver: recognize original approved/done Phase2, run its native pre-advance gate, then3->4->5. This is not final-wave approval. Fresh observer timer starts with the resumed launcher and preserves the earlier launch receipts; six scheduled checks cancel on terminal.


## tools/MVP-REPORT.md

# MVP Report

## Phase 1 recovery — 2026-10-09

The initial native Phase 1 lane halted at `cap-progressing-extended`, exit 4; its test gate never ran. Its escalation remains unchanged. The operator authorized workhorse repair and independent QA before a continuation. This report records orchestrator verification while no builder is active; it does not forge `phase.approved`.

Delivered local subset: nutrition recipe 1.0.0 on its 1000×1000 canvas, scale 1, Satori by default; PNG/SVG/self-contained HTML artifacts and explicit Playwright PNG/HTML. Other dimensions/scale and remote/fallback fields fail with field paths. API: `processRequest(request, {root})` returns normalized request, validation, pinned versions, input provenance, SHA-256 and requested artifact bytes/MIME/dimensions. CLI: `node tools/render.mjs tools/spike/fixture.json --out tools/output/local [--format svg|html] [--backend playwright]`. Inputs and output are confined to the authorized local root; committed spike output is read-only. JSON is limited to 256 KiB; images to direct 8-bit RGBA non-interlaced PNG or the trusted bundled SVG subset. PNG chunk bounds/order/CRC, scanline inflation/filter bytes and positive dimensions are validated before native rendering. Per-image limit: 5 MiB and 16,777,216 pixels; scene aggregate: 35 MiB encoded and 16,777,216 pixels; render area 16,777,216 pixels; total published bytes 64 MiB. The local filesystem is trusted against concurrent hostile mutation; this is not remote tenant isolation.

One publisher owns immutable `runs/<UUID>` and atomically commits `manifest.json` after all staged files are admitted/hashed. Shared operation validates text presence/region/canvas, fonts and raster size first; spike validates mandatory capability outcomes and case digests/dimensions first. No postcommit compatibility copies. `selectedRun` resolves the pointer once for readers; legacy manifest-free goldens remain readable. Browser/context/page owners close in finally; Chromium loads only for explicit browser requests or the explicit legacy comparison.

## Receipts

Host: Node v22.22.3, pnpm 12.4.1, darwin-arm64. Pinned installed renderers: Satori 0.36.0, resvg 2.6.2, Playwright 1.64.0. No dependency, test-block, test-budget or CI-workflow addition.

- Original baseline `pnpm test`: exit 0, 4/4 in 9.8s, despite the witnessed admission and markup failures. Receipt: `relay-system/2026-10-09/gh5-p1-repair/baseline.log`.
- Red controls: oversized 8192² canvas with scale 0.1 admitted; literal injected script serialized. Receipt: `relay-system/2026-10-09/gh5-p1-repair/red-controls.log`.
- Revised C1 exposed macOS `/var` versus `/private/var` guard/root aliases. Canonicalization fixed both. Root red receipt: `relay-system/2026-10-09/gh5-p1-repair/macos-root-red.log`; the earlier empty-CLI failure is recorded in repair plan/tool transcript.
- Current `pnpm test`: exit 0, four canaries in 11.3s, 216 geometry boxes within 0.5 px and 12 artifacts byte-identical. Receipt: `relay-system/2026-10-09/gh5-p1-repair/verification.log`. C1 now checks actual imports, local CLI in a space path with dependency linkage, format export, strict input/asset/HTML controls, owning browser cleanup via native launch substitution, and two successful same-day publications followed by a late failure. It re-reads selection and compares target, manifest bytes and all referenced digests, and checks orphan cleanup.
- Preservation: `git diff origin/main -- tools/spike/output examples/2026-10-08-solar-system/assets test-budget.json` is empty. Historical content, test budget and original checkout preserved. Easy rollback: revert task-branch repair; prior immutable runs/selectors and goldens are retained.
- Consult: both Codex/Agy advisory seats answered; disagreements adjudicated in `relay-system/2026-10-09/gh5-p1-repair/plan.md`. Consult is not runtime acceptance.

Independent Codex review round 1 passed the seven original repaired boundaries but found two reader defects; both repaired; round 2 independently Approved and attested against b91432380184. Receipt: relay-system/2026-10-09/gh5-p1-repair.codex.md and gh5-p1-repair/attestation.json. Default comparison render/verify roots now match, and shared selectedSpikeRun skips unpublished later-date folders. C1 exercises no-override comparison, default verification/tamper failure and cross-date last-good discovery. Phases 2–5, adaptive fitting/Solar System, generation resume, measured optimization and final integration remain pending. Human artwork acceptance and live provider measurements remain pending; no paid calls, push, PR, merge or issue closure is authorized by these receipts.

## Phase 2 recovery — offline Solar System and fitting

The monitored continuation launched at 15:44:13Z and halted at 16:03:19Z on containment exit 6: the builder left an extra shrink-canary.mjs probe outside its allowed files. The driver gate did not run. One ten-minute interval was recorded and the five outstanding checks cancelled at terminal observation. Transient image copies were removed before the turn ended; they were not the final rejection. The preserved builder patch/extra probe remains in local recovery evidence. Its claim of passing pnpm test was disproved by the budget gate: five tests exceed four.

Orchestrator repair uses the same owners and phase/task, without new tests/dependencies/CI or widening paths. Both recipes share bounded delivered-shape validation. Explicit trusted recipe selection admits the original Solar System fixture unchanged. Recipe-owned canvases remain nutrition 1000×1000 and Solar System 2400×1700, scale 1; unsupported resizing/scaling fails explicitly rather than silently changing/ignoring geometry. Eleven pinned display derivatives, including refined Saturn/belt assets, are descriptor-bounded, PNG/aggregate-budget checked, digest verified on each read and confined to the trusted example namespace. Missing full-size originals remain absent; no provider call was made.

The shared renderer fits only overflowing text sizes, at most ten total attempts, with a 12px minimum; explicit non-fit prevents artifacts/publication. A fixed header region and non-shrinking text boxes make the shrink control real. Native Satori missing-segment evidence also rejects unsupported glyphs before explicit Chromium rendering can silently use host fallback. Context/browser cleanup remains nested finally. Thin CLI callers reuse admission/parsing/render/publication; the contact sheet shares verified images, pinned fonts, native rendering and atomic publication. Copied runtime removed after both workflows rendered offline using root tools.

Verification: current existing four canaries passed in 24.4s (60s budget); 216 golden boxes within 0.5px and twelve byte-identical artifacts. C1 covers painted raster pixels (not PNG size/alpha metadata), actual multi-attempt shrink, non-fit exhaustion, strict Solar fields/geometry/assets, unsupported canvas and CJK rejection on both backends. Fresh poster/contact-sheet entry points exited 0. Agent inspection saw all eleven individual illustrations, separate readable labels and schematic disclaimer; this does not substitute for pending human artwork acceptance. Independent Phase 2 Codex review and native gate/resumption are pending.

Independent Codex round1 reproduced native resvg SIGABRT (exit134) for an admitted Mercury radiusX=8192. The existing Solar recipe now validates its orbit/image/label/centre spatial envelope on the fixed canvas before SVG/native rendering; Sun imageSize also drives its actual node. The exact failing radius and equivalent centre/image-size/label controls are inside C1. Updated suite passed four canaries in24.7s with216 boxes and12 artifacts preserved. Round2 independent Codex review is Approved and supervisor-attested against 3bf0ff4; first review failure is preserved in the original phase relay. No catch-and-ignore, renderer replacement, cap reset or additional test was used.
