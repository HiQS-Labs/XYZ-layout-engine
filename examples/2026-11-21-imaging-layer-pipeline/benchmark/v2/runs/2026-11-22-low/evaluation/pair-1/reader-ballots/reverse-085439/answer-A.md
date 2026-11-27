### (1) ANSWER

**Choice: `B`** (read from [A-400.png](./A-400.png), [B-400.png](./B-400.png), [A-native.png](./A-native.png), and [B-native.png](./B-native.png)).

At thumbnail size, **A** is substantially easier to read; at native size, **B** wins for this newcomer task because it answers how to replace the leaf artwork with an actual image file (not only swap to another existing ID) and traces a complete causal pipeline from `fixture.json` through `render.mjs` (`runCLI`) and `nutrition.mjs` (`buildScene`) to `Satori + resvg` laying out type and painting pixels into `render.png`.

```json
{
  "thumbnail": "At 400px, A-400.png is clearly legible: the headline ('Editing Fuel Well.'), lime source bar ('SOURCE nutrition/fixture.json'), both exact dotted paths ('sections.header.headline', 'sections.hero.illustrationId'), the leaf_glow-to-parfait_jar instruction, and all three bottom pipeline cards ('nutrition.mjs Build scene' -> 'render.mjs Playwright Screenshot the page.' -> '1000 x 1000 render.png') read cleanly without zooming. B-400.png communicates its overall three-column structure ('YOU EDIT' -> 'THE RECIPE STACKS IT' -> 'YOU SEE') and bottom chevron flow ('ONE ROUTE TO THE PNG'), but its card body text, JSON snippets, asset path, chevron descriptions, and CLI command are too small and blurry to read reliably until viewing B-native.png.",
  "reading": {
    "A": {
      "headline": {
        "answer": "Edit the field `sections.header.headline` inside `nutrition/fixture.json` to change the words across the top of the poster.",
        "location": "Top lime horizontal banner ('SOURCE nutrition/fixture.json'), left column step 1 ('1 Rewrite the title' with monospace path `sections.header.headline`), and coral badge `1` placed on the upper-left outer border of the poster preview beside 'FUEL WELL. LIVE WELL.'."
      },
      "artwork": {
        "answer": "Change `sections.hero.illustrationId` in `nutrition/fixture.json` from `leaf_glow` to another illustration ID such as `parfait_jar`. Cannot tell from Poster A where artwork image files live on disk, what format/dimensions/transparency a custom replacement image needs, or how to add a new image instead of reusing an existing ID.",
        "location": "Top lime horizontal banner ('SOURCE nutrition/fixture.json'), left column step 2 ('2 Swap the leaf' with `sections.hero.illustrationId` and 'Change leaf_glow to parfait_jar to put the jar in the center.'), and lime badge `2` centered on the green leaf in the poster preview."
      },
      "export": {
        "answer": "Poster A shows a three-step chain from fixture to PNG: (1) `nutrition.mjs` ('Build scene') places text and art; (2) `render.mjs` uses Playwright ('Screenshot the page.') to capture a browser screenshot; (3) this outputs `render.png` at `1000 × 1000` ('Finished poster.'). Cannot tell from Poster A how `nutrition/fixture.json` enters `nutrition.mjs`, which script calls which, or how the built scene becomes a web page before Playwright screenshots it.",
        "location": "Bottom horizontal section titled 'From fixture to PNG' showing three arrow-linked boxes (`nutrition.mjs / Build scene / Place text and art.` -> `render.mjs / Playwright / Screenshot the page.` -> `1000 × 1000 / render.png / Finished poster.`), paired with the top lime `SOURCE nutrition/fixture.json` banner."
      }
    },
    "B": {
      "headline": {
        "answer": "Edit the string value of `\"headline\"` inside `\"header\"` (`\"FUEL WELL. LIVE WELL.\"`) in `nutrition/fixture.json` (the poster prints it in capitals and shrinks it to fit one line). The bottom hint also shows a non-file override flag `--set sections.header.headline=\"NEW WORDS\"` (not assumed to run). Note that Card 1 omits the outer `sections` parent key shown in the bottom `--set` path.",
        "location": "Upper-left card under '— YOU EDIT' labeled '1 CHANGE THE HEADLINE' with green pill `nutrition/fixture.json` and orange-highlighted snippet `\"header\": { \"headline\": \"FUEL WELL. LIVE WELL.\" }`, traced by an orange arrow across the `WORDS` layer under '— THE RECIPE STACKS IT' to orange badge `1` and an orange outline around 'FUEL WELL. LIVE WELL.' under '— YOU SEE'; plus the bottom 'Quick try without opening the file, add: --set sections.header.headline=\"NEW WORDS\"' line."
      },
      "artwork": {
        "answer": "Overwrite `nutrition/assets/web/leaf_glow.png` with your replacement picture using the same filename, a transparent ('see-through') background, and a tall `427 × 640` shape (noting the file is pinned in `provenance.json`). Card 2 also shows the fixture binding `\"hero\": { \"illustrationId\": \"leaf_glow\" }`, which maps to PNG files looked up by name on the artwork layer (though Card 2 does not repeat `nutrition/fixture.json` or the `sections.` parent key).",
        "location": "Lower-left card under '— YOU EDIT' labeled '2 SWAP THE HERO ARTWORK' with green pill `nutrition/assets/web/leaf_glow.png`, checkerboard leaf thumbnail, blue-highlighted snippet `\"hero\": { \"illustrationId\": \"leaf_glow\" }`, and sizing/provenance note; traced by a blue arrow through the middle `ARTWORK` layer ('PNG files, found by name') to blue badge `2` circling the center leaf under '— YOU SEE'."
      },
      "export": {
        "answer": "Poster B traces a five-step causal chain: (1) `nutrition/fixture.json` supplies the words and artwork names; (2) `source/render.mjs` (`runCLI`) reads the fixture and applies any command-line edits; (3) `source/nutrition.mjs` (`buildScene`) checks the fixture and places every word and picture (compositing `PAPER` theme colors, `ARTWORK` PNGs found by name, and `WORDS` from `fixture.json`); (4) `render.mjs` calls `Satori + resvg`, which lays out the type and paints the pixels; (5) the finished `1000 × 1000` `render.png` is written to `your --out folder`. Cannot tell from the poster text alone what intermediate representation passes between Satori and resvg.",
        "location": "Bottom five-chevron pipeline titled 'ONE ROUTE TO THE PNG' (`nutrition/ fixture.json` -> `source/ · runCLI render.mjs` -> `source/ · buildScene nutrition.mjs` -> `called by render.mjs Satori + resvg` -> `your --out folder render.png`), complemented by the middle '— THE RECIPE STACKS IT' three-layer diagram (`WORDS`, `ARTWORK`, `PAPER`) and the `nutrition/render.png · 1000 × 1000` caption under '— YOU SEE'."
      }
    }
  },
  "choice": "B",
  "reason": "For this newcomer task at native resolution, B answers all three questions more completely and causally: Card 2 tells a newcomer how to replace the leaf with a new image (`nutrition/assets/web/leaf_glow.png`, transparent background, 427 × 640, `provenance.json`) alongside the `illustrationId` link, whereas A only shows swapping to another existing ID (`parfait_jar`); B's color-coded arrows through the exploded `WORDS`/`ARTWORK`/`PAPER` layers tightly anchor edits to the exact output regions (unlike A's badge `1` floating on the outer left border); and B's `ONE ROUTE TO THE PNG` chevrons trace the full causal handoff from `fixture.json` through `render.mjs` (`runCLI`) and `nutrition.mjs` (`buildScene`) to `Satori + resvg` laying out type and painting pixels, whereas A jumps abruptly from `nutrition.mjs` ('Build scene') to `render.mjs` ('Playwright / Screenshot the page.') without connecting `fixture.json` or explaining how the scene becomes a page. B's main hindrances are poor legibility at 400px thumbnail scale and omitting the `sections.` parent key inside its two `YOU EDIT` JSON snippets."
}
```

### (2) FINDINGS

- **[Blocker] Direct factual contradiction on the rendering engine between A and B:** [A-native.png](./A-native.png) claims `render.mjs` uses **Playwright** ("Screenshot the page."), whereas [B-native.png](./B-native.png) claims `render.mjs` calls **Satori + resvg** ("Lays out the type and paints the pixels."). From the posters alone, one of them is wrong about the actual rasterization mechanism, and B's printed `RUN THIS` CLI command cannot be assumed valid without verifying the codebase.
- **[Should] Poster B is too dense at thumbnail size (`B-400.png`):** In [B-400.png](./B-400.png), the card body text, JSON snippets, asset path, and pipeline descriptions collapse into unreadable small type, whereas [A-400.png](./A-400.png) remains legible across every key instruction.
- **[Should] Poster B omits the `sections.` wrapper in its `YOU EDIT` snippets:** Card 1 shows `"header": { "headline": ... }` and Card 2 shows `"hero": { "illustrationId": ... }`, while B's own bottom hint uses `--set sections.header.headline="NEW WORDS"`. Poster A gives the full dotted paths (`sections.header.headline`, `sections.hero.illustrationId`) consistently.
- **[Should] Poster A cannot answer how to replace the leaf with new artwork or how the scene becomes a page:** [A-native.png](./A-native.png) only covers switching `illustrationId` to `parfait_jar` (no file path, dimensions, or alpha requirement), leaves `SOURCE nutrition/fixture.json` visually disconnected from the bottom `From fixture to PNG` strip, and omits how `Build scene` feeds a Playwright page screenshot.
- **[Nit] Callout placement on Poster A:** Badge `1` in [A-native.png](./A-native.png) sits on the outer left border of the poster frame rather than highlighting the headline text itself, whereas B boxes the exact headline and traces color-coded paths across the exploded layer stack.
- **[Pass] Poster B's mental model & causal chain at native resolution:** [B-native.png](./B-native.png) cleanly links edit inputs -> layer composition (`WORDS`, `ARTWORK`, `PAPER`) -> output regions and explicitly names who reads the fixture, who validates/places elements, and what produces the pixels.

### (3) RECOMMENDATION

Pick **B** as the stronger newcomer guide once the `Playwright` vs `Satori + resvg` engine contradiction is verified against real code, and fix B's two weak points: add the `sections.` key to its JSON snippets and bump body/pipeline font sizes so it survives thumbnail viewing like A.
