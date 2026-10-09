---
gh_issue: 1
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1
title: "XYZ Layout Engine: Phase 0 renderer and reference infographic spike"
status: Awaiting human acceptance
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
updated: 2026-10-08
reversibility: Easy — local spike files and reports; no production state.
---

# GH-1 — XYZ Layout Engine renderer spike

## Status

| What was just completed | What's next |
|---|---|
| Phases 1–3 implemented (2026-10-08): Phase 1 via agy/Codex marathon; Phases 2–3 built by the orchestrator after two agy containment failures (XYZ-forge #1001, #1002). Phase 2 post-build Codex QA Approved (3 rounds); Phase 3 document QA Approved and attested (2 rounds, `relay-system/2026-10-08/gh1-spike-p3-postbuild.md`). `pnpm run spike:verify` green with render/repeat/long-copy/hero/probe/licence evidence. Satori→resvg selected as default, Chromium as declared fallback; findings injected into the PRD. | Human visual acceptance of the artwork, then land the clone on `main` via merge-cleanup and open Phase 1 (core engine) planning. |

## Table of contents

- [Current state and scope](#current-state-and-scope)
- [Wave 1: Ordered spike](#wave-1-ordered-spike)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)

## Current state and scope

The repository at baseline 65ba11d contains project/governance documents and the reference image, with a locally installed `.xyz/` harness. It has no package.json or engine implementation; source call-path recon is N/A for this greenfield spike. Graph inventory contains no indexed project for this checkout; exact file inspection is the fallback. Origin and standing base are `HiQS-Labs/XYZ-layout-engine`, `main`. Installed PDDA runtime is not an edit target.

The PRD remains canonical for product behavior. This plan implements only Phase 0, not the full v1 schedule. Backend-owned geometry/text measurement, constrained recipe scope, and Fabric/Konva deferral are settled. Backend selection and sufficient measured bounds remain hypotheses to test. One generic scene data structure is sufficient; no plugin system, monorepo scaffold, HTTP server, queue, or second layout engine.

Execution uses the full clone `marathon-gh-1-renderer-spike` on branch `marathon/gh-1-renderer-spike` from origin/main. Preparation retains the source checkout. No merge, push, issue closure, or clone cleanup of unfinished work is part of dispatch.

Execution record (2026-10-08): Phase 1 landed through the agy/Codex marathon driver. Phase 2 attempts 1–2 under agy failed harness containment (probe scripts written outside the lane) and the lane hit its attempt cap; the orchestrator then built Phases 2 and 3 directly in the clone, keeping Codex as the independent post-build reviewer via `relay-drive.sh --review-once` (vendored harness, `XYZ_HARNESS` pinned to `.xyz/`). Harness defects filed as XYZ-forge #1001 (vendored root resolution) and #1002 (off-lane scratch files burn the attempt cap).

## Acceptance

- [x] Reproduce all PRD §5.3 nutrition infographic sections with editable text and separate illustration assets; never embed the whole reference image. (`tools/spike/fixture.json`, `scene.mjs`, `assets/illustrations.svg`.)
- [x] Render the same offline fixture through Satori/resvg and Playwright; retain PNGs, backend geometry, capability/failure reports, and available SVG without claiming unsupported vector export. (`tools/spike/output/2026-10-08-xyz-layout-engine-spike/`, one dated folder per render run, including the exact Chromium HTML; browser SVG declared unsupported.)
- [x] Execute a runnable verification command covering fixture sections, output dimensions, geometry, bounded fitting, repeated-render digests, and longer-copy behavior; failures remain explicit. (`pnpm run spike:verify`, exit 0; red controls recorded in the Phase 2 relay.)
- [x] Record runtime/dependency/font licenses, measured timings and memory limitations, agent visual comparison, remaining human visual acceptance, and a justified backend recommendation; write findings into the PRD. (`tools/spike/REPORT.md`; PRD Phases → Phase 0 findings.)
- [x] Obtain independent plan and post-build QA receipts; add no production engine/server/queue/editor framework or CI workflow in this Phase 0 arc. (Plan QA, Phase 2 and Phase 3 post-build QA all Approved and attested; no production scaffolding added.)

## Wave 1: Ordered spike

The executor runs strictly sequentially with **Agy builder and independent Codex reviewer**. This is an explicit pairing, not a silent fallback. Execute the YAML only with `--builder agy --pre-advance-cmd 'pnpm run spike:verify'`; the YAML/preflight gate prose alone does not configure the driver. Phase 1 verifies fixture/assets; phases 2 and 3 must require complete render/repeat/override evidence, with backend capability failures explicitly recorded rather than counted as passes.

The executor runs strictly sequentially. All three phases belong to the single GH-1 candidate; shared package.json/lockfile/scene/checker paths mean they MUST NOT run concurrently. No parallel lanes are claimed.

### Phase 1 — Fixture and assets

Retry preparation (2026-10-02, orchestrator-owned): the original turn failed because dependency installation created unignored root `node_modules/`. Add only `/node_modules/` to the existing `.gitignore` before dispatch; the builder cannot edit ignore rules. A controlled authoritative containment replay accepts relay/fixture paths, rejects dependency installation without the ignore rule, accepts it with the rule, and still rejects an unrelated source file. See `relay-system/2026-10-02/gh1-spike-containment-diagnosis.md`. Retry this phase with a fresh token; retain the original failed transcript.

- [x] Create the minimal Node package and structured square nutrition fixture matching PRD §5.3, with all text in JSON and separately addressable illustration nodes.
- [x] Use hand-authored vector approximations (sprite symbols are acceptable only as source storage) and one locally stored font with its verified license and sources. The whole reference image must never be rendered as a layer. No generated-image service is required.
- [x] `assets.mjs` resolves each illustration ID to standalone SVG bytes/data URLs with all required definitions embedded; no external fragment/file/network references. Verify independent asset resolution in both backends.
- [x] Use plain .mjs spike scripts to avoid a build/transpile framework; the future engine remains TypeScript. Use backend-compatible scene properties; do not implement layout or font metrics.
- [x] Add `spike:verify` using Node assertions for required sections, input structure, independent illustration references, valid source licenses, and editable text. This check earns its place as the machine acceptance gate; no CI workflow or testing framework.
- [x] QA: execute `pnpm run spike:verify` and record its output. Sources/fonts must support offline execution after installation; no remote asset fetch in rendering.

### Phase 2 — Compare backend renders

- [x] Add pinned Satori, resvg JS binding and Playwright dependencies, recording exact licenses/transitive native implications; do not infer a binding's license from another resvg release. Keep Satori MPL-2.0 within the PRD exception.
- [x] Implement `spike:render` with Satori/resvg and Chromium over the same normalized fixture/assets. Produce both PNGs; produce Satori SVG and explicitly report browser SVG unsupported if applicable. No fake vector export.
- [x] Collect labeled node bounds from each backend and preserve authoritative geometry. Bound fitting to ten iterations, with an explicit failure report rather than custom line breaking.
- [x] After nutrition rendering, run a small structured product-hero smoke fixture through both backends and retain `hero-satori.png` and `hero-playwright.png`.
- [x] Probe pinned-font support for English, accented Latin ("café"), CJK ("营养"), and emoji ("⚡"); record observed support/unsupported outcomes and fallback needs explicitly. English reference text is mandatory; additional scripts are capability probes, not silently assumed v1 support.
- [x] Measure warm render stage time and cold startup separately (one warmup, ten timed samples), with hardware/runtime/dependency versions and observable memory measure. Do not equate ten samples to a production p95 SLA.
- [x] Extend the same verifier to check output dimensions, required section IDs, finite/in-bounds geometry, unintended pair overlap, nonempty renders, and repeated-render digests for each pinned backend. Exclude declared decoration/containment from overlap checks.
- [x] Use the concrete longer headline "Fuel your whole day with balanced nutrition and lasting energy" and caption "Fresh whole foods, easy to carry, wherever your busy day takes you" as fixture overrides and rerender both backends: validate fitting/bounds, preserve baseline fixture/artifacts, and restore override state. Measure text-content extents/overflow relative to allocated text regions using backend-owned evidence (browser scroll/client metrics or a demonstrated Satori measurement hook). In-canvas element rectangles alone cannot prove unclipped glyphs. Persist baseline/override bounds, fitting steps and digests in measurements.json. Missing text evidence fails that backend capability gate; never substitute Composer font metrics. A complete spike report may record a backend as unsupported, but only a backend passing mandatory English reference/repeat/long-copy geometry checks can be recommended. If neither passes, record BLOCKED and do not select a backend.
- [x] QA: run `pnpm run spike:render` then `pnpm run spike:verify`; compare outputs to the reference visually. A backend failure is evidence, not permission to silently skip an assertion; declare it explicitly and retain diagnostic output.

### Phase 3 — Evidence and decision

- [x] Write `tools/spike/REPORT.md`: exact commands/results, environment, timings, memory metric limitations, font/dependency licenses, script capability results, product-hero smoke evidence, proposed input/output/asset/time/memory/concurrency resource limits with measurement-based rationale, fidelity and geometry gaps, bounded-fitting outcomes, capability table, and a justified backend recommendation.
- [x] Inspect both PNGs and the supplied reference. Record agent visual assessment separately from human visual acceptance, which remains pending until the operator reviews artwork. Pixel equality to the reference is not required.
- [x] Inject observed findings into the PRD Phase 0; keep later production phases pending. If neither backend supplies needed geometry, report blocked selection with concrete evidence rather than building a second engine.
- [x] Update this plan's status and changelog honestly; require independent post-build QA before a ready PR. Ledger updates are orchestrator-only and never concurrent with a builder. Phase 0 remains awaiting human visual acceptance even when agent/machine spike checks pass; do not mark the full PRD Phase 0 complete early.
- [x] QA: rerun `pnpm run spike:verify` and applicable PDDA checks, cite on-disk evidence, and record remaining acceptance decisions.

## Dispatch and transcript contract

From the full task clone, the reviewed invocation is:

```bash
.xyz/relay-automation/marathon.sh --plan PROJECT/2-WORKING/renderer-spike/MARATHON.yaml --builder agy --pre-advance-cmd 'pnpm run spike:verify'
```

Add `--dry-run` for no-dispatch verification. Preserve every phase's gate. The installed receipt validator requires the final block's literal `VERDICT: PASS|FAIL|PARKED` and nonempty `Basis:`; conversational approval goes in `Review outcome:` and the STATUS header. Every phase brief states this contract. The first plan review's free-form verdict was rejected (exit 8); its findings are retained but it is not an approval receipt. The second textual approval was also refused (exit 4) because the legacy end-marker insertion changed the append-only body prefix. An EOF-only receipt template is the bounded recovery; no dispatch may rely on the refused receipt. Runtime files remain unchanged.

## Safety, diagnosis, and rollback

Risk 2: bounded local experiments and downloadable dependency/font assets, no server deployment or persistent tenant data. Complexity/effort 3: real backend/render/typography integration, not a trivial wrapper. No ratings are reduced merely to admit a lane. Baseline invariant: backend owns geometry and text measurement; failure to expose usable bounds holds production selection.

Undo class Easy: delete/revert only spike-owned files in the task clone. Reference and original governance remain intact. Stop after at most two review rounds per phase; each turn has a 900-second cap. Render/fetch/browser startup operations require explicit finite deadlines and browser cleanup on failure. Diagnose with debug-mantra before retrying; no unbounded loop, force bypass, or failed-lane re-fire. Print actionable stage/error/backend IDs; no credentials exist in this fixture.

## Acceptance & Quality Checklist

### Wave 1

- [x] Wave 1 Proof of Done Test Suite Green (`pnpm run spike:verify`, exit 0 with render/repeat/long-copy evidence) — 2026-10-08
- [x] Wave 1 Post-Build Codex QA Relay executed (Phase 2 receipt: `relay-system/2026-10-08/gh1-spike-p2-postbuild.md`, STATUS Approved, attested; Phase 3 receipt: `relay-system/2026-10-08/gh1-spike-p3-postbuild.md`, STATUS Approved, attested 2026-10-08)
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated (not run; PR not yet opened)

Plan QA receipt: `relay-system/2026-10-01/gh1-spike-plan-attested.codex.md` (Approved, textual plan review; driver attested exit 0 against reviewed head `d43274edf6eb`).
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
      "path": "package.json"
    },
    {
      "type": "path_absent",
      "path": "pnpm-lock.yaml"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/fixture.json"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/scene.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/verify.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/assets.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/assets/illustrations.svg"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/assets/font.ttf"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/assets/OFL.txt"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/assets/SOURCES.md"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/render.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/satori.png"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/satori.svg"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/playwright.png"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/measurements.json"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/runtime.json"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/REPORT.md"
    },
    {
      "type": "path_absent",
      "path": "PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/hero-satori.png"
    },
    {
      "type": "path_absent",
      "path": "tools/spike/output/hero-playwright.png"
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
    "CHANGELOG.md",
    "tools/spike/output/hero-satori.png",
    "tools/spike/output/hero-playwright.png"
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
    "PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md",
    "tools/spike/output/hero-satori.png",
    "tools/spike/output/hero-playwright.png"
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
