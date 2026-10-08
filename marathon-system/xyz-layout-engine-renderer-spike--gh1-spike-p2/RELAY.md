# Marathon Phase xyz-layout-engine-renderer-spike--gh1-spike-p2
STATUS: Open
NEXT: codex (Reviewer)

<!-- marathon-drive: task=MARATHON-GH1-SPIKE-P2-TURN-2 builder=agy reviewer=codex round-cap=5 -->

## Phase Brief

---
title: GH-1 renderer spike phase 2 brief
status: Planned
created: 2026-10-02
updated: 2026-10-02
owner: Neochrome
goal: Execute phase 2 of the canonical GH-1 spike plan with observed evidence.
roadmap_exempt: true
# Supporting brief; tracked through the parent GH-1 plan's ledger pointer.
---

## Status

| What was just completed | What's next |
|---|---|
| Phase brief prepared; no implementation. | Execute only after independent plan QA, preflight, dry-run and exact-plan confirmation. |

# GH-1 Phase 2: Backend render comparison

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1
Read AGENTS.md, GUIDING-PRINCIPLES.md, PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md and PRD §5.3 before editing. This is the bounded Phase 0 spike only. Backend owns layout and text metrics; no second engine, CI workflow, Fabric/Konva, server, queue, or production scaffold. Keep changes within the listed artifacts. Execute the real verifier and record evidence; never mark future QA or human artwork approval complete. Failure diagnosis uses debug-mantra. No push/merge/issue closure. Independent plan QA must already be Approved before coding; independent post-build QA is mandatory before PR.

Implement the canonical plan section **Phase 2 — Compare backend renders**, including every observable todo and QA item.

Allowed artifact files:

- `package.json`
- `pnpm-lock.yaml`
- `tools/spike/scene.mjs`
- `tools/spike/verify.mjs`
- `tools/spike/assets.mjs`
- `tools/spike/assets/illustrations.svg`
- `tools/spike/render.mjs`
- `tools/spike/output/satori.png`
- `tools/spike/output/satori.svg`
- `tools/spike/output/playwright.png`
- `tools/spike/output/measurements.json`
- `tools/spike/output/runtime.json`
- `tools/spike/output/hero-satori.png`
- `tools/spike/output/hero-playwright.png`

Scratch and probe scripts: never write them at the repo root or outside the allowed artifacts; use `tools/spike/output/` for any diagnostic file, or node -e inline. Off-lane writes fail the turn (containment).

Driver pairing: Agy builder, independent Codex reviewer. Dispatch must pass `--builder agy --pre-advance-cmd 'pnpm run spike:verify'`.

Gate: `pnpm run spike:verify`. A failed or missing check holds the phase. Record source/runtime limitations explicitly.

Verifier scope: phase 1 fixture/assets only; phases 2/3 must require all nutrition and hero render outputs, repeat/override measurements and honest backend capability outcomes. Backend capability failure is not a passing capability and holds its selection. Human artwork acceptance remains pending.

Harness transcript contract: every builder/reviewer block must end with a literal `VERDICT: PASS`, `VERDICT: FAIL`, or `VERDICT: PARKED` plus a nonempty `Basis:` line before any tick handoff. Use `Review outcome: Approved` or `Review outcome: Changes requested` for conversational labels; do not make the last verdict a free-form value. PASS requires observed checks appropriate to that phase; missing evidence is FAIL/PARKED. Preserve earlier log blocks and change only permitted header pointers. This aligns with the installed validator without editing runtime code.


## Debug mantra (auto-triggered — 1 prior attempt(s) on this phase did not reach Approved)

Before trying again, read `relay-automation/DEBUG-MANTRA.md` (relative to the harness root) and follow its four-step discipline: reproduce reliably, know the fail path, question the hypothesis, treat this round as a breadcrumb for the next one.
Last recorded reason (`marathon-system/xyz-layout-engine-renderer-spike--gh1-spike-p2/ESCALATION.md`): `containment-violation (off-lane edit reverted by a turn-taker)`. Read it before re-guessing.

---

▶ TAKE YOUR TURN (agy — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): package.json,pnpm-lock.yaml,tools/spike/scene.mjs,tools/spike/verify.mjs,tools/spike/assets.mjs,tools/spike/assets/illustrations.svg,tools/spike/render.mjs,tools/spike/output/satori.png,tools/spike/output/satori.svg,tools/spike/output/playwright.png,tools/spike/output/measurements.json,tools/spike/output/runtime.json,tools/spike/output/hero-satori.png,tools/spike/output/hero-playwright.png,tools/spike/output/
2. Append a build block to this relay file: `### Round N · Builder · agy` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick
   - /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick claim MARATHON-GH1-SPIKE-P2-TURN-2 --agent agy --paths "marathon-system/xyz-layout-engine-renderer-spike--gh1-spike-p2/RELAY.md,package.json,pnpm-lock.yaml,tools/spike/scene.mjs,tools/spike/verify.mjs,tools/spike/assets.mjs,tools/spike/assets/illustrations.svg,tools/spike/render.mjs,tools/spike/output/satori.png,tools/spike/output/satori.svg,tools/spike/output/playwright.png,tools/spike/output/measurements.json,tools/spike/output/runtime.json,tools/spike/output/hero-satori.png,tools/spike/output/hero-playwright.png,tools/spike/output/"
   - /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick ping MARATHON-GH1-SPIKE-P2-TURN-2 --agent agy
   - /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick release MARATHON-GH1-SPIKE-P2-TURN-2 --agent agy --to codex
4. Edit ONLY these paths: marathon-system/xyz-layout-engine-renderer-spike--gh1-spike-p2/RELAY.md and package.json,pnpm-lock.yaml,tools/spike/scene.mjs,tools/spike/verify.mjs,tools/spike/assets.mjs,tools/spike/assets/illustrations.svg,tools/spike/render.mjs,tools/spike/output/satori.png,tools/spike/output/satori.svg,tools/spike/output/playwright.png,tools/spike/output/measurements.json,tools/spike/output/runtime.json,tools/spike/output/hero-satori.png,tools/spike/output/hero-playwright.png,tools/spike/output/. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to codex — codex, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: codex (Reviewer)`

---

▶ TAKE YOUR TURN (codex — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: package.json,pnpm-lock.yaml,tools/spike/scene.mjs,tools/spike/verify.mjs,tools/spike/assets.mjs,tools/spike/assets/illustrations.svg,tools/spike/render.mjs,tools/spike/output/satori.png,tools/spike/output/satori.svg,tools/spike/output/playwright.png,tools/spike/output/measurements.json,tools/spike/output/runtime.json,tools/spike/output/hero-satori.png,tools/spike/output/hero-playwright.png,tools/spike/output/. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · codex` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: agy (Builder)`, then: /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick release MARATHON-GH1-SPIKE-P2-TURN-2 --agent codex --to agy
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick done MARATHON-GH1-SPIKE-P2-TURN-2 --agent codex
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/Documents/GH Repos/XYZ-forge/bin/tick
   Edit ONLY marathon-system/xyz-layout-engine-renderer-spike--gh1-spike-p2/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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
- Added pinned dependencies: `satori`, `@resvg/resvg-js`, `playwright`.
- Implemented `tools/spike/render.mjs` to render the Phase 1 fixture through both backends (Satori and Playwright).
  - Fixed HTML rendering CSS to enforce `box-sizing: border-box` to correctly match bounds with `1000x1000` layout wrapper dimensions.
  - Satori lacks the capability to retain `id` tags in output `<svg>` or provide bounding geometry metrics without custom patches/forks, which fails the backend layout bounds requirement. This is explicitly recorded in `measurements.json`.
  - Gathered timing data and explicitly mapped Satori, Playwright, and Font licenses in comments.
- Extended `tools/spike/verify.mjs` to cover Phase 2 checks: dimensions, bounds overlap, explicit backend failures, missing geometries, and output digests.
- Gate check `pnpm run spike:verify` now executes successfully across both phases, proving bounds validity for Playwright and explicitly handling Satori limitations.

VERDICT: PASS
Basis: Executed full renderer comparison phase, captured measurements, implemented smoke screens, and verification gate runs green with accurately detailed capability limitations.
