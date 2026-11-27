# Fuel Well Handoff Visual (`output/`)

One-page visual guide showing a colleague taking over the **“Fuel Well. Live Well.”** poster:
1. Where to edit the headline (`nutrition/fixture.json` → `sections.header.headline`) and how it updates `#header_headline` on the poster.
2. Where to replace the hero artwork (`nutrition/fixture.json` → `sections.hero.illustrationId` and `nutrition/assets/web/leaf_glow.png`) and how it updates `#hero_img` on the poster.
3. One working route from source edits to the published PNG (`source/render.mjs` → `source/nutrition.mjs` → Satori/Resvg → atomic `publishStaged` output).

## Deliverables

- `output/poster.png` — 1600×1000 PNG rendered from `output/index.html` via local Playwright.
- `output/index.html` — Matching self-contained offline HTML (embedded `Barlow Condensed` fonts and packet PNG assets, zero external URLs, zero runtime scripts).
- `output/content.json` — Editable source for all titles, captions, JSON callouts, and pipeline labels.
- `output/build.mjs` — Single-command offline build script.

## Single Rebuild Command

Run from the handout packet root:

```sh
node output/build.mjs
```

To test editing a caption, change any text field in `output/content.json` (for example `header.subtitle` or `headlineCard.caption`) and re-run `node output/build.mjs`. Both `output/index.html` and `output/poster.png` will regenerate with the updated text.
