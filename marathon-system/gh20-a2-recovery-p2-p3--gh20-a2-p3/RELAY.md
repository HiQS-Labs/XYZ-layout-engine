# Marathon Phase gh20-a2-p3
STATUS: Open
NEXT: codex (Builder)

<!-- marathon-drive: task=MARATHON-GH20-A2-P3-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-20 A2 Phase 3 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 3 (ROUTER pointer, README and CHANGELOG) of the canonical GH-20 Phase A2 plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-20 under umbrella GH-19. | Execute only after gh20-a2-p2 is approved and the driver gate passed. |

# GH-20 A2 Phase 3 — ROUTER pointer, README and CHANGELOG

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20 (design log: #21).
Canonical plan: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, "Phase 3".
Builder: Codex. Reviewer: independent Agy. Strictly serial after gh20-a2-p2.

## Goal

Make the CLI the stated only catalog write path in ROUTER.md and document the delivered design
catalog and log.

## Allowed files

`ROUTER.md` (two added lines only), `README.md` (catalog section only), `CHANGELOG.md` (one entry).

## Scope

- `ROUTER.md` role split (`:5-17`), one line:
  ``- `tools/catalog.mjs` + `tools/catalog.sql` = the recipe and design catalog (CLI and its canonical dump)``
- `ROUTER.md` canonical rules (`:30-40`), this exact line:
  ``- Change the catalog only through `node tools/catalog.mjs`; `tools/catalog.sql` is generated output, never hand-edited.``
- `README.md` "Local Recipe Catalog" (`:41-79`): a short "Designs" subsection with `design list`,
  `design show <id>`, `design add …` and exit codes; insert-only (an edit forks a new ID); RAG and
  cell-division seeded with a null use case because they are hand-built scripts; and a two-sentence
  note that `tools/design-log.jsonl` is an append-only record for judging the grid grammar,
  reviewed after every 10 designs or the first `needed_row_span`/`non_grid_family`/
  `needed_span_over_9`. Name Phase B items as deferred. Do not edit SPECS-PRD.
- `CHANGELOG.md`: one top entry with `Refs #20` and `Refs #21`, no closing keyword, and an Easy
  reversal line.

## Acceptance (each can fail; red control in brackets)

- P3-A1 `rg -n -F 'node tools/catalog.mjs' ROUTER.md` matches the rule line; `rg -n 'tools/catalog.sql' ROUTER.md` matches the role-split line. [Red: both match nothing on the base ROUTER.md.]
- P3-A2 Every README design command runs with its documented exit code (read verbs on the committed tree; `design add` only in a `$TMPDIR` copy). [Red: `design lsit` exits 2.]
- P3-A3 `utils/pdda/pdda.sh run` reports no new errors versus the pre-phase run. [Red: an absolute home path in a touched doc raises a hardcoded-paths finding.]
- P3-A4 `git diff --exit-code <P2 head> -- tools examples` exits 0. [Red: any code or data edit exits 1.]

## Gate

Driver runs `pnpm test` after independent review (exit 0, 4/4). Builder runs only the P3 checks.

## Boundaries and proof

Docs describe only delivered behavior. Repo-relative paths only; no absolute home paths, PII or
credentials (public repo). Do not edit code, data, SPECS-PRD, the plan, briefs, `releases.db/sql`,
`test-budget.json`, `package.json` or `pnpm-lock.yaml`. Do not run `pnpm test`. Never `--force`.

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
1. Implement the brief by creating/editing the artifact file(s): ROUTER.md, README.md, CHANGELOG.md
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick claim MARATHON-GH20-A2-P3-TURN --agent codex --paths "marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p3/RELAY.md,ROUTER.md, README.md, CHANGELOG.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick ping MARATHON-GH20-A2-P3-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P3-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p3/RELAY.md and ROUTER.md, README.md, CHANGELOG.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: ROUTER.md, README.md, CHANGELOG.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick release MARATHON-GH20-A2-P3-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick done MARATHON-GH20-A2-P3-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-catalog-designs/.xyz/bin/tick
   Edit ONLY marathon-system/gh20-a2-recovery-p2-p3--gh20-a2-p3/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
