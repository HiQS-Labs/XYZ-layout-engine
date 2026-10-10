# Marathon Phase gh20-a2-p1
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH20-A2-P1-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-20 A2 Phase 1 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 1 (designs table, CLI verbs, verify and C4) of the canonical GH-20 Phase A2 plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-20 under umbrella GH-19. | Execute only after gh20-a2-p0 is approved with a go decision. |

# GH-20 A2 Phase 1 — Designs table, CLI verbs, verify and C4

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20 (design log: #21).
Canonical plan: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, D1–D8, "Test scope" and "Phase 1". Read the Phase 0 findings first; they override D1–D8 where they differ.
Builder: Codex. Reviewer: independent Agy. Strictly serial after gh20-a2-p0.

## Goal

Add the insert-only `designs` table (migration 2), the NULL literal, `design list|show|add`, the
#21 log append and the `verify` design checks to `tools/catalog.mjs`; migrate the committed dump
through the CLI; extend C4.

## Allowed files

`tools/catalog.mjs`, `tools/catalog.sql` (only via `node tools/catalog.mjs import tools/catalog.sql`,
never hand-edited), `tools/spike/test/canaries.test.mjs` (C4 catalog section only: the two
`schema_migrations` literals at `:421`/`:460` plus at most 15 added lines; no new `test()`).

## Scope

- D1: freeze today's `SCHEMA` as `SCHEMA_V1`; derive `SCHEMA` with the two exact replacements plus
  the three-line `DESIGNS_DDL`; append `designs` to `TABLES` (`ORDER BY id`); `loadDump` admits the
  V1 header (no `designs` rows; adds migration row 2); `validateLedger` requires migrations `[1,2]`.
- D2: `quote(null)` -> `NULL`; tokenizer `NULL` alternative.
- D3/D4: ID rule with calendar check; one shared relative-path helper (lifted from `:60`), `examples/`
  prefix, `.json`/`.png` suffixes, bytes only via `fileBytes`.
- D5–D7: `design add <id> --fixture P --artifact P --friction T [--use-case slug@semver] [--flags …] [--workarounds N]`,
  `design list|show [--json]`; lock + transaction + `atomicDump`, then append one canonical log line
  to `tools/design-log.jsonl`; refuse an ID present in the table or the log; `design update`/`delete`
  and a missing subverb are usage errors (exit 2).
- D8: structural design rules in `validateLedger`; digest recomputation and log rules in `verify`;
  error `field` is the design ID or `design-log`, never `dump`, a recipe slug or a recipe path.
  Do not edit `tools/render.mjs`.
- Run `node tools/catalog.mjs import tools/catalog.sql` once; commit the regenerated dump.
- C4 in its existing temp root: migration-2 empty dump literals; NULL-use-case `design add` of the
  already-copied solar example; second add refused with dump and log sha256 unchanged; unknown pin
  refused; forged `artifact_digest`, removed log line and orphan log line each fail `verify`;
  `UPDATE`/`DELETE designs` abort in-process; `design update` exits 2.

## Acceptance (each can fail; red control in brackets)

- P1-A1 `verify` and `export --check` exit 0 on the migrated dump. [Red: `$TMPDIR` copy without the `designs` DDL line exits 1.]
- P1-A2 `git diff -U0 <base> -- tools/catalog.sql | rg -c '^-INSERT'` finds 0; two `schema_migrations` rows. [Red: fresh `add`/`publish` in a `$TMPDIR` copy yields `-INSERT` lines.]
- P1-A3 NULL-use-case `design add` succeeds and `export --check` exits 0 in a `$TMPDIR` copy; a NULL in a recipe column fails to load. [Red: with D2 reverted the NULL row fails `invalid SQL literal`.]
- P1-A4 Second `design add` of one ID exits 1 `design already recorded`; dump and log sha256 unchanged. [Red: a new ID with the same files exits 0.]
- P1-A5 `design update x` exits 2. [Red: `design list` exits 0.]
- P1-A6 `rg -n 'prepare\(\s*`[^`]*\$\{' tools/catalog.mjs` finds nothing. [Red: matches a scratch template-literal SQL line.]
- P1-A7 `git diff --exit-code <base> -- package.json pnpm-lock.yaml test-budget.json tools/render.mjs tools/request.mjs tools/recipes examples tools/spike/output` exits 0. [Red: any edit exits 1.]
- P1-A8 C4 fails in a `$TMPDIR` copy when `designs_no_update` is dropped, and C1 `:43` fails when a design error uses `field:'dump'` (reviewer verifies). [Red is the check.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4, `test-budget: PASS` under 60 s
(record the seconds; baseline 43.2 s), 1 file/4 tests/0 workflows. Builder runs only the P1 checks,
mutating probes only in `$TMPDIR` copies, and records command, exit code and key output.

## Boundaries and proof

Ponytail: one module, Node built-ins only; no new dependency, test file, `test()` block, workflow,
`--log` flag or helper module. Do not edit `tools/render.mjs`, `tools/request.mjs`, recipe modules,
`examples/**`, goldens, the plan, briefs, `releases.db/sql`, `test-budget.json`, `package.json` or
`pnpm-lock.yaml`. Do not seed the three designs (Phase 2). Do not run `pnpm test`. Leave no lock,
log or temp file in the repo. No paid calls or network. On an undeliverable requirement emit
`VERDICT: FAIL` or `PARKED` with evidence. Debug-mantra on failures; never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick claim MARATHON-GH20-A2-P1-TURN --agent codex --paths "marathon-system/gh20-a2-catalog-designs--gh20-a2-p1/RELAY.md,tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick ping MARATHON-GH20-A2-P1-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P1-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh20-a2-catalog-designs--gh20-a2-p1/RELAY.md and tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: tools/catalog.mjs, tools/catalog.sql, tools/spike/test/canaries.test.mjs. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P1-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick done MARATHON-GH20-A2-P1-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   Edit ONLY marathon-system/gh20-a2-catalog-designs--gh20-a2-p1/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
