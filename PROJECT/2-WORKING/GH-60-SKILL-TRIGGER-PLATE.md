---
gh_issue: 60
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/60
title: "Example: \"Why your skill never runs\" Claude Skills plate in a parchment style"
goal: "Recreate the operator-supplied Claude Skills trigger plate as a one-folder example rendered through the shared renderer."
status: "In progress — plan QA Approved (Codex, round 1)"
created: 2026-10-16
updated: 2026-10-16
owner: Claude
doc_type: feedback
effort: 2
complexity: 2
risk: 1
phases: 1
related:
  - PROJECT/3-COMPLETED/GH-55-XYZ-FORGE-DIAGRAM.md
  - examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs
  - tools/render.mjs
reversibility: "Easy — one example folder, one vendored font folder, an optional renderer parameter that defaults to today's behaviour, this doc, a changelog entry and the ledger row."
---

# GH-60 — "Why your skill never runs" Claude Skills plate

## Status

| What was just completed | What's next |
|---|---|
| Plan QA Approved by Codex in round 1 (`relay-system/2026-10-16/gh60-plan-qa.md`) | Implement steps 1–4 |

## Why

The operator supplied a square explainer plate ("CLAUDE SKILLS — Why your skill *never runs*") and asked
for it to be recreated as a new example folder. Its message: a skill loads only when the prompt reaches
the skill's description; the description is the trigger. Its style differs from every existing example:
aged parchment with watercolor stains, a hand-drawn double frame, a terracotta serif title whose second
line is italic, charcoal ink drawings and ink splatter.

## Recon (base `ece1fed`, 2026-10-16)

- One-off examples follow `examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs` (GH-55
  precedent): a fixture holds all copy and palette roles, the script owns geometry, builds a Satori scene,
  calls the shared `renderSatori` / `renderPlaywright` from `tools/render.mjs`, writes both PNGs, a
  responsive HTML viewer and `verification.json`, and asserts glyph coverage, canvas and container
  containment, Chromium overflow and pairwise text overlap.
- `tools/render.mjs` registers exactly two faces of one family: `renderSatori` (line 31),
  `measureLongestWords` (line 82) and `toDocument` (lines 127-128, `@font-face` with weights 400/700, no
  style). The plate needs regular, bold, italic and bold italic of one serif. There is no way to pass an
  italic face today.
- Vendored fonts are Barlow Condensed (`tools/fonts/barlow-condensed/`, OFL, with `SOURCE.md`) and Inter
  (`tools/spike/assets/`), both sans. AS-5 allows adding a font as a deliberate change with its license
  recorded.
- Alegreya (Huerta Tipográfica, OFL 1.1) closely matches the source's display serif. The upstream repo
  ships only variable TTFs, which Satori's font parser does not instance. `@fontsource/alegreya@5.1.0`
  ships static latin WOFF files for 400/700 normal and italic; Satori and Chromium both read WOFF.
- Open PR #52 also edits `tools/render.mjs`; a small additive change keeps any merge conflict trivial.
- Chromium cannot launch inside the Claude Code macOS sandbox; renders run un-sandboxed (GH-55 evidence).
- `test-budget.json` caps the suite; examples are not part of it. `AGENTS.md`: no new tests.

## Preflight bet check

- Outcome sought: a faithful, house-rendered recreation of the plate that passes the repo's layout checks.
- Smallest viable bet: one example folder patterned on the GH-55 examples, one vendored serif, and one
  optional renderer parameter for extra faces. Not built: recipe, catalog entry, tagged PDF, image
  generation, new tests.
- Alternatives rejected: (a) Barlow Condensed only — no serif and no italic, so the plate's main voice is
  lost; (b) calling Satori directly from the example — a second render path beside the shared owner;
  (c) smuggling the italic face in as the "bold" slot — makes `fontWeight: 700` mean italic, misleading
  and unusable for the bold title.
- Rollback: delete the example folder and `tools/fonts/alegreya/`, revert the renderer hunk.

## Requirements

1. `tools/render.mjs`: optional `font.faces` array of `{ data, weight, style }`, appended to the Satori
   font list in `renderSatori` and `measureLongestWords`, and emitted as extra `@font-face` rules (with
   `font-style`) in `toDocument`. Absent `faces` produces byte-identical output to today.
2. `tools/fonts/alegreya/`: the four WOFF files, `OFL.txt`, `SOURCE.md` (origin URL, version, license).
3. `examples/2026-10-16-skill-trigger/` with `fixture.json` (all copy, palette roles, type sizes),
   `render-diagram.mjs` (one geometry owner), both PNGs at 1920×1920, responsive HTML, `verification.json`,
   `.gitignore` (SVG), README with visual direction and the AS report.
4. Content parity: kicker, two-line title, subtitle, PROMPT tag with "build a dossier", dashed arrow to the
   DESCRIPTION banner labelled "the trigger", "?" diamond and arrow to the stacked SKILL card ("loads in
   full", "instructions · examples · resources"), dashed miss branch "wrong words, skill never seen",
   closing line "the description is the trigger".
5. Style parity: parchment ground with watercolor stains, hand-drawn double frame, terracotta display
   type, italic second title line, charcoal ink line work, scroll-finial banner, ink splatter. Texture is
   procedural (seeded SVG turbulence rasterized once by resvg and embedded as an image), so both backends
   share identical pixels for it.
6. AS-7: a small footer note outside the frame: recreation of an operator-supplied plate, procedural
   texture, no generated imagery.

## Non-goals

No recipe, catalog, PDF export, or engine change beyond requirement 1; no new test file or budget change;
no image generation.

## Acceptance checks

- `node examples/2026-10-16-skill-trigger/render-diagram.mjs` prints `PASS` (no unsupported glyphs,
  container escapes, Chromium overflow or text overlap in either backend; both PNGs 1920×1920; Chromium
  reports the Alegreya family loaded).
- Red control: repeat `subtitle` in `fixture.json` six times (it sits in a fixed-height container).
  Expected: non-zero exit with `text escapes its container`. Restore and rerun to `PASS`.
- Renderer back-compat: rerun `node examples/2026-10-15-xyz-forge-shift-proposal/render-diagram.mjs`;
  its Satori PNG digest equals the committed `verification.json` `artifactDigests.png`.
- AS-10: both PNGs inspected at full size and a ~480px thumbnail, side by side with the source.
- `utils/pdda/pdda.sh run`: no new errors. `pnpm test` passes in a disposable space-free clone.

## Ordered implementation

1. Renderer `faces` option; back-compat digest check.
2. Vendor Alegreya with license and source note.
3. Fixture and render script; iterate on layout against the source; red control.
4. README, CHANGELOG entry; PDDA gate and `pnpm test`.
5. Final Codex relay QA; PR to `main`.

## Per-issue map

| Issue | Requirement | Clone / branch | State |
|---|---|---|---|
| [#60](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/60) | 1–6 above | `XYZ-layout-engine-gh60-skill-trigger-plate-2026-10-16` / `feat/…` | Planned |

## Rating rationale (2026-10-16)

`rated 30/10/50/70`. Severity 10: a documentation example; no data or work at risk. Priority 30: no
blocked work; operator asked for it now. Appeal 50: neutral default, no preference stated. Effort 70: an
established example pattern, plus a small renderer option and a font vendoring. Recurrence: not
applicable (feature, not a defect); trend unknown.

## Evidence

Pending.
