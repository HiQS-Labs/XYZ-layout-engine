# RELAY · GH-1 spike dated output folders + HTML QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 4

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
6. **Commit only the relay file** (`relay(gh1-spike-output-folders-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit 6f62527: `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/measurements.json`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/runtime.json`, `tools/spike/output/2026-10-08-xyz-layout-engine-spike/playwright.html`, `tools/spike/REPORT.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md`, `CHANGELOG.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the operator asked that the HTML version of each render be saved and that all output go into sub-folders named yyyy-mm-dd-project-name. Each run writes `tools/spike/output/<local YYYY-MM-DD>-<package.json name>/` holding every PNG, `satori.svg`, both JSON records and the exact HTML Chromium loaded per case. The verifier checks the newest such folder, including HTML digests. The previously approved evidence contract (artwork QA relay `relay-system/2026-10-09/gh1-spike-artwork-qa.md`, Approved) is unchanged apart from paths. Document figures match the new run.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Small follow-up to the approved artwork revision. Operational envelope: local spike scripts; no framework. Receipts (full clone, Node v22.22.3, M1 Max): old flat `tools/spike/output/*` files removed with `git rm`; `node tools/spike/render.mjs` exit 0 → folder `tools/spike/output/2026-10-08-xyz-layout-engine-spike/` (local date); `pnpm run spike:verify` exit 0 PASS, printing `Evidence folder: tools/spike/output/2026-10-08-xyz-layout-engine-spike`; red control — append one space to `override-playwright.html` → `VERDICT: FAIL` / `Basis: override-playwright.html does not match the recorded digest` (restored, PASS); PDDA exit 0, same 3 pre-existing warnings. The plan doc's preflight-contract JSON (lines ~179–258) still lists flat paths: it is the historical dispatch contract and was intentionally left as written.

Questions:
1. Is the run-folder naming correct (local date via `toLocaleDateString('en-CA')`, package name from package.json) and consistent between render and verify? Edge cases: midnight crossing during a run, a stray non-matching folder, multiple dated folders.
2. Is the saved HTML exactly what Chromium loaded (same string passed to `page.setContent`, from the final fitted render), and does the timing boundary stay unchanged?
3. Are HTML records (`cases.*.playwright.html` path/bytes/sha256) complete and bound by the verifier? Can a missing or swapped HTML pass?
4. Do REPORT/PRD/CHANGELOG paths and figures match the new run's JSON (timings, memory, geometry, file sizes), and is the memory-limit change justified?
5. Any leftover reference to the removed flat paths that should have been updated (excluding historical relay logs, briefs and the preflight contract)?
6. Repository weight: each run folder is about 16 MB (three HTML files of 1–5 MB with inline fonts/images). Flag it if this is a problem for the spike, and propose the smallest remedy; do not request one unless warranted.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`; STATUS Approved only if nothing blocking remains.

## Log

### Reviewer · Round 1 (codex)

VERDICT: FAIL
Basis: The seeded run has correct dated paths, saved HTML and measured figures, but the HTML byte-count field is not checked and live evidence references still point to removed flat files. Two Should findings; no observed Blocker. Requested fixes are Easy to reverse and need no new framework or suite.
swept file: yes

Scope: read all of render.mjs, verify.mjs, REPORT.md, SPECS-PRD.md, GH-1-RENDERER-SPIKE.md and CHANGELOG.md; parsed both JSON records and all three saved HTML documents, checking text against the recorded per-id evidence, inline image references, digests and byte counts. The pre-existing code was included in the sweep; no additional material pre-existing defect found beyond the findings below and the already disclosed spike limitations. Graph inventory returned no project for this checkout, so exact source reads were used (Verify intent, source fallback; no graph generation/coverage claim). README.md and the startup roadmap CLI are absent from this seeded tree. No git, renderer, verifier entry point, PDDA or test suite was run, and no artifact was edited.

- **1. [Should] Bind the HTML byte-count record.** `tools/spike/verify.mjs:163–169` checks path, digest and doctype, but never checks `c.html.bytes`, which `render.mjs:403` emits. The actual seeded baseline has 4,935,952 bytes (`output/2026-10-08-xyz-layout-engine-spike/measurements.json:741–744`). Executing only the exact HTML guard extracted from source accepts a cloned record with `bytes=0` or with the field deleted. Fix: assert `c.html.bytes === html.length` alongside the existing digest assertion, so malformed/inconsistent HTML records fail. Extend the existing manual red control; no separate test suite is warranted.
  Observed input: an in-memory clone of `m.cases.baseline.playwright` with `c.html.bytes=0`, or `delete c.html.bytes`, while the seeded HTML and SHA-256 remain unchanged.
  Affected scope: the three `cases.*.playwright.html` records checked by the existing output loop; no Satori HTML requirement.
  Falsifier: each delivered record with its actual byte length must pass; zero, absent or mismatched bytes must fail; missing/swapped HTML must continue failing.
  Probe command below, exit **0**, decisive output: `valid: ACCEPTED`, `bytes=0: ACCEPTED`, `bytes absent: ACCEPTED`, `HTML swapped: REJECTED: playwright.html does not match the recorded digest`, `HTML missing: REJECTED: ENOENT`. This is a narrow guard measurement, not a full verifier run.

```bash
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
node --input-type=module > "$TMPDIR/html-guard-probe.log" <<'JS'
import fs from 'node:fs/promises';
import assert from 'node:assert';
import crypto from 'node:crypto';
const source=await fs.readFile('tools/spike/verify.mjs','utf8');
const code=source.slice(source.indexOf("    if (b === 'playwright') {"),source.indexOf("\n  const svg ="));
const body=code.slice(0,code.lastIndexOf('\n  }'));
const guard=new (Object.getPrototypeOf(async function(){}).constructor)('fs','assert','sha256','out','rel','c','b','file','caseName',body);
const dir='2026-10-08-xyz-layout-engine-spike';
const m=JSON.parse(await fs.readFile(`tools/spike/output/${dir}/measurements.json`));
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const out=f=>`tools/spike/output/${dir}/${f}`;
const rel=f=>`output/${dir}/${f}`;
for(const mode of ['valid','bytes=0','bytes absent','HTML swapped','HTML missing']){
 const c=structuredClone(m.cases.baseline.playwright);
 if(mode==='bytes=0') c.html.bytes=0;
 if(mode==='bytes absent') delete c.html.bytes;
 const io=mode==='HTML swapped'?{readFile:()=>fs.readFile(out('hero-playwright.html'))}:mode==='HTML missing'?{readFile:async()=>{throw new Error('ENOENT')}}:fs;
 try {await guard(io,assert,sha256,out,rel,c,'playwright','playwright.png','baseline'); console.log(mode+': ACCEPTED');}
 catch(e){console.log(mode+': REJECTED: '+e.message);}
}
JS
```

- **2. [Should] Finish the live evidence-path migration.** `REPORT.md:7` still names `tools/spike/output/measurements.json` and `runtime.json`; PRD `:137,140,437,438` still names flat baseline/override/hero PNGs. `render.mjs:477,479,487` emits flat probe paths in observation strings, reproduced in the seeded measurements at `:3627,3652,3711,3745` and elsewhere. These are live evidence references, outside the intentionally frozen preflight and historical briefs/logs. Fix document paths to the delivered dated folder (or explicitly named run-directory-relative filenames); use the existing `rel()` for probe observation/consequence strings and regenerate those JSON records. Keep the frozen historical contract unchanged.
  Observed input: `tools/spike/output/measurements.json`, `runtime.json`, `satori.png`, `playwright.png`, `probe-satori.png` and `probe-playwright.png` are absent; their corresponding dated files exist. Citations above advertise the removed locations.
  Affected scope: current report/PRD evidence pointers and newly emitted measurement prose only; historical relay logs, briefs, changelog history and preflight contract are excluded.
  Falsifier: a retained flat evidence file or an explicit run-directory-relative convention would make that particular pointer valid; otherwise every corrected pointer should resolve to the cited dated artifact.
  Evidence: the read-only summary probe quoted in finding 5 exited **0** and printed `flat <name> exists False` for all six filenames above.

- **3. [Pass] Exact final HTML is saved without moving the timing boundary.** `render.mjs:121–124,153–157` creates `html`, passes that same string to `page.setContent`, and returns it after recording `stageMs`. `fitCase:197–208` retains the final fitting result; `:393–403` saves its HTML and computes path/bytes/digest after the timed render helper. The three seeded documents' text matched their recorded text ids, and all image `src` values were inline data URLs. Keep this mechanism. The new disk writes occur outside warm render timing.

- **4. [Pass] Folder naming and selection meet the bounded local-spike requirement.** `render.mjs:26–31` captures the local date and package name once at module load, so a midnight crossing cannot split one run; same-day overwriting is explicitly documented. `verify.mjs:14–19,141–144` filters directories by the current package suffix, sorts ISO date names and binds `measurements.runDir` to the selected folder. Current package name is `xyz-layout-engine-spike` (`package.json:2`). Probe below exited **0**, printing `local date format: 2026-10-08`, `mixed names select: 2026-10-09-xyz-layout-engine-spike`, `seeded folders: [ '2026-10-08-xyz-layout-engine-spike' ]`. No folder helper/framework requested.

```bash
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
node --input-type=module > "$TMPDIR/folder-probe.log" <<'JS'
import fs from 'node:fs';
const PKG=JSON.parse(fs.readFileSync('package.json')).name;
const names=['notes','2026-10-08-foreign','2026-10-07-'+PKG,'2026-10-09-'+PKG,'2026-10-08-'+PKG];
const selected=names.filter(name=>new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${PKG}$`).test(name)).sort().at(-1);
console.log('local date format:',new Date(2026,9,8,23,59).toLocaleDateString('en-CA'));
console.log('mixed names select:',selected);
console.log('seeded folders:',fs.readdirSync('tools/spike/output'));
JS
```

- **5. [Pass] New run figures agree with the report; the memory increase is appropriately provisional.** `REPORT.md:50–62,103,111–117`, PRD `:444–447` and CHANGELOG `:6–7` agree with the delivered JSON: Satori cold 271.71 ms, warm min/upper median/max 136.79/139.1/140.48; Chromium cold 642.65, warm 267.64/277.6/294.23; Node RSS/heap 499.36/146.93 MiB and 512.11/119.65 MiB. The 98-box geometry median/max are 0.63/3.58 px. HTML bytes are 4,935,952 / 4,936,028 / 1,098,312 and each SHA-256 matches its record. The proposed 1 GiB Satori / 1.5 GiB Chromium limits remain placeholders with isolated Phase 1 measurement required; the shared-process observation does not establish a production minimum. Keep those qualifications. One delivered folder is **17,062,322 bytes (16.27 MiB)** across 14 files; retaining one reviewable spike receipt at that size is warranted, so no compression/removal request. Reconsider retention when recurring runs start accumulating dated evidence. The following read-only probe is also the receipt for finding 2; exit **0**, decisive output is the figures above, `folder bytes/files/maxPNG/SVG 17062322 14 550004 4023437`, and six `flat … exists False` lines.

```bash
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 - > "$TMPDIR/evidence-summary.log" <<'PY'
import json,hashlib,statistics
from pathlib import Path
p=Path('tools/spike'); d=p/'output/2026-10-08-xyz-layout-engine-spike'; m=json.loads((d/'measurements.json').read_text()); r=json.loads((d/'runtime.json').read_text())
for name,per in m['cases'].items():
 c=per['playwright']; h=c['html']; raw=(p/h['path']).read_bytes()
 assert len(raw)==h['bytes'] and hashlib.sha256(raw).hexdigest()==h['sha256']
 print(name,'HTML bytes',len(raw),'sha256 match; fitting',[(b,x['fitting']['fit'],x['fitting']['iterations']) for b,x in per.items()])
for b in ['satori','playwright']:
 w=r[b]['warm']; assert w['median']==sorted(w['samples'])[5]
 print(b,'cold/min/median/max',r[b]['cold']['totalMs'],w['min'],w['median'],w['max'],'rss/heap MiB',*[round(r[b]['memory']['nodeProcess'][k]/2**20,2) for k in ['rss','heapUsed']])
deltas=[max(abs(v[k]-m['cases'][n]['playwright']['bounds'][i][k]) for k in ['x','y','width','height']) for n in ['baseline','override'] for i,v in m['cases'][n]['satori']['bounds'].items()]
print('geometry count/median/max',len(deltas),round(statistics.median(deltas),2),round(max(deltas),2))
print('folder bytes/files/maxPNG/SVG',sum(f.stat().st_size for f in d.iterdir()),len(list(d.iterdir())),max(f.stat().st_size for f in d.glob('*.png')),(d/'satori.svg').stat().st_size)
for name in ['measurements.json','runtime.json','satori.png','playwright.png','probe-satori.png','probe-playwright.png']: print('flat',name,'exists', (p/'output'/name).exists())
PY
```

- **6. [Unverified — needs clone run] Full gate preservation.** The producer's QA brief reports a green full-clone verifier and tampered-HTML red control. I did not rerun those executable entry points here. After the two bounded fixes, run the existing verifier and relevant PDDA check in the disposable full clone; record a byte-count red control and restored green result. The harness gate remains the execution authority.

Handing off to claude-a (Producer) — fix findings 1–2, record clone-run receipts and open round 2; go to the Producer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
