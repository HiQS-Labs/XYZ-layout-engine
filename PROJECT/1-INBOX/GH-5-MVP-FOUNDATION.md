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
related:
  - PROJECT/1-INBOX/recon-mvp-foundation.md
  - PROJECT/2-WORKING/SPECS-PRD.md
reversibility: "Easy — assessment and intake only; runtime unchanged."
---

# GH-5 — MVP foundation improvements

## Verdict and purpose

**7/10 as an MVP foundation; 4/10 as a reusable, operator-ready local MVP.** These are engineering judgments, not measured scores. The renderer choice, backend-owned geometry, separate artwork/text, pinned inputs and evidence discipline are sound. The current implementation is still a renderer spike plus a successful one-off diagram: recipes are hardcoded, the diagram imports a copied runtime, generation cannot safely resume, and editing/export is not a complete product workflow.

This umbrella tracks the shortest path from that evidence to a reliable local MVP, then the already-planned remote/product improvements. It coordinates #1 and #2; it does not reopen their scope or authorize immediate implementation of every item below. Split executable children when a phase is promoted, link them here, and check items only with evidence.

## Evidence and limits

- **Delivered candidate:** [PR #3](https://github.com/HiQS-Labs/XYZ-layout-engine/pull/3), open at head `591971dad73b81e802dfabcb66b9ddb9745a0dd4`. [Spike report](https://github.com/HiQS-Labs/XYZ-layout-engine/blob/591971dad73b81e802dfabcb66b9ddb9745a0dd4/tools/spike/REPORT.md) records repeatable PNGs, backend geometry, long-copy/product-hero cases, pinned fonts, explicit unsupported capabilities and failure controls. Human artwork acceptance remains pending under #1.
- **Scope boundary:** main is not yet a reusable engine. The Solar System + Milky Way demonstration in local `artifacts/solar-system-2026-10-08/` is untracked and **not included in PR #3**. It has eleven separately addressable image assets, offline outputs and provenance, but uses copied spike functions and domain-specific placement. Its browser label edits are temporary; durable edits require changing fixture JSON and rerendering.
- **Measured rendering:** nutrition at 1000×1000 on M1 Max/Node 22: warm upper median Satori/resvg **133.4 ms**, Chromium **260.4 ms**, ten samples after warmup. Reported cold 252.7/614.2 ms is initialization inside an existing Node process, excluding static imports. These are stage timings, not full job latency, p95 or deployment SLAs. Shared-process Node RSS was roughly 488–673 MiB; browser RSS was unmeasured.
- **Unmeasured generation:** the diagram used eleven initial calls plus two refinement calls. Its harness admits the Sun first, then runs three jobs concurrently. No controlled provider latency/cost/concurrency benchmark exists, so no generation speedup or cost-saving percentage is claimed.
- **Concrete friction:** generation aborts when output files already exist; redraw rewrites all 640-wide image derivatives and renders both backends. A nested SVG containing the belt PNG disappeared in Satori while geometry/node checks passed; visual review caught it. A direct PNG fixed this scene. The original [asset path resolution](https://github.com/HiQS-Labs/XYZ-layout-engine/blob/591971dad73b81e802dfabcb66b9ddb9745a0dd4/tools/spike/assets.mjs#L4) uses URL.pathname and fails for this checkout's encoded spaces; the local demo bypasses it.
- **Artifact sizes:** diagram PNG 1,274,320 bytes; SVG 6,788,502; self-contained HTML 7,547,604. SVG contains embedded raster illustrations. Input/output preparation and duplicate embedding deserve measurement alongside layout/raster time.

Source inspection was used because the complete graph project inventory has no indexed XYZ Layout Engine project. The local bounded trace is recorded in `PROJECT/1-INBOX/recon-mvp-foundation.md`; local evidence paths above are not hosted artifact links.

## P0 — Make one reusable local MVP

- [ ] Complete #1's remaining human artwork review and reconcile the spike report, PRD, active plan/status and origin landing state. Keep operator acceptance separate from agent inspection and automated checks.
- [ ] Extract one reusable render operation from the spike; make CLI and demos call it without importing a module that automatically runs the experiment or copying renderer source. Preserve backend-owned layout/text measurement; domain composition stays in trusted recipes. Start with modules, not a speculative package/plugin framework.
- [ ] Promote nutrition and the Solar System demo into versioned recipes with normalized fixture/parameter/asset input. Move fixed copy and editable semantic values out of the entry-point script. Retain product-hero as the existing smoke example; pin chosen offline assets/fonts so a fresh checkout reproduces supported examples without a paid API call.
- [ ] Implement the PRD's shared request/result schema for the local library/CLI: reject unknown fields, invalid dimensions/scale, missing assets and unsupported formats; return field-level errors, backend/version identity, validation report and artifact digests. Explicit recipe-declared fallback only.
- [ ] Fix path handling using filesystem-safe URL conversion, support directories with spaces, and constrain local asset/output paths (including symlinks) to configured roots. Validate encoded bytes, decoded pixels, SVG references and total render size; renderers must not perform uncontrolled network fetches.
- [ ] Write each run into a unique temporary directory, verify it, then atomically publish a manifest/last-good result. A failed redraw must leave the prior deliverable intact; retain bounded diagnostics and clean temporary files/browser processes.
- [ ] Extend fitting with a readable minimum font size, conservative line-height policy, missing-text detection and explicit non-fit results. Exercise actual shrink and exhausted/non-fit paths; avoid treating an in-canvas element box as proof of unclipped glyphs.
- [ ] Use **#2** for the minimal fresh-render regression/canary suite and CI ratchet. Add only named failures: missing painted image despite a present node, paths containing spaces, fitting exhaustion and failed-publication preservation. Reuse existing assertions; no second test framework or duplicate adapter suites. Bound fresh-canary runtime and establish the suite budget before expansion.
- [ ] Provide one documented install/render/edit-fixture/export command path, a supported capability table and a fresh-checkout offline walkthrough. Clearly describe PNG versus SVG with raster artwork and temporary HTML edits. Obtain human approval of the two recipe outputs before calling the local MVP accepted.

## P1 — Speed up generation and redraw without hiding failures

### Paid image generation

- [ ] Separate asset generation from layout rendering in the supported workflow. Text, theme or placement edits must reuse approved assets and make **zero image-generation API calls**.
- [ ] Add a content-addressed asset manifest/cache keyed by exact prompt, model, generation/edit parameters, recipe version and reference-image digests. Keep originals immutable; reuse only assets whose manifest, digest and required alpha checks validate. Changed prompts/references must invalidate the relevant asset without regenerating unrelated assets.
- [ ] Make generation resumable: skip validated completed assets; submit only missing or explicitly replaced items; atomically persist per-item state/receipts. Bound retries and deadlines. An unknown paid outcome must be reconciled or reported for explicit retry, never blindly resubmitted. Expose an expected-call count and configurable call/budget cap before dispatch.
- [ ] Measure per-asset and total latency, queue/network/provider contribution where observable, refinement rate, failures and reported usage/cost where available. Tune bounded concurrency from the existing three-worker baseline only within verified provider limits; compare total completion time and failure/cost behavior before adopting a higher setting. Do not silently switch model, provider or quality.
- [ ] Add a small batch quality review before acceptance: transparent-edge/halo quality, visual style, cropping, aspect ratio and subject accuracy. Preserve exact reference/edit lineage so rejected assets can be replaced individually. A receipt saying some pixels are transparent is insufficient visual acceptance.

### Local rendering and export

- [ ] Default supported recipes to **Satori/resvg only**. Load/launch Chromium only for explicit comparison or a declared capability requirement; avoid importing unnecessary browser dependencies on the normal path. Reuse a browser within an explicitly requested batch only after measuring the benefit and cleanup behavior.
- [ ] Cache derived image sizes by source digest, requested display dimensions/scale and transformation version. Choose adequate resolution per asset instead of resizing everything to 640 wide. An unchanged-asset redraw must perform **zero derivative rewrites**; edits must invalidate exactly the affected derivatives.
- [ ] Profile fresh-process and warm end-to-end redraw separately: input/asset read, resize, encoding, layout, raster/PNG encoding, filesystem/export and verification. Use nutrition and Solar System workloads; report sample count, runtime, output dimensions, isolated memory and browser memory when used. Keep provider generation timings separate.
- [ ] Compare cached and uncached workflows on the same machine and fixtures, publishing before/after total latency, output sizes and digests/approved visual tolerance. Set a numeric latency target after baseline collection; accept optimization only when the intended stage improves without degrading readability, determinism or validation. Existing 133.4 ms is a reference observation, not the target for the larger diagram.
- [ ] Reduce repeated base64/asset embedding and unnecessary diagnostic exports. Offer a compact HTML + asset-folder distribution alongside the self-contained offline option, and generate only requested formats. Preserve both portability choices explicitly.
- [ ] Establish a backend image policy for nested SVG/raster combinations: supported direct images, safe normalization or explicit rejection. Add the small visibility canary under #2; geometry checks alone must not approve a missing illustration.

## P2 — Finish the local editing and reliability experience

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

The first milestone is a **local** MVP: a fresh checkout renders the two supported recipes offline through one shared operation; changing text regenerates the requested exports without paid calls or source copying; validated existing assets resume without duplicate generation; missing/unsupported content fails clearly; a failed run preserves the last-good output; the focused suite passes within #2's agreed budget; the operator accepts the artwork.

Follow P0 with P1 profiling/cache work (generation resume can be an early independent child), then P2. Later service/UI work is separate promotion, not a condition for this local milestone. Each promoted child needs a bounded acceptance criterion and evidence. Stop/revert an optimization on cache misidentification, duplicated paid calls, missing imagery, degraded readable text or nondeterministic output.

**Bet:** consolidating the existing render functions and reusing validated assets removes avoidable work before deeper backend tuning. **Tradeoff:** prioritize a usable local slice over immediately building all transports/themes. **Failure mode:** incomplete cache identity or overly broad reuse serves stale/wrong art; missing-pixel checks give false confidence. Intake is **Easy** to reverse; shared recipe/API/cache contracts are **Costly** and require versioned rollout.

Provisional planning triage: PDDA effort 4/5, complexity 4/5, risk 3/5, four broad phases. PRS `rated 75/55/50/25` (priority/severity/appeal/effort-cheapness; sum 205): high leverage for follow-on work, material reliability gaps but no demonstrated production incident, neutral appeal, substantial umbrella effort. Re-estimate individual children after scope selection; no priority override is assumed.
