---
title: "GH-9 Phase 1 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 1 (pure resolver and request admission) of the canonical GH-9 responsive flags plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-9 under umbrella GH-19. | Execute only after gh9-p0 is approved with a go decision. |

# GH-9 Phase 1 — Pure resolver and request admission

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9.
Canonical plan: `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, Phase 1, Design and Phase 0 findings. Builder: Codex. Reviewer: independent Agy. Strictly serial after gh9-p0.

## Goal

The pure resolver implementing the exact width rule, request admission for `params` and `output`,
and receipt fields, with no recipe adopting flags yet and no artifact change.

## Allowed files

`tools/stack.mjs` (new), `tools/request.mjs`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`
(extend C1 only; no new `test()`).

## Scope

- `tools/stack.mjs`: no imports, no I/O, no clock or randomness. Collapse a `STACKS` node only when
  `responsive === true` and `W < stackBelow`; orders `source`, `priority` (stable, default 100),
  `rtl`; bounds `stackBelow` 1..8192, `stackPriority` 1..99; unknown `STACKS` id is an error.
- `tools/request.mjs`: allowlist `params` and `output` (`:32`); named output table replacing the
  literals at `:61`, defaults equal today's canvases; reject `params` for a recipe without `PARAMS`,
  unknown keys, wrong types and values outside the enum, with field paths.
- `tools/render.mjs`: call the resolver after `buildScene` only when `responsive === true`; add
  `normalized.params`, `normalized.output` and `layout.resolved`; CLI `--param k=v` and `--output name`.
- C1: synthetic-tree order checks (tie, unnumbered, rtl), boundary `W == stackBelow` stays row and
  `stackBelow - 1` collapses, invalid-flag rejections, unflagged nutrition digests unchanged.

## Acceptance (each can fail; red control in brackets)

- G1-A1 Synthetic `priority` order with a tie and an unnumbered child equals the expected id list; `W == stackBelow` stays row. [Red: a `<=` comparison or unstable sort fails.]
- G1-A2 From a `$TMPDIR` copy, `node tools/render.mjs tools/spike/fixture.json --out out --format png,svg` digests equal the GH-10 head's. [Red: a `--set` text edit changes them.]
- G1-A3 `--param stackOrder=random` and `--recipe solar-system --param responsive=true` exit 1 with field paths. [Red: `--param responsive=false` on nutrition is also rejected in this phase because nutrition has no `PARAMS` yet.]
- G1-A4 `rg -n "import|Date|Math.random|performance" tools/stack.mjs` finds nothing. [Red: the same pattern matches `tools/render.mjs`.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4, output contains `C2 digests:` with
`byte-identical` (a `skipped` line fails the phase). Builder runs only the G1 checks from `$TMPDIR`
copies and records command, exit code and key output in the relay.

## Boundaries and proof

No recipe, `tools/spike/scene.mjs`, goldens, catalog, plan, brief, ledger, budget or package edits.
No CSS media query, CSS `order`, measurement pass or second layout pass. Never `--out` inside the repo.
Do not run `pnpm test`. No paid calls or network. Emit `VERDICT: FAIL` or `PARKED` with evidence if
blocked. Never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.
