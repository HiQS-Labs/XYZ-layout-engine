# Fuel Well. Live Well. — Nutrition Infographic (`nutrition@3.0.0`)

Current recipe: `nutrition@3.0.0` (directional ground/contact cast shadows per `AS-11`), governed by [DESIGN.md](DESIGN.md). Historical `nutrition@2.0.0`..`2.0.2` renders are retained in `renders/` and [verification.json](verification.json).
Open the [backend comparison gallery](index.html), [Satori HTML](renders-v3/satori/render-inline.html),
[Chromium HTML](renders-v3/playwright/render-inline.html), [Satori PNG](renders-v3/satori/render.png),
[Chromium PNG](renders-v3/playwright/render.png), or [Satori SVG](renders-v3/satori/render.svg).

## Overview & Design Direction

This example converts the reference poster (`PROJECT/2-WORKING/layout-engine-reference.png`)
into a self-contained example bundle under `examples/2026-10-13-nutrition-infographic/`
paired with a dedicated [DESIGN.md](DESIGN.md) style guide and art direction contract
implemented by [`tools/recipes/nutrition.mjs`](../../tools/recipes/nutrition.mjs) (`nutrition@3.0.0`):

1. **Bundled `Barlow Condensed` with ALL CAPS headlines:**
   - Loads `BarlowCondensed-Regular.ttf` (`400`) and `BarlowCondensed-Bold.ttf` (`700`)
     from `tools/fonts/barlow-condensed/`.
   - All headline and title nodes (`header_headline`, `callout_1_title`, `callout_2_title`,
     `item_1_title`..`item_4_title`, `benefit_1`..`benefit_4`, and `footer_text`)
     enforce `fontWeight: 700` and `textTransform: 'uppercase'`.
   - Subtitle, captions, and tagline remain in `Barlow Condensed` Regular (`400`)
     with mixed case for clear typographic contrast.
2. **Radial-gradient cream canvas:**
   - The `1000 × 1000` `#canvas` root uses
     `backgroundImage: 'radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)'`
     with fallback `backgroundColor: '#fbfaf3'` (`theme.background`), creating a warm luminous center
     behind the glowing leaf hero that deepens softly toward the outer edges.
3. **Seven `gpt-image-2.5-flare` transparent PNG illustrations with directional ground/contact cast shadows (`AS-11`):**
   - Pinned via `readPinnedPngs` from `examples/2026-10-13-nutrition-infographic/provenance.json`
     (`leaf_glow`, `balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`,
     `chicken_wrap`, `water_bottle`), all verified with `alpha.verified: true` and
     `opaqueCornerCount: 0`.
   - Grounded 3D cutouts (`balance_scale`, `skip_spike`, `parfait_jar`,
     `snack_container`, `chicken_wrap`, `water_bottle`) replace whole-shape silhouette
     `drop-shadow` filters with a two-layer SVG `<radialGradient>` ground shadow
     (tight `contact` occlusion ellipse + directional lower-left `cast` ellipse from an
     upper-right corner light source) rendered inside a `position: 'relative'` stage
     behind each cutout `<img>`, and `chicken_wrap` (`item_3_img`) is aligned (`top: 60, height: 107`)
     onto the bottom-row tabletop ground plane (`visibleBaseY = 154`).
   - The central glowing leaf (`leaf_glow`) retains its warm golden aura drop shadow
     `filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` so its translucent
     white-gold feather blends seamlessly into the cream radial center.
4. **Crisp vector SVG benefit badges & botanical ornaments:**
   - Small monochrome benefit badges (`icon_energy`, `icon_focus`, `icon_immunity`,
     `icon_wellbeing`) and header/footer ornaments (`leaf_small`, `heart`) remain
     crisp vector SVGs loaded from `tools/spike/assets/illustrations.svg`.

## AS-1..AS-11 Review (`SYSTEM-INSTRUCTIONS.md`)

- **Audience & takeaway:** General health-conscious reader scanning a 1-page daily
  nutrition guide; primary takeaway is choosing balanced whole-food fuel over
  sugary spikes for sustained energy and focus.
- **Visual hierarchy (3 levels):**
  1. Central glowing leaf hero (`leaf_glow`) and `50px` bold uppercase headline
     (`FUEL WELL. LIVE WELL.`).
  2. Left/right comparison callouts (`BALANCED NUTRITION` vs. `SKIP THE SPIKE`).
  3. Bottom row of four actionable food items (`NUTRITIOUS`, `PORTABLE`, `CONVENIENT`,
     `HYDRATED`), right-hand benefits summary card, and pill footer.
- **AS-1, AS-4 (Reference-governed composition):** Preserves the 3-tier asymmetric
  poster grid (`1000 × 1000`) from the reference diagram rather than flattening into
  uniform cards.
- **AS-2 (Gradients, glow & grounding shadows — recorded exception):** The radial canvas
  gradient (`#fffef8` → `#f7f3e3` → `#ede6cf`), the luminous halo/sparkles inside
  `leaf_glow.png` (`drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`), and the six
  tabletop ground/contact cast shadows are explicitly requested by the operator and
  reference poster and recorded in [DESIGN.md](DESIGN.md).
- **AS-3 (Containers & borders — recorded exception):** The bordered sage
  `benefitsPanel` (`borderRadius: 16`, `2px solid #b9d79b`) and full-width pill
  `footer` (`borderRadius: 999`) are retained to reproduce the reference poster's
  lower-right benefits summary card and closing banner.
- **AS-5 (Single owner for layout & styling):** `fixture.json` owns copy, asset IDs,
  and palette tokens; `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`) owns the
  fixed geometry, `Barlow Condensed` uppercase typography, gradient, and directional
  ground/contact shadow contract.
- **AS-6 (Ornament & visual metaphor — recorded reference exception):** The flanking
  header/footer leaf (`ornamentId: "leaf_small"`) and heart (`endIconId: "heart"`)
  SVG ornaments and the central glowing leaf metaphor (`leaf_glow`) are retained
  as a reference-reproduction exception to match
  `PROJECT/2-WORKING/layout-engine-reference.png`. Small monochrome benefit badges
  (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`) and ornaments
  stay crisp SVG vectors rather than raster PNGs.
- **AS-7 (Reference slogan copy & illustrative study framing — recorded exception):**
  `SYSTEM-INSTRUCTIONS.md` AS-7 cites `"Fuel well. Live well."` as an example of
  slogan copy that should normally be rewritten into specific claims. Here,
  `"FUEL WELL. LIVE WELL."` and the closing banner (`"GOOD FUEL. EVERY DAY. EVERY WHERE."`
  / `"Small choices. Big impact."`) are retained verbatim because `fixture.json`
  reproduces the canonical spike reference poster (`PROJECT/2-WORKING/layout-engine-reference.png`
  / `tools/spike/fixture.json`). This bundle is an illustrative reference-reproduction
  study, not a clinical nutrition claim.
- **AS-8, AS-9 (Cohesive illustration family):** All 7 PNG assets share warm natural
  food-illustration lighting and transparent backgrounds recorded in [ASSETS.md](ASSETS.md)
  and [provenance.json](provenance.json).
- **AS-10, AS-11 (Full-size & thumbnail visual inspection + directional ground shadows):**
  Inspected both final PNGs at full `1000 × 1000` resolution and `420 × 420` thumbnails
  (`renders-v3/satori/thumbnail.png` and `renders-v3/playwright/thumbnail.png`). All six
  tabletop 3D cutouts anchor cleanly on the surface with lower-left cast + contact
  occlusion shadows (`L(P_bg_base) - L(P_cast) = 51.61` Satori / `44.90` Chromium at
  `(617, 836)` vs. `(577, 836)`) and zero upper-silhouette shadow halo (`|L(P_bg_upper) - L(P_upper)| = 0.00`
  Satori / `0.89` Chromium at `(619, 728)` and `|L(P_bg_cap) - L(P_cap_under)| = 0.11` at `(649, 690)` vs.
  `13.0` on the historical `nutrition@2.0.0` red control). Both backends fit on attempt 1
  (`iterations: 0`).

## Verification & Replay

Both complete backend exports passed validation, catalog verification (`nutrition@3.0.0`),
first-attempt text fitting (`attempts: 1`, `iterations: 0`), and publication digest
checks; see [verification-v3.json](verification-v3.json), historical [verification.json](verification.json), and [SHA256SUMS](SHA256SUMS).

```sh
# Render Satori + resvg bundle (nutrition@3.0.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-satori \
  --backend satori \
  --format png,svg,html,html-inline

# Render Chromium (Playwright) bundle (nutrition@3.0.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-playwright \
  --backend playwright \
  --format png,html,html-inline

# Verify retained file digests
(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)
```

