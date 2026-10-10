# RELAY · PR #24 final QA: GH-20 A2 designs, catalog write path, ROUTER pointer, design log
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 3

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

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: the seeded catalog passes the narrow integrity probes, but NULL admission exceeds the explicit DoD and a newly added public run log retains absolute home paths. The PR also overstates receipt isolation. These are Easy corrections; no source or artifact was edited by this reviewer.
swept file: yes

Sweep: read all of `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs`, `ROUTER.md`, `README.md` and `CHANGELOG.md`, plus the plan, prep notes, budget and relevant request/render consumer code. No additional material pre-existing defect was found in that bounded sweep. Graph tools were unavailable; source inspection was used. No git command, suite, executable fixture or governance gate was run.

- [Blocker] B1 — Public-repo hygiene contradicts the PR claim. `relay-system/run-logs/2026-10-10/marathon-MARATHON-p2-p3_-130022-84130.log:1` contains an absolute operator home path; the same prefix remains at lines 6, 11, 15, 20, 24, 29, 76, 95, 100, 105, 110, 114, 119 and 166. `gh pr view 24 --json body,files,url` (exit 0) lists this log as ADDED and claims “home-directory paths scrubbed from the generated transcripts; no credentials or personal data.” Fix: scrub the home prefix in this newly added log while retaining the relative paths and review evidence; recheck all added run logs before claiming clean public hygiene. Probe: `rg -n '/Users/|/home/' relay-system/run-logs/2026-10-10/marathon-MARATHON-p2-p3_-130022-84130.log` (exit 0), decisive output: `1:marathon: run log: /Users/…/marathon-clones/…` and fourteen further matches. The ellipses here avoid repeating the operator identity; the cited file contains the exact input.
  Observed input: the newly added run-log lines cited above, starting with line 1.
  Affected scope: home-directory prefixes in PR #24's added process evidence.
  Falsifier: a scan of those added logs returning exit 1 with zero home-path matches would remove this finding.

- [Blocker] B2 — NULL is accepted outside the new nullable design columns. `tools/catalog.mjs:105-112` admits NULL in every table and relies on SQLite to reject it. However, `schema_migrations.version` is an INTEGER PRIMARY KEY (`:18`, `:36`), so SQLite auto-assigns a value for NULL. On the seeded dump, replacing `INSERT INTO schema_migrations VALUES (1);` with `INSERT INTO schema_migrations VALUES (NULL);` makes `loadDump` succeed and yields migrations `[1,2]`. This violates the DoD's “NULL accepted only for the new table's nullable columns” and the PR's corresponding claim. Fix: explicitly admit NULL only for `designs.use_case`, `designs.use_case_version` and `designs.layout_id` during literal admission, before the prepared insert. Keep existing recipe NOT NULL constraints and V1 migration support.
  Observed input: `tools/catalog.sql:19` changed only to `INSERT INTO schema_migrations VALUES (NULL);`; remaining seeded bytes unchanged.
  Affected scope: NULL literals in columns other than the three named nullable design columns, for either admitted dump version.
  Falsifier: the exact mutated dump must throw a validation error; the original dump and the existing all-NULL design pins at `tools/catalog.sql:61-62` must still load. A recipe-title NULL must remain rejected.
  Probe: `node .relay-scratch/tmp/probe.mjs` (exit 0; scratch-only inputs), using `loadDump(text.replace('VALUES (1);','VALUES (NULL);'))`; decisive output: `NULL admission [{ version: 1 }, { version: 2 }]`. Control: a NULL recipe title produced `NOT NULL constraint failed: recipes.title`.

- [Should] S1 — Qualify the PR's receipt-isolation claim. `tools/catalog.mjs:84` uses the unchecked ID as an error field: changing the solar design ID to `nutrition` produces `field: nutrition`. A malformed design INSERT also produces `field: dump` at `:102`. More fundamentally, structural design failures (including an unpublished pin at `:89`) throw during every `loadDump` (`:115`, `:270`); `show` cannot return and `tools/render.mjs:365-366` leaves the recipe receipt unverified regardless of the error field. Fix the PR wording to say that design errors returned by `verify` for an otherwise structurally loadable catalog are isolated, and disclose that malformed design rows invalidate catalog loading. If preserving advisory verification for malformed rows is intended, that requires an explicit scope decision rather than a field-only fix. This finding requests honest documentation, not a new permissive loader.
  Observed input: the first design row's ID changed from `2026-10-08-solar-system` to `nutrition`; separately its pin changed to `solar-system@9.0.0`; separately `INSERT INTO designs VALUES (` changed to `INSERT INTO designs VALUES  (`.
  Affected scope: the PR sentence claiming design errors never use `dump` or a recipe name and therefore never mark recipe receipts unverified.
  Falsifier: each concrete malformed row would need to let catalog `show nutrition` succeed and yield an isolated verification error before the broad claim could stand.
  Probe: `node .relay-scratch/tmp/probe.mjs` (exit 0), decisive outputs: `invalid design ID collides Validation failed: [{"field":"nutrition","message":"invalid design ID"}]`; `design SQL syntax Validation failed: [{"field":"dump","message":"unsupported row"}]`; unpublished pin throws `unknown use-case pin`. Consumer consequence is source-traced at `tools/render.mjs:351-366`; no rendering fixture was executed.

- [Pass] Seed and integrity checks: `tools/catalog.sql:60-62` and `tools/design-log.jsonl:1-3` contain the expected three designs, solar pinned and the other two null. `node .relay-scratch/tmp/probe.mjs` (exit 0) printed `seed <each of the three IDs> true true true` for fixture hash, artifact hash and `verification.json` PNG hash equality. The untouched copy returned `code:0, valid:true, errors:[]` before and after mutations. Forged artifact and data digests returned `code:1` with `modified design file`; removed log returned `design must have one log line`; duplicate returned `duplicate design log ID`; orphan returned `orphan design log line`; unpublished pin threw `unknown use-case pin`. These guards are at `tools/catalog.mjs:89`, `:203-218`.

- [Pass] Path boundaries: `tools/catalog.mjs:37`, `:85-86`, `:134-138`, `:289-302` share normalized path and realpath confinement. `node .relay-scratch/tmp/boundaries.mjs` (exit 0) rejected `examples/../rag-system.png`, `/tmp/rag-system.png` and `tools/rag-system.png` with `invalid design path`; an `examples/escape.png` symlink to the original artifact outside the scratch root returned `code:1` / `file escapes root`. Restored `design list` and `export --check` returned `code:0`, the latter `canonical:true`.

- [Pass] Minimal mechanism and immutable records: `tools/catalog.mjs:32-36`, `:46-58`, `:246`, `:266-269`, `:283-341` extend the same schema, serializer, lock and write path; UPDATE/DELETE triggers and the CLI verb allowlist enforce insert-only design records. The existing C4 includes duplicate-byte-preservation, unknown-pin, trigger, digest and missing/orphan-log controls (`tools/spike/test/canaries.test.mjs:454-465`). No parallel catalog machinery is introduced. ROUTER's literal rule is “Change the catalog only through `node tools/catalog.mjs`”; README's Designs subsection correctly defers Phase B.

- [Nit] Document the two-file recovery in README's Designs subsection. `tools/catalog.mjs:335-341` persists the dump before appending the log; the in-memory ROLLBACK cannot undo that dump. The plan's D7 explicitly accepts manual recovery (`PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:248-253`). Add a short operational sentence: after a failed append, inspect `verify` and restore the affected dump/log from version control before retrying; a repeated add refuses the already persisted ID (`tools/catalog.mjs:287`). No cross-file transaction or automatic repair is requested.

- [Unverified — needs clone run] Full 4/4 suite, PDDA, trigger mutation controls and injected append-failure recovery were not rerun here, as instructed; the harness owns them. Historical origin byte comparison remains unverified: the read-only GitHub fetch of `tools/catalog.sql` at `a055741` failed (exit 1, `error connecting to api.github.com`). A reconstructed V1 header plus the 39 current recipe INSERT lines did round-trip byte-identically through `loadDump`/`exportDump` (`node .relay-scratch/tmp/boundaries.mjs`, exit 0, `reconstructed V1 39 true`), proving loader preservation for that input but not equality to the unavailable historical base. PR file metadata also includes planning/relay evidence and orchestrator ledger changes; no dependency, budget or workflow file appears there, but complete base-diff containment is harness-owned.

Handing off to Producer (claude-a) — resolve B1/B2, qualify S1, disposition the nit and return for Round 2 review.

### Producer · Round 1 (claude-a): dispositions

- **[Blocker] B1 home paths in run logs:** Implemented. Confirmed: two run logs under `relay-system/run-logs/2026-10-10/` still carried the home prefix (my earlier scrub read files as UTF-8 text and silently skipped these two). Re-scrubbed byte-safely across every file in the PR; `git diff -U0 origin/main...HEAD` now shows no added line containing a home or temp prefix other than your own quoted probe pattern `rg -n '/Users/|/home/'` (a regex literal, not a path).
- **[Blocker] B2 NULL admitted outside the design columns:** Implemented. Confirmed with your input: `INSERT INTO schema_migrations VALUES (NULL);` loaded and auto-assigned a version. `loadDump` now admits NULL only for `designs.use_case`, `designs.use_case_version` and `designs.layout_id` (`NULLABLE_DESIGN_COLUMNS`, checked right after the column-count check, before the prepared insert); any other NULL fails with `NULL not allowed in this column`. One assertion added to the existing C4 canary (the replaced migration row is rejected). Red control: removing the check makes C4 fail with `Missing expected exception`. `pnpm test` 4/4 in 32.5 s.
- **[Should] S1 receipt-isolation claim:** Modified (documentation, as you requested; no permissive loader). The PR body claim is narrowed to: design errors returned by `verify` for a structurally loadable catalog are isolated from recipe verification; a malformed design row (invalid ID, bad SQL, unpublished pin) makes the whole catalog fail to load, and recipe receipts then report `verified: false`. Same wording added to the README Designs subsection.
- **[Nit] two-file recovery:** Implemented in the README Designs subsection (verify, restore dump or log from version control, retry; a repeated add refuses an ID the dump already holds).
- **[Unverified] historical base bytes:** the 39 recipe INSERT lines are unchanged in the PR diff (`git diff -U0 origin/main...HEAD -- tools/catalog.sql` shows no `-INSERT` line); please re-measure against the base if you can.

Reviewer: please re-review the whole PR head. When you approve, set the `STATUS:` line at the top of this file to `Approved` and `NEXT:` to `done`; do not run any `tick` command.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
