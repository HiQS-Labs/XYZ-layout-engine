# Fuel Well. Live Well. — Nutrition Infographic (`nutrition@2.0.0`)

Current recipe: `nutrition@2.0.0`, governed by [DESIGN.md](DESIGN.md).
Open the [backend comparison gallery](index.html), [Satori HTML](renders/satori/render-inline.html),
[Chromium HTML](renders/playwright/render-inline.html), [Satori PNG](renders/satori/render.png),
[Chromium PNG](renders/playwright/render.png), or [Satori SVG](renders/satori/render.svg).

## Overview & Design Direction

This example converts the reference poster (`PROJECT/2-WORKING/layout-engine-reference.png`)
into a self-contained example bundle under `examples/2026-10-13-nutrition-infographic/`
paired with a dedicated [DESIGN.md](DESIGN.md) style guide and art direction contract
implemented by [`tools/recipes/nutrition.mjs`](../../tools/recipes/nutrition.mjs) (`nutrition@2.0.0`):

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
     with fallback `backgroundColor: '#f7f3e3'`, creating a warm luminous center
     behind the glowing leaf hero that deepens softly toward the outer edges.
3. **Seven `gpt-image-2.5-flare` transparent PNG illustrations with per-PNG drop shadows:**
   - Pinned via `readPinnedPngs` from `examples/2026-10-13-nutrition-infographic/provenance.json`
     (`leaf_glow`, `balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`,
     `chicken_wrap`, `water_bottle`), all verified with `alpha.verified: true` and
     `opaqueCornerCount: 0`.
   - Grounded illustrations (`balance_scale`, `skip_spike`, `parfait_jar`,
     `snack_container`, `chicken_wrap`, `water_bottle`) receive an engine-applied
     `filter: drop-shadow(0px 8px 6px rgba(31,42,28,0.22))`.
   - The central glowing leaf (`leaf_glow`) receives a warm golden aura drop shadow
     `filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` so its translucent
     white-gold feather blends seamlessly into the cream radial center without a
     grey edge ring.
   - In Chromium (`playwright`), CSS `filter: drop-shadow(...)` renders natively;
     in Satori + resvg (`satori`), `renderSatori` (`tools/render.mjs`) translates
     `<image style="filter:drop-shadow(...)">` into an SVG `<defs><filter><feDropShadow .../></filter></defs>`
     wrapper (`<g filter="url(#satori_ds_N)"><image .../></g>`) and strips the
     inline CSS filter so exported SVGs never double-apply the shadow.
4. **Crisp vector SVG benefit badges & botanical ornaments:**
   - Small monochrome benefit badges (`icon_energy`, `icon_focus`, `icon_immunity`,
     `icon_wellbeing`) and header/footer ornaments (`leaf_small`, `heart`) remain
     crisp vector SVGs loaded from `tools/spike/assets/illustrations.svg`.

## AS-1..AS-10 Review (`SYSTEM-INSTRUCTIONS.md`)

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
- **AS-2, AS-3 (Recorded operator exceptions):** The radial canvas gradient,
  rounded sage benefits card (`borderRadius: 16`), pill footer (`borderRadius: 999`),
  and per-PNG drop shadows (`drop-shadow(0px 8px 6px rgba(31,42,28,0.22))` and
  `drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`) are explicitly requested by
  the operator and recorded in [DESIGN.md](DESIGN.md).
- **AS-5 (Single owner for layout & styling):** `fixture.json` owns copy and palette
  tokens; `tools/recipes/nutrition.mjs` (`nutrition@2.0.0`) owns the fixed geometry,
  `Barlow Condensed` uppercase typography, gradient, and drop-shadow contract.
- **AS-6, AS-7 (Honest framing & vector vs. raster split):** Monochrome badges and
  ornaments stay crisp SVG vectors; only the 7 complex food/botanical subjects use
  `gpt-image-2.5-flare` transparent PNGs.
- **AS-8, AS-9 (Cohesive illustration family):** All 7 PNG assets share warm natural
  food-illustration lighting and transparent backgrounds recorded in [ASSETS.md](ASSETS.md)
  and [provenance.json](provenance.json).
- **AS-10 (Full-size & thumbnail visual inspection):** Inspected both final PNGs at
  full `1000 × 1000` resolution and `420 × 420` thumbnails (`renders/satori/thumbnail.png`
  and `renders/playwright/thumbnail.png`). During inspection, we refined `leaf_glow`'s
  drop shadow to warm golden `rgba(242,228,150,0.45)` to eliminate a faint dark ring
  at the outer feather of its translucent aura, and tuned `item_caption` to `14px`
  (`maxWidth: 167`) so `"Simple choices for your busy day."` fits on a single balanced
  line without a single-word orphan. Both backends fit on attempt 1 (`iterations: 0`).

## Verification & Replay

Both complete backend exports passed validation, catalog verification (`nutrition@2.0.0`),
first-attempt text fitting (`attempts: 1`, `iterations: 0`), and publication digest
checks; see [verification.json](verification.json) and [SHA256SUMS](SHA256SUMS).

```sh
# Render Satori + resvg bundle
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out examples/2026-10-13-nutrition-infographic/renders/satori \
  --backend satori \
  --format png,svg,html,html-inline

# Render Chromium (Playwright) bundle
node tools/render.mjs examples/2026-10-13-nutrition-infographic/fixture.json \
  --recipe nutrition \
  --out examples/2026-10-13-nutrition-infographic/renders/playwright \
  --backend playwright \
  --format png,html,html-inline

# Verify retained file digests
(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)
```
