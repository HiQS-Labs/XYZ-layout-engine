# RELAY · GH-63 final QA: vibe-coding loop example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-17.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh63-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `examples/2026-10-17-vibe-coding-loop/README.md` and the rest of the committed
  implementation on this branch versus main at 6facd4c (diff with git diff 6facd4c..HEAD):
  examples/2026-10-17-vibe-coding-loop/** (render script, fixture, DESIGN.md, ASSETS.md, README,
  artwork.json, provenance.json, receipts, assets/web PNGs, outputs, verification.json), `CHANGELOG.md`
  (top entry), and the plan + acceptance map + evidence in `PROJECT/2-WORKING/GH-63-VIBE-CODING-LOOP.md`.
  Plan QA thread (approved): `relay-system/2026-10-17/gh63-plan-qa.md`. View the PNGs directly
  (`examples/2026-10-17-vibe-coding-loop/vibe-coding-loop.png`, `examples/2026-10-17-vibe-coding-loop/vibe-coding-loop-chromium.png`) for the visual checks.
- Operational envelope: a documentation example in a public repo, rendered locally by one developer.
  Grade against the plan's requirements 1–7 and acceptance checks and commensurate complexity. Do not ask
  for recipes, catalog entries, new tests or engine machinery the approved plan scoped out.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-17
- Definition of Done: every requirement 1–7 is met by the committed files; the evidence table's claims
  match what the files and outputs show; no pinned file (`tools/render.mjs`, `tools/request.mjs`, recipe
  modules) or `test-budget.json` changed; no personal or machine path leaked into committed files.

### Questions for the Reviewer
1. Does `render-diagram.mjs` keep one geometry owner, reuse the shared `renderSatori` / `renderPlaywright`
   and `readPinnedPngs` without a second render path, and are its AS-12 checks computed from real values
   (sizes collected from every text node, title width from the Satori text box, cap height from the font's
   OS/2 table)? Any check that cannot fail?
2. AS-11: is the two-ellipse ground shadow (contact under the visible base, cast lower-left from one
   upper-right light) correctly placed from each asset's `visibleBox`? Are the `visibleBox` values in
   `fixture.json` plausible for the committed `assets/web` PNGs?
3. Provenance: do `provenance.json`, `ASSETS.md` and the receipts agree (hashes, bytes, alpha), and are the
   receipts free of home-directory or scratch paths? Does `readPinnedPngs` actually gate the cutouts?
4. Content parity (requirement 7) and visual quality: compare the PNGs with the checklist. Any connector
   crossing a card, cutout or label? Any AS-1..AS-12 claim in the README that the PNGs contradict? Is the
   phone-readability statement honest?
5. Is the headline change from the planned 8% to 9% of S justified and recorded?
6. Diff hygiene: any accidental files (`.relay-scratch`, `.xyz`, `.claude`, node_modules), stray outputs,
   or changes outside the stated scope?
7. Flag anything over- or under-engineered. Cite `file:line`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log


### Reviewer · Round 1

swept file: yes

VERDICT: PASS
Basis: Approve the seeded implementation against requirements 1–7 within the authorized review envelope. Read the entire render script, fixture, brief, README, artwork/provenance/receipts, verification record, plan/acceptance/evidence and GH-63 changelog entry; inspected both PNGs directly. No blocking or should-fix defect found, including in the existing portions of the scoped files. Reversibility: Easy (relay verdict only). No artifact or source edited; executable fixtures and suites were not run.

All example-relative citations below are under `examples/2026-10-17-vibe-coding-loop/`.

- [Pass] **One geometry owner and shared render path (Q1/Q7).** `render-diagram.mjs:33–42,87–135` owns placement and scene construction; `:11–13,44,137–145` imports and invokes the shared backends and pinned-artwork reader. Shared implementations at `tools/render.mjs:27–65,142–177` perform actual Satori/resvg and browser rendering/measurement; `tools/request.mjs:52–69` performs containment, bounded PNG validation and digest enforcement. This is an appropriately small one-off example, with no new runtime abstraction needed.
- [Pass] **AS-12 uses actual scene/font measurements (Q1/Q5).** Every text leaf passes through `T`, collecting its applied size (`render-diagram.mjs:68–82`); title width comes from the Satori result, cap height from the bold TTF's OS/2 and head tables, and graphic dimensions from the fitted visible boxes (`:26–31,59–64,149–164`). Checks compare those values rather than fixed pass flags. Independent font probe below gives `cap height 75.6; 170/cap 2.25`. Four applied sizes are 108/36/29/23; 108/23 = 4.70. `DESIGN.md` → Typography and the plan → Visual direction explicitly justify 8% → 9% to reach 55.3% canvas width. Dynamic failure behavior beyond the pin probe remains clone-run evidence, not witnessed here.
- [Pass] **AS-11 placement and visible boxes (Q2).** `render-diagram.mjs:50–64` places contact at the visible base and casts lower-left from the common upper-right light. Independent decoded-alpha measurements match all five fixture boxes exactly using inclusive pixel maxima (probe below); all corner alpha values are zero. Initial exploratory probe used exclusive maxima and exited 1; correcting that probe's coordinate convention produced the exact matches below. The subpixel rounding in placement is immaterial at this scale. Both PNGs show grounded cutouts, without silhouette shadows.
- [Pass] **Provenance and real pin gate (Q3).** `ASSETS.md:15–31`, `provenance.json` asset source/display records, and each `receipts/<id>.result.json:1` agree on source bytes/hash, generation fields and alpha; all five prompt strings equal subject + shared style. Independent display hashes/bytes and transparent ratios match. Five receipts each record one successful attempt; this corroborates the documented five accepted calls, rather than proving account-wide billing history. Original 1024px files are explicitly not retained (`ASSETS.md:20`), so their bytes cannot be independently rehashed. The scratch-only pin probe below accepts original/restored idea bytes and rejects a valid replacement specifically with `display digest mismatch`.
- [Pass] **Content parity and visual report (Q4).** `fixture.json:4–28` supplies the required header, actors, four stages, exit, three labels and disclosure; `render-diagram.mjs:107–116` implements all five directed connectors. Both delivered PNGs show that content and no connector crossing a card, cutout or label. The largest visual weight belongs to the loop/title, the legend fills the spare upper-right region, and no unexplained glow, surface gradient or ornament appears. Full-size inspection and independent Satori 533px / Chromium 400px thumbnails support `README.md:87–93`: headline, stage titles and loop remain readable; captions/legend/footer need zoom. Three hierarchy tiers survive. No claim of fully readable phone captions is made.
- [Pass] **Delivered output integrity and local hygiene (Q6).** `verification.json` → artifactDigests matches the actual three output files; both PNG headers are 1600×1200. The example inventory contains only its documented script/data/docs/receipts, five web PNGs and four outputs. A full text scan of that folder found no machine paths (command/output below); receipts use sanitized relative `scratch/<id>-1.png` placeholders, not original workstation paths.
- [Unverified — needs clone run] **Replay, red controls, gates and branch-wide diff hygiene.** Plan → Evidence reports dual-backend PASS, identical repeated digests, containment/body-floor controls, restored PASS, catalog/PDDA and 4/4 canaries at `8608e6e`. Those are producer attestations; neither full renders nor executable fixtures/suites were run here. Per the operator's no-git constraint, no base-to-head diff was obtained, so absence of pinned-file/test-budget changes and unrelated branch additions is reserved for the harness gate. This review does not substitute for that gate or independently assert those historical runs.

Evidence limits: no graph tools (list_projects/index_status/search_graph/coverage) are callable in this turn's available tool inventory; code claims use direct source reads, not graph completeness. No remote issue reread was needed: the approved plan and requirement-7 parity checklist are the supplied acceptance authority. Startup ledger lookup and general PDDA run were not used to expand this file-only turn.

Probe A — read-only bytes/JSON/font/PNG measurements, exit 0. Exact command:
```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
python3 -B - <<'PY'
from pathlib import Path
import json,hashlib,struct,zlib
r=Path('examples/2026-10-17-vibe-coding-loop')
p=json.loads((r/'provenance.json').read_text());v=json.loads((r/'verification.json').read_text())
f=json.loads((r/'fixture.json').read_text());s=json.loads((r/'artwork.json').read_text())
for k,n in [('png','vibe-coding-loop.png'),('chromiumPng','vibe-coding-loop-chromium.png'),('html','vibe-coding-loop.html')]:
 b=(r/n).read_bytes();assert hashlib.sha256(b).hexdigest()==v['artifactDigests'][k]
 if k!='html':assert struct.unpack('>II',b[16:24])==(1600,1200)
print('artifact pins 3/3; both PNGs 1600x1200')
for aid,a in p['assets'].items():
 b=(r/a['display']['path']).read_bytes()
 assert len(b)==a['display']['bytes'] and hashlib.sha256(b).hexdigest()==a['display']['sha256']
 q=json.loads((r/'receipts'/f'{aid}.result.json').read_text())
 assert q['status']=='success' and len(q['attempts'])==1
 assert all(q[k]==a[k] for k in ('model','endpoint','size','quality','background','recipeRef','referenceCount','alpha'))
 assert all(q['image'][k]==a['source'][k] for k in ('bytes','sha256'))
 assert a['prompt']==next(x['subject'] for x in s['assets'] if x['id']==aid)+' '+s['sharedStyle']
 w,h,depth,color=struct.unpack('>IIBB',b[16:26]);assert (w,h,depth,color)==(512,512,8,6)
 chunks=[];pos=8
 while pos<len(b):
  n=struct.unpack('>I',b[pos:pos+4])[0]
  if b[pos+4:pos+8]==b'IDAT':chunks.append(b[pos+8:pos+8+n])
  pos+=12+n
 raw=zlib.decompress(b''.join(chunks));prev=bytearray(w*4);alpha=[]
 for y in range(h):
  off=y*(w*4+1);fil=raw[off];row=bytearray(raw[off+1:off+1+w*4])
  for i in range(w*4):
   l=row[i-4] if i>=4 else 0;u=prev[i];ul=prev[i-4] if i>=4 else 0
   if fil==1:pred=l
   elif fil==2:pred=u
   elif fil==3:pred=(l+u)//2
   elif fil==4:
    z=l+u-ul;aa=abs(z-l);bb=abs(z-u);cc=abs(z-ul);pred=l if aa<=bb and aa<=cc else u if bb<=cc else ul
   else:assert fil==0;pred=0
   row[i]=(row[i]+pred)%256
  alpha.extend(row[3::4]);prev=row
 coords=[(i%w,i//w) for i,z in enumerate(alpha) if z>40]
 bbox=(min(x for x,y in coords),min(y for x,y in coords),max(x for x,y in coords),max(y for x,y in coords))
 assert bbox==tuple(f['assets'][aid]['visibleBox'][k] for k in ('x0','y0','x1','y1'))
 assert [alpha[i] for i in (0,w-1,(h-1)*w,w*h-1)]==[0]*4
 assert sum(z==0 for z in alpha)/(w*h)==a['display']['alpha']['transparentPixelRatio']
 print(aid,'pins/receipt/prompt/alpha agree; inclusive bbox',bbox)
for x in r.rglob('*'):
 if x.is_file() and x.suffix in ('.md','.json','.mjs','.html'):
  text=x.read_text();assert all(t not in text for t in ('/Users/','/private/var/','/tmp/'))
print('example text: no machine paths')
b=Path('tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf').read_bytes()
t={b[12+i*16:16+i*16].decode():struct.unpack('>I',b[20+i*16:24+i*16])[0] for i in range(struct.unpack('>H',b[4:6])[0])}
cap=struct.unpack('>h',b[t['OS/2']+88:t['OS/2']+90])[0]/struct.unpack('>H',b[t['head']+18:t['head']+20])[0]*108
assert cap==75.6
print('cap height 75.6; 170/cap',round(170/cap,2))
PY
```
Decisive output:
```text
artifact pins 3/3; both PNGs 1600x1200
idea pins/receipt/prompt/alpha agree; inclusive bbox (102, 35, 414, 488)
code pins/receipt/prompt/alpha agree; inclusive bbox (65, 65, 491, 456)
live pins/receipt/prompt/alpha agree; inclusive bbox (66, 35, 454, 485)
refine pins/receipt/prompt/alpha agree; inclusive bbox (88, 50, 406, 456)
ship pins/receipt/prompt/alpha agree; inclusive bbox (127, 15, 385, 496)
example text: no machine paths
cap height 75.6; 170/cap 2.25
```

Probe B — shared reader against scratch copies only, exit 0. Exact command:
```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
node --input-type=module <<'JS'
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readPinnedPngs} from './tools/request.mjs';
const src='examples/2026-10-17-vibe-coding-loop/';
const base=await fs.mkdtemp(path.join(process.env.TMPDIR,'gh63-pin-'));
await fs.mkdir(path.join(base,'assets/web'),{recursive:true});
await fs.copyFile(src+'provenance.json',path.join(base,'provenance.json'));
const target=path.join(base,'assets/web/idea.png');
for(const [label,name] of [['original','idea'],['replacement','code'],['restored','idea']]) {
 await fs.copyFile(src+'assets/web/'+name+'.png',target);
 if(label==='replacement') await assert.rejects(readPinnedPngs(pathToFileURL(base+'/'),'provenance.json',['idea']),e=>{console.log(label+': '+e.message);return e.message.includes('display digest mismatch')});
 else {await readPinnedPngs(pathToFileURL(base+'/'),'provenance.json',['idea']);console.log(label+': accepted')}
}
JS
```
Decisive output:
```text
original: accepted
replacement: Validation failed: [{"field":"asset.idea","message":"display digest mismatch"}]
restored: accepted
```

Thumbnail inspection commands (each exit 0; resulting images viewed directly):
```sh
sips -Z 533 examples/2026-10-17-vibe-coding-loop/vibe-coding-loop.png --out .relay-scratch/tmp/vibe-satori-533.png
sips -Z 400 examples/2026-10-17-vibe-coding-loop/vibe-coding-loop-chromium.png --out .relay-scratch/tmp/vibe-chromium-400.png
```
Decisive output: each command reported its requested scratch PNG output; the viewed images were 533×400 and 400×300 respectively.

Relay closed (Approved), no further turn needed. Producer (claude-a) receives the closed review; the harness owns the file-scoped commit and clone gate.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
