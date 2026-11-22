# GH-44 Recon Map — README Refresh, MangaJDM Temp Migration, and Nutrition DESIGN.md Example

- **Date:** 2026-10-13
- **Issue:** [#44](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/44)
- **Base commit:** `7882464ee5bea89b1854dac66a78340719ec6056` (`origin/main`)
- **Graph status:** `codebase-memory` has no indexed graph for `XYZ-layout-engine`; direct-source inspection used across `tools/**`, `examples/**`, `README.md`, `CHANGELOG.md`, `PROJECT/**`, and `utils/pdda/**`.

## 1. Entry Points & Call Paths

| Entry point | Path / Function | Role & Blast Radius |
|---|---|---|
| Render CLI & API | `tools/render.mjs` (`runCLI`, `processRequest`, `renderSatori`, `renderPlaywright`, `toDocument`) | Selects recipe module (`nutrition`, `solar-system`, `recursive-process`), loads `recipe.FONT` when declared (else `Inter`), runs bounded text-fitting loop (`MAX_ATTEMPTS = 10`, `MIN_SIZE = 12`), emits `png`, `svg`, `html`, `html-inline` and `receipt.json`, and checks advisory catalog verification. |
| Admission & Pinned PNGs | `tools/request.mjs` (`normalizeRequest`, `validateFixtureShape`, `readPinnedPngs`, `saveFixture`) | **Pinned file (`5f80f4a0210b5f353b9b4e853bfcc6eb2b06bbd2dcd51ef9a0aba3e06cfa7133`)** in `recursive-process@3.0.0`, `4.0.0`, and `5.0.0`. Must remain **byte-identical** so `node tools/catalog.mjs verify` continues to pass for `recursive-process@5.0.0`. Exports `readPinnedPngs(exampleUrl, provenanceFile, assetIds)` which verifies realpath containment, `inspectPng` budgets, and `sha256` against `assets[id].display.sha256`. |
| Spike Baseline & Assets | `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/fixture.json`, `tools/spike/output/**` | **Pinned files** for `nutrition@1.0.0` and Canary C2 (`guards: unintended visual or layout drift`). `tools/spike/render.mjs` imports `./scene.mjs` and `./assets.mjs` directly (not `tools/recipes/nutrition.mjs`). Leaving `tools/spike/**` byte-identical keeps `nutrition@1.0.0` history and Canary C2 golden digests untouched. |
| Nutrition Recipe | `tools/recipes/nutrition.mjs` | Currently `1.0.0` delegating to `tools/spike/scene.mjs`. Bumping to `2.0.0` with `FONT` (`Barlow Condensed`), `textTransform: 'uppercase'` on headline areas, warm gradient background on `#canvas`, and `filter: 'drop-shadow(...)'` on each of the 7 transparent PNG elements loaded via `readPinnedPngs` from `examples/2026-10-13-nutrition-infographic/` satisfies the new `DESIGN.md` contract while keeping `tools/spike/**` untouched. |
| Catalog CLI & Ledger | `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl` | `declaredFiles(root, slug)` defines the tracked file set for each active recipe. `verify()` checks every recipe in `recipes` against its current module version on disk and checks every row in `designs` (`fixture_path`, `artifact_path`) and `tools/design-log.jsonl`. |
| Regression Canaries | `tools/spike/test/canaries.test.mjs` | Enforced by `pnpm test` (`test-budget.json`: 1 file, 4 tests, 60s, 0 workflows). C1 copies `tools/` into a temp `space` dir and runs `tools/render.mjs tools/spike/fixture.json`; C2 compares `tools/spike/render.mjs` against `tools/spike/output/`; C3 runs `node tools/catalog.mjs verify` and `tools/spike/verify.mjs`; C4 tests tamper detection and isolated catalog operations on `nutrition`. |

## 2. State Reads & Writes

1. **Moving `examples/2026-10-11-mangajdm-promos` and `examples/2026-10-12-design-revision` to `temp/ManagaJDM projects/`:**
   - Both directories are currently tracked in Git and referenced by:
     - `tools/recipes/mangajdm-promo.mjs`
     - `tools/catalog.mjs` (`declaredFiles` branch for `'mangajdm-promo'`)
     - `tools/render.mjs` (`normalized.recipe === 'mangajdm-promo'` branch)
     - `tools/catalog.sql` (`mangajdm-promo` recipe `rcp-5b2cc48f-0484-4850-95b2-17628446e3fd`, 4 `recipe_versions` `1.0.0`, `1.0.1`, `2.0.0`, `3.0.0`, their `recipe_version_files` and `recipe_outputs`, plus 7 `designs` rows: `2026-10-11-mangajdm-eras`, `2026-10-11-mangajdm-icon`, `2026-10-11-mangajdm-wear`, `2026-10-12-mangajdm-01-icon-editorial`, `2026-10-12-mangajdm-02-eras-editorial`, `2026-10-12-mangajdm-03-wear-editorial`, `2026-10-12-belief-feedback-editorial`)
     - `tools/design-log.jsonl` (7 matching log lines)
     - `README.md` (lines 41–58)
   - Moving them to gitignored `temp/ManagaJDM projects/` (both locally and on `Noels-Mac-Studio.local:~/Documents/GH Repos/XYZ-layout-engine/temp/ManagaJDM projects/`) requires removing those public catalog rows and `tools/recipes/mangajdm-promo.mjs` so `node tools/catalog.mjs verify` and Canary C3 pass cleanly.

2. **Satori + Resvg vs Chromium Drop Shadow Rendering (`tools/render.mjs`):**
   - Ground-truth probe confirmed:
     - Satori `0.36.0` supports `backgroundImage: 'radial-gradient(...)'` and `'linear-gradient(...)'` natively.
     - Satori `0.36.0` emits `style="filter:drop-shadow(...)"` on `<image>` elements in SVG, and Chromium renders CSS `filter: drop-shadow(...)` natively in HTML/PNG.
     - However, `@resvg/resvg-js` (`2.6.2`) ignores CSS `style="filter:drop-shadow(...)"` on `<image>` and only renders SVG `<filter id="..."><feDropShadow .../></filter>` referenced via `filter="url(#...)"`.
     - Translating `style="filter:drop-shadow(<dx>px <dy>px <blur>px <color>)"` on `<image>` in `renderSatori` (`tools/render.mjs`) into an SVG `<defs><filter><feDropShadow .../></filter></defs>` + `<g filter="url(#...)"><image .../></g>` when `svg.includes('style="filter:drop-shadow(')` makes per-PNG drop shadows render in both Satori+resvg and Chromium while leaving all existing scenes without `filter: drop-shadow(...)` byte-identical.

3. **New Example `examples/2026-10-13-nutrition-infographic/` and `nutrition@2.0.0`:**
   - Source reference `temp/0-1780122010113.png` on `Noels-Mac-Studio.local` is byte-identical (`c4a7c925096c886ae61de95c7800e1977b33966348286bf309e40b43e52f212b`) to `PROJECT/2-WORKING/layout-engine-reference.png`.
   - The 7 transparent PNG elements (`leaf_glow`, `balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) were generated from this reference using `gpt-image-2.5-flare` (`recipe:hiqs/openai-image-generation@r2`, `quality: "high"`, `background: "transparent"`) with verified alpha channels and provider receipts (`tools/spike/assets/generated/*.result.json` and `tools/spike/assets/generated/web/*.png`).
   - Packaging `examples/2026-10-13-nutrition-infographic/` with `DESIGN.md`, `ASSETS.md`, `artwork.json`, `fixture.json`, `provenance.json`, `assets/web/*.png`, `receipts/*.result.json`, `renders/{satori,playwright}/*`, `index.html`, `verification.json`, and `SHA256SUMS` provides a self-contained example folder pinned by `nutrition@2.0.0`.
   - In `tools/spike/test/canaries.test.mjs`, C1 and C4 copy `tools/` into isolated temp directories and run `nutrition`; copying `examples/2026-10-13-nutrition-infographic` into C1's `space` and C4's `root` (matching `examples/2026-10-08-solar-system` in C4 line 464) and updating C1's font assertion (`'Barlow Condensed'`) and C4's isolated publish version (`'2.0.0'`) keeps all 4 canaries passing within the unchanged `test-budget.json`.

## 3. Rollback & Reversibility

- **Reversibility:** `Easy` for code, `README.md`, and new example addition; `Costly` if untracked `temp/` copies were lost (prevented by copying `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` into `temp/ManagaJDM projects/` on both hosts before `git rm`).
