### (1) ANSWER

**Choice: `A`** — Although [B-400.png](./B-400.png) is noticeably more legible at 400px thumbnail size and prints its CLI command on one unbroken line, [A-native.png](./A-native.png) is the only poster that actually explains *how* layout becomes PNG pixels (`renderSatori()` builds an SVG with `<feDropShadow>` and text-fit shrinking, then `@resvg/resvg-js` rasterizes that SVG into PNG bytes), gives the full nested JSON path for the headline (`sections.header.headline`), and avoids leaving the newcomer stranded on artwork caveats (PNG-only vs. WebP, and how to add a new ID).

```json
{
  "thumbnail": "At 400px width, B-400.png is markedly more readable than A-400.png: B's dark-green contrast and larger display typography keep the file paths (nutrition/fixture.json, nutrition/assets/web/leaf_glow.png), the 5-chevron pipeline names (fixture.json -> render.mjs -> nutrition.mjs -> Satori + resvg -> render.png), and even the full RUN THIS command legible at thumbnail scale, and its 3-column layout ('YOU EDIT' -> 'THE RECIPE STACKS IT' -> 'YOU SEE') scans immediately. A-400.png communicates its high-level 3-step structure and direct orange/green arrows to the finished poster well, but its JSON snippets, file-path pills, and 3A-3D pipeline cards are too small and dense to read cleanly at 400px.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit \"sections\".\"header\".\"headline\" (currently \"FUEL WELL. LIVE WELL.\") in nutrition/fixture.json; it renders as #header_headline in Barlow Condensed Bold (66px) and auto-shrinks if wider than 830px. For a quick test without editing JSON, add --set sections.header.headline=\"...\" to the printed render command.",
        "location": "Top-left Card 1 ('1 EDIT THE HEADLINE'): nutrition/fixture.json pill, dark JSON block with the highlighted \"headline\" line tagged 'EDIT THIS', 'WHAT CHANGES ON THE POSTER' callout, and orange arrow pointing to '1 #header_headline' on 'FINISHED POSTER'; plus the quick-test note at the bottom of sub-card '3A RUN ONE COMMAND'."
      },
      "artwork": {
        "answer": "Fastest swap: replace nutrition/assets/web/leaf_glow.png with a new transparent PNG (427x640, ~2:3 portrait; must stay PNG because default Satori/Resvg drops WebP). Alternatively, add a new asset ID by registering it in PNG_IDS in source/nutrition.mjs and updating \"hero\".\"illustrationId\" (currently \"leaf_glow\"). Cannot tell from Card 2 alone whether \"hero\" is top-level or nested under \"sections\".",
        "location": "Middle-left Card 2 ('2 REPLACE THE HERO ARTWORK'): nutrition/assets/web/leaf_glow.png pill, dark \"hero\" JSON snippet tagging \"illustrationId\": \"leaf_glow\" as 'ASSET ID', checkered 'TRANSPARENT PNG' preview ('leaf_glow.png · 427×640'), the two bullet options ('Fastest swap' / 'Or add a new ID'), the green note box at the bottom of Card 2, and the green arrow to '2 #hero_img' on 'FINISHED POSTER'."
      },
      "export": {
        "answer": "Causal chain shown: (1) source/render.mjs (runCLI) runs with nutrition/fixture.json and --format png --out out/ (printed command, not assumed to run); (2) source/nutrition.mjs runs validate() to check the fixture schema and 1000x1000 budget, then buildScene() to merge copy, the Barlow Condensed font, and pinned PNGs; (3) source/render.mjs (processRequest) calls renderSatori(), which builds an SVG plus the hero <feDropShadow> and shrinks overflowing text (x0.9, max 10x); (4) @resvg/resvg-js rasterizes the fitted SVG directly into PNG bytes (SVG rasterization, not a browser screenshot); (5) publishArtifacts() -> publishStaged() stages runs/<uuid>/render.png, result.json, and SHA-256 digests, then atomically swaps manifest.json to publish the finished poster.",
        "location": "Bottom full-width Card 3 ('3 ONE WORKING ROUTE TO THE EXPORTED PNG'), flowing left-to-right across sub-cards '3A RUN ONE COMMAND', '3B VALIDATE & BUILD SCENE', '3C LAYOUT, FIT & RASTERIZE', and '3D PUBLISH VERIFIED PNG', with the 'INPUTS' arrow entering from Card 2 and the 'WRITES PNG' arrow pointing up to 'FINISHED POSTER' ('nutrition/render.png · 1000×1000')."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit \"header\".\"headline\" (currently \"FUEL WELL. LIVE WELL.\") in nutrition/fixture.json; the poster prints it in capitals and shrinks it to fit one line. Card 1 omits the outer \"sections\" wrapper, though the bottom quick-try flag (--set sections.header.headline=\"NEW WORDS\") indicates it lives under sections.",
        "location": "Top-left Card 1 ('1 CHANGE THE HEADLINE') under '— YOU EDIT': green nutrition/fixture.json pill, JSON snippet highlighting \"FUEL WELL. LIVE WELL.\", caption below it, orange connector through 'WORDS' in '— THE RECIPE STACKS IT' to badge '1' on '— YOU SEE'; plus the 'Quick try without opening the file' line at the bottom below 'RUN THIS'."
      },
      "artwork": {
        "answer": "Save your new image over nutrition/assets/web/leaf_glow.png using the same filename, a see-through (transparent) background, PNG format (per the ARTWORK stack caption 'PNG files, found by name'), and a tall 427 x 640 shape; it is referenced by \"hero\".\"illustrationId\": \"leaf_glow\". Card 2 also says 'The file is pinned in provenance.json', but cannot tell whether overwriting the file requires editing provenance.json or how to add a different illustrationId.",
        "location": "Middle-left Card 2 ('2 SWAP THE HERO ARTWORK') under '— YOU EDIT': green nutrition/assets/web/leaf_glow.png pill, checkered leaf thumbnail, \"hero\" JSON snippet highlighting \"leaf_glow\", caption below it, blue connector through 'ARTWORK' ('PNG files, found by name') in '— THE RECIPE STACKS IT' to badge '2' on '— YOU SEE'."
      },
      "export": {
        "answer": "Shown high-level steps: nutrition/fixture.json (words and artwork names) -> source/render.mjs (runCLI) reads the fixture and applies CLI edits -> source/nutrition.mjs (buildScene) checks the fixture and places every word and picture (illustrated above as stacking WORDS, ARTWORK, and PAPER layers) -> 'Satori + resvg' (called by render.mjs) 'Lays out the type and paints the pixels' -> render.png in 'your --out folder'. Cannot tell the causal mechanism from layout to rasterization: B never mentions an intermediate SVG (or browser screenshot), does not separate what Satori does from what resvg does, and omits how pixel rasterization or output staging actually happens.",
        "location": "Bottom 'ONE ROUTE TO THE PNG' 5-chevron bar ('fixture.json' -> 'render.mjs' -> 'nutrition.mjs' -> 'Satori + resvg' -> 'render.png') and the 'RUN THIS' command line beneath it, plus the '— THE RECIPE STACKS IT' 3-layer diagram ('WORDS' / 'ARTWORK' / 'PAPER') and 'nutrition/render.png · 1000 × 1000' under '— YOU SEE'."
      }
    }
  },
  "choice": "A",
  "reason": "Poster A wins for this newcomer task because its sub-card '3C LAYOUT, FIT & RASTERIZE' explicitly traces the causal mechanism from layout to pixels (renderSatori() builds an SVG + <feDropShadow> and shrinks overflowing text, then @resvg/resvg-js rasterizes that SVG into PNG bytes), whereas Poster B collapses 'Satori + resvg' into one opaque chevron ('Lays out the type and paints the pixels') that never states how layout turns into PNG pixels. A also gives the complete nested headline key ('sections.header.headline') matching the --set flag and explicitly warns that default Satori/Resvg drops WebP while showing the new-ID path, whereas B omits 'sections' in Card 1 and mentions 'pinned in provenance.json' in Card 2 without explaining what a newcomer must do about it. B is stronger at 400px thumbnail legibility and keeps its RUN THIS command on one unbroken line, while A suffers a mid-flag wrap ('--' / 'format') in 3A, but A is still clearly more actionable and accurate at native reading size."
}
```

---

### (2) FINDINGS

- **[Blocker — B, export mechanism]**: In [B-native.png](./B-native.png) (`ONE ROUTE TO THE PNG`, 4th chevron), `Satori + resvg` is collapsed into `"Lays out the type and paints the pixels."` There is no mention of SVG as the intermediate format and no separation of responsibilities between Satori and resvg, leaving a newcomer unable to trace how layout produces PNG bytes.
- **[Pass — A, export mechanism]**: In [A-native.png](./A-native.png) (`3B` -> `3C` -> `3D`), the causal pipeline is explicit: `validate()` + `buildScene()` -> `renderSatori()` builds SVG + `<feDropShadow>` + text-fit (`×0.9, max 10×`) -> `@resvg/resvg-js` rasterizes fitted SVG to PNG bytes -> staged `runs/<uuid>/render.png` + `manifest.json` atomic swap.
- **[Should — A, broken CLI flag wrap]**: In [A-native.png](./A-native.png) (`3A RUN ONE COMMAND`), the printed command wraps mid-flag across lines (`node source/render.mjs nutrition/fixture.json --` / `format png --out out/`), risking copy/typing errors. By contrast, [B-native.png](./B-native.png) prints its `RUN THIS` command on one clean line.
- **[Should — B, incomplete JSON path & unresolved pinning caveat]**: In [B-native.png](./B-native.png), Card 1 omits the outer `"sections"` key (mismatching `--set sections.header.headline="NEW WORDS"` at the bottom), and Card 2 adds `"The file is pinned in provenance.json"` without stating whether overwriting `leaf_glow.png` breaks pinning or how to update it.
- **[Should — A, thumbnail legibility]**: At 400px ([A-400.png](./A-400.png) vs. [B-400.png](./B-400.png)), A's small body text and 3A–3D sub-cards lose readability while B's larger labels and command bar remain readable.
- **[Nit — A, minor dimension & output-path tension]**: In [A-native.png](./A-native.png), Card 2 labels the asset `427×640` while the green box says `#hero_img (428×640 px)`, and three output locations appear across the poster (`--out out/`, `runs/<uuid>/render.png`, and `nutrition/render.png`).

---

### (3) RECOMMENDATION

Choose **A** for the newcomer handoff guide, and fix its mid-flag `--` / `format` line wrap in `3A` (while borrowing B's single-line command bar and slightly larger type scale if you iterate further).
