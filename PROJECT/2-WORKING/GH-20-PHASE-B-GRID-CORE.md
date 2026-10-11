---
gh_issue: 20
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20
title: "Three-ID model, Phase B: grid string parser and geometry core"
status: "Draft; awaiting cross-model plan consult (Codex + Agy)"
created: 2026-10-11
updated: 2026-10-11
owner: unassigned
doc_type: feedback
complexity: 2
risk: 2
effort: 2
phases: 4
ratings_provisional: true
branch: plan/gh20-phase-b (base origin/main at a9aabf1)
reversibility: "Easy for the parser module, the RAG adoption and the SPECS-PRD section (code and text, revertible); Costly only if the grid string is pinned as a design ID, which this plan defers."
non_goals:
  - Filling `layout_id` on design records or publishing the grid string as a stable ID (deferred to the #21 trigger of 10 reviewed designs).
  - Responsive width bands (no recipe accepts more than one canvas width today).
  - A layouts table or use_case_layouts allow-lists (no consumer).
  - Row spans, nesting, non-grid families, bracketed spans over 9 (all deferred in the #20 plan with their triggers).
  - Rewriting nutrition (flexbox) or solar-system (orbital) layouts; any change to published recipe output.
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
  example (already an exact 6-column grid) with byte-identical output, documented as SPECS-PRD §6.6.
  #23 S6 (one sha256/round owner) and S11 (dead nutrition re-exports) ride along. Everything that
  pins the grid string as an ID, or needs a second canvas width, is deferred to its recorded trigger.
---

## Key concepts

- A **grid string** describes one or more rows of boxes. Each digit is a column span, `0` is an
  empty cell, and `-` starts the next row. Every row must sum to the same column count.
- The **canonical form** divides every span by the greatest common divisor of all spans, so `22`
  and `11` are one layout. The empty-cell digit `0` takes part as a span-1 cell (see Decision D2).
- **Column geometry** is `colW = (W − (N−1)·gap) / N` and `boxW = span·colW + (span−1)·gap`, with
  `x` accumulated left to right. It is pure arithmetic: it does not depend on the render backend.
- **Vertical placement stays with the caller.** The #20 grammar has no row heights; the RAG example
  uses unequal bands (`BAND_Y` at 460, 790, 1140). Row spans and row heights are deferred.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# GH-20 Phase B — Grid string parser and geometry core

## Status

| What was just completed | What's next |
|---|---|
| Draft written from a read-only map of the current code at `a9aabf1`. Two items of the original Phase B text have no consumer today and are proposed as deferred (D4, D5). | Cross-model consult (Codex + Agy), reconcile, then operator confirmation before any build. |

## Observed current state (main `a9aabf1`)

| Area | Fact | Source |
|---|---|---|
| Nutrition recipe | Flexbox tree; widths fixed, x/y computed by Satori or Chromium. Items row `gap: 10, width: 700`, four items of `167` (not an exact grid: (700−30)/4 = 167.5). | `tools/spike/scene.mjs:106,131,139,145,150` |
| Solar-system recipe | Absolute coordinates and orbital math; not grid-like. | `tools/recipes/solar-system.mjs:139,150,172,192` |
| RAG example | Exact six-column grid: `COLX=c=>100+c*380`, `CARD_W=300`, `BAND_Y={ingest:460,store:790,query:1140}`; panels use span widths 1060 (span 3) and 680 (span 2). | `examples/2026-10-09-rag-system/render-diagram.mjs:43-44,107-109` |
| Cell-division example | Near-grid: `COLX=c=>100+c*376`, `CARD_W=312`; the formula gives 313.33, not 312. | `examples/2026-10-09-cell-division/render-diagram.mjs:73,113,136,139-141` |
| Engine core | `processRequest` owns recipe selection, the fit loop and containment; recipes return a Satori element tree with geometry in `style`. The two examples call `renderSatori`/`renderPlaywright` directly. | `tools/render.mjs:175-374`; rag `:9,:126`; cell `:10,:153` |
| Canvas size | One recipe-owned canvas per recipe; any other width is rejected. | `tools/request.mjs:61-68,95` |
| Design records | Insert-only (`designs_no_update`, `designs_no_delete`); `design add` always inserts `layout_id = null`; `verify` requires `layout_id === null` and null layout fields in the #21 log; import refuses changed design rows. | `tools/catalog.sql:16-18`; `tools/catalog.mjs:89,179,234-236,309-311` |
| #21 log | 3 designs. Solar system is `non_grid_family`; RAG and cell division are `no_recipe`; no `needed_row_span` or `needed_span_over_9`. Layout fields are null on all three. | `tools/design-log.jsonl` |
| SPECS-PRD §6 | 6.1–6.5 exist; §6.4 already shows `layout="grid" columns={3} gap={20}`; there is no §6.6 and no fingerprint definition. | `PROJECT/2-WORKING/SPECS-PRD.md:151-271,237,312` |

## Design decisions (to be stress-tested by the consult)

| # | Decision | Why |
|---|---|---|
| D1 | One new pure module `tools/grid.mjs` exporting `parseGrid`, `canonicalGrid` and `gridColumns`. No class, no registry. | One owner for the grammar and the arithmetic; nothing in `render.mjs` needs it yet, and the module has no I/O. |
| D2 | `0` is a span-1 empty cell that is counted in the row sum and the GCD, but produces no box. `11-2` is canonical `11-2`; `22-4` canonicalizes to `11-2`. Rows with unequal sums, characters outside `0-9` and `-`, empty rows and an all-empty grid are rejected with a named error. | Matches the #20 grammar and its acceptance ("`22` and `11` normalize to one canonical form; unequal row sums rejected"). |
| D3 | `gridColumns(grid, { width, gap, left = 0 })` returns, per row, `{ x, width, span }` for each non-empty cell. It refuses non-integer results unless the caller passes `allowFraction: true`. | RAG's numbers are integers, which keeps its output byte-identical; refusing fractions surfaces near-grids like cell division (313.33) instead of silently moving pixels. |
| D4 | **Defer `layout_id` and grid IDs.** Design rows stay `layout_id = null`; no migration 3. | Rows are insert-only (`catalog.sql:17-18`), so filling them means a schema change. Pinning the format is the Costly step the #20 plan holds until the #21 log has 10 reviewed designs; it has 3. |
| D5 | **Defer responsive width bands.** | No recipe accepts a second canvas width (`request.mjs:61-68`); a band table would have no consumer. Revive when the first recipe declares two canvas widths. |
| D6 | **First consumer: the RAG example.** Its `COLX` and span widths come from `gridColumns(parseGrid('111111'), { width: 2200, gap: 80, left: 100 })` and span rows such as `33` and `2…`; its PNG and SVG stay byte-identical to `verification.json` and the catalog digest. | It is already an exact grid, so adoption proves the function on a real artifact with zero visual change. Nutrition and solar system are not grids; cell division is not exact. |
| D7 | **#21 data path (optional, consult decides):** `design add --layout <grid>` validates the string with the parser and fills the log's `layout`, `columns`, `rows`, `boxes` and `span_histogram`, while the `layout_id` column stays null. | It turns new designs into the data the 10-design trigger needs, without pinning an ID. It needs a small change to the `verify` checks at `catalog.mjs:89,179`. |
| D8 | **#23 S6 and S11 ride along.** One `sha256` and one `round` owner (five and two copies today); the dead re-exports in `tools/recipes/nutrition.mjs:22-23` are removed. The spike's second font-fit loop is left alone. | Same files are touched; small, mechanical. The font-fit loop belongs to the frozen spike and would change behavior. |
| D9 | SPECS-PRD gains §6.6 "Grid layout strings": the grammar, canonical form, geometry, the vertical-placement limit and every deferral with its trigger. | The PRD is the contract; §6.4 already uses a grid. |

## Phases

### Phase 0 — Verify the RAG arithmetic before writing code
- Recompute every RAG `x` and width from the formula and diff them against the literals at `render-diagram.mjs:43-44,107-109`. Re-render RAG on `main` and confirm its PNG/SVG digests match `verification.json`, which proves the baseline is reproducible before anything changes.
- Exit: a recorded table of literal-vs-formula values with zero differences, and a reproducible baseline digest. If the baseline is not reproducible, stop and report.

### Phase 1 — `tools/grid.mjs` and canary assertions
- Write the module (D1–D3).
- Extend an existing canary (no new test): canonical `22` = `11`; `22-4` = `11-2`; unequal rows, bad characters and an empty grid are rejected by name; RAG's widths come out as 300, 680 and 1060; a fractional result is refused without `allowFraction`.
- Red controls: removing GCD reduction, the row-sum check or the fraction guard each turns the canary red.

### Phase 2 — RAG adopts the module
- Replace the RAG literals with `gridColumns` output (D6). Leave vertical placement as it is.
- Exit: re-rendered PNG and SVG digests equal `verification.json`; `catalog verify` is still valid (the design's `artifact_digest` is unchanged); `pnpm test` 4/4 within 60 s.

### Phase 3 — SPECS-PRD §6.6, #23 S6/S11, docs
- §6.6 (D9). One `sha256`/`round` owner and callers switched (D8); S11 removed. README and CHANGELOG entries.
- Optional, only if the consult keeps it: D7.
- Exit: `pnpm test` 4/4; `node tools/catalog.mjs verify` valid; nutrition and solar-system goldens byte-identical; `git grep` finds one `sha256` helper definition.

## Acceptance (each can fail)

- `canonicalGrid('22') === canonicalGrid('11')`, and a grid with unequal row sums is rejected.
- The same string always gives the same geometry (pure function; asserted by value, not by backend).
- RAG's re-rendered PNG and SVG are byte-identical to `verification.json`, and `catalog verify` is valid.
- Nutrition and solar-system output are byte-identical (the existing drift canary C2 passes).
- No new test file, `test()` block, dependency or workflow; `pnpm test` 4/4 within 60 s.

## Risks and rollback

| Risk | Mitigation | Rollback |
|---|---|---|
| RAG output shifts by a pixel | Phase 0 proves the arithmetic first; the fraction guard refuses non-integers | Revert Phase 2 (Easy) |
| The grammar is wrong for real designs | Nothing pins it as an ID (D4); #21 keeps collecting data | Change the module freely (Easy) |
| S6 helper move changes a hash | Byte-identical goldens and `catalog verify` catch it | Revert Phase 3 (Easy) |

## Consult questions

1. Is the cut right: defer `layout_id` (D4) and width bands (D5), or does either have a consumer we missed?
2. Is the RAG example the right first consumer, given that it is not a recipe and bypasses `processRequest`? Would "used by at least one existing render path" be better met another way?
3. Is `0` as a counted span-1 empty cell (D2) the right reading of the #20 grammar? Any canonical-form trap (for example `0` rows or leading zeros)?
4. Is the fraction guard (D3) the right default, or should geometry round deterministically?
5. Keep or drop D7 (`design add --layout` filling #21 log fields)?
6. Is anything here over-built, or missing, for an early-stage single-developer repo?
