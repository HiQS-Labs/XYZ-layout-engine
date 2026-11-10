---
version: alpha
name: Hallmark Bento Grid with Riso Theme
description: Demonstration of reading Hallmark's 01 · Bento Grid macrostructure and Riso theme into XYZ Layout Engine.
---

# Hallmark Bento Grid with Riso Theme

## Overview

This example demonstrates importing layout and theme intelligence from Hallmark (`nutlope/hallmark`) into XYZ Layout Engine's deterministic rendering pipeline. The design implements Hallmark's `01 · Bento Grid` layout combined with the `Riso` theme material.

Use a 1200 by 1200 square canvas.

Adopt the Hallmark Riso theme palette with tactile paper, midnight navy ink, vibrant fluro coral accent, and mint secondary.

Use bundled Barlow Condensed in regular and bold, a 24px spacing grid, 12px rounded corners, and 2px card borders.

The Bento Grid macrostructure organizes content into an asymmetric quadrant layout with a dominant hero block on the left and supporting telemetry on the right.

## Colors

- Paper: `#fbf8ee` (unbleached tactile newsprint)
- Ink: `#182236` (deep midnight navy)
- Accent: `#ff4e36` (vibrant fluro coral/orange)
- Secondary: `#2da882` (tactile spot mint)
- Subtle: `#ebe4d0` (warm structural tint for bento frames)

## Typography

- Display font: `Barlow Condensed`, 96px, weight 700, line height 1.2
- Body font: `Barlow Condensed`, 24px, weight 400, line height 1.3
- Sizing baseline: `S = Math.min(1200, 1200) = 1200px`. Headline is 8.0% of S, body is 2.0% of S (ratio 4:1).

## Layout & Hierarchy

1. Primary Anchor: Hero quadrant on the left highlighting the core invariant (probabilistic boundary).
2. Secondary Columns: Stacked right-hand cards displaying telemetry rules (offline verification and collision linting).
3. Wide Baseline Banner: Bottom card detailing portable DESIGN.md interchange without runtime sprawl.
