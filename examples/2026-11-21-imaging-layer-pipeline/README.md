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

## Running a blind benchmark

Extract [the handout](benchmark/handout.zip) in a fresh workspace for each run. Give the model only that workspace, the included prompt, and a preconfigured Node.js/Playwright/Chromium runtime. Keep the evaluation and prior outputs outside the workspace. Use filesystem isolation and disable network access when the boundary must be enforced by the harness.

For the open-ended track, distribute [the creative handout](benchmark/creative-handout.zip). It contains the same inputs and replaces only the prompt. Keep the workspace isolated. For tool-assisted runs, supply a scoped Higgsfield tool and the same written credit cap per model; record access and actual spend with the result.

The [public scoring goals](benchmark/GOALS.md) ship in both handouts. Keep the [evaluator and ballot](evaluation/README.md) with the reviewer.
