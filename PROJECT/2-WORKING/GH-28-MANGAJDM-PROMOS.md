---
gh_issue: 28
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/28
title: "MangaJDM — three portrait promo posts"
status: "Final QA Approved; PR handoff pending"
created: 2026-10-11
updated: 2026-10-11
owner: Codex
doc_type: feedback
goal: Deliver three editable 1080×1920 portrait promos from one published recipe, with design records and examples exports.
branch: feat/mangajdm-portrait-promos
effort: 2
complexity: 2
risk: 2
phases: 2
reversibility: "Easy — isolated additive recipe and example assets, existing CLI writes; undo the task commits together before landing."
---

# GH-28 — MangaJDM portrait promos

## Status

| What was just completed | What's next |
|---|---|
| Three portrait posts, captions/alt text, provenance, recipe and three CLI design records built. Both backends fit; deterministic/offline/edit/red controls pass; four canaries pass in31.9s. Plan QA Approved. | Final Codex QA Approved in Round2 and attested at04160ed; push and open a ready PR against main. |

## Table of contents

- [Phase 1 — Grounded plan and independent review](#phase-1--grounded-plan-and-independent-review)
- [Phase 2 — Recipe, three designs and verified handoff](#phase-2--recipe-three-designs-and-verified-handoff)

## Phase 1 — Grounded plan and independent review

**Goal:** Ground the portrait recipe in current owners and pass non-author Codex plan QA.

- [x] Confirm origin/main includes PR18 shared renderer, PR22 catalog, PR24 designs and PR25 admission fixes; no development branch exists.
- [x] Scan the supplied library (362 non-dot files; artwork, mockups, logos, source website). Read its README, SOP and website copy, and inspect the selected art visually. Original library stays read-only.
- [x] Persist the issue and RELEASES rating 65/20/50/65. Priority65: an explicit user-requested creative deliverable; severity20: missing example, no observed runtime failure; appeal50: neutral operator default; effort cheapness65: one fixed layout and three fixtures with existing artwork, moderate bounded implementation. No recurrence claim or priority override.
- [x] Independent Codex plan QA Approved in round1 at reviewed07321a6; driver exit0 and native attestation. Receipt: `relay-system/2026-10-11/gh28-plan.codex.md`. Nit disposition: corrected source references below; no scope change.

### Recon map and prior art

Graph list_projects returned all82 indexed projects with no Layout Engine project; check_index_coverage returned not indexed. Evidence is exact source fallback, not an exhaustive graph audit. Installed prior_art_recon resolves its own vendored root and warns that no ledger is there; target-root roadmap/issue/PR readback supplies the missing evidence. No existing MangaJDM task was found in the retrieved issue list, current roadmap or recent PR list; issue28 owns this work.

- CLI `tools/render.mjs:489` → `processRequest:175` → `tools/request.mjs:34` normalize/edit/admit → trusted recipe.validate/buildScene → existing `getFonts`, Satori or Playwright → measured fitting/containment → `publishArtifacts` immutable run and atomic manifest. Request, render backend, export and saved-fixture writes keep their existing owners.
- `tools/request.mjs:60` admits only nutrition/solar-system; `:61/:68` fixes their canvases. `saveFixture:106` separately admits the same trusted names, validates and atomically writes only eligible fixture JSON. Add this recipe to both explicit trusted admissions, preserving all old branches and restrictions.
- `tools/render.mjs:183` selects the same two explicit recipe imports. Add one explicit module import; no dynamic tenant code, registry abstraction or alternate renderer.
- `tools/recipes/solar-system.mjs` is the existing recipe contract: literal name/version, validate, TEXT_IDS/CONTAINMENT/DEFAULT_SIZES, bounded digest-checked local assets and buildScene. New `tools/recipes/mangajdm-promo.mjs` follows it; `tools/request.mjs` shape traversal and `tools/spike/assets.mjs:inspectPng` remain shared.
- `tools/catalog.mjs:123` declaredFiles has two trusted file sets, `moduleIdentity:143` parses literal exports, `snapshot:151` hashes their content, `runCLI:266` owns lock/dump replacement; design add:289 owns fixture/PNG hashes and log append. Add one explicit declared set, then use CLI add/publish/design add. Never write catalog.sql or design-log.jsonl directly.
- Reuse `examples/2026-10-09-cell-division/make-web-asset.mjs` for display PNG derivatives through the installed Satori/resvg. No image conversion dependency or custom encoder. Existing asset validation requires RGBA PNG without ancillary chunks; this helper produces that form.
- `test-budget.json` remains1 file/4 tests/60seconds/0CI workflows. Canary baseline was57.8s while the shim test also ran; run final canaries without a competing heavy process. Existing recipes' geometry/digests are the regression shield. Codex shim preflight:43pass/0fail.

### Smallest viable bet and editorial

Outcome: three usable, coherent portrait graphics plus editable inputs and durable catalog identities. One fixed 1080×1920 `mangajdm-promo@1.0.0` recipe, three variants chosen by a validated fixed artwork selector; separate short content fields carry eyebrow, two headline lines, deck, CTA and issue number. Use existing pinned Inter, MangaJDM black/red/paper styling and supplied logo. Layout owns geometry, individual fixtures own editorial. Keep important copy approximately within x80–920/y160–1620; this is our conservative composition guide, not a guarantee about every platform overlay or feed crop.

Selected sources (paths relative to the user-supplied source library; keep source-machine path out of committed docs):
1. `1-cars/nissan-skyline-gtr-r34/nissan-skyline-gtr-r34-corp-true-art-thin-logo.png`: icon-led hook, “FOR THE / OBSESSED.” Preserve the car silhouette; blank-top crop may be used inside the card.
2. `1-cars/honda-integra-multi-gen/honda-integra-multi-gen-corp-false-art.png`: heritage/engagement, “EVERY ERA. / ONE OBSESSION.” Contain the complete multi-car artwork; do not crop away generations or claim unsupported model specs.
3. `1-cars/nissan-silvia-s14-s15/nissan-silvia-s14-s15-mockup-tshirt-mockup-model-female-white.png`: wearable concept, “WEAR YOUR / NEXT CHAPTER.” Preserve the shirt print; captions disclose supplied concept/mockup imagery.
4. `4-company/mangajdm-logo/logo-mangajdm-transparent-v2-full.png`: supplied brand mark. Preview over paper to check transparent padding.

The supplied website describes apparel/coming-soon work; live mangajdm.com could not be fetched. Avoid dates, availability, pricing, technical performance or official manufacturer-affiliation claims. Use brand/art discovery CTAs and domain from the supplied branding. Choose captions and alt text separately for TikTok and Instagram; do not post to either platform. No paid generation or new image artwork is needed.

Rejected simpler alternative: the existing nutrition/Solar recipes have different fixed canvases and incompatible content/geometry, so forcing these posts into either would distort the deliverable. A one-off independent renderer would bypass the requested reusable recipe/catalog. Extend current explicit selections instead. Cap the new recipe at about150lines; no new npm dependencies, parser/framework/service/queue/editor or new tests/CI. PhaseB grid/layout IDs remain deferred; record honest friction/workaround fields through design add rather than invent grid statistics.

Risk/containment: Easy isolated commits; shared request/import/catalog selection branches are the only runtime blast radius. Existing canaries and old catalog row/digest comparisons are the shield; any changed old geometry, failed gate, unreadable type or cropped key subject is a stop-and-fix tripwire before publication. Debugging follows debug-mantra (reproduce, trace, falsify, cross-reference). Render's existing10-attempt/min12px fitting bound is retained; no retries of paid operations exist. Catalog writes preserve prior content; publish once after the recipe/declared content is stable. Changes after immutable publication require a new version/ID, not rewriting a published row. The catalog's two-file dump/log limitation remains: verify/readback after each insert; on unknown outcome reconcile before retry, and restore only owned local changes from the preceding checkpoint if needed.

### Phase 1 — QA checklist

- [x] Grounded source paths, owners, minimal alternative, rollback class and falsifiable checks are written here.
- [x] Independent plan QA Approved; native attestation and reviewer nit disposition recorded above.

## Phase 2 — Recipe, three designs and verified handoff

**Goal:** Three usable portrait promos, reproducible via the merged renderer, with verified catalog recipe and design pins and a ready PR.

- [x] Create display derivatives and source→display hashes/dimensions in `examples/2026-10-11-mangajdm-promos/assets/` and `provenance.json`; no original source edits. Keep only the four used assets, no unrelated business files.
- [x] Add `tools/recipes/mangajdm-promo.mjs`; add trusted selection to normalize/saveFixture/processRequest and one declared catalog file set. Validate fixed canvas, fixed artwork enum, bounded fields/colors, canonical asset path/namespace and display digests through existing helpers. Preserve old recipe versions/files/outputs.
- [x] Create three separate editable fixtures, export each through `node tools/render.mjs` to its own `exports/` directory (PNG/SVG/compact+inline offlineHTML). Copy selected immutable artifacts to stable per-post filenames in the example; manifest-selected bytes must match. Add captions/alt text/usage/rerender commands and a local preview gallery.
- [x] Inspect all three final PNGs and browser previews; fix clipping, weak type or lost image detail. Verify each1080×1920, all named text fits parent containment, essential copy remains inside the chosen guide, all HTML images/fonts load with zero HTTP(S), relocated compact/inline outputs remain self-contained, no missing assets or unsupported glyphs. Rerender twice with byte-identical PNG/SVG and a saved-copy editorial edit that changes only the intended text. Negative controls: unsupported art and wrong canvas refused; asset digest tamper refused/restored; duplicate catalog design add preserves dump/log bytes.
- [x] Publish recipe via catalog CLI add/publish; record three unique `2026-10-11-mangajdm-*` design IDs with `--use-case mangajdm-promo@1.0.0`, fixture, primary PNG and truthful friction/workaround fields. Read each back, verify all hashes/pins/log lines, canonical dump, and existing rows/history/log prefixes unchanged. Review the design log if a first triggering grammar flag is emitted; no unsupported grid metrics.
- [x] Record actual manual validation in the example `VERIFICATION.md`/`verification.json`; existing `pnpm test`4/4 ≤60s, catalog verify/export--check and target PDDA pass (inspect any warnings). Add a focused changelog entry and accurate current README recipe capability.
- [ ] Commit implementation; final independent Codex QA Approved within3rounds on current implementation/evidence. Resolve concrete findings surgically, rerun affected checks only. Push to origin and open a ready PR against main; verify head/base/readiness, leave issue open and clone retained for handoff. Main checkout unchanged; no merge or social publishing.

### Phase 2 — QA checklist

- [x] All three visible outputs, editable fixtures, editorial/alt text, provenance and CLI identities exist and meet checks above.
- [x] Existing4canaries, catalog integrity, old output/history preservation and PDDA evidence recorded; no new suite/dependency/CI or alternate writer.
- [ ] Final non-author Codex Approved matches the committed implementation; ready PR readback and clone handoff recorded. Remaining platform crop/UI review and real product availability are explicitly outside these local assets.

### Phase 2 evidence and disposition

Actual checks and hashes: `examples/2026-10-11-mangajdm-promos/VERIFICATION.md` and `verification.json`; command records and raw local logs are linked there. Chromium exposed short headline leading; only the new recipe leading/region changed, preserving shared guards. Early uncommitted trial catalog/log writes were retained in ignored scratch and rolled back to exact origin bytes before final CLI registration; no remote history changed. All original catalog rows/log prefix remain. Source hashes are unchanged. Final source edits remain additive and Easy to reverse; no new dependency, test suite or CI workflow. Origin/main readback remains a9aabf1. Final QA and ready PR are pending, not claimed complete.

Final QA Round1 disposition: S1 Implemented. The separate RELEASES structured `doc_path` still held the inbox location despite the roadmap text linking2-WORKING. Canonical CLI `roadmap repoint --gid rmi-01M4NWHAKMSH1P4Y6Y9H66BW0H --doc-path PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md` corrected it. CLI list readback resolves the existing plan; ledger check clean at generation52/56receipts. Evidence: `relay-system/2026-10-11/gh28-verification/ledger-repoint.json`. Runtime and published recipe content unchanged; existing canary/render evidence remains applicable. Round2 requested.

Final native QA: Round2 PASS/Approved, driver exit0, isolated reviewer Codex; reviewed04160ed3bf932c5559bcd93674e58855b54231a5. Receipt: `relay-system/2026-10-11/gh28-final-attestation.json`; thread: `gh28-final.codex.md`. Reviewer independently reproduced PNG/SVG hashes/pins and checked all three images. S1 is closed; no open Blocker/Should. Approval preserves runtime/assets/catalog content unchanged. PR creation and remote readback remain pending.
