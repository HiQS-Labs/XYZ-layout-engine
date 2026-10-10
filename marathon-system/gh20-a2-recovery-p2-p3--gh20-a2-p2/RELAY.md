# Marathon Phase gh20-a2-p2
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH20-A2-P2-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-20 A2 Phase 2 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 2 (seed three designs and the design log) of the canonical GH-20 Phase A2 plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-20 under umbrella GH-19. | Execute only after gh20-a2-p1 is approved and the driver gate passed. |

# GH-20 A2 Phase 2 — Seed three designs and the design log

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20 (design log: #21).
Canonical plan: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, "Observed current state" (seed table) and "Phase 2".
Builder: Codex. Reviewer: independent Agy. Strictly serial after gh20-a2-p1.

## Goal

Record the three existing examples through `node tools/catalog.mjs design add` only, so the
`designs` rows and the first three lines of `tools/design-log.jsonl` are CLI output.

## Allowed files

`tools/catalog.sql` and `tools/design-log.jsonl`, both written only by the CLI. No hand edits.

## Scope

- Run in this order from the repo root (replace the angle-bracket intent with one honest sentence
  of at most 200 characters after reading each example's `render-diagram.mjs` and `fixture.json`):
  - `node tools/catalog.mjs design add 2026-10-08-solar-system --fixture examples/2026-10-08-solar-system/fixture.json --artifact examples/2026-10-08-solar-system/solar-system.png --use-case solar-system@1.0.0 --flags non_grid_family --friction "<orbital placement, not a grid of boxes>"`
  - `node tools/catalog.mjs design add 2026-10-09-rag-system --fixture examples/2026-10-09-rag-system/fixture.json --artifact examples/2026-10-09-rag-system/rag-system.png --friction "<no recipe; lanes, empty cells and connectors>"`
  - `node tools/catalog.mjs design add 2026-10-09-cell-division --fixture examples/2026-10-09-cell-division/fixture.json --artifact examples/2026-10-09-cell-division/cell-division.png --friction "<no recipe; one row of six, group bands span columns>"`
- Set `layout_forced` or `--workarounds` only with evidence from the example source. No personal
  data, credentials or paths in friction text.
- If any add fails, stop: do not hand-write rows or log lines; restore both files with
  `git checkout -- tools/catalog.sql tools/design-log.jsonl` (or remove the new log) and report.

## Acceptance (each can fail; red control in brackets)

- P2-A1 `node tools/catalog.mjs design list --json` returns exactly the three IDs with digests equal to the plan's seed table; solar pinned `solar-system@1.0.0`; RAG and cell-division `use_case: null`. [Red: one flipped byte in `rag-system.png` in a `$TMPDIR` copy makes `verify` exit 1 naming `2026-10-09-rag-system`.]
- P2-A2 `tools/design-log.jsonl` has 3 lines; line 1 `"no_recipe":false` and `"non_grid_family":true`, lines 2–3 `"no_recipe":true`. [Red: deleting line 2 in a `$TMPDIR` copy fails `verify`; duplicating line 3 fails `verify`.]
- P2-A3 `verify` and `export --check` exit 0. [Red: editing one recipe `content_sha256` in a `$TMPDIR` dump copy exits 1 `inconsistent published digest`.]
- P2-A4 `git diff --exit-code <P1 head> -- tools/catalog.mjs tools/spike/test/canaries.test.mjs examples` exits 0. [Red: any code edit exits 1.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4, C2 `byte-identical`, C1 nutrition
receipt `catalog.verified: true` (C1 now runs with seeded designs whose example files are absent in
its temp root). Builder runs only the P2 checks and records command, exit code and key output.

## Boundaries and proof

Ponytail: three CLI invocations, nothing else. Do not edit code, examples, docs, the plan, briefs,
`releases.db/sql`, `test-budget.json`, `package.json` or `pnpm-lock.yaml`. Do not run `pnpm test`.
Leave no lock or temp file. The operator approves the ID rule and the three seed IDs before merge
(Costly once shared). On failure emit `VERDICT: FAIL` or `PARKED` with evidence; never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.

## Close rules for the reviewer (harness note, forge #1020)

When you approve, set the `STATUS:` line at the top of the relay file to `Approved` (not only inside your block) and do not run `tick release`; the harness closes the token. When you do not approve, leave `STATUS: Open` and list the blockers.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): tools/catalog.sql, tools/design-log.jsonl
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick claim MARATHON-GH20-A2-P2-TURN --agent codex --paths "marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p2/RELAY.md,tools/catalog.sql, tools/design-log.jsonl"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick ping MARATHON-GH20-A2-P2-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P2-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p2/RELAY.md and tools/catalog.sql, tools/design-log.jsonl. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: tools/catalog.sql, tools/design-log.jsonl. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P2-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick done MARATHON-GH20-A2-P2-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   Edit ONLY marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p2/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
4b. TO VERIFY A FINDING, WRITE PROBE FILES OUTSIDE THE REPO — under $TMPDIR, never inside the
   working tree. Creating even one scratch file in the repo is an off-lane write: containment
   reverts it and FAILS YOUR WHOLE TURN, discarding the review you just did (GH-441). Observed
   2026-08-08: a reviewer found a real latent crash, wrote two probe files in-tree to demonstrate
   it, and lost the turn for doing so — the finding survived only because RELAY.md happens to be
   on your allowlist. `cp` what you need to "$TMPDIR/probe.$$/" and work there instead. Verifying
   is wanted; verifying in-tree is what costs you the turn.
4c. A finding that asks for a behaviour change is a generalization unless you can paste the concrete
   input — a row, a value, a `file:line` — that fails under the current code (GH-681). Every
   `[Blocker]` or `[Should]` requesting a behaviour change MUST carry `Observed input:`,
   `Affected scope:` and `Falsifier:` lines; a `[Blocker]` must cite an observed failure. The Builder
   may disposition a request lacking these as `Declined — unproven generalization`.
5. HAND OFF EXPLICITLY (GH-268): end your turn by naming who acts next — "handing off to codex —
   codex, take your turn" when requesting changes, or "relay closed, no further turn needed" when
   approving. The beta report singled this out: the Reviewer turn did not tell the user to go back to the
   Producer, so the relay looked stalled when it was simply waiting. Do this EVERY round.
