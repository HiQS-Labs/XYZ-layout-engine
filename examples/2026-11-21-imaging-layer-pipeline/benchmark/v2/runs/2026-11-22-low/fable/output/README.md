# How Fuel Well is made: handover diagram

Rebuild both deliverables from the packet folder:

    node output/build.mjs

- `poster.png` (2000 × 1560) and `index.html` (self-contained, works offline) are regenerated together.
- Captions: edit `src/content.json`. Layout and styling: edit `build.mjs`.
- The headline text and hero artwork name are read live from `nutrition/fixture.json`; pictures and fonts come from `nutrition/` and `fonts/`.
- `src/preview-400.png` is a 400 px check image written by the build, not a deliverable.
