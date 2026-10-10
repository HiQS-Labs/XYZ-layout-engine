# RELAY · PR #24 final QA: GH-20 A2 designs, catalog write path, ROUTER pointer, design log
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
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
6. **Commit only the relay file** (`relay(gh24-codex-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs`, `ROUTER.md`, `README.md`, `CHANGELOG.md`. Plan and context: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, `PROJECT/2-WORKING/catalog-designs/PREP-NOTES.md`, `test-budget.json`, `tools/render.mjs`, `tools/request.mjs`, `examples/2026-10-08-solar-system/verification.json`, `examples/2026-10-09-rag-system/verification.json`, `examples/2026-10-09-cell-division/verification.json`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: PR #24 implements Phase A2 of the finalized plan on issue #20 without inventing scope: one module, one dump, one write path; the insert-only `designs` table as migration 2 with recipe rows and GIDs byte-stable; NULL accepted only for the new table's nullable columns; `design list|show|add` with no update or delete; one canonical log line per design and duplicate refusal; `verify` extended to recompute digests from files, confirm the pinned recipe version, and require exactly one log line per design and no orphans; ROUTER.md pointer; honest seeds (solar-system pinned, the other two with a null use case); claims in the PR body match the code; no new dependency, test file, workflow or budget change; no personal data, credentials or absolute home paths; reversibility honest. This is the independent final QA before merge.

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI and library in an early-stage public repo; no tenants, no network service. Grade against the stated requirements and commensurate complexity; do not demand enterprise machinery or unrequested threat models.

Review the whole of `tools/catalog.mjs` (not only the diff; `git diff origin/main...HEAD -- tools ROUTER.md README.md CHANGELOG.md` shows the change), the dump, the log and the C4 canary extension. You may run narrow read-only probes in a scratch copy under `.relay-scratch/` or `$TMPDIR`; do not run the full test suite in this worktree (a disposable clone result is already recorded in the PR body: 4/4 in about 31 s).

Questions:
1. Does the code match the plan's requirements and the PR body's claims? Cite file:line for any claim that is false or overstated.
2. Migration and byte stability: does importing the previous dump retain every recipe row and GID with identical canonical bytes? Name a concrete input where recipe rows would change.
3. `verify`: does it fail on a forged `artifact_digest`, a forged `data_hash`, a design pinned to an unpublished recipe version, a removed log line, a duplicated log line, an orphan log line? Which bypass remains and does the PR body state it honestly?
4. `design add`: is the order of the dump write, the log append and the duplicate refusal safe when the second write fails (the PR says verify exposes any gap and git restores it)? Is path confinement (relative paths, `examples/` prefix, no `..`, no symlink escape) enforced where files are read?
5. Did NULL support leak into recipe columns, and did any error `field` use `dump` or a recipe name (which would mark recipe renders unverified in `tools/render.mjs`)?
6. Scope and hygiene: anything outside the stated files, any new dependency, test file or workflow, any closing keyword near an issue number, any personal data or absolute home path in the added lines (transcripts were scrubbed)?
7. Anything over-built or duplicated for a catalog of three designs?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** when you approve, set the `STATUS:` line at the **top of this file** to `Approved` and `NEXT:` to `done`, in addition to your block. Do not run any `tick` command; the harness closes the token.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
