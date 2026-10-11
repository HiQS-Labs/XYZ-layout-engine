# RELAY · #23 generation safety (S3, S4, S5, S7, empty job list) code QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-11.
-->

NEXT: Reviewer
STATUS: Open
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
6. **Commit only the relay file** (`relay(23-generation-safety-s3-s4-s5-s7-empty-job-list-code-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit `2c14244` (`git show 2c14244`), touching `examples/2026-10-08-solar-system/generate-assets.py`, `tools/spike/test/canaries.test.mjs` (C1 generator block), `examples/2026-10-08-solar-system/README.md` and `CHANGELOG.md`. Context: issue #23 items S3, S4, S5 and S7 and the "empty job list" item; a real caller receipt is at `examples/2026-10-08-solar-system/assets/sun.result.json`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done:
  - Each of the five #23 items is fixed at its root cause, not at a symptom.
  - The fix is the least mechanism for a local single-developer generator: no new dependency, test file or workflow.
  - No existing guard is weakened. That covers resume identity, the lock, the call cap, the deadline, alpha and digest validation, and the Sun-first rule.
  - Every guard has a C1 assertion that fails when the guard is removed.
  - The docs match the behaviour.
  - No paid provider call is needed to verify any of it.

## QA brief (read before reviewing)

Operational envelope: a local CLI that spends real money through an external caller. The protections that matter are against paying twice and against committing credentials. Grade against that, with commensurate complexity.

What the producer measured (re-measure what you can):
- A stub-caller reproduction on `main` before the fix showed each defect: an empty list exited 0; the signed query string was kept in 2 files; a deleted manifest allowed a second call; `dispatched:false` per attempt was recorded as `unknown`; and killing the generator mid-call then running `--force-retry` made a second call while the orphaned caller was still running. After the fix, all five are refused or correct.
- Mutation red controls: removing each guard individually makes `pnpm test` exit 1 (C1). The gate is 4/4 in 35.9 s.

You may run narrow probes in `.relay-scratch/` or `$TMPDIR` only. Run `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"` first. For example, import the module with `importlib` and call `redact`, `receipt_text` or `never_dispatched`, or run the generator with a stub caller you write under `.relay-scratch/`. Do not run `pnpm test` here, and never call a real provider.

Questions:
1. S4: does handing the run lock to the caller (`pass_fds`) actually keep a forced retry out while an orphaned caller lives? Can the lock leak past normal completion, or be held by something other than the caller? Does the timeout path still release it (process group kill)?
2. S7: can `redact`/`receipt_text` lose data the rest of the code needs, or break validation (`validate_output` re-reads the receipt and checks `receipt_sha256`)? Is there a realistic signed-URL shape it misses, for example a URL inside a non-JSON receipt, or a URL-encoded or escaped query?
3. S3: is the `ATTEMPT_DIR` pattern exactly what `run_job` creates? Any false positive on the committed `assets/` folder or a fresh run? Is a manifest that is present but emptied (`{}`) a gap worth stating?
4. S5: is treating "every attempt says `dispatched:false`" as safe to re-plan correct against the real receipt shape? Could a partially dispatched result be misread as failed?
5. Did anything else change behaviour unintentionally (atomic writes, the error message for job-list size, receipt bytes no longer being verbatim caller output)?
6. Anything over-built, or missing from the README or CHANGELOG?

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. Every `[Blocker]` or `[Should]` requesting a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh23-gen-safety-qa --agent codex`. **Never run `tick release --to done`.** If you do not approve: set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh23-gen-safety-qa --agent codex --to claude-a`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: S4's lock mechanism works in a narrow OS probe and S5 matches the real receipt shape, but S7 retains credentials in malformed stdout and S3 permits replay when the manifest is emptied to `{}`. Surgical repairs in the existing generator/C1 are warranted; no dependency or new suite.
swept file: yes

Read the entire generator, canaries file, example README and CHANGELOG, including pre-existing code. The empty-manifest gap below is also a pre-existing defect; no other material pre-existing defect was identified. Graph tools were unavailable; source reads were used without a graph completeness claim. Only this relay file was edited. Proposed fixes: Easy. Bet: fail closed on lost payment history and unparseable receipts; the tradeoff is refusal until local reconciliation. No git, suite, executable fixture or paid provider call was run.

- [Blocker] **B1 — malformed stdout can retain a complete signed URL.** `examples/2026-10-08-solar-system/generate-assets.py:35`, `:49-53`, `:265`, `:269`: the non-JSON fallback only recognizes literal `https://`; an error preamble with slash-escaped JSON bypasses it, and its return value is written to the immutable receipt. Percent-encoded URL log text also retains the signature. C1 `tools/spike/test/canaries.test.mjs:351-354` covers only clean JSON.
  Observed input: `caller error: {"url": "https:\/\/cdn.example.test\/a.png?X-Amz-Signature=SIG"}` returns unchanged from `receipt_text`; `error downloading https%3A%2F%2Fcdn.example.test%2Fa.png%3FX-Amz-Signature%3DSIG` does too. These are concrete malformed-receipt fixtures, not a claim that the deployed caller emitted them.
  Affected scope: non-JSON stdout persisted on normal and timeout paths, specifically these escaped/encoded signed-URL shapes.
  Falsifier: these two inputs must persist no recoverable signed URL; clean JSON must retain recipe/image/alpha/attempt metadata and still pass the existing digest/resume control.
  Fix: the least mechanism is to persist a fixed credential-free diagnostic for non-JSON stdout, which cannot validate anyway; alternatively sanitize these concrete shapes before writing. Extend existing C1 with malformed stdout controls. README `:63` and CHANGELOG `:8` currently overstate stripping for these cases.
  Probe command, exit **0**, after `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`:
  ```sh
  python3 -B - <<'PY'
import importlib.util, json
s=importlib.util.spec_from_file_location('g','examples/2026-10-08-solar-system/generate-assets.py')
g=importlib.util.module_from_spec(s); s.loader.exec_module(g)
u='https://cdn.example.test/a.png?X-Amz-Signature=SIG'
for text in ['caller error: '+json.dumps({'url':u}).replace('/',r'\/'),
             'error downloading https%3A%2F%2Fcdn.example.test%2Fa.png%3FX-Amz-Signature%3DSIG']:
    print(g.receipt_text(text))
PY
  ```
  Decisive output: both inputs above unchanged, with `X-Amz-Signature` and `SIG` retained. The combined scratch probe exited **0** and printed `signature_retained=True` for both; clean JSON and ordinary plaintext controls printed `signature_retained=False`.

- [Should] **S1 — `{}` defeats the lost-state guard.** `generate-assets.py:88-95`, `:305-312`: attempt evidence is checked only when the manifest is absent. With an emptied manifest, the same admitted digest reaches launch without `--force-retry`. C1 `:355` only deletes the file.
  Observed input: `manifest.json = {}` alongside `sun_<current admitted 64-hex digest>_<32-hex UUID>`; the probe below reaches `Popen` for that digest (intercepted, zero provider calls).
  Affected scope: an empty manifest object alongside recognized attempt directories; this request does not generalize to arbitrary invalid historical rows or unrelated folders.
  Falsifier: this fixture must refuse before launch; `{}` with no attempt directories must still allow fresh generation, and the committed historical `assets/*.result.json` layout must remain admissible.
  Fix: apply the existing orphan-attempt check to an empty loaded manifest too. Extend the existing C1 lost-state control to `{}`; preserve the reconciliation requirement.
  Probe command, exit **0**, with the same scratch environment:
  ```sh
  python3 -B - <<'PY'
import importlib.util, pathlib, tempfile
from unittest.mock import patch
s=importlib.util.spec_from_file_location('g','examples/2026-10-08-solar-system/generate-assets.py')
g=importlib.util.module_from_spec(s); s.loader.exec_module(g)
root=pathlib.Path(tempfile.mkdtemp()); caller=root/'caller.mjs'; caller.write_text('// inert caller')
job=dict(id='sun',prompt='a',model='m',size='1024x1024',quality='medium',background='transparent')
j=g.admit_jobs([job],caller)[0][0]; j['reference_digests']=[]
assets=root/'assets'; assets.mkdir(); (assets/('sun_'+g.job_digest(j)+'_'+'a'*32)).mkdir()
(assets/'manifest.json').write_text('{}')
def no_call(*a,**k):
    print('Popen reached for same digest without force_retry; provider call intercepted')
    raise AssertionError('intercepted dispatch')
with patch.object(g.subprocess,'Popen',no_call):
    try: g.generate([job],assets,caller)
    except AssertionError as e: print(str(e))
PY
  ```
  Decisive output: `Planned calls: 1`, `Popen reached for same digest without force_retry; provider call intercepted`, `intercepted dispatch`. The companion dry-run probe refused the absent manifest with `attempt folders exist without manifest.json; restore it or reconcile before dispatch`, but returned `True` for `{}`.

- [Pass] **S4 mechanism, narrowly measured.** `generate-assets.py:259` passes the existing descriptor; `:263-264` kills/reaps the process group; the context at `:294` closes the generator's descriptor. Command `python3 -B - <<'PY' … PY`, exit **0**, used this exact body after scratch setup:
  ```python
import fcntl, os, pathlib, signal, subprocess, tempfile
path=pathlib.Path(tempfile.mkdtemp())/'generation.lock'
def acquire():
    f=open(path,'a')
    try: fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError: f.close(); return False
    f.close(); return True
for mode in ['normal','timeout']:
    parent=open(path,'a'); fcntl.flock(parent,fcntl.LOCK_EX)
    child=subprocess.Popen(['node','-e',"console.log('ready');setTimeout(()=>{},500)"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True,pass_fds=(parent.fileno(),))
    assert child.stdout.readline().strip()=='ready'
    parent.close()
    print(mode,'orphan lock blocks='+str(not acquire()))
    if mode=='timeout': os.killpg(child.pid,signal.SIGKILL)
    child.communicate()
    print(mode,'after reap lock available='+str(acquire()))
  ```
  Decisive output: `normal orphan lock blocks=True`, `normal after reap lock available=True`, `timeout orphan lock blocks=True`, `timeout after reap lock available=True`. A caller that explicitly passes the descriptor to descendants can delay retries conservatively. This measures the OS mechanism, not the full generator crash scenario.

- [Pass] **S5 and empty-job admission, helper evidence.** `generate-assets.py:56-61` reads per-attempt flags; `:156-157` rejects zero jobs. The combined import probe (`python3 -B "$TMPDIR/review-probe.py"`, exit **0**) called `never_dispatched` on `{'attempts':[{'dispatched':False}]}`, mixed false/true attempts, empty attempts and `json.loads(Path('examples/2026-10-08-solar-system/assets/sun.result.json').read_text())`: decisive results `True, False, False, False`. The real Sun receipt contains `attempts[0].dispatched:true`. `admit_jobs([], inert_regular_caller)` raised `jobs must be a list of 1 to 32 exact inputs`. No change requested.

- [Pass] **Preserved guards and least mechanism, source review only.** `generate-assets.py:114-144` retains receipt/image digests, bytes, recipe/attempt count, caller alpha and native decoded transparency; `:334-336` keeps the call cap; `:338-353` retains deadline checks and Sun-first execution. Receipt reserialization is internally consistent: `:278` hashes persisted bytes and `:129` compares those bytes on resume. `:64-76` uses same-directory atomic replacement and temporary cleanup. The helpers use the standard library and existing C1; README `:63-65` and CHANGELOG `:8` describe the changed receipt representation. No additional guard weakening identified.

- [Unverified — needs clone run] Producer's 4/4 timing, mutation-red assertions, full crash/forced-retry sequence and full resume validation were not rerun here. C1 `canaries.test.mjs:283-345,350-364` was read; assertion presence is not a passing suite receipt. The harness owns the subsequent gate.

Handing off to Producer (claude-a) — disposition B1 and S1, make surgical generator/C1/doc changes, then reopen review. Go to the Producer window and say 'take your turn'.

### Producer · Round 1 · claude-a

- **B1: Implemented (your least-mechanism option).** `receipt_text` now writes a fixed record for output that is not JSON: `{"status":"unparseable","note":…,"bytes":N,"sha256":…}`. That record holds no caller text, so neither escaped nor percent-encoded URLs can survive. Probe with your two inputs plus a clean-JSON control: `SIG` is present `False, False, False`, and the clean JSON keeps its metadata while the query is stripped (`{"status": "success", "image": {"sha256": "x"}, "attempts": [{"url": "https://cdn.example.test/a.png"}]}`). The result still parses, so the job is recorded as `unknown` through the normal path, as before. C1 gains a `STUB_LEAK` caller that prints both of your shapes and exits 1; the manifest and receipt must not contain `X-Amz-Signature`.
  - Stated limit: a percent-encoded URL inside a *valid* JSON string value is not decoded by `redact`. That is not observed and not requested; it is recorded here, not built.
- **S1: Implemented, scoped tighter than a whole-folder check.** The global "no manifest file" check is replaced by a per-job check in planning. When a planned job has no manifest record but an attempt directory `<id>_<digest>_*` exists, generation refuses before any dispatch: `attempt folders exist but the manifest has no record; restore manifest.json or reconcile before --force-retry`. This covers a deleted, emptied (`{}`) or truncated manifest, and unrelated folders never block. `--force-retry` overrides it, consistent with `unknown` and `in-flight`.
  - Your falsifiers hold: `{}` with no attempt directories still generates fresh (the first `g-signed` run), and the committed `assets/` folder has no attempt directories (`git ls-files` shows 0 matching). The C1 lost-state control now runs both the delete and the `{}` case.
- **Red controls (rerun, mutation script restores the file):** removing the per-job record check → `pnpm test` exit 1; returning raw stdout from the non-JSON branch → exit 1. The earlier five still apply.
- Gate: `pnpm test` 4/4 in 36.7 s. README `:63` and CHANGELOG are reworded to match.
- Commit: see the next commit on `fix/gh23-gen-safety`.

Handing off to Reviewer (codex) for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
