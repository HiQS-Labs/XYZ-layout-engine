# Recipe and Design Catalog — reference

`tools/catalog.mjs` is the CLI for the local recipe and design catalog. This page is the detailed
reference; the [README](../README.md#recipe-and-design-catalog) has the short version.

## Recipes

Recipe files own content; `tools/catalog.sql` is the canonical identity ledger, loaded into
in-memory SQLite by `tools/catalog.mjs`. The current identities are `nutrition@4.0.0`,
`solar-system@1.0.1`, `recursive-process@6.0.1` and `design-intake@1.0.6`: an immutable slug and an
exact `MAJOR.MINOR.PATCH` version bound to SHA-256 digests of declared files. There is no serial
number; a recipe is identified by `slug@semver`. Older versions (`nutrition@1.0.0`..`3.0.0`,
`solar-system@1.0.0`, `recursive-process@1.0.0`..`6.0.0`, `design-intake@1.0.0`..`1.0.5`) remain ledger history; their content is
retained in git.

Run from the repository root on a Node with unflagged `node:sqlite` (22.13 or newer):

| Command | Successful result | Exit |
|---|---|---|
| `node tools/catalog.mjs list` | List recipe identities and statuses | 0 |
| `node tools/catalog.mjs show nutrition` | Show identity, versions, files and outputs | 0 |
| `node tools/catalog.mjs show solar-system` | Look up Solar System by slug | 0 |
| `node tools/catalog.mjs publish nutrition 4.0.0` | Unchanged publication succeeds as a no-op | 0 |
| `node tools/catalog.mjs verify` | Current module versions are published, declared files match, dump is canonical | 0 |
| `node tools/catalog.mjs export --check` | Check canonical dump bytes without rewriting | 0 |

Exit **1** means validation, I/O or drift failure (including changed content under a published
version, missing/modified declared files, or a non-canonical dump); exit **2** means usage error
(for example, `node tools/catalog.mjs lsit`). `export --check` checks dump serialization, while
`verify` also checks current recipe content. `list`, `show` and `verify` accept `--json`.
Catalog commands may emit `ExperimentalWarning: SQLite is an experimental feature` on stderr; this
warning also occurs when rendering loads the catalog and does not itself indicate failure.

Catalog writes are local operator actions: `add`, `publish`, `update`, `deprecate`, `retire` and
`import` are not tenant or render API/MCP operations. Writes use an exclusive lock
(`tools/.catalog.lock`) and atomic dump replacement; a stale lock requires operator inspection and is
never broken automatically. `publish <slug> <version>` requires the module's exact exported version.
Publishing identical content again succeeds; changed content requires a new version. Bump **patch**
when content changes but all previously admitted requests remain byte-identical, **minor** for
additive capabilities with those artifacts unchanged, and **major** for changed prior artifacts or a
narrower schema.

Render receipts record slug, exact module version, published content digest and verification
status; missing, unpublished or drifted catalog content records `verified: false` with a reason
and leaves local rendering available. Use `verify` to enforce catalog integrity. Variants, slug
aliases/renames and semver range resolution are deferred.

## Designs

Designs are insert-only records in the same catalog, identified by `YYYY-MM-DD-slug`.
An edit forks a new design ID; there is no design update or delete command. Each record hashes
the fixture JSON and PNG artifact and optionally pins a published use case as `slug@semver`.
Solar System is seeded with `solar-system@1.0.0`, Nutrition Infographic is pinned at
`2026-10-13-nutrition-infographic` (`nutrition@2.0.0`), `2026-10-13-nutrition-shadow-tuning`
(`nutrition@3.0.0`), and `2026-10-13-nutrition-type-scale` (`nutrition@4.0.0`), and Belief Updating
designs are pinned across `recursive-process@1.0.0`..`6.0.0`; RAG and cell-division have a null use
case because they are hand-built scripts with no recipe.

| Command | Successful result | Exit |
|---|---|---|
| `node tools/catalog.mjs design list` | List recorded designs | 0 |
| `node tools/catalog.mjs design show 2026-10-08-solar-system` | Show a design by ID (`design show <id>`) | 0 |
| `node tools/catalog.mjs design add 2026-10-10-rag-study --fixture examples/2026-10-09-rag-system/fixture.json --artifact examples/2026-10-09-rag-system/renders/rag-system.png --friction 'Hand-built lanes and connectors; no recipe.'` | Record a new ID and append its log line | 0 |

The add example succeeds once; repeating the ID exits **1** and preserves the dump and log.
Exit **1** also means validation, I/O or drift failure (including an unknown design or use-case
pin); exit **2** means usage error, such as `node tools/catalog.mjs design lsit`.
`design list` and `design show <id>` accept `--json`. Add paths must be normalized repo-relative
paths under `examples/`; `--friction` is a required single line of 1–200 characters.
Optional add flags are `--use-case <slug>@<semver>`, `--workarounds N` (a non-negative integer),
and `--flags` with a comma-separated list from `needed_row_span,non_grid_family,needed_span_over_9,layout_forced`.

`tools/design-log.jsonl` is an append-only record for judging the grid grammar, with one line
per design added through the CLI. Review it after every 10 designs or the first
`needed_row_span`, `non_grid_family` or `needed_span_over_9` flag.

### Write ordering and recovery

`design add` writes `tools/design-log.jsonl` first via an atomic temp-file rename and then
atomically replaces `tools/catalog.sql`. On an ordinary `catalog.sql` write failure, `catalog.mjs`
automatically restores the prior `design-log.jsonl` bytes (or unlinks the file if it did not
previously exist) so the failed `design add` leaves both files unchanged and can be retried
directly. If that log rollback itself throws an error, `catalog.mjs` reports
`design-log rollback failed: ...; recovery required`; if a process crash or power loss interrupts
between the two file renames (without a caught exception), run `node tools/catalog.mjs verify` and
restore the affected file before retrying.

A malformed design row (for example an invalid ID or an unpublished pin) makes the whole catalog
fail to load, so recipe receipts then report `verified: false`; only design errors that `verify`
returns for a structurally loadable catalog are isolated from recipe verification.

## Deferred (Phase B)

The grid parser and canonical form, pixel geometry, `layouts` and `use_case_layouts`, filling
`layout_id`, deriving grid counts/span histograms, responsive stacking and SPECS-PRD §6.6; layout
IDs and derived grid fields remain null.
