---
gh_issue: 44
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/44
title: "Refresh README, move MangaJDM studies to temp/, and deliver Nutrition DESIGN.md example"
goal: "Update README.md to reflect current capabilities, move MangaJDM example folders into gitignored temp/ManagaJDM projects/ while retiring their public catalog rows, and deliver examples/2026-10-13-nutrition-infographic/ with a DESIGN.md style guide and nutrition@2.0.2 recipe (Barlow Condensed ALL CAPS headlines, gradient canvas, per-PNG drop shadows, and pinned gpt-image-2.5-flare transparent PNGs)."
status: "Active — Phases 1-3 implemented, R1-R3 documentation refinements applied, and full verification recorded"
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
| Completed Codex plan QA (`relay-system/2026-10-13/gh44-plan.codex.md`, Approved), executed Phases 1–3, published `nutrition@2.0.0` and documentation-aligned patch `nutrition@2.0.2` (after Round 1 Final QA R1–R3 refinements), rendered `examples/2026-10-13-nutrition-infographic/renders/{satori,playwright}/`, registered design `2026-10-13-nutrition-infographic`, updated `README.md` and `CHANGELOG.md`, and verified `pnpm test` (4/4 in 26.7s), protected digests, catalog historical equality, `releases_app.py --root . check`, and `utils/pdda/pdda.sh run`. | Complete Round 2 of final Codex relay QA (`relay-system/2026-10-13/gh44-final.codex.md`) and open ready PR. |

## Scope and bet

- **Assumption & bet:** Moving `examples/2026-10-11-mangajdm-promos` and `examples/2026-10-12-design-revision` (plus `tools/recipes/mangajdm-promo.mjs`) into gitignored `temp/ManagaJDM projects/` while removing their public catalog rows (`mangajdm-promo` and the 7 design rows in those two folders) keeps MangaJDM work strictly private under `temp/` and keeps `node tools/catalog.mjs verify` green. Delivering `examples/2026-10-13-nutrition-infographic/` with a sample `DESIGN.md` style guide and `nutrition@2.0.0` / `nutrition@2.0.2` in `tools/recipes/nutrition.mjs` (using bundled `Barlow Condensed` with `ALL CAPS` headlines, a warm gradient canvas background, per-PNG drop shadows across both Satori+resvg and Chromium, and the 7 verified `gpt-image-2.5-flare` transparent PNG elements via `readPinnedPngs`) satisfies the operator's art direction while leaving `tools/spike/**` (`nutrition@1.0.0` history and Canary C2 golden comparison) and `tools/request.mjs` (`recursive-process@5.0.0` pin) byte-identical.
- **Tradeoff:** Satori `0.36.0` emits CSS `style="filter:drop-shadow(...)"` on `<image>` elements in SVG, which Chromium renders natively in HTML/PNG, whereas `@resvg/resvg-js` (`2.6.2`) only renders SVG `<filter><feDropShadow .../></filter>`. A narrow SVG post-pass in `renderSatori` (`tools/render.mjs`) translates `<image\b([^>]*?)\sstyle="filter:drop-shadow\(([-0-9.]+)px\s+([-0-9.]+)px\s+([-0-9.]+)px\s+([^"]+)\)"([^>]*)\/>` into `<defs><filter id="satori_ds_N" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="<dx>" dy="<dy>" stdDeviation="<blur>" flood-color="<color>"/></filter></defs>` + `<g filter="url(#satori_ds_N)"><image$1$6/></g>` (stripping the inline `style="filter:drop-shadow(...)"` attribute so exported SVG never double-applies the shadow) only when `svg.includes('style="filter:drop-shadow(')`. Reproducible probe output on `parfait_jar.png` with `filter: 'drop-shadow(0px 8px 6px rgba(31,42,28,0.22))'` and `radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)`: `{"untouchedWhenNoFilter":true,"inlineStyleStrippedOnRewrittenImage":true,"hasFeDropShadow":true,"pngNoShadowSha256":"9ac0901bf714a9bb678d2061cbedd6f3c37a034f887c82c4d7bd038db1940ab9","pngWithShadowSha256":"4f6f7a1115130f5eebd12c1e487da0137d980573663561310c848417dd87940a","shadowChangesPixels":true}`.
- **Failure modes & guards:**
  1. Modifying `tools/request.mjs` or `tools/spike/assets.mjs` would break `recursive-process@5.0.0` or `solar-system@1.0.1` in `node tools/catalog.mjs verify` — guard: keep both files byte-identical (`5f80f4a0210b5f353b9b4e853bfcc6eb2b06bbd2dcd51ef9a0aba3e06cfa7133` and `b688386866d9ea0d491d8100b2aef14a4cdb76e8fbae9e6b7615c32743f4a582`).
  2. Modifying `tools/spike/scene.mjs` (`c796e7c5a16e5cf634e4749fb407b035a864793b6fccf86af2cc1d821ad1bc8b`), `tools/spike/fixture.json` (`81b520e2aab87ddf937e685736e09ce3eac8ae297825014180a6caa1ed253e95`), `tools/spike/assets/**` (20 files, `find tools/spike/assets -type f | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256` = `4e21ce7c349d67ed0017c028148cc95b26d9c078107f75265d9da4fd590bef83`, Git tree `2a199823cf07c690929c97d2e90f9329c8a383e2`), or `tools/spike/output/**` (14 files, `find tools/spike/output -type f | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256` = `98d7aa2e1a06fff5d32dfcb77b67e48f1c67e5d4b15acc78e677c38f34f31c43`, Git tree `4d54b4f419318ccd815a4836904470f217812ea1`) would break Canary C2 (`guards: unintended visual or layout drift`) and `nutrition@1.0.0` history — guard: keep all four byte-identical, plus keep `test-budget.json` (`0a23ad46838464f83dffafa8f48b1f85111c1ab196de8dd207866b1a45d56685`, 4 tests / 1 file / 60s / 0 workflows) unchanged.
  3. Canary C1 and C4 copy `tools/` into isolated temp directories and run `nutrition` — guard: copy `examples/2026-10-13-nutrition-infographic` and `tools/fonts/barlow-condensed` into C1/C4's isolated temp roots (matching `examples/2026-10-08-solar-system` in C4), update C1's `assertOfflineExport` font family (`'Barlow Condensed'`), update C4's isolated publish version (`'2.0.2'`), relocate C4's extra-PNG tamper control (`extraPng`) from `tools/spike/assets/generated/web/heart.png` into the new declared namespace `examples/2026-10-13-nutrition-infographic/assets/web/heart.png` so the `namespace differs` reject/restore assertion stays active, use `process.exitCode = 1` in `tools/spike/verify.mjs` so rejected verify runs exit cleanly in 66ms on Node v24 / macOS 27, and include `osRelease` in C2's host comparison for OS-dependent Chromium PNG rasterization while always checking Satori and HTML golden digests.
- **Reversibility:** `Easy` for code, `README.md`, and new example addition; `Costly` if untracked `temp/` files were lost (prevented by copying `2026-10-11-mangajdm-promos`, `2026-10-12-design-revision`, and `mangajdm-promo.mjs` into `temp/ManagaJDM projects/` on both `Noels-Mac-Studio.local` and the local host before `git rm`).

## Ordered implementation and verification

### Phase 1 — Move MangaJDM folders to `temp/ManagaJDM projects/` and clean public catalog

1. Copy `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` into `temp/ManagaJDM projects/` on both `Noels-Mac-Studio.local` (`~/Documents/GH Repos/XYZ-layout-engine/temp/ManagaJDM projects/`) and local `temp/ManagaJDM projects/`, and verify file counts and SHA-256 digests before removing tracked copies.
2. `git rm -r examples/2026-10-11-mangajdm-promos examples/2026-10-12-design-revision tools/recipes/mangajdm-promo.mjs`.
3. Remove the `mangajdm-promo` branch from `tools/render.mjs` and `tools/catalog.mjs` (`declaredFiles`). Under an explicit operator-authorized one-off offline catalog migration exception (per A1 confirmation, avoiding permanent deletion machinery in `tools/catalog.mjs` while keeping `preserveHistory` intact for all ordinary `import` calls): acquire `tools/.catalog.lock`, hold in-memory backups of `tools/catalog.sql` and `tools/design-log.jsonl`, load the original dump via `loadDump(originalSql)`, derive the deletion set by `slug = 'mangajdm-promo'` and assert it equals recipe `rcp-5b2cc48f-0484-4850-95b2-17628446e3fd` (`tools/catalog.sql:21`), its four versions (`rcv-5761ea2e-f36d-4ec5-9428-522042640162` (`1.0.0`), `rcv-3536d864-3e2d-41bb-9747-aa527068c6df` (`1.0.1`), `rcv-0241c267-1863-4b44-b451-6def1af6e2c9` / `2.0.0`, `rcv-f96f24aa-a7d6-412e-a230-d7d129ec909e` (`3.0.0`)), their 48 `recipe_version_files` (`4 × 12`) and 16 `recipe_outputs` (`4 × 4`) rows, and the 7 moved design/log IDs (`2026-10-11-mangajdm-eras`, `2026-10-11-mangajdm-icon`, `2026-10-11-mangajdm-wear`, `2026-10-12-mangajdm-01-icon-editorial`, `2026-10-12-mangajdm-02-eras-editorial`, `2026-10-12-mangajdm-03-wear-editorial`, `2026-10-12-belief-feedback-editorial`). Canonicalize the candidate via `exportDump(loadDump(filteredSql))`, assert in-memory original-vs-candidate equality for every unrelated row across all 6 tables and `tools/design-log.jsonl`, write both files atomically (restoring both backups on any failure), and verify `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, and that `node tools/catalog.mjs import` still rejects unauthorized deletions. Leave `tools/request.mjs` and `tools/spike/assets.mjs` byte-identical.

### Phase 2 — Deliver `examples/2026-10-13-nutrition-infographic/`, `DESIGN.md`, and `nutrition@2.0.0` / `nutrition@2.0.2`

1. In `tools/render.mjs` (`renderSatori`), add the narrow SVG post-pass that converts `<image\b([^>]*?)\sstyle="filter:drop-shadow\(([-0-9.]+)px\s+([-0-9.]+)px\s+([-0-9.]+)px\s+([^"]+)\)"([^>]*)\/>` into `<defs><filter id="satori_ds_N" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="<dx>" dy="<dy>" stdDeviation="<blur>" flood-color="<color>"/></filter></defs>` and `<g filter="url(#satori_ds_N)"><image$1$6/></g>` when `svg.includes('style="filter:drop-shadow(')`.
2. Create `examples/2026-10-13-nutrition-infographic/` containing:
   - `DESIGN.md` — sample style guide and art direction contract for the nutrition infographic (`layout-engine-reference.png` / `0-1780122010113.png`), specifying `Barlow Condensed` (Regular 400 + Bold 700) with `ALL CAPS` (`textTransform: 'uppercase'`) for headline areas (`header_headline`, callout titles, item titles, benefit labels, footer banner), the exact `fixture.json` headline/callout/footer copy and palette tokens (`#fbfaf3`, `#2f5d27`, `#7fb04a`, `#1f2a1c`, `#3d4639`, `#f4f8ea`, `#b9d79b`), a warm cream-to-sage radial gradient canvas background, a soft grounding drop shadow (`drop-shadow(0px 8px 6px rgba(31,42,28,0.22))` on grounded food/scale/bottle PNGs and `drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` on `leaf_glow`), and explicit AS-2, AS-3, AS-5, AS-6, and AS-7 taste-exception rationale.
   - `artwork.json`, `ASSETS.md`, `provenance.json`, `assets/web/{leaf_glow,balance_scale,skip_spike,parfait_jar,snack_container,chicken_wrap,water_bottle}.png`, and `receipts/*.result.json` — the 7 verified `gpt-image-2.5-flare` transparent PNG elements (`recipe:hiqs/openai-image-generation@r2`, `background: "transparent"`, `alpha.verified: true`) and their sanitized receipts, while the 4 small monochrome benefit icons (`icon_energy`, `icon_focus`, `icon_immunity`, `icon_wellbeing`) and leaf/heart ornaments remain crisp vector SVGs from `tools/spike/assets/illustrations.svg`.
   - `fixture.json` — 1000×1000 nutrition infographic fixture (`id: "nutrition-infographic"`).
3. Update `tools/recipes/nutrition.mjs` to `version = '2.0.0'` (and `2.0.2` after the Round 1 `DESIGN.md` alignment, with identical rendered PNG/SVG/HTML digests):
   - Export `FONT = { family: 'Barlow Condensed', regular: ..., bold: ... }`.
   - Load the 7 transparent PNG assets via `readPinnedPngs` from `examples/2026-10-13-nutrition-infographic/` (`provenance.json`) and ornaments/benefit icons via `resolveIllustration`.
   - Build the 1000×1000 scene with `fontFamily: FONT.family`, `backgroundImage: 'radial-gradient(circle at 50% 44%, #fffef8 0%, #f7f3e3 58%, #ede6cf 100%)'` on `#canvas`, `textTransform: 'uppercase'` on all headline/title nodes, and per-PNG drop shadows (`drop-shadow(0px 8px 6px rgba(31,42,28,0.22))` on the 6 food/scale/bottle PNGs and `drop-shadow(0px 6px 8px rgba(242,228,150,0.45))` on `leaf_glow`).
4. Update `declaredFiles(root, 'nutrition')` in `tools/catalog.mjs` for `2.0.0` / `2.0.2` (`tools/recipes/nutrition.mjs`, `tools/spike/fixture.json`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/assets/illustrations.svg`, `tools/fonts/barlow-condensed/BarlowCondensed-{Regular,Bold}.ttf`, `examples/2026-10-13-nutrition-infographic/{DESIGN.md,artwork.json,fixture.json,provenance.json}`, and `examples/2026-10-13-nutrition-infographic/assets/web/*.png`), keeping `nutrition@1.0.0` and `nutrition@2.0.0` immutable in `tools/catalog.sql`.
5. Publish `nutrition@2.0.0` and patch `nutrition@2.0.2` via `node tools/catalog.mjs publish nutrition 2.0.2`. Render both `satori` (`--format png,svg,html,html-inline`) and `playwright` (`--format png,html,html-inline`) via `tools/render.mjs`, retain the compact bundle (`render.png`, `render.svg`, `render-inline.html`, `result.json`, `export-manifest.json`, and 420px `thumbnail.png` in `examples/2026-10-13-nutrition-infographic/renders/{satori,playwright}/`), visually inspect full-size and 420px thumbnail renders (AS-10), write `examples/2026-10-13-nutrition-infographic/{README.md,index.html,verification.json,SHA256SUMS}`, and register the design via `node tools/catalog.mjs design add 2026-10-13-nutrition-infographic --fixture examples/2026-10-13-nutrition-infographic/fixture.json --artifact examples/2026-10-13-nutrition-infographic/renders/satori/render.png --use-case nutrition@2.0.0 --workarounds 0 --friction "Barlow Condensed ALL CAPS headlines, radial-gradient canvas, and per-PNG drop shadows rendered cleanly across Satori+resvg and Chromium."`.
6. Update `tools/spike/test/canaries.test.mjs` so C1 and C4 copy `examples/2026-10-13-nutrition-infographic` into their isolated temp directories, C1 checks `'Barlow Condensed'` on `nutrition`, C4 publishes `'2.0.2'` in its isolated catalog control, and C4's `extraPng` tamper control writes `examples/2026-10-13-nutrition-infographic/assets/web/heart.png` (triggering `namespace differs` and restoring clean verify on removal).

### Phase 3 — Refresh `README.md`, update `CHANGELOG.md`, and run full verification

1. Update `README.md` so it accurately reflects current features, recipes (`nutrition@2.0.2`, `solar-system@1.0.1`, `recursive-process@5.0.0`), delivered public examples (`2026-10-08-solar-system`, `2026-10-09-rag-system`, `2026-10-09-cell-division`, `2026-10-11-belief-updating`, `2026-10-12-belief-reference`, `2026-10-13-nutrition-infographic`), `DESIGN.md` style guides, bundled `Barlow Condensed` starter font (`tools/fonts/barlow-condensed/`), `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-10), `SOP.md` / `skills/higgsfield-cli`, and the log-first compensated `design add` write/rollback order (`tools/catalog.mjs:356-367`), removing the public `MangaJDM` section.
2. Add a dated `## 2026-10-13` entry to `CHANGELOG.md`.
3. Run `pnpm test`, `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, `shasum -a 256 -c SHA256SUMS` inside `examples/2026-10-13-nutrition-infographic/`, `git grep -I "$HOME"`, `eval "$("$HOME/.gemini/config/skills/relay-xyz/find-harness.sh" --env)" && python3 "$HARNESS/utils/py/releases_app.py" --root . check`, and `utils/pdda/pdda.sh run`. Also run a before/after SHA-256 verification script comparing all protected files (`tools/request.mjs`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/fixture.json`, `tools/spike/assets/**`, `tools/spike/output/**`, `test-budget.json`) and deterministic `processRequest` digests for `solar-system` (`png: b55c036c76275ae7f07bfaddf93aaac2f4bb94c0e43504fadf748da982b32d9b`, `svg: c5034e8e9f90817abaad1bd059981255ebb4f0922fd18a85751042cd6deceddf`) and `recursive-process` (`png: 2b0e840fcb1cea28a63558836fb10e8ebffb1ace7c904118838bf9a643eac5cb`, `svg: 3cc1ec8c3cc5882897a034860a5fc270cf76bb2090bce01bcb9cc6857db58b30`).

## Verification Evidence Recorded on Task Clone

1. **`pnpm test` (exit 0 — 4/4 canaries in 26.7s, budget 60s):**
   ```text
   $ pnpm test
   $ node tools/spike/test/run.mjs
   test-budget: ok — 1/1 files, 4/4 tests, 0/0 workflows, deadline 60s
   TAP version 13
   # # C1: import/space CLI, admission, HTML, cleanup, publication, Solar fitting and generation recovery passed
   # # C2 geometry: 216 boxes compared within 0.5 px
   # # C2 digests: 8/12 artifacts byte-identical (darwin/arm64/27.0.0/156.0.8078.4 vs darwin/arm64/24.6.0/156.0.8078.4)
   ok 1 - guards: render pipeline breaks on a clean checkout
   ok 2 - guards: unintended visual or layout drift
   ok 3 - guards: committed evidence no longer satisfies the gate
   # # C4 catalog: publication, SQL triggers, identity retention, round trip, reads, drift, namespace and lock controls passed
   ok 4 - guards: the verifier stops detecting tampering
   1..4
   # pass 4 / fail 0 / duration_ms 26708.201917
   test-budget: PASS — 4 canaries in 26.7s (budget 60s)
   ```
2. **Protected files & trees, unaffected recipes (`solar-system@1.0.1`, `recursive-process@5.0.0`), and pre-migration catalog row equality against base commit `01c9185` (exit 0):**
   ```json
   {
     "protectedChecks": {
       "tools/request.mjs": true,
       "tools/spike/scene.mjs": true,
       "tools/spike/assets.mjs": true,
       "tools/spike/fixture.json": true,
       "test-budget.json": true,
       "tools/spike/assets/** (20 files, 4e21ce7c349d67ed0017c028148cc95b26d9c078107f75265d9da4fd590bef83)": true,
       "tools/spike/output/** (14 files, 98d7aa2e1a06fff5d32dfcb77b67e48f1c67e5d4b15acc78e677c38f34f31c43)": true
     },
     "recipeChecks": {
       "solar-system.png": true,
       "solar-system.svg": true,
       "recursive-process.png": true,
       "recursive-process.svg": true
     },
     "catalogHistoricalEquality": {
       "schema_migrations": true,
       "recipes": true,
       "recipe_versions": true,
       "recipe_version_files": true,
       "recipe_outputs": true,
       "designs": true
     }
   }
   ```
3. **Private archive verification (`temp/ManagaJDM projects/`) on `Noels-Mac-Studio.local` and local checkout (exit 0):**
   - `2026-10-11-mangajdm-promos`: `62` files preserved under `temp/ManagaJDM projects/2026-10-11-mangajdm-promos/` on both hosts (`git ls-files examples/2026-10-11-mangajdm-promos` returns `0` tracked files).
   - `2026-10-12-design-revision`: `52` files preserved under `temp/ManagaJDM projects/2026-10-12-design-revision/` on both hosts (`git ls-files examples/2026-10-12-design-revision` returns `0` tracked files).
   - `mangajdm-promo.mjs`: SHA-256 `b5db26a0c8d3cf2009dc83dbfffe4789c1e1650b6aaae164dd6e6a77e1d1cf45` preserved under `temp/ManagaJDM projects/mangajdm-promo.mjs` on both hosts (`git ls-files tools/recipes/mangajdm-promo.mjs` returns `0` tracked files).
4. **Governance & roadmap gates (exit 0):**
   - `python3 "$HARNESS/utils/py/releases_app.py" --root . check` → `OK: ~/Documents/GitHub/XYZ-layout-engine/releases.db (generation 81, 41 items)`
   - `utils/pdda/pdda.sh run` → `=== PDDA Summary: 0 error(s), 3 warning(s) ===` (0 errors, 0 `README.md` warnings).

## Acceptance

- [x] `examples/2026-10-11-mangajdm-promos`, `examples/2026-10-12-design-revision`, and `tools/recipes/mangajdm-promo.mjs` are preserved in gitignored `temp/ManagaJDM projects/` (on both hosts) and removed from Git tracking and the public catalog.
- [x] `examples/2026-10-13-nutrition-infographic/` contains `DESIGN.md`, `ASSETS.md`, `artwork.json`, `fixture.json`, `provenance.json`, the 7 `gpt-image-2.5-flare` transparent PNGs in `assets/web/`, sanitized `receipts/*.result.json`, `renders/{satori,playwright}/*`, `index.html`, `verification.json`, `README.md` (with AS-1..AS-10 review), and `SHA256SUMS`.
- [x] `nutrition@2.0.0` / `nutrition@2.0.2` renders with bundled `Barlow Condensed`, `ALL CAPS` headline areas, a gradient canvas background, and per-PNG drop shadows visible in both Satori+resvg and Chromium PNG outputs (with zero double-shadow in exported SVG).
- [x] `tools/request.mjs`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `tools/spike/fixture.json`, `tools/spike/assets/**`, `tools/spike/output/**`, and `test-budget.json` remain byte-identical to their recorded baseline digests; `solar-system@1.0.1` and `recursive-process@5.0.0` deterministic PNG/SVG digests remain unchanged.
- [x] `README.md` and `CHANGELOG.md` accurately reflect the current repo state with zero dead governance references.
- [x] `pnpm test` (4/4 canaries within unchanged `test-budget.json`), `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, `releases_app.py --root . check`, and `utils/pdda/pdda.sh run` pass.

## Rating rationale

Rated `70/20/75/70` (`calc=235`): priority `70` for direct operator request combining README accuracy, private asset separation, and a new flagship `DESIGN.md` example; severity `20` (feature/documentation/catalog hygiene, not an outage); appeal `75` for demonstrating `DESIGN.md`-driven art direction (Barlow Condensed all-caps, gradient canvas, per-PNG drop shadows) on the canonical nutrition reference diagram; effort cheapness `70` because the 7 `gpt-image-2.5-flare` transparent PNGs and receipts already exist and `readPinnedPngs` + `recipe.FONT` are reused.
