{
  "thumbnail": "A’s numbered edit areas and bottom processing chain are visible, but their text is small. B’s headline and leaf instructions are easier to read at thumbnail size; its export strip explicitly says Playwright screenshots the page.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json. The pictured builder places it as #header_headline and shrinks text wider than 830px.",
        "location": "A-native.png, upper-left panel 1: highlighted headline JSON line and adjacent 'What changes on the poster' box; orange arrow points to the poster’s top headline."
      },
      "artwork": {
        "answer": "Replace nutrition/assets/web/leaf_glow.png with a transparent PNG, approximately 2:3 portrait. Alternatively, register a new ID in PNG_IDS in source/nutrition.mjs and update hero.illustrationId. The pictured placement is #hero_img.",
        "location": "A-native.png, middle-left panel 2: asset-path badge, highlighted illustrationId, and two swap instructions; green arrow points to the central leaf."
      },
      "export": {
        "answer": "The pictured route validates the fixture schema and 1000×1000 budget, then buildScene merges copy, font, and pinned PNG assets. renderSatori builds SVG with a hero drop shadow and shrinks overflowing text. @resvg/resvg-js rasterizes the fitted SVG into PNG bytes. Publishing stages render.png, result.json, and digests, then atomically swaps manifest.json. The printed CLI command is an instruction; the picture does not prove it runs.",
        "location": "A-native.png, bottom blue panel 3: connected boxes 3A through 3D, especially 3B 'Validate & build scene' and 3C 'Layout, fit & rasterize'."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json to change the words across the poster’s top.",
        "location": "B-native.png, lime SOURCE bar and left-side instruction 1 'Rewrite the title'; matching marker 1 sits beside the poster’s headline."
      },
      "artwork": {
        "answer": "Change sections.hero.illustrationId from leaf_glow to parfait_jar to place the jar in the center.",
        "location": "B-native.png, left-side instruction 2 'Swap the leaf'; matching marker 2 overlays the central leaf."
      },
      "export": {
        "answer": "The pictured sequence says nutrition.mjs builds a scene by placing text and art, then render.mjs uses Playwright to screenshot the page, producing a 1000×1000 render.png. Cannot tell how the scene becomes a browser page or how layout is performed; those steps are not pictured.",
        "location": "B-native.png, bottom 'From fixture to PNG' strip: 'Build scene' → 'Playwright / Screenshot the page' → 'render.png'."
      }
    }
  },
  "choice": "A",
  "reason": "A visibly connects scene construction to SVG layout and Resvg rasterization into PNG bytes, answering how pixels are produced. B offers more readable editing instructions but leaves the scene-to-browser-page transition unexplained."
}