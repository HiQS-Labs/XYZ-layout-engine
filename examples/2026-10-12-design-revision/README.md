# Expressive editorial posters and a visible feedback loop

The three MangaJDM posters now give the supplied artwork and specific car names the main space. The belief-updating diagram uses two horizontal passes joined by a sweeping return arrow, with examination and revision in red. [Open the comparison gallery](index.html).

These are new designs for GH-38, following [the brief](DESIGN-BRIEF.md), not replacements for the October 11 artifacts. No new artwork was generated; the poster images retain their [supplied-art provenance](../2026-10-11-mangajdm-promos/provenance.json). The diagram is schematic and its outcomes remain illustrative.

## Direction and hierarchy

For car and manga enthusiasts viewing a phone post: identify the car or apparel study immediately. First, the supplied artwork owns the canvas; second, oversized subject type replaces generic slogans; third, the brand, caption and destination remain subordinate. R34 uses its portrait speed-line composition edge to edge; Integra preserves the complete wide lineup; Silvia preserves the complete supplied garment mockup.

For readers new to belief updating: recognize that consequences start the next pass and examination supplies another route. First, the sweeping C1-to-A2 path is the primary structure; second, plain-language labels lead with notation secondary; third, the red B2-to-D-to-E branch joins continuing beliefs alongside C2. B3, B4 and the ellipsis indicate continuation rather than a promised outcome.

## AS review

| Rules | Decision and observed result |
|---|---|
| AS-1, AS-4 | Unequal type and artwork hierarchy, with separate compositions for portrait, landscape and garment art. The diagram prioritizes the return route over column framing. |
| AS-2, AS-3 | Solid paper/ink/red palettes; removed dots, corner stripes, heavy bars, framed artwork cards and button-shaped CTAs. No gradients, glows or shadows. The R34 footer has a plain paper backing because existing speed lines otherwise cross its copy. |
| AS-5 | Palette roles live in `theme.palette`. Intentional exception: fixed geometry/type remains recipe-owned rather than adding inert style controls to the fixture schema. Base spacing is 8px; corners are square; no shadows; one light footer rule in the diagram. Diagram connectors use 6px for ordinary flow, 8px for the return/revision route and 4px for C2 continuation. Text uses 1.3 line height (diagram title 1.2), weight 400 for supporting copy and 700 for labels. Poster sizes: 156/88 headline, 24 metadata, 32 supporting/action, 36 destination. Diagram sizes: 72 title, 28 subtitle/trail, 34 labels, 25 captions, 20 stage/source and 22 note. Inter is deliberately retained for brand continuity; the diagram uses pinned Barlow Condensed. No fonts added. |
| AS-6, AS-8 | Existing manga speed lines belong to the supplied artwork. Diagram imagery depicts conversation, interpretation as a lens, strained/repaired links, examination as a questioning lens and a revised written outlook; ornamental rings and hexagon badges are gone. |
| AS-7 | Concrete R34/Integra/Silvia copy. Shirt material is not asserted. The apparel concept disclaimer and diagram schematic/source wording remain. No new numerical claims, logos or clinical promises. |
| AS-9 | No image generation and no image prompts. |
| AS-10 | Separate review of all eight final PNGs at original resolution and 360px-long-edge thumbnails, both Satori and Chromium. Checked crops, hierarchy, all semantic connections, caption fit and footer contrast. Main subjects/routes survive thumbnail reduction; diagram explanatory captions require full size. Small backend glyph/raster differences remain. |

Review fixes: backed the R34 footer with paper, preserved the full shirt image below its headline, corrected the diagram subtitle to describe interpretation, replaced a deletion-like slash with a question mark, and connected C2 continuously to the continuing-beliefs area. Parent review independently checked the previews and final artifacts.

## Versions and evidence

Final recipes: `mangajdm-promo@3.0.0` and `recursive-process@2.0.0`.

- `35a77e1`: new recipe implementations, fixtures, and both initial 2.0.0 publications.
- `ec7ed24`: final source; MangaJDM 3.0.0 keeps supporting copy regular.
- The later artifact commit adds this gallery, PNGs, receipts, hashes and four new design registrations. Locate it with `git log --diff-filter=A --format=%H -- examples/2026-10-12-design-revision/index.html`.

MangaJDM 2.0.0 is preserved as a superseded local attempt. The Integra fixture had only bold text; two identical Chromium exports failed its existing regular-font readiness check. Direct probes found no Satori missing glyphs, but `fontLoaded: false`; changing only the supporting sentence to regular made it true. Root cause: the engine checks the regular face even for an all-bold scene. Fix site: the recipe's unnecessary bold supporting text. The engine and its guards are unchanged. Strict repository semver requires a major version when prior output changes, so the correction is 3.0.0. No design is registered against 2.0.0.

[verification.json](verification.json) records eight successful exports, all fit on the first attempt, with verified catalog receipts. Full formats executed: Satori PNG/SVG/HTML/inline HTML; Chromium PNG/HTML/inline HTML. Every exported file digest was checked. `renders/` retains compact evidence: PNGs, 360px thumbnails, receipts and full export digest manifests. The large SVG/HTML/assets exports are reproducible below rather than duplicated here. Each `export-manifest.json` describes the original complete export, not the compact folder. Receipt home-directory prefixes alone were sanitized to `~`; consequently their original export hashes differ from the retained receipt hashes in [SHA256SUMS](SHA256SUMS). PNG bytes are untouched.

## Replay

Use a clean checkout at `ec7ed24` for exact final source, or the later artifact commit to also obtain the committed evidence. Install the locked dependencies with `pnpm install --frozen-lockfile`; ensure the repository-supported Chromium is installed. Run from the repository root on Node 22.22.3 (the recorded environment was macOS arm64).

```sh
node tools/catalog.mjs verify
for stem in 01-icon 02-eras 03-wear 04-belief; do
  recipe=mangajdm-promo
  if [ "$stem" = 04-belief ]; then recipe=recursive-process; fi
  node tools/render.mjs "examples/2026-10-12-design-revision/$stem.fixture.json" \
    --recipe "$recipe" --backend satori --format png,svg,html,html-inline \
    --out ".relay-scratch/replay-$stem-satori"
  node tools/render.mjs "examples/2026-10-12-design-revision/$stem.fixture.json" \
    --recipe "$recipe" --backend playwright --format png,html,html-inline \
    --out ".relay-scratch/replay-$stem-playwright"
done
```

Each output root's `manifest.json.current` selects the immutable run folder. Receipt timings, absolute input paths and random run IDs vary; PNG digests are the visual comparison evidence. Verify retained files at the artifact commit with:

```sh
(cd examples/2026-10-12-design-revision && shasum -a 256 -c SHA256SUMS)
```

The original README render commands require a separate checkout at baseline `9f5aa7947e9518445771964129cd4554c5c11c76` to reproduce the original October 11 compositions. The CLI selects current recipe modules; historical catalog entries are an identity ledger, not a version loader. Original fixtures, images, exports and published catalog rows are preserved byte-for-byte.

## Design registration replay

The catalog CLI is the only writer. These commands were executed once in the artifact commit; replaying an existing ID correctly refuses it. Run only at the source commit if reconstructing the artifact catalog additions:

```sh
for stem in 01-icon 02-eras 03-wear; do
  node tools/catalog.mjs design add "2026-10-12-mangajdm-$stem-editorial" \
    --fixture "examples/2026-10-12-design-revision/$stem.fixture.json" \
    --artifact "examples/2026-10-12-design-revision/renders/$stem/satori/render.png" \
    --use-case mangajdm-promo@3.0.0 --workarounds 1 \
    --friction 'Editorial artwork layouts; regular supporting copy avoids existing all-bold font-readiness limitation.'
done
node tools/catalog.mjs design add 2026-10-12-belief-feedback-editorial \
  --fixture examples/2026-10-12-design-revision/04-belief.fixture.json \
  --artifact examples/2026-10-12-design-revision/renders/04-belief/satori/render.png \
  --use-case recursive-process@2.0.0 --workarounds 0 \
  --friction 'Recipe-owned sweeping feedback geometry; no engine changes.'
```

Recipe modules retain bounded fixture validation, text IDs and containment checks. Legacy fixtures were also rendered successfully during preparation. No dependencies, engine abstractions or new tests were added; the parent ran `pnpm test`: 4/4 passed in 36.8 seconds within the unchanged 60-second budget. Final PDDA checks are recorded by the parent task.
