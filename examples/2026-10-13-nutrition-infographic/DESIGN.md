# Nutrition for Energy & Focus — DESIGN.md Style Guide & Art Direction

This document is the canonical art-direction and layout style guide for the
`nutrition@2.0.0` recipe (`tools/recipes/nutrition.mjs`) and the
`examples/2026-10-13-nutrition-infographic/` example bundle. It governs how the
engine reproduces the operator's supplied nutrition reference composition
(`PROJECT/2-WORKING/layout-engine-reference.png`) while preserving `nutrition@1.0.0`
(`tools/spike/**`) as immutable historical spike evidence.

## 1. Reader and visual hierarchy

Reader: an everyday reader scanning a single-page poster on how balanced meals,
steady blood sugar, and hydration support daily energy and focus.

1. **Primary focal point (Hero + Header):** The central radiant green leaf
   (`leaf_glow`) and the bold condensed all-caps headline (`NUTRITION FOR ENERGY & FOCUS`)
   anchor the upper half of the 1000 × 1000 canvas.
2. **Secondary callouts (Flanking columns):** Two illustrated callouts
   (`balance_scale` — *Power of Balanced Meals*; `skip_spike` — *Skip the Sugar Spike*)
   flank the central leaf with symmetric 300 px column budgets.
3. **Tertiary actionable row (Lower deck):** Four captioned meal/hydration items
   (`parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) sit on the
   lower-left alongside a bordered vertical benefits card (`benefitsPanel`) on
   the lower-right.
4. **Closing anchor (Footer banner):** A full-width rounded pill banner summarizes
   the takeaway (*NOURISH TO FLOURISH* | *Eat Well, Live Vibrantly!*).

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
illuminates the central leaf and grounds the surrounding food illustrations:

| Token | Value | Role |
|---|---|---|
| `canvas.backgroundColor` | `#f7f3e3` | Solid fallback color |
| `canvas.backgroundImage` | `radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)` | Warm ivory highlight behind the central leaf transitioning to soft sage-cream edges |
| `palette.primary` | `#2e5a27` | Deep forest green for all-caps headlines, titles, and benefit labels |
| `palette.text` | `#1f2a1c` | Charcoal-forest body copy |
| `palette.muted` | `#4a5d43` | Muted botanical olive for captions and supporting descriptions |
| `palette.panelFill` | `#eef2e2` | Soft sage card fill for `benefitsPanel` and `footer` |
| `palette.panelBorder` | `#6d9f58` | Crisp leaf-green border (`2px solid`) for `benefitsPanel` and `footer` |

## 4. Per-PNG drop shadow & illustration architecture

### 4.1 Seven `gpt-image-2.5-flare` transparent PNG illustrations

Each illustrated food/subject element is an isolated transparent PNG generated
via `gpt-image-2.5-flare` (`recipe:hiqs/openai-image-generation@r2`, `quality: "high"`,
`background: "transparent"`) and downscaled to a 640 px maximum side in `assets/web/`
with verified alpha (`alpha.verified: true`, `opaqueCornerCount: 0`):

| Asset ID | Placement | Rendered box | Subject summary |
|---|---|---|---|
| `leaf_glow` | `hero_img` | `320 × 100%` | Central upright glowing green leaf with soft yellow-green aura and light veins |
| `balance_scale` | `callout_1_img` | `280 × 210` | Dark green balance scale weighing leafy greens/avocado/berries with chickpeas/salmon/nuts |
| `skip_spike` | `callout_2_img` | `280 × 210` | Soda cup, chips, and frosted donut in front of a pale red prohibition symbol |
| `parfait_jar` | `item_1_img` | `160 × 170` | Layered mason jar yogurt parfait with oats, strawberries, and blueberries |
| `snack_container` | `item_2_img` | `160 × 170` | Open meal-prep container with green grapes and mixed nuts |
| `chicken_wrap` | `item_3_img` | `160 × 170` | Halved toasted tortilla wrap with grilled chicken, lettuce, and tomato |
| `water_bottle` | `item_4_img` | `160 × 170` | Sage-green insulated steel water bottle with loop cap and water-drop emblem |

### 4.2 Engine-applied drop shadow per transparent PNG

Never ask the image model to bake floor shadows into the transparent PNGs (baked
shadows clip at the image bounding box and vary wildly across generations). Instead,
the recipe applies an engine-rendered drop shadow to every transparent PNG node
(`callout_1_img`, `callout_2_img`, and `item_1_img` .. `item_4_img` use a grounding
charcoal-olive shadow, while `hero_img` (`leaf_glow`) uses a warm botanical glow
shadow so its translucent aura stays luminous without a grey edge):

```css
/* callout_1_img, callout_2_img, item_1_img .. item_4_img */
filter: drop-shadow(0px 8px 6px rgba(31,42,28,0.22));
/* hero_img (leaf_glow) */
filter: drop-shadow(0px 6px 8px rgba(242,228,150,0.45));
```

- **Chromium (`playwright`) backend:** Renders CSS `filter: drop-shadow(...)` natively
  against the PNG alpha channel.
- **Satori + resvg (`satori`) backend:** Satori emits `style="filter:drop-shadow(...)"`
  on `<image>` elements, and `renderSatori` (`tools/render.mjs`) rewrites each
  filtered `<image>` into a standard SVG `<defs><filter id="satori_ds_N"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="rgba(31,42,28,0.22)"/></filter></defs>`
  wrapper (`<g filter="url(#satori_ds_N)"><image .../></g>`) while stripping the
  inline CSS filter so exported SVGs never double-apply the shadow.

### 4.3 Crisp vector SVG ornaments & monochrome benefit badges

Small monochrome icons (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`)
and header/footer ornaments (`leaf_small`, `heart`) remain crisp vector SVGs loaded
from `tools/spike/assets/illustrations.svg` without raster drop shadows.

## 5. Deliberate taste exceptions (`SYSTEM-INSTRUCTIONS.md` AS-1..AS-10)

Per `SYSTEM-INSTRUCTIONS.md`, the following operator-directed exceptions are
recorded for this reference-driven infographic:

- **AS-2 (Gradients & rounded containers):** The radial canvas gradient
  (`#fffef8` → `#f7f3e3` → `#ede6cf`), rounded benefits card (`borderRadius: 16`),
  and pill footer (`borderRadius: 999`) are explicitly requested by the operator
  and reference poster.
- **AS-3 (Drop shadows):** The per-PNG `drop-shadow(0px 8px 6px rgba(31,42,28,0.22))`
  on each of the 7 transparent PNG illustrations is explicitly requested by the
  operator to ground the cutout illustrations against the gradient background.
- **AS-5 (Separation of content, layout, and styling):** `fixture.json` owns copy
  and palette tokens; `tools/recipes/nutrition.mjs` (`nutrition@2.0.0`) owns the
  fixed 1000 × 1000 layout geometry, gradient, `Barlow Condensed` uppercase
  typography, and per-PNG drop shadow contract defined in this `DESIGN.md`.
