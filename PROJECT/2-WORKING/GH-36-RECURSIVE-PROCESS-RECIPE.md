---
gh_issue: 36
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/36
title: "Recursive-process recipe and a belief-updating example diagram"
status: "Built; final Codex QA Approved (round 2); PR #37 merge QA in progress"
created: 2026-10-11
updated: 2026-10-12
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
  An additional trusted recipe, `recursive-process@1.0.0`, renders the "recursive process" diagram type
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
| Issue, clone, capture promoted to this plan, ledger row rated `50/10/75/45`, recon at `da97d78`. Codex plan QA round 1 failed (F1–F5 Should, F6 Nit), and round 2 failed (F7, F8 Should, the rest of F6); all are folded in below. | Built (Phases 1–4); evidence below. Final Codex QA Approved (round 2); PR #37 awaits merge QA and landing. Human review of the artwork is pending. |

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
| D1 | Slug `recursive-process`, version `1.0.0`, module `tools/recipes/recursive-process.mjs`, canvas 1600×1340 (planned as 1600×1400; reduced after the first visual review removed 140 px of empty band). | Names the diagram type, not this one topic, so other recursive processes can reuse it. |
| D2 | **Fixed structure**, copy-driven, with these fields: <br>• `title`, `subtitle`; <br>• `theme.palette` (D10); <br>• `stages[4]`, each `{ number, formula }`, where `formula` is a string of one to three space-separated tokens; <br>• `events[2] {token, label, caption}` (one per A→B→C cycle; built as two so the second cycle's A₂ is drawn); <br>• `states[2] {token, label, caption}`; <br>• `consequences[2] {token, label, caption, polarity}`; <br>• `branch {examination {token, label, caption}, outcome {token, label, caption}}`; <br>• `trail {label, tokens[3]}`; <br>• `footer {note, source}`. <br>`validateFixtureShape` against the example fixture fixes keys, array lengths and text bounds. **The recipe's own `validate` then checks the domains** that validator cannot (`request.mjs:81-101`): <br>• every token matches `^[A-E][1-9]?$` or is exactly `…`; <br>• `polarity` is `negative` or `positive`; <br>• `stages[i].number` is the integer `i+1`; <br>• palette values are `#rrggbb`. <br>A violation throws a named `invalid(field, …)`. | Codex F3: the shared validator has no enums or unions; a token string replaces the `{letter, index}`-or-label union it cannot express. |
| D3 | **Recipe-declared font.** The recipe exports `FONT = { family, regular, bold }` (repo-relative paths). `processRequest` loads it when present, otherwise keeps `getFonts()` and `family = 'Inter'`. Every family use in `processRequest` takes `family`: the four explicit literals (`:229,232,234,336`) and the implicit default at `toDocument` (`:333`, Codex F1). The exported renderer defaults (`:24,110,130`) stay `'Inter'`. The new scene's canvas sets `fontFamily: FONT.family`. | It is the smallest change that lets a recipe use Barlow. A recipe without `FONT` gets the same values on every path, and Phase 1 proves its bytes by direct digest comparison (F4). |
| D4 | **Formula tokens, not Unicode.** Letters render as text, the index as a smaller lowered span, and arrows as SVG. | Barlow Condensed lacks subscript digits and `→`; the engine's missing-glyph check would reject them (`render.mjs:239`). |
| D5 | **Wiring**, one new branch each in: <br>• `render.mjs` recipe selection (`:183-189`); <br>• `request.mjs` admission (`:59-61`: allow-list, fixture-id inference `recursive-process-diagram`, canvas `[1600, 1340]`); <br>• `saveFixture`'s repeated inference and allow-list (`request.mjs:106-107`, Codex F2); <br>• `catalog.mjs` `declaredFiles` (`:123-136`): the module, the example fixture (schema) and the two Barlow TTFs (content). <br>Then `catalog add` and `publish` through the CLI. `runCLI` has no separate recipe list, and `publish` already records all four output formats (`catalog.mjs:329`). `tools/profile.mjs:49` is a profiling convenience and is left unchanged. | Matches the existing per-recipe pattern; a registry refactor is out of scope for a third recipe. |
| D6 | **AS-rule departures from the reference, on purpose:** <br>• No boxed all-caps title: sentence case, no container (AS-3, AS-5). <br>• The identical person-head icons under each state are dropped as decoration (AS-6). <br>• Stage 4 gets a real formula (B₃ → B₄ …) instead of an empty header (AS-7). <br>• The trail starts at B₃, not a repeated B₂ (AS-7). <br>• The revised state B₂ gets more weight than B₁ (AS-4). <br>• One accent, used only on the revision path (AS-2). <br>• Icons depict their step: two speech bubbles (event), a broken link (negative), linked rings (positive), a magnifier with a question mark (examination), a rewritten page (revised outcome) (AS-6, AS-8). | `SYSTEM-INSTRUCTIONS.md` overrides the reference where they conflict; the README reports each choice. |
| D7 | **Example** `examples/2026-10-11-belief-updating/`: <br>• `fixture.json` (the schema); <br>• a thin `render-diagram.mjs` caller; <br>• committed `belief-updating.png` (Satori) and `belief-updating-chromium.png`; <br>• the `receipt.json` from `processRequest`; <br>• a README with the AS report; <br>• a design record via `catalog design add 2026-10-11-belief-updating --use-case recursive-process@1.0.0` plus its #21 log line. | Same shape as the solar example; the design record pins this artifact to the recipe version. |
| D8 | **Copy:** the reference's topic (an ABC-style belief-updating cycle). The footer marks it schematic. The source line names the model only as "after the ABC model of cognitive-behavioural therapy (A activating event, B belief, C consequence; D, E as examination and revised outlook)". There are no invented figures or quotes. | AS-7: honest and specific. |
| D10 | **Visual system in the fixture (AS-5, Codex F5).** `theme.palette` has fixed roles: `background`, `ink`, `muted`, `rule`, `surface`, `accent` (revision path only), `negative`, `positive`. The recipe fixes one spacing unit (8 px scale), one corner radius (12 px, cards only), and no shadows or gradients. Strokes: 2 px for node outlines and connectors, 1 px for the column and footer rules, 4 px for the main revision line. Type: Barlow Condensed 700 for the title, formulas and state tokens; 400 for labels and captions; explicit sizes in `DEFAULT_SIZES`; explicit line heights of at least 1.2 for the title, labels, tokens and stage numbers, and 1.3 for captions (planned as 1.1; see the recon findings in Evidence). | A small, fixed system that the README reports against; no theming framework. |
| D9 | **Phase B is not triggered.** The layout is 4 equal stage columns computed inline (`colW = (W − 2·margin) / 4`), with nodes straddling the column lines; it is not a span grid. | The #20 trigger is a hand-built grid-style diagram; this is a recipe with no spans. |

## AS statement before composing (SYSTEM-INSTRUCTIONS "Report")

- **Reader:** someone learning how a belief, once examined, changes later outcomes.
- **Takeaway:** a consequence feeds back into the next belief; examining a belief produces a revised outlook that keeps revising.
- **Hierarchy decisions:**
  1. The two state hexagons are the largest objects, and the revised state B₂ is larger than B₁.
  2. The revision path (examination → revised outcome → continuous revision) is the only use of the accent colour.
  3. Stage numbers and formulas are a quiet header row in the muted colour, not boxed.

## Phases

### Phase 1 — Font plumbing, proven byte-neutral
- [x] Before any change, record a baseline on this host from `main` (`da97d78`), with the same Node, dependencies and Chromium. Outputs go under `.relay-scratch/base-<slug>-<backend>`:
  - Satori: `node tools/render.mjs <fixture> --recipe <slug> --backend satori --format png,svg,html,html-inline --out …`
  - Playwright: `… --backend playwright --format png,html,html-inline` (Playwright has no SVG, `request.mjs:75`)
  - both for nutrition and for solar: 2 recipes × 7 backend-format pairs = 14 comparisons (Codex F7).
- [x] D3 in `render.mjs`, then re-render the same matrix into `.relay-scratch/after-…`.
  - Compare the bytes of each named artifact, including the compact HTML's extracted assets; skip timestamped receipts and manifests.
  - Every one of the 14 must match. A missing comparison or a single byte of drift fails the phase.
  - `catalog verify` must still report the published file and content digests for both recipes unchanged.
  - `pnpm test` stays green.
  - QA evidence: the "Phase 1 digest matrix" table in the Evidence section.

### Phase 2 — Recipe module and wiring
- [x] D1, D2, D4, D6, D10 in `tools/recipes/recursive-process.mjs`, and the D5 wiring.
- [x] Extend the existing C1 test (no new test):
  - `processRequest` renders the example fixture in Satori and in Playwright with no findings;
  - Satori `missingSegments.length === 0`, and Playwright `fontLoaded === true` (Codex F6).
  - **Offline HTML check (Codex F8).** Export compact `html` and `html-inline` for the new recipe from both backends. Reuse C1's existing offline-browser block (`canaries.test.mjs:108-131`), parameterized by family, rather than copying it. Open the compact HTML and a relocated standalone copy of the inline HTML with JavaScript off and every `http(s)` request aborted. Assert:
    - Barlow Condensed faces of weight 400 and 700, both `loaded`;
    - a non-empty set of SVG images, all loaded;
    - zero network requests.
- [x] C1 red controls, each rejected with a named error:
  - state caption `'W'.repeat(2000)`, within the 2048-character admission bound, rejected with the named `non-fit` fitting error rather than an admission error;
  - a fifth stage (shape);
  - token `F1`;
  - `polarity: "neutral"`;
  - a `→` typed into a caption, rejected as a font error (`unsupported text/font`, `render.mjs:239`), not as a domain error.
- [x] QA evidence: the "Phase 2 controls" table in the Evidence section. For each control: the command, the error text, and the result when its guard is removed.

### Phase 3 — Example, design record and AS report
- [x] `examples/2026-10-11-belief-updating/`: fixture, thin caller, committed PNGs from both backends, `receipt.json`, README.
- [x] Inspect both PNGs at full size and at thumbnail size (about 400 px wide). The README records the AS report: patterns avoided by rule ID, exceptions with reasons, and what was inspected.
- [x] `catalog add recursive-process`, `publish recursive-process 1.0.0`, `design add 2026-10-11-belief-updating --use-case recursive-process@1.0.0 …`; `catalog verify` valid.
- [x] Copy-only save check: `--set` a caption, `--save` into `.relay-scratch/`, re-render; the original fixture is unchanged (Codex F2).

- QA evidence: the README's AS report and the "Phase 3 checks" table (catalog, design and save-check output).
### Phase 4 — Docs and gates
- [x] README recipe list and canvas line, CHANGELOG.
- [x] Gates: `pnpm test` 4/4 within 60 s; `catalog verify`; PDDA no errors; the Phase 1 digest re-check repeated on the final commit.
- [x] Execution failures are diagnosed with `/debug-mantra` before any retry.

- QA evidence: the final gate lines in the PR body and the "Phase 4 gates" row.
## Acceptance (each can fail)

1. `node examples/2026-10-11-belief-updating/render-diagram.mjs --backend satori` and `… --backend playwright` (the thin caller writes to the example's own `out/`, which the example `.gitignore` excludes; `tools/output/` is not ignored at the root, so it is not used) both exit 0. Each receipt has `catalog.slug = recursive-process`, `catalog.version = 1.0.0` and `catalog.verified = true`.
2. All 14 Phase 1 comparisons are byte-identical, and none is missing. Satori covers `png,svg,html,html-inline` and Playwright `png,html,html-inline`, for nutrition and solar on the same runtime (Evidence: Phase 1 digest matrix).
3. Each Phase 2 red control is rejected with its named error, and each fails when its guard is removed (Evidence: Phase 2 controls). The offline HTML check passes for the new recipe in both backends.
4. `catalog verify` is valid, with the new recipe, its version files and the design record plus log line.
5. The fixture has no `₀`–`₉` or `→` characters (`git grep`).
6. The README has the AS report, including the full-size and thumbnail inspection of both backends.
7. No new test file, `test()` block, dependency or workflow; `pnpm test` within 60 s.

## Evidence (filled in during the build)

**Phase 1 digest matrix.** These are the baseline from `main` code at `da97d78` and the final tree, on the same host and runtime. The baseline was run twice and was deterministic. The html rows include the digest of the extracted asset set; receipts and manifests are excluded.

| Recipe | Backend | Format | Baseline sha256 | Final sha256 | Equal |
|---|---|---|---|---|---|
| nutrition | satori | png | `f4451bfa94dc2657` | `f4451bfa94dc2657` | yes |
| nutrition | satori | svg | `f7507d88c4501dde` | `f7507d88c4501dde` | yes |
| nutrition | satori | html | `d1a526f05e1ad0e8` | `d1a526f05e1ad0e8` | yes |
| nutrition | satori | html-inline | `2ea09773b7b2eed4` | `2ea09773b7b2eed4` | yes |
| nutrition | playwright | png | `4d7050949c22ddf7` | `4d7050949c22ddf7` | yes |
| nutrition | playwright | html | `d1a526f05e1ad0e8` | `d1a526f05e1ad0e8` | yes |
| nutrition | playwright | html-inline | `2ea09773b7b2eed4` | `2ea09773b7b2eed4` | yes |
| solar-system | satori | png | `b55c036c76275ae7` | `b55c036c76275ae7` | yes |
| solar-system | satori | svg | `c5034e8e9f90817a` | `c5034e8e9f90817a` | yes |
| solar-system | satori | html | `f64b1887e29b3abe` | `f64b1887e29b3abe` | yes |
| solar-system | satori | html-inline | `06b50d68441584c6` | `06b50d68441584c6` | yes |
| solar-system | playwright | png | `7b3c09ff696a9dbd` | `7b3c09ff696a9dbd` | yes |
| solar-system | playwright | html | `f64b1887e29b3abe` | `f64b1887e29b3abe` | yes |
| solar-system | playwright | html-inline | `06b50d68441584c6` | `06b50d68441584c6` | yes |

**Phase 2 controls** (C1, `tools/spike/test/canaries.test.mjs`). Each guard was removed in turn, and each removal turned `pnpm test` red (exit 1):

| Control | Named refusal | Guard removed: result |
|---|---|---|
| state caption `'W'.repeat(2000)` | `non-fit` | The guard is the engine's shared non-fit throw (`render.mjs` `if (unresolved.length)`). Disabling it turns C1 red, first at the existing nutrition and solar controls. With those two assertions also removed, C1 is still red, failing inside `rpReject` as called by this control: the GH-36 control catches it on its own. |
| fifth stage | `requires 4 entries` | shared shape check removed → red |
| token `F1` | `token must be A-E…` | token regex `^.*$` → red |
| polarity `neutral` | `polarity must be negative or positive` | check disabled → red |
| `→` in a caption | `unsupported text/font` | declared font not loaded (Inter has `→`) → red |
| offline HTML, both backends | Barlow Condensed 400 and 700 loaded, SVG images loaded, 0 requests | Chromium given `'Inter'` instead of the declared family → red |
| Satori glyph coverage | `missingSegments` is `[]` for the recipe scene | (covered by the font-loading removal above) |

**Phase 3 checks.**
- `catalog add recursive-process`, then `publish recursive-process 1.0.0`, gave content `04c200f32c1806b6…` (republished after final-QA F3 changed the module; 1.0.0 was never merged) and schema `efb027aae59d800e…`.
- `design add 2026-10-11-belief-updating --use-case recursive-process@1.0.0` gave artifact `ebef8bf5cd1776d8…` and appended its #21 log line.
- `catalog verify` reports `{"valid":true,"errors":[]}`, and `export --check` reports `{"canonical":true}`.
- Both thin-caller runs exit 0, with receipts showing `recursive-process` `1.0.0` `verified: true`.
- The save check (`--set states.0.caption=…` then `--save .relay-scratch/rp-saved.json`, then a re-render) exited 0 both times. The original fixture's sha256 was `efb027aae59d800e…` before and after.

**Final-QA round 1 dispositions.** F1: evidence added (non-fit row above). F2: D1, D2, D5 and D10 reconciled with what was delivered. F3: the stroke and line-height claims are corrected in the recipe comment, the README AS report, `SOURCE.md` and the CHANGELOG; stage numbers moved to line height 1.2, then the recipe was republished, re-rendered and re-recorded through the CLI. The preservation matrix was rebuilt from `main`'s `render.mjs` and `request.mjs` (the first scratch copy was discarded by the relay harness). Its baseline matches every recorded prefix, and all 14 are identical on the final tree.

**Phase 4 gates.**
- `pnpm test`: PASS, 4 canaries in 37.3 s (budget 60 s).
- `catalog verify`: valid.
- PDDA: no errors (33 governance warnings, the same as `main`).
- Matrix: 14/14 identical on the final tree.

**Recon findings made during the build** (recorded in `tools/fonts/barlow-condensed/SOURCE.md` and the recipe):
- Barlow Condensed's line box is 1.2 em. At line height 1.1 Chromium reported the title and the state labels as overflowing through all ten fit attempts. At line height 1.0 it shrank the stage numbers from 20 to 16 px (found in final QA, F3). All text now uses at least 1.2, and both receipts fit on the first attempt.
- Formula tokens render without IDs, so the fit loop does not check them. Validation bounds their width instead: at most three tokens of one letter and one digit.

## Risks and rollback

| Risk | Mitigation | Rollback |
|---|---|---|
| The font change perturbs existing output | It is a no-op branch for recipes without `FONT`; the Phase 1 direct comparison of 14 artifacts catches any drift (C2 does not cover `processRequest`) | Revert Phase 1 (Easy) |
| Satori and Chromium disagree on subscript spans or hexagons | Hexagons and arrows are SVG; the subscript is a plain flex span; inspect both PNGs | Adjust the recipe (Easy) |
| The fixed structure is too rigid for the next diagram | Stated as a non-goal; revisit when a second recursive diagram needs a different count | New recipe version (Easy) |

## Rating rationale (2026-10-11)

- `rated 50/10/75/45` (pri/sev/appeal/effort).
- Severity 10: a feature, not a defect.
- Priority 50: the operator asked for it now; nothing is blocked.
- Appeal 75: interpreted from the operator's explicit request to build this recipe; it is labelled as an interpretation.
- Effort 45: a new recipe, engine font wiring, catalog publication and an example; about a day of focused work.
- Recurrence: not applicable.
