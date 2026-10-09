# RELAY · GH-1 spike dated output folders + HTML QA
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
6. **Commit only the relay file** (`relay(gh1-spike-output-folders-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit 6f62527: `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/measurements.json`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/runtime.json`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/playwright.html`, `tools/spike/REPORT.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md`, `CHANGELOG.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the operator asked that the HTML version of each render be saved and that all output go into sub-folders named yyyy-mm-dd-project-name. Each run writes `tools/spike/output/<local YYYY-MM-DD>-<package.json name>/` holding every PNG, `satori.svg`, both JSON records and the exact HTML Chromium loaded per case. The verifier checks the newest such folder, including HTML digests. The previously approved evidence contract (artwork QA relay `relay-system/2026-10-09/gh1-spike-artwork-qa.md`, Approved) is unchanged apart from paths. Document figures match the new run.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Small follow-up to the approved artwork revision. Operational envelope: local spike scripts; no framework. Receipts (full clone, Node v22.22.3, M1 Max): old flat `tools/spike/output/*` files removed with `git rm`; `node tools/spike/render.mjs` exit 0 → folder `tools/spike/output/2026-10-08-xyz-layout-engine-spike/` (local date); `pnpm run spike:verify` exit 0 PASS, printing `Evidence folder: tools/spike/output/2026-10-08-xyz-layout-engine-spike`; red control — append one space to `override-playwright.html` → `VERDICT: FAIL` / `Basis: override-playwright.html does not match the recorded digest` (restored, PASS); PDDA exit 0, same 3 pre-existing warnings. The plan doc's preflight-contract JSON (lines ~179–258) still lists flat paths: it is the historical dispatch contract and was intentionally left as written.

Questions:
1. Is the run-folder naming correct (local date via `toLocaleDateString('en-CA')`, package name from package.json) and consistent between render and verify? Edge cases: midnight crossing during a run, a stray non-matching folder, multiple dated folders.
2. Is the saved HTML exactly what Chromium loaded (same string passed to `page.setContent`, from the final fitted render), and does the timing boundary stay unchanged?
3. Are HTML records (`cases.*.playwright.html` path/bytes/sha256) complete and bound by the verifier? Can a missing or swapped HTML pass?
4. Do REPORT/PRD/CHANGELOG paths and figures match the new run's JSON (timings, memory, geometry, file sizes), and is the memory-limit change justified?
5. Any leftover reference to the removed flat paths that should have been updated (excluding historical relay logs, briefs and the preflight contract)?
6. Repository weight: each run folder is about 16 MB (three HTML files of 1–5 MB with inline fonts/images). Flag it if this is a problem for the spike, and propose the smallest remedy; do not request one unless warranted.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`; STATUS Approved only if nothing blocking remains.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
