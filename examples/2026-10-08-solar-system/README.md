# Example: Solar System diagram with Milky Way inset

A 2400×1700 educational poster rendered with the GH-1 spike's existing render functions (Satori → resvg, and Playwright/Chromium), using eleven transparent illustrations generated with OpenAI `gpt-image-2.5-flare` through the HiQS resolve-image skill.

![Solar System diagram](solar-system.png)

Sizes, distances, belt density and positions are schematic, not to scale. The artwork is illustrative, not observational imagery.

## What is here

| File | What it is |
|---|---|
| `solar-system.png` | Final Satori → resvg render |
| `solar-system-chromium.png` | Same scene rendered by Playwright/Chromium |
| `solar-system.html` | Self-contained responsive viewer (images inlined) |
| `contact-sheet.png` | All generated assets side by side |
| `fixture.json` | Scene content: planets, labels, layout, disclaimer, sources |
| `render-diagram.mjs` | Builds the scene and renders both backends; writes `verification.json` |
| `contact-sheet.mjs` | Builds the contact sheet |
| `generate-assets.py` | Generates the illustrations through the hiqs-chain caller |
| `assets/prompts.json` | The exact prompts sent |
| `assets/*.result.json` | Per-asset generation receipts (model, recipe, alpha check, digest) |
| `assets/web/*.png` | Downscaled copies of the generated illustrations |
| `provenance.json` | Per-asset model, recipe, transparency verdict and sha256 of the original |
| `verification.json` | Render evidence: image nodes, text ids, Satori bounds, Chromium text metrics, artifact digests |
| `runtime/` | Pinned copy of the GH-1 spike render code this example ran against (`runtime/SOURCE.json` names the commit) |

## Reproducing

Full-size generated originals (`assets/<id>.png`, about 17 MB) are not committed; `render-diagram.mjs` reads them, so re-rendering needs either those originals or a fresh generation run.

1. Install the pinned runtime: `cd runtime && pnpm install`.
2. To regenerate artwork (paid OpenAI calls, one per asset): set `HIQS_CHAIN_CALLER` to your deployed `hiqs-chain/scripts/chain.mjs` and run `python3 generate-assets.py`. It refuses to overwrite existing outputs.
3. Render: `node render-diagram.mjs`.

## Provenance

Recipe `recipe:hiqs/openai-image-generation@r2`, publication label `local_candidate` (not public admission proof). Canonical source of the image skill: HiQS AI Resolve, `skills/resolve-image/` and `skills/hiqs-chain/`. Astronomy facts and sources are listed in `fixture.json`.
