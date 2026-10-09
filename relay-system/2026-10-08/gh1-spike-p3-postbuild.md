# RELAY · GH-1 Phase 3 post-build QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Reviewer
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
6. **Commit only the relay file** (`relay(gh1-spike-p3-postbuild): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/spike/REPORT.md`, `PROJECT/2-WORKING/SPECS-PRD.md` (Status table, §5.3 checklist, Phases → "Phase 0 findings"), `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` (status, execution record, checklists), `CHANGELOG.md` (2026-10-08 entry). Commit a28c6d3. Supporting evidence (read-only, approved in the Phase 2 relay): `tools/spike/output/measurements.json`, `tools/spike/output/runtime.json`, the PNGs, `relay-system/2026-10-08/gh1-spike-p2-postbuild.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: every checkbox under "Phase 3 — Evidence and decision" in `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` and the brief `PROJECT/2-WORKING/renderer-spike/p3.md` is satisfied; every number or claim in the report and PRD findings is traceable to a field in the evidence JSON or a recorded command receipt; nothing is marked complete that is still pending (human artwork acceptance, Phase 3 QA, CodeRabbit review, Chrome for Testing notice review); no production scaffolding was added.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Context: Phase 3 of the GH-1 Phase 0 renderer spike (XYZ Layout Engine). Phase 2 code and evidence were approved in `relay-system/2026-10-08/gh1-spike-p2-postbuild.md` (three rounds); do not re-review the renderer except where a document misstates what it does. This round reviews the **documents**: the evidence report, the PRD injection, the plan status, and the changelog. Operational envelope: documents only; commensurate complexity means no new process, template, or gate is wanted.

Read in full: `AGENTS.md`, `GUIDING-PRINCIPLES.md`, `PROJECT/2-WORKING/renderer-spike/p3.md`, the Phase 3 section and Acceptance checklist of `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md`, PRD §5.1, §5.3, §7.6, §10 and the Phases section, the four artifacts in Setup, and both evidence JSON files. View the eight PNGs and the reference if you grade the visual statements.

You may run narrow read-only probes (output under `.relay-scratch/` or `$TMPDIR`); quote command, exit, decisive output. Do not run the renderer/verifier/PDDA here. Orchestrator receipts (full clone): `pnpm run spike:verify` → exit 0, `VERDICT: PASS`; `utils/pdda/pdda.sh run` → exit 0, 0 errors, 3 pre-existing warnings (stale `p1.md` brief; two governance dead references in ROUTER.md / PDDA-INSTALL.md that predate this work).

Questions:

1. Traceability: for each number in REPORT.md §3 (timings), §4 (memory), §5/§6 (capabilities, probes), §7 (hero), and the PRD "Phase 0 findings" bullets, does it match a field in `measurements.json` / `runtime.json`? Cite any mismatch with the JSON path and both values.
2. Honesty of status: is anything marked `[x]` in the PRD §5.3 checklist, the plan Acceptance/Phase checklists, or the Wave 1 checklist that the evidence does not support? Is every pending item (human visual acceptance, Phase 3 QA receipt, CodeRabbit review, Chrome for Testing notices, Chromium memory, untested shrink path) still visibly pending?
3. Licence memo: are the statements about MPL-2.0, MIT, Apache-2.0, OFL-1.1, and Chrome for Testing consistent with `runtime.dependencies` and `runtime.licenseNotes`, and is the browser's unverified status stated rather than smoothed over?
4. Decision: is the recommendation (Satori default, Chromium declared fallback) justified by the recorded capability table and §7.6, and does it avoid claiming pixel parity, p95 SLAs, or production readiness? Does it correctly say both backends were eligible and that the choice rests on cost/portability/SVG?
5. Proposed resource limits (REPORT §9, PRD findings): is each limit tied to a measurement or explicitly labelled as a placeholder/unmeasured? Flag any limit presented as measured that is not.
6. Visual assessment: is the agent assessment separated from human acceptance, and is the fidelity gap against the reference recorded (sparse illustrations, horizontal benefits strip)?
7. Scope and governance: changelog entry states bet/reversibility/verification per AGENTS.md; plan status table and frontmatter updated; nothing was written that belongs in the Phase 2 artifacts; no new tests/CI/process added.
8. Anything wrong, missing, or overstated in the report's "Known gaps carried into Phase 1"?

Output: graded findings with citations, then `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`; set STATUS Approved only if nothing blocking remains. Hand off explicitly to claude-a if changes are requested.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
