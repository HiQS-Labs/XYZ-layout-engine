# Example: Solar System diagram with Milky Way inset

A 2400×1700 educational poster rendered with XYZ Layout Engine's shared render operations (Satori → resvg, and Playwright/Chromium), using eleven transparent illustrations generated with OpenAI `gpt-image-2.5-flare` through the HiQS resolve-image skill.

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
| `render-diagram.mjs` | Thin shared CLI caller; publishes a new immutable run |
| `contact-sheet.mjs` | Builds the contact sheet |
| `generate-assets.py` | Generates the illustrations through the hiqs-chain caller |
| `assets/prompts.json` | The exact prompts sent |
| `assets/*.result.json` | Per-asset generation receipts (model, recipe, alpha check, digest) |
| `assets/web/*.png` | Downscaled copies of the generated illustrations |
| `provenance.json` | Per-asset model, recipe, transparency verdict and sha256 of the original |
| `verification.json` | Render evidence: image nodes, text ids, Satori bounds, Chromium text metrics, artifact digests |
| Root `tools/` | Shared pinned fonts, request admission, trusted recipe and renderer; copied runtime removed after offline proof |

## Reproducing

Run from the repository root after `pnpm install --frozen-lockfile`:

```sh
node examples/2026-10-08-solar-system/render-diagram.mjs
node examples/2026-10-08-solar-system/contact-sheet.mjs
# Explicit browser render or vector export:
node examples/2026-10-08-solar-system/render-diagram.mjs --backend playwright
node examples/2026-10-08-solar-system/render-diagram.mjs --format svg
```

These workflows read the eleven committed `assets/web/*.png` derivatives, checking their pinned display digests and PNG/aggregate budgets. They need no full-size originals, provider credentials or paid calls. Satori is the default; Chromium runs only when explicitly requested. New artifacts use the shared atomic manifest publisher under root `tools/output/solar-system/` and `tools/output/solar-system-contact-sheet/`; resolve `manifest.json.current` to find `render.png` (or the requested export). The committed artwork and `verification.json` remain historical provenance.

The delivered recipe-owned canvases are nutrition 1000×1000 and Solar System 2400×1700, scale 1. Other dimensions and scale are explicitly rejected; arbitrary resolution/upscaling awaits suitable originals and recipe geometry. Fitting uses at most ten total native layout attempts and a 12px minimum, rejecting non-fit before publication. Text and illustrations remain separate nodes. Agent visual inspection passed for the migrated poster/contact sheet; human acceptance remains pending.

Optional asset regeneration uses `generate-assets.py` and the deployed HiQS caller and incurs provider charges. Its atomic resumable workflow limits concurrency and attempts, ensures 'sun' generates first, tracks accurate caller-reported usage and costs, and provides strict budgets (configure `--max-calls`, `--max-budget`, `--max-workers`, and `--timeout`); see `--help` for options.

## Provenance

Recipe `recipe:hiqs/openai-image-generation@r2`, publication label `local_candidate` (not public admission proof). Canonical source of the image skill: HiQS AI Resolve, `skills/resolve-image/` and `skills/hiqs-chain/`. Astronomy facts and sources are listed in `fixture.json`.
