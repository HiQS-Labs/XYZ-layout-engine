# RELAY · GH96 editorial benchmark plan review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-21.
-->

NEXT: Producer
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
6. **Commit only the relay file** (`relay(gh96-editorial-benchmark-plan-review): <role> r<N>`); no push. **Stop** and report one line.
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
created: 2026-11-21
---
# Editorial judgment benchmark
Four historical submissions scored 100 automated points on v1. Its ten nearby-term checks measure caption coverage. The reader ballot is pending. In v2 the reader must identify two changes and trace one real export. Accurate selective communication is the goal.

## Implementation and acceptance
1. Build a versioned packet using the existing creative ZIP's inputs with replacement prompt and goals. Keep the historical packet and grader reproducible. Publish the audience and tasks. Hold out answers, controls and judges.
2. Extend the evaluation documentation with v2 workflow. Reuse the artifact checks and isolated operator rebuild/edit observations. Separate these from reading accuracy and panel preference.
3. Give independent judges opaque PNGs at native and 400px widths, with no candidate code, filenames or model identities. Each records locations and answers before pairwise preference. Compare both orders per judge. Keep ties, disagreement, missing or unstable votes explicit. The short report cites a specific observation with details available separately.
4. Calibrate using three rendered controls with common visual ground truth and concise-correct, dense-correct and reversed-path copy. Verify causal mistakes are caught and density alone carries no penalty. Pilot using archived renders, label the old brief, and retain blind ballots. Smoke missing ballots and reversal before publication.

Easy rollback: retire the opt-in v2 packet and evaluator. No change to engine, old grades or model cost controls. A word cap alone would reward omissions. Rating 65/40/50/65: benchmark ceiling affects comparison, recoverable, neutral appeal, bounded evaluator. One ceiling observed across four submissions. Recent issue search found no independent earlier incident; trend unknown.
```
- Definition of Done: _<fill in the acceptance criteria the Reviewer grades against>_

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Review assignment
First paraphrase what this proposes, how the existing system works and exclusions using the embedded plan alone. Then verify against the existing evaluation files and issue scope. Check falsifiers, risk, ratings and proportionality. Review only.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: Block plan approval pending two bounded acceptance clarifications against GH-96; no runtime defect is claimed.
swept file: yes

Paraphrase (embedded plan alone): Replace the creative packet's prompt/goals with an opt-in v2 that tests selective communication: readers locate two edits and trace an export. The existing v1 nearby-term score saturated on four submissions while human ballots remain pending. Preserve v1, reuse artifact and isolated operator checks, and add blind reading plus pairwise preference calibrated with three controls. Engine behavior, old grades and model cost controls are excluded.

Review basis: The Setup Definition of Done is still a placeholder; used the fetched GH-96 Acceptance and this plan's four implementation steps as the review criteria. Entire embedded artifact reviewed, including opening claims and rollback/ratings; no additional pre-existing defect found in that artifact beyond the findings below. Existing evaluation README, rubric, ballot and full grade.mjs inspected read-only. Graph discovery was unavailable (tool returned “MCP tool call requires approval, but approval policy is never”); file inspection was the fallback. No evaluator, test suite, candidate code or phase gate executed.

- [Pass] Existing-system description is supported: evaluation/README.md says “It rewards co-located technical terms; an incorrect sentence can still contain the terms”; benchmark/GOALS.md specifies “20 artifact points plus 8 points for each of ten technical relationships.” The plan correctly treats this as coverage, not an established reader-comprehension failure. GH-96 Context also states “Four anonymous-candidate submissions each earned 100 automated points and have pending design grades”; only one saved automated result was located locally, so the four-run assertion is issue-supported, not independently rerun.
- [Should] Make the v2 evaluator/report delivery executable and bounded. Step 2 only says “Extend the evaluation documentation with v2 workflow”; step 3 promises a “short report” without a command or named evaluator/ballot/report owner. GH-96 Acceptance explicitly requires “a reproducible command, default short report and inspectable evidence.” Add the intended existing evaluation location/entry point, versioned factual key and ballot/report outputs, and acceptance that one documented command produces the short report with a link to evidence; specify that absent panel ballots still allow factual/artifact reporting. No new framework or suite is needed.
  Observed input: evaluation/README.md currently documents `node grade.mjs /path/to/output completed-ballot.json > score.json`; grade.mjs reads the v1 rubric and emits one JSON score, with no pairwise report. Embedded steps 2–3 do not assign its v2 replacement or extension.
  Affected scope: v2 evaluation/report delivery only; preserve the historical v1 command and results.
  Falsifier: A concrete v2 entry point and invocation already specified by the plan that emits the required default short report and inspectable evidence with no preference ballot would make this request unnecessary; none is named.
- [Should] Define the ranking stop rule and density criterion. Step 3 says “Keep ... unstable votes explicit” but does not require withholding a ranking; step 4 says “density alone carries no penalty” without saying that observed reading failure may justify one. GH-96 Acceptance requires “Penalize density only when reading suffers. Suppress unstable rankings.” Add those explicit acceptance outcomes, and a simple definition of instability (for example a judge changing the preferred candidate after order reversal); label no panel as unavailable rather than inferring a winner.
  Observed input: The embedded plan's phrases quoted above allow a report to publish an order-dependent winner with an instability note; the issue explicitly forbids such a ranking.
  Affected scope: Optional v2 panel interpretation and the dense-correct calibration, not old automated scores.
  Falsifier: A paired ballot choosing A in A/B order and B in B/A order must yield no stable ranking; equally readable concise/dense controls must incur no density penalty, while a documented reading failure may affect the reading result. Existing plan text mandating these outcomes would remove this finding.
- [Unverified — no citation] Scope and rollback are proportionate for a small opt-in evaluator: “Keep the historical packet and grader reproducible” and “Easy rollback: retire the opt-in v2 packet and evaluator” protect old comparisons. Preserve the existing evaluation README's “fresh sandbox” and “networking disabled” boundary when reusing artifact/operator checks. No engine performance benchmark or additional CI gate is warranted by this document change.
- [Nit] Rating 65/40/50/65 is plausibly bounded by the stated recoverability and ceiling evidence, but label the four axes (priority/severity/appeal/effort cheapness) so their order is explicit. The quoted “trend unknown” appropriately avoids claiming recurrence. Step 1 should explicitly retain the issue's “surplus facts and editorial freedom” in the replacement brief, rather than relying on the title to communicate that experimental requirement.

Bet before relay edit: making these acceptance outcomes explicit should prevent a report that looks complete while omitting the issue's consumer-facing command or publishing unstable comparisons. Tradeoff: a few plan sentences, not new infrastructure. Failure mode: overprescribing implementation; the requested fixes deliberately leave the mechanism to the Producer. Reversibility: Easy.

Handing off to Producer (author) — address or disposition each finding, then return for review.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
