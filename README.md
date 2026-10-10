# XYZ Layout Engine

XYZ Layout Engine is a deterministic layout and rendering engine. The current local MVP uses ESM JavaScript and a Python image-generation script; TypeScript remains a product target. It converts structured data (JSON) into raster (PNG) or vector (SVG, HTML) images using versioned layout recipes.

## Install and Offline Workflow

XYZ Layout Engine supports a fully offline, self-contained workflow. Once the repository and dependencies are installed, you can render, edit, and export without any remote network calls or paid API usage.

Run these commands from the repository root. Dependency installation may use the network; the rendering workflows below use pinned local assets.

1. **Install dependencies:**
   ```sh
   pnpm install --frozen-lockfile
   ```

2. **Render, Edit, and Rerender (Nutrition):**
   ```sh
   # Render an offline fixture to PNG, SVG, and HTML
   mkdir -p .relay-scratch
   cp tools/spike/fixture.json .relay-scratch/nutrition-edit.json
   node tools/render.mjs .relay-scratch/nutrition-edit.json --format png,svg,html,html-inline --out .relay-scratch/nutrition-export
   
   # Durable edits and rerender
   node tools/render.mjs .relay-scratch/nutrition-edit.json --set 'sections.header.headline=Fuel for today' --set 'theme.palette.primary=#335577' --save .relay-scratch/nutrition-edit.json --format png,svg,html,html-inline --out .relay-scratch/nutrition-export
   node tools/render.mjs .relay-scratch/nutrition-edit.json --format svg --out .relay-scratch/nutrition-rerender
   ```

3. **Durable edits and rerender (Solar System):**
   ```sh
   # Copy and perform a schema-validated edit on the JSON fixture
   mkdir -p .relay-scratch
   cp examples/2026-10-08-solar-system/fixture.json .relay-scratch/solar-edit.json
   node tools/render.mjs .relay-scratch/solar-edit.json --recipe solar-system --set 'planets.0.labelX=830' --save .relay-scratch/solar-edit.json --format svg --out .relay-scratch/solar-export
   node tools/render.mjs .relay-scratch/solar-edit.json --recipe solar-system --format svg --out .relay-scratch/solar-rerender
   ```
   *Edits made via `--set` are durable when combined with `--save`. Rendering without `--save` produces a transient preview export without mutating the original JSON.*

4. **Export Retrieval and Distribution:**
   Read the `current` field of `.relay-scratch/nutrition-export/manifest.json` and resolve that relative path under `.relay-scratch/nutrition-export/` to locate the selected immutable output directory. For distribution, you can copy the compact `render.html` plus its `assets/` directory, or use the standalone `render-inline.html`.

## Local Recipe Catalog

Recipe files own content; `tools/catalog.sql` is the canonical identity ledger, loaded into
in-memory SQLite by `tools/catalog.mjs`. The seeded identities are `nutrition@1.0.0` and
`solar-system@1.0.0`: an immutable slug and an exact `MAJOR.MINOR.PATCH` version bound to SHA-256
digests of declared files. There is no serial number; a recipe is identified by `slug@semver`.
Older versions remain ledger history; their content is retained in git.

Run from the repository root on Node with built-in `node:sqlite` available (verified on v22.22.3):

| Command | Successful result | Exit |
|---|---|---|
| `node tools/catalog.mjs list` | List recipe identities and statuses | 0 |
| `node tools/catalog.mjs show nutrition` | Show identity, versions, files and outputs | 0 |
| `node tools/catalog.mjs show solar-system` | Look up Solar System by slug | 0 |
| `node tools/catalog.mjs publish nutrition 1.0.0` | Unchanged publication succeeds as a no-op | 0 |
| `node tools/catalog.mjs verify` | Current module versions are published, declared files match, dump is canonical | 0 |
| `node tools/catalog.mjs export --check` | Check canonical dump bytes without rewriting | 0 |

Exit **1** means validation, I/O or drift failure (including changed content under a published
version, missing/modified declared files, or a non-canonical dump); exit **2** means usage error
(for example, `node tools/catalog.mjs lsit`). `export --check` checks dump serialization, while
`verify` also checks current recipe content. `list`, `show` and `verify` accept `--json`.
On the verified Node line, catalog commands emit `ExperimentalWarning: SQLite is an experimental
feature and might change at any time` on stderr; this warning also occurs when rendering loads
the catalog and does not itself indicate failure.

Catalog writes are local operator actions: `add`, `publish`, `update`, `deprecate`, `retire` and
`import` are not tenant or render API/MCP operations. Writes use an exclusive lock and atomic dump
replacement; a stale lock requires operator inspection and is never broken automatically.
`publish <slug> <version>` requires the module's exact exported version. Publishing identical
content again succeeds; changed content requires a new version. Bump **patch** when content changes
but all previously admitted requests remain byte-identical, **minor** for additive capabilities
with those artifacts unchanged, and **major** for changed prior artifacts or a narrower schema.

Render receipts record slug, exact module version, published content digest and verification
status; missing, unpublished or drifted catalog content records `verified: false` with a reason
and leaves local rendering available. Use `verify` to enforce catalog integrity. Variants, slug
aliases/renames and semver range resolution are deferred.

### Designs

Designs are insert-only records in the same catalog, identified by `YYYY-MM-DD-slug`.
An edit forks a new design ID; there is no design update or delete command. Each record hashes
the fixture JSON and PNG artifact and optionally pins a published use case as `slug@semver`.
Solar System is seeded with `solar-system@1.0.0`; RAG and cell-division have a null use case
because they are hand-built scripts with no recipe.

| Command | Successful result | Exit |
|---|---|---|
| `node tools/catalog.mjs design list` | List recorded designs | 0 |
| `node tools/catalog.mjs design show 2026-10-08-solar-system` | Show a design by ID (`design show <id>`) | 0 |
| `node tools/catalog.mjs design add 2026-10-10-rag-study --fixture examples/2026-10-09-rag-system/fixture.json --artifact examples/2026-10-09-rag-system/rag-system.png --friction 'Hand-built lanes and connectors; no recipe.'` | Record a new ID and append its log line | 0 |

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

The dump and the log are two separate file writes (dump first, then the log line), not one
transaction. If the log append fails, run `node tools/catalog.mjs verify`, restore the affected dump or
log from version control, and retry; a repeated `design add` refuses an ID the dump already holds.
A malformed design row (for example an invalid ID or an unpublished pin) makes the whole catalog fail
to load, so recipe receipts then report `verified: false`; only design errors that `verify` returns
for a structurally loadable catalog are isolated from recipe verification.

Phase B is deferred: the grid parser and canonical form, pixel geometry, `layouts` and
`use_case_layouts`, filling `layout_id`, deriving grid counts/span histograms, responsive
stacking and SPECS-PRD §6.6; layout IDs and derived grid fields remain null.

## Capabilities and Limits

- **Inputs and Area**: 
  - Fixture JSON size is strictly bounded to a maximum of 256 KiB.
  - Per-image limits: maximum of 5 MiB and 16,777,216 pixels.
  - Aggregate scene limits: maximum of 35 MiB encoded, 16,777,216 pixels, and a total render area of 16,777,216 pixels.
  - Total published bytes across an export cannot exceed 64 MiB.
- **Artifact Exports**: 
  - **PNG**: Rasterized via Satori + resvg, or explicitly selected Playwright/Chromium (`--backend playwright`); there is no automatic backend switch.
  - **SVG**: Accurate vector layout via Satori, retaining embedded raster artwork inside `image` nodes.
  - **HTML**: Compact offline export containing the `render.html` and locally copied `assets/` keyed by SHA-256. `html-inline` embeds assets directly into the HTML document.
- **Fitting and Diagnostics**: 
  - Adaptive text fitting searches for a valid shrink down to 12px within a maximum of 10 iteration bounds. Non-fit exhaustion cleanly halts.
  - Hard stage timeouts are not implemented yet. Subprocesses/workers are conditional on strict hard interruption demands (e.g., hanging rasterization bounds). An event-loop timer cannot enforce synchronous rasterization limits. Hard timeouts and worker execution limits remain unsupported.
- **Geometry and Backend Restrictions**:
  - The delivered recipe-owned canvases are nutrition 1000×1000 and Solar System 2400×1700, scale 1. Other dimensions and scale are explicitly rejected.
  - Playwright supports PNG and HTML but explicitly rejects SVG format generation.
- **Unsupported Workloads**: 
  - CJK (Chinese, Japanese, Korean) and Emoji characters are not covered by the default pinned font (Inter) and will not render properly without explicit fallback font pinning.
  - Arbitrary remote HTTP asset fetching, multi-tenant isolation, SSRF protection, private caches, and durable service queues are currently in the **Later** queue. We do not ship half-services; they remain disabled in local workflows.
- **External Caller Prerequisite (Optional Generation)**:
  - Generation requires a POSIX environment with Python 3, Node, a deployed HiQS caller entry point with credentials, and a matching recipe manifest (`caller.parent.parent/assets/image-manifest.json`). Exact deployed caller revision is currently [Unverified].
  - Expected calls with sufficient budget: thirteen default generation jobs (of which eleven are display derivatives). Zero calls for unchanged complete resume, one for a single changed admitted asset. Unknown or corrupt states are refused rather than automatically replayed (explicitly authorized replacement required). Generator defaults to 11 calls max, 220s per call, 900s per run, and 3 workers, with remote-unknown limitations.
  - Safe dry-run testing (no paid calls) with a sufficient cap:
    ```sh
    mkdir -p .relay-scratch/assets-test
    python3 -B examples/2026-10-08-solar-system/generate-assets.py --caller <external-entrypoint> --assets-dir .relay-scratch/assets-test --dry-run --max-calls 13
    ```
    *Note: The generator defaults to a cap of 11. If the planned batch (13 default jobs) exceeds the configured `--max-calls`, the generator safely refuses the batch (exit code 4) and performs zero dispatches, even in dry-run mode. A cap-zero command (`--max-calls 0`) is a refusal control test.*

## Dependency and Font Notices

- **Host/Runtime**: Measured on Node v22.22.3, pnpm 12.4.1, darwin-arm64 with honest portability limits.
- **Pinned Fonts**: Uses Inter 4.0 ([OFL-1.1 license](tools/spike/assets/OFL.txt), source: [SOURCES.md](tools/spike/assets/SOURCES.md)).
- **Renderer Packages**: `satori@0.36.0` and `@resvg/resvg-js@2.6.2` (MPL-2.0).
- **Chromium / Playwright**: `playwright@1.64.0` (Apache-2.0). Chrome for Testing (via Playwright) third-party terms/notices (chrome://credits) are pending review. Chromium is **not** packaged or distributed by default until terms are fully verified. Dependency license evidence is retained in [tools/spike/REPORT.md](tools/spike/REPORT.md).
