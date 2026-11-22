# Fuel Well. Live Well.

This 1000 × 1000 Chromium edition preserves the wording and composition of the tree-of-life poster in the sibling `renders-v4/playwright/render-inline.html`. Its 13 illustrations were generated for this edition with the Higgsfield CLI.

Open **fuel-well.html** offline or use **fuel-well.png** as the finished poster. To change the wording, geometry, colors or artwork, edit **poster.html** and the PNGs under **assets/**. The source opens directly with its local images and Barlow Condensed fonts. From this directory, run `node render.mjs` with the repository’s pinned Playwright runtime and Chromium installed. The build embeds the images and fonts, screenshots the page offline, and publishes both deliverables to `REVIEW/fuel-well-higgsfield-tree-of-life/`. It makes no generation calls.

## Artwork inventory

| New asset | Placement |
| --- | --- |
| tree | Central tree of life with braided trunk and exposed roots |
| scale | Balanced nutrition callout |
| warning | Soda, chips and doughnut with prohibition mark |
| parfait | Nutritious food caption |
| container | Portable snack caption |
| wrap | Convenient meal caption |
| bottle | Hydration caption |
| leaf | Left and right headline ornaments and left footer ornament |
| heart | Right footer ornament |
| energy | Sustained energy, lightning bolt |
| focus | Sharp focus, brain |
| immunity | Strong immunity, shield |
| wellbeing | Better well-being, smiling face |

All 15 pictorial placements use saved transparent PNGs. The background gradient, panel and footer fills, rules, borders, and six two-layer contact shadows are CSS. Headings, captions, benefit labels and footer copy are live HTML text.

**generation.json** records the serial jobs, balances and phase timestamps. **provenance.json** links each optimized PNG to its paid job, echoed settings, raw file hash and pixel-alpha inspections. **verification.json** maps each published image placement back to its asset hash. **wall-time.json** records dispatch through publication and verification.

## Visual review

The published Chromium render was inspected at 1000, 400 and 333 px wide. The central canopy and roots remain distinct between the two callouts. The headline and food labels survive thumbnail reduction. Caption text is small at 333 px. The original paper gradient, ornaments, footer slogan and benefits panel are deliberate reference-matching exceptions to AS-2, AS-3, AS-6 and AS-7. The food objects use base shadows without silhouette halos (AS-11).

The AS-12 measurements use a 1000 px shorter side. The 80 px headline occupies 69.4% of canvas width. The 20 px body gives a 4:1 size ratio. Subtitle and section headings use 32 and 24 px, respectively. The visible tree measures 496 px versus a headline cap height of 56 px (8.85×). Benefit labels measure 75–150% of icon height. This edition uses the requested Chromium baseline.
