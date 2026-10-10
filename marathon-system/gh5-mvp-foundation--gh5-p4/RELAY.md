# Marathon Phase gh5-p4
STATUS: Approved
NEXT: done

<!-- marathon-drive: task=MARATHON-GH5-P4-TURN-2 builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

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
Cache only derived images using source digest + dimensions/scale + transform version; validated supplied web inputs already suitable for display should be reused directly. Unchanged redraw performs zero derivative rewrites and zero paid calls; one asset/dimension change invalidates only its derivative. Verify cached digest/size/alpha before reuse. Bound cache space and clean only owned derivative entries; do not touch immutable originals or another caller's files. Avoid persistent browser/service pools unless measurements establish need and cleanup is verified.  [Unverified — no citation]
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


## Debug mantra (auto-triggered — 3 prior attempt(s) on this phase did not reach Approved)

Before trying again, read `relay-automation/DEBUG-MANTRA.md` (relative to the harness root) and follow its four-step discipline: reproduce reliably, know the fail path, question the hypothesis, treat this round as a breadcrumb for the next one.
Last recorded reason (`marathon-system/gh5-mvp-foundation--gh5-p4/ESCALATION.md`): `pre-advance-failed`. Read it before re-guessing.

---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): tools/render.mjs, tools/request.mjs, tools/recipes/nutrition.mjs, tools/recipes/solar-system.mjs, tools/profile.mjs, package.json, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick claim MARATHON-GH5-P4-TURN-2 --agent codex --paths "marathon-system/gh5-mvp-foundation--gh5-p4/RELAY.md,tools/render.mjs, tools/request.mjs, tools/recipes/nutrition.mjs, tools/recipes/solar-system.mjs, tools/profile.mjs, package.json, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick ping MARATHON-GH5-P4-TURN-2 --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick release MARATHON-GH5-P4-TURN-2 --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh5-mvp-foundation--gh5-p4/RELAY.md and tools/render.mjs, tools/request.mjs, tools/recipes/nutrition.mjs, tools/recipes/solar-system.mjs, tools/profile.mjs, package.json, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: tools/render.mjs, tools/request.mjs, tools/recipes/nutrition.mjs, tools/recipes/solar-system.mjs, tools/profile.mjs, package.json, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick release MARATHON-GH5-P4-TURN-2 --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick done MARATHON-GH5-P4-TURN-2 --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick
   Edit ONLY marathon-system/gh5-mvp-foundation--gh5-p4/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
4b. TO VERIFY A FINDING, WRITE PROBE FILES OUTSIDE THE REPO — under $TMPDIR, never inside the
   working tree. Creating even one scratch file in the repo is an off-lane write: containment
   reverts it and FAILS YOUR WHOLE TURN, discarding the review you just did (GH-441). Observed
   2026-08-08: a reviewer found a real latent crash, wrote two probe files in-tree to demonstrate
   it, and lost the turn for doing so — the finding survived only because RELAY.md happens to be
   on your allowlist. `cp` what you need to "$TMPDIR/probe.$$/" and work there instead. Verifying
   is wanted; verifying in-tree is what costs you the turn.
4c. A finding that asks for a behaviour change is a generalization unless you can paste the concrete
   input — a row, a value, a `file:line` — that fails under the current code (GH-681). Every
   `[Blocker]` or `[Should]` requesting a behaviour change MUST carry `Observed input:`,
   `Affected scope:` and `Falsifier:` lines; a `[Blocker]` must cite an observed failure. The Builder
   may disposition a request lacking these as `Declined — unproven generalization`.
5. HAND OFF EXPLICITLY (GH-268): end your turn by naming who acts next — "handing off to codex —
   codex, take your turn" when requesting changes, or "relay closed, no further turn needed" when
   approving. The beta report singled this out: the Reviewer turn did not tell the user to go back to the
   Producer, so the relay looked stalled when it was simply waiting. Do this EVERY round.


### Round 1 · Builder · codex

VERDICT: PASS
Basis: Current requested HTML artifact is present with text/html MIME and doctype; focused copy-only nutrition/Solar edit/export/rerender probes and manifest verification pass, original fixtures remain byte-identical, all six scoped module syntax checks pass, and both single-sample SVG profiler smoke commands exit 0. This is focused builder verification, not independent approval or a native full-gate receipt.
Review outcome: Ready for independent Agy review of the complete artifact files and harness-owned gate; Phase 4 remains Open.

Files touched: tools/MVP-REPORT.md, CHANGELOG.md and this relay. Runtime, recipes, profiling implementation, package and repaired C1/C4 were already on disk and are preserved. Existing retained baseline/after measurements are not regenerated or relabelled as this turn's observations.

Bet / reversibility: Easy — the HTML recovery fixes C1's positional assumption; dependency-first artifact order is valid. Root cause: bundled fonts precede render.html; Fix site: existing C1 exact-name selection, presence/MIME/doctype checks; Why not upstream/downstream: no runtime artifact-order contract requires the page to come first. Red control observed artifact[0].mime=font/ttf; named page check passed.

Commands/evidence: node .relay-scratch/turn2-probe.mjs (PASS); node --check for tools/render.mjs, tools/request.mjs, both recipes, tools/profile.mjs and existing canaries (all exit0); node tools/profile.mjs sample nutrition svg .relay-scratch and equivalent solar-system (both exit0). Probe outputs/copies/exports are exclusively under .relay-scratch. Report retains exact edited SVG digests and focused outcomes. No git, fullsuite, canaries invocation, browser launch or paid generation. The historical recovery log's 4/4 in36.8s was read, not rerun and not claimed as this rebuild's native gate.

Read startup/router/principles/AGENTS, canonical Phase4 plan, exact escalation, first discarded containment log and current HTML repair authorization/repro/verification. README and releases CLI are absent here; no graph MCP tools are callable, so scoped source inspection is the fallback. No clone cleanup is appropriate while work/review/native gate remain unfinished. Relay content is preserved except the explicitly required NEXT control-line handoff; this block is appended.

Pending: independent Agy whole-file review, fresh harness gate/attestation, later Phase5/finalWave1 checks and human artwork/provider acceptance. Do not advance from this builder receipt alone.

handing off to agy — agy, take your turn.

### Round 1 · Reviewer · agy

swept file: yes
**Verdict:** Approved
Basis: Whole-file review of all target files confirms that the recovery implementation satisfies Phase 4's strict bounds. The `canaries.test.mjs` test now checks for the HTML artifact correctly using exact-name selection instead of the positional assumption that was failing. The builder respected containment and scratch discipline, introducing no new defects.

handing off to codex — relay closed, no further turn needed.

### Attestation · relay-drive — 2026-10-10T05:52:43Z
task: MARATHON-GH5-P4-TURN-2
reviewer: agy
status: Approved
reviewed-head: 49d25b92993e1cd39c856ba9c8c4f4be4199a38d
added-range: 18352+497
added-sha256: edce88085d92c39c5d41fbc3fea9cb0b4cc27e8a5270a8c222f8bc99a39c4925
