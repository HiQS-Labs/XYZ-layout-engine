# RELAY · GH-5 Phase 4 HTML gate repair and candidate independent QA
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
6. **Commit only the relay file** (`relay(gh-5-phase-4-html-gate-repair-and-candidate-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/profile.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`; recovery receipts under `relay-system/2026-10-09/gh5-phase4-recovery/`
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: Independently review the complete Phase 4 candidate and surgical HTML assertion repair. Validate the exact named HTML artifact contract, four-canary evidence, compact/self-contained export safety, durable edits/save/publication boundaries, unchanged protected fixtures, requested-format behavior, and honest profiling. No artifact writes; only this relay.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

## Current ground truth and bounded review

This is independent recovery QA, NOT a new original Phase 4 fire or phase approval. Original task MARATHON-GH5-P4-TURN remains halted after attempt 3, consuming ONE authorized Codex-builder/Agy-reviewer override. Its builder passed containment and Agy attested be3ddb5561c2aa0b487e54a85b922d0e45a27d96. The native pre-advance gate stopped because old C1 checked artifact[0] MIME; packaged fonts precede the requested render.html. C2 lacked fresh output because C1 stopped before comparison. See codex-override-attempt.log, phase4-candidate-attestation.json and html-artifact-repro.json. No Phase 5 start or native phase.approved event exists.

Smallest repair: existing C1 selects render.html by exact name, requires presence, then retains MIME/doctype assertions. No runtime ordering rewrite, weakened validation, new block/dependency/CI, or ratchet change. Full existing suite outside reviewer flight passed 4/4 in 36.8s, including actual compact/relocated-inline browser loading, both font weights/images and zero network requests; geometry and 12 artifact digests match. See html-repair-verification.log. Do not rerun full suite in the reviewer worktree. Narrow non-mutating or scratch-only probes are welcome.

Review the ENTIRE declared source files, not just the assertion diff. Read ROUTER/AGENTS/GUIDING and canonical GH-5 Phase 4; use exact source fallback if MCP or ledger CLI unavailable. Report real pre-existing defects in these owners. Preserve source fixtures/assets/goldens/receipts; scratch goes under TMPDIR/.relay-scratch only, never root helper/cache files. No git, paid generation, original-task mutation, force, counters, push/merge, or Phase 5 start. The original P4 brief's historical prospective authorization has been consumed; current YAML is HELD.

Check that the 120 before/after samples and performance claims are tied to the final renderer fingerprint and do not imply PNG/provider speedups or browser RSS. Check compact asset references, escaped text/URLs, validated manifest content and last-good atomic publication, saved edit rerender plus failed edit/save preservation, bounded resources and geometry/glyph checks. Current scope remains the local serial CLI; no speculative service/concurrency framework requests. New findings need Observed input, Affected scope, Falsifier and an actual failure for Blocker.

Append ### Round 1 · Reviewer · codex with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no, cited graded findings and exact probe results/limits. Do not claim native advancement or completed marathon. Only independent reviewer may set STATUS: Approved. On approval use env-pinned absolute tick done GH5-P4-HTML-RECOVERY-QA-20261009 --agent codex; otherwise release to coordinator. Explicit closure/handoff. Supervisor commits/attests only this independent QA.


### Round 1 · Reviewer · codex

VERDICT: PASS
Basis: The exact-name HTML assertion repair matches the reproduced contract. Complete declared-file source review, independent narrow export/save/publication probes and retained profiling-data checks found no blocking defect in the supported serial local CLI scope. This approves independent recovery QA only; it does not approve the original native phase, reset its consumed override, start Phase 5 or complete the marathon.
swept file: yes

- [Pass] Swept all nine Setup files in full, including pre-existing code and retained measurement JSON, against canonical GH-5 Phase 4 (PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md:212 and its execution brief). No additional pre-existing blocking defect found in this bounded review. Shared request admission, recipe geometry/assets, ten-attempt/12px fitting, glyph rejection, browser finally cleanup and requested artifact generation remain in their existing owners (tools/request.mjs:7; tools/request.mjs:31; tools/recipes/nutrition.mjs:10; tools/recipes/solar-system.mjs:72; tools/recipes/solar-system.mjs:103; tools/render.mjs:177; tools/render.mjs:195; tools/render.mjs:312). Fix: none; retain these boundaries.
- [Pass] HTML repair retains presence/MIME/doctype assertions and changes only selection semantics (tools/spike/test/canaries.test.mjs:158). Probe A below reproduces first MIME font/ttf with the requested render.html present and correct, no PNG/raster work, 17 owned image/font references, standalone inline distribution and escaped literal data-URL/script-looking label text. Network image admission fails explicitly (tools/render.mjs:68). Fix: none; retain exact-name selection rather than making runtime ordering an API.
- [Pass] Durable edit/rerender, failed publication and invalid save preservation, manifest-owned asset tamper/restoration passed independently in scratch (Probe B). One validated save owner uses exclusive temp/fsync/rename; CLI preflights the target and export boundary before publication, then saves after successful publication (tools/request.mjs:105; tools/render.mjs:449; tools/render.mjs:386; tools/render.mjs:395). This is the documented serial workflow, not a multi-file crash transaction. Fix: none; retain the stated scope and failure ordering.
- [Pass] Retained data has 16 groups/120 samples, five fresh and ten warm for each recipe/format/state, final renderer fingerprint a5b749a255ab10e3e38b7c7ccf80fce9b31f161580cb7ed47eb873ee2614079a matching current tools/render.mjs, equal before/after artifact and text-geometry identities, final SVG raster=0 and transforms=0 (Probe C; tools/MVP-REPORT.md:105). Probe D recomputed stage means/population variances within rounding tolerance. Report explicitly rejects PNG speedup claims and scopes Node lifetime RSS, overlapping encode stages, null browser RSS and zero provider calls (tools/MVP-REPORT.md:73; tools/MVP-REPORT.md:75; tools/MVP-REPORT.md:91; tools/profile.mjs:66; tools/profile.mjs:78). Direct validated supplied assets need no speculative derivative cache. Fix: none; retain these caveats.
- [Pass — receipt review, not a suite rerun] The recovery log reports four executed/passing canaries, zero skips, 216 geometry boxes and 12 byte-identical artifacts in 36.8s (relay-system/2026-10-09/gh5-phase4-recovery/html-repair-verification.log:2, :5, :6, :31, :40). Existing C1 actually loads both compact and relocated inline HTML, checks both Inter weights/all images and records zero network requests (tools/spike/test/canaries.test.mjs:96); C4 checks exported/supplied-asset tamper refusal/restoration (tools/spike/test/canaries.test.mjs:383). Probe D compared 63 protected fixture/budget/asset/golden files with the coordinator candidate, all equal; this checks seeded-candidate preservation, not independent origin ancestry. Fix: none; retain four existing blocks and protected evidence.
- [Unverified — needs clone run] No full suite, executable fixture, validate.sh or PDDA runtime was executed here. Browser loading, golden geometry and the full budget are supported by the supplied recovery receipt and assertion review, not fresh execution by this seat. The harness must run its admitted gate after handoff. No paid calls or native-task mutation occurred. Graph APIs, README.md and both installed releases CLI paths are absent in this seeded worktree; exact source/canonical-plan fallback was used. The discarded instrumented predecessor is represented by retained fingerprint/data and the report's methodology; its scratch source cannot be independently rehashed here. These limits do not change the witnessed repair or grant native advancement.

Probe receipts (all commands from the seeded worktree; scratch-only writes; exit status 0 for A–D). Commands and decisive output are retained here because scratch is discarded.

**A — non-publishing requested-export probe.**
```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node --input-type=module <<'JS'
import { processRequest,toDocument } from './tools/render.mjs';
const op=await processRequest({inputPath:'tools/spike/fixture.json',format:'html,html-inline,svg',edits:[{path:'sections.header.subtitle',value:'data:image/png;base64,Zg== <script>x</script> & "q"'}]});
const page=op.artifacts.find(a=>a.name==='render.html'), inline=op.artifacts.find(a=>a.name==='render-inline.html');
const refs=[...page.bytes.toString().matchAll(/(?:src="|url\()(assets\/[a-f0-9]{64}\.(?:png|svg|ttf))/g)].map(m=>m[1]);
console.log(JSON.stringify({firstMime:op.artifacts[0].mime,page:page.name,mime:page.mime,doctype:page.bytes.toString().startsWith('<!doctype html>'),png:!!op.result.png,rasterMs:op.timings.rasterMs,referenceCount:refs.length,refsOwned:refs.every(n=>op.artifacts.some(a=>a.name===n)),inlineExternal:/assets\//.test(inline.bytes.toString()),literalPreserved:page.bytes.toString().includes('data:image/png;base64,Zg== &lt;script&gt;x&lt;/script&gt; &amp; &quot;q&quot;'),fit:op.request.fitting.fit}));
try {toDocument({type:'img',props:{src:'https://example.com/x.png'}},{regular:Buffer.alloc(0),bold:Buffer.alloc(0)},1,1);console.log('NETWORK ACCEPTED')}catch(e){console.log('network rejected:',e.message)}
JS
```
Output: `{"firstMime":"font/ttf","page":"render.html","mime":"text/html","doctype":true,"png":false,"rasterMs":0,"referenceCount":17,"refsOwned":true,"inlineExternal":false,"literalPreserved":true,"fit":true}`
Output: `network rejected: Validation failed: [{"field":"src","message":"only embedded trusted images are supported"}]`

**B — scratch fixture and publication failure controls.**
```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node --input-type=module <<'JS'
import fs from 'node:fs/promises'; import path from 'node:path'; import assert from 'node:assert/strict'; import crypto from 'node:crypto';
import {runCLI,processRequest,selectedRun,verifyPublication} from './tools/render.mjs';
const root=await fs.mkdtemp(path.join(process.env.TMPDIR,'review-'));
const source=await fs.readFile('tools/spike/fixture.json');await fs.writeFile(path.join(root,'fixture.json'),source);
const good=await runCLI(['fixture.json','--set','sections.header.headline=Fuel for today','--save','fixture.json','--format','svg,html,html-inline','--out','export'],{root});
const saved=await fs.readFile(path.join(root,'fixture.json'));const again=await processRequest({inputPath:'fixture.json',format:'svg'},{root});assert.equal(again.request.digests.svg,good.digests.svg);
const out=path.join(root,'export');const before=await fs.readFile(path.join(out,'manifest.json'));
process.env.RENDER_INJECT_PUBLICATION_FAILURE='1';await assert.rejects(runCLI(['fixture.json','--set','sections.header.headline=Must not save','--save','fixture.json','--format','svg','--out','export'],{root}),/injected late/);delete process.env.RENDER_INJECT_PUBLICATION_FAILURE;
assert.deepEqual(await fs.readFile(path.join(out,'manifest.json')),before);assert.deepEqual(await fs.readFile(path.join(root,'fixture.json')),saved);
await assert.rejects(runCLI(['fixture.json','--save','export/fixture.json','--format','svg','--out','export'],{root}),/outside exported/);assert.deepEqual(await fs.readFile(path.join(out,'manifest.json')),before);
assert.equal((await verifyPublication(out)).valid,true);const dir=selectedRun(out);const manifest=JSON.parse(before);const asset=manifest.files.find(n=>n.startsWith('assets/'));const bytes=await fs.readFile(path.join(dir,asset));await fs.appendFile(path.join(dir,asset),'tamper');await assert.rejects(verifyPublication(out),/recorded digest/);await fs.writeFile(path.join(dir,asset),bytes);assert.equal((await verifyPublication(out)).valid,true);
assert.deepEqual(await fs.readFile('tools/spike/fixture.json'),source);
console.log('PASS saved/rerender SVG identity; failed publication preserves saved fixture and last-good pointer; export-contained save rejected before commit; asset tamper rejected/restoration accepted; source fixture unchanged');
JS
```
Output: `PASS saved/rerender SVG identity; failed publication preserves saved fixture and last-good pointer; export-contained save rejected before commit; asset tamper rejected/restoration accepted; source fixture unchanged`

**C — inspect all retained sample groups and final fingerprint.**
```sh
python3 -B - <<'PY'
import json,pathlib,hashlib
s=pathlib.Path('tools/MVP-REPORT.md').read_text();j=json.loads(s.split('```json')[1].split('```')[0]);g=j['groups'];sha=hashlib.sha256(pathlib.Path('tools/render.mjs').read_bytes()).hexdigest();assert len(g)==16;assert sum(len(x['samples']) for x in g)==120
for x in g:
 assert x['count']==len(x['samples'])==(5 if x['mode']=='fresh' else 10)
 if x['state']=='final': assert x['rendererSha256']==sha
 a=next(y for y in g if y['state']!=x['state'] and (y['recipe'],y['format'],y['mode'])==(x['recipe'],x['format'],x['mode']));assert a['digests']==x['digests'] and a['geometrySha256']==x['geometrySha256']
 if x['state']=='final' and x['format']=='svg':assert x['summary']['rasterMs']['max']==0
 assert x['summary']['derivativeTransformMs']['max']==0
print('PASS 16 groups/120 samples; final fingerprint '+sha+'; before/after artifact and geometry digests equal; final SVG raster=0; derivative transforms=0; browser RSS='+str(j['browserRssBytes'])+'; providerCalls='+str(j['providerCalls']))
PY
```
Output: `PASS 16 groups/120 samples; final fingerprint a5b749a255ab10e3e38b7c7ccf80fce9b31f161580cb7ed47eb873ee2614079a; before/after artifact and geometry digests equal; final SVG raster=0; derivative transforms=0; browser RSS=None; providerCalls=0`

**D — recompute summaries and compare protected candidate files.**
```sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; python3 -B - <<'PY'
from pathlib import Path
import json,hashlib
s=Path('tools/MVP-REPORT.md').read_text();j=json.loads(s.split('```json')[1].split('```')[0]);print('columns',j['columns']);print('runtime',j['runtime'],'versions',j['versions'])
for g in j['groups']:
 for k in j['columns']:
  if not k.endswith('Ms') or k not in g['summary']:continue
  values=[r[j['columns'].index(k)] for r in g['samples']];mean=sum(values)/len(values);var=sum((x-mean)**2 for x in values)/len(values);q=g['summary'][k]
  assert abs(mean-q['mean'])<0.015,(g['state'],g['recipe'],k,'mean')
  assert abs(var-q['variance'])<max(0.03,0.02*(max(values)-min(values))),(g['state'],g['recipe'],k,'variance')
print('PASS sample means/variances agree with retained summaries within 2-decimal rounding')
# Compare protected seeded files with coordinator candidate without accessing git.
a=Path('.');b=Path('/Users/noelsaw/marathon-clones/marathon-gh-5-mvp-foundation');paths=[Path('test-budget.json'),Path('tools/spike/fixture.json'),Path('examples/2026-10-08-solar-system/fixture.json')]
for scope in ['tools/spike/output','tools/spike/assets','examples/2026-10-08-solar-system/assets']:
 paths += [p for p in Path(scope).rglob('*') if p.is_file()]
checked=0;missing=[]
for p in paths:
 if not (b/p).is_file():missing.append(str(p));continue
 assert hashlib.sha256(p.read_bytes()).digest()==hashlib.sha256((b/p).read_bytes()).digest(),str(p)
 checked+=1
print('protected candidate comparison:',checked,'files equal; missing counterparts:',missing)
PY
```
Decisive output: `runtime v22.22.3 darwin-arm64 versions {'satori': '0.36.0', '@resvg/resvg-js': '2.6.2', 'playwright': '1.64.0'}`; `PASS sample means/variances agree with retained summaries within 2-decimal rounding`; `protected candidate comparison: 63 files equal; missing counterparts: []`.

Review outcome: Approved for independent HTML recovery QA. Reversibility: Easy — this turn records evidence only and changes no source/artifact. Relay closed (Approved), no further turn needed; coordinator/supervisor owns the file-scoped commit/attestation and any separately authorized native continuation.


### Attestation · relay-drive — 2026-10-10T05:29:42Z
task: GH5-P4-HTML-RECOVERY-QA-20261009
reviewer: codex
status: Approved
reviewed-head: 403636d5d7461b9485233c094a8b32ecb341877f
added-range: 8693+12869
added-sha256: 7116982aa7cfc6c54a0772350c0da9801fbfa8d015657565090b9153177aeda8
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
