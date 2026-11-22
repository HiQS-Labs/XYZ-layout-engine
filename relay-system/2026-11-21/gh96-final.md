# RELAY · GH96 final editorial benchmark QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-21.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 3

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     a beta test had this loop reach `Approved` in two rounds while an independent audit of the same
     branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the
     change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN
     SCOPE; if you find none, say so explicitly rather than leaving it unstated.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.** Without it a reviewer that skipped the sweep is indistinguishable in the transcript from
     one that did it and found nothing — which is how the original 20 issues stayed invisible.
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     **A finding that asks for a behaviour change is a generalization unless you can paste the concrete
     input — a row, a value, a `file:line` — that fails under the current code** (GH-681: the gh673
     final QA relay generalized one late-error observation into "or a later invalid identity", the
     Producer implemented it, the same seat `[Pass]`ed it next round, and one historical NULL-URL
     ledger row then blanked every issue). Every `[Blocker]` or `[Should]` requesting a behaviour
     change MUST carry three lines: `Observed input:` (the failing input you saw), `Affected scope:`
     (the input predicate the change would govern), `Falsifier:` (the fixture or data that would show
     the change unnecessary or wrong, and its expected result).
     A `[Blocker]` must cite an observed failure. This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request that carries no
     `Observed input:` / `Affected scope:` / `Falsifier:`), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh96-final-editorial-benchmark-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-96-EDITORIAL-BENCHMARK.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-21

### Artifact — GH-96-EDITORIAL-BENCHMARK.md
```
---
gh_issue: 96
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/96
title: Editorial judgment benchmark
status: In progress
updated: 2026-11-21
owner: Codex
goal: Compare newcomer reading outcomes across anonymous poster submissions
created: 2026-11-21
---
# Editorial judgment benchmark
Four historical submissions scored 100 automated points on v1. Its ten nearby-term checks measure caption coverage. The reader ballot is pending. In v2 the reader must identify two changes and trace one real export. Accurate selective communication is the goal.

## Status

| What was just completed | What's next |
|---|---|
| Plan review and v2 implementation | Verify pilot evidence and submit for integration. |

## Implementation and acceptance
1. Build a versioned packet using the existing creative ZIP's inputs with replacement prompt and goals. Keep the historical packet and grader reproducible. Publish the audience and tasks. Hold out answers, controls and judges.
2. Extend the evaluation documentation with v2 workflow. Reuse the artifact checks and isolated operator rebuild/edit observations. Separate these from reading accuracy and panel preference.
3. Give independent judges opaque PNGs at native and 400px widths, with no candidate code, filenames or model identities. Each records locations and answers before pairwise preference. Compare both orders per judge. Keep ties, disagreement, missing or unstable votes explicit. The short report cites a specific observation with details available separately.
4. Calibrate using three rendered controls with common visual ground truth and concise-correct, dense-correct and reversed-path copy. Verify causal mistakes are caught and density alone carries no penalty. Pilot using archived renders, label the old brief, and retain blind ballots. Smoke missing ballots and reversal before publication.

Easy rollback: retire the opt-in v2 packet and evaluator. No change to engine, old grades or model cost controls. A word cap alone would reward omissions. Rating 65/40/50/65: benchmark ceiling affects comparison, recoverable, neutral appeal, bounded evaluator. One ceiling observed across four submissions. Recent issue search found no independent earlier incident; trend unknown.

## Report contract
Run python3 evaluation/v2/report.py SESSION from the example root. SESSION contains artifact summaries, separate reading ballots and optional pair ballots; the compact output identifies the evidence directory. Missing ballots are pending. The held-out key and ballot instructions live under evaluation/v2. Both judges must consistently favor the same candidate across both orders to declare a preference. A flip, abstention, missing vote or disagreement suppresses a winner. Density affects comprehension only through a specific missed or misread reader task. Give the author surplus facts and explicit editorial freedom. Ratings above are priority/severity/appeal/effort cheapness.
```
- Definition of Done: Verify GH-96 plan and issue acceptance on the committed diff vs origin/main and TESTS-RESULTS/2026-11-21+GH-96. Confirm preserved v1, honest pilot limitations, default report, withheld winners, packet and controls. Check actual paths and controls, assess proportional to a local operator-run benchmark. Review only.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
