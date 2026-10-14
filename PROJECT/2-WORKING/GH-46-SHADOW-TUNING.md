---
gh_issue: 46
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/46
title: "Diagram object shadow tuning round: directional ground/contact cast shadows vs whole-shape drop-shadow"
goal: "Replace flat whole-shape silhouette drop-shadows on grounded 3D illustration cutouts in nutrition@3.0.0 with deterministic two-layer corner-lit ground/contact cast shadows anchored at each object's base footprint across Satori+resvg and Chromium, update examples/2026-10-13-nutrition-infographic/DESIGN.md and renders-v3/, and codify AS-11 in SYSTEM-INSTRUCTIONS.md."
status: "Active — Intake registered, recon completed, and surgical plan ready for Codex plan QA"
created: 2026-10-13
updated: 2026-10-13
owner: Antigravity
doc_type: plan
complexity: 2
risk: 2
effort: 2
phases: 3
reversibility: "Easy — nutrition@1.0.0..2.0.2 and design 2026-10-13-nutrition-infographic (renders/) remain immutable in tools/catalog.sql; nutrition@3.0.0 and renders-v3/ are additive."
---

# GH-46 — Diagram object shadow tuning round: directional ground/contact cast shadows vs whole-shape drop-shadow

## Status

| What was just completed | What's next |
|---|---|
| Provisioned fresh full clone `XYZ-layout-engine-gh46-shadow-tuning-2026-10-13` on branch `feat/XYZ-layout-engine-gh46-shadow-tuning-2026-10-13` off `origin/main` (`6dda308`), registered and rated GH-46 (`70/25/50/75`) in `releases.db`, measured exact alpha base footprints for all six grounded PNGs via `@resvg/resvg-js`, and drafted the surgical 3-phase plan. | Run Codex Plan QA (`relay-system/2026-10-13/gh46-plan.codex.md`) via `relay-drive.sh`, execute Phases 1–3, run Final Codex Relay QA, and open ready PR against `main`. |

## Task Rating & Recurrence Rationale

- **Persisted RELEASES rating:** `rated 70/25/50/75` (`pri=70`, `sev=25`, `appeal=50`, `effort=75`).
  - **Priority (`70`):** Explicitly scheduled next by the operator (`"/start-task on GH 46 now"`) immediately after merging PR #45.
  - **Severity (`25`):** Visual fidelity and art-direction defect on 3D object cutouts: whole-shape CSS `drop-shadow` copies the entire upright alpha silhouette (putting a sticker halo behind upper lids/caps/crossbars) instead of grounding the object on the surface. No crash, data loss, or security impact.
  - **Appeal (`50`):** Neutral baseline (`50`) per `/start-task` rating policy (no numeric appeal override supplied by the operator).
  - **Effort / Cheapness (`75`):** Confined to `SYSTEM-INSTRUCTIONS.md`, `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`), `examples/2026-10-13-nutrition-infographic/{DESIGN.md,README.md,index.html,renders-v3/**,verification-v3.json,SHA256SUMS}`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs` (3 lines in C4), `README.md`, and `CHANGELOG.md`. Zero changes to `tools/render.mjs`, `tools/request.mjs`, or `tools/spike/{scene.mjs,fixture.json,assets.mjs,assets/**,output/**}`.
- **Recurrence check (2026-09-29..2026-10-13 vs. 2026-09-15..2026-09-28):** Searched issues/PRs #1..#46 in `HiQS-Labs/XYZ-layout-engine`. First occurrence of silhouette drop-shadow vs. directional ground/contact shadow tuning (introduced in #44 / PR #45 when adding `PNG_SHADOW = 'drop-shadow(0px 8px 6px rgba(31,42,28,0.22))'`).

## Grounded Recon & Base Footprint Measurements

- **Base commit:** `6dda3081fca3c4aabb08004361268453413cee96` (`origin/main`).
- **Observed visual discrepancy (`PROJECT/2-WORKING/layout-engine-reference.png` vs. `examples/2026-10-13-nutrition-infographic/renders/satori/render.png`):**
  - In `tools/recipes/nutrition.mjs:43`, `PNG_SHADOW = 'drop-shadow(0px 8px 6px rgba(31,42,28,0.22))'` is applied to the six grounded PNGs (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`). Because CSS `drop-shadow` and SVG `<feDropShadow>` offset the entire alpha mask of the PNG, tall upright cutouts (`parfait_jar`, `water_bottle`, `balance_scale`) get a shadow halo around their upper lid, loop cap, and top crossbar—reading like a floating paper sticker parallel to a wall.
  - In the operator's original reference diagram (`PROJECT/2-WORKING/layout-engine-reference.png`), light comes from an **upper-right / front-right corner light source**, casting a **two-layer ground-plane shadow** strictly at the **base/footprint** of each 3D object toward the **lower-left**:
    1. **Base Contact Occlusion Shadow:** A tight, darker elliptical shadow directly under the resting base where the object meets the surface (`#182015`, peak opacity `0.50`, tight vertical radius `ry = 6..8px`).
    2. **Directional Corner-Lit Cast Shadow:** A wider, softer elliptical ground shadow offset to the **lower-left** (`-dx` left, `+dy` down, rotated `-4deg` along the ground plane, `#262e20`, peak opacity `0.34`, feathering to `0` at `100%`), with **zero shadow halo around the upper body, lid, cap, or top edges** of the object.
  - Meanwhile, `leaf_glow` (`hero_img`) is a floating central botanical emblem with a luminous radial aura (`HERO_SHADOW = 'drop-shadow(0px 6px 8px rgba(242,228,150,0.45))'`), which appropriately retains its warm radial glow filter.
- **Measured alpha footprints of the 6 grounded PNGs (`@resvg/resvg-js` pixel scan at `a > 24`, bottom 12% base band):**

  | Asset ID | Slot (`boxW × boxH`) | Source PNG (`w × h`) | Rendered visible bounds `(left, top)..(right, bottom)` | Base line `baseY` | Bottom-12% `baseXSpan` | `baseCenterX` | `baseWidth` | Ground-shadow geometry `(contactCx, contactCy, contactRx, contactRy)` / `(castCx, castCy, castRx, castRy, castRotate)` |
  |---|---|---|---|---|---|---|---|---|
  | `balance_scale` | `callout_1` (`280 × 210`) | `640 × 427` | `(33.7, 20.8)..(245.9, 184.4)` | `184.4` | `[98.0, 181.1]` | `139.6` | `83.1` | Contact `(139, 184, 46, 6.5)` · Cast `(122, 187, 68, 12.5, -4)` |
  | `skip_spike` | `callout_2` (`280 × 210`) | `640 × 640` | `(45.5, 6.6)..(232.2, 196.5)` | `196.5` | `[81.6, 197.4]` | `139.5` | `115.8` | Contact `(142, 194, 62, 7.5)` · Cast `(124, 197, 84, 13.5, -4)` |
  | `parfait_jar` | `item_1` (`160 × 170`) | `427 × 640` | `(41.1, 15.4)..(118.6, 156.2)` | `156.2` | `[42.9, 116.8]` | `79.9` | `73.8` | Contact `(79, 155, 41, 6.5)` · Cast `(63, 158, 58, 12, -5)` |
  | `snack_container` | `item_2` (`160 × 170`) | `640 × 640` | `(12.3, 16.3)..(151.0, 154.0)` | `154.0` | `[34.3, 115.3]` | `74.8` | `81.0` | Contact `(75, 152, 45, 7)` · Cast `(58, 156, 62, 13, -6)` |
  | `chicken_wrap` | `item_3` (`160 × 170`) | `640 × 427` | `(27.5, 43.1)..(141.8, 126.4)` (`(27.5, 72.0)..(141.8, 154.9)` at `top: 60, height: 107`) | `126.4` (`154.9` at `top: 60, height: 107`) | `[33.5, 98.5]` | `66.0` | `65.0` | Contact `(72, 153, 44, 6.5)` · Cast `(56, 156, 60, 12, -5)` |
  | `water_bottle` | `item_4` (`160 × 170`) | `427 × 640` | `(58.9, 9.0)..(104.6, 163.1)` | `163.1` | `[58.9, 100.9]` | `79.9` | `42.0` | Contact `(79, 162, 25, 5.5)` · Cast `(61, 164, 46, 10.5, -4)` |

  *Note on `chicken_wrap` vertical alignment (`R2` resolution):* Because `chicken_wrap.png` has a `3:2` landscape aspect ratio (`640 × 427` → `160 × 106.75` at `scale = 0.25`), centering it in a `160 × 170` box leaves its bottom edge floating at `y = 126.4` (~28–30px higher than `parfait_jar` at `156.2`, `snack_container` at `154.0`, and `water_bottle` at `163.1`), and using `marginTop` inside an `alignItems: 'center'` flex container halves the effective translation (`15px`). Instead, positioning `item_3_img` explicitly with `position: 'absolute', left: 0, top: 60, width: 160, height: 107` keeps its DOM box strictly inside the `160 × 170` stage (`y + height = 167 <= 170`, avoiding any sibling overlap with `item_3_title` under `NUTRITION_CONTAINMENT` in `tools/spike/scene.mjs:31`) while shifting the rendered wrap down by `+28.5px` in both Satori and Chromium so its visible base lands at `y = 154.9` (`visibleBaseY: 154` at `a > 24`)—aligned on the exact same tabletop ground plane as `snack_container` (`154.0`) and `parfait_jar` (`156.2`).

- **Traced renderer & catalog seams:**
  - `tools/render.mjs` (`toHtml` lines 98–117, `publishArtifacts`, `renderSatori`, `renderPlaywright`) natively supports `div` (`position: 'relative'`) containing stacked `<img src="data:image/svg+xml;base64,...">` (at `position: 'absolute', left: 0, top: 0, width, height`) beneath the cutout `<img id="..._img" src="data:image/png;base64,...">`.
  - Probe verification on Satori + resvg (`@resvg/resvg-js` `2.6.2`): rendering a `160 × 170` SVG `<radialGradient>` ground shadow `<img src="data:image/svg+xml;base64,...">` produces `3329` PNG bytes vs `489` bytes for an empty canvas (`!res.png.equals(empty.png) === true`), and `publishArtifacts` automatically extracts the SVG data URI into `assets/<sha256>.svg` in compact HTML exports while keeping it inline in `render-inline.html`.
  - `tools/catalog.mjs` (`verify`, lines 218–235) verifies every row in `designs` against its `artifact_path` on disk. Because `2026-10-13-nutrition-infographic` pins `examples/2026-10-13-nutrition-infographic/renders/satori/render.png` (`43cb863870cee409acdf394e5adacc0c48b1db7d2d4d1f663d666642a46a3329`, `nutrition@2.0.0`), `examples/2026-10-13-nutrition-infographic/renders/` MUST remain untouched on disk (following the `examples/2026-10-12-belief-reference/renders-v4/` and `renders-v5/` pattern), while the new `nutrition@3.0.0` outputs are written to `examples/2026-10-13-nutrition-infographic/renders-v3/{satori,playwright}/` and registered as design `2026-10-13-nutrition-shadow-tuning` (`use_case: "nutrition@3.0.0"`).
  - Protected files that MUST remain byte-identical:
    - `tools/request.mjs` (`5f80f4a0210b5f353b9b4e853bfcc6eb2b06bbd2dcd51ef9a0aba3e06cfa7133`, declared by `recursive-process@5.0.0`)
    - `tools/spike/assets.mjs` (`b688386866d9ea0d491d8100b2aef14a4cdb76e8fbae9e6b7615c32743f4a582`, declared by `solar-system@1.0.1` and `recursive-process@5.0.0`)
    - `tools/spike/scene.mjs` (`c796e7c5a16e5cf634e4749fb407b035a864793b6fccf86af2cc1d821ad1bc8b`)
    - `tools/spike/fixture.json` (`81b520e2aab87ddf937e685736e09ce3eac8ae297825014180a6caa1ed253e95`)
    - `tools/spike/assets/**` and `tools/spike/output/**` (Canary C2 golden baseline)
    - `test-budget.json` (`0a23ad46838464f83dffafa8f48b1f85111c1ab196de8dd207866b1a45d56685`)

## Preflight Bet Check (Solution-Fit)

- **Outcome sought:** Grounded 3D cutouts in `nutrition@3.0.0` (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) exhibit realistic directional corner-lit ground/contact cast shadows at their base footprints (matching `PROJECT/2-WORKING/layout-engine-reference.png`) with zero silhouette shadow halo around their upper bodies/tops, and `SYSTEM-INSTRUCTIONS.md` (`AS-11`) + `DESIGN.md` teach AI agents to use directional ground/contact cast shadows for 3D objects resting on a surface.
- **Smallest viable bet (and explicit non-goals):**
  - Build a deterministic `groundShadowUri(boxW, boxH, spec)` SVG data-URI helper directly inside `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`) that emits a two-layer `<radialGradient>` ground shadow (`cast` ellipse offset to the lower-left from an upper-right corner light source + tight `contact` occlusion ellipse under the base footprint) rendered in a `position: 'relative'` stage behind each grounded `<img>`.
  - Keep `HERO_SHADOW` (`drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`) on `leaf_glow` (`hero_img`), since `leaf_glow` is a central floating emblem with a radial aura rather than an object resting on a tabletop.
  - **Non-goals:** No new dependencies, no changes to `tools/render.mjs` or `tools/request.mjs`, no re-generation of the 7 PNG cutouts (`assets/web/*.png` digests remain identical), and no new test files (preserving `test-budget.json` at 1 file / 4 tests / 60s / 0 workflows).
- **Alternatives rejected:**
  - *CSS/SVG `<feDropShadow>` / `filter: drop-shadow(...)` tuning:* Rejected because any alpha-silhouette offset filter copies the top half of tall objects (`parfait_jar` lid, `water_bottle` loop cap, `balance_scale` crossbar), producing a floating sticker look instead of a ground-plane shadow.
  - *Baking shadows into the generated PNGs via image prompts:* Rejected because [`DESIGN.md`](../../examples/2026-10-13-nutrition-infographic/DESIGN.md) and [`SOP.md`](../../SOP.md) forbid model-baked floor shadows (they clip against image edges and vary in angle/darkness across assets).
- **Rollback / containment:** `Easy` — `nutrition@1.0.0`, `nutrition@2.0.0`, `nutrition@2.0.1`, `nutrition@2.0.2`, and design `2026-10-13-nutrition-infographic` (`renders/`) remain untouched in `tools/catalog.sql` and on disk.

## Ordered Implementation & Inline Verification Plan

### Phase 1 — Codify `AS-11` in `SYSTEM-INSTRUCTIONS.md` and update `DESIGN.md`

1. In [`SYSTEM-INSTRUCTIONS.md`](../../SYSTEM-INSTRUCTIONS.md), add rule **`AS-11 Ground 3D cutouts with directional base/contact cast shadows, not whole-shape silhouette drop-shadows`**:
   - Specify that 3D objects resting on a floor or surface (jars, bottles, scales, containers, vehicles) must be grounded with a directional **base/contact cast shadow** anchored at the object's footprint from a consistent corner light source (e.g., upper-right light casting a lower-left ground ellipse + tight base contact occlusion), never a whole-shape CSS `drop-shadow` that duplicates the upper silhouette in mid-air. Reserve `filter: drop-shadow(...)` for flat UI badges or radial glows (`leaf_glow`).
2. In [`examples/2026-10-13-nutrition-infographic/DESIGN.md`](../../examples/2026-10-13-nutrition-infographic/DESIGN.md), update the recipe version reference to `nutrition@3.0.0` and update §4.2 & §5 to document the **Corner-Lit Directional Ground & Contact Shadow Contract** (upper-right corner light source → lower-left cast ellipse `#262e20` + tight base contact occlusion `#182015` at each object's measured footprint, tabletop baseline alignment `top: 60, height: 107` for `chicken_wrap`, and warm botanical aura `drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` reserved for `leaf_glow`).

### Phase 2 — Implement `nutrition@3.0.0` in `tools/recipes/nutrition.mjs` and generate `renders-v3/`

1. In [`tools/recipes/nutrition.mjs`](../../tools/recipes/nutrition.mjs):
   - Bump `export const version = '3.0.0';`.
   - Define `GROUND_SHADOW_SPECS` for the 6 grounded illustrations (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) using their measured base footprints and `imgTop: 60, imgHeight: 107` on `chicken_wrap`.
   - Add `groundShadowUri(boxW, boxH, spec)` returning a `data:image/svg+xml;base64,...` URI with two `<radialGradient>` definitions (`cast` and `contact`) and two `<ellipse>` elements (`cast` rotated `-4deg`..`-6deg` toward the lower-left and `contact` directly under the resting base).
   - Add `groundedImg(id, src, boxW, boxH, spec)` that returns a `div` (`position: 'relative', display: 'flex', width: boxW, height: boxH`) containing the absolute-positioned ground-shadow `<img src={groundShadowUri(boxW, boxH, spec)} style={{ position: 'absolute', left: 0, top: 0, width: boxW, height: boxH }}>` followed by the explicitly positioned cutout `<img id={id} src={src} style={{ position: 'absolute', left: 0, top: spec.imgTop ?? 0, width: boxW, height: spec.imgHeight ?? boxH, objectFit: 'contain' }}>` (with no whole-shape `filter: drop-shadow(...)` on the 6 grounded PNGs). Verify in both Satori and Chromium that `item_3_img` sits at `top: 60, height: 107` inside the `160 × 170` stage (`visibleBaseY = 154..155`).
   - Keep `HERO_SHADOW` on `hero_img` (`leaf_glow`).
2. Render `examples/2026-10-13-nutrition-infographic/fixture.json` with `nutrition@3.0.0` across both `satori` and `playwright` backends into `examples/2026-10-13-nutrition-infographic/renders-v3/{satori,playwright}/` (including `render.png`, `render.svg` for satori, `render-inline.html`, `result.json`, `export-manifest.json`, and 480px `thumbnail.png`), while keeping `examples/2026-10-13-nutrition-infographic/renders/` untouched on disk.
3. Visually inspect `renders-v3/satori/render.png`, `renders-v3/playwright/render.png`, and their thumbnails at full and thumbnail resolution against `PROJECT/2-WORKING/layout-engine-reference.png` per `SYSTEM-INSTRUCTIONS.md` AS-10 & AS-11.

### Phase 3 — Catalog Publication, Design Registration, Canaries, Docs & Verification

1. Publish `nutrition@3.0.0` via `node tools/catalog.mjs publish nutrition 3.0.0`.
2. Register the tuned design via `node tools/catalog.mjs design add 2026-10-13-nutrition-shadow-tuning --use-case nutrition@3.0.0 --fixture examples/2026-10-13-nutrition-infographic/fixture.json --artifact examples/2026-10-13-nutrition-infographic/renders-v3/satori/render.png --workarounds 0 --friction "Directional corner-lit ground/contact cast shadows at each 3D cutout base footprint replace whole-shape silhouette drop-shadows across Satori+resvg and Chromium."` (omitting `--canvas`, which `tools/catalog.mjs:321` derives from `fixture.json`).
3. Update `tools/spike/test/canaries.test.mjs` lines 488, 490, 509 from `'2.0.2'` to `'3.0.0'` so Canary C4's isolated temp-catalog publication test matches `tools/recipes/nutrition.mjs`'s exported version.
4. Update `examples/2026-10-13-nutrition-infographic/{README.md,index.html}`, write `examples/2026-10-13-nutrition-infographic/verification-v3.json`, and regenerate `examples/2026-10-13-nutrition-infographic/SHA256SUMS` covering all files in the bundle (both `renders/` and `renders-v3/`).
5. Update [`README.md`](../../README.md) and [`CHANGELOG.md`](../../CHANGELOG.md) to reflect `nutrition@3.0.0`, `2026-10-13-nutrition-shadow-tuning`, and `AS-11`.
6. **Falsifiable verification gates (with red controls):**
   - **Upper-half clean / base-footprint shadow pixel check (positive + red control):** Using `@resvg/resvg-js` RGBA pixel inspection on `renders-v3/satori/render.png` and `renders-v3/playwright/render.png`:
     - For `water_bottle` (`item_4_img`, stage origin `(x0, y0) = bounds.item_4_img`): compare upper-body exterior sample `P_upper = (x0 + 54, y0 + 55)` (`5px` left of the bottle's upper wall, `8px` below the shoulder) against the local unshadowed canvas reference `P_bg_upper = (x0 + 25, y0 + 55)`, and compare lower-left base cast sample `P_cast = (x0 + 52, y0 + 163)` (`7px` left of the bottle's bottom-left base edge) against local unshadowed canvas reference `P_bg_base = (x0 + 12, y0 + 163)`. Using perceived luma `L(p) = 0.299*R + 0.587*G + 0.114*B`:
     - **Positive gate (`renders-v3/{satori,playwright}/render.png`):** `|L(P_bg_upper) - L(P_upper)| <= 2.0` (zero upper-body drop-shadow halo) AND `L(P_bg_base) - L(P_cast) >= 18.0` (strong lower-left directional cast shadow at the base footprint).
     - **Red control (`renders/satori/render.png`, pinned to `2026-10-13-nutrition-infographic` / `nutrition@2.0.0` in `tools/catalog.sql`):** at the upper-cap/body exterior shadow offset `(x0 + 56, y0 + 24)` (`8px` below the cap hang overhang where `dy = 8, blur = 6` `<feDropShadow>` falls), `L(P_bg) - L(P_cap_under) > 6.0` whereas `renders-v3/satori/render.png` has `|L(P_bg) - L(P_cap_under)| <= 1.5`, AND at the lower-left directional cast point `P_cast = (x0 + 48, y0 + 163)` (`11px` left of the bottle base), `renders/satori/render.png` has `L(P_bg_base) - L(P_cast) < 5.0` (since `dx = 0` centered drop-shadow does not cast toward the lower-left) while `renders-v3/satori/render.png` has `L(P_bg_base) - L(P_cast) >= 18.0`.
   - `pnpm test` — all 4 canaries pass within the 60s budget (`test-budget.json` untouched).
   - `node tools/catalog.mjs verify --json` → `{"valid":true,"errors":[]}` and `node tools/catalog.mjs export --check` → `{"canonical":true}`.
   - Historical catalog immutability check: all prior `recipes`, `recipe_versions` (`nutrition@1.0.0..2.0.2`, `solar-system@1.0.0..1.0.1`, `recursive-process@1.0.0..5.0.0`), and `designs` rows in `tools/catalog.sql` remain byte-for-byte identical.
   - `(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)` — 0 failures.
   - `python3 "$HARNESS/utils/py/releases_app.py" --root . check` and `utils/pdda/pdda.sh run` — 0 errors.
