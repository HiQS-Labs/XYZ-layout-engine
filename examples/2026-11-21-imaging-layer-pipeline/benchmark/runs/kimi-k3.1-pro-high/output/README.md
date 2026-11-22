# Anatomy of a Render

## Rebuild

From the handout packet root, run:

```sh
node output/build.mjs
```

The command reads the bundled fonts and nutrition assets, regenerates the self-contained `output/index.html`, and captures `output/poster.png` at 1600 × 1200 with Playwright Chromium in offline mode. No network access, paid service, or generated artwork is used.

## Edit

`output/source.html` is the editable source. Edit any visible caption, annotation, CSS value, or HTML structure there, then run the same rebuild command. The build embeds all images and fonts into both deliverables.

The clearest visual decision is the **exploded poster**: the headline and leaf hover on separate planes above the finished composite. Projection guides and the adjacent fixture/recipe cards connect each editable value to the exact pictured component it controls, while keeping artwork choice independent from the leaf's `left 262`, `top -34`, `width 428`, and `height 640` geometry.

Technical claims were checked against `source/nutrition.mjs` and `source/render.mjs`: the recipe builds a styled scene in Node.js; `toDocument` serializes inline CSS to HTML; Satori produces SVG and resvg rasterizes it; Playwright drives Chromium for HTML layout and PNG capture; either backend can export HTML.
