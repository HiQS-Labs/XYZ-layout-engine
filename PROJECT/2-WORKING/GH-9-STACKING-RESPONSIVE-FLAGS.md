---
gh_issue: 9
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/9
title: "Add deterministic stacking/responsive layout flags (responsive, stackOrder) to recipes"
status: "Planned; awaiting plan QA"
created: 2026-10-09
updated: 2026-10-10
owner: unassigned
doc_type: feedback
complexity: 3
risk: 2
effort: 3
phases: 4
ratings_provisional: true
branch: marathon/gh-9-responsive-flags (proposed; base the GH-10 branch)
reversibility: "Costly for flag names, enum values and the width rule once receipts and recipes depend on them; Easy for resolver internals."
non_goals:
  - Second layout engine, runtime measurement or second layout pass, CSS media queries, CSS `order`.
  - Auto-height outputs, nested container queries, per-module hide/collapse, masonry/balanced packing, flex-wrap grids.
  - Flags on solar-system or the product-hero smoke; tenant-settable stackBelow/stackPriority; variants/presets.
  - Changing artifacts of any previously admitted (unflagged) request or any committed golden.
related:
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/19
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/10
  - https://github.com/HiQS-Labs/XYZ-layout-engine/pull/18
  - PROJECT/3-COMPLETED/GH-10-RECIPE-CATALOG.md
  - PROJECT/2-WORKING/responsive-flags/MARATHON.yaml
  - PROJECT/2-WORKING/SPECS-PRD.md
goal: >
  Nutrition renders a declared narrow output whose declared rows collapse to columns when, and only
  when, `responsive: true` and the output canvas width is below the row's authored `stackBelow`;
  children reorder in the scene tree by `stackOrder` (source, priority, rtl) at scene-build time; the
  receipt records flags and resolved order; every unflagged request and every golden stays
  byte-identical; nutrition is republished as 1.1.0 through the GH-10 catalog.
---

> **Superseded (2026-10-10):** this plan is not built. Responsive stacking is folded into the grid core, Phase B of the finalized plan on issue #20 (layout chosen by canvas width). Kept as history.

# GH-9 — Deterministic stacking/responsive layout flags

## Status

| What was just completed | What's next |
|---|---|
| Capture promoted from 1-INBOX and expanded into a marathon-executable plan stacked on GH-10: grounded current state, exact width-to-direction rule, request surface, version-bump application, four serial phases with failing acceptance checks and red controls, write-sets and preflight contract. | Independent plan QA, ledger repoint of the GH-9 roadmap row, then fire only after the GH-10 lane is accepted and this branch is cut from it (preflight is expected to report not-ready until `tools/catalog.sql` exists at the target ref). |

## Table of contents

- [Verdict and purpose](#verdict-and-purpose)
- [Observed current state](#observed-current-state)
- [Requirements and scope decisions](#requirements-and-scope-decisions)
- [Design](#design)
- [Smallest affected surface](#smallest-affected-surface)
- [Dependencies](#dependencies)
- [Risks and rollback](#risks-and-rollback)
- [Test scope](#test-scope)
- [Phase 0 — Spike: backend evidence, narrow output and go/no-go](#phase-0--spike-backend-evidence-narrow-output-and-gono-go)
- [Phase 1 — Pure resolver and request admission](#phase-1--pure-resolver-and-request-admission)
- [Phase 2 — Nutrition adoption, narrow output and catalog bump](#phase-2--nutrition-adoption-narrow-output-and-catalog-bump)
- [Phase 3 — Docs and handoff](#phase-3--docs-and-handoff)
- [Acceptance](#acceptance)
- [Acceptance & Quality Checklist](#acceptance--quality-checklist)
- [Swarm Preflight Contract](#swarm-preflight-contract)

## Verdict and purpose

Canvas size is declared before render, so "responsive" here means resolving a declared row to a
column from the output width while building the scene, not browser reflow. **Bet:** one pure function
over the existing scene tree plus recipe-declared thresholds is enough; both backends already lay out
`flexDirection: 'column'` (`tools/spike/scene.mjs:96`, `:106`). **Tradeoff:** fixed declared output
heights instead of auto-height, so a stacked layout that does not fit reports non-fit. **Failure
mode:** the narrow nutrition layout cannot fit any reasonable declared height, or the resolver
perturbs unflagged trees and moves goldens. **Reversibility:** resolver internals Easy; flag names,
enum values and the width rule Costly once receipts and recipes depend on them.

## Observed current state

References read at `e553071` (PR #18 head).

- **No responsive mechanism.** `tools/spike/scene.mjs:63-198` builds nutrition with fixed pixel
  widths: `header` and `header_row` 940 (`:106`, `:112`), `hero` row 940 with `flex: 1`
  (`:131`), `lower` row 940 (`:139`), `items` row 700 (`:145`) of four 167-wide items (`:150`),
  `benefitsPanel` 220 (`:164`), `footer` 880 (`:185`). Rows are explicit `flexDirection: 'row'`.
- **Canvas is fixed per recipe.** `tools/request.mjs:61` and `:68` admit only 1000x1000 for nutrition
  and 2400x1700 for solar ("only the recipe-owned canvas is supported"). `tools/render.mjs:192` sets
  `fixture.width/height` from the normalized request before `buildScene`.
- **Request fields are a closed allowlist.** `tools/request.mjs:32` admits only `inputPath, width,
  height, format, backend, scale, recipe, edits`; unknown fields are rejected. Fixture keys are closed
  by `validateFixtureShape` (`tools/request.mjs:81-102`), so flags cannot ride in the fixture without a
  schema change.
- **One tree, two backends.** `tools/render.mjs:223-235` builds one scene per attempt and passes it to
  Satori or Chromium (`toDocument`, `:78-91`). `toHtml` rejects any prop other than
  `id, src, alt, width, height` (`tools/render.mjs:101`), so stack metadata must not be stored on scene
  nodes; recipe-level maps keyed by node id follow the existing `CONTAINMENT` pattern
  (`tools/spike/scene.mjs:23-35`, `tools/recipes/nutrition.mjs:8`).
- **Fitting already reports non-fit.** `tools/render.mjs:244-294` shrinks overflowing text up to ten
  attempts and throws `non-fit after N attempts` instead of publishing. The PR #18 review blocker says
  this misses unbreakable text (`tools/render.mjs:244-157`); GH-9's "no silent clipping" relies on that
  fix.
- **Goldens.** C2 (`tools/spike/test/canaries.test.mjs:341-364`) compares fresh spike outputs from
  `tools/spike/render.mjs` (which calls `createScene` directly, `tools/spike/render.mjs:263`, `:290-292`)
  with committed goldens: geometry within 0.5 px always, byte digests only when host/runtime match
  (`:355-360`, otherwise it prints `skipped`).
- **PRD shape.** Named outputs in `recipe.yaml` (`SPECS-PRD.md:175-177`, e.g. 640x800 mobile); request
  carries `params` and a named output (`SPECS-PRD.md:298-302`); fingerprint covers resolved parameters
  and output dimensions (`SPECS-PRD.md:372`).
- **Not verified (assumptions for Phase 0):** whether pinned Satori 0.36 honors or ignores CSS
  `order`; the narrow-output height at which nutrition fits; whether `node_modules` is installed in the
  execution clone (it is absent in this planning clone, so no render was run here).

## Requirements and scope decisions

| Issue asks | Decision here | Reason |
|---|---|---|
| `responsive` boolean default false; `stackOrder` enum default `source` | Kept, request `params.responsive`, `params.stackOrder` | PRD §8.1 names `params`; fixture schema stays closed |
| `stackBelow` on a Stack, `stackPriority` on children, trusted only | Kept as recipe exports `STACKS` and `STACK_PRIORITY` keyed by node id | `toHtml` forbids extra props; matches `CONTAINMENT` |
| Orders `source`, `priority`, recommended `rtl` | Kept all three | One reversal in the same step |
| Tenant overrides only within an `allow` list | Recipe export `PARAMS` is the allow list; recipes without it reject `params` | No tenant layer exists yet; fail closed |
| Fingerprint and validation report record flags and resolved order | Receipt gains `normalized.params`, `normalized.output`, `layout.resolved[]` | PRD §10.1 |
| Fixed height with non-fit vs auto-height | Fixed declared height; auto-height is a non-goal | Auto-height needs measurement or a second pass |
| Prove with one recipe at two sizes | Nutrition `default` 1000x1000 and `narrow` 640xH (H set in Phase 0) | Issue Phase 0 names nutrition at ~640 |
| Recipe change bumps catalog version | Nutrition 1.0.0 → 1.1.0 (minor) published via GH-10 | GH-10 version bump rule |

## Design

**Exact width rule.** Inputs: `W`, the width of the selected declared output (already admitted by
`tools/request.mjs`); `responsive` (default `false`); `stackOrder` in `source | priority | rtl`
(default `source`); recipe exports `STACKS = { <nodeId>: { stackBelow: <int 1..8192> } }` and
`STACK_PRIORITY = { <childId>: <int 1..99> }`.

1. If `responsive !== true`, the resolver is not called; the scene object reaches the backend unchanged.
2. Otherwise visit the built tree in pre-order. For a node whose `props.id` is in `STACKS`: its
   authored `style.flexDirection` must be `'row'` (else recipe error). If `W < stackBelow` (strict),
   replace it with a copy whose style has `flexDirection: 'column'` and whose non-null children are
   reordered; if `W >= stackBelow`, leave the node untouched.
3. Orders: `source` = authored order; `rtl` = authored order reversed; `priority` = stable sort by
   `STACK_PRIORITY[id] ?? 100`, ties and unnumbered children in authored order.
4. Every `STACKS` id must be found in the tree, else recipe error (no silent no-op). Nested stacks
   are each compared with the canvas `W`; no container queries.
5. The receipt records `layout.resolved = [{ id, stackBelow, width: W, direction, order: [child ids] }]`.

The resolver is a pure module (`tools/stack.mjs`: no I/O, no renderer import, no clock or random),
called by `processRequest` after `recipe.buildScene` (`tools/render.mjs:223`), so library, CLI and any
later transport share it. The HTML export carries the resolved inline `flex-direction`; no media query.

**Request surface.** `params: { responsive?: boolean, stackOrder?: string }` and `output?: string` join
the allowlist at `tools/request.mjs:32`. CLI: `--param responsive=true`, `--param stackOrder=priority`,
`--output narrow` (parsed like `--set`, `tools/render.mjs:477-484`). Unknown param keys, wrong types,
values outside the enum, or `params` on a recipe without `PARAMS` fail with field paths. Output
selection: the per-recipe table at `tools/request.mjs:61` becomes named outputs, first entry is the
default (today's canvas), and an explicit width/height must equal a declared output. Moving outputs
into recipe modules is deferred (revisit when a third recipe or a second output family appears).

**Version bump.** Nutrition gains `PARAMS`, `STACKS`, `STACK_PRIORITY`, a `narrow` output and, if
Phase 0 requires, canvas-relative widths in `createScene` that evaluate to today's literals at 1000.
Unflagged default-output artifacts stay byte-identical, so this is a minor bump: module `version`
becomes `1.1.0`, and `node tools/catalog.mjs publish nutrition 1.1.0` records the new file digests
and the `narrow` output. Publishing the changed files as `1.0.0` must be rejected. Solar-system is
untouched and stays 1.0.0.

## Smallest affected surface

New: `tools/stack.mjs`. Edited: `tools/request.mjs` (params, named outputs), `tools/render.mjs`
(resolver call, receipt), `tools/recipes/nutrition.mjs`, `tools/spike/scene.mjs` (only canvas-relative
widths, only if Phase 0 shows they are required), `tools/catalog.sql` (publish 1.1.0),
`tools/spike/test/canaries.test.mjs` (C1 extension), `README.md`, `PROJECT/2-WORKING/SPECS-PRD.md`,
`CHANGELOG.md`, and this plan (Phase 0 findings). Not edited: goldens, `tools/spike/render.mjs`,
`tools/spike/verify.mjs`, solar recipe and example, `package.json`, `test-budget.json`, releases ledger.

## Dependencies

- **GH-10 accepted on its branch** (`tools/catalog.mjs`, `tools/catalog.sql`, version bump rule). This
  branch is cut from the GH-10 branch head.
- **PR #18 fixed head** (blocker at `tools/render.mjs:244-157`: non-fit must not miss unbreakable text).
- Node and the pinned Satori/Chromium from `package.json`; `pnpm install --frozen-lockfile` in the
  execution clone.

## Risks and rollback

| Risk | Read | Mitigation / rollback |
|---|---|---|
| Resolver or canvas-relative widths perturb unflagged trees and move goldens | Costly | Resolver not called when unflagged; Phase 0 deep-equals the 1000 tree before/after; C2 bytes and base-ref CLI digests are hard gates |
| C2 prints `skipped` on a non-golden host, hiding byte drift | Costly | Acceptance requires the `byte-identical` line; run on the recorded host |
| No narrow height fits nutrition in all three orders | Easy | Phase 0 go/no-go; stop and park rather than add measurement |
| Non-fit path misses unbreakable text (PR #18 blocker) | Costly | Depend on the fixed PR #18 head; Phase 2 red control renders narrow with `responsive:false` and expects non-fit |
| Flag names/enum frozen by receipts and the catalog | Costly | Names taken verbatim from the issue; operator confirms before merge |
| Collision with GH-10 and PR #18 on `tools/render.mjs`, `tools/request.mjs`, canary file | Easy | Strict serial stacking; rebase before fire |

Rollback: revert the phase commit; the catalog keeps 1.0.0 history and a reverted branch never merged
1.1.0. Halt on first failed phase; no force.

## Test scope

No new test file, test block, workflow or dependency. Named failure modes:

- **Resolver orders wrongly or the width boundary is off by one** (no existing canary exercises
  stacking): C1 imports `tools/stack.mjs` and checks a synthetic tree: `source`, `priority` with a tie
  and an unnumbered child, `rtl`, `W == stackBelow` stays row, `W == stackBelow - 1` collapses.
- **Flags change unflagged output**: C1 asserts the default nutrition PNG/SVG digests with no params,
  with `responsive:false`, and with `responsive:true` at 1000 (no threshold crossed) are equal; C2
  stays byte-identical.
- **Stacked output is nondeterministic or silently clipped**: C1 renders `narrow` + `responsive:true`
  twice (equal digests, `layout.resolved` shows `column`) and `narrow` + `responsive:false`
  (explicit non-fit, nothing published).
- **Invalid flags admitted**: C1 rejects an unknown param, a non-boolean `responsive`,
  `stackOrder:'random'`, and any `params` on solar-system.
- **Changed nutrition not republished**: covered by GH-10's C3 `catalog verify`.

## Phase 0 — Spike: backend evidence, narrow output and go/no-go

**Goal:** evidence for the backend behavior and the narrow output before engine code. Doc-only; all
prototypes in `$TMPDIR`. Depends on GH-10 Phase 3 accepted.

- [ ] With the pinned versions, render a tiny tree in Satori and Chromium with `flexDirection:
      'column'` and with CSS `order` on children; record whether each honors `order` (expected
      reason to reorder in the tree).
- [ ] Copy nutrition into `$TMPDIR`; prototype the resolver at `W = 640` for `hero`, `lower`, `items`;
      find the smallest declared height `H ≤ 2400` that fits in all three orders on both backends;
      record bounds and digests of two repeat renders.
- [ ] Decide whether `createScene` widths must become canvas-relative; if so prove the 1000x1000 tree
      deep-equals the current one.
- [ ] Confirm request names (`params`, `output`, `--param`, `--output`) and `stackBelow` values.
- [ ] Write a `### Phase 0 findings` subsection here with commands, results, the chosen `H` and a
      go/no-go; on no-go stop and park.

**Write set:** `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md` (Phase 0 findings subsection only).

**Acceptance (each can fail; red control in brackets):**
- [ ] G0-A1 Findings name the chosen `H`, thresholds and go/no-go. [Red: reviewer check
      `rg -n "^Decision:" PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md` fails on an empty subsection.]
- [ ] G0-A2 Prototype narrow render fits with zero unresolved text and two repeats share a digest.
      [Red: the same prototype at `H` minus 200 reports non-fit.]
- [ ] G0-A3 1000x1000 tree deep-equal before/after any width refactor. [Red: changing one width literal
      fails the deep-equal.]
- [ ] G0-A4 `git status --porcelain` lists only this plan. [Red: any scratch file in the repo shows up.]

### Phase 0 — QA checklist

- [ ] Findings written back with file:line pointers; go/no-go explicit.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0.

## Phase 1 — Pure resolver and request admission

**Goal:** `tools/stack.mjs`, request `params`/`output`, receipt fields; no recipe adopts flags yet. Depends on Phase 0 go.

- [ ] Pure resolver per the exact width rule, with bounds checks on `stackBelow` and `stackPriority`.
- [ ] `tools/request.mjs`: admit `params` and `output`; named output table with today's canvases as
      defaults; reject `params` for recipes without `PARAMS`.
- [ ] `tools/render.mjs`: call the resolver only when `responsive === true`; add `layout.resolved`.
- [ ] Extend C1 with the synthetic-tree and invalid-flag checks and the unflagged digest equality.

**Write set:** `tools/stack.mjs`, `tools/request.mjs`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`.

**Acceptance (each can fail; red control in brackets):**
- [ ] G1-A1 Synthetic tree: `priority` order with a tie and an unnumbered child matches the expected id
      list; `W == stackBelow` keeps row. [Red: an unstable or `<=` comparison fails these assertions.]
- [ ] G1-A2 `node tools/render.mjs tools/spike/fixture.json --out <tmp> --format png,svg` digests equal the
      GH-10 branch head digests. [Red: a `--set` text edit changes them.]
- [ ] G1-A3 `--param stackOrder=random` and `--recipe solar-system --param responsive=true` exit 1 with
      field paths. [Red: `--param responsive=false` on nutrition is rejected until Phase 2, proving
      the allow list is consulted.]
- [ ] G1-A4 `rg -n "import|Date|Math.random|performance" tools/stack.mjs` finds nothing. [Red: the
      pattern matches `tools/render.mjs`.]
- [ ] G1-A5 `pnpm test` exits 0 with `C2 digests: … byte-identical`. [Red: a host mismatch prints `skipped` and fails this check.]

### Phase 1 — QA checklist

- [ ] Every todo has a recorded command/result in the relay receipt.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0, keeping 1 file/4 tests/60 s/0 workflows.

## Phase 2 — Nutrition adoption, narrow output and catalog bump

**Goal:** nutrition declares flags and the `narrow` output, renders deterministically, and is published as 1.1.0. Depends on Phase 1.

- [ ] `tools/recipes/nutrition.mjs`: `PARAMS`, `STACKS`, `STACK_PRIORITY`, `version = '1.1.0'`.
- [ ] `tools/spike/scene.mjs`: canvas-relative widths only if Phase 0 required them.
- [ ] `tools/request.mjs`: add nutrition `narrow` (640 x Phase 0 `H`).
- [ ] `node tools/catalog.mjs publish nutrition 1.1.0`; commit `tools/catalog.sql`.
- [ ] Extend C1 with narrow determinism, resolved order and the `responsive:false` non-fit control.

**Write set:** `tools/recipes/nutrition.mjs`, `tools/spike/scene.mjs`, `tools/request.mjs`, `tools/catalog.sql`, `tools/spike/test/canaries.test.mjs`.

**Acceptance (each can fail; red control in brackets):**
- [ ] G2-A1 `--output narrow --param responsive=true --param stackOrder=priority` exits 0 twice with
      equal PNG digests and `layout.resolved` showing `column`. [Red: `--output narrow` without
      `responsive` exits 1 `non-fit`.]
- [ ] G2-A2 Default nutrition digests equal the GH-10 branch head and C2 prints `byte-identical`.
      [Red: altering one width literal at 1000 changes them.]
- [ ] G2-A3 `node tools/catalog.mjs verify` exits 0 showing `RCP-0001 nutrition@1.1.0`. [Red:
      `publish nutrition 1.0.0` with the new files exits 1 `already published with different content`.]
- [ ] G2-A4 `git diff --exit-code <GH-10 head> -- tools/spike/output tools/recipes/solar-system.mjs examples test-budget.json package.json` exits 0. [Red: any such edit exits 1.]
- [ ] G2-A5 `pnpm test` exits 0. [Red: as G1-A5.]

### Phase 2 — QA checklist

- [ ] Every todo has a recorded command/result in the relay receipt.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0; agent visual check of the narrow PNG recorded; human visual approval pending.

## Phase 3 — Docs and handoff

**Goal:** document flags, defaults, the width rule and the version bump. Depends on Phase 2.

- [ ] `README.md`: two flags, defaults, the `narrow` output and exact commands.
- [ ] `PROJECT/2-WORKING/SPECS-PRD.md` §6: delivered-observation note (scene-build resolution, no media queries, fixed heights).
- [ ] `CHANGELOG.md`: entry with `Refs #9`, `Refs #19`.

**Write set:** `README.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`.

**Acceptance (each can fail; red control in brackets):**
- [ ] G3-A1 Every README command for the flags runs with its documented exit code. [Red: `--param stackOrder=random` exits 1.]
- [ ] G3-A2 `utils/pdda/pdda.sh run` reports no errors. [Red: an absolute home path raises a hardcoded-paths finding.]
- [ ] G3-A3 `pnpm test` exits 0. [Red: as G1-A5.]

### Phase 3 — QA checklist

- [ ] Docs describe only delivered behavior.
- [ ] Independent Agy review Approved against the committed phase diff; receipt on disk.
- [ ] Driver ran `pnpm test` exit 0.

## Acceptance

- [ ] Nutrition renders the declared narrow output with responsive true, collapsing declared rows to columns only when the output width is below stackBelow, deterministically across repeat renders.
- [ ] stackOrder source, priority and rtl reorder children in the scene tree, with ties and unnumbered children in source order; invalid flags fail with field paths.
- [ ] Every unflagged request and every committed golden is byte-identical to the GH-10 branch head; the four existing canaries pass.
- [ ] Receipts record params, output and resolved direction and order; stacked content that does not fit reports non-fit instead of clipping.
- [ ] Nutrition is published as 1.1.0 in the catalog and republishing the new content as 1.0.0 is rejected.

## Acceptance & Quality Checklist

### Wave 1

- [ ] Wave 1 Proof of Done Test Suite Green (`pnpm test` exit 0 after all four phases, plus G2-A1..A4 commands).
- [ ] Wave 1 Post-Build Codex QA Relay executed (receipt to be recorded under `relay-system/<YYYY-MM-DD>/gh9-wave1-postbuild.codex.md`).
- [ ] Wave 1 CodeRabbit / Peer Review findings adjudicated.

Execution: one serial lane gh9-p0 -> gh9-p1 -> gh9-p2 -> gh9-p3 from
`PROJECT/2-WORKING/responsive-flags/MARATHON.yaml`, only after GH-10 is accepted. Codex builder,
independent Agy reviewer, gate `pnpm test`, 1500 s turns, two review rounds. No push, no PR, no merge
from builder turns; the ready PR lists `Refs #9` only.

## Swarm Preflight Contract

```json
{
  "target": {
    "repo": ".",
    "ref": "origin/marathon/gh-5-mvp-foundation"
  },
  "gate": "pnpm test",
  "fix_probes": [
    {
      "type": "path_absent",
      "path": "tools/stack.mjs"
    },
    {
      "type": "path_absent",
      "path": "PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md"
    }
  ],
  "artifacts": [
    "PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md",
    "tools/stack.mjs",
    "tools/catalog.sql",
    "tools/request.mjs",
    "tools/render.mjs",
    "tools/recipes/nutrition.mjs",
    "tools/spike/scene.mjs",
    "tools/spike/test/canaries.test.mjs",
    "README.md",
    "PROJECT/2-WORKING/SPECS-PRD.md",
    "CHANGELOG.md"
  ],
  "artifacts_new": [
    "PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md",
    "tools/stack.mjs"
  ],
  "remediation": {
    "source": "issue#9",
    "criteria": "Scene-build-time responsive (default false) and stackOrder (source/priority/rtl) flags: declared rows collapse to columns only when responsive and output width < stackBelow; tree reorder, no measurement pass or media queries; nutrition narrow output; receipts record flags/resolved order; unflagged artifacts and goldens byte-identical; nutrition published 1.1.0 via the GH-10 catalog; four existing canaries extended."
  },
  "acceptance": [
    "pnpm test",
    "node tools/catalog.mjs verify"
  ],
  "lanes": {
    "agy_safe": [],
    "orchestrator_only": [
      "releases.db",
      "releases.sql"
    ],
    "index_only": []
  }
}
```

The target ref is the PR #18 head because the GH-10 branch does not exist yet; `tools/catalog.sql` is
deliberately a non-new artifact, so preflight reports not-ready until GH-10 lands. Re-point `target.ref`
to the GH-10 branch when it exists.
