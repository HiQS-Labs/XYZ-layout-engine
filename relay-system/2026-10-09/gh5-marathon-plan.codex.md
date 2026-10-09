# RELAY · GH-5 local MVP implementation-plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 2

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
6. **Commit only the relay file** (`relay(gh-5-local-mvp-implementation-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-5-MVP-FOUNDATION.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: codex-producer
- Started: 2026-10-08

### Artifact — GH-5-MVP-FOUNDATION.md
````
---
gh_issue: 5
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
title: "MVP foundation: reusable recipes, resumable image generation, and faster rendering"
status: "Active (2-WORKING — preparation)"
created: 2026-10-08
doc_type: feedback
effort: 4
complexity: 4
risk: 2
phases: 5
ratings_provisional: false
updated: 2026-10-09
owner: Neochrome
branch: marathon/gh-5-mvp-foundation
reversibility: Easy — local modules and manifests; preserve spike goldens and immutable assets.
goal: >
  Deliver an offline local recipe MVP with safe publication, resumable optional asset authoring and measured redraw improvements.
---


# GH-5 — MVP foundation improvements

## Status

| What was just completed | What's next |
|---|---|
| Rebased a fresh full clone onto origin/main a8e7e574; four baseline canaries passed in 8.2 seconds. Agy's checklist QA is retained. Ponytail reduced mechanisms and selected the local P0/P1/P2 arc. | Independent implementation-plan QA, readiness computation, direct preflight and full YAML dry-run; launch the approved sequence under the operator's explicit fire instruction. |

## Table of contents

- [Execution scope and ponytail decisions](#execution-scope-and-ponytail-decisions)
- [Phase 1 — Shared local operation](#phase-1--shared-local-operation)
- [Phase 2 — Offline Solar System and readable fitting](#phase-2--offline-solar-system-and-readable-fitting)
- [Phase 3 — Resumable optional generation](#phase-3--resumable-optional-generation)
- [Phase 4 — Measured redraw and durable edits](#phase-4--measured-redraw-and-durable-edits)
- [Phase 5 — Integration and handoff](#phase-5--integration-and-handoff)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)


## Verdict and purpose

**7/10 as an MVP foundation; 4/10 as a reusable, operator-ready local MVP.** These are engineering judgments, not measured scores. The renderer choice, backend-owned geometry, separate artwork/text, pinned inputs and evidence discipline are sound. The landed implementation is still a renderer spike with a focused regression suite, rather than a reusable recipe engine. Recipes remain hardcoded and editing/export is not a complete product workflow. The Solar System example source and display assets are now published by PR #7, but its renderer still imports a copied runtime and requires uncommitted originals; it is not yet a fresh-checkout offline recipe.

This umbrella tracks the shortest path from that evidence to a reliable local MVP, then the already-planned remote/product improvements. It builds on completed #1 and #2; it does not reopen their scope or authorize immediate implementation of every item below. The operator has now promoted the bounded local arc below. Keep one umbrella and five sequential phases instead of duplicate child issues; check items only with evidence. Remote/product follow-ups remain deferred.

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
- [ ] Measure per-asset and total latency, queue/network/provider contribution where observable, refinement rate, failures and reported usage/cost where available. Establish a measured baseline using the published three-worker setting and admitted caller, then compare bounded concurrency settings only within verified provider limits. Do not assume three workers is optimal; compare total completion time and failure/cost behavior before adopting a different setting. Do not silently switch model, provider or quality.  [Unverified — no citation]
- [ ] Add a small batch quality review before acceptance: transparent-edge/halo quality, visual style, cropping, aspect ratio and subject accuracy. Preserve exact reference/edit lineage so rejected assets can be replaced individually. A receipt saying some pixels are transparent is insufficient visual acceptance.

### Local rendering and export

- [ ] Default supported recipes to **Satori/resvg only**. Load/launch Chromium only for explicit comparison or a declared capability requirement; avoid importing unnecessary browser dependencies on the normal path. Reuse a browser within an explicitly requested batch only after measuring the benefit and cleanup behavior.
- [ ] Cache derived image sizes by source digest, requested display dimensions/scale and transformation version. Choose adequate resolution per asset instead of resizing everything to 640 wide. An unchanged-asset redraw must perform **zero derivative rewrites**; edits must invalidate exactly the affected derivatives.
- [ ] Profile fresh-process and warm end-to-end redraw separately: input/asset read, resize, encoding, layout, raster/PNG encoding, filesystem/export and verification. Use nutrition first and a representative larger supplied-assets fixture; use Solar System after its supplied-assets promotion gate; report sample count, runtime, output dimensions, isolated memory and browser memory when used. Keep provider generation timings separate.
- [ ] Compare cached and uncached workflows on the same machine and fixtures, publishing before/after total latency, output sizes and digests/approved visual tolerance. Set a numeric latency target after baseline collection; accept optimization only when the intended stage improves without degrading readability, determinism or validation. Existing 133.4 ms is a reference observation, not the target for the larger diagram.
- [ ] Reduce repeated base64/asset embedding and unnecessary diagnostic exports. Offer a compact HTML + asset-folder distribution alongside the self-contained offline option, and generate only requested formats. Preserve both portability choices explicitly.
- [ ] Establish a backend image policy for nested SVG/raster combinations: supported direct images, safe normalization or explicit rejection. Add the small visibility canary under #2; geometry checks alone must not approve a missing illustration.

## P2 — Finish the local editing and reliability experience

- [ ] Promote the published Solar System example as a follow-on recipe using its supplied web-sized assets, verified against the committed display digests, without requiring paid regeneration. Remove the copied runtime dependency. Recover originals/reference lineage only when the admitted export resolution or provenance requirement needs them; record/park unavailable higher-resolution variants. A fresh checkout must redraw the selected refined assets offline and obtain separate human artwork approval before this recipe is accepted.  [Unverified — no citation]

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
- **P2 — durable edits and broader reliability:** save/edit/rerender/export persists fixture state, admitted script support is explicit, provenance/limits/cancellation have evidence, and the Solar System recipe redraws with supplied verified assets and is independently accepted, or any unavailable higher-resolution variant is explicitly parked. Missing original artwork never blocks the completed nutrition milestone.  [Unverified — no citation]
- **Later service work:** separate promoted children close only after the PRD's shared-contract, authorization, parity and recovery gates; they are not local-MVP prerequisites.

Follow P0 with P1 profiling/cache work (generation resume can be an early independent child), then P2. Later service/UI work is separate promotion, not a condition for this local milestone. Each promoted child needs a bounded acceptance criterion and evidence. Stop/revert an optimization on cache misidentification, duplicated paid calls, missing imagery, degraded readable text or nondeterministic output.

**Bet:** consolidating the existing render functions and reusing validated assets removes avoidable work before deeper backend tuning. **Tradeoff:** prioritize a usable local slice over immediately building all transports/themes. **Failure mode:** incomplete cache identity or overly broad reuse serves stale/wrong art; missing-pixel checks give false confidence. Intake is **Easy** to reverse; shared recipe/API/cache contracts are **Costly** and require versioned rollout.

Provisional planning triage: PDDA effort 4/5, complexity 4/5, risk 3/5, four broad phases. PRS `rated 75/55/50/25` (priority/severity/appeal/effort-cheapness; sum 205): high leverage for follow-on work, material reliability gaps but no demonstrated production incident, neutral appeal, substantial umbrella effort. Re-estimate individual children after scope selection; no priority override is assumed.

## Execution scope and ponytail decisions

The current-state map is `PROJECT/1-INBOX/recon-mvp-foundation.md`, refreshed against origin/main a8e7e574 (no runtime changes since). Recon reused — same traced subsystem and baseline. Graph inventory has no indexed project; source fallback is disclosed. Current callers are spike render/verify/canaries and the published demo/generator. Geometry belongs to Satori/Chromium; domain composition belongs to trusted recipes. State includes immutable supplied assets/fonts/receipts, mutable fixture JSON, disposable derivatives and atomically published manifests.

**Present requirement:** local offline render/edit/export plus safe optional image authoring and evidence-based speed improvements. **Simplest mechanism:** plain existing ESM/Python modules, JSON manifests, stdlib filesystem/locks/subprocesses and pinned rendering libraries. Existing spike code lacks import safety, normalization, last-good publication, durable edits and resume; these specific gaps justify the small added modules. No new runtime dependency, plugin framework, provider client, server, queue, canvas editor, CI workflow or default browser pool.

The checklist above remains the complete umbrella scope. This marathon includes P0, P1 local behavior/recovery, and P2 offline recipe/editing/provenance/font-rejection/notices. Live provider benchmarking and batch visual acceptance require an admitted caller, operator budget and human review; they stay pending rather than run paid calls autonomously. Conditional browser pools/workers are added only on measured need. The four Later items are deferred, retained here, and #5 must not be closed on marathon machine completion. Migration human acceptance is a separate pending release gate.

**Ratings:** effort 4, complexity 4, risk 2, five phases, nonprovisional for this bounded local arc. Effort/complexity remain high for shared contracts, typography, filesystem safety and recovery. Risk moved from the broad provisional 3 to 2 because remote/tenant deployment and live paid experiments are excluded, goldens remain protected, all artifacts are local/revertible, and unknown paid outcomes cannot redispatch. This does not rate the Later service arc as safe or trivial. RELEASES PRS axes remain the existing 75/55/50/25 (calc 205); no extra priority score is invented.

One umbrella/member: GH-5. Full clone `marathon-gh-5-mvp-foundation`, branch `marathon/gh-5-mvp-foundation`, base `origin/main` as confirmed by the operator (origin has no development branch). Never the primary checkout or linked worktree. Phase order p1 -> p2 -> p3 -> p4 -> p5 is strictly serial in one wave. Shared runtime, package.json, test file, report and CHANGELOG collide; no parallel lanes. Releases writers/plan status/QA checkboxes are orchestrator-only and never edited during builder flight.

**Blast:** Easy — unshipped local modules and owned manifests. Protect immutable inputs and spike goldens; stage/verify before publish; tripwires are digest/geometry drift, escaped paths, corrupt inputs, unknown paid outcomes and failed canaries. Halt on first failed phase; no force/attempt-cap bypass. Rollback reverts the failed phase commit and restores the prior last-good manifest; preserve evidence and recover unknown provider results before any explicit retry. New local schemas/cache versions are explicit to avoid accidental reuse; public service contracts remain deferred.

The native driver uses Agy builder and independent Codex reviewer for every phase. Plan QA is an independent Codex relay before dispatch. After all driver test gates are green, the orchestrator must mechanically run a separate final Codex wave review against the committed aggregate diff and on-disk test receipts before checking the wave QA boxes or pushing a feature/PR. Native per-phase review before its gate does not satisfy that final requirement. Each turn is capped at 1500 seconds; at most two review rounds per phase and the installed attempt cap, no automatic force. The pre-advance command is `pnpm test`. Builder must not run the pre-advance gate (the driver runs it after independent review); reviewer inspects code and tests rather than inferring correctness from a prior green spike. Every builder records stage-specific checkable evidence inside the allowed report/relay; scratch and outputs go to ignored/temp owned paths, not arbitrary repository files. No runtime governance edits.

## Phase 1 — Shared local operation

**Goal:** Shared local operation delivers the observable behavior below. Depends on none.

- [ ] Extract reusable backend operations with a direct-execution guard; importing them must not run the experiment. Keep the legacy experiment's bytes/geometry and product-hero smoke unchanged. Put trusted nutrition composition behind one versioned recipe. Keep plain ESM and existing pinned dependencies; no plugin registry, monorepo or provider client.
- [ ] Normalize the local library/CLI request/result against PRD semantics in tools/request.mjs. Reject unknown fields, unsupported formats/backend/fallback, invalid dimensions/scale and missing input with field-level errors. Ship only an honest local supported subset; document unsupported remote fields rather than accepting them silently. Result includes normalized input, recipe/backend versions, validation report, provenance and output digests.
- [ ] Use fileURLToPath and realpath/root containment for inputs/output, including symlink escape rejection; reject remote/file references in supplied SVG, scripts/foreignObject and nested SVG+embedded raster on the supported Satori path unless explicitly normalized with proven visibility. Bound encoded bytes, decoded dimensions/pixels and total render area before decoder/layout allocation. Use existing resvg for admitted SVG/raster inspection, not a new parser dependency; never claim a regex blacklist alone makes arbitrary SVG safe. Limit to trusted bundled SVG and validated direct PNG for v1 if safe general SVG admission is uncertain.
- [ ] Default to lazy Satori/resvg only. Load/launch Chromium solely for explicit comparison or recipe-declared capability; preserve finally cleanup. Stage one run under a unique same-filesystem directory; validate all requested artifacts before atomic last-good manifest publication. Do not replace a last-good deliverable on failure; preserve bounded diagnostic state and remove orphan staging files safely. Existing spike evidence is read-only.
- [ ] Extend C1 within its existing test block: import no-side-effect assertion, CLI in a space-containing temp path, invalid request/escaping symlink and injected failed publication preserving prior digests. C2 retains legacy geometry/digests. Run pnpm test. Record actual commands/results in tools/MVP-REPORT.md.

**Write set:** `tools/spike/render.mjs`, `tools/spike/assets.mjs`, `tools/spike/scene.mjs`, `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 1 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 2 — Offline Solar System and readable fitting

**Goal:** Offline Solar System and readable fitting delivers the observable behavior below. Depends on Phase 1.

- [ ] Promote the published Solar System scene/fixture as a trusted recipe sharing the runtime. Read the eleven committed assets/web PNGs, verify the committed verification.json display digests (including saturn-clean and asteroid-belt-diagram), and preserve their generation/edit lineage. Do not call a provider or pretend missing full-size originals are present. Admit a bounded export resolution compatible with display inputs; park higher-resolution originals if unavailable.
- [ ] Make the published demo a thin shared-operation entry point and remove its copied runtime only after the offline replacement renders. Share pinned fonts from the root runtime; do not duplicate them. Keep the Sun, each of eight planets, belt and Milky Way as individual images, separate editable text and backend-owned bounds. Preserve schematic/not-to-scale disclosure and original fixture/artifacts as provenance.
- [ ] Add bounded fitting (maximum ten attempts), readable minimum font size, conservative line-height policy, missing glyph/text detection and explicit non-fit response. Do not implement independent glyph metrics or arbitrary line breaking. Reject unsupported scripts using the pinned font capability evidence, without host-font fallback. Exercise real shrink and exhaustion, not only successful iteration-zero cases.
- [ ] Extend C1/C2 or the existing verifier for actual shrink/non-fit and image visibility. Visibility evidence must compare painted pixels or render a focused admitted image canary; a node rectangle or alpha metadata alone cannot pass a missing illustration. Keep one file/four tests/60 seconds. Run pnpm test and fresh Solar System CLI offline. Record agent visual evidence separately from pending human migrated-artwork acceptance.

**Write set:** `tools/recipes/solar-system.mjs`, `tools/recipes/nutrition.mjs`, `tools/render.mjs`, `tools/request.mjs`, `tools/spike/render.mjs`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `examples/2026-10-08-solar-system/README.md`, `examples/2026-10-08-solar-system/runtime/.gitignore`, `examples/2026-10-08-solar-system/runtime/SOURCE.json`, `examples/2026-10-08-solar-system/runtime/package.json`, `examples/2026-10-08-solar-system/runtime/pnpm-lock.yaml`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets.mjs`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/OFL.txt`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/SOURCES.md`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/font-bold.ttf`, `examples/2026-10-08-solar-system/runtime/tools/spike/assets/font.ttf`, `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs`, `examples/2026-10-08-solar-system/runtime/tools/spike/scene.mjs`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 2 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 3 — Resumable optional generation

**Goal:** Resumable optional generation delivers the observable behavior below. Depends on Phase 2.

- [ ] Extend the existing Python generator, not a second provider client. Keep the installed resolve-image/HiQS caller as the only paid boundary and require its explicit configured path. Accept exact job inputs, including refinement IDs, references and parameters, without rewriting published prompts/receipts during dry-run. Imported module must not dispatch calls.
- [ ] Persist a local content-addressed manifest keyed by exact prompt/model/parameters/recipe version/reference digests. Keep source images/receipts immutable; validate digest/required alpha before reuse. Resume valid completed items and dispatch only missing or explicitly replaced jobs. Atomic per-item state must record pending -> in-flight before dispatch -> complete or unknown/failed. Crash/timeout while in-flight remains unknown and requires receipt reconciliation or explicit retry; never blind paid resubmission. Concurrent same-output invocations use an exclusive local lock and refuse safely, no daemon/database queue.
- [ ] Show planned call count and enforce a configurable maximum calls/observable cost budget before dispatch; if price is unavailable, report that limitation and rely on the call cap rather than inventing cost. Bound attempt count and per-call/whole-run deadlines; retry only a proven non-submitted transient failure or explicit operator retry. Preserve Sun-first admission and the historical configurable three-worker ceiling until provider limits/measurement support a change. No silent model/provider/quality switch. Capture latency, caller-reported usage/cost and unavailable stage metrics honestly.
- [ ] Extend C1 by invoking this generator against a temporary deterministic caller stub: valid resume -> zero calls, one changed input -> one call, cap exceeded -> zero calls, interrupted in-flight -> no automatic second call, corrupt output -> explicit report/replacement, concurrent manifest ownership -> safe refusal. No live paid calls or secrets in tests. Batch visual acceptance remains a human gate; preserve reference/edit lineage. Run pnpm test; record measured stub behavior as recovery evidence, never provider speed evidence.

**Write set:** `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/README.md`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 3 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 4 — Measured redraw and durable edits

**Goal:** Measured redraw and durable edits delivers the observable behavior below. Depends on Phase 3.

- [ ] Before optimizations, measure fresh-process and warm end-to-end nutrition and promoted Solar System/supplied-asset runs on this machine. Record sample count, Node/dependency versions, dimensions, input/asset read, transform/encoding, backend layout/raster, write/export and verification timings, isolated peak Node RSS and browser RSS if used. Minimum five fresh and ten warm samples, outside the 60-second canary suite. Keep provider timings separate. Publish before/after JSON or tables in tools/MVP-REPORT.md with commands, digest/geometry comparisons and variance; no invented speedup/p95/SLA.
- [ ] Cache only derived images using source digest + dimensions/scale + transform version; validated supplied web inputs already suitable for display should be reused directly. Unchanged redraw performs zero derivative rewrites and zero paid calls; one asset/dimension change invalidates only its derivative. Verify cached digest/size/alpha before reuse. Bound cache space and clean only owned derivative entries; do not touch immutable originals or another caller's files. Avoid persistent browser/service pools unless measurements establish need and cleanup is verified.  [Unverified — no citation]
- [ ] Expose durable fixture JSON save/edit/rerender/export through the existing CLI (one schema-validated write path, atomic save, errors preserve original). JSON editing is sufficient; don't build a full canvas editor or UI framework. Unknown labels/fields fail explicitly. Text/theme/placement edits never invoke image generation.
- [ ] Generate requested formats only. Provide compact offline HTML plus asset folder and an explicit self-contained HTML option; SVG with raster art is described accurately. HTML must safely escape text and URLs; compact references remain inside the exported folder, fonts are pinned and both distributions need no network. Verification/manifests remain mandatory; optional diagnostic dumps are explicit.
- [ ] Extend existing C1/C4 for zero derivative writes, invalidation/tamper recovery, saved edit surviving rerender, requested-format selection and offline HTML distributions; stay within ratchet. Set an optimization acceptance target after observing baseline; if no stage improves, publish that result and omit the ineffective cache complexity. Run pnpm test and record profiling separately.

**Write set:** `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/profile.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`.

### Phase 4 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Phase 5 — Integration and handoff

**Goal:** Integration and handoff delivers the observable behavior below. Depends on Phase 4.

- [ ] Document one pinned install/render/edit/export workflow for nutrition and Solar System on a fresh checkout without originals, paid API calls or copied runtime. Record schema/capability/font/image limits, PNG vs SVG-with-raster, durable JSON edits vs transient preview edits, compact/self-contained offline exports, expected generation calls/resume/unknown recovery and exact caller prerequisite. Gather pinned dependency/font notices; don't package/distribute Chromium before its terms/notices are verified.  [Unverified — no citation]
- [ ] Record measured limits (input bytes, pixel/render area, fit/deadline/concurrency/cache bounds), unsupported scripts and stage diagnostics/correlation IDs. A local worker/subprocess for hard interruption is conditional on measured need; an event-loop timer must never be presented as a hard interrupt of synchronous rasterization. If a required hard limit is not enforceable, document/reject the unsupported workload, rather than claim compliance. Keep remote HTTP/MCP, tenant isolation/SSRF/private caches, durable service queues and themes/adapters/full editor in the Later queue; do not ship half-services.
- [ ] Run pnpm test, fresh offline documented workflows and relevant PDDA checks; publish receipts/report and update PRD with delivered local observations only. No unearned green boxes, human approval, issue closure or production readiness. Obtain independent Codex post-build review via the native driver and adjudicate peer findings. Prepare a ready PR only after the wave receipt gate is satisfied; do not push/merge/close from builder turns. Report nutrition and Solar System visual acceptance as pending human decisions; #5 remains open for Later requirements.

**Write set:** `README.md`, `tools/MVP-REPORT.md`, `examples/2026-10-08-solar-system/README.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`.

### Phase 5 — QA checklist

- [ ] Every phase todo has a recorded command/result or an explicit pending human/live-provider gate.
- [ ] Native independent Codex review is Approved and attested against the committed phase diff; receipt is on disk.
- [ ] Driver executes `pnpm test` exit 0, keeping one file/four canaries/60 seconds/zero workflows; prior green baseline is not phase proof.
- [ ] Bounded failure/recovery, diagnostics and Easy rollback evidence recorded in `tools/MVP-REPORT.md`; no paid calls.
- [ ] Orchestrator refreshes status/date after approval; no builder edits to plan/ledger/goldens.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm test` exit 0 after all five phases, plus documented fresh offline edit/export and measured before/after report).
- [ ] Wave 1 Post-Build Codex QA Relay executed (native per-phase transcripts under `relay-system/`; final on-disk `.codex.md` receipt must have first STATUS Approved/Closed and exact reviewed head).
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated (independent Codex findings resolved; later PR findings adjudicated before landing).

Plan QA: pending a fresh independent implementation-plan relay; earlier Agy checklist approval is not this plan's approval. Final integration requires all five native review+test gates, root-bound `check_marathon_qa.py --pre-pr --wave 1 --doc PROJECT/2-WORKING/MARATHON-PLAN-2026-10-09.md`, and applicable PDDA checks before feature push/ready PR. Human migrated-artwork approval and live provider benchmarks are separate pending checks. No automatic closeout/merge/closure.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/main"
  },
  "gate": "pnpm test",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/render.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/request.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/recipes/nutrition.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/recipes/solar-system.mjs"
    },
    {
      "type": "path_absent",
      "path": "tools/profile.mjs"
    },
    {
      "type": "path_absent",
      "path": "README.md"
    },
    {
      "type": "path_absent",
      "path": "tools/MVP-REPORT.md"
    }
  ],
  "artifacts": [
    "package.json",
    "tools/spike/render.mjs",
    "tools/spike/assets.mjs",
    "tools/spike/scene.mjs",
    "tools/spike/test/canaries.test.mjs",
    "examples/2026-10-08-solar-system/render-diagram.mjs",
    "examples/2026-10-08-solar-system/generate-assets.py",
    "examples/2026-10-08-solar-system/README.md",
    "CHANGELOG.md",
    "PROJECT/2-WORKING/SPECS-PRD.md",
    "tools/render.mjs",
    "tools/request.mjs",
    "tools/recipes/nutrition.mjs",
    "tools/recipes/solar-system.mjs",
    "tools/profile.mjs",
    "README.md",
    "tools/MVP-REPORT.md",
    "examples/2026-10-08-solar-system/runtime/.gitignore",
    "examples/2026-10-08-solar-system/runtime/SOURCE.json",
    "examples/2026-10-08-solar-system/runtime/package.json",
    "examples/2026-10-08-solar-system/runtime/pnpm-lock.yaml",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets.mjs",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/OFL.txt",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/SOURCES.md",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/font-bold.ttf",
    "examples/2026-10-08-solar-system/runtime/tools/spike/assets/font.ttf",
    "examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs",
    "examples/2026-10-08-solar-system/runtime/tools/spike/scene.mjs"
  ],
  "artifacts_new": [
    "tools/render.mjs",
    "tools/request.mjs",
    "tools/recipes/nutrition.mjs",
    "tools/recipes/solar-system.mjs",
    "tools/profile.mjs",
    "README.md",
    "tools/MVP-REPORT.md"
  ],
  "remediation": {
    "source": "issue#5",
    "criteria": "Offline shared nutrition and Solar System library/CLI render/edit/export with validated confined inputs, explicit capabilities, atomic last-good publication, bounded readable fitting, no paid redraw, exact-content generation resume and derivative cache, recorded before/after measurements and four existing canaries; Later services and human/live-provider acceptance stay pending."
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
````
- Definition of Done: _<fill in the acceptance criteria the Reviewer grades against>_

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Producer review request

Review the implementation plan, PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml and all five briefs against actual code/main a8e7e574 and issue #5. This is independent implementation-plan QA, not the already-approved broad checklist. Check ponytail/DRY, security/recovery controls, honest scope/risk, minimal files, all named paths, golden/test-budget preservation, zero paid tests, fitting/visibility evidence, generation crash/unknown outcomes, measured performance acceptance and sequential collisions. The operator explicitly asked to prepare then fire; main checkout is untouched and base origin/main was confirmed.  [Unverified — no citation]

Read actual source and current recon; no graph index for this project. You may read source, inspect git diff and run read-only checks. Write ONLY this relay. No runtime edits, no scratch files in repo, no git commits/push. Give cheapest precise fixes if blocked; don't manufacture speculative requirements. Distinguish pending human/provider gates from machine completion. Native per-phase review precedes driver pnpm test, so a final separate wave Codex relay against all green receipts is required before feature push/PR (plan mandates it).

Follow literal VERDICT: PASS|FAIL|PARKED and nonempty Basis: in final reviewer block. On PASS set STATUS: Approved, append only and terminally finish this task with tick done as codex; DO NOT release to producer on approval. On FAIL release to codex-producer. Use TICK_BIN/TICK_REPO_ROOT supplied by the harness. Task: GH5-MARATHON-PLAN-QA-1. Independent review must cite exact reviewed HEAD. End-marker is at EOF; preserve every prior block byte-for-byte.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: The bounded local plan is grounded and largely buildable, but Phase 2 deletes dependencies of a retained example entry point without admitting that entry point to any write set. Resolve that concrete migration gap before dispatch. This is plan QA, not runtime acceptance.
swept file: yes

Reviewed HEAD: `55c09895904666064e4436762db379a2168a5387` (read `.git`/HEAD and its ref directly; no git commands). Read the entire embedded artifact, matching canonical GH-5 plan, MARATHON.yaml, all five briefs, current recon, PRD contract sections, test ratchet and relevant source consumers. Author-declared runtime baseline: `a8e7e574c85762d5c2b08fecdf2243a5bbd8bb2c`. The pre-existing contact-sheet dependency below is in scope; no other material pre-existing plan defect was found in this sweep. Graph tools were unavailable, so evidence used source reads without an index/coverage claim.

- [Should] **F1 — Account for the second copied-runtime consumer before deletion.** Phase 2 says “remove its copied runtime only after the offline replacement renders” (embedded artifact, Phase 2; `briefs/gh5-p2.md:27`). `examples/2026-10-08-solar-system/contact-sheet.mjs:3–4` still imports `runtime/tools/spike/render.mjs` and both runtime fonts; all three are slated for removal in `PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml:17`. The README still describes this script as building the contact sheet (`examples/2026-10-08-solar-system/README.md:19`), but no phase permits changing it. A successful diagram replacement therefore leaves a dangling renderer import in the other retained entry point. This is a static migration/write-set contradiction, not a claimed fixture execution.
  Observed input: The literal `await import('./runtime/tools/spike/render.mjs')` at `contact-sheet.mjs:3`, the font URLs at line 4, and Phase 2's removal list. Probe: `python3 -c 'from pathlib import Path; print("contact-sheet.mjs" in Path("PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml").read_text())'`; exit **0**; decisive output: `False`.
  Affected scope: Phase 2's retirement of the copied runtime and this specific example script; no new recipe breadth or provider work.
  Falsifier: An explicit retirement of the script plus removal/correction of its README promise resolves the need to migrate it. If retained, a disposable-clone, temp-output, offline contact-sheet run after runtime deletion must resolve shared renderer/fonts and succeed without missing originals or paid calls.
  Cheapest fix: Give the script an explicit disposition. Add it to Phase 2's plan/YAML/preflight write sets and brief to migrate to shared operations, root fonts and supplied display assets (including selected refinements), with temp-owned output; alternatively admit its deletion and document the committed contact sheet as historical provenance. Preserve the committed PNG and receipts. Extend an existing assertion or record a focused clone smoke; do not add a test file/block.

- [Pass] **Scope, safety and proof are stated concretely.** The execution scope says live provider work “stay[s] pending rather than run paid calls autonomously”; Phase 3 requires “in-flight before dispatch” and unknown-outcome reconciliation with no blind resubmission; Phase 4 requires at least five fresh/ten warm samples and permits dropping ineffective optimization; the final-wave paragraph requires a separate Codex review after green driver gates. The five briefs repeat the driver-owned gate, and `test-budget.json:10` pins one file/four tests/60 seconds/zero workflows. These are reviewable plan commitments, not proof that future code satisfies them. Static path inspection found no missing existing declared artifacts; the five YAML write-set unions match the preflight artifact list, apart from the omitted consumer identified in F1.

- [Pass] **The offline selected assets have usable integrity evidence.** The following non-mutating probe exited **0** with `11/11 committed display digests match`; it checks the exact `assets.*.display.path`/`sha256` entries in `examples/2026-10-08-solar-system/verification.json`, including `saturn-clean` and `asteroid-belt-diagram`:

  ```sh
  python3 - <<'PY'
  import hashlib,json
  from pathlib import Path
  p=Path("examples/2026-10-08-solar-system")
  a=json.loads((p/"verification.json").read_text())["assets"]
  assert len(a)==11
  assert all(hashlib.sha256((p/x["display"]["path"]).read_bytes()).hexdigest()==x["display"]["sha256"] for x in a.values())
  print("11/11 committed display digests match")
  PY
  ```

- [Nit] Name `debug-mantra` as the execution-time debugging protocol in the canonical execution scope and shared brief instructions, satisfying the SWE Diagnosable rubric. The present instruction is only “Diagnose concrete failures, never use --force” (`briefs/gh5-p2.md:37`). No additional machinery is needed.

- [Unverified — needs clone run] Future full canary duration, golden preservation after extraction, actual fitting/visibility, native YAML dry-run/preflight and final PDDA/receipt gates were not executed here. Run them in the disposable full clone at their scheduled gates; the reported 8.2-second baseline is author evidence, not this review's test result. The roadmap CLI is absent from this seeded worktree. Live issue/merge state could not be refreshed: `gh api repos/HiQS-Labs/XYZ-layout-engine/issues/5 --jq '{state,title,body}'` exited **1**, output `error connecting to api.github.com`; current issue state and the claimed origin baseline remain author-supplied. No paid calls, executable fixtures, tests or git commands were run.

Review outcome: Changes requested for F1; human artwork approval and live-provider evidence remain pending. Handing off to codex-producer — resolve F1, disposition the nit, refresh the embedded plan, then open Round 2 for independent review.

### Producer · Round 2 · codex-producer

F1 Implemented: Phase 2 plan/YAML/preflight/brief now admit contact-sheet.mjs. Both existing copied-runtime consumers must migrate to shared renderer/root fonts and the eleven selected digest-verified display images, including refinements; smoke both offline into owned temp outputs before runtime removal. Preserve committed PNG/receipts. Recon addendum records the fully read second caller.
Nit Implemented: canonical execution scope and all briefs name debug-mantra; no additional machinery.
Preflight advisory fixed: the issue and capture's existing closure criteria use exact `## Acceptance` and checkbox syntax, preserving wording. All four phase closure criteria remain pending, including human/provider and Later gates; no scope expansion or deletion. The old broad risk statement is explicitly historical.
The embedded Round-1 snapshot is retained; review current committed canonical GH-5 plan, YAML and briefs for Round 2. These supersede that snapshot. On approval terminally tick done GH5-MARATHON-PLAN-QA-1 as codex; do not release to producer. Append only with literal VERDICT/Basis, reviewed current HEAD and source citations. Need an independent PASS before dispatch; no tests/runtime acceptance claimed.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
