# Marathon Phase gh10-p3
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH10-P3-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-10 Phase 3 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 3 (docs and handoff) of the canonical GH-10 recipe catalog plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-10 under umbrella GH-19. | Execute only after gh10-p2 is approved and its gate passed. |

# GH-10 Phase 3 — Docs and handoff

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10.
Canonical plan: `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, Phase 3. Builder: Codex. Reviewer: independent Agy. Strictly serial after gh10-p2.

## Goal

Document delivered behavior only: identity scheme, files-own-content / ledger-owns-identity rule,
version bump rule, CLI commands with exit codes, operator-only writes; record the iteration.

## Allowed files

`README.md`, `PROJECT/2-WORKING/SPECS-PRD.md` (one delivered-observation note under §6.5),
`CHANGELOG.md`.

## Scope

- README: a short catalog section with exact commands (`list`, `show`, `publish`, `verify`,
  `export --check`) and their exit codes; the ExperimentalWarning note; deferred items (variants,
  aliases, ranges) named as deferred.
- PRD §6.5: one note on the delivered local catalog; no new requirements.
- CHANGELOG: entry referencing `Refs #10` and `Refs #19`; no closing keyword.

## Acceptance (each can fail; red control in brackets)

- P3-A1 Each README catalog command run from a `$TMPDIR` copy returns its documented exit code. [Red: a misspelled verb exits 2.]
- P3-A2 `utils/pdda/pdda.sh run` reports no errors. [Red: an absolute home path in a touched doc raises a hardcoded-paths finding.]
- P3-A3 `git diff --name-only <phase base>` lists only the three allowed files. [Red: any other path is listed.]

## Gate

Driver runs `pnpm test` after independent review (exit 0, 4/4). Builder runs only P3 checks and
records command, exit code and key output in the relay.

## Boundaries and proof

Docs describe delivered behavior; no unearned claims, human approvals or issue closure. No runtime,
test, ledger, plan or brief edits. Do not run `pnpm test`. Repo-relative paths only. Emit
`VERDICT: FAIL` or `PARKED` with evidence if blocked.

**No push, no PR, no merge, no issue close.** The orchestrator prepares the ready PR (`Refs #10`)
only after the final wave QA.

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): README.md, PROJECT/2-WORKING/SPECS-PRD.md, CHANGELOG.md
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick claim MARATHON-GH10-P3-TURN --agent codex --paths "marathon-system/gh10-recipe-catalog--gh10-p3/RELAY.md,README.md, PROJECT/2-WORKING/SPECS-PRD.md, CHANGELOG.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick ping MARATHON-GH10-P3-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P3-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh10-recipe-catalog--gh10-p3/RELAY.md and README.md, PROJECT/2-WORKING/SPECS-PRD.md, CHANGELOG.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: README.md, PROJECT/2-WORKING/SPECS-PRD.md, CHANGELOG.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P3-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick done MARATHON-GH10-P3-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   Edit ONLY marathon-system/gh10-recipe-catalog--gh10-p3/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
