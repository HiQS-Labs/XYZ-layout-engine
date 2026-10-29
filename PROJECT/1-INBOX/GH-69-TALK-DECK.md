---
gh_issue: 69
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/69
title: "Talk: 'Stop Re-Rolling the Whole Image' — timed 18-minute outline + live --set/--save demo"
status: "Proposed (1-INBOX — not yet active)"
created: 2026-10-29
doc_type: feedback
related:
  - examples/2026-10-29-talk-deck/
  - examples/2026-10-17-vibe-coding-loop/
  - examples/2026-10-12-design-intake/
reversibility: "Easy — one example folder (fixtures, a render script, PNGs, a PDF, receipts) on a local branch; no recipe, renderer, font or catalog change."
---

# GH-69 · Talk deck: "Stop Re-Rolling the Whole Image"

Capture of [#69](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/69). The live issue holds the timed outline, the verified demo commands and the measured timings; it stays the discussion surface.

## Asks

- A 10-slide deck for the 18-minute talk, rendered by the engine itself (every slide is a JSON fixture; no slide is an image-model output), with a high-level system diagram and a workflow diagram. Done on branch `gh-69-talk-deck`: `examples/2026-10-29-talk-deck/`.
- Pre-render the before and after nutrition images as a fallback for the live demo. Done: the demo commands were rerun verbatim on 2026-10-29 and their renders are embedded on slides 2 and 7 with pinned digests.

## Open items

- [ ] The "two re-rolls side by side" hook slide needs two image-model regenerations of the nutrition infographic; the deck shows the real engine render instead and says so. Requires a paid image call and an operator decision.
- [ ] `README.md` (lines 10 and 15) and the issue name `tools/spike/measure-chromium.mjs`, which is not in the tree or its history; the containment, overflow and glyph checks live in `tools/render.mjs`, text-overlap checks in `design-intake` preflight and the example scripts. The deck describes what the code does; the README wording is a separate fix.
- [ ] Rehearse an invalid `--set` to show schema rejection (unverified, per the issue).
