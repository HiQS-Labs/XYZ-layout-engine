---
gh_issue: 74
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/74
title: "Borrow Hallmark layouts: read macrostructures and themes into XYZ Layout Engine"
goal: "Support reading Hallmark layout macrostructures and themes into XYZ Layout Engine using DESIGN.md and design-intake contract"
status: "Active (implementation complete, PR pending)"
created: 2026-11-09
updated: 2026-11-09
owner: Antigravity
doc_type: feature
complexity: 2
risk: 1
effort: 2
phases: 3
---

# GH-74 — Borrow Hallmark layouts: read macrostructures and themes into XYZ Layout Engine

## Status
 
| What was just completed | What's next |
|---|---|
| Complete implementation: Dynamic Hallmark reader harness (`tools/hallmark.mjs` with `--from` external clone resolution), three canonical examples (`examples/2026-11-09-hallmark-bento/`, `examples/2026-11-09-hallmark-stat-led/`, and `examples/2026-11-09-hallmark-skate-guide/` rebuilt from `temp/` using Macro 14 Narrative Workflow + Broadside theme), preflight checks, renders to Satori (PNG, SVG, HTML) and Playwright (PNG, HTML), and full test suite passing (4/4 canaries). | Push task branch updates and verify PR 75. |
 
## Scope and Plan
 
### 1. Selected Hallmark Dimensions
- **Macrostructures**:
  - `01 · Bento Grid`: Modular, irregular quadrant layout with deliberate asymmetric weighting.
  - `04 · Stat-Led`: Metrics-dominant hierarchy anchored by a high-contrast KPI block and structured narrative callouts.
  - `14 · Narrative Workflow`: Step-by-step progressive card sequence with featured hero breakdown card.
- **Themes**:
  - `Riso`: Tactile Risograph print palette (`paper`: `#fbf8ee`, `ink`: `#182236`, `accent`: `#ff4e36` fluro coral/orange, `secondary`: `#2da882` mint).
  - `Distil`: Swiss technical/editorial palette (`paper`: `#f4f4f4`, `ink`: `#11161d` deep slate, `accent`: `#0055ff` electric cobalt, `muted`: `#68707d`).
  - `Broadside`: Traditional editorial broadsheet printer's bill (`paper`: `#ede6d6`, `ink`: `#1c1917`, `signal`: `#c83228` vermilion, `muted`: `#57534e`, `tint`: `#e4dcce`).

### 2. Implementation Deliverables
1. `tools/hallmark.mjs`: Lightweight reader and dynamic resolver supporting loading from an external Hallmark clone (`--from <path>` or `HALLMARK_PATH`) as well as fallback definitions, avoiding baked third-party assets in core engine.
2. `examples/2026-11-09-hallmark-bento/`:
   - `DESIGN.md`: Art direction brief adhering to Google's DESIGN.md format.
   - `fixture.json`: Validated data recipe implementing the Bento Grid with Riso theme.
   - Deterministic render exports (PNG, SVG, HTML).
3. `examples/2026-11-09-hallmark-stat-led/`:
   - `DESIGN.md`: Art direction brief adhering to Google's DESIGN.md format.
   - `fixture.json`: Validated data recipe implementing the Stat-Led layout with Distil theme.
   - Deterministic render exports (PNG, SVG, HTML).
4. `examples/2026-11-09-hallmark-skate-guide/`:
   - `DESIGN.md`: Art direction brief adhering to Google's DESIGN.md format.
   - `assets/board.png`: Transparent non-interlaced RGBA cutout asset.
   - `fixture.json`: Rebuilding `temp/2026-11-09-skate-guide/` into Narrative Workflow + Broadside theme.
   - Deterministic render exports (PNG, SVG, HTML).
5. Full verification via `tools/intake.mjs check`, `tools/render.mjs`, and `utils/pdda/pdda.sh run`.

## Acceptance Criteria

- [x] `tools/hallmark.mjs` dynamically parses external Hallmark clones (`--from <path>`).
- [x] All three examples validate cleanly via `node tools/intake.mjs check <fixture.json>`.
- [x] All three examples render offline to PNG, SVG, and HTML via `tools/render.mjs`.
- [x] Typography follows `AS-12` proportional `% of S` sizing (`S = 1200px`, max 4 sizes on canvas).
- [x] Zero collisions, text overflow, or unmapped requirements.
- [x] All PDDA checks pass cleanly (`utils/pdda/pdda.sh run`).

## Rating Rationale

Rated 40/20/80/70 (calc=210): priority 40 reflects user exploration and design expansion; severity 20 (feature addition, non-blocking); appeal 80 (anti-slop layout diversity directly solving template stagnation); cheapness 70 (high leverage on existing `design-intake` recipe and Satori/Chromium renderer).

## Implementation Evidence

- `node tools/hallmark.mjs list --from "../hallmark-fork"` successfully indexed 21 macrostructures and 50 themes.
- `node tools/intake.mjs check examples/2026-11-09-hallmark-skate-guide/fixture.json` returns `ready: true, unsupported: [], pending: []`.
- Satori and Playwright renders executed with zero collisions and exact deterministic output publications under `examples/2026-11-09-hallmark-skate-guide/renders/`.
- Full `pnpm test` executed and passed 4/4 canary guards.
- PDDA run executed with zero errors.
