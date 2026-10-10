---
title: "GH-9 Phase 0 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 0 (spike and go/no-go) of the canonical GH-9 responsive flags plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-9 under umbrella GH-19. | Execute only after the GH-10 lane is accepted and this branch is cut from it. |

# GH-9 Phase 0 — Spike: backend evidence, narrow output and go/no-go

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9.
Canonical plan: `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, Phase 0 and Design (the exact width rule).
Order: gh9-p0 -> gh9-p1 -> gh9-p2 -> gh9-p3, strictly serial. Builder: Codex. Reviewer: independent Agy.

## Goal

Evidence that tree reordering plus `flexDirection: 'column'` works identically in both pinned
backends, the narrow nutrition output height `H` that fits, whether `createScene` widths must become
canvas-relative, and a go/no-go. No engine code.

## Allowed files

Only `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, and inside it only a new
`### Phase 0 findings` subsection. All prototypes and renders run from a scratch copy under
`$TMPDIR` (copy `tools/`, `package.json`, symlink `node_modules`).

## Scope

- Render a tiny tree in Satori and Chromium with `flexDirection: 'column'` and with CSS `order` on
  children; record whether each honors `order`.
- Prototype the width rule on the scratch copy at `W = 640` for nutrition `hero`, `lower`, `items`;
  find the smallest `H <= 2400` that fits with zero unresolved text in `source`, `priority` and `rtl`
  on both backends; record bounds and two repeat digests.
- If widths must become canvas-relative, prove the 1000x1000 `createScene` tree deep-equals the
  current one (`node:util` `isDeepStrictEqual`).
- Record chosen `stackBelow` values, `STACK_PRIORITY` entries, request names and a `Decision:` line
  (go/no-go). On no-go, stop: emit `VERDICT: PARKED`.

## Acceptance (each can fail; red control in brackets)

- G0-A1 Findings contain `H`, thresholds and a `Decision:` line. [Red: `rg -n "^Decision:"` fails if absent.]
- G0-A2 Narrow prototype fits and two repeats share a PNG digest. [Red: the same prototype at `H - 200` reports non-fit.]
- G0-A3 Deep-equal of the 1000 tree holds (if a refactor is proposed). [Red: changing one width literal breaks it.]
- G0-A4 `git status --porcelain` shows only the plan file. [Red: any scratch file in the repo is listed.]

## Gate

Driver runs `pnpm test` after independent review (exit 0, 4/4). Builder runs only the G0 checks and
records command, exit code and key output in the relay.

## Boundaries and proof

No runtime, recipe, test, golden, ledger, brief or package edits. No CSS media queries, measurement
pass, auto-height or second engine are acceptable outcomes; if the design needs one, stop and park.
Do not run `pnpm test`. No paid calls or network. Debug-mantra on failures; never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.
