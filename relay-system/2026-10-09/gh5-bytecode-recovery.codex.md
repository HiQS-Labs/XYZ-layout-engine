# RELAY · GH-5 bytecode containment repair — independent QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: coordinator (Producer)
STATUS: Approved
ROUND: 1 / 1

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
6. **The supervisor commits; do NOT run Git.** Historical template: `relay(gh-5-bytecode-containment-repair-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`; generator read-only context `examples/2026-10-08-solar-system/generate-assets.py`
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: One standard Python -B flag removes the observed source-tree bytecode side effect without weakening the existing deadline control, recovery assertions, test-budget or generator runtime. Full suite4/4 in28.6s, no source __pycache__; receipts under relay-system/2026-10-09/gh5-bytecode-recovery/. Independent reviewer verifies with scratch-only probes; no full suite or paid/provider calls.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). The supervisor commits; never run Git.

## Bounded questions and native protocol

Operational envelope: local developer CLI and existing four canaries, not a service. No extra dependency, test block, governance runtime or provider calls. Original native Phase3 is held after ONE operator-authorized override (thirdfire). Its builder ran the canary file and created an off-lane __pycache__; shim discarded the entire turn. This QA task is review-only, NOT another native Phase3 fire or its approval. Phases4/5 remain pending.

1. Does the exact modified Python -B argv prevent bytecode from the importlib deadline probe while retaining the delayed-publication/no-Popen assertions? Run a narrow scratch-only import with/without -B if useful. Never import the committed source without -B or PYTHONDONTWRITEBYTECODE=1.
2. Does the full existing canary file contain another source-tree write or import that would recreate this precise containment failure? Sweep the file and cite evidence; do not request speculative machinery.
3. Are reproduction, suite and native halt receipts honest, and is this the smallest safe edit? Gate suite is already run outside reviewerworktree; do not rerun it here.

Append `### Round 1 · Reviewer · codex`, literal `VERDICT: PASS|FAIL|PARKED`, nonempty `Basis:`, `swept file: yes|no` and cited graded findings. Write ONLY this relay; scratch under .relay-scratch/ or TMPDIR. Set PYTHONDONTWRITEBYTECODE=1 before any probe; no test/gate suite, no git, no paid calls. If satisfied set STATUS: Approved and use the env-pinned absolute tick to done GH5-BYTECODE-RECOVERY-QA-20261009 --agent codex. Otherwise set NEXT: coordinator (Producer) and release --to coordinator. Explicit closure/handoff. Supervisor owns attestation. Original Phase3 counter/identity/gate stay untouched.

## Log

### Round 1 · Reviewer · codex

VERDICT: PASS
Basis: Approve the bounded bytecode-containment repair: the exact import prefix reproduces bytecode on a scratch copy without `-B`, and suppresses it with `-B`. Deadline/recovery assertions remain present. Entire canary and changelog swept; no additional actionable pre-existing defect found in this bounded review. Reversibility: Easy. This approval closes only this repair QA; original native Phase3 remains halted and Phases4/5 pending.
swept file: yes

- [Pass] **Smallest mechanism, measured negative control.** `tools/spike/test/canaries.test.mjs:259-272` uses `['-B','-c',…]` for the source import; no runtime rewrite is needed. Scratch-only import of a byte-identical generator copy used the exact canary import prefix. Command below exited **0**; decisive output: baseline `exit: 0, pycache_created: true`; `-B` `exit: 0, pycache_created: false`; both stderr empty. Source SHA256: `73a5a24aeced3cbe3ee49af01913d8c1d628e4018bb424bc5b0aa0cf0dee30fb`. No fixture, generator operation, provider call or committed-source import was executed. Fix: none; retain `-B`.

```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 -B - <<'PY'
import pathlib, tempfile, subprocess, os, re, json, hashlib
source=pathlib.Path("examples/2026-10-08-solar-system/generate-assets.py")
text=pathlib.Path("tools/spike/test/canaries.test.mjs").read_text()
probe=re.search(r"const deadlineProbe=spawnSync.*?\[\x27-B\x27,\x27-c\x27,`(.*?)`,py,stubJS\]", text, re.S).group(1)
# Only the import portion runs; no generator, fixture or provider invocation.
code=probe.split("now=[100.0]")[0]
root=pathlib.Path(tempfile.mkdtemp(prefix="bytecode-import-",dir=os.environ["TMPDIR"]))
env=dict(os.environ);env.pop("PYTHONDONTWRITEBYTECODE",None);env.pop("PYTHONPYCACHEPREFIX",None)
results=[]
for flags in ([],["-B"]):
    case=root / ("baseline" if not flags else "python-B");case.mkdir()
    target=case / source.name;target.write_bytes(source.read_bytes())
    result=subprocess.run(["python3",*flags,"-c",code,str(target)],env=env,cwd=root,capture_output=True,text=True,timeout=10)
    results.append({"argv_flags":flags,"exit":result.returncode,"pycache_created":(case/"__pycache__").exists(),"stderr":result.stderr})
print(json.dumps({"source_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),"probe":"exact canary import prefix only","results":results},indent=2))
assert results[0]["exit"]==results[1]["exit"]==0
assert results[0]["pycache_created"] and not results[1]["pycache_created"]
PY
```

- [Pass] **Deadline assertions preserved by source inspection.** `tools/spike/test/canaries.test.mjs:263-272` advances the mocked clock by two seconds after `in-flight` publication, makes `Popen` raise `AssertionError('launch after deadline')`, asserts `generate(...,run_timeout=1) is False`, and checks child status zero with a 10-second subprocess timeout. Generator `generate-assets.py:217-221` checks remaining time after publication and returns pending before launch. Existing resume, cap, corruption, unknown/in-flight, concurrency, timeout, missing-output, reference and identity assertions remain at canary lines 209-258. Fix: none; retain those controls.
- [Pass] **Full-file containment sweep.** `tools/spike/test/canaries.test.mjs:1-320`: explicit mutation targets descend from `FRESH`/`space`/`genRoot` (lines 20, 31-36, 43-58, 67-90, 110-122, 152-181, 185-258) or the separate temporary tamper root (309-317); committed evidence is read/verified (302-305). Other Python launches execute the script directly (206, 230), which does not cache its main script; the only explicit Python local-module import is the repaired probe (259-262). Generator import-time statements are imports/constants/function definitions, with CLI execution guarded by `__name__ == '__main__'` (`generate-assets.py:1-32,320`). No second path recreating this precise source-bytecode failure was found. Fix: none; no speculative containment machinery.
- [Pass] **Receipt consistency and honest native halt.** `relay-system/2026-10-09/gh5-bytecode-recovery/bytecode-repro.json:2-5` agrees with the independent negative control. `bytecode-verification.log:2,5-6,31-40` records four passing canaries, 216 boxes, 12 matching artifacts, 28.6s under 60s. `gh5-continuation-live.log:8,19-26,39` records the one cap override, off-lane `__pycache__`, discarded builder turn, exit 6 and later phases not started. `halted-00.json` records `elapsed_seconds: 150.2`, `check: 0`, `max_checks: 6`, `approved_remaining_phases: 0`. `CHANGELOG.md:13,142` distinguishes recorded suite results from native approval. Fix: none; preserve the halted native state.
- [Unverified — needs clone run] **Execution boundary.** The complete suite, delayed-publication/no-Popen execution, source-tree cleanliness after a full suite, and cancellation of all six scheduled observations were not independently rerun/measured here. The supplied suite log reports PASS but contains no explicit post-run cache inventory; halted observer evidence shows no scheduled check reached before termination, rather than a separate cancellation receipt. These remain coordinator/harness checks, not additional source-change requests. No test/gate suite or git command was run in this turn.

Coverage limitation: graph `list_projects` pagination completed (82 projects); none matches this worktree or campaign clone. No matching generation or callable coverage checker was available; evidence is direct whole-file source reads, cited receipts and the scratch-only import probe. Startup README is absent in this seeded tree; roadmap/PDDA runtime commands were omitted under this review's narrow non-mutating probe restriction.

Turn bookkeeping: the first relay-write command failed before writing (`zsh: unmatched`, exit 1) because its outer heredoc delimiter collided with the quoted probe. The file was then updated with a file-scoped patch. The env-pinned tick `done` returned `done: GH5-BYTECODE-RECOVERY-QA-20261009`; no source artifact was changed.

Relay closed (Approved), no further turn needed. Coordinator owns supervisor attestation and any subsequent harness gate; this verdict does not authorize another original Phase3 override.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
