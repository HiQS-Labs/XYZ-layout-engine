---
gh_issue: 82
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/82
title: "Public API for external modules: package exports with a single plugin-api entry"
goal: "Modules in other repositories use the engine through one declared, stable import surface instead of deep file paths"
owner: Claude Code
status: "Active (plan approved by Codex relay QA; implementing)"
updated: 2026-11-12
created: 2026-11-12
doc_type: feature
reversibility: "Easy — one new file, one package.json field, docs; no recipe, renderer or catalog change."
---

# GH-82 · Public API for external modules

Capture of [#82](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/82). The live issue is the discussion surface.

## Status

| What was just completed | What's next |
|---|---|
| Plan approved by Codex relay QA round 1 (`relay-system/2026-11-12/gh82-plan-qa.md`). | Implement `tools/plugin-api.mjs`, `package.json` exports and docs; smoke; final relay QA; PR. |

## Asks

- One stable, documented way for modules in other repositories (private or third-party) to use the engine, instead of deep file-path imports such as `tools/render.mjs`.
- `package.json` `exports` map whose `.` entry is `tools/plugin-api.mjs`, re-exporting only `launchPlaywright` and `publishForReview`.
- Consumers link the engine checkout as a package (`"xyz-layout-engine": "link:../XYZ-layout-engine"`) and import `from 'xyz-layout-engine'`.

## Deferred

- External recipe loading (`XYZ_RECIPE_PATHS`): recipe identity is hardcoded in `tools/request.mjs` (fixture-id inference, allowlist, canvas size; and again in `saveFixture`) and in `tools/render.mjs` `processRequest`. Revisit when an external module needs the request pipeline.

## Acceptance

- A linked scratch consumer imports both names by package name and launches Chromium.
- A bare import of a non-exported path fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- `pnpm test` and `utils/pdda/pdda.sh run` pass unchanged.

## Rating (2026-11-12)

`rated 50/15/50/85` — pri 50: operator asked for it now, and it unblocks a working external module; sev 15: no defect today, the risk is a silent break of an external module on an engine refactor; appeal 50: neutral, no operator score given; effort 85: one file, one field, docs. Recurrence: none; no prior issue covers this (searched plugin/registry/exports/extension).

## Plan

**Observed (base `4e08148`).** An external module imports the engine by file path: `<engine>/tools/render.mjs`
for `launchPlaywright` (`tools/render.mjs:137`) and `<engine>/tools/review.mjs` for `publishForReview`
(`tools/review.mjs:14`). `package.json` has no `exports` or `main`, and its `name` (`xyz-layout-engine-spike`)
is read by `tools/spike/render.mjs:27` for spike output folder names, so it stays unchanged. Nothing in the
repo imports the engine by package name (searched `package.json` readers and `require.resolve`), so adding
`exports` cannot change any in-repo import, all of which are relative.

**Outcome sought.** An external repo depends on a declared engine surface that engine refactors must keep, not on file layout.

**Smallest viable bet.**
1. Add `tools/plugin-api.mjs`: a header comment stating the contract (what is public, how to add a name),
   and two re-exports: `launchPlaywright` from `./render.mjs`, `publishForReview` from `./review.mjs`.
2. Add to `package.json`: `"exports": { ".": "./tools/plugin-api.mjs", "./package.json": "./package.json" }`.
3. README: a short "Using the engine from another repository" section (link dependency, the two names,
   the rule that anything else is internal). One line in `ROUTER.md` canonical files; `CHANGELOG.md` entry.
4. Note in `SPECS-PRD.md` §6.5 that the external-module surface is delivered and `RecipeRegistry` stays deferred.

**Not built.** External recipe loading (`XYZ_RECIPE_PATHS`), npm publishing, API versioning, plugin discovery or hooks, a package rename, new tests (test budget is 4 canaries; no new failure mode needs a test — the smoke below records the check).

**Alternative rejected.** Keep file-path imports and document `tools/render.mjs` + `tools/review.mjs` as stable: it
freezes two large internal files and every one of their ~20 exports by implication, instead of two names.

**Rollback.** Revert the commit; consumers fall back to file-path imports. Easy.

**Acceptance (falsifiable).**
- Main path: a scratch consumer in `$TMPDIR` with `"xyz-layout-engine": "link:<task clone>"`, after `pnpm install`,
  runs `import { launchPlaywright, publishForReview } from 'xyz-layout-engine'`, launches and closes Chromium,
  and `publishForReview('gh82-smoke', [<png>])` writes `REVIEW/gh82-smoke/` in the task clone. Red control: the
  same consumer against base `4e08148` fails (no `exports`, no `main` → `ERR_MODULE_NOT_FOUND`/unsupported directory import).
- Adjacent path: `import 'xyz-layout-engine/tools/render.mjs'` from the consumer fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- `pnpm test` (4 canaries) and `utils/pdda/pdda.sh run` pass. Receipt under `TESTS-RESULTS/2026-11-12+GH-82/`.
