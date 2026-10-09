---
gh_issue: 11
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/11
title: "Example: RAG system diagram rendered with the GH-1 spike"
status: "Proposed (1-INBOX — not yet active)"
created: 2026-10-09
doc_type: feedback
effort: 2
complexity: 2
risk: 1
phases: 1
ratings_provisional: true
related:
  - examples/2026-10-08-solar-system/README.md
  - PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md
reversibility: "Easy — one new example folder and a changelog entry; no engine change."
---

# GH-11 — RAG system diagram example

## Why

The Solar System example shows the spike renders one illustrated, radial scene. A RAG (retrieval-augmented generation) diagram is a structurally different scene: a left-to-right pipeline with two flows. Building it with the same render functions shows whether the spike carries a second layout shape without engine changes, and whether an example can be rebuilt without paid image generation.

## Recon (base `a8e7e57`, 2026-10-09)

- `examples/2026-10-08-solar-system/render-diagram.mjs` builds a Satori scene tree from `fixture.json`, renders it through `renderSatori` and `renderPlaywright`, writes PNGs plus a responsive HTML viewer, and writes `verification.json` after asserting size, image nodes, text bounds and label overlap.
- It imports the render functions from its own pinned copy in `runtime/` (896 KB, `SOURCE.json` names commit `591971d`). `tools/spike/render.mjs` on `main` is not importable as a library, which is why that copy exists (GH-5 owns the real fix).
- The Solar System assets come from paid `gpt-image-2.5-flare` calls through `HIQS_CHAIN_CALLER`. The GH-1 nutrition scene also used hand-authored SVG icons, so SVG art is already accepted in this pipeline.
- No `SKILL.md` exists in this tracked checkout (a search of the clone found none), so no repo skill packages the spike or the example workflow. The vendored XYZ Forge harness skills live in an untracked `.xyz/` in the primary checkout only, and other skills are installed per-machine outside the repo; neither is part of this repo.
- Not traced: Windows/Linux rendering, other font coverage. The example is Mac/Node 22 only, like the first.

## Requirements

1. `examples/2026-10-09-rag-system/` renders a 2400×1500 scene with both flows: ingest (documents → chunk → embed → vector store) and query (question → embed → retrieve top-k → augment prompt → LLM → grounded answer with citations). Chunk/embed/retrieve steps are visually tied to the shared vector store. Retrieved chunks carry source IDs into the augmented prompt together with the original question, and the answer's citations refer to those sources (a label and arrow only, not a retrieval or citation-checking implementation).
2. Artwork is hand-authored inline SVG icons, one per stage, composed as separate image nodes. No paid generation, no upload.
3. `render-diagram.mjs` reuses the Solar System runtime by relative import (no second copy). It must set `process.env.SPIKE_LIBRARY_ONLY='1'` **before** an awaited dynamic `import()` of `../2026-10-08-solar-system/runtime/tools/spike/render.mjs` (a static import would run the experiment's `main()` first), import Playwright from the sibling `runtime/node_modules`, call `loadSatori()` before rendering, and read both fonts from the sibling runtime assets. Runtime files stay unchanged. Writes `verification.json`.
4. Assertions are non-vacuous. The fixture names the required stages for both flows; the script asserts the expected stage-icon ids and expected text/label ids are each present, unique and non-empty (not just whatever the renderer collected), finite positive geometry for each in **both** backends, Satori and Chromium boxes inside the canvas, no Chromium text overflow, no label overlap, and canvas size. A missing id, an empty list, or a box moved outside the canvas in either backend fails by id.
5. Outputs: Satori PNG, Chromium PNG, responsive HTML viewer, `fixture.json`, README with a stated-limits section.
6. A `CHANGELOG.md` entry with bet, failure mode, reversibility, verification.

## Non-goals

- No change to `tools/spike/**`, `test-budget.json`, `package.json`, or any dependency. No new test file, suite, or workflow (AGENTS.md; GH-2 ratchet).
- No packaging as a skill and no shared runtime refactor. GH-5 covers the shared render operation and a documented render path, not a skill; a skill is untracked and would need its own issue.
- No claim about real RAG performance; the diagram is conceptual.

## Bet and rejected alternatives

- Bet: the existing render functions carry a pipeline layout from fixture data. Failure mode: text overflow or clipped arrows pass geometry checks but look wrong; mitigated by agent visual inspection of both PNGs, with the human review still pending.
- Rejected: generating raster art (cost, external upload, not needed to answer the question); copying the runtime again (896 KB duplicate); changing `render.mjs` to export (that is GH-5 scope).
- Limit: the relative import couples this example to the Solar System `runtime/`. Revisit when GH-5 lands a shared render operation.
- Rollback: delete the folder and the changelog entry.

## Verification (existing checks only)

- Setup: `cd examples/2026-10-08-solar-system/runtime && pnpm install --frozen-lockfile`; if Chromium is absent, `pnpm exec playwright install chromium` in that same folder; then `cd ../../2026-10-09-rag-system && node render-diagram.mjs` must print its PASS line.
- Guard check: run it once with `SPIKE_LIBRARY_ONLY` unset in the shell; it must still render and create no experiment output under the runtime folder (`git status` shows only the new example).
- Red controls (each must fail by named id, then be restored and rerun green): (a) shrink one label box in `fixture.json` so text overflows; (b) delete one required stage's icon; (c) move one text box outside the canvas in the Chromium result.
- `pnpm test` at the repo root stays green with budget unchanged.
- `utils/pdda/pdda.sh run` (docs gate) before PR.

## Ordered implementation

1. Add `fixture.json` (stages, flows, labels, colors, disclaimer).
2. Add `render-diagram.mjs` (scene, inline SVG icons, arrows, assertions).
3. Run it; inspect both PNGs; fix layout. Run the red control.
4. Add README and CHANGELOG entry.
5. Run `pnpm test` and the PDDA gate; commit; final relay QA; PR.

## Per-issue map

| Issue | Requirement | State |
|---|---|---|
| #11 | 1–6 above | Plan drafted; awaiting plan QA |

## Rating rationale (2026-10-09)

pri 30 / sev 10 / appeal 50 / effort 80. Severity: a docs example, no data or work at risk. Priority: no blocked work, user asked for it now. Appeal: neutral default, no preference stated. Effort: one fixture and one script patterned on an existing one. Recurrence: not applicable (feature, not a defect); trend unknown.
