---
name: hallmark
description: Inspect, extract, and adapt Hallmark layout macrostructures and editorial themes from an external clone into native XYZ Layout Engine recipes, validate with craft-lint, and render offline. Use for reading Hallmark designs or building macrostructure-driven layouts in this repository.
---

# Hallmark Layout & Theme Skill

This skill guides agents in dynamically reading, adapting, and rendering layout macrostructures and color themes from an external Hallmark repository clone (`hallmark-fork`) into XYZ Layout Engine without runtime bloat or baking external templates into this repository.

## Prerequisites & Grounding

1. **External Checkout Required**:
   An existing Hallmark clone is required (e.g. `~/Documents/GH Repos/hallmark-fork`). The reader accepts an explicit path via `--from <path-to-hallmark>`, checks `process.env.HALLMARK_PATH`, or falls back to `../hallmark`. If no checkout exists, it fails fast with an error. There are no built-in fallbacks or baked-in presets.
2. **Governing Contracts & Rules**:
   Before authoring or modifying any layout, read [SYSTEM-INSTRUCTIONS.md](../../SYSTEM-INSTRUCTIONS.md) (`AS-1` through `AS-14`), [design-intake contract](../../tools/recipes/design-intake.contract.md), and [skills/design-intake/SKILL.md](../design-intake/SKILL.md). Reference existing worked examples:
   - [examples/2026-11-09-hallmark-bento/fixture.json](../../examples/2026-11-09-hallmark-bento/fixture.json)
   - [examples/2026-10-12-design-intake/fixture.json](../../examples/2026-10-12-design-intake/fixture.json)

---

## Chained Workflow for Agents

### Step 1: Discover Macrostructures and Themes
Query the dynamic Hallmark CLI to inspect the external clone's inventory:
```sh
# List both macrostructures and themes from the external clone (returns JSON)
node tools/hallmark.mjs --from ~/Documents/GH\ Repos/hallmark-fork list

# Inspect a specific macrostructure by slug (returned from list, e.g. "01-bento-grid")
node tools/hallmark.mjs --from ~/Documents/GH\ Repos/hallmark-fork macro 01-bento-grid

# Inspect a specific theme by slug (returned from list, e.g. "riso")
node tools/hallmark.mjs --from ~/Documents/GH\ Repos/hallmark-fork theme riso
```
*Note: Always retain the same `--from <path>` argument across commands. Inventory counts depend on the external checkout.*

### Step 2: Author the `design-intake` Fixture
Translate the selected macrostructure geometry and theme tokens into a native `fixture.json` matching `tools/recipes/design-intake.contract.md`:
- **Capabilities Check**: Run `node tools/intake.mjs capabilities` to confirm supported features. Map requirements with quotes; record unsupported features as `status: "unsupported"` rather than inventing fields or substituting fonts.
- **Canvas Dimensions**: Set standard aspect ratios (e.g. $1200 \times 1200$ square, $1200 \times 1600$ portrait, $2800 \times 1600$ landscape spread).
- **Settings & Palette**: Map theme colors to 6-digit hex palette roles (`paper`, `ink`, `accent`, `secondary`, `subtle`). Use repository-supported fonts (e.g. Barlow Condensed); never copy arbitrary CSS classes or external web font URLs into the intake recipe.
- **Typography Ramp**: Calculate font sizes strictly per `AS-12` from $S = \min(\text{width}, \text{height})$:
  - Headline: $7\text{--}10\%$ of $S$ ($84\text{--}120\text{px}$ at $S = 1200\text{px}$), never below $6\%$.
  - Body / caption floor: $1.8\%$ of $S$ ($\approx 22\text{px}$ at $S = 1200\text{px}$), never below $1.5\%$.
  - Headline : body ratio $\ge 4:1$.
  - At most 4 distinct font sizes on canvas.
  - Refer to [SYSTEM-INSTRUCTIONS.md](../../SYSTEM-INSTRUCTIONS.md) (`AS-12`) for exact role percentages and measured before/after reporting requirements.
- **Elements**: Position structured cards/rectangles, non-overlapping text regions, and image cutouts following the macrostructure layout zones.

### Step 3: Craft Lint & Preflight Verification
Verify the fixture adheres to structural contracts and anti-slop craft invariants before rendering:
```sh
# Run intake check with integrated craft-lint
node tools/intake.mjs check <path-to-fixture.json> --craft
```
Lint boundaries & exit semantics:
- **Errors exit 1**: Fixture must produce 0 errors across `no-nested-cards`, `elevation-singularity`, `no-side-stripe-borders`, and `typography-ramp` (all font sizes integer $\ge 12\text{px}$).
- **No errors exits 0**: Review all warnings (`no-empty-decorative-plates`); empty plates must serve intentional full-canvas background surfaces rather than accidental empty containers.
- **Scope & Limitations**: `craft-lint.mjs` executes only when `Array.isArray(fixture.elements)` is true. It is a structural anti-slop heuristic, not a schema validator or visual certifier. Always run `node tools/intake.mjs check <fixture> --craft` for complete contract admission. Verify AS-12 proportional percentages and the 4-size canvas cap mathematically.

### Step 4: Dual-Backend Rendering
Render through both Satori and Playwright Chromium backends to produce standard publication artifacts:
```sh
# 1. Satori render (PNG, SVG, HTML)
node tools/render.mjs <path-to-fixture.json> \
  --backend satori \
  --format png,svg,html,html-inline \
  --out <output-dir>/satori

# 2. Playwright Chromium render (PNG, HTML)
node tools/render.mjs <path-to-fixture.json> \
  --backend playwright \
  --format png,html,html-inline \
  --out <output-dir>/playwright
```
*Note: The renderer publishes artifacts under `<output-dir>/runs/<id>` and atomically records `current: "runs/<id>"` in `<output-dir>/manifest.json`.*

### Step 5: Verification & Visual Inspection
Complete publication verification on the generated outputs:
1. **Publication Verification**: Call `verifyPublication()` on each backend export root to confirm valid manifest digests, `validation.valid: true`, and `fitting.fit: true`:
   ```js
   import path from 'node:path';
   import { selectedRun, verifyPublication } from './tools/render.mjs';

   // Verify integrity of each export root
   await verifyPublication('<output-dir>/playwright');
   await verifyPublication('<output-dir>/satori');

   // Deterministically resolve the active run directory (joins root + manifest.current)
   const activeRunDir = selectedRun('<output-dir>/playwright');
   const activeHtml = path.join(activeRunDir, 'render-inline.html');
   ```
2. **Deterministic Manifest Resolution**: Note that `manifest.json.current` already contains `"runs/<id>"`. If resolving paths manually without `selectedRun()`, join `path.join(exportRoot, manifest.current, 'render-inline.html')`; never duplicate `runs/`.
3. **Visual Review**:
   - Check mobile $1/3$-scale legibility ($400\text{px}$ viewport width).
   - Check thumbnail squint hierarchy (headline, section labels, body tiers).
   - Verify offline standalone bundling (`render-inline.html`) opens with zero network requests.
4. **No Direct HTML Editing**: If visual or layout defects are found, update `fixture.json` and rerender; never hand-edit exported HTML.
