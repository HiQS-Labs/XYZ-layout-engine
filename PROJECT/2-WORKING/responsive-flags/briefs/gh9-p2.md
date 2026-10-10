---
title: "GH-9 Phase 2 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 2 (nutrition adoption, narrow output and catalog bump) of the canonical GH-9 plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-9 under umbrella GH-19. | Execute only after gh9-p1 is approved and its gate passed. |

# GH-9 Phase 2 — Nutrition adoption, narrow output and catalog bump

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9.
Canonical plan: `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, Phase 2 and Phase 0 findings; version bump rule in `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`. Builder: Codex. Reviewer: independent Agy.

## Goal

Nutrition declares `PARAMS`, `STACKS`, `STACK_PRIORITY` and the `narrow` output, renders it
deterministically with `responsive: true`, and is published as 1.1.0 through the catalog.

## Allowed files

`tools/recipes/nutrition.mjs`, `tools/spike/scene.mjs` (canvas-relative widths only if the Phase 0
findings require it; hero scene untouched), `tools/request.mjs` (add nutrition `narrow` 640 x `H`),
`tools/catalog.sql` (via `node tools/catalog.mjs publish`, never hand-edited),
`tools/spike/test/canaries.test.mjs` (extend C1 only).

## Scope

- Nutrition module: `PARAMS` allow list (`responsive`, `stackOrder`), `STACKS` and `STACK_PRIORITY`
  from Phase 0, `version = '1.1.0'` (minor: additive, default off, unflagged output unchanged).
- `node tools/catalog.mjs publish nutrition 1.1.0` with the Phase 0 file set plus the `narrow` output.
- C1: narrow + `responsive:true` twice (equal digests, `layout.resolved` shows `column`), narrow
  without `responsive` reports non-fit, default output digests unchanged with no params,
  `responsive:false`, and `responsive:true` at 1000.

## Acceptance (each can fail; red control in brackets)

- G2-A1 From a `$TMPDIR` copy, `--output narrow --param responsive=true --param stackOrder=priority` exits 0 twice with equal PNG digests and `column` in `layout.resolved`. [Red: `--output narrow` without `responsive` exits 1 `non-fit`.]
- G2-A2 Default nutrition digests equal the GH-10 head's. [Red: altering one width literal at 1000 changes them.]
- G2-A3 `node tools/catalog.mjs verify` exits 0 showing `RCP-0001 nutrition@1.1.0`. [Red: `publish nutrition 1.0.0` with the new files exits 1 `already published with different content`, dump unchanged.]
- G2-A4 `git diff --exit-code <GH-10 head> -- tools/spike/output tools/recipes/solar-system.mjs examples test-budget.json package.json` exits 0. [Red: any such edit exits 1.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4, `C2 digests:` line says
`byte-identical`. Builder runs only the G2 checks from `$TMPDIR` copies (catalog `publish` is the one
in-repo write, to `tools/catalog.sql`) and records command, exit code and key output in the relay.

## Boundaries and proof

No goldens, solar recipe or example, spike renderer/verifier, plan, brief, ledger, budget or package
edits. Never `--out` inside the repo; leave no `tools/.catalog.lock`. Record an agent visual check of
the narrow PNG; human visual approval stays pending. Do not run `pnpm test`. No paid calls. Emit
`VERDICT: FAIL` or `PARKED` with evidence if blocked. Never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.
