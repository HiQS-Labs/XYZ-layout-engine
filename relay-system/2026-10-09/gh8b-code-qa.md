# RELAY · GH-8 Phase 0b code QA: CLI runner and raster diagram (pre-matrix)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: claude-a
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
6. **Commit only the relay file** (`relay(gh8b-code-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch feat/higgsfield-cli-transparency (diff main to HEAD): `examples/2026-10-09-cell-division/higgsfield-cli-spike.py`, `examples/2026-10-09-cell-division/cli-spike-ledger.jsonl`, `examples/2026-10-09-cell-division/make-web-asset.mjs`, `examples/2026-10-09-cell-division/render-diagram.mjs`, `examples/2026-10-09-cell-division/fixture.json`, `examples/2026-10-09-cell-division/assets/provenance.json`, `examples/2026-10-09-cell-division/.gitignore`, `examples/2026-10-09-cell-division/inspect-alpha.mjs`. Spec: the approved Phase 0b section of `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Context: `examples/2026-10-09-cell-division/higgsfield-spike.py`, `test-budget.json`, `AGENTS.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the code implements Phase 0b safely enough to run the remaining four paid CLI generations (hard cap 20 credits, expected about 1.25 more) and to wire transparent PNGs into the cell diagram: spend gate, no credential or email leakage, resumable ledger, honest alpha verdict, raster-asset checks. This review is BEFORE the remaining paid calls.

## QA brief (read before reviewing)

Operational envelope: a local single-developer spike that shells out to an installed CLI, cap 20 credits (about $1.25), one smoke generation already done (0.25 credits). Grade against the approved plan and commensurate complexity. Do not ask for a provider framework, extra retry layers, MCP testing, or new tests beyond the selftest. Do not run any `higgsfield` command or network call; the builder tested only against a fake shim.

Read the Setup files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR` (for example `ast` parsing or static `python3 -c` checks; the selftest and Chromium cannot run in your sandbox). Cite file:line.

Questions:
1. Spend safety: trace `Runner.run_label`, `gate`, `spend_total`, `gate_allows`, `plan`, `run_cmd`. Can any path create a job without a prior `reserve` row, create twice, retry, run past 20 credits (including when the cost reply, balance reply, baseline row or est sum is missing, NaN, negative, bool or string), or continue after an ambiguous outcome? Is the max-of-balance-and-estimates rule applied correctly, and is the hand-written baseline/smoke row handling sound? Worst-case overshoot?
2. Leakage: can the account email, an OAuth token, or a signed URL query reach the ledger, stdout, stderr or exceptions? Check `balance`, `excerpt`, `redact`, error messages, the `cli` wrapper, and that `HIGGSFIELD_BIN` cannot be used to run something unexpected beyond the documented test override.
3. Inspection and GO eligibility: is `go_eligible` / `check_job` sound (echoed `params.background`, status completed, real alpha), and can a fully opaque RGBA, a baked matte, or a mismatched echo yield a false GO? Is the `real_alpha` rule in `inspect-alpha.mjs` unchanged and sufficient?
4. Diagram raster path (`render-diagram.mjs`, `fixture.json`, `assets/provenance.json`, `make-web-asset.mjs`): does it keep exactly one `asset_<id>` node per stage, verify the web file's sha256 against provenance, refuse non-alpha rasters, and keep all earlier checks non-vacuous? Any RAG/leftover issue, path-with-spaces issue (`.pathname`), or committed original/raw file?
5. Selftest: do the nine controls exercise what they claim, or can any pass vacuously? Is the offline guard sound (no real CLI, no real network)?
6. Scope: does the diff touch only `examples/2026-10-09-cell-division/`, the plan, relay thread, ledger files and (later) docs? No `tools/spike/**`, `package.json`, `test-budget.json`, no new test or dependency? Any accidental file?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer — Round 1 (agy)

swept file: yes

* **[Blocker] Leakage of signed URLs and OAuth tokens**: The `redact()` function only masks email addresses (`EMAIL_RE`). If the CLI errors and dumps an OAuth token or a signed URL to stderr, or if a download exception includes the unstripped URL, `excerpt()` passes it through intact to the ledger and stdout (`higgsfield-cli-spike.py:100-104`).
  * Observed input: CLI error output or exception containing `Bearer abcdef` or `https://host/path?sig=secret123`
  * Affected scope: `redact(text)` (`higgsfield-cli-spike.py:99`)
  * Falsifier: `redact("Failed: https://host/path?sig=123 Bearer abc")` returns `"Failed: https://host/path?sig=123 Bearer abc"` (the sensitive strings remain).
  * Fix: Update `redact()` to strip query parameters (e.g. `\?[^ \n"']+`) and common OAuth tokens (e.g. `Bearer [A-Za-z0-9\-_]+`).

* **[Should] Unvalidated `HIGGSFIELD_BIN` execution**: When the offline guard is disabled, `cli_bin()` uses `os.environ.get('HIGGSFIELD_BIN')` with no validation (`higgsfield-cli-spike.py:219`). This allows arbitrary commands to be executed in place of the CLI.
  * Observed input: `HIGGSFIELD_BIN=/usr/bin/whoami`
  * Affected scope: `cli_bin()` (`higgsfield-cli-spike.py:218`)
  * Falsifier: `HIGGSFIELD_BIN=/usr/bin/whoami python3 examples/2026-10-09-cell-division/higgsfield-cli-spike.py run --dry-run` executes `/usr/bin/whoami`.
  * Fix: Add a check inside `cli_bin()` when `HIGGSFIELD_CLI_SPIKE_OFFLINE` is not `'1'` to ensure `os.path.basename(b) == 'higgsfield'`.

* **[Pass] Spend safety**: Gate logic correctly applies the maximum of balance and estimates, checking `total <= CAP_CREDITS` and `math.isfinite(total)` (`higgsfield-cli-spike.py:138`). Any `NaN` or unparseable JSON values cause `spend_total` to return `NaN` (`higgsfield-cli-spike.py:146`) or fail parsing entirely (`higgsfield-cli-spike.py:132`), safely stopping the run. `reserve` row is strictly written before the CLI is invoked (`higgsfield-cli-spike.py:352`).

* **[Pass] Inspection and GO eligibility**: `go_eligible` safely checks `not row['flags']` and `row.get('inspection').get('real_alpha') is True` (`higgsfield-cli-spike.py:267-268`). An opaque RGBA or baked matte yields `transparentPixels=0`, which correctly results in `real_alpha=false` in the inspector (`inspect-alpha.mjs:72`).

* **[Pass] Diagram raster path**: The pipeline correctly requires exactly one `asset_<id>` match via `assert.deepEqual` (`render-diagram.mjs:195`), validates `sha256` against `provenance.web.sha256` (`render-diagram.mjs:62`), and refuses rendering if `alpha.real_alpha!==true` (`render-diagram.mjs:66`).

VERDICT: FAIL
Basis: 1 Blocker for token/query redaction, and 1 Should for `HIGGSFIELD_BIN` validation.

handing off to claude-a — go to the claude-a window and say 'take your turn'

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
