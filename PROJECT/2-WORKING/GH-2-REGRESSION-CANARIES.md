---
gh_issue: 2
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/2
title: "GH-1 spike: minimal regression suite with canaries, plus a CI-suite ratchet"
status: Active (2-WORKING)
created: 2026-10-08
updated: 2026-10-08
owner: Neochrome
doc_type: project
effort: 2
complexity: 2
risk: 1
phases: 1
reversibility: Easy — four tests, one runner, one budget file, two env overrides; delete to revert.
goal: >
  Catch regressions in the working GH-1 renderer spike with four named canaries run by one local
  command, and stop the test/CI suite from growing beyond what the code warrants with a mechanical
  budget ratchet.
related:
  - PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md
---

# GH-2 — Regression canaries and a CI-suite ratchet

## Status

| What was just completed | What's next |
|---|---|
| Intake: issue #2, capture, roadmap park, rating `60/35/50/75`; recon below; plan drafted. | Codex plan QA; then implement on `test/gh-2-regression-canaries`. |

## Recon (base `591971d`, branch `test/gh-2-regression-canaries` off `origin/marathon/gh-1-renderer-spike`)

- **System under test:** `tools/spike/render.mjs` runs `main()` on import and writes every artifact to a fixed folder, `tools/spike/output/<local YYYY-MM-DD>-<package name>/`. `tools/spike/verify.mjs` reads the newest such folder. `scene.mjs` and `assets.mjs` export pure builders.
- **Existing gate:** `pnpm run spike:verify` (Phase 1 asset/licence checks plus Phase 2 evidence checks on the committed run folder). It validates the *committed evidence*, not a fresh render. Nothing today re-renders on a clean checkout and compares against the committed result.
- **Observed determinism:** a fresh `node tools/spike/render.mjs` (8.1 s wall on M1 Max, Node v22.22.3, Chrome for Testing 156.0.8078.4) rewrote only `measurements.json` and `runtime.json` (timings, `generatedAt`). Every PNG, `satori.svg` and every saved HTML was byte-identical to the committed files. A golden-digest canary is therefore sound on the recorded platform. Other platforms are not measured, and anti-aliasing may differ.
- **Rules already in force:** AGENTS.md "add tests or CI gates only for a named material failure mode that existing checks cannot cover, and record that justification"; GUIDING-PRINCIPLES §6 "Measure before expanding"; GH-1 non-goal "CI machinery". There is no `.github/` directory and no test framework dependency. Node 22's built-in `node:test` is available.
- **Recurrence (2026-09-24 → 2026-10-08):** issues #1 and #2 only, with no regression incidents filed. The trend is unknown, and this is preventive work.

## Rating (2026-10-08, `rated 60/35/50/75`, calc 220)

pri 60: the operator requested it next, and it protects the spike before Phase 1 builds on it. sev 35: an undetected regression in a pre-production spike would cost rework, with no user data at risk. appeal 50: neutral, no operator score given. effort 75: about one day, small surface. No operator override.

## Preflight bet

- **Outcome sought:** a change that breaks rendering, layout, assets, or the verifier fails one local command before it reaches a PR.
- **Smallest viable bet:** four canaries in one `node:test` file, one runner that enforces a budget, one budget file, and two env overrides so tests write to a temp folder. **Not built:** CI workflow, test framework, per-function unit tests, fuzzing, snapshot library, multi-platform goldens.
- **Alternatives rejected:**
  - Only `spike:verify` checks committed evidence. It misses a code change that would render differently.
  - A GitHub Actions workflow conflicts with the GH-1 non-goal and needs Chromium in CI. The ratchet keeps that door closed until a named failure mode justifies it.
- **Rollback:** delete `tools/spike/test/`, `test-budget.json`, the `test` script and the two env lines.

## Implementation (ordered, verification inline)

1. **Output-root override (smallest change to the existing writer and reader).**
   - In `render.mjs`, `const OUT_ROOT = process.env.SPIKE_OUTPUT_ROOT || path.join(HERE, 'output')`. `OUT` and `rel()` stay relative to the run folder name, so recorded `output/<run>/…` paths are unchanged.
   - In `verify.mjs`, the same override for the folder it scans.
   - Verify: the default run still writes and reads `tools/spike/output/`, and `pnpm run spike:verify` stays green on committed evidence.
2. **Canaries:** `tools/spike/test/canaries.test.mjs` using `node:test` and `node:assert`. Each test name starts with `guards: <failure mode>`.
   - **C1 `guards: render pipeline breaks on a clean checkout`.** Render into a temp `SPIKE_OUTPUT_ROOT`, then run the verifier against it. Expect exit 0 and `VERDICT: PASS` from both.
   - **C2 `guards: unintended visual or layout drift`.** Compare the C1 run to the committed run on two levels:
     - Labelled geometry must match per case and backend within 0.5 px.
     - PNG, SVG and HTML sha256 must match byte for byte, but only when platform, arch and Chromium version equal the committed `runtime.json`. Otherwise the digest part is reported as skipped, never passed.
   - **C3 `guards: committed evidence no longer satisfies the gate`.** Run `verify.mjs` on the committed folder and expect exit 0. This is the existing `spike:verify`, run as part of the suite.
   - **C4 `guards: the verifier stops detecting tampering`.** Copy the committed run folder to temp, append one byte to `satori.png`, and run the verifier there. Expect exit 1 with `does not match the recorded digest`. This is the red control that proves the gate still bites.
3. **Budget ratchet:** `test-budget.json` at the repo root.
   - `budget` sets limits: `testFiles: 1`, `tests: 4`, `maxSeconds: 60`, `ciWorkflows: 0`.
   - `history[]` records each budget change as `{date, issue, budget, reason}`.
   - `rules` holds the human text.
4. **Runner:** `tools/spike/test/run.mjs`, wired to `pnpm test`. Before running tests it fails when any of these holds:
   - the number of `*.test.mjs` files outside `node_modules`/`.xyz` exceeds `testFiles`
   - the number of `test(` calls exceeds `tests`
   - any test name lacks the `guards: ` prefix
   - the number of `.github/workflows/*` files exceeds `ciWorkflows`
   - the last `history[].budget` does not deep-equal `budget`, so raising a limit requires a new history entry
   - any history entry lacks an issue URL and reason
   
   It then runs `node --test` on the test file and fails if wall time exceeds `maxSeconds`.
   - Verify red controls: add a fifth dummy test, then a test name without `guards:`, then a budget raise without a history entry. Each must fail before any test runs. Restore afterwards.
5. **Rules text.** AGENTS.md gets one bullet under Engineering standards pointing to `test-budget.json`, with the ratchet in one sentence: budgets can drop freely, and raising one requires a history entry naming the issue and the failure mode existing tests cannot catch. The detailed rules live in `test-budget.json` itself, so there is one source of truth.
6. **Docs:** CHANGELOG entry, this plan's status, and the roadmap row moved to In progress. `utils/pdda/pdda.sh run` must have zero errors.
7. **Final gate:** `pnpm test` exits 0 within budget, with the three runner red controls and C4's built-in red control recorded.

## Non-goals and test non-scope

- No CI workflow (budget `ciWorkflows: 0`).
- No new dependencies or frameworks.
- No per-module unit tests.
- No coverage tooling.
- No multi-platform golden images.
- No change to the verifier's evidence contract beyond the output-root override.

## Pending decision (operator)

Vendoring `resolve-image` (asked mid-task) is held. Its canonical source `NeochromeTeam/hiqs-ai-resolve` is **private and unlicensed**, while this repo is **public**. The skill also needs the `hiqs-chain` runtime: a compiled `chain.mjs` and two recipe manifests. Publishing requires the operator's explicit go-ahead. It is out of this plan's scope until then.
