# How XYZ Layout Engine Assembles a Poster — Rebuild & Editing Notes

## Deliverables
- `output/index.html` — self-contained offline HTML (`1500 × 1000`, embedded Barlow Condensed fonts and base64 artwork, zero external requests or runtime scripts).
- `output/poster.png` — presentation PNG (`1500 × 1000`) captured directly from `output/index.html` via Playwright Chromium.
- `output/content.json` — editable source for all titles, badges, captions, and pipeline annotations.
- `output/build.mjs` — one-command static HTML + PNG generator using only Node.js built-ins and the supplied Playwright/Chromium runtime.

## One-command rebuild
From the packet root (even after `output/index.html` and `output/poster.png` are removed or moved aside):

```bash
node output/build.mjs
```

`build.mjs` reads `output/content.json` alongside the packet’s read-only inputs (`nutrition/fixture.json`, `nutrition/render.png`, `nutrition/render-inline.html`, `nutrition/assets/web/*.png`, and `fonts/BarlowCondensed-*.ttf`), writes `output/index.html`, and renders `output/poster.png` at native `1500 × 1000` dimensions.

## Editing captions
1. Open `output/content.json` and edit any caption, badge, or label (for example `header.subtitle`, `inputs.words.caption`, or `stage.depthNote`).
2. Re-run `node output/build.mjs`.
3. Both `output/index.html` and `output/poster.png` update with the new visible text.

## Editing notes: the key visual decision
**Exploding the actual `"Fuel Well. Live Well."` poster into three 3D-perspective planes wired directly to the three editable source files (`fixture.json`, `leaf_glow.png`, and `source/nutrition.mjs`)** is the single visual decision that most helps a first-time viewer understand XYZ Layout Engine.

Instead of describing layers abstractly, each tilted glass/paper plane renders authentic poster elements at their exact proportional `1000 × 1000` recipe coordinates:
- **Plane 1 (Canvas & CSS Grid)** isolates the warm cream radial backdrop, CSS flexbox containers, and ground cast shadows.
- **Plane 2 (Fixture Copy)** isolates `"FUEL WELL. LIVE WELL."` and icons, with an emerald leader wire linking directly back to `sections.header.headline` in `nutrition/fixture.json` (placed cleanly above Plane 3 so the headline stays unobstructed).
- **Plane 3 (Artwork & Coordinates)** floats the transparent cutouts—including `leaf_glow.png`—with amber architectural dimension rulers (`left: 262`, `top: -34`, `428 × 640`) drawn right on the plane in perspective, visually showing why increasing `left` slides the leaf right and why negative `top: -34` pulls it upward into the header band.

The three planes converge into the upright assembled poster on the right, while the lower band separates **Node.js render-time execution + inline CSS generation**, the **two parallel render backends** (`Satori → SVG → resvg → PNG` and `Playwright → Chromium → PNG capture`, with a shared rail proving either backend exports offline HTML via `toDocument()`), and a **side-by-side viewer comparison** contrasting selectable live text (blue highlight + I-beam cursor in offline HTML) against flattened raster pixels (magnified pixel-grid loupe in PNG).

## Asset provenance
No paid credits, external network resources, or generated images (Higgsfield or otherwise) were used. Every font, illustration, icon, shadow, and poster render is embedded directly from the supplied packet inputs using local Node.js and Playwright/Chromium.
