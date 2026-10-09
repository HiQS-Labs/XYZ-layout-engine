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
| Plan revised for Codex plan-QA round 1 (R1–R4, two nits). | Codex plan QA round 2; then implement on `test/gh-2-regression-canaries`. |

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
- **Rollback:** delete `tools/spike/test/`, `test-budget.json`, the `test` script, the output-root override lines, and the AGENTS.md pointer bullet.

## Implementation (ordered, verification inline)

**Supported host.** The suite is supported on the recorded developer host only (darwin-arm64, Node 22, Chrome for Testing as pinned by Playwright 1.64.0). C3 inherits the verifier's existing check that the committed native resvg binding matches the current platform (`verify.mjs`), so other hosts fail C3 by design until a platform-specific evidence run exists. That limit is stated, not hidden.

1. **Output-root override (smallest change to the existing writer and reader).**
   - `render.mjs`: `OUT` is built from `process.env.SPIKE_OUTPUT_ROOT || path.join(HERE, 'output')`. `rel()` keeps emitting `output/<run>/…`, so recorded paths are unchanged.
   - `verify.mjs`: both the folder scan and the physical `out()` reads use the same override.
   - Verify: with no override, behaviour is byte-identical, and `pnpm run spike:verify` stays green on committed evidence.
2. **Canaries:** one file, `tools/spike/test/canaries.test.mjs`, using `node:test` `test()` only. Each name starts with `guards: <failure mode>`.
   - **C1 `guards: render pipeline breaks on a clean checkout`.** Spawn `render.mjs` with `SPIKE_OUTPUT_ROOT=<tmp>` and `SPIKE_RENDER_DEADLINE_MS=40000`. Require exit 0 and a stdout line starting `render: selection`. Then spawn `verify.mjs` with the same root and require exit 0 and `VERDICT: PASS`. Red control (clone, recorded): `SPIKE_INJECT_FAILURE=1` makes C1 fail.
   - **C2 `guards: unintended visual or layout drift`.** Compare the C1 run (fresh) against a golden run folder, `SPIKE_GOLDEN_ROOT` or by default the committed `tools/spike/output`.
     - (a) The fresh and golden case → backend → label key sets must be equal.
     - (b) Every `x/y/width/height` must be finite on both sides and within 0.5 px.
     - (c) The number of compared boxes must be greater than 0 and is printed.
     - (d) PNG, `satori.svg` and HTML sha256 must match, but only when `runtime.json` platform, arch and Chromium version are equal on both sides. Otherwise C2 prints `digests: skipped (host differs)`, and geometry is still enforced.
     - Red controls (clone, recorded), each using a copied golden with `SPIKE_GOLDEN_ROOT`: remove one label; move one coordinate by 1 px; change one golden PNG byte together with its recorded digest. Each must fail C2 at the intended assertion.
   - **C3 `guards: committed evidence no longer satisfies the gate`.** Spawn `verify.mjs` on the committed folder and require exit 0 with `VERDICT: PASS`.
   - **C4 `guards: the verifier stops detecting tampering`.** Copy the committed run folder to a temp root, append one byte to `satori.png`, and run the verifier there. Require exit 1 and `does not match the recorded digest`. This is a built-in red control for the gate.
3. **Budget ratchet:** `test-budget.json` at the repo root.
   - `budget` holds the limits: `{ testFiles: 1, tests: 4, maxSeconds: 60, ciWorkflows: 0 }`.
   - `history[]` holds `{date, issue, budget, reason}` entries.
   - `rules` holds the policy text, the single source of truth.
   - **Any budget change, up or down, needs a new history entry, so the last entry always equals `budget`.** A decrease needs only a short reason. An increase must also name the issue and the failure mode the current tests cannot catch.
4. **Runner:** `tools/spike/test/run.mjs`, wired to `pnpm test`, using Node built-ins only.
   - **Before running, it fails when** any of the following holds:
     - test files outside `node_modules/` and `.xyz/` exceed `testFiles`. A test file is any file matching `/\.(test|spec)\.[cm]?[jt]sx?$/`, or any file under a directory named `test`, `tests` or `__tests__` other than the runner itself.
     - the canary file contains `it(`, `describe(`, `suite(`, `.skip`, `.todo`, `.only`, `skip:` or `todo:`. Only plain `test(` is allowed.
     - the `test(` count exceeds `tests`.
     - any test name lacks the `guards: ` prefix.
     - `.github/workflows/*` exceed `ciWorkflows`.
     - the last `history[].budget` does not deep-equal `budget`, or a history entry lacks `issue` (URL) or `reason`.
   - **Running.** It spawns `node --test --test-reporter=tap <file>` in its own process group, with a parent deadline of `maxSeconds`. On the deadline it sends SIGTERM to the group, then SIGKILL after 5 s, and fails. The render child also carries its own `SPIKE_RENDER_DEADLINE_MS`, so the browser is closed by the renderer's existing deadline handler.
   - **Executed-test accounting.** It parses the TAP summary and requires `# pass` to equal the declared `test(` count and to be no more than `tests`, with `# fail 0`, `# skip 0` and `# todo 0`.
   - **Red controls** (clone, recorded):
     - a fifth `test`;
     - an `it(` declaration;
     - an extra `x.test.js` file;
     - a name without `guards:`;
     - a budget raise without a history entry.
     
     Each must fail before any test runs. A temporary `maxSeconds: 3` must fail on the deadline, leaving no leftover `node --test`, render, or Chrome for Testing process (checked with `pgrep`).
5. **Rules text.** AGENTS.md gets one bullet under Engineering standards pointing to `test-budget.json` as the test/CI ratchet. The policy text lives only in `test-budget.json`.
6. **Docs.** Add a CHANGELOG entry and update this plan's status. Run `utils/pdda/pdda.sh run` unsandboxed: zero errors.
7. **Final gate.** `pnpm test` exits 0 within budget, and every red control above is recorded with its exit and decisive output.

## Non-goals and test non-scope

- No CI workflow (budget `ciWorkflows: 0`).
- No new dependencies or frameworks.
- No per-module unit tests.
- No coverage tooling.
- No multi-platform golden images.
- No change to the verifier's evidence contract beyond the output-root override.

## Pending decision (operator)

Vendoring `resolve-image` (asked mid-task) is held. Its canonical source `NeochromeTeam/hiqs-ai-resolve` is **private and unlicensed**, while this repo is **public**. The skill also needs the `hiqs-chain` runtime: a compiled `chain.mjs` and two recipe manifests. Publishing requires the operator's explicit go-ahead. It is out of this plan's scope until then.
