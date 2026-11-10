---
name: impeccable
description: Apply Impeccable craft floor invariants, steering verbs, deterministic anti-slop linting, headless HTML auditing, and editorial asset exports to XYZ Layout Engine publications. Use when refining layouts, linting recipe craft, auditing rendered HTML, or exporting isolated components for web apps.
---

# Impeccable Craft & Steering Skill

This skill guides agents in applying Impeccable's design discipline, deterministic craft linter, headless HTML auditing, and editorial component exporter within XYZ Layout Engine.

## Prerequisites & Grounding

Before authoring, refining, or auditing any layout, read [SYSTEM-INSTRUCTIONS.md](../../SYSTEM-INSTRUCTIONS.md) (`AS-1` through `AS-14`) and [tools/recipes/design-intake.contract.md](../../tools/recipes/design-intake.contract.md). Always observe:
- **Baseline Rule Set**: All layouts must follow `AS-1` through `AS-12` (single focal point, mathematical type ramp from $S = \min(\text{width}, \text{height})$, contrast floors, no overlapping texts).
- **Steering Rules (`AS-13`)**: Use explicit steering verbs rather than arbitrary tweaks.
- **Craft Invariants (`AS-14`)**: Follow anti-slop constraints (no nested cards, elevation singularity, no side stripe borders, typography ramp floor).

---

## Chained Workflow for Agents

### Step 1: Steer Recipe Refinements (`AS-13`)
When the operator or a review turn asks to modify or refine an existing layout, map the request to one of the 4 canonical steering verbs rather than ambiguous adjustments:
- **`distill`**: Strip secondary boxes, remove container borders, delete filler copy, and let white space and typographic scale establish visual hierarchy.
- **`bolder`**: Increase scale contrast (expand headline scale toward the upper 10% limit of $S$, punch dominant darks, widen outer margins for editorial drama).
- **`quieter`**: Tone down saturated colors, soften rules into subtle hairlines, increase line-heights, and add air between sections.
- **`typeset`**: Snap all text sizes strictly to the $\% \text{ of } S$ scale (max 4 distinct sizes on canvas), align cap-heights to baselines, and balance paragraph measure ($40\text{--}60\text{ch}$).

### Step 2: Deterministic Anti-Slop Linting (`AS-14`)
Before rendering, execute the deterministic craft linter to ensure the layout contains no subconscious AI slop patterns:
```sh
# Run standalone craft linter
node tools/craft-lint.mjs <path-to-fixture.json>

# Or run through intake preflight
node tools/intake.mjs check <path-to-fixture.json> --craft
```
Understand the linter's exact boundaries and exit semantics:
1. `no-nested-cards`: **Error (exit 1)** if card containers nested $\ge 2$ levels deep with duplicate border and fill framing.
2. `elevation-singularity`: **Error (exit 1)** if explicit `border` and diffuse `box-shadow` coexist on the same card/box.
3. `no-side-stripe-borders`: **Error (exit 1)** if asymmetric colored side borders (e.g. 3px left stripe) occur on rounded cards.
4. `typography-ramp`: **Error (exit 1)** if any font size in `settings.type` is non-integer or $< 12\text{px}$. *Note: Does NOT mathematically enforce AS-12 proportional percentages or the 4-size canvas cap; verify these independently.*
5. `no-empty-decorative-plates`: **Warning (exit 0)** when a rect element contains neither text nor imagery. Review all warnings to ensure plates serve deliberate background functions.

### Step 3: Render Publications
Before auditing or exporting assets, render publications using the standard dual-backend pipeline:
```sh
node tools/render.mjs <path-to-fixture.json> \
  --backend satori \
  --format png,svg,html,html-inline \
  --out dist/renders/satori

node tools/render.mjs <path-to-fixture.json> \
  --backend playwright \
  --format png,html,html-inline \
  --out dist/renders/playwright
```
*Note: Renders are published under `<out-dir>/<backend>/runs/<id>` and atomically pointed to by `manifest.json.current`.*

### Step 4: Headless HTML Quality Auditing
Audit the active publication's rendered HTML using the headless audit tool:
```sh
# Audit the specific active HTML file identified from manifest.json current run
node tools/impeccable/audit.mjs dist/renders/playwright/runs/<current-id>/render-inline.html [--json]

# Or audit an explicit run directory
node tools/impeccable/audit.mjs dist/renders/playwright/runs/<current-id>
```
Audit execution rules & boundaries:
- **Deterministic File Resolution**: Target the explicit run directory or HTML file indicated by `manifest.json.current`. Avoid pointing at a top-level parent folder that contains multiple historical runs.
- **Detector Prerequisites & Network Decisions**: The wrapper checks local binary discovery (`process.env.IMPECCABLE_BIN`, `~/.impeccable/bin/impeccable`, or system `impeccable`). If absent, it falls back to `npx --yes impeccable detect`. In offline or sandbox environments, obtain an explicit operator decision before allowing network download.
- **Reporting & Evidence**: Report runner used (`native-binary` vs `npx`), detector version, exit code, and actual findings. If the detector is unavailable, report the audit as unverified/blocked.
- **Visual Inspection Is Authoritative**: An automated HTML audit does not replace visual inspection of both PNGs across full-size, thumbnail squint, and mobile $400\text{px}$ viewports. Never hand-edit exported HTML.

### Step 5: Exporting Editorial Assets for External Web Apps
When an external web application (React, Next.js, Vite, static site) needs an isolated graphic, infographic card, or badge rather than a full page:
```sh
# Export a cropped element at 2x Retina scale with transparent background
node tools/export-editorial-asset.mjs <path-to-fixture.json> \
  --element <element-id> \
  --scale 2 \
  --format png \
  --out <output-path>.png

# Export entire graphic as transparent vector SVG
node tools/export-editorial-asset.mjs <path-to-fixture.json> \
  --format svg \
  --scale 1 \
  --out <output-path>.svg
```
The exporter emits the cropped asset (cropping the rendered canvas scene per bounds) and outputs ready-to-paste responsive markup:
```html
<img src="asset.png" width="624" height="504" alt="Editorial Asset" loading="lazy" decoding="async" />
```
