# RELAY · GH5 Phase 5 provenance repair QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 1

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
6. **Commit only the relay file** (`relay(gh5-phase-5-provenance-repair-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: README.md; tools/MVP-REPORT.md (whole file including profiling JSON); examples/2026-10-08-solar-system/README.md; PROJECT/2-WORKING/SPECS-PRD.md; CHANGELOG.md; canonical GH-5 plan and Phase 5 brief; relay-system/2026-10-09/gh5-phase5-recovery/fresh-workflow-commands.json and fresh-workflow-summary.json
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: Independently adjudicate original Phase 5 Round 3 R3 evidence finding and whole-file documentation correctness. Actual retained exact edit/save/readback/selector/hash results must bind current claims; historical receipts remain historical. Approval is recovery QA only, never native phase or final wave completion.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Bounded independent recovery review

Operational envelope: two fixed-canvas, serial local CLI recipes. Documentation-only repair, Easy to reverse; no new code/test/dependency/framework/service requested. The fresh full-clone coordinator replay at b0b47ce used independently installed node_modules and retained all commands/outputs. You are not alone: preserve all artifacts, write only this relay. No paid calls, executable fixtures, suite, installs or browser during this reviewer flight; those results are retained coordinator evidence. Narrow read-only parsing/recomputation under TMPDIR/.relay-scratch is permitted with Python -B.

Questions:
1. Does current nutrition evidence bind the exact saved headline Fuel for today and primary #335577 to SVG 38c3c44daa33df60a07c3a647a4e0c77abe211ca9da2846f4ae293459df5139a, while Solar labelX=830 binds 06f195aea8f3e2bf9ea69efe4ff1b3d5309a8db643ba80f9f50d75d01a04d5fb? Read the actual saved-value, selector/hash outputs and exit codes, not just the summary. Historical TURN-2 unknown nutrition edits and historical changelog are explicitly superseded, not repurposed.
2. Are install/local browser proof limits truthful, compact/inline instructions and manifest current-field retrieval correct, and TypeScript target vs ESM/Python implementation and explicit backend selection accurately described? Inspect source owners only as needed. No source behavior change requested.
3. Does the handoff name owners and exact commands for native pnpm test, final PDDA, latest-origin integration, independent Wave 1 QA and pre-PR gate, without claiming them passed? Human acceptance and GH5 Later remain pending.
4. Are the prior R1/R2/R4/R5 resolutions preserved and all five entire documentation artifacts consistent, without disturbing the retained 120 profiling samples/fingerprint? Cite concrete contradictions if any; no speculative scope expansion.

Append native Reviewer block with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no, graded findings with file:line citations and observed-input/scope/falsifier for Should/Blocker. Review outcome: recovery-only Approved or concrete changes requested. Only independent reviewer sets first STATUS: Approved. Native tick done GH5-P5-PROVENANCE-RECOVERY-QA-20261009 --agent codex on approval; otherwise release to coordinator. No git commands inside turn; supervisor commits/attests your receipt. Explicit terminal handoff.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
