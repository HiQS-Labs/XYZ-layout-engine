---
gh_issue: 13
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/13
title: "Skill: design-diagram, package the diagram design process"
status: "Proposed (1-INBOX — not yet active)"
created: 2026-10-09
doc_type: feedback
effort: 2
complexity: 2
risk: 1
phases: 1
ratings_provisional: true
related:
  - examples/2026-10-09-rag-system/README.md
  - examples/2026-10-08-solar-system/README.md
  - PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md
reversibility: "Easy — one new skill folder and a changelog entry; nothing else changes."
---

# GH-13 — design-diagram skill

## Why

Two diagram examples were built by the same hand-run process, and the only record of it is the examples themselves plus chat history. Asked whether a skill packages it, the answer was no. A skill makes the process repeatable by a cold agent and records the traps once.

## Recon (base `65439d9`, 2026-10-09)

- No `SKILL.md` in the tracked repo (`git ls-files | grep -i skill` is empty); `.xyz/` is untracked and holds the harness skills. GH-5 covers a shared render operation and a documented render path, not a skill.
- The pattern to point at: `examples/2026-10-09-rag-system/` (fixture-driven; script sets `SPIKE_LIBRARY_ONLY` before an awaited dynamic import of the pinned runtime, renders Satori and Chromium, asserts required ids and geometry in both backends, writes `verification.json`). The Solar System example is the paid-raster-art variant (`generate-assets.py`, `assets/prompts.json`, receipts, `provenance.json`).
- Traps already evidenced in the repo or this build: nested SVG raster vanished in Satori while geometry checks passed (CHANGELOG 2026-10-08, Solar System entry); checkout paths with spaces break `tools/spike/assets.mjs` (GH-5 lines 33 and 44), so new scripts use `URL`/`fileURLToPath`; `textAlign` on a span is not honored, so right-aligned labels need a flex wrapper (`stepbox_`/`edgebox_` in the RAG script); absolute children need a positioned parent; geometry checks do not prove the picture looks right, so both PNGs get inspected.
- Not traced: how each agent app discovers skills (install paths are the operator's, on request).

## Requirements

1. `skills/design-diagram/SKILL.md` with `name`, a trigger-rich `description`, and an ordered procedure: prerequisites (runtime install, Chromium), brief (topic, audience, size, flows), fixture, scene and icons, render both backends, checks, red controls on throwaway copies, visual inspection of both PNGs, example folder `examples/<YYYY-MM-DD>-<slug>/` with README and `.gitignore`, `CHANGELOG.md` entry, gates, PR against `main`.
2. It names `examples/2026-10-09-rag-system/` as the pattern to copy and adapt; it does not duplicate code.
3. A "Known traps" section lists each trap above with its evidence pointer.
4. Art policy: hand-authored SVG icons by default; paid generation through resolve-image only when the operator asks, with the receipts pattern from the Solar System example; nothing uploaded silently.
5. Install note: the operator symlinks it on request from the maintained clone; the skill does not install itself.
6. `CHANGELOG.md` entry.

## Non-goals

- No scaffolder, template generator, dependency, or new script. No change to `tools/spike/**`, `package.json`, `test-budget.json`. No new test or workflow (AGENTS.md; GH-2 ratchet).
- No shared runtime refactor (GH-5), recipes (#9, #10), or provider work (#8).

## Bet and rejected alternatives

- Bet: instructions that point at a working example are enough for a cold agent to repeat the process. Failure mode: the skill drifts from the example it points at. Mitigation: it names files, not copied code, and the acceptance probe re-checks every path.
- Rejected: a scaffolder script (a second system to maintain before a third example exists); a copied template inside the skill (duplicates the example); putting it in `ROUTER.md` (ROUTER owns startup order, not task recipes).
- Rollback: delete `skills/design-diagram/` and the changelog entry.

## Verification (existing checks only)

- Path probe: every repo path and command named in `SKILL.md` resolves (one-off script, not committed). Red control: add an invented path; the probe must name it.
- Cold-run acceptance: a fresh agent given only `SKILL.md` and a four-stage topic, in a disposable space-free clone, renders a throwaway example and its script prints `PASS`. Anything it had to guess is a finding against the skill. The throwaway output is not committed.
- `utils/pdda/pdda.sh run`, `releases check`. `pnpm test` is not required (no code or test path changes); budget file unchanged.

## Ordered implementation

1. Draft `SKILL.md` from the evidence above.
2. Run the path probe and its red control.
3. Run the cold-run acceptance in a disposable clone; fix the skill for each guess it forced.
4. Add the changelog entry; run PDDA and ledger checks.
5. Commit; final relay QA; PR.

## Per-issue map

| Issue | Requirement | State |
|---|---|---|
| #13 | 1–6 above | Plan drafted; awaiting plan QA |

## Rating rationale (2026-10-09)

pri 35 / sev 10 / appeal 50 / effort 75. Severity: process documentation, no data or work at risk. Priority: operator asked for it now; nothing is blocked on it. Appeal: neutral default. Effort: one document patterned on two finished examples, plus a cold-run check. Recurrence: not applicable (not a defect); trend unknown.
