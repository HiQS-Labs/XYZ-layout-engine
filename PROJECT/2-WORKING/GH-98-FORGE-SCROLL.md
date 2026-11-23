---
gh_issue: 98
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/98
title: Forge scroll editorial benchmark
created: 2026-11-23
updated: 2026-11-23
status: In progress
owner: Codex
goal: Measure how effectively three model submissions explain Forge in a responsive page
---
# Forge scroll benchmark

## Status

| What was just completed | What's next |
|---|---|
| Intake and consult | Review plan, build packet, measure submissions, publish evidence. |

## Plan and acceptance

Base main d47eb25. V2 in PR 97 uses anonymous rooms and cited readings but its poster pairs and three Fuel Well questions cannot grade scroll sequences. Implement a standalone example using existing Playwright and Node. No new CI suite. Pin source excerpts to Forge 877c2be0d. Include authentic surplus material, same packet bytes, no rubric or timing clues. Candidates work in their own packet, build an offline HTML page for a lead new to Forge in 4–5 sections with one concrete request-to-verification story. Choose all visual and editorial details. Exactly one medium run each: Opus 5.5, Gemini 4 Neon, GPT-6.2 Sol. No paid assets or deployment.

Check valid offline delivery, 4–5 discernible sections, readable mobile and desktop content and local assets. Capture matched mobile 390×844 and desktop 1440×900 first screens and full scrolls. Wrong-length or nonloading page is ineligible. In two independent noncandidate vision sessions, anonymize and vary order. Collect first-screen appeal BEFORE revealing full pages. Then require factual answers with visible locations to three questions: problem, request-to-verified-change example, inspectable evidence. Compare with source key; at most one correct earns 1, two earn 2, three earn 3. Craft: impeded / readable with friction / visual sequence clarifies on both sizes. Appeal: leave / skim / drawn to continue with named reason. Average judge scores per criterion. Store ballots and evidence; missing judge means provisional, no final grade. Capture provider start to completed submission in seconds (includes its own checks, excludes queue and judging). Rank valid times 3,2,1, grouping within 10% of group leader; tied members get same competition rank. Two valid runs use 3 and 2; single valid gets 3 with limited comparison disclosed. Invalid submission has no grade. Weighted total out of three = .4 comprehension + .3 design + .2 appeal + .1 speed. Display raw durations, scores and limitations. Do not leak timing in candidate prompt or workspace. Keep coordinator artifacts outside distributed packet.

Smoke normal, ties, missing/failing submission, and an unsupported located claim; ensure these cannot earn an unqualified winning result. Include readable reproducibility notes, short results and the actual offline pages. Easy rollback: one example and its task records. Avoid arbitrary word count or theme prescription. Rating priority/severity/appeal/cheapness 60/35/50/60, recoverable comparative evidence; #96 prior adjacent pilot, unknown recurrence trend. No renderer changes.
