---
gh_issue: 79
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/79
title: "Modernize craft & integrate Impeccable: steering verbs, anti-slop heuristics, headless HTML audit, and editorial asset provider"
goal: "Equip XYZ Layout Engine with Impeccable's craft floor heuristics, steering verbs, headless HTML auditing, and an editorial asset export tool"
status: "Active (Phase 1 implementation complete, verified)"
created: 2026-11-09
updated: 2026-11-09
owner: Antigravity
doc_type: feature
complexity: 2
risk: 1
effort: 2
phases: 2
---

# GH-79 — Modernize craft & integrate Impeccable

## Status
 
| What was just completed | What's next |
|---|---|
| Complete Phase 1 implementation: Quick Win 1 (Steering Verbs in `SYSTEM-INSTRUCTIONS.md` AS-13), Quick Win 2 (Anti-slop heuristics in `tools/craft-lint.mjs` and `tools/intake.mjs` `--craft`), Headless HTML auditing (`tools/impeccable/audit.mjs`), and Editorial Asset Provider (`tools/export-editorial-asset.mjs`). Full verification and tests passing. | Relay QA and PR preparation. |
 
## Scope and Plan

### Phase 1 Deliverables
1. **Quick Win 1: Steering Verbs Protocol**:
   - Embed the 4 core steering verbs (`distill`, `bolder`, `quieter`, `typeset`) into `SYSTEM-INSTRUCTIONS.md` and documentation so that prompt/agent iterations follow precise layout modifiers.
2. **Quick Win 2: "Anti-Slop" Heuristics in Recipe Normalization**:
   - Create `tools/craft-lint.mjs` exporting deterministic AST/fixture checks:
     - `no-nested-cards`: Flag container boxes nested $\ge 2$ levels deep with explicit fills/borders.
     - `elevation-singularity`: Disallow simultaneous explicit `border` and diffuse `box-shadow` on the same card/box.
     - `no-side-stripe-borders`: Disallow asymmetric colored stripes on rounded cards.
     - `typography-ramp-snap`: Validate font sizes against proportional scale steps.
   - Wire into `tools/intake.mjs check` and recipe preflight.
3. **Headless HTML Auditing via Impeccable CLI**:
   - Implement `tools/impeccable/audit.mjs`:
     - Discovers local `npx impeccable` or CLI binary.
     - Runs headless audit against exported `render.html` / `render-inline.html`.
     - Formats exit codes and findings cleanly for CI / CLI use without adding npm dependencies to core.
4. **Editorial Asset Provider**:
   - Implement `tools/export-editorial-asset.mjs`:
     - Allows rendering an isolated element, card, or infographic from a recipe directly to a transparent high-DPI SVG or PNG asset formatted for web app embedding.
5. **Deterministic Verification**:
   - Ensure all 4 existing canaries pass without budget increases (`test-budget.json` remains strictly 4 tests, 1 test file, < 60s).

### Phase 2 (Deferred to future sprint)
- `comp-spec` 10x10 Grid Ingestion (`tools/importer/comp-spec.mjs`).
- Quantitative Visual Verification (`comp-diff`).
- Visual Font Fingerprinting (`font-match`).
