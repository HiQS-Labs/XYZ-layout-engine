---
gh_issue: 63
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/63
title: "Example: \"The Vibe-Coding Loop\" diagram with small PNG cutouts, in the nutrition-infographic lens"
goal: "Render the operator-reviewed Vibe-Coding Loop diagram as a one-folder example with generated transparent cutouts, AS-11 ground shadows and an AS-12 type scale."
status: "In progress — plan QA Approved (Codex, round 2), implementing"
created: 2026-10-17
updated: 2026-10-17
owner: Claude
doc_type: feedback
effort: 2
complexity: 2
risk: 1
phases: 1
related:
  - PROJECT/3-COMPLETED/GH-60-SKILL-TRIGGER-PLATE.md
  - PROJECT/3-COMPLETED/GH-44-NUTRITION-DESIGN-README.md
  - examples/2026-10-16-skill-trigger/render-diagram.mjs
  - examples/2026-10-13-nutrition-infographic/
  - tools/render.mjs
  - tools/request.mjs
reversibility: "Easy — one new example folder, this doc, a changelog entry and the ledger row. No engine, recipe or catalog change."
---

# GH-63 — "The Vibe-Coding Loop" diagram with small PNG cutouts

## Status

| What was just completed | What's next |
|---|---|
| Plan QA Approved by Codex in round 2 (`relay-system/2026-10-17/gh63-plan-qa.md`) | Generate cutouts, build the example |

## Why

The operator supplied a "Vibe-Coding Loop" slide (diagram 4/7) whose dashed ring ran through its numbered
circles and labels, had no direction, treated "Repeat until done" as a fifth step, and left the caption out
of step with the nodes. A Claude Design canvas redesign (reviewed by the operator, 2026-10-17) fixed the
structure: four cards in a 2×2 cycle, You/AI actor colouring, "repeat until done" on the return arrow, step
03 as the decision ("not yet" → refine, "it works" → **Ship it** exit), and a schematic footer. The operator
now wants it as a repo example, richer and with small graphics, through the lens of the nutrition
infographic: a `DESIGN.md` brief, a fixture that owns copy and palette, AS-12 `% of S` type, and transparent
AI-generated PNG cutouts with AS-11 directional ground shadows. Operator choices (2026-10-17): graphics are
generated PNG cutouts; lifecycle is `/start-task`.

## Recon (base `6facd4c`, 2026-10-17)

- One-off examples follow `examples/2026-10-16-skill-trigger/render-diagram.mjs` (GH-55/GH-60 precedent):
  the fixture holds copy, palette roles and type; the script owns geometry, builds a Satori scene, calls the
  shared `renderSatori` / `renderPlaywright` from `tools/render.mjs`, writes both PNGs, an HTML viewer and
  `verification.json`, and asserts glyph coverage, containment, Chromium overflow and pairwise text overlap.
- Generated cutouts follow the nutrition example: `artwork.json` (shared style string + per-asset subject,
  AS-9), `provenance.json` (prompt, model, endpoint, alpha check, source and display SHA-256), sanitized
  receipts, web-sized PNGs in `assets/web/`, loaded through `readPinnedPngs` (`tools/request.mjs:52`), which
  checks each display file against its pinned hash.
- AS-11 ground shadows exist only inside `tools/recipes/nutrition.mjs:60-95` (`groundShadowUri`: two SVG
  radial-gradient ellipses, contact + directional cast, from an upper-right light). That file is pinned by
  published `nutrition` versions, so it is not imported or edited; the example reproduces the same
  two-ellipse technique locally with its own per-asset numbers.
- Web downscaling: `examples/2026-10-09-cell-division/make-web-asset.mjs` / `tools/spike/downscale-assets.mjs`.
- Image generation: the installed `hiqs-image` skill (HiQS chain `image` mode). Each run is one paid OpenAI
  call; transparency is verified on the saved file (`alpha.verified`).
- Barlow Condensed is vendored (`tools/fonts/barlow-condensed/`, 400 and 700) and is the AS-5 default when
  no reference names a font. All copy here is short (≤ 40 characters per line), so no body face is added.
- `tools/render.mjs`, `tools/request.mjs` and the recipe modules are pinned by published recipe versions
  (GH-60 scope change); `tools/catalog.sql` is the canonical catalog dump, not a pinned file. The example
  imports pinned modules but edits none of them, and adds no catalog row.
- Chromium cannot launch inside the Claude Code macOS sandbox; renders run un-sandboxed (GH-55/60 evidence).
- `AGENTS.md` allows a new test only for a named material gap; `test-budget.json` counts test-like files
  anywhere. This task names no such gap and adds none.
- Prior art: no open PR, issue or roadmap row for this subject (`prior_art_recon.py`, `gh issue list`).

## Preflight bet check

- Outcome sought: a house-rendered, legible-on-a-phone version of the loop diagram that teaches the cycle at
  a glance, with small illustrations that depict each step (AS-8), passing the repo's layout checks.
- Smallest viable bet: one example folder patterned on GH-60's render script plus the nutrition asset
  pipeline. Not built: recipe, catalog entry, engine change, new font, PDF, new tests.
- Alternatives rejected: (a) a new recipe + catalog entry like `nutrition` — a recipe earns its keep when
  reused across fixtures; one diagram is the GH-55/60 one-off pattern; (b) vector SVG icons — the operator
  chose generated cutouts; (c) importing `groundShadowUri` from `nutrition.mjs` — it is unexported, private
  to a pinned recipe, and sized to that recipe's assets.
- Rollback: delete the example folder; revert the doc, changelog and ledger rows.

## Visual direction (AS report, before composing)

- Reader: someone new to building with AI, scanning one slide of a seven-slide deck on a phone or projector.
  Takeaway: you steer a repeating loop; the AI only drafts.
- Canvas `1600 × 1200`, `S = Math.min(W, H) = 1200`. Type scale computed in the script as
  `px = Math.round(S * pct)`, four sizes only:

  | Role | % of S | px | Used for |
  |---|---|---|---|
  | Headline | 8.0% | 96 | title |
  | Subhead | 3.0% | 36 | the "conversation" line |
  | Label | 2.4% | 29 | card titles, eyebrow, legend, actor tags |
  | Body | 1.9% | 23 | card captions, arrow labels, steering line, footer |

  Headline : body = 4.17 : 1.
- Hierarchy decisions: (1) the loop of four cards takes the centre and most of the canvas; the exit card is
  smaller and visually secondary (dashed outline); (2) actor colour (You blue, AI orange) carries the
  "you steer" message instead of extra copy; (3) the return arrow and "repeat until done" are the strongest
  connector (actor blue, heavier), the other arrows neutral.
- Each card holds its cutout standing on the card's floor line, left of the text, with a two-layer ground
  shadow (AS-11) from one upper-right light. Cutouts in a row share a baseline.
- Palette roles in the fixture: ground, ink, muted ink, rule, you-fill/you-line/you-ink, ai-fill/ai-line/
  ai-ink, exit-line/exit-ink, connector. No gradients, glows or sparkles (AS-2).

## Requirements

1. `examples/2026-10-17-vibe-coding-loop/fixture.json`: all copy (from the canvas, kept verbatim except
   where AS-12 forces shortening), palette roles, type percentages, asset ids.
2. `DESIGN.md` for the example, following the repo's `DESIGN.md` authoring profile: reader, takeaway,
   palette roles, type scale, layout grid, asset style, AS exceptions.
3. `artwork.json` with one shared style string and five subjects — `idea` (speech bubble with a small
   light bulb), `code` (a stack of code sheets / editor window), `live` (a small monitor showing a running
   app), `refine` (a pencil adjusting a UI card), `ship` (a parcel with a small rocket or launch arrow).
   Generated transparent through `hiqs-image`, `1024x1024`, quality high. Budget: at most 10 paid calls in
   total (5 + up to 5 retries); stop and report if exceeded.
4. `provenance.json`, sanitized `receipts/`, `assets/web/` PNGs (max side 512 px), alpha verified
   (`opaqueCornerCount: 0`). `ASSETS.md` table as in the nutrition example. AS-7: README and footer disclose
   AI-generated imagery.
5. `render-diagram.mjs`: one geometry owner; loads cutouts with `readPinnedPngs`; renders both backends via
   `renderSatori` / `renderPlaywright`; writes `vibe-coding-loop.png`, `vibe-coding-loop-chromium.png`,
   `vibe-coding-loop.html`, `verification.json`; fails non-zero on unsupported glyphs, container escapes,
   Chromium overflow, text overlap, or any AS-12 check (≤ 4 distinct sizes, body ≥ 1.8% S, headline 7–10% S,
   headline:body ≥ 4, headline width 50–85% W, largest cutout ≤ 3× headline cap height, label ≥ 70% of icon
   height where a label pairs with a legend swatch).
6. README with the AS-1..AS-12 report (patterns avoided, exceptions, measured AS-12 numbers, inspection
   sizes, squint/three-tier and phone-readability observations) and replay commands.
7. Content parity with the canvas (checked in the AS-10 pass; no new automated gate):
   - Header: "The Vibe-Coding Loop"; "Building with AI is a conversation, not a download."; "You stay in the
     loop, steering what the AI produces."; eyebrow "DIAGRAM · 4/7".
   - Legend: "You — steer and judge", "AI — writes the code".
   - Cards: 01 · YOU "Describe your idea"; 02 · AI "AI generates code"; 03 · YOU "You see it live";
     04 · YOU "You refine it"; EXIT "Ship it".
   - Connectors: 01→02→03 forward; 03→04 labelled "not yet"; 04→01 directed return labelled "repeat until
     done"; 03→Ship labelled "it works". No connector crosses a card, cutout or label.
   - Footer: schematic note plus AI-imagery disclosure.

## Non-goals

No recipe, catalog, renderer, font or test change. No PDF export. No edit to the nutrition example.

## Acceptance checks

- `node examples/2026-10-17-vibe-coding-loop/render-diagram.mjs` (un-sandboxed) exits 0 with `PASS`; both
  PNGs are 1600×1200; `verification.json` records the AS-12 measurements and artifact digests.
- Repeatability: two consecutive runs give identical PNG, Chromium PNG and HTML digests.
- Red control 1 (containment): one card caption repeated four times in a temporary fixture → non-zero exit
  naming `text escapes its container`. Restore → `PASS`, byte-identical `verification.json`.
- Red control 2 (pinning): replace one `assets/web/` PNG with a different, structurally valid PNG (another
  asset's file) under the same id, provenance unchanged → non-zero exit with `display digest mismatch`
  (an appended byte is rejected earlier by the PNG validator, `tools/spike/assets.mjs:28-33`, and would not
  exercise the digest check). Restore → `PASS`.
- Red control 3 (AS-12): body percentage set to 0.014 in a temporary fixture → non-zero exit naming the
  body floor. Restore → `PASS`.
- Alpha: every asset `alpha.verified: true`, `opaqueCornerCount: 0` in `provenance.json`.
- AS-10: both PNGs inspected at full size, 533 px (1/3 scale) and 400 px wide.
- `utils/pdda/pdda.sh run`: no new errors. `pnpm test` passes in a disposable clone; `node tools/catalog.mjs
  verify` stays valid (nothing pinned changed).

## Ordered implementation

1. `artwork.json`, generate five cutouts into a scratch folder, inspect cohesion and alpha, regenerate within
   budget, downscale into `assets/web/`, write `provenance.json`, receipts and `ASSETS.md`.
2. `fixture.json` and `DESIGN.md`.
3. `render-diagram.mjs`; iterate layout and shadows against the canvas; run red controls.
4. README, CHANGELOG entry; PDDA gate and `pnpm test` in a disposable clone.
5. Final Codex relay QA; PR to `main`.

## Per-issue map

| Issue | Requirement | Clone / branch | State |
|---|---|---|---|
| [#63](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/63) | 1–7 | `XYZ-layout-engine-gh63-vibe-coding-loop-2026-10-17` / `feat/…` | Implementing |

## Rating rationale (2026-10-17)

`rated 30/10/50/55`. Severity 10: a documentation example; no data or work at risk. Priority 30: no blocked
work; operator asked for it now. Appeal 50: neutral default, no score given. Effort 55: an established
example pattern, plus five paid image generations, asset provenance and shadow tuning. Recurrence: not
applicable (feature); trend unknown.

## Evidence

| Check | Result |
|---|---|
| Plan QA | Codex, 2 rounds, Approved (`relay-system/2026-10-17/gh63-plan-qa.md`); R1 (pinning red control reached PNG validation, not the digest) fixed; parity and recon nits applied |
