# XYZ Layout Engine

XYZ Layout Engine is a deterministic layout and rendering engine written in TypeScript. It converts structured data (JSON) into raster (PNG) or vector (SVG, HTML) images using versioned layout recipes.

## Install and Offline Workflow

XYZ Layout Engine supports a fully offline, self-contained workflow. Once the repository and dependencies are installed, you can render, edit, and export without any remote network calls or paid API usage.

1. **Install dependencies:**
   ```sh
   pnpm install --frozen-lockfile
   ```

2. **Render a baseline fixture (Nutrition):**
   ```sh
   # Render an offline fixture to PNG, SVG, and HTML
   cp tools/spike/fixture.json .relay-scratch/nutrition-edit.json
   node tools/render.mjs .relay-scratch/nutrition-edit.json --format png,svg,html,html-inline --out .relay-scratch/nutrition-export
   ```

3. **Durable edits and rerender (Solar System):**
   ```sh
   # Copy and perform a schema-validated edit on the JSON fixture
   cp examples/2026-10-08-solar-system/fixture.json .relay-scratch/solar-edit.json
   node tools/render.mjs .relay-scratch/solar-edit.json --recipe solar-system --set 'planets.0.labelX=830' --save .relay-scratch/solar-edit.json --format svg --out .relay-scratch/solar-export
   ```
   *Edits made via `--set` are durable when combined with `--save`. Rendering without `--save` produces a transient preview export without mutating the original JSON.*

## Capabilities and Limits

- **Inputs and Area**: 
  - Fixture JSON size is strictly bounded to a maximum of 256 KiB.
  - Per-image limits: maximum of 5 MiB and 16,777,216 pixels.
  - Aggregate scene limits: maximum of 35 MiB encoded, 16,777,216 pixels, and a total render area of 16,777,216 pixels.
  - Total published bytes across an export cannot exceed 64 MiB.
- **Artifact Exports**: 
  - **PNG**: Rasterized via Satori + resvg, or Chromium as a fallback.
  - **SVG**: Accurate vector layout via Satori, retaining embedded raster artwork inside `image` nodes.
  - **HTML**: Compact offline export containing the `render.html` and locally copied `assets/` keyed by SHA-256. `html-inline` embeds assets directly into the HTML document.
- **Fitting and Diagnostics**: 
  - Adaptive text fitting searches for a valid shrink down to 12px within a maximum of 10 iteration bounds. Non-fit exhaustion cleanly halts.
  - Hard stage timeouts limit runaway rendering. Subprocesses/workers are conditional on strict hard interruption demands (e.g., hanging rasterization bounds). An event-loop timer cannot enforce synchronous rasterization limits.
- **Unsupported Workloads**: 
  - CJK (Chinese, Japanese, Korean) and Emoji characters are not covered by the default pinned font (Inter) and will not render properly without explicit fallback font pinning.
  - Arbitrary remote HTTP asset fetching, multi-tenant isolation, SSRF protection, private caches, and durable service queues are currently in the **Later** queue. We do not ship half-services; they remain disabled in local workflows.

## Dependency and Font Notices

- **Pinned Fonts**: Uses Inter 4.0 (OFL-1.1 license).
- **Renderer Packages**: `satori` and `@resvg/resvg-js` (MPL-2.0). 
- **Chromium / Playwright**: Chrome for Testing (via Playwright) third-party terms/notices are pending review. Chromium is **not** packaged or distributed by default until terms are fully verified.
