---
gh_issue: 1
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1
title: "XYZ Layout Engine: Phase 0 renderer and reference infographic spike"
status: Planned
created: 2026-10-02
owner: Neochrome
doc_type: experiment
complexity: 3
risk: 2
effort: 3
phases: 3
ratings_provisional: false
non_goals:
  - Remote deployment
  - General editor
  - CI machinery
related:
  - PROJECT/2-WORKING/SPECS-PRD.md
goal: >
  Deliver two reference-composition renders and measured backend geometry/fidelity evidence without building the production engine.
updated: 2026-10-02
reversibility: Easy — local spike files and reports; no production state.
---

# GH-1 — XYZ Layout Engine renderer spike

## Status

| What was just completed | What's next |
|---|---|
| Captured umbrella issue #1 and scoped the PRD Phase 0; no implementation started. | Independent plan QA, direct preflight, planner and full YAML dry-run; dispatch only after exact-plan confirmation. |

## Table of contents

- [Current state and scope](#current-state-and-scope)
- [Wave 1: Ordered spike](#wave-1-ordered-spike)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)

## Current state and scope

The repository at baseline 65ba11d contains project/governance documents and the reference image, with a locally installed `.xyz/` harness. It has no package.json or engine implementation; source call-path recon is N/A for this greenfield spike. Graph inventory contains no indexed project for this checkout; exact file inspection is the fallback. Origin and standing base are `HiQS-Labs/XYZ-layout-engine`, `main`. Installed PDDA runtime is not an edit target.

The PRD remains canonical for product behavior. This plan implements only Phase 0, not the full v1 schedule. Backend-owned geometry/text measurement, constrained recipe scope, and Fabric/Konva deferral are settled. Backend selection and sufficient measured bounds remain hypotheses to test. One generic scene data structure is sufficient; no plugin system, monorepo scaffold, HTTP server, queue, or second layout engine.

Execution uses the full clone `marathon-gh-1-renderer-spike` on branch `marathon/gh-1-renderer-spike` from origin/main. Preparation retains the source checkout. No merge, push, issue closure, or clone cleanup of unfinished work is part of dispatch.

## Wave 1: Ordered spike

The executor runs strictly sequentially. All three phases belong to the single GH-1 candidate; shared package.json/lockfile/scene/checker paths mean they MUST NOT run concurrently. No parallel lanes are claimed.

### Phase 1 — Fixture and assets

- [ ] Create the minimal Node package and structured square nutrition fixture matching PRD §5.3, with all text in JSON and separately addressable illustration nodes.
- [ ] Use hand-authored vector approximations (sprite symbols are acceptable) and one locally stored font with its verified license and sources. The whole reference image must never be rendered as a layer. No generated-image service is required.
- [ ] Use plain .mjs spike scripts to avoid a build/transpile framework; the future engine remains TypeScript. Use backend-compatible scene properties; do not implement layout or font metrics.
- [ ] Add `spike:verify` using Node assertions for required sections, input structure, independent illustration references, valid source licenses, and editable text. This check earns its place as the machine acceptance gate; no CI workflow or testing framework.
- [ ] QA: execute `pnpm run spike:verify` and record its output. Sources/fonts must support offline execution after installation; no remote asset fetch in rendering.

### Phase 2 — Compare backend renders

- [ ] Add pinned Satori, resvg JS binding and Playwright dependencies, recording exact licenses/transitive native implications; do not infer a binding's license from another resvg release. Keep Satori MPL-2.0 within the PRD exception.
- [ ] Implement `spike:render` with Satori/resvg and Chromium over the same normalized fixture/assets. Produce both PNGs; produce Satori SVG and explicitly report browser SVG unsupported if applicable. No fake vector export.
- [ ] Collect labeled node bounds from each backend and preserve authoritative geometry. Bound fitting to ten iterations, with an explicit failure report rather than custom line breaking.
- [ ] Measure warm render stage time and cold startup separately (one warmup, ten timed samples), with hardware/runtime/dependency versions and observable memory measure. Do not equate ten samples to a production p95 SLA.
- [ ] Extend the same verifier to check output dimensions, required section IDs, finite/in-bounds geometry, unintended pair overlap, nonempty renders, and repeated-render digests for each pinned backend. Exclude declared decoration/containment from overlap checks.
- [ ] Change the headline and one caption using fixture overrides and rerender both backends: validate fitting/bounds, preserve baseline fixture/artifacts, and restore override state. Report unsupported or failed capabilities honestly; do not pass by ignoring missing geometry.
- [ ] QA: run `pnpm run spike:render` then `pnpm run spike:verify`; compare outputs to the reference visually. A backend failure is evidence, not permission to silently skip an assertion; declare it explicitly and retain diagnostic output.

### Phase 3 — Evidence and decision

- [ ] Write `tools/spike/REPORT.md`: exact commands/results, environment, timings, memory metric limitations, font/dependency licenses, fidelity and geometry gaps, bounded-fitting outcomes, capability table, and a justified backend recommendation.
- [ ] Inspect both PNGs and the supplied reference. Record agent visual assessment separately from human visual acceptance, which remains pending until the operator reviews artwork. Pixel equality to the reference is not required.
- [ ] Inject observed findings into the PRD Phase 0; keep later production phases pending. If neither backend supplies needed geometry, report blocked selection with concrete evidence rather than building a second engine.
- [ ] Update this plan's status and changelog honestly; require independent post-build QA before a ready PR. Ledger updates are orchestrator-only and never concurrent with a builder.
- [ ] QA: rerun `pnpm run spike:verify` and applicable PDDA checks, cite on-disk evidence, and record remaining acceptance decisions.

## Safety, diagnosis, and rollback

Risk 2: bounded local experiments and downloadable dependency/font assets, no server deployment or persistent tenant data. Complexity/effort 3: real backend/render/typography integration, not a trivial wrapper. No ratings are reduced merely to admit a lane. Baseline invariant: backend owns geometry and text measurement; failure to expose usable bounds holds production selection.

Undo class Easy: delete/revert only spike-owned files in the task clone. Reference and original governance remain intact. Stop after at most two review rounds per phase; each turn has a 900-second cap. Render/fetch/browser startup operations require explicit finite deadlines and browser cleanup on failure. Diagnose with debug-mantra before retrying; no unbounded loop, force bypass, or failed-lane re-fire. Print actionable stage/error/backend IDs; no credentials exist in this fixture.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm run spike:verify`, exit 0 with render/repeat/long-copy evidence)
- [ ] Wave 1 Post-Build Codex QA Relay executed (receipt under `relay-system/2026-10-01/gh1-spike-postbuild.codex.md`, STATUS Approved or Closed)
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated

Plan QA receipt: `relay-system/2026-10-01/gh1-spike-plan.codex.md` (pending actual independent review).
Human artwork acceptance: pending; agent approval never substitutes for it.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/main"
  },
  "gate": "pnpm run spike:verify",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/spike/render.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/REPORT.md"
    }
  ],
  "artifacts": [
    "package.json",
    "pnpm-lock.yaml",
    "tools/spike/fixture.json",
    "tools/spike/scene.mjs",
    "tools/spike/verify.mjs",
    "tools/spike/assets.mjs",
    "tools/spike/assets/illustrations.svg",
    "tools/spike/assets/font.ttf",
    "tools/spike/assets/OFL.txt",
    "tools/spike/assets/SOURCES.md",
    "tools/spike/render.mjs",
    "tools/spike/output/satori.png",
    "tools/spike/output/satori.svg",
    "tools/spike/output/playwright.png",
    "tools/spike/output/measurements.json",
    "tools/spike/output/runtime.json",
    "tools/spike/REPORT.md",
    "PROJECT/2-WORKING/SPECS-PRD.md",
    "PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md",
    "CHANGELOG.md"
  ],
  "artifacts_new": [
    "package.json",
    "pnpm-lock.yaml",
    "tools/spike/fixture.json",
    "tools/spike/scene.mjs",
    "tools/spike/verify.mjs",
    "tools/spike/assets.mjs",
    "tools/spike/assets/illustrations.svg",
    "tools/spike/assets/font.ttf",
    "tools/spike/assets/OFL.txt",
    "tools/spike/assets/SOURCES.md",
    "tools/spike/render.mjs",
    "tools/spike/output/satori.png",
    "tools/spike/output/satori.svg",
    "tools/spike/output/playwright.png",
    "tools/spike/output/measurements.json",
    "tools/spike/output/runtime.json",
    "tools/spike/REPORT.md",
    "PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md"
  ],
  "remediation": {
    "source": "issue#1",
    "criteria": "One offline shared nutrition fixture rendered with Satori/resvg and Playwright, separate text/assets, authoritative bounds, repeat/long-copy checks, and measured recommendation with candid visual gaps; human artwork acceptance remains explicit."
  },
  "lanes": {
    "agy_safe": [],
    "orchestrator_only": [
      "releases.db",
      "releases.sql"
    ],
    "index_only": []
  }
}
```
