---
gh_issue: 36
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/36
title: "Recursive-process recipe and a belief-updating example diagram"
status: "Planned; awaiting Codex plan QA"
created: 2026-10-11
updated: 2026-10-11
owner: unassigned
doc_type: feedback
complexity: 3
risk: 2
effort: 3
phases: 4
ratings_provisional: false
branch: feat/gh36-recursive-process (base origin/main at da97d78)
reversibility: "Easy: a new module, new example folder and new catalog rows (rebuilt from the dump); the render.mjs font change is additive and leaves recipes without a FONT export byte-identical."
non_goals:
  - Phase B grid core (#20, deferred) and any `layout_id` value; the design log line keeps layout fields null.
  - An engine-wide font fallback; changing the font of nutrition or solar-system.
  - Variable stage counts, per-band responsive layouts, AI-generated raster art.
  - New npm dependency, new test file or test() block, CI workflow, or test-budget change.
related:
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/21
  - https://github.com/HiQS-Labs/XYZ-layout-engine/issues/34
  - SYSTEM-INSTRUCTIONS.md
  - tools/fonts/barlow-condensed/SOURCE.md
goal: >
  A third trusted recipe, `recursive-process@1.0.0`, renders the "recursive process" diagram type
  through the shared `processRequest` with text fit and containment, in Barlow Condensed, both
  backends. A new example `examples/2026-10-11-belief-updating/` renders the operator's reference
  topic through it, is recorded as a design (with its #21 log line), and follows the AS rules with
  the required report. Existing recipes, diagrams and goldens stay byte-identical.
---

## Key concepts

- A **recipe** here is a trusted module selected by name in `processRequest`. It exports `name`, `version`, `TEXT_IDS`, `CONTAINMENT`, `DEFAULT_SIZES`, `validate(fixture)` and `buildScene(fixture, sizes)`. Its example `fixture.json` is the pinned schema that `validateFixtureShape` checks a fixture against, so array lengths are fixed.
- The **diagram type**: numbered stage columns; a formula row per stage (A₁ → B₁ → C₁); an activating event; hexagon state nodes; consequence cards with a polarity (negative or positive); a branch from a later state to an examination step and a revised outcome; a continuous-revision arrow with a trail of later states.
- **Starter font**: Barlow Condensed (#34). It has no subscript digits (U+2080–2084) and no `→` (U+2192), measured from the font's `cmap`. Subscripts are therefore drawn as a smaller, lowered digit span, and arrows are SVG.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# GH-36 — Recursive-process recipe and a belief-updating example

## Status

| What was just completed | What's next |
|---|---|
| Issue, clone, capture promoted to this plan, ledger row rated `50/10/75/45`, recon at `da97d78`. | Codex plan QA, then build Phases 1–4. |

## Observed current state (`da97d78`)

| Area | Fact | Source |
|---|---|---|
| Recipe selection | An if-chain picks `nutrition` or `solar-system`; anything else is "unsupported recipe identity". | `tools/render.mjs:183-189` |
| Admission | The recipe allow-list, fixture-id inference and recipe-owned canvas are hard-coded for the two recipes. | `tools/request.mjs:59-68` |
| Fonts | `processRequest` loads Inter via `getFonts()` and passes the literal `'Inter'` at five call sites; the renderers default the family to `'Inter'`. | `tools/render.mjs:24,110,130,193,229,232,234,333,336` |
| Pinned files | Both recipes pin `tools/spike/assets.mjs` (which loads Inter), so font loading must not change there; `render.mjs` and `request.mjs` are not pinned. | `tools/catalog.mjs:123-135` |
| Catalog file sets | `declaredFiles` has one hard-coded branch per slug; `publish` refuses a slug without one. | `tools/catalog.mjs:123-136` |
| Recipe pattern | Solar validates against its example `fixture.json` with `validateFixtureShape`, checks geometry on the canvas, then builds a Satori tree. | `tools/recipes/solar-system.mjs:66-89,118+` |
| Example pattern | A thin caller runs `runCLI` with `--recipe`; renders, the receipt and README are committed in the example folder. | `examples/2026-10-08-solar-system/render-diagram.mjs` |
| Tests | C4 builds its own temporary catalog (`add nutrition`, `solar-system`, `third-recipe`), so a new real recipe does not change its slug assertion. | `tools/spike/test/canaries.test.mjs:453-498` |
| Font coverage | Barlow Condensed Regular and Bold have `…`, `—`, `·`, but not `₀₁₂₃₄` or `→`. | cmap probe, this plan |

## Preflight bet check

- **Outcome sought:** the operator can render this diagram type from copy alone (a fixture), with the engine's fit and containment checks, instead of hand-writing a script per diagram.
- **Smallest viable bet:** one fixed-structure recipe (4 stages, 2 state nodes with consequences, one examination branch, a 3-state trail), one example, and the minimum engine wiring.
- **Alternative rejected:** a hand-built example script like RAG or cell division. It is quicker, but it is not a recipe, gets no `processRequest` fit and containment, and cannot be published or pinned. The operator asked for a recipe.
- **Rollback:** revert the PR; the catalog rows come from the dump, and existing recipes never load the new code.

## Design decisions

| # | Decision | Why |
|---|---|---|
| D1 | Slug `recursive-process`, version `1.0.0`, module `tools/recipes/recursive-process.mjs`, canvas 1600×1400. | Names the diagram type, not this one topic, so other recursive processes can reuse it. |
| D2 | **Fixed structure**, copy-driven: `title`, `subtitle`, `stages[4]` (each a formula of three `{letter, index}` tokens, or a label), `event`, `states[2]`, `consequences[2]` with `polarity` `negative` or `positive`, `branch` (`examination`, `outcome`), `trail` (`label`, `states[3]`), and a `footer` (`note`, `source`). Validated by `validateFixtureShape` against the example fixture, like solar. | The shape validator fixes array lengths; variable stage counts would need a new validator and layout engine (non-goal). |
| D3 | **Recipe-declared font.** The recipe exports `FONT = { family, regular, bold }` (repo-relative paths). `processRequest` loads it when present, otherwise keeps `getFonts()` and `'Inter'`; the five literals become one `family` variable. | It is the smallest change that lets a recipe use Barlow; recipes without `FONT` take the identical code path, so their bytes cannot change. |
| D4 | **Formula tokens, not Unicode.** Letters render as text, the index as a smaller lowered span, and arrows as SVG. | Barlow Condensed lacks subscript digits and `→`; the engine's missing-glyph check would reject them (`render.mjs:239`). |
| D5 | **Wiring:** one new branch each in `render.mjs` (selection), `request.mjs` (allow-list, fixture-id inference `recursive-process-diagram`, canvas `[1600, 1400]`) and `catalog.mjs` `declaredFiles`. The declared files are the module, the example fixture (schema), and the two Barlow TTFs (content). Then `catalog add` and `publish` through the CLI. | Matches the existing per-recipe pattern; a registry refactor is out of scope for a third recipe. |
| D6 | **AS-rule departures from the reference, on purpose:** <br>• No boxed all-caps title: sentence case, no container (AS-3, AS-5). <br>• The identical person-head icons under each state are dropped as decoration (AS-6). <br>• Stage 4 gets a real formula (B₃ → B₄ …) instead of an empty header (AS-7). <br>• The trail starts at B₃, not a repeated B₂ (AS-7). <br>• The revised state B₂ gets more weight than B₁ (AS-4). <br>• One accent, used only on the revision path (AS-2). <br>• Icons depict their step: two speech bubbles (event), a broken link (negative), linked rings (positive), a magnifier with a question mark (examination), a rewritten page (revised outcome) (AS-6, AS-8). | `SYSTEM-INSTRUCTIONS.md` overrides the reference where they conflict; the README reports each choice. |
| D7 | **Example** `examples/2026-10-11-belief-updating/`: <br>• `fixture.json` (the schema); <br>• a thin `render-diagram.mjs` caller; <br>• committed `belief-updating.png` (Satori) and `belief-updating-chromium.png`; <br>• the `receipt.json` from `processRequest`; <br>• a README with the AS report; <br>• a design record via `catalog design add 2026-10-11-belief-updating --use-case recursive-process@1.0.0` plus its #21 log line. | Same shape as the solar example; the design record pins this artifact to the recipe version. |
| D8 | **Copy:** the reference's topic (an ABC-style belief-updating cycle). The footer marks it schematic. The source line names the model only as "after the ABC model of cognitive-behavioural therapy (A activating event, B belief, C consequence; D, E as examination and revised outlook)". There are no invented figures or quotes. | AS-7: honest and specific. |
| D9 | **Phase B is not triggered.** The layout is 4 equal stage columns computed inline (`colW = (W − 2·margin) / 4`), with nodes straddling the column lines; it is not a span grid. | The #20 trigger is a hand-built grid-style diagram; this is a recipe with no spans. |

## Phases

### Phase 1 — Font and wiring (no new recipe yet)
- D3 in `render.mjs`. Prove recipes without `FONT` are byte-identical: `pnpm test` (C2 goldens and the drift canary) passes unchanged.

### Phase 2 — Recipe module
- D1, D2, D4, D6 in `tools/recipes/recursive-process.mjs`; D5 wiring in `render.mjs`, `request.mjs` and `catalog.mjs`.
- Extend C1 (no new test): `processRequest` renders the example fixture in both backends with no findings and `fontLoaded` true. Red controls: an overlong state caption is rejected as non-fit; a fixture with a fifth stage is rejected by shape; a `→` typed into copy is rejected (missing glyph).

### Phase 3 — Example and catalog
- D7, D8: render through the thin caller, inspect both PNGs, write the README with the AS report, then `catalog add` and `publish recursive-process 1.0.0` and `design add`. `catalog verify` must be valid.

### Phase 4 — Docs and gates
- README recipe list and canvas line, CHANGELOG. Gates: `pnpm test` 4/4 within 60 s, `catalog verify`, PDDA no errors, and nutrition and solar output byte-identical.

## Acceptance (each can fail)

1. `node examples/2026-10-11-belief-updating/render-diagram.mjs` exits 0 in both backends, and the receipt names `recursive-process@1.0.0`, `verified: true`.
2. Nutrition and solar renders and goldens are byte-identical (C2), and their catalog digests are unchanged.
3. Each Phase 2 red control is rejected with a named error.
4. `catalog verify` is valid, with the new recipe, its version files and the design record.
5. `git grep` finds no `₁`, `₂` or `→` characters in the fixture.
6. No new test file, `test()` block, dependency or workflow; `pnpm test` within 60 s.

## Risks and rollback

| Risk | Mitigation | Rollback |
|---|---|---|
| The font change perturbs existing output | It is a no-op branch for recipes without `FONT`; C2 goldens catch any drift | Revert Phase 1 (Easy) |
| Satori and Chromium disagree on subscript spans or hexagons | Hexagons and arrows are SVG; the subscript is a plain flex span; inspect both PNGs | Adjust the recipe (Easy) |
| The fixed structure is too rigid for the next diagram | Stated as a non-goal; revisit when a second recursive diagram needs a different count | New recipe version (Easy) |

## Rating rationale (2026-10-11)

- `rated 50/10/75/45` (pri/sev/appeal/effort).
- Severity 10: a feature, not a defect.
- Priority 50: the operator asked for it now; nothing is blocked.
- Appeal 75: interpreted from the operator's explicit request to build this recipe; it is labelled as an interpretation.
- Effort 45: a new recipe, engine font wiring, catalog publication and an example; about a day of focused work.
- Recurrence: not applicable.
