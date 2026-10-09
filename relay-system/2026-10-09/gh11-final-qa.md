# RELAY · GH-11 final QA: RAG diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
6. **Commit only the relay file** (`relay(gh11-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch feat/rag-diagram-example (diff a8e7e57 to HEAD): `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/fixture.json`, `examples/2026-10-09-rag-system/README.md`, `examples/2026-10-09-rag-system/verification.json`, `examples/2026-10-09-rag-system/rag-system.png`, `examples/2026-10-09-rag-system/rag-system-chromium.png`, `examples/2026-10-09-rag-system/rag-system.html`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md`, `relay-system/2026-10-09/gh11-plan-qa.md`. Context: `examples/2026-10-08-solar-system/render-diagram.mjs`, `test-budget.json`, `tools/spike/test/run.mjs`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: issue #11 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/11) is satisfied exactly as the approved plan states (requirements 1-6): second renderer example, RAG ingest and query flows, reuse of the Solar System pinned runtime, hand-authored SVG art, non-vacuous checks with red controls, README, changelog. No engine change, no new test/CI/dependency.

## QA brief (read before reviewing)

This is final QA of a finished, committed change. Operational envelope: a documentation example, one ~200-line .mjs script plus JSON, on one developer machine. Grade against issue #11, the approved plan and commensurate complexity. Do not ask for a test suite, CI, cross-platform goldens, or a shared runtime refactor (GH-5 owns that).

Read the diff and the Setup files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run the renderer, `pnpm test` or PDDA here (the Producer ran them; evidence is in the plan's Evidence table). You may open the PNGs.

Questions:
1. Is each plan requirement 1-6 satisfied by the actual files? Map each to file:line. Does the scene show both flows, the shared store, the original question reaching the augment step, and citations back to sources?
2. Does `render-diagram.mjs` match the plan: guard env set before the awaited dynamic import, sibling Playwright and fonts, `loadSatori()` before render, runtime files unchanged?
3. Are the checks non-vacuous? Required stage ids are hard-coded in the script, expected text ids are listed, geometry is checked in both backends. Can any check pass with zero stages, zero text, or a box outside the canvas in only one backend? Does the `findings` assertion run after the evidence files are written, and is that acceptable?
4. Do the recorded red controls and evidence in the plan and README substantiate the claims? Any claim in README or CHANGELOG not supported by the evidence table?
5. Duplicate subsystem check: does the example duplicate the Solar System render script beyond what is unavoidable (responsive viewer snippet, arrow/star helpers)? Is any shared-runtime or second copy introduced?
6. Does the diff touch `tools/spike/**`, `package.json`, `test-budget.json`, add a test file, workflow or dependency? Any accidental files?
7. The task-clone `pnpm test` failure with a space in the path is recorded as pre-existing (GH-5, `tools/spike/assets.mjs`). Is that claim accurate, and is leaving it unfixed correct under the non-goals?
8. Does the persisted rating (30/10/50/80 in `releases.db`) match the rationale, with appeal neutral?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

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
Basis: Requirements 2–6 and the educational content of requirement 1 are supported by the inspected source and artifacts. One acceptance-document correction remains: requirement 1 promises 2400×1500, but the delivered scene is 2400×1660. Reconcile that adjustment before claiming an exact match to the approved plan; no renderer change, new test, or runtime refactor is requested.
swept file: yes

Read the full target script, fixture, README, plan, prior plan relay and CHANGELOG, plus the Solar System script, ratchet runner and budget. Inspected both PNGs and parsed the entire HTML/verification JSON, including embedded SVGs and viewer code. No additional material pre-existing defect was found in the touched files within this example's scope. Graph tools are unavailable; exact source reads supplied the evidence. Startup README and both repo-local roadmap CLI paths are absent. The issue URL fetch returned “Failed to fetch ...: Cache miss”; conformance uses the supplied Definition of Done and local capture. Review-code discipline applied within the explicit relay-only restrictions.

- [Should] **S1 — Reconcile requirement 1 with the delivered canvas.** PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:35 specifies “2400×1500”, while examples/2026-10-09-rag-system/fixture.json:5–6, README.md:3, verification.json:4–5 and both PNG headers specify 2400×1660. Fix: update the active requirement to the intended 2400×1660 and record the height adjustment/rationale in the implementation evidence. The inspected composition is readable; do not squeeze it into 1500 merely to satisfy stale prose.
  Observed input: both delivered PNG headers are 2400×1660; the literal requirement is 2400×1500. Probe below exited 0 and printed both sizes.
  Affected scope: the GH-11 plan's canvas-size acceptance statement and adjustment record only.
  Falsifier: an existing explicit amendment adopting 2400×1660 would make this request unnecessary; otherwise the requirement and delivered dimensions should agree after correction.
  Bet / reversibility: 1660 is intentional, consistent with the README, changelog and footer beginning at y=1528 (render-diagram.mjs:117). Easy — a documentation correction; leaving 1500 makes later acceptance checks contradict the deliverable.

- [Pass] **Requirement 1 content and requirement 2 artwork.** examples/2026-10-09-rag-system/fixture.json:20–36 names all ten stages, source IDs, original-question bypass and cited answer. render-diagram.mjs:76–88 draws both chains, store interaction and dashed question-to-augment path; :29–43 and :60 compose one hand-authored SVG per stage. Both PNGs visibly carry those elements. The conceptual citation labels meet the agreed scope. Keep this bounded scene.

- [Pass] **Requirement 3 initialization and reuse.** examples/2026-10-09-rag-system/render-diagram.mjs:8 sets the guard before the awaited import at :11; :10, :12 and :15 use sibling runtime/Playwright/fonts; :127 loads Satori before rendering. The pinned module's guard/export is at examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs:547 and :553. The new script calls existing backend helpers; it does not implement another renderer. Small constructors, decorative dust and the viewer resemble the Solar System script (:16, :38, :119 there), but shared-runtime extraction is expressly deferred. Keep the imports; historical byte immutability remains subject to the diff limitation below.

- [Pass] **Requirement 4 non-vacuous checks.** examples/2026-10-09-rag-system/render-diagram.mjs:24–26 fixes the stage set; :49–52 rejects empty/duplicate text; :144–158 checks expected text IDs and finite positive text/icon geometry in both backends; :160–173 covers overlap, Chromium overflow, exact icon IDs/count and both PNG sizes. The isolated source-block probe below rejected zero stages, zero text, missing Chromium title geometry, and title geometry outside either backend's canvas; its recorded-text baseline returned []. This probe omits container/icon loops because Chromium node bounds are not persisted; it is not a fresh renderer run. Keep the existing checks.

- [Pass] **Requirements 5–6, outputs and receipts.** examples/2026-10-09-rag-system/README.md:13–27 and :35–39 document outputs, reproduction, unsaved viewer edits and limits. Three committed output hashes match verification.json:81; both PNGs are 2400×1660 and verification.json:1297 is "findings": []. CHANGELOG.md:5–8 supplies outcome, bet, failure mode, reversibility and verification. README.md:33's three red-control claims match PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:88–90; :96 explains the lengthened-copy substitution. These are Producer receipts, not independently rerun red renders.

- [Pass] **Diagnostic writes before the final assertion are acceptable here.** examples/2026-10-09-rag-system/render-diagram.mjs:175–183 writes artifacts/findings before asserting zero findings; :184 prints PASS only afterward. A failed check can replace local example outputs, but its nonzero exit and saved findings expose the failure. Keep that diagnostic behavior for this regenerable example; no publication subsystem is warranted.

- [Pass] **Space-path diagnosis belongs outside GH-11.** tools/spike/assets.mjs:4 uses URL.pathname and :29 reads the encoded path. PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md:33 and :44 already record and scope that defect. The probe below prints the encoded pathname versus decoded filesystem path. The new example bypasses the asset loader with URL/fileURLToPath reads (render-diagram.mjs:9, :15). Keeping the root asset helper unchanged follows GH-11's non-goal at PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:44. Historical four-test failure/green clone runs at :91–92 remain reported receipts.

- [Nit] **Qualify two small documentation overclaims.** examples/2026-10-09-rag-system/README.md:16 calls the fixture “All copy”, although credit/source copy remains in render-diagram.mjs:120 and :123; “Diagram copy, stages, lane colors and note panels” is accurate. CHANGELOG.md:8 says “no issue tracks one”, but the evidence establishes a local skill inventory and GH-5 boundary, not an exhaustive live issue inventory. Qualify this to “GH-5 does not track a skill” unless an issue-inventory receipt is available. Neither needs a runtime change.

- [Unverified — needs clone run] No renderer, executable fixture, test suite or PDDA gate ran here. Fresh rendering, complete container/icon geometry, restored red controls, guard side effects and reported test/PDDA outcomes remain for the harness/Producer clone gate. No Git command ran and no baseline diff was seeded, so the exact a8e7e57..HEAD inventory, absence of accidental changes and unchanged runtime/package/budget/dependency bytes are not independently certified. The proposed example filenames do not match the ratchet classifier (tools/spike/test/run.mjs:23–30), but that does not replace a diff check. The prescribed releases CLI is absent here, so the persisted rating was not queried; the provisional 30/10/50/80 rationale and neutral appeal are present at PROJECT/1-INBOX/GH-11-RAG-DIAGRAM-EXAMPLE.md:79. Prose ratings are not database readback.

Read-only probe command (exit 0; no renderer import, executable fixture or file writes):

~~~sh
export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
node --input-type=module <<'NODE'
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const p='examples/2026-10-09-rag-system/';
const src=fs.readFileSync(p+'render-diagram.mjs','utf8');
const fixture=JSON.parse(fs.readFileSync(p+'fixture.json'));
const e=JSON.parse(fs.readFileSync(p+'verification.json'));
for(const [f,k] of [['rag-system.png','png'],['rag-system-chromium.png','chromiumPng'],['rag-system.html','html']]){
 const b=fs.readFileSync(p+f);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),e.artifactDigests[k]);
 console.log(f+': hash OK'+(f.endsWith('.png')?' '+b.readUInt32BE(16)+'x'+b.readUInt32BE(20):''));
}
const stagesCheck=new Function('stages','assert',src.slice(src.indexOf('const REQUIRED='),src.indexOf('// Hand-authored')));
stagesCheck(fixture.stages,assert);
try{stagesCheck([],assert);assert.fail('unexpected empty pass')}catch(err){
 assert.match(err.message,/fixture lane ingest/);
 console.log('zero stages: rejected (fixture lane ingest)');
}
const check=new Function('texts','result','chromiumResult','W','H','stages','fixture','container','iconIds','assert',src.slice(src.indexOf('const findings=[];'),src.indexOf('const found='))+';return findings;');
function probe(label,mutate){
 const a={textBoxes:structuredClone(e.satoriBounds),bounds:{}};
 const b={textBoxes:structuredClone(e.chromiumText),bounds:{}},texts=[...e.textIds];
 mutate(a,b,texts);
 try{
  const f=check(texts,a,b,e.width,e.height,fixture.stages,fixture,{},[],assert);
  console.log(label+': '+JSON.stringify(f.map(x=>({id:x.id,backend:x.backend,reason:x.reason}))));
 }catch(err){console.log(label+': '+err.message)}
}
// Isolated text checks; Chromium container/icon bounds are not persisted.
probe('recorded text baseline',()=>{});
probe('zero text',(_a,_b,t)=>{t.length=0});
probe('missing Chromium title',(_a,b)=>{delete b.textBoxes.title});
probe('Satori title off-canvas',a=>{a.textBoxes.title.x=e.width+10});
probe('Chromium title off-canvas',(_a,b)=>{b.textBoxes.title.x=e.width+10});
const u=new URL('file:///tmp/GH%20Repos/tools/spike/assets');
console.log('URL pathname='+u.pathname+'; filesystem path='+fileURLToPath(u));
NODE
~~~

Decisive output:

~~~text
rag-system.png: hash OK 2400x1660
rag-system-chromium.png: hash OK 2400x1660
rag-system.html: hash OK
zero stages: rejected (fixture lane ingest)
recorded text baseline: []
zero text: scene must contain the required text ids
missing Chromium title: [{"id":"title","backend":"chromium","reason":"missing or non-finite text geometry"}]
Satori title off-canvas: [{"id":"title","backend":"satori","reason":"text outside canvas"}]
Chromium title off-canvas: [{"id":"title","backend":"chromium","reason":"text outside canvas"}]
URL pathname=/tmp/GH%20Repos/tools/spike/assets; filesystem path=/tmp/GH Repos/tools/spike/assets
~~~

Handing off to Producer (claude-a) — disposition S1 and the optional documentation nit, reconcile the canvas requirement, then open Round 2. Go to the Producer window and say 'take your turn'.

### Producer · Round 1 → 2 (claude-a)

- **S1 [Should] — Implemented.** Plan requirement 1 now says 2400×1660, and the Evidence section records why the height changed from 1500 (three 250 px card bands plus bypass arrow, footer and sources).
- **Nit (README "All copy") — Implemented.** Now "Diagram copy, ... (credit and source lines live in the script)".
- **Nit (CHANGELOG "no issue tracks one") — Implemented.** Now "GH-5 does not track one"; the plan's matching phrase was softened the same way.
- **[Unverified — rating readback].** Readback from the ledger (`roadmap list`): GH-11 `calc=170`, which is 30+10+50+80. Diff scope: `git diff --stat a8e7e57..HEAD` shows only `examples/2026-10-09-rag-system/**`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-11-*.md`, `relay-system/2026-10-09/gh11-*.md`, `releases.db`, `releases.sql`.
- **[Pass] findings — acknowledged.**

Handing off to codex (Reviewer) for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
