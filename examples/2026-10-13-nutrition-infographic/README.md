# Fuel Well. Live Well. — Nutrition infographic

Open the [Chromium HTML](renders-v4.1/playwright/render-inline.html), [Satori HTML](renders-v4.1/satori/render-inline.html) or [backend comparison gallery](index.html). Both HTML exports contain their fonts and artwork and work offline.

`nutrition@4.1.0` restores the large central leaf and the two-line heading proportions of the [reference poster](../../PROJECT/2-WORKING/layout-engine-reference.png). The [fixture](fixture.json) owns the copy and palette. The [recipe](../../tools/recipes/nutrition.mjs) owns the geometry and type scale. The [design guide](DESIGN.md) documents the four type roles, the target measurements and their exceptions to AS-12. The seven transparent illustrations and their provenance are described in [ASSETS.md](ASSETS.md).

## Comparing editions

- [Version 2](renders/playwright/render.png) and [version 3](renders-v3/playwright/render.png) show the earlier leaf scale.
- [Version 4.0 PNG](renders-v4/playwright/render.png) is the catalog-pinned previous design. Its [archived inline HTML](renders-v4/satori/render-inline.html) matches the original Chromium HTML byte for byte. The previously shared [Chromium HTML](renders-v4/playwright/render-inline.html) now opens the tree-of-life edition. Its [PNG](renders-v4/playwright/tree-of-life.png) uses the same typography and food illustrations as v4.1. Rebuild it with `node examples/2026-10-13-nutrition-infographic/render-tree-of-life.mjs`.
- [Version 4.1 PNG](renders-v4.1/playwright/render.png) and [SVG](renders-v4.1/satori/render.svg) are the revised exports. Compare the measurements in [verification-v4.1.json](verification-v4.1.json) with the [4.0 report](verification-v4.json).

The four base type sizes are 66, 36, 23 and 19 px. Chromium fits three wrapped benefit labels at 17 px. Satori fits them at 19 px.

## Verification and replay

The example retains a PNG, inline HTML, thumbnail, render receipt and export manifest for each backend, plus the Satori SVG. The commands below create full publication roots with all files listed by their manifests.

```sh
# Render full Satori + resvg publication root (nutrition@4.1.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-satori \
  --backend satori \
  --format png,svg,html,html-inline

# Render full Chromium (Playwright) publication root (nutrition@4.1.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-playwright \
  --backend playwright \
  --format png,html,html-inline

# Verify retained file digests
(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)
```

