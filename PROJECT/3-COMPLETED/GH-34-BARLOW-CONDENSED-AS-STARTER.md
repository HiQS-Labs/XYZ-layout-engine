---
gh_issue: 34
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/34
title: "Barlow Condensed as the starter default font for new visual work"
status: Completed (2026-10-11; shipped in #35, AS-5 in #33)
created: 2026-10-11
owner: unassigned
doc_type: feedback
complexity: 2
risk: 1
effort: 2
phases: 1
ratings_provisional: true
non_goals:
  - TODO: what this explicitly is NOT (scope boundary).
related:
  - TODO: related files/docs, if any.
goal: >
  TODO: one-paragraph statement of what "done" looks like for this idea.
---

## Key concepts

- TODO: 2-4 bullets on what this idea concretely is and why it matters.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# Barlow Condensed as the starter default font for new visual work

## Status

| What was just completed | What's next |
|---|---|
| Captured via HQ (`/hq park`) for project **xyz-layout-engine** → repo `HiQS-Labs/XYZ-layout-engine`. The GitHub issue is the signal stream; this doc is the in-repo capture and back-reference. | Fill in Why/Key Concepts, correct the provisional ratings above, and run a Phase 0 explore pass before promoting to `2-WORKING`. |

## Idea

## Goal

Make **Barlow Condensed** the starter default font for *new* visual work (new diagrams, and new recipes once they exist), used whenever the user or the recipe names no font. Existing recipes and diagrams stay on Inter and byte-identical.

## Why it is scoped this way

- Today every recipe and diagram hard-codes `fontFamily: 'Inter'` and loads the one vendored Inter pair (`tools/spike/assets/font.ttf`, `font-bold.ttf`). `tools/render.mjs` defaults its family argument to `'Inter'`. No mechanism yet lets a recipe or user declare a font.
- Swapping the engine default would change every existing render. The nutrition and solar-system recipes are catalog-pinned, the drift canary would fail, and the RAG and cell-division design digests would change. An engine-level fallback should wait until a recipe or user can declare a font.
- The diagram "template" is the RAG example script, which `skills/design-diagram` copies. The new default therefore goes into the skill's copy step, not into RAG.

## Checklist

- [ ] Vendor Barlow Condensed Regular (400) and Bold (700) TTFs with the SIL Open Font License (`OFL.txt`), plus the source URL and sha256 of each file, under `tools/fonts/barlow-condensed/`.
- [ ] `skills/design-diagram/SKILL.md`: the copy step switches the copied script to Barlow Condensed (font files, the `renderSatori`/`renderPlaywright` family argument, the canvas `fontFamily`) unless the brief names another font.
- [ ] Proof that it renders: a scratch render in both backends draws Barlow Condensed, not a fallback. Chromium reports the font loaded, and the measured text is narrower than Inter.
- [ ] Existing output unchanged: `pnpm test` passes (C2 drift canary) and `catalog verify` is valid.
- [ ] `SYSTEM-INSTRUCTIONS.md` AS-5 (PR #33) names Barlow Condensed as the starter default.

## Out of scope

Engine-level font declaration and fallback; changing any existing recipe, diagram or font.

## Why

TODO: why this matters now -- what prompted it, what breaks or slows without it.

## Phase 0 — Explore & scope

### Checklist

- [ ] TODO: scope-specific checklist items for this idea's Phase 0 pass.

### QA checklist — Phase 0

- [ ] TODO: acceptance criteria for the Phase 0 pass above.

## Rating rationale (2026-10-11)

- `rated 45/10/70/85` (pri/sev/appeal/effort).
- Severity 10: an enhancement, not a defect; nothing is lost or blocked without it.
- Priority 45: the operator asked for it now, but nothing waits on it.
- Appeal 70: interpreted from the operator's explicit request ("Could we use Barlow Condensed as default starter font?"); labelled as an interpretation, not an operator-supplied number.
- Effort 85 (cheap): vendored files plus documentation edits, with no engine code change.
- Recurrence: not applicable (no defect class).

## Plan (simple change; plan QA skipped with reason)

This is a simple, local, reversible change with no uncertain behaviour: vendor files and edit documentation, with no engine or recipe code touched. The design decisions (scope to new work only, `tools/fonts/`, edits made in the skill's copy step) were settled with the operator in conversation and are written into the issue. Final Codex QA still applies.

1. Vendor the TTFs, `OFL.txt` and `SOURCE.md` under `tools/fonts/barlow-condensed/`, pinned to the google/fonts commit, with sha256 values.
2. Add the starter-font step to `skills/design-diagram/SKILL.md`: three exact edits to the copied script, plus a known trap on mismatched family names.
3. Probe: a scratch render in both backends with the skill's exact edits. Chromium's `fontLoaded` must be true, and the measured text must be narrower than Inter.
4. Gates: `pnpm test` (C2 drift and goldens unchanged), `catalog verify`, `utils/pdda/pdda.sh run`.
5. AS-5 line: added on the PR #33 branch; merge this PR first.
