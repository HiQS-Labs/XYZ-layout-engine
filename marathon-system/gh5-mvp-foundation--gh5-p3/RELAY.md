# Marathon Phase gh5-p3
STATUS: Open
NEXT: codex (Reviewer)

<!-- marathon-drive: task=MARATHON-GH5-P3-TURN builder=agy reviewer=codex round-cap=5 -->

## Phase Brief

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
Order: gh5-p3; strictly serial. External prerequisite gh5-p2 is independently Approved/attested3bf0ff4 and native gate passed four canaries26.1s (relay-system/2026-10-09/marathon-gh5-p2-163039.md). Original Phase3 identity/counter retained after interrupted HTTP503 review.
Builder: Agy. Reviewer: independent Codex. No fallback, no push/merge/issue close.

## Scope

Extend the existing Python generator, not a second provider client. Keep the installed resolve-image/HiQS caller as the only paid boundary and require its explicit configured path. Accept exact job inputs, including refinement IDs, references and parameters, without rewriting published prompts/receipts during dry-run. Imported module must not dispatch calls.
Persist a local content-addressed manifest keyed by exact prompt/model/parameters/recipe version/reference digests. Keep source images/receipts immutable; validate digest/required alpha before reuse. Resume valid completed items and dispatch only missing or explicitly replaced jobs. Atomic per-item state must record pending -> in-flight before dispatch -> complete or unknown/failed. Crash/timeout while in-flight remains unknown and requires receipt reconciliation or explicit retry; never blind paid resubmission. Concurrent same-output invocations use an exclusive local lock and refuse safely, no daemon/database queue.
Show planned call count and enforce a configurable maximum calls/observable cost budget before dispatch; if price is unavailable, report that limitation and rely on the call cap rather than inventing cost. Bound attempt count and per-call/whole-run deadlines; retry only a proven non-submitted transient failure or explicit operator retry. Preserve Sun-first admission and the historical configurable three-worker ceiling until provider limits/measurement support a change. No silent model/provider/quality switch. Capture latency, caller-reported usage/cost and unavailable stage metrics honestly.
Extend C1 by invoking this generator against a temporary deterministic caller stub: valid resume -> zero calls, one changed input -> one call, cap exceeded -> zero calls, interrupted in-flight -> no automatic second call, corrupt output -> explicit report/replacement, concurrent manifest ownership -> safe refusal. No live paid calls or secrets in tests. Batch visual acceptance remains a human gate; preserve reference/edit lineage. Run pnpm test; record measured stub behavior as recovery evidence, never provider speed evidence.

## Boundaries and proof

Use ponytail: stdlib/platform/pinned deps first, minimal shared modules, no wrappers/frameworks/queue/provider client/CI/new test blocks. You are not alone in the codebase: preserve predecessor/other-agent edits, never revert unrelated work. Follow ROUTER/AGENTS startup. Read the exact phase in the canonical plan and source recon before editing. Write ONLY the YAML artifact paths and the harness relay. The plan/briefs, releases.db/sql, test-budget.json, committed spike output and originals are read-only. Delete copied runtime only in Phase 2 after replacement proof. Put temporary files under OS temp/ignored output; never off-allowlist scratch in the repo.

Do not execute the pre-advance `pnpm test` yourself during builder flight (installed driver contract); the driver owns that gate. Extend the existing assertions for the named failure modes and record focused non-mutating inspections or temp-only commands in tools/MVP-REPORT.md. Reviewer must check their semantics and the driver must run the full existing gate before phase.approved. No live paid calls; use a deterministic temporary caller stub for generation. No fabricated human acceptance/provider measurements. If a scope requirement cannot be delivered, emit FAIL/PARKED with evidence, do not mark it complete or quietly shrink it.

Every loop is bounded: 10 fit attempts, explicit generation/call deadlines/caps, 2 review rounds, turn cap 1500s. Easy rollback via phase revert plus last-good manifest; preserve input/provenance and unknown paid outcomes. Use the debug-mantra skill to reproduce/trace/falsify concrete failures; never use --force.

## Receipt contract

Append the required native build/review block. Final block uses literal `VERDICT: PASS`, `VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; put conversational approval in `Review outcome:`. Only independent reviewer can approve. Follow native tick handoff/terminal protocol exactly; no builder may set Approved or self-attest. Future human artwork approval remains pending.

## Existing recovery to preserve

Orchestrator repaired current owners atdc3a4d6 after source-grounded cross-model consult; see relay-system/2026-10-09/gh5-p3-repair/plan.md and consult-reconciliation.md. Four existing canaries passed32.1s before final additional missing-output/reference controls; the driver owns the final committed-source suite. Inspect and preserve the existing batch lock, atomic fail-closed manifest, immutable attempts/receipts/reference snapshots, shared PNG/Resvg inspection, caller flags/recipe identity and bounded process-group deadlines. Do not rewrite sound repairs or historical evidence. Record only needed surgical changes and reviewable findings. Original attempt1/2 failed via reviewer HTTP503, not approval; the original second attempt halted before build on Agy model-probe timeout. The operator explicitly authorized one additional native cap override under the SAME Phase3 identity on 2026-10-09; the orchestrator owns that flag, and workers must not change counters or retry controls. No provider calls.

## Current recovery acceptance and authorized restart

Independent native recovery Codex Round2 Approved/attested reviewed source f780bc4a81df2c203d570da37067db6d0b7d5340; receipt relay-system/2026-10-09/gh5-p3-recovery.codex.md. Existing four canaries passed28.6s; log relay-system/2026-10-09/gh5-p3-repair/review-round2-verification.log. Preserve these surgical fixes. Original Phase3 is at2/2; operator explicitly authorized ONE cap override, then Phase4→5, with600-second×6 observation and immediate terminal cancellation. Fresh native independent review and test gate are mandatory. No further fire if this additional attempt halts.

## Latest operator-authorized additional attempt
The prior override halted on an off-lane __pycache__ from the existing C1 deadline import probe. Exact surgical fix: Python -B for that probe. Suite4/4 in28.6s, no source bytecode. Independent Codex Approved/attested fdcea1efcdc5b96814fa394087bc119d94aa5a42; relay-system/2026-10-09/gh5-bytecode-recovery.codex.md. Original task/counter now3recordedfires. Operator explicitly answered “Authorize one additional attempt”; ONE fourthfire is authorized, thenPhases4→5 with600sec×6 monitoring. Preserve earlier receipts and fixes; do not alter counters. PYTHONDONTWRITEBYTECODE=1 is set for this native session. No worker full-suite/gate run; existing driver owns it. Fresh independent review and native gate still required; no furthernativefire if this one halts.


## Debug mantra (auto-triggered — 3 prior attempt(s) on this phase did not reach Approved)

Before trying again, read `relay-automation/DEBUG-MANTRA.md` (relative to the harness root) and follow its four-step discipline: reproduce reliably, know the fail path, question the hypothesis, treat this round as a breadcrumb for the next one.
Last recorded reason (`marathon-system/gh5-mvp-foundation--gh5-p3/ESCALATION.md`): `containment-violation (off-lane edit reverted by a turn-taker)`. Read it before re-guessing.

---

▶ TAKE YOUR TURN (agy — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): examples/2026-10-08-solar-system/generate-assets.py, examples/2026-10-08-solar-system/README.md, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md
2. Append a build block to this relay file: `### Round N · Builder · agy` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick claim MARATHON-GH5-P3-TURN --agent agy --paths "marathon-system/gh5-mvp-foundation--gh5-p3/RELAY.md,examples/2026-10-08-solar-system/generate-assets.py, examples/2026-10-08-solar-system/README.md, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md"
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick ping MARATHON-GH5-P3-TURN --agent agy
   - /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick release MARATHON-GH5-P3-TURN --agent agy --to codex
4. Edit ONLY these paths: marathon-system/gh5-mvp-foundation--gh5-p3/RELAY.md and examples/2026-10-08-solar-system/generate-assets.py, examples/2026-10-08-solar-system/README.md, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to codex — codex, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: codex (Reviewer)`

---

▶ TAKE YOUR TURN (codex — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: examples/2026-10-08-solar-system/generate-assets.py, examples/2026-10-08-solar-system/README.md, tools/spike/test/canaries.test.mjs, CHANGELOG.md, tools/MVP-REPORT.md. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · codex` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: agy (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick release MARATHON-GH5-P3-TURN --agent codex --to agy
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick done MARATHON-GH5-P3-TURN --agent codex
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation/.xyz/bin/tick
   Edit ONLY marathon-system/gh5-mvp-foundation--gh5-p3/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
5. HAND OFF EXPLICITLY (GH-268): end your turn by naming who acts next — "handing off to agy —
   agy, take your turn" when requesting changes, or "relay closed, no further turn needed" when
   approving. The beta report singled this out: the Reviewer turn did not tell the user to go back to the
   Producer, so the relay looked stalled when it was simply waiting. Do this EVERY round.

### Round 1 · Builder · agy

**Files touched:** None modified in this turn (surgical fix preserved).

**Key decisions:**
- Verified the presence of the surgical containment fix (`Python -B`) in `tools/spike/test/canaries.test.mjs` line 259.
- Confirmed that `PYTHONDONTWRITEBYTECODE=1` is configured for the session, preventing `__pycache__` leakage from other python test invocations.
- Confirmed that `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/README.md`, `CHANGELOG.md`, and `tools/MVP-REPORT.md` already contain the fully implemented and attested Phase 3 recovery code.
- No further code changes were necessary as the previous repair stands. Preserving the exact fixes and proceeding with the relay to obtain the required fresh independent review and native gate approval.
