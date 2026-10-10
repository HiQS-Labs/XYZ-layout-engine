# RELAY · GH5 Phase 5 provenance repair QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Producer
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
6. **Commit only the relay file** (`relay(gh5-phase-5-provenance-repair-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: README.md; tools/MVP-REPORT.md (whole file including profiling JSON); examples/2026-10-08-solar-system/README.md; PROJECT/2-WORKING/SPECS-PRD.md; CHANGELOG.md; canonical GH-5 plan and Phase 5 brief; relay-system/2026-10-09/gh5-phase5-recovery/fresh-workflow-commands.json and fresh-workflow-summary.json
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: Independently adjudicate original Phase 5 Round 3 R3 evidence finding and whole-file documentation correctness. Actual retained exact edit/save/readback/selector/hash results must bind current claims; historical receipts remain historical. Approval is recovery QA only, never native phase or final wave completion.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Bounded independent recovery review

Operational envelope: two fixed-canvas, serial local CLI recipes. Documentation-only repair, Easy to reverse; no new code/test/dependency/framework/service requested. The fresh full-clone coordinator replay at b0b47ce used independently installed node_modules and retained all commands/outputs. You are not alone: preserve all artifacts, write only this relay. No paid calls, executable fixtures, suite, installs or browser during this reviewer flight; those results are retained coordinator evidence. Narrow read-only parsing/recomputation under TMPDIR/.relay-scratch is permitted with Python -B.

Questions:
1. Does current nutrition evidence bind the exact saved headline Fuel for today and primary #335577 to SVG 38c3c44daa33df60a07c3a647a4e0c77abe211ca9da2846f4ae293459df5139a, while Solar labelX=830 binds 06f195aea8f3e2bf9ea69efe4ff1b3d5309a8db643ba80f9f50d75d01a04d5fb? Read the actual saved-value, selector/hash outputs and exit codes, not just the summary. Historical TURN-2 unknown nutrition edits and historical changelog are explicitly superseded, not repurposed.
2. Are install/local browser proof limits truthful, compact/inline instructions and manifest current-field retrieval correct, and TypeScript target vs ESM/Python implementation and explicit backend selection accurately described? Inspect source owners only as needed. No source behavior change requested.
3. Does the handoff name owners and exact commands for native pnpm test, final PDDA, latest-origin integration, independent Wave 1 QA and pre-PR gate, without claiming them passed? Human acceptance and GH5 Later remain pending.
4. Are the prior R1/R2/R4/R5 resolutions preserved and all five entire documentation artifacts consistent, without disturbing the retained 120 profiling samples/fingerprint? Cite concrete contradictions if any; no speculative scope expansion.

Append native Reviewer block with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no, graded findings with file:line citations and observed-input/scope/falsifier for Should/Blocker. Review outcome: recovery-only Approved or concrete changes requested. Only independent reviewer sets first STATUS: Approved. Native tick done GH5-P5-PROVENANCE-RECOVERY-QA-20261009 --agent codex on approval; otherwise release to coordinator. No git commands inside turn; supervisor commits/attests your receipt. Explicit terminal handoff.

## Log

### Reviewer · Round 1 · codex

VERDICT: PASS
Basis: Independently adjudicated original Phase 5 Round 3 R3 against retained commands, exits, saved-value readbacks, manifest selectors and hashes, then swept all five documentation artifacts in full (including the profiling JSON), canonical GH-5 plan and Phase 5 brief. Current evidence binds the displayed edits; historical receipts are explicitly superseded rather than relabelled. No additional material pre-existing documentation defect found in this bounded sweep.
swept file: yes
Review outcome: Approved for provenance recovery QA only. This does not approve the stopped native Phase 5 lane, complete Wave 1, authorize a PR, or satisfy human/provider acceptance.
Bet / reversibility: Easy. Accept retained coordinator measurements as attributed evidence, with independent parsing and source-fingerprint checks; tradeoff is no new render/browser/suite execution in this reviewer sandbox. Failure mode would be a receipt naming a different edit, selector or source revision; those bindings were checked. No source or artifact changes requested.

- [Pass] **R3 resolved — exact edits bind corrected hashes.** `tools/MVP-REPORT.md:62`, :65, :67, :68 and :150–153 agree with `PROJECT/2-WORKING/SPECS-PRD.md:499`, :500 and `CHANGELOG.md:4`. Actual retained commands at `relay-system/2026-10-09/gh5-phase5-recovery/fresh-workflow-commands.json:51`, :57, :69 and :75 each exit 0. Readback/hash command at :87–89 reports `nutrition saved {'headline': 'Fuel for today', 'primary': '#335577'}` and `solar saved {'labelX': 830}`; selected export/rerender hashes are respectively `38c3c44daa33df60a07c3a647a4e0c77abe211ca9da2846f4ae293459df5139a` and `06f195aea8f3e2bf9ea69efe4ff1b3d5309a8db643ba80f9f50d75d01a04d5fb`, with both `identical True`. Report :152 explicitly names the unknown historical TURN-2 nutrition edits; changelog :4 explicitly supersedes its old evidence claim. No change needed.
- [Pass] **Fresh install/browser proof has honest limits.** Retained frozen-lockfile installation at commands JSON :27–29 exits 0; browser command/output at :93–95 uses HTTP(S) abort routing and checks compact plus relocated standalone files for both recipes. It reports four exports, 15 loaded images each, Inter weights 400/700 loaded, and `HTTP(S) attempted requests: 0`. `tools/MVP-REPORT.md:73` and PRD :502 distinguish installation bootstrap and local browser proof from OS network isolation. These are coordinator receipts, not browser execution by this reviewer. No change needed.
- [Pass] **R1/R2/R4/R5 remain resolved.** Root README :16–40 supplies mkdir/copy/edit/save/rerender and resolves manifest `current`; :46–57 describes SVG with raster, explicit backends/fixed canvases and absent hard interruption. Report :139–145 and PRD :503–509 distinguish source-configured caps, PARKED diagnostics/deadlines/RSS/concurrency and Later services. README :62–75 supplies caller/manifest/defaults, scratch dry-run, measured pins and notices; all three notice links resolve. Source checks at `tools/request.mjs:69`, :75, `tools/render.mjs:35`, :429–459 and generator :114–118, :320–341 support those boundaries. PRD :436 and :449 keep accepted historical GH-1 artwork separate from pending migrated acceptance. The PRD's proposed TypeScript product is explicitly a greenfield specification (:161); README :3 identifies delivered ESM/Python. No change needed.
- [Pass] **Profiling retained and internally consistent.** `tools/MVP-REPORT.md:77–113` retains 16 groups / 120 samples. Read-only recomputation checks row widths, counts, rounded stored means, before/after artifact and geometry equality, final renderer fingerprint and zero final SVG raster samples. Fenced JSON SHA-256 is `5406c91e27b27d265c58f8bca3ade2f3f3f0423be4bcb77ab558dffe729e8d65`; current renderer SHA-256 is `a5b749a255ab10e3e38b7c7ccf80fce9b31f161580cb7ed47eb873ee2614079a`, matching final groups and retained source readback. This is consistency checking, not performance replay or a historical byte-comparison claim. No change needed.
- [Pass] **Remaining gates stay with named owners.** `tools/MVP-REPORT.md:155–160` assigns native `pnpm test` to the driver and final `utils/pdda/pdda.sh run`, latest-origin integration, independent Wave 1 review and root-bound `marathon-qa --pre-pr --wave 1 --doc ...` to the coordinator; canonical plan status and Phase 5 checklists remain pending. Human acceptance and GH-5 Later remain pending. No change needed; coordinator must execute and retain those gates before advancing their acceptance state.

Probe evidence (scratch is disposable; decisive output retained here): command `python3 -B .relay-scratch/tmp/recovery-evidence.py`, final exit 0, output `source fingerprint readbacks match current files`, `browser retained receipt: four exports, 15 loaded images each, Inter 400/700, HTTP(S) attempted requests: 0`, and `profiling: 16 groups 120 samples; counts/widths/means/digest/geometry/final renderer match; final SVG raster zero`, plus the hashes/readbacks above. The first probe exited 1 on a probe-only `KeyError: 'peakNodeRssBytes'` because the stored summary omits that column; checking only recorded summary keys corrected the probe. This was not an artifact failure. The core receipt/profile binding is reproducible with this read-only command:

```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 -B - <<'PROBE'
from pathlib import Path
import json, hashlib
rows=json.loads(Path('relay-system/2026-10-09/gh5-phase5-recovery/fresh-workflow-commands.json').read_text())
assert len(rows)==18 and all(r['exit']==0 for r in rows)
for a,b in [(8,9),(11,12)]:
    x,y=(json.loads(rows[i]['stdout']) for i in (a,b))
    assert x['digests']['svg']==y['digests']['svg']
    for o in (x,y):
        m=o['publication']['manifest']
        assert m['digests']['render.svg']==o['digests']['svg']
        assert o['publication']['directory']==o['publication']['root']+'/'+m['current']
    print('matching edit/rerender',a,b,x['digests']['svg'])
print(rows[14]['stdout']); print(rows[15]['stdout'])
for line in rows[14]['stdout'].splitlines():
    if line.startswith('source '):
        _,f,digest=line.split()
        assert hashlib.sha256(Path(f).read_bytes()).hexdigest()==digest
raw=Path('tools/MVP-REPORT.md').read_text().split('```json\n')[1].split('\n```')[0]
p=json.loads(raw)
assert len(p['groups'])==16 and sum(g['count'] for g in p['groups'])==120
for g in p['groups']:
    assert len(g['samples'])==g['count']
    assert all(len(s)==len(p['columns']) for s in g['samples'])
print('profile groups 16 samples 120; JSON SHA256',hashlib.sha256(raw.encode()).hexdigest())
PROBE
```

Startup router/principles/AGENTS/README and canonical Phase 5 were read. Graph tools are absent from the exposed tool inventory, so exact source reads were used; no graph completeness claim. The startup releases CLI read attempt failed because `.xyz/utils/py/releases_app.py` is absent; no ledger change. No git command, suite, validate.sh, pytest, executable fixture, installation, browser or paid call ran in this turn. Only this relay and permitted scratch were written. Native/final gate execution remains pending with driver/coordinator, not silently satisfied by this review.

Relay closed (Approved), no further reviewer turn needed. Coordinator owns native continuation and the remaining integration/acceptance gates.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
