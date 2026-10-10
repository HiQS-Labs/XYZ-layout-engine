# Changelog
## 2026-10-10 — GH-10 catalog: drop the serial number (plan: issue #20)

- Removed the `serial` column, `RCP-NNNN` display and serial lookup from `tools/catalog.mjs`, `tools/catalog.sql`, the render receipt's `catalog` block, the C4 canary and the README/PRD text. A recipe is identified by `slug`, a version by `slug@semver`, matching the PRD recipe ID and the finalized three-ID plan on #20. The canary's retention control now checks that a retired recipe's slug cannot be reused. Refs #10. Refs #20.
- Easy reversal (nothing was pushed or referenced before the change). `catalog verify` and `export --check` pass on the migrated dump; `pnpm test` passes.

## 2026-10-10 — GH-10 local catalog documentation

- Documented the delivered local recipe catalog: immutable slug/exact-version identity, files owning content and the canonical SQL ledger owning identity, version bump rules, operator-only writes, CLI exit codes and the Node SQLite ExperimentalWarning. README names variants, aliases and semver ranges as deferred; PRD §6.5 adds one delivered-observation note without new requirements. Refs #10. Refs #19.
- Easy reversal: documentation only. Six documented catalog commands passed in a disposable scratch copy on Node v22.22.3; misspelled verb returned 2, and unknown recipe, declared-file drift, changed-content republish and non-canonical dump returned 1. Refused republish preserved ledger bytes. Targeted PDDA path/frontmatter/status checks passed with zero findings; an absolute-home-path red control raised the expected finding. Independent Agy review, the full gate and base-ref containment check remain harness-owned.

## 2026-10-10 — GH-5 final integration consumer repair

- Final independent Wave 1 QA found B1: two diagrams and two cell helpers on newly integrated main still imported the removed copied Solar runtime. Migrated their import/font/package references to the existing root renderer/fonts/Playwright; corrected reproduction and design-diagram instructions. Preserved fixtures, assets, historical art, validation and the shared core. Easy rollback; no new dependency/test/engine. Refs #5.
- Disposable full-clone scratch renders pass both backends: RAG 10 icons/49 text ids, cell division 6 icons/33 text ids. PNG/SVG bytes and Satori/Chromium geometry match originals; HTML differs only in quote entity serialization, with full decoded equality. Downscale/alpha helpers pass; no paid calls. Exact proof and fresh suite/PDDA logs: `relay-system/2026-10-09/gh5-final-verification/`. Final independent Round 2 and pre-PR remain pending.

## 2026-10-09 — GH-5 machine phases accepted and origin integrated

- Original Phase 5 normal attempt 2 received independent Codex approval/attestation and passed all four canaries in 29.4s. Clarified thirteen default generation jobs vs eleven selected display assets: the default eleven-call cap refuses the fresh batch; explicit dry-run cap 13 plans it without provider dispatch. Native timer completed at 555.9s and cancelled all six scheduled checks at terminal. Refs #5.
- Integrated origin/main 447f7aa in the full task clone, retaining review ancestry and all incoming content. Resolved only ledger conflicts using row/receipt union, promoted GH-5 pointer and maximum generation, then canonical rebuild/check clean at generation 32. Main checkout untouched.
- Integrated fresh full-clone frozen-lockfile install and four canaries passed in 29.4s; PDDA no errors/two existing governance warnings. Receipts: `relay-system/2026-10-09/gh5-final-verification/`. Final independent Wave 1 QA and pre-PR gate remain pending; human artwork/provider/notices/Later criteria are not marked complete.

## 2026-10-09 — GH-5 Phase 5 provenance correction (coordinator)

- Corrected current workflow hashes by replaying the exact edits in a fresh full clone at b0b47ce: nutrition headline `Fuel for today` and primary `#335577` produce SVG `38c3c44daa33df60a07c3a647a4e0c77abe211ca9da2846f4ae293459df5139a`; Mercury labelX=830 produces `06f195aea8f3e2bf9ea69efe4ff1b3d5309a8db643ba80f9f50d75d01a04d5fb`. Each saved fixture readback and manifest-selected rerender matched. The earlier Phase 5 entry assigned a historical nutrition probe hash to different edits; this entry supersedes that evidence claim. Historical entries and 120 profiling samples remain preserved.
- Frozen-lockfile install passed with independent node_modules. Compact and relocated inline HTML for both recipes loaded all images and Inter 400/700, zero HTTP(S) requests. Commands, exit codes and output: `relay-system/2026-10-09/gh5-phase5-recovery/fresh-workflow-commands.json`. No paid calls, runtime/test/dependency changes or human acceptance claims.
- Phase 5 first native attempt halted at its review cap before the suite gate; one normal attempt remains. Independent recovery QA, native Phase 5 gate, latest-origin integration and final Wave 1/pre-PR gates are still pending. Refs #5.

## 2026-10-09 — GH-5 Phase 5 Integration and Handoff (Agy builder)

- Created `README.md` and updated PRD/MVP-REPORT to document the pinned offline install/render/edit/export workflows for the `nutrition` and `solar-system` recipes.
- Documented source-configured capability caps in `.relay-scratch/` without mutating root evidence: source-configured bounds for inputs (256 KiB), pixel render areas (16.7M), image sizes (5 MiB), and total export capacities (64 MiB). Enforceable render deadlines, RSS limits, and concurrency limits are unsupported. Fresh-install/offline network/browser checks are [Unverified — needs clone run].
- Explicitly rejected unsupported scripts (CJK, Emoji without fallback fonts) and documented non-fit exhaustion halts.
- Documented deferral of remote HTTP/MCP, tenant isolation/SSRF, private caches, and durable service queues to the Later queue. Event-loop timers are rejected as a substitute for hard synchronous rasterization interruption.
- Scratch edit probes succeeded for atomic saving and subsequent generation of transient vs durable assets via `--save`, outputting `svg` and `html-inline`. Executed exact commands for Nutrition (`node tools/render.mjs .relay-scratch/nutrition-edit.json --set 'sections.header.headline=Fuel for today' --set 'theme.palette.primary=#335577' --save .relay-scratch/nutrition-edit.json --format png,svg,html,html-inline --out .relay-scratch/nutrition-export`, exit 0, edited SVG digest `f0bafb7349bc8e992ecaf1a2e51073e953ba3c8cf900f4e863215bee67fd3747`) and Solar System (`node tools/render.mjs .relay-scratch/solar-edit.json --recipe solar-system --set 'planets.0.labelX=830' --save .relay-scratch/solar-edit.json --format svg --out .relay-scratch/solar-export`, exit 0, edited SVG digest `06f195aea8f3e2bf9ea69efe4ff1b3d5309a8db643ba80f9f50d75d01a04d5fb`).
- Retained prior Phase 4 measurement statistics. Independent review and native gate checking are deferred to the reviewer and harness. Human visual acceptance remains pending.


## 2026-10-09 — GH-5 Phase 4 Codex builder candidate

- GH-5 Phase 4 gate repair: select the requested `render.html` by artifact name in existing C1, retaining MIME/doctype checks after compact export adds bundled fonts/images. C2's missing comparison output was a cascade from C1's early stop. All four canaries pass in 36.8s, including dynamic offline HTML/font/image checks; geometry and 12 artifact digests match. The native override halted; Phase 4 advancement and Phase 5 remain pending.

- Added schema-validated atomic fixture saves and CLI dot-path text/theme/placement edits, requested-format exports, compact HTML with a confined content-addressed asset folder and explicit self-contained HTML. Existing render/admission/publication owners remain shared; SVG accurately retains raster artwork.
- Bet: skip unrequested PNG raster work while retaining direct validated supplied display assets. Easy rollback via the phase commit; no derivative cache, browser pool, dependency, provider client, new test block or workflow. Revisit caching only when an admitted transform/resolution workload demonstrates useful savings.
- Verification: focused scratch probes pass for durable rerender, strict edits/save targets, failed publication preservation, export/source tamper detection and restoration, confined HTML references and Solar placement edits. Before/after five fresh and ten truly warm samples per recipe/PNG/SVG preserve artifact and text-geometry digests; complete stage statistics and samples are retained in tools/MVP-REPORT.md. Zero unrequested raster target is met; no PNG speedup claim.
- Pending: sandbox blocked Chromium before page creation, so actual offline browser/font/image loading remains for independent Agy review and the harness-owned four-canary/60-second gate. Existing C1/C4 were extended; builder did not run the full suite and does not claim native approval, human artwork acceptance or live-provider measurements. All verification copies/scripts/output stayed in .relay-scratch; no git command, source fixture mutation or off-lane cache/helper was used.

## 2026-10-09 — GH-5 local MVP marathon preparation

- Rebased a fresh full clone onto the operator-confirmed origin/main integration branch (a8e7e574; no development branch). Promoted GH-5 with the canonical roadmap writer, registered its marathon and LocalMVP release, and prepared five strictly sequential phase briefs/YAML. Main checkout is untouched.
- Applied ponytail: reuse ESM/Python modules, existing HiQS caller and four canaries; no provider client, framework, service/queue/editor or extra CI. Preserved Later work and human/provider acceptance as pending. Codex implementation-plan QA is Approved/attested; fixed its concrete contact-sheet migration omission. All eleven selected display-asset digests match.
- Reversibility: Easy — plan/ledger/receipts only, no runtime change or paid generation. Fresh baseline pnpm test passed four canaries in 8.2s, 216 geometry boxes and 12 byte-identical artifacts. Planner write/check exited 0 with one wave/no held items/no drift; added the required pending wave QA overlay after checking the generated core. Direct preflight/full YAML admission are recorded separately; execution completion is not claimed.

## 2026-10-09 — GH-5 Phase 3 bounded recovery

- Native second review interrupted by Codex HTTP503 before verdict/gate; original failure and monitor2/6 receipts retained, four outstanding checks cancelled. Saved independent probes identified real runtime defects; baseline C1 failed with undefined spawn. Earlier Phase3 builder claims of passing recovery/immutability were not verified.
- Easy surgical repair in existing generator/C1/docs: one exclusive batch lock, fail-closed atomic state, immutable attempt evidence, strict safe inputs, actual output/digest/decoded-alpha validation, exact deployed caller parameters/references/recipe identity, unknown/corrupt-state refusal and Sun-first admission. Preserve historical artwork/prompts/receipts; no new provider client/framework/test/CI or paid calls.
- Existing four canaries passed in32.1s, within60s;216 golden boxes and12 byte-identical artifacts. Real-PNG stub counts resume/refinement/cap/corruption/unknown/overlap/timeout dispatches. Cost remains an observable stopping threshold; provider measurements and human artwork acceptance pending. Independent recovery review found malformed-state replay, numeric parser drift, late deadline sampling and wrong-recipe reuse; repaired in current owners/C1. Final revised source passes4/4 in28.6s; native attempt2 halted before build at Agy model-probe20s timeout (counter2/2 retained, gate not run). Independent recovery QA continues separately; phases4/5 held.

## 2026-10-09 — GH-5 local MVP Phase 2

- Extended shared render tools (`tools/request.mjs`, `tools/render.mjs`) to dynamically load recipes and support adaptive text fitting (shrinks overflowing text by 10% at most 10 total attempts down to 12px, tracking bounds natively).
- Promoted the Solar System scene to `tools/recipes/solar-system.mjs` and integrated its display assets natively via the shared pipeline.
- Refactored `examples/2026-10-08-solar-system/render-diagram.mjs` and `contact-sheet.mjs` to be thin callers of the shared pipeline (publishing to owned tools/output roots via the shared atomic manifest), allowing the ad-hoc `runtime/` directory to be completely deleted.
- Native monitored build halted on an off-lane shrink-canary probe (gate not run); observer recorded check 1/6 then cancelled outstanding checks. Preserved the failed attempt and repaired through existing owners; current four-canary verification passes in 24.4s, with golden geometry/digests preserved. Independent Phase 2 review and resumption remain pending.

## 2026-10-08 — Agy QA of MVP improvement plan

- Ran the operator-requested relay-xyz plan QA with Agy / Gemini 3.1 Pro (High) in a new full clone, refreshing from PR #4 to the latest landed PR #7 baseline as origin advanced. Round 3 is supervisor-attested Approved (driver exit 0), reviewed head `10469bde095f22d7eab1afe09b2d55b055b9a4dc`; preserved prior findings and the round-2 close-mismatch rejection in the relay thread.
- Revised GH-5 to accept nutrition first with the product-hero smoke, extend the existing four canaries within the ratchet, qualify generation/render measurements separately, and use the published Solar System display assets for future offline recipe promotion. Original image inputs remain omitted; the generator does not produce the two selected refinements. All eleven selected display image digests match committed evidence.
- Reversibility: Easy — plan/recon/QA records only. Main checkout unchanged by this task; no runtime implementation or paid image calls. Verification: matched the approved plan bytes to the reviewed commit; Agy shim, review-once, lock-resolver and attestation checks pass within their recorded limits. The aggregate vendor-snapshot gate was not green and is explicitly disqualified in `relay-system/2026-10-08/gh5-qa-receipt.json`. Targeted PDDA frontmatter, roadmap coverage and changelog checks pass with zero errors/warnings; diff whitespace passes.

## 2026-10-09 — Cell division example: operator approves the version with two AI-generated cells

- The operator reviewed the diagram with the two AI-generated transparent cells (interphase, cytokinesis) and approved the artwork ("Artwork looks good", 2026-10-09). This approval covers `cell-division.png` and `cell-division.html` as shipped by this change, and supersedes the earlier all-SVG-only scope recorded below. Reversibility: Easy.

## 2026-10-09 — SOP.md: which Higgsfield method to use

- Added `SOP.md` at the repo root: use the Higgsfield CLI (`--background transparent`) for transparent images and verify alpha on every result; the REST API is NO-GO for transparency; MCP is untested; the HiQS endpoint is the other working path. Includes the spend-capped procedure, standing rules, known limits and when to update it.
- Docs only; every claim points at the existing FINDINGS.md and ledgers. Not reviewed by Agy (added after the PR #17 QA). Reversibility: Easy (delete the file).

## 2026-10-09 — GH-8 Phase 0b: the Higgsfield CLI returns real transparency; two cell images in the diagram

- Tested the installed Higgsfield CLI (`higgsfield generate create gpt_image_2_5 --background transparent`) under an operator-approved 20-credit cap: **4 of 4 transparent requests returned real alpha** (RGBA, minimum alpha 0, no opaque corners) and the opaque control returned an opaque image. Five jobs cost 1.5 credits (balance 701 to 699.5, matching the quoted prices). This corrects the earlier reading of PR #15: its NO-GO applies to the REST routes only. The MCP connector is still untested. Details: `examples/2026-10-09-cell-division/FINDINGS.md`; ledger: `cli-spike-ledger.jsonl`.
- The cell-division diagram now uses two AI-generated transparent PNGs, interphase (medium-quality Flare) and cytokinesis (low-quality Flare), as 256 px web copies with provenance (`assets/provenance.json`); the other four stages keep their SVG icons and the footer discloses the AI-generated cells. The renderer verifies each raster's sha256 against provenance and refuses a raster that is not real alpha. The operator's earlier approval covered the all-SVG version only; this version still needs review.
- Added `higgsfield-cli-spike.py` (credit-capped runner around the installed CLI; 11 offline selftest controls, each mutation-checked; never reads or writes the CLI's token, records credits only, redacts tokens, signed URLs and emails) and `make-web-asset.mjs`.
- Bet: the CLI route's `background: transparent` yields usable transparent art at 0.25 to 0.5 credits per image. Failure mode: results vary by prompt or the CLI's interactive sign-in blocks unattended use; neither was tested beyond five jobs. Reversibility: Easy (revert the PR); the 1.5 credits are spent. Process: plan approved by Agy in 1 round; code by Agy in 2 rounds (token and signed-URL redaction, test-only binary override); no change to `tools/spike/**`, `package.json`, `test-budget.json`, and no new dependency or test file. #8 stays open: its Phases 1 to 4 are not started.

## 2026-10-09 — Cell division example approved

- The operator reviewed and approved `examples/2026-10-09-cell-division/cell-division.png` and `cell-division.html` (the Satori render and its responsive viewer) as published in PR #15 (`4d9aa2c`, all-SVG art); a later change to the artwork needs its own review. Both already live in the conventional `examples/<date>-<slug>/` folder, named like the Solar System example's files, so nothing was moved. The README now records the approval in place of "human review pending". The Chromium comparison render is not part of the approval. Reversibility: Easy — documentation only. Verification: PDDA run and `releases check`.

## 2026-10-09 — GH-13 and GH-8 Phase 0 landed and reconciled

- PR #14 (design-diagram skill, `87de428`) and PR #15 (Higgsfield Phase 0 spike and cell-division example, `4d9aa2c`) squash-merged to `main`; issue #13 closed. The roadmap writer moved GH-13 to Completed (`roadmap reconcile-state --apply`); the GH-13 plan moved to `PROJECT/3-COMPLETED/` with its row repointed. Issue #8 was closed automatically when PR #15 merged, because the PR description said "does not close #8" and GitHub treats "close #8" as a closing keyword whatever precedes it. That was wrong (its Phases 1 to 4 are not started): #8 was reopened with an explanation, and its ledger row, which the reconcile had moved to Completed, was moved back to Queue / parked intake through the writer (`roadmap update --section`). Lesson: never write a closing keyword next to an issue number in a PR description for an issue that must stay open; say "Refs #8" only. PR #15's changelog and ledger collision with #14 was resolved by the merge tool's additive-disjoint path. Reversibility: Easy — ledger and documentation only. Verification: `releases check` and PDDA run.

## 2026-10-09 — GH-8 Phase 0: Higgsfield transparency spike and cell-division example

- Ran the GH-8 Phase 0 spike against Higgsfield's REST API (Flare and Sunburst, GPT Image 2.5, 1k/low, 12 paid generations, sequential, reserved at an assumed $1.20 under a $1.90 gate and the operator's $2.00 cap). **Verdict: NO-GO for native transparency on these routes.** `background: "transparent"` and `output_format: "png"` are accepted without error but ignored, every image is opaque RGB with no alpha channel, and prompting for a transparent background produced a flat white backdrop or a faint baked checkerboard. The MCP connector was not tested (not connectable here). Details: `examples/2026-10-09-cell-division/FINDINGS.md`; every call: `spike-ledger.jsonl`.
- Added `examples/2026-10-09-cell-division/`: a "How cells reproduce (mitosis)" explainer (six stages, loop-back arrow, two note panels) rendered through the pinned runtime with hand-drawn SVG icons, plus the spike tools: `higgsfield-spike.py` (spend-gated, secret-scrubbing REST runner, eight offline selftest controls) and `inspect-alpha.mjs` (Chromium-based alpha inspector, proven on a transparent and an opaque known file).
- Bet: a bounded REST probe settles whether Higgsfield exposes alpha for Images 2.5 before any provider contract is built. Failure mode: the answer lives only in the untested MCP surface; stated as the main open question. Reversibility: Easy for the code and docs (delete the folder); the spend is not recoverable and was capped. Verification: selftest 8/8, diagram `PASS` with three red controls, real secret scan clean, PDDA and ledger checks. Process: plan approved by Agy in 3 rounds; code reviewed by Agy in 3 rounds (the third round's two findings, a `NaN` quote that would bypass the spend gate and an unparseable quote falling back to the assumed price, were fixed and verified by the final reviewer without a fourth Agy round, because the cap was exhausted).
- No change to `tools/spike/**`, `package.json`, `test-budget.json`; no new test, workflow or dependency. #8 stays open: the provider contract and any Higgsfield skill or connector (its Phases 1 to 4) are not started.

## 2026-10-09 — GH-13: design-diagram skill

- Added `skills/design-diagram/SKILL.md`: an eleven-step procedure that takes a topic to a reviewed `examples/<YYYY-MM-DD>-<slug>/` folder and a PR, using `examples/2026-10-09-rag-system/` as the working pattern, plus a table of seven known traps each with its evidence pointer. Hand-drawn SVG is the default art; paid generation only on request; the skill does not install itself. No script, dependency, test or engine change.
- Bet: instructions that point at a working example let a cold agent repeat the process. Failure mode: the skill drifts from the example it points at. Reversibility: Easy — delete `skills/design-diagram/` and append a rollback entry here.
- Verification: path probe (one-off, not committed) found 23 existing input references and failed by name on an empty skill, a removed RAG reference and an invented path. A cold agent given only the skill built a four-stage CDN diagram to `PASS` and ran all three red controls; it found eight gaps (RAG-specific code to hunt, structural lane names, footer positions tied to canvas height, no icon spec, Chromium sandbox crash, red-control mechanics, fixture keys read by name, README wording) which are now fixed in the skill. The fixed skill was not cold-run a second time; the final Codex review reads it.

## 2026-10-09 — GH-11 landed and reconciled

- PR #12 squash-merged to `main` as `7d209fa`; issue #11 closed. The roadmap writer moved GH-11 to Completed (`roadmap reconcile-state --apply`), and the plan moved to `PROJECT/3-COMPLETED/` with its row repointed. Reversibility: Easy — ledger and documentation only. Verification: `releases check` and PDDA run.

## 2026-10-09 — GH-11: RAG system diagram example

- Added `examples/2026-10-09-rag-system/`: a 2400×1660 explainer of how retrieval-augmented generation works, with an ingest flow (documents → chunk → embed → vector store) and a query flow (question → embed → retrieve → augment → generate → cited answer). Fixture-driven, ten hand-drawn SVG stage icons (no image generation, nothing uploaded), rendered through the existing GH-1 Satori/resvg and Chromium functions, with PNGs, a responsive HTML viewer, `verification.json` and a README.
- Reuses the pinned runtime in `examples/2026-10-08-solar-system/runtime/` by relative import, so no second runtime copy. No change to `tools/spike/**`, `package.json`, `test-budget.json`, or any test or workflow.
- Bet: the existing render functions carry a second, structurally different layout (a two-lane pipeline) from fixture data alone. Failure mode: checks pass while the picture looks wrong; the agent inspected both PNGs, human review is pending. Coupling limit: moving the Solar System `runtime/` breaks this example until GH-5 lands a shared render operation. Reversibility: Easy — delete the folder and this entry.
- Verification: render prints `PASS` (10 icon nodes, 49 text ids, both backends). Three red controls each failed by name and were restored: overflowing description (`chunk_desc`), missing `retrieve` icon, Chromium `title` off-canvas. Plan QA: Codex, 2 rounds, Approved. Answer to the skill question: no `SKILL.md` exists in the tracked repo; GH-5 does not track one.

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

- GH-5 containment recovery: the existing C1 deadline import probe uses Python `-B` to prevent source-tree bytecode. The authorized original Phase3 override halted on an off-lane `__pycache__` before independent review/native gate; all six scheduled checks were cancelled at150.2s. No native approval or further override is claimed.


## 2026-10-09 — GH-5 Phase 4 native TURN-2 builder receipt

- Preserved the current measured-redraw/durable-edit/export implementation and existing C1 exact-name HTML repair. Focused scratch probes reproduce `font/ttf` at artifact[0] and verify the requested page by name; both recipes pass copy-only durable edits/rerender, requested exports and publication checks with originals unchanged.
- Syntax checks and one profiler smoke per recipe passed. No runtime/test change, full suite, paid call or git operation in this turn. Easy reversal; independent Agy review and the new harness-owned gate remain pending. Prior recovery suite evidence is not new phase approval.

## 2026-10-09 — GH-5 Phase 5 integration and handoff recovery

- Documented one pinned install/render/edit/export workflow for nutrition and Solar System on a fresh checkout without originals, paid API calls, or copied runtime.
- Recorded schema/capability limits (e.g. 256 KiB JSON input, max 5 MiB/16M pixels per image), PNG vs SVG formats, durable JSON edits, compact offline HTML exports, and expected generation calls.
- Integrated delivered local observations from the coordinator replay (fresh-workflow-commands.json). Verified durable edits and rerender behaviors with matching exact SVG digests.
- Pinned font (Inter) and dependencies, deferring Chromium packaging until terms are reviewed. 
- Stage diagnostics, worker-based hard interruptions, remote HTTP/MCP, tenant isolation, private caches, durable service queues, and themes remain deferred to Later.
- Added Phase 5 handoff documentation. Final QA, native gate test (`pnpm test`), and visual human approval remain pending independently.
