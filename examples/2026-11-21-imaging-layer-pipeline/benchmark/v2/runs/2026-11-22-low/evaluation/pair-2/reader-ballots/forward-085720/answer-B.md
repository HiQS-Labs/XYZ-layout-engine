{
  "thumbnail": "A’s headline and leaf instructions are readable at thumbnail size, and its three-step export strip is easy to follow. B’s numbered sections and arrows establish the same tasks, but its processing details require the native image.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json.",
        "location": "A-native.png: lime SOURCE strip near the top and left-hand section 1, “Rewrite the title”; matching 1 marker beside the poster headline."
      },
      "artwork": {
        "answer": "Change sections.hero.illustrationId from leaf_glow to parfait_jar to put the jar in the center.",
        "location": "A-native.png: left-hand section 2, “Swap the leaf”; matching 2 marker on the central leaf."
      },
      "export": {
        "answer": "[Pass] The pictured route says nutrition.mjs builds a scene by placing text and art, then render.mjs uses Playwright to screenshot the page into a 1000×1000 render.png. Cannot tell how the scene becomes the browser page or whether this route actually runs.",
        "location": "A-native.png: bottom “From fixture to PNG” strip, with arrows connecting Build scene → Playwright / Screenshot the page → render.png."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json. The picture says source/nutrition.mjs builds it as #header_headline and shrinks text wider than 830px.",
        "location": "B-native.png: upper-left section 1, highlighted headline JSON row and adjacent “What changes on the poster” box; orange arrow points to the outlined poster headline."
      },
      "artwork": {
        "answer": "Replace nutrition/assets/web/leaf_glow.png with a transparent PNG, approximately 2:3 portrait. Alternatively register a new ID in PNG_IDS in source/nutrition.mjs and update hero.illustrationId.",
        "location": "B-native.png: middle-left section 2, asset path badge, highlighted illustrationId row, and two swap instructions; green arrow points to #hero_img."
      },
      "export": {
        "answer": "[Pass] The pictured route starts with source/render.mjs CLI input, then validate() checks the fixture schema and 1000×1000 budget. buildScene() combines copy, font, and pinned PNGs. renderSatori() builds SVG with a hero drop shadow and shrinks overflowing text; @resvg/resvg-js rasterizes the fitted SVG into PNG bytes. Publishing stages render.png, result.json, and digests, then atomically swaps manifest.json. Cannot tell whether the printed command runs.",
        "location": "B-native.png: bottom blue section 3, sequential panels 3A–3D, particularly 3B “Validate & build scene” and 3C “Layout, fit & rasterize.”"
      }
    }
  },
  "choice": "B",
  "reason": "B visibly connects the editable JSON and artwork to their poster locations, then names the SVG-to-PNG rasterization step. That causal explanation helps a newcomer understand how pixels are produced; A leaves the scene-to-browser handoff unexplained. Recommendation: choose B."
}
