# RELAY · GH-42 final implementation review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
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
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     a beta test had this loop reach `Approved` in two rounds while an independent audit of the same
     branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the
     change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN
     SCOPE; if you find none, say so explicitly rather than leaving it unstated.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.** Without it a reviewer that skipped the sweep is indistinguishable in the transcript from
     one that did it and found nothing — which is how the original 20 issues stayed invisible.
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     **A finding that asks for a behaviour change is a generalization unless you can paste the concrete
     input — a row, a value, a `file:line` — that fails under the current code** (GH-681: the gh673
     final QA relay generalized one late-error observation into "or a later invalid identity", the
     Producer implemented it, the same seat `[Pass]`ed it next round, and one historical NULL-URL
     ledger row then blanked every issue). Every `[Blocker]` or `[Should]` requesting a behaviour
     change MUST carry three lines: `Observed input:` (the failing input you saw), `Affected scope:`
     (the input predicate the change would govern), `Falsifier:` (the fixture or data that would show
     the change unnecessary or wrong, and its expected result).
     A `[Blocker]` must cite an observed failure. This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request that carries no
     `Observed input:` / `Affected scope:` / `Falsifier:`), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh-42-final-implementation-review): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-42-DESIGN-INTAKE.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: producer
- Started: 2026-10-12

### Artifact — GH-42-DESIGN-INTAKE.md
```
---
title: DESIGN.md intake through the standard renderer
status: Active — implementation complete, final QA pending
created: 2026-10-12
updated: 2026-10-12
owner: Codex
goal: Translate art direction into validated data-only recipes and standard exports.
gh_issue: 42
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/42
doc_type: feature
effort: 3
complexity: 3
risk: 2
phases: 1
---

## Status

| What was just completed | What's next |
|---|---|
| Plan approved; adapter, skill, neutral example and focused checks implemented. | Final review, full gate and ready PR. |

## Request

An LLM translates DESIGN.md into structured design settings, artwork prompts and a recipe, checks backend capabilities, then uses standard validation and export. Private customer inputs remain private.


## Preflight bet and scope

Outcome: a portable intake package that another agent can interpret, preflight and render without inventing an HTML pipeline. User selected agent-assisted intake, with no new API dependency.

Smallest bet: one repo-local intake skill plus one trusted data-only recipe adapter. Its JSON carries source SHA-256, a requirements/disposition record, settings, layout elements, and separate PNG artwork prompts with optional completed asset pins. The skill owns semantic translation; deterministic code owns supported settings, assets, layout bounds and exports. No Markdown parser can prove faithful interpretation; human/agent visual comparison remains required.

The existing four recipe fixtures cannot describe new compositions or custom asset placements. A documentation-only instruction to copy an example preserves the ad-hoc renderer problem. Arbitrary generated JS/HTML import is rejected because it breaks the trusted-code boundary. No provider SDK, automatic paid calls, remote upload, responsive layout engine, new typography subsystem, or speculative plugin/registry framework.

Reversibility: Easy. Additive route; revert commits to remove. Existing requests must retain artifact bytes. Supporting multiple families, new fonts/Japanese glyphs, gradients or arbitrary CSS is explicitly outside v1; report those as unsupported rather than substitute. A source with those requirements may complete translation/preflight but must not receive a ready render claim until resolved in the recipe or engine with the user's agreement.

## Recon map

Base: 7882464ee5bea89b1854dac66a78340719ec6056 (origin/main). Primary checkout and parked branches untouched. Clone/branch: XYZ-layout-engine-gh42-design-intake-2026-10-12 / feat/XYZ-layout-engine-gh42-design-intake-2026-10-12.

Verify-tier graph: XYZ-layout-engine ready; tools/ and examples/ explicitly excluded, so source fallback read the bounded paths below. Primary graph has no recorded parser gaps; that does not prove completeness. No graph claims about excluded functions.

- tools/request.mjs normalizeRequest -> contained bounded JSON, fixed recipe list/canvases; saveFixture -> same recipe validators, safe atomic JSON replacement. Extend both allowlists for the trusted adapter; allow bounded canvas dimensions only for that recipe. No arbitrary module paths.
- tools/render.mjs processRequest -> recipe.validate -> pinned fonts -> buildScene -> shared Satori/Playwright geometry and fitting -> artifacts -> publishArtifacts/verifyPublication. Extend recipe validation/build context with root and inputPath, and optional per-fixture text contract; no second rendering/export path.
- tools/recipes/design-intake.mjs (new owner) -> strict settings, supported capabilities, source and asset hash/PNG checks; buildScene returns constrained nodes. Import existing readBounded, within, LIMITS and inspectPng. One bundled Barlow Condensed family, 400/700, keeps existing font API. Adapter-generated text IDs use the intake_text_ prefix (never header_caption), and region IDs use intake_region_; input element IDs remain independent. Text boxes own IDs and containment; render's fit loop remains authoritative.
- tools/intake.mjs (new thin CLI/library) -> expose adapter capabilities; preflight a package without rendering or spending. Report all declared unsupported requirements with paths, then run the same recipe validator; ready mode also checks pinned source/PNG assets. Rendering uses tools/render.mjs directly, never wrapper HTML.
- tools/catalog.mjs declaredFiles -> include new adapter/contract and shared dependencies; publish new design-intake@1.0.0. request.mjs is pinned by recursive-process@5.0.0, so publish 5.0.1 only after prior artifacts are proved unchanged.
- skills/design-diagram/SKILL.md currently documents bespoke scene copying; route DESIGN.md inputs to new skills/design-intake/SKILL.md. README documents supported contract, translation vs validation limits, capability report and standard commands.

Prior art: exact GitHub DESIGN.md/intake search returned none. Adjacent #13 delivers topic-to-diagram authoring, not this contract. Local prior_art_recon reported missing releases.db (installed-root lookup); manual roadmap CLI read succeeded. No existing exact fix candidate. Recurrence windows: 2026-09-29..10-12 vs 09-15..09-28; inspected issue titles and recent PR list. One current concrete intake gap; related #13/#28/#36 are feature history, not proven repeated incidents. No incident/reopening census; trend unknown.

## Ratings

2026-10-12 RELEASES read-back: rated 65/40/50/55, calc 210; no override. Priority 65 reflects user-selected next work and blocked reusable intake. Severity 40: manual workaround exists, no observed data loss. Appeal 50 neutral. Cheapness 55: small adapter plus shared seam changes and review; no network service. PDDA planning fields are separate from RELEASES ranking.

## Implementation and acceptance (one phase)

1. Run relevant existing baseline checks. Write the official translation contract and skill: preserve source document, explicit source hash, mapping of requirements to settings/artwork/layout or unsupported gaps; use one shared artwork style, individual prompts (subject/view/lighting/background/exclusions), filenames, background and dimensions. Generate assets only with existing authorized image workflow and record pins. Private inputs stay in ignored local folders; neutral public example only.
2. Add strict declarative adapter for bounded canvas, palette roles, fixed supported typography and absolute text/image/solid rectangle elements. Reject unknown keys/types, invalid IDs, absent text, out-of-canvas geometry, missing palette refs, overlapping text regions, unfulfilled requirements, unsupported fonts/effects. Bound count/bytes/pixels and paths under the authorized project root; PNG assets must match SHA-256. Source hash detects stale translation. No arbitrary CSS, HTML, code, remote URLs or data URLs accepted.
3. Wire that adapter into existing request/save/render operations. Pass context for local inputs; fixture-derived IDs/default sizes/containment feed existing fitting checks. Preserve other recipes' output. Add capability/preflight CLI with JSON output and nonzero failures; preflight may report pending artwork but readiness/render must refuse it. Reuse shared request validation for backend/format checks.
4. Demonstrate synthetic DESIGN.md -> translated fixture/settings/artwork prompts -> both backends -> offline PNG/SVG/compact HTML/inline HTML as supported -> verifyPublication. Visual inspect PNGs and thumbnail; document actual evidence and limitations. No paid generation required for implementation: a deterministic synthetic PNG fixture exercises asset handoff, clearly disclosed as such.
5. Extend existing C1 canary for structural validation and hostile/missing asset red controls, no new test/suite/workflow/dependency. Manual red controls cover source hash drift, pending asset, unsupported multi-font request, Playwright SVG, escape paths, unknown style, empty elements, overflow/overlap, PNG/hash tamper. A failed preflight/render must not publish a new manifest. Existing full suite once at final gate; targeted checks during work. Budget remains four tests and 60 seconds.
6. Publish new adapter and byte-preserving recursive patch through catalog CLI; verify canonical dump/content and prior output equality. Update README/CHANGELOG and this evidence log. Final Codex relay, PDDA and ready PR against main; retain clone pending merge. No merge authorized.

## QA packet

Plan/final reviewers: grade the concrete local agent workflow and commensurate complexity. Verify source paths, completeness, trust boundary, one validation/export owner, unchanged prior requests, declared limitations and honest ratings. No unrequested hosted/multi-tenant infrastructure. Reviewer writes only the relay thread; do not access private temp projects or run full suites in review worktrees. New contract can validate structure and declared capabilities, not prove an LLM's semantic faithfulness.

## Evidence and handoff

Plan QA Approved in round 2, attested against 2d581cd07f68; relay driver exit 0. Reviewer writes were isolated. R1/R2 accepted as below.

Implementation: trusted adapter and schema contract; thin capabilities/preflight entry; official repo skill; request/save/render seam reuse; neutral ridge example. Published adapter 1.0.0 then 1.0.1 for planned aggregate pixel-budget admission, with prior accepted artifacts unchanged. Recursive-process 5.0.1 accounts for request dependency hashes. The initial 1.0.0 source is retained as a separate checkpoint for catalog history.

Verification on Node 22.22.3 / darwin-arm64 / pinned dependencies:
- Catalog verify and canonical export passed; skill quick_validate passed.
- Both backend outputs and verifyPublication passed; full-size and thumbnail PNG inspection performed, no observed collision. Human acceptance pending.
- C1 passed in 36.2s before the planned-pixel control addition; both backends and relocated offline HTML tested. All named source/asset/capability/geometry/fit and publication-preservation controls passed. Final full gate must include the added budget assertion.
- 28/28 PNG/SVG/HTML/inline artifact digests matched origin/main baseline for all four prior recipes on both backends. Baseline captured in separate disposable gate clone, not historical committed output.
- Root cause of first browser failure: fixture headline lineHeight 1.1 put glyph bounds above its region at 80px, 28px and 12px. Recipe lineHeight 1.3 fixed it; shared fit checks unchanged. Test-local duplicate variable declaration was corrected before C1 ran. No failed run claimed as a pass.

Final QA/full PDDA/full canaries and PR pending. Private project files untouched.

Plan round 1 dispositions: R1 accepted — namespace generated text/region IDs to avoid nutrition header_caption bypass; verify an overflowing input element named header_caption fails normally. R2 accepted — replace scaffold DoD with explicit plan criteria.
```
- Definition of Done: Final review of changes since 7882464ee5bea89b1854dac66a78340719ec6056 through 960abcc. Read the full changed modules and the skill/contract/example, using canonical plan acceptance and commensurate local-agent scope. Check requirements, shared validation/export reuse, data-only boundary, and actual negative controls. Evidence: TESTS-RESULTS/2026-10-12-GH-42/C1.log (focused C1 passed); prior-artifact-digests.json baseline compared 28/28 unchanged; both backend PNGs inspected. Pending-asset aggregate-budget green/red probe passed after C1. Full four-canary and PDDA gates run after final code approval before ready PR. No full suites in review worktree, no private inputs. Reviewer only writes this thread. Public history includes recipe@1.0.0 source at 17957fb and final @1.0.1 at 960abcc; no production modifications needed merely to simplify version history. The installed roadmap CLI is absent in review worktrees; rating evidence in canonical releases.sql may be read as text. Do not attempt to install it.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: Block final approval for R1: the strict palette validator admits an array as a color and reports readiness before the renderer crashes. The architecture otherwise follows the approved local-agent scope. Full gates remain the producer/harness responsibility.
swept file: yes

Full-source sweep: `tools/recipes/design-intake.mjs`, `tools/intake.mjs`, `tools/request.mjs`, `tools/render.mjs`, `tools/catalog.mjs`, `tools/recipes/recursive-process.mjs`, and `tools/spike/test/canaries.test.mjs`; also the contract, both skills, neutral source/fixture/README, embedded plan and supplied evidence. No additional pre-existing runtime defect observed in this bounded sweep. Graph Verify-tier availability checked: nearest project `XYZ-layout-engine`, generation `2026-10-13T02:52:30Z`, is another checkout and excludes tools/examples; coverage reports missing new files. Findings therefore use this worktree's source, not graph completeness. No git commands, suites, fixture executables, publication, or source edits performed.

- [Should] **R1 — reject non-string palette values before reporting readiness.** `tools/recipes/design-intake.mjs:69` applies a regex directly to arbitrary JSON values. JavaScript coerces a singleton array to its string element; the array then reaches the renderer as a color. This violates the contract's strict settings/type admission and defeats preflight-before-spend. Fix: require `typeof v === 'string'` alongside the existing regex; extend the existing C1 malformed-input controls with this case, without adding a suite. Reversibility: Easy; affected code is one admission predicate. Follow the existing catalog publication policy for the changed adapter.
  Observed input: the committed neutral fixture with only `settings.palette.ink = ["#343b3a"]`; preflight returns ready, then Satori rejects with an internal type error.
  Affected scope: non-string JSON values in `settings.palette` (particularly singleton arrays whose string coercion matches the color regex).
  Falsifier: unchanged `ink: "#343b3a"` must remain ready; `ink: ["#343b3a"]` must fail at `settings.palette.ink` before scene construction/rendering. If the current preflight already rejects the latter, this finding is unnecessary.
  Probe command (exit **0**; error deliberately caught; no output artifacts):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  mkdir -p "$TMPDIR"
  node --input-type=module <<'JS'
  import fs from "node:fs/promises";
  import {preflight,buildScene,FONT} from "./tools/recipes/design-intake.mjs";
  import {renderSatori} from "./tools/render.mjs";
  const f=JSON.parse(await fs.readFile("examples/2026-10-12-design-intake/fixture.json"));
  f.settings.palette.ink=["#343b3a"];
  console.log("ready",(await preflight(f)).ready);
  const scene=await buildScene(f);
  try {await renderSatori(scene,{regular:await fs.readFile(FONT.regular),bold:await fs.readFile(FONT.bold)},f.width,f.height,FONT.family,{raster:false});console.log("render accepted");}catch(e){console.log("render rejected:",e.message);}
  JS
  ```
  Decisive output: `ready true` followed by `render rejected: A.toLowerCase is not a function`.
- [Pass] Shared ownership and trusted-data boundary: `tools/request.mjs` uses the fixed recipe allowlist; `tools/render.mjs:210` validates the recipe before rendering, and its existing fitting/publication operations remain authoritative. `tools/recipes/design-intake.mjs` generates IDs with the literal prefixes `intake_text_` and `intake_region_`; C1's `header_caption` overflow control is at `tools/spike/test/canaries.test.mjs:325`. No arbitrary module import or provider dispatch is introduced by intake. Action: retain these boundaries while fixing R1.
- [Pass] Existing C1 covers the named source/asset/geometry/readiness failure classes and publication preservation (`tools/spike/test/canaries.test.mjs:309`, assertion text `failed intake changed publication`). Supplied `TESTS-RESULTS/2026-10-12-GH-42/C1.log` says `# pass 1`, `# fail 0`; that is a prior-run receipt, not a rerun in this review. The added planned-budget assertion is at line 331. Action: include it and R1 in the pending disposable-clone gate.
- [Pass] Visual preview review: opened `examples/2026-10-12-design-intake/satori.png` and `playwright.png` at their supplied 800×1040 size. Both show a dominant headline, large schematic subject and separate explanation/disclosure with no observed collisions (AS-1/4/7/8). The example README explicitly says `not generated by an image model`. No new thumbnail render or independent semantic-fidelity claim. Action: retain the honest synthetic disclosure.
- [Nit] `README.md` → Geometry and Backend Restrictions still states the four fixed canvases and `Other dimensions and scale are explicitly rejected.` Add the bounded design-intake canvas exception so this section agrees with the new intake documentation and `tools/request.mjs`.
- [Unverified — needs clone run] Full four-canary/PDDA gates and independent replay of the claimed 28/28 baseline equality. `prior-artifact-digests.json` supplies 28 baseline values, but this reviewer did not regenerate candidate artifacts or compare base/candidate checkouts. No approval of those pending gates is implied.

Handing off to Producer — fix/disposition R1 and the documentation nit, retain the probe evidence, then open round 2. Go to the producer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
