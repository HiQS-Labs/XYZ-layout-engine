---
name: hallmark
description: Inspect, extract, and adapt Hallmark layout macrostructures (21) and editorial themes (50) from an external clone into native XYZ Layout Engine recipes, validate with craft-lint, and render offline. Use for reading Hallmark designs or building macrostructure-driven layouts in this repository.
---

# Hallmark Layout & Theme Skill

This skill guides agents in dynamically reading, adapting, and rendering layout macrostructures and color themes from an external Hallmark repository clone (`hallmark-fork`) without baking external dependencies into XYZ Layout Engine.

## Chained Workflow for Agents

### Step 1: Discover Available Macrostructures and Themes
Query the dynamic Hallmark reader harness to inspect available macrostructures and themes:
```sh
# List all 21 macrostructures
node tools/hallmark.mjs list-macro [--from <path-to-hallmark-fork>]

# List all 50 themes
node tools/hallmark.mjs list-themes [--from <path-to-hallmark-fork>]

# Inspect a specific macrostructure or theme
node tools/hallmark.mjs show-macro "01 · Bento Grid"
node tools/hallmark.mjs show-theme "Riso"
```
*Note: If `--from` is omitted, `tools/hallmark.mjs` checks `process.env.HALLMARK_PATH` or resolves default local clone paths, falling back to core built-in definitions.*

### Step 2: Author the `design-intake` Fixture
Translate the selected macrostructure geometry and theme tokens into a native `fixture.json`:
- **Canvas Dimensions**: Set standard aspect ratios (e.g. $1200 \times 1200$ square, $1200 \times 1600$ portrait, $2800 \times 1600$ landscape spread).
- **Settings**: Map theme palette colors (`paper`, `ink`, `accent`, `secondary`, `subtle`) and typography scale computed from $S = \min(\text{width}, \text{height})$ per `AS-12`.
- **Elements**: Position structured cards/rectangles, text regions, and image cutouts following the macrostructure layout zones.

### Step 3: Craft Lint & Preflight Verification
Verify the fixture adheres to structural contracts and anti-slop craft invariants before rendering:
```sh
# Run intake check with integrated craft-lint
node tools/intake.mjs check <path-to-fixture.json> --craft
```
Ensure:
- 0 unsupported requirements.
- 0 craft errors (`no-nested-cards`, `elevation-singularity`, `no-side-stripe-borders`, `typography-ramp`).

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

### Step 5: Visual Inspection
Inspect the generated outputs across both backends:
- Check mobile $1/3$-scale legibility ($400\text{px}$ viewport width).
- Check thumbnail squint hierarchy (headline, section labels, body tiers).
- Verify offline HTML standalone bundling (`render-inline.html`) opens with zero network requests.
