# GH-1 Phase 0 launch — 2026-10-01

Operator repeated the launch request after the exact Phase 0 scope/order/pairing was presented; confirmation accepted. Preparation inputs and ledger snapshot matched the primary repository. Umbrella issue #1 remains OPEN.

Launched in `/Users/noelsaw/marathon-clones/marathon-gh-1-renderer-spike`, branch `marathon/gh-1-renderer-spike`, using relay-xyz:

```bash
XYZ_HARNESS="$PWD/.xyz" XYZ_SESSION_ID=xyz-layout-engine-gh1-phase0 .xyz/relay-automation/marathon.sh --plan PROJECT/2-WORKING/renderer-spike/MARATHON.yaml --builder agy --pre-advance-cmd 'pnpm run spike:verify'
```

Native exec session: 37061 (still running at handoff). Durable run log: `/Users/noelsaw/marathon-clones/marathon-gh-1-renderer-spike/relay-system/run-logs/2026-10-01/marathon-MARATHON_-222443-10428.log`.

Observed token `MARATHON-GH1-SPIKE-P1-TURN`: status claimed, claimer agy, exact Phase 1 artifact paths. Worktree isolation ON. Three phases execute sequentially; no completion yet.

Worker check exits 0: codex-turn 43 pass/0 fail; agy-turn 65 pass/0 fail. Top-level .xyz/validate.sh absent (exit 127), not represented as passed. Earlier plan preflight/full dry-run/PDDA evidence remains separately recorded. Launch warnings: newly-created run-log directory makes workspace dirty; critically low free swap (0 MB) and compressor about 6496 MB. Monitor the actual run; no runtime gate bypass or harness modifications.

Do not edit the driven clone during an active turn. Primary status/changelog updated only; launch receipt has not been copied into the active clone. Retain the clone with unique unpushed work. No push, merge, issue closure or human visual approval performed.
