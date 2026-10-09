---
title: "GH-5 Phase 5 — execution brief"
status: Prepared
created: 2026-10-09
updated: 2026-10-09
owner: Neochrome
goal: Execute Phase 5 of the canonical GH-5 local MVP plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-5. | Execute only after plan QA and dry-run admission. |

# GH-5 Phase 5 — Integration and handoff

Umbrella/member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
Canonical plan: PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md, Phase 5.
Order: gh5-p5, depends on gh5-p4; strictly serial.
Builder: Agy. Reviewer: independent Codex. No fallback, no push/merge/issue close.

## Scope

Document one pinned install/render/edit/export workflow for nutrition and Solar System on a fresh checkout without originals, paid API calls or copied runtime. Record schema/capability/font/image limits, PNG vs SVG-with-raster, durable JSON edits vs transient preview edits, compact/self-contained offline exports, expected generation calls/resume/unknown recovery and exact caller prerequisite. Gather pinned dependency/font notices; don't package/distribute Chromium before its terms/notices are verified.
Record measured limits (input bytes, pixel/render area, fit/deadline/concurrency/cache bounds), unsupported scripts and stage diagnostics/correlation IDs. A local worker/subprocess for hard interruption is conditional on measured need; an event-loop timer must never be presented as a hard interrupt of synchronous rasterization. If a required hard limit is not enforceable, document/reject the unsupported workload, rather than claim compliance. Keep remote HTTP/MCP, tenant isolation/SSRF/private caches, durable service queues and themes/adapters/full editor in the Later queue; do not ship half-services.
Run pnpm test, fresh offline documented workflows and relevant PDDA checks; publish receipts/report and update PRD with delivered local observations only. No unearned green boxes, human approval, issue closure or production readiness. Obtain independent Codex post-build review via the native driver and adjudicate peer findings. Prepare a ready PR only after the wave receipt gate is satisfied; do not push/merge/close from builder turns. Report nutrition and Solar System visual acceptance as pending human decisions; #5 remains open for Later requirements.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Use the debug-mantra skill to reproduce/trace/falsify concrete failures; never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.
