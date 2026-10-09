# AGENTS.md

**On your first action in this repo, follow the startup sequence in `ROUTER.md` before recommending or editing anything.** It names the canonical files and the order to read them. Re-run it (or `/pdda`) when you switch tasks, resume a long session, or feel context has drifted.

See `GUIDING-PRINCIPLES.md` for the repo's north star — the goals and tradeoff lens these rules serve.

## Operating principles

These apply to every response, plan, and change in this repo.

### 1. Lead with the call

The first sentence says what changed or what the verdict is. Supporting detail comes after.

### 2. State the bet before acting

Name the assumption, tradeoff, and failure mode before a consequential edit. If the claim cannot be wrong, it is probably too vague.

### 3. Use one reversibility scale

Every consequential change gets a read on the shared scale: `Easy / Costly / One-way door`.

### 4. Verify instead of implying

Do not report a win you did not verify. In this repo, `utils/pdda/pdda.sh run` is the main rail unless a narrower single check (`utils/pdda/pdda.sh <check>`) is more appropriate.

### 5. Installed governance

PDDA is installed into this project. Its canonical development home is
https://github.com/HiQS-Labs/XYZ-forge. Make runtime changes there; preserve this
project's own startup documents and policies when updating installed checks.

## Engineering standards

- Apply the architecture principles in `GUIDING-PRINCIPLES.md`: balance DRY, durability,
  maintainability, security, and measured performance. Keep one owner for shared schemas, render
  behavior, and final geometry; library/CLI/HTTP/MCP entry points reuse those operations.
- Use the ponytail lens for new code: state the present requirement, the simplest viable mechanism,
  and why existing code, the standard library, platform facilities, or installed dependencies fall
  short. Do not scaffold speculative packages, queues, wrappers, or plugin frameworks.
- Follow SOLID where it clarifies responsibilities and dependency direction; do not add interfaces
  or abstractions merely to claim compliance. Domain logic stays in recipes/adapters; transports,
  persistence, and deployment concerns stay outside the domain-neutral core.
- Preserve explicit local and remote workflows. Do not silently upload local input, switch engines,
  run tenant code, or weaken validation, tenant isolation, resource limits, or safe retry/recovery.
- Keep edits surgical. Run relevant existing checks first; add tests or CI gates only for a named
  material failure mode that existing checks cannot cover, and record that justification. Document
  changes alone do not earn runtime tests. Never duplicate suites for thin protocol adapters.
- The test/CI suite is ratcheted by `test-budget.json` (enforced by `pnpm test`); read its rules before adding or removing a test or workflow.
- Separate targets from observations. Performance claims name the workload/runtime and measured
  result; deliberate simplifications name their limit and the trigger to revisit them.

## Working in this repository

- The canonical project name is **XYZ Layout Engine**; use it in current documentation and user-facing references. Technical naming follows `PROJECT/2-WORKING/SPECS-PRD.md`.

- PROJECT/PDDA.md owns the shared document contract.
- utils/pdda/pdda.sh runs installed checks.
- This repository owns its project documents, roadmap and changelog.
