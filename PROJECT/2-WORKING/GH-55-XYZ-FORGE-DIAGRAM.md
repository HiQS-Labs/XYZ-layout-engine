---
gh_issue: 55
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/55
title: "Example: XYZ Forge system diagram in the belief-reference style"
goal: "Redraw the operator-supplied XYZ Forge system diagram in the belief-reference visual language as a one-folder example."
status: "PR ready; awaiting merge"
created: 2026-10-14
updated: 2026-10-15
owner: Claude
doc_type: feedback
effort: 1
complexity: 2
risk: 1
phases: 1
related:
  - examples/2026-10-12-belief-reference/README.md
  - examples/2026-10-09-rag-system/README.md
  - PROJECT/3-COMPLETED/GH-11-RAG-DIAGRAM-EXAMPLE.md
reversibility: "Easy — one new example folder, this doc, a changelog entry and the ledger row; no engine change."
---

# GH-55 — XYZ Forge system diagram in the belief-reference style

## Status

| What was just completed | What's next |
|---|---|
| Version 2 (software-factory skills, /ate) and a future-proposal diagram for XYZ-forge#1081 added on operator request; renders pass | Operator review of both versions and merge; then archive via merge-cleanup |

## Why

The operator supplied the XYZ Forge system diagram (a dark, neon-routed, box-in-box layout) and asked for
it to be redesigned with the look and feel of the belief-updating reference and saved under `examples/`.
The belief reference is the repo's current house style for explanatory plates, so the redraw also shows
that style carrying a system-architecture subject, not only a process model.

## Recon (base `ed56529`, 2026-10-14)

- `examples/2026-10-12-belief-reference/` renders through the `recursive-process` recipe, whose geometry is
  specific to the A/B/C belief model (`tools/recipes/recursive-process.mjs`, design contract
  `recursive-process.design.md`). It cannot carry a five-stage pipeline with side branches without a new
  recipe version, so reusing the recipe is not viable.
- `examples/2026-10-09-rag-system/render-diagram.mjs` is the precedent for a one-off example: it builds a
  Satori scene, calls the shared `renderSatori(scene, font, width, height, fontFamily)` and
  `renderPlaywright(context, scene, font, width, height, fontFamily)` from `tools/render.mjs`, writes both PNGs, a responsive HTML viewer and
  `verification.json`, and asserts containment, overflow and overlap. GH-11 landed it with no engine change.
- Belief-reference style tokens (from its fixture and design contract): background `#f5f3ec`, ink `#30373a`,
  muted `#657075`, rule `#cbd0d0`, surface `#eff2f1`, accent `#9cb8c5`; bundled Barlow Condensed
  (`tools/fonts/barlow-condensed/`), which lacks the arrow glyph, so formula arrows must be geometry.
- `renderSatori` returns `missingSegments`, so unsupported glyphs can be asserted, not just eyeballed.
- `test-budget.json` caps the suite at one test file and four tests; examples are not part of it.
- Chromium cannot launch inside the Claude Code macOS sandbox (mach-port `Permission denied (1100)`); the
  render must run un-sandboxed. Environment fact, not a code defect.

## Preflight bet check

- Outcome sought: a readable, house-style explainer of how XYZ Forge moves work from intake to delivery.
- Smallest viable bet: one example folder patterned on the RAG example. Not built: a new recipe or recipe
  version, catalog design registration, image generation, engine changes, new tests.
- Alternative rejected: extending `recursive-process` — its anchors are the belief model's; a forge
  variant would be a new recipe, far more than this ask needs.
- Rollback: delete the folder, this doc, the changelog entry and the ledger row.

## Requirements

1. `examples/2026-10-14-xyz-forge-system/` with `fixture.json` (all copy, palette roles), `render-diagram.mjs`
   (one owner for geometry; shared renderer; Barlow Condensed), both PNGs, responsive HTML,
   `verification.json`, `.gitignore` (SVG), README with visual direction and AS review.
2. Content parity with the source diagram: five stages (intake, planning, execution harness, verification
   gates, delivery), the four execution modes as alternatives, human operator routes (directs work,
   blocked/decision, approvals), revise/retry loop, agent CLI adapters, tick kernel, scoped workspaces,
   GitHub as external, three durable records, reusable skills. Stated simplifications are documented.
3. Style parity with the belief reference: palette, typography, rounded title panel, numbered stage
   markers with formulas, point-up hexagons on one reading line, thin slate connectors, one accent shape.
4. AS-7: schematic disclaimer and no-generated-imagery note in the footer.

## Non-goals

No recipe, catalog, engine or font change; no new test file or budget change; no image generation; no
catalog design registration (operator may request it after review).

## Acceptance checks

- `node examples/2026-10-14-xyz-forge-system/render-diagram.mjs` prints `PASS` (no unsupported glyphs,
  container escapes, Chromium overflow or text overlap in either backend; both PNGs 2000×1570).
- Red control: set `records.entries[0].caption` in `fixture.json` to the original caption repeated six
  times (it sits in the fixed-height `recbox0`, so it must overflow). Expected: non-zero exit with
  `rec0_caption` / `text escapes its container` (container `recbox0`). Restore the fixture and rerun to
  `PASS`. The command, mutation, exit status and decisive output go in the Evidence section below, since
  both runs overwrite `verification.json`. (Stage and runtime captions register no container, so they
  cannot exercise this check.)
- AS-10: both PNGs inspected at full size and a 420px thumbnail; README reports avoided patterns,
  exceptions and simplifications.
- `utils/pdda/pdda.sh run`: no new errors. `pnpm test` budget file unchanged (run in a space-free
  disposable clone, as the GH-11 evidence records a pre-existing failure in paths with spaces).

## Ordered implementation

1. Fixture and render script (drafted in the primary checkout, copied here unchanged).
2. Render; inspect both PNGs; fix layout; run the red control.
3. README, CHANGELOG entry.
4. PDDA gate and `pnpm test`; commit; final Codex relay QA; PR to `main`.

## Per-issue map

| Issue | Requirement | Clone / branch | State |
|---|---|---|---|
| [#55](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/55) | 1–4 above | `XYZ-layout-engine-gh55-xyz-forge-diagram-2026-10-14` / `feat/…` | PR ready; awaiting merge |

## Rating rationale (2026-10-14)

`rated 30/10/50/85`. Severity 10: a documentation example; no data or work at risk. Priority 30: no
blocked work; operator asked for it now. Appeal 50: neutral default, no preference stated. Effort 85: one
fixture and script patterned on an existing example, already drafted. Recurrence: not applicable (feature,
not a defect); trend unknown.

## Evidence

| Check | Result |
|---|---|
| Plan QA | Codex, 2 rounds, Approved (`relay-system/2026-10-14/gh55-plan-qa.md`, reviewed `9cea394`) |
| `node examples/2026-10-14-xyz-forge-system/render-diagram.mjs` (task clone, un-sandboxed) | exit 0, `PASS: 77 text ids and 5 icons; 2000x1570 in both backends; no unsupported glyphs, escapes, overflow or overlap.` Satori PNG byte-identical to the primary-checkout draft. |
| Red control: `records.entries[0].caption` repeated six times, via `python3 -c "import json;f=json.load(open('fixture.json'));c=f['records']['entries'][0]['caption'];f['records']['entries'][0]['caption']=' '.join([c]*6);open('fixture.json','w').write(json.dumps(f,indent=2,ensure_ascii=False)+'\\n')"` in the example folder, then `node render-diagram.mjs` | exit 1; findings `rec0_caption` and `rec0_label`, `text escapes its container`, container `recbox0`, in satori and chromium |
| Restore fixture, rerun | exit 0, same `PASS` line |
| AS-10 | Both PNGs viewed at full size; Satori PNG viewed at 420px wide. Reading line and harness hold at thumbnail size; captions need full size. |
| `utils/pdda/pdda.sh run` (task clone, `51eeaa6`) | exit 0, no errors; 2 governance warnings in untouched files (`ROUTER.md:82`, `utils/pdda/PDDA-INSTALL.md:347`) |
| `pnpm test` (disposable `--no-local` verify clone of `51eeaa6`, then removed) | 4 canaries pass, `test-budget: PASS — 4 canaries in 55.5s (budget 60s)`; `test-budget.json` unchanged; verify tree clean afterwards |
| Final QA | Codex, `relay-system/2026-10-14/gh55-final-qa.md`: R1 FAIL (F1 undisclosed harness read of PDDA docs → disclosed in README); R2 PASS but token closed with `release --to done` (driver refused, close-mismatch); R3 confirmation Approved and attested, reviewed head `42a2ded` |
| Environment | Chromium does not launch inside the Claude Code macOS sandbox (`bootstrap_check_in ... Permission denied (1100)`); renders ran un-sandboxed. |

### Version 2 (2026-10-15)

Operator asked for a version focused on the factory skills (`/daily`, `/start-task`, `/workhorse`, `/marathon`, `/merge-cleanup`, `/review-code`, `/review-pr`). Added `examples/2026-10-15-xyz-forge-software-factory/` with the same pattern. Skill roles grounded in `skills/*/SKILL.md` descriptions in HiQS-Labs/XYZ-forge and the deployed `/daily` skill; `/marathon` is drawn as shorthand for `/start-marathon` + `/pre-marathon` (no `/marathon` skill exists).

| Check | Result |
|---|---|
| `node examples/2026-10-15-xyz-forge-software-factory/render-diagram.mjs` | exit 0, `PASS: 86 text ids and 2 icons; 2200x1740 in both backends; no unsupported glyphs, escapes, overflow or overlap.` |
| Overlap check, observed during layout | exit 1, `overlapping text` `starttask_caption` / `marathon_label` in both backends; fixed by moving lower rows down 20px |
| AS-10 | Both PNGs at full size, a 440px thumbnail and crops of the /marathon area in both backends |
| `/ate` added on operator request | ATE grounded in `skills/4-occasional/ate/SKILL.md` and `utils/py/{adaptive_ate,fuzz_engine,domain_oracles,differential_oracle}.py`; rerender passes (86 text ids) |
| Independent review | Independent review did not run for version 2. |

### Future proposal diagram (2026-10-15)

Operator asked for the proposed `/shift` outer loop (filed as HiQS-Labs/XYZ-forge#1081) as a new diagram labelled "Future Proposal". Added `examples/2026-10-15-xyz-forge-shift-proposal/`.

| Check | Result |
|---|---|
| `node examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs` | exit 0, `PASS: 73 text ids and 1 icons; 2200x1500 in both backends; no unsupported glyphs, escapes, overflow or overlap.` |
| AS-10 | Both PNGs at full size |
| Independent review | Independent review did not run. |
