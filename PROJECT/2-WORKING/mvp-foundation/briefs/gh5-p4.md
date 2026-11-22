---
title: "GH-5 Phase 4 — execution brief"
status: Prepared
created: 2026-10-09
updated: 2026-10-09
owner: Neochrome
goal: Execute Phase 4 of the canonical GH-5 local MVP plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-5. | Execute only after plan QA and dry-run admission. |

# GH-5 Phase 4 — Measured redraw and durable edits

Umbrella/member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5
Canonical plan: PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md, Phase 4.
Order: gh5-p4; external prerequisite original gh5-p3 native Approved/attested e4638bf1e0a9d48e2c9fb36dff25f84d9b60e77e plus gate4/4in29.8s; strictly serial. Receipt relay-system/2026-10-10/marathon-gh5-p3-032333.md.
PROPOSED, heldpendingoperatorapproval: Builder Codex; Reviewer independentAgy ONLY forPhase4. No fallback, no push/merge/issueclose. FinalWave1Codexreview remainsmandatory in a separate non-author session.

## Scope

Before optimizations, measure fresh-process and warm end-to-end nutrition and promoted Solar System/supplied-asset runs on this machine. Record sample count, Node/dependency versions, dimensions, input/asset read, transform/encoding, backend layout/raster, write/export and verification timings, isolated peak Node RSS and browser RSS if used. Minimum five fresh and ten warm samples, outside the 60-second canary suite. Keep provider timings separate. Publish before/after JSON or tables in tools/MVP-REPORT.md with commands, digest/geometry comparisons and variance; no invented speedup/p95/SLA.
Cache only derived images using source digest + dimensions/scale + transform version; validated supplied web inputs already suitable for display should be reused directly. Unchanged redraw performs zero derivative rewrites and zero paid calls; one asset/dimension change invalidates only its derivative. Verify cached digest/size/alpha before reuse. Bound cache space and clean only owned derivative entries; do not touch immutable originals or another caller's files. Avoid persistent browser/service pools unless measurements establish need and cleanup is verified.
Expose durable fixture JSON save/edit/rerender/export through the existing CLI (one schema-validated write path, atomic save, errors preserve original). JSON editing is sufficient; don't build a full canvas editor or UI framework. Unknown labels/fields fail explicitly. Text/theme/placement edits never invoke image generation.
Generate requested formats only. Provide compact offline HTML plus asset folder and an explicit self-contained HTML option; SVG with raster art is described accurately. HTML must safely escape text and URLs; compact references remain inside the exported folder, fonts are pinned and both distributions need no network. Verification/manifests remain mandatory; optional diagnostic dumps are explicit.
Extend existing C1/C4 for zero derivative writes, invalidation/tamper recovery, saved edit surviving rerender, requested-format selection and offline HTML distributions; stay within ratchet. Set an optimization acceptance target after observing baseline; if no stage improves, publish that result and omit the ineffective cache complexity. Run pnpm test and record profiling separately.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Use the debug-mantra skill to reproduce/trace/falsify concrete failures; never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.

## Mandatory containment repair for normal attempt2

Prior Phase4 attempt1 was entirely discarded by containment(exit6); NONE of its runtime changes, profiling numbers, tests or approval were accepted. Exact failing files: root fix-*.mjs / patch-*.mjs and tools/profile-warm.mjs / tools/profile-warm-pw.mjs. Read preserved first-phase4-escalation.md and first-phase4-attempt.log under relay-system/2026-10-09/gh5-phase4-recovery/. Implement from committed source; do not claim discarded draft measurements as current.

Present requirement: deliver the existing scope within exact YAMLowners, no code/test sprawl. The ONLY production profiling file is tools/profile.mjs (already declared); fold fresh/warm modes into it. EVERY temporary script, patch helper, profiling raw output and probe MUST reside under $TMPDIR or .relay-scratch/, never root or tools/. Use absolute repo paths/explicit cwd for module resolution from scratch. BEFORE releasing token, inspect filesystem names and remove only your own temporary off-lane creations if any. Do NOT run git and do NOT expand allowlist. No pnpm test, node tools/spike/test/canaries.test.mjs, or fullsuite in builderflight: the NATIVE DRIVER runs that gate after independent reviewer approval. Focused probes are permitted in scratch. Never state suitegreen untilactualdriverreceipt exists.

Keep measurements honest: five fresh/ten warm samples EACH nutrition/SolarSystem, pinnedversions/canvas, mean/variance/digests, relevantstage timings and Node/browserRSS limits. Before/after data must remain inspectable in report or its declared profiling owner; scratch disappears afterturn. Reuse suitable supplied displayassets directly; add derivativecache ONLY where measured need/improvement warrants it, with input+transform-versionidentity, validateddigest/size/alpha, boundedownership and no tamperedreuse. If cache complexity cannot improve the observed workload, omit it and saywhy. Do not silently shrink durableedit/export controls; extend existing C1/C4 assertions within4testbudget for actualnewfailures.

## Latest held result
Normal attempt2 also containmenthalt6: committed tools/spike/fixture.json modified by editprobe plus untracked.xyz-cache/ output. Entire draftdiscarded; no review/gate/nativeapproval. Originalcounter2/2, nofurtherfireauthorized. Use COPYof fixtureunderTMPDIR for EVERY editprobe andcache/profilingoutputsundertemp/existingignoredtools/output; nevermutatecommittedfixtures/goldens orcreate rootcachepath. The proposed Codexbuilder/Agyreviewer oneoverride is heldpendingoperatorapproval; proposal/receipts underrelay-system/2026-10-09/gh5-phase4-recovery/.

## Prospective role/cap exception — NOT authorization
Only ifoperatorapproves, orchestrator mayONE originalPhase4fire withCodexbuilder/Agyreviewer usingnative--force. Workersmustneveruseforce/resetcounters/re-fire. NativefreshAgyreview/attestation mustbind originaltaskMARATHON-GH5-P4-TURN, targetclone andexactreviewedcandidate; driverownspnpmtestgate. Originaltaskcounter2/2retainedbeforefire andincrementednormally; haltanyunsuccessfuloverride, noautomaticextraattempt. Phase5remainsAgybuilder/Codexreviewer, admittedONLYafterPhase4freshgate; separatefinalCodexQAmandatory.

## Current gate recovery — 2026-10-09

The prospective ONE Codex/Agy override above was explicitly authorized and consumed as original attempt 3. Containment and Agy review passed; the native gate failed because C1 assumed HTML was artifact[0], now a packaged font. Existing C1 selects render.html by name and retains presence/MIME/doctype checks; all four canaries pass in 36.8s, including actual offline browser loading. Independent recovery QA is pending. No further original fire is authorized. Preserve native task/counter/history; do not advance Phase 5 before a fresh original phase approval and gate.
