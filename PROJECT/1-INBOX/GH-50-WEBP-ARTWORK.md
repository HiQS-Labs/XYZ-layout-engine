---
gh_issue: 50
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50
title: "Optional transparent WebP artwork; switch the belief-reference diagram to WebP"
status: "Proposed (1-INBOX — not yet active)"
created: 2026-10-14
doc_type: feedback
effort: 2
complexity: 2
risk: 2
phases: 1
---

# GH-50 — Optional transparent WebP artwork

Capture of [#50](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50).

## Asks

- Accept transparent WebP as an opt-in alternative to PNG for pinned recipe artwork, with the same
  digest pinning, byte and pixel budgets and symlink guards. PNG stays the default.
- Copy WebP assets into the offline HTML export like PNG.
- Refuse a Satori PNG render of WebP artwork with a clear error naming the Playwright backend:
  `@resvg/resvg-js` 2.6.2 silently drops WebP images (probe: 9,346 painted pixels from PNG, 0 from WebP).
- Switch the latest diagram (`examples/2026-10-12-belief-reference/`, recipe `recursive-process`) to
  WebP artwork; it renders through Playwright PNG/HTML and Satori SVG/HTML.
- No new npm dependency, no new test file.

Operator decision 2026-10-14: WebP + Chromium PNG (no PNG twins, no resvg upgrade, no WebP output format).
