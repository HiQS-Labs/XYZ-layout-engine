# Beyond the Prompt

[Download the offline viewer](renders/riso/deck.html) · [View the PDF](renders/riso/deck.pdf)

Part I asks what makes an interface promise true. It follows the same question from a project editor to an appointment request.

Edit the ten slides in `deck.json`. Rebuild from the repository root with the existing presentation recipe and its Riso theme.

```sh
DECK=examples/2026-11-23-beyond-the-prompt/deck.json node examples/2026-11-20-layout-engine-deck/render-deck.mjs
```

The renderer publishes the offline viewer and PDF to `REVIEW/beyond-the-prompt/`.

## Research behind Part I

- Gick and Holyoak studied analogical transfer in problem solving. The saved-project and appointment examples are the talk’s application of that finding. [Read the 1983 paper](https://reasoninglab.psych.ucla.edu/wp-content/uploads/sites/273/2021/04/Gick_Holyoak1983_SchemaInduction.pdf).
- Draganski and colleagues measured selective structural changes associated with learning to juggle. Their experiment concerns adult adaptation to practice. [Read the 2004 paper](https://doi.org/10.1038/427311a).

## Presentation typography

This edition retains the Riso projection theme. At 1280 × 720 it uses four sizes: 70 px headlines, 30 px section heads, 24 px body text, and 19 px labels. The 2.92:1 headline-to-body ratio is a deliberate AS-12 exception for this talk. Audience members need to read the distinction between each study’s finding and its UX application from across a room. Shrinking the body to meet 4:1 would reduce that text to 17 px. Dark headings, column alignment and spacing maintain the reading order. The slides use text and rules throughout, with no illustration or icon-label pairs.
