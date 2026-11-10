---
version: alpha
name: Hallmark Skate Guide (Narrative Workflow with Broadside Theme)
description: >-
  Rebuilding the temp skateboard guide as an XYZ Layout Engine example using Hallmark's
  14 · Narrative Workflow macrostructure and Broadside editorial print material.
---

# Hallmark Skate Guide: How to Skateboard

## Overview

This example adapts the beginner skateboard guide from `temp/2026-11-09-skate-guide/` into XYZ Layout Engine's deterministic rendering pipeline by reading structural guidance from Hallmark (`nutlope/hallmark`).

It applies:
1. **Macrostructure**: Hallmark's `14 · Narrative Workflow`, which structures learning as a disciplined, numbered step-by-step sequence ("1.0 Find your stance", "2.0 Push off", "3.0 Lean to turn", "4.0 Foot brake") rather than generic feature cards.
2. **Theme**: Hallmark's `Broadside` editorial bill material, characterized by unbleached buff stock, dense printer's ink rules, high-contrast dark headings, and a single vermilion red signal.

Use a 1200 by 1600 portrait canvas.

Adopt the Hallmark Broadside palette with grained buff stock, dense charcoal ink, deep vermilion accent, and muted rule gray.

Use bundled Barlow Condensed in regular and bold, a 24px spacing grid, square card corners, and 2px borders.

The layout opens with a dominant broadside header, features an isolated schematic board illustration, and guides the rider through the four essential progression steps in strict chronological order.

## Colors

- Paper: `#ede6d6` (unbleached grained buff newsprint stock)
- Ink: `#1c1917` (near-black printer's charcoal ink)
- Accent: `#c83228` (deep print vermilion signal)
- Muted: `#57534e` (weathered slate for metadata and captions)
- Surface: `#e4dcce` (subtle contrast tint for workflow stage panels)

## Typography

- Display font: `Barlow Condensed`, 84px, weight 700, line height 1.15
- Body font: `Barlow Condensed`, 24px, weight 400, line height 1.3
- Sizing baseline: `S = Math.min(1200, 1600) = 1200px`. Headline is 7.0% of S, body is 2.0% of S (ratio 3.5:1 to 4:1).

## Workflow Structure (Macrostructure 14)

1. **Header & Board Blueprint**:
   - Broadside bill headline: "HOW TO SKATEBOARD"
   - Stage 0: Know your equipment (dominant board illustration with parts callouts).
2. **The 4 Sequential Stages**:
   - `1.0 STANCE`: Feet across the bolts, knees bent.
   - `2.0 PUSH`: Front foot points forward over bolts; push with rear foot.
   - `3.0 TURN`: Lean into toes or heels to curve the line.
   - `4.0 BRAKE`: Drag the rear sole to friction stop.
3. **Colophon**:
   - Attribution to Hallmark Narrative Workflow (Macro 14) and Broadside theme.
