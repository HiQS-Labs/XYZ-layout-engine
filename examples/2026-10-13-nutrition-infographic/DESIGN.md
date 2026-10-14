# Fuel Well. Live Well. — DESIGN.md Style Guide & Art Direction

This document is the canonical art-direction and layout style guide for the
`nutrition@3.0.0` recipe (`tools/recipes/nutrition.mjs`) and the
`examples/2026-10-13-nutrition-infographic/` example bundle (`renders-v3/`). It governs how the
engine reproduces the operator's supplied nutrition reference composition
(`PROJECT/2-WORKING/layout-engine-reference.png`) while preserving `nutrition@1.0.0`
(`tools/spike/**`) and `nutrition@2.0.0`..`2.0.2` (`renders/`) as immutable catalog history.

## 1. Reader and visual hierarchy

Reader: an everyday reader scanning a single-page poster on how balanced meals,
steady blood sugar, and hydration support daily energy and focus.

1. **Primary focal point (Hero + Header):** The central radiant green leaf
   (`leaf_glow`) and the bold condensed all-caps headline (`FUEL WELL. LIVE WELL.`)
   with subtitle (`Optimized Nutrition. Sustained Energy.`) anchor the upper half
   of the 1000 × 1000 canvas.
2. **Secondary callouts (Flanking columns):** Two illustrated callouts
   (`balance_scale` — `BALANCED NUTRITION`: *The right fuel for your body and mind.*;
   `skip_spike` — `SKIP THE SPIKE`: *Avoid sugary drinks and processed snacks.*)
   flank the central leaf with symmetric 300 px column budgets.
3. **Tertiary actionable row (Lower deck):** Four captioned meal/hydration items
   (`parfait_jar` — `NUTRITIOUS`, `snack_container` — `PORTABLE`,
   `chicken_wrap` — `CONVENIENT`, `water_bottle` — `HYDRATED`) sit on the
   lower-left alongside a bordered vertical benefits card (`benefitsPanel`:
   `SUSTAINED ENERGY`, `SHARP FOCUS`, `STRONG IMMUNITY`, `BETTER WELL-BEING`)
   on the lower-right.
4. **Closing anchor (Footer banner):** A full-width rounded pill banner summarizes
   the takeaway (`GOOD FUEL. EVERY DAY. EVERY WHERE.` | `Small choices. Big impact.`).

## 2. Typography contract (`Barlow Condensed` + ALL CAPS headlines)

All text is rendered deterministically by the layout engine using the repository's
bundled starter typeface (`tools/fonts/barlow-condensed/`, SIL Open Font License 1.1):

- **Font family:** `Barlow Condensed` (`BarlowCondensed-Regular.ttf` weight `400`,
  `BarlowCondensed-Bold.ttf` weight `700`). Zero system-font fallback is permitted.
- **Headline & title treatment (`ALL CAPS`):** Every headline and structural title
  uses `fontWeight: 700` and `textTransform: 'uppercase'`:
  - `header_headline` (default `50px`, `letterSpacing: 1.2`, `lineHeight: 1.25`)
  - `callout_1_title`, `callout_2_title` (default `20px`, `letterSpacing: 0.6`, `lineHeight: 1.25`)
  - `item_1_title` .. `item_4_title` (default `18px`, `letterSpacing: 0.5`, `lineHeight: 1.25`)
  - `benefit_1` .. `benefit_4` (default `15px`, `letterSpacing: 0.4`, `lineHeight: 1.2`)
  - `footer_text` (default `21px`, `letterSpacing: 0.8`, `lineHeight: 1.2`)
- **Supporting copy (Sentence case):** Subtitles, callout descriptions, item
  captions, and the footer tagline use `fontWeight: 400` in sentence case for
  comfortable reading contrast against the condensed uppercase headings:
  - `header_subtitle` (default `24px`, `color: palette.primary`)
  - `header_caption` (optional; omitted when empty)
  - `callout_1_text`, `callout_2_text` (default `16px`, `color: palette.muted`, `lineHeight: 1.28`)
  - `item_1_caption` .. `item_4_caption` (default `14px`, `color: palette.muted`, `lineHeight: 1.25`, `maxWidth: 167`)
  - `footer_tagline` (default `17px`, `color: palette.muted`)

## 3. Canvas gradient & palette

The 1000 × 1000 canvas uses a warm botanical cream-to-sage radial gradient that
illuminates the central leaf and grounds the surrounding food illustrations. The
delivered `fixture.json` theme and recipe canvas tokens are:

| Token | Value | Role |
|---|---|---|
| `canvas.backgroundColor` (`theme.background`) | `#fbfaf3` | Solid fallback color from `fixture.json` |
| `canvas.backgroundImage` | `radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)` | Warm ivory highlight behind the central leaf transitioning to soft sage-cream edges |
| `palette.primary` | `#2f5d27` | Deep forest green for all-caps headlines, titles, and benefit labels |
| `palette.secondary` | `#7fb04a` | Botanical leaf green secondary token |
| `palette.text` | `#1f2a1c` | Charcoal-forest body copy |
| `palette.muted` | `#3d4639` | Muted botanical olive for captions and supporting descriptions |
| `palette.panelFill` | `#f4f8ea` | Soft sage card fill for `benefitsPanel` and `footer` |
| `palette.panelBorder` | `#b9d79b` | Crisp leaf-green border (`2px solid`) for `benefitsPanel` and `footer` |

## 4. Directional ground/contact cast shadows & illustration architecture

### 4.1 Seven `gpt-image-2.5-flare` transparent PNG illustrations

Each illustrated food/subject element is an isolated transparent PNG generated
via `gpt-image-2.5-flare` (`recipe:hiqs/openai-image-generation@r2`, `quality: "high"`,
`background: "transparent"`) and downscaled to a 640 px maximum side in `assets/web/`
with verified alpha (`alpha.verified: true`, `opaqueCornerCount: 0`):

| Asset ID | Placement | Rendered box | Ground baseline (`a > 24`) | Subject summary |
|---|---|---|---|---|
| `leaf_glow` | `hero_img` | `320 × 100%` | Floating emissive focal emblem | Central upright glowing green leaf with soft yellow-green aura and light veins |
| `balance_scale` | `callout_1_img` | `280 × 210` | `baseY = 184.4`, `baseWidth = 83.1` | Dark green balance scale weighing leafy greens/avocado/berries with chickpeas/salmon/nuts |
| `skip_spike` | `callout_2_img` | `280 × 210` | `baseY = 196.5`, `baseWidth = 115.8` | Soda cup, chips, and frosted donut in front of a pale red prohibition symbol |
| `parfait_jar` | `item_1_img` | `160 × 170` | `baseY = 156.2`, `baseWidth = 73.8` | Layered mason jar yogurt parfait with oats, strawberries, and blueberries |
| `snack_container` | `item_2_img` | `160 × 170` | `baseY = 154.0`, `baseWidth = 81.0` | Open meal-prep container with green grapes and mixed nuts |
| `chicken_wrap` | `item_3_img` | `160 × 170` (`top: 60, height: 107`) | `baseY = 154.9` (`visibleBaseY = 154`), `baseWidth = 65.0` | Halved toasted tortilla wrap with grilled chicken, lettuce, and tomato aligned to row baseline |
| `water_bottle` | `item_4_img` | `160 × 170` | `baseY = 163.1`, `baseWidth = 42.0` | Sage-green insulated steel water bottle with loop cap and water-drop emblem |

### 4.2 Engine-rendered directional ground/contact cast shadows (`AS-11`)

Never ask the image model to bake floor shadows into the transparent PNGs (baked
shadows clip at the image bounding box and vary across generations), and per
`SYSTEM-INSTRUCTIONS.md` **AS-11**, never apply a whole-shape CSS `drop-shadow(...)`
filter to resting 3D cutouts (which traces the entire alpha silhouette and places a
sticker halo around upper lids, bottle loop caps, and scale crossbars).

Instead, `nutrition@3.0.0` grounds the six resting 3D cutouts (`balance_scale`,
`skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) with a
two-layer SVG `<radialGradient>` ground shadow placed inside a `position: 'relative'`
stage behind each cutout `<img>`, cast from an **upper-right corner light source** onto
the lower-left ground plane:

1. **Directional cast shadow ellipse (`cast`):** Offset to the lower-left (`dx: -16..-18`,
   `dy: +2..+4` from the resting base center, rotated `-4°..-6°`) with a soft multi-stop
   radial gradient (`#1f2a1c` alpha `0.30` at core → `0.21` at `38%` → `0.09` at `72%` → `0` at `100%`).
2. **Tight contact occlusion ellipse (`contact`):** Centered directly beneath the
   measured resting base footprint with a dense short-falloff radial gradient (`#162014`
   alpha `0.50` at core → `0.32` at `45%` → `0.10` at `78%` → `0` at `100%`).

| Asset ID (`slot`) | Stage (`W × H`) | Contact `(cx, cy, rx, ry)` | Directional Cast `(cx, cy, rx, ry, rot)` | Cutout `<img>` box |
|---|---|---|---|---|
| `balance_scale` (`callout_1_img`) | `280 × 210` | `(139, 184, 46, 6.5)` | `(122, 187, 68, 12.5, -4°)` | `top: 0, height: 210` |
| `skip_spike` (`callout_2_img`) | `280 × 210` | `(142, 194, 62, 7.5)` | `(124, 197, 84, 13.5, -4°)` | `top: 0, height: 210` |
| `parfait_jar` (`item_1_img`) | `160 × 170` | `(79, 155, 41, 6.5)` | `(63, 158, 58, 12, -5°)` | `top: 0, height: 170` |
| `snack_container` (`item_2_img`) | `160 × 170` | `(75, 152, 45, 7)` | `(58, 156, 62, 13, -6°)` | `top: 0, height: 170` |
| `chicken_wrap` (`item_3_img`) | `160 × 170` | `(72, 153, 44, 6.5)` | `(56, 156, 60, 12, -5°)` | `top: 60, height: 107` |
| `water_bottle` (`item_4_img`) | `160 × 170` | `(79, 162, 25, 5.5)` | `(61, 164, 46, 10.5, -4°)` | `top: 0, height: 170` |

- **Floating emissive hero exception (`leaf_glow` / `hero_img`):** Because the central
  botanical leaf is an upright floating emissive emblem rather than a tabletop object, it
  retains its warm botanical aura filter (`filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`).
- **Dual-backend parity (`satori` + `playwright`):** Both Satori + `@resvg/resvg-js` and
  headless Chromium render `<radialGradient>` ellipses inside `<img src="data:image/svg+xml;base64,...">`
  natively with zero upper-silhouette halos, and `publishArtifacts` extracts each shadow
  SVG into `assets/<sha256>.svg` automatically.

### 4.3 Crisp vector SVG ornaments & monochrome benefit badges

Small monochrome icons (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`)
and header/footer ornaments (`leaf_small`, `heart`) remain crisp vector SVGs loaded
from `tools/spike/assets/illustrations.svg` without raster drop shadows.

## 5. Deliberate taste & compliance record (`SYSTEM-INSTRUCTIONS.md` AS-1..AS-11)

Per `SYSTEM-INSTRUCTIONS.md`, this bundle is an illustrative reference-reproduction
study of `PROJECT/2-WORKING/layout-engine-reference.png` (`tools/spike/fixture.json`),
and the following reference-driven exceptions and compliance checks are explicitly
recorded:

- **AS-2 (Gradients, glow & grounding shadows):** `SYSTEM-INSTRUCTIONS.md` AS-2 prohibits
  decorative gradients, glows, and drop shadows by default. Here, the radial canvas
  gradient (`#fffef8` → `#f7f3e3` → `#ede6cf`), the luminous halo/sparkles inside
  `leaf_glow.png` (`drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`), and the six
  tabletop ground/contact cast shadows are explicitly directed by the operator and
  reference poster.
- **AS-3 (Containers & borders):** `SYSTEM-INSTRUCTIONS.md` AS-3 avoids default
  rounded cards unless grouping adds meaning. The bordered sage `benefitsPanel` card
  (`borderRadius: 16`, `2px solid #b9d79b`) and full-width pill `footer`
  (`borderRadius: 999`) are retained to reproduce the reference poster's lower-right
  benefits group and closing banner.
- **AS-5 (Separation of content, layout, and styling):** `fixture.json` owns copy,
  asset IDs, and palette tokens; `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`)
  owns the fixed 1000 × 1000 layout geometry, gradient, `Barlow Condensed` uppercase
  typography, and directional ground/contact shadow contract defined in this `DESIGN.md`.
- **AS-6 (Ornament & visual metaphor):** `SYSTEM-INSTRUCTIONS.md` AS-6 prohibits
  unrequested decorative clip-art and sparkles. The flanking header/footer leaf
  (`ornamentId: "leaf_small"`) and heart (`endIconId: "heart"`) SVG ornaments and the
  central glowing leaf metaphor (`leaf_glow`) are retained as a reference-reproduction
  exception to match `PROJECT/2-WORKING/layout-engine-reference.png`. Small monochrome
  benefit badges (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`) and
  ornaments remain crisp vector SVGs rather than raster images.
- **AS-7 (Reference slogan copy & illustrative study framing):** `SYSTEM-INSTRUCTIONS.md`
  AS-7 explicitly flags `"Fuel well. Live well."` as an example of slogan copy that
  should normally be rewritten into concrete claims. This bundle retains
  `"FUEL WELL. LIVE WELL."` and the closing banner (`"GOOD FUEL. EVERY DAY. EVERY WHERE."`
  / `"Small choices. Big impact."`) verbatim as a reference-reproduction exception
  because `fixture.json` is the canonical reproduction of the supplied reference
  poster (`PROJECT/2-WORKING/layout-engine-reference.png` / `tools/spike/fixture.json`).
  The infographic is an illustrative design and layout study, not a clinical nutrition claim.
- **AS-11 (Directional ground/contact cast shadows vs. whole-shape silhouette drop-shadows):**
  Complies with `AS-11`. All six tabletop 3D cutouts (`balance_scale`, `skip_spike`,
  `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) replace whole-shape
  CSS `drop-shadow` filters (`nutrition@2.0.0..2.0.2`) with two-layer SVG `<radialGradient>`
  ground/contact shadows cast from an upper-right corner light source onto their resting
  base footprints, and `chicken_wrap` is aligned (`top: 60, height: 107`) onto the bottom-row
  tabletop ground plane (`visibleBaseY = 154`).

