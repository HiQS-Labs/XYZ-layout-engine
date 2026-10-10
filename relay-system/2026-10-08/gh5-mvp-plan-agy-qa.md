# RELAY · GH-5 MVP improvement plan QA against latest PR #4
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: codex-producer
STATUS: Approved
ROUND: 3 / 4

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

### Producer · Round 1 disposition

- **Modified — Blocker scope/evidence gap:** P0 now promotes nutrition only, retaining the existing product-hero smoke. Added a conditional Solar System recovery/promotion gate in P2. Its source/assets are unavailable here, so the plan labels demo-specific call counts, resizing and concurrency as historical observations.
- **Declined — claimed concurrency contradiction:** REPORT.md's single-process/no-concurrency statement scopes renderer timing, not provider image generation. Absence of the generation harness in PR #4 does not prove the historical worker observation false. The observation is now qualified; the performance phase establishes a fresh baseline through the existing admitted caller rather than requiring a new sequential provider subsystem.
- **Implemented — test budget Should:** P0 names delivered C1/C2 and the exact one-file/four-test/60-second/zero-workflow ratchet. Extend existing assertions only for the implementing child; use budget history/issue admission if extension cannot cover a named failure. #2 is complete and is not reopened.
- **Additional reconciliation:** refreshed onto landed origin/main 8a44d55 after PRs #3/#4/#6 merged; #1/#2 closed and human spike acceptance recorded. Preserved original review history. Added distinct P0/P1/P2 closure criteria so generation resumption and durable GUI edits do not become implicit P0 blockers.

VERDICT: PARKED
Basis: Producer revisions complete; independent Agy approval requested, not asserted. No runtime behavior, paid generation or human acceptance was performed by this QA.

handing off to agy — review the revised full plan against the refreshed baseline and dispositions.

### Reviewer · Round 2
swept file: yes
- `[Pass]` P0 successfully scopes to a minimal local MVP and removes the unsupported concurrency and demo observations. Cited: "Promote nutrition into the first versioned recipe" and "Product-hero remains the existing smoke", separating provider generation into P1.
- `[Pass]` P1 safely outlines resumption and exact cache invalidation. Cited: "skip validated completed assets; submit only missing or explicitly replaced items... keyed by exact prompt, model... reference-image digests".
- `[Pass]` The test budget constraint is precisely respected. Cited: "Extend C1 (fresh render/verify) with a space-containing temporary path... extend C2 (golden geometry/digests)... Keep one file, four tests, sixty seconds and zero workflows."
- `[Pass]` Clarification of historical observations is accurate against the `8a44d55` baseline. Cited: "The earlier one-off diagram and its generation harness are historical observations; their source/assets are currently unavailable in this review".

VERDICT: PASS
Basis: The Producer's Round 1 dispositions properly addressed the evidence gaps. The revised plan distinguishes historical observations from verified baseline facts, honors the strict testing budget, and presents a coherent, risk-managed progression to a usable local MVP.  [Unverified — no citation]

relay closed (Approved), no further turn needed

### Producer · Round 2 disposition and baseline refresh

- Round-2 PASS is retained as reviewer text, not claimed as driver approval: the task was released rather than done, and the supervisor refused close-mismatch (exit 4). Final review uses a fresh token and explicit reviewer-done instructions; no guard is bypassed.
- PR #7 landed while round 2 was running. Rebased the isolated clone onto a8e7e57 and inspected its published generation/redraw source. The three-worker generation setting is now source-verifiable; it is not a renderer concurrency benchmark.
- Replaced unavailable-source wording with the actual remaining gap: originals omitted, selected refinement originals not produced by the initial generator. The plan uses existing committed web images and recorded display digests for offline recipe promotion, keeping higher-resolution originals conditional and preserving nutrition-only P0. No paid calls, new provider client or runtime implementation.

VERDICT: PARKED
Basis: Updated plan needs independent approval on the latest published baseline.

handing off to agy — review the full revised plan; on PASS complete the fresh token as agy instead of releasing it.

### Reviewer · Round 3
swept file: yes
- `[Pass]` P0 successfully scopes down to a minimal local MVP. It does not require astronomy or worker machinery, leaving "nutrition" as the first production recipe and correctly extracting a reusable renderer. Cited: "Promote nutrition into the first versioned recipe... Keep the existing product-hero smoke... P0 does not require a second production recipe."
- `[Pass]` P1 goals for caching and resumption are safe and measurable. Identity is strictly defined and paid calls are bounded. Cited: "keyed by exact prompt, model, generation/edit parameters... skip validated completed assets... an unknown paid outcome must be reconciled or reported for explicit retry".
- `[Pass]` Testing constraints precisely respect the strict `test-budget.json` limits (1 file, 4 tests, 60s). Instead of adding tests, the plan correctly instructs to extend existing ones. Cited: "Extend C1... extend C2... Keep one file, four tests, sixty seconds and zero workflows."
- `[Pass]` Baseline facts are accurately stated regarding the solar system demo, correctly identifying that `saturn-clean` and `asteroid-belt-diagram` are missing from the initial job list and that the script relies on uncommitted full-size assets. Probe `grep -E "saturn-clean|asteroid-belt-diagram" examples/2026-10-08-solar-system/generate-assets.py` returned exit 1. Probe `sed -n '25p' examples/2026-10-08-solar-system/render-diagram.mjs` confirmed: `const original=await fs.readFile(path.join(ROOT,'assets',id+'.png'));`.
- `[Pass]` Acceptance criteria are unambiguous and separate human artwork acceptance from system capabilities across P0, P1, and P2. Cited: "Acceptance and sequencing" section.

VERDICT: PASS
Basis: The plan is coherent, respects existing test budgets, correctly interprets the latest evidence (PR #4, PR #6, PR #7), and maps a safe path to a local MVP without unverified assertions.

relay closed (Approved), no further turn needed


### Attestation · relay-drive — 2026-10-09T05:52:30Z
task: RELAY-GH5-AGY-QA-FqScmc-r3
reviewer: agy
status: Approved
reviewed-head: 10469bde095f22d7eab1afe09b2d55b055b9a4dc
added-range: 12781+1956
added-sha256: 7cc15c7d6b50ba95a8244fcb2d93bee4d40a47b71e33c3ff3f6c3758c75b5201
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
