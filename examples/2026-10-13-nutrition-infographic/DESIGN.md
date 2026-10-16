# Fuel Well. Live Well. — DESIGN.md Style Guide & Art Direction

This document is the canonical art-direction and layout style guide for the
`nutrition@4.0.0` recipe (`tools/recipes/nutrition.mjs`) and the
`examples/2026-10-13-nutrition-infographic/` example bundle (`renders-v4/`). It governs how the
engine reproduces the operator's supplied nutrition reference composition
(`PROJECT/2-WORKING/layout-engine-reference.png`) while preserving `nutrition@1.0.0`
(`tools/spike/**`), `nutrition@2.0.0`..`2.0.2` (`renders/`), and `nutrition@3.0.0`
(`renders-v3/`) as immutable catalog history.

## 1. Reader and visual hierarchy

Reader: an everyday reader scanning a single-page poster (including on a `~400px`-wide
phone screen at `1/3` scale) on how balanced meals, steady blood sugar, and hydration
support daily energy and focus.

1. **Primary focal point (Header + Hero):** The bold condensed all-caps headline
   (`FUEL WELL. LIVE WELL.`, `92px` = `9.2% of S`, spanning `79.0%–79.4%` of the
   `1000px` canvas width) and subtitle (`Optimized Nutrition. Sustained Energy.`,
   `31px` = `3.1% of S`) anchor the top of the `1000 × 1000` canvas above the
   central radiant green leaf (`leaf_glow`, `220 × 204` stage, visible leaf height
   `191.25px <= 3.0 × 64.4px = 193.2px` headline cap height).
2. **Secondary callouts (Flanking columns):** Two illustrated callouts
   (`balance_scale` — `BALANCED NUTRITION`: *The right fuel for your body and mind.*;
   `skip_spike` — `SKIP THE SPIKE`: *Avoid sugary drinks and processed snacks.*)
   flank the central leaf with symmetric `310px` column budgets (`25px` bold all-caps
   section labels and `21px` two-line body captions).
3. **Tertiary actionable row (Lower deck):** Four captioned meal/hydration items
   (`parfait_jar` — `NUTRITIOUS`, `snack_container` — `PORTABLE`,
   `chicken_wrap` — `CONVENIENT`, `water_bottle` — `HYDRATED`, each in a `165px`
   column with `25px` titles and `21px` captions) sit on the lower-left alongside
   a bordered vertical benefits card (`benefitsPanel`, `width: 262`:
   `SUSTAINED ENERGY`, `SHARP FOCUS`, `STRONG IMMUNITY`, `BETTER WELL-BEING` at
   `25px` paired with `34 × 34px` icons) on the lower-right.
4. **Closing anchor (Footer banner):** A full-width (`940px`) rounded pill banner
   summarizes the takeaway (`GOOD FUEL. EVERY DAY. EVERY WHERE.` at `25px` |
   `Small choices. Big impact.` at `21px`).

## 2. Typography contract (`Barlow Condensed`, ALL CAPS headlines & `AS-12` `% of S` scale)

All text is rendered deterministically by the layout engine using the repository's
bundled starter typeface (`tools/fonts/barlow-condensed/`, SIL Open Font License 1.1)
and sized strictly as a percentage of **`S = Math.min(width, height) = 1000px`** per
`SYSTEM-INSTRUCTIONS.md` **AS-12**:

- **Font family:** `Barlow Condensed` (`BarlowCondensed-Regular.ttf` weight `400`,
  `BarlowCondensed-Bold.ttf` weight `700`; TrueType `head.unitsPerEm = 1000`,
  `OS/2.sCapHeight = 700`, cap-height ratio `0.70`). Zero system-font fallback is permitted.
- **Four-tier proportional type scale (`S = 1000px`, strictly 4 distinct sizes on canvas):**

  | Tier / Role | Rule (`% of S`) | Chosen `% of S` | Computed `px` (`S = 1000`) | At `1/3` scale (`333px`) | At phone width (`400px`) | Assigned Text IDs |
  |---|---|---|---|---|---|---|
  | **1. Headline** | `7–10%` (never `< 6%`) | `9.2%` | **`92px`** (`capHeight = 64.4px`) | `30.6px` | `36.8px` | `header_headline` (`700`, `uppercase`, `letterSpacing: 1.2`, `lineHeight: 1.25`, `maxWidth: 830`) |
  | **2. Subhead / tagline** | `2.5–3.5%` (`~⅓` of headline) | `3.1%` | **`31px`** | `10.3px` | `12.4px` | `header_subtitle` (`400`, sentence case, `lineHeight: 1.2`, `maxWidth: 860`) |
  | **3. Section labels** | `2.2–2.8%` (bold caps) | `2.5%` | **`25px`** | `8.3px` | `10.0px` | `callout_1..2_title`, `item_1..4_title`, `benefit_1..4`, `footer_text` (`700`, `uppercase`, `lineHeight: 1.2–1.25`) |
  | **4. Body / captions** | `1.8–2.2%` (floor `1.8%`) | `2.1%` | **`21px`** | `7.0px` | `8.4px` | `header_caption`, `callout_1..2_text` (`maxWidth: 185`), `item_1..4_caption` (`maxWidth: 165`), `footer_tagline` (`400`, sentence case, `lineHeight: 1.2–1.28`) |

- **Verified `AS-12` typographic invariants on the `1000 × 1000` canvas:**
  1. **Max 4 distinct sizes on canvas:** `new Set(Object.values(DEFAULT_SIZES))` is strictly `{92, 31, 25, 21}` (`4` sizes; unused `hero_*` keys from `tools/spike/scene.mjs` are omitted).
  2. **Headline : body ratio ≥ 4:1 (Rule 4):** `92 / 21 = 4.381 : 1 >= 4.0 : 1`.
  3. **Headline width = 50–85% of canvas width (Rule 6):** `"FUEL WELL. LIVE WELL."` spans `790px` in Satori (`79.0%`) and `793.95px` in Chromium (`79.4%`) on a single line.
  4. **Type vs. illustration balance (Rule 5, largest visible graphic ≤ `~3×` headline cap height):** At `92px`, `capHeight = 92 * (700 / 1000) = 64.4px` and `3.0 × capHeight = 193.2px`. Every cutout's inclusive visible alpha height (`a > 24`) across all 7 assets is `<= 191.25px <= 193.2px` (`leaf_glow`: `191.25px` = `2.970×`, `skip_spike`: `190.31px` = `2.955×`, `balance_scale`: `164.06px` = `2.548×`).
  5. **Icon-plus-label scan target ≥ 70% of icon height (Rule 8):** In `benefitsPanel`, each icon (`benefit_1..4_icon`) is `34 × 34px` and each label (`benefit_1..4`) is `25px` (`30px` single-line box height), giving `25 / 34 = 73.5%` (font size) and `30 / 34 = 88.2%` (rendered box height) — both `>= 70%`.
  6. **Zero adaptive shrink on default copy:** Both Satori and Chromium fit all 20 delivered text nodes on attempt `1` (`fitting.attempts === 1`, `fitting.iterations === 0`, `fitting.unresolved === []`), preserving the exact `% of S` sizes without fallback reduction.

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

| Asset ID | Placement | Rendered box | Visible height (`a > 24`) | Ground baseline (`a > 24`) | Subject summary |
|---|---|---|---|---|---|
| `leaf_glow` | `hero_img` | `220 × 204` | `191.25px` (`2.970 × capHeight`) | Floating emissive focal emblem | Central upright glowing green leaf with soft yellow-green aura and light veins |
| `balance_scale` | `callout_1_img` | `280 × 210` | `164.06px` (`2.548 × capHeight`) | `baseY = 184.4`, `baseWidth = 83.1` | Dark green balance scale weighing leafy greens/avocado/berries with chickpeas/salmon/nuts |
| `skip_spike` | `callout_2_img` | `280 × 210` | `190.31px` (`2.955 × capHeight`) | `baseY = 196.5`, `baseWidth = 115.8` | Soda cup, chips, and frosted donut in front of a pale red prohibition symbol |
| `parfait_jar` | `item_1_img` | `160 × 170` | `141.05px` (`2.190 × capHeight`) | `baseY = 156.2`, `baseWidth = 73.8` | Layered mason jar yogurt parfait with oats, strawberries, and blueberries |
| `snack_container` | `item_2_img` | `160 × 170` | `138.00px` (`2.143 × capHeight`) | `baseY = 154.0`, `baseWidth = 81.0` | Open meal-prep container with green grapes and mixed nuts |
| `chicken_wrap` | `item_3_img` | `160 × 170` (`top: 60, height: 107`) | `83.50px` (`1.297 × capHeight`) | `baseY = 154.9` (`visibleBaseY = 154`), `baseWidth = 65.0` | Halved toasted tortilla wrap with grilled chicken, lettuce, and tomato aligned to row baseline |
| `water_bottle` | `item_4_img` | `160 × 170` | `154.33px` (`2.396 × capHeight`) | `baseY = 163.1`, `baseWidth = 42.0` | Sage-green insulated steel water bottle with loop cap and water-drop emblem |

### 4.2 Engine-rendered directional ground/contact cast shadows (`AS-11`)

Never ask the image model to bake floor shadows into the transparent PNGs (baked
shadows clip at the image bounding box and vary across generations), and per
`SYSTEM-INSTRUCTIONS.md` **AS-11**, never apply a whole-shape CSS `drop-shadow(...)`
filter to resting 3D cutouts (which traces the entire alpha silhouette and places a
sticker halo around upper lids, bottle loop caps, and scale crossbars).

Instead, `nutrition@4.0.0` grounds the six resting 3D cutouts (`balance_scale`,
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
  retains its warm botanical aura filter (`filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`)
  inside a bounded `220 × 204` stage (`visibleHeight = 191.25px <= 3.0 × 64.4px = 193.2px` headline cap height).
- **Dual-backend parity (`satori` + `playwright`):** Both Satori + `@resvg/resvg-js` and
  headless Chromium render `<radialGradient>` ellipses inside `<img src="data:image/svg+xml;base64,...">`
  natively with zero upper-silhouette halos, and `publishArtifacts` extracts each shadow
  SVG into `assets/<sha256>.svg` automatically.

### 4.3 Crisp vector SVG ornaments & monochrome benefit badges

Small monochrome icons (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`,
rendered at `34 × 34px` so the `25px` / `30px`-tall labels satisfy Rule 8 `>= 70%`)
and header/footer ornaments (`leaf_small`, `heart`) remain crisp vector SVGs loaded
from `tools/spike/assets/illustrations.svg` without raster drop shadows.

## 5. Deliberate taste & compliance record (`SYSTEM-INSTRUCTIONS.md` AS-1..AS-12)

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
  asset IDs, and palette tokens; `tools/recipes/nutrition.mjs` (`nutrition@4.0.0`)
  owns the fixed 1000 × 1000 layout geometry, gradient, `Barlow Condensed` uppercase
  typography, proportional `% of S` type scale, and directional ground/contact shadow
  contract defined in this `DESIGN.md`.
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
  `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) use two-layer SVG
  `<radialGradient>` ground/contact shadows cast from an upper-right corner light source
  onto their resting base footprints, and `chicken_wrap` is aligned (`top: 60, height: 107`)
  onto the bottom-row tabletop ground plane (`visibleBaseY = 154`).
- **AS-12 (Proportional `% of S` type scale & `1/3`-scale mobile legibility):**
  Complies with all 10 rules of `AS-12` on `S = 1000px`: 4 distinct sizes (`92px, 31px, 25px, 21px`
  = `9.2%, 3.1%, 2.5%, 2.1% of S`), `4.38:1` headline-to-body ratio (`>= 4:1`), `79.0%–79.4%`
  headline width (`50–85%`), largest visible graphic height `191.25px <= 3.0 × 64.4px = 193.2px`
  headline cap height, `73.5%` / `88.2%` benefit label-to-icon height ratio (`>= 70%`), and
  verified readability at native `333 × 333` (`~1/3` scale) and `400 × 400` (phone width)
  across both Satori and Chromium.
