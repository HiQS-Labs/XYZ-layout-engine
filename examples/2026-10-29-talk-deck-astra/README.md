# Stop Re-Rolling the Whole Image

A ten-slide, 18-minute talk deck (plus Q&A) for
[HiQS-Labs/XYZ-layout-engine#69](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/69).
Every slide has its own JSON fixture and is composed through the shared XYZ Layout Engine
`renderSatori` and `renderPlaywright` operations. There is no hand-drawn slide image, image-model
slide output, new published recipe, runtime change or paid asset generation.

The primary deliverables are `slide-01.png` through `slide-10.png` at 1920 × 1080. Matching
Chromium PNGs, Satori SVGs, per-slide receipts and `verification.json` are retained as evidence.

## File ownership

| Path | Owns |
|---|---|
| `DESIGN.md` | reader, takeaway, visual system, type scale and exception rationale |
| `fixtures/slide-01.json` … `slide-10.json` | copy, palette roles, type percentages and per-slide content |
| `render-deck.mjs` | scene geometry, connectors, shared-backend calls and geometry/AS-12 audits |
| `assets/nutrition-{before,after}.png` | real outputs from the issue #69 nutrition demo |
| `demo-receipt.json` | exact demo commands, runtime, run IDs, timings and artifact hashes |
| `slide-*.png`, `slide-*-chromium.png`, `slide-*.svg` | generated 1920 × 1080 artifacts |
| `receipts/`, `verification.json` | generated geometry, glyph, AS-12 and SHA-256 evidence |

This is a one-off example. It adds no catalog row, dependency, test or CI workflow; the test budget
stays at one file, four tests and zero workflows.

## Render

From the repository root, with dependencies installed and Node 26 selected:

```sh
PATH="/opt/homebrew/bin:$PATH" npx --yes pnpm@9 install --frozen-lockfile
PATH="/opt/homebrew/bin:$PATH" node examples/2026-10-29-talk-deck-astra/render-deck.mjs
```

The second command is the exact normal render entry point. It rewrites all 30 image/vector artifacts,
ten receipts and `verification.json`, and exits nonzero on any recorded finding. `OUT_DIR=<path>`
redirects generated evidence; `FIXTURE_DIR=<path>` selects an alternate ten-fixture directory.
Rendering is local and needs no network or image API.

## Clean replay and byte comparison

```sh
rm -rf temp/talk-deck-replay
OUT_DIR=temp/talk-deck-replay PATH="/opt/homebrew/bin:$PATH" node examples/2026-10-29-talk-deck-astra/render-deck.mjs
for n in 01 02 03 04 05 06 07 08 09 10; do
  cmp "examples/2026-10-29-talk-deck-astra/slide-$n.png" "temp/talk-deck-replay/slide-$n.png" || exit 1
  cmp "examples/2026-10-29-talk-deck-astra/slide-$n-chromium.png" "temp/talk-deck-replay/slide-$n-chromium.png" || exit 1
  cmp "examples/2026-10-29-talk-deck-astra/slide-$n.svg" "temp/talk-deck-replay/slide-$n.svg" || exit 1
  cmp "examples/2026-10-29-talk-deck-astra/receipts/slide-$n.json" "temp/talk-deck-replay/receipts/slide-$n.json" || exit 1
done
cmp examples/2026-10-29-talk-deck-astra/verification.json temp/talk-deck-replay/verification.json
```

Verified on 2026-10-29 with Node `v26.0.0`: all 41 compared files (30 artifacts, ten receipts and
`verification.json`) were byte-identical after a clean replay. Both `verification.json` copies had
SHA-256 `f246d102fa1aecc680ec0b3cfa5437301711356da2ed60a268708cb2d9809414`; per-artifact SHA-256
values are recorded inside it.

Byte identity is an observation for the recorded local runtime and locked dependencies, not a promise
that Chromium rasterization is identical across every OS or future backend version.

## Slide inventory and checks

“Checks” is text overlaps / text clippings / unsupported-glyph findings / AS-12 findings, across both
backends. Every listed receipt reports `0 / 0 / 0 / 0`; the slide 7 exception is declared separately,
not hidden as a finding-free pass of every AS-12 rule.

| # | Artifacts | Content | Checks |
|---:|---|---|---|
| 1 | [PNG](slide-01.png) · [Chromium](slide-01-chromium.png) · [receipt](receipts/slide-01.json) | Hook: AI designs once; later edits stay exact | 0 / 0 / 0 / 0 |
| 2 | [PNG](slide-02.png) · [Chromium](slide-02-chromium.png) · [receipt](receipts/slide-02.json) | The re-roll tax, explicitly labelled as a schematic | 0 / 0 / 0 / 0 |
| 3 | [PNG](slide-03.png) · [Chromium](slide-03-chromium.png) · [receipt](receipts/slide-03.json) | AI/engine ownership split and structured handoff | 0 / 0 / 0 / 0 |
| 4 | [PNG](slide-04.png) · [Chromium](slide-04-chromium.png) · [receipt](receipts/slide-04.json) | High-level technical system: inputs, renderer, catalog, outputs | 0 / 0 / 0 / 0 |
| 5 | [PNG](slide-05.png) · [Chromium](slide-05-chromium.png) · [receipt](receipts/slide-05.json) | Author-once/edit-forever workflow and return loop | 0 / 0 / 0 / 0 |
| 6 | [PNG](slide-06.png) · [Chromium](slide-06-chromium.png) · [receipt](receipts/slide-06.json) | Exact live-demo commands | 0 / 0 / 0 / 0 |
| 7 | [PNG](slide-07.png) · [Chromium](slide-07-chromium.png) · [receipt](receipts/slide-07.json) | Real before/after renders, matching SVG hash and timings | 0 / 0 / 0 / 0 |
| 8 | [PNG](slide-08.png) · [Chromium](slide-08-chromium.png) · [receipt](receipts/slide-08.json) | Versioned recipes and immutable published identity | 0 / 0 / 0 / 0 |
| 9 | [PNG](slide-09.png) · [Chromium](slide-09-chromium.png) · [receipt](receipts/slide-09.json) | DESIGN.md as agent input; blocked intake and line-height story | 0 / 0 / 0 / 0 |
| 10 | [PNG](slide-10.png) · [Chromium](slide-10-chromium.png) · [receipt](receipts/slide-10.json) | Cloud/local/CI drivers and three takeaways | 0 / 0 / 0 / 0 |

## Demo evidence

The exact commands are printed on slide 6 and stored in `demo-receipt.json`. They were run from the
repository root with Node `v26.0.0`; shell `time` reported:

| Stage | Run ID | Wall time | Evidence |
|---|---|---:|---|
| Before | `197b6146-1daf-4b3f-9ad0-95f6b8f6f181` | 0.882 s | PNG SHA-256 `588bea559fadedaab97fc341145e1c10e2ba09a495cf44401c990c62940b9504` |
| Edit + save | `ea730116-dd31-4698-a8c7-1aab95772115` | 0.549 s | PNG SHA-256 `397f21d5029f9e27298e1884cfa9d04b901ab095dde0d4f2c710f35bfd357ac9` |
| Rerender saved fixture | `8f885be2-5803-4eeb-897c-f6904270d6de` | 0.383 s | SVG matches edit + save |

After and again SVGs both have SHA-1 `ceefd615f5ca0c4e2a7c80c1ce947d7d3a9dc6c2` and SHA-256
`fbe0090ad0e992d29788f132820bf9e38ee18f5fb1ee07404d19fbe386f86c19`. All three runs fit on their
first attempt. These are one observed local run, not a benchmark guarantee.

The issue narrative calls the demo a one-element edit, while its exact commands change both the
headline and primary color in one saved fixture. The deck names both fields rather than concealing
that discrepancy.

## AS-1 … AS-12 report

The reader, takeaway, three hierarchy decisions and computed scale are in `DESIGN.md`.
`S = min(1920, 1080) = 1080`; every size is `round(S × pct)`.

- **AS-1, AS-4:** composition follows the talk content: re-roll sequence, unequal ownership columns,
  system/workflow diagrams, command ledger, real comparison and versioning stories. The central
  subject, not a repeated hero-and-tiles template, gets the space.
- **AS-2:** solid fixture fills and one orange attention color; no gradients, glows, glass, blobs or
  sparkles are added by this deck.
- **AS-3:** panels represent actual stages, artifacts or evidence frames. Lists, headers and takeaways
  use alignment and rules instead of generic cards.
- **AS-5:** palette roles live in every fixture; one 8 px spacing rhythm, one 12 px radius and one
  2 px outline; vendored Barlow Condensed Regular/Bold; four sizes computed from `S`.
- **AS-6, AS-8:** connectors explain direction; slide 7 shows actual engine output rather than a
  decorative substitute. No ornamental icon system or generated artwork was added.
- **AS-7:** code paths, commands, timings and hashes were checked locally. Slide 2 is labelled as a
  schematic, not measured model drift. Slide 9 says the agent—not the engine—parses DESIGN.md.
- **AS-9:** not applicable; no image prompts or image-generation calls were used.
- **AS-10:** all 20 backend PNGs were inspected at full size and at exact 640 × 360 and 400 × 225
  thumbnails. Slide 7's two evidence images and bottom text were also inspected in native-resolution
  crops in both backends. No connector crosses a label or panel; three type tiers survive the
  squint/thumbnail pass.
- **AS-11:** no new resting 3D cutouts or shadow treatment. The retained nutrition renders keep their
  own internally generated artwork and grounding.

### Measured AS-12 checks

Values come from `verification.json`; title widths are the measured Satori title text boxes.

| Check | Rule | Measured |
|---|---|---|
| Type scale | computed from `S`; at most four sizes | 86 / 32 / 26 / 21 px from 8.0 / 3.0 / 2.4 / 1.9% |
| Headline size | 7–10% of `S` | 8.0% (86 px) on every slide |
| Headline width | 50–85% of canvas | 57.8–82.7% across slides 1–10 |
| Body size | ≥ 1.8% of `S` | 1.9% (21 px) |
| Headline : body | ≥ 4 : 1 | 4.10 : 1 |
| Distinct sizes | ≤ 4 | 4 on every slide |
| Headline cap height | measured from font `OS/2 sCapHeight` | 60.2 px at 86 px headline |
| Largest graphic | ≤ about 3× cap height | slides 1–6, 8–10: no raster hero; slide 7: 480 px = 7.97×, declared exception |
| Icon-plus-label target | label ≥ 70% of icon height | not applicable; no icon-plus-label pairs |
| Whitespace / squint | allocated regions; three tiers | visually inspected at full, 640 px and 400 px sizes |

**Exception:** slide 7 uses AS-12 rule 5's content-driven exception. Each real-render evidence image
is 480 px high, or 7.97× the 60.2 px headline cap height. Reducing them would defeat the before/after
comparison; they are subject matter, not decorative hero art.

**Readability limit:** titles, primary labels and diagram structure remain legible at 400 px width,
but 21 px body copy becomes about 4.4 px and requires zoom. The long commands on slide 6 and hash /
timing lines on slide 7 also require zoom. This deck meets the numeric body floor but does not achieve
full phone readability for all supporting copy; the main talk narrative is carried by larger type.

## Source discrepancy and scope

The root README references `tools/spike/measure-chromium.mjs`, but that file is absent at base commit
`0d6706c`. Slide 4 therefore names the checked implementation sites: `tools/render.mjs` for fitting /
clipping and `tools/spike/verify.mjs` for overlap checks. The missing component is documented rather
than invented or reintroduced.

The example-local receipts audit text-to-text overlap, canvas/container containment, Chromium scroll
overflow, longest-word fit and glyph availability. They do not claim a general proof of all possible
shape, connector or image collisions. Visual review covers the composed connectors and evidence
frames for this fixed deck.
