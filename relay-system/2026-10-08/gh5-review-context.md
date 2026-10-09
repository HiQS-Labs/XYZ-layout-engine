# GH-5 review context

## Scope and evidence

User request: On a new full clone of the most recent branch/PR, run relay-xyz to QA the improvement plan with Agy. Do not touch the main checkout.

Full clone base: PR #4, test/gh-2-regression-canaries, d537003a1d7f37d234753d91aa8eedd403654fca. PR #4 is stacked on PR #3 and includes the renderer plus the GH-2 suite/ratchet. The current proposed plan is PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md, copied from GitHub issue #5 without substantive changes for round 1.

Read ROUTER.md, GUIDING-PRINCIPLES.md, AGENTS.md and the plan fully. Then inspect tools/spike/REPORT.md, tools/spike/render.mjs, tools/spike/assets.mjs, tools/spike/verify.mjs, tools/spike/test/canaries.test.mjs, tools/spike/test/run.mjs, test-budget.json and relevant PRD sections. No implementation is requested. Initial milestone is a trusted, local/offline library and CLI, not an enterprise service or general editor. Later HTTP/MCP remains the PRD direction. Existing dependencies and checks come first; no new frameworks, queues or interfaces just to claim architectural compliance.

The main checkout is outside this task's writable/read-review scope. A read-only preparation check found that its previously recorded artifacts/solar-system-2026-10-08/ and PROJECT/1-INBOX/recon-mvp-foundation.md no longer exist at those paths. They were not removed by this task. No demo assets/scripts are present in this clone. Treat the corresponding issue claims as historical producer observations, not independently verified source facts. Do not search or change the main checkout, generate paid artwork, or assume the assets are reproducible from this branch. Flag a preservation/recovery prerequisite if needed.

The complete graph inventory contains 82 projects and no XYZ Layout Engine clone/project: there is no graph generation or coverage assertion. Use exact source reads. Generalized requested changes need observed input, affected scope and falsifier. Source probes must be non-mutating, outputs to scratch only. Do not execute fixtures, tests, install dependencies, run validate or PDDA inside the reviewer worktree. The producer owns full-clone verification.

## Concrete questions

1. Is the 7/10 foundation versus 4/10 reusable MVP assessment fairly qualified by delivered evidence, or does the plan misstate capabilities/performance? Identify outdated references versus PR #4 and distinguish historical demo observations from verified branch behavior.
2. Is P0 the smallest coherent local MVP? Does requiring astronomy/GUI editing or worker machinery overreach the current need? Challenge sequencing ambiguity and identify missing dependencies without inventing broad infrastructure.
3. Are caching, resumption and zero-paid-call redraw goals safe and measurable, with exact invalidation identity, bounded retries and unknown paid outcomes handled? Are there unsupported speedup promises or premature concurrency choices?
4. Does the P0 testing request fit test-budget.json (one file, four tests, sixty seconds, zero workflows)? Specify which existing canary should be extended and which future implementation tests must wait for their owning child; do not silently expand GH-2 scope.
5. Can a cold implementer know which acceptance gates close P0, P1 and P2? Are human acceptance, preserved last-good output, fallback capabilities and remote deferral unambiguous?

Report cited [Blocker]/[Should]/[Nit]/[Pass] findings, a literal swept file: yes/no, and VERDICT PASS/FAIL/PARKED with Basis. Read the entire plan; only edit the relay thread. Approve only when the plan is coherent for its explicit envelope. Do not mark implementation, performance targets or human artwork acceptance complete.
