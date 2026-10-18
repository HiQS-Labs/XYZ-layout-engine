---
gh_issue: 65
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/65
title: "XYZ Forge examples: one folder with today/future lenses; add the prior-art search to both"
goal: "Group the three XYZ Forge diagrams under examples/xyz-forge/{today,future}/ and show the prior-art search where the factory runs it."
status: "Captured — plan drafted, awaiting plan QA"
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
  - examples/2026-10-14-xyz-forge-system/
  - examples/2026-10-15-xyz-forge-software-factory/
  - examples/2026-10-15-xyz-forge-shift-proposal/
reversibility: "Easy — three folder moves (git mv), one relative-path line per script, two caption edits with re-rendered outputs, link fixes, a .gitignore hunk, this doc, a changelog entry and the ledger row."
---

# GH-65 — XYZ Forge examples: one folder, two lenses, prior-art search shown

## Status

| What was just completed | What's next |
|---|---|
| Issue filed, clone provisioned off `origin/main` (`b38e0d3`), pre-change witness run, plan drafted | Codex plan QA, then promote to 2-WORKING |

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
  tested path. Inside the folders: factory `README.md:3` links `../2026-10-14-xyz-forge-system/README.md`;
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
- Primary checkout `.gitignore` carries an uncommitted hunk added by Aider Studio:
  `# Aider Studio (auto-added)`, `REPO_MAP.md`, `.aider/`.

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
2. Each script's `RT` becomes `new URL('../../../../',import.meta.url)`; nothing else in v1 changes.
3. In-folder references updated: the two README cross-links, the three README replay commands, the shift
   footer source path, the factory script comment.
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
- v2 and shift: each script prints `PASS`; the new caption text appears in its `verification.json` text and
  in both PNGs (inspected); two consecutive runs give identical digests.
- Red control (path): before fixing `RT` in the moved v1 script, running it fails to resolve
  `tools/render.mjs` (non-zero exit). After the fix → PASS.
- Red control (layout): a temporary fixture copy with the shift open caption repeated three times →
  non-zero exit with a container-escape or overflow finding (shows the new caption is still inside a
  checked container). Restore → PASS. The scripts read `fixture.json` beside them, so the control runs
  against a temporary copy of the folder outside the repo tree, not the committed file.
- `git grep` for the three old folder names returns only history files (CHANGELOG, `PROJECT/3-COMPLETED/`,
  `relay-system/2026-10-14/`, `relay-system/2026-10-16/`).
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
| [#65](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/65) | 1–7 | `XYZ-layout-engine-gh65-xyz-forge-lenses-2026-10-18` / `chore/…` | Plan drafted |

## Rating rationale (2026-10-18)

`rated 30/10/50/75`. Severity 10: documentation examples; nothing at risk. Priority 30: no blocked work;
operator asked for it now. Appeal 50: neutral default. Effort 75: renames plus two caption edits on an
established pattern with existing layout checks. Recurrence: not applicable; trend unknown.

## Evidence

| Check | Result |
|---|---|
| Pre-change witness | three scripts rerun in place: `PASS` 77/86/73 text ids; tree clean afterwards |
| Plan QA | pending |
