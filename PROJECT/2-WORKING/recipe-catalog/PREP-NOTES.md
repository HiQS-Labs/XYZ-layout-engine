---
title: "GH-19 marathon prep notes (GH-10 then GH-9)"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Collision map, unverified assumptions, open operator decisions and validation receipts for the GH-19 marathon prep.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Both plans, YAMLs and eight briefs written; preflight, marathon dry-run and PDDA run recorded below. | Orchestrator: plan QA, repoint GH-10/GH-9 ledger rows, rebase on fixed PR #18, decide items below. |

## Collision map (all lanes strictly serial; no parallel lanes)

| File | GH-10 phases | GH-9 phases | Open PR #18 (changes requested) |
|---|---|---|---|
| `tools/spike/test/canaries.test.mjs` | p1, p2 | p1, p2 | yes (S9: C1 size) |
| `tools/render.mjs` | p2 | p1 | yes (blocker `:212-226`, S2 `:341-354`, S6 `:317`) |
| `tools/request.mjs` | — | p1, p2 | yes (S1 `:115-129`) |
| `tools/catalog.sql` | p1, p2 | p2 | no |
| `tools/recipes/nutrition.mjs`, `tools/spike/scene.mjs` | read (digested) | p2 | yes (both changed in PR) |
| `tools/recipes/solar-system.mjs` | read (digested) | — | yes (S6 `:62` changes solar digest) |
| `README.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/SPECS-PRD.md` | p3 | p3 | yes |
| `tools/catalog.mjs` / `tools/stack.mjs` | p1 (new) | — / p1 (new) | no |

Rule: rebase the stack on the fixed PR #18 head, rerun preflight, then fire GH-10; cut GH-9 from the accepted GH-10 head.

## Unverified assumptions

- `node:sqlite` verified only here (Node 22.22.3, SQLite 3.51.3, unflagged, ExperimentalWarning on stderr); other hosts unknown; repo pins no Node (`package.json` has no `engines`).
- `better-sqlite3` install friction and license not checked (no network installs).
- No `node_modules` in this clone: `pnpm test`, renders, Satori `order` support and the narrow height were not run here.
- C2 byte digests run only on the recorded host (`canaries.test.mjs:355-356` prints `skipped` elsewhere).
- Issues #9/#10 have no `## Acceptance` section, so acceptance fidelity is `unknown [no-issue-section]`; this blocks only if they become frozen-manifest members (GH-557).
- Builder is the driver default (Codex); reviewer Agy per umbrella #19. Exact PR #18 fix diffs are unknown.
- Captures were untracked, so `git mv` failed (`not under version control`); plain `mv` was used.

## Open decisions

1. Storage. RECOMMEND committed `tools/catalog.sql` only, rebuilt in memory. BECAUSE one diffable canonical file, nothing binary to drift. UNLESS the operator wants `releases.db` parity (commit a `.db` too).
2. Engine. RECOMMEND `node:sqlite`. BECAUSE no new dependency and it works unflagged here. UNLESS Phase 0 finds it disabled or unstable on the execution host.
3. Drift at render. RECOMMEND record `catalog.verified:false`, don't block. BECAUSE `catalog verify` in C3 is the gate and recipe edits stay workable. UNLESS renders must fail closed now.
4. Scope. RECOMMEND defer variants, aliases and semver ranges. BECAUSE nothing consumes them; GH-9 flags are request params. UNLESS presets are wanted in this marathon.
5. Serials. RECOMMEND approve RCP-0001 nutrition, RCP-0002 solar-system before merge. BECAUSE serials are Costly once referenced. UNLESS another numbering is preferred.
6. Outputs. RECOMMEND keep the named-output table in `tools/request.mjs`. BECAUSE moving outputs into modules forces a solar bump. UNLESS a third recipe arrives first.
7. Ratings. RECOMMEND confirm effort 3 / complexity 3 / risk 2, then clear `ratings_provisional`. BECAUSE auto-selection stays blocked until a human confirms. UNLESS re-rated.

## Validation receipts (2026-10-10)

- Locator: `find-harness.sh --env` resolved HARNESS=XYZ-forge (not vendored, via override).
- Preflight as given (`--project-doc PROJECT/2-WORKING/<doc> --dry-run`): GH-10 exit 6, GH-9 exit 6, `BLOCKED: project doc not found` (a relative doc resolves against the harness root). Rerun with `SWARM_PREFLIGHT_ROOT=$PWD --target-root $PWD`: GH-10 exit 0 `ready`; GH-9 exit 5 `NOT-READY`, sole reason `artifact path not found at target.ref: tools/catalog.sql` (the GH-10 dependency). Same exits with GitHub reachable; issue state OPEN.
- `marathon.sh --plan .../recipe-catalog/MARATHON.yaml --dry-run`: exit 0, 4 phases, reviewer=agy. Responsive-flags: exit 0, 4 phases, reviewer=agy.
- `utils/pdda/pdda.sh run`: exit 0 (observe). BLOCKER for orchestrator: 2 roadmap-coverage errors, because the GH-10/GH-9 ledger rows still point at the old 1-INBOX paths (needs a `releases roadmap` repoint). 51 warnings: 49 existing plus 2 offline issue-doc-sync warnings for the new docs. Baseline before edits: 0 errors, 49 warnings.
