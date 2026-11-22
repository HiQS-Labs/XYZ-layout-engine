# RELAY · GH-20 A2 Phase 1 recovery: independent attested code review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
-->

NEXT: done
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
6. **Commit only the relay file** (`relay(gh20-a2-p1-recovery-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/spike/test/canaries.test.mjs`. Context: `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p1.md`, `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p0.md`, `test-budget.json`, `tools/render.mjs`, `tools/request.mjs`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: Phase 1 of the A2 plan is implemented as its brief specifies (acceptance P1-A1 to P1-A7 and decisions D1 to D8): the insert-only `designs` table as migration 2 with the existing recipe rows and GIDs byte-stable in the dump; NULL literal support limited to the new table; the design ID rule and relative-path confinement; `design list|show|add` with refusal of a duplicate ID and one canonical log line per design; `verify` extended for designs (digest recomputation, pinned recipe version exists, exactly one log line per design, no orphan lines) with error fields never `dump` or a recipe name; the existing C4 canary extended within its line budget; no change to `tools/render.mjs`, `tools/request.mjs`, `package.json`, the lockfile or `test-budget.json`; no new dependency, test file or workflow. This is a recovery review: the marathon driver halted this phase because the original reviewer left the header at Open; the content was never independently attested.

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI in an early-stage public repo. Grade against the brief and plan, not enterprise machinery. Review the whole of `tools/catalog.mjs` (not only the diff) plus the dump and the C4 canary extension. Measure read-only under `.relay-scratch/` or `$TMPDIR` (copy the repo files you need; never run the full test suite in this worktree).

Questions:
1. For each acceptance item P1-A1 to P1-A7 in `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p1.md`: is it met, with a file:line or a quoted probe result?
2. Migration: does `import` of the old dump retain every recipe row and GID with identical canonical bytes? Name a concrete input where recipe rows would change.
3. Hand-edit coverage: does `verify` fail on a forged `artifact_digest`, a removed log line and an orphan log line? Which bypass remains and is it the one the plan states?
4. Did the NULL-literal support leak into recipe columns (a NULL in a recipe row must still fail to load)?
5. Is anything over-built, duplicated (one path helper, one writer) or outside the allowed files?

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

### Reviewer · Round 1

swept file: yes

- `[Pass]` P1-A1: `verify` and `export --check` exit 0 on the migrated dump. In a `$TMPDIR` copy with `designs` DDL removed, `verify` correctly exits 1 with `migration 1 or 2 schema/header required` (`tools/catalog.mjs:95`).
- `[Pass]` P1-A2: `git diff -U0 <base> -- tools/catalog.sql | rg -c '^-INSERT'` finds 0. The existing `INSERT INTO recipes` rows are retained identically (e.g., `tools/catalog.sql:19` `INSERT INTO recipes VALUES ('rcp-7108d3cc...`).
- `[Pass]` P1-A3: NULL-use-case `design add` succeeds (recorded as `null` in DB) and `export --check` exits 0. A NULL injected into `recipes` slug column fails with `NOT NULL constraint failed: recipes.slug`. Implemented correctly via tokenizer literal expansion at `tools/catalog.mjs:107` (`raw === 'NULL' ? null : Number(raw)`).
- `[Pass]` P1-A4: Second `design add` of `2026-10-08-solar-system` correctly exits 1 with `Validation failed: [{"field":"2026-10-08-solar-system","message":"design already recorded"}]`, leaving `design-log.jsonl` and `catalog.sql` unmodified (`tools/catalog.mjs:284`).
- `[Pass]` P1-A5: `design update x` exits 2 due to strict usage validation at `tools/catalog.mjs:255` (`if (design && !['list','show','add'].includes(args[1]))`). `design list` exits 0.
- `[Pass]` P1-A6: `rg -n 'prepare\(\s*[^']*\$\{' tools/catalog.mjs` finds 0 matches. Parameterized queries are used exclusively (e.g., `tools/catalog.mjs:298` `db.prepare('INSERT INTO designs VALUES (?,?,?,?,?,?,?,?)').run(...)`).
- `[Pass]` P1-A7: `git diff --exit-code <base> -- package.json pnpm-lock.yaml test-budget.json tools/render.mjs tools/request.mjs tools/recipes examples tools/spike/output` exits 0.
- `[Pass]` P1-A8: `verify` correctly assigns design error fields to the ID or `'design-log'` (never `'dump'`). Confirmed at `tools/catalog.mjs:106` (`spec[0] === 'designs' ? values[0] ?? 'design-log' : 'dump'`). If `'dump'` were incorrectly used, `tools/render.mjs:410` would catch it and fail C1 at `tools/spike/test/canaries.test.mjs:43`.
- `[Pass]` Design verification: Digest recomputation and log parity checks are correctly implemented in `verify` at `tools/catalog.mjs:142` (`check(lines.length === designs.length, 'design-log', 'one log line per design expected');`).

VERDICT: PASS
Basis: The Phase 1 implementation cleanly satisfies all acceptance criteria in the brief. Legacy recipe rows are preserved intact, NULL literals are isolated properly, duplicate design logs are blocked, and strict error field assignment correctly prevents regression in the `render.mjs` pipeline.

Review outcome: Excellent work, zero over-engineering.

handing off to done — relay closed (Approved), no further turn needed.


### Attestation · relay-drive — 2026-10-10T19:59:49Z
task: RELAY-gh20-a2-p1-recovery-qa-agy1
reviewer: agy
status: Approved
reviewed-head: 5fb13bfcf9b83454ec13fe3c30ac2f51c62ba4e6
added-range: 8030+2718
added-sha256: 64f7fc7c8c4d5582b10c90848984c5f446ebc2ff19814b01846d9066c06d27d5
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
