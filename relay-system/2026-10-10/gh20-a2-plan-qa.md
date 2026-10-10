# RELAY · GH-20 Phase A2 marathon plan QA: designs, CLI write path, ROUTER pointer
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
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
6. **Commit only the relay file** (`relay(gh20-a2-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, `PROJECT/2-WORKING/catalog-designs/MARATHON.yaml`, `PROJECT/2-WORKING/catalog-designs/PREP-NOTES.md`, `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p0.md`, `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p1.md`, `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p2.md`, `PROJECT/2-WORKING/catalog-designs/briefs/gh20-a2-p3.md`. Source paths it plans against: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`, `test-budget.json`, `ROUTER.md`, `examples/2026-10-08-solar-system/verification.json`, `examples/2026-10-09-rag-system/verification.json`, `examples/2026-10-09-cell-division/verification.json`, `PROJECT/3-COMPLETED/GH-10-RECIPE-CATALOG.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: the A2 plan is executable by an unattended marathon without inventing scope and matches the finalized plan on issue #20 (one module, one dump, one write path; designs insert-only; seeds honest about null use cases; `verify` extended so hand-written designs rows and missing or extra log lines fail; ROUTER.md pointer); claims about existing code match the files; the migration from the current dump keeps recipe rows and GIDs byte-stable; every phase has an acceptance check that can fail and a red control; write-sets are honest and serial; the repo's no-new-tests / test-budget / no-new-dependency rules are respected; reversibility reads are honest; nothing public contains personal data, credentials or absolute home paths.

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI and library in an early-stage public repo; no tenants, no network service. Grade against the stated requirements and commensurate complexity; do not demand enterprise machinery. This is plan QA: no code is under review except where the plan makes claims about it. The finalized plan being implemented is the edited comment on issue #20 (its text is summarised in the plan's own sections).

Read the plan in full, then these files in this clone: `tools/catalog.mjs`, `tools/catalog.sql`, `tools/render.mjs` (the catalog block near the render receipt), `tools/spike/test/canaries.test.mjs` (the C4 catalog section), `test-budget.json`, `ROUTER.md`, and the three `verification.json` files named in Setup.

Questions:
1. Grounding: do the plan's file:line claims about the catalog module, dump, render receipt filter and C4 canary match the files? Anything unsupported or overstated?
2. Migration: is the claimed upgrade path (frozen schema 1 text, derived schema 2, `import` of the existing dump with GIDs retained) sound against `loadDump` / `preserveHistory` / `exportDump`? Name a concrete input where recipe rows or the canonical dump bytes would change.
3. NULL support: the plan says the dump format cannot hold NULL today and adds it only for the new table. Is that minimal and safe for the existing recipe columns?
4. Single write path and enforcement: do the verify extensions (recompute digests from files, pinned version exists, exactly one log line per design, no orphans) plus the ROUTER.md rule honestly cover hand edits? What is the cheapest bypass left, and does the plan state it?
5. Dump and log are two file writes, not one transaction. Is "verify exposes any gap and git restores it" acceptable for this scale?
6. Test discipline: can each acceptance check fail? Does the C4 extension stay small and inside the 60 s budget (the plan records a 43 s baseline)? Is anything over-built for A2?
7. Seeds and IDs: are the three seed designs honest (solar-system pinned, the other two null use case with the `no_recipe` flag)? Is the design ID rule reasonable and its Costly reversibility named?
8. Hygiene: no closing keywords next to issue numbers, no personal data or absolute home paths, no new dependency.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only on PASS.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer (agy) — Round 1

- `[Pass]` **Grounding**: file:line claims accurately match the current state. Verified `tools/catalog.mjs:16-31` (SCHEMA matches description), `tools/catalog.sql:16` (`schema_migrations` literal), `tools/render.mjs:361` (field filter logic), and `tools/spike/test/canaries.test.mjs:421,460` (empty dump text).
- `[Pass]` **Migration**: upgrade path preserves bytes and logic. Evaluated against `tools/catalog.mjs:71` (`loadDump` header admission) and `tools/catalog.mjs:41-44` (`exportDump` dump serialization). `SCHEMA_V1` admission correctly provisions the memory database with the V2 DDL while seamlessly retaining all pre-existing GID records.
- `[Pass]` **NULL support**: safe for existing recipe columns. Verified `tools/catalog.mjs:16-31` (`SCHEMA_V1`); the `recipes`, `recipe_versions`, `recipe_version_files`, and `recipe_outputs` tables all employ `NOT NULL` constraints on non-PK columns, which SQLite enforces via the `STRICT` table declaration.
- `[Pass]` **Single write path and enforcement**: the cheapest bypass is to manually forge a dump row, fixture/artifact file, and log line that all perfectly agree. The plan accurately states this bypass in `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:304` ("Hand-forged row, file and log line that agree... Costly (undetectable by design)").
- `[Pass]` **Dump and log split**: relying on `verify` to expose gaps and Git to restore state is acceptable for this local single-developer CLI operational envelope. This is documented for mitigation in `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:303`.
- `[Pass]` **Test discipline**: The C4 test extension is strictly bounded per `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:323` (capped at ≤15 added lines in `tools/spike/test/canaries.test.mjs:412-472`) and checks error states efficiently inside its isolated temp root.
- `[Pass]` **Seeds and IDs**: The design ID rule (`^(\d{4}-\d{2}-\d{2})-(<slug>)$`) is reasonable and its Costly reversibility is explicitly named in `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:214-219` and `PROJECT/2-WORKING/catalog-designs/PREP-NOTES.md:39`. The friction text logic ensures honesty.
- `[Pass]` **Hygiene**: No closing keywords used in `CHANGELOG.md` (`PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:457`). No new dependencies, absolute paths, or personal data introduced.

swept file: yes
VERDICT: PASS
Basis: The A2 plan is completely executable by an unattended marathon. It respects all repository constraints, accurately models the existing codebase via file:line pointers, successfully justifies its architectural design decisions, and addresses all items on the #20 and #21 QA briefs.
Review outcome: Approved.

handing off to Producer — relay closed (Approved), no further turn needed.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
