---
version: alpha
name: Hallmark Stat-Led Layout with Distil Theme
description: Demonstration of reading Hallmark's 04 · Stat-Led macrostructure and Distil theme into XYZ Layout Engine.
---

# Hallmark Stat-Led Layout with Distil Theme

## Overview

This example demonstrates importing layout and theme intelligence from Hallmark (`nutlope/hallmark`) into XYZ Layout Engine's deterministic rendering pipeline. The design implements Hallmark's `04 · Stat-Led` layout combined with the `Distil` theme material.

Use a 1200 by 1200 square canvas.

Adopt the Hallmark Distil theme palette with clean titanium paper, deep slate ink, electric cobalt accent, and functional muted gray.

Use bundled Barlow Condensed in regular and bold, a 24px spacing grid, 4px rounded corners, and 1px card borders.

The Stat-Led macrostructure anchors visual hierarchy with a dominant hero KPI block and three supporting analytical columns.

## Colors

- Paper: `#f4f4f4` (clean titanium chalk)
- Ink: `#11161d` (deep slate charcoal)
- Accent: `#0055ff` (electric cobalt)
- Muted: `#68707d` (functional technical slate)
- Surface: `#e8eaed` (structural frame fill)

## Typography

- Display font: `Barlow Condensed`, 96px, weight 700, line height 1.2
- Body font: `Barlow Condensed`, 24px, weight 400, line height 1.3
- Sizing baseline: `S = Math.min(1200, 1200) = 1200px`. Headline/KPI is 8.0% of S, body is 2.0% of S (ratio 4:1).

## Layout & Hierarchy

1. Primary Anchor: Massive hero metric (99.8%) dominating the upper fold with supporting explanatory context.
2. Supporting Data Columns: Three equal-width analytical panels across the lower fold (collision tolerance, offline speed, and pinned font assets).
3. Footer: Clear provenance and macrostructure attribution.
