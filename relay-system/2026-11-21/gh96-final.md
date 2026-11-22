# RELAY · GH96 final editorial benchmark QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-21.
-->

NEXT: Producer
STATUS: Approved
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

### Reviewer · Round 1

VERDICT: PASS
Basis: GH-96 is satisfied as an opt-in, local operator-run pilot with incomplete calibration disclosed and no model ranking asserted. No blocking or pre-existing defect found in the complete embedded artifact and supporting benchmark files reviewed.
swept file: yes

- [Unverified — no citation] Preserved v1 against origin/main d47eb2530f3b37e867d591e277339137e04c6982 and reviewed head e51df1cd76b9d5e4cd0888adbe67ac1d71a772c6. Read-only Python/zlib object audit, command “python3 .relay-scratch/tmp/audit.py”, exit 0: “v1 unchanged: True” for benchmark/creative-handout.zip, benchmark/handout.zip, evaluation/grade.mjs, evaluation/rubric.json and evaluation/ballot-template.json; “seed vs committed mismatches: []”. The 24 changed paths concern v2, documentation, evidence, relay and release metadata; no engine change. Fix: none.
- [Unverified — no citation] Packet probe, command “python3 examples/2026-11-21-imaging-layer-pipeline/benchmark/v2/packet.py .relay-scratch/tmp/editorial-handout.zip”, exit 0. ZipFile comparison returned “members: 18 same names: True” and “changed: ['PROMPT.md', 'GOALS.md']”. The prompt names the newcomer and three tasks and says “You may omit the rest”; the answer key, controls and judge instructions remain outside the packet. Fix: none.
- [Unverified — no citation] evaluation/v2/pair.mjs creates forward [0,1] and reverse [1,0] rooms, canvas-rebaked PNGs at native/400px sizes and opaque A/B filenames. Its README requires image-only rooms, located answers before preference and withheld source/key. controls.mjs provides concise, dense and reversed variants with identical base geometry and facts; reversed copy says “resvg creates SVG. Satori turns it into PNG.” Dense copy adds surplus facts without removing the task answers. Fix: none.
- [Unverified — no citation] Command “python3 examples/2026-11-21-imaging-layer-pipeline/evaluation/v2/report.py TESTS-RESULTS/2026-11-21+GH-96/pilot”, exit 0: both deliveries show “png pass, html pass, sameDesign pass, rebuild pending, edit pending”; Codex shows “order-sensitive”, both readings 3/3 vs 3/3, Agy “pending”, and “Panel preference · inconclusive”. The short report prints an observed reason and evidence directory. Artifact passes summarize retained grades, not a fresh browser run. Fix: none.
- [Unverified — no citation] Same report command with TESTS-RESULTS/2026-11-21+GH-96/accuracy, exit 0: Codex “pending”; Agy “first”, forward and reverse 3/3 vs 2/3, “missed second export”; “Panel preference · inconclusive”. Retained ballots mark the located reversed export false. TESTS-RESULTS/2026-11-21+GH-96/README.md explicitly states “Density ballots were unavailable at this checkpoint” and “These pilot findings support no overall model ranking”, and labels archived candidates products of the old brief. Fix: none.
- [Unverified — no citation] Scratch-only Python subprocess probes invoking evaluation/v2/report.py against .relay-scratch/tmp/report-probe each exited 0: absent ballots yielded “Panel preference · inconclusive”; both judges choosing A forward/B reverse yielded “Panel preference · first”; changing Codex reverse to A yielded “codex · order-sensitive” and “Panel preference · inconclusive”. Synthetic factual flags remained false: preference and factual totals are separate. report.py admits only matching first/second/tie outcomes. Fix: none.
- [Unverified — needs clone run] Native suite, PDDA, actual Chromium pair/control rendering, and isolated rebuild/edit challenges were not rerun under this turn’s restrictions. Earlier suite/PDDA claims are producer receipts. Density neutrality remains pending calibration, not established evidence. Run the harness gate after handoff; retain missing calibration ballots before asserting a calibrated ranking.

Reversibility: Easy — v2 remains opt-in. Reviewed against live GH-96 acceptance and the whole embedded plan. Graph discovery was unavailable under approval-policy never; scoped file inspection supplied evidence. No artifact/source edits or git commands were performed.

relay closed (Approved), no further turn needed.


### Attestation · relay-drive — 2026-11-22T04:16:35Z
task: RELAY-GH96-EDITORIAL-FINAL
reviewer: codex
status: Approved
reviewed-head: e51df1cd76b9d5e4cd0888adbe67ac1d71a772c6
added-range: 8928+4246
added-sha256: 151375395173c06a2048fd50d6b0c022e74e0805d1c8f01ff78d0937eec5781c
gate-run: undeclared
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
