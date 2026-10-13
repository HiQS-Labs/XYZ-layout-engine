# Reference-directed recursive belief updating

This version recreates the supplied reference composition with six individually generated PNG illustrations and deterministic text, shapes and connectors. The profile PNG is reused five times. [Open the backend gallery](index.html), [Satori PNG](renders/satori/render.png), or [Chromium PNG](renders/playwright/render.png).

The published recipe is `recursive-process@3.0.0`; source publication is commit `636f476`. The previous horizontal editorial design and older catalog identities remain in Git. This example does not overwrite the October 11 original or register the ignored temporary review gallery.

## What follows the reference

The [recipe design contract](../../tools/recipes/recursive-process.design.md) records the reference's 1320×1294 coordinates. The recipe scales them uniformly by `1340 / 1294` into a 1600×1340 canvas and centers the result horizontally, rather than stretching it.

Large, point-up B1/B2 hexagons anchor the horizontal reading line. Each is 180×190 reference pixels; compact 105×140 consequence cards sit below at the recorded centers. A questioning-gears PNG and revised-philosophy shield occupy the upper branch. A broad, outlined pale-blue continuation arrow leads to 86×100 repeated B2/B3/B4 hexagons, explicit connecting arrows and a separate ellipsis. Supporting labels and compact captions preserve the fixture's semantic text without moving the principal shape anchors.

The visible routes are event → B1 → B2, B1/profile → C1 → B2, B2/profile → C2 → continuation, and B2 → examination → revised philosophy. There is no E-to-continuation edge because the reference does not draw one. The schematic wording describes illustrative outcomes, not a clinical guarantee.

## Artwork and determinism

[ASSETS.md](ASSETS.md) records the seven successful paid calls, the accepted six PNGs, the examination refinement, the provider-source `caBX` metadata limitation and exact generation replay commands. [provenance.json](provenance.json) pins accepted source/display bytes. The recipe uses `readPinnedPngs` with fixed local IDs; missing or mismatched PNGs fail rather than being replaced by SVG artwork. Consequence polarity selects the negative or positive PNG through the existing fixture field.

Rendering accepted assets is deterministic within the pinned runtime/backend. Fresh image generation is probabilistic and is not claimed to reproduce identical pixels. Some soft edge shading remains around generated illustrations. Text, subscripts, arrows, hexagons, title panel and cards are engine-rendered geometry; the image model did not paint the chart.

## AS review

Reader: someone learning the relationship between event, interpretation, consequence and examination. The primary takeaway is recursive feedback with a separate examination branch.

The three hierarchy decisions were: large belief hexagons first; smaller lower consequence cards and upper D/E illustrations second; a wide continuation arrow and repeated beliefs third. Title and stage formulas orient the reader without becoming the main subject.

- **AS-1, AS-4:** the specific reference governs composition and unequal hierarchy. This is a reference-directed explanatory plate, not a generic row of icon cards.
- **AS-2, AS-3, AS-6:** rounded title panel, consequence cards, point-up hexagons, repeated profiles and a restrained title-panel offset deliberately match the supplied reference. Their shapes are intentional exceptions, not unexplained defaults. No glow or gradient was added; slight illustration shading comes from the accepted PNGs.
- **AS-5:** palette roles remain in `theme.palette`. Fixed geometry/type has one owner in the recipe rather than inert fixture controls. Pinned Inter matches the reference. The existing unsupported-glyph canary now uses a CJK character because Inter supports the former arrow character; the same refusal assertion remains. Main text defaults in reference pixels: title 32, stage/labels/trail 20, captions 16, footer 15/14, line height 1.3. Notation uses lowered, smaller digits rather than baked image text.
- **AS-7:** reference title and belief/consequence labels retained, source/schematic footer retained, generated imagery disclosed. No guaranteed psychological outcome is asserted.
- **AS-8, AS-9:** generated subjects depict the requested handshake, repeated person, consequence imagery, gears/question and revised-philosophy shield. One shared prompt style and one selected examination refinement are recorded with the assets.
- **AS-10:** inspected both final PNGs at original 1600×1340 resolution and 420px-long-edge thumbnails. Checked point-up proportions, PNG consistency, profile reuse, all specified edges, readable labels, crop/fit and the absent E-to-continuation connection. Fine captions require the full-size view. Minor backend raster/type differences remain.

Prepublication corrections addressed overlapping B1/examination text, oversized consequence cards, wide flat-top hexagons, missing small-trail arrows and diagonal consequence links. Fractional coordinate scaling needed 3 reference pixels of inner caption padding so rounded text bounds stayed inside their parent regions; the engine's containment tolerance was not changed.

## Verification and artifacts

Both final render operations passed validation, catalog verification and fitting on their first attempt. `verifyPublication` checked every file in both complete exports: 14 Satori files and 13 Chromium files. [verification.json](verification.json) records runtime, output hashes and results. The legacy October 11 fixture also rendered successfully in both backends during preflight.

Retained files include both PNGs, both standalone offline HTML files, Satori SVG, thumbnails and receipts. Standard HTML with local assets was also generated and verified; replay it below rather than duplicating the asset tree here. Each `export-manifest.json` describes the original complete export, not the compact retained folder. Receipt home-directory prefixes alone were sanitized to `~`; original receipt hashes remain in the export manifests, while [SHA256SUMS](SHA256SUMS) hashes retained bytes. PNG, SVG and inline HTML bytes are unchanged.

- [Satori SVG](renders/satori/render.svg)
- [Satori standalone HTML](renders/satori/render-inline.html)
- [Chromium standalone HTML](renders/playwright/render-inline.html)

## Replay

Use source commit `636f476` for the exact recipe and assets, or the later artifact commit for the retained renders and design record. Install locked dependencies with `pnpm install --frozen-lockfile` and ensure the repository-supported Chromium is available. Recorded runtime: Node 22.22.3, macOS arm64.

```sh
node tools/catalog.mjs verify
node tools/render.mjs examples/2026-10-12-belief-reference/fixture.json \
  --recipe recursive-process --backend satori --format png,svg,html,html-inline \
  --out .relay-scratch/belief-reference-satori
node tools/render.mjs examples/2026-10-12-belief-reference/fixture.json \
  --recipe recursive-process --backend playwright --format png,html,html-inline \
  --out .relay-scratch/belief-reference-playwright
```

Each output root's `manifest.json.current` selects its immutable run folder. Random run IDs, timing measurements and absolute input paths vary; output digests record the visual evidence. At the artifact commit, verify the retained files with:

```sh
(cd examples/2026-10-12-belief-reference && shasum -a 256 -c SHA256SUMS)
```

The catalog design command executed once after final review was:

```sh
node tools/catalog.mjs design add 2026-10-12-belief-reference \
  --fixture examples/2026-10-12-belief-reference/fixture.json \
  --artifact examples/2026-10-12-belief-reference/renders/satori/render.png \
  --use-case recursive-process@3.0.0 --workarounds 1 \
  --friction 'Reference anchors with pinned generated PNGs; existing display converter handles provider provenance chunks.'
```

Existing design IDs reject duplicate additions. Historical versions require their matching Git checkout because the catalog is an identity ledger, not a runtime version loader. The parent task records final repository tests and governance checks in the combined branch's changelog.
