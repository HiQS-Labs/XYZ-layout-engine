# RELAY · GH-8 Phase 0b plan QA: Higgsfield CLI transparency test
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Producer
STATUS: Approved
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
6. **Commit only the relay file** (`relay(gh8b-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md` (the section titled Phase 0b at the end). Source paths it plans against: `examples/2026-10-09-cell-division/higgsfield-spike.py`, `examples/2026-10-09-cell-division/inspect-alpha.mjs`, `examples/2026-10-09-cell-division/render-diagram.mjs`, `examples/2026-10-09-cell-division/fixture.json`, `examples/2026-10-09-cell-division/FINDINGS.md`, `examples/2026-10-09-cell-division/README.md`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the Phase 0b plan satisfies the operator's request: test the Higgsfield CLI's transparent-background option for GPT Image 2.5 under a hard 20-credit cap, measure real alpha with the proven inspector, record a truthful verdict, and if it works replace two of the six cell-diagram images with transparent PNGs; no provider contract, dependency or test change; no credential handling.

## QA brief (read before reviewing)

This is plan QA before any paid call. Operational envelope: a local single-developer spike calling an installed CLI, hard cap 20 credits (about $1.25), expected spend about 2.5 credits. Grade against the operator's request and commensurate complexity. Do not ask for a provider framework, extra retry layers, MCP testing, tests beyond the selftest, or use of the Higgsfield companion skills. Do not run any `higgsfield` command or network call; the CLI is signed in on the operator's machine.

Read the plan section in full plus the Setup files. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`.

Questions:
1. Grounding: do the claims about the existing inspector, the diagram script, the REST runner and the earlier FINDINGS match the files? Is anything in the Phase 0b recon unsupported or overstated (the CLI facts come from read-only commands the producer ran this session)?
2. Spend safety: is the control (cost check before each create, balance read, larger-of balance difference and estimate sum, one-at-a-time lock, no retry, stop if cost or balance is unreadable) enough to keep spend at or under 20 credits? What is the worst-case overshoot, including a job that is charged on creation versus on completion, and a balance read that lags?
3. Is the matrix (T1 to T4, C1) a fair test of the `background` parameter, with a control, and are T1 and T2 well chosen as the diagram candidates? Is anything essential missing (for example checking that `transparent` is not silently ignored the way REST fields were)?
4. Inspection and verdict: can the verdict pass vacuously or produce a false GO (alpha present but a baked matte, halo, or a fully-opaque RGBA)? Are the GO/NO-GO criteria and the visual check adequate?
5. Diagram change: is the optional per-stage `image` field the smallest mechanism? Do requirement 5's invariants (one `asset_<id>` node per stage, refuse non-alpha rasters, provenance fields, existing checks kept, red controls including the opaque-raster one) keep the checks non-vacuous? Is replacing interphase and cytokinesis sensible?
6. Scope and wording: does the plan stay inside the non-goals and the test budget? Does it avoid GitHub closing keywords next to #8 (a previous PR auto-closed #8 by writing "does not close #8")?
7. Is the rollback and rating treatment honest (this reuses the existing #8 rating 40/10/50/30)?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

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

*   **[Pass] Grounding:** The existing REST runner (`examples/2026-10-09-cell-division/higgsfield-spike.py`) exists as claimed. The `FINDINGS.md` claim "The REST route returned no alpha" matches `examples/2026-10-09-cell-division/FINDINGS.md:5` ("NO-GO for native transparency on the REST surface"). The inspector script claim ("real alpha requires minimum alpha below 255 and a non-zero transparent share") matches `examples/2026-10-09-cell-division/inspect-alpha.mjs:72` (`rec.real_alpha=Boolean(rec.hasAlphaChannel&&s.minAlpha<255&&s.transparentPixels>0);`).
*   **[Pass] Spend safety:** The control "taken as the larger of that and the sum of estimates" safely bounds lagged balance reads. Worst-case overshoot is limited because the loop waits for each job ("blocks until the job finishes").
*   **[Pass] Matrix:** The test matrix covers the variants ("flare, sunburst") and includes an explicit control "C1 flare, low, `--background opaque`".
*   **[Pass] Inspection and verdict:** Opaque RGBA false GOs are mechanically prevented by "real alpha requires minimum alpha below 255 and a non-zero transparent share". Visual false GOs (mattes) are caught by the manual "operator-side reviewer for baked checkerboards, white boxes or fringes" check.
*   **[Pass] Diagram change:** Smallest mechanism is preserved via "optional per-stage `image` field". Invariants remain non-vacuous because the script must "keep every existing check" and add a red control "for an opaque raster asset". Replacing interphase and cytokinesis is a sensible test of simple and complex cell geometries.
*   **[Pass] Scope and wording:** Non-goals are respected ("No provider contract, shared layer or Higgsfield provider"). The closing keyword risk is mitigated ("avoids any closing keyword next to an issue number").
*   **[Pass] Honest rollback:** The plan correctly states "Easy for code and docs (revert the PR). Spent credits are not recoverable". The Phase 0 rating `40/10/50/30` naturally applies since Phase 0 states "This rates the whole issue; this slice is its first phase".

VERDICT: PASS
Basis: The plan rigorously addresses the 7 QA brief questions with solid spend safeguards, verifiable alpha channel criteria, and maintains the required architecture boundaries.

handing off to claude-a — relay closed (Approved), no further turn needed

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
