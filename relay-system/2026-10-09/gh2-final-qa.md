# RELAY · GH-2 final QA: regression canaries and test/CI ratchet
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Producer
STATUS: Approved
ROUND: 2 / 3

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     a beta test had this loop reach `Approved` in two rounds while an independent audit of the same
     branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the
     change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN
     SCOPE; if you find none, say so explicitly rather than leaving it unstated.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.** Without it a reviewer that skipped the sweep is indistinguishable in the transcript from
     one that did it and found nothing — which is how the original 20 issues stayed invisible.
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     **A finding that asks for a behaviour change is a generalization unless you can paste the concrete
     input — a row, a value, a `file:line` — that fails under the current code** (GH-681: the gh673
     final QA relay generalized one late-error observation into "or a later invalid identity", the
     Producer implemented it, the same seat `[Pass]`ed it next round, and one historical NULL-URL
     ledger row then blanked every issue). Every `[Blocker]` or `[Should]` requesting a behaviour
     change MUST carry three lines: `Observed input:` (the failing input you saw), `Affected scope:`
     (the input predicate the change would govern), `Falsifier:` (the fixture or data that would show
     the change unnecessary or wrong, and its expected result).
     A `[Blocker]` must cite an observed failure. This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request that carries no
     `Observed input:` / `Affected scope:` / `Falsifier:`), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh2-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/spike/test/canaries.test.mjs`, `tools/spike/test/run.mjs`, `test-budget.json`, `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `package.json`, `AGENTS.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the implementation matches the approved plan in `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md` and satisfies issue #2. Four named canaries run by `pnpm test`; a mechanical ratchet enforced before tests run; a hard deadline with cleanup; the output-root override as the only production change; every check backed by a recorded red control.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Final review of the GH-2 implementation against its approved plan (`relay-system/2026-10-09/gh2-plan-qa.md`, Approved in round 3). Operational envelope: local renderer spike, single developer host, no CI. Grade against the plan and issue #2 with commensurate complexity.

Diff to review: `git diff origin/marathon/gh-1-renderer-spike..9c37fb6` (the implementation is commit `9c37fb6`). Read the plan's "Verification receipts" section: these are orchestrator full-clone receipts (Node v22.22.3, M1 Max). Do not run the renderer or tests here. You may use narrow read-only probes under `.relay-scratch/` or `$TMPDIR`.

Questions:
1. Does each plan item map to code? Check the output-root override (both reader paths in `verify.mjs`), C1 to C4 exactly as specified, the budget file, runner pre-checks, process-group deadline, TAP accounting, and the AGENTS pointer. Is anything missing or extra?
2. Does the override preserve the recorded `output/<run>/...` paths and leave default behaviour identical?
3. C2: does it compare key sets first, require finite values within 0.5 px, require a positive box count, and gate digests on host equality with an explicit skip message? Can it pass vacuously?
4. The runner: can a fifth test, a hidden `test(`, `it`/`describe`, `.skip`/`.only`, extra test files under other names or folders, a budget raise without history, or a stalled run slip through? Note the two implementation refinements against the plan's wording: only line-start top-level `test(` declarations count, any other free `test(` call is rejected, and the TAP key is `# skipped`. Are these sound?
5. Are the recorded red controls sufficient evidence for each check? Is any receipt missing?
6. Scope and complexity: any speculative code, duplicated rule text, or new dependency? Is the policy text kept in `test-budget.json` only?
7. Are the docs (CHANGELOG entry and plan status) accurate, with nothing pending marked complete?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: The implementation maps to the approved four-canary plan, but the timeout path can exit before its promised escalation, and C3 can verify an inherited override instead of committed evidence. Two bounded corrections are requested; runtime reproduction belongs to the disposable clone.
swept file: yes

Read all nine Setup artifacts in full, including pre-existing render/verifier code, and the approved plan relay. No additional material pre-existing defect was identified within the supported local-spike scope. The existing native-binding host restriction is disclosed at `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:54` and enforced at `tools/spike/verify.mjs:246`. Verify-tier intent with direct-source fallback: no graph tools are exposed, so project/generation and coverage could not be checked. Startup README and both releases CLI paths are absent from the seeded checkout. Issue #2 was fetched through the GitHub connector. No git command was run; the connector could not fetch local implementation SHA `9c37fb6` (422), so this review covers the supplied full artifacts, without independently certifying the branch diff.

- [Should] **R1 — do not exit before timeout escalation has completed.** `tools/spike/test/run.mjs:63` schedules an unreferenced SIGKILL after five seconds, but the child's `close` handler calls `fail()` immediately when timed out (`run.mjs:68`); `fail()` calls `process.exit(1)` (`run.mjs:13`). If the test leader closes first, the runner exits and that pending escalation cannot run. Keep the existing parent alive until group escalation/cleanup is complete, even after leader close, then report failure. This needs a small change to this runner, not a watchdog package.
  Observed input: invoke the exact seeded timeout/close handler with the deadline firing, then leader `close(null)` before the five-second callback. The source probe below exited 0 and printed `SIGTERM -> unref(5000) -> exit(1)`, with no SIGKILL before exit. Signals and process exit were mocked; this demonstrates the control-flow gap, not an observed live orphan.
  Affected scope: timed-out runs whose test leader closes before a remaining group member that does not terminate on SIGTERM. Preserve normal success behavior and the five-second cleanup allowance.
  Falsifier: in a disposable clone, use a history-consistent short budget and a controlled group member that survives SIGTERM and closes its inherited pipes. The runner must still deliver SIGKILL within the allowance, exit nonzero with the deadline diagnostic, and leave no test/render/browser descendant. If the original implementation does that despite early leader close, this finding is unnecessary. The existing ordinary-render timeout receipt (`PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:116`, `:118`) does not exercise this ordering.
  Quoted probe command (no test or renderer executed):

```sh
node --input-type=module <<'JS'
import fs from 'node:fs'; import vm from 'node:vm'; import {EventEmitter} from 'node:events';
const child=new EventEmitter(); child.pid=123;
const timers=[], events=[];
const ctx={child,budget:{maxSeconds:60},t0:Date.now(),tap:'',Date,console,
  setTimeout(fn,ms){timers.push(fn);return {unref(){events.push(`unref(${ms})`);}};}, clearTimeout(){},
  process:{kill(pid,sig){events.push(sig);}}, fail(msg){events.push('exit(1)');throw Error('EXIT');}};
vm.runInNewContext(fs.readFileSync('tools/spike/test/run.mjs','utf8').split('\n').slice(58).join('\n'),ctx);
timers[0](); try{child.emit('close',null);}catch(e){if(e.message!=='EXIT')throw e;}
console.log(events.join(' -> '));
JS
```

- [Should] **R2 — pin C3 to the committed root.** `tools/spike/test/canaries.test.mjs:23` merges the inherited environment into every verifier invocation. C3 passes an empty override object (`:60`), so an exported `SPIKE_OUTPUT_ROOT` changes its evidence target through `tools/spike/verify.mjs:18`. Pass `SPIKE_OUTPUT_ROOT: COMMITTED` explicitly in C3; C1/C4 already select their own roots.
  Observed input: `process.env.SPIKE_OUTPUT_ROOT='/tmp/gh2-noncommitted-evidence'` and C3's `env={}`. Evaluating the exact environment expression below exited 0 and printed `C3 verifier root: /tmp/gh2-noncommitted-evidence`, rather than `COMMITTED`.
  Affected scope: C3 only, when the invoking shell exports the production output override. Keep the explicit C1/C4 temp roots and C2 golden override.
  Falsifier: in a disposable clone, retain valid evidence at an alternate exported root and tamper only the committed PNG. C3 must fail on the committed digest assertion; restore committed evidence and it must pass. If C3 already reads committed evidence in that setup, this finding is unnecessary. The end-to-end false-pass claim is [Unverified — needs clone run].
  Quoted probe command:

```sh
node --input-type=module <<'JS'
import fs from 'node:fs'; import vm from 'node:vm';
const s=fs.readFileSync('tools/spike/test/canaries.test.mjs','utf8');
const expression=s.split('\n')[22].match(/env: (\{.*\}), encoding:/)[1];
const result=vm.runInNewContext(`(${expression})`,{process:{env:{SPIKE_OUTPUT_ROOT:'/tmp/gh2-noncommitted-evidence'}},env:{}});
console.log('C3 verifier root:',result.SPIKE_OUTPUT_ROOT);
JS
```

- [Pass] **Output isolation and C1/C4 use the existing engine and gate.** `tools/spike/render.mjs:31` redirects physical writes and `:32` preserves logical paths. Both verifier scan and read use `OUTPUT_ROOT` (`tools/spike/verify.mjs:18`, `:19`, `:22`), while `:23` preserves recorded paths. With no override these expressions select the original output folder. C1 checks renderer exit/selection then verifier exit/PASS (`canaries.test.mjs:25`); C4 copies evidence, tampers a PNG, requires exit 1 and the digest error, then removes its copy (`:65`). No correction requested beyond R2.
- [Pass] **C2 compares meaningful geometry before host-gated digests.** `canaries.test.mjs:37` compares sorted case/backend/label tuples before finite coordinate checks within 0.5 px (`:43`), rejects zero compared boxes (`:49`), and prints the count. Platform/arch/Chromium equality gates the digest loop with an explicit skip message (`:51`); artifacts are enumerated from golden evidence (`:53`). This is non-vacuous for the existing three-case/two-backend evidence. No new golden framework is needed.
- [Pass] **The ratchet refinements are proportionate with executed accounting.** `run.mjs:25` recursively counts alternate test filenames/directories; `:36` rejects alternate test forms and skip/todo/only; `:41`–`:46` enforce the declaration convention, positive count, budget and guard prefix. Line-start matching is a lexical convention, not a JavaScript top-level parser; `:69`–`:73` make positive executed passes equal declarations and require zero failures/skips/todos, using Node's `# skipped` key. Workflow and history checks run before spawn (`:19`, `:20`, `:49`, `:56`). `package.json:9` wires this runner to `pnpm test`; only Node built-ins are added (`run.mjs:3`, `canaries.test.mjs:4`). Policy has one owner (`test-budget.json:2`), with the AGENTS pointer at `AGENTS.md:49`. No parser/dependency expansion requested.
- [Pass] **Recorded receipts cover every originally planned red control.** `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:100` records the default gate; `:101` records four named passing canaries, 216 boxes, 12 artifact digests and 8.2 s. The eleven exit-1 controls at `:106`–`:116` cover the runner checks, render injection, three C2 mutations and ordinary timeout; C4 is the built-in tamper control at `:119`. These are orchestrator receipts, not reviewer executions. Plan status (`:29`) leaves final QA/PR pending; CHANGELOG (`CHANGELOG.md:21`) attributes the completed implementation observations. R1/R2 need their additional targeted receipts.
- [Unverified — needs clone run] Fresh rendering/digest equality, actual TAP execution, all runtime red controls, and live descendant cleanup were not rerun here. The approved plan requires a zero-error PDDA run (`PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:95`), but its receipt section does not record that result; add the clone/harness receipt before reporting the final gate complete. Default byte-identical behavior and the assertion that the output override is the only production diff are not independently certified by this source-only sweep.

Review outcome: changes requested. Reversibility: Easy — only this relay header and appended review block changed; source/artifacts remain untouched. No renderer, tests, executable fixtures, validation gates, git operations or external comments were run.
Handing off to claude-a (Producer) — disposition R1/R2, make the bounded fixes and record clone controls, then return for round 2. Go to the Producer window and say 'take your turn'.

### Producer · Round 1 → 2 (claude-a)

Fixes are in `b08a42d`. Receipts below are from full-clone and disposable-copy runs (Node v22.22.3, M1 Max).

- **R1 [Should], timeout escalation — Implemented.** When the deadline has fired, the `close` handler in `run.mjs` now calls `process.kill(-child.pid, 'SIGKILL')` before `fail()`. A group member that ignores SIGTERM therefore cannot outlive the runner, even if the leader closes first.
  - Control, matching your falsifier: a canary file containing only a stall test that spawns a child with `process.on('SIGTERM',()=>{})` and `setInterval`, with `maxSeconds` and the last history entry both set to 3.
  - Result: exit 1 after 3 s wall, `deadline: suite exceeded budget.maxSeconds=3s and was killed`. The stubborn child was present at about 2 s (pgrep 1) and absent after the run (pgrep 0).
- **R2 [Should], C3 pinned — Implemented.** C3 now passes `SPIKE_OUTPUT_ROOT: COMMITTED` explicitly.
  - Control: export `SPIKE_OUTPUT_ROOT` pointing at a valid alternate copy, then tamper only the committed `satori.png`.
  - Result: exit 1 with `not ok 3 - guards: committed evidence no longer satisfies the gate` and `satori.png does not match the recorded digest`. After restoring the committed file, with the same export, the run passed (`test-budget: PASS — 4 canaries in 7.9s`).
- **[Pass] items — acknowledged.** I agree that line-start matching is a lexical convention, not a parser. The runner says so in its comment.
- Suite on `b08a42d`: `pnpm test` exits 0, `test-budget: PASS — 4 canaries in 8.0s (budget 60s)`. Both receipts are appended to the plan's Verification section.

VERDICT: PASS
Basis: both Should findings fixed with the falsifier controls you specified; no scope change.

Handing off to codex (Reviewer) — round 2 against `b08a42d`; go to the Reviewer window and say 'take your turn'.

### Reviewer · Round 2 · codex

VERDICT: PASS
Basis: R1 and R2 are closed by the seeded code, the narrow source probes, and the recorded disposable-clone controls. The whole implementation maps to the approved four-canary plan and issue #2; no blocking source finding remains. This approves the review, with subsequent runtime/governance validation owned by the harness.
swept file: yes

Read all nine Setup artifacts in full, including the pre-existing renderer/verifier, and the approved plan relay. No additional material pre-existing defect was identified within the supported local-spike scope. Verify-tier intent with direct-source fallback: both pages of `list_projects` returned all 82 projects, none for this checkout or task clone; `check_index_coverage` for all nine paths and `tools/spike` returned `project not found or not indexed`. No graph generation is available. Startup README and both releases CLI paths are absent from the seeded checkout. Issue #2 was fetched through the GitHub connector. No git command was run, so the supplied artifacts were swept without independently certifying the branch diff or implementation SHA.

- [Pass] **R1 is closed: escalation precedes failure exit even when the leader closes early.** `tools/spike/test/run.mjs:70` sends SIGKILL to the process group before `fail()`; the existing delayed escalation remains at `:63`. The source probe below fires the exact seeded deadline callback and then leader close, with signals/exits mocked: exit 0, `R1: SIGTERM -> unref(5000) -> SIGKILL -> exit(1)`. The disposable-clone stubborn-child receipt at `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:120` records a deadline failure and the surviving-SIGTERM child absent afterwards. No further correction requested.
- [Pass] **R2 is closed: C3 selects committed evidence explicitly.** `tools/spike/test/canaries.test.mjs:60` passes `SPIKE_OUTPUT_ROOT: COMMITTED`, overriding inherited environment through the helper at `:23`. The exact helper/C3 call probe below exits 0 and prints `R2: inherited /tmp/noncommitted -> /mock/committed`. The clone control at `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:121` records rejection of tampered committed evidence despite a valid alternate export, followed by a passing restored run. No further correction requested.

Quoted probe command (source callbacks only; no test, verifier or renderer executed; output in scratch):

```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
node --input-type=module > "$TMPDIR/r2-fix-probe.out" <<'JS'
import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict'; import {EventEmitter} from 'node:events';
const src=fs.readFileSync('tools/spike/test/run.mjs','utf8');
const events=[], timers=[], child=new EventEmitter(); child.pid=123;
const ctx={child,budget:{maxSeconds:60},t0:Date.now(),tap:'',declared:4,Date,console,
  setTimeout(fn,ms){timers.push(fn);return {unref(){events.push(`unref(${ms})`);}};},clearTimeout(){},
  process:{kill(pid,sig){assert.equal(pid,-123);events.push(sig);}},
  fail(msg){events.push('exit(1)');throw Error('EXIT');}};
vm.runInNewContext(src.slice(src.indexOf('let timedOut = false;')),ctx);
timers[0]();try{child.emit('close',null);}catch(e){if(e.message!=='EXIT')throw e;}
assert.deepEqual(events,['SIGTERM','unref(5000)','SIGKILL','exit(1)']);
console.log('R1:',events.join(' -> '));
const canary=fs.readFileSync('tools/spike/test/canaries.test.mjs','utf8');
const helper=canary.split('\n').find(l=>l.startsWith('const node = '));
const c3=canary.split('\n').find(l=>l.includes("const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: COMMITTED })"));
let selected;
vm.runInNewContext(helper+'\n'+c3,{process:{execPath:'/mock/node',env:{SPIKE_OUTPUT_ROOT:'/tmp/noncommitted'}},
  COMMITTED:'/mock/committed',SPIKE:'/mock/spike',path:{join:(...x)=>x.join('/')},
  spawnSync(exe,args,opts){selected=opts.env.SPIKE_OUTPUT_ROOT;return {};}});
assert.equal(selected,'/mock/committed');console.log('R2: inherited /tmp/noncommitted ->',selected);
JS
task_probe_rc=$?
cat "$TMPDIR/r2-fix-probe.out"
echo "probe exit: $task_probe_rc"
exit "$task_probe_rc"
```

Decisive output, exit 0:

```text
R1: SIGTERM -> unref(5000) -> SIGKILL -> exit(1)
R2: inherited /tmp/noncommitted -> /mock/committed
probe exit: 0
```

- [Pass] **The remaining canary/override contracts are intact.** Physical writes use the override while logical paths stay `output/<run>/…` (`tools/spike/render.mjs:31`, `:32`); verifier scan and reads share it (`tools/spike/verify.mjs:18`, `:19`, `:22`, `:23`). C1 requires renderer exit/selection and verifier exit/PASS (`canaries.test.mjs:25`); C2 compares key sets before finite coordinates within 0.5 px, rejects zero boxes, and gates golden-enumerated digests on platform/arch/Chromium equality with an explicit skip message (`:37`, `:43`, `:49`, `:51`); C4 copies, tampers, requires the digest diagnostic and cleans its copy (`:65`). No new production mechanism requested.
- [Pass] **The ratchet remains small and mechanical.** `tools/spike/test/run.mjs:25` counts alternate filenames/test directories; `:36` rejects alternate forms/skip/todo/only; `:40`–`:46` enforce the lexical line-start convention, positive declarations, budget and guard names. This is a convention, not a JavaScript parser; positive executed passes equal declarations and zero fail/skipped/todo provide the execution backstop (`:71`–`:75`). History/workflow checks precede spawn (`:19`, `:20`, `:49`, `:56`). `package.json:9` supplies one local command; runner/canaries add only Node built-ins (`run.mjs:3`, `canaries.test.mjs:4`). Budget policy is owned by `test-budget.json:2`, with the AGENTS pointer at `AGENTS.md:49`. No framework, parallel suite or CI workflow is introduced in the reviewed mechanism.
- [Pass] **The recorded proof and status are honest about scope.** The eleven original red controls are recorded with exit 1 at `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:102`–`:116`, the two additional controls at `:120`–`:121`, and C4's built-in tamper control at `:122`. The four-canary receipt at `:101` reports 216 boxes, 12 digests and 8.2 s; the Producer's latest block quotes `test-budget: PASS — 4 canaries in 8.0s (budget 60s)`. These are Producer/orchestrator executions, not reviewer executions. Plan status at `:29` still leaves final QA/PR next, and `CHANGELOG.md:21` reports implementation observations without claiming final approval. Host limits remain explicit at plan `:54`.
- [Nit] **Record the subsequent governance receipt before closing the implementation gate.** Plan `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:95` requires PDDA zero errors, but its Verification receipts do not yet record a GH-2 PDDA result. Add the clone/harness result when that gate runs; refresh the status row for this approval at the same time. This is a remaining harness/reporting step, not an observed source failure.
- [Unverified — needs clone run] Fresh rendering and byte equality, actual TAP execution, live descendant cleanup, suite duration and PDDA were not independently rerun here. Default byte-identical rendering and the assertion that the override is the only production diff are not certified by this source-only sweep. The harness owns subsequent validation; approval does not convert these unknowns into reviewer test receipts.

Review outcome: Approved. Reversibility: Easy — only this relay header and appended block changed; scratch contains the probe output. No renderer, tests, executable fixtures, validation gates, git operations or external comments were run.
Relay closed (Approved), no further review turn needed. Returning control to claude-a (Producer) for the harness gate and receipt/status reconciliation; the harness owns the relay commit. The approval-specific operator instruction uses `tick done` for this token.


### Attestation · relay-drive — 2026-10-09T05:03:45Z
task: RELAY-gh2-final-qa-r2
reviewer: codex
status: Approved
reviewed-head: df2af989b799afbe970d1f48d8a7bfc7eab2ae46
added-range: 18521+7873
added-sha256: 944674fb2822dadebac486ad0506278e85c7f535b45694e2c98690459a543574
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
