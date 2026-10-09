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

- Independent Phase2 review caught native resvg abort for radiusX=8192. Repaired recipe-owned pre-render spatial admission; existing C1 rejects radius/centre/image-size/label escape controls. Four canaries pass in24.7s with goldens preserved; second independent review pending.
