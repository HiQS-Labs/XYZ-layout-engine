# RELAY · GH28 MangaJDM final implementation QA
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
6. **Commit only the relay file** (`relay(gh28-final): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/gh28-final-packet.md** — the read-only path that
  `relay-drive.sh --artifact-file relay-system/2026-10-11/gh28-final-packet.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-11
- Definition of Done: GH28 canonical plan and final packet; three usable portrait examples, trusted recipe integration, CLI-only catalog/design pins, actual local/regression evidence and commensurate full touched-file sweep.

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
Basis: Three usable posts, trusted integration and current artifact integrity pass independent narrow checks. One task-owned stale RELEASES document pointer needs correction before approval. No runtime/source changes requested.
swept file: yes

- [Should] S1 — Repoint GH-28's canonical RELEASES `doc_path`. `releases.sql:45` stores `PROJECT/1-INBOX/GH-28-MANGAJDM-PROMOS.md`, which does not exist; its `raw_text` already links the working plan. The current CLI independently returns that stale structured path. Structured ledger consumers therefore cannot open the active plan. Smallest fix: use the canonical RELEASES CLI `roadmap repoint --issue-num 28 --doc-path PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md`, then read back the row and check the ledger. Do not hand-edit SQL or recreate an inbox duplicate. Reversibility: Easy.
  Observed input: GH-28 row, `doc_path=PROJECT/1-INBOX/GH-28-MANGAJDM-PROMOS.md`; filesystem lookup is false while the working plan exists.
  Affected scope: This GH-28 row's document pointer only; retain ratings, section, other rows and completed receipts.
  Falsifier: If CLI readback returns `PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md` and that path exists, S1 is resolved; a real canonical inbox plan would also overturn the missing-target observation, but the current canonical plan is the working document.
  Probe command (exit 0): `PYTHONDONTWRITEBYTECODE=1 python3 -B /Users/noelsaw/marathon-clones/mangajdm-portrait-promos-20261011/.xyz/utils/py/releases_app.py --root "$PWD" roadmap list --json > "$PWD/.relay-scratch/tmp/roadmap.json"`; subsequent Python JSON/filesystem query below also exited 0:
  ```python
  import json, os
  rows = json.load(open(os.environ['TMPDIR'] + '/roadmap.json'))
  r = next(r for r in rows if str(r['gh_number']) == '28')
  print(json.dumps({k: r[k] for k in ['gh_number', 'doc_path', 'raw_text']}))
  print('doc_path_exists=' + str(os.path.isfile(r['doc_path'])))
  print('working_plan_exists=' + str(os.path.isfile('PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md')))
  ```
  Decisive output: `"doc_path": "PROJECT/1-INBOX/GH-28-MANGAJDM-PROMOS.md"`, `doc_path_exists=False`, `working_plan_exists=True`.
- [Pass] Complete source sweep: read all of `tools/request.mjs`, `tools/render.mjs`, `tools/catalog.mjs` and `tools/recipes/mangajdm-promo.mjs`, including pre-existing admission, fitting, save, publication, literal SQL parsing, locking and recovery code. No additional material pre-existing defect found in these four files for the bounded local trusted workflow. Explicit admissions (`tools/request.mjs:59`, `tools/request.mjs:110`, `tools/render.mjs:183`), fixed content set (`tools/catalog.mjs:135`) and bounded/digest-checked art (`tools/recipes/mangajdm-promo.mjs:24`) reuse existing owners. No graph tools were callable in this reviewer session; this is full exact-source fallback, not graph completeness evidence. Retain the disclosed two-file catalog/log recovery limitation (`tools/catalog.mjs:348`, `README.md:117`); no speculative infrastructure requested.
- [Pass] Independently viewed all three final PNGs: clear English headline/deck/CTA/domain, retained R34 silhouette, complete four-car Integra lineup and full supplied shirt print. Citation: `examples/2026-10-11-mangajdm-promos/01-icon.png`, `02-eras.png`, `03-wear.png`; composition is owned by `tools/recipes/mangajdm-promo.mjs:45`. Captions/alt text and concept disclosure are present (`examples/2026-10-11-mangajdm-promos/EDITORIAL.md:43`, `:49`, `:53`); gallery links/alt text are in `index.html:5`. No independent outside source-folder or browser visual review claimed.
- [Pass] Independent narrow in-memory renders and publication checks reproduced all three committed PNG/SVG bytes, eight fitting text nodes per post, design pins/hashes and confined static HTML references. See exact command and decisive output below. Publication verification uses `tools/render.mjs:458`; render guards are at `:246`. The committed `exports/<post>/manifest.json` selects the compared immutable run. Static HTML checks establish local references and existing bundled files; dynamic relocated image/font loading and both-backend browser geometry remain author evidence (`VERIFICATION.md:9`, `verification.json`).
- [Pass] Independent read-only catalog probes: `node tools/catalog.mjs verify --json` exited 0, output `{"valid":true,"errors":[]}`; `node tools/catalog.mjs export --check` exited 0, output `{"canonical":true}`. The three design readbacks match fixture/PNG hashes and `mangajdm-promo@1.0.0` in the probe below; log rows `tools/design-log.jsonl:4` through `:6` retain honest null grammar metrics. Historical base-row/log preservation and source-file hash preservation are author receipts, not independent ancestry/source-library assertions (`verification.json` catalog/source fields).
- [Unverified — needs clone run] Full canaries, PDDA and fresh install were not rerun under the reviewer containment rules. Author canary receipt explicitly reports 4 pass/0 fail/31.9s (`relay-system/2026-10-11/gh28-verification/canaries.log:34`); PDDA receipt closes with no errors/two warnings. Asset-digest tamper, saved-copy edit, duplicate insertion and relocated browser controls are reported in `VERIFICATION.md:10` and `manual.log`; independent reviewer controls below cover invalid art, canvas and injected theme. The harness owns post-turn gates. Ready PR and final receipt reconciliation remain pending as the plan states (`PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md`, final Phase 2 checklist).

Independent probe command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"; node --input-type=module <<'JS'` with this stdin (exit 0; no publication or source writes):
```javascript
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyPublication,selectedRun,processRequest} from './tools/render.mjs';
import {runCLI} from './tools/catalog.mjs';
const base='examples/2026-10-11-mangajdm-promos';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [key,id] of [['01-icon','icon'],['02-eras','eras'],['03-wear','wear']]) {
 const root=`${base}/exports/${key}`, selected=selectedRun(root);
 const pub=await verifyPublication(root);
 for(const ext of ['png','svg']) assert.equal(sha(await fs.readFile(`${base}/${key}.${ext}`)),sha(await fs.readFile(`${selected}/render.${ext}`)));
 const op=await processRequest({inputPath:`${base}/${key}.fixture.json`,format:'png,svg'});
 for(const a of op.artifacts) assert.equal(a.sha256,sha(await fs.readFile(`${selected}/${a.name}`)));
 assert.equal(op.request.catalog.verified,true);
 for(const b of Object.values(op.result.textBoxes)) assert.equal(b.overflow,false);
 const {value:d}=await runCLI(['design','show',`2026-10-11-mangajdm-${id}`]);
 assert.equal(d.use_case,'mangajdm-promo');assert.equal(d.use_case_version,'1.0.0');
 assert.equal(d.data_hash,sha(await fs.readFile(d.fixture_path)));assert.equal(d.artifact_digest,sha(await fs.readFile(d.artifact_path)));
 for(const f of ['render.html','render-inline.html']) {
  const html=await fs.readFile(`${selected}/${f}`,'utf8');
  assert.equal((html.match(/<img /g)||[]).length,3);
  assert(!/(?:src=["']https?:|url\(["']?https?:)/.test(html));
  for(const m of html.matchAll(/(?:src="|url\()(assets\/[a-f0-9]{64}\.(?:png|svg|ttf))/g)) assert((await fs.stat(path.join(selected,m[1]))).size>0);
 }
 console.log(`${key}: publication ${pub.valid}, stable/fresh PNG+SVG bytes identical, 8 texts fit, design pin/hashes match, compact+inline refs local`);
}
for(const [name,req] of [
 ['art selector',{edits:[{path:'art',value:'../../escape'}]}],
 ['canvas',{width:1000}],
 ['theme injection',{edits:[{path:'theme.ink',value:'red; background:url(https://example.com)'}]}]
]) {
 await assert.rejects(()=>processRequest({inputPath:`${base}/01-icon.fixture.json`,format:'svg',...req}),/Validation failed/);
 console.log(`negative ${name}: refused`);
}
```
```text
01-icon: publication true, stable/fresh PNG+SVG bytes identical, 8 texts fit, design pin/hashes match, compact+inline refs local
02-eras: publication true, stable/fresh PNG+SVG bytes identical, 8 texts fit, design pin/hashes match, compact+inline refs local
03-wear: publication true, stable/fresh PNG+SVG bytes identical, 8 texts fit, design pin/hashes match, compact+inline refs local
negative art selector: refused
negative canvas: refused
negative theme injection: refused
```

Handing off to Producer (author) — fix S1 with the canonical CLI, reconcile affected evidence, and open Round 2; go to the Producer window and say 'take your turn'.

### Producer · Round 1 · author

S1 Implemented — canonical RELEASES `roadmap repoint` corrected GH28's structured doc_path to `PROJECT/2-WORKING/GH-28-MANGAJDM-PROMOS.md`. Actual CLI row readback resolves the existing plan and retains issue/title/ratings/section; CLI check clean at generation52/56receipts. Receipt: `relay-system/2026-10-11/gh28-verification/ledger-repoint.json`. No direct SQL/DB edit, duplicate intake or runtime change. Plan/evidence reconciled; PDDA repeated with no errors/two unchanged governance warnings. Original canary/render/catalog checks remain applicable because those bytes are unchanged.

Round2 opened. Handing off to Reviewer (codex) — verify S1 and the evidence reconciliation, then deliver the final verdict.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
