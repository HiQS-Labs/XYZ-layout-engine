# Accessible PDF export — reference

`tools/pdf.mjs` prints any recipe scene as a tagged, single-page PDF for screen readers (WCAG 2.2 AA).
The [README](../README.md#accessible-pdf-export) has the short version.

A scene says how a diagram looks; an accessibility spec says what it means: which text is a heading,
alt text for every image (`''` marks it decorative), descriptions for swatch groups, and the reading
order. Recipe specs live in `tools/a11y/<recipe>.mjs` (one per recipe: `nutrition`, `solar-system`,
`recursive-process`, `design-intake`).

```sh
node tools/pdf.mjs render examples/2026-10-13-nutrition-infographic/fixture.json --out temp/nutrition.pdf
node tools/pdf.mjs check temp/nutrition.pdf    # what the PDF exposes: tags, alt text, language, title, reading order
```

`render` exits **1** on a failed check or error and **2** on bad usage; without `--out` nothing is
written. It launches Playwright Chromium locally and makes no network calls.

The export fails unless every check passes, all read back from the finished PDF: tagged with a
structure tree, language and title set (title shown in the window bar), one H1 and no skipped heading
levels, every non-decorative image a Figure with alt text, the tag order's decoded text equal to the
intended reading order, every text run at least 4.5:1 (3:1 for large text) against the pixels painted
behind it, and the page painting like the plain export. Each PDF gets a `*.pdf-accessibility.json`
record of those results.

## Committed PDFs

| Diagram | PDF | Source |
|---|---|---|
| Nutrition infographic | `examples/2026-10-13-nutrition-infographic/nutrition-infographic.pdf` | `nutrition` recipe |
| Solar System | `examples/2026-10-08-solar-system/solar-system.pdf` | `solar-system` recipe, `pdf-fixture.json` (see below) |
| Belief updating | `examples/2026-10-11-belief-updating/belief-updating.pdf` | `recursive-process` recipe |
| Belief reference | `examples/2026-10-12-belief-reference/belief-reference.pdf` | `recursive-process` recipe |
| Design intake | `examples/2026-10-12-design-intake/design-intake.pdf` | `design-intake` recipe |
| Cell division | `examples/2026-10-09-cell-division/cell-division.pdf` | `render-diagram.mjs` |
| RAG system | `examples/2026-10-09-rag-system/rag-system.pdf` | `render-diagram.mjs` |

## Limits and decisions

- The published Solar System fixture puts Venus's planet-type label over the asteroid belt at 4.45:1.
  The PDF uses `pdf-fixture.json`, identical except `planets[venus].labelY` 1060 → 1125. The published
  fixture is a catalog-declared file, so changing it needs a version decision; the PNG/SVG exports
  keep the original position until then.
- `render.mjs` is a catalog-declared file of every recipe, so `pdf.mjs` keeps its own copy of `toHtml`
  with `h3` added and rebuilds a recipe's scene from the fixture and its final fitted sizes; the
  rebuilt scene's Satori SVG must match the published render byte for byte.
- The PDF turns off Inter/Barlow contextual alternates and ligatures: the alternate parentheses and
  `ﬁ` glyphs have no usable Unicode mapping, so screen readers would drop or misread them.
- Swatch groups and CSS-filtered images are tagged through a transparent overlay image carrying the
  alt text, because Chromium tags only painted content and drops filtered images' tags.
- Label fragments inside a diagram (subscript letters, column numbers) may be hidden from assistive
  technology only when the diagram's alt text describes them (`artifacts`, `unnamedText: 'artifact'`).
- Checked here: structure, alt text, reading order, text contrast. Not automated: non-text contrast of
  arrows and graphics, and the quality of alt text, which is reviewed by a person. Not yet validated
  with veraPDF or PAC.
