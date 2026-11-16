# RELAY · GH-85 plan QA: Python asset-generation JS spike
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-16.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh-85-plan-qa-python-asset-generation-js-spike): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-85-JS-ASSET-SPIKE.md** (`PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md`) — base commit `e100f57`. Read-only; do NOT edit it.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-16
- **Operational envelope:** Technical spike in a new ESM folder (`tools/asset-gen-spike/`) proving parity with the active Python asset-generation scripts while isolating zero-dependency Web-Standard `core/` modules from Node OS adapters `node/` for eventual reuse in a single-operator Lovable Vite + TanStack app. Grade against stated requirements and commensurate complexity (`/ponytail`). Do NOT request multi-tenant cloud infra, Vite app scaffolding, npm dependency additions, deletions/edits of existing `.py` files, or new `*.test.*` / `test/` files (`test-budget.json` strictly caps the repo at 1 test file / 4 canaries). Note `releases.db`/`releases.sql` changes are written by the repo's ledger CLI, not hand edits.

**Paraphrase first (before reading any source file):** under `What this proposes` and `How the existing system works, per this document`, write 2–5 sentences each from the plan alone, plus a short `What it's not`. Then inspect the repository sources below and answer the questions with `file:line` citations.

Sources to check:
- `examples/2026-10-08-solar-system/generate-assets.py` (whole file: job admission, `job_digest`, `manifest.json`, `fcntl.flock`, FD inheritance, timeout kill, PNG verification, redaction)
- `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (whole file: `parse_strict_json`, `spend_total`, `gate_allows`, email/secret redaction, `fcntl.flock`, 11 `selftest` controls)
- `examples/2026-10-09-cell-division/higgsfield-spike.py` + `SOP.md` (NO-GO context)
- `tools/spike/test/canaries.test.mjs` (lines 343–454: generator recovery & redaction controls)
- `tools/spike/test/run.mjs` & `test-budget.json` (why verification uses `tools/asset-gen-spike/verify.mjs` outside `test/` and not `*.test.mjs`)
- `tools/render.mjs`, `tools/request.mjs`, `tools/catalog.mjs`, `package.json`

Questions:
1. Are the plan's factual claims about existing Python scripts (`generate-assets.py`, `higgsfield-cli-spike.py`, `higgsfield-spike.py`) and canary coverage (`canaries.test.mjs:343-454`, `test-budget.json`) accurate? Note any subtle edge cases in Python (e.g., `json.dumps` formatting / Unicode / safe-int checks, `parse_strict_json` `NaN`/`Infinity`/`1e999`, email refusal on ledger append, symlinked/broken manifests, signed-URL redaction idempotence) that the JS port must match.
2. Does the planned `core/` (Web-Standard ESM, zero `node:*` imports) vs `node/` (CLI + OS adapters) split cleanly serve eventual Lovable Vite + TanStack reuse without over-engineering or duplicating business rules?
3. Is the proposed atomic lockfile (`O_CREAT | O_EXCL` with `{ parentPid, childPids }` liveness check) a sound, honestly scoped Node adaptation of Python's `fcntl.flock` + FD inheritance across timeout/orphaned-child recovery tests (`canaries.test.mjs:390-399,448-453`), given Node's lack of stdlib `flock(2)`?
4. Does `tools/asset-gen-spike/verify.mjs` avoid violating `tools/spike/test/run.mjs` and `test-budget.json`?
5. Definition of Done: plan covers both active `.py` scripts, preserves existing `.py` files untouched, defines falsifiable offline + cross-language parity checks, fits `test-budget.json`, and keeps complexity commensurate with a technical spike.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
