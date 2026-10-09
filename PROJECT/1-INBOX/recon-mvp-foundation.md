# Recon Map — MVP foundation

## QA refresh — latest landed baseline

The sections below preserve the original assessment trace. Current plan QA uses origin/main `8a44d552d538306e2439acab138ff2d423139e23` after PRs #3/#4/#6 landed, with #1/#2 closed, spike artwork accepted by the operator, and GH-1/GH-2 plans archived under PROJECT/3-COMPLETED/. The four-canary suite and test-budget.json are delivered baseline capabilities. The current scene/renderer/asset/verifier operations are unchanged by the landing reconciliation apart from report/path references.

The historical Solar System artifact and generation harness are absent from this clone and their recorded local path; their detailed observations below are historical producer evidence, not independently reverified source in this QA. Recovery of assets/scripts/receipts is required before recipe promotion or a concurrency comparison. P0 now accepts nutrition plus the existing product-hero smoke; Solar System is a conditional follow-on. Renderer timings and paid generation concurrency are different measurements.

## Subject and change class

Assessment/intake only, 2026-10-08. Trace covers the GH-1 renderer spike at origin commit `591971dad73b81e802dfabcb66b9ddb9745a0dd4` and the local Solar System demonstration. Proposed work spans reusable local rendering, image-generation recovery/cache, verification and later product interfaces. No runtime changes are authorized by this intake.

Graph inventory: `list_projects(limit=100)` returned all 82 projects, no XYZ Layout Engine checkout; no graph generation or coverage claim is available. Evidence uses exact source reads, including earlier traces in this session. PR #3 remains open; the Solar System artifact is local/untracked and is not delivered by that PR.

## The seams — where a change here escapes this file

| Seam | Evidence | Consequence |
|---|---|---|
| Renderer owns geometry and text measurement | Origin `tools/spike/render.mjs:66` (`renderSatori`); `renderPlaywright`, `fitCase` in the same fully read module | Extract these operations without introducing independent font metrics/layout rules. |
| Fixture/scene mapping owns domain composition | Origin `tools/spike/scene.mjs`; local `artifacts/solar-system-2026-10-08/render-diagram.mjs:50` | Nutrition and astronomy should become trusted recipes sharing one runtime. |
| Asset/font resolution crosses filesystem paths | Origin `tools/spike/assets.mjs:4`; local demo `render-diagram.mjs:12` | URL.pathname leaves encoded spaces; demo bypasses this with URL-based reads. Reusable entry points must handle spaces and enforce configured roots. |
| Generated assets cross a paid provider boundary | Local `generate-assets.py:21`, `:26`, `:39` | Sun-first admission, then three concurrent jobs; rerun aborts on existing files. Recovery must distinguish validated completion from unknown paid outcomes. |
| Display derivatives are regenerated | Local `render-diagram.mjs:24`–`:36` | All eleven source images are resized to 640-wide derivatives and rewritten each run; no derivative cache. |
| Backend selection currently means comparison | Local `render-diagram.mjs:105`, `:109`–`:120` | Every redraw invokes Satori and launches a browser. Diagnostic comparison needs an explicit mode. |
| Publication precedes validation | Local `render-diagram.mjs:104`–`:120`, `:134`–`:136` | Failed runs can replace previously useful output; validate staged output before promotion. |
| Verification reads evidence, not all painted pixels | Origin `tools/spike/verify.mjs:18`, `:84`; local `render-diagram.mjs:121`–`:136` | Geometry/node-count checks did not detect the missing nested-SVG belt; fresh-render visibility needs a focused canary under #2. |
| Editable HTML has no persistence operation | Local `render-diagram.mjs:119`; artifact README | Double-click edits modify the open view only; durable edits require fixture changes and rerender. |

Origin paths above refer to PR #3's pinned head, not implementation on main. The local runtime copy adds exports and a main guard; it is not a published library.

## Call paths in

- Spike CLI: `pnpm spike:render` → module `main` → fixture/fonts → scene builders → Satori/resvg and Playwright → backend-owned bounds/text evidence → bounded fitting/repeats/probes/timings → output files. The original module runs main at import.
- Spike verifier: `pnpm spike:verify` → fixture/assets/fonts/source provenance → newest dated output directory → persisted dimensions/digests/capabilities/geometry. Existing acceptance cases fit at iteration zero; delivered evidence does not exercise the shrink branch.
- Local image generation: Python subject list → Sun admission call → thread pool (3) → installed resolve-image HiQS caller → provider → image and receipt files. A file's existence aborts rather than resumes. Prompt files are written before generation; there is no durable job ledger.
- Local redraw: fixture → copied runtime imports/fonts → source hashes plus receipt-alpha assertions → Satori display derivatives → recipe scene → Satori SVG/PNG → launched browser HTML/PNG → verification report/assertions. No paid generation call is needed by this redraw path.

## State

- Inputs: pinned fixtures, prompts, recipe parameters, font bytes, selected image bytes and generation receipts. Originals/refinements must remain immutable provenance; rendered derivatives are disposable.
- Outputs: spike dated folders (same-day reruns overwrite); local web derivatives, scene JSON, PNG/SVG/HTML and verification JSON (same names overwrite). Browser/page lifetime is bounded by finally cleanup.
- One owner: renderer supplies final geometry; recipe supplies domain placement and content. Shared application operations and one normalized request schema are PRD requirements, not delivered API contracts yet.
- Planning state: new issue → inbox capture → canonical releases roadmap writer. Existing dirty files and local artifacts are preserved.

## Contracts

- Backend capabilities differ: Satori emits SVG with embedded raster art; Chromium screenshot is raster-only. Unsupported formats and fallback policy must be explicit.
- Fonts are pinned Inter Regular/Bold; English/accented Latin demonstrated. Satori lacks the probed CJK/emoji glyphs; Chromium uses unpinned system fallback. Multilingual determinism is unproven.
- Generation returns provider receipts with file digest and alpha observations. Local redraw verifies the digest and receipt assertion; it does not independently establish attractive cutout edges or painted visibility.
- PRD §§5–10 already specifies offline local operation, trusted installed recipes, shared request/result contracts, resource bounds and cache identity. Future HTTP/MCP work inherits these boundaries rather than creating a second engine.
- Human artwork acceptance remains pending in GH-1. Agent visual inspection is recorded separately.

## Build, failure and rollback today

- Pinned Node/pnpm dependencies, Inter assets and existing spike verifier provide the reproducible baseline. A prior isolated full-clone install and `spike:verify` passed this session; this assessment does not claim a new fresh render or a production test suite.
- Source generation has bounded caller timeouts but no restart-safe orchestration; malformed/failed receipts fail the run, and parallel jobs may still complete. Unknown paid outcomes cannot justify automatic resubmission.
- Renderer fitting caps at ten attempts. Font-size-only shrink may degrade readability without resolving line-height issues; delivered acceptance cases do not cover exhaustion.
- Spike has browser finally cleanup and injected-failure/deadline evidence. Synchronous raster work is not forcibly interrupted by an event-loop timer; hard deadline/memory enforcement remains a future measured worker boundary.
- Demo caught a nested SVG with embedded PNG disappearing in Satori by visual inspection and switched to direct PNG. No general flattening/fallback capability is proven.
- Current rollback is rerendering preserved inputs or restoring prior files; no atomic last-good publication mechanism exists in the demo. Intake records are Easy to reverse; published recipe/API/cache contracts will be Costly.

## Unknowns

- Paid generation latency, queue/network contribution, total cost, rate-limit envelope and optimal concurrency were not benchmarked. Existing concurrency is already three after admission.
- Reported nutrition warm upper medians: Satori/resvg 133.4 ms, Chromium 260.4 ms; M1 Max, Node 22, 1000×1000, ten samples. Cold values 252.7/614.2 ms exclude fresh-process static imports; no p95/SLA is established. Node RSS observations share one process and exclude browser RSS.
- Solar System end-to-end redraw timings and isolated memory were not measured. Its outputs are PNG 1,274,320 bytes, SVG 6,788,502 bytes and HTML 7,547,604 bytes; asset ZIP 15,306,493 bytes. These sizes describe this artifact only.
- Fresh-checkout Solar System reproduction, save/edit/export lifecycle, robust schema/error behavior, portable multilingual fonts and remote deployment remain undelivered.

## Current-state radius, one line

One spike renderer/scene/asset/verifier path plus a local demo/generation harness; first improvements should share that runtime, cache/resume assets and validate staged outputs, with remote/UI breadth deferred behind a usable local MVP.
