---
name: impeccable
description: Apply Impeccable craft floor invariants, steering verbs, deterministic anti-slop linting, headless HTML auditing, and editorial asset exports to XYZ Layout Engine publications. Use when refining layouts, linting recipe craft, auditing rendered HTML, or exporting isolated components for web apps.
---

# Impeccable Craft & Steering Skill

This skill guides agents in applying Impeccable's design discipline, deterministic craft linter, headless HTML auditing, and editorial component exporter within XYZ Layout Engine.

## Chained Workflow for Agents

### Step 1: Steer Recipe Refinements (`AS-13`)
When the operator or a review turn asks to modify or refine an existing layout, map the request to one of the 4 canonical steering verbs rather than ambiguous adjustments:
- **`distill`**: Strip secondary boxes, remove container borders, delete filler copy, and let white space and typographic scale establish visual hierarchy.
- **`bolder`**: Increase scale contrast (expand headline scale toward the upper 10% limit of $S$, punch dominant darks, widen outer margins for editorial drama).
- **`quieter`**: Tone down saturated colors, soften rules into subtle hairlines, increase line-heights, and add air between sections.
- **`typeset`**: Snap all text sizes strictly to the $\% \text{ of } S$ scale (max 4 distinct sizes on canvas), align cap-heights to baselines, and balance paragraph measure ($40\text{--}60\text{ch}$).

### Step 2: Deterministic Anti-Slop Linting (`AS-14`)
Before committing or rendering a fixture, execute the deterministic craft linter to ensure the layout contains no subconscious AI slop patterns:
```sh
# Run standalone craft linter
node tools/craft-lint.mjs <path-to-fixture.json>

# Or run through intake preflight
node tools/intake.mjs check <path-to-fixture.json> --craft
```
The linter strictly checks:
1. `no-nested-cards`: Rejects card containers nested $\ge 2$ levels deep with duplicate border and fill framing.
2. `elevation-singularity`: Disallows simultaneous explicit `border` and diffuse `box-shadow` on the same card/box.
3. `no-side-stripe-borders`: Disallows asymmetric colored side borders (e.g. 3px left stripe) on rounded cards.
4. `typography-ramp`: Validates font sizes against the $12\text{px}$ floor and proportional integer steps.
5. `no-empty-decorative-plates`: Flags empty rectangular boxes containing neither text nor imagery.

### Step 3: Headless HTML Quality Auditing
After rendering, run a headless HTML audit using Impeccable's 62-rule detector on the exported HTML:
```sh
# Audit a rendered publication directory (finds render.html or render-inline.html)
node tools/impeccable/audit.mjs <path-to-renders-dir>

# Or run directly on an exported file
node tools/impeccable/audit.mjs dist/render-inline.html [--json]
```
Checks WCAG AA contrast ratios, cramped padding, font size floors, and visual bounding tension.

### Step 4: Exporting Editorial Assets for External Web Apps
When an external web application (built in React, Next.js, Vite, etc.) needs an isolated high-DPI graphic, infographic card, or badge rather than a full poster:
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
The exporter emits the processed asset alongside ready-to-paste responsive `<img>` markup:
```html
<img src="asset.png" width="624" height="504" alt="Editorial Asset" loading="lazy" decoding="async" />
```
