# RELAY · GH104/105 final review
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-26.
-->

NEXT: Producer
STATUS: Approved
ROUND: 1 / 3

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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh104-105-final-review): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **GH-104-SCROLL-DISCOVERY.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-26

### Artifact — GH-104-SCROLL-DISCOVERY.md
```
---
gh_issue: 104
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/104
title: "Forge scroll discovery"
goal: Resolve the v3 benchmark post-merge finding
owner: Codex
created: 2026-11-26
updated: 2026-11-26
status: In progress
---
# Forge scroll discovery

## Status

| What was just completed | What's next |
|---|---|
| Reproduced on main at 14300b4 | Verify both fixes in a shared PR. |

## Plan

Issue [104](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/104). Shared implementation and acceptance in GH-104-SCROLL-DISCOVERY.md. Rated 52/30/50/96 (priority, severity, neutral appeal, cheapness).

#104: Link the example README from the existing worked-examples paragraph. FD-06 currently prints its missing path. Run the entire FRONTDOOR.md check block and require empty stdout and stderr plus a working link.
#105: score.py weights adjudicated facts; it currently reads only the correct flag and location. Six empty answers retained a perfect Sol score in the post-merge reproduction. Reject a correct=true fact unless its answer is a string with non-whitespace text. Preserve scoring of incorrect facts, scoring floors, provisional ballots and unmodified published results. Check empty, whitespace, missing and non-string answer in disposable copies; original replay must pass. No additional suite. Easy rollback: revert the README link or the single evidence check independently.
The November 12–26 review window includes #95 for prior missing examples and one distinct blank-answer finding. Prior window recurrence unknown. Discovery has modest reach and a one-line repair; incorrect perfect scores undermine benchmark trust but are readily recomputed.
```
- Definition of Done: Verify committed diff, both issue requirements, TESTS-RESULTS smoke evidence and source. Confirm historic scores and blank-answer rejection. Evaluate proportionality and actual red controls. Only modify this relay thread.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: PASS
Basis: Ship. Both bounded fixes match the embedded plan; no additional pre-existing defects found in the whole-file sweep of the embedded artifact, README.md, score.py, and the smoke evidence source. Reversibility: Easy. Approval covers the seeded source and narrow probes; harness verification remains required as described below.
swept file: yes

- [Pass] Discovery: README.md:271 links the benchmark README in the existing worked-examples paragraph. The target exists. A read-only directory/link probe reported `link resolves; FD-06 missing folders: []`. No new navigation mechanism.
- [Pass] Evidence guard: examples/2026-11-23-forge-scroll-v3/score.py:39–43 rejects missing, empty, whitespace and numeric answers for correct facts, before counting comprehension. Incorrect facts still short-circuit, the floor remains at line 43, provisional handling remains at lines 30–32, and weights remain at line 47. No additional suite or scoring subsystem.
- [Pass] Independent scratch-only probe: command `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; python3 - <<'PY'` using the following body (exit 0). Temporary entry copies were confined to TMPDIR; scorer execution is a narrow measurement, not the executable smoke fixture or replay suite.

```python
import contextlib, copy, io, json, pathlib, runpy, sys, tempfile
root = pathlib.Path('examples/2026-11-23-forge-scroll-v3')
original = json.loads((root/'entries.json').read_text())
def score(data):
    with tempfile.TemporaryDirectory() as tmp:
        pathlib.Path(tmp, 'entries.json').write_text(json.dumps(data))
        sys.argv = [str(root/'score.py'), tmp]
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                runpy.run_path(str(root/'score.py'), run_name='__main__')
            return 0, out.getvalue()
        except ValueError as e:
            return 1, str(e)
rc, out = score(original)
assert rc == 0 and '3.00/3' in out and '2.50/3' in out
for value in ['', ' \t', None, 3]:
    data = copy.deepcopy(original)
    for b in data['sol']['ballots']:
        for f in b['facts']:
            if value is None: f.pop('answer')
            else: f['answer'] = value
    rc, out = score(data)
    assert rc == 1 and 'nonblank' in out
data = copy.deepcopy(original)
for b in data['sol']['ballots']:
    for f in b['facts']:
        f['correct'] = False
        f.pop('answer')
rc, out = score(data)
assert rc == 0 and '(1, 3, 3, 3)' in out
data = copy.deepcopy(original)
data['sol']['ballots'].pop()
rc, out = score(data)
assert rc == 0 and out.count('provisional') == 2
```

  Decisive observed output: original Neon `2.50/3`, Sol `3.00/3`; each of empty/whitespace/missing/number returned 1 with `sol: correct facts require a nonblank reader answer`; incorrect/missing floor returned 0 with `(1, 3, 3, 3)`; incomplete panel returned 0 with both eligible entries provisional.
- [Pass] Proportional red controls: TESTS-RESULTS/2026-11-26+GH-104/smoke.py mutates all six Sol answers across four invalid classes and asserts acceptance at 3.00 on the base versus rejection after the change. smoke.txt records the four errors and states `On base 14300b4` they were accepted. This is recorded producer evidence, distinguished from the independent post-change probe above.
- [Unverified — needs clone run] Full FRONTDOOR block, GH-98 replay and base red-control execution were not rerun here. smoke.txt reports zero-byte FRONTDOOR output and replay exit 0. The block includes Git commands, and replay/fixture execution is prohibited this turn; the harness must validate these claims. Committed-diff identity likewise was not independently checked because Git is explicitly forbidden. Graph discovery was attempted but denied by tool approval policy; source reads supplied the fallback.

relay closed (Approved), no further turn needed.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
