---
version: alpha
name: Stop Re-Rolling the Whole Image (talk deck)
description: Ten 16:9 slides for the 18-minute talk in issue #69, each a JSON fixture rendered by the engine; two are diagrams (system, workflow).
colors:
  ground: "#FFFFFF"
  ink: "#14161A"
  muted: "#4A5160"
  rule: "#D9DCE2"
  connector: "#7A808C"
  neutral-fill: "#F3F4F6"
  ai-fill: "#FDEFE4"
  ai-line: "#F2C7A5"
  ai-ink: "#A8480B"
  engine-fill: "#EAF0FC"
  engine-line: "#BFD0F5"
  engine-ink: "#1F4FC4"
  before-primary: "#2F5D27"
  after-primary: "#335577"
typography:
  headline:
    fontFamily: Barlow Condensed
    fontSize: 97px
    fontWeight: 700
    lineHeight: 1.2
  subhead:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.2
  label:
    fontFamily: Barlow Condensed
    fontSize: 29px
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.25
spacing:
  margin: 120px
  column-gap: 80px
  card-padding: 20px
rounded:
  card: 12px
  swatch: 6px
---

# Stop Re-Rolling the Whole Image — deck design brief

## Overview

Source: the timed outline, abstract and verified demo script in
[#69](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/69). The deck is a dogfood demonstration: every
slide is a fixture under `slides/` rendered through the repo's shared renderer in both backends, following
the [vibe-coding-loop](../2026-10-17-vibe-coding-loop/DESIGN.md) pattern (fixture owns copy and palette, the
example script owns geometry and checks). No image model was called.

- **Reader:** an audience watching a projector at 1920 × 1080 for 18 minutes, then reading the exported
  PDF or PNGs afterwards on a laptop or phone.
- **Takeaway:** AI designs once; every later edit touches one element; recipes and DESIGN.md make the
  design durable input rather than a one-shot prompt.
- **Most space:** on the two diagram slides, the diagram; on the hook and result slides, the real nutrition
  renders; everywhere else, the slide's one statement (subhead size) over its supporting lines.

Hierarchy decisions:

1. One headline per slide at 9% of S in bold caps, one line, never below half the canvas width, so the
   slide's claim is the first thing seen from the back of the room.
2. Owner colour carries the central split: everything the AI makes is orange, everything the engine owns is
   blue, with a legend on the four slides that use it (2 to 5). Outputs and files are neutral grey.
3. The two embedded nutrition renders are shown large (640 px and 600 px) because they are the evidence the
   hook and the result slide exist to show; this is the one AS-12 exception and it is declared per fixture.

## Colors

`ground` white; `ink` for headlines, statements and card titles; `muted` for supporting copy, eyebrows,
footers and neutral labels; `rule` for hairlines and neutral card outlines; `connector` for arrows.
`ai-*` and `engine-*` are fill / outline / text triples for the two owners; `neutral-fill` is for outputs,
files and the catalog strip. `before-primary` and `after-primary` are the real primary colours of the demo
fixture before and after the `--set` edit, shown as swatches on slide 7. No gradients, shadows or glows
(AS-2). Measured text contrast (WCAG 2.x): `ink` on white 18.1:1; `muted` on white 7.96:1, on `ai-fill`
7.07:1, on `engine-fill` 6.97:1, on `neutral-fill` 7.24:1; `ai-ink` on white 5.84:1, on `ai-fill` 5.18:1;
`engine-ink` on white 7.06:1, on `engine-fill` 6.18:1. Arrows (`connector` on white, 3.97:1) are
non-text graphics.

## Typography

Barlow Condensed only (vendored, `tools/fonts/barlow-condensed/`, the AS-5 default for dense diagrams),
regular and bold. Copy is short and slide-sized, so no regular-width body face is added. Sizes are computed
in `render-deck.mjs` as `px = round(S × pct)` with `S = min(1920, 1080) = 1080` (AS-12):

| Role | % of S | px | Used for |
|---|---|---|---|
| Headline | 9.0% | 97 | slide title, bold caps, line height 1.2 |
| Subhead | 3.3% | 36 | the slide's statement, takeaways (bold), `tools/render.mjs` title on slide 4 |
| Label | 2.7% | 29 | eyebrows, section labels, card titles, step labels, ledger slugs |
| Body | 2.2% | 24 | supporting copy, card text, commands (`white-space: pre`), footers, legend |

Four sizes; headline : body = 4.04 : 1. Ligatures are turned off at the scene root
(`fontFeatureSettings: '"liga" 0'`, honoured by Satori and by Chromium) because Barlow Condensed ligates
`--` into a dash, which would misprint every `--set` and `--save` on the command slides.

## Layout

Canvas 1920 × 1080, 120 px side margins (content width 1680). Every slide shares a header (eyebrow at
y 60, headline at y 104) and a footer (hairline at y 1000; the deck title left, the slide's fixture path and
number right). Content runs from y 270 to y 980 and nothing but the footer may cross the rule.

- **Title (01):** eyebrow, headline, subtitle, hairline, two subhead paragraphs, the dogfood statement.
- **Hook (02):** the real before render (640 px) left; the ask, two owner-coloured options and the
  AI-imagery disclosure right.
- **Split (03):** two columns under 4 px owner bars with a neutral hand-off in the 320 px gutter between
  them (arrow, three file cards, note).
- **System (04):** three columns, inputs 440 / renderer 560 / outputs 440 px, with the catalog strip under
  the renderer. Input boxes (orange, 120 px) feed the renderer card (blue, 520 px) which feeds the four
  output boxes (neutral). The DESIGN.md box is dashed and has no arrow into the renderer, because the engine
  never parses it. The renderer card holds five stage rows in reading order: validate, buildScene, the two
  backends side by side, the fit loop, the bundled fonts.
- **Workflow (05):** two bands. The ONCE band (orange, three cards of 480 px) ends in a hand-off elbow that
  drops into the FOREVER band (blue, four cards of 340 px: render, `--set`, `--save`, rerender). A blue
  return elbow under the band runs from step 4 back to step 2, labelled "next edit", so the loop is drawn
  with its direction and its exit (identical bytes) rather than as a ring.
- **Demo (06):** step labels and explanations left (560 px), the exact commands right (1080 px, one line
  each, continuation lines indented), a hairline between; the "what to watch" statement and environment
  note below.
- **Result (07):** before and after renders (600 px each) with swatch captions; four facts (changed,
  unchanged, same hash, time) in a 380 px column; disclosure below.
- **Recipes (08):** four bold claims with one supporting line each; a four-row ledger of the active recipe
  identities and content digests from `tools/catalog.sql`.
- **DESIGN.md (09):** lead statement, three-step intake flow (neutral cards), two stories side by side.
- **Close (10):** the three ways to drive it (label + body) and the three takeaways (subhead bold), split by
  a hairline, takeaways heavier.

## Elevation & Depth

None. Cards are flat fills with a 2 px outline; arrows are flat strokes with filled heads. The embedded
renders carry their own ground shadows from the nutrition recipe (AS-11), untouched.

## Shapes

One 12 px radius and one 2 px outline for every card; a 6 px radius on the 22 px legend and caption swatches.
The DESIGN.md input box is dashed to mark it as read by the agent only. Arrows are horizontal, vertical or
right-angled elbows with 18 px heads.

## Components

- **Owner card:** fill + outline from the owner triple, title (label) over text (body), text in its own
  container box so containment is checked.
- **Stage row:** white card inside the renderer card, one centred line of body copy (two backends share a
  row).
- **Ledger:** header row, hairline, four rows of slug (label, regular) and digest (body), hairline each.
- **Command line:** body size, `white-space: pre`, checked to stay on one line in both backends.
- **Legend / swatch caption:** 22 px swatch plus body text (label 109% of swatch height).
- **Footer:** hairline, deck title left, `slides/<slug>.json · NN / 10` right.

## Artwork provenance

Two PNGs, both engine output: `assets/web/demo-before.png` and `assets/web/demo-after.png` are byte copies
of `render.png` from the before and after runs of the issue #69 demo commands (nutrition@4.0.0, Satori +
resvg, 1000 × 1000), rerun verbatim on 2026-10-29 and pinned by SHA-256 in [provenance.json](provenance.json)
with their receipts under `receipts/`. The seven illustrations inside them are the nutrition example's
AI-generated cutouts (gpt-image-2.5-flare); slides 2 and 7 say so. Nothing else in the deck is raster.

## Do's and Don'ts

- Do keep one headline per slide on one line between 50% and 85% of the canvas width; shorten the claim
  rather than wrapping or shrinking it.
- Do keep commands verbatim from issue #69 and on one line each; break long commands with ` \` on indented
  continuation lines.
- Do declare any AS-12 graphic-height exception in the slide fixture (`as12Exception`) with its reason.
- Don't add a third owner colour, gradients, drop shadows or icon toppers (AS-2, AS-6).
- Don't quote times in milliseconds; the measured demo is "under a second per command".
- Don't name components the code does not have: the checks are in `tools/render.mjs`, intake preflight and
  the example scripts, not in a `measure-chromium.mjs`.
