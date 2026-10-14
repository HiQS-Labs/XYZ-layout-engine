---
gh_issue: 48
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/48
title: "Global default proportional type scale rules (% of S) and nutrition@4.0.0 typography overhaul"
goal: "Codify the 10 proportional type scale rules (% of S, where S = min(width, height)) in SYSTEM-INSTRUCTIONS.md (AS-5 and AS-12) as the repository-wide default for all sessions, and upgrade tools/recipes/nutrition.mjs to nutrition@4.0.0 and examples/2026-10-13-nutrition-infographic/ (DESIGN.md, renders-v4/, verification-v4.json) so the 1000x1000 Fuel Well. Live Well. infographic satisfies every proportional type scale, 4-size ceiling, >=4:1 hierarchy, hero-vs-headline cap-height balance, 50-85% headline width, >=70% icon-label ratio, and 1/3-scale mobile legibility invariant across Satori+resvg and Chromium."
status: "In Progress — Plan Approved; Implementation Next"
created: 2026-10-13
updated: 2026-10-13
owner: Antigravity
doc_type: plan
complexity: 2
risk: 2
effort: 2
phases: 3
reversibility: "Easy — nutrition@1.0.0..3.0.0 and designs 2026-10-13-nutrition-infographic (renders/) and 2026-10-13-nutrition-shadow-tuning (renders-v3/) remain immutable in tools/catalog.sql; nutrition@4.0.0 and renders-v4/ are additive."
---

# GH-48 — Global default proportional type scale rules (% of S) and nutrition@4.0.0 typography overhaul

## Status

| What was just completed | What's next |
|---|---|
| Codex Round 2 approved the implementation plan after correcting manifest-selected export paths and clarifying provisional measurement evidence. | Execute Phases 1–3; verify native-size readability before publication and obtain post-build QA. |

## Task Rating & Recurrence Rationale

- **Persisted RELEASES rating:** `rated 80/50/50/70` (`pri=80`, `sev=50`, `appeal=50`, `effort=70`).
  - **Priority (`80`):** Operator-requested repository-wide default (`"This is being codified as a default for all sessions"`) plus immediate overhaul of the `Fuel Well. Live Well.` nutrition infographic.
  - **Severity (`50`):** Without proportional `% of S` sizing rules, LLM-authored recipes default to web/document pixel sizes (`13–50px` on a `1000–1230px` canvas), rendering captions (`1.05–1.4% of S`) and section labels (`1.3–1.8% of S`) illegible at `1/3` mobile scale (`~333–400px` wide) and letting hero illustrations dwarf the headline.
  - **Appeal (`50`):** Neutral baseline (`50`) per `/start-task` rating policy.
  - **Effort / Cheapness (`70`):** Confined to `SYSTEM-INSTRUCTIONS.md`, `tools/recipes/nutrition.mjs` (`nutrition@4.0.0`), `examples/2026-10-13-nutrition-infographic/{DESIGN.md,README.md,index.html,renders-v4/**,verification-v4.json,SHA256SUMS}`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs` (3 lines in C4), `README.md`, and `CHANGELOG.md`. Zero changes to `tools/render.mjs`, `tools/request.mjs`, or `tools/spike/{scene.mjs,fixture.json,assets.mjs,assets/**,output/**}`.
- **Recurrence check (2026-09-29..2026-10-13 vs. 2026-09-15..2026-09-28):** Searched issues/PRs #1..#48 in `HiQS-Labs/XYZ-layout-engine`. In `nutrition@1.0.0` (`tools/spike/scene.mjs`) and `nutrition@2.0.0..3.0.0` (`tools/recipes/nutrition.mjs`), `DEFAULT_SIZES` used raw document-style pixel literals (`50, 24, 21, 20, 18, 17, 16, 15, 14` — 9 distinct sizes on a `1000 × 1000` canvas, with captions at `1.4% of S` and headline at `5.0% of S`). Codifying `AS-12` in `SYSTEM-INSTRUCTIONS.md` and computing `DEFAULT_SIZES` from `S = Math.min(width, height)` eliminates arbitrary pixel picking at the root.

## Grounded Recon & Exploratory Candidate Measurements

**Evidence boundary:** Candidate geometry, alpha heights, and fit results below are producer-reported preliminary observations, not independently reproduced acceptance evidence. The current module remains v3. The font-table command is reproducible; an executable alpha scan and candidate reconstruction command are not yet retained here. During Phase 2, retain exact candidate module/fixture hashes, render commands, alpha scan (use the inclusive occupied-pixel span, `maxY - minY + 1`), and both backend results under `.relay-scratch/`; transfer commands, hashes, measurements, and native-size visual outcomes into `verification-v4.json` before removing scratch previews. Replace preliminary values if measurements differ.

- **Base commit:** `ed5652940f2a0ab78ff5113340928d3bb76ca20e` (`origin/main`).
- **Fixture identity:** `tools/spike/fixture.json` / `examples/2026-10-13-nutrition-infographic/fixture.json` (`sha256: 81b520e2aab87ddf937e685736e09ce3eac8ae297825014180a6caa1ed253e95`, `1000 × 1000`).
- **Operator diagnosis of prior `nutrition@3.0.0` (`S = 1000px` canvas) vs. `nutrition@4.0.0` exploratory candidate:**

  | Metric / Rule | `nutrition@3.0.0` (Committed `main`) | `nutrition@4.0.0` (Exploratory Candidate at `S = 1000px`) | Rule Requirement & Tolerance |
  |---|---|---|---|
  | **Canvas shorter side `S`** | `1000px` (`1000 × 1000`) | `1000px` (`1000 × 1000`) | `S = Math.min(width, height)` |
  | **Headline (`header_headline`)** | `50px` (`5.0% of S`) | `92px` (`9.2% of S`, `Math.round(S * 0.092)`) | **Rule 2:** `7–10% of S` (never `< 6%`) |
  | **Subhead / tagline (`header_subtitle`)** | `24px` (`2.4% of S`) | `31px` (`3.1% of S`, `Math.round(S * 0.031)`) | **Table:** `2.5–3.5% of S` (`~⅓` of headline: `92 / 3 = 30.67 ≈ 31px`) |
  | **Section labels (`callout_*_title`, `item_*_title`, `benefit_1..4`, `footer_text`)** | `15px`, `18px`, `20px`, `21px` (`1.5–2.1% of S`) | `25px` (`2.5% of S`, `Math.round(S * 0.025)`) | **Table:** `2.2–2.8% of S` (bold uppercase) |
  | **Body / captions (`header_caption`, `callout_*_text`, `item_*_caption`, `footer_tagline`)** | `14px`, `16px`, `17px`, `18px` (`1.4–1.8% of S`) | `21px` (`2.1% of S`, `Math.round(S * 0.021)`) | **Rule 3 & Table:** `1.8–2.2% of S` (floor `1.8%`, never `< 1.5%`) |
  | **Distinct font sizes on canvas** | **9 sizes** (`50, 24, 21, 20, 18, 17, 16, 15, 14`) | **4 sizes** (`92, 31, 25, 21`) | **Full scale table:** max 4 sizes on the canvas |
  | **Headline : body ratio** | `50 : 14 = 3.57 : 1` (or `50 : 16 = 3.13 : 1`) | `92 : 21 = 4.38 : 1` | **Rule 4:** `>= 4.0 : 1` |
  | **TrueType cap height & Rule 5 largest graphic balance** | `capHeight = 35.0px`; `hero_img` `height: '100%'` (`~450px` = `12.9×` cap height) | `capHeight = 92 * (700/1000) = 64.4px` (`3.0 × capHeight = 193.2px`); largest visible graphic across all 7 cutouts is `skip_spike` at `190.0px` (`2.950× <= 3.0×`), `leaf_glow` (`220 × 210` stage) is `184.5px` (`2.865× <= 3.0×`), `balance_scale` is `172.9px` (`2.685× <= 3.0×`) | **Rule 5:** largest visible graphic height (`a > 24`) `<= 3.0 × headlineCapHeight` (with `<= 3.05×` as the explicit tolerance for `"~3×"`, and `2.950× <= 3.00×` satisfying the strict bound) |
  | **Headline width (`"FUEL WELL. LIVE WELL."`)** | `434px` (`43.4%` of canvas width) | `790px` Satori / `793.95px` Chromium (`79.0%–79.4%` of `1000px` canvas width) | **Rule 6:** `50–85%` of canvas width |
  | **Icon-plus-label pair ratio (`benefitsPanel`)** | `15px` font on `44px` icon (`34.1%`) | `25px` font (`30px` box height) on `34px` icon (`73.5%` font / `88.2%` box height) | **Rule 8:** label `>= 70%` of icon height |
  | **First-attempt fit (`processRequest`)** | `attempts: 1, iterations: 0` | `attempts: 1, iterations: 0` (both `satori` and `playwright`) | Zero adaptive shrink so `% of S` sizes hold |

- **Reproducible measurement commands (`R3` compliance):**
  1. **TrueType `OS/2` `sCapHeight` measurement from `tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf`:**
     ```bash
     node --input-type=module -e '
     import fs from "node:fs";
     const buf = fs.readFileSync("./tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf");
     const n = buf.readUInt16BE(4), t = {};
     for (let i = 0; i < n; i++) t[buf.toString("ascii", 12 + i * 16, 16 + i * 16)] = buf.readUInt32BE(20 + i * 16);
     const unitsPerEm = buf.readUInt16BE(t["head"] + 18), sCapHeight = buf.readInt16BE(t["OS/2"] + 88);
     console.log({ unitsPerEm, sCapHeight, ratio: sCapHeight / unitsPerEm, capHeightAt92: 92 * sCapHeight / unitsPerEm, threeXCapHeightAt92: 3 * 92 * sCapHeight / unitsPerEm });
     '
     ```
     Output: `{ unitsPerEm: 1000, sCapHeight: 700, ratio: 0.7, capHeightAt92: 64.4, threeXCapHeightAt92: 193.2 }`.
  2. **Visible alpha height (`a > 24`) across all 7 cutout PNGs in `examples/2026-10-13-nutrition-infographic/assets/web/*.png`:**
     - Using `objectFit: 'contain'` inside each slot's stage box (`leaf_glow`: `220 × 210`, `balance_scale`: `280 × 210`, `skip_spike`: `280 × 210`, `parfait_jar`: `160 × 170`, `snack_container`: `160 × 170`, `chicken_wrap`: `160 × 107` at `top: 60`, `water_bottle`: `160 × 170`), the non-transparent (`a > 24`) vertical span `(maxY - minY) * scale` of every cutout is:
       - `skip_spike`: `190.0px` (`2.950 × 64.4px`)
       - `leaf_glow`: `184.5px` (`2.865 × 64.4px`)
       - `balance_scale`: `172.9px` (`2.685 × 64.4px`)
       - `water_bottle`: `154.1px` (`2.393 × 64.4px`)
       - `parfait_jar`: `140.8px` (`2.186 × 64.4px`)
       - `snack_container`: `137.7px` (`2.138 × 64.4px`)
       - `chicken_wrap`: `82.9px` (`1.287 × 64.4px`)
     - Every graphic on the canvas has visible height `<= 190.0px <= 193.2px` (`<= 3.0 × capHeight`), and even the stage container height (`210px`) is `3.26 × capHeight` and `2.28 × headline fontSize`.
- **Measured container & text-box geometry in Satori (`0.36.0`) and Chromium (`1.64.0`) for the `92/31/25/21px` candidate:**
  - **Why `lineHeight >= 1.2` is required in Chromium:** `tools/render.mjs` (`renderPlaywright`, lines 155–164) measures text boxes via `range.selectNodeContents(el); range.getBoundingClientRect()`. In Chromium, `Barlow Condensed Bold` glyph ascent/descent exceeds a `1.15` CSS line-box by `~1–3px` (`box.y < region.y - 0.5`), triggering false-positive overflow in `processRequest` (line 271). Keeping `lineHeight: 1.25` on `headline`, `lineHeight: 1.2` on `header_subtitle`, `benefit_1..4`, `footer_text`, and `footer_tagline`, and `lineHeight: 1.25–1.28` on body captions guarantees `overflowing: []` (`attempts: 1, iterations: 0`) in both Satori and Chromium.
  - **Why `...SPIKE_DEFAULT_SIZES` is removed from `tools/recipes/nutrition.mjs`:** Previously, `tools/recipes/nutrition.mjs:19` spread `...SPIKE_DEFAULT_SIZES`, polluting `DEFAULT_SIZES` (and `result.json` `fitting.finalSizes`) with 5 unused `hero_*` keys (`64, 40, 26, 24, 20`) from `tools/spike/scene.mjs`. Defining `DEFAULT_SIZES` strictly over `NUTRITION_TEXT_IDS` from `TYPE_SCALE_PCT` ensures `Object.values(DEFAULT_SIZES)` contains strictly the 4 canonical pixel sizes (`[92, 31, 25, 21]`).
  - **Preserving `AS-11` directional ground/contact cast shadows (`GROUND_SHADOW_SPECS`):** By keeping the 6 grounded cutout stage sizes at `280 × 210` (`callout_1..2_img`) and `160 × 170` (`item_1..4_img`, with `chicken_wrap` at `imgTop: 60, imgHeight: 107`) while bounding `hero_img` (`leaf_glow`) to `width: 220, height: 210` (instead of `width: 320, height: '100%'`), all 6 grounded cutouts retain their exact `AS-11` base footprints and directional ground/contact shadow coordinates from `nutrition@3.0.0`.
  - **Protected files that MUST remain byte-identical:**
    - `tools/render.mjs` and `tools/request.mjs`
    - `tools/spike/{scene.mjs,fixture.json,assets.mjs,assets/**,output/**}`
    - `examples/2026-10-13-nutrition-infographic/renders/**` (pinned by `2026-10-13-nutrition-infographic`, `nutrition@2.0.0`)
    - `examples/2026-10-13-nutrition-infographic/renders-v3/**` (pinned by `2026-10-13-nutrition-shadow-tuning`, `nutrition@3.0.0`)
    - `test-budget.json` (`0a23ad46838464f83dffafa8f48b1f85111c1ab196de8dd207866b1a45d56685`)

## Preflight Bet Check (Solution-Fit)

- **Outcome sought:** Every future session in this repository inherits the 10 proportional type scale rules (`% of S`) via `SYSTEM-INSTRUCTIONS.md` (`AS-5` and `AS-12`), and `nutrition@4.0.0` (`examples/2026-10-13-nutrition-infographic/renders-v4/`) demonstrates the complete 4-tier proportional scale (`92px / 31px / 25px / 21px` on `S = 1000px`) with zero first-pass overflow in Satori and Chromium and verified legibility at native `333 × 333` (`1/3` scale) and `400 × 400` (phone width) display sizes.
- **Smallest viable bet (and explicit non-goals):**
  - Codify the 10 rules in `SYSTEM-INSTRUCTIONS.md` (`AS-5` cross-reference + new `AS-12`) and `examples/2026-10-13-nutrition-infographic/DESIGN.md`.
  - Compute `DEFAULT_SIZES` in `tools/recipes/nutrition.mjs` (`nutrition@4.0.0`) directly from `CANVAS_SHORTER_SIDE = 1000` and `TYPE_SCALE_PCT = { headline: 0.092, subhead: 0.031, sectionLabel: 0.025, body: 0.021 }`, bound `hero_img` (`leaf_glow`) to `width: 220, height: 210`, adjust container widths (`header`/`hero`/`lower` `width: 952`, `callout` `width: 310` with `callout_text maxWidth: 260`, `items` `width: 678` with `item` `width: 165`, `benefitsPanel` `width: 262` with `34 × 34` icons and `maxWidth: 196`, `footer` `width: 940`), iterate in `.relay-scratch/` until `333px` and `400px` legibility is verified, publish `nutrition@4.0.0`, and then export final `renders-v4/` + `verification-v4.json`.
  - **Non-goals:** No changes to `tools/spike/fixture.json` (`1000 × 1000`), no changes to `tools/render.mjs` or `tools/request.mjs`, no changes to other published recipes (`solar-system`, `mangajdm-promo`, `recursive-process`), and no new test files.
- **Rollback / containment:** `Easy` — `nutrition@1.0.0..3.0.0` and `renders/` + `renders-v3/` remain untouched in `tools/catalog.sql` and on disk.

## Ordered Implementation & Inline Verification Plan

### Phase 1 — Codify Global Default Type Scale Rules (`% of S`) in `SYSTEM-INSTRUCTIONS.md` and `DESIGN.md`

1. In [`SYSTEM-INSTRUCTIONS.md`](../../SYSTEM-INSTRUCTIONS.md):
   - Update **`AS-5`** to require computing type sizes from `S = Math.min(width, height)` (`% of S` via **`AS-12`**) rather than picking arbitrary pixel literals.
   - Add **`AS-12 Size typography as a percentage of S (the canvas's shorter side) for 1/3-scale mobile legibility`**:
     - Codify all 10 rules and the 4-tier full-scale table (`Headline: 7–10% of S`, never `< 6%`; `Subhead / tagline: 2.5–3.5% of S`, `~⅓` of headline; `Section labels: 2.2–2.8% of S`, bold caps/small-caps; `Body / captions: 1.8–2.2% of S`, floor `1.8%`, never `< 1.5%`, max `~40 chars/line`; `Footer / source: 1.5% of S` only for non-essential source notes; max **4 distinct sizes** on the canvas; `Headline : body ratio >= 4:1`; **Rule 1** `1/3` scale legibility at `~400px` phone width; **Rule 5** largest graphic element `<= ~3×` headline cap height; **Rule 6** headline width `50–85%` of canvas width, wrapping to 2 lines before shrinking; **Rule 7** allocate whitespace with type size; **Rule 8** icon-plus-label pairs have label `>= 70%` of icon height; **Rule 9** 3-tier squint/blur test; **Rule 10** always compute `px = Math.round(S * pct)` from `S = Math.min(width, height)`).
   - Update `## Report` in [`SYSTEM-INSTRUCTIONS.md`](../../SYSTEM-INSTRUCTIONS.md) so visual reports record `S`, the `% of S` → `px` table (max 4 sizes, headline:body ratio, headline width `%`, hero-to-headline balance, icon-label ratio), and the `1/3`-scale (`333px`) / phone-width (`400px`) / squint inspection.
2. In [`examples/2026-10-13-nutrition-infographic/DESIGN.md`](../../examples/2026-10-13-nutrition-infographic/DESIGN.md):
   - Update recipe/bundle references to `nutrition@4.0.0` and `renders-v4/`.
   - Rewrite `## 2. Typography contract` around the **`AS-12` Proportional Type Scale (`S = 1000px`)** table (`92px` headline = `9.2% of S`, `31px` subhead = `3.1% of S`, `25px` section labels = `2.5% of S`, `21px` body/captions = `2.1% of S`; strictly 4 distinct sizes; `4.38:1` headline:body ratio; `79.0%–79.4%` headline width; `34 × 34px` benefit icons with `25px`/`30px` labels = `73.5%`/`88.2%` ratio; `220 × 210` `leaf_glow` stage and `280 × 210` callout stages with all visible graphic heights `<= 190.0px <= 3.0 × 64.4px = 193.2px` headline cap height).
   - Update `## 5. Deliberate taste & compliance record` to include **`AS-12`**.

### Phase 2 — Implement `nutrition@4.0.0`, Iterate in `.relay-scratch/` at Native `333px` & `400px`, and Freeze Declared Bytes (`R1`, `R3`)

1. In [`tools/recipes/nutrition.mjs`](../../tools/recipes/nutrition.mjs):
   - Bump `export const version = '4.0.0';`.
   - Remove the unused `DEFAULT_SIZES as SPIKE_DEFAULT_SIZES` import and define `CANVAS_SHORTER_SIDE = 1000`, `TYPE_SCALE_PCT = { headline: 0.092, subhead: 0.031, sectionLabel: 0.025, body: 0.021 }`, and `TYPE_SCALE` (`92, 31, 25, 21`), populating `DEFAULT_SIZES` exclusively for `NUTRITION_TEXT_IDS`.
   - Update container and element geometry in `buildScene(fixture, sizes)` so all 20 rendered text nodes fit on attempt 1 (`iterations: 0`) in both Satori and Chromium while preserving `GROUND_SHADOW_SPECS` (`AS-11`).
2. Render exploratory bundles into `.relay-scratch/v4-preview/{satori,playwright}/`, downscale to native **`333 × 333` (`33.3%`, approximately `1/3` scale)** and **`400 × 400` (`40.0%`, phone width)** (plus `480 × 480` explicitly labeled as `48.0%` gallery preview), and visually inspect all three scales across both backends (`AS-10`, `AS-12` Rules 1 & 9):
   - Verify whether every essential caption (`callout_1..2_text`, `item_1..4_caption`, `footer_tagline` at `21px` → `7.0px` at `333px` and `8.4px` at `400px`) is legible without zoom and whether 3 distinct hierarchy tiers survive squint/blur inspection.
   - If any caption or label fails native `333px` / `400px` readability or hierarchy separation, revise the layout/type scale in `tools/recipes/nutrition.mjs` and `DESIGN.md` and re-run the `.relay-scratch/` check before proceeding. Do **not** publish `nutrition@4.0.0` until visual iteration is complete and all catalog-declared files (`tools/recipes/nutrition.mjs`, `examples/2026-10-13-nutrition-infographic/DESIGN.md`) are frozen (`R1`, `R3`).

### Phase 3 — Publish `nutrition@4.0.0`, Export Final Verified `renders-v4/`, Register Design, Update Canaries/Docs & Verify (`R1`, `R2`, `R3`)

1. With all declared files for `nutrition@4.0.0` frozen (`tools/recipes/nutrition.mjs`, `examples/2026-10-13-nutrition-infographic/DESIGN.md`), publish `nutrition@4.0.0` in [`tools/catalog.sql`](../../tools/catalog.sql) **before** generating the final `renders-v4/` artifacts (`R1`):
   - `node tools/catalog.mjs publish nutrition 4.0.0`
   - `node tools/catalog.mjs verify`
2. Render the final published `nutrition@4.0.0` outputs across `satori` (`png,svg,html,html-inline`) and `playwright` (`png,html,html-inline`) into `examples/2026-10-13-nutrition-infographic/renders-v4/{satori,playwright}/`, generate `thumbnail.png` (`480 × 480`, `48%` gallery preview), and resolve each backend export with `selectedRun(exportRoot)` from `tools/render.mjs`. Read `result.json` inside that selected directory (the CLI publishes under `runs/<id>/`, not directly at the export root). Assert for both receipts that:
   - `catalog.slug === "nutrition"`
   - `catalog.version === "4.0.0"`
   - `catalog.verified === true`
   - `catalog.contentSha256` equals the published `content_sha256` of `nutrition@4.0.0` in `tools/catalog.sql`
   - `fitting.attempts === 1` and `fitting.iterations === 0`
   - `fitting.fit === true` and `fitting.unresolved.length === 0`
   Then write `examples/2026-10-13-nutrition-infographic/verification-v4.json` recording all 10 `AS-12` rule measurements, reproducible probe commands, and `AS-11` ground-shadow verification, and remove `.relay-scratch/v4-preview/`.
3. Register design `2026-10-13-nutrition-type-scale` in [`tools/catalog.sql`](../../tools/catalog.sql) and [`tools/design-log.jsonl`](../../tools/design-log.jsonl) using a `--friction` note `<= 200` characters (`118` chars, `R2`):
   - Resolve the repository-relative PNG path first, then pass that exact selected artifact to registration:
     ```bash
     artifact_path="$(node --input-type=module -e 'import path from "node:path"; import { selectedRun } from "./tools/render.mjs"; console.log(path.relative(process.cwd(), path.join(selectedRun("examples/2026-10-13-nutrition-infographic/renders-v4/satori"), "render.png")));')"
     ```
   - `node tools/catalog.mjs design add 2026-10-13-nutrition-type-scale --fixture examples/2026-10-13-nutrition-infographic/fixture.json --artifact "$artifact_path" --use-case nutrition@4.0.0 --friction "Four proportional type tiers on a 1000px canvas; mobile legibility and illustration balance reviewed on both backends."`
4. In [`tools/spike/test/canaries.test.mjs`](../../tools/spike/test/canaries.test.mjs) (lines 488, 490, 509), update the C4 scratch catalog publication version string from `'3.0.0'` to `'4.0.0'` to match `export const version = '4.0.0'` in `tools/recipes/nutrition.mjs`.
5. Use manifest-selected run paths for gallery links, thumbnails, and checksum entries; preserve the exported run contents. Update [`examples/2026-10-13-nutrition-infographic/README.md`](../../examples/2026-10-13-nutrition-infographic/README.md), [`examples/2026-10-13-nutrition-infographic/index.html`](../../examples/2026-10-13-nutrition-infographic/index.html), [`examples/2026-10-13-nutrition-infographic/SHA256SUMS`](../../examples/2026-10-13-nutrition-infographic/SHA256SUMS), root [`README.md`](../../README.md), and [`CHANGELOG.md`](../../CHANGELOG.md).
6. Run verification gates:
   - `pnpm test`
   - `node tools/catalog.mjs verify`
   - `node tools/catalog.mjs export --check`
   - `(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)`
   - `python3 "$HOME/Documents/GitHub/XYZ-forge/releases/releases_app.py" --root . check`
   - `utils/pdda/pdda.sh run`

## Verification Evidence & Compliance Report

*(To be populated during Phase 2 & Phase 3 execution.)*

## Codex Plan QA — 2026-10-13

- **Round 1 (`STATUS: Changes Requested`):** Raised `R1` (publish `nutrition@4.0.0` after freezing `DESIGN.md` + `nutrition.mjs` and before generating final `renders-v4/` receipts so `result.json` records `catalog.verified: true`), `R2` (shorten `design add --friction` from 224 chars to `<= 200` chars), and `R3` (inspect native `333×333` `1/3`-scale and `400×400` phone-width renders in `.relay-scratch/`, label `480×480` as `48%`, provide reproducible TrueType `OS/2` `sCapHeight` and visible graphic height probes, and evaluate `skip_spike` `190.0px` against `3 × capHeight`). All three are resolved in the revised plan above (`92/31/25/21px` candidate gives `capHeight = 64.4px`, `3.0 × capHeight = 193.2px >= 190.0px`).

- **Round 2 (`STATUS: Approved`):** R1 publication ordering and R2 friction length are resolved. R3 now has a mandatory pre-publication readability gate and defined cap-height/alpha metric; candidate measurements remain provisional until reproduced. Reviewer corrected receipt/artifact consumption to use `selectedRun`, added explicit successful-fit assertions, and required retained commands/hashes in final evidence. Approval is for implementation, not a claim of completed rendering or visual compliance.
