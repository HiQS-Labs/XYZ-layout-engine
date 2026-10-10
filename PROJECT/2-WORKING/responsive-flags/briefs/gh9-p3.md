---
title: "GH-9 Phase 3 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 3 (docs and handoff) of the canonical GH-9 responsive flags plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-9 under umbrella GH-19. | Execute only after gh9-p2 is approved and its gate passed. |

# GH-9 Phase 3 — Docs and handoff

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9.
Canonical plan: `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, Phase 3. Builder: Codex. Reviewer: independent Agy. Strictly serial after gh9-p2.

## Goal

Document the two flags, their defaults, the exact width rule, the `narrow` output and the 1.1.0
bump; record the iteration.

## Allowed files

`README.md`, `PROJECT/2-WORKING/SPECS-PRD.md` (one delivered-observation note under §6),
`CHANGELOG.md`.

## Scope

- README: flags, defaults, width rule (`W < stackBelow`, strict), orders, exact commands and exit codes, fixed-height non-fit behavior.
- PRD §6: note that responsiveness resolves at scene-build time with fixed declared outputs; auto-height and container queries deferred.
- CHANGELOG: `Refs #9`, `Refs #19`; no closing keyword.

## Acceptance (each can fail; red control in brackets)

- G3-A1 Each README flag command run from a `$TMPDIR` copy returns its documented exit code. [Red: `--param stackOrder=random` exits 1.]
- G3-A2 `utils/pdda/pdda.sh run` reports no errors. [Red: an absolute home path raises a hardcoded-paths finding.]
- G3-A3 `git diff --name-only <phase base>` lists only the three allowed files. [Red: any other path is listed.]

## Gate

Driver runs `pnpm test` after independent review (exit 0, 4/4). Builder runs only the G3 checks and
records command, exit code and key output in the relay.

## Boundaries and proof

Docs describe delivered behavior only; human visual approval of the narrow output remains pending.
No runtime, test, ledger, plan or brief edits. Do not run `pnpm test`. Repo-relative paths only.

**No push, no PR, no merge, no issue close.** The orchestrator prepares the ready PR (`Refs #9`)
only after the final wave QA.

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.
