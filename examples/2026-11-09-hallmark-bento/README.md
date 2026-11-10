# Hallmark Bento Grid Example (Riso Theme)

Demonstrates importing layout and theme intelligence from [Nutlope/hallmark](https://github.com/nutlope/hallmark) into XYZ Layout Engine.

## Specifications

- **Macrostructure**: `01 · Bento Grid` (Modular, asymmetric quadrant hierarchy)
- **Theme**: `Riso` (Warm newsprint paper `#fbf8ee`, deep navy ink `#182236`, fluro coral `#ff4e36`, mint green `#2da882`, structural subtle fill `#ebe4d0`)
- **Canvas**: $1200 \times 1200\text{px}$ square canvas on a $24\text{px}$ spacing grid
- **Typography**: Bundled `Barlow Condensed` (display: 96px/700, body: 24px/400)
- **Adherence**: Fully conforms to `SYSTEM-INSTRUCTIONS.md` (AS-1 through AS-12)

## Offline Render Commands

```bash
# Preflight validation
node tools/intake.mjs check examples/2026-11-09-hallmark-bento/fixture.json

# Satori export (PNG, SVG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-bento/fixture.json --backend satori --format png,svg,html,html-inline --out examples/2026-11-09-hallmark-bento/renders/satori

# Playwright export (PNG, HTML)
node tools/render.mjs examples/2026-11-09-hallmark-bento/fixture.json --backend playwright --format png,html,html-inline --out examples/2026-11-09-hallmark-bento/renders/playwright
```
