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
reversibility: "Easy — one example folder, one vendored font folder, an AS-5 wording change, this doc, a changelog entry and the ledger row; tools/render.mjs unchanged."
---

# GH-60 — "Why your skill never runs" Claude Skills plate

## Status

| What was just completed | What's next |
|---|---|
| Example built and verified; renderer change reverted after the catalog-pin finding (operator decision below) | Final Codex QA, then PR to `main` |

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

1. ~~`tools/render.mjs`: optional `font.faces`~~ — superseded 2026-10-16 (see "Scope change after
   implementation"): the example runs Satori and Chromium itself with all four faces, reusing the shared
   `toDocument` HTML; `tools/render.mjs` stays unchanged. Chromium must report all four faces loaded.
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
7. Operator request (2026-10-16, mid-task): fonts stay flexible. AS-5 now says a supplied reference design
   is matched with the closest Google Fonts family, vendored with license and hashes (as here); with no
   reference, dense diagrams use Barlow Condensed. Wording only; an engine-level loader for arbitrary
   families and styles is a follow-up, because `tools/render.mjs` is catalog-pinned.

## Non-goals

No recipe, catalog, PDF export, or engine change; no new test file or budget change;
no image generation.

## Acceptance checks

- `node examples/2026-10-16-skill-trigger/render-diagram.mjs` prints `PASS` (no unsupported glyphs,
  container escapes, Chromium overflow or text overlap in either backend; both PNGs 1920×1920; Chromium
  reports the Alegreya family loaded).
- Red control: repeat `subtitle` in `fixture.json` six times (it sits in a fixed-height container).
  Expected: non-zero exit with `text escapes its container`. Restore and rerun to `PASS`.
- ~~Renderer back-compat~~ — moot after the scope change; instead `node tools/catalog.mjs verify` is valid
  and `tools/render.mjs` has no diff against the base.
- Face red control: withhold the italic `@font-face` rules. Expected: non-zero exit with
  `Alegreya faces not all loaded`.
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
| [#60](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/60) | 1 (as superseded)–7 | `XYZ-layout-engine-gh60-skill-trigger-plate-2026-10-16` / `feat/…` | Built and verified; final QA pending |

## Rating rationale (2026-10-16)

`rated 30/10/50/70`. Severity 10: a documentation example; no data or work at risk. Priority 30: no
blocked work; operator asked for it now. Appeal 50: neutral default, no preference stated. Effort 70: an
established example pattern, plus a small renderer option and a font vendoring. Recurrence: not
applicable (feature, not a defect); trend unknown.

## Scope change after implementation (2026-10-16)

`pnpm test` in a disposable clone failed 2 of 4 canaries with `catalog verify` reporting
`tools/render.mjs` `modified declared file`. Three published recipe versions pin that file
(`tools/catalog.sql`), so any edit means republishing those recipes, which is Costly and overlaps open PRs
#49, #52 and #53. Plan QA did not catch this. The operator chose an example-local render over republishing
or dropping italics. The renderer hunk was reverted. The example now runs Satori + resvg and Chromium itself
(`renderBoth`) on the shared `toDocument` HTML, plus two italic `@font-face` rules. That is a stated,
contained second render path. The artifact digests matched the earlier renderer-change output byte for byte.

## Evidence

| Check | Result |
|---|---|
| Plan QA | Codex, 1 round, Approved (`relay-system/2026-10-16/gh60-plan-qa.md`, reviewed `0234445`); nits on digest snapshot and red-control evidence accepted |
| Pre-change witness | Shift-proposal rerun before any edit reproduced all three committed digests (png `871a6036…`, chromiumPng `1f28135b…`, html `240be6e6…`) |
| Renderer option (since reverted) | The same three digests stayed identical with the option present |
| `pnpm test` with renderer change (disposable clone, `f88d118`) | FAIL: canaries 1 and 3, `catalog verify` `modified declared file` `tools/render.mjs` → scope change above |
| `node tools/catalog.mjs verify` after revert | `valid: true`, no errors |
| `node examples/2026-10-16-skill-trigger/render-diagram.mjs` (un-sandboxed) | exit 0, `PASS: 16 text ids; 1920x1920 in both backends; no unsupported glyphs, escapes, overflow or overlap.`; `loadedFaces` = 400/700 normal and italic |
| Repeatability | Two consecutive runs gave identical paper, PNG, Chromium PNG and HTML digests |
| Red control: subtitle repeated six times via `python3 -c "import json;f=json.load(open('fixture.json'));f['subtitle']=' '.join([f['subtitle']]*6);…"` | exit 1; `subtitle` `text escapes its container` `subtitle_box` and `text overflow` (Chromium; Satori clips the span to its fixed-height box and does not flag it). Restored: exit 0, `verification.json` byte-identical to the pre-control run |
| Red control: italic `@font-face` injection disabled (temporary copy of the script) | exit 1; `Alegreya faces not all loaded`, loaded `400/normal, 700/normal` |
| Layout observed during iteration | Chromium flagged the subtitle wrapping to three lines at 900px wide; widened to 960 |
| AS-10 | Both PNGs at full size and a 480px thumbnail, compared with the source |
| `utils/pdda/pdda.sh run` | no errors; 33 governance warnings, none in files this change touches |

