### (1) ANSWER

```json
{
  "thumbnail": "At 400px thumbnail size, A-400.png has stronger macro contrast and larger display labels: the dark-green background, white cards, 3D layer stack headings ('WORDS', 'ARTWORK', 'PAPER'), and bottom chevron names ('fixture.json', 'render.mjs', 'nutrition.mjs', 'Satori + resvg', 'render.png') plus the 'node source/render.mjs ...' bar remain legible, while body copy is blurry. B-400.png has a cleaner, less cluttered 3-step visual hierarchy ('1 EDIT THE HEADLINE', '2 REPLACE THE HERO ARTWORK', 'FINISHED POSTER', and bottom band '3 ONE WORKING ROUTE TO THE EXPORTED PNG' with 3A–3D and direct horizontal callout arrows), but its code blocks, file pills, and bullet text in 3A–3D are too small to read at thumbnail size.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit nutrition/fixture.json and replace the string inside \"header\": { \"headline\": \"FUEL WELL. LIVE WELL.\" } (the card states the poster prints it in capitals and shrinks it to fit one line). Card 1 omits the enclosing \"sections\" key, though the bottom quick-try line shows an override without editing the file via --set sections.header.headline=\"NEW WORDS\".",
        "location": "A-native.png, top-left card '1 CHANGE THE HEADLINE' under '— YOU EDIT' (traced by orange arrow '1' through the 'WORDS' layer to the headline in '— YOU SEE'), plus the 'Quick try without opening the file' line at the very bottom."
      },
      "artwork": {
        "answer": "Overwrite nutrition/assets/web/leaf_glow.png using the same filename, a transparent ('see-through') background, and a tall 427 × 640 shape, noting the file is pinned in provenance.json. The card also displays \"hero\": { \"illustrationId\": \"leaf_glow\" } but cannot tell from the picture alone which file that JSON lives in or how to register a new illustrationId instead of overwriting leaf_glow.png.",
        "location": "A-native.png, middle-left card '2 SWAP THE HERO ARTWORK' under '— YOU EDIT' (traced by blue arrow '2' through the 'ARTWORK' layer to the leaf in '— YOU SEE')."
      },
      "export": {
        "answer": "Partially shown; key causal steps cannot be told. The bottom strip shows: nutrition/fixture.json holds words/artwork names -> source/render.mjs (runCLI) reads the fixture and applies CLI edits (shown invoked via node source/render.mjs nutrition/fixture.json --format png --out my-folder) -> source/nutrition.mjs (buildScene) checks the fixture and places every word and picture -> render.mjs calls 'Satori + resvg', described only as 'Lays out the type and paints the pixels' -> writes render.png in the --out folder. Cannot tell from Poster A what intermediate format is produced (SVG is never mentioned), which tool does layout versus rasterization, whether PNG pixels come from direct SVG rasterization or a browser screenshot, or how text shrinking/compositing actually executes.",
        "location": "A-native.png, bottom chevron strip 'ONE ROUTE TO THE PNG' (chevrons 1–5) and 'RUN THIS' bar below it; center '— THE RECIPE STACKS IT' shows only a conceptual WORDS/ARTWORK/PAPER layer stack, not the rendering pipeline."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit nutrition/fixture.json at \"sections\": { \"header\": { \"headline\": \"FUEL WELL. LIVE WELL.\" } } (highlighted 'EDIT THIS'). Built by source/nutrition.mjs as #header_headline in Barlow Condensed Bold (66px) and auto-shrinks if wider than 830px. For a quick test without editing JSON, add --set sections.header.headline=\"...\" to the CLI command.",
        "location": "B-native.png, top-left card '1 EDIT THE HEADLINE' (file pill 'nutrition/fixture.json', dark JSON snippet, 'WHAT CHANGES ON THE POSTER' inset, orange arrow to '1 #header_headline' on 'FINISHED POSTER'), plus bottom-left box '3A RUN ONE COMMAND'."
      },
      "artwork": {
        "answer": "Two pictured options: (1) fastest swap: replace nutrition/assets/web/leaf_glow.png with a new transparent PNG (~2:3 portrait; preview labeled 427×640, placed at #hero_img 428×640 px with warm HERO_SHADOW glow); (2) add a new ID: register it in PNG_IDS (source/nutrition.mjs) and update \"hero\": { \"illustrationId\": \"leaf_glow\" } (cannot tell explicitly from Card 2's pill alone that this JSON snippet is inside nutrition/fixture.json, though it is implied by Card 1). Must stay PNG format because default Satori/Resvg drops WebP. Note: 3B mentions 'pinned PNGs' but cannot tell from Poster B what file pins them (provenance.json is not named).",
        "location": "B-native.png, middle-left card '2 REPLACE THE HERO ARTWORK' (file pill 'nutrition/assets/web/leaf_glow.png', dark JSON block, 'TRANSPARENT PNG' preview box, bullet list, green callout note, green arrow to '2 #hero_img' on 'FINISHED POSTER') and box '3B VALIDATE & BUILD SCENE'."
      },
      "export": {
        "answer": "Causal pipeline shown end-to-end without a browser screenshot: (1) source/render.mjs (runCLI) takes nutrition/fixture.json (and optional --set overrides) via the pictured CLI invocation; (2) source/nutrition.mjs runs validate() to check fixture schema and 1000×1000 budget, then buildScene() merges copy, Barlow Condensed font, and pinned PNGs; (3) source/render.mjs (processRequest) calls renderSatori() to lay out and build an SVG plus the hero <feDropShadow> and iteratively shrinks overflowing text (×0.9, max 10×), then @resvg/resvg-js rasterizes that fitted SVG directly into PNG bytes; (4) publishArtifacts() -> publishStaged() stages runs/<uuid>/render.png, result.json, and SHA-256 digests and atomically swaps manifest.json to publish the finished poster. (Minor ambiguity: cannot tell from B alone how the staged --out out/ runs/<uuid>/render.png relates to the 'nutrition/render.png' label on 'FINISHED POSTER'.)",
        "location": "B-native.png, bottom blue panel '3 ONE WORKING ROUTE TO THE EXPORTED PNG', boxes '3A RUN ONE COMMAND', '3B VALIDATE & BUILD SCENE', '3C LAYOUT, FIT & RASTERIZE', and '3D PUBLISH VERIFIED PNG', linked by 'INPUTS' and 'WRITES PNG' arrows."
      }
    }
  },
  "choice": "B",
  "reason": "Poster B directly answers all three newcomer questions—most critically the causal layout-to-PNG mechanism in box 3C ('renderSatori() builds SVG + hero <feDropShadow> and shrinks overflowing text (×0.9, max 10×)' followed by '@resvg/resvg-js rasterizes the fitted SVG into PNG bytes'), whereas Poster A collapses 'Satori + resvg' into one opaque chevron ('Lays out the type and paints the pixels') without ever mentioning SVG or separating layout from rasterization. B also shows the enclosing \"sections\" key in Card 1 (matching --set sections.header.headline), covers both overwriting leaf_glow.png and registering a new ID in PNG_IDS while warning that Satori/Resvg drops WebP, and uses direct horizontal callout arrows instead of A's decorative 3D layer stack."
}
```

### (2) FINDINGS

- **[Blocker] Poster A fails to explain how PNG pixels are produced** (`A-native.png`, `ONE ROUTE TO THE PNG`, chevron 4): Merging `Satori + resvg` into `"Lays out the type and paints the pixels"` omits the intermediate SVG representation and leaves the reader unable to tell which engine performs layout versus rasterization (or whether a browser screenshot is involved). Meanwhile, the middle third (`— THE RECIPE STACKS IT`) spends prime visual space on a conceptual 3-plane layer metaphor that does not clarify the actual SVG→PNG pipeline.
- **[Pass] Poster B clearly traces the causal layout-to-rasterization path** (`B-native.png`, `3B`–`3D`): Explicitly separates `validate()`/`buildScene()` (`source/nutrition.mjs`), `renderSatori()` building SVG + `<feDropShadow>` with bounded overflow shrinking (`×0.9`, max `10×`), `@resvg/resvg-js` rasterizing the fitted SVG into PNG bytes, and `publishArtifacts()`/`publishStaged()` staging `runs/<uuid>/render.png` with SHA-256 digests and atomic `manifest.json` swap.
- **[Should] Poster A's Card 1 omits the `"sections"` wrapper** (`A-native.png`, Card `1` vs. bottom `Quick try` line): Card `1` shows `"header": { "headline": ... }`, while the bottom CLI flag uses `sections.header.headline`. Poster B (`B-native.png`, Card `1`) shows the full `"sections" -> "header" -> "headline"` nesting, avoiding confusion.
- **[Should] Poster B omits `provenance.json` where Poster A includes it** (`B-native.png`, Card `2` & `3B` vs. `A-native.png`, Card `2`): B says `pinned PNGs` in `3B` without naming the pinning file; if `provenance.json` enforces a checksum/manifest pin, a newcomer following B's "Fastest swap" could hit a surprise failure that A explicitly flags.
- **[Nit] Minor path/dimension ambiguities in Poster B** (`B-native.png`, Card `2`, `3A`, `3D`, `FINISHED POSTER`): Card `2` doesn't explicitly label its `"hero"` JSON snippet as belonging to `nutrition/fixture.json`; the asset badge reads `427×640` while the slot note reads `428×640 px`; and the `WRITES PNG` arrow connects staged `--out out/` (`runs/<uuid>/render.png`) to the preview header `nutrition/render.png · 1000×1000` without stating whether `nutrition/render.png` is updated or is only the reference sample.
- **[Nit] Thumbnail legibility trade-off** (`A-400.png` vs. `B-400.png`): `A-400.png` is easier to read at 400px for pipeline names and the CLI bar, whereas `B-400.png` requires native resolution to read its code snippets and `3A`–`3D` bullets.

### (3) RECOMMENDATION

Choose **Poster B** for this newcomer handover task (and if revising B later, name `provenance.json` in Card `2`/`3B` and clarify the `--out` vs. `nutrition/render.png` output path).
