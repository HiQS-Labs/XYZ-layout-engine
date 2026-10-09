---
gh_issue: 5
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
title: "MVP foundation: reusable recipes, resumable image generation, and faster rendering"
status: "Proposed (1-INBOX — not yet active)"
created: 2026-10-08
doc_type: feedback
effort: 4
complexity: 4
risk: 3
phases: 4
ratings_provisional: true
---

# GH-5 — MVP foundation improvements

## Verdict and purpose

**7/10 as an MVP foundation; 4/10 as a reusable, operator-ready local MVP.** These are engineering judgments, not measured scores. The renderer choice, backend-owned geometry, separate artwork/text, pinned inputs and evidence discipline are sound. The landed implementation is still a renderer spike with a focused regression suite, rather than a reusable recipe engine. Recipes remain hardcoded and editing/export is not a complete product workflow. The Solar System example source and display assets are now published by PR #7, but its renderer still imports a copied runtime and requires uncommitted originals; it is not yet a fresh-checkout offline recipe.

This umbrella tracks the shortest path from that evidence to a reliable local MVP, then the already-planned remote/product improvements. It builds on completed #1 and #2; it does not reopen their scope or authorize immediate implementation of every item below. Split executable children when a phase is promoted, link them here, and check items only with evidence.

## Evidence and limits

- **Landed baseline:** [PR #3](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/3) and [PR #4](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/4) are merged; #1 and #2 are closed. This QA uses origin/main `a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c`, including reconciliation PR #6 and [Solar System publication PR #7](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/7). The [spike report](https://github.com/HiQS-Labs/XYZ-layout-engine/blob/a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c/tools/spike/REPORT.md) records repeatable PNGs, backend geometry, long-copy/product-hero cases, pinned fonts, explicit unsupported capabilities and failure controls. It now records operator artwork acceptance on 2026-10-08. This acceptance applies to the spike, not future migrated recipes.
- **Delivered tests:** `pnpm test` owns four canaries: fresh render/verify, golden geometry/digests, committed evidence and tamper detection. `test-budget.json` caps one file, four tests, sixty seconds and zero CI workflows. These are existing capabilities, not proposed work.
- **Published demo, incomplete reproduction inputs:** [Solar System example](https://github.com/HiQS-Labs/XYZ-layout-engine/tree/a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c/examples/2026-10-08-solar-system) now contains source, fixture, prompts, receipts, rendered outputs and eleven selected web-sized images. Its README explicitly excludes full-size originals, and `render-diagram.mjs:25` reads those missing files. The selected `saturn-clean` and `asteroid-belt-diagram` refinements are also absent from the generator's initial job list. Therefore its current paid-generation instructions do not reproduce the approved scene from a fresh checkout. Prefer admitting the already supplied web images with their recorded display digests; recover originals only if needed for higher-resolution exports or exact refinement lineage. Nutrition remains the first production recipe, with product-hero as the existing smoke.

- **Measured rendering:** nutrition at 1000×1000 on M1 Max/Node 22: warm upper median Satori/resvg **133.4 ms**, Chromium **260.4 ms**, ten samples after warmup. Reported cold 252.7/614.2 ms is initialization inside an existing Node process, excluding static imports. These are stage timings, not full job latency, p95 or deployment SLAs. Shared-process Node RSS was roughly 488–673 MiB; browser RSS was unmeasured.
- **Unmeasured generation:** thirteen receipts record eleven initial assets and two refinements. The published `generate-assets.py:39`–`:41` admits the Sun first and then runs three concurrent image jobs. This is an implemented setting, not a measured optimal-concurrency baseline. The spike report's single-process/no-concurrency limit describes renderer measurements, not provider image generation. No controlled provider latency/cost/concurrency benchmark or percentage speedup is claimed.

- **Concrete friction:** the published generator aborts on existing output files (`generate-assets.py:24`–`:26`); redraw resizes all assets to 640 wide and rewrites derivatives (`render-diagram.mjs:24`–`:36`) and renders both backends (`:105`–`:120`). The missing nested-SVG belt remains a historical visual observation; no fresh reproduction is claimed by this plan QA. The landed spike's `assets.mjs:4` uses URL.pathname, retaining encoded spaces; filesystem-safe conversion remains a concrete requirement.

- **Historical artifact sizes (not remeasured in this QA):** diagram PNG 1,274,320 bytes; SVG 6,788,502; self-contained HTML 7,547,604. SVG contains embedded raster illustrations. Input/output preparation and duplicate embedding deserve measurement alongside layout/raster time.

Source inspection was used because the complete graph project inventory has no indexed XYZ Layout Engine project. The bounded trace is recorded in `PROJECT/1-INBOX/recon-mvp-foundation.md`, with a QA refresh distinguishing historical observations from the current branch. Local evidence paths above are not hosted artifact links.

## P0 — Make one reusable local MVP

- [ ] Use the landed #1/#2 evidence and recorded spike artwork acceptance as the migration baseline. Preserve pinned outputs while extracting the shared operation; record fresh acceptance for changed recipes rather than reopening the completed spike/test issues.
- [ ] Extract one reusable render operation from the spike; make CLI and demos call it without importing a module that automatically runs the experiment or copying renderer source. Preserve backend-owned layout/text measurement; domain composition stays in trusted recipes. Start with modules, not a speculative package/plugin framework.
- [ ] Promote nutrition into the first versioned recipe with normalized fixture/parameter/asset input, moving editable semantic values out of the entry-point script. Keep the existing product-hero smoke as a cross-domain regression check; P0 does not require a second production recipe. Pin supplied artwork/fonts so a fresh checkout renders offline without a paid API call.
- [ ] Implement the PRD's shared request/result schema for the local library/CLI: reject unknown fields, invalid dimensions/scale, missing assets and unsupported formats; return field-level errors, backend/version identity, validation report and artifact digests. Explicit recipe-declared fallback only.
- [ ] Fix path handling using filesystem-safe URL conversion, support directories with spaces, and constrain local asset/output paths (including symlinks) to configured roots. Validate encoded bytes, decoded pixels, SVG references and total render size; renderers must not perform uncontrolled network fetches.
- [ ] Write each run into a unique temporary directory, verify it, then atomically publish a manifest/last-good result. A failed redraw must leave the prior deliverable intact; retain bounded diagnostics and clean temporary files/browser processes.
- [ ] Extend fitting with a readable minimum font size, conservative line-height policy, missing-text detection and explicit non-fit results. Exercise actual shrink and exhausted/non-fit paths; avoid treating an in-canvas element box as proof of unclipped glyphs.
- [ ] Reuse the delivered **#2 / PR #4** suite and ratchet; do not reopen #2 or add new `test()` blocks by default. Extend C1 (fresh render/verify) with a space-containing temporary path and material non-fit/publication cases when the owning implementation exists; extend C2 (golden geometry/digests) or the existing verifier with focused image visibility evidence. Keep one file, four tests, sixty seconds and zero workflows. Each future child must name its failure mode and why the existing assertion cannot cover it; any necessary budget change follows `test-budget.json` history/issue rules. Recovery/cache tests belong to their implementing child, not this plan-only QA.
- [ ] Provide one documented install/render/edit-fixture/export command path, a supported capability table and a fresh-checkout offline walkthrough. Clearly describe PNG versus SVG with raster artwork and temporary HTML edits. Obtain human approval of the migrated nutrition output before closing P0. Product-hero remains the existing smoke; broader recipe breadth is a later gate.

## P1 — Speed up generation and redraw without hiding failures

Generation is an optional asset-authoring operation, not a prerequisite for P0 offline rendering. Reuse the published example generation harness and the operator-selected installed resolve-image/HiQS caller as the sole paid-provider boundary; do not build another provider client. Add only the minimal manifest/resume orchestration this phase needs.

### Paid image generation

- [ ] Separate asset generation from layout rendering in the supported workflow. Text, theme or placement edits must reuse approved assets and make **zero image-generation API calls**.
- [ ] Add a content-addressed asset manifest/cache keyed by exact prompt, model, generation/edit parameters, recipe version and reference-image digests. Keep originals immutable; reuse only assets whose manifest, digest and required alpha checks validate. Changed prompts/references must invalidate the relevant asset without regenerating unrelated assets.
- [ ] Make generation resumable: skip validated completed assets; submit only missing or explicitly replaced items; atomically persist per-item state/receipts. Bound retries and deadlines. An unknown paid outcome must be reconciled or reported for explicit retry, never blindly resubmitted. Expose an expected-call count and configurable call/budget cap before dispatch.
- [ ] Measure per-asset and total latency, queue/network/provider contribution where observable, refinement rate, failures and reported usage/cost where available. Establish a measured baseline using the published three-worker setting and admitted caller, then compare bounded concurrency settings only within verified provider limits. Do not assume three workers is optimal; compare total completion time and failure/cost behavior before adopting a different setting. Do not silently switch model, provider or quality.
- [ ] Add a small batch quality review before acceptance: transparent-edge/halo quality, visual style, cropping, aspect ratio and subject accuracy. Preserve exact reference/edit lineage so rejected assets can be replaced individually. A receipt saying some pixels are transparent is insufficient visual acceptance.

### Local rendering and export

- [ ] Default supported recipes to **Satori/resvg only**. Load/launch Chromium only for explicit comparison or a declared capability requirement; avoid importing unnecessary browser dependencies on the normal path. Reuse a browser within an explicitly requested batch only after measuring the benefit and cleanup behavior.
- [ ] Cache derived image sizes by source digest, requested display dimensions/scale and transformation version. Choose adequate resolution per asset instead of resizing everything to 640 wide. An unchanged-asset redraw must perform **zero derivative rewrites**; edits must invalidate exactly the affected derivatives.
- [ ] Profile fresh-process and warm end-to-end redraw separately: input/asset read, resize, encoding, layout, raster/PNG encoding, filesystem/export and verification. Use nutrition first and a representative larger supplied-assets fixture; use Solar System after its supplied-assets promotion gate; report sample count, runtime, output dimensions, isolated memory and browser memory when used. Keep provider generation timings separate.
- [ ] Compare cached and uncached workflows on the same machine and fixtures, publishing before/after total latency, output sizes and digests/approved visual tolerance. Set a numeric latency target after baseline collection; accept optimization only when the intended stage improves without degrading readability, determinism or validation. Existing 133.4 ms is a reference observation, not the target for the larger diagram.
- [ ] Reduce repeated base64/asset embedding and unnecessary diagnostic exports. Offer a compact HTML + asset-folder distribution alongside the self-contained offline option, and generate only requested formats. Preserve both portability choices explicitly.
- [ ] Establish a backend image policy for nested SVG/raster combinations: supported direct images, safe normalization or explicit rejection. Add the small visibility canary under #2; geometry checks alone must not approve a missing illustration.

## P2 — Finish the local editing and reliability experience

- [ ] Promote the published Solar System example as a follow-on recipe using its supplied web-sized assets, verified against the committed display digests, without requiring paid regeneration. Remove the copied runtime dependency. Recover originals/reference lineage only when the admitted export resolution or provenance requirement needs them; record/park unavailable higher-resolution variants. A fresh checkout must redraw the selected refined assets offline and obtain separate human artwork approval before this recipe is accepted.

- [ ] Add save-and-rerender for label/data/parameter edits with durable fixture JSON and requested PNG/SVG export. Derive controls from the recipe schema where practical; retain the simple fixture workflow. Defer a full canvas editor until direct editing is a demonstrated requirement.
- [ ] Bundle/license explicit fallback fonts for each supported script, or reject/report unsupported scripts clearly. Do not rely on machine-specific Chromium fonts. Record minimum readable typography and approved multilingual fixtures when that scope is admitted.
- [ ] Produce one consolidated provenance manifest covering source/refinement prompts and reference digests, selected asset versions, fonts, recipe/runtime/backend versions, normalized input, validation and artifact hashes. Follow the PRD fingerprint contract for cache identity; asset URLs alone are not identity.
- [ ] Enforce measured per-job input/pixel/memory/time/concurrency limits and cancellation. A synchronous raster call can outlast an event-loop timeout: use the simplest interruptible worker/process boundary only if hard enforcement requires it. Verify the failure leaves no leaked browser/process or published partial result.
- [ ] Resolve shipping dependency/font notices, including the report's unverified Chrome for Testing third-party terms before distributing that backend. Prefer the existing pinned dependencies and preserve prior recipe/runtime versions for reproducibility.

## Later — Preserve the PRD direction after local acceptance

- [ ] Add HTTP and local/remote MCP as thin adapters to the same application operations/schema; verify local/remote fingerprint/report parity. Remote selection and uploads stay explicit; no tenant-supplied executable recipes.
- [ ] Before a remote pilot, implement tenant-scoped assets/artifacts, authorization, approved URL/redirect/SSRF checks, private expiring downloads and cache isolation. Reuse shared checks rather than duplicating per-transport suites.
- [ ] Introduce durable jobs, idempotency, bounded retries and restart recovery only when accepted async/batch work needs them. Start with the simplest deployment/storage that meets the actual workload; add multi-worker queues/object storage when measured requirements justify them.
- [ ] Expand themes, commerce adapters, infographic primitives and batch UI only after the current recipes expose a concrete unmet need. Keep domain logic out of the core; add no second geometry engine, generic plugin system or full editor as prerequisite infrastructure.

## Acceptance and sequencing

Each phase has its own closure gate:

- **P0 — usable local renderer:** a fresh checkout renders nutrition offline through one shared library/CLI operation, with the existing product-hero smoke retained. Editing fixture text exports requested PNG/SVG without paid calls or copied renderer source. Missing/unsupported content fails clearly, a failed run preserves the last-good output, the existing suite passes inside its ratchet, and the operator accepts the migrated nutrition artwork. Generation caching and GUI editing are not P0 dependencies.
- **P1 — measured asset reuse and speed:** text/theme/placement redraws make zero provider calls; validated completed generation items resume without duplicates; invalidation changes only affected assets; unchanged derivatives incur zero rewrites. Publish separate generation and fresh/warm redraw baselines plus before/after results, with no readability/determinism/validation regression. Where provider usage/cost is unavailable, record that limitation.
- **P2 — durable edits and broader reliability:** save/edit/rerender/export persists fixture state, admitted script support is explicit, provenance/limits/cancellation have evidence, and the Solar System recipe redraws with supplied verified assets and is independently accepted, or any unavailable higher-resolution variant is explicitly parked. Missing original artwork never blocks the completed nutrition milestone.
- **Later service work:** separate promoted children close only after the PRD's shared-contract, authorization, parity and recovery gates; they are not local-MVP prerequisites.

Follow P0 with P1 profiling/cache work (generation resume can be an early independent child), then P2. Later service/UI work is separate promotion, not a condition for this local milestone. Each promoted child needs a bounded acceptance criterion and evidence. Stop/revert an optimization on cache misidentification, duplicated paid calls, missing imagery, degraded readable text or nondeterministic output.

**Bet:** consolidating the existing render functions and reusing validated assets removes avoidable work before deeper backend tuning. **Tradeoff:** prioritize a usable local slice over immediately building all transports/themes. **Failure mode:** incomplete cache identity or overly broad reuse serves stale/wrong art; missing-pixel checks give false confidence. Intake is **Easy** to reverse; shared recipe/API/cache contracts are **Costly** and require versioned rollout.

Provisional planning triage: PDDA effort 4/5, complexity 4/5, risk 3/5, four broad phases. PRS `rated 75/55/50/25` (priority/severity/appeal/effort-cheapness; sum 205): high leverage for follow-on work, material reliability gaps but no demonstrated production incident, neutral appeal, substantial umbrella effort. Re-estimate individual children after scope selection; no priority override is assumed.
