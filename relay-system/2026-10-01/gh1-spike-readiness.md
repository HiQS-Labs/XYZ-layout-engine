# GH-1 Phase 0 marathon readiness — 2026-10-01

Verdict: prepared, awaiting exact-plan confirmation; no builder dispatch.

## Inventory and classification

- GitHub issue #1 is OPEN. Sole in-scope item: `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md`, READY after independent textual plan approval and direct preflight. No other open issues or GH captures exist in this repository at the recorded inventory.
- Product PRD is the scope contract, not a second execution lane. Supporting p1/p2/p3 briefs are tracked through their parent and explicitly roadmap-exempt.
- Capture writer ran at intake, then the doc was promoted and ledger repointed. Roadmap gid: rmi-01M3XF4BMSA6K2F4QZN8KZN6C4. Marathon gid: mar-01M3XF4BSKA4B4QPC5NV2484MH. Draft release 0.0.1 RendererSpike: rel-01M3XFJBJBF1B4ARDV7M6WSVC9; sole manifest member mfi-01M3XFWJN405JX8HBY1DAC35PZ.

## Proof and limits

- Independent Codex receipt `gh1-spike-plan-attested.codex.md`: Approved/PASS, textual only. Driver exit 0 and attestation cite reviewed head d43274edf6eb2bc158fb0a49d6abf975b6c68faa. Runtime rendering remains unimplemented; human artwork acceptance pending.
- Full task clone direct preflight `gh1-spike-preflight.txt`: exit 0 READY, 5/5 acceptance match, probes evaluated origin/main 65ba11d91. No packet written in dry-run.
- Primary scheduling planner `gh1-spike-planner.txt` and `gh1-spike-planner-check.txt`: exit 0, one active candidate in one wave, zero held/drift; generated queue overlay is in sync. Actual source input is the primary repository ledger and canonical docs.
- Additional task-clone scheduling probe `gh1-spike-clone-planner.txt`: exit 0 but zero active lanes with a nonblocking undocumented-partial-completion warning. It observes the prepared GH doc plus the matching task branch. Preserve this finding; no implementation or output completion is claimed. Do not replace the primary scheduling report with this diagnostic overlay.
- Full task-clone `marathon.sh --dry-run`: exit 0, p1 → p2 → p3, Agy builder/Codex reviewer, 900-second turns, two review rounds, effective `pnpm run spike:verify` gate explicitly wired. `gh1-spike-dryrun.txt` is the complete output. Allowlists/probes/dependencies have a passing direct consistency check.
- Collision map: one candidate/wave, all executor phases sequential. package/lockfile/scene/checker overlap across p1/p2; p2 feeds report p3. Ledger writes remain orchestrator-only; no concurrent source or ledger writer is proposed.
- First reviewer receipt failed exact verdict validation (exit 8); second approved text but driver refused end-marker body mutation (exit 4). Those are retained as rejected receipts, not readiness proof. EOF-only corrective template was checked with a failing insert-before-marker control and a passing append-at-EOF control, then independently reviewed/attested. No installed runtime edits or gate bypass.
- PDDA full run: zero errors, nine existing governance warnings; LLM doc-ready self-skipped without configured CLI. No runtime/CI code or tests added during preparation.

## Proposed launch

Run from the full task clone `marathon-gh-1-renderer-spike`, branch `marathon/gh-1-renderer-spike`, base origin/main:

```bash
.xyz/relay-automation/marathon.sh --plan PROJECT/2-WORKING/renderer-spike/MARATHON.yaml --builder agy --pre-advance-cmd 'pnpm run spike:verify'
```

Order: fixture/assets → dual backend reference and hero experiments → measured report/PRD findings. Only PRD Phase 0 is included. Local/remote/MCP production phases remain gated on backend evidence and are not dispatched by this plan. Keep the task clone: it has unpushed preparation and no verified-complete origin result.

The start-marathon skill requires exact-plan/order confirmation before dispatch. Recommendation: confirm this bounded plan and pairing, then fire. Hold if the operator intended a different scope/pairing; do not bypass an actual failed gate.
