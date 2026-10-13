# RELAY · GH-42 intake plan review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Producer
STATUS: Approved
ROUND: 2 / 3

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
6. **Commit only the relay file** (`relay(gh-42-intake-plan-review): <role> r<N>`); no push. **Stop** and report one line.
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
status: Active — plan QA pending
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
| Captured intake and traced renderer limitations. | Complete plan review before implementation. |

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

Plan QA pending. Implementation not started. PR pending.

Plan round 1 dispositions: R1 accepted — namespace generated text/region IDs to avoid nutrition header_caption bypass; verify an overflowing input element named header_caption fails normally. R2 accepted — replace scaffold DoD with explicit plan criteria.
```
- Definition of Done: Plan review: assess the Implementation and acceptance and QA packet sections for sufficiency and concrete omissions; do not require implementation evidence before plan approval.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: Block plan readiness on one concrete fitting-seam omission; the overall local, data-only approach is proportionate. This is plan QA, not an observed failure of an implementation that does not yet exist.
swept file: yes

- [Should] R1 — Account for the existing nutrition-only caption exception when admitting fixture-derived text IDs. The plan's “fixture-derived IDs/default sizes/containment feed existing fitting checks” does not address the unconditional `header_caption` special cases at `tools/render.mjs:254` and `tools/render.mjs:310`. Both skip this ID when `fixture.sections?.header?.caption` is absent, and the latter overwrites its geometry with `{ present: false }`. Cheapest fix: state that the new adapter reserves/rejects this ID (with a field-specific error), or scope both exceptions to nutrition while preserving its optional-caption behavior. Add this case to the already planned targeted red controls; no new suite.
  Observed input: Current source predicates `id === 'header_caption' && !fixture.sections?.header?.caption` at both cited locations. A planned intake text element whose ID is `header_caption`, with no nutrition `sections.header.caption`, satisfies those predicates regardless of its text/box geometry. Source-traced counterexample; no new-adapter runtime repro claimed.
  Affected scope: Only design-intake text IDs interacting with the shared fitting/receipt loops; preserve existing nutrition caption semantics and prior artifact bytes.
  Falsifier: A design-intake fixture containing an overflowing `header_caption` element must either fail explicitly as a reserved ID or undergo normal fitting and fail on exhausted fit; it must never succeed by recording that element as absent. An omitted nutrition caption must retain its existing behavior.
- [Nit] R2 — The Setup Definition of Done remains `Plan review: assess the Implementation and acceptance and QA packet sections for sufficiency and concrete omissions; do not require implementation evidence before plan approval.`. Replace it with a reference to the embedded “Implementation and acceptance (one phase)” and “QA packet”, distinguishing plan approval from final implementation acceptance. Those sections supplied this round's review criteria.
- [Pass] The proposed trust boundary and reuse are appropriate: “No arbitrary CSS, HTML, code, remote URLs or data URLs accepted” and “Rendering uses tools/render.mjs directly, never wrapper HTML.” Existing `normalizeRequest` owns backend/format rejection (`tools/request.mjs:89`), and `processRequest` owns recipe validation and scene construction (`tools/render.mjs:195`, `tools/render.mjs:231`). Keep those owners as planned.
- [Pass] The catalog dependency consequence is recognized: the plan says “request.mjs is pinned by recursive-process@5.0.0”, and `tools/catalog.mjs:146` includes `tools/request.mjs` in recursive-process's declared files. The planned byte-equality evidence before a patch publication is an acceptance obligation, not evidence already earned.
- [Pass] Verification and visual scope are proportionate: “no new test/suite/workflow/dependency”, the named negative controls, and “Visual inspect PNGs and thumbnail” cover structural and visual review separately. The stated four-test/60-second ceiling matches `test-budget.json`. Final visual evidence must follow SYSTEM-INSTRUCTIONS.md AS-10 and its Report section; none was produced or assessed this turn.

Evidence limits: Read the entire relay file and embedded artifact, including pre-existing text. The pre-existing placeholder R2 is noted; no other defect found in the reviewed plan beyond R1. Supporting source inspection was bounded to request validation/save, render validation/fitting/export, and catalog declared files, not a whole-engine audit. Verify-tier graph coverage for XYZ-layout-engine generation `2026-10-13T02:52:30Z` reports `tools/` excluded and this relay path missing in the indexed main checkout; local source supplied the evidence. Both startup roadmap CLI locations are absent in this review worktree, so RELEASES ratings and historical recon remain producer-reported. No full suite, runtime render, private project access, or git command was run.

Reversibility: Easy — only this review block and NEXT header change. Relay-file verification checks one appended block, unchanged embedded artifact/prior text, valid handoff header, final marker, and no home-directory prefix. Producer should disposition R1/R2 and return the amended plan for Round 2. Handing off to producer — take your turn.

### Producer · Round 1 dispositions

R1 accepted: generated IDs will be namespaced intake_text_/intake_region_, including the header_caption counterexample in existing targeted controls. R2 accepted: explicit plan DoD now provided. Canonical plan and embedded review input updated. Please review round 2.

### Reviewer · Round 2

VERDICT: PASS
Basis: Approve the plan for implementation. The revised ID contract resolves R1 at design level, and the stated Definition of Done supplies sufficient plan-review criteria. No remaining blocking or should-fix omission found in the full embedded plan, including pre-existing text.
swept file: yes

- [Pass] R1 resolved in the plan: “Adapter-generated text IDs use the intake_text_ prefix (never header_caption), and region IDs use intake_region_; input element IDs remain independent.” The evidence/handoff also requires “verify an overflowing input element named header_caption fails normally.” This avoids the literal-ID exceptions at tools/render.mjs:254 and tools/render.mjs:310 without changing nutrition behavior. Source inspection command: `sed -n '240,325p' tools/render.mjs`; exit 0; decisive output: `if (id === 'header_caption' && !fixture.sections?.header?.caption)` guards both special cases. This is a source-level assessment; the planned runtime counterexample remains required.
- [Unverified — no citation] R2 closed on substance: Setup explicitly says “assess the Implementation and acceptance and QA packet sections for sufficiency and concrete omissions; do not require implementation evidence before plan approval.” That is an adequate plan DoD; no further wording change is necessary.
- [Pass] Full-plan acceptance remains proportionate and concrete: “one repo-local intake skill plus one trusted data-only recipe adapter”; “Reuse shared request validation for backend/format checks”; “A failed preflight/render must not publish a new manifest”; and “verify canonical dump/content and prior output equality.” These cover the workflow, shared owners, failure publication boundary and compatibility obligations without a parallel renderer or new suite.
- [Pass] Limitations are explicit: “No Markdown parser can prove faithful interpretation; human/agent visual comparison remains required”, unsupported requirements cannot receive a ready-render claim, and the demonstration uses a “deterministic synthetic PNG fixture ... clearly disclosed as such.” The final visual review must still satisfy SYSTEM-INSTRUCTIONS.md AS-10 and Report; plan approval is not visual approval.

Evidence limits: Read the entire relay and embedded artifact, not only the amendment. No additional pre-existing defect found in that bounded plan review. Verify-tier project XYZ-layout-engine is ready at coverage generation `2026-10-13T02:52:30Z`; tools/render.mjs is excluded, and the relay is missing from the indexed main checkout. Local source supplied the cited evidence; no whole-engine audit claimed. Startup command `python3 .xyz/utils/py/releases_app.py roadmap list` exited 2 with `No such file or directory`; ratings/history remain producer-reported. Runtime acceptance is [Unverified — needs clone run]. No executable fixtures, suites, PDDA run, private inputs, or git commands were used; the harness owns the post-turn gate.

Reversibility: Easy — approval changes the relay header and appends this review only. The bet is that the explicit contract and negative controls are sufficient to begin implementation; a failing fitting, asset-boundary, compatibility or publication control at implementation QA would overturn readiness to ship. Relay closed (Approved), no further review turn needed. Producer proceeds with implementation and final QA; token completed with done.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
