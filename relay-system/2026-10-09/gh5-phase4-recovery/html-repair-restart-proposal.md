# Phase 4 restart after the repaired native gate

Current state: Phase 3 complete; Phase 4 candidate and recovery QA independently approved, but original native advancement is held; Phase 5 unstarted. Original Phase 4 lane has three recorded fires, including the one explicitly authorized override. No fourth fire is authorized yet.

## Concrete next action, conditional on operator authorization

Use the existing one-phase canonical YAML, original `gh5-p4` phase ID and `gh5-mvp-foundation--gh5-p4` lane/counter, unchanged nine artifact owners and Codex builder/Agy reviewer. The native driver must rebuild/review against the repaired candidate: its prior Agy attestation correctly refuses the changed test revision. Use the supported `--retry gh5-p4` to create the first unused review token `MARATHON-GH5-P4-TURN-2`, preserving the original task/history; this is not a new lane or counter reset. ONE `--force` cap override is needed for that one additional native attempt. The full exact dry-run passed, with original phase ID, suffix, roles, owners, gate and timeout. Direct preflight passed; its origin/main probes are advisory and are not a latest-origin integration claim.

```sh
.xyz/relay-automation/marathon.sh --plan PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml --builder codex --pre-advance-cmd 'pnpm test' --retry gh5-p4 --force
```

Use the existing foreground observer with fresh 600-second × 6 monitoring and immediate terminal cancellation. No automatic extra override on failure. After fresh independent native review/attestation and driver-owned four-canary gate pass, restore Phase 5 only to the same YAML, original `gh5-p5`, Agy builder/Codex reviewer, no force/retry, new six-check monitoring window. Existing source scope and final independent Codex Wave 1/pre-PR gates remain mandatory. Integrate latest origin/main before final QA/ready PR. Do not touch the main checkout; preserve this incomplete clone and its unpushed evidence.

## Evidence

- Repair and full candidate recovery QA: gh5-phase4-html-recovery.codex.md, independently Approved/attested exact 403636d5d7461b9485233c094a8b32ecb341877f; no requested corrections. All nine source owners remain byte-identical since that reviewed head.
- html-repair-verification.log: four canaries in 36.8s, actual compact and relocated standalone HTML/fonts/images, no network, unchanged geometry and 12 byte-identical comparison artifacts.
- html-repair-binding-check.json: original Agy attestation cannot cover the changed candidate, explaining why a plain gate-only retry is insufficient.
- html-repair-dry-run.log and html-repair-preflight.log: no-dispatch exits 0. Original counter still three; no claims/worktrees/driver remain.

Reversibility: Easy. Bet: the exact artifact-name repair removes the witnessed gate failure without changing render behavior; a red fresh gate, candidate drift, containment violation or independent finding falsifies readiness.
