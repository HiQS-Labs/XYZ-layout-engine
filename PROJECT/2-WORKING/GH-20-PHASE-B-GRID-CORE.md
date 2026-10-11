---
gh_issue: 20
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20
title: "Three-ID model, Phase B: grid string parser and geometry core"
status: "Deferred in full 2026-10-11 (operator decision after a least-mechanism consult); revive on the triggers in the #20 decision comment"
created: 2026-10-11
updated: 2026-10-11
owner: unassigned
doc_type: feedback
complexity: 2
risk: 2
effort: 2
phases: 3
ratings_provisional: true
branch: plan/gh20-phase-b (base origin/main at a9aabf1)
reversibility: "Easy for the parser module, the RAG adoption and the SPECS-PRD section (code and text, revertible); Costly only if the grid string is pinned as a design ID, which this plan defers."
non_goals:
  - Filling `layout_id` on design records or publishing the grid string as a stable ID (deferred to the #21 trigger of 10 reviewed designs).
  - Responsive width bands (no recipe accepts more than one canvas width today).
  - A layouts table or use_case_layouts allow-lists (no consumer).
  - Row spans, nesting, non-grid families, bracketed spans over 9 (all deferred in the #20 plan with their triggers).
  - Rewriting nutrition (flexbox) or solar-system (orbital) layouts; any change to published recipe output.
  - #23 S6 and S11: both touch catalog-pinned recipe modules (`tools/catalog.mjs:125,131`), so they need a recipe version publish, and S11's exports are live (`tools/render.mjs:213`; canary `:14,143-145`).
  - New npm dependency, new test file or test() block, CI workflow, or test-budget change.
related:
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20#issuecomment-6100771786
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/21
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/23
  - PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md
  - PROJECT/2-WORKING/SPECS-PRD.md
goal: >
  Phase B of the finalized #20 plan, cut to what has a real consumer today: one pure module that
  parses a grid string into a canonical form and computes column geometry, adopted by the RAG
  example (already an exact 6-column grid) with byte-identical output, documented as SPECS-PRD §6.6,
  plus a minimal #21 data path (`design add --layout` fills the log's layout fields; `layout_id`
  stays null). Everything that pins the grid string as an ID, or needs a second canvas width, is
  deferred to its recorded trigger.
---

## Key concepts

- A **grid string** describes one or more rows of boxes. Each digit is a column span, `0` is an
  empty cell, and `-` starts the next row. Every row must sum to the same column count.
- The **canonical form** divides every span by the greatest common divisor of all spans, so `22`
  and `11` are one layout. A run of consecutive `0`s is one empty span whose width is the run
  length, so `002` and `01` are one layout too (see Decision D2).
- **Column geometry** is `colW = (W − (N−1)·gap) / N` and `boxW = span·colW + (span−1)·gap`, with
  `x` accumulated left to right. It is pure arithmetic: it does not depend on the render backend.
- **Vertical placement stays with the caller.** The #20 grammar has no row heights; the RAG example
  uses unequal bands (`BAND_Y` at 460, 790, 1140). Row spans and row heights are deferred.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# GH-20 Phase B — Grid string parser and geometry core

> **Deferred in full (2026-10-11).** After a least-mechanism consult (Codex + Agy), the operator deferred all of Phase B. Nothing here is built. Triggers: the next hand-built grid-style diagram (parser, geometry and `design add --layout`); an operation that needs a stable layout ID (`layout_id`); a real request for the same content at two canvas widths (bands, flexbox first). #23 S6/S11 are dropped. Decision: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20#issuecomment-6112528421

## Status

| What was just completed | What's next |
|---|---|
| Draft written from a read-only map of the code at `a9aabf1`, then consulted (Codex + Agy, receipts under `relay-system/2026-10-11/gh20-phase-b-consult/`) and revised: zero-run grouping (D2), no fraction guard (D3), complete RAG rows (D6), D7 kept, S6/S11 dropped, cell-division diagnosis and fingerprint claim corrected. | Operator confirmation of the cut (D4, D5 and dropping S6/S11 deviate from the #20 finalized plan's Phase B text), then build Phases 0–2. |

## Observed current state (main `a9aabf1`)

| Area | Fact | Source |
|---|---|---|
| Nutrition recipe | Flexbox tree; widths fixed, x/y computed by Satori or Chromium. Items row `gap: 10, width: 700`, four items of `167` (not an exact grid: (700−30)/4 = 167.5). | `tools/spike/scene.mjs:106,131,139,145,150` |
| Solar-system recipe | Absolute coordinates and orbital math; not grid-like. | `tools/recipes/solar-system.mjs:139,150,172,192` |
| RAG example | Exact six-column grid: `COLX=c=>100+c*380`, `CARD_W=300`, `BAND_Y={ingest:460,store:790,query:1140}`; panels use span widths 1060 (span 3) and 680 (span 2). | `examples/2026-10-09-rag-system/render-diagram.mjs:43-44,107-109` |
| Cell-division example | Also an exact grid, over a 2192-pixel card region (right margin 108): `COLX=c=>100+c*376`, `CARD_W=312`, and (2192 − 5·64)/6 = 312. A candidate second consumer. | `examples/2026-10-09-cell-division/render-diagram.mjs:73,113,136,139-141` |
| Engine core | `processRequest` owns recipe selection, the fit loop and containment; recipes return a Satori element tree with geometry in `style`. The two examples call `renderSatori`/`renderPlaywright` directly. | `tools/render.mjs:175-374`; rag `:9,:126`; cell `:10,:153` |
| Canvas size | One recipe-owned canvas per recipe; any other width is rejected. | `tools/request.mjs:61-68,95` |
| Design records | Insert-only (`designs_no_update`, `designs_no_delete`); `design add` always inserts `layout_id = null`; `verify` requires `layout_id === null` and null layout fields in the #21 log; import refuses changed design rows. | `tools/catalog.sql:16-18`; `tools/catalog.mjs:89,179,234-236,309-311` |
| #21 log | 3 designs. Solar system is `non_grid_family`; RAG and cell division are `no_recipe`; no `needed_row_span` or `needed_span_over_9`. Layout fields are null on all three. | `tools/design-log.jsonl` |
| SPECS-PRD | §6.1–6.5 exist; §6.4 already shows `layout="grid" columns={3} gap={20}`; there is no §6.6. The render fingerprint is defined in §10.1. | `PROJECT/2-WORKING/SPECS-PRD.md:151-271,237,380-382` |
| Recipe module pins | Nutrition and solar-system module files are hashed into the catalog; any byte change fails `catalog verify` until a new version is published. | `tools/catalog.mjs:125,131,200`; `tools/catalog.sql:25` |

## Design decisions (to be stress-tested by the consult)

| # | Decision | Why |
|---|---|---|
| D1 | One new pure module `tools/grid.mjs` exporting `parseGrid`, `canonicalGrid` and `gridColumns`. No class, no registry. | One owner for the grammar and the arithmetic; nothing in `render.mjs` needs it yet, and the module has no I/O. |
| D2 | A run of consecutive `0`s is one empty span whose width is the run length; it counts in the row sum and the GCD but produces no box, and the canonical form writes it back as (length ÷ GCD) zeros. So `002` → `01`, `0022` → `011`, `22-4` → `11-2`, and leading or trailing empty runs are kept because they move boxes. An all-empty row is allowed when its column count matches; an all-empty grid, unequal row sums and characters outside `0-9` and `-` are rejected by name. | Matches the #20 grammar and its acceptance ("`22` and `11` normalize to one canonical form"). Grouping the runs (Agy) is what lets layouts with empty space reduce to one form; counting each `0` separately (Codex's reading) would force GCD 1 whenever a zero appears. |
| D3 | `gridColumns(grid, { width, gap, left = 0 })` returns, per row, `{ x, width, span }` for each non-empty cell, as computed (fractions allowed, no rounding, no option flag). | Fractions are deterministic and already reach backend styles (Codex). A consumer that needs integers checks its own output; RAG's byte-identity acceptance does exactly that. |
| D4 | **Defer `layout_id` and grid IDs.** Design rows stay `layout_id = null`; no migration 3. | Rows are insert-only (`catalog.sql:17-18`), so filling them means a schema change. Pinning the format is the Costly step the #20 plan holds until the #21 log has 10 reviewed designs; it has 3. |
| D5 | **Defer responsive width bands.** | No recipe accepts a second canvas width (`request.mjs:61-68`); a band table would have no consumer. Revive when the first recipe declares two canvas widths. |
| D6 | **First consumer: the RAG example.** Its band layout is one string, proposed as `1113-213-111111` (ingest: three cards and the `stored` panel; store: the `why` panel, one card, the `how` panel; query: six cards), computed with `{ width: 2200, gap: 80, left: 100 }`. Phase 0 confirms the rows against the code. Its PNG and SVG stay byte-identical. | Already an exact grid (column 300, x 100…2000, spans 680/1060, matching `render-diagram.mjs:44,106-108`, reproduced by both advisors). It bypasses `processRequest`, so the core render path is untouched. Cell division (exact over 2192) is a candidate second consumer, not in scope. |
| D7 | **#21 data path (kept by both advisors):** `design add --layout <grid>` validates the string with the parser and fills the log's `layout` (canonical), `columns`, `rows`, `boxes` and `span_histogram`; `verify` recomputes those derived fields from `layout` and still accepts the three legacy null lines. The `layout_id` column and its null check (`catalog.mjs:89`) stay unchanged. | It turns new designs into the data the 10-design trigger needs, without pinning an ID or migrating the schema. Only the log check at `catalog.mjs:179` changes. |
| D8 | **#23 S6 and S11 are dropped from Phase B** (both advisors). | Two of the five `sha256` copies and the S11 file are catalog-pinned recipe modules, and S11's exports are live (`render.mjs:213`). They wait for the next recipe version publish; #23 is updated to say so. |
| D9 | SPECS-PRD gains §6.6 "Grid layout strings": the grammar, canonical form, geometry, the vertical-placement limit and every deferral with its trigger. | The PRD is the contract; §6.4 already uses a grid. |

## Phases

### Phase 0 — Prove the RAG baseline and rows before writing code
- Save the committed RAG `verification.json` digests first (the render script overwrites that file, `render-diagram.mjs:179-180`), re-render on `main`, and confirm the PNG and SVG digests match. If the baseline does not reproduce, stop and report.
- Confirm the three band rows of D6 against the code, and recompute every `x` and width from the formula against the literals. Exit: a recorded table with zero differences.

### Phase 1 — `tools/grid.mjs`, RAG adoption, canary assertions
- Write the module (D1–D3). Extend an existing canary (no new test): `22` = `11`; `002` = `01`; `22-4` = `11-2`; unequal rows, bad characters and an all-empty grid rejected by name; an all-empty row allowed; RAG's widths come out as 300, 680 and 1060.
- Replace the RAG literals with `gridColumns` output (D6); vertical placement unchanged.
- Red controls: removing GCD reduction, zero-run grouping or the row-sum check each turns the canary red.
- Exit: RAG PNG/SVG digests equal the Phase 0 baseline; `catalog verify` valid (the RAG design's `artifact_digest` is unchanged); `pnpm test` 4/4 within 60 s.

### Phase 2 — #21 log data path and SPECS-PRD §6.6
- D7: `design add --layout`, with `verify` recomputing the derived log fields; the three legacy lines still verify. Red control: a log line whose `columns` disagrees with its `layout` fails `verify`.
- D9: §6.6 with the grammar, zero runs, canonical form, geometry, the vertical-placement limit and each deferral with its trigger. README and CHANGELOG entries.
- Exit: `pnpm test` 4/4; `catalog verify` valid; nutrition and solar-system output byte-identical (C2; note C2 skips byte checks across differing hosts, `canaries.test.mjs:368`, so also compare on this host).

## Acceptance (each can fail)

- `canonicalGrid('22') === canonicalGrid('11')` and `canonicalGrid('002') === canonicalGrid('01')`; unequal row sums are rejected.
- The same string always gives the same geometry (a pure function, asserted by value).
- RAG's re-rendered PNG and SVG are byte-identical to the Phase 0 baseline, and `catalog verify` is valid.
- A design added with `--layout` has log fields that `verify` recomputes; a tampered `columns` fails `verify`; `layout_id` stays null.
- No catalog-pinned recipe file changes; no new test file, `test()` block, dependency or workflow; `pnpm test` 4/4 within 60 s.

## Risks and rollback

| Risk | Mitigation | Rollback |
|---|---|---|
| RAG output shifts by a pixel | Phase 0 baseline and row check first; byte-identity acceptance | Revert the RAG change (Easy) |
| The grammar is wrong for real designs | Nothing pins it as an ID (D4); #21 collects data through D7 | Change the module freely (Easy) |
| D7 log format change | Legacy null lines stay valid; only new designs carry layout fields | Revert (Easy); the log is append-only text |

## Consult record

Codex and Agy were asked the six questions below on the draft (`e558939`). Receipts: `relay-system/2026-10-11/gh20-phase-b-consult/`.

| Question | Codex | Agy | Adjudication |
|---|---|---|---|
| 1. Defer `layout_id` and width bands | Agree | Agree | Kept (D4, D5) |
| 2. RAG as first consumer | Agree; give complete rows | Agree | Kept; rows proposed, Phase 0 confirms (D6) |
| 3. Zero semantics | Each `0` one column; any zero forces GCD 1 | Group zero runs before the GCD | Agy: otherwise layouts with empty space never reduce (D2) |
| 4. Fraction guard | Return fractions; no rounding | Keep the guard | Codex: fewer knobs; RAG acceptance checks its own bytes (D3) |
| 5. D7 | Keep, minimal; leave `layout_id` null check | Keep | Kept (D7) |
| 6. Over-built or missing | Drop S6/S11; save baseline before re-render | Drop S11 (pinned recipe) | Both dropped (D8); baseline step added to Phase 0 |
| Blockers | S11 exports are live; pinned recipe edits fail `verify` | Pinned recipe; zero GCD | All resolved above |
| Corrections | Cell division exact over 2192; fingerprint is in §10.1 | Cell division exact over 2192 | Both corrected in the state table |
