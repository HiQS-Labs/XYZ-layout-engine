# RELAY · GH98 plan review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-23.
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
6. **Commit only the relay file** (`relay(gh98-plan-review): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-98-FORGE-SCROLL.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-23

### Artifact — GH-98-FORGE-SCROLL.md
```
---
gh_issue: 98
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/98
title: Forge scroll editorial benchmark
created: 2026-11-23
updated: 2026-11-23
status: In progress
owner: Codex
goal: Measure how effectively three model submissions explain Forge in a responsive page
---
# Forge scroll benchmark

## Status

| What was just completed | What's next |
|---|---|
| Intake and consult | Review plan, build packet, measure submissions, publish evidence. |

## Plan and acceptance

Base main d47eb25. V2 in PR 97 uses anonymous rooms and cited readings but its poster pairs and three Fuel Well questions cannot grade scroll sequences. Implement a standalone example using existing Playwright and Node. No new CI suite. Pin source excerpts to Forge 877c2be0d. Include authentic surplus material, same packet bytes, no rubric or timing clues. Candidates work in their own packet, build an offline HTML page for a lead new to Forge in 4–5 sections with one concrete request-to-verification story. Choose all visual and editorial details. Exactly one medium run each: Opus 5.5, Gemini 4 Neon, GPT-6.2 Sol. No paid assets or deployment.

Check valid offline delivery, 4–5 discernible sections, readable mobile and desktop content and local assets. Capture matched mobile 390×844 and desktop 1440×900 first screens and full scrolls. Wrong-length or nonloading page is ineligible. In two independent noncandidate vision sessions, anonymize and vary order. Collect first-screen appeal BEFORE revealing full pages. Then require factual answers with visible locations to three questions: problem, request-to-verified-change example, inspectable evidence. Compare with source key; at most one correct earns 1, two earn 2, three earn 3. Craft: impeded / readable with friction / visual sequence clarifies on both sizes. Appeal: leave / skim / drawn to continue with named reason. Average judge scores per criterion. Store ballots and evidence; missing judge means provisional, no final grade. Capture provider start to completed submission in seconds (includes its own checks, excludes queue and judging). Rank valid times 3,2,1, grouping within 10% of group leader; tied members get same competition rank. Two valid runs use 3 and 2; single valid gets 3 with limited comparison disclosed. Invalid submission has no grade. Weighted total out of three = .4 comprehension + .3 design + .2 appeal + .1 speed. Display raw durations, scores and limitations. Do not leak timing in candidate prompt or workspace. Keep coordinator artifacts outside distributed packet.  [Unverified — no citation]

Smoke normal, ties, missing/failing submission, and an unsupported located claim; ensure these cannot earn an unqualified winning result. Include readable reproducibility notes, short results and the actual offline pages. Easy rollback: one example and its task records. Avoid arbitrary word count or theme prescription. Rating priority/severity/appeal/cheapness 60/35/50/60, recoverable comparative evidence; #96 prior adjacent pilot, unknown recurrence trend. No renderer changes.
```
- Definition of Done: First paraphrase proposal, existing behavior and exclusions from plan alone. Then review against GH98, repo and plan, including assumptions, fail controls, measured outcomes appropriate for this phase. For final QA inspect implementation and actual evidence. Review only; only edit this relay.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

Proposal paraphrase (from plan alone): build a standalone offline, responsive Forge explanation benchmark, giving three named models identical surplus source packets and one medium run each. Existing v2 provides anonymous rooms and cited readings, but its poster-pair/Fuel Well evaluation does not assess scroll narratives. Replace that task-specific evaluation for this example with matched two-size captures, two independent noncandidate judges, source-key comprehension, craft, first-screen appeal and operator timing. Exclusions: renderer changes, a new CI suite, paid assets, deployment, candidate-visible timing/rubric and prescribed visual themes.

swept file: yes

VERDICT: FAIL
Basis: the whole embedded artifact is reviewed for plan readiness, not implementation completion. One repository delivery requirement needs an explicit path before approval. No additional pre-existing defect was found in this embedded plan beyond the finding below.

- [Pass] Issue alignment: GH-98's fetched body requests exactly the three named models, one medium run, identical surplus sources, four or five sections, anonymous mobile/desktop judging and “40/30/20/10” weights; the embedded “Plan and acceptance” includes each. Source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/98 (read via GitHub fetch_issue during this turn).
- [Pass] Fail controls are appropriate to the planning phase: “Wrong-length or nonloading page is ineligible”, “missing judge means provisional, no final grade”, and “Invalid submission has no grade”; the smoke cases explicitly include ties, missing/failing submissions and an unsupported located claim. These are acceptance requirements, not observed implementation results.
- [Should] Add the required final review publication step. The closing instruction “Include readable reproducibility notes, short results and the actual offline pages” specifies preservation but no publication through the repository's final-deliverable owner. `AGENTS.md`, “Working in this repository”, requires every renderer to publish final deliverables through `tools/review.mjs` / `publishForReview`; `REVIEW/README.md`, “The rule”, requires `REVIEW/<project>/` and the index. Cheapest fix: name the final step that publishes the comparison and usable offline pages (including their local dependencies) through that existing operation; keep ballots, receipts and intermediate evidence in the example's source/evidence folder as `REVIEW/README.md` requires.
  Observed input: the entire embedded plan ends its delivery contract with “Include readable reproducibility notes, short results and the actual offline pages”; it contains no `REVIEW/` or `publishForReview` step.
  Affected scope: this benchmark's human-judged final comparison and offline page deliverables, not candidate packets or intermediate judging material.
  Falsifier: a plan instruction already invoking the existing publisher for these final deliverables, or an applicable explicit repository exemption, would make this request unnecessary; neither appears in the embedded artifact.
- [Unverified — needs clone run] No submissions, ballots, captured pages, provider timings or smoke results exist in the embedded artifact for final QA. No runtime tests, executable fixtures or phase gates were run; this turn only assesses the plan. The base commit and v2 implementation claims remain author-supplied context, not independently measured behavior.

Reversibility: Easy — only the relay findings change; the artifact remains untouched.

Handing off to Producer — add the final publication step, disposition the finding, then return for plan review.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
