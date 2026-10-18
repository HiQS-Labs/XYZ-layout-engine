---
version: alpha
name: The Vibe-Coding Loop
description: Slide 4/7 of an intro deck on building with AI — a four-step cycle with an exit, small generated cutouts per step.
colors:
  ground: "#FFFFFF"
  ink: "#14161A"
  muted: "#4A5160"
  rule: "#E3E5EA"
  connector: "#7A808C"
  shadow: "#1B2433"
  you-fill: "#EAF0FC"
  you-line: "#BFD0F5"
  you-ink: "#1F4FC4"
  ai-fill: "#FDEFE4"
  ai-line: "#F2C7A5"
  ai-ink: "#A8480B"
  exit-ink: "#2F7D4F"
typography:
  headline:
    fontFamily: Barlow Condensed
    fontSize: 108px
    fontWeight: 700
    lineHeight: 1.2
  subhead:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.2
  card-title:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: Barlow Condensed
    fontSize: 29px
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Barlow Condensed
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.25
spacing:
  margin: 100px
  card-gap: 120px
  row-gap: 140px
  card-padding: 24px
rounded:
  card: 16px
  swatch: 6px
---

# The Vibe-Coding Loop — design brief

## Overview

Source: an operator-supplied slide ("The Vibe-Coding Loop", diagram 4/7) whose dashed ring ran through its
numbered circles and labels, had no direction, and listed "Repeat until done" as a fifth step. The
structure was redesigned and reviewed on a Claude Design canvas on 2026-10-17; this example renders that
structure through the repo's shared renderer with small generated cutouts ([#63](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/63)).

- **Reader:** someone new to building with AI, seeing one slide of a seven-slide deck on a projector or
  a phone.
- **Takeaway:** you steer a repeating loop; the AI only drafts. You leave the loop when it works.
- **Most space:** the four loop cards, which carry the cycle and its actors.

Hierarchy decisions:

1. The 2×2 loop of cards takes the centre and most of the canvas. The exit card is outside the loop,
   dashed, and visually secondary.
2. Actor colour (You blue, AI orange) carries the "you steer" message, so the slide needs no extra copy
   to say it. Three of the four steps are yours.
3. The return arrow and "repeat until done" are the strongest connector (you-blue, heavier stroke);
   forward connectors are neutral grey; the exit connector takes the exit green.

## Colors

`ground` white; `ink` for titles; `muted` for captions, the steering line, footer and "not yet".
`you-*` and `ai-*` are fill / outline / text triples for each actor's cards, tags and legend swatches.
`exit-ink` marks the exit card outline, its tag, the "it works" connector and label. `connector` is the
forward-arrow grey. `shadow` tints the ground-shadow gradients. No gradients on surfaces (AS-2).
Measured text contrast (WCAG): `muted` on `you-fill` 6.97:1, on `ai-fill` 7.07:1; `ai-ink` on `ai-fill`
5.18:1; `you-ink` on `you-fill` 6.18:1, on white 7.06:1; `exit-ink` on white 5.04:1.

## Typography

Barlow Condensed (vendored, `tools/fonts/barlow-condensed/`, AS-5 default). All copy is short (≤ 40
characters a line), so no regular-width body face is added. Sizes are computed in the render script as
`px = round(S × pct)` with `S = min(1600, 1200) = 1200` (AS-12):

| Role | % of S | px | Used for |
|---|---|---|---|
| Headline | 9.0% | 108 | title, bold caps |
| Subhead | 3.0% | 36 | "conversation" line (regular); card titles (bold caps) |
| Label | 2.4% | 29 | eyebrow, connector labels |
| Body | 1.9% | 23 | captions, actor tags, legend, steering line, footer |

Four sizes; headline : body = 4.7 : 1. The headline was raised from the planned 8% to 9% of S so the
single-line title spans more than half the canvas width (measured 55.3%).

## Layout

Canvas 1600 × 1200, 100 px side margins. Header band (title, subtitle, steering line; eyebrow top
right) above a two-row diagram: row 1 at y 360, row 2 at y 750, loop cards 440 × 250 in columns at x 100
and 660 with 120 px gaps. Reading order runs clockwise: 01 top-left → 02 top-right → 03 bottom-right →
04 bottom-left → back to 01. The exit card (280 × 300) sits right of 03, centred on row 2; the legend
fills the free cell above it. A rule at y 1070 separates the footer.

## Elevation & Depth

Depth comes only from the cutouts. Each stands on its card's floor line with a two-layer ground shadow
(AS-11): a tight contact ellipse under the visible base and a softer cast ellipse offset lower-left,
from one light at the upper right. No silhouette drop-shadows, glows or panel shadows.

## Shapes

Cards share one 16 px radius and a 2 px outline. The exit card's outline is dashed to mark it as the way
out, not a step. Arrows are straight, horizontal or vertical, with filled triangular heads.

## Components

- **Step card:** cutout on the left (fitted inside 160 × 170, base on the floor line), then actor tag
  (`01 · YOU`), title (bold caps), caption.
- **Exit card:** cutout above `EXIT`, `SHIP IT`, caption, centred.
- **Connectors:** 01→02, 02→03 forward; 03→04 labelled "not yet"; 04→01 labelled "repeat until done";
  03→exit labelled "it works". No connector crosses a card, cutout or label.
- **Legend:** two swatch + name + role rows (`You steer and judge`, `AI writes the code`).
- **Footer:** schematic note and AI-imagery disclosure.

## Artwork provenance

Five transparent PNG cutouts (`idea`, `code`, `live`, `refine`, `ship`), one per step, generated with
`gpt-image-2.5-flare` from one shared style string ([artwork.json](artwork.json)), recorded in
[provenance.json](provenance.json) and [ASSETS.md](ASSETS.md). The image model draws no text, panels or
layout; the engine owns all of that.

## Do's and Don'ts

- Do keep the loop to four steps; "repeat until done" is the connector, not a step.
- Do keep step illustrations depicting what the step does (AS-8), on a shared baseline per row.
- Don't add sparkles, glows or gradient washes to the cutouts or cards (AS-2).
- Don't shrink body text below 1.8% of S to fit copy; shorten the copy instead (AS-12).
