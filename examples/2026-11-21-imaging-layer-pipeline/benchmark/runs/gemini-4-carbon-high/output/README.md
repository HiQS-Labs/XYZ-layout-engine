# How a Poster Is Assembled — Editing & Build Notes

## Deliverables
- `output/poster.png` — `1600 × 1200` presentation PNG (`~0.95 MiB`, 4:3 aspect ratio).
- `output/index.html` — `1600 × 1200` self-contained offline HTML (`~6.73 MiB`, embedded `Barlow Condensed` TTFs, PNGs, and SVGs as `data:` URIs; zero external network requests; zero runtime scripts).
- `output/captions.json` — Editable captions, badges, and section headings rendered in both outputs.
- `output/template.mjs` — Editable layout, CSS styling, 4-plane axonometric projection (`matrix(0.242, -0.066, 0, 0.432, X0, Y0)`), and vector leader overlay.
- `output/build.mjs` — Deterministic single-command build script using the supplied Node.js + Playwright/Chromium runtime.

## One-Command Rebuild
From the packet root (`gemini-4-carbon-high/`):

```bash
node output/build.mjs
```

If `output/poster.png` and `output/index.html` are moved aside or deleted, running `node output/build.mjs` regenerates both deliverables identically from the editable source (`output/captions.json` + `output/template.mjs`) and the preserved packet inputs (`nutrition/`, `fonts/`).

## Editing Captions or Layout
1. **Change any caption, badge, or heading:** Edit the corresponding string in `output/captions.json` (for example `cards.headline.caption`, `cards.artwork.caption`, `cards.placement.caption`, `viewer.caption`, or any stage under `pipeline`) and run `node output/build.mjs`. Both `output/index.html` and `output/poster.png` update immediately.
2. **Adjust visual layout, plane angles, or callout arrows:** Edit `output/template.mjs` and re-run `node output/build.mjs`.

## Key Visual Decision
**Separating the `1000 × 1000` nutrition poster into four axonometric glass planes (`L1 Backdrop` → `L2 Grounded Items & Shadows` → `L3 Absolute Hero Leaf with live 262 / -34 calipers` → `L4 Open-Center Flexbox Typography`) directly linked to three color-coded edit cards (`Amber = Words`, `Emerald = Artwork`, `Cyan = Placement`).**

Why this decision helps first-time viewers most:
- On a flat poster, a newcomer cannot tell why editing `sections.header.headline` reflows Flexbox text safely while moving `hero_img` (`left: 262, top: -34, width: 428, height: 640`) never pushes neighboring items aside.
- Seeing **Plane L4's Flexbox text rows form an open window around the center** while **Plane L3's glowing leaf floats on its own independent coordinate plane behind that window** makes the architectural division between content data (`nutrition/fixture.json`), swappable transparent artwork (`leaf_glow.png`), and render-time Node.js scene geometry (`source/nutrition.mjs`) self-evident even before reading a single sentence of prose.
- Pairing the assembled poster on the right with **matching side-by-side `"WELL."` loupes**—live highlighted selectable DOM text (`render-inline.html`) next to a `4×` nearest-neighbor crop of native pixels from `nutrition/render.png`—makes the viewer-experience difference between offline HTML and raster PNG unmistakable at a glance.

## Asset Generation & Budget Record
- **Paid generation used:** None (`$0` / `0` credits spent). All visuals use the supplied packet assets (`nutrition/fixture.json`, `nutrition/render.png`, `nutrition/render-inline.html`, `nutrition/assets/web/*.png`, `fonts/BarlowCondensed-*.ttf`) and local HTML/CSS/SVG/Canvas tooling.
