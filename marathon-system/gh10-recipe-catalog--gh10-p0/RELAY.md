# Marathon Phase gh10-p0
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH10-P0-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-10 Phase 0 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 0 (spike and decisions) of the canonical GH-10 recipe catalog plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-10 under umbrella GH-19. | Execute only after plan QA, operator confirmation and dry-run admission. |

# GH-10 Phase 0 — Spike: storage engine and identity decisions

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10.
Canonical plan: `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, Phase 0. Order: gh10-p0 -> gh10-p1 -> gh10-p2 -> gh10-p3, strictly serial.
Builder: Codex (driver default). Reviewer: independent Agy. No fallback.

## Goal

Decide `node:sqlite` versus `better-sqlite3` and the identity details (GID form, serial width, slug
pattern, declared file set per recipe) from evidence gathered in this environment, and write the
findings into the plan. No feature code.

## Allowed files

Only `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, and inside it only a new `### Phase 0 findings`
subsection under "Phase 0". Every prototype, scratch database and dump lives under `$TMPDIR`.

## Scope

- Run and record: `node --version`; `node -e "require('node:sqlite')"` (exit code, exact
  ExperimentalWarning text); `node --no-experimental-sqlite -e "require('node:sqlite')"`; SQLite
  version; `DatabaseSync(':memory:')`, prepared statements with bound parameters, `BEGIN IMMEDIATE` /
  `ROLLBACK`, `CREATE TRIGGER ... RAISE(ABORT)`.
- Assess `better-sqlite3` from local evidence only (do not install or fetch): it would add a native
  dependency and lockfile change. Record `Decision:` with BECAUSE and UNLESS.
- In `$TMPDIR`, prototype: serial `max+1` in a transaction; immutability triggers; publish
  idempotent-same / reject-different; dump -> load -> dump byte-identical with ORDER BY natural keys.
- Read every recipe input path (`tools/recipes/*.mjs` `validate`, `buildScene`, `loadAssets`, and
  `tools/spike/assets.mjs`) and list the declared file set per recipe with file:line evidence.

## Acceptance (each can fail; red control in brackets)

- P0-A1 Findings subsection contains the probe results and a line starting `Decision:`. [Red: `rg -n "^Decision:"` on the plan fails if absent.]
- P0-A2 Prototype trigger aborts an UPDATE of a published row. [Red: without the trigger the UPDATE succeeds; record both.]
- P0-A3 Two load/export cycles produce identical dump bytes (sha256). [Red: export without ORDER BY after reverse-order inserts differs; record both digests.]
- P0-A4 `git status --porcelain` shows only the plan file changed. [Red: a scratch file in the repo would be listed.]

## Gate

Driver runs `pnpm test` after independent review (must exit 0, 4/4, budget unchanged). Builder runs
only the P0 checks above and records command, exit code and key output in the relay.

## Boundaries and proof

Ponytail: standard library and installed dependencies only; no new dependency, test file, `test()`
block or CI workflow. Follow ROUTER/AGENTS startup and read the plan phase first. The plan outside the
findings subsection, briefs, `releases.db`, `releases.sql`, `test-budget.json`, `package.json`,
`pnpm-lock.yaml` and `tools/spike/output/` are read-only. Do not execute `pnpm test` yourself. No paid
calls, no network installs. If a decision cannot be evidenced, emit `VERDICT: PARKED` with the
evidence; never mark it complete. Use the debug-mantra skill on concrete failures. Never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick claim MARATHON-GH10-P0-TURN --agent codex --paths "marathon-system/gh10-recipe-catalog--gh10-p0/RELAY.md,PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick ping MARATHON-GH10-P0-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P0-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh10-recipe-catalog--gh10-p0/RELAY.md and PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P0-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick done MARATHON-GH10-P0-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   Edit ONLY marathon-system/gh10-recipe-catalog--gh10-p0/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
