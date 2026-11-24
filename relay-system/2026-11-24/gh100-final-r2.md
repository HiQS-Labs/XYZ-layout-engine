# RELAY · GH-100 final-r2 QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-24.
-->

NEXT: Producer
STATUS: Open
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
     change MUST carry `Observed input:`, `Affected scope:` (the input predicate the change would govern),
     and `Falsifier:` (the fixture or data that would show the change unnecessary or wrong, and its expected
     result). `Observed input:` accepts two strict, non-speculative forms:
     (1) **Form 1 (observed failure or artifact contradiction):** a failing probe/gate output, or a concrete
     `fileA:line` vs `fileB:line` contradiction (e.g. IAM SA mismatch, inverted test, sibling guard omission);
     (2) **Form 2 (unrunnable runtime hazard trace):** permitted ONLY when reproduction requires an external
     service, multi-process concurrency, or a browser/container runtime forbidden in the relay worktree —
     must supply a hop-by-hop `file:line` trace plus an exact `Clone probe:` command/script for the Producer's
     disposable full clone. Default severity for an unexecuted Form 2 hazard is `[Should]`.
     A `[Blocker]` must cite an observed failure (Form 1); an unexecuted Form 2 hazard stays `[Should]`
     until a probe reproduces it, and remains pending probe verification until the Producer runs
     `Clone probe:` in a disposable full clone.
     A finding from an earlier round stays open, and the verdict stays failing, until new evidence closes it.
     This includes earlier [Nit] findings; only a newly raised [Nit] with VERDICT: PASS on STATUS: Approved remains optional.
     This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking Form 1 evidence and lacking a complete Form 2 trace + `Clone probe:` as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request lacking Form 1 evidence and
     lacking a complete Form 2 trace + `Observed input:` / `Affected scope:` / `Falsifier:` / `Clone probe:`).
     For every Form 2 `Clone probe:` finding, read the probe before running it — refuse any probe that reaches
     the network, credentials, or paths outside the disposable clone and record the refusal as
     `[Unverified — clone probe failed/unavailable]` — then execute safe probes in a disposable full clone and
     record one of three outcomes: (a) Reproduced → fix and paste failing-before / passing-after probe output;
     (b) Falsified → `Declined — falsified by clone probe: <cmd → exit + output>`; (c) Errored, refused, or
     environment unavailable → keep the finding OPEN (`[Unverified — clone probe failed/unavailable]`, blocking
     `STATUS: Approved` until re-run cleanly or escalated/parked). Make approved changes, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Manual relay: commit only the relay file** (`relay(gh-100-final-r2-qa): <role> r<N>`); no push.
   **Driven turn (relay-drive, marathon): do not run git — the harness commits the turn.** **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. (The window wording is
   for a manual relay; in a driven turn, name the next role.) The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **smoke.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: author
- Started: 2026-11-24

### Artifact — smoke.md
```
# GH-100 render qualification

Run in the full task clone based on main@d47eb25, with the November 20 renderer and the lockfile dependencies. Plan QA approved at e01aa4b after adding the analogical-transfer study limitation.

- Main path: ran the documented DECK command against the thesis manifest. Both Satori and Chromium passed per-slide font, text geometry and overlap checks for ten slides. Copied the published PDF and HTML directly into the example and compared bytes. Counted ten PDF page objects.
- Offline smoke: launched Playwright with the network disabled and opened the distributable HTML via file URL. Advanced through all ten frames, checking the counter, title against each manifest entry and loaded image width of 1280 pixels.
- Adjacent path: unset DECK, set OUT_DIR=temp/overview-regression, and ran the same entry point. The overview verification manifest contained 15 slides; both backend checks passed throughout.
- Local preservation: counted 14 workshop slides in the dated archive outside renderer scratch. Compared the separately rebuilt offline viewer to the archived viewer byte for byte. The archive is intentionally local as requested.
- Editorial review: the experimental problem-solving result and the proposed UX application have separate text blocks. The MRI slide identifies practice-related change, its transient character and the separate question of transfer to UX. Both sources are cited in the deck and linked from the example README.
- Negative control: main’s fixed overview manifest lacks the ten thesis slide IDs; the actual navigation check asserted the thesis IDs in order. Geometry alone would accept an unrelated talk.

Final reviewer: inspect the deck, both studies’ scope, the actual renderer delta and this receipt against issue 100. Confirm the published example links resolve. Project qualification commands pnpm test and utils/pdda/pdda.sh run will also run before push by explicit operator decision. No additional test suite.

## Acceptance and evidence map for independent review

Issue: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/100. Integration base d47eb25, product commit aa52167. Inspect the committed tree of this checkout, particularly the paths below, in addition to this receipt.

1. Standalone talk, audience, per-slide contents, career application. Read examples/2026-11-23-beyond-the-prompt/deck.json, IDs audience, contents and judgment. Contents pulls each slide’s preview in manifest order from examples/2026-11-20-layout-engine-deck/render-deck.mjs and the two-column scene in its sibling recipe.mjs. Run git diff d47eb25 aa52167 -- examples/2026-11-20-layout-engine-deck to inspect.
2. Two attributed primary studies and explicit limits. Read the analogy and plasticity slides and examples/2026-11-23-beyond-the-prompt/README.md. Gick and Holyoak (1983) concern experimental problem solving. The following block identifies UX as our application. Draganski et al. (2004) concern learning to juggle; the second block explicitly separates UX judgment. Sources: https://reasoninglab.psych.ucla.edu/wp-content/uploads/sites/273/2021/04/Gick_Holyoak1983_SchemaInduction.pdf and https://doi.org/10.1038/427311a.
3. Delivered artifacts: examples/2026-11-23-beyond-the-prompt/renders/riso/deck.html and deck.pdf. Independent of the primary and task trees, provisioned a disposable full qualification clone at 379cf40 (same product tree as aa52167). Main and adjacent commands there both exited 0:

   DECK=examples/2026-11-23-beyond-the-prompt/deck.json node examples/2026-11-20-layout-engine-deck/render-deck.mjs

   OUT_DIR=temp/overview-regression node examples/2026-11-20-layout-engine-deck/render-deck.mjs

   jq '.slides|length' temp/{beyond-the-prompt,overview-regression}/verification.json returned 10 then 15. cmp of published HTML and committed HTML exited 0. PDF byte comparison passed in the original rendering run; PDF metadata can vary on rebuild. The committed PDF contained 10 page objects. Offline navigation in the disposable clone returned “All ten offline viewer frames and titles navigable in manifest order.” The actual probe is below.
4. Workshop recoverability and optional Part II. On the maintained machine, jq '.slides|length' temp/beyond-the-prompt-workshop-2026-11-24/deck.json returned 14. cmp temp/workshop-snapshot-rebuild/deck.html temp/beyond-the-prompt-workshop-2026-11-24/renders/riso/deck.html exited 0. These paths are local-only by request. No Part II implementation.

~~~js
import { launchPlaywright } from './tools/render.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const dir='examples/2026-11-23-beyond-the-prompt';
const manifest=JSON.parse(fs.readFileSync(dir+'/deck.json'));
assert.deepEqual(manifest.slides.map(s=>s.id),['beyond-the-prompt','audience','contents','promise','evidence','analogy','transfer','plasticity','judgment','closing']);
const b=await launchPlaywright();
try {
 const ctx=await b.newContext({offline:true});
 const p=await ctx.newPage();
 await p.goto(pathToFileURL(path.resolve(dir+'/renders/riso/deck.html')).href);
 for(let i=0;i<manifest.slides.length;i++){
   if(i) await p.locator('#next').click();
   assert.equal(await p.locator('#counter').textContent(),(i+1)+' / 10');
   assert.equal(await p.locator('#cap-title').textContent(),manifest.slides[i].title);
   await p.waitForFunction(()=>document.querySelector('.stage img').naturalWidth===1280);
 }
 console.log('All ten offline viewer frames and titles navigable in manifest order.');
} finally {await b.close();}
~~~

Disposable-clone gates at 379cf40: pnpm test passed all four canaries (30.4 seconds, 60-second budget). utils/pdda/pdda.sh run exited 0 with 35 warnings under issue-doc-sync and governance in the unvendored clone. Re-run the pre-push checks on the publication revision. These are local gates.
```
- Definition of Done: Review the four numbered issue requirements in the embedded acceptance map against the actual committed source and export paths. Grade both studies, archive evidence and executed gates. Prior round requested an accessible contract and auditable evidence; verify both dispositions.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). In a manual relay, end each turn by committing just this file; no push. In a driven turn the harness commits.

## Log

### Reviewer · Round 1
swept file: yes
VERDICT: FAIL
Basis: The previous acceptance-contract and auditability requests are addressed by the embedded four-item map, exact commands, pinned paths, navigation script and disposable-clone results. Compared all four requirements with issue 100 fetched through the GitHub connector. Read the entire embedded receipt, manifest, README, renderer and recipe; inspected all ten embedded viewer frames. One pre-existing visual-policy discrepancy remains undispositioned.

- [Pass] Standalone thesis and career application: `examples/2026-11-23-beyond-the-prompt/deck.json:15` supplies the audience, `:33` the contents, and `:153` the portfolio application. `render-deck.mjs:86` derives previews in manifest order; `recipe.mjs:100` renders the numbered two-column contents. No Part II implementation is required by issue 100 (“A hands-on Part II is optional future work”).
- [Pass] Study scope is explicit in the actual content: `deck.json:89` says “The study measured problem solving in the lab”; `:93` labels UX as “Our design application”; `:127` states the MRI changes diminished after practice stopped; `:131` says UX judgment is a separate question. Attribution appears at `:96` and `:134`; README links both primary sources. This passes the scope/separation requirement, without claiming these studies demonstrate improved UX judgment. The UCLA PDF URL returned a PDF; the DOI browser fetch failed at Nature's identity redirect, so live Nature access was not independently established.
- [Pass] Delivered paths resolve locally. Read-only Python probe parsed `const S=...;const N=` from `examples/2026-11-23-beyond-the-prompt/renders/riso/deck.html`, compared every slug/title to `deck.json`, checked README relative targets with `Path.is_file()`, and counted PDF `/Type\s*/Page\b` objects. Exit 0: “10 embedded frames; IDs and titles match manifest order”; “renders/riso/deck.html True”; “renders/riso/deck.pdf True”; “PDF page objects 10”. This is structural export evidence, not an executed browser-navigation claim.
- [Pass] Archive and gates are now auditable producer evidence: acceptance-map item 4 records the dated local archive's 14-slide count and viewer `cmp` exit 0; item 3 and the closing gate paragraph record both render commands at 379cf40, ten versus fifteen slides, offline navigation, four passing canaries and PDDA exit 0 with 35 warnings. Accept these as supplied disposable-clone results, not checks rerun here. The intentionally local archive is not present for independent inspection in this relay tree. Later pre-push commands are not a basis for this verdict.
- [Should] Disposition the inherited AS-12 typography exception before claiming visual qualification. Observed input: `examples/2026-11-20-layout-engine-deck/theme-riso.json:15` sets headline pct 0.097 and `:30` body pct 0.0333; `recipe.mjs:2-5,26` uses S=720 and rounds these to 70 and 24 px. This contradicts SYSTEM-INSTRUCTIONS.md AS-12's “Headline : body ratio ≥ 4:1”. Reproducible non-mutating command: `python3 -c 'import json; t=json.load(open("examples/2026-11-20-layout-engine-deck/theme-riso.json"))["type"]; h=round(720*t["headline"]["pct"]); b=round(720*t["body"]["pct"]); print(h,b,h/b)'` → exit 0, `70 24 2.9166666666666665`. Affected scope: this thesis edition using the default Riso theme, including the inspected analogy frame; not a request to redesign all older decks. Falsifier: an existing explicit content-based AS-12 exception for this edition, or a qualified theme producing ratio ≥4 while preserving legibility and fit. Cheapest fix: document the deliberate presentation-type exception and its audience/readability rationale under SYSTEM-INSTRUCTIONS.md's permitted exception/report contract; alternatively adjust this edition and regenerate its exports in the disposable clone. Preserve the study limitations and avoid adding a test suite.

Limits: no git, executable fixture, browser, test suite or PDDA command ran here; no phase gate is configured in this relay. The graph query was denied by the environment approval policy, so named source files were read directly. The first scratch extraction attempt failed because PIL is unavailable; the standard-library extraction then succeeded. Only Satori-derived embedded frames were visually available; no independent Chromium or phone-scale review is claimed. No additional pre-existing defect was identified in the swept receipt/source beyond the typography discrepancy above.

Reversibility: Easy — a scoped visual-exception disposition can resolve this without runtime changes.
Handing off to Producer (author) — disposition the AS-12 finding and return for review.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
