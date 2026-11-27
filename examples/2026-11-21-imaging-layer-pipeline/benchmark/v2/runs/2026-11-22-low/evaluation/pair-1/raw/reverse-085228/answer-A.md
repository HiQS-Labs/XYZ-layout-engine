### (1) ANSWER

Choice: **B** (viewed `A-400.png` and `B-400.png` first, then `A-native.png` and `B-native.png` in `the anonymous judging room`).

```json
{
  "thumbnail": "At 400px width, A-400.png is more immediately legible because of its large portrait typography, high-contrast lime source bar, and spacious two-step layout (both JSON dot-paths and the 3-box bottom flow read clearly at thumbnail scale). B-400.png remains structurally clear—its title, 3-column flow (YOU EDIT / THE RECIPE STACKS IT / YOU SEE), exploded layer stack, color-coded 1/2 callouts, green path pills, and RUN THIS bar are all recognizable—but its smaller body copy, JSON snippet text, and 5-chevron descriptions are tighter and softer at 400px.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit sections.header.headline in nutrition/fixture.json to change the words across the top of the poster.",
        "location": "Top lime banner ('SOURCE nutrition/fixture.json') and left column Step 1 ('1 Rewrite the title' -> 'sections.header.headline'), paired with badge 1 on the top-left border of the right-hand poster preview."
      },
      "artwork": {
        "answer": "Edit sections.hero.illustrationId in nutrition/fixture.json, changing 'leaf_glow' to 'parfait_jar' to put the jar in the center.",
        "location": "Left column Step 2 ('2 Swap the leaf' -> 'sections.hero.illustrationId', body text 'Change leaf_glow to parfait_jar to put the jar in the center.'), paired with badge 2 overlaid on the center leaf in the right-hand poster preview."
      },
      "export": {
        "answer": "render.png (bare filename only; no directory prefix or CLI command is printed).",
        "location": "Bottom-right lime green card of the 'From fixture to PNG' 3-step strip ('1000 × 1000' / 'render.png' / 'Finished poster.')."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit nutrition/fixture.json at \"header\": { \"headline\": \"FUEL WELL. LIVE WELL.\" } (or pass --set sections.header.headline=\"NEW WORDS\" without opening the file).",
        "location": "Left column '— YOU EDIT' Card 1 ('1 CHANGE THE HEADLINE', green pill 'nutrition/fixture.json', JSON snippet showing \"header\": { \"headline\": \"FUEL WELL. LIVE WELL.\" }), traced by an orange arrow through the 'WORDS' layer to badge 1 on the '— YOU SEE' preview; CLI override printed on the bottom line ('Quick try without opening the file, add: --set sections.header.headline=\"NEW WORDS\"')."
      },
      "artwork": {
        "answer": "Overwrite nutrition/assets/web/leaf_glow.png with your new image using the same filename, a transparent (see-through) background, and tall 427 × 640 dimensions (referenced by \"hero\": { \"illustrationId\": \"leaf_glow\" } and pinned in provenance.json).",
        "location": "Left column '— YOU EDIT' Card 2 ('2 SWAP THE HERO ARTWORK', green pill 'nutrition/assets/web/leaf_glow.png', checkerboard leaf thumbnail + JSON snippet \"hero\": { \"illustrationId\": \"leaf_glow\" }, and instructions beneath), traced by a blue arrow through the 'ARTWORK' layer to badge 2 on the '— YOU SEE' preview."
      },
      "export": {
        "answer": "nutrition/render.png (and render.png inside your --out folder, e.g., --out my-folder in the printed RUN THIS command).",
        "location": "Caption directly beneath the right-hand '— YOU SEE' poster preview ('nutrition/render.png · 1000 × 1000'), reinforced by the bottom-right green chevron in 'ONE ROUTE TO THE PNG' ('your --out folder' / 'render.png') and the bottom 'RUN THIS' command bar ('node source/render.mjs nutrition/fixture.json --format png --out my-folder')."
      }
    }
  },
  "choice": "B",
  "reason": "With no density penalty, B is a far more complete and immediately actionable handoff map: it prints an actual directory-qualified export path (nutrition/render.png) plus the exact runnable CLI command and --set override, shows the real artwork file path (nutrition/assets/web/leaf_glow.png) with transparency, 427 × 640 dimensions, and provenance.json pinning requirements, and visually connects each edit through the exploded WORDS/ARTWORK/PAPER composition layers directly to the rendered poster. A is cleaner at 400px thumbnail size and prints explicit full dot-paths (sections.header.headline, sections.hero.illustrationId), but omits a real export directory path, omits any runnable command, and only shows swapping leaf_glow to parfait_jar rather than supplying custom artwork."
}
```

### (2) FINDINGS

- **[Pass] B — Complete, runnable handoff details (`B-native.png`)**: Provides a full relative export path (`nutrition/render.png`), exact invocation (`node source/render.mjs nutrition/fixture.json --format png --out my-folder`), zero-edit CLI flag (`--set sections.header.headline="NEW WORDS"`), asset path (`nutrition/assets/web/leaf_glow.png`), transparency/aspect constraints (`427 × 640`), and `provenance.json` warning.
- **[Pass] A — Superior thumbnail legibility and explicit dot-paths (`A-400.png`, `A-native.png`)**: `A-400.png` remains sharply readable at 400px width, and `A-native.png` explicitly includes the `sections.` root prefix in `sections.header.headline` and `sections.hero.illustrationId`.
- **[Should] A — Missing operational handoff specifics (`A-native.png`)**: Prints only bare `render.png` with no directory path, gives no CLI command to execute `nutrition.mjs` / `render.mjs`, and only shows swapping `illustrationId` to `parfait_jar` without documenting where custom PNG artwork lives or its sizing/transparency requirements.
- **[Nit] B — Partial JSON key paths in Cards 1 & 2 and softer 400px body text (`B-400.png`, `B-native.png`)**: Cards 1 and 2 show `"header"` and `"hero"` without the enclosing `"sections"` key (though the bottom `--set sections.header.headline="NEW WORDS"` reveals it), and small body text is slightly cramped at 400px width.
- **[Should] Cross-poster pipeline discrepancy (`A-native.png` vs `B-native.png`)**: A states `render.mjs` uses `Playwright` (`Screenshot the page.`) after `nutrition.mjs`, whereas B states `source/render.mjs` (`runCLI`) calls `source/nutrition.mjs` (`buildScene`) and `Satori + resvg` (`Lays out the type and paints the pixels.`). Because only the four images were read, whichever side conflicts with the actual renderer should be reconciled against the codebase.

### (3) RECOMMENDATION

Pick **B** as the superior handoff graphic (no density penalty), and optionally tighten its Cards 1–2 snippets to show the `sections.` wrapper while verifying whether the real renderer uses `Satori + resvg` (B) or `Playwright` (A).
