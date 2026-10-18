---
gh_issue: 65
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/65
title: "XYZ Forge examples: one folder with today/future lenses; add the prior-art search to both"
goal: "Group the three XYZ Forge diagrams under examples/xyz-forge/{today,future}/ and show the prior-art search where the factory runs it."
status: "In progress — final QA Approved; PR ready, awaiting merge"
created: 2026-10-18
updated: 2026-10-18
owner: Claude
doc_type: feedback
effort: 1
complexity: 1
risk: 1
phases: 1
related:
  - PROJECT/3-COMPLETED/GH-55-XYZ-FORGE-DIAGRAM.md
  - examples/xyz-forge/today/system-v1/
  - examples/xyz-forge/today/software-factory-v2/
  - examples/xyz-forge/future/shift-proposal/
reversibility: "Easy — three folder moves (git mv), one relative-path line per script, two caption edits with re-rendered outputs, link fixes, a .gitignore hunk, this doc, a changelog entry and the ledger row."
---

# GH-65 — XYZ Forge examples: one folder, two lenses, prior-art search shown

## Status

| What was just completed | What's next |
|---|---|
| Final QA Approved by Codex in round 1; PR opened against `main` | Merge, then archive to 3-COMPLETED and reconcile the ledger |

## Why

Operator requests (2026-10-18): (1) the three dated XYZ Forge example folders are two views of one system
and should sit under one folder with a sub-folder per lens; (2) both lenses should show the prior-art
search, a step the factory actually runs but no diagram draws; (3) carry the primary checkout's pending
`.gitignore` lines in the same PR. Operator choice for the layout: **Today + Future** — today holds v1 and v2
side by side, future holds the `/shift` proposal.

## Recon (base `b38e0d3`, 2026-10-18)

- Folders: `examples/2026-10-14-xyz-forge-system/` (v1, GH-55), `examples/2026-10-15-xyz-forge-software-factory/`
  (v2), `examples/2026-10-15-xyz-forge-shift-proposal/` (future proposal). Each holds `fixture.json`,
  `render-diagram.mjs`, `README.md`, `.gitignore` (SVG + `/.claude/`), both PNGs, the HTML viewer and
  `verification.json`.
- Each script resolves the repo root with one line, `const RT=new URL('../../',import.meta.url);`
  (system `:8`, factory `:9`, shift `:9`); fonts, `tools/render.mjs` and Playwright load from `RT`. Outputs
  are written beside the script (`ROOT`). No other relative path in the scripts.
- References outside the folders (`git grep`): only history — `CHANGELOG.md` (3 entries),
  `PROJECT/3-COMPLETED/GH-55-…md`, `PROJECT/3-COMPLETED/GH-60-…md`, `relay-system/2026-10-14/gh55-*`,
  `relay-system/2026-10-16/gh60-*`. Nothing in `tools/`, `tools/catalog.sql`, `tools/design-log.jsonl`,
  `test-budget.json`, the canaries or root `README.md` names these folders, so the move touches no pinned or
  tested path. Inside the folders: v1 `README.md:3` links `../2026-10-12-belief-reference/README.md` (found
  by plan QA); factory `README.md:3` links `../2026-10-14-xyz-forge-system/README.md`;
  shift `README.md:3` links `../2026-10-15-xyz-forge-software-factory/README.md`; shift `fixture.json:71`
  (footer source) names `examples/2026-10-15-xyz-forge-software-factory/`; factory `render-diagram.mjs:7`
  comment names `examples/2026-10-14-xyz-forge-system/`; each README's replay command names its path.
- Pre-change witness: all three scripts rerun in place pass (`PASS: 77 / 86 / 73 text ids`) and leave the
  tree clean, so committed PNG/HTML/verification bytes reproduce on this machine.
- Prior-art search: `utils/py/prior_art_recon.py` in XYZ Forge (added `147987dcc`, 2026-09-24). `/start-task`
  runs it at step 1 (before creating any issue: open and recently merged PRs, issues in any state, the
  ledger; stop if an existing fix may already solve the ask) and again at step 4 (before authoring new
  utilities). Current captions: factory `nodes.startTask.caption` = "Fresh clone, recon, plan, Codex plan
  QA, build, gates, final QA."; shift `nodes.open.caption` = "Reads /daily, the RELEASES rank, open PRs and
  CI, and overnight /ate issues; checks the environment; proposes N budgeted items." Neither mentions it;
  nor does v1.
- Captions render in fixed-width label boxes; each script fails on container escape, Chromium overflow and
  text overlap, so a longer caption that does not fit is caught.
- Operator-requested `.gitignore` content, reported from the operator's primary checkout (added by Aider
  Studio): `# Aider Studio (auto-added)`, `REPO_MAP.md`, `.aider/`.
- Caption elements in the generated HTML: v2 `id="starttask_caption"`, shift `id="open_caption"`.
  `verification.json` holds ids, dimensions, digests and findings only, not caption text.
- Shift `render-diagram.mjs:42-45` builds node labels with `T` but registers no container for them
  (`:125` Open label; container checks `:183-184` cover registered ids only). Open's caption is auto-height,
  so a longer caption is caught by the pairwise text-overlap or canvas check (`:189`), not by container
  escape.

## Preflight bet check

- Outcome sought: one place to find the XYZ Forge diagrams, grouped by what they show (how it works today vs
  a proposal), and diagrams that include the duplicate check the factory really performs.
- Smallest viable bet: `git mv` the three folders, fix one root-path line per script and the in-folder
  links, edit two captions, re-render those two diagrams, add a short `examples/xyz-forge/README.md` index.
  Not built: no new node or edge in either diagram, no change to v1 content, no history rewrite, no
  renderer/recipe/catalog/test change.
- Alternatives rejected: (a) a new "Prior-art check" node — needs re-layout of dense diagrams for one
  step that is part of `/start-task` and the morning read; a caption states it where it runs; (b) rewriting
  old paths in CHANGELOG, completed plans and relay threads — those are dated records of what happened;
  (c) symlinks at the old paths — extra machinery for a path nobody outside the folders uses.
- Rollback: revert the commit(s); the moves are pure renames.

## Requirements

1. Moves (pure `git mv`, history preserved):
   `examples/2026-10-14-xyz-forge-system/` → `examples/xyz-forge/today/system-v1/`;
   `examples/2026-10-15-xyz-forge-software-factory/` → `examples/xyz-forge/today/software-factory-v2/`;
   `examples/2026-10-15-xyz-forge-shift-proposal/` → `examples/xyz-forge/future/shift-proposal/`.
2. Each script's `RT` becomes `new URL('../../../../',import.meta.url)`. In v1 only that line and the
   README path edits in requirement 3 change; its rendered outputs stay byte-identical.
3. In-folder references updated: v1's belief-reference link → `../../../2026-10-12-belief-reference/README.md`,
   the factory → v1 and shift → factory README cross-links, the three README replay commands, the shift
   footer source path, the factory script comment. Every relative link in the three READMEs and the index
   resolves from its new location.
4. Prior-art search in both lenses:
   - v2 `nodes.startTask.caption`: "Prior-art check, fresh clone, recon, plan, Codex plan QA, build, gates,
     final QA."
   - shift `nodes.open.caption`: "Reads /daily, the RELEASES rank, open PRs, CI and overnight /ate issues;
     runs a prior-art check to drop duplicates; checks the environment; proposes N budgeted items."
   - Wording may be shortened if the layout checks fail; the meaning (prior-art check, where it runs) stays.
   Re-render both; update their READMEs' reading notes and PASS lines where counts change.
5. `examples/xyz-forge/README.md`: a short index naming the two lenses and the three diagrams with links.
6. Root `.gitignore`: the three Aider Studio lines.
7. `CHANGELOG.md` entry.

## Non-goals

No change to v1's rendered content; no new diagram nodes or edges; no edits to history records
(CHANGELOG entries, `PROJECT/3-COMPLETED/*`, `relay-system/*`); no renderer, recipe, catalog, font or test
change.

## Acceptance checks

- v1 after the move: `node examples/xyz-forge/today/system-v1/render-diagram.mjs` passes and its committed
  PNG, Chromium PNG, HTML and `verification.json` are byte-identical to the pre-move files (git shows a pure
  rename, 100% similarity).
- v2 and shift: each script prints `PASS` with empty `findings`; the text of the generated HTML element
  `starttask_caption` (v2) / `open_caption` (shift) equals the new fixture caption exactly (stale HTML with
  the old caption fails this); the caption is visible in both PNGs, inspected at full size and at a
  ~1/3-scale thumbnail; two consecutive runs give identical digests.
- Red control (path): before fixing `RT` in the moved v1 script, running it fails to resolve
  `tools/render.mjs` (non-zero exit). After the fix → PASS.
- Red control (layout): an oversized shift `nodes.open.caption` (mutation chosen in the clone so it actually
  trips a check, starting from the caption repeated three times) → non-zero exit with a geometry finding
  that names `open_caption` (overlap or text outside canvas). A failure for any other field or an import
  error does not count. Record mutation, command, exit code, decisive finding and restored PASS in Evidence.
  The scripts read `fixture.json` beside themselves and resolve `RT` relative to the
  script, so the control edits the committed fixture in place after the good outputs are committed, then
  restores fixture and outputs with `git checkout -- <folder>` and reruns → PASS with a clean tree.
- `git grep` for the three old folder names returns only history: CHANGELOG entries, `PROJECT/3-COMPLETED/`,
  `relay-system/2026-10-14/`, `relay-system/2026-10-16/`, `relay-system/2026-10-18/` (this task's threads)
  and this plan's own recon and move mapping. No live link, replay command, script, fixture or index under
  `examples/` names an old path. On promotion, this doc's `related:` list points at the new paths.
- `node tools/catalog.mjs verify` valid; `utils/pdda/pdda.sh run` no new errors; `pnpm test` passes in a
  disposable clone.

## Ordered implementation

1. `git mv` the three folders; run the v1 red control; fix the three `RT` lines; v1 PASS and byte-identity.
2. In-folder link and path fixes; index README; `.gitignore` lines.
3. Caption edits; re-render v2 and shift; inspect PNGs; layout red control; README updates.
4. CHANGELOG; gates; final Codex QA; PR to `main`.

## Per-issue map

| Issue | Requirement | Clone / branch | State |
|---|---|---|---|
| [#65](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/65) | 1–7 | `XYZ-layout-engine-gh65-xyz-forge-lenses-2026-10-18` / `chore/…` | PR ready; awaiting merge |

## Rating rationale (2026-10-18)

`rated 30/10/50/75`. Severity 10: documentation examples; nothing at risk. Priority 30: no blocked work;
operator asked for it now. Appeal 50: neutral default. Effort 75: renames plus two caption edits on an
established pattern with existing layout checks. Recurrence: not applicable; trend unknown.

## Evidence

| Check | Result |
|---|---|
| Pre-change witness | three scripts rerun in place: `PASS` 77/86/73 text ids; tree clean afterwards |
| Plan QA | Codex, 2 rounds, Approved (`relay-system/2026-10-18/gh65-plan-qa.md`); S1 (missed v1 belief-reference link), S2 (caption check moved to HTML), S3 (red control targets `open_caption` geometry), S4 (old-path scan scope) applied; provenance nit applied |
| Path red control: v1 moved, `RT` still `../../` | exit 1; `Cannot find module '…/examples/xyz-forge/tools/render.mjs'` (`ERR_MODULE_NOT_FOUND`) |
| v1 after the `RT` fix | `PASS: 77 text ids and 5 icons`; `shasum -c` of the pre-move PNG, Chromium PNG, HTML and `verification.json` all OK (byte-identical); git records pure renames |
| v2 caption, first try ("Prior-art check, fresh clone, recon, plan, Codex plan QA, build, gates, final QA.") | exit 1; `starttask_caption` overlaps `marathon_label` (both backends) → shortened to "…plan, Codex QA, build, gates, final QA." (requirement 4 allows shortening) |
| v2 and shift renders | `PASS: 86 text ids and 2 icons` / `PASS: 73 text ids and 1 icons`; `findings: []`; generated HTML `starttask_caption` / `open_caption` text equals the fixture caption exactly; repeat runs identical (`verification.json` `6e70d4a1…`, `49db03c6…`) |
| Layout red control: shift `nodes.open.caption` tripled in place, after committing good outputs | exit 1; `overlapping text` `['routes_label','open_caption']` in Satori and Chromium; `git checkout -- examples/xyz-forge/future/shift-proposal` then rerun → PASS, tree clean |
| README links | every relative link in the index and three READMEs resolves (9 checked, 0 broken) |
| Old-path scan (`git grep` of the three old folder names) | only CHANGELOG, this plan, `PROJECT/3-COMPLETED/GH-55-…`, `GH-60-…`, `relay-system/2026-10-14/`, `2026-10-16/`, `2026-10-18/`; nothing under `examples/` |
| AS-10 | both new renders at full size: captions read, layout unchanged except the two captions; shift's five-line Open caption ends close above "ROUTES TO EXISTING SKILLS" (no overlap, tight). At ~1/3 scale node names, title and stage row survive; captions, the new text included, do not read (pre-existing; READMEs say fine captions need full size) |
| `node tools/catalog.mjs verify` | `valid: true` |
| `utils/pdda/pdda.sh run` | no errors; the same 2 governance warnings as GH-63 (`ROUTER.md:84`, `PDDA-INSTALL.md:347`), untouched files |
| `pnpm test` (disposable `--no-local` clone of `1c60f97`) | 4/4, `test-budget: PASS — 4 canaries in 43.6s (budget 60s)`; tree clean |
| Final QA | Codex, 1 round, Approved (`relay-system/2026-10-18/gh65-final-qa.md`); reviewer re-resolved all 9 links, confirmed caption/HTML equality and an empty old-path scan under `examples/`; one pre-existing nit (v2 says "seven" commands but lists six roles, `/review-pr` being an alias) |
| Diff hygiene (b38e0d3..HEAD) | v1 outputs are 100% renames; edits limited to the stated files, `.gitignore`, CHANGELOG, plan, relay threads, ledger; no `tools/`, `test-budget.json`, `.xyz`, `.claude`, `node_modules` or `.relay-scratch` paths; no home-directory paths |
| Post-approval copy fix (operator request, 2026-10-18) | dropped the numeral: v2 subtitle "Operator commands carry work…", README "the skills that move work", script comment names six nodes plus the `/review-pr` alias; v2 re-rendered `PASS: 86 text ids and 2 icons`, repeat identical (`e0964bbe…`), header inspected. Independent review did not run for this copy change; deterministic checks only |
