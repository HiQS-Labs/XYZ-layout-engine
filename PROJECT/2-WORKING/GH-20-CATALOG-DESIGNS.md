---
gh_issue: 20
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20
title: "Three-ID model: grid-string layouts, use case recipes, and design records"
status: "Planned; awaiting plan QA"
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
doc_type: feedback
complexity: 2
risk: 2
effort: 2
phases: 4
ratings_provisional: true
branch: marathon/gh-19-catalog-designs (base origin/main at a055741, which contains PR #18 and PR #22)
reversibility: "Easy for the designs table, CLI verbs, log file and ROUTER rule (all text, rebuilt from the dump); Costly for the design ID format once shared outside the repo."
non_goals:
  - Phase B (grid-string parser, geometry function, layouts table, use_case_layouts, filling layout_id, responsive stacking) — planned as a separate marathon after A2 merges.
  - A separate designs.sql or designs.db, a second module, a git hook, tamper-proofing, or any new check beyond extending `catalog verify`.
  - Design update or delete verbs, params copied into the DB, timestamps, render fingerprints (§10.1), remote tenant_id.
  - New npm dependency, new test file or test() block, CI workflow, test-budget change, render.mjs or recipe edits.
related:
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/21
  - https://github.com/HiQS-Labs/XYZ-layout-engine/pull/22
  - PROJECT/3-COMPLETED/GH-10-RECIPE-CATALOG.md
  - PROJECT/2-WORKING/catalog-designs/MARATHON.yaml
  - PROJECT/2-WORKING/SPECS-PRD.md
goal: >
  Phase A2 of the finalized #20 plan: the existing catalog (`tools/catalog.mjs`, one canonical dump
  `tools/catalog.sql`) gains an insert-only `designs` table (schema migration 2) and
  `design list|show|add`; the three existing examples are seeded through the CLI (solar-system pinned
  to `solar-system@1.0.0`, RAG and cell-division with a null use case); every `design add` appends
  one canonical line to the #21 log `tools/design-log.jsonl`; `catalog verify` recomputes design
  digests, checks pins and requires exactly one log line per design; ROUTER.md names the CLI as the
  only write path. Recipe rows stay byte-identical and `pnpm test` stays 4/4 within 60 s.
---

## Key concepts

- A **design** is one real artifact: an ID in `date-slug` form, a nullable pinned use case
  (`slug@semver`), a fixture referenced by path and sha256, and a primary PNG referenced by path and
  sha256. It lives in the same catalog module and dump as recipes; there is no second store.
- Designs are **insert-only**: `design add` is the only write; an edit forks a new design ID.
- The **#21 design log** is a one-way, append-only JSONL record (one line per design) that collects
  the data later used to judge the grid grammar. Nothing reads it at render time.
- **Enforcement is consistency, not tamper-proofing:** `catalog verify` (already in canary C3)
  recomputes digests from disk, checks the pin and the one-line-per-design rule.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# GH-20 Phase A2 — Catalog designs, design log and the ROUTER pointer

## Status

| What was just completed | What's next |
|---|---|
| Capture promoted from 1-INBOX and expanded into a marathon-executable plan for Phase A2 only: grounded current state, design decisions resolved with planning evidence, four serial phases with failing acceptance checks and red controls, exact write-sets, preflight contract, `catalog-designs/MARATHON.yaml` and four briefs. | Independent plan QA by the orchestrator, ledger repoint of the GH-20 roadmap row from the old 1-INBOX path to this path, operator decisions in `catalog-designs/PREP-NOTES.md`, then exact-plan confirmation before firing. Phase B is not planned here. |

## Table of contents

- [Verdict and purpose](#verdict-and-purpose)
- [Observed current state](#observed-current-state)
- [Requirements and scope decisions](#requirements-and-scope-decisions)
- [Design decisions](#design-decisions)
- [Smallest affected surface](#smallest-affected-surface)
- [Non-goals](#non-goals)
- [Dependencies](#dependencies)
- [Risks and rollback](#risks-and-rollback)
- [Test scope](#test-scope)
- [Phase 0 — Spike: migration, NULL literal, ID, log and path decisions](#phase-0--spike-migration-null-literal-id-log-and-path-decisions)
- [Phase 1 — Designs table, CLI verbs, verify and C4](#phase-1--designs-table-cli-verbs-verify-and-c4)
- [Phase 2 — Seed three designs and the design log](#phase-2--seed-three-designs-and-the-design-log)
- [Phase 3 — ROUTER pointer, README and CHANGELOG](#phase-3--router-pointer-readme-and-changelog)
- [Acceptance](#acceptance)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)
- [Appendix — issue #20 body (captured verbatim)](#appendix--issue-20-body-captured-verbatim)

## Verdict and purpose

A2 is worth doing now because the catalog module, dump grammar, lock, atomic write and `verify`
gate already exist (PR #22), so designs are an additive table and three verbs, not a new system.
The finalized plan on #20 (Phase A2, "Add designs and the ROUTER pointer") fixes the scope; this
document makes it executable and resolves the questions it left open.

**Bet:** one more table in the same dump, guarded by `verify` consistency checks, gives a usable
design record and the #21 data loop without a second store. **Tradeoff:** the design rule is a
convention backed by checks, not tamper-proofing (a person can fabricate a row, file and log line
that agree). **Failure mode:** the migration rewrites recipe rows or GIDs, or design errors leak
into recipe render receipts, or the dump and log drift apart silently. Each has a failing check
below. **Reversibility:** Easy for table, verbs, log and ROUTER rule; Costly for the design ID
format once the IDs are referenced outside the repo.

## Observed current state

All references were read at `a055741` (origin/main) in this clone on 2026-10-10.

- **One catalog module owns all catalog I/O.** `tools/catalog.mjs` (257 lines) defines the fixed DDL
  as `SCHEMA` (`:16-31`), whose header says `migration 1` (`:16`) and whose
  `schema_migrations` table is `CHECK(version = 1)` (`:18`). `validateLedger` requires exactly one
  migration row (`:47`). `TABLES` (`:32-38`) fixes table order, columns, `ORDER BY` natural keys
  and the insert statement per table; `exportDump` (`:41-44`) writes `SCHEMA` plus rows.
- **The dump grammar has no NULL.** `quote` (`:39`) handles numbers and strings only;
  the loader's literal tokenizer (`:81`) admits only `'…'` strings and digits. Planning probe
  (Node v22.22.3): `quote(null)` throws `TypeError`; `loadDump` of a row containing `NULL` fails
  `invalid SQL literal`. A nullable `use_case` therefore needs one grammar extension.
- **`loadDump` admits only the exact current header** (`:71`, `text.startsWith(SCHEMA)`), runs the
  fixed DDL and inserts literal rows through prepared statements (`:70-92`). Any change to `SCHEMA`
  makes the committed migration-1 dump unloadable unless an upgrade path exists.
- **Path and file primitives to reuse.** The relative-path rule (regex, not absolute, no empty, `.`
  or `..` segment) is inline at `:60`; `fileBytes` (`:109-114`) realpaths, confines to the root via
  `within()` from `tools/request.mjs` and requires a regular file.
- **`verify` and its consumers.** `verify` (`:140-158`) reports `{field,message}` errors; the
  canonical-bytes error uses `field: 'dump'` (`:142`). `tools/render.mjs:349-367` calls
  `show` and `verify` and keeps only errors whose field is `dump`, the recipe slug or one of that
  recipe's file paths (`:361`) to set `catalog.verified`.
- **CLI grammar.** `parse` (`:182-197`) takes one verb, boolean flags `json|check` and value flags
  `title|reason` (`:188-189`), fixed positional counts (`:192`) and per-verb allowed flags
  (`:193`); usage errors exit 2 (`:256`). Write verbs (`:202`) take `tools/.catalog.lock` with `wx`
  (`:205`), run one transaction and replace the dump atomically (`:174-180`, `:242`).
  `preserveHistory` (`:159-173`) iterates `TABLES.slice(2)` (`:169`), so any table appended to
  `TABLES` is automatically protected on `import`.
- **The committed dump.** `tools/catalog.sql` has the 15-line schema (`:1-15`), one migration row
  (`:16`) and 39 recipe-table rows (`:17-55`: 2 recipes, 2 versions, 27 files, 8 outputs). The
  solar-system recipe's schema file is `examples/2026-10-08-solar-system/fixture.json` with digest
  `79116fc0…` (`:44`), the same bytes the solar design's `data_hash` will record.
- **The three examples.** Each `examples/<id>/verification.json` has `artifactDigests.png`
  (solar `:231`, RAG `:82`, cell-division `:103`). Planning probe: sha256 of each committed primary
  PNG equals that entry. Fixture digests and canvases (from the fixture's `width`/`height`):

  | Design ID | Fixture sha256 | Primary PNG | PNG sha256 (= `artifactDigests.png`) | Canvas |
  |---|---|---|---|---|
  | `2026-10-08-solar-system` | `79116fc098ef557530c95ee0920a88f72f63142473bd9bc74a01b5f4aecec12c` | `solar-system.png` | `f3a9660b13e713057cdb46697a787cd30504fb7593e09ad976e8bb28e267e567` | 2400x1700 |
  | `2026-10-09-rag-system` | `0744b254803b75c8b3664e48f90085ccdd9076af3c302a0c360e01f1d5892079` | `rag-system.png` | `c59d51b1e08b3c2b024a519c6842397640410891d64ee519fe1dfdd3237a49a6` | 2400x1660 |
  | `2026-10-09-cell-division` | `07efa33b796ad24f3a032feeb39dfecc4db8e7f389682df959889d64d56346b0` | `cell-division.png` | `343e1c063c46bcd29307ad5be19954951e85706aff081379440288aaa59c4044` | 2400x1480 |

  Only `solar-system` is a catalog recipe (`tools/catalog.sql:18`); RAG and cell-division are
  hand-built `render-diagram.mjs` scripts. RAG stages sit on lanes `ingest`/`store`/`query` by
  column (capture: grid `111000-001000-111111`); cell-division has six stages in one row
  (`col` 0–5) under three group bands.
- **Canaries.** C1 copies only `tools/` and `package.json` into a temp root
  (`tools/spike/test/canaries.test.mjs:31-35`) and asserts the nutrition receipt has
  `catalog.verified === true` (`:43`). C3 runs `catalog verify` on the committed tree (`:369-370`).
  C4's catalog section (`:412-472`) writes an empty dump as
  `SCHEMA + 'INSERT INTO schema_migrations VALUES (1);\n'` twice (`:421`, `:460`), exercises
  triggers in-process (`:435-442`) and checks usage exit 2 (`:471`). C4 already copies
  `examples/2026-10-08-solar-system` into its temp root (`:404`) but not `tools/design-log.jsonl`.
- **Budget.** `test-budget.json:9` caps 1 file / 4 tests / 60 s / 0 workflows;
  `tools/spike/test/run.mjs:33` counts test-like files. Baseline `pnpm test` here (outside the
  sandbox, which blocks Chromium launch): exit 0, 4/4, `C2 digests: 12 artifacts byte-identical`,
  `test-budget: PASS — 4 canaries in 43.2s (budget 60s)`. Headroom is about 17 s.
- **Docs.** ROUTER.md role split is `:5-17`, canonical rules `:30-40`; it is repo-owned (the
  installer note at `:80-83`). README's catalog section is `README.md:41-79`. SPECS-PRD §6.5 already
  carries a delivered catalog note (`PROJECT/2-WORKING/SPECS-PRD.md:256-264`); §10.1 defines the
  render fingerprint (`:380-382`), which designs do not compute yet.
- **Git state.** The capture was untracked, so `git mv` failed (`not under version control`) and a
  plain `mv` promoted it. `releases.db`/`releases.sql` show orchestrator-owned modifications and
  are not touched by this plan.

## Requirements and scope decisions

From the finalized plan on #20 (Phase A2) and issue #21 (What to build, Acceptance):

| Source asks | Decision here | Reason |
|---|---|---|
| `designs` table in the same module and dump, migration 2 | Kept: `tools/catalog.mjs`, `tools/catalog.sql`; no second DB file or module | One owner, one write path (plan-v2 "Deliberate change to #20's storage text") |
| Columns id, use_case, use_case_version (nullable), layout_id (null), fixture_path, data_hash, artifact_path, artifact_digest; no timestamps | Kept exactly; `layout_id` must be NULL until Phase B (checked in `validateLedger`) | Deterministic dump |
| Insert-only; `design list|show|add`, no update/delete | Kept; `BEFORE UPDATE/DELETE` abort triggers; `design update` is a usage error (exit 2) | Edits fork a new design |
| Seeds: solar-system as `solar-system@1.0.0`; RAG and cell-division NULL use case | Kept; seeded through `design add`, not hand-written rows | Proves the only write path |
| `artifact_digest` = `artifactDigests.png`; `data_hash` = sha256 of fixture bytes | Kept; planning probe shows equality for all three | Observed state table |
| `design add` appends one #21 line; refuses a second add | Kept; refusal checks both the table and the log | #21 acceptance 1 |
| `verify`: recompute digests, pinned version exists, exactly one log line per design, no orphan lines | Kept, plus canonical-line and row/line consistency checks | #21 acceptance 3 |
| ROUTER.md role-split line and canonical rule | Kept verbatim (Phase 3) | plan-v2 A2 bullet 5 |
| README note on the log; CHANGELOG entry | Kept (Phase 3) | #21 acceptance 4 |
| SPECS-PRD note "only if needed" | **Not edited in A2.** §6.6 (three-ID model) belongs to Phase B; README documents delivered behavior | Smallest surface; see PREP-NOTES decision 5 |

## Design decisions

Each decision is resolved with planning evidence; Phase 0 re-proves the four marked **(P0)** in a
`$TMPDIR` prototype and may overturn them with evidence.

**D1. Migration 2 and recipe byte stability (P0).** Keep today's `SCHEMA` text byte-for-byte as a
frozen constant `SCHEMA_V1`. Derive the current schema from it with two exact replacements and an
appended block, so no DDL is duplicated:
`SCHEMA = SCHEMA_V1.replace('; migration 1;', '; migration 2;').replace('CHECK(version = 1)', 'CHECK(version IN (1,2))') + DESIGNS_DDL`.
`DESIGNS_DDL` is three lines:

```sql
CREATE TABLE designs (id TEXT PRIMARY KEY, use_case TEXT, use_case_version TEXT, layout_id TEXT, fixture_path TEXT NOT NULL, data_hash TEXT NOT NULL, artifact_path TEXT NOT NULL, artifact_digest TEXT NOT NULL, CHECK((use_case IS NULL) = (use_case_version IS NULL))) STRICT;
CREATE TRIGGER designs_no_update BEFORE UPDATE ON designs BEGIN SELECT RAISE(ABORT,'design immutable'); END;
CREATE TRIGGER designs_no_delete BEFORE DELETE ON designs BEGIN SELECT RAISE(ABORT,'design immutable'); END;
```

`designs` is appended last to `TABLES` with `ORDER BY id`, so it is exported after
`recipe_outputs` and `preserveHistory` covers it with no new code. `validateLedger` requires the
migration rows to be exactly `[1,2]`. `loadDump` admits either the current header or the exact
`SCHEMA_V1` header; a V1 body must contain no `designs` rows, and after its rows load the loader
inserts migration row 2. The committed dump is migrated through the existing write path:
`node tools/catalog.mjs import tools/catalog.sql` (load V1 → upgrade in memory →
`preserveHistory` → atomic replace). Expected diff against the base: line 1 (`migration 2`) and
line 3 (the CHECK) change, three DDL lines and `INSERT INTO schema_migrations VALUES (2);` are
added, and **no `INSERT` line is removed or changed** (every GID retained). Planning probe confirmed
the STRICT table accepts an all-NULL pin, returns `null` to JS, and the CHECK rejects a half-null
pin (`CHECK constraint failed: (use_case IS NULL)=(use_case_version IS NULL)`).

**D2. NULL literal (P0).** `quote(null)` returns `NULL`; the tokenizer at `:81` gains a `NULL`
alternative that pushes `null`. STRICT `NOT NULL` columns on every recipe table and on the four
design path/digest columns still reject NULL at insert, so the extension only admits NULL where the
DDL allows it.

**D3. Design ID rule.** `^(\d{4}-\d{2}-\d{2})-(<slug>)$` where `<slug>` matches the existing
`slugPattern` (`tools/catalog.mjs:10`) with length 3–64, and the date is a real calendar date
(`new Date(date + 'T00:00:00Z').toISOString().slice(0,10) === date`; planning probe:
`2026-02-30` round-trips to `2026-03-02`, so it is rejected). The date is the author's design date,
not a clock read (no timestamps). Unique primary key, immutable. Design IDs start with a digit and
recipe slugs with a letter, so the two namespaces cannot collide. Seeds use the example folder
names; matching the folder is a convention, not enforced (PREP-NOTES decision 1).

**D4. Path confinement.** `fixture_path` and `artifact_path` reuse the existing relative-path rule
(lift the inline predicate at `:60` into one helper used by both recipe files and designs), must
start with `examples/`, and must end `.json` (fixture) or `.png` (artifact). Bytes are read only
through `fileBytes` (`:109-114`), so absolute paths, `..`, backslashes, symlinks escaping the root
and non-regular files are refused. Files are expected to be committed; `verify` in C3 runs on the
committed tree and fails if they are not.

**D5. Log line schema and canonical serialization (P0).** File `tools/design-log.jsonl` relative to
the catalog root (no flag; C4 uses its own temp root). One line per design: `JSON.stringify` of an
object built with keys in exactly this order, no whitespace, UTF-8, terminated by `\n`:

`id`, `use_case`, `use_case_version`, `canvas` (`{"width":W,"height":H}` from the fixture's positive
integer `width`/`height`, else `null`), `layout` (`null` until Phase B), `columns`, `rows`, `boxes`,
`span_histogram` (all `null` until Phase B derives them from the layout string), `workaround_boxes`
(non-negative integer from `--workarounds`, else `null`), `friction` (required, single line, 1–200
chars), `needed_row_span`, `non_grid_family`, `needed_span_over_9`, `layout_forced` (booleans,
true only when named in `--flags`), `no_recipe` (derived: `use_case === null`, never declared).

A line is canonical when `JSON.stringify(JSON.parse(line)) === line` and its key list equals the
list above. No personal data, credentials or paths are logged.

**D6. CLI.** `node tools/catalog.mjs design list [--json]`, `design show <id> [--json]`,
`design add <id> --fixture <path> --artifact <path> --friction <text> [--use-case <slug>@<semver>] [--flags a,b] [--workarounds N]`.
`--flags` takes a comma list from `needed_row_span,non_grid_family,needed_span_over_9,layout_forced`.
`design` with a missing or unknown subverb (including `update`/`delete`) exits 2. Value flags reuse
the single-line check at `:195`. Exit 0 ok, 1 validation/drift, 2 usage, as today.

**D7. Write order (P0).** Inside the existing lock and transaction: refuse if the ID exists in the
table or in the log (`design already recorded`, exit 1, dump and log bytes unchanged); validate the
pin against `recipes ⋈ recipe_versions`; hash both files; insert; `validateLedger`; export; replace
the dump atomically; then append the one log line with `fs.appendFile(..., {flag:'a'})`. If the
append fails after the dump was replaced, `verify` reports the design as having no log line
(exit 1) and the operator restores the dump from git. No automatic repair.

**D8. Verify extension and receipt isolation.** Structural rules go in `validateLedger` (so a
malformed row fails every verb, as recipe rows do today): ID rule, path rule, digest pattern,
`layout_id IS NULL`, pinned `(slug, version)` exists. File and log rules go in `verify`: recompute
`data_hash` and `artifact_digest`; read the log (absent file = empty); every line canonical, IDs
unique, every design has exactly one line, no line without a design, and each line's
`use_case`/`use_case_version`/`no_recipe` agree with the row. Design errors use the design ID or
`design-log` as `field`, **never `dump` or a recipe slug or path**, so `tools/render.mjs:361`
cannot attribute them to a recipe. `render.mjs` is not edited. C1 (`:43`) is the standing red
control: its temp root has no `examples/`, so seeded designs report missing files there, and the
nutrition receipt stays `verified: true` only if those errors are isolated.

## Smallest affected surface

Edited: `tools/catalog.mjs` (migration 2, NULL literal, `design` verbs, verify extension; estimate
+60 to +80 lines), `tools/catalog.sql` (generated by the CLI only), `tools/spike/test/canaries.test.mjs`
(C4 only: two literal updates plus at most 15 added lines), `ROUTER.md` (two lines), `README.md`
(one short subsection), `CHANGELOG.md` (one entry), this plan (Phase 0 findings only).
New: `tools/design-log.jsonl` (generated by `design add` only).
Not edited: `tools/render.mjs`, `tools/request.mjs`, recipe modules, `examples/**`, goldens under
`tools/spike/output/`, `package.json`, `pnpm-lock.yaml`, `test-budget.json`,
`PROJECT/2-WORKING/SPECS-PRD.md`, `releases.db`, `releases.sql`.

## Non-goals

- Phase B: grid parser and canonical form, geometry function, `layouts`/`use_case_layouts`,
  filling `layout_id`, deriving `columns`/`rows`/`boxes`/`span_histogram`, responsive stacking,
  SPECS-PRD §6.6.
- `designs.sql`/`designs.db`, a second module, git hooks, tamper-proofing or signatures.
- `design update`/`delete`, params or theme copied into the DB, `created_at`, §10.1 fingerprints,
  remote `tenant_id`, HTTP/MCP design endpoints.
- Promoting RAG or cell-division to recipes, editing any example file, re-rendering any artifact.
- New dependency, test file, `test()` block, CI workflow or budget change.

## Dependencies

- PR #18 and PR #22 are merged on origin/main (`a055741`); this branch is cut from it. No open PR
  touches the write-set (`gh pr list --state open` returned none on 2026-10-10).
- Node 22 with unflagged `node:sqlite` (verified v22.22.3; same assumption as GH-10).
- The orchestrator repoints the GH-20 ledger row to this path before firing.
- Phase B depends on A2 merging; it is not planned here.

## Risks and rollback

| Risk | Read | Mitigation / rollback |
|---|---|---|
| Migration rewrites recipe rows or regenerates GIDs | Easy | Migrate via `import` (preserves GIDs); P1-A2 asserts no removed `INSERT` line in the dump diff; revert the commit |
| NULL literal admits NULL where recipes require a value | Easy | STRICT `NOT NULL` DDL plus `validateLedger`; P0 probe and P1-A3 red control |
| Design errors flip recipe render receipts to `verified:false` | Easy | Field naming rule (D8); C1 `:43` fails if violated |
| Dump replaced but log append fails (two files, not one transaction) | Easy | `verify` reports the gap; restore from git; documented in README |
| Hand-forged row, file and log line that agree | Costly (undetectable by design) | Accepted per plan-v2 "Enforcement, stated honestly"; ROUTER rule; revisit if a bypass is seen |
| Design ID format referenced outside the repo, then changed | Costly | Operator approves the rule and three seed IDs before merge (PREP-NOTES decision 1) |
| C4 growth pushes the suite past 60 s | Easy | ≤15 added lines, about 7 extra CLI spawns (~1 s); P1 records the `test-budget: PASS` time |
| Free-text `friction` leaks personal data in a public repo | Easy | Reviewer reads the three seed lines in P2; ≤200 chars; no paths |
| `node:sqlite` API change (existing) | Easy | Unchanged from GH-10; single owner module |

Rollback: revert the phase commit; everything is text. Halt on the first failed phase; never force.

## Test scope

No new test file, `test()` block, CI workflow or dependency; `test-budget.json` stays 1/4/60/0
(`git diff --exit-code <base> -- test-budget.json`). Named failure modes and where they go:

- **Seeded designs drift from their files or log** (no existing canary reads designs): C3 already runs
  `catalog verify` on the committed tree (`:369-370`); it gains coverage automatically once designs
  are seeded. No C3 edit.
- **Design write path or verify stops catching forged rows, missing/orphan log lines, duplicate adds
  or update/delete** (catalog transactions are exercised only by C4): extend C4's catalog section in
  its existing temp root. C4 is already the largest canary, so the extension is capped at 15 added
  lines plus the two migration literals (`:421`, `:460`): one NULL-use-case `design add` of the
  already-copied solar example, a refused second add with unchanged dump and log bytes, a refused
  unknown pin, a forged `artifact_digest` and a removed log line each failing `verify`, an orphan log
  line failing `verify`, `UPDATE`/`DELETE designs` aborting in-process, and `design update` exiting 2.
- **Design errors leak into recipe receipts:** C1 `:43` as is (no edit).
- C2 must keep printing `C2 digests: N artifacts byte-identical`.

## Phase 0 — Spike: migration, NULL literal, ID, log and path decisions

**Goal:** re-prove D1, D2, D5 and D7 in a `$TMPDIR` prototype against a copy of the current module and
dump, then record a `### Phase 0 findings` subsection here with `Decision:` lines (BECAUSE/UNLESS).
Doc-only; no feature code in the repo.

- [ ] Copy `tools/catalog.mjs`, `tools/request.mjs`, `tools/catalog.sql` and the three example
      folders' `fixture.json`/primary PNG into `$TMPDIR`; apply D1/D2 there; run
      `import tools/catalog.sql`; record `diff` of old vs new dump and the `^-INSERT` count.
- [ ] `export --check` and two load/export cycles on the migrated prototype dump are byte-identical.
- [ ] Insert a NULL-pin design row and a pinned one; export/load round trip; half-null pin rejected;
      NULL into `recipes.title` rejected.
- [ ] Serialize one log line per D5; show `JSON.stringify(JSON.parse(line)) === line` and that a
      reordered-key line fails it.
- [ ] Confirm D3 date rule on `2026-02-30` (reject) and the three seed IDs (accept); confirm D4 refuses
      `/abs.png`, `examples/../x.png`, a symlink escaping the root, and a non-`examples/` path.
- [ ] Record the C4 budget estimate (spawn count, timing of one `node tools/catalog.mjs verify` on
      the prototype with three designs).

**Write set:** `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md` (new `### Phase 0 findings` subsection only).

**Acceptance (each can fail; red control in brackets):**
- [ ] P0-A1 Findings subsection exists with at least four lines starting `Decision:`.
      [Red: `rg -c '^Decision:' PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md` returns fewer than 4.]
- [ ] P0-A2 Prototype migration diff removes zero `INSERT` lines and retains every GID.
      [Red: re-seeding the prototype with fresh `add`/`publish` instead of `import` shows `-INSERT` lines.]
- [ ] P0-A3 Prototype dump round trip with a NULL pin is byte-identical.
      [Red: the unpatched `quote` throws `TypeError` on the same row.]
- [ ] P0-A4 `git status --porcelain` lists only this plan as changed by the phase.
      [Red: any scratch file in the repo shows up.]

### Phase 0 findings

Observed 2026-10-10 on Node v22.22.3, darwin-arm64. The focused prototype and all its
outputs were confined to `.relay-scratch/p0/` under this temporary checkout, per the relay's
containment override. No production module, dump, example, test or budget was edited.
`python3 -B .relay-scratch/p0/setup.py` followed by `node .relay-scratch/p0/probe.mjs`
exited 0 on the final clean run. The setup copies D1/D2 into the module; the probe copies
all declared recipe files as well as the three fixtures/primary PNGs so recipe verification
succeeds rather than timing missing-file errors. Prototype helpers and a minimal design-hash /
one-line-presence verify extension are temporary evidence, not the Phase 1 implementation.

Decision: Keep D1's frozen V1 header, derived V2 schema and migration via `import` BECAUSE the copied CLI's `import tools/catalog.sql` exited 0, retained all 40 original INSERT lines and all four distinct recipe/version GIDs, and added only migration row 2; the unified diff changes the migration header/CHECK and adds the three designs DDL lines plus that row, with zero `-INSERT` lines. Two load/export cycles and two idempotent CLI import cycles were byte-identical; `export --check` exited 0. Fresh `add`/`publish` reseeding removed 39 old recipe INSERT lines (red control). UNLESS the frozen header or table ordering changes, retain this upgrade route instead of reseeding. Source: `tools/catalog.mjs:16`, `tools/catalog.mjs:32`, `tools/catalog.mjs:70`, `tools/catalog.mjs:159`, `tools/catalog.mjs:216`; original rows: `tools/catalog.sql:16`. Probe: `.relay-scratch/p0/probe.mjs:21`.

Decision: Keep D2's exact uppercase `NULL` literal and JS `null` encoding BECAUSE a solar-system@1.0.0 row and two all-NULL-pin rows exported/loaded byte-identically, with nullable fields returned as JS null; a half-null pin failed the CHECK through both a prepared insert and literal-dump admission, and `NULL` in `recipes.title` failed `NOT NULL constraint failed: recipes.title` through both paths. The unpatched quote expression threw TypeError for null; a designs row under the V1 header was refused as `unsupported row`. UNLESS a later schema intentionally makes another column nullable, SQL constraints remain the boundary rather than weakening recipe validation. Source: `tools/catalog.mjs:19`, `tools/catalog.mjs:39`, `tools/catalog.mjs:81`; probe: `.relay-scratch/p0/probe.mjs:52`.

Decision: Keep D3's date-plus-slug rule BECAUSE `2026-02-30-x-y-z` was rejected by UTC date round-trip equality and all three seed IDs (`2026-10-08-solar-system`, `2026-10-09-rag-system`, `2026-10-09-cell-division`) were accepted with the existing slug pattern and 3–64-character slug limit. UNLESS externally referenced IDs require a different convention, preserve these IDs; invalid Date values must be refused before calling `toISOString`, which can throw. Reversibility: Costly once shared externally. Source: `tools/catalog.mjs:10`, `tools/catalog.mjs:51`; probe: `.relay-scratch/p0/probe.mjs:70`.

Decision: Keep D4's shared relative-path predicate plus `examples/` and extension checks, then `fileBytes` BECAUSE `/abs.png`, `examples/../x.png` and `tools/elsewhere.png` were rejected before reading; an `examples/escape.png` symlink to a file outside the prototype root failed `file escapes root`. UNLESS the admitted example location changes, reuse the existing root-confinement and regular-file checks instead of a second reader. Source: `tools/catalog.mjs:60`, `tools/catalog.mjs:109`, `tools/request.mjs:8`; probe: `.relay-scratch/p0/probe.mjs:73`.

Decision: Keep both D5 canonical-line predicates, and correct the spike's reordered-key expectation BECAUSE an ordered seed line passes `JSON.stringify(JSON.parse(line)) === line`, but a reversed-key line ALSO passes that equality: JSON parsing/stringifying preserves its property order. The reversed line fails the separate exact `Object.keys` order comparison required by D5. Thus the combined check rejects it; stringify equality alone cannot. UNLESS the schema deliberately changes its ordered key list, Phase 1 must retain both checks and build canvas keys as width then height. Concrete reduced counterexample: `JSON.stringify(JSON.parse('{"use_case":null,"id":"2026-10-09-rag-system"}'))` returns the same reordered string. Source: D5 above; construction uses fixture dimensions at `examples/2026-10-09-rag-system/fixture.json:5`; probe: `.relay-scratch/p0/probe.mjs:42`, `.relay-scratch/p0/probe.mjs:67`.

Decision: Keep D7's dump-then-log order with explicit operator rollback BECAUSE the locked transaction / atomicDump prototype appended one row and one line on success; table duplicates, log-only duplicates and an unknown pin were refused with dump/log bytes unchanged. After replacing the dump, injecting a directory at the actual log path made append fail EISDIR: rolling back the in-memory transaction did not undo the persisted dump row. After restoring the readable old log, prototype CLI verify exited 1 with `design must have one log line` under that design ID, and the lock was removed. UNLESS cross-file atomic recovery becomes a requirement, retain the documented manual restore; do not claim the SQL transaction covers either filesystem write. Reversibility: Easy, but restoration is required on this observed partial-write path. Source: `tools/catalog.mjs:174`, `tools/catalog.mjs:205`, `tools/catalog.mjs:239`, `tools/catalog.mjs:244`, `tools/catalog.mjs:248`; probe: `.relay-scratch/p0/probe.mjs:101`, `.relay-scratch/p0/probe.mjs:128`.

Decision: Budget eight added C4 CLI spawns BECAUSE the scoped checks need one successful add, duplicate refusal, unknown-pin refusal, wrong-digest verify, missing-line verify, orphan-line verify, usage refusal, and a final successful verify. UPDATE/DELETE controls reuse the in-process DB. One successful prototype `node tools/catalog.mjs verify --json` with two recipes, three designs and all declared files took 51.446 ms including process startup; eight such durations give approximately 0.412 s as a rough estimate, not a measured full-suite increment or budget pass. UNLESS Phase 1's actual complete D8 checks or write costs materially exceed this estimate, retain the existing C4 and measure the driver-run 4/4 suite against 60 s. Source: `tools/catalog.mjs:140`, `tools/spike/test/canaries.test.mjs:422`, `tools/spike/test/canaries.test.mjs:435`; probe: `.relay-scratch/p0/probe.mjs:94`.

Verification limits: no graph project was registered for this checkout in `list_projects`
(82 projects, complete pagination); exact source was read directly without creating an index.
The ROUTER roadmap CLI is absent at both named relative paths in this harness checkout.
No git command or full gate was run. A focused before/after file-content manifest checks the
allowed write set in place of the forbidden P0-A4 git-status command; the harness owns git
containment and the final gate. Scratch evidence is disposable and is not copied back; the
observed outcomes and counterexample above are the durable record. Independent review remains
required; all existing checkboxes and plan text outside this subsection are unchanged.

### Phase 0 — QA checklist

- [ ] Findings written back with file:line pointers; each decision has BECAUSE/UNLESS.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0 (4/4, budget unchanged).

## Phase 1 — Designs table, CLI verbs, verify and C4

**Goal:** implement D1–D8 in `tools/catalog.mjs`, migrate the committed dump through the CLI, and
extend C4. Depends on Phase 0 (go).

- [ ] Migration 2 per D1 (frozen `SCHEMA_V1`, derived `SCHEMA`, V1 admission in `loadDump`,
      migrations `[1,2]`), NULL literal per D2, `designs` appended to `TABLES`.
- [ ] `design list|show|add` per D3–D7; `design add` uses the existing lock, transaction and
      `atomicDump`; read subverbs never touch the dump, log or lock.
- [ ] `verify` and `validateLedger` per D8.
- [ ] Run `node tools/catalog.mjs import tools/catalog.sql` once to migrate the committed dump.
- [ ] C4: update `:421`/`:460` to the migration-2 empty dump and add the guards in Test scope.

**Write set:** `tools/catalog.mjs`, `tools/catalog.sql`, `tools/spike/test/canaries.test.mjs`.

**Acceptance (each can fail; red control in brackets):**
- [ ] P1-A1 `node tools/catalog.mjs verify` and `export --check` exit 0 on the migrated dump.
      [Red: a `$TMPDIR` copy with the `designs` DDL line deleted exits 1 `migration … schema/header required`.]
- [ ] P1-A2 `git diff -U0 <base> -- tools/catalog.sql | rg -c '^-INSERT'` finds 0 lines, and
      `rg -c '^INSERT INTO schema_migrations' tools/catalog.sql` is 2.
      [Red: in a `$TMPDIR` copy, `add`+`publish` into an empty dump instead of `import` yields new GIDs, so the same diff shows `-INSERT` lines.]
- [ ] P1-A3 In a `$TMPDIR` copy, `design add` with no `--use-case` succeeds and `export --check`
      exits 0; a dump row `INSERT INTO recipes VALUES (NULL,…)` fails to load.
      [Red: the same NULL row with the D2 change reverted fails `invalid SQL literal`.]
- [ ] P1-A4 A second `design add` of the same ID exits 1 `design already recorded`; dump and log
      sha256 unchanged. [Red: a different ID with the same files exits 0.]
- [ ] P1-A5 `node tools/catalog.mjs design update x` exits 2. [Red: `design list` exits 0.]
- [ ] P1-A6 `rg -n 'prepare\(\s*`[^`]*\$\{' tools/catalog.mjs` finds nothing.
      [Red: the pattern matches a scratch line with template-literal SQL.]
- [ ] P1-A7 `git diff --exit-code <base> -- package.json pnpm-lock.yaml test-budget.json tools/render.mjs tools/request.mjs tools/recipes examples tools/spike/output`
      exits 0. [Red: any edit there exits 1.]
- [ ] P1-A8 `pnpm test` exits 0, 4/4, `test-budget: PASS` under 60 s (record the seconds).
      [Red: in a `$TMPDIR` copy, dropping the `designs_no_update` trigger makes the C4 UPDATE assertion fail; using `field:'dump'` for a design error makes C1 `:43` fail once designs exist.]

### Phase 1 — QA checklist

- [ ] Every todo has a recorded command/result in the relay receipt.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0, keeping 1 file/4 tests/60 s/0 workflows.

## Phase 2 — Seed three designs and the design log

**Goal:** record the three existing examples through `design add` only; the dump rows and the first
three log lines are CLI output. Depends on Phase 1.

- [ ] Run, in this order, from the repo root:
      - `node tools/catalog.mjs design add 2026-10-08-solar-system --fixture examples/2026-10-08-solar-system/fixture.json --artifact examples/2026-10-08-solar-system/solar-system.png --use-case solar-system@1.0.0 --flags non_grid_family --friction "<orbital placement, not a grid of boxes>"`
      - `node tools/catalog.mjs design add 2026-10-09-rag-system --fixture examples/2026-10-09-rag-system/fixture.json --artifact examples/2026-10-09-rag-system/rag-system.png --friction "<no recipe; lanes, empty cells and connectors>"`
      - `node tools/catalog.mjs design add 2026-10-09-cell-division --fixture examples/2026-10-09-cell-division/fixture.json --artifact examples/2026-10-09-cell-division/cell-division.png --friction "<no recipe; one row of six, group bands span columns>"`
- [ ] Friction text: the builder reads each example's `render-diagram.mjs`/`fixture.json` and writes
      one honest sentence (the angle-bracket text above is the intent, not the wording). Set
      `layout_forced` only with evidence. No personal data.

**Write set:** `tools/catalog.sql`, `tools/design-log.jsonl` (both CLI-generated).

**Acceptance (each can fail; red control in brackets):**
- [ ] P2-A1 `node tools/catalog.mjs design list --json` returns exactly the three IDs with
      `data_hash`/`artifact_digest` equal to the Observed-state table, solar pinned
      `solar-system@1.0.0`, RAG and cell-division `use_case: null`.
      [Red: flipping one byte of `rag-system.png` in a `$TMPDIR` copy makes `verify` exit 1 naming `2026-10-09-rag-system`.]
- [ ] P2-A2 `wc -l < tools/design-log.jsonl` is 3; lines 2 and 3 have `"no_recipe":true`, line 1
      `"no_recipe":false` and `"non_grid_family":true`.
      [Red: deleting line 2 in a `$TMPDIR` copy makes `verify` exit 1 for the RAG design; appending a duplicate of line 3 exits 1.]
- [ ] P2-A3 `node tools/catalog.mjs verify` and `export --check` exit 0.
      [Red: hand-editing one recipe `content_sha256` in a `$TMPDIR` copy of the dump exits 1 `inconsistent published digest`.]
- [ ] P2-A4 `git diff --exit-code <P1 head> -- tools/catalog.mjs tools/spike/test/canaries.test.mjs examples`
      exits 0 (seeding changed only generated files). [Red: any code edit exits 1.]
- [ ] P2-A5 `pnpm test` exits 0, 4/4, C2 `byte-identical`, C1 nutrition `catalog.verified` true.
      [Red: as P1-A8.]

### Phase 2 — QA checklist

- [ ] Reviewer reads the three log lines for honesty and absence of personal data.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0.
- [ ] Operator approves the design ID rule and the three seed IDs before merge (Costly once shared).

## Phase 3 — ROUTER pointer, README and CHANGELOG

**Goal:** document the delivered design catalog and make the CLI the stated only write path.
Depends on Phase 2.

- [ ] `ROUTER.md` role split (`:5-17`): one line
      ``- `tools/catalog.mjs` + `tools/catalog.sql` = the recipe and design catalog (CLI and its canonical dump)``.
- [ ] `ROUTER.md` canonical rules (`:30-40`): the exact line
      `- Change the catalog only through `node tools/catalog.mjs`; `tools/catalog.sql` is generated output, never hand-edited.`
- [ ] `README.md` catalog section: a short "Designs" subsection with the three `design` commands and
      exit codes, the insert-only rule, the null-use-case seeds, and a two-sentence note on
      `tools/design-log.jsonl` (what it is for; review after every 10 designs or the first
      `needed_row_span`/`non_grid_family`/`needed_span_over_9`, per #21).
- [ ] `CHANGELOG.md`: one entry, `Refs #20`, `Refs #21`, no closing keyword.

**Write set:** `ROUTER.md`, `README.md`, `CHANGELOG.md`.

**Acceptance (each can fail; red control in brackets):**
- [ ] P3-A1 `rg -n -F 'node tools/catalog.mjs' ROUTER.md` matches the canonical rule line and
      `rg -n 'tools/catalog.sql' ROUTER.md` matches the role-split line.
      [Red: the same commands on the base ROUTER.md match nothing.]
- [ ] P3-A2 Every README design command runs with its documented exit code (read verbs on the
      committed tree; `design add` only in a `$TMPDIR` copy). [Red: `design lsit` exits 2.]
- [ ] P3-A3 `utils/pdda/pdda.sh run` reports no new errors versus the pre-phase run.
      [Red: an absolute home path in a touched doc raises a hardcoded-paths finding.]
- [ ] P3-A4 `pnpm test` exits 0. [Red: as P1-A8.]

### Phase 3 — QA checklist

- [ ] Docs describe only delivered behavior; Phase B items named as deferred.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0.

## Acceptance

From plan-v2 A2 and #21 (each can fail):

- [ ] The three seeded designs read back with matching digests (P2-A1).
- [ ] A second `design add` for the same ID is refused (P1-A4).
- [ ] A `designs` row with a wrong digest fails `verify` (C4 extension; P2-A1 red).
- [ ] A `designs` row with no log line, or a log line with no design, fails `verify` (C4; P2-A2 red).
- [ ] Recording a design appends exactly one canonical JSON line; the three examples are the first
      three lines with honest `friction` notes (P2-A2).
- [ ] ROUTER.md names the CLI as the only catalog write path (P3-A1).
- [ ] A hand edit to a recipe version row fails `verify` (P2-A3 red).
- [ ] Recipe `INSERT` rows are unchanged by the migration (P1-A2).
- [ ] A short README note says what the log is for and when to review it (P3-A2).
- [ ] No new test file, workflow or dependency; `pnpm test` 4/4 within 60 s (P1-A7, P1-A8).

## Acceptance — deviations from the issue

The issue #20 body (appendix) predates the finalized plan comment, which narrows this marathon to
Phase A2. Its four criteria are reconciled below; the A2 criteria above come from plan-v2 A2 and #21.

- [dropped] Map all three existing examples (solar system, cell division, RAG) to layout / use case / design IDs. Record any split that feels forced. — reason: A2 maps the use case and design IDs and records forced splits as #21 friction lines and `no_recipe`; layout IDs need the grid parser, which is Phase B.
- [dropped] Add the three-ID model and grammar to `SPECS-PRD.md` §6 (e.g. §6.6), reusing the existing recipe ID and fingerprint definitions rather than restating them. — reason: the finalized plan assigns §6.6 to Phase B, together with the grammar it documents.
- [dropped] Add `designs.sql` (schema + three seed designs), one build step that creates `designs.db` from it, a `.gitignore` entry for the binary, and one engine module that owns reads and writes via `node:sqlite`. — reason: superseded by the finalized plan's deliberate storage change: one dump `tools/catalog.sql` and one module `tools/catalog.mjs`, built in memory, no `designs.db`.
- [dropped] Add one grid-string parser/validator (spans, equal row sums, GCD canonical form, `0` cells) and pixel-geometry function in the engine core, exercised by an existing render path. Do this only when GH-5 P0 extracts the shared render operation. — reason: Phase B (next marathon), planned after A2 merges.
- [added] The three seeded designs read back with matching digests (P2-A1). — reason: plan-v2 A2 acceptance.
- [added] A second `design add` for the same ID is refused (P1-A4). — reason: plan-v2 A2 and #21 acceptance.
- [added] A `designs` row with a wrong digest fails `verify` (C4 extension; P2-A1 red). — reason: plan-v2 A2 acceptance.
- [added] A `designs` row with no log line, or a log line with no design, fails `verify` (C4; P2-A2 red). — reason: plan-v2 A2 and #21 acceptance.
- [added] Recording a design appends exactly one canonical JSON line; the three examples are the first three lines with honest `friction` notes (P2-A2). — reason: #21 acceptance.
- [added] ROUTER.md names the CLI as the only catalog write path (P3-A1). — reason: plan-v2 A2 acceptance.
- [added] A hand edit to a recipe version row fails `verify` (P2-A3 red). — reason: plan-v2 A2 acceptance.
- [added] Recipe `INSERT` rows are unchanged by the migration (P1-A2). — reason: migration 2 must keep GH-10 rows byte-stable (this plan, D1).
- [added] A short README note says what the log is for and when to review it (P3-A2). — reason: #21 acceptance.
- [added] No new test file, workflow or dependency; `pnpm test` 4/4 within 60 s (P1-A7, P1-A8). — reason: plan-v2 A2 acceptance and `test-budget.json`.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm test` exit 0 after all four phases, plus `node tools/catalog.mjs verify`, `export --check` and `design list --json`).
- [ ] Wave 1 Post-Build Codex QA Relay executed (receipt to be recorded under `relay-system/<YYYY-MM-DD>/gh20-a2-wave1-postbuild.codex.md`).
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated.

Execution: one serial lane gh20-a2-p0 -> gh20-a2-p1 -> gh20-a2-p2 -> gh20-a2-p3 from
`PROJECT/2-WORKING/catalog-designs/MARATHON.yaml`; Codex builder (driver default), independent Agy
reviewer, gate `pnpm test`, 1500 s turns, two review rounds. No push, no PR, no merge from builder
turns; the ready PR lists `Refs #20` and `Refs #21` only.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/main"
  },
  "gate": "pnpm test",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/design-log.jsonl"
    },
    {
      "type": "path_absent",
      "path": "PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md"
    }
  ],
  "artifacts": [
    "PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md",
    "tools/catalog.mjs",
    "tools/catalog.sql",
    "tools/design-log.jsonl",
    "tools/spike/test/canaries.test.mjs",
    "ROUTER.md",
    "README.md",
    "CHANGELOG.md"
  ],
  "artifacts_new": [
    "PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md",
    "tools/design-log.jsonl"
  ],
  "remediation": {
    "source": "issue#20",
    "criteria": "Phase A2 of the finalized #20 plan: insert-only designs table (migration 2) in tools/catalog.mjs and the single dump tools/catalog.sql; design list/show/add; three example seeds via the CLI (solar-system@1.0.0, RAG and cell-division with null use case); design add appends one canonical #21 line to tools/design-log.jsonl and refuses duplicates; catalog verify recomputes design digests, checks pins and one log line per design; ROUTER.md names the CLI as the only write path; recipe rows byte-identical; C4 extended, no new dependency/test/workflow."
  },
  "acceptance": [
    "pnpm test",
    "node tools/catalog.mjs export --check",
    "node tools/catalog.mjs verify",
    "node tools/catalog.mjs design list --json"
  ],
  "lanes": {
    "agy_safe": [],
    "orchestrator_only": [
      "releases.db",
      "releases.sql"
    ],
    "index_only": []
  }
}
```

# Appendix — issue #20 body (captured verbatim)

The text below is the original #20 issue body as captured on 2026-10-10. It is superseded in part
by the finalized plan comment on #20 (no `designs.sql`/`designs.db`; one dump; serials dropped).
It is kept unedited as the source record.


## Call

Identify every artifact by three IDs instead of sequentially numbered layouts:

| ID | Is | Format | Example | Owner | Mutable? |
|---|---|---|---|---|---|
| **Layout** | Box geometry only | Canonical grid string (grammar below) | `1113-213-111111` | Engine core (domain-neutral) | Never — the string *is* the shape |
| **Use case** | A kind of infographic: input schema, slot mapping, connectors, constraints | Kebab-case + semver (the PRD's existing recipe ID, §6.2) | `process-pipeline@1.2.0` | Recipe pack | New version per change |
| **Design** | One real artifact: pinned use case version + layout + params/theme + data | Date-slug + render fingerprint (§10.1) | `2026-10-09-rag-system` | `designs.db` | Insert-only; edits fork a new design |

Goal: avoid thousands of near-identical, sequentially numbered layouts. The layout ID is computed rather than allocated, so it needs no registry, and each shape has exactly one string.

**Bet:** most target infographics are rows of boxes with column spans. If upcoming examples need boxes that span rows, this grammar is the wrong base and nesting should be designed first.

## Current capability (as of `447f7aa`)

- **No engine or recipe layer yet.** Main holds the GH-1 renderer spike (`tools/spike/render.mjs`, `scene.mjs`) and three one-off examples. GH-5 P0 already tracks extracting a reusable render operation and promoting examples to versioned recipes; this issue supplies the ID model for that work.
- **No grid primitive.** Scenes hand-code absolute pixel positions. For example, `examples/2026-10-09-rag-system/render-diagram.mjs` uses `COLX=c=>100+c*380`, `CARD_W=300`, and per-lane `BAND_Y`, with stages placed by `{lane, col}` in `fixture.json`.
- **Designs live as files, not in a DB.** Each `examples/<date>-<slug>/` folder holds `fixture.json`, `verification.json` (with `artifactDigests`) and, for the solar system, `provenance.json`. That is already the design-ID convention proposed here. The only SQLite file is `releases.db`, the PDDA planning ledger; it has no layout, use case or design tables.

## Satori and the vendored runtime

- **The vendored copy is the spike runtime, not Satori source.** `examples/2026-10-08-solar-system/runtime/` copies the GH-1 spike at `591971d` (`SOURCE.json`: `render.mjs`, `scene.mjs`, `assets.mjs`, fonts, `package.json`, lockfile). Its only adaptation is a `SPIKE_LIBRARY_ONLY` guard plus exported render functions. `node_modules/` is gitignored.
- **All three examples import from that one copy.** Cell-division and RAG reach into `../2026-10-08-solar-system/runtime/` for `loadSatori` / `renderSatori` / `renderPlaywright`. GH-5 already flags this copied runtime as debt.
- **Pinned dependencies:** `satori ^0.36.0`, `@resvg/resvg-js ^2.6.2`, `playwright ^1.64.0`. Per the GH-1 report, the transitive layout engine is `yoga-layout 3.2.1`.
- **Satori 0.36.0 has no CSS grid.** Its README lists `display` as `flex | block | contents | none | -webkit-box`, so `grid-template-*` and `grid-column: span` are unavailable. It does support `flexGrow`, `flexBasis` (except `auto`), `flexWrap` and `gap`. This was read from the published 0.36.0 README, not tested against an installed copy.
- **Chromium supports grid, but don't depend on it.** Basing the grammar on Chromium grid would make geometry differ between backends. The engine should compute pixel geometry itself and hand both backends fixed boxes, in line with "one owner for final geometry".

## Layout grammar

```text
1113-213-111111
digit 1–9 = box span · 0 = empty cell · "-" = next row
all rows sum equal (= column count) · spans share no common factor (GCD = 1)
```

1. **No `g{N}:` prefix.** The column count is the row sum; equal row sums are the validation check.
2. **Canonical form = reduced by GCD.** `22`, `33` and `11` are the same picture, so only `11` is valid. This is what prevents near-duplicates.
3. **`-` separates rows**, not `/`. It's safe in URLs (`GET /v1/recipes/:id`), snapshot filenames and CSS classes.
4. **Keep `0`.** The RAG store lane needs empty cells: the actual RAG fixture is `111000-001000-111111`.
5. **No bracketed spans (`[12]`) yet.** GCD reduction covers most wide grids; add brackets when a single box needs 10+ columns.
6. **Geometry is computed, not `flexGrow`.** With `gap`, `flexGrow: span` misaligns columns across rows, because different rows have different gap counts. Use:
   ```text
   colW = (W - (N-1)·gap) / N
   boxW = span·colW + (span-1)·gap
   ```
7. **Keep visual choices out of the ID.** Content, theme, gaps/padding, row heights, connectors and decoration live in use case params.

## Relationships

```text
layout  ←  use case  ←  design
(shape)    (meaning)    (instance)
```

- **One-way dependencies.** A use case declares the layouts it supports, either an `allow: [...]` list (same pattern as `params.theme.allow`) or a rule such as "one row, 4–8 boxes". A design pins one use case version and one layout. Layouts know nothing about use cases.
- **"Layout has many use cases" is a query.** Store the relation on the use case side only, so the same fact never lives in two places.
- **Use case names a kind, design names an instance.** `process-pipeline` is a use case; `rag-system` is a design made with it.
- **Designs can be promoted.** A good design becomes a use case's default `fixtures/` + `snapshots/` entry, the path PRD Phase 2 already describes.

## Storage — new `designs.db` (decided 2026-10-10)

The project is early, so create a dedicated DB now rather than deferring.

- **Separate from `releases.db`.** The planning ledger and product data have different owners and lifecycles.
- **Text source of truth.** Commit `designs.sql` (schema + seed rows) so changes are reviewable as diffs. Build `designs.db` from it and gitignore the binary, which avoids binary merge conflicts. This is a deliberate departure from `releases.db`, which commits both.
- **No new dependency.** Use built-in `node:sqlite` (`DatabaseSync`). Verified working on Node v22.22.0 with no flag; it prints an `ExperimentalWarning`, so its API can change across Node releases. Revisit if Node changes the API, or if concurrent remote writes are needed.
- **One owner for reads and writes.** A single module in the engine; entry points (CLI, HTTP, MCP) call it rather than querying SQL directly.
- **Minimal schema:**
  ```sql
  use_cases        (id TEXT, version TEXT, PRIMARY KEY (id, version))
  use_case_layouts (use_case_id TEXT, version TEXT, layout_id TEXT,
                    PRIMARY KEY (use_case_id, version, layout_id),
                    FOREIGN KEY (use_case_id, version) REFERENCES use_cases)
  designs          (id TEXT PRIMARY KEY,           -- '2026-10-09-rag-system'
                    fingerprint TEXT UNIQUE,       -- NULL until §10.1 fingerprinting exists
                    use_case_id TEXT, use_case_version TEXT, layout_id TEXT,
                    params JSON, data_hash TEXT, artifact_digest TEXT, created_at TEXT,
                    FOREIGN KEY (use_case_id, use_case_version) REFERENCES use_cases)
  ```
  A `layouts` table is optional (allowlist or usage stats only), because the ID is computed.
- **The DB indexes use cases; it doesn't store their code.** Recipes stay trusted TSX installed by an operator (§6.5).
- **Image bytes stay on disk or a CDN**, keyed by digest.
- **Validate the grammar in engine code** (one parser), not in SQL `CHECK`s.
- **Designs are insert-only.** An edit inserts a new row, so old designs stay reproducible.
- **Seed with the three existing examples.** Take `artifact_digest` from each `verification.json`. `fingerprint` stays NULL until the engine computes §10.1 fingerprints; this is a known gap, not an identity.
- **Remote mode (later)** adds `tenant_id` with `UNIQUE (tenant_id, id)`, exposed through opaque IDs, so slugs can't collide or leak across tenants.

## Open questions

- [ ] **Non-grid families.** The solar system (orbital placement) doesn't fit the grammar. Proposal: add a family prefix (e.g. `orbit:8`) when the second family exists, with a bare string meaning `grid`.
- [ ] **Connectors.** RAG arrows attach to box positions. They belong to the use case, referenced by box index, and the use case must check they still make sense for the chosen layout.
- [ ] **Slot binding.** Boxes are filled in reading order, which is fragile when a layout changes. Fine for a generic `grid` use case; domain use cases keep named slots.
- [ ] **Row spans.** The grammar can't express a box spanning rows (e.g. a tall sidebar). Revisit with nesting only when a real layout needs it.
- [ ] **Who owns geometry.** The grid string should own geometry, or be *computed* from fixture data as a dedup/lookup key. Never author both `{lane, col}` and a grid string for the same design.

## Acceptance

- [ ] Map all three existing examples (solar system, cell division, RAG) to layout / use case / design IDs. Record any split that feels forced.
- [ ] Add the three-ID model and grammar to `SPECS-PRD.md` §6 (e.g. §6.6), reusing the existing recipe ID and fingerprint definitions rather than restating them.
- [ ] Add `designs.sql` (schema + three seed designs), one build step that creates `designs.db` from it, a `.gitignore` entry for the binary, and one engine module that owns reads and writes via `node:sqlite`.
- [ ] Add one grid-string parser/validator (spans, equal row sums, GCD canonical form, `0` cells) and pixel-geometry function in the engine core, exercised by an existing render path. Do this only when GH-5 P0 extracts the shared render operation.

## Reversibility

| Change | Read |
|---|---|
| Layout as a use case param | **Easy** |
| Use case IDs | **Easy** (already semver) |
| New `designs.db` while it holds only seed examples | **Easy** (rebuild from `designs.sql`) |
| Layout string format | **Costly** once designs pin it |
| Design ID format | **Costly** once shared outside the repo |
| Shape-based IDs as published recipe IDs (rejected) | Near **One-way door** |

Related: #5 (MVP foundation, P0 recipe promotion and render-operation extraction), #1 (renderer spike).
