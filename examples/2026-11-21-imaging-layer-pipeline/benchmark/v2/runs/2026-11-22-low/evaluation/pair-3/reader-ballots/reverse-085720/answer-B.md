{
  "thumbnail": "A's edit cards and layered composition are easy to distinguish at 400px, but its export explanation is small. B clearly connects both edits to the finished poster and separates export into four steps; the technical text requires the native image.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit nutrition/fixture.json at header.headline as pictured. The card says the words print in capitals and shrink to one line. The excerpt omits the enclosing sections object; the bottom override shows sections.header.headline.",
        "location": "A-native.png: upper-left orange '1 CHANGE THE HEADLINE' card; bottom 'Quick try' override."
      },
      "artwork": {
        "answer": "Overwrite nutrition/assets/web/leaf_glow.png with the replacement picture, retaining the filename, transparent background and 427×640 shape. The pictured hero.illustrationId remains leaf_glow; the card says the file is pinned in provenance.json.",
        "location": "A-native.png: lower-left blue '2 SWAP THE HERO ARTWORK' card."
      },
      "export": {
        "answer": "The pictured route says fixture.json supplies words and artwork names; source/render.mjs runCLI reads it and applies command-line edits; source/nutrition.mjs buildScene checks the fixture and places words and pictures; Satori + resvg lay out type and paint pixels, producing render.png in the --out folder. Cannot tell from A how Satori's output reaches resvg, what intermediate representation is rasterized, or how fitting works internally. No browser screenshot step is shown. The printed command is not evidence it runs.",
        "location": "A-native.png: bottom 'ONE ROUTE TO THE PNG' arrow sequence, especially 'nutrition.mjs' and 'Satori + resvg' boxes."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json. The poster says source/nutrition.mjs builds #header_headline in Barlow Condensed Bold at 66px and auto-shrinks it if wider than 830px.",
        "location": "B-native.png: upper-left '1 EDIT THE HEADLINE' code block and adjacent 'WHAT CHANGES ON THE POSTER' inset."
      },
      "artwork": {
        "answer": "Replace nutrition/assets/web/leaf_glow.png with a transparent PNG of roughly 2:3 portrait proportions. Alternatively, register a new ID in PNG_IDS in source/nutrition.mjs and update hero.illustrationId. The image is placed at #hero_img with a warm HERO_SHADOW glow.",
        "location": "B-native.png: middle-left '2 REPLACE THE HERO ARTWORK' card, its two swap instructions and green placement note."
      },
      "export": {
        "answer": "The pictured route starts with source/render.mjs runCLI. source/nutrition.mjs validate() checks the fixture schema and 1000×1000 budget; buildScene() merges copy, font and pinned PNGs. source/render.mjs processRequest uses renderSatori() to build SVG with a hero feDropShadow and shrink overflowing text by ×0.9, up to ten times. @resvg/resvg-js rasterizes the fitted SVG into PNG bytes. publishArtifacts() → publishStaged() stages render.png, result.json and SHA-256 digests, then atomically swaps manifest.json to publish. No browser screenshot step is shown. Whether the printed command actually runs cannot be established from the picture.",
        "location": "B-native.png: bottom export panel, steps 3A through 3D, particularly '3C LAYOUT, FIT & RASTERIZE'."
      }
    }
  },
  "choice": "B",
  "reason": "B visibly identifies the fitted SVG as the input rasterized into PNG bytes, resolving the causal gap in A's combined 'Satori + resvg' box. Its headline excerpt also shows the enclosing sections object, making the edit location clearer."
}
