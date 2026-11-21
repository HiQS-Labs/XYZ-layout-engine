# XYZ Layout Engine overview deck

Fourteen 16:9 slides for a live introduction by Noel Saw. The deck presents the local MVP, then labels
possible future features separately. It also demonstrates how the same recipe can render updated
copy or a different palette.

| Presentation | PDF | Offline HTML |
|---|---|---|
| Neo-Mirai | [View PDF](renders/neo-mirai/deck.pdf) | [Download viewer](renders/neo-mirai/deck.html) |
| Riso | [View PDF](renders/riso/deck.pdf) | [Download viewer](renders/riso/deck.html) |

Download the HTML and open it locally to present. To rebuild the deck, run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
node examples/2026-11-20-layout-engine-deck/render-deck.mjs
```

Open `REVIEW/layout-engine-deck/deck.pdf` or `REVIEW/layout-engine-deck/deck.html`. Keep the PDF
alongside the HTML to use the viewer's PDF link. The HTML contains its own slide images, so
navigation works without the PDF or a network connection. Use the arrow keys to present or **G**
to see all slides.

Slide 7 traces the local render loop using the [nutrition fixture](../2026-10-13-nutrition-infographic/fixture.json) and its [version 4 Satori output](../2026-10-13-nutrition-infographic/renders-v4/satori/thumbnail.png). The [render operation](../../tools/render.mjs) validates the fixture, builds the scene, measures text and retries with smaller type for overflowing labels. The diagram’s connectors are recipe geometry and its labels live in the deck JSON. Slide 13 covers the local runtime, rendering libraries and recipe catalog. The closing slide links to Noel Saw’s LinkedIn profile in both exports.

## Editing

The default theme adapts [Impeccable’s Neo-Mirai reference](https://impeccable.style/neo-mirai/).
Warm paper and dark ink carry the content slides. The opener pairs deep teal with a Higgsfield transit-station illustration. On every even-numbered content slide, the Neo-Mirai theme alternates between two OpenAI-generated landscapes, a maple railway and an eclipse garden. A paper or deep-teal wash keeps text legible. The font roles follow the reference stylesheet: Chakra Petch for
headings, Zen Old Mincho for prose, and Azeret Mono for metadata. The
[font sources and licenses](../../tools/fonts/neo-mirai/SOURCE.md) and
[art generation receipts](assets/provenance.json) are bundled locally.

- [deck.json](deck.json) owns the fourteen slides, their order, copy and layout choices.
- [theme.json](theme.json) owns the palette, font profile, type ratios, weights and line heights.
- [recipe.mjs](recipe.mjs) owns the canvas, font family, spacing and six reusable layouts.
- [render-deck.mjs](render-deck.mjs) renders the scenes with the shared Satori and Playwright
  backends, verifies text geometry, packages a vector PDF and the shared HTML viewer, and calls
  `publishForReview`. It follows the [existing talk deck](../2026-10-29-talk-deck/README.md) pattern.

The [Riso palette](theme-riso.json) adapts the [Hallmark Bento example](../2026-11-09-hallmark-bento/README.md)
for projection. Warm paper and navy carry the body slides, while coral marks emphasis. The body-slide
coral is darker for text contrast and the cover uses a lighter coral on navy. The Riso edition uses Barlow Condensed and the same slide layouts.

Copy the theme and edit its values to try a new visual treatment. An override run keeps its outputs
outside `REVIEW/`:

```sh
mkdir -p temp
cp examples/2026-11-20-layout-engine-deck/theme.json temp/deck-theme.json
# Edit temp/deck-theme.json, then render.
THEME=temp/deck-theme.json OUT_DIR=temp/deck-alternate \
  node examples/2026-11-20-layout-engine-deck/render-deck.mjs
```

The output folder also holds both sets of PNGs and `verification.json` with per-slide geometry and
digests. The PDF is a vector presentation export. The separately documented
[tagged single-page PDF exporter](../../docs/pdf-export.md) serves a different workflow.

## Sources

- The integration slide follows the [Hallmark importer](../../README.md#examples) and
  [Impeccable audit](../../README.md#craft-linting-impeccable-and-editorial-assets) documentation.

- The factual baseline is [PR #89 at d3f7e8d](https://github.com/HiQS-Labs/XYZ-layout-engine/tree/d3f7e8d11352caeb7b9819ffc505bc87d5b99680).
- The proposed HTTP, MCP, job and recipe-loading capabilities come from the
  [product specification](../../PROJECT/2-WORKING/SPECS-PRD.md).
- The MangaJDM slide uses the presenter’s t-shirt artwork context. GH-28 documents the three portrait
  promo exports, and GH-44 and the October 13 changelog document their archive. The slide contains
  public-safe text only. [GH-28](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/28),
  [GH-44](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/44),
  [October 13 changelog](../../CHANGELOG.md#2026-10-13--gh-44-nutrition-infographic-designmd-mangajdm-archive-and-readme-refresh).

## Visual review

Neo-Mirai uses solid fills, rules for alignment and the opening illustration and alternating landscapes as
focal points (AS-2, AS-6, AS-8). The closing landscape gives the text a dark left-hand reading area.
The recipe uses simple columns and rows (AS-3, AS-14). The three faces carry separate display,
prose and metadata roles from the source design. Azeret Mono is used only for short labels and notes.

| AS-12 measurement | Result |
|---|---|
| Canvas and shorter side | 1280 × 720, S = 720 |
| Headline | 59 px, 8.2% of S |
| Section head and label | 30 px and 19 px |
| Body | 24 px, 3.33% of S |
| Headline to body ratio | 2.46:1, with larger body copy for projection |
| Distinct sizes | At most four |
| Headline width | 56.7–76.6% on content slides. The shorter opening and closing titles use 38.6% and 21.4% respectively. |
| Graphic | 392 px frame on each bookend, with artwork clear of the text. No icon-label pairs. |

On slide 7 the headline spans 57.3% of the Neo-Mirai canvas in both backends. Arrows join the two inputs, trace the overflow retry and lead to the real nutrition export. The 234 px print thumbnail is an output sample, with the readable explanation alongside it (AS-8).

Both backends passed glyph, bounds and text-overlap checks on all fourteen slides. The bookend
art was inspected at full size over the dark teal canvas. Both source PNGs passed real-alpha
verification, with their digests checked again during rendering.
