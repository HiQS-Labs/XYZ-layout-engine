# Anatomy of a poster

From the repository root, with the repository dependencies and Playwright Chromium installed, run:

```sh
node examples/2026-11-21-imaging-layer-pipeline/render.mjs
```

Edit the copy and palette in `fixture.json` and the composition in `diagram.html`. The command embeds the assets and fonts in `index.html`, captures `poster.png` offline, and publishes both through the shared review publisher. Use [PROMPT.md](PROMPT.md) for the revised benchmark. The [first-pass brief](PROMPT-first-pass.md) records the instructions given to the original Astra run.

## Reading the diagram

The two sheets illustrate an author’s editing choices. The actual nutrition recipe reads the fixture, resolves artwork by ID (including provenance-checked PNGs), and constructs one styled scene. The shared renderer measures fit and exports it. The diagram isolates lettering from the v4.1 inline export by hiding image elements and painted backgrounds while preserving text positions. The art sheet regroups selected transparent PNGs for visibility. The face-on proof is the actual v4.1 Playwright export.

## Visual review

The accent identifies the art plane and its annotation system. Open labels replace cards (AS-3), while real source lettering, artwork and output carry the explanation (AS-8). Feathering separates art from its support (AS-2). At S = 1000 the headline is 96px and occupies about 66% of the width. Section heads are 34px and body text is 23px, giving three editorial sizes and a headline-to-body ratio of 4.17. Source-poster lettering retains its own scale. The 421px projected sheet exceeds three headline cap heights (about 207px) to keep actual poster details recognizable. There are no icon-label pairs. This HTML composition has one Chromium backend. Inspection covered native size, approximately one-third scale and 400px width.

## Technical revision

The lower diagram traces the numeric leaf placement from the nutrition recipe into its styled scene and shows the two alternative render paths. Chromium also uses Satori for a pinned-font coverage check on the first pass. The shared HTML exporter can serialize the scene with either backend. The diagram itself renders with Chromium. The [first independent benchmark output](benchmark/astra-high-first-pass.png) preserves the result before this follow-up art direction.

## Astra assembly animation

[Play the interactive assembly](astra-assembly/index.html), [watch the video](astra-assembly/assembly.webm), or [open the assembled frame](astra-assembly/assembled.png). The lettering sheet and the artwork sheet start in Astra’s exploded perspective. A third sheet slides between them to show the JavaScript recipe’s leaf coordinates and the resulting inline CSS. Its dashed outline marks the real image box. The sheets turn face-on and converge as the leaf and each food illustration return to their slots in the nutrition v4.1 HTML. The final poster has selectable text.

Use the slider to inspect a placement mid-flight, or pause and replay the sequence. Set `autoAssemble`, `holdMs` and `assemblyMs` in [recipe.json](astra-assembly/recipe.json). Set `showStyleLayer` to `false` to play the earlier two-sheet sequence. Reduced-motion viewers start on the assembled poster and can step through the exploded and layout views. From the repository root, rebuild the offline HTML, WebM and PNG with:

```sh
node examples/2026-11-21-imaging-layer-pipeline/astra-assembly/render.mjs
```

## Neon motion variant

[Open the animated diagram](neon-motion/index.html) or [view the static poster](neon-motion/poster.png). This presentation fork reuses the three planes from the [Gemini Neon submission](benchmark/runs/gemini-4-neon-xhigh/output/index.html). The original submission remains available for grading.

Set `entranceAnimation` in [recipe.json](neon-motion/recipe.json) to `true` for the alternating entrances and replay button, or `false` for a static HTML diagram. The same file owns the captions, palette and type scale. From the repository root, rebuild and publish both outputs with:

```sh
node examples/2026-11-21-imaging-layer-pipeline/neon-motion/render.mjs
```

The 2.5-second sequence introduces layout, lettering, artwork and the finished poster, followed by the two alternative PNG render paths. The HTML embeds its fonts and images and reflows into two columns on a phone. Reduced-motion preferences, printing and the PNG export show the settled composition.

## Running a blind benchmark

Extract [the handout](benchmark/handout.zip) in a fresh workspace for each run. Give the model only that workspace, the included prompt, and a preconfigured Node.js/Playwright/Chromium runtime. Keep the evaluation and prior outputs outside the workspace. Use filesystem isolation and disable network access when the boundary must be enforced by the harness.

For the open-ended track, distribute [the creative handout](benchmark/creative-handout.zip). It contains the same inputs and replaces only the prompt. Keep the workspace isolated. For tool-assisted runs, supply a scoped Higgsfield tool and the same written credit cap per model; record access and actual spend with the result.

The [public scoring goals](benchmark/GOALS.md) ship in both handouts. Keep the [evaluator and ballot](evaluation/README.md) with the reviewer.
