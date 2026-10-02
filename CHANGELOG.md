# Changelog

## 2026-10-02 — Phase 1 containment diagnosis and retry preparation

- Reproduced the first turn's containment failure: dependency installation wrote unignored root node_modules/. Added its standard project ignore rule before retry; preserved source allowlists and installed harness. Controls accept allowed files and still reject an unrelated source file.
- Original turn remains rejected; Codex review/verifier did not run. Phase 1 retry is authorized; phases 2/3 remain unstarted. Evidence: relay-system/2026-10-02/gh1-spike-containment-diagnosis.md.

## 2026-10-01 — Phase 0 marathon prepared

- Created umbrella issue #1, captured/promoted its bounded renderer-spike plan with three sequential briefs/YAML, registered roadmap/marathon/draft release membership, and prepared a full task clone. No build dispatched.
- Independent Codex plan review is Approved and driver-attested (reviewed head d43274edf6eb); resolved scope/asset/text-overflow/gate findings and corrected legacy receipt formatting with an EOF-only template. Installed harness runtime unchanged.
- Verified direct preflight exit 0; primary planner/deep/check exit 0 with one wave/no held or drift; full clone YAML dry-run exit 0 with Agy builder, Codex reviewer, and explicit verifier gate. PDDA run has zero errors and nine existing governance warnings. Additional clone scheduler emitted a nonblocking partial-preparation warning, preserved in readiness evidence. See `relay-system/2026-10-01/gh1-spike-readiness.md`.
- Reversibility: Easy, preparation artifacts and local-only clone. Awaiting exact-plan/order confirmation as required by start-marathon; rendering, production scope, and human artwork approval remain unverified.

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
