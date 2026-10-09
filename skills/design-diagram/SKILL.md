---
name: design-diagram
description: Build a reproducible explainer diagram or infographic in the XYZ Layout Engine repo, from a topic to a reviewed example folder and a ready PR. Use when asked to "design a diagram", "build a diagram of how X works", "make an infographic or explainer", "add a renderer example", or "/design-diagram <topic>". Works only inside an XYZ Layout Engine checkout (it has `tools/spike/` and `examples/`).
---

# design-diagram

Turn a topic into a fixture-driven diagram rendered by the repo's existing Satori and Chromium functions, with checks that fail by name, then ship it as an example folder. The working pattern is `examples/2026-10-09-rag-system/` (hand-drawn SVG icons). `examples/2026-10-08-solar-system/` is the variant with paid generated raster art. Copy and adapt; do not invent a new structure.

## Before you start

- Work in a fresh full clone on a task branch, never in the primary checkout. `/start-task` does this and also handles the issue, plan and review; use it when the diagram is tracked work.
- Keep the clone path free of spaces if you will run `pnpm test` (see trap 2).
- Read `examples/2026-10-09-rag-system/README.md`, `examples/2026-10-09-rag-system/render-diagram.mjs` and `examples/2026-10-09-rag-system/fixture.json` first.
- Install the pinned runtime once. Working directory `examples/2026-10-08-solar-system/runtime/`: run `pnpm install --frozen-lockfile`, and if Chromium is missing, `pnpm exec playwright install chromium`.

## Procedure

Outputs this procedure creates, so they do not exist yet: `examples/<YYYY-MM-DD>-<slug>/` and the files inside it.

1. **Brief.** Settle the topic, the audience, the canvas size, and the stages (about ten at most, each one short title plus one short description). Decide what is schematic and say so in the footer. Ask the operator only when the topic itself is ambiguous.
2. **Copy the pattern.** From the repo root: create `examples/<YYYY-MM-DD>-<slug>/` and copy `render-diagram.mjs`, `fixture.json`, `README.md` and `.gitignore` from `examples/2026-10-09-rag-system/` into it. Rename the output basename `rag-system` to your slug in the script, README (including the image alt text) and `.gitignore`. Then hunt for the RAG-specific parts, which a rename does not catch: the `REQUIRED` stage set, the `icons` object, the lane keys (see step 4), the `lane_*` and `edge_*` text ids, the `source_note` citation, the comments, the `assert.equal(found.length,10)` icon count, and the `expectedText` list.
3. **Fixture.** Put the diagram copy, the stage list, lane colors and note-panel text in `fixture.json`. Layout geometry stays in the script. Two cautions: the script reads `fixture.edges` and `fixture.panels` by key name, so rename keys in the fixture and the script together; and `fixture.sources` is not read, because the citation text is a string in the script (`source_note`), so edit the script's string.
4. **Script.** Edit only the scene: the hard-coded `REQUIRED` stage set (this is what stops an emptied fixture from passing), the icons, the bands and columns, the arrows, the panels and the `expectedText` list. The lane keys `ingest`, `store` and `query` are structural: they name the bands in `BAND_Y`, the arrow loops, the panel placement, `REQUIRED` and the `lane_*` text ids. Rename them everywhere at once, or keep three bands. Footer positions depend on the canvas height `H`: set the footer rule at `H - 160` and the footer block at `H - 132`. Keep as they are: the `SPIKE_LIBRARY_ONLY` assignment before the awaited dynamic import, the relative import of the Solar System runtime, `loadSatori()` before rendering, both backends, and the findings checks.
5. **Art.** Default to hand-drawn SVG icons, one separate image node per stage, no raster, no upload. Icon spec, as in the example: a 96 by 96 viewBox, stroke only, one path string per stage in the `icons` object keyed by stage id. Use paid image generation only when the operator asks. Then follow `examples/2026-10-08-solar-system/generate-assets.py` (reads `HIQS_CHAIN_CALLER`, refuses to overwrite, writes a receipt per asset) and the digest and transparency checks in `examples/2026-10-08-solar-system/render-diagram.mjs`. Never upload local input silently.
6. **Render.** Working directory `examples/<YYYY-MM-DD>-<slug>/`: `node render-diagram.mjs`. It must print `PASS`. Fix each finding by the id it names. If Chromium crashes at launch inside a sandboxed shell (macOS `MachPortRendezvous ... Permission denied`), rerun the same command with the sandbox off; a Chromium cached from an earlier Playwright install may already match, so run the install command only if the launch reports it missing.
7. **Look at it.** Open both PNGs. Geometry checks do not prove the picture looks right; fix what you see (alignment, crowding, arrows) and rerun. In the README say, as the RAG example does, that the agent inspected both PNGs and human review is pending.
8. **Red controls.** On throwaway copies of the script or fixture, never the real files: (a) lengthen one description so it overflows its card, (b) remove one stage's icon, (c) move one Chromium text box past the canvas edge. Mechanics: copies live in the same example folder so paths resolve. For (a), copy `fixture.json` and a script copy that reads the copy (for example `sed "s/'fixture.json'/'red-a-fixture.json'/"`). For (b), deleting the stage's `icons` entry trips the early `no icon drawn for stage` assertion, which is an acceptable failure by name. For (c), insert `chromiumResult.textBoxes.<id>.x=W+10;` after the Chromium render and before the checks. Each must exit non-zero and name the id (read it with `$?`, not a shell-specific pipe array). Delete the copies, restore the fixture, rerun green. Record the three results in the README.
9. **Docs.** Fill the README (what is here, reproducing, what the checks prove, red controls run, limits). Add a `CHANGELOG.md` entry: outcome, bet, failure mode, reversibility, verification.
10. **Gates.** Run `utils/pdda/pdda.sh run` from the repo root. Add no test file, workflow or dependency (`test-budget.json` is a ratchet). `pnpm test` is only needed when `tools/spike/**` changed; run it in a disposable space-free clone, never a path with a space.
11. **Ship.** Open a PR against `main`. For tracked work, `/start-task` runs the intake and the Codex plan and final reviews.

## Known traps

| # | Trap | Working pattern | Evidence |
|---|---|---|---|
| 1 | Importing the spike render code statically runs its experiment `main()` first. | Set `process.env.SPIKE_LIBRARY_ONLY='1'`, then `await import()` the sibling runtime. | `examples/2026-10-09-rag-system/render-diagram.mjs` lines 8 to 12; guard at `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs` line 547 |
| 2 | A checkout path containing a space breaks `tools/spike/assets.mjs` (it reads `URL.pathname`). | In new scripts use `URL` objects and `fileURLToPath`, never `.pathname`. Run `pnpm test` only in a space-free clone. Not fixed here; GH-5 owns it. | `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md` (asset path resolution item); `tools/spike/assets.mjs` line 4 |
| 3 | A raster image inside a nested SVG disappeared in the Satori render while geometry checks still passed. | Use a direct PNG image node. | `CHANGELOG.md`, 2026-10-08 Solar System entry |
| 4 | In the RAG build a span's `textAlign: right` rendered left-aligned in the first render. | Wrap the span in a flex box with `justifyContent: flex-end` (`stepbox_` and `edgebox_`). This is the pattern that worked, not a proven renderer defect. | `examples/2026-10-09-rag-system/render-diagram.mjs` `stepbox_`, `edgebox_` |
| 5 | Text and icons are positioned absolutely inside cards. | Make the card itself absolutely positioned so children resolve against it in both backends. A working pattern, not a recorded failure. | `examples/2026-10-09-rag-system/render-diagram.mjs` `cardFor` |
| 6 | Passing checks do not mean a good picture: during the RAG build the overlap check caught a lane label sitting on an edge label, and the misalignment in trap 4 was found only by looking. | Run the checks and inspect both PNGs. | README statement of what the checks do not judge: `examples/2026-10-09-rag-system/README.md`, section "What the checks prove". The two incidents were observed in the build and are not otherwise recorded in the repo. |
| 7 | The script writes outputs before it asserts findings, so a failed or red-control run overwrites the committed PNGs and `verification.json`. | Rerun green after every red control, and check `git status` before committing. | `examples/2026-10-09-rag-system/render-diagram.mjs` (outputs written before the final findings assertion) |

## Install

This skill does not install itself. When the operator asks, symlink `skills/design-diagram` from the maintained primary clone into the agent app's skills folder (for Claude Code, `~/.claude/skills/design-diagram`), keep any existing different entry as is, and read `SKILL.md` back through the link. Never link to a temporary task clone.

## Done means

The example folder renders to `PASS`, both PNGs were inspected, the three red controls failed by name and were restored, README and changelog are written, PDDA run has no errors, and a PR against `main` is open.
