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
  - Expected calls with sufficient budget: eleven for fresh default jobs, zero for unchanged complete resume, one for a single changed admitted asset. Unknown or corrupt states are refused rather than automatically replayed (explicitly authorized replacement required). Generator defaults to 11 calls max, 220s per call, 900s per run, and 3 workers, with remote-unknown limitations.
  - Safe dry-run testing (no paid calls):
    ```sh
    mkdir -p .relay-scratch/assets-test
    python3 -B examples/2026-10-08-solar-system/generate-assets.py --caller <external-entrypoint> --assets-dir .relay-scratch/assets-test --dry-run --max-calls 0
    ```

## Dependency and Font Notices

- **Host/Runtime**: Measured on Node v22.22.3, pnpm 12.4.1, darwin-arm64 with honest portability limits.
- **Pinned Fonts**: Uses Inter 4.0 ([OFL-1.1 license](tools/spike/assets/OFL.txt), source: [SOURCES.md](tools/spike/assets/SOURCES.md)).
- **Renderer Packages**: `satori@0.36.0` and `@resvg/resvg-js@2.6.2` (MPL-2.0).
- **Chromium / Playwright**: `playwright@1.64.0` (Apache-2.0). Chrome for Testing (via Playwright) third-party terms/notices (chrome://credits) are pending review. Chromium is **not** packaged or distributed by default until terms are fully verified. Dependency license evidence is retained in [tools/spike/REPORT.md](tools/spike/REPORT.md).
