# RELAY · GH-100 plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-24.
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
     change MUST carry `Observed input:`, `Affected scope:` (the input predicate the change would govern),
     and `Falsifier:` (the fixture or data that would show the change unnecessary or wrong, and its expected
     result). `Observed input:` accepts two strict, non-speculative forms:
     (1) **Form 1 (observed failure or artifact contradiction):** a failing probe/gate output, or a concrete
     `fileA:line` vs `fileB:line` contradiction (e.g. IAM SA mismatch, inverted test, sibling guard omission);
     (2) **Form 2 (unrunnable runtime hazard trace):** permitted ONLY when reproduction requires an external
     service, multi-process concurrency, or a browser/container runtime forbidden in the relay worktree —
     must supply a hop-by-hop `file:line` trace plus an exact `Clone probe:` command/script for the Producer's
     disposable full clone. Default severity for an unexecuted Form 2 hazard is `[Should]`.
     A `[Blocker]` must cite an observed failure (Form 1); an unexecuted Form 2 hazard stays `[Should]`
     until a probe reproduces it, and remains pending probe verification until the Producer runs
     `Clone probe:` in a disposable full clone.
     A finding from an earlier round stays open, and the verdict stays failing, until new evidence closes it.
     This includes earlier [Nit] findings; only a newly raised [Nit] with VERDICT: PASS on STATUS: Approved remains optional.
     This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking Form 1 evidence and lacking a complete Form 2 trace + `Clone probe:` as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request lacking Form 1 evidence and
     lacking a complete Form 2 trace + `Observed input:` / `Affected scope:` / `Falsifier:` / `Clone probe:`).
     For every Form 2 `Clone probe:` finding, read the probe before running it — refuse any probe that reaches
     the network, credentials, or paths outside the disposable clone and record the refusal as
     `[Unverified — clone probe failed/unavailable]` — then execute safe probes in a disposable full clone and
     record one of three outcomes: (a) Reproduced → fix and paste failing-before / passing-after probe output;
     (b) Falsified → `Declined — falsified by clone probe: <cmd → exit + output>`; (c) Errored, refused, or
     environment unavailable → keep the finding OPEN (`[Unverified — clone probe failed/unavailable]`, blocking
     `STATUS: Approved` until re-run cleanly or escalated/parked). Make approved changes, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Manual relay: commit only the relay file** (`relay(gh-100-plan-qa): <role> r<N>`); no push.
   **Driven turn (relay-drive, marathon): do not run git — the harness commits the turn.** **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. (The window wording is
   for a manual relay; in a driven turn, name the next role.) The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-100-ENGINEERING-REASONING.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-24

### Artifact — GH-100-ENGINEERING-REASONING.md
```
---
gh_issue: 100
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/100
title: Beyond the Prompt thesis edition
goal: Show how an engineering question changes a UX decision without writing code.
status: Active
owner: Codex
created: 2026-11-24
updated: 2026-11-24
---

# Beyond the Prompt thesis edition

## Status

| What was just completed | What's next |
|---|---|
| Located the approved local draft and verified the workshop snapshot. | Independent plan review, render qualification, final review and PR. |  [Unverified — no citation]

## Plan and acceptance

Base main@d47eb25 has the Nov 20 overview renderer but no Nov 23 example. The prototype branch at 68f5f96 adds manifest selection and optional QR art. The maintained checkout also has an unpublished contents layout, the 10-slide thesis manifest, and a dated 14-slide workshop backup in ignored temp. Import only the required deck example and renderer deltas, plus a scoped changelog entry. Do not merge unrelated feature branch history. Reuse the existing scene recipe, Satori/Chromium checks, viewer and publishForReview. A copy-only edit on main cannot select this manifest or render its contents. Easy rollback via PR revert. No new tests, engine architecture or Part II exercise.

1. Preserve the local workshop independently from renderer output. Verify the 14-slide count and reproduce its viewer from its manifest. The earlier 12-slide commit alone is insufficient.
2. Publish the thesis manifest, README with two primary-source links, PDF and offline HTML. Verify a reader encounters audience, per-slide contents, Saved vs Synced, appointment confirmation, portfolio and closing; check the studies are attributed and the MRI result limited to motor learning. A workshop or generic unchanged deck fails these checks.
3. Render the thesis via DECK and the default overview without DECK in isolation. Inspect frame geometry, number of PDF pages and embedded viewer navigation. Check the committed exports against the render. Before push run pnpm test and utils/pdda/pdda.sh run as explicitly authorized for this consumer; final Codex review and ready PR target main.

## Rating rationale

2026-11-24: rated 55/20/50/80. Requested current editorial work, reversible, limited to one example with an existing local draft, neutral appeal. Deck-related issue search over October 27–November 9 and November 10–23 surfaced a prior talk and integration QA, without evidence of recurring loss. No release date assumed.

## Review boundary

Review the plan alone first. Record what this proposes, how the system works per the plan, and explicit exclusions. Then validate against issue 100 and the Nov 20 recipe and renderer on main. The working draft and ignored snapshot are local artifacts for execution. Limit reviewer writes to the thread. Confirm an unchanged candidate fails, the checks observe the right artifacts, and the user's consumer gate override is preserved.
```
- Definition of Done: _<fill in the acceptance criteria the Reviewer grades against>_

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). In a manual relay, end each turn by committing just this file; no push. In a driven turn the harness commits.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: Block plan approval on one missing editorial acceptance check from issue #100; implementation and render qualification remain future work.
swept file: yes

- [Pass] Plan understanding and scope: the embedded artifact proposes importing the standalone thesis manifest and necessary renderer/contents-layout deltas, preserving the workshop independently, then producing PDF/offline HTML through the existing scene, dual-backend geometry checks, viewer and review publisher. It explicitly excludes unrelated branch history, new tests, engine architecture and Part II (lines 102–106). Reversibility: Easy, via the stated PR revert. I read the entire embedded artifact; no other pre-existing defect in that artifact was identified.
- [Pass] Baseline and negative control: main@d47eb25 `examples/2026-11-20-layout-engine-deck/render-deck.mjs:13` reads the fixed `deck.json`; the same recipe's `sceneFor` supports bookend, render-loop, sponsors, list, rows, split and flow and throws for other layouts (`recipe.mjs:40–126` in the seeded baseline). Thus an unchanged overview does not supply the thesis manifest/contents layout. The plan's content checks (line 105) would also reject the generic overview, rather than accepting geometry alone. The baseline file at d47eb25 was fetched through the GitHub connector; graph discovery was unavailable because tool approval is prohibited, so baseline source reading was used.
- [Should] Add an explicit check for both studies' limits and finding-versus-application separation.
  Observed input: Form 1 acceptance contradiction: issue #100's Approach says “Distinguish each study’s finding from its application to design” and its acceptance says “Both primary studies are attributed and their limits stated.” Embedded plan line 105 instead checks only “the studies are attributed and the MRI result limited to motor learning.” A deck that attributes Gick and Holyoak but presents design transfer as a demonstrated study result can satisfy that written check while failing the issue.
  Affected scope: the editorial acceptance review for the two primary-study slides in the thesis PDF and offline HTML; no new renderer behavior or test suite is requested.
  Falsifier: inspect a candidate that credits both studies and limits the MRI claim but omits the analogical-transfer limitation or conflates a study finding with a design application. The revised acceptance must reject it; a candidate explicitly separating both findings from their design applications and stating both limits must pass.
  Concrete fix: extend step 2 to name Gick and Holyoak and Draganski et al., require each study's limits, and require the finding/application distinction in the rendered talk. Keep primary-source links in the README as already planned.
- [Pass] Verification boundaries: line 106 preserves the explicitly authorized consumer gates `pnpm test` and `utils/pdda/pdda.sh run`, plus thesis/default isolation, PDF page count, viewer navigation and committed-export comparison. These are execution checks, not results from this plan review. No gate is configured in this relay and none was run here. Local ignored draft/snapshot claims and rendered output remain unverified until execution; no approval is inferred from a later gate.

Handing off to Producer (author): disposition the study-acceptance finding and supply the revised plan for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
