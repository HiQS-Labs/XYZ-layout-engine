# Hallmark Stat-Led Layout Example (Distil Theme)

Demonstrates importing layout and theme intelligence from [Nutlope/hallmark](https://github.com/nutlope/hallmark) into XYZ Layout Engine.

## Specifications

- **Macrostructure**: `04 · Stat-Led` (Metrics-dominant hierarchy with a high-contrast hero KPI block and supporting analytical columns)
- **Theme**: `Distil` (Clean titanium paper `#f4f4f4`, deep slate ink `#11161d`, electric cobalt `#0055ff`, muted technical slate `#68707d`, structural surface `#e8eaed`)
- **Canvas**: $1200 \times 1200\text{px}$ square canvas on a $24\text{px}$ spacing grid
- **Typography**: Bundled `Barlow Condensed` (display: 96px/700, body: 24px/400)
- **Adherence**: Fully conforms to `SYSTEM-INSTRUCTIONS.md` (AS-1 through AS-12)

## Offline Render Commands

```bash
# Preflight validation
node tools/intake.mjs check examples/2026-11-09-hallmark-stat-led/fixture.json

# Satori export (PNG, SVG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-stat-led/fixture.json --backend satori --format png,svg,html,html-inline --out examples/2026-11-09-hallmark-stat-led/renders/satori

# Playwright export (PNG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-stat-led/fixture.json --backend playwright --format png,html,html-inline --out examples/2026-11-09-hallmark-stat-led/renders/playwright
```
