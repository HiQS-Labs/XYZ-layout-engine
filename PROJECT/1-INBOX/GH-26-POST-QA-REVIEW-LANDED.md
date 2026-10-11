---
gh_issue: 26
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/26
title: "Post-QA review of landed MVP, catalog and designs (#18, #22, #24, #25)"
status: Proposed (1-INBOX — not yet active)
created: 2026-10-11
owner: unassigned
doc_type: feedback
complexity: 2
risk: 1
effort: 2
phases: 1
ratings_provisional: true
non_goals:
  - TODO: what this explicitly is NOT (scope boundary).
related:
  - TODO: related files/docs, if any.
goal: >
  TODO: one-paragraph statement of what "done" looks like for this idea.
---

## Key concepts

- TODO: 2-4 bullets on what this idea concretely is and why it matters.

> **Note for plan writers:** apply the `/ponytail` lens — favor the laziest approach that actually
> works over new infrastructure, and question whether new surface needs to exist at all.

# Post-QA review of landed MVP, catalog and designs (#18, #22, #24, #25)

## Status

| What was just completed | What's next |
|---|---|
| Captured via HQ (`/hq park`) for project **xyz-layout-engine** → repo `HiQS-Labs/XYZ-layout-engine`. The GitHub issue is the signal stream; this doc is the in-repo capture and back-reference. | Fill in Why/Key Concepts, correct the provisional ratings above, and run a Phase 0 explore pass before promoting to `2-WORKING`. |

## Idea

## Goal

Do an independent post-QA review of the code now on `main` (`7d66787`), after four PRs landed in two days, and actually run the recipes end to end. Each PR was reviewed on its own. This review looks at how they fit together.

Landed scope under review:

- #18 (`15c2f25`): GH-5, the shared offline MVP: `tools/render.mjs`, `tools/request.mjs`, `tools/profile.mjs`, text fitting, safe generation resume, durable edits.
- #22 (`fbfe02e`): GH-10 A1, the recipe catalog (`tools/catalog.mjs`, `tools/catalog.sql`), identified by `slug@semver` with no serial.
- #24 (`51b7a47`): GH-20 A2, design records (`design list|show|add`), `tools/design-log.jsonl`, and the ROUTER pointer.
- #25 (`7d66787`): #23 S1/S2, hardening of `--save` and `--out .`.

## Reviewer

An independent relay QA run (`/relay-xyz`): Command Code with GLM 5.3 at high reasoning effort. The reviewer reports findings and does not edit code.

## Checklist

- [ ] **Recipes run end to end.** `nutrition` and `solar-system` render to SVG and PNG in both backends, and the edit → `--save` → re-render → export loop works. Every command's exit code and output path is recorded.
- [ ] **Catalog and designs.** `node tools/catalog.mjs list|show|verify` and `design list|show` exit 0 on `main`. A scratch-only `design add` works. A duplicate add, a misspelled subcommand and a tampered dump fail with the documented exit codes.
- [ ] **Negative controls.** `--save package.json`, `--save` onto a `manifest.json`, `--out .`, `--out .git`, an unbreakable over-wide headline, and an unsupported canvas size are all refused with a named error.
- [ ] **Cross-PR seams.** Check how the render, request, catalog and design-log modules fit together: one owner per schema and per write path, no duplicated helpers, and docs (README, ROUTER, SPECS-PRD) that match the code's behavior.
- [ ] **Gate.** `pnpm test` passes within the test budget.
- [ ] **Findings triaged.** Each finding is rated Blocker, Should or Nit, cites `file:line`, and is either added to #23 or filed as its own issue.

## Out of scope

- Any paid provider call. The HiQS and Higgsfield generation paths are reviewed by reading only; no spend has been budgeted.
- Phase B of #20 (the grid parser and geometry).

## Constraints

- This is a public repo: no PII, credentials or home-directory paths in comments, transcripts or receipts.
- Changes reference issues only with `Refs #N`.

## Why

TODO: why this matters now -- what prompted it, what breaks or slows without it.

## Phase 0 — Explore & scope

### Checklist

- [ ] TODO: scope-specific checklist items for this idea's Phase 0 pass.

### QA checklist — Phase 0

- [ ] TODO: acceptance criteria for the Phase 0 pass above.
