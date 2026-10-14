# RELAY · GH46 Diagram object shadow tuning round final QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-13.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 3

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268).
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.**
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     Every `[Blocker]` or `[Should]` requesting a behaviour change MUST carry three lines: `Observed input:`, `Affected scope:`, `Falsifier:`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why), make the change, then add new work.
4. **Append one block** immediately above the `<!-- ↓↓↓ NEXT TURN ... ↓↓↓ -->` marker:
   - Reviewer heading: `### Reviewer (<agent>) — r<N>`
   - Producer heading: `### Producer (<agent>) — r<N>` (same `N` while closing Round `N`; increment `ROUND` when opening the next cycle).
5. **Update the 3-line header at the top:**
   - Producer done → `NEXT: Reviewer`, `STATUS: Open`.
   - Reviewer `VERDICT: FAIL` and `ROUND < max` → `NEXT: Producer`, `STATUS: Open`.
   - Reviewer `VERDICT: PASS` → `NEXT: Closed`, `STATUS: Approved`.
   - Reviewer `VERDICT: FAIL` at max rounds, or `PARKED` → `NEXT: Closed`, `STATUS: Escalated` or `Parked`.
6. **Reply in chat** with the handoff line:
   `handing off to <other role> — go to the <other role> window and say 'take your turn'` (or `relay complete — <STATUS>` if closed).

---

## Setup
- **Artifact:** `PROJECT/2-WORKING/GH-46-SHADOW-TUNING.md` (along with `SYSTEM-INSTRUCTIONS.md`, `tools/recipes/nutrition.mjs`, `examples/2026-10-13-nutrition-infographic/{DESIGN.md,README.md,index.html,verification-v3.json,SHA256SUMS,renders-v3/}`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/spike/test/canaries.test.mjs`, `README.md`, and `CHANGELOG.md`)
- **Producer:** author
- **Reviewer:** codex
- **Definition of Done:**
  1. `SYSTEM-INSTRUCTIONS.md` codifies rule `AS-11 Ground 3D cutouts with directional base/contact cast shadows, not whole-shape silhouette drop-shadows`.
  2. `examples/2026-10-13-nutrition-infographic/DESIGN.md` and `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`) replace whole-shape `PNG_SHADOW` (`drop-shadow(0px 8px 6px rgba(31,42,28,0.22))`) on the 6 grounded 3D cutouts (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) with a deterministic two-layer SVG `<radialGradient>` ground shadow (`contact` occlusion + directional lower-left `cast` ellipse from an upper-right corner light source) rendered inside a `position: 'relative'` stage behind each cutout `<img>`, while retaining `HERO_SHADOW` (`drop-shadow(0px 6px 8px rgba(242,228,150,0.45))`) on `leaf_glow` (`hero_img`).
  3. `chicken_wrap` (`item_3_img`) is explicitly positioned at `top: 60, height: 107` inside its `160 × 170` stage so its visible base (`visibleBaseY = 154`) aligns with `snack_container` (`154.0`) and `parfait_jar` (`156.2`) across both Satori and Chromium without overflowing its stage (`y + height = 167 <= 170`).
  4. `examples/2026-10-13-nutrition-infographic/renders/` (`2026-10-13-nutrition-infographic`, `nutrition@2.0.0`..`2.0.2`) and all historical catalog rows remain untouched; new renders are exported to `examples/2026-10-13-nutrition-infographic/renders-v3/{satori,playwright}/` + `verification-v3.json`, `nutrition@3.0.0` is published, and `2026-10-13-nutrition-shadow-tuning` is registered in `tools/catalog.sql` and `tools/design-log.jsonl`.
  5. Positive and red-control pixel luma checks, `pnpm test` (4/4 canaries within 60s budget, `test-budget.json` untouched), `node tools/catalog.mjs verify`, `node tools/catalog.mjs export --check`, `shasum -a 256 -c SHA256SUMS`, `releases_app.py --root . check`, and `utils/pdda/pdda.sh run` all pass.

## Ground rules
- Append-only log; never edit or delete prior turns.
- Grade every Reviewer finding: `[Blocker]` `[Should]` `[Nit]` `[Pass]`.
- Producer logs a disposition per finding before new work.
- Stay inside the 3-round cap; escalate if unresolved.

---

## Log

### Producer (author) — r1

**Call:** Implemented GH-46 end-to-end per the approved plan (`GH46-PLAN-20261013`), publishing `nutrition@3.0.0`, registering design `2026-10-13-nutrition-shadow-tuning`, exporting `renders-v3/{satori,playwright}/` + `verification-v3.json`, and passing all verification gates.

**Bet & Reversibility:**
- **Bet:** Rendering a two-layer `<radialGradient>` SVG (`cast` + `contact`) as an absolute-positioned `<img src="data:image/svg+xml;base64,...">` behind each cutout `<img>` inside a `position: 'relative'` stage grounds all 6 tabletop cutouts with directional lower-left cast shadows from an upper-right corner light source across both Satori+resvg and Chromium with zero upper-silhouette shadow halo and zero edits to `tools/render.mjs`.
- **Reversibility:** `Easy` — recipe-local update in `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`) and additive `renders-v3/` exports; `renders/` (`nutrition@2.0.0`) and all prior catalog rows remain byte-for-byte untouched.

**Summary of Changes & Citations:**
1. **`SYSTEM-INSTRUCTIONS.md:45-46` (`AS-11`):** Codified rule `AS-11 Ground 3D cutouts with directional base/contact cast shadows, not whole-shape silhouette drop-shadows`, requiring two-layer base/contact cast shadows from a consistent corner light source for resting 3D cutouts and shared ground baseline alignment for sibling cutouts in the same row.
2. **`examples/2026-10-13-nutrition-infographic/DESIGN.md:1-166`:** Updated to `nutrition@3.0.0`, documenting the measured alpha base footprints (`a > 24`) and the `GROUND_SHADOW_SPECS` contact and cast ellipse coordinates in §4.1–4.2 and recording `AS-11` compliance in §5.
3. **`tools/recipes/nutrition.mjs:6,44-110,139,215` (`nutrition@3.0.0`):**
   - Bumped `export const version = '3.0.0';`.
   - Added `GROUND_SHADOW_SPECS`, `groundShadowUri(id)`, and `groundedImg(slotId, assetId, src, { width, height })` for the 6 grounded cutouts (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`), with `imgTop: 60, imgHeight: 107` on `chicken_wrap` (`item_3_img`).
   - Kept `HERO_SHADOW = 'drop-shadow(0px 6px 8px rgba(242,228,150,0.45))'` on `hero_img` (`leaf_glow`).
4. **Catalog & Design Registration (`tools/catalog.sql`, `tools/design-log.jsonl`):**
   - Published `nutrition@3.0.0` (`rcv-e3defafd-1180-4d43-ae5f-8fa13d284890`, `content_sha256: 5ba81bcb2409c2df92148a20b8f95bcab1ae52ee935a39a29b0a82bca136675b`).
   - Registered design `2026-10-13-nutrition-shadow-tuning` pinned to `nutrition@3.0.0` (`artifact_digest: 3321e800b81f3528c394ba58d5c8ce87f93a90305777d7976e311653d51f0e93`).
   - Preserved `2026-10-13-nutrition-infographic` (`nutrition@2.0.0`) and `renders/` untouched on disk.
5. **Canary & Documentation Updates:**
   - Updated `tools/spike/test/canaries.test.mjs:488,490,509` C4 isolated catalog publish version literal from `'2.0.2'` to `'3.0.0'`.
   - Updated `examples/2026-10-13-nutrition-infographic/{README.md,index.html,verification-v3.json,SHA256SUMS}`, `README.md`, `CHANGELOG.md`, and `PROJECT/2-WORKING/GH-46-SHADOW-TUNING.md:107-136` (including the Reviewer R3 nit clarification defining `P_bg_cap = (600, 690)` explicitly).

**Verification Evidence (recorded in `PROJECT/2-WORKING/GH-46-SHADOW-TUNING.md:119-136` and `verification-v3.json`):**
- **Both-backend `item_3_img` (`chicken_wrap`) geometry & baseline:**
  - Satori: `bounds.item_3_img = { x: 388, y: 733, width: 160, height: 107 }` (`y + height = 840 < 848` `item_3_title.y`), `visibleBaseY = 154` inside the `160 × 170` stage (`fit: true`, `attempts: 1`).
  - Chromium: `bounds.item_3_img = { x: 387.5, y: 734.5, width: 160, height: 107 }` (`y + height = 841.5 < 849.5` `item_3_title.y`), `visibleBaseY = 154` inside the `160 × 170` stage (`fit: true`, `attempts: 1`).
- **Positive & Red-Control Pixel Luma Probe (`water_bottle`, `x0 = 565, y0 = 673`):**
  - `renders-v3/satori/render.png`: `|L(P_bg_upper) - L(P_upper)| = 0.00 <= 2.0` at `(619, 728)`, `|L(P_bg_cap) - L(P_cap_under)| = 0.11 <= 1.5` at `(649, 690)`, `L(P_bg_base) - L(P_cast) = 51.61 >= 18.0` at `(617, 836)` (`47.31 >= 18.0` at `(613, 836)`).
  - `renders-v3/playwright/render.png`: `|L(P_bg_upper) - L(P_upper)| = 0.89 <= 2.0`, `|L(P_bg_cap) - L(P_cap_under)| = 0.11 <= 1.5`, `L(P_bg_base) - L(P_cast) = 44.90 >= 18.0` (`40.02 >= 18.0` at `(613, 836)`).
  - Red control `renders/satori/render.png` (`nutrition@2.0.0`): `L(P_bg_cap) - L(P_cap_under) = 13.00 > 6.0` at `(649, 690)` (upper-cap halo present) and `L(P_bg_base) - L(P_cast_48) = 2.42 < 5.0` at `(613, 836)` (no lower-left directional cast shadow).
- **Automated Suites:**
  - `pnpm test`: 4/4 canaries pass in `25.7s` (budget `60s`, `test-budget.json` untouched).
  - `node tools/catalog.mjs verify --json`: `{"valid":true,"errors":[]}`; `node tools/catalog.mjs export --check`: `{"canonical":true}`.
  - `(cd examples/2026-10-13-nutrition-infographic && shasum -a 256 -c SHA256SUMS)`: 45/45 `OK`.
  - `releases_app.py --root . check`: `clean (0 failures, 0 warning(s))` at generation `87`.
  - `utils/pdda/pdda.sh run`: `no errors`.

handing off to Reviewer — go to the Reviewer window and say 'take your turn'

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
