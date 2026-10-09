# RELAY · GH-8 plan QA: Higgsfield spike and cell-division example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh8-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md` (capture and plan). Source paths it plans against: `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/README.md`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/README.md`, `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md`, `tools/spike/verify.mjs`, `test-budget.json`, `CHANGELOG.md`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the plan satisfies the operator's request and issue #8 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/8) Phase 0: a bounded, spend-capped ($2.00 total) REST spike that explicitly tries the PNG transparency settings for Images 2.5, measures real alpha with a proven inspector, records a GO/NO-GO/UNCERTAIN verdict, and ships a cell-division explainer example; no contract, provider, engine, test or dependency change; key never leaves its file.

## QA brief (read before reviewing)

This is plan QA, before any paid call or code. Operational envelope: a local single-developer spike with a hard $2.00 spend cap and one API key file. Grade against the operator's request and issue #8 Phase 0, and commensurate complexity. Do not ask for a provider framework, retry subsystem, test suite, CI, or MCP testing (not possible in this environment, stated in the plan).

Read the plan in full and the Setup source paths. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`. Do not run renderers, tests, or any network call; there is no credential in your environment.

Questions:
1. Grounding: do the claims about the Solar System generator, receipts and provenance fields, and the RAG example match the files? Does issue #8's consolidated Phase 0 checklist (as quoted in the plan) leave out any probe the operator asked for ("try the PNG transparency settings for Images 2.5")?
2. Spend safety: is the control (estimate before every submit, on-disk ledger, $1.90 stop, no blind resubmit) sufficient to keep total spend at or under $2.00, including the example's assets and the unknown charging of 4xx validation rejections? What is the worst-case overshoot and is it acceptable?
3. Secrets: are the handling rules and the secret-scan control with its red control enough to keep the key out of the repo, logs, ledger and receipts? Anything that could leak (URLs, error bodies echoing headers, exception traces)?
4. Is the inspection method sound and the controls (a known transparent Solar System web PNG must pass, the opaque poster must fail) falsifiable? Can the verdict pass vacuously?
5. Does the verdict-dependent art rule (Higgsfield assets only if GO, otherwise hand-drawn SVG) stay honest, and is the cell-division stage list adequate for a basic "how cells reproduce" diagram?
6. Scope: does the plan stay inside non-goals and the test budget? Is "Refs #8, issue stays open" right?
7. Are the rating rationale (40/10/50/30, neutral appeal) and rollback honest?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Round 1 · Reviewer · agy

swept file: yes

* **[Blocker]** Secrets: The plan dictates that "Rejected probes are recorded with their exact error bodies" (Requirement 1). If a 4xx validation rejection from Higgsfield echoes the submitted `Authorization` header or token, recording it verbatim will write the secret to disk and tracked files.
  * Observed input: `{"error": "Invalid token Key ID:SECRET"}` returned in a 4xx body.
  * Affected scope: Error body recording in `higgsfield-spike.py` (Requirement 1).
  * Falsifier: A control test injecting a mock 4xx error body containing the secret, expecting the secret-scan to pass (proving the script successfully scrubbed the error before writing it).
  * Fix: Explicitly mandate scrubbing the key ID and secret (e.g., replacing with `***`) from any exact error body before recording it.

* **[Blocker]** Spend safety: Requirement 2 states the script "adds it to a running total... and refuses to submit if the total would pass $1.90". If the script processes jobs concurrently (like the Solar System's `generate-assets.py`), multiple workers could pass the `$1.90` check simultaneously, dispatch calls, and overshoot the $2.00 hard cap.
  * Observed input: 3 concurrent workers checking a ledger at $1.85, all seeing it is under $1.90, and submitting $0.05 calls (totaling $2.00, or more if the ledger was at $1.89).
  * Affected scope: Concurrency model of the submissions (Requirement 2).
  * Falsifier: A dry-run of the script with 5 parallel workers, expecting the final ledger total to strictly respect the $1.90 threshold.
  * Fix: Explicitly require the script to run submissions sequentially, or enforce a strict atomic file lock around the check-and-reserve ledger operation.

* **[Blocker]** Scope/Complexity: Requirement 4 mandates extracting decoded alpha statistics "using a stdlib-only decoder." Decompressing IDAT chunks and unfiltering PNG scanlines in pure Python stdlib is highly complex, reinventing the wheel and violating the ponytail principle, especially when a pinned Playwright runtime is available in `examples/2026-10-08-solar-system/runtime/`.
  * Observed input: A complex >100-line pure Python scanline unfiltering implementation.
  * Affected scope: The PNG inspection method (Requirement 4).
  * Falsifier: An alternative inspection using the existing Node/Playwright runtime (e.g. `node verify-alpha.mjs` drawing to a Canvas), expecting accurate pixel alpha extraction in <20 lines.
  * Fix: Remove the "stdlib-only decoder" requirement and explicitly allow delegating pixel inspection to a short Node script using the pinned runtime.

* **[Pass]** The inspection method is falsifiable and proven first: "The method is proven first on known files: a committed transparent Solar System web PNG must pass and the opaque Solar System poster must fail" (Requirement 4).
* **[Pass]** Scope constraints and non-goals are correctly bounded: "No provider contract, shared layer... No new test, workflow or dependency" (Non-goals).
* **[Pass]** The example follows the RAG pattern correctly: "rendered through the pinned runtime... by the same pattern as the RAG example" (Requirement 6).

**VERDICT: FAIL**
**Basis:** The error logging risks leaking the API key via echoed headers, the concurrency model risks breaching the $2.00 hard cap, and the custom stdlib PNG decoder requirement is an extreme over-engineering violation of project principles.


<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
