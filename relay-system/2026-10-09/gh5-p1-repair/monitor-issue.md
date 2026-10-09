The GH-5 XYZ Layout Engine marathon halted in its first phase after the bounded review cap. The launcher had no scheduled operator progress checks; status was inspected only when requested. Add opt-in bounded progress monitoring to the existing marathon supervisor, without a second executor or new daemon.

Existing capabilities (vendored XYZ Forge source commit `062ae45f01faf73bf78bcc10fcba86cd7d5c2ad7`): `marathon_drive.py` writes a driver heartbeat at a default 30-second interval, bounds turns/gates, and emits escalation/terminal receipts. `marathon-ls.sh`, `marathon-detail.sh` and `marathon-tui.sh` offer read-only views. These do not constitute six scheduled progress checks with operator-visible reports. Graph generation 2026-09-01 is stale/partial for relevant paths; the claims above use current source inspection. Related: #186 telemetry improvements, #189 parked-claim recovery, #291 supervisor ownership.

Requested default for this workflow: **600 seconds × 6 checks**, a one-hour observation window. A liveness heartbeat alone must never be reported as accepted progress.

## Acceptance

- [ ] Add opt-in interval and check-count controls to the existing supervisor/launcher, with validated positive bounds and clear effective settings in dry-run output.
- [ ] At each due check record run/clone identity, active phase/role, heartbeat age, last qualifying progress, completed/total phases, current gate/review state, and relevant receipt/log pointers.
- [ ] Surface each report through the existing run log and supported caller notification channel; document when an unattended caller cannot deliver conversational updates.
- [ ] Emit completion/escalation/halt immediately, then cancel outstanding checks; distinguish a live but stalled process from a successful milestone.
- [ ] After the sixth check, emit an explicit monitoring-window-ended state and the next observation action. Do not imply completion, kill an authorized run, or leave an unbounded timer behind.
- [ ] Monitoring is read-only: it must not claim/reap tokens, dispatch builders, restart parked lanes, bypass gates or raise attempt/review caps. Reuse existing lock/state readers and supervisor ownership.
- [ ] Preserve existing Bash/Python behavior and document supported parity; avoid a parallel monitor state machine or scheduling service.
- [ ] Verify due times, terminal cancellation and six-check bounds using existing suites/manual clock-controlled receipts, under GH-831 test-admission rules; do not add a suite merely for timer plumbing.

## Scope and tradeoff

This issue adds observation, not automatic recovery or guaranteed completion. Native timeouts/escalation remain authoritative. The Layout Engine recovery run will use a temporary session-local bounded observer until this feature is shipped; no installed harness edits in that consumer repo.

Reversibility: Easy. PRS estimates (provisional): priority 80, severity 55, appeal 80 (explicit operator request), effort cheapness 65. Implementation belongs in canonical XYZ Forge; adoption through the existing vendor/sync rail.
