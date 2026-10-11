# RELAY · #34 Barlow Condensed starter default font: final QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-11.
-->

NEXT: done
STATUS: Approved
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
6. **Commit only the relay file** (`relay(34-barlow-condensed-starter-default-font-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit `85d3527` (`git show --stat 85d3527`): `tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf`, `tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf`, `tools/fonts/barlow-condensed/OFL.txt`, `tools/fonts/barlow-condensed/SOURCE.md`, `skills/design-diagram/SKILL.md` (step 2 font paragraph and trap 8), `CHANGELOG.md`, `PROJECT/1-INBOX/GH-34-BARLOW-CONDENSED-AS-STARTER.md` and its ledger row. Context: issue #34; `tools/render.mjs:24-50,110-130,155-168,239`; `examples/2026-10-09-rag-system/render-diagram.mjs:13,123,126,132`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done (from #34):
  - Barlow Condensed Regular (400) and Bold (700) are vendored with the OFL license and provenance that can be checked.
  - The skill switches a *new* diagram's copied script to Barlow Condensed unless the brief names a font, and its instructions are exact and complete.
  - Existing recipes, diagrams and fonts are unchanged and byte-identical.
  - No engine code, test, check or dependency is added.
  - The claims in the CHANGELOG and capture doc are true.

## QA brief (read before reviewing)

Operational envelope: a docs-and-assets change in an early-stage public repo. Grade against #34 and commensurate complexity. No engine fallback mechanism is wanted: no recipe or user can declare a font yet, and that is deliberately out of scope.

What the producer measured (re-measure what you can with read-only probes; scratch output goes only under `.relay-scratch/`, after `export TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`):
- Each vendored file is byte-identical to google/fonts commit `60824dce48f7dd28fe7d65559f2da1f6e04e585b` (`cmp` against the pinned raw URL). The sha256 values are in `SOURCE.md`.
- A bold-free 40 px line rendered at 436 px in Barlow Condensed and 613 px in Inter, matching in Satori and Chromium, with `fontLoaded: true` for both.
- With the family argument left out, Satori measured 436 px but Chromium 528.73 px with `fontLoaded: false`. That is trap 8.
- A scratch copy of the RAG example with exactly the skill's three edits rendered `PASS`, and the step-2 grep printed nothing. The copy was deleted.
- `pnpm test` 4/4 in 34.6 s; `catalog verify` valid; PDDA no errors.

Questions:
1. Are the skill's three edits complete and exact for the current RAG script, so that a copy following them renders Barlow in both backends? Is anything else in that script font-bound? Does the grep check catch a missed edit?
2. Is trap 8 accurately stated, given `tools/render.mjs` (family default `'Inter'` at `:24` and `:130`; `fontLoaded` used at `:239` only in `processRequest`)?
3. Do the provenance and licensing meet the OFL's terms for redistribution (license included, no renaming of the font), and does `SOURCE.md` let someone re-verify the files?
4. Is anything existing changed in behaviour or bytes? Is any claim overstated?
5. Anything over-built or missing for this scope?

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. A `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh34-barlow-qa --agent codex`. **Never run `tick release --to done`.** If you do not approve: set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh34-barlow-qa --agent codex --to claude-a`.

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
Basis: two observed documentation defects prevent the promised exact edits and missed-edit detection. Fix the instructions only; no engine fallback or new test is needed.
swept file: yes

Read the entire skill, SOURCE, OFL, capture doc and CHANGELOG; inspected both TTF name/weight tables and the complete RAG script, plus relevant renderer implementations. No additional material pre-existing defect found in the artifact files. The capture's parked/TODO state is explicit, not a completion claim. Graph tools were unavailable; used direct source evidence without a graph completeness claim.

- [Should] R1 — Wrong Chromium argument position. `skills/design-diagram/SKILL.md:25` says “fifth argument of both”, but the family is fifth in `tools/render.mjs:24` and sixth in `tools/render.mjs:130` because context comes first. Fix by spelling out both calls: `renderSatori(scene,fonts,W,H,'Barlow Condensed')` and `renderPlaywright(context,scene,fonts,W,H,'Barlow Condensed')`. This also corrects the “three exact edits” claim at `CHANGELOG.md:5`.
  Observed input: following the fifth-position instruction literally produces `renderPlaywright(context,scene,fonts,800,'Barlow Condensed')`; the actual function generated Inter font faces and an invalid height in the probe below.
  Affected scope: new RAG copies following step 2; no renderer behavior change requested.
  Falsifier: the corrected sixth-position call must generate Barlow font faces and numeric height; the control did so.
  Probe command (exit 0; mock page only, no browser or fixture execution):
  ```sh
  node --input-type=module <<'JS'
  import fs from 'node:fs/promises';
  import {renderPlaywright} from './tools/render.mjs';
  const fonts={regular:await fs.readFile('tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf'),bold:await fs.readFile('tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf')};
  const scene={type:'div',props:{id:'canvas',style:{fontFamily:'Barlow Condensed'},children:'Example'}};
  for(const [label,args] of [['literal fifth',[800,'Barlow Condensed']],['correct sixth',[800,200,'Barlow Condensed']]]){
    let html;
    const context={newPage:async()=>({setContent:async h=>{html=h},evaluate:async()=>({bounds:{},textBoxes:{}}),screenshot:async()=>Buffer.alloc(0),close:async()=>{}})};
    await renderPlaywright(context,scene,fonts,...args);
    console.log(label+': '+html.match(/@font-face\{font-family:'[^']+'/)[0]+'; '+html.match(/html,body\{[^}]+/)[0]);
  }
  JS
  ```
  Decisive output: `literal fifth: @font-face{font-family:'Inter'; html,body{margin:0;width:800px;height:Barlow Condensedpx;overflow:hidden`; control: `correct sixth: @font-face{font-family:'Barlow Condensed'; html,body{margin:0;width:800px;height:200px;overflow:hidden`.

- [Should] R2 — The negative grep cannot detect omitted family arguments. `skills/design-diagram/SKILL.md:28,50` points to this check, but the original calls at `examples/2026-10-09-rag-system/render-diagram.mjs:126,132` omit family rather than spelling Inter. After only changing font paths and canvas family, the grep prints nothing. Fix with positive checks for both explicit Barlow calls, or an explicit manual checklist, and qualify what the negative grep detects.
  Observed input: original RAG source with the two font-path replacements and canvas family replacement, leaving both backend calls unchanged.
  Affected scope: step-2 validation of a new copied script.
  Falsifier: the incomplete copy must fail the revised check; the same copy with both explicit family arguments must pass.
  Probe command (Python exit 0; grep exit 1 means no matches, the documented success condition):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  mkdir -p "$TMPDIR"
  python3 - <<'PY'
  from pathlib import Path
  import subprocess
  s=Path('examples/2026-10-09-rag-system/render-diagram.mjs').read_text()
  s=s.replace('tools/spike/assets/font.ttf','tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf').replace('tools/spike/assets/font-bold.ttf','tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf').replace("fontFamily:'Inter'","fontFamily:'Barlow Condensed'")
  p=Path('.relay-scratch/tmp/missed-family.mjs'); p.write_text(s)
  r=subprocess.run(['grep','-n','-e','Inter','-e','spike/assets/font',str(p)],capture_output=True,text=True)
  print('missed-family grep exit='+str(r.returncode)+' stdout='+repr(r.stdout))
  for line in s.splitlines():
    if 'await renderSatori(' in line or 'await renderPlaywright(' in line: print(line.strip())
  PY
  ```
  Decisive output: `missed-family grep exit=1 stdout=''`, `const result=await renderSatori(scene,fonts,W,H);`, `chromiumResult=await renderPlaywright(context,scene,fonts,W,H);`.

- [Pass] The font-bound locations are the paths, inherited canvas family and backend arguments (`examples/2026-10-09-rag-system/render-diagram.mjs:13,123,126,132`); remaining text has sizes/weights without another family override. Trap 8's mechanism follows from font registration/defaults (`tools/render.mjs:24,31,120,121,130`). The diagram's checks at `examples/2026-10-09-rag-system/render-diagram.mjs:136-181` never inspect `fontLoaded`; `processRequest` does (`tools/render.mjs:239`). No engine repair requested.
- [Pass] Command `shasum -a 256 tools/fonts/barlow-condensed/*`, exit 0, matches `SOURCE.md:11-13`: Regular `583cec5da3b84bc4dc7c9c72e2a565c94d34e431518b19d7e250b7830ad5f996`; Bold `e476562ec9c1e16cf16475895b511f08c804f438cc9a9f80a44ea50a0eeb5b65`; OFL `186d750eb496a4c17a76385f82be6aea2ac1cf2de074a811d63786cf374ea73f`. Local TTF metadata inspection also returned family Barlow Condensed, Regular/Bold, weights 400/700, consistent with `SOURCE.md:7,11,12`.
- [Pass] The copyright and complete OFL accompany the fonts (`tools/fonts/barlow-condensed/OFL.txt:1-93`); condition 2 permits software bundling with that notice/license (`:56-61`). Font names remain Barlow Condensed. The full upstream commit/folder in `SOURCE.md:6`, with file names/hashes, identifies re-verifiable inputs. No additional packaging mechanism needed.
- [Unverified — network unavailable] Upstream byte identity at `SOURCE.md:6` and `CHANGELOG.md:4`: for each TTF and OFL, command `curl -fLsS --max-time 25 "https://raw.githubusercontent.com/google/fonts/60824dce48f7dd28fe7d65559f2da1f6e04e585b/ofl/barlowcondensed/$name" -o "$TMPDIR/$name"` returned 6, `Could not resolve host: raw.githubusercontent.com`; cmp was skipped. Local hash agreement is not independent upstream verification.
- [Unverified — needs clone run] Existing-byte preservation and the exact width/full-diagram render claims (`CHANGELOG.md:7-8`) remain producer evidence. No fixture, suite, PDDA or git command was run here; commit-wide path/byte comparison and absence of engine/test/dependency edits remain harness checks. The seeded ledger row (`releases.sql:45`) points at the capture and agrees with its 45/10/70/85 rating (`PROJECT/1-INBOX/GH-34-BARLOW-CONDENSED-AS-STARTER.md:77`). Both documented roadmap-list script paths were absent, so the row was read directly. AS-5 is explicitly a PR #33 dependency (`PROJECT/1-INBOX/GH-34-BARLOW-CONDENSED-AS-STARTER.md:92`); `SYSTEM-INSTRUCTIONS.md` is absent here, so that landing is not attested.

Bet: precise calls and a positive check prevent silently omitted arguments with minimal documentation. Failure mode: a negative grep appears successful while defaults remain. Reversibility: Easy. Handing off to Producer (claude-a) — disposition and fix R1/R2, then open round 2.

### Producer · Round 1 · claude-a

- **R1: Implemented.** The bullet now writes both calls out in full, `renderSatori(scene,fonts,W,H,'Barlow Condensed')` and `renderPlaywright(context,scene,fonts,W,H,'Barlow Condensed')`, and says the family is the argument after the height. The "fifth argument" wording is gone. The CHANGELOG sentence is updated.
- **R2: Implemented, with your falsifier as the test.** Step 2 now runs two checks. A positive `grep -c -F` for the four required lines must print `4`, and the negative grep must still print nothing. The text says why the negative grep alone cannot see a missing family argument. I built both of your fixtures from the RAG script:
  - **missed-family copy** (font paths and canvas family changed, calls unchanged): `positive=2 (want 4) negative=0`, so the check fails.
  - **complete copy:** `positive=4 (want 4) negative=0`, so it passes.

  A leftover `font-bold.ttf` path is caught by the negative grep (`spike/assets/font`).
- **Your network-unverified item:** I ran the upstream identity check when vendoring. `gh api 'repos/google/fonts/commits?path=ofl/barlowcondensed&per_page=1'` returned `60824dce48f7dd28fe7d65559f2da1f6e04e585b`, and `curl` of each file at that commit piped to `cmp` printed `pinned match` for all three files.

Handing off to Reviewer (codex) for round 2.

### Reviewer · Round 2 · codex

VERDICT: PASS
Basis: R1 and R2 are resolved against the current RAG source. No remaining Blocker or Should finding for this docs-and-assets scope; full-clone verification remains harness-owned.
swept file: yes

Read the complete skill, SOURCE, OFL, capture doc and CHANGELOG again; inspected the TTF tables, complete RAG script and relevant renderer functions. No additional material pre-existing defect found in the artifact files. Graph tools are unavailable in this session; direct source evidence used without a graph completeness claim.

- [Pass] R1 resolved. The explicit calls at `skills/design-diagram/SKILL.md:25` put family after height in both signatures (`tools/render.mjs:24,130`). Together with the paths and canvas family at `skills/design-diagram/SKILL.md:24,26`, these cover every font-bound location in the current RAG script (`examples/2026-10-09-rag-system/render-diagram.mjs:13,123,126,132`). No further family override appears in its complete scene. `CHANGELOG.md:5` now describes the actual instructions. Fix: none.
- [Pass] R2 resolved for the current copied pattern. The checks at `skills/design-diagram/SKILL.md:28-30` distinguish the missed-family copy from the complete copy, and together also catch a missed Bold path. This is a literal check of the copied script before adaptation, not a general parser for arbitrarily reformatted scripts. Fix: none.

  Probe command (Python exit 0; only scratch copies, no fixture execution):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  mkdir -p "$TMPDIR"
  python3 - <<'PROBE'
  from pathlib import Path
  import subprocess, shlex
  source=Path('examples/2026-10-09-rag-system/render-diagram.mjs').read_text()
  partial=source.replace('tools/spike/assets/font.ttf','tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf').replace('tools/spike/assets/font-bold.ttf','tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf').replace("fontFamily:'Inter'","fontFamily:'Barlow Condensed'")
  complete=partial.replace('renderSatori(scene,fonts,W,H)',"renderSatori(scene,fonts,W,H,'Barlow Condensed')").replace('renderPlaywright(context,scene,fonts,W,H)',"renderPlaywright(context,scene,fonts,W,H,'Barlow Condensed')")
  skill=Path('skills/design-diagram/SKILL.md').read_text()
  commands=[line.split(chr(96))[1] for line in skill.splitlines() if line.strip().startswith('- '+chr(96)+'grep')]
  for label,text in [('missed-family',partial),('complete',complete),('missed-bold',complete.replace('tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf','tools/spike/assets/font-bold.ttf'))]:
      folder=Path('.relay-scratch/tmp')/label
      folder.mkdir(exist_ok=True)
      (folder/'render-diagram.mjs').write_text(text)
      for cmd in commands:
          r=subprocess.run(shlex.split(cmd),cwd=folder,capture_output=True,text=True)
          print(label,'positive' if '-c' in cmd else 'negative','exit='+str(r.returncode),'stdout='+repr(r.stdout))
  PROBE
  ```
  Decisive output: missed-family positive `exit=0 stdout='2\n'`, negative `exit=1 stdout=''`; complete positive `exit=0 stdout='4\n'`, negative `exit=1 stdout=''`; missed-bold positive `exit=0 stdout='4\n'`, negative `exit=0` with line 13 containing `tools/spike/assets/font-bold.ttf`. As documented, inspect the count/output; grep exit 0 alone is not acceptance.

- [Pass] Trap 8 at `skills/design-diagram/SKILL.md:54` describes the recorded mismatch, consistent with Satori's supplied-font registration (`tools/render.mjs:31`), Chromium's generated font faces (`:120-121`) and default family (`:130`). The RAG findings inspect geometry/overflow, not `fontLoaded` (`examples/2026-10-09-rag-system/render-diagram.mjs:136-181`); the shared request path does inspect it (`tools/render.mjs:239`). The trap's numerical/font-load evidence is a producer probe, not a claim that this diagram enforces font loading. Fix: none.
- [Pass] Local file hashes still match `tools/fonts/barlow-condensed/SOURCE.md:11-13`. Command `shasum -a 256 tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf tools/fonts/barlow-condensed/OFL.txt`, exit 0: Regular `583cec5da3b84bc4dc7c9c72e2a565c94d34e431518b19d7e250b7830ad5f996`; Bold `e476562ec9c1e16cf16475895b511f08c804f438cc9a9f80a44ea50a0eeb5b65`; OFL `186d750eb496a4c17a76385f82be6aea2ac1cf2de074a811d63786cf374ea73f`. The included copyright/license and bundling condition remain present (`tools/fonts/barlow-condensed/OFL.txt:1-93`, specifically `:56-61`); the full upstream commit, folder and filenames are re-verifiable inputs (`SOURCE.md:6,11-13`). No extra packaging or engine mechanism is warranted. Fix: none.
- [Pass] The capture preserves its parked intake/checklist state rather than falsely claiming completion (`PROJECT/1-INBOX/GH-34-BARLOW-CONDENSED-AS-STARTER.md:3-6,35,51-55`); its scoped plan and PR #33 dependency are explicit (`:84-92`). Its rating agrees with the seeded row (`:77`; `releases.sql:45`). Fix: none.
- [Unverified — network unavailable] Independent upstream byte identity remains unavailable. Command `curl -fLsS --max-time 15 "https://raw.githubusercontent.com/google/fonts/60824dce48f7dd28fe7d65559f2da1f6e04e585b/ofl/barlowcondensed/OFL.txt" -o "$TMPDIR/upstream-OFL.txt"` exited 6: `Could not resolve host: raw.githubusercontent.com`; no comparison performed. Producer's pinned-match evidence stands separately from local hash agreement (`SOURCE.md:6`; Producer round 1).
- [Unverified — needs clone run] Width/full-diagram rendering (`CHANGELOG.md:7`), existing-byte preservation and absence of engine/test/dependency changes (`:6`) remain producer evidence plus harness checks. No git, fixture execution, suite or PDDA gate was run in this turn. This approval does not attest PR #33 landing or those deferred checks.

Bet: the explicit calls and paired literal checks prevent the observed omissions without adding runtime machinery. Failure mode: checking only grep's exit code instead of the documented count/output. Reversibility: Easy. Relay closed (Approved), no further turn needed; harness owns the file-scoped commit and clone gate.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
