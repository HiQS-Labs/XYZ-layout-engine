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
Name the palette roles in `theme.palette`. Fix one spacing scale, one corner radius and one border or shadow treatment, and set the type sizes, weights and line heights explicitly. Fonts must be vendored in the repo, because renders are offline. Unless the brief or recipe names a font, use the starter default, Barlow Condensed (`tools/fonts/barlow-condensed/`); existing recipes and diagrams use Inter (`tools/spike/assets/`). Condensed type suits headlines and labels; for long paragraphs, choose and vendor a regular-width body face. Use at most one body and one display face. Adding a font is a deliberate change with its license recorded. No section gets its own radius, tint or shadow.

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

## Report

Before composing, state the intended visual direction and the three most important hierarchy decisions.

After rendering, report:
- which generic patterns you avoided, by rule ID;
- which exceptions you used, and why;
- what you inspected (full size, thumbnail, both backends).

Do not claim a check you did not perform. A relay or code reviewer grades visual work against these rule IDs.

## Changing this file

Add a rule only for a pattern actually seen in this repo's output, and give it the next `AS-` number. A rule that is broken twice may earn an automated check. Until then, review enforces it.
