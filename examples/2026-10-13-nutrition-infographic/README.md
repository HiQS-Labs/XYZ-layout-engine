# Fuel Well. Live Well. — Nutrition Infographic (`nutrition@4.0.0`)

Current recipe: `nutrition@4.0.0` (proportional `% of S` type scale per `AS-12` + directional ground/contact cast shadows per `AS-11`), governed by [DESIGN.md](DESIGN.md). Historical `nutrition@2.0.0`..`2.0.2` renders (`renders/`, [verification.json](verification.json)) and `nutrition@3.0.0` renders (`renders-v3/`, [verification-v3.json](verification-v3.json)) are retained unchanged.
Open the [backend comparison gallery](index.html), [Satori HTML](renders-v4/satori/render-inline.html),
[Chromium HTML](renders-v4/playwright/render-inline.html), [Satori PNG](renders-v4/satori/render.png),
[Chromium PNG](renders-v4/playwright/render.png), or [Satori SVG](renders-v4/satori/render.svg).

## Overview & Design Direction

This example converts the reference poster (`PROJECT/2-WORKING/layout-engine-reference.png`)
into a self-contained example bundle under `examples/2026-10-13-nutrition-infographic/`
paired with a dedicated [DESIGN.md](DESIGN.md) style guide and art direction contract
implemented by [`tools/recipes/nutrition.mjs`](../../tools/recipes/nutrition.mjs) (`nutrition@4.0.0`):

1. **Bundled `Barlow Condensed` with ALL CAPS headlines and proportional `% of S` type scale (`AS-12`):**
   - Loads `BarlowCondensed-Regular.ttf` (`400`) and `BarlowCondensed-Bold.ttf` (`700`)
     from `tools/fonts/barlow-condensed/`.
   - Derives all text sizes proportionally from `S = Math.min(width, height) = 1000px`
     (`CANVAS_SHORTER_SIDE = 1000`, `TYPE_SCALE_PCT = { headline: 0.092, subhead: 0.031, sectionLabel: 0.025, body: 0.021 }`
     → `92px`, `31px`, `25px`, `21px`), enforcing strictly `4` distinct sizes on the canvas,
     a `4.38:1` (`>= 4:1`) headline-to-body ratio, a `79.0%–79.4%` (`50–85%`) headline width,
     a `191.25px <= 3.0 × 64.4px = 193.2px` illustration-to-cap-height balance, and a `73.5%` / `88.2%` (`>= 70%`)
     benefit label-to-icon height ratio.
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
   - The central glowing leaf (`leaf_glow`, `220 × 204`) retains its warm golden aura drop shadow
     `filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` so its translucent
     white-gold feather blends seamlessly into the cream radial center while remaining
     within `3.0×` of the `92px` headline cap height (`191.25px <= 193.2px`).
4. **Crisp vector SVG benefit badges & botanical ornaments:**
   - Small monochrome benefit badges (`icon_energy`, `icon_focus`, `icon_immunity`,
     `icon_wellbeing`, rendered at `34 × 34px` alongside `25px` bold uppercase labels)
     and header/footer ornaments (`leaf_small`, `heart`) remain crisp vector SVGs loaded
     from `tools/spike/assets/illustrations.svg`.

## AS-1..AS-12 Review (`SYSTEM-INSTRUCTIONS.md`)

- **Audience & takeaway:** General health-conscious reader scanning a 1-page daily
  nutrition guide; primary takeaway is choosing balanced whole-food fuel over
  sugary spikes for sustained energy and focus.
- **Visual hierarchy (3 levels):**
  1. `92px` (`9.2% of S`) bold uppercase headline (`FUEL WELL. LIVE WELL.`) and central glowing leaf hero (`leaf_glow`).
  2. `31px` (`3.1% of S`) subtitle/footer banner (`Eat Smart for Energy & Focus`, `GOOD FUEL. EVERY DAY. EVERY WHERE.`) and `25px` (`2.5% of S`) bold uppercase section/item/benefit labels (`BALANCED NUTRITION`, `SKIP THE SPIKE`, `NUTRITIOUS`, `PORTABLE`, `CONVENIENT`, `HYDRATED`, `STEADY ENERGY`..`OVERALL WELL-BEING`).
  3. `21px` (`2.1% of S`) body captions across the header, callouts, bottom food items, and footer tagline.
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
  and palette tokens; `tools/recipes/nutrition.mjs` (`nutrition@4.0.0`) owns the
  fixed geometry, proportional `% of S` `Barlow Condensed` typography, gradient, and
  directional ground/contact shadow contract.
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
- **AS-10, AS-11, AS-12 (Full-size & mobile-scale visual inspection + directional ground shadows + proportional `% of S` type scale):**
  Inspected both final PNGs at full `1000 × 1000` resolution, `500 × 500` thumbnails
  (`renders-v4/satori/thumbnail.png` and `renders-v4/playwright/thumbnail.png`), `400 × 400`
  phone width, and `333 × 333` (`~1/3` scale). Complies with all 10 rules of `AS-12`
  (`92/31/25/21px` = `9.2/3.1/2.5/2.1% of S`, `4.38:1` headline-to-body ratio, `79.0%–79.4%`
  headline width, `191.25px <= 193.2px` max graphic-to-cap-height ratio `2.97×`, `73.5%` / `88.2%`
  benefit label-to-icon ratio) while preserving `AS-11` directional ground/contact cast shadows.
  Both backends fit on attempt 1 (`iterations: 0`).

## Verification & Replay

Both backend publications (`png,svg,html,html-inline` on Satori and `png,html,html-inline` on Chromium)
passed validation, catalog verification (`nutrition@4.0.0`), first-attempt text fitting
(`attempts: 1`, `iterations: 0`), and publication digest checks. To avoid duplicating the 21
asset blobs already tracked in `assets/web/` and `tools/`, `renders-v4/satori/` and
`renders-v4/playwright/` retain the selected standalone display artifacts (`render.png`,
`render.svg` for Satori, `render-inline.html`, `result.json`, and `500 × 500` `thumbnail.png`)
plus `export-manifest.json` as publication provenance from `runs/<id>/manifest.json` (compact
`render.html` and `assets/*` were generated and verified during publication via `digests.html`
but are not retained in the flattened example directory; `renders-v4/<backend>/` is a standalone
artifact selection, not a reusable `verifyPublication` export root). See
[verification-v4.json](verification-v4.json), historical [verification-v3.json](verification-v3.json),
[verification.json](verification.json), and [SHA256SUMS](SHA256SUMS).

```sh
# Render full Satori + resvg publication root (nutrition@4.0.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-satori \
  --backend satori \
  --format png,svg,html,html-inline

# Render full Chromium (Playwright) publication root (nutrition@4.0.0)
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out tools/output/nutrition-playwright \
  --backend playwright \
  --format png,html,html-inline

# Verify retained file digests
(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)
```

