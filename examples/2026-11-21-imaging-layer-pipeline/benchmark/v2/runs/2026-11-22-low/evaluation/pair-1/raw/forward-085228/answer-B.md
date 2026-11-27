{
  "thumbnail": "Viewed A-400.png, then B-400.png, then both native images. B makes the two edit instructions easier to read at thumbnail size; A provides more explicit asset and export details.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit nutrition/fixture.json, header.headline; the bottom shortcut explicitly prints sections.header.headline.",
        "location": "A-native.png: upper-left orange 'CHANGE THE HEADLINE' card; CLI shortcut along the bottom."
      },
      "artwork": {
        "answer": "Replace nutrition/assets/web/leaf_glow.png with your picture using the same filename, transparent background, and tall 427 × 640 shape. The card shows hero.illustrationId as leaf_glow and says the file is pinned in provenance.json.",
        "location": "A-native.png: lower-left blue 'SWAP THE HERO ARTWORK' card."
      },
      "export": {
        "answer": "nutrition/render.png",
        "location": "A-native.png: directly below the finished poster on the right, followed by '1000 × 1000'."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json.",
        "location": "B-native.png: lime SOURCE strip names the file; left-side '1 Rewrite the title' instruction gives the field."
      },
      "artwork": {
        "answer": "Change sections.hero.illustrationId from leaf_glow to parfait_jar to put the jar in the center.",
        "location": "B-native.png: left-side '2 Swap the leaf' instruction."
      },
      "export": {
        "answer": "render.png",
        "location": "B-native.png: bottom-right lime box under 'From fixture to PNG', beneath '1000 × 1000'. No directory is printed."
      }
    }
  },
  "choice": "A",
  "reason": "[Pass] A supplies a concrete replacement asset path, image constraints, a runnable export command, and an explicit output path. [Should] A should make its headline field notation consistent between the card and CLI shortcut. [Pass] B clearly specifies the leaf_glow-to-parfait_jar change. [Should] B should print an export directory and command; its workflow also claims Playwright while A prints Satori + resvg, a discrepancy these images alone cannot resolve. Recommendation: use A and clarify its headline field notation."
}
