---
title: "GH-20 A2 marathon prep notes (catalog designs)"
status: Prepared
created: 2026-10-10
updated: 2026-10-10
owner: unassigned
goal: Collision map, unverified assumptions, open operator decisions and validation receipts for the GH-20 Phase A2 marathon prep.
roadmap_exempt: true
---

## Status

| What was just completed | What's next |
|---|---|
| Plan, YAML and four briefs written; preflight, marathon dry-run and PDDA run recorded below. | Orchestrator: plan QA, repoint the GH-20 ledger row to `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`, operator decisions below. |

## Collision map (one serial lane; no open PRs on 2026-10-10)

| File | p0 | p1 | p2 | p3 |
|---|---|---|---|---|
| `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md` | findings only | — | — | — |
| `tools/catalog.mjs`, `tools/spike/test/canaries.test.mjs` (C4 only) | — | write | — | — |
| `tools/catalog.sql` (CLI-generated) | — | migrate via `import` | 3 × `design add` | — |
| `tools/design-log.jsonl` (new, CLI-generated) | — | — | 3 lines | — |
| `ROUTER.md`, `README.md`, `CHANGELOG.md` | — | — | — | write |

Only overlap: `tools/catalog.sql` in p1 and p2, serial by `depends_on`. `tools/render.mjs`, recipes, `examples/**`, SPECS-PRD and `releases.*` are read-only.

## Unverified assumptions

- `node:sqlite` and every planning probe ran only here (Node v22.22.3); D1 upgrade-via-`import` is reasoned from `tools/catalog.mjs:159-173`, `:217`, `:242`, not yet run (P0 proves it).
- C4 time cost (about 7 extra spawns, ~1 s) is an estimate; baseline 43.2 s of 60 s. `verify` hashing three PNGs (~2.2 MB) per render is unmeasured.
- The sandbox blocks Chromium launch (`kill EPERM`): `pnpm test` passed 4/4 only outside it. Builders need the same.
- The capture was untracked, so `git mv` failed (`not under version control`); plain `mv` was used.
- Friction wording for the seeds is left to the P2 builder after reading each example's source.

## Open decisions

1. Design IDs. RECOMMEND approve the D3 rule and seeds `2026-10-08-solar-system`, `2026-10-09-rag-system`, `2026-10-09-cell-division` (folder names, match not enforced). BECAUSE the ID format is Costly once shared. UNLESS IDs must equal the folder name, then enforce it.
2. Path roots. RECOMMEND confine fixture/artifact to `examples/` with `.json`/`.png`. BECAUSE all seeds live there and C3 hashes committed files. UNLESS designs will reference publication output dirs soon.
3. Legacy header. RECOMMEND keep `SCHEMA_V1` admission in `loadDump`. BECAUSE it is two derived replacements and lets `import` upgrade old dumps without hand edits. UNLESS reviewers prefer deleting it after the one migration.
4. Two-file write. RECOMMEND dump first, then log append, no auto-repair. BECAUSE `verify` exposes any gap and git restores it. UNLESS a single-file record is wanted (log inside the dump), which #21 rejects.
5. SPECS-PRD. RECOMMEND no edit in A2. BECAUSE §6.6 belongs to Phase B; README documents delivered behavior. UNLESS the operator wants a one-line §6.5 pointer now.
6. Ratings. RECOMMEND confirm complexity 2 / risk 2 / effort 2 and clear `ratings_provisional`. BECAUSE auto-selection waits on a human. UNLESS re-rated.

## Validation receipts (2026-10-10)

- Baseline `pnpm test` (outside sandbox): exit 0, 4/4, `C2 digests: 12 artifacts byte-identical`, `PASS — 4 canaries in 43.2s (budget 60s)`. In sandbox: exit 1 (Chromium `kill EPERM`).
- Locator: `find-harness.sh --env` resolved HARNESS=XYZ-forge (not vendored, via override).
- Preflight `--dry-run` (SWARM_PREFLIGHT_ROOT=$PWD, `--target-root $PWD`): in sandbox exit 0 `verdict: ready (exit 0)` with acceptance `unknown [fetch-failed]`. With GitHub reachable, first run exit 5 `NOT-READY` (acceptance diverged: 4 issue criteria, 10 doc criteria undeclared); fixed by adding `## Acceptance — deviations from the issue`; rerun exit 0 `acceptance: match — 4 issue criteria reconciled: 14 deviation(s) declared and accounted for`, `issue-state: OPEN`, `verdict: ready (exit 0)`.
- `marathon.sh --plan PROJECT/2-WORKING/catalog-designs/MARATHON.yaml --builder codex --pre-advance-cmd 'pnpm test' --dry-run`: exit 0, `4 phase(s) would run in order`, reviewer=agy on all four (log prints `round-cap=5`; lane `attempts 0/2`).
- `utils/pdda/pdda.sh run`: exit 0 (observe). 1 expected ERROR: roadmap-coverage, `GH-20-CATALOG-DESIGNS.md` has no ledger pointer (row still names the old 1-INBOX path; orchestrator repoint). Warnings: 2 governance (pre-existing, `ROUTER.md:78`, `PDDA-INSTALL.md:347`), 12 issue-doc-sync (gh offline in sandbox). Frontmatter, status-table, hardcoded-paths, changelog, marathon-qa: 0 findings.

## Operator approvals (2026-10-10)

- Approved: the date-slug design ID rule and the three seed design IDs in `PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md`. Marathon fired after this approval; nothing is merged by the marathon.

## Recovery (operator-authorized 2026-10-10)

- First run halted at `gh20-a2-p1` (`token-state`: the reviewer wrote Approved in its body but left the header Open; XYZ-forge #1020). `--retry gh20-a2-p1` replays phase 0 and refuses it, so there is no in-driver resume. Phase 1 passes `pnpm test` (4/4) and was independently reviewed and attested in `relay-system/2026-10-10/gh20-a2-p1-recovery-qa.md`. Phases 2 and 3 run from `MARATHON-p2-p3.yaml`.

