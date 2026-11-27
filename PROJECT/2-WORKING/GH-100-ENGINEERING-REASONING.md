---
gh_issue: 100
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/100
title: Beyond the Prompt thesis edition
goal: Show how an engineering question changes a UX decision without writing code.
status: Active
owner: Codex
created: 2026-11-24
updated: 2026-11-24
---

# Beyond the Prompt thesis edition

## Status

| What was just completed | What's next |
|---|---|
| Plan review approved. Thesis and default render checks passed. | Final review, consumer gates, PR and merge decision. |

## Plan and acceptance

Base main@d47eb25 has the Nov 20 overview renderer but no Nov 23 example. The prototype branch at 68f5f96 adds manifest selection and optional QR art. The maintained checkout also has an unpublished contents layout, the 10-slide thesis manifest, and a dated 14-slide workshop backup in ignored temp. Import only the required deck example and renderer deltas, plus a scoped changelog entry. Do not merge unrelated feature branch history. Reuse the existing scene recipe, Satori/Chromium checks, viewer and publishForReview. A copy-only edit on main cannot select this manifest or render its contents. Easy rollback via PR revert. No new tests, engine architecture or Part II exercise.

1. Preserve the local workshop independently from renderer output. Verify the 14-slide count and reproduce its viewer from its manifest. The earlier 12-slide commit alone is insufficient.
2. Publish the thesis manifest, README with two primary-source links, PDF and offline HTML. Verify a reader encounters audience, per-slide contents, Saved vs Synced, appointment confirmation, portfolio and closing; check Gick and Holyoak explicitly limits its finding to experimental problem solving and identifies transfer to UX as the talk’s application. Check Draganski et al. limits its MRI result to juggling-related adaptation. Reject a slide that attributes either study but implies it demonstrated better design judgment. A workshop or generic unchanged deck fails these checks.
3. Render the thesis via DECK and the default overview without DECK in isolation. Inspect frame geometry, number of PDF pages and embedded viewer navigation. Check the committed exports against the render. Before push run pnpm test and utils/pdda/pdda.sh run as explicitly authorized for this consumer; final Codex review and ready PR target main.

## Rating rationale

2026-11-24: rated 55/20/50/80. Requested current editorial work, reversible, limited to one example with an existing local draft, neutral appeal. Deck-related issue search over October 27–November 9 and November 10–23 surfaced a prior talk and integration QA, without evidence of recurring loss. No release date assumed.

## Review boundary

Review the plan alone first. Record what this proposes, how the system works per the plan, and explicit exclusions. Then validate against issue 100 and the Nov 20 recipe and renderer on main. The working draft and ignored snapshot are local artifacts for execution. Limit reviewer writes to the thread. Confirm an unchanged candidate fails, the checks observe the right artifacts, and the user's consumer gate override is preserved.
