---
gh_issue: 10
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10
title: "Recipe catalog: serial + slug + semver identity, SQLite ledger, and catalog CLI"
status: "Planned; awaiting plan QA"
created: 2026-10-09
updated: 2026-10-10
owner: unassigned
doc_type: feedback
complexity: 3
risk: 2
effort: 3
phases: 4
ratings_provisional: true
branch: marathon/gh-10-recipe-catalog (proposed; base origin/marathon/gh-5-mvp-foundation, PR #18 head)
reversibility: "Costly for the identity scheme once serials/slugs are referenced; Easy for module, dump format and CLI."
non_goals:
  - Hosted registry, HTTP/MCP catalog endpoints, tenant or remote write paths, marketplace or UI.
  - Variants (RCP-NNNN.NN presets), slug aliases/renames, semver range resolution, tags and analytics.
  - Changing recipe content semantics, outputs or goldens; cataloguing generated images (GH-5 manifest owns that).
  - New npm dependency, new test file/test block, CI workflow, or a second storage story beside the canonical dump.
related:
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9
  - https://github.com/HiQS-Labs/XYZ-layout-engine/pull/18
  - PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md
  - PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md
  - PROJECT/2-WORKING/recipe-catalog/MARATHON.yaml
  - PROJECT/2-WORKING/SPECS-PRD.md
goal: >
  One operator-only recipe catalog: every trusted recipe has an immutable serial (RCP-0001), its
  existing slug and a semver version bound to a content digest of its declared files; a committed
  deterministic SQLite text dump is the single canonical ledger; `node tools/catalog.mjs` lists,
  shows, adds, publishes, updates status, verifies, exports and imports; republishing different
  content under a published version is rejected; renders record the resolved catalog identity.
---

> **Superseded in part (2026-10-10):** serials (`RCP-NNNN`) were dropped; identity is `slug@semver`. Current plan: the finalized three-ID plan on issue #20 (Phase A). References to serials below are historical.

# GH-10 — Recipe catalog: serial + slug + semver identity

## Status

| What was just completed | What's next |
|---|---|
| Capture promoted from 1-INBOX and expanded into a marathon-executable plan: grounded current state, Phase 0 decision evidence (Node 22.22.3, built-in `node:sqlite` loads unflagged with an ExperimentalWarning), four serial phases with failing acceptance checks and red controls, write-sets and preflight contract. | Independent plan QA by the orchestrator, ledger repoint of the GH-10 roadmap row to this path, then operator exact-plan confirmation before firing `recipe-catalog/MARATHON.yaml`. Rebase on the fixed PR #18 head first. |

## Table of contents

- [Verdict and purpose](#verdict-and-purpose)
- [Observed current state](#observed-current-state)
- [Requirements and scope decisions](#requirements-and-scope-decisions)
- [Design](#design)
- [Smallest affected surface](#smallest-affected-surface)
- [Dependencies](#dependencies)
- [Risks and rollback](#risks-and-rollback)
- [Test scope](#test-scope)
- [Phase 0 — Spike: storage engine and identity decisions](#phase-0--spike-storage-engine-and-identity-decisions)
- [Phase 1 — Store, canonical dump and CLI](#phase-1--store-canonical-dump-and-cli)
- [Phase 2 — Seed, verify gate and render identity](#phase-2--seed-verify-gate-and-render-identity)
- [Phase 3 — Docs and handoff](#phase-3--docs-and-handoff)
- [Acceptance](#acceptance)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)

## Verdict and purpose

The catalog is worth building now for one concrete reason: GH-9 changes recipe content, and PRD
§6.5 (`PROJECT/2-WORKING/SPECS-PRD.md:257`) requires that a changed recipe gets a new immutable
version while "re-publishing different content under the same version is rejected". Today nothing
records which bytes a recipe version was, so that rule cannot be enforced. Umbrella #19 orders GH-10
before GH-9 for exactly this reason.

**Bet:** a ~300-line ESM module plus a committed text dump, using the Node built-in SQLite engine,
gives enforceable identity without a new dependency or service. **Tradeoff:** an experimental
built-in module instead of a stable native dependency. **Failure mode:** `node:sqlite` changes or is
unavailable on another Node line, or the content-file list misses a file that changes rendering, so
`verify` passes while output changed. **Reversibility:** module, dump format and CLI are Easy;
serials and slugs become Costly once referenced in issues, receipts or PRs.

## Observed current state

All references were read at `e553071` (PR #18 head) in this clone.

- **Recipes are plain ESM modules, not `recipe.yaml` packs.** `tools/recipes/nutrition.mjs:5-6`
  exports `version = '1.0.0'` and `name = 'nutrition'`; `tools/recipes/solar-system.mjs:8-9` exports
  `version = '1.0.0'` and `name = 'solar-system'`. There is no registry, `recipe.yaml`, serial or
  catalog command anywhere.
- **Recipe selection is a hardcoded allowlist.** `tools/request.mjs:59-60` maps fixture ids to
  `nutrition` / `solar-system`; `tools/render.mjs:182-189` imports the matching module.
  `tools/request.mjs:61` and `:68` hardcode the only admitted canvas per recipe (1000x1000,
  2400x1700).
- **Recipe content spans files outside the module.** Nutrition validates against the shape in
  `tools/spike/fixture.json` (`tools/recipes/nutrition.mjs:11`) and builds via
  `tools/spike/scene.mjs:63`. Solar validates against `examples/2026-10-08-solar-system/fixture.json`
  (`tools/recipes/solar-system.mjs:65`, `:68`) and pins eleven display assets by the digests in
  `examples/2026-10-08-solar-system/verification.json` (`tools/recipes/solar-system.mjs:93-104`).
- **The render receipt already carries a recipe version but no identity.**
  `tools/render.mjs:349` writes `versions: { recipe: recipe.version, backend }` and provenance
  (input and fixture sha256). No serial, slug binding or content digest.
- **Existing canonical writers to reuse.** Atomic temp-file + fsync + rename with `wx` exclusive
  create: `tools/request.mjs:124-129` (`saveFixture`) and `tools/render.mjs:396-173`
  (`publishStaged`). Field-level errors: `tools/request.mjs:9` (`invalid`). Direct-execution guard
  that keeps imports side-effect free: `tools/render.mjs:496`.
- **SQLite precedent.** `releases.sql:1-3` is a canonical dump: "GID-keyed rows, natural keys
  elsewhere, no integer PKs/FKs as values; rebuild renumbers deterministically", with a
  `schema_migrations` table (`releases.sql:4-13`). Its writer `releases_app.py` lives in the XYZ
  Forge harness, not this repo (`utils/py/` holds only `pdda_comment_refs.py` and
  `pdda_gov_scan.py`), and `releases.db/sql` are orchestrator-only.
- **Governance ratchet on SQLite access.** `utils/pdda/check_inventory_ratchet.py:41-46` flags
  direct Python/CLI `sqlite3` connects outside canonical gateways and `:50-62` freezes new
  `.sh/.py` scripts under `utils/`, `scripts/`, `bin/`. A Node module under `tools/` is outside its
  scan; its intent (one gateway per database) still applies: `tools/catalog.mjs` is the only
  reader/writer of the catalog.
- **Runtime evidence gathered during planning (2026-10-10, this host).** `node --version` =
  `v22.22.3`; no `engines` field in `package.json` and no `.nvmrc`, so Node is not pinned by the
  repo. `node -e "require('node:sqlite')"` exits 0 and exports `DatabaseSync, StatementSync,
  constants, backup`, printing `ExperimentalWarning: SQLite is an experimental feature and might
  change at any time` on stderr. SQLite version `3.51.3`. A duplicate insert raised
  `ERR_SQLITE_ERROR UNIQUE constraint failed`. `node --help` lists `--no-experimental-sqlite`, i.e.
  the module is on by default in this line. `better-sqlite3` is not installed and was not fetched
  (no network installs during planning).
- **Test harness constraints.** `tools/spike/test/run.mjs:24-33` counts every file in any `test`
  directory or named `*.test.*`/`*.spec.*` against `testFiles: 1`; `:35-47` allows only top-level
  `test()` named `guards: …`; `test-budget.json` caps 1 file / 4 tests / 60 s / 0 workflows.
  C1 copies only `tools/` and `package.json` into a space-containing temp root
  (`tools/spike/test/canaries.test.mjs:31-36`), so a ledger that render needs must live under
  `tools/`.
- **PR #18 review state.** The PR #18 review comment (2026-10-10) requests changes: one blocker in
  text fitting at `tools/render.mjs:244-157`, plus S1 (`tools/request.mjs:115-129`), S2
  (`tools/render.mjs:381-394`), S6 (duplicate `sha256` in `tools/render.mjs:357`,
  `tools/recipes/solar-system.mjs:62` and others) and S9 (C1 size). These fixes land before this
  plan executes and overlap its write-set (see `recipe-catalog/PREP-NOTES.md`).

## Requirements and scope decisions

From issue #10 (Summary, Design, Plan checklist, Tests, Stop conditions, and the "Compatibility with
the running GH-5 marathon" section that supersedes the earlier text):

| Issue asks | Decision here | Reason |
|---|---|---|
| Serial + slug + semver, display `RCP-0007 product-hero@3.1.0` | Kept. Serial `RCP-NNNN` global, slug = module `name`, version = module `version` | Slug already is the request key (`tools/request.mjs:60`) |
| SQLite ledger with committed deterministic dump | Kept. The dump `tools/catalog.sql` is canonical; SQLite runs in memory per invocation | One canonical text file; nothing binary to drift (see Design) |
| `recipes`, `recipe_versions`, `recipe_outputs`, `recipe_aliases`, `schema_migrations` | Kept except `recipe_aliases`; added `recipe_version_files` | No rename need exists; per-file digests make `verify` name the drifted file |
| CLI list/show/add/publish/update/deprecate/retire/verify/export/import | Kept as `node tools/catalog.mjs <verb>`; no `bin`, no package rename | Matches the existing `node tools/render.mjs` surface |
| Variants (`RCP-0007.02`, `--variant`) | Deferred | GH-9 flags are request parameters, not presets; no consumer needs a preset yet |
| RecipeRegistry semver-range resolution | Deferred; render records the exact module version and its catalog status | No caller passes a range today |
| Serial, slug, version and content digest in the render fingerprint | Kept, as a `catalog` block in the render receipt | PRD §10.1 (`SPECS-PRD.md:372`) |
| Tests: serial never reused, republish rejected, dump round-trip, verify detects modified/missing file | Kept, by extending C3/C4 (no new test block) | `test-budget.json` ratchet |

Explicit non-goals are in the frontmatter. Stop conditions (from the issue, retained): stop and
reassess if the ledger starts owning recipe content, needs a server or network, needs any
dependency, or the identity needs more than serial + slug + version.

## Design

**Identity.** `serial` is `RCP-` plus four digits, assigned only by `add` as `max(existing)+1`
inside one transaction, never reused (retired rows are never deleted; a `BEFORE DELETE` trigger
aborts). `slug` matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`, 3–64 chars, unique, immutable (no update
path). `version` is strict `MAJOR.MINOR.PATCH`; `publish` refuses a version that differs from the
module's `version` export. Row keys follow the `releases.sql` grammar: opaque GIDs
(`rcp-<uuid>`, `rcv-<uuid>` via `crypto.randomUUID()`), natural keys unique, no integer keys as
values. Phase 0 may switch GIDs to ULIDs only if the dump grammar needs sortable keys.

**Content digest.** Each published version stores its declared files in `recipe_version_files`
(`path`, `role` = `module|schema|content`, `sha256`). The version's `content_sha256` is the sha256 of
the sorted `path\0sha256\n` lines; `schema_sha256` is the `schema` file's digest. Declared sets
(Phase 0 confirms): nutrition = `tools/recipes/nutrition.mjs`, `tools/spike/scene.mjs`,
`tools/spike/assets.mjs`, `tools/spike/fixture.json` (schema), `tools/spike/assets/illustrations.svg`
and every `tools/spike/assets/generated/web/<id>.png` the fixture references (read unpinned at
`tools/spike/assets.mjs:47-58`, so the catalog is their only digest record); solar-system =
`tools/recipes/solar-system.mjs`, `examples/2026-10-08-solar-system/fixture.json` (schema),
`examples/2026-10-08-solar-system/verification.json` (pins all eleven asset digests, enforced at
`tools/recipes/solar-system.mjs:102`). Engine files (`tools/render.mjs`, `tools/request.mjs`) and the
shared pinned fonts (`tools/spike/assets.mjs:70-76`) are not recipe content; their identity is the
backend/runtime version already in the receipt. Recipe modules
are not edited by this issue.

**Immutability (PRD §6.5).** `publish <slug> <version>`: if no row exists, insert; if a row exists
with the same `content_sha256`, succeed as a no-op; otherwise exit 1 with
`Validation failed: [{"field":"version","message":"already published with different content"}]` and
leave the dump byte-identical. `BEFORE UPDATE`/`BEFORE DELETE` triggers on `recipe_versions` and
`recipe_version_files` abort, so even a bypassing statement cannot rewrite a published version.

**Version bump rule (applies to GH-9).** Patch: content bytes change and every previously admitted
request renders byte-identical artifacts. Minor: additive capability (new optional parameter or
output) with previously admitted requests still byte-identical. Major: any change to artifacts of a
previously admitted request, or a narrower schema.

**Storage (Phase 0 confirms).** `tools/catalog.sql` is the only committed ledger: schema DDL plus
deterministic `INSERT` rows ordered by natural key, with a fixed header like `releases.sql:1-3`.
Every invocation loads it into `new DatabaseSync(':memory:')`; read verbs never write. Write verbs
take an exclusive lock file (`tools/.catalog.lock`, `wx`), run one transaction, re-export, and
atomically replace the dump (temp + fsync + rename, as `tools/request.mjs:124-129`). A stale lock is
reported, never broken automatically. No `.db` file is committed.

**CLI.** `node tools/catalog.mjs list|show <serial|slug>|add <slug> --title T|publish <slug> <version>|update <slug> --title T|deprecate <slug> --reason R|retire <slug> --reason R|verify|export [--check]|import <dump>`.
Read verbs accept `--json`. Exit 0 ok, 1 validation/drift, 2 usage. Errors reuse `invalid()` from
`tools/request.mjs:9`. All SQL uses `prepare()` with bound parameters; no SQL text is built from
input. `verify` recomputes every file digest, reports missing files, modified files, duplicate
slugs, serial gaps and non-canonical dump bytes; it never rewrites either side. Only the version a
module currently exports is checked against the working tree (it must be published and its files
must match); older published versions are immutable history whose bytes live in git, not in the tree.

**Render identity.** `processRequest` adds `catalog: { serial, slug, version, contentSha256, verified }`
to the receipt (`tools/render.mjs:349`), via a lazy import of `tools/catalog.mjs`. Unpublished or
drifted content records `verified: false` with a reason and does not block local rendering; the
blocking gate is `catalog verify` (C3). Operator decision in PREP-NOTES.

## Smallest affected surface

New: `tools/catalog.mjs`, `tools/catalog.sql`. Edited: `tools/render.mjs` (receipt block only),
`tools/spike/test/canaries.test.mjs` (C1/C3/C4 extensions), `README.md`, `CHANGELOG.md`,
`PROJECT/2-WORKING/SPECS-PRD.md` (one delivered-observation note), and this plan (Phase 0 findings
only). Not edited: recipe modules, `tools/request.mjs`, `tools/spike/*` runtime, goldens under
`tools/spike/output/`, `package.json`, `pnpm-lock.yaml`, `test-budget.json`, `releases.db/sql`.

## Dependencies

- **PR #18 (GH-5) must be fixed and either merged or the stack rebased on its fixed head** before
  firing (umbrella #19 preconditions). Its blocker and S1/S2/S6/S9 touch `tools/render.mjs`,
  `tools/request.mjs`, `tools/recipes/solar-system.mjs` and the canary file.
- Node 22 with `node:sqlite` available unflagged (verified here at 22.22.3; other hosts are an
  assumption until Phase 0 re-runs the probe in the build environment).
- GH-9 depends on this issue (version bump + publish of nutrition 1.1.0).

## Risks and rollback

| Risk | Read | Mitigation / rollback |
|---|---|---|
| `node:sqlite` API changes or is disabled on another Node | Easy | Single module owns it; Phase 0 records the probe; fallback is one pinned dependency (requires a new decision) |
| ExperimentalWarning on stderr for catalog and render CLIs | Easy | Recorded; no canary asserts empty stderr (checked `canaries.test.mjs`); revisit when Node marks it stable |
| Declared file set misses a rendering input, so `verify` passes on changed output | Costly | Phase 0 lists every file each `validate`/`buildScene` reads; reviewer checks the list against imports |
| Rebase onto fixed PR #18 changes `tools/recipes/solar-system.mjs` (S6) and invalidates seeded digests | Easy | Seed is the last runtime phase; re-seed on the unmerged branch before PR (not a republish: nothing merged) |
| Serials/slugs referenced externally then changed | One-way door | Seed only the two existing recipes; operator approves RCP-0001/0002 assignment before merge |
| C1 grows further (PR #18 S9) | Easy | Put catalog guards in C3/C4, whose named failure modes they match |
| Lock file left after a crash | Easy | Reported with the path; operator removes; no auto-break |

Rollback: revert the phase commit; the dump is text and the module is unshipped. Halt on the first
failed phase; no force.

## Test scope

No new test file, `test()` block, CI workflow or dependency. Named failure modes and where they go:

- **Committed recipe content silently drifts from its published version** (no existing canary reads
  recipe identity): C3 `guards: committed evidence no longer satisfies the gate` also runs
  `node tools/catalog.mjs verify` on the committed tree.
- **Catalog stops detecting tampering / republish under a published version succeeds / serial reused /
  dump round-trip not byte-identical**: C4 `guards: the verifier stops detecting tampering`, in a temp
  root.
- **Render receipt loses catalog identity**: one assertion in C1 on the existing nutrition receipt.
- C2 (goldens byte-identical) is untouched and must keep printing `C2 digests: N artifacts byte-identical`.

Budget stays 1/4/60/0 (`git diff --exit-code test-budget.json`).

## Phase 0 — Spike: storage engine and identity decisions

**Goal:** decide `node:sqlite` versus `better-sqlite3` and the identity details with evidence, writing
findings back into this section. Depends on PR #18 fixed head. Doc-only; prototypes live in `$TMPDIR`.

- [ ] Re-run in the build environment: `node --version`; `node -e "require('node:sqlite')"` (record
      exit code and the exact warning); `node --no-experimental-sqlite -e "require('node:sqlite')"`
      (expect failure); SQLite version; `DatabaseSync(':memory:')`, prepared statements, `BEGIN
      IMMEDIATE`/`ROLLBACK`, `CREATE TRIGGER … RAISE(ABORT)`.
- [ ] Compare `better-sqlite3` from local evidence only (no install): would add a native dependency
      and lockfile change, violating the no-new-dependency default. Record the decision with an
      UNLESS clause.
- [ ] Prototype in `$TMPDIR`: serial assignment in a transaction; immutability triggers; publish
      idempotent-same / reject-different; dump → load → dump byte-identical.
- [ ] List every file read by each recipe's `validate`/`buildScene`/`loadAssets` and fix the declared
      file sets; decide GID form, serial width, slug pattern.
- [ ] Write findings (what was checked, results with commands, what it changes) into a
      `### Phase 0 findings` subsection here. Go/no-go.

**Write set:** `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md` (Phase 0 findings subsection only).

**Acceptance (each can fail; red control in brackets):**
- [ ] P0-A1 Findings subsection exists with the six probe results and the decision line. [Red: an
      empty subsection fails reviewer check `rg -n "^Decision:" PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`.]
- [ ] P0-A2 Prototype trigger blocks `UPDATE recipe_versions SET content_sha256=…` with an abort.
      [Red: the same prototype without the trigger lets the UPDATE succeed.]
- [ ] P0-A3 Prototype dump is byte-identical across two load/export cycles. [Red: exporting without
      `ORDER BY` after inserting rows in reverse order produces a different dump.]
- [ ] P0-A4 `git status --porcelain` lists only this plan. [Red: any scratch file in the repo shows up.]

### Phase 0 — QA checklist

- [ ] Findings written back with file:line pointers (memory injection); decision has BECAUSE/UNLESS.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0 (4/4, budget unchanged).

### Phase 0 findings

Observed 2026-10-10 in the admitted relay worktree. This subsection is the Phase 0
memory injection; the earlier provisional Design file sets are superseded by the sets below.
No runtime implementation, seed identity allocation or dependency change was made.

Decision: use `node:sqlite` BECAUSE the installed Node v22.22.3 supplies the required
in-memory database, parameter binding, transactions and aborting triggers without a dependency;
UNLESS an admitted deployment runtime cannot load it unflagged or a required operation fails its
probe, in which case stop and re-decide a pinned `better-sqlite3` dependency rather than silently
switching engines. **Go:** local catalog implementation on this measured runtime, subject to
independent review and the driver gate. Other Node versions/platforms are unverified.
**Bet:** one owner can export a canonical text ledger using this API. **Tradeoff:** experimental
runtime API versus a new native dependency. **Failure mode:** unavailable/changed API or an
incomplete declared input namespace. **Reversibility:** Easy for this doc and storage module;
Costly for serial/slug identity once referenced. No new service or abstraction is needed.

#### Runtime and storage evidence

| Command / probe | Exit | Observed result |
|---|---|---|
| `node --version` | 0 | `v22.22.3` |
| `node -e "require('node:sqlite')"` | 0 | Loads without opt-in; exact warning body and hint below |
| `node --no-experimental-sqlite -e "require('node:sqlite')"` | 1 | `ERR_UNKNOWN_BUILTIN_MODULE: No such built-in module: node:sqlite` |
| `new DatabaseSync(':memory:')`; prepared `SELECT sqlite_version()` | 0 | SQLite `3.51.3` |
| `prepare('INSERT INTO recipes VALUES(?,?,?,?,?)').run(...)`; `BEGIN IMMEDIATE` / `ROLLBACK` | 0 | Bound title `Operator's nutrition` round-trips; candidate serial 4 rolled back, rows remain 3 and next serial remains 4 |
| `CREATE TRIGGER ... SELECT RAISE(ABORT,...)` | 0 | Published UPDATE/DELETE and file-row UPDATE/DELETE abort; removing the version UPDATE trigger permits the same UPDATE |

The loading process printed `(node:74599)` followed by this exact text:

```text
ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```

Local-only comparison: `node -e "try { console.log(require.resolve('better-sqlite3')); }
catch(e) { console.error(e.code); process.exit(1); }"` exits 1, `MODULE_NOT_FOUND`.
Searching `package.json` and `pnpm-lock.yaml` for `better-sqlite3` returns no match.
It would introduce a native SQLite dependency and package/lockfile changes; no installation,
fetch, build or comparative latency claim was made. No repository Node pin was added.

#### Prototype and red controls

Command: `node .relay-scratch/p0-prototype.mjs`, exit 0. Scratch placement follows the current
relay instruction (all files under `.relay-scratch/`, overriding the brief's `$TMPDIR` placement).
The prototype is disposable evidence, not feature code or a new suite. It uses three tables
(`recipes`, `recipe_versions`, `recipe_version_files`), foreign keys enabled, bound mutation
parameters, fixed DDL and a SQL-string encoder that doubles apostrophes. Publication and serial
allocation each use `BEGIN IMMEDIATE`, commit on success and rollback on failure.

- `max(serial)+1`: add nutrition → 1; add solar-system → 2; retire solar-system without deleting
  it; add third-recipe → 3. A rolled-back candidate 4 does not consume a serial. Recipe DELETE
  aborts `ERR_SQLITE_ERROR: recipe identity retained`.
- Publish nutrition 1.0.0 with a digest → inserted; publish the same digest → no-op with identical
  dump bytes; publish a different digest → `already published with different content`, rollback,
  identical dump bytes. These observations test transaction/publication mechanics, not production
  file-digest collection or concurrent file locking.
- P0-A2 green: `UPDATE recipe_versions SET content_sha256='changed'` aborts
  `ERR_SQLITE_ERROR: published version immutable`. Version DELETE also aborts. File-row
  UPDATE/DELETE abort `ERR_SQLITE_ERROR: published files immutable`.
  Exact trigger shape: `CREATE TRIGGER versions_no_update BEFORE UPDATE ON recipe_versions
  BEGIN SELECT RAISE(ABORT,'published version immutable'); END;`.
  Red: `DROP TRIGGER versions_no_update`, then the identical UPDATE succeeds.
- P0-A3 green: export → load/export → load/export all produce SHA-256
  `d505d529ec41d3e95f446ce631ef8171ea8de6dd7a753c3306e650949b54d683`. GIDs are retained on load; fresh prototype runs allocate different UUIDs,
  so this digest establishes equality within this run, not equality across new catalogs.
  Recipe rows use `ORDER BY serial`; version rows use joined recipe slug then version;
  file rows use joined slug, version, path. Columns, table order, DDL, LF newlines and header
  are fixed; the export contains no current timestamps. Load executes parent inserts before children.
- Ordering red: reverse each table's insertion order into another fresh database. With those same
  ORDER BY clauses its dump still equals the original. Without ORDER BY the two digests are
  `d505d529ec41d3e95f446ce631ef8171ea8de6dd7a753c3306e650949b54d683` and `4b88bd77f678771c2b3377d70b27df565ad42f94df2fc7ebd4c3751d789afe87`, proving insertion order would leak into bytes.

The prototype/dump/runtime logs are relay-local scratch and will not be copied back. The commands,
SQL mechanism, results and digests above persist here for independent reproduction. Production
DDL, dump admission, lock exclusion, atomic publication and canary integration remain Phase 1 work.

#### Identity decisions

- GIDs: retain `rcp-` / `rcv-` plus lowercase hyphenated UUID v4 from standard-library
  `crypto.randomUUID()`. Opaque text primary/foreign keys follow the natural-key convention in
  `releases.sql:1-2`; do not reuse its implementation or assume its ULID-looking values mandate
  the catalog grammar. Sorting uses natural keys, so a sortable GID adds no present benefit.
  Import/export must preserve existing GIDs, never regenerate them.
- Serials: retain four decimal digits, `RCP-0001` through `RCP-9999`, integer storage with a
  1–9999 CHECK; refuse allocation 10000 rather than widening silently. Retired rows are retained;
  committed serials are never reused. The prototype proves allocation and rollback on one
  in-memory writer, not cross-process locking (the planned exclusive dump lock owns that).
- Slugs: retain `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` plus length 3–64, unique and immutable.
  `nutrition` and `solar-system` already match their module exports
  (`tools/recipes/nutrition.mjs:5-6`, `tools/recipes/solar-system.mjs:8-9`).
  UUID syntax, slug/semver admission and immutable identity updates require Phase 1 validation;
  they are decisions here, not claims that this prototype implements the full contract.

#### Recipe input trace and declared file sets

Read both complete recipe modules, `tools/spike/scene.mjs`, `tools/spike/assets.mjs` and the
shared fixture validator. Entry path: `tools/render.mjs:183-193` selects/validates the recipe;
`:223` calls its scene builder. User fixture bytes come from `tools/request.mjs:40` and belong
in the render input digest, not the immutable recipe file list. Recipe validation reads the
committed shape fixture even for custom input. No recipe write path exists in these functions.

**Nutrition — declare 12 files:**

- `tools/recipes/nutrition.mjs` (module): imports scene and delegates at `:1`, `:18-19`.
- `tools/spike/fixture.json` (schema): read by `tools/recipes/nutrition.mjs:11`;
  optional caption handling is in the module at `:12`.
- `tools/spike/scene.mjs` (module): `createScene` resolves header, hero, footer, callouts, items and
  benefit icons at `:63-72`; remaining scene geometry/text is in this same file.
- `tools/spike/assets.mjs` (module): PNG preference/inspection and SVG fallback at `:43-66`.
- `tools/spike/assets/illustrations.svg` (content): fallback read at `tools/spike/assets.mjs:58`;
  includes `bottle`, benefit icons, `leaf_small`, `heart`.
- Seven content files under `tools/spike/assets/generated/web/`: `balance_scale.png`,
  `chicken_wrap.png`, `leaf_glow.png`, `parfait_jar.png`, `skip_spike.png`,
  `snack_container.png`, `water_bottle.png`. Path/read evidence:
  `tools/spike/assets.mjs:47-54`; default IDs: `tools/spike/fixture.json:21-46`.

Nutrition illustration identifiers are syntax-checked, not fixed to default values
(`tools/request.mjs:99-100`). Input probe (`node --input-type=module`, importing nutrition
`validate`, exit 0) changed `sections.hero.illustrationId` to `heart` and validation accepted it.
Therefore bind the entire present PNG namespace plus the whole fallback SVG, not just whichever
assets a single fixture happened to use. Phase 1 `verify` must compare PNG namespace membership
against the declared list as well as checking declared bytes: adding e.g. `heart.png` changes
PNG-over-SVG resolution without editing any already-listed file. Extra or missing PNG paths are
drift until published in a new version. This adds no recipe input restriction or fallback change.

**Solar System — declare 15 files:**

- `tools/recipes/solar-system.mjs` (module): owns validation and scene; `buildScene` calls
  `loadAssets` at `:123` and constructs inline SVG in memory (`:125-129`, `:163`, `:183`),
  which adds no separate disk files.
- `examples/2026-10-08-solar-system/fixture.json` (schema): read at
  `tools/recipes/solar-system.mjs:68`; shape validation at `:70`.
- `examples/2026-10-08-solar-system/verification.json` (content): read at
  `tools/recipes/solar-system.mjs:93`, enforces display digests at `:102`.
- `tools/spike/assets.mjs` (module): imported `inspectPng` at
  `tools/recipes/solar-system.mjs:6`, invoked at `:101`; its acceptance rules are recipe-relevant.
- Eleven content files under `examples/2026-10-08-solar-system/assets/web/`: `asteroid-belt-diagram.png`,
  `earth.png`, `jupiter.png`, `mars.png`, `mercury.png`, `milky-way.png`, `neptune.png`,
  `saturn-clean.png`, `sun.png`, `uranus.png`, `venus.png`. Fixed ASSET_IDS at
  `tools/recipes/solar-system.mjs:64`; realpath/read/digest enforcement at `:94-103`;
  all eleven paths exist (input probe exit 0). Include the actual PNGs so catalog verification
  detects drift independently of a render. Originals, generator, manifests and proof reports
  other than `verification.json` are not read by these functions and are excluded.

**Shared runtime boundary:** both recipes use `tools/request.mjs` for validation/limits;
`tools/spike/assets.mjs` imports it at `:5`. As the existing design stipulates, that common engine
file and `tools/render.mjs` remain outside recipe content. Both recipes also use
`tools/spike/assets/font.ttf` and `font-bold.ttf` via `getFonts`
(`tools/spike/assets.mjs:69-76`, `tools/render.mjs:177`, `:193`); these are shared runtime assets,
excluded from the recipe digest. Limit: the current receipt backend version at
`tools/render.mjs:349` does not hash engine source or fonts, so catalog verification alone cannot
prove unchanged output after an engine/font edit. Existing runtime/golden checks remain necessary;
revisit that identity boundary if engine/font provenance becomes a catalog requirement.

P0-A4 is reserved to the harness: no git command was run because this turn explicitly prohibits
it. A before/after file-hash inventory (excluding `.git`, `node_modules`, `.relay-scratch`) and
original-document byte comparisons verify the builder's bounded edits; this is not a claim about
git index state. Independent Agy approval and the driver's full gate remain pending.

## Phase 1 — Store, canonical dump and CLI

**Goal:** `tools/catalog.mjs` and an initial schema-only `tools/catalog.sql`, with C4 guards. Depends on Phase 0.

- [ ] Module with direct-execution guard (pattern `tools/render.mjs:496`); importing it opens nothing.
- [ ] Schema migration 1: `schema_migrations`, `recipes`, `recipe_versions`, `recipe_version_files`,
      `recipe_outputs`, unique natural keys, immutability and no-delete triggers.
- [ ] Verbs and exit codes as in Design; read verbs never touch the dump or lock.
- [ ] Deterministic export; `import` validates round-trip before atomic replace; single-writer lock.
- [ ] Extend C4 in a temp root: add/publish/republish-different (rejected, dump bytes unchanged),
      republish-same (no-op), add→retire→add (next serial), export→import→export identical,
      modified and missing declared file make `verify` exit 1.

**Write set:** `tools/catalog.mjs`, `tools/catalog.sql`, `tools/spike/test/canaries.test.mjs`.

**Acceptance (each can fail; red control in brackets):**
- [ ] P1-A1 `node tools/catalog.mjs export --check` exits 0 on the committed dump. [Red: a temp copy with
      one row line moved exits 1 `non-canonical dump`.]
- [ ] P1-A2 Republishing changed content under a published version exits 1 and the dump sha256 is
      unchanged. [Red: republishing identical content exits 0, proving the check compares content.]
- [ ] P1-A3 `list`, `show`, `verify` leave `tools/catalog.sql` sha256 and mtime unchanged and create no
      lock. [Red: `update --title` changes the sha256.]
- [ ] P1-A4 `rg -n 'prepare\(\s*`[^`]*\$\{' tools/catalog.mjs` finds nothing. [Red: the same pattern
      matches a scratch line `db.prepare(\`SELECT ${x}\`)`.]
- [ ] P1-A5 `git diff --exit-code <base> -- package.json pnpm-lock.yaml test-budget.json` exits 0. [Red:
      any dependency edit makes it exit 1.]
- [ ] P1-A6 `pnpm test` exits 0 with 4/4 canaries. [Red: deleting the trigger in a temp copy makes the
      C4 republish assertion fail.]

### Phase 1 — QA checklist

- [ ] Every todo has a recorded command/result in the relay receipt.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0, keeping 1 file/4 tests/60 s/0 workflows.

## Phase 2 — Seed, verify gate and render identity

**Goal:** register the two existing recipes, gate drift in C3, and record identity in render receipts. Depends on Phase 1.

- [ ] `add` + `publish` nutrition (`RCP-0001`, 1.0.0, output `default` 1000x1000 png/svg/html) and
      solar-system (`RCP-0002`, 1.0.0, output `default` 2400x1700) with the Phase 0 file sets; commit
      the resulting dump.
- [ ] `tools/render.mjs`: lazy catalog lookup; receipt gains the `catalog` block; no change to
      artifacts, fitting, admission or publication.
- [ ] Extend C3 with `catalog verify` on the committed tree and C1 with one receipt assertion.

**Write set:** `tools/catalog.sql`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`.

**Acceptance (each can fail; red control in brackets):**
- [ ] P2-A1 `node tools/catalog.mjs verify` exits 0 and lists `RCP-0001 nutrition@1.0.0` and
      `RCP-0002 solar-system@1.0.0`. [Red: in a temp copy, one flipped byte in
      `tools/recipes/nutrition.mjs` exits 1 naming that path; deleting
      `examples/2026-10-08-solar-system/verification.json` exits 1 `missing`.]
- [ ] P2-A2 `node tools/render.mjs tools/spike/fixture.json --out <tmp>` receipt has
      `catalog.verified: true`, serial `RCP-0001`. [Red: same command in a temp copy with a modified
      recipe file reports `verified: false`.]
- [ ] P2-A3 PNG/SVG digests of that render equal the base-ref digests for the same command. [Red: a
      `--set sections.header.headline=X` render differs.]
- [ ] P2-A4 `pnpm test` exits 0; output contains `C2 digests:` with `byte-identical`, not `skipped`.
      [Red: on a host whose runtime differs, C2 prints `skipped`, and this acceptance fails.]
- [ ] P2-A5 `git diff --exit-code <base> -- tools/spike/output tools/recipes` exits 0. [Red: any golden
      or recipe edit exits 1.]

### Phase 2 — QA checklist

- [ ] Every todo has a recorded command/result in the relay receipt.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0, keeping 1 file/4 tests/60 s/0 workflows.
- [ ] Operator approves the serial assignment before merge (Costly once referenced).

## Phase 3 — Docs and handoff

**Goal:** document the identity rule, source-of-truth rule, version bump rule, CLI and operator-only
write policy; record the iteration. Depends on Phase 2.

- [ ] `README.md`: short catalog section with the exact commands and exit codes.
- [ ] `PROJECT/2-WORKING/SPECS-PRD.md` §6.5: one delivered-observation note (local catalog, deferred ranges/variants).
- [ ] `CHANGELOG.md`: entry referencing #10 and #19; `Refs #10` only, no closing keyword.

**Write set:** `README.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`.

**Acceptance (each can fail; red control in brackets):**
- [ ] P3-A1 Every command in the README catalog section runs with its documented exit code. [Red: a
      misspelled verb exits 2 `usage`.]
- [ ] P3-A2 `utils/pdda/pdda.sh run` reports no errors. [Red: an absolute home path in a touched doc
      raises a hardcoded-paths finding.]
- [ ] P3-A3 `pnpm test` exits 0. [Red: as P1-A6.]

### Phase 3 — QA checklist

- [ ] Docs describe only delivered behavior; deferred items named as deferred.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0.

## Acceptance

- [ ] The two trusted recipes are catalogued as RCP-0001 nutrition@1.0.0 and RCP-0002 solar-system@1.0.0 with per-file digests in the committed dump tools/catalog.sql.
- [ ] Republishing different content under a published version is rejected and leaves the dump unchanged; republishing identical content is a no-op.
- [ ] Serials are monotonic and never reused, including after retire; published versions cannot be updated or deleted.
- [ ] catalog verify exits non-zero on a modified or missing declared file and exits 0 on the committed tree, enforced by C3/C4.
- [ ] Render receipts carry serial, slug, version, content digest and verified status; artifacts and goldens are byte-identical to the base ref.
- [ ] No new dependency, test file, test block or CI workflow; pnpm test passes 4/4 within 60 seconds.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm test` exit 0 after all four phases, plus P2-A1..A5 commands).
- [ ] Wave 1 Post-Build Codex QA Relay executed (receipt to be recorded under `relay-system/<YYYY-MM-DD>/gh10-wave1-postbuild.codex.md`).
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated.

Execution: one serial lane gh10-p0 -> gh10-p1 -> gh10-p2 -> gh10-p3 from
`PROJECT/2-WORKING/recipe-catalog/MARATHON.yaml`; Codex builder (driver default), independent Agy
reviewer, gate `pnpm test`, 1500 s turns, two review rounds. No push, no PR, no merge from builder
turns; the ready PR lists `Refs #10` only.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/marathon/gh-5-mvp-foundation"
  },
  "gate": "pnpm test",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/catalog.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/catalog.sql"
    },
    {
      "type": "path_absent",
      "path": "PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md"
    }
  ],
  "artifacts": [
    "PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md",
    "tools/catalog.mjs",
    "tools/catalog.sql",
    "tools/render.mjs",
    "tools/spike/test/canaries.test.mjs",
    "README.md",
    "PROJECT/2-WORKING/SPECS-PRD.md",
    "CHANGELOG.md"
  ],
  "artifacts_new": [
    "PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md",
    "tools/catalog.mjs",
    "tools/catalog.sql"
  ],
  "remediation": {
    "source": "issue#10",
    "criteria": "Operator-only recipe catalog: RCP serial + slug + semver bound to per-file content digests in a committed deterministic SQLite dump (tools/catalog.sql) via built-in node:sqlite; node tools/catalog.mjs list/show/add/publish/update/deprecate/retire/verify/export/import; republishing different content under a published version rejected; render receipts carry catalog identity; goldens byte-identical; four existing canaries extended, no new dependency/test/workflow."
  },
  "acceptance": [
    "pnpm test",
    "node tools/catalog.mjs export --check",
    "node tools/catalog.mjs verify"
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
