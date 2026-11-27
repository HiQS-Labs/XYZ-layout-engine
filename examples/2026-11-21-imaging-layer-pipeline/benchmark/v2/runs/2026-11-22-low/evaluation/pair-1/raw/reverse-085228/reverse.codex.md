{
  "thumbnail": "A has larger, easier-to-read instructions at 400px. B visibly connects both edits to the poster using colored arrows; its smaller details become readable at native size.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json.",
        "location": "Source filename in the lime strip beneath the title; field under '1 Rewrite the title' at left; matching 1 beside the poster headline."
      },
      "artwork": {
        "answer": "Change sections.hero.illustrationId from leaf_glow to parfait_jar to put the jar in the center.",
        "location": "Left column under '2 Swap the leaf'; matching 2 over the central leaf."
      },
      "export": {
        "answer": "render.png",
        "location": "Bottom-right lime box in 'From fixture to PNG', marked 1000 × 1000."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit the header.headline text in nutrition/fixture.json; the printed command-line alternative is --set sections.header.headline=\"NEW WORDS\".",
        "location": "Upper-left '1 CHANGE THE HEADLINE' card; orange arrows point to the headline. Command-line alternative appears along the bottom edge."
      },
      "artwork": {
        "answer": "Replace nutrition/assets/web/leaf_glow.png with your picture using the same filename, a transparent background, and a tall 427 × 640 shape. The card shows hero.illustrationId as leaf_glow and notes that the file is pinned in provenance.json.",
        "location": "Lower-left '2 SWAP THE HERO ARTWORK' card; blue arrows connect the asset to the central leaf."
      },
      "export": {
        "answer": "nutrition/render.png",
        "location": "Printed directly beneath the finished poster at right, followed by 1000 × 1000."
      }
    }
  },
  "choice": "B",
  "reason": "[Pass] B provides explicit asset replacement requirements, a concrete export path, and a runnable export command with clear visual connections. [Should] A could add an export directory and command. Recommendation: choose B for the more actionable handoff."
}