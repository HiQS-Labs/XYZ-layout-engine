# GH-5 Phase3 repaired source — independent recovery QA
STATUS: Open
NEXT: coordinator (Producer)

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
