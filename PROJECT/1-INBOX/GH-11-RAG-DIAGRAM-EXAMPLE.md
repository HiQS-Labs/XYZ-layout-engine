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
- No skill in the repo packages the spike or the example workflow. Only the vendored harness skills exist under `.xyz/skills/` (`.xyz/` is not tracked; a fresh clone does not have it).
- Not traced: Windows/Linux rendering, other font coverage. The example is Mac/Node 22 only, like the first.

## Requirements

1. `examples/2026-10-09-rag-system/` renders a 2400×1500 scene with both flows: ingest (documents → chunk → embed → vector store) and query (question → embed → retrieve top-k → augment prompt → LLM → grounded answer with citations). Chunk/embed/retrieve steps are visually tied to the shared vector store.
2. Artwork is hand-authored inline SVG icons, one per stage, composed as separate image nodes. No paid generation, no upload.
3. `render-diagram.mjs` reuses the Solar System runtime by relative import (no second copy) and asserts: canvas size, one image node per stage icon, every text id inside the canvas, no Chromium text overflow, no label overlap. Writes `verification.json`.
4. Outputs: Satori PNG, Chromium PNG, responsive HTML viewer, `fixture.json`, README with a stated-limits section.
5. A `CHANGELOG.md` entry with bet, failure mode, reversibility, verification.

## Non-goals

- No change to `tools/spike/**`, `test-budget.json`, `package.json`, or any dependency. No new test file, suite, or workflow (AGENTS.md; GH-2 ratchet).
- No packaging as a skill, no shared runtime refactor (GH-5).
- No claim about real RAG performance; the diagram is conceptual.

## Bet and rejected alternatives

- Bet: the existing render functions carry a pipeline layout from fixture data. Failure mode: text overflow or clipped arrows pass geometry checks but look wrong; mitigated by agent visual inspection of both PNGs, with the human review still pending.
- Rejected: generating raster art (cost, external upload, not needed to answer the question); copying the runtime again (896 KB duplicate); changing `render.mjs` to export (that is GH-5 scope).
- Limit: the relative import couples this example to the Solar System `runtime/`. Revisit when GH-5 lands a shared render operation.
- Rollback: delete the folder and the changelog entry.

## Verification (existing checks only)

- `cd examples/2026-10-08-solar-system/runtime && pnpm install --frozen-lockfile`, then `node render-diagram.mjs` in the new folder must print its PASS line.
- Red control: shrink one label box in `fixture.json` so text overflows; the script must fail with a named finding. Restore and rerun green.
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
| #11 | 1–5 above | Plan drafted; awaiting plan QA |

## Rating rationale (2026-10-09)

pri 30 / sev 10 / appeal 50 / effort 80. Severity: a docs example, no data or work at risk. Priority: no blocked work, user asked for it now. Appeal: neutral default, no preference stated. Effort: one fixture and one script patterned on an existing one. Recurrence: not applicable (feature, not a defect); trend unknown.
