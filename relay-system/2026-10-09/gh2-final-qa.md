# RELAY · GH-2 final QA: regression canaries and test/CI ratchet
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh2-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/spike/test/canaries.test.mjs`, `tools/spike/test/run.mjs`, `test-budget.json`, `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `package.json`, `AGENTS.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the implementation matches the approved plan in `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md` and satisfies issue #2. Four named canaries run by `pnpm test`; a mechanical ratchet enforced before tests run; a hard deadline with cleanup; the output-root override as the only production change; every check backed by a recorded red control.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Final review of the GH-2 implementation against its approved plan (`relay-system/2026-10-09/gh2-plan-qa.md`, Approved in round 3). Operational envelope: local renderer spike, single developer host, no CI. Grade against the plan and issue #2 with commensurate complexity.

Diff to review: `git diff origin/marathon/gh-1-renderer-spike..9c37fb6` (the implementation is commit `9c37fb6`). Read the plan's "Verification receipts" section: these are orchestrator full-clone receipts (Node v22.22.3, M1 Max). Do not run the renderer or tests here. You may use narrow read-only probes under `.relay-scratch/` or `$TMPDIR`.

Questions:
1. Does each plan item map to code? Check the output-root override (both reader paths in `verify.mjs`), C1 to C4 exactly as specified, the budget file, runner pre-checks, process-group deadline, TAP accounting, and the AGENTS pointer. Is anything missing or extra?
2. Does the override preserve the recorded `output/<run>/...` paths and leave default behaviour identical?
3. C2: does it compare key sets first, require finite values within 0.5 px, require a positive box count, and gate digests on host equality with an explicit skip message? Can it pass vacuously?
4. The runner: can a fifth test, a hidden `test(`, `it`/`describe`, `.skip`/`.only`, extra test files under other names or folders, a budget raise without history, or a stalled run slip through? Note the two implementation refinements against the plan's wording: only line-start top-level `test(` declarations count, any other free `test(` call is rejected, and the TAP key is `# skipped`. Are these sound?
5. Are the recorded red controls sufficient evidence for each check? Is any receipt missing?
6. Scope and complexity: any speculative code, duplicated rule text, or new dependency? Is the policy text kept in `test-budget.json` only?
7. Are the docs (CHANGELOG entry and plan status) accurate, with nothing pending marked complete?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
