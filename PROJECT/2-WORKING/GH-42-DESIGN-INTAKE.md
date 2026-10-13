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
- tools/recipes/design-intake.mjs (new owner) -> strict settings, supported capabilities, source and asset hash/PNG checks; buildScene returns constrained nodes. Import existing readBounded, within, LIMITS and inspectPng. One bundled Barlow Condensed family, 400/700, keeps existing font API. Text boxes own IDs and containment; render's fit loop remains authoritative.
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
