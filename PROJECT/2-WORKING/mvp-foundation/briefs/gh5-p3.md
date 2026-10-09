---
title: "GH-5 Phase 3 — execution brief"
status: Prepared
created: 2026-10-09
updated: 2026-10-09
owner: Neochrome
goal: Execute Phase 3 of the canonical GH-5 local MVP plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-5. | Execute only after plan QA and dry-run admission. |

# GH-5 Phase 3 — Resumable optional generation

Umbrella/member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
Canonical plan: PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md, Phase 3.
Order: gh5-p3, depends on gh5-p2; strictly serial.
Builder: Agy. Reviewer: independent Codex. No fallback, no push/merge/issue close.

## Scope

Extend the existing Python generator, not a second provider client. Keep the installed resolve-image/HiQS caller as the only paid boundary and require its explicit configured path. Accept exact job inputs, including refinement IDs, references and parameters, without rewriting published prompts/receipts during dry-run. Imported module must not dispatch calls.
Persist a local content-addressed manifest keyed by exact prompt/model/parameters/recipe version/reference digests. Keep source images/receipts immutable; validate digest/required alpha before reuse. Resume valid completed items and dispatch only missing or explicitly replaced jobs. Atomic per-item state must record pending -> in-flight before dispatch -> complete or unknown/failed. Crash/timeout while in-flight remains unknown and requires receipt reconciliation or explicit retry; never blind paid resubmission. Concurrent same-output invocations use an exclusive local lock and refuse safely, no daemon/database queue.
Show planned call count and enforce a configurable maximum calls/observable cost budget before dispatch; if price is unavailable, report that limitation and rely on the call cap rather than inventing cost. Bound attempt count and per-call/whole-run deadlines; retry only a proven non-submitted transient failure or explicit operator retry. Preserve Sun-first admission and the historical configurable three-worker ceiling until provider limits/measurement support a change. No silent model/provider/quality switch. Capture latency, caller-reported usage/cost and unavailable stage metrics honestly.
Extend C1 by invoking this generator against a temporary deterministic caller stub: valid resume -> zero calls, one changed input -> one call, cap exceeded -> zero calls, interrupted in-flight -> no automatic second call, corrupt output -> explicit report/replacement, concurrent manifest ownership -> safe refusal. No live paid calls or secrets in tests. Batch visual acceptance remains a human gate; preserve reference/edit lineage. Run pnpm test; record measured stub behavior as recovery evidence, never provider speed evidence.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Diagnose concrete failures, never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.
