# RELAY · GH-8 code QA: spike runner, inspector, diagram (pre-spend)
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
6. **Commit only the relay file** (`relay(gh8-code-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch feat/higgsfield-spike-cell-division (diff main to HEAD): `examples/2026-10-09-cell-division/higgsfield-spike.py`, `examples/2026-10-09-cell-division/inspect-alpha.mjs`, `examples/2026-10-09-cell-division/render-diagram.mjs`, `examples/2026-10-09-cell-division/fixture.json`, `examples/2026-10-09-cell-division/README.md`, `examples/2026-10-09-cell-division/.gitignore`. Spec: the approved plan `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Context: `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-08-solar-system/generate-assets.py`, `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the code implements the approved plan's requirements 1 to 4 and 6 safely enough to run a real, paid spike (hard cap $2.00, one API key file): spend gate, secret handling, inspector, and the diagram. This review happens BEFORE any paid call.

## QA brief (read before reviewing)

This is code QA of a spend-bearing spike, before the first paid call. Operational envelope: a local single-developer script with a $2.00 hard cap, run once or twice. Grade against the approved plan and commensurate complexity. Do not ask for a provider framework, extra retry layers, or a test suite; the repo forbids new tests beyond the ratchet. Do not run network calls, the renderer, or the runner (no credential exists in your environment; the key file must never be read).

Read the Setup files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR` (for example static `python3 -c` checks of the source text, or `ast` parsing). Cite file:line.

Questions:
1. Spend safety: can any code path submit a paid call without a prior `reserve` row, double-submit one logical call, exceed $1.90 reserved total (or $2.00), retry a paid POST, or continue after an ambiguous failure? Trace `Spike.submit`, `_poll`, `_stop`, `run_matrix`. What is the worst-case overshoot?
2. Estimate-endpoint risk: `submit` and the matrix treat an estimate 404 as `absent` and skip the endpoint. The docs only show the estimate path for one Soul model. Is skipping correct, or can a missing estimate wrongly hide an existing generation endpoint? Propose the smallest safe handling that keeps the cap enforceable (for example an explicit, ledger-recorded conservative assumed price), and say if you consider it required.
3. Secrets: trace every place text leaves the process or is written (stdout, stderr, ledger, exceptions, tracebacks, file names, the download URL query). Can the key ID or secret reach any of them? Is the mode check really before any read? Is the key sent anywhere but api.higgsfield.ai over https, including redirects and status_url?
4. `inspect-alpha.mjs`: is `real_alpha` computed soundly (header colour type, tRNS, canvas pixel read, corner count)? Any false GO risk (for example canvas premultiplication, JPEG, WebP, palette PNGs, or an RGBA PNG that is fully opaque)? Any false NO-GO?
5. Does the selftest actually exercise the claimed controls, or can any pass vacuously? Is the offline guard sound?
6. Diagram script: does it follow the RAG example's pattern correctly (guard before import, required stage ids hard-coded, both-backend geometry checks, non-vacuous), with no RAG leftovers (grep for rag, ingest, lane names, source_note)? Is the science in `fixture.json` correct and appropriately hedged for a basic cell-division diagram?
7. Scope: does the diff touch anything outside `examples/2026-10-09-cell-division/` besides the plan, relay thread and ledger files? Any accidental files, committed secrets, or committed raw downloads?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
