# RELAY · GH46 Diagram object shadow tuning round plan QA
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh46-plan): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268).

## Setup
- Artifact under review: **.relay-artifacts/GH-46-SHADOW-TUNING.md** (`PROJECT/2-WORKING/GH-46-SHADOW-TUNING.md`)
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-13
- Definition of Done: Grade the GH-46 surgical plan against the stated operational envelope and commensurate complexity:
  1. Replace whole-shape CSS `drop-shadow` (`PNG_SHADOW`) on the 6 grounded 3D cutouts (`balance_scale`, `skip_spike`, `parfait_jar`, `snack_container`, `chicken_wrap`, `water_bottle`) in `tools/recipes/nutrition.mjs` (`nutrition@3.0.0`) with deterministic two-layer SVG `<radialGradient>` ground/contact cast shadows (`groundShadowUri` + `groundedImg`) anchored at each object's measured alpha base footprint (upper-right corner light source casting toward lower-left, plus `imgOffsetY: 29` on `chicken_wrap` for tabletop alignment), while keeping `HERO_SHADOW` on `leaf_glow`.
  2. Codify `AS-11` in `SYSTEM-INSTRUCTIONS.md` and update `examples/2026-10-13-nutrition-infographic/DESIGN.md`.
  3. Preserve `examples/2026-10-13-nutrition-infographic/renders/` (`2026-10-13-nutrition-infographic`, `nutrition@2.0.0`) and `nutrition@1.0.0..2.0.2` immutable in `tools/catalog.sql`; write new outputs to `renders-v3/{satori,playwright}/`, publish `nutrition@3.0.0`, and register design `2026-10-13-nutrition-shadow-tuning`.
  4. Verify falsifiable acceptance criteria (including positive + red-control pixel check proving upper sides of tall cutouts have zero silhouette shadow halo while lower-left base footprint has cast shadow darkening), `70/25/50/75` rating in `releases.db`, and unchanged `test-budget.json`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Producer (author) — r1

**Operational Envelope & Review Questions:**
- **Scope:** Local single-recipe shadow tuning (`nutrition@3.0.0`), `DESIGN.md`, and `SYSTEM-INSTRUCTIONS.md` (`AS-11`) for [GH-46](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/46). Grade strictly against the stated requirements and commensurate complexity (no speculative enterprise abstractions, no changes to `tools/render.mjs`, `tools/request.mjs`, or `tools/spike/{scene.mjs,fixture.json,assets.mjs,assets/**,output/**}`, and no new test files).
- **Specific review questions:**
  1. Are all claims and base-footprint coordinates in `PROJECT/2-WORKING/GH-46-SHADOW-TUNING.md` grounded in the actual files (`tools/recipes/nutrition.mjs`, `tools/render.mjs`, `tools/catalog.mjs`, `examples/2026-10-13-nutrition-infographic/DESIGN.md`, `SYSTEM-INSTRUCTIONS.md`)?
  2. Does rendering a two-layer SVG `<radialGradient>` ground/contact shadow `<img src="data:image/svg+xml;base64,...">` inside a `position: 'relative'` stage cleanly extend the existing `toHtml`/`publishArtifacts`/`renderSatori`/`renderPlaywright` pipeline without modifying `tools/render.mjs` or `tools/request.mjs`?
  3. Does writing the new renders to `examples/2026-10-13-nutrition-infographic/renders-v3/` and registering `2026-10-13-nutrition-shadow-tuning` preserve `2026-10-13-nutrition-infographic` (`renders/satori/render.png`) and `nutrition@1.0.0..2.0.2` immutable in `tools/catalog.sql`?
  4. Are the `70/25/50/75` RELEASES rating and falsifiable pixel + catalog + canary checks (including the red control against `renders/satori/render.png`) sufficient?

handing off to Reviewer — go to the Reviewer window and say 'take your turn'

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
