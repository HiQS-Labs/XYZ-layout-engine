---
title: "GH-5 Phase 1 — execution brief"
status: Prepared
created: 2026-10-09
updated: 2026-10-09
owner: Neochrome
goal: Execute Phase 1 of the canonical GH-5 local MVP plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-5. | Execute only after plan QA and dry-run admission. |

# GH-5 Phase 1 — Shared local operation

Umbrella/member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
Canonical plan: PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md, Phase 1.
Order: gh5-p1, depends on nothing; strictly serial.
Builder: Agy. Reviewer: independent Codex. No fallback, no push/merge/issue close.

## Scope

Extract reusable backend operations with a direct-execution guard; importing them must not run the experiment. Keep the legacy experiment's bytes/geometry and product-hero smoke unchanged. Put trusted nutrition composition behind one versioned recipe. Keep plain ESM and existing pinned dependencies; no plugin registry, monorepo or provider client.
Normalize the local library/CLI request/result against PRD semantics in tools/request.mjs. Reject unknown fields, unsupported formats/backend/fallback, invalid dimensions/scale and missing input with field-level errors. Ship only an honest local supported subset; document unsupported remote fields rather than accepting them silently. Result includes normalized input, recipe/backend versions, validation report, provenance and output digests.
Use fileURLToPath and realpath/root containment for inputs/output, including symlink escape rejection; reject remote/file references in supplied SVG, scripts/foreignObject and nested SVG+embedded raster on the supported Satori path unless explicitly normalized with proven visibility. Bound encoded bytes, decoded dimensions/pixels and total render area before decoder/layout allocation. Use existing resvg for admitted SVG/raster inspection, not a new parser dependency; never claim a regex blacklist alone makes arbitrary SVG safe. Limit to trusted bundled SVG and validated direct PNG for v1 if safe general SVG admission is uncertain.
Default to lazy Satori/resvg only. Load/launch Chromium solely for explicit comparison or recipe-declared capability; preserve finally cleanup. Stage one run under a unique same-filesystem directory; validate all requested artifacts before atomic last-good manifest publication. Do not replace a last-good deliverable on failure; preserve bounded diagnostic state and remove orphan staging files safely. Existing spike evidence is read-only.
Extend C1 within its existing test block: import no-side-effect assertion, CLI in a space-containing temp path, invalid request/escaping symlink and injected failed publication preserving prior digests. C2 retains legacy geometry/digests. Run pnpm test. Record actual commands/results in tools/MVP-REPORT.md.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Diagnose concrete failures, never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.
