# RELAY · GH46 Diagram object shadow tuning round plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-13.
-->

NEXT: Producer
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

### Reviewer (codex) — r1

**VERDICT: FAIL**
**Basis:** Block approval until the positioning recipe and design-registration command are corrected. The local helper approach is proportionate; no shared renderer change or new suite is warranted by this review.
swept file: yes

- [Blocker] **R1 — Unsupported registration flag.** `.relay-artifacts/GH-46-SHADOW-TUNING.md:103` includes `--canvas 1000x1000`. `tools/catalog.mjs:267-274` rejects that option as `unknown/missing option`; line 321 derives canvas dimensions from fixture data. **Fix:** remove `--canvas 1000x1000` from the planned command; retain the existing CLI.
  Observed input: Phase 3 step 2's literal `catalog design add ... --canvas 1000x1000` command.
  Affected scope: Registration of `2026-10-13-nutrition-shadow-tuning`; the command cannot reach the write operation.
  Falsifier: The seeded parser accepts `canvas` as a design-add option. Its explicit whitelist currently does not.

- [Should] **R2 — Margin does not implement the promised 29px translation.** The recon at artifact line 55 specifies `top: 29`, but Phase 2 at line 95 uses `marginTop: 29` inside a centered flex stage. A narrow Satori geometry probe measured `top: 15`, leaving the stated wrap base near 141.4 rather than 155.4. **Fix:** use an explicitly positioned cutout (`position: 'absolute', left: 0, top: spec.imgOffsetY ?? 0`) inside the fixed stage, or another measured full translation. Keep shadow placement independent and require both backend measurements of the resulting visible base during implementation.
  Observed input: 160×170 centered flex stage, 160×170 child, `marginTop: 29`, as specified at artifact line 95.
  Affected scope: `chicken_wrap` tabletop alignment and contact with its proposed shadow.
  Falsifier: The exact planned centered layout produces a full 29px translation in both backends; the Satori geometry control below instead produces 15px.
  Probe (exit 0; synthetic geometry only, no fixture execution or disk outputs):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module <<'JS'
  import fs from 'node:fs';
  globalThis.__dirname=process.cwd()+'/tools';
  const {default:satori}=await import('satori');
  for (const style of [{marginTop:29},{position:'absolute',top:29,left:0}]) {
    const boxes=[];
    await satori({type:'div',props:{style:{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:160,height:170},children:{type:'div',props:{id:'cutout',style:{width:160,height:170,backgroundColor:'red',...style}}}}},{width:160,height:170,fonts:[{name:'Inter',data:fs.readFileSync('tools/spike/assets/font.ttf'),weight:400}],onNodeDetected:n=>{if(n.props?.id==='cutout') boxes.push(n)}});
    console.log(JSON.stringify({style,boxes}));
  }
  JS
  ```
  Decisive output: margin case `{"left":0,"top":15,"width":160,"height":170}`; absolute case `{"left":0,"top":29,"width":160,"height":170}`. Earlier exploratory invocations exited 1 before measurement (missing Satori runtime setup / incorrect font path); only the corrected invocation above supports the finding.

- [Nit] **R3 — Correct the historical red-control label.** Artifact line 108 calls `renders/satori/render.png` `nutrition@2.0.2`, while its own line 60 and the Definition of Done pin the preserved design to `nutrition@2.0.0`. Use the historical pin consistently. Specify upper-side sample coordinates/masks, background-reference method, and numerical tolerance when recording the pixel probe, so its positive and red results can be repeated.
- [Pass] **Scope and export seam:** Artifact lines 73–75 keep the implementation recipe-local, preserve the hero glow, and forbid new dependencies/test files. `tools/render.mjs:98-117` admits SVG image data URIs, and lines 350–360 extract them into compact HTML assets. This supports the selected transport without a renderer rewrite; it is not proof of final rendered appearance.
- [Pass] **History and budget plan:** Artifact lines 97 and 111 preserve the old renders/catalog rows and add `renders-v3`; `tools/catalog.mjs:218-224` checks historical design file hashes. Artifact lines 104 and 109 reuse C4 and the existing four-canary budget; `test-budget.json` declares 1 file / 4 tests / 60 seconds / 0 workflows. The GH-46 rating is present as `70/25/50/75` in the seeded `releases.sql:50`.
- [Unverified — needs clone run] Final two-backend pixel/visual acceptance, all six alpha-footprint measurements, catalog publication/verification, canaries, live RELEASES DB checks, and PDDA remain implementation gates. No executable fixture, test suite, or validation script was run in this turn. The repo-local RELEASES Python entry points named in ROUTER are absent here; no alternate database writer was used.

**Handoff:** Producer (author), address R1 and R2 and record dispositions. Reversibility: Easy — only this relay file was edited; artifact and source files were left untouched. No git command was run; the harness owns the commit.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
