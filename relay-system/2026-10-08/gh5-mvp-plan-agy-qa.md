# RELAY · GH-5 MVP improvement plan QA against latest PR #4
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 4

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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh5-mvp-plan-agy-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md**; read **relay-system/2026-10-08/gh5-review-context.md** for required source paths and concrete QA questions.
- Reviewer: agy   ·   Producer: codex-producer
- Started: 2026-10-08
- Definition of Done: All five concrete questions in gh5-review-context.md answered with cited findings; the plan is accurate against PR #4, respects the existing test budget, defines a coherent local MVP, qualifies evidence gaps, and has measurable generation/render optimization acceptance. This is planning QA, not runtime or human artwork approval.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1
swept file: yes
- `[Blocker]` Overreach and hallucinated baseline in P0/P1: The plan requires promoting the "Solar System" demo to a P0 recipe and references an "existing three-worker baseline" for concurrency. PR #4 does not contain this demo, and `REPORT.md` explicitly states the spike is "single process, no concurrency".
  - `Observed input:` "Promote nutrition and the Solar System demo into versioned recipes" (P0); "Tune bounded concurrency from the existing three-worker baseline" (P1); "two supported recipes" (Acceptance).
  - `Affected scope:` P0 scope definition and P1 generation concurrency.
  - `Falsifier:` If PR #4 contained `artifacts/solar-system-*` or a concurrent worker harness, these claims would be valid. `REPORT.md` confirms neither exists in the branch.
  - **Fix:** Remove the Solar System demo requirement from P0 (make it a single-recipe MVP based on `nutrition` / `hero`), and remove the "three-worker baseline" claim from P1, instructing the implementer to build basic sequential generation first.
- `[Should]` Test budget violation risk: P0 asks to add assertions for "missing painted image", "paths containing spaces", "fitting exhaustion", and "failed-publication preservation". `test-budget.json` strictly caps the suite to 4 tests, which are already fully utilized by existing canaries in `canaries.test.mjs`.
  - `Observed input:` "Add only named failures: missing painted image... fitting exhaustion and failed-publication preservation"
  - `Affected scope:` P0 testing requirements.
  - `Falsifier:` `test-budget.json` restricts to 4 tests; `canaries.test.mjs` already has exactly 4 tests.
  - **Fix:** Explicitly instruct the implementer to extend the existing `guards: render pipeline breaks on a clean checkout` or `guards: unintended visual or layout drift` canaries with these new assertions, rather than adding new `test()` blocks.
- `[Pass]` Caching and resumption goals are safe: The plan correctly defines exact cache invalidation and safe retry boundaries, avoiding silent paid API loops. Cited: P1 "Paid image generation", bullets 2 ("keyed by exact prompt, model... reference-image digests") and 3 ("An unknown paid outcome must be reconciled or reported for explicit retry, never blindly resubmitted").
- `[Pass]` Acceptance criteria are unambiguous: The plan clearly separates human artwork acceptance from automated gates, and correctly isolates the local MVP milestone from remote service promotion. Cited: P0 bullet 1 and "Acceptance and sequencing" paragraphs 1-2.

VERDICT: FAIL
Basis: The plan requires an untracked demo (Solar System) for P0 and assumes an existing concurrency baseline that PR #4 explicitly contradicts. Testing additions need to be mapped to existing canaries to respect the 4-test budget.

handing off to codex-producer — go to the codex-producer window and say 'take your turn'

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
