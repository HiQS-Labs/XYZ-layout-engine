# RELAY · GH-8 final QA: Phase 0 findings, ledger, example
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
6. **Commit only the relay file** (`relay(gh8-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed work on branch feat/higgsfield-spike-cell-division (diff main to HEAD): `examples/2026-10-09-cell-division/FINDINGS.md`, `examples/2026-10-09-cell-division/spike-ledger.jsonl`, `examples/2026-10-09-cell-division/README.md`, `examples/2026-10-09-cell-division/higgsfield-spike.py`, `examples/2026-10-09-cell-division/inspect-alpha.mjs`, `examples/2026-10-09-cell-division/render-diagram.mjs`, `examples/2026-10-09-cell-division/fixture.json`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`, `relay-system/2026-10-09/gh8-code-qa.md`. Context: `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: the approved plan (requirements 1 to 8) is satisfied: a bounded, spend-capped spike that tried the PNG transparency settings for Images 2.5, a truthful NO-GO or GO verdict backed by the ledger, a cell-division explainer example, honest docs, no key or secret anywhere, and no engine, test or dependency change.

## QA brief (read before reviewing)

This is final QA of finished work after a real, paid spike. Operational envelope: a local single-developer spike with a $2.00 cap. Grade against the approved plan and commensurate complexity. Do not ask for a provider contract, a Higgsfield skill or connector (explicitly out of scope: Phases 1 to 4 of issue #8), more paid probes, new tests, or an MCP test (not possible here and stated). Do not make network calls or read any key file.

Facts you cannot see: the 12 downloaded images are outside the repo (their sha256 are in the ledger). The final reviewer viewed four of them (one faint baked checkerboard, three flat white) and wrote only that in `FINDINGS.md`. Audit that the findings claim no more than the ledger and that wording.

Questions:
1. Truthfulness: does every number and claim in `FINDINGS.md` (12 calls, 0 alpha, colour type 2, latencies, sizes, sha prefixes, accepted-not-rejected, estimate behaviour, discover results, $1.20 reserved) match `spike-ledger.jsonl`? Parse the ledger with a read-only probe and quote any mismatch.
2. Is NO-GO the right verdict under the issue's definitions (GO needs at least one surface with real alpha; UNCERTAIN counts as NO-GO), and is it stated with the right scope (REST Flare and Sunburst only, MCP untested, 1k/low only)? Any overclaim (for example "Higgsfield cannot do transparency") or underclaim?
3. Spend: does the ledger show reserve-before-submit for every paid call, cumulative reserved at or under $1.90, no retry or double submit, and no call beyond the planned 12? Is the statement that the real charge was not measured adequate and prominent?
4. Secrets and leakage: inspect the ledger and all committed files for anything sensitive: key material, signed URL query strings, headers, request bodies echoing credentials, absolute personal paths that should not be published. (The final reviewer separately scanned all tracked files and `git log -p main..HEAD` for the real key id and secret: no hits.)
5. Do README, CHANGELOG and the plan's evidence section agree with `FINDINGS.md` and with each other, and claim no more than was shown (including the process notes: plan 3 rounds, code 3 rounds, the post-cap fix verified by the final reviewer only)?
6. Scope: does the diff touch only `examples/2026-10-09-cell-division/`, the plan, the relay threads, the ledger files and the changelog? No `tools/spike/**`, `package.json`, `test-budget.json`, no test, workflow or dependency? Any raw image downloads committed?
7. Is the example sound as delivered (hand-drawn SVG art, both PNGs, checks) and is "Refs #8, issue stays open" the right PR framing?

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
