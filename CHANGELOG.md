# Changelog

## 2026-10-08 — MVP foundation assessment and improvement umbrella

- Assessed the GH-1 candidate at origin `591971d` and the local Solar System demonstration: engineering judgment 7/10 for the foundation, 4/10 for a reusable local MVP. Created [GH-5](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/5) with a prioritized checklist for shared recipe/runtime operations, reliable publication, resumable/cached paid generation, faster cached redraw, measured performance, durable editing, and later remote work. Reuses GH-1 acceptance and GH-2 regression/CI scope.
- Captured the bounded source trace and issue in `PROJECT/1-INBOX/`, and parked GH-5 through the canonical releases roadmap writer with provisional ratings. The Solar System files remain local/untracked and are not part of PR #3; human artwork acceptance remains pending. No runtime changes or generation speedups are claimed.
- Bet: shared render operations and validated asset reuse remove avoidable work before deeper tuning. Failure mode: stale cache identity or geometry-only checks hide wrong/missing artwork. Reversibility: Easy — intake and planning records only. Verification: GitHub body and local capture match (29 unchecked items); frontmatter/changelog checks and diff whitespace pass. Roadmap coverage reports one unrelated missing pointer for `PROJECT/2-WORKING/SPECS-PRD.md`; GH-5's parked pointer is present.

## 2026-10-01 — Canonical project name

- Renamed the project to **XYZ Layout Engine** in the active PRD and guiding principles; AGENTS.md now enforces the canonical name. Updated proposed CLI/package/factory examples to `xyz-layout-engine`, `@xyz-layout-engine/*`, and `createLayoutEngine`. Historical changelog wording is preserved.
- Reversibility: Easy, documentation/example identifiers only; no published packages or runtime interfaces changed.
- Verification: installed PDDA frontmatter, status-table, and hardcoded-path checks pass with zero findings; naming consistency check confirms no former-name references remain in the active PRD, guiding principles, or AGENTS.md.

## 2026-10-01 — Backend scope and first proof of concept

- Codified the Satori/resvg versus Playwright spike, backend ownership of layout/text measurement, Composer-only missing-layer scope, and Fabric/Konva deferral until direct editing is required. Aligned implementation phases with the selected backend.
- Inspected `PROJECT/2-WORKING/layout-engine-reference.png` and designated its nutrition infographic composition as the first proof-of-concept litmus reference, with structured content, separate assets, visual acceptance, and a content-change check. Promote that fixture to the initial infographic recipe and reuse it for local/remote parity.
- Reversibility: Easy, document changes only. Bet: existing backends can supply enough geometry for fitting/constraints; Phase 0 must record any gap before implementation. No code, dependencies, tests, or CI configuration added.
- Verification: installed PDDA frontmatter, status-table, and hardcoded-path checks pass with zero findings. Reference/document links, fenced blocks, and selected-backend consistency checks pass. Rendering remains unimplemented and unverified.

## 2026-10-01

- Reviewed and revised the Composer PRD to specify local/offline and remote engine workflows through a shared library/CLI/HTTP/MCP contract. Added bounded job recovery, tenant/asset boundaries, reproducibility/cache identity, phase acceptance criteria, and explicit spike decisions.
- Sharpened AGENTS.md and GUIDING-PRINCIPLES.md around DRY, durability, maintainability, security, and measured performance, using the ponytail lens. No engine code, tests, CI configuration, or installed PDDA runtime changed.
- Bet: shared application operations with thin protocol adapters satisfy both deployment modes without duplicate engine behavior. Reversibility: Easy (documents only); revisit after the geometry and deployment spikes.
- Verification: `utils/pdda/pdda.sh run` completed in observe mode: frontmatter/status/path checks pass; one pre-existing roadmap-coverage error remains (empty releases ledger; `releases` CLI unavailable on PATH), with ten existing governance warnings. PRD anchors, relative document links, fenced blocks, and edited-file whitespace pass. No runtime behavior was tested; this is a specification-only change.
