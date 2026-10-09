# RELAY · GH-11 final QA: RAG diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
6. **Commit only the relay file** (`relay(gh11-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch `feat/rag-diagram-example` (diff `a8e7e57..HEAD`): `examples/2026-10-09-rag-system/` (`render-diagram.mjs`, `fixture.json`, `README.md`, `verification.json`, `rag-system.png`, `rag-system-chromium.png`, `rag-system.html`), `CHANGELOG.md`, the plan and evidence in `PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md`, and the approved plan thread `relay-system/2026-10-09/gh11-plan-qa.md`. Context: `examples/2026-10-08-solar-system/render-diagram.mjs`, `test-budget.json`, `tools/spike/test/run.mjs`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: issue #11 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/11) is satisfied exactly as the approved plan states (requirements 1-6): second renderer example, RAG ingest and query flows, reuse of the Solar System pinned runtime, hand-authored SVG art, non-vacuous checks with red controls, README, changelog. No engine change, no new test/CI/dependency.

## QA brief (read before reviewing)

This is final QA of a finished, committed change. Operational envelope: a documentation example, one ~200-line .mjs script plus JSON, on one developer machine. Grade against issue #11, the approved plan and commensurate complexity. Do not ask for a test suite, CI, cross-platform goldens, or a shared runtime refactor (GH-5 owns that).

Read the diff and the Setup files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run the renderer, `pnpm test` or PDDA here (the Producer ran them; evidence is in the plan's Evidence table). You may open the PNGs.

Questions:
1. Is each plan requirement 1-6 satisfied by the actual files? Map each to file:line. Does the scene show both flows, the shared store, the original question reaching the augment step, and citations back to sources?
2. Does `render-diagram.mjs` match the plan: guard env set before the awaited dynamic import, sibling Playwright and fonts, `loadSatori()` before render, runtime files unchanged?
3. Are the checks non-vacuous? Required stage ids are hard-coded in the script, expected text ids are listed, geometry is checked in both backends. Can any check pass with zero stages, zero text, or a box outside the canvas in only one backend? Does the `findings` assertion run after the evidence files are written, and is that acceptable?
4. Do the recorded red controls and evidence in the plan and README substantiate the claims? Any claim in README or CHANGELOG not supported by the evidence table?
5. Duplicate subsystem check: does the example duplicate the Solar System render script beyond what is unavoidable (responsive viewer snippet, arrow/star helpers)? Is any shared-runtime or second copy introduced?
6. Does the diff touch `tools/spike/**`, `package.json`, `test-budget.json`, add a test file, workflow or dependency? Any accidental files?
7. The task-clone `pnpm test` failure with a space in the path is recorded as pre-existing (GH-5, `tools/spike/assets.mjs`). Is that claim accurate, and is leaving it unfixed correct under the non-goals?
8. Does the persisted rating (30/10/50/80 in `releases.db`) match the rationale, with appeal neutral?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
