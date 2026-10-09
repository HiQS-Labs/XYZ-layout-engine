---
title: "GH-5 Phase 2 — execution brief"
status: Prepared
created: 2026-10-09
updated: 2026-10-09
owner: Neochrome
goal: Execute Phase 2 of the canonical GH-5 local MVP plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-5. | Execute only after plan QA and dry-run admission. |

# GH-5 Phase 2 — Offline Solar System and readable fitting

Umbrella/member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
Canonical plan: PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md, Phase 2.
Order: gh5-p2, depends on gh5-p1; strictly serial.
Builder: Agy. Reviewer: independent Codex. No fallback, no push/merge/issue close.

## Scope

Promote the published Solar System scene/fixture as a trusted recipe sharing the runtime. Read the eleven committed assets/web PNGs, verify the committed verification.json display digests (including saturn-clean and asteroid-belt-diagram), and preserve their generation/edit lineage. Do not call a provider or pretend missing full-size originals are present. Admit a bounded export resolution compatible with display inputs; park higher-resolution originals if unavailable.
Make the published demo a thin shared-operation entry point and remove its copied runtime only after the offline replacement renders. Share pinned fonts from the root runtime; do not duplicate them. Keep the Sun, each of eight planets, belt and Milky Way as individual images, separate editable text and backend-owned bounds. Preserve schematic/not-to-scale disclosure and original fixture/artifacts as provenance.
Add bounded fitting (maximum ten attempts), readable minimum font size, conservative line-height policy, missing glyph/text detection and explicit non-fit response. Do not implement independent glyph metrics or arbitrary line breaking. Reject unsupported scripts using the pinned font capability evidence, without host-font fallback. Exercise real shrink and exhaustion, not only successful iteration-zero cases.
Extend C1/C2 or the existing verifier for actual shrink/non-fit and image visibility. Visibility evidence must compare painted pixels or render a focused admitted image canary; a node rectangle or alpha metadata alone cannot pass a missing illustration. Keep one file/four tests/60 seconds. Run pnpm test and fresh Solar System CLI offline. Record agent visual evidence separately from pending human migrated-artwork acceptance.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Diagnose concrete failures, never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.
