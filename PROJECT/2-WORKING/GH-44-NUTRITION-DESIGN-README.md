---
gh_issue: 44
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/44
title: "Refresh README, move MangaJDM studies to temp/, and deliver Nutrition DESIGN.md example"
goal: "Update README.md to reflect current capabilities, move MangaJDM example folders into gitignored temp/ManagaJDM projects/ while retiring their public catalog rows, and deliver examples/2026-10-13-nutrition-infographic/ with a DESIGN.md style guide and nutrition@2.0.0 recipe (Barlow Condensed ALL CAPS headlines, gradient canvas, per-PNG drop shadows, and pinned gpt-image-2.5-flare transparent PNGs)."
status: "Active — Plan drafted; running Codex relay plan QA"
created: 2026-10-13
updated: 2026-10-13
owner: Antigravity
doc_type: plan
complexity: 2
risk: 2
effort: 2
phases: 3
reversibility: "Easy for source/README/example additions; Costly if untracked temp/ copies were lost (mitigated by copying MangaJDM folders to temp/ManagaJDM projects/ on both hosts before git rm)."
---

# GH-44 — Refresh README, move MangaJDM studies to temp/, and deliver Nutrition DESIGN.md example

## Status

| What was just completed | What's next |
|---|---|
| Created GH-44, cut dedicated task clone on `feat/gh44-nutrition-design` from `origin/main` (`7882464`), completed recon (`relay-system/2026-10-13/gh44-recon.md`), and confirmed operator choices for catalog cleanup, 7 transparent PNG assets, and branching from `main`. | Register GH-44 in `releases.db`, run Codex relay plan QA, execute Phases 1–3, verify all 4 canaries and PDDA checks, run final Codex relay QA, and open ready PR. |

## Scope and bet

- **Assumption & bet:** Moving `examples/2026-10-11-mangajdm-promos` and `examples/2026-10-12-design-revision` (plus `tools/recipes/mangajdm-promo.mjs`) into gitignored `temp/ManagaJDM projects/` while removing their public catalog rows (`mangajdm-promo` and the 7 design rows in those two folders) keeps MangaJDM work strictly private under `temp/` and keeps `node tools/catalog.mjs verify` green. Delivering `examples/2026-10-13-nutrition-infographic/` with a sample `DESIGN.md` style guide and `nutrition@2.0.0` in `tools/recipes/nutrition.mjs` (using bundled `Barlow Condensed` with `ALL CAPS` headlines, a warm gradient canvas background, per-PNG drop shadows across both Satori+resvg and Chromium, and the 7 verified `gpt-image-2.5-flare` transparent PNG elements via `readPinnedPngs`) satisfies the operator's art direction while leaving `tools/spike/**` (`nutrition@1.0.0` history and Canary C2 golden comparison) and `tools/request.mjs` (`recursive-process@5.0.0` pin) byte-identical.
- **Tradeoff:** Satori `0.36.0` emits CSS `style="filter:drop-shadow(...)"` on `<image>` elements in SVG, which Chromium renders natively in HTML/PNG, whereas `@resvg/resvg-js` (`2.6.2`) only renders SVG `<filter><feDropShadow .../></filter>`. A narrow 8-line SVG post-pass in `renderSatori` (`tools/render.mjs`) translates `style="filter:drop-shadow(<dx>px <dy>px <blur>px <color>)"` on `<image>` into `<defs><filter><feDropShadow .../></filter></defs>` + `<g filter="url(#...)"><image .../></g>` only when `svg.includes('style="filter:drop-shadow(')`, so both backends render the per-PNG drop shadow and every existing recipe without `filter: drop-shadow(...)` produces byte-identical SVG/PNG output.
- **Failure modes & guards:**
  1. Modifying `tools/request.mjs` or `tools/spike/assets.mjs` would break `recursive-process@5.0.0` or `solar-system@1.0.1` in `node tools/catalog.mjs verify` — guard: keep both files byte-identical (`5f80f4a0210b5f353b9b4e853bfcc6eb2b06bbd2dcd51ef9a0aba3e06cfa7133` and `b688386866d9ea0d491d8100b2aef14a4cdb76e8fbae9e6b7615c32743f4a582`).
  2. Modifying `tools/spike/scene.mjs` or `tools/spike/assets/generated/web/*.png` would break Canary C2 (`guards: unintended visual or layout drift`) and `nutrition@1.0.0` history — guard: keep `tools/spike/scene.mjs`, `tools/spike/fixture.json`, `tools/spike/assets/**`, and `tools/spike/output/**` byte-identical.
  3. Canary C1 and C4 copy `tools/` into isolated temp directories and run `nutrition` — guard: copy `examples/2026-10-13-nutrition-infographic` and `tools/fonts/barlow-condensed` into C1/C4's isolated temp roots (matching `examples/2026-10-08-solar-system` in C4) and update C1's `assertOfflineExport` font family (`'Barlow Condensed'`) and C4's isolated publish version (`'2.0.0'`).
- **Reversibility:** `Easy` for code, `README.md`, and new example addition; `Costly` if untracked `temp/` files were lost (prevented by copying `2026-10-11-mangajdm-promos`, `2026-10-12-design-revision`, and `mangajdm-promo.mjs` into `temp/ManagaJDM projects/` on both `Noels-Mac-Studio.local` and the local host before `git rm`).

## Ordered implementation and verification

### Phase 1 — Move MangaJDM folders to `temp/ManagaJDM projects/` and clean public catalog

1. Copy `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` into `temp/ManagaJDM projects/` on both `Noels-Mac-Studio.local` (`~/Documents/GH Repos/XYZ-layout-engine/temp/ManagaJDM projects/`) and local `temp/ManagaJDM projects/`, and verify file counts and SHA-256 digests before removing tracked copies.
2. `git rm -r examples/2026-10-11-mangajdm-promos examples/2026-10-12-design-revision tools/recipes/mangajdm-promo.mjs`.
3. Remove the `mangajdm-promo` branch from `tools/render.mjs` and `tools/catalog.mjs` (`declaredFiles`), and remove the `mangajdm-promo` recipe/version/file/output rows and the 7 moved design rows (`2026-10-11-mangajdm-eras`, `2026-10-11-mangajdm-icon`, `2026-10-11-mangajdm-wear`, `2026-10-12-mangajdm-01-icon-editorial`, `2026-10-12-mangajdm-02-eras-editorial`, `2026-10-12-mangajdm-03-wear-editorial`, `2026-10-12-belief-feedback-editorial`) from `tools/catalog.sql` and `tools/design-log.jsonl`. Leave `tools/request.mjs` and `tools/spike/assets.mjs` byte-identical.

### Phase 2 — Deliver `examples/2026-10-13-nutrition-infographic/`, `DESIGN.md`, and `nutrition@2.0.0`

1. In `tools/render.mjs` (`renderSatori`), add the narrow SVG post-pass that converts `style="filter:drop-shadow(<dx>px <dy>px <blur>px <color>)"` on `<image>` elements into `<defs><filter id="satori_ds_N" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="<dx>" dy="<dy>" stdDeviation="<blur>" flood-color="<color>"/></filter></defs>` and `<g filter="url(#satori_ds_N)"><image .../></g>` when `svg.includes('style="filter:drop-shadow(')`.
2. Create `examples/2026-10-13-nutrition-infographic/` containing:
   - `DESIGN.md` — sample style guide and art direction contract for the nutrition infographic (`layout-engine-reference.png` / `0-1780122010113.png`), specifying `Barlow Condensed` (Regular 400 + Bold 700) with `ALL CAPS` (`textTransform: 'uppercase'`) for headline areas (`header_headline`, callout titles, item titles, benefit labels, footer banner), a warm cream-to-sage radial/linear gradient canvas background, a soft grounding drop shadow (`drop-shadow(0px 8px 6px rgba(31,42,28,0.22))`) per transparent PNG file, and explicit AS-2/AS-3/AS-5 taste-exception rationale.
   - `artwork.json`, `ASSETS.md`, `provenance.json`, `assets/web/{leaf_glow,balance_scale,skip_spike,parfait_jar,snack_container,chicken_wrap,water_bottle}.png`, and `receipts/*.result.json` — the 7 verified `gpt-image-2.5-flare` transparent PNG elements (`recipe:hiqs/openai-image-generation@r2`, `background: "transparent"`, `alpha.verified: true`) and their sanitized receipts, while the 4 small monochrome benefit icons (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`) and leaf/heart ornaments remain crisp vector SVGs from `tools/spike/assets/illustrations.svg`.
   - `fixture.json` — 1000×1000 nutrition infographic fixture (`id: "nutrition-infographic"`).
3. Update `tools/recipes/nutrition.mjs` to `version = '2.0.0'`:
   - Export `FONT = { family: 'Barlow Condensed', regular: ..., bold: ... }`.
   - Load the 7 transparent PNG assets via `readPinnedPngs` from `examples/2026-10-13-nutrition-infographic/` (`provenance.json`) and ornaments/benefit icons via `resolveIllustration`.
   - Build the 1000×1000 scene with `fontFamily: FONT.family`, `backgroundImage: 'radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)'` on `#canvas`, `textTransform: 'uppercase'` on all headline/title nodes, and `filter: 'drop-shadow(0px 8px 6px rgba(31,42,28,0.22))'` on each of the 7 transparent PNG `<img>` elements.
4. Update `declaredFiles(root, 'nutrition')` in `tools/catalog.mjs` for `2.0.0` (`tools/recipes/nutrition.mjs`, `tools/spike/fixture.json`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/assets/illustrations.svg`, `tools/fonts/barlow-condensed/BarlowCondensed-{Regular,Bold}.ttf`, `examples/2026-10-13-nutrition-infographic/{DESIGN.md,artwork.json,fixture.json,provenance.json}`, and `examples/2026-10-13-nutrition-infographic/assets/web/*.png`), keeping `nutrition@1.0.0` immutable in `tools/catalog.sql`.
5. Publish `nutrition@2.0.0` via `node tools/catalog.mjs publish nutrition 2.0.0`, render both `satori` and `playwright` complete bundles (`png,svg,html,html-inline` and `png,html,html-inline`), inspect full-size and 420px thumbnail renders (AS-10), write `examples/2026-10-13-nutrition-infographic/{README.md,index.html,verification.json,SHA256SUMS}`, and register the design via `node tools/catalog.mjs design add 2026-10-13-nutrition-infographic --fixture examples/2026-10-13-nutrition-infographic/fixture.json --artifact examples/2026-10-13-nutrition-infographic/renders/satori/render.png --use-case nutrition@2.0.0`.
6. Update `tools/spike/test/canaries.test.mjs` so C1 and C4 copy `examples/2026-10-13-nutrition-infographic` into their isolated temp directories, C1 checks `'Barlow Condensed'` on `nutrition`, and C4 publishes `'2.0.0'` in its isolated catalog control while still testing tamper detection on declared files and extra PNGs.

### Phase 3 — Refresh `README.md`, update `CHANGELOG.md`, and run full verification

1. Update `README.md` so it accurately reflects current features, recipes (`nutrition@2.0.0`, `solar-system@1.0.1`, `recursive-process@5.0.0`), delivered public examples (`2026-10-08-solar-system`, `2026-10-09-rag-system`, `2026-10-09-cell-division`, `2026-10-11-belief-updating`, `2026-10-12-belief-reference`, `2026-10-13-nutrition-infographic`), `DESIGN.md` style guides, bundled `Barlow Condensed` starter font (`tools/fonts/barlow-condensed/`), `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-10), and `SOP.md` / `skills/higgsfield-cli`, removing the public `MangaJDM` section.
2. Add a dated `## 2026-10-13` entry to `CHANGELOG.md`.
3. Run `pnpm test`, `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, `shasum -a 256 -c SHA256SUMS` inside `examples/2026-10-13-nutrition-infographic/`, `git grep -I "$HOME"`, `python3 .../releases_app.py --root . check`, and `utils/pdda/pdda.sh run`.

## Acceptance

- [ ] `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` are preserved in gitignored `temp/ManagaJDM projects/` (on both hosts) and removed from Git tracking and the public catalog.
- [ ] `examples/2026-10-13-nutrition-infographic/` contains `DESIGN.md`, `ASSETS.md`, `artwork.json`, `fixture.json`, `provenance.json`, the 7 `gpt-image-2.5-flare` transparent PNGs in `assets/web/`, sanitized `receipts/*.result.json`, `renders/{satori,playwright}/*`, `index.html`, `verification.json`, `README.md` (with AS-1..AS-10 review), and `SHA256SUMS`.
- [ ] `nutrition@2.0.0` renders with bundled `Barlow Condensed`, `ALL CAPS` headline areas, a gradient canvas background, and per-PNG drop shadows visible in both Satori+resvg and Chromium PNG outputs.
- [ ] `tools/request.mjs`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/fixture.json`, and `tools/spike/output/**` remain byte-identical; `solar-system@1.0.1` and `recursive-process@5.0.0` outputs remain unchanged.
- [ ] `README.md` and `CHANGELOG.md` accurately reflect the current repo state with zero dead governance references.
- [ ] `pnpm test` (4/4 canaries), `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, `releases_app.py check`, and `utils/pdda/pdda.sh run` pass.

## Rating rationale

Rated `70/20/75/70` (`calc=235`): priority `70` for direct operator request combining README accuracy, private asset separation, and a new flagship `DESIGN.md` example; severity `20` (feature/documentation/catalog hygiene, not an outage); appeal `75` for demonstrating `DESIGN.md`-driven art direction (Barlow Condensed all-caps, gradient canvas, per-PNG drop shadows) on the canonical nutrition reference diagram; effort cheapness `70` because the 7 `gpt-image-2.5-flare` transparent PNGs and receipts already exist and `readPinnedPngs` + `recipe.FONT` are reused.
