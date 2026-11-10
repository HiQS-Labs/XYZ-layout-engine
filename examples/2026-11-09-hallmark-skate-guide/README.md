# Hallmark Skate Guide Example (Narrative Workflow · Broadside Theme)

Demonstrates importing layout and theme intelligence from [Nutlope/hallmark](https://github.com/nutlope/hallmark) into XYZ Layout Engine, rebuilding the `temp/2026-11-09-skate-guide/` workflow layout into a canonical production example.

## Specifications

- **Macrostructure**: `14 · Narrative Workflow` (Step-by-step sequential workflow with featured hero callout and numbered progression cards)
- **Theme**: `Broadside` (Unbleached buff stock `#ede6d6`, dense charcoal ink `#1c1917`, vermilion red signal `#c83228`, muted gray `#57534e`, structural tint `#e4dcce`)
- **Canvas**: $1200 \times 1600\text{px}$ portrait canvas on a $24\text{px}$ spacing grid
- **Typography**: Bundled `Barlow Condensed` (display: 54px/700, body: 24px/400, proportional `% of S` type scale)
- **Asset**: Transparent cutout skateboard PNG (`assets/board.png`, non-interlaced RGBA)
- **Adherence**: Fully conforms to `SYSTEM-INSTRUCTIONS.md` (AS-1 through AS-12)

## Offline Render Commands

```bash
# Preflight validation
node tools/intake.mjs check examples/2026-11-09-hallmark-skate-guide/fixture.json

# Satori export (PNG, SVG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-skate-guide/fixture.json --backend satori --format png,svg,html,html-inline --out examples/2026-11-09-hallmark-skate-guide/renders/satori

# Playwright export (PNG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-skate-guide/fixture.json --backend playwright --format png,html,html-inline --out examples/2026-11-09-hallmark-skate-guide/renders/playwright
```
