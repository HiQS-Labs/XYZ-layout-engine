# Relay Plan QA — GH-48: Global Default Proportional Type Scale Rules (`% of S`) & `nutrition@4.0.0` Typography Overhaul

- **Task ID:** `GH48-PLAN-20261013`
- **Issue:** [GH-48](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/48)
- **Plan artifact:** `PROJECT/2-WORKING/GH-48-TYPE-SCALE-RULES.md`
- **Clone:** `~/Documents/GitHub/XYZ-layout-engine-gh48-type-scale-rules-2026-10-13`
- **Branch:** `feat/XYZ-layout-engine-gh48-type-scale-rules-2026-10-13` (based on `origin/main` at `ed5652940f2a0ab78ff5113340928d3bb76ca20e`)
- **Producer:** `author` (Antigravity)
- **Reviewer:** `codex`

---

## Round 1 — Producer Submission (`author`)

### 1. Problem & Operator Requirements

The operator requested (`/start-task` on [GH-48](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/48)):
1. Codify the **10 global default proportional font size rules (`% of S`, where `S = Math.min(width, height)` is the canvas's shorter side)** as the repository-wide default for all sessions in `SYSTEM-INSTRUCTIONS.md`.
2. Overhaul the `Fuel Well. Live Well.` nutrition infographic (`tools/recipes/nutrition.mjs` → `nutrition@4.0.0`, `examples/2026-10-13-nutrition-infographic/`) on its `1000 × 1000` canvas (`S = 1000px`, confirmed by operator) so that it satisfies all 10 rules across both Satori (`0.36.0`) and Chromium (`1.64.0`) backends while preserving `AS-11` directional ground/contact cast shadows (`GROUND_SHADOW_SPECS`) and immutable catalog history (`nutrition@1.0.0..3.0.0`, `renders/`, `renders-v3/`).

### 2. Ground-Truth Measurements (`S = 1000px`, `nutrition@3.0.0` vs. `nutrition@4.0.0`)

| Rule / Invariant | `nutrition@3.0.0` (Prior) | `nutrition@4.0.0` (Proposed at `S = 1000px`) | Verification Method |
|---|---|---|---|
| **Rule 1 (1/3 scale legibility at ~400px phone width)** | Captions `14px` → `4.7px` at 1/3 scale (illegible) | Captions `20px` → `6.7px` (`8px` at `400px`), Labels `25px` → `8.3px`, Subhead `30px` → `10px`, Headline `90px` → `30px` | Full-size (`1000×1000`) + `1/3`-scale (`333×333` & `480×480`) inspection across Satori & Chromium |
| **Rule 2 (Headline = 7–10% of S; never < 6%)** | `50px` (`5.0% of S`) | `90px` (`9.0% of S`, `Math.round(S * 0.09)`) | `DEFAULT_SIZES.header_headline === 90` |
| **Rule 3 (Body/caption floor = 1.8% of S; never < 1.5%)** | `14px` (`1.4% of S`) | `20px` (`2.0% of S`, `Math.round(S * 0.02) >= 18px`) | `Math.min(...Object.values(DEFAULT_SIZES)) === 20` |
| **Rule 4 & Table (Headline:body >= 4:1; max 4 sizes on canvas)** | `50:14 = 3.57:1`; **9 sizes** (`50,24,21,20,18,17,16,15,14`) + 5 unused `hero_*` keys | `90:20 = 4.50:1`; **strictly 4 sizes** (`[90, 30, 25, 20]`, unused `...SPIKE_DEFAULT_SIZES` removed) | `new Set(Object.values(DEFAULT_SIZES)).size === 4` and `90 / 20 === 4.5` |
| **Rule 5 (Type vs. illustration balance: largest graphic <= ~3x headline cap height)** | `hero_img` (`leaf_glow`) `height: '100%'` (`~450px` = `45%` of canvas, `12.9×` `35px` cap height) | `hero_img` (`leaf_glow`) `width: 220, height: 210` (`21%` of canvas; visible leaf height `184.5px <= 189px = 3.0 × 63px` cap height); `callout_1..2_img` `280 × 210` (`visH: 172.9px / 190.0px`) | `bounds.hero_img.height === 210` (`2.33×` `90px` fontSize; `visH 184.5 <= 3 * 63`) |
| **Rule 6 (Headline width = 50–85% of canvas width)** | `434px` (`43.4%` of `1000px`) | `773px` Satori / `777.25px` Chromium (`77.3%–77.7%` of `1000px`) | `textBoxes.header_headline.box.width` in `[500, 850]` |
| **Rule 7 (Allocate whitespace with type size)** | Large empty margins around `14–20px` text | Expanded `callout` (`310px`, text `maxWidth: 250`), `benefitsPanel` (`262px`, single-line rows), `footer` (`940px`) filled by `90/30/25/20px` hierarchy | Visual & bounding-box utilization check |
| **Rule 8 (Icon-plus-label pairs: label >= 70% of icon height)** | `15px` label on `44px` icon (`34.1%`) | `25px` label (`30px` box height) on `34 × 34px` icon (`73.5%` font / `88.2%` box height) | `25 / 34 = 0.735 >= 0.70` and `30 / 34 = 0.882 >= 0.70` |
| **Rule 9 (The squint test: 3 visual tiers survive blur)** | Middle tier (`15–20px`) collapses into body (`14–16px`) | 3 distinct tiers: Headline (`90px`) / Section labels (`25px` bold uppercase `#2f5d27`) / Body captions (`20px` regular `#3d4639`) | Thumbnail / blur inspection |
| **Rule 10 (Never pick raw px; compute from S and %)** | Hardcoded pixel literals (`50, 24, 20...`) | `CANVAS_SHORTER_SIDE = 1000`, `TYPE_SCALE_PCT = { headline: 0.09, subhead: 0.03, sectionLabel: 0.025, body: 0.02 }`, `Math.round(S * pct)` | Code & `verification-v4.json` audit |

### 3. Probed First-Attempt Fit (`attempts: 1, iterations: 0`) & C1 Canary Compatibility

We ran a live Node probe in `~/Documents/GitHub/XYZ-layout-engine-gh48-type-scale-rules-2026-10-13` against both `renderSatori` (`0.36.0`) and `renderPlaywright` (`1.64.0`):
- **Default fixture (`tools/spike/fixture.json`):**
  - `Satori overflows: []` (`attempts: 1, iterations: 0`)
  - `Playwright overflows: []` (`attempts: 1, iterations: 0`)
  - Section vertical stack on `1000 × 1000` canvas (`padding: '22px 24px 20px', gap: 10`):
    - `header`: `y = 22, height = 153` (`header_headline` `width: 773, height: 113` on 1 line; `header_subtitle` `width: 391, height: 36` on 1 line)
    - `hero`: `y = 185, height = 462` (`callout_1` and `callout_2` both `width: 310, height: 305` with 2-line captions at `maxWidth: 250`; `hero_img` `width: 220, height: 210`)
    - `lower`: `y = 657, height = 259` (`items` `width: 678, height: 259` with 4 items of `width: 165, gap: 6`; `benefitsPanel` `width: 262, height: 194` with 4 single-line rows at `icon: 34×34, fontSize: 25, maxWidth: 196`)
    - `footer`: `y = 926, height = 54` (`width: 940`, `y + height = 980 <= 1000`)
- **Canary C1 edit (`sections.header.headline = 'Saved <label> & "quoted"'`):**
  - Wraps cleanly to 2 lines (`width: 820, height: 226`) inside `header_row` without overflowing `header` or the `1000 × 1000` canvas.

### 4. Exact Files to Touch & Protected Invariants

1. **`SYSTEM-INSTRUCTIONS.md`:**
   - Update `AS-5` to reference `AS-12` (`% of S` computation).
   - Add `AS-12 Size typography as a percentage of S (the canvas's shorter side) for 1/3-scale mobile legibility` containing all 10 rules and the 4-tier full-scale table.
   - Update `## Report` to require reporting `S`, the `% of S` → `px` table, and `1/3`-scale / squint verification.
2. **`tools/recipes/nutrition.mjs` (`nutrition@4.0.0`):**
   - Bump `version = '4.0.0'`.
   - Export `CANVAS_SHORTER_SIDE = 1000`, `TYPE_SCALE_PCT = { headline: 0.09, subhead: 0.03, sectionLabel: 0.025, body: 0.02 }`, and `TYPE_SCALE`, and compute `DEFAULT_SIZES` for `NUTRITION_TEXT_IDS` only (removing `...SPIKE_DEFAULT_SIZES`).
   - Update `buildScene` geometry (`hero_img` `width: 220, height: 210`, `callout` `width: 310` with `callout_text maxWidth: 250`, `items` `width: 678` with `item` `width: 165, gap: 6`, `benefitsPanel` `width: 262` with `34×34` icons and `maxWidth: 196`, `footer` `width: 940`) while keeping `GROUND_SHADOW_SPECS` (`AS-11`) intact.
3. **`examples/2026-10-13-nutrition-infographic/`:**
   - Update `DESIGN.md`, `README.md`, `index.html`, and `SHA256SUMS`.
   - Generate `renders-v4/{satori,playwright}/` and `verification-v4.json` (leaving `renders/` and `renders-v3/` byte-identical).
4. **`tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs`, `README.md`, `CHANGELOG.md`:**
   - Publish `nutrition@4.0.0`, register design `2026-10-13-nutrition-type-scale`, bump C4 version literal in `tools/spike/test/canaries.test.mjs` (`'3.0.0'` → `'4.0.0'`), and document in `README.md` and `CHANGELOG.md`.
5. **Protected files (zero diff):**
   - `tools/render.mjs`, `tools/request.mjs`, `tools/spike/{scene.mjs,fixture.json,assets.mjs,assets/**,output/**}`, `examples/2026-10-13-nutrition-infographic/renders/**`, `examples/2026-10-13-nutrition-infographic/renders-v3/**`, `test-budget.json`.

### 5. Review Questions for `codex`

Please review `PROJECT/2-WORKING/GH-48-TYPE-SCALE-RULES.md` and the live repository state against `AGENTS.md`, `GUIDING-PRINCIPLES.md`, `SYSTEM-INSTRUCTIONS.md`, and `PROJECT/PDDA.md`, and record your `VERDICT:` (`STATUS: Approved` or `STATUS: Changes Requested`).

## Round 1 — Codex Plan Review

VERDICT: Changes Requested
STATUS: Changes Requested

**Block pending R1–R3.** The smallest viable mechanism is appropriate: recipe-owned proportional
sizes and geometry, existing publication APIs, unchanged core rendering, and preserved historical
artifacts. These concrete gaps prevent approval of the submitted sequence:

1. **R1 (P2), plan Phase 2 step 2 / Phase 3 step 1 — Final renders precede publication.**
   `tools/render.mjs:365–383` records `catalog.verified: false` and
   `current module version is unpublished` when the current recipe version is absent. Publishing
   later cannot repair those saved receipts. Use scratch exports for exploration, freeze all
   declared inputs (`tools/catalog.mjs:125–135` includes `DESIGN.md`), publish, then regenerate
   final exports and assert verified version/digest receipts before registering the design and
   producing checksums. Do not publish until visual iteration is finished.
2. **R2 (P2), plan Phase 3 step 2 — Registration command is rejected.** A read-only Python
   extraction measured the supplied `--friction` at **224 characters**; `tools/catalog.mjs:315`
   enforces a maximum of **200**. Shorten it. The plan review section provides a replacement.
3. **R3 (P2), plan Phase 2 step 2 and ground-truth claims — Acceptance conflates numeric
   sizing with demonstrated legibility.** `333/1000 = 0.333`; `480/1000 = 0.48`. A 20px
   caption becomes 6.67px at one third and 8px at 400px width. Correct the preview labels,
   inspect native-size 333px and 400px images from both backends, and make failed readability
   trigger another layout/type iteration before publication. Preserve reproducible probe
   commands and candidate identification for the submitted geometry claims. Explain the cap
   height measurement and approximate Rule 5 tolerance: the submission's largest visible
   graphic is 190px (`skip_spike`), which is 3.016 times the claimed 63px cap height. The
   184.5px leaf alone does not establish the largest-graphic invariant. This is a measurement
   definition gap, not a claim that a 1px excess violates an approximate rule.

### Actions and verification

- Updated the allowed plan's status/next action and appended the R1–R3 correction contract.
  Replaced its literal personal home prefix with `$HOME` in the external releases check.
- Source review confirmed the current recipe is still `nutrition@3.0.0`, C4 has the three
  planned `3.0.0` literals, and the proposed current-version update does not require core
  rendering changes. The submission contains no `▶ TAKE YOUR TURN` block; followed its
  explicit review request and the operator's claim/edit/release instructions.
- Focused checks: `frontmatter`, `status-table`, and `hardcoded-paths` through
  `utils/pdda/pdda.sh`, scoped with `PDDA_ONLY_FILE` to the plan and with
  `PDDA_ACTIVITY_LOG` redirected under `.relay-scratch/`. All returned zero findings before
  review edits and after them (each exit 0; errors=0, warns=0, info=0).
- The startup roadmap command could not run: neither `utils/py/releases_app.py` nor
  `.xyz/utils/py/releases_app.py` exists in this checkout. No roadmap state is attested.
- No Git commands, runtime edits, catalog writes, full suite, or visual rendering were run.
  Reported v4 geometry remains producer evidence, not independently reproduced evidence.

NEXT: author
