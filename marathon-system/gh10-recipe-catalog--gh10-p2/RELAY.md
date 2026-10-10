# Marathon Phase gh10-p2
STATUS: Open
NEXT: agy (Reviewer)

<!-- marathon-drive: task=MARATHON-GH10-P2-TURN builder=codex reviewer=agy round-cap=5 -->

## Phase Brief

---
title: "GH-10 Phase 2 — execution brief"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Execute Phase 2 (seed, verify gate and render identity) of the canonical GH-10 recipe catalog plan.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Prepared a bounded phase brief linked to GH-10 under umbrella GH-19. | Execute only after gh10-p1 is approved and its gate passed. |

# GH-10 Phase 2 — Seed, verify gate and render identity

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19. Member: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10.
Canonical plan: `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, Phase 2. Builder: Codex. Reviewer: independent Agy. Strictly serial after gh10-p1.

## Goal

Register the two existing recipes, gate committed drift in C3, and add catalog identity to render
receipts without changing any artifact.

## Allowed files

`tools/catalog.sql`, `tools/render.mjs` (receipt block only), `tools/spike/test/canaries.test.mjs`
(extend C1 and C3 only).

## Scope

- Use the CLI (not hand edits) to `add` + `publish` nutrition as `RCP-0001` 1.0.0 with output
  `default` 1000x1000 and solar-system as `RCP-0002` 1.0.0 with output `default` 2400x1700, using the
  Phase 0 declared file sets. Commit the resulting dump.
- `tools/render.mjs`: lazily import the catalog and add `catalog: { serial, slug, version, contentSha256, verified }`
  to the receipt at `tools/render.mjs:349`; unpublished or drifted content records `verified: false`
  with a reason and does not block rendering. No change to artifacts, fitting, admission or publication.
- C3: also run `node tools/catalog.mjs verify` on the committed tree. C1: assert the nutrition receipt
  carries `catalog.serial === 'RCP-0001'` and `verified === true`.

## Acceptance (each can fail; red control in brackets)

- P2-A1 `node tools/catalog.mjs verify` exits 0 and lists `RCP-0001 nutrition@1.0.0` and `RCP-0002 solar-system@1.0.0`. [Red: in a `$TMPDIR` copy, one flipped byte in `tools/recipes/nutrition.mjs` exits 1 naming that path; deleting `examples/2026-10-08-solar-system/verification.json` exits 1 `missing`.]
- P2-A2 From a `$TMPDIR` copy (tools/, examples/, package.json, node_modules symlink), `node tools/render.mjs tools/spike/fixture.json --out out` receipt shows `verified: true`. [Red: same with a modified recipe file shows `verified: false`.]
- P2-A3 PNG/SVG digests from P2-A2 equal the base-ref digests for the same command. [Red: a `--set sections.header.headline=X` render differs.]
- P2-A4 `git diff --exit-code <base> -- tools/spike/output tools/recipes` exits 0. [Red: any golden or recipe edit exits 1.]

## Gate

Driver runs `pnpm test` after independent review: exit 0, 4/4, and the output must contain
`C2 digests:` with `byte-identical` (a `skipped` line fails this phase). Builder runs only the P2
checks from `$TMPDIR` copies and records command, exit code and key output in the relay.

## Boundaries and proof

No recipe, goldens, `tools/request.mjs`, plan, briefs, ledger, budget or package edits. Never pass an
`--out` inside the repo; `outputRoot` (`tools/render.mjs:381-394`) only accepts paths under the current
directory, so run renders from the scratch copy. Do not run `pnpm test`. No paid calls or network.
Serials are Costly once referenced: assign exactly RCP-0001/RCP-0002 and flag them for operator
approval in the relay. Emit `VERDICT: FAIL` or `PARKED` with evidence if blocked. Never `--force`.

**No push, no PR, no merge, no issue close.**

## Receipt contract

Append the required native build/review block. The final block uses literal `VERDICT: PASS`,
`VERDICT: FAIL` or `VERDICT: PARKED` and a nonempty `Basis:`; conversational approval goes in
`Review outcome:`. Only the independent reviewer approves; no builder self-attestation.


---

▶ TAKE YOUR TURN (codex — BUILDER role)

You are the BUILDER for this phase. Read the phase brief above and implement it.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Implement the brief by creating/editing the artifact file(s): tools/catalog.sql, tools/render.mjs, tools/spike/test/canaries.test.mjs
2. Append a build block to this relay file: `### Round N · Builder · codex` summarizing what you did (files touched, key decisions).
3. Use this exact tick binary (run it from any directory): /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick claim MARATHON-GH10-P2-TURN --agent codex --paths "marathon-system/gh10-recipe-catalog--gh10-p2/RELAY.md,tools/catalog.sql, tools/render.mjs, tools/spike/test/canaries.test.mjs"
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick ping MARATHON-GH10-P2-TURN --agent codex
   - /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P2-TURN --agent codex --to agy
4. Edit ONLY these paths: marathon-system/gh10-recipe-catalog--gh10-p2/RELAY.md and tools/catalog.sql, tools/render.mjs, tools/spike/test/canaries.test.mjs. Do NOT run git. Do NOT touch any other file — the harness commits for you.
5. HAND OFF EXPLICITLY (GH-268): after releasing the token, end your turn by naming who acts next —
   "handing off to agy — agy, take your turn." A turn that ends without that line
   leaves a human guessing whether the relay is waiting on them or has stalled. Do this EVERY round,
   not just the first. ALSO, you MUST update the `NEXT:` line at the top of this file to exactly: `NEXT: agy (Reviewer)`

---

▶ TAKE YOUR TURN (agy — REVIEWER role)

You are the REVIEWER for this phase. Read the latest builder block above AND review the artifact file(s) on disk: tools/catalog.sql, tools/render.mjs, tools/spike/test/canaries.test.mjs. REVIEW THE WHOLE FILE, NOT JUST THE DIFF (GH-268): a beta test had this loop reach 'Approved' in two rounds while an independent audit of the same branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN SCOPE; say so explicitly if you find none. DECLARE IT: your review block MUST contain a literal 'swept file: yes' or 'swept file: no' line — without it a reviewer that skipped the sweep is indistinguishable in the transcript from one that did it and found nothing, which is exactly how those 20 issues stayed invisible.
APPEND-ONLY FILE (GH-529 attestation): add your block at the END and never delete, reorder, or rewrite any existing content — the terminal attestation refuses the approval if any byte above your block changed, even a tidy-up.
1. Append a review block: `### Round N · Reviewer · agy` followed by your assessment.
2. If changes needed: add `**Verdict:** Changes requested`, update the `NEXT:` line to exactly `NEXT: codex (Builder)`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick release MARATHON-GH10-P2-TURN --agent agy --to codex
3. If satisfied: add `**Verdict:** Approved`, set `STATUS: Approved`, then: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick done MARATHON-GH10-P2-TURN --agent agy
4. Use this exact tick binary (run it from any directory) for all token operations: /Users/noelsaw/marathon-clones/marathon-gh-19-recipe-catalog/.xyz/bin/tick
   Edit ONLY marathon-system/gh10-recipe-catalog--gh10-p2/RELAY.md (your review block + STATUS). Do NOT edit the artifact yourself — request changes instead. Do NOT run git.
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

Implemented the three Phase 2 artifacts; independent review and the driver gate remain pending.
Files touched: tools/catalog.sql, tools/render.mjs (receipt block only),
tools/spike/test/canaries.test.mjs (C1/C3 only), plus this relay's required NEXT metadata and append.

Decisions:
- Seeded via CLI in `.relay-scratch/p2-seed`, then copied the resulting canonical dump:
  `node tools/catalog.mjs add nutrition --title Nutrition`; `publish nutrition 1.0.0`;
  `add solar-system --title "Solar System"`; `publish solar-system 1.0.0`.
  No hand-edited SQL. Phase 0 sets contain 12 nutrition files and 15 Solar System files.
  Existing output rows register png/svg/html/html-inline; default geometry remains owned by
  the unchanged recipes (1000x1000 / 2400x1700), with no new variant/geometry schema.
- **Operator approval required before merge:** exactly RCP-0001 nutrition@1.0.0 and
  RCP-0002 solar-system@1.0.0. Serials are **Costly** once referenced; the builder does not
  grant operator approval. Receipt/canary changes are **Easy** to reverse.
- Receipt construction lazily imports catalog runCLI and reuses show/verify, with no duplicate
  digest implementation. It emits serial, slug, module version, published contentSha256 and
  verified. Unavailable, unpublished or drifted catalog content adds a reason without blocking
  rendering. Errors are scoped to this recipe's paths/slug and canonical dump errors, so C1's
  nutrition-only copy stays verified even without unrelated Solar System files. Fixture edits
  remain render inputs rather than recipe drift. No artifacts, fitting, admission or publication changed.
- C1 adds serial/verified assertions; C3 runs catalog verify on its module tree. Four test blocks
  retained; no new suite, workflow, dependency or budget change.

Verification (all logs, copies and generated output under `.relay-scratch/`):
- Pre-edit tools/examples/package.json copy with absolute node_modules symlink at p2-base:
  from that cwd, `node tools/render.mjs tools/spike/fixture.json --out out-both --format png,svg`
  exited 0. This is a pre-edit filesystem baseline; the harness must check the actual base ref.
- `node tools/catalog.mjs verify` exit 0: valid true, errors [].
  `node tools/catalog.mjs export --check` exit 0: canonical true.
  Phase 1 verify does not print identities; separate `show` calls in the probe confirmed
  RCP-0001 nutrition@1.0.0 (12 files) and RCP-0002 solar-system@1.0.0 (15 files).
- `node .relay-scratch/p2-probe.mjs` exit 0. It spawns commands from p2-check:
  `node tools/render.mjs tools/spike/fixture.json --out out --format png,svg` exits 0;
  receipt serial RCP-0001, slug nutrition, version 1.0.0, verified true;
  contentSha256 cae72434e7f3c5fb441080532bf9c27095ea519f718b4d767425db99d7f599f8.
  Probe corrected to explicitly request PNG/SVG because the CLI default is PNG only.
- P2-A3: both hashes equal the pre-edit render:
  PNG f4451bfa94dc2657ee68fd061eaacd37c61a17e79a01c8814460c055cde6ba1a;
  SVG f7507d88c4501ddedbc809c1012b165897bb92aaa815e3a217e0772332265b06.
  Red: --set sections.header.headline=X changes both hashes; catalog remains verified true.
- P2-A1/A2 red: append a comment to scratch tools/recipes/nutrition.mjs -> catalog verify exit 1
  naming that path; render exit 0, verified false with path in reason, same PNG/SVG hashes.
- P2-A1 red: remove scratch examples/2026-10-08-solar-system/verification.json -> verify exit 1
  naming that path and missing/unreadable; unrelated nutrition still renders verified true.
- Additional reds: scratch nutrition version 1.0.1 -> render exit 0, verified false, version 1.0.1,
  unpublished reason; missing scratch catalog.sql -> render exit 0, verified false with reason,
  same hashes. All scratch source/catalog mutations restored.
- Targeted canaries only: `TMPDIR="$PWD/.relay-scratch/tmp" node --test
  --test-name-pattern='guards: (render pipeline|committed evidence)'
  .relay-scratch/p2-check/tools/spike/test/canaries.test.mjs` exited 1: C3 passed;
  C1 passed the new receipt assertions, then existing offline Chromium launch at line 102 failed:
  `bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer...: Permission denied (1100)`.
  No launch substitution or weakening was made. This sandbox cannot complete the browser portion.
- `node --check tools/render.mjs` and `node --check tools/spike/test/canaries.test.mjs` exit 0.
- P2-A4 filesystem substitute: before/after SHA-256 inventory of tools/recipes and tools/spike/output
  is identical. Comparison against the pre-edit copy shows exactly the three permitted artifact
  files changed under tools/examples; package.json unchanged. This is not a git/index claim.
  Harness must supply base-ref diff, full 4/4 gate and C2 byte-identical output.
- No git, full project suite, paid call, network, recipe/golden edit or out-of-lane persistent write.

Startup limits: graph MCP tools unavailable; relevant source read directly. Both documented
releases_app.py paths absent in this worktree; roadmap startup command failed file-not-found;
no ledger edited.

Review outcome: Pending independent Agy review; builder evidence is not approval.
VERDICT: PARKED
Basis: Implementation and targeted P2 green/red probes complete; targeted C1 browser verification
is blocked by sandbox Chromium permission denial. Independent review and the harness full gate
must supply remaining evidence before approval.
