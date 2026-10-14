# SYSTEM-INSTRUCTIONS.md

**Every AI agent reads this file before it creates or changes anything visual in this repo.** That covers recipes and recipe versions, example diagrams, fixture copy and themes, and image-generation prompts.

**Precedence.** For the topics below, these rules override recipe defaults, skill guidance (for example `skills/design-diagram`) and prompt text. They never override `AGENTS.md`, its safety and process rules, or the engine's own checks.

**Published recipes are pinned.** Their files are hashed in the catalog, so a rule never justifies editing a published version in place. Apply the rule in the next version.

**Public repo.** Do not put personal data or credentials here.

The rules are defaults, not absolute bans. A card, a gradient or a common font is not bad in itself; an unexplained default is. Any exception must serve the content, the reader's task or an established brand, and must be stated (see "Report").

## Rules

**AS-1 Start from the content, not a template.**
Before laying anything out, name the reader, the one thing they should take away, and the content that deserves the most space. Let that decide the composition. Do not default to headline, hero illustration, a row of equal tiles, then a footer.

**AS-2 No default gradients, glows, blobs, glass panels or sparkles.**
Use solid fills from the fixture palette and one accent with a stated role. Blur, glow and gradients need a purpose tied to the subject, not "make it look modern". Swapping the hue of the same effect is not a fix.

**AS-3 Not everything goes in a box.**
Reach for spacing, alignment, rules, lists and tables before panels and cards. Use a card for a genuinely distinct object, such as one stage of a pipeline. Do not tile icon + title + one sentence when a list or the subject itself would say it better.

**AS-4 Make hierarchy unequal on purpose.**
Give the most important element more space, stronger type or the prime position. Equal-size grids are for true peers, such as the six stages of a pipeline. They are not a substitute for deciding what matters.

**AS-5 Define the visual system in the fixture before composing.**
Name the palette roles in `theme.palette`. Fix one spacing scale, one corner radius and one border or shadow treatment, and set the type sizes, weights and line heights explicitly by computing pixel sizes from **`S = Math.min(width, height)`** (the canvas's shorter side) per **AS-12** — never pick arbitrary web/document pixel sizes by feel. Fonts must be vendored in the repo, because renders are offline. Unless the brief or recipe names a font, use the starter default, Barlow Condensed (`tools/fonts/barlow-condensed/`); existing recipes and diagrams use Inter (`tools/spike/assets/`). Condensed type suits headlines and labels; for long paragraphs, choose and vendor a regular-width body face. Use at most one body and one display face. Adding a font is a deliberate change with its license recorded. No section gets its own radius, tint or shadow.

**AS-6 Every decorative element earns its place.**
Remove ornaments, icon toppers, floating shapes and colored rails unless they carry meaning. A diagram icon must depict the thing its stage does. If removing an element loses no meaning, remove it.

**AS-7 Concrete copy, honest data.**
Write what the reader learns or does, not slogans. "Fuel well. Live well." and "Unlock powerful insights" fail this rule. Never invent numbers, sources, quotes or logos to make a layout look credible. Label schematic or illustrative content as such, as the example diagrams do in their footers. Disclose AI-generated imagery.

**AS-8 Show the subject, not a decorative stand-in.**
Prefer domain-accurate depictions, real data and the actual process over abstract shapes. The test: could this exact panel appear in five unrelated infographics? If so, make it specific to this subject.

**AS-9 Image prompts describe; they don't boost.**
Image-generation prompts name the subject, the view, the lighting, the background (including transparency) and the exclusions. Leave out quality-booster filler such as "8k", "masterpiece", "ultra-detailed", "trending on …", "stunning" or "beautiful". Keep one shared style string per artifact, so every asset matches.

**AS-10 Review as a separate pass, not another styling pass.**
After rendering, look at both backend PNGs at full size and at thumbnail size. Audit them for template patterns, flat hierarchy, needless decoration, and copy that fails AS-7. The engine already enforces text fit and containment; this pass covers what it cannot. Fix the named problems; "make it more premium" is not a fix.

**AS-11 Ground 3D cutouts with directional base/contact cast shadows, not whole-shape silhouette drop-shadows.**
When a 3D object or cutout rests on a surface, anchor its base footprint with a two-layer ground shadow (a tight contact occlusion ellipse directly under the resting base plus a softer directional cast ellipse offset away from one consistent scene corner light source). Do not apply a whole-shape CSS `drop-shadow(...)` filter to resting 3D cutouts — tracing the alpha silhouette places a sticker halo around upper lids, caps, crossbars and floating edges, making objects look pasted onto the wall rather than grounded on a table. Reserve silhouette `drop-shadow` or glow filters for flat badges, floating UI elements or stated emissive icons, and align sibling cutouts in the same row onto a shared ground baseline.

**AS-12 Size typography as a percentage of S (the canvas's shorter side) for 1/3-scale mobile legibility.**
All infographic and diagram font sizes are expressed as a percentage of **`S = Math.min(width, height)`** (the canvas's shorter side) so typography scales across any aspect ratio:

1. **Design for 1/3 scale.** Infographics are viewed on phones at `~400px` wide (or `1/3` of a `1000–1200px` canvas). Every essential caption and label must remain legible without zoom when shrunk `3×` (`~333px` on `S = 1000px` and `400px` phone width). If a line of text is not readable at `1/3` size, it is too small.
2. **Headline = 7–10% of S.** (`70–100px` at `S = 1000px`; `84–120px` at `S = 1200px`). Never below `6%`.
3. **Body / caption floor = 1.8% of S** (`18px` at `S = 1000px`; `≈22px` at `S = 1200px`). Never below `1.5%`. Anything smaller is decoration, not information.
4. **Headline : body ratio ≥ 4:1** and **at most 4 distinct font sizes on the canvas**:

   | Role | % of S | At `S = 1000px` | At `S = 1200px` | Notes |
   |---|---|---|---|---|
   | Headline | `7–10%` | `70–100px` | `84–120px` | Condensed/bold caps can go to top of range |
   | Subhead / tagline | `2.5–3.5%` | `25–35px` | `30–42px` | `~⅓` of headline |
   | Section labels | `2.2–2.8%` | `22–28px` | `26–34px` | Bold, caps or small-caps |
   | Body / captions | `1.8–2.2%` | `18–22px` | `22–26px` | Regular weight, max `~40` chars/line |
   | Footer / source | `1.5%` | `15px` | `18px` | Only truly non-essential source notes; keep within the 4-size canvas cap |

5. **Type vs. illustration balance.** The largest graphic element's visible height must be no more than `~3×` the headline cap height (measured from the font's TrueType `OS/2` `sCapHeight / unitsPerEm * headlinePx`). If a hero image is `40%` of canvas height, the headline must be big enough not to look like a label on it.
6. **Headline width = 50–85% of canvas width.** If the headline spans less than half the canvas width, it is undersized for the canvas. Wrap to 2 lines before shrinking.
7. **Whitespace is allocated, not left over.** Empty margins around small text read as "unfinished," not "elegant." Fill allocated regions with type size before adding more elements.
8. **Minimum touch/scan target for icon-plus-label pairs: label ≥ 70% of icon height.**
9. **The squint test.** Blur or downscale the image; 3 distinct visual tiers must survive: headline, section heads, and everything else. If only 2 tiers survive, the middle tier is too close to body.
10. **Never let an LLM pick sizes in px.** Always define `S = Math.min(width, height)` and the `% of S` constants in the recipe, and compute `px = Math.round(S * pct)`. Models otherwise default to web/document sizes (`14–48px`) regardless of canvas dimensions.

## Report

Before composing, state the intended visual direction, the canvas shorter side `S = Math.min(width, height)`, the `% of S` → `px` type scale table (at most 4 sizes on the canvas, with `headline : body >= 4:1`), and the three most important hierarchy decisions.

After rendering, report:
- which generic patterns you avoided, by rule ID;
- which exceptions you used, and why;
- the measured `AS-12` checks (headline `% of S` and `% of canvas width`, body `% of S` and headline:body ratio, distinct font size count `<= 4`, largest visible graphic height vs. `3×` headline cap height, and icon-to-label height ratio `>= 70%`);
- what you inspected (full size, native `1/3` scale `~333px` and `400px` phone width, and squint/thumbnail hierarchy across both backends).

Do not claim a check you did not perform. A relay or code reviewer grades visual work against these rule IDs.

## Changing this file

Add a rule only for a pattern actually seen in this repo's output, and give it the next `AS-` number. A rule that is broken twice may earn an automated check. Until then, review enforces it.
