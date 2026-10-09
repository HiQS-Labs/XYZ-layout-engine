# GH-5 Phase3 repaired source — independent recovery QA
STATUS: Approved
NEXT: coordinator (Supervisor/harness)

## Roles
Producer: coordinator (local source repair; no self-approval)
Reviewer: independent Codex CLI

## Goal and evidence
Review the committed Phase3 recovery in the full isolated clone, following ROUTER startup and supplied codebase-memory fallback (no indexed project exists for this clone). Source owners: examples/2026-10-08-solar-system/generate-assets.py, tools/spike/test/canaries.test.mjs, examples/2026-10-08-solar-system/README.md, tools/MVP-REPORT.md and CHANGELOG.md. Review whole files and repair diff atdc3a4d6, against preserved original Phase3 findings in relay-system/2026-10-09/gh5-p3-repair/first-attempt-relay.md and consult-reconciliation.md. Current suite4/4 in28.7s,216 boxes,12 byte-identical artifacts; current-verification.log. Use bounded scratch component probes for material uncertainties, not a duplicate full suite.

## Acceptance
Batch ownership covers plan through state publication; overlapping same-output invocations refuse before writes/calls. Strict safe IDs/exact accepted parameters/references/manifest recipe and caller bytes; no invented flags. Content/reference changes invalidate one job, valid resume invokes0calls, A→B→A preserves old valid source. Atomic manifest reads/writes fail closed; only admitted saved output/receipt hashes/bytes/recipe/verified and decoded required alpha reach complete/reuse. Immutable full-digest/UUID retry destinations retain prior evidence. Unknown/in-flight/corrupt state returnsfailure and never silently replays paid calls; explicit replacement preserves receipts. Requested Solar batch requires valid Sun before planets. Configurable1–3workers, call cap, installed caller exactly1attempt, per-call/whole-run monotonic deadlines and caller process-group cleanup. Cumulative observable cost is a stopping threshold, never claimed guaranteed hard USD budget with unknown price. Metrics/provenance honest; no provider calls or fabricated human acceptance.  [Unverified — no citation]

## Held native workflow
Original Phase3 task remains MARATHON-GH5-P3-TURN. Attempt1 interrupted Codex503; attempt2 Agy model probe20stimeout before build; original counter2/2, no gate/approval. This QA is a separate read-only recovery review, NOT a third marathon fire, native phase.approved or final Wave1 QA. Phases4/5/finalreadyPR remain held. Do not reset/rename/reap the original task, change its artifacts/caps/YAML, or dispatch models/providers beyond this QA. Resolve findings in existing owners only; maintain test budget1file/4tests/60s/0CI.

## Protocol
Reviewer writes ONLY this relay; full sweep and concrete probes for material findings. Append ### Reviewer · Round1 with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no, graded findings with Observed input:, Affected scope:, Falsifier:. Do not edit source or run Git. If satisfied set STATUS: Approved and tick done; otherwise NEXT: coordinator (Producer), tick release --to coordinator. No paid image call. Do not claim final wave completion or approval of the stopped native lane. Independent supervisor owns attestation; do not self-attest. Return an explicit handoff/closure.

## Producer recovery
Implemented source repair within original owners, with current executable suite receipts and cross-model advisory reconciliation. Reversibility Easy; historical PNG/assets/prompts/receipts, original lane/cap and primary checkout preserved. Ready for independent current-source review; no self-approval.

### Reviewer · Round1

**Verdict:** Changes requested
VERDICT: FAIL
Basis: Whole-file source review and scratch-only component probes reproduced automatic dispatch from corrupt manifest state, loss of exact numeric parameter semantics, dispatch after the whole-run deadline, and incomplete recipe admission on reuse. The saved 4/4 suite receipt does not exercise these failures.
swept file: yes
Review outcome: Return to coordinator for repairs in the existing owners; this recovery relay is not Approved. The original native lane, counter2/2, held phases4/5 and final-wave/human/provider gates remain unchanged.

Scope and limits: Read all five source/document owners, ROUTER/GUIDING-PRINCIPLES/AGENTS, canonical Phase3 requirements, preserved first-attempt findings and builder response, recovery plan, consult reconciliation and current-verification.log. Included pre-existing sections in the sweep; no additional material finding identified in the older render canaries or historical changelog within this bounded source review. Root README.md and both repository-relative releases_app.py entry points are absent. Graph tools are unavailable; project/generation/coverage could not be independently established, so direct source was used. `dc3a4d6` is the supplied recovery reference, not an independently verified Git/diff identity: Git was prohibited and no standalone repair diff was supplied. The source files on disk are the review target. No Git, roadmap/database mutation, PDDA, validate.sh, test scripts, pytest, executable fixtures, full suite, installed caller CLI or provider was run. The saved receipt reports 4/4 in28.7s,216 boxes,12 byte-identical artifacts; current full-suite/process-tree execution remains **[Unverified — needs clone run]**, owned by the harness. Only this relay is changed outside `.relay-scratch/`.

Bet and reversibility: Existing manifest entries must prove their state and input/output contract before automatic dispatch or reuse. Treating incomplete evidence as absent work can repeat a paid submission. Exact parameters must survive the deployed caller's parser or be rejected before scheduling. Requesting repairs and recording this relay are **Easy**; duplicated paid work is not repaired by a later local rollback.

Recon: CLI at generate-assets.py:297–322 enters generate(:231), which owns generation.lock through admission/planning/publication and dispatches run_job(:158). The single manifest writer is update_manifest(:56); per-attempt evidence is written by run_job. validate_output(:76) owns image admission and reuses tools/spike/assets.mjs:10 plus native Resvg. The installed caller's pure scalar parser is NW in /Users/noelsaw/.codex/skills/hiqs-chain/scripts/chain.mjs; its CLI is never imported/executed by these probes. C1 at tools/spike/test/canaries.test.mjs:184–253 is the recovery consumer. No new provider client, queue, test block or dependency is requested.

#### R1 [Blocker] Existing corrupt manifest state can be reinterpreted as new paid work

Observed input: generate-assets.py:38–46 checks only that values are dictionaries; :250–253 treats a missing/null status on an existing entry as the same as no entry. The probe first completed and resumed one real-PNG job using an in-memory caller boundary, then removed only `status` from that generated manifest record. The next ordinary invocation dispatched again and returned True. Separately, a dangling `manifest.json` symlink is considered nonexistent at :39 before the symlink check at :41; generation replaced it with a new ledger and dispatched.

Affected scope: Corrupt/lost ledger evidence bypasses the explicit-retry requirement, including records that retain prior output/receipt/input fields. No force-retry was supplied. This is distinct from the correctly refused explicit `unknown` state. The current C1 malformed-JSON assertion at :253 captures `afterBroken=calls()` after the invocation and compares the count to itself, so it cannot prove zero dispatch for that case.

Command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; python3 "$TMPDIR/recovery-probe.py" > "$TMPDIR/recovery-probe.log"` — exit **0**. Decisive output:
```text
MISSING_STATUS {'first': True, 'resume': True, 'calls_before': 1, 'after_missing_status': True, 'calls_after': 2}
UNKNOWN_CONTROL {'result': False, 'new_calls': 0}
DANGLING_MANIFEST {'result': True, 'new_calls': 1, 'symlink_replaced': True}
```

Falsifier: Validate existing state records before planning and distinguish absent keys from malformed present entries; reject symlinks even when their targets are absent. Repeating both controls must return failure, preserve the old ledger evidence and make zero new calls without explicit reconciliation. Extend the existing C1 control with the pre-invocation count; no additional test block is needed.

#### R2 [Blocker] Admitted numeric parameters change type/value in the installed caller

Observed input: generate-assets.py:143–146 admits finite floats and arbitrary Python integers. At :198–200 it serializes them with json.dumps. The deployed caller's exact pure `NW` parser recognizes only ordinary decimal syntax and converts through JavaScript Number. Thus admitted `parameters:{seed:0.0000001}` becomes the string `"1e-07"`, and `parameters:{seed:9007199254740993}` becomes number9007199254740992. The probe calls actual admit_jobs and evaluates only the extracted pure parser, without caller CLI/network/credentials. A 0.5 control retains its type/value.

Affected scope: Exact accepted parameters and content identity disagree with the submitted request; a batch can be marked complete for changed parameter semantics. C1 :246–250 covers only the string moderation=low, so its green receipt does not falsify this issue. No claim is made about provider-specific acceptance of the example seed values.

Command: same `python3 "$TMPDIR/recovery-probe.py"` — exit **0**. Decisive output:
```text
PARAMETER {'admitted': 0.5, 'wire': '0.5', 'caller': {'value': 0.5, 'type': 'number'}}
PARAMETER {'admitted': 1e-07, 'wire': '1e-07', 'caller': {'value': '1e-07', 'type': 'string'}}
PARAMETER {'admitted': 9007199254740993, 'wire': '9007199254740993', 'caller': {'value': 9007199254740992, 'type': 'number'}}
```

Falsifier: Forward only values that round-trip exactly through the installed parameter contract, using a lossless supported encoding or rejecting unsupported numbers during admission. Both inputs must retain their requested JSON type/value or fail before dispatch; the ordinary decimal control must remain supported. Keep this in the existing admission/argv owners, not a replacement caller.

#### R3 [Should] Whole-run deadline is sampled too early to bound dispatch

Observed input: run_job computes `remaining` at generate-assets.py:167, before cost scanning, reference snapshots and the durable in-flight update(:201), then starts Popen(:204) without rechecking the deadline. A deterministic monotonic-clock probe advances time by2s during the real in-flight publication, with run_timeout=1. The deadline is101, but Popen starts at102 with another1s communication allowance and returns success. This is simulated slow local preparation, not provider timing.

Affected scope: A slow filesystem/fsync or reference preparation can cause a paid call to start after the declared whole-run deadline. The existing C1 timeout case sleeps inside the caller and cannot detect this pre-dispatch overrun.

Command: same `python3 "$TMPDIR/recovery-probe.py"` — exit **0**. Decisive output:
```text
DEADLINE {'deadline': 101.0, 'launch_time': 102.0, 'communicate_timeout': 1, 'result': True}
```

Falsifier: Check the monotonic deadline immediately at the dispatch boundary after durable preparation, and derive the communication allowance from the then-current remaining time. With the same delayed-publication clock control, no Popen may occur after101; preserve safe state/evidence on refusal. Full real process-group timeout verification remains **[Unverified — needs clone run]**.

#### R4 [Should] Completed reuse does not revalidate the recipe contract

Observed input: generate-assets.py:219–220 checks recipeRef only when initially completing a call. The reuse path at :254–259 calls validate_output, which never checks recipeRef or attempts. Starting from the probe's valid complete record, replacing receipt.recipeRef with `wrong-recipe` and updating the manifest's receipt SHA to match that receipt still returns True with max_calls=0.

Affected scope: A structurally valid but inconsistent imported/reconciled manifest can claim a complete entry for the wrong recipe. This probe intentionally reseals the receipt hash; it does **not** claim ordinary receipt-byte tampering bypasses the hash check. The acceptance contract explicitly requires recipe admission for reuse as well as completion.

Command: same `python3 "$TMPDIR/recovery-probe.py"` — exit **0**. Decisive output:
```text
WRONG_RECIPE_REUSE {'result': True, 'new_calls': 0}
```

Falsifier: Reuse the same expected recipe/attempt receipt contract for completion and reuse, with the admitted job supplying the expectation. The inconsistent record must fail without dispatch, while the unmodified completed record still resumes with zero calls.

#### [Unverified — no citation] Narrow controls and preserved repair improvements

Observed input: An unmodified valid job completed once and resumed with zero additional caller invocations (R1 control). Explicit unknown returned False with zero calls. Injecting OSError into json.dump during an update preserved the previous in-flight manifest bytes. Holding generation.lock made a contender refuse before admit_jobs and left manifest bytes unchanged.

Affected scope: These support the repaired default resume, explicit unknown refusal, atomic failed-write preservation and batch ownership boundaries. They do not cancel the malformed-state and contract gaps above.

Commands/results: `python3 "$TMPDIR/recovery-probe.py"` — exit **0**, `ATOMIC_CONTROL {'preserved': True}`. `python3 "$TMPDIR/lock-probe.py" > "$TMPDIR/lock-probe.log"` — exit **0**, `OWNERSHIP_CONTROL {'result': False, 'manifest_unchanged': True}`.

Falsifier: The corresponding controls fail if a valid resume invokes again, unknown dispatches, failed serialization alters prior state, or planning runs while ownership is held. Source inspection also confirms full-digest/UUID destinations, preserved history/reference snapshots, serial Sun admission, configured1–3workers and honest observable-cost wording; full C1 execution was not repeated here.

Root cause: Admission is split between permissive local state/parameter parsing and later receipt/caller checks; incomplete state can look new and accepted values can change at the boundary. Fix sites are the existing manifest reader/planner, parameter admission/serialization, dispatch deadline and receipt validator. A downstream render workaround or another provider adapter would leave these failures intact. Reconcile README/MVP-report completion claims with the resulting evidence and retain the original lane/caps.

The exact component probe sources follow because scratch is discarded. They write only beneath TMPDIR, replace only the external caller launch in memory, and use an existing PNG strictly as input data. The real shared PNG/Resvg validator runs; no executable fixture/test suite or provider caller runs.

#### Retained recovery-probe.py

```python
import contextlib, hashlib, importlib.util, io, json, os, pathlib, subprocess, tempfile
from unittest.mock import patch
P=pathlib.Path('examples/2026-10-08-solar-system/generate-assets.py')
s=importlib.util.spec_from_file_location('g',P); g=importlib.util.module_from_spec(s); s.loader.exec_module(g)
root=pathlib.Path(tempfile.mkdtemp(prefix='recovery-',dir=os.environ['TMPDIR'])).resolve()
caller=root/'caller.mjs'; caller.write_text('// never executed')
j=dict(id='sun',prompt='A',model='m',size='1024x1024',quality='medium',background='transparent')
png=pathlib.Path('tools/spike/assets/generated/web/balance_scale.png').read_bytes()
calls=[]
class NoProvider:
    returncode=0
    def __init__(self,args,**kw):
        calls.append(args)
        out=pathlib.Path(args[args.index('--out')+1]); out.write_bytes(png)
        self.receipt=dict(status='success',image=dict(sha256=hashlib.sha256(png).hexdigest(),bytes=len(png)),alpha=dict(verified=True,hasAlphaChannel=True,transparentPixelRatio=.5),recipeRef='configured-caller:'+hashlib.sha256(caller.read_bytes()).hexdigest(),attempts=[dict(status='success')])  [Unverified — no citation]
    def communicate(self,timeout=None): return json.dumps(self.receipt),''
real_popen=g.subprocess.Popen
def boundary(args,**kw):
    return NoProvider(args,**kw) if len(args)>1 and args[1]==str(caller) else real_popen(args,**kw)
def fresh(name):
    p=root/name;p.mkdir();return p

def run(p,job=j,**kw):
    with contextlib.redirect_stdout(io.StringIO()),patch.object(g.subprocess,'Popen',boundary):
        return g.generate([job],p,caller,**kw)
# Control valid completion/resume; remove status from this genuine generated state.
p=fresh('state'); calls.clear(); first=run(p); resumed=run(p); before=len(calls)
mp=p/'manifest.json'; manifest=json.loads(mp.read_text()); state=next(iter(manifest.values())); state.pop('status'); mp.write_text(json.dumps(manifest))
missing=run(p)
print('MISSING_STATUS',dict(first=first,resume=resumed,calls_before=before,after_missing_status=missing,calls_after=len(calls)))
# Explicit unknown correctly refuses (negative control).
manifest=json.loads(mp.read_text()); next(iter(manifest.values()))['status']='unknown'; mp.write_text(json.dumps(manifest)); before=len(calls)
unknown=run(p)
print('UNKNOWN_CONTROL',dict(result=unknown,new_calls=len(calls)-before))
# Existing dangling manifest symlink must not become an empty brand-new ledger.
p=fresh('dangling'); (p/'manifest.json').symlink_to(p/'lost-manifest.json'); before=len(calls); dangling=run(p)
print('DANGLING_MANIFEST',dict(result=dangling,new_calls=len(calls)-before,symlink_replaced=not (p/'manifest.json').is_symlink()))
# Atomic error preserves old in-flight bytes.
p=fresh('atomic'); mp=p/'manifest.json';g.update_manifest(mp,'d',dict(status='in-flight')); before=mp.read_bytes()
with patch.object(g.json,'dump',side_effect=OSError('injected write error')):
    try:g.update_manifest(mp,'d',dict(status='complete'))
    except OSError:pass
print('ATOMIC_CONTROL',dict(preserved=mp.read_bytes()==before))
# Only evaluate the deployed caller's pure scalar parser; never import/run its CLI.
installed=pathlib.Path('/Users/noelsaw/.codex/skills/hiqs-chain/scripts/chain.mjs').read_text()
parser=installed[installed.index('function NW('):installed.index('function H9(')]
for value in [0.5,0.0000001,9007199254740993]:
    job=dict(j,parameters={'seed':value}); g.admit_jobs([job],caller)
    arg=json.dumps(value,separators=(',',':'))
    code=parser+'const v=NW(process.argv[1]);console.log(JSON.stringify({value:v,type:typeof v}));'
    decoded=subprocess.run(['node','--input-type=module','-e',code,arg],capture_output=True,text=True,check=True)
    print('PARAMETER',dict(admitted=value,wire=arg,caller=json.loads(decoded.stdout)))
# A correctly hashed receipt with the wrong recipe is reused; initial completion was real.
p=fresh('recipe');run(p);mp=p/'manifest.json';manifest=json.loads(mp.read_text());state=next(iter(manifest.values()));rp=p/state['receipt'];rec=json.loads(rp.read_text());rec['recipeRef']='wrong-recipe';rp.write_text(json.dumps(rec));state['receipt_sha256']=hashlib.sha256(rp.read_bytes()).hexdigest();mp.write_text(json.dumps(manifest));before=len(calls)
print('WRONG_RECIPE_REUSE',dict(result=run(p,max_calls=0),new_calls=len(calls)-before))
# Simulate a slow durable in-flight publication consuming the remaining budget.
p=fresh('deadline');now=[100.];launches=[];original_update=g.update_manifest
class DeadlineBoundary(NoProvider):
    def __init__(self,args,**kw):launches.append(now[0]);super().__init__(args,**kw)
    def communicate(self,timeout=None):launches.append(timeout);return super().communicate(timeout)
def delayed_update(*args):
    result=original_update(*args)
    if args[2].get('status')=='in-flight':now[0]+=2
    return result
def time_boundary(args,**kw):return DeadlineBoundary(args,**kw) if len(args)>1 and args[1]==str(caller) else real_popen(args,**kw)
with contextlib.redirect_stdout(io.StringIO()),patch.object(g.time,'monotonic',lambda:now[0]),patch.object(g,'update_manifest',delayed_update),patch.object(g.subprocess,'Popen',time_boundary):
    ok=g.generate([j],p,caller,timeout=1,run_timeout=1)
print('DEADLINE',dict(deadline=101.,launch_time=launches[0],communicate_timeout=launches[1],result=ok))
```

#### Retained lock-probe.py

```python
import contextlib, fcntl, importlib.util, io, os, pathlib, tempfile
from unittest.mock import patch
p=pathlib.Path('examples/2026-10-08-solar-system/generate-assets.py');s=importlib.util.spec_from_file_location('g',p);g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
r=pathlib.Path(tempfile.mkdtemp(dir=os.environ['TMPDIR']));(r/'manifest.json').write_text('{"old":{"status":"unknown"}}');before=(r/'manifest.json').read_bytes()
with (r/'generation.lock').open('a') as owner:
 fcntl.flock(owner,fcntl.LOCK_EX|fcntl.LOCK_NB)
 with patch.object(g,'admit_jobs',side_effect=AssertionError('planning reached')), contextlib.redirect_stdout(io.StringIO()):
  result=g.generate([],r,r/'never-called.mjs')
print('OWNERSHIP_CONTROL',dict(result=result,manifest_unchanged=before==(r/'manifest.json').read_bytes()))
```

Handing off to coordinator — coordinator, take your turn. Independent supervisor/harness owns the next gate and any eventual attestation.

### Round 2 · Producer · coordinator

Repaired all four concrete Round1 findings in existing owners: strict status for present manifest entries and symlink check before existence (R1); explicit rejection of exponent-form numbers/unsafe integers at admission (R2;0.5supported); monotonic whole-run deadline starts before admission and is checked immediately after durable preparation at Popen, remaining-time validator/caller bounds (R3); common expected recipe/attempt validation on completion and reuse (R4). Existing C1 adds actual pre-invocation counts, missing/dangling status, decimal/safe-number boundary, resealed recipe and fake-clock late-publication controls. Current suite4/4 in28.6s,216boxes/12byte-identical artifacts, no paid calls. Receipt: relay-system/2026-10-09/gh5-p3-repair/review-round2-verification.log. Header Round1 in the first receipt lacked a space, so native parser did not count it; its actual graded findings remain preserved and are not represented as approval. For this second review append the exact native heading `### Round 2 · Reviewer · codex` (with spaces), nonempty body, VERDICT/Basis/swept file. Re-review whole current files and explicitly close or retain R1–R4; scratch component probes only, no duplicate full suite/provider call/source edit/Git. This is the one bounded recovery recheck after material corrections; original marathon counter2/2 and held phases remain unchanged. Handing off to codex — codex, take your turn.


## Log

### Round 2 · Reviewer · codex

**Verdict:** Approved
VERDICT: PASS
Basis: Whole-file current-source review and scratch component probes close all four recovery Round1 findings. Malformed present state and dangling symlinks refuse before calls; unsupported numbers fail admission; late durable preparation launches no caller; inconsistent recipe/attempt receipts fail reuse. Valid completion/resume, atomic failed-write preservation and ownership refusal remain intact. No new material blocker identified in this bounded sweep.
swept file: yes
Review outcome: Approve this independent recovery-source review only. Original MARATHON-GH5-P3-TURN counter2/2, stopped native lane, held Phases4/5, final Wave1 QA and pending human/live-provider gates remain unchanged. Supervisor/harness owns the next gate and attestation; this is not native phase.approved or self-attestation.

Scope and limits: Read all five current owners in full: examples/2026-10-08-solar-system/generate-assets.py, tools/spike/test/canaries.test.mjs, examples/2026-10-08-solar-system/README.md, tools/MVP-REPORT.md and CHANGELOG.md. Swept pre-existing render controls and historical documentation; no additional material pre-existing defect identified within this scope. Read ROUTER/GUIDING-PRINCIPLES/AGENTS, canonical Phase3 requirements, preserved first-attempt findings, recovery plan/consult reconciliation and Round2 verification receipt. Root README.md and both repository-relative releases_app.py startup entry points are absent. MCP graph tools are unavailable; project/generation/coverage cannot be independently established, so direct source is the fallback, not a completeness claim. No Git was run; supplied dc3a4d6/diff identity was not independently verified. Approval targets the supplied current files on disk.  [Unverified — no citation]

Bet and reversibility: Existing state/caller-contract owners now reject the witnessed failures without another subsystem. This relies on the documented trusted local filesystem/caller boundary and preserved immutable evidence. Relay-only approval is **Easy**; an independent harness gate remains necessary for integration regressions. No artifact/source edit, roadmap/database operation, PDDA, validate.sh, test script, pytest, executable fixture, suite or installed caller CLI/provider execution occurred. All probes write under .relay-scratch/tmp; only this relay changes outside scratch. The review-code skill was applied subject to the operator's narrower relay-only/no-Git/no-suite instructions; no GitHub post is part of this turn.

Recon: CLI at generate-assets.py:320 enters generate(:248), which starts the deadline before admission and owns generation.lock(:255) through completion. read_manifest_internal(:38) owns state admission; update_manifest(:58) owns atomic publication. run_job(:171) uses immutable attempts and the configured caller; validate_output(:78) shares completion/reuse admission, tools/spike/assets.mjs:10 PNG inspection and native Resvg. C1 at tools/spike/test/canaries.test.mjs:184–273 is the recovery consumer. The installed caller's pure NW scalar parser was extracted as text and evaluated alone; no caller module/CLI, credentials or network was used.

All firsthand results below use this exact command, exit **0**:
~~~sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 "$TMPDIR/round2-probe.py" > "$TMPDIR/round2-probe.log"
~~~
Full probe source is retained below because scratch is discarded. It substitutes the external caller launch in memory and reads an existing PNG as data; real shared PNG/native transparency admission runs. Synthetic receipts demonstrate local control flow, not provider behavior.

#### R1 [Pass] Closed — malformed present state and dangling manifests refuse

Observed input: Removed status, set null/invalid status, and separately planted a dangling manifest symlink. generate-assets.py:39–47 rejects each before planning. Unknown/in-flight controls also fail. C1:253–255 captures counts before malformed-state invocations, correcting the former self-comparison.

Affected scope: The Round1 malformed evidence cannot become missing work. Rejected manifest bytes and dangling symlink were preserved, with zero calls and no force-retry.

Decisive output (command above, exit0):
~~~text
STATE {'status': 'missing', 'result': 'ValueError:invalid manifest; reconcile before dispatch', 'new_calls': 0, 'preserved': True}
STATE {'status': None, 'result': 'ValueError:invalid manifest; reconcile before dispatch', 'new_calls': 0, 'preserved': True}
STATE {'status': 'invalid', 'result': 'ValueError:invalid manifest; reconcile before dispatch', 'new_calls': 0, 'preserved': True}
STATE {'status': 'unknown', 'result': False, 'new_calls': 0, 'preserved': True}
STATE {'status': 'in-flight', 'result': False, 'new_calls': 0, 'preserved': True}
DANGLING {'result': 'ValueError:unsafe manifest symlink; reconcile before dispatch', 'new_calls': 0, 'symlink_preserved': True}
~~~
Falsifier: A new call or replacement of rejected evidence in these controls would reopen R1. Neither occurred.

#### R2 [Pass] Closed — unsupported numeric semantics rejected before dispatch

Observed input: parameters.seed=1e-7 and integer9007199254740993 now raise the explicit round-trip error at generate-assets.py:156–157. The actual installed pure parser demonstrates why: exponent syntax yields a string and the unsafe integer changes value. Decimal0.5 and safe integer9007199254740991 preserve numeric value. An additional terminal-newline string remained a string; no drift observed. C1:256–257 adds numeric rejection and the0.5control.

Affected scope: Both witnessed numeric type/value mismatches are closed without modifying the caller or inventing flags. Provider-specific seed support is not claimed.

Decisive output (command above, exit0):
~~~text
PARAMETER {'input': 0.5, 'admitted': True, 'wire': '0.5', 'caller': {'value': 0.5, 'type': 'number'}}
PARAMETER {'input': 1e-07, 'admitted': 'numeric parameter cannot round-trip through caller; use supported decimal/safe integer', 'wire': '1e-07', 'caller': {'value': '1e-07', 'type': 'string'}}
PARAMETER {'input': 9007199254740993, 'admitted': 'numeric parameter cannot round-trip through caller; use supported decimal/safe integer', 'wire': '9007199254740993', 'caller': {'value': 9007199254740992, 'type': 'number'}}
PARAMETER {'input': 9007199254740991, 'admitted': True, 'wire': '9007199254740991', 'caller': {'value': 9007199254740991, 'type': 'number'}}
~~~
Falsifier: Unsafe input passing admission or supported controls changing value through that parser would reopen R2. Neither occurred.

#### R3 [Pass] Closed — deadline checked after durable preparation

Observed input: Clock starts at100, run_timeout=1; the real in-flight publication advances the clock by2. generate-assets.py:217–220 now checks remaining time after publication and returns False without Popen, restoring pending with an explicit no-dispatch reason. The deadline starts at :250 before admission; validator time is bounded at :102–106. C1:259–273 has the matching no-launch assertion.

Affected scope: Closes the witnessed launch-after-preparation-deadline failure. Pending is safe here because no external caller launched.

Decisive output (command above, exit0):
~~~text
DEADLINE {'result': False, 'launches': [], 'status': 'pending'}
~~~
Falsifier: Any launch in this control would reopen R3. None occurred. Actual process-tree cleanup/full-suite execution remain **[Unverified — needs clone run]**, owned by the harness; the fake clock does not establish an OS scheduling or remote cancellation guarantee.

#### R4 [Pass] Closed — shared recipe/attempt admission on reuse

Observed input: A successfully completed job's receipt is changed to wrong-recipe and its manifest receipt hash resealed. Separately resealed receipts set attempts=2 and attempts=0. generate-assets.py:85–88 rejects all three. Completion(:236) and reuse(:176,:279) supply the same admitted recipe and attempt cap. Restoring the original receipt/manifest resumes with zero calls. C1:258 covers resealed wrong-recipe refusal.

Affected scope: Closes inconsistent-but-rehashed recipe reuse and confirms the shared attempt bound; this is stronger than ordinary byte-tampering rejection.

Decisive output (command above, exit0):
~~~text
RECEIPT {'field': 'recipeRef', 'value': 'wrong-recipe', 'result': False, 'new_calls': 0}
RECEIPT {'field': 'attempts', 'value': 2, 'result': False, 'new_calls': 0}
RECEIPT {'field': 'attempts', 'value': 0, 'result': False, 'new_calls': 0}
RECEIPT_CONTROL {'result': True, 'new_calls': 0}
~~~
Falsifier: Acceptance/dispatch for inconsistent receipts or failure of zero-call reuse after restoring valid evidence would reopen R4. Neither occurred.

#### [Pass] Preserved ownership, atomicity and valid resume

Observed input: Real-PNG synthetic caller result completes once then resumes; injected json.dump OSError tests failed-write preservation; held generation.lock plus forbidden admit_jobs sentinel checks refusal before planning. Source: generate-assets.py:58–75,:255–261,:279.

Affected scope: Repairs retain the atomic writer, shared validator and batch ownership; no new provider client, queue, abstraction, dependency or test block is required.

Decisive output (command above, exit0):
~~~text
RESUME {'first': True, 'resume': True, 'calls': 1}
ATOMIC {'preserved': True}
LOCK {'result': False, 'manifest_absent': True}
~~~
Falsifier: Extra resume invocation, lost prior bytes on failed serialization, or admission under held ownership would invalidate these controls. None occurred.

#### [Unverified — needs clone run] Supervisor integration gate remains

Observed input: Read gh5-p3-repair/review-round2-verification.log:4tests pass,0fail,216boxes,12byte-identical artifacts,28580.264708ms,budget PASS28.6s. Static C1 review confirms recovery checks remain within the existing four-test file. Its unsafe-integer JavaScript literal rounds before serialization; the independent Python probe above checks the exact original integer9007199254740993.

Affected scope: This is a saved producer receipt, not a reviewer rerun. Full-suite/process-group verification and independent supervisor attestation remain outstanding. README/MVP-report/CHANGELOG preserve unknown-price cost limits, the PNG subset, pending provider/human acceptance and stopped native lane. Source review preserves full-digest/UUID attempts, caller/reference identity, Sun-first dispatch, explicit replacement/history and observable-cost serialization. No new material defect was established in those paths.

Falsifier: A failing harness gate, stale receipt against committed source, or independent material counterexample invalidates integration readiness. Component probes do not replace that gate.

#### Retained round2-probe.py

~~~python
import contextlib, fcntl, hashlib, importlib.util, io, json, os, pathlib, subprocess, tempfile
from unittest.mock import patch
p=pathlib.Path("examples/2026-10-08-solar-system/generate-assets.py")
s=importlib.util.spec_from_file_location("g",p);g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
r=pathlib.Path(tempfile.mkdtemp(prefix="round2-",dir=os.environ["TMPDIR"])).resolve()
caller=r/"caller.mjs";caller.write_text("// never executed")
j=dict(id="sun",prompt="A",model="m",size="1024x1024",quality="medium",background="transparent")
png=pathlib.Path("tools/spike/assets/generated/web/balance_scale.png").read_bytes()
calls=[];real_popen=g.subprocess.Popen
class Boundary:
 returncode=0
 def __init__(self,args,**kw):
  calls.append(args);out=pathlib.Path(args[args.index("--out")+1]);out.write_bytes(png)
  self.receipt=dict(status="success",image=dict(sha256=hashlib.sha256(png).hexdigest(),bytes=len(png)),alpha=dict(verified=True,hasAlphaChannel=True,transparentPixelRatio=.5),recipeRef="configured-caller:"+hashlib.sha256(caller.read_bytes()).hexdigest(),attempts=[dict(status="success")])
 def communicate(self,timeout=None):return json.dumps(self.receipt),""
def boundary(args,**kw):return Boundary(args,**kw) if len(args)>1 and args[1]==str(caller) else real_popen(args,**kw)
def fresh(name):
 p=r/name;p.mkdir();return p
def run(p,job=j,**kw):
 with contextlib.redirect_stdout(io.StringIO()),patch.object(g.subprocess,"Popen",boundary):
  try:return g.generate([job],p,caller,**kw)
  except (ValueError,OSError,TypeError) as e:return type(e).__name__+":"+str(e)
p=fresh("state");a=run(p);b=run(p);mp=p/"manifest.json";original=mp.read_bytes()
print("RESUME",dict(first=a,resume=b,calls=len(calls)))
for value in ["missing",None,"invalid","unknown","in-flight"]:
 m=json.loads(original);v=next(iter(m.values()))
 if value=="missing":v.pop("status")
 else:v["status"]=value
 mp.write_text(json.dumps(m));before=mp.read_bytes();n=len(calls);result=run(p)
 print("STATE",dict(status=value,result=result,new_calls=len(calls)-n,preserved=mp.read_bytes()==before))
mp.write_bytes(original)
p=fresh("dangling");mp=p/"manifest.json";mp.symlink_to(p/"absent.json");n=len(calls)
print("DANGLING",dict(result=run(p),new_calls=len(calls)-n,symlink_preserved=mp.is_symlink()))
p=fresh("atomic");mp=p/"manifest.json";g.update_manifest(mp,"d",dict(status="in-flight"));before=mp.read_bytes()
with patch.object(g.json,"dump",side_effect=OSError("injected")):
 try:g.update_manifest(mp,"d",dict(status="complete"))
 except OSError:pass
print("ATOMIC",dict(preserved=before==mp.read_bytes()))
p=fresh("lock")
with (p/"generation.lock").open("a") as owner:
 fcntl.flock(owner,fcntl.LOCK_EX|fcntl.LOCK_NB)
 with patch.object(g,"admit_jobs",side_effect=AssertionError("planning under contention")):
  print("LOCK",dict(result=run(p),manifest_absent=not (p/"manifest.json").exists()))
installed=pathlib.Path("/Users/noelsaw/.codex/skills/hiqs-chain/scripts/chain.mjs").read_text()
parser=installed[installed.index("function NW("):installed.index("function H9(")]
for value in [.5,1e-7,9007199254740993,9007199254740991,"1\n"]:
 job=dict(j,parameters={"seed":value})
 try:g.admit_jobs([job],caller);admitted=True
 except ValueError as e:admitted=str(e)
 arg=value if isinstance(value,str) else json.dumps(value,separators=(",",":"))
 code=parser+"const v=NW(process.argv[1]);console.log(JSON.stringify({value:v,type:typeof v}));"
 decoded=subprocess.run(["node","--input-type=module","-e",code,arg],capture_output=True,text=True,check=True)
 print("PARAMETER",dict(input=value,admitted=admitted,wire=arg,caller=json.loads(decoded.stdout)))
p=fresh("receipt");assert run(p) is True;mp=p/"manifest.json";original=mp.read_bytes();m=json.loads(original);v=next(iter(m.values()));rp=p/v["receipt"];saved=rp.read_bytes()
for field,value in [("recipeRef","wrong-recipe"),("attempts",2),("attempts",0)]:
 rec=json.loads(saved);rec[field]=value;rp.write_text(json.dumps(rec));m=json.loads(original);next(iter(m.values()))["receipt_sha256"]=hashlib.sha256(rp.read_bytes()).hexdigest();mp.write_text(json.dumps(m));n=len(calls)
 print("RECEIPT",dict(field=field,value=value,result=run(p,max_calls=0),new_calls=len(calls)-n))
rp.write_bytes(saved);mp.write_bytes(original);n=len(calls)
print("RECEIPT_CONTROL",dict(result=run(p,max_calls=0),new_calls=len(calls)-n))
p=fresh("deadline");now=[100.];original_update=g.update_manifest;launches=[]
def delayed(*args):
 result=original_update(*args)
 if args[2].get("status")=="in-flight":now[0]+=2
 return result
def forbidden(*args,**kw):launches.append(now[0]);raise AssertionError("late launch")
with contextlib.redirect_stdout(io.StringIO()),patch.object(g.time,"monotonic",lambda:now[0]),patch.object(g,"update_manifest",delayed),patch.object(g.subprocess,"Popen",forbidden):
 result=g.generate([j],p,caller,run_timeout=1)
print("DEADLINE",dict(result=result,launches=launches,status=next(iter(json.loads((p/"manifest.json").read_text()).values()))["status"]))
~~~

Recovery review relay closed, no further reviewer turn needed. Handing the approved receipt to coordinator/supervisor for the harness-owned gate and attestation; coordinator, take your turn. Preserve the original native lane/counters and held phases.

### Attestation · relay-drive — 2026-10-09T17:43:32Z
task: GH5-P3-RECOVERY-QA-20261009
reviewer: codex
status: Approved
reviewed-head: f780bc4a81df2c203d570da37067db6d0b7d5340
added-range: 22823+16159
added-sha256: aa759f1847e40a2fce2543976973a2e7f789e301f2bab92d6166adccfe8f4b83
