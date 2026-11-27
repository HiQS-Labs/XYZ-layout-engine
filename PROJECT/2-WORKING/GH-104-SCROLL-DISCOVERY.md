---
gh_issue: 104
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/104
title: "Forge scroll discovery"
goal: Resolve the v3 benchmark post-merge finding
owner: Codex
created: 2026-11-26
updated: 2026-11-26
status: In progress
---
# Forge scroll discovery

## Status

| What was just completed | What's next |
|---|---|
| Reproduced on main at 14300b4 | Verify both fixes in a shared PR. |

## Plan

Issue [104](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/104). Shared implementation and acceptance in GH-104-SCROLL-DISCOVERY.md. Rated 52/30/50/96 (priority, severity, neutral appeal, cheapness).

#104: Link the example README from the existing worked-examples paragraph. FD-06 currently prints its missing path. Run the entire FRONTDOOR.md check block and require empty stdout and stderr plus a working link.
#105: score.py weights adjudicated facts; it currently reads only the correct flag and location. Six empty answers retained a perfect Sol score in the post-merge reproduction. Reject a correct=true fact unless its answer is a string with non-whitespace text. Preserve scoring of incorrect facts, scoring floors, provisional ballots and unmodified published results. Check empty, whitespace, missing and non-string answer in disposable copies; original replay must pass. No additional suite. Easy rollback: revert the README link or the single evidence check independently.
The November 12–26 review window includes #95 for prior missing examples and one distinct blank-answer finding. Prior window recurrence unknown. Discovery has modest reach and a one-line repair; incorrect perfect scores undermine benchmark trust but are readily recomputed.
