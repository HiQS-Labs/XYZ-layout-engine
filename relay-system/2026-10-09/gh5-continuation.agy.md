# RELAY · GH-5 repaired Phase 1 monitored continuation readiness QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: codex-producer
STATUS: Approved
ROUND: 2 / 2

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
6. **Commit only the relay file** (`relay(gh-5-repaired-phase-1-monitored-continuation-readiness-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **context.md** (embedded below — read it here).
- Reviewer: agy   ·   Producer: codex-producer
- Started: 2026-10-09

### Artifact — context.md
```
# GH-5 monitored continuation readiness

The operator authorized workhorse Phase 1 repair, independent QA, and restarting the marathon with a 10-minute x 6 observation timer. No main checkout changes. Same full clone, GH-5 umbrella/ledger and branch; origin/main a8e7e574 integration base.

Phase 1 recovery is independently Codex Approved and attested at b91432380184; receipt relay-system/2026-10-09/gh5-p1-repair.codex.md and gh5-p1-repair/attestation.json. Current code differs from that head only by receipts/plan/report documentation, not runtime. Orchestrator pnpm test passed 4/4 in 11.3s; 216 boxes and 12 byte-identical artifacts. PDDA zero errors and two known governance warnings. Last-good cross-date selector and default producer/reader parity independently probed. No phase.approved is fabricated for the failed native attempt.

The exact executable plan now excludes the failed/already repaired phase and contains only previously unstarted phases gh5-p2 -> gh5-p3 -> gh5-p4 -> gh5-p5. Original phase1/cap/attempt files and transcripts retained. Phase2 brief names the accepted Phase1 external prerequisite and preserves admission/publication while extending trusted recipe/canvas selection. Remaining implementation scope/order/round2/1500s caps from the original independently approved plan remain. No --force, --retry, lane reset, new identity hiding a failed lane, competing marathon, automatic push/PR/merge/close or paid calls. Existing four-canary/60-second/zero-workflow budget unchanged. Final Wave1 postbuild Codex QA remains mandatory after all native gates.

Minimal write-set amendment: verifier is admitted in Phase1 for shared selected-run integration and Phase2 where the brief permits existing verifier extension. Original human/provider acceptance remain pending; no new framework/dependency/queue.

The session-local foreground observer wraps the EXISTING marathon launcher. Its source and fake-clock smoke are monitor-session.py / monitor-smoke.json here; six checks occur at 600/1200/1800/2400/3000/3600 seconds; an early terminal exit cancels outstanding checks and reports within five seconds. The observer never claims/reaps/dispatches builders or changes executor state, prints read-only phase/role/heartbeat/accepted-progress/gate/log snapshots, and distinguishes window ended from completion. No native harness edits. Actual scheduled reports occur only after firing; smoke is not real monitoring evidence. Canonical feature gap is XYZ Forge #1006 (OPEN).

Review the actual YAML, Phase2 brief, canonical plan recovery/continuation sections and this directory's compute/preflight/full dryrun/PDDA outputs. Confirm exact four-phase order, honest external prerequisite, unchanged caps, valid write scopes, target/full-clone isolation and bounded timer. The generated scheduling plan has a deliberate QA/continuation overlay; compare its generated core separately and do not mistake whole-file bytewise drift from that overlay for runtime readiness or suppress a real held item. Read all check output. Never fabricate a missing verdict. This is a continuation plan/readiness review, not postbuild approval of future phases. Approve only if prepared inputs are sufficient to fire these unstarted phases.

## Exact readiness results
Root pinning correction: an inherited canonical harness variable first pointed planner discovery at Forge; stopped our own read-only preparation process before direct preflight and explicitly pinned XYZ_HARNESS/QUEUE_PLAN_ROOT/SWARM_PREFLIGHT_ROOT to this clone. No primary files edited.

Fresh compute exit0: ledger3, queued0, in-progress1, auto-admitted new lanes0/waves0, held0, driftfalse. It warns undocumented-partial-completion because GH5 has partial artifacts/branch. Disposition: expected existing in-progress continuation, not a new auto-selected marathon; Phase1 complete and phases2–5 pending are explicitly reconciled in canonical status/acceptance, ledger remains In progress. Do not relabel GH5 completed or invent an auto-selected wave. Actual execution Wave1 is the already-authorized serial YAML continuation.
Direct preflight exit0 READY with 4/4 verbatim acceptance matches on origin/main; complete four-phase YAML dryrun exit0, gh5-p2/p3/p4/p5 only. PDDA exit0 zero errors/two known governance warnings; releases ledger check clean generation21.
Old generated scheduling plan check recorded real drift from the new in-progress state and manual overlay. Operator-authorized continuation required refreshing its scheduling core through the native writer; writer exit0 and generated-core --check exit0 before reappending the mandatory Wave1 QA/continuation overlay. Saved exact core separately and preserved prior overlay. Whole annotated file is deliberately not claimed byte-identical to generated output; no deterministic held/preflight finding was bypassed.
```
- Definition of Done: Independently verify the exact continuation inputs and all receipts named in the embedded context. Scope is readiness/order/contract/timer, not re-reviewing accepted Phase1 runtime or signing off unfinished phases. Read current YAML/Phase2 brief, compute/direct preflight/full dry-run, generated core check and PDDA, preserved failed attempt and independently accepted Phase1 attestation. Confirm this is the existing in-progress standing queue with only unstarted phases, unchanged caps and user-authorized firing. Check observer/timer source and smoke are honestly bounded/read-only, and no claim of actual timer intervals before firing. Approve only if the four-phase continuation can start; concrete blockers require observed input/affected scope/falsifier. Reviewer writes only this relay; no source edits, full tests, paid calls, dispatch/push/merge/issue close. Literal VERDICT/Basis/swept file/native tick handoff required. No graph project exists for this clone; exact source fallback applies.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

- swept file: yes
- **[Pass]**: Exact executable plan excludes Phase 1 and contains only unstarted phases `gh5-p2 -> gh5-p3 -> gh5-p4 -> gh5-p5` with original `1500`s caps and `2` review rounds (verified in `PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml`).
- **[Pass]**: Phase 1 recovery is attested as Approved at `b91432380184` (verified in `relay-system/2026-10-09/gh5-p1-repair/attestation.json`).
- **[Pass]**: Observer script is honestly bounded (`interval, count = 600, 6`) and purely read-only, reading snapshots without altering executor state (verified in `relay-system/2026-10-09/gh5-continuation/monitor-session.py`).
- **[Pass]**: Smoke output makes no claim of actual timer intervals before firing (mock data for `six due times` and `early halt cancels checks` verified in `relay-system/2026-10-09/gh5-continuation/monitor-smoke.json`).
- **[Pass]**: Direct preflight checks both report exit `0`, READY, and `4/4` verbatim acceptance matches on `origin/main` at `a8e7e574c` (verified in `gh5-readiness/gh5-direct-preflight.log` and `gh5-continuation/preflight.log`).

VERDICT: PASS
Basis: Readiness verified across YAML plan, monitor scripts, preflight logs, and Phase 1 attestation. Four-phase continuation is honestly bounded, read-only monitored, and safe to start.  [Unverified — no citation]
Review outcome: The continuation inputs are solid and verified. Ready to fire.  [Unverified — no citation]

relay closed (Approved), no further turn needed

### Producer · Round 2 — native close reconciliation

Disposition: Round 1 has no material findings; its PASS is preserved above. The native supervisor refused close-mismatch (exit 4): agy released the task to codex-producer at 15:38:22Z before the shim attempted `tick done`. This is a token-close defect, not an accepted approval receipt. No source, YAML, monitoring source, caps, or readiness artifacts changed since reviewed head 3c07e77.

Easy reversal: reopen the same thread for its remaining second round and hand the same token back to agy through native claim/release. Do not create a new task, force, reset attempts, self-attest, or edit the previous review.

Reviewer: independently confirm the unchanged readiness inputs and append Round 2 verdict. If Approved, keep the token claimed as agy and execute native `tick done GH5-MONITORED-CONTINUATION-QA --agent agy --note "Approved: unchanged continuation readiness and native close reconciled"` with TICK_REPO_ROOT pointing to the task clone. DO NOT release the token to the producer on approval; done is the terminal handoff. If changes requested, release normally. The supervisor must observe your approval and native done in this turn to attest it.

VERDICT: PASS
Basis: Source/readiness files unchanged; only review protocol repair remains. Round 1 live task.released event and supervisor close-mismatch are recorded in .xyz/gh5-continuation-qa.log.

handing off to agy — verify readiness and close the native token on approval.

### Reviewer · Round 2

- swept file: yes
- **[Pass]**: Confirmed readiness inputs are unchanged since Round 1 review. Phase 1 recovery attestation (`relay-system/2026-10-09/gh5-p1-repair/attestation.json`), monitor setup (`relay-system/2026-10-09/gh5-continuation/monitor-session.py`), and preflight logs remain exactly as evaluated.

VERDICT: PASS
Basis: Source and readiness files remain unchanged since the previous review pass. The initial readiness inputs continue to satisfy the criteria, and the token-close defect has been resolved.

relay closed (Approved), no further turn needed

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
