# How a poster is assembled: editing notes

An exploded-view explainer of how XYZ Layout Engine builds the “Fuel Well. Live Well.” nutrition poster.

- `index.html`: self-contained offline page, 1400 × 1120. Fonts and images are embedded as base64. It has no scripts and makes no network requests.
- `poster.png`: Chromium's screenshot of that same `index.html`, 1400 × 1120.

## Rebuild (one command)

Run from the packet root:

```sh
node output/src/build.mjs
```

The build needs Node.js and Playwright's Chromium. Playwright is found by normal Node module resolution. If the packet is copied somewhere that resolution can't reach, run the command from a folder where `playwright` resolves, or set `PLAYWRIGHT_PATH=<folder containing node_modules/playwright>`. The build reads only packet files: `nutrition/fixture.json`, `nutrition/render.png`, `nutrition/render-inline.html`, `nutrition/assets/web/*.png` and `fonts/*.ttf`. It writes both deliverables. One run takes about 2 s.

How it works (`src/build.mjs`):

1. Loads `nutrition/render-inline.html` in Chromium and measures every `[id]` box: `header_headline`, `hero_img`, `items` and so on. The middle “Layout” plane is drawn from the recipe's real geometry, not traced by hand.
2. Renders the explainer once and reads where the 3D-projected anchor points landed on screen.
3. Bakes the connector and leader lines into static SVG, writes `index.html`, reopens that file and screenshots it to `poster.png`. Both outputs come from one DOM, so they match pixel for pixel.

## Where to edit

| To change | Edit |
|---|---|
| Any caption, title or note text | `src/content.json` (supports `` `code` `` and `**bold**`) |
| Colours, type sizes, panel layout | `src/style.css` |
| Plane depth, angle, scale and spacing; note positions | `PLANES`, `PERSPECTIVE`, `ORIGIN`, `NOTES` at the top of `src/build.mjs` |
| Headline or leaf shown on the planes | Read from `nutrition/fixture.json` (`sections.header.headline`, `hero.illustrationId`) |

Caption-edit check: change `"editWordsTitle": "EDIT THE WORDS"` in `src/content.json`, then rerun the command. The new text appears in both `index.html` and `poster.png`.

## The visual decision that does the most work

**Three planes threaded by colour-coded projection lines.** The poster is split into three planes in true CSS 3D perspective, back to front: ① CONTENT (`fixture.json` plus the artwork file), ② LAYOUT (the recipe's styled boxes, drawn from measured geometry) and ③ RENDER (the finished poster).

One thread runs through all three for each thing a newcomer wants to change:

- **Amber** joins the `"headline"` value in the JSON to the `#header_headline` box, then to the printed headline.
- **Green** joins `"illustrationId": "leaf_glow"` to the artwork tile, then to the dashed `#hero_img` box. Four frustum rays carry that box onto the leaf in the finished poster.
- **Cyan** marks placement. `left: 262`, `top: -34` and `width: 428 · height: 640` are dimensioned on the Layout plane, where the recipe sets them.

The composition alone shows that the words come from the data and the leaf is a file chosen by ID. The leaf's position is a style value in the recipe layer between them. Depth cues: perspective foreshortening, the back plane dimmed, the glass middle plane, the floor grid, overlap and shadows.

## Technical claims (checked against `source/`)

- `source/nutrition.mjs` `buildScene()` sets `img('hero_img', heroImage, { position: 'absolute', left: 262, top: -34, width: 428, height: 640, filter: HERO_SHADOW })` inside `#hero`. Raising `left` by 100 moves the leaf 100 px right.
- `source/render.mjs` `processRequest()` imports the recipe in Node.js at render time. It calls `recipe.buildScene(fixture, sizes)` up to `MAX_ATTEMPTS = 10` times, shrinking overflowing text by 0.9 each time.
- Satori backend: `renderSatori()` runs `satori(scene) → svg`, then `new Resvg(svg).render().asPng()`.
- Playwright backend: `renderPlaywright()` runs `toDocument()` to make HTML, then `page.setContent` in headless Chromium, then `page.screenshot()` for the PNG.
- `toHtml()` turns each style object into inline CSS: camelCase becomes kebab-case and numbers get `px`, so `left: 262` becomes `left:262px`. Unitless keys such as `fontWeight` stay bare. For either backend, the `html` format is written through `toDocument()`, which embeds the fonts and images.

## Generated assets

None. No Higgsfield access or credit cap was provided, so all artwork is packet material (`nutrition/render.png`, `nutrition/assets/web/leaf_glow.png`, bundled Barlow Condensed under the `fonts/OFL.txt` licence) plus CSS and SVG drawn locally.

## Inspection

The PNG was checked at 1400 px and at a 400 px-wide thumbnail. At thumbnail size, “EDIT THE WORDS”, “SWAP THE LEAF”, “MOVE THE LEAF”, “② LAYOUT” and “③ RENDER” stay legible, and their leaders and threads still reach the right parts.

Machine checks on the build:
- An HTML capture against `poster.png` at native size gives a mean RGB difference of 0.
- A 32 × 32 sample has 157 colours.
- No external requests, no script errors, and all 3 images decode.
- Every required caption term pair sits within 55 characters of its partner.

Known limit: the 3D anchor projection is measured in Chromium. Changing `PLANES` needs a rebuild, which happens anyway, and is not a live in-browser effect.
