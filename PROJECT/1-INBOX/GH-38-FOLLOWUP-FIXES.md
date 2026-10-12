---
gh_issue: 38
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/38
title: "Post-merge follow-up fixes: catalog recovery and shared PNG loader"
status: "Captured; plan QA pending"
created: 2026-10-12
updated: 2026-10-12
owner: Codex
doc_type: feedback
complexity: 2
risk: 2
effort: 2
phases: 3
---

# GH-38 — Follow-up fixes

## Status

| What was just completed | What's next |
|---|---|
| Post-merge audit reproduced the catalog/log partial commit; user authorized both fixes and merging. Fresh full clone at ab94133. | Plan QA, implement, verify, final QA, PR and merge on main. |

## Scope and bet

Fix the two review findings on issue38 only. Existing manual artwork approval, Forge main-branch reconciliation and legacy governance warnings remain tracked in the umbrella issue and are not this implementation's acceptance gates. Reuse the previous current-state recon, saved beside this plan. Graph inventory all82 has no project index; direct-source fallback used.

The local CLI must return a write error with catalog/log consistent and permit retry. Existing atomicDump is the canonical staged/fsynced rename owner. Replace direct append with a full atomic log write before the catalog commit; snapshot exact old log bytes (including absence), and restore them if catalog commit fails. Fail loudly if rollback itself fails. SQLite COMMIT follows durable writes. Keep the exclusive CLI lock. No journal, schema/table, new persistence owner, renderer recovery patch, or power-loss transaction guarantee. Cost accepted: rewrite the small local log and one compensating write on a failed catalog commit. Existing verify diagnoses corrupt prior state; this fix prevents new ordinary-I/O partial commits, not recovery of already damaged catalogs.

Extract the already duplicated PNG loader into tools/request.mjs beside readBounded/within/LIMITS. Three trusted arguments: example URL, provenance filename, asset IDs. It retains realpath containment, per-asset byte and aggregate pixel/byte budgets, inspectPng from the existing asset owner (lazy import avoids its existing import of request), expected SHA256 checks and data URLs. Domain IDs/provenance choice stay in recipes. Keep tools/spike/assets.mjs byte-identical because Nutrition pins it. Solar and Manga modules delegate to the helper and publish1.0.1 via catalog CLI. Preserve all old published1.0.0 records/GIDs, fixtures, artwork, fonts and design pins. No generic loader registry/configuration framework.

Alternative: rollback the old direct append after failure risks partially appended bytes; full atomic log replacement avoids that. A filesystem journal would solve stronger process/power-loss contracts but adds an unrequested source of state. A helper in pinned spike/assets would also require unrelated Nutrition version churn. Rollback: revert this PR's runtime and new current module versions; catalog history remains immutable and is not manually rewritten. Reversibility: Easy source edits; recipe publications are durable history.

## Ordered implementation and verification

1. Extend existing catalog writer as described; extend C4 only with injected log rename failure and catalog rename failure, asserting unchanged dump/log, lock release and successful retry. Cover initially missing log as a manual control. Existing C4 has no write-error recovery coverage. No new test() block, suite, dependency, workflow or budget change. Witness the recovery assertion fail on the old writer (recorded audit repro) and under disabled compensation.
2. Extract shared bounded/digest PNG reader, delegate Solar and Manga, bump both to1.0.1 and publish through existing CLI. Record readback retaining every old row and design pin. Negative tamper/namespace checks and guard-removal red control prove security is preserved.
3. Run unchanged pnpm test (4 tests,1file,60seconds,0workflows); catalog verify/export, RELEASES check and PDDA. Compare35existing formats against ab94133 (Nutrition, Solar, three Manga fixtures; Satori4formats/PW3formats), including compact assets and fit steps. Recheck recursive output/fonts through existing C1. Final Codex relay QA on actual committed diff/evidence, normal push/PR then merge-cleanup (explicitly authorized), verify main and preserve all primary example outputs. No paid provider calls or speculative stress/fuzz suite.

## Acceptance

- [ ] Failed log write leaves no new immutable design, preserves exact old log/dump, releases lock and permits retry.
- [ ] Failed catalog commit restores exact log bytes/absence; rollback failure is explicit, not silently swallowed.
- [ ] Both recipes reuse one bounded/digest-checked PNG reader with domain inputs retained in recipe modules.
- [ ] New1.0.1 pins are published, old recipe identities/versions/files/output records and all design pins are retained.
- [ ]35output-format digests/assets/fit steps match baseline; existing canaries and canonical checks pass.
- [ ] Plan and final native Codex relay QA Approved; PR merged and main synced; original GH36 clone remains preserved.

## Rating rationale

Rated80/85/50/65: priority reflects user immediate repair request and a failed write leaving an immutable unlogged design; severity85 for catalog inconsistency and blocked safe retry, neutral appeal50 (no operator score), cheapness65 for bounded existing-writer/loader edits with version publication. One distinct audit injection reproduced the failure; no recurring incidents demonstrated. Recent14day history inspected through catalog git log and issue38; preceding-window production incident trend remains unknown. This is one grouped two-fix task under the existing issue, not new duplicate intake.
