# Changelog

## 2026-10-08 — Phase 0 spike executed: backend comparison, evidence report, and decision

- Phase 1 (fixture, assets, verifier) landed via the agy/Codex marathon driver on 2026-10-02 (retry after the containment fix). Phase 2 under agy failed containment twice (probe scripts written off-lane: repo root, then `tools/spike/test_satori.mjs`) and parked at the lane attempt cap; filed XYZ-forge #1001 (global `XYZ_HARNESS` overrides the vendored `.xyz/` root, so the issue-closed guard queried the harness repo) and #1002 (one stray scratch file discards a converging phase).
- Orchestrator built Phases 2 and 3 directly in the task clone. `tools/spike/render.mjs` renders the same scene tree through Satori→resvg and Chromium, collects backend-owned geometry (Satori `onNodeDetected`; Chromium rects, `Range`, scroll metrics), runs bounded font-size fitting (≤10) for baseline, the prescribed long-copy override, and a structured product hero, probes script coverage with the pinned font, records versions/licences with manifest provenance, stage-bounded timings, and memory caveats. `verify.mjs` binds every PNG to its digest, checks dimensions, geometry, containment-aware overlap, recomputes overflow/fit/eligibility from raw evidence, and requires licence records; eleven red controls each fail on a named assertion.
- Independent Codex post-build QA of Phase 2 (`relay-system/2026-10-08/gh1-spike-p2-postbuild.md`): three rounds, Approved and driver-attested. Round 1 caught failed licence lookups masked by prose, a mislabelled timer, over-claimed probe wording, and gate gaps; round 2 caught unhashed probe PNGs, a coverage-only English check, and an untested document-overflow flag. All fixed with receipts.
- Phase 3: `tools/spike/REPORT.md` and PRD Phase 0 findings record timings (Satori warm median 26.5 ms, Chromium 70.0 ms on M1 Max; cold 137.5 / 224.4 ms, in-process), licence memo (MPL-2.0/MIT/Apache-2.0/OFL; Chrome for Testing notices unverified), script coverage (English/accented Latin covered; CJK/emoji uncovered by the pinned font), proposed resource limits, and the decision: **Satori→resvg default, Chromium declared fallback**. Human visual acceptance of the artwork remains pending; agent assessment records the fidelity gap against the reference.
- Reversibility: Easy — spike-owned files, documents, and a local clone; no package published, no CI, server, queue, or editor framework added. Verification: `pnpm run spike:verify` exit 0; Phase 3 Codex QA receipt at `relay-system/2026-10-08/gh1-spike-p3-postbuild.md`.

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
