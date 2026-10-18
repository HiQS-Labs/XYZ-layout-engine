# RELAY · GH-63 plan QA: vibe-coding loop example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-17.
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
6. **Commit only the relay file** (`relay(gh63-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-63-VIBE-CODING-LOOP.md` (the plan; nothing is built yet).
  Requirements source: issue https://github.com/HiQS-Labs/XYZ-layout-engine/issues/63 (summarised in the
  plan's Why). Grounding sources: `examples/2026-10-16-skill-trigger/render-diagram.mjs` and its README
  (one-off example precedent), `PROJECT/3-COMPLETED/GH-60-SKILL-TRIGGER-PLATE.md` (scope-change lesson:
  pinned `tools/render.mjs`), `examples/2026-10-13-nutrition-infographic/{ASSETS.md,artwork.json,provenance.json,DESIGN.md,README.md}`,
  `tools/recipes/nutrition.mjs:60-145` (AS-11 ground shadow technique), `tools/request.mjs:52`
  (`readPinnedPngs`), `tools/render.mjs` (`renderSatori`, `renderPlaywright`), `tools/catalog.sql` (which
  files published recipes pin), `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-12 and the Report), `DESIGN.md`
  (brief authoring profile), `AGENTS.md`, `test-budget.json`.
- Operational envelope: a documentation example in a public repo, rendered locally by one developer.
  Grade against the stated requirements and commensurate complexity; do not ask for recipes, catalog
  entries, new tests or engine machinery the plan explicitly scopes out unless a requirement forces it.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-17
- Definition of Done: the plan is grounded in the real paths, covers the issue's deliverables, touches no
  pinned file, and its acceptance checks (including the three red controls) would actually catch the
  failures they name.

### Questions for the Reviewer
1. Are the recon claims true? In particular: does anything the example would import or edit appear as a
   pinned file in `tools/catalog.sql`; does `readPinnedPngs` (`tools/request.mjs:52`) refuse a modified
   display file the way red control 2 assumes; is `groundShadowUri` really private to `nutrition.mjs`?
2. Is the one-off example (no recipe, no catalog entry) the right size given the GH-55/GH-60 precedent,
   or does a requirement force a recipe?
3. Does the AS-12 table comply with every numbered AS-12 rule (headline 7–10% S, body ≥ 1.8% S,
   headline:body ≥ 4, ≤ 4 sizes, headline width 50–85% W, graphic ≤ 3× cap height, label ≥ 70% icon)?
   Is putting the footer at body size and actor tags at label size consistent with the 4-size cap?
4. Is one Barlow Condensed family acceptable under AS-5 for this copy length, or is a body face required?
5. Are the image-generation budget (≤ 10 paid calls), provenance and alpha requirements sufficient and
   consistent with the nutrition pipeline and AS-7/AS-9 disclosure?
6. Do the acceptance checks and red controls actually detect the failures they name, and is anything
   from the issue's deliverables missing from Requirements?
7. Flag anything over- or under-engineered. Cite `file:line` where you disagree.

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

VERDICT: FAIL
Basis: The one-folder plan is appropriately sized and its asset reader really enforces hashes, but red control 2 does not test that enforcement. Fix R1 before implementation. Reviewed the entire plan, including existing Recon/Requirements/Acceptance text; the issues below include those pre-existing sections. No source or artifact was edited. Reversibility: Easy (plan corrections only).

- [Should] **R1 — Make the pinning red control reach the digest check.** Plan `PROJECT/1-INBOX/GH-63-VIBE-CODING-LOOP.md:140–141` appends a byte. `tools/request.mjs:64–66` validates PNG structure **before** comparing the hash; `tools/spike/assets.mjs:28–33` rejects trailing bytes. The proposed control therefore stays red even if the digest comparison is removed. Replace it with a structurally valid, different PNG under the same asset id while retaining the original provenance pin; require the specific `display digest mismatch`, then restore and require PASS. Record the command, exit/message and restored result in the plan's Evidence table at implementation QA.
  Observed input: copied nutrition `balance_scale.png`, original provenance pin, then one appended zero byte; actual rejection was `Unsupported PNG chunk/order`. A valid `water_bottle.png` copied to the same `balance_scale.png` path instead produced `Validation failed: [{"field":"asset.balance_scale","message":"display digest mismatch"}]`.
  Affected scope: this plan's red control 2 only; no asset-reader or PNG-validator change.
  Falsifier: a control using a valid replacement PNG must fail specifically on digest mismatch with unchanged provenance, while the original bytes pass; a structural error instead means the control still does not exercise pinning.
  Probe command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node --input-type=module` with the following stdin (exit 0; the exceptions are deliberately printed):
  ```js
  import fs from 'node:fs/promises';
  import path from 'node:path';
  import {pathToFileURL} from 'node:url';
  import {readPinnedPngs} from './tools/request.mjs';
  const base=path.join(process.env.TMPDIR,'pin-probe');
  await fs.mkdir(path.join(base,'assets/web'),{recursive:true});
  const src='examples/2026-10-13-nutrition-infographic/';
  const proof=JSON.parse(await fs.readFile(src+'provenance.json','utf8'));
  await fs.writeFile(path.join(base,'provenance.json'),JSON.stringify(proof));
  const orig=await fs.readFile(src+'assets/web/balance_scale.png');
  const target=path.join(base,'assets/web/balance_scale.png');
  const url=pathToFileURL(base+'/');
  for (const [name,bytes] of [['original',orig],['appended-byte',Buffer.concat([orig,Buffer.from([0])])],['valid-other-png',await fs.readFile(src+'assets/web/water_bottle.png')]]) {
    await fs.writeFile(target,bytes);
    try { await readPinnedPngs(url,'provenance.json',['balance_scale']); console.log(name+': accepted'); }
    catch(e) { console.log(name+': '+e.message); }
  }
  ```
  Decisive output: `original: accepted`; `appended-byte: Unsupported PNG chunk/order`; `valid-other-png: Validation failed: [{"field":"asset.balance_scale","message":"display digest mismatch"}]`.

- [Pass] **Scope and reuse (questions 1–2).** The one-off requirement needs no recipe or catalog entry: the precedent imports shared backends at `examples/2026-10-16-skill-trigger/render-diagram.mjs:10` and calls them at `:129–135`. `groundShadowUri` is unexported at `tools/recipes/nutrition.mjs:70`, with the local caller at `:127`; reproducing its small two-ellipse technique avoids a pinned edit. Importing a pinned module is fine; editing it is the risk. An in-memory SQLite query over `tools/catalog.sql` (`python3`, exit 0; `select count(*) from recipe_version_files where path=?`) returned render=6, request=11, nutrition=6, catalog.sql=0, precedent script=0. The new folder plus doc/changelog/ledger scope at plan `:23,74–80,131` avoids those pinned code files.

- [Pass] **Numeric type proposal and family (questions 3–4), conditional on actual renders.** Plan `:86–96` computes 96/36/29/23 px, four sizes, body above 21.6 px and ratio 96/23 = 4.174. Reusing body for the footer and label for actor tags adds no size. AS-5 in `SYSTEM-INSTRUCTIONS.md` explicitly allows the Barlow Condensed default and requires a wider face for long paragraphs; the proposed short copy does not force another family. Width, visible graphic height, legend ratios, whitespace allocation, three-tier squint hierarchy and phone readability remain measurements/inspection, not established compliance. Plan `:123–127,145` provides their measurement/reporting path; retain the explicit squint/readability observations in that report.

- [Pass] **Asset pipeline (question 5).** Plan `:51–61,112–119,144` calls for one shared style, five subjects, source/display hashes, sanitized receipts, verified alpha/zero opaque corners, and README/footer disclosure. The explicit ten-call maximum is bounded; stop before dispatching an eleventh call. The installed `hiqs-image/SKILL.md` states “each run is exactly one paid OpenAI call”; its saved-file alpha fields match the plan. Inspect the final web derivatives as well as the accepted originals.

- [Nit] **Capture content parity explicitly (question 6).** Plan `:108–109` says “all copy (from the canvas, kept verbatim except where AS-12 forces shortening)” but does not transcribe the stage titles or the two full header lines. [Issue #63](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/63), read with `gh issue view 63 --repo HiQS-Labs/XYZ-layout-engine --json title,body` (exit 0), supplies “01 Describe your idea (You)”, “02 AI generates code (AI)”, “03 You see it live (You)”, “04 You refine it (You)”, the legend and both header lines. Add a short parity checklist, including directed return, the two step-03 branches and no connector/node/label collisions, to guide the already-planned AS-10 pass. Existing numerical text checks do not inspect arrow intersections. No new automated gate is needed.

- [Nit] **Correct two Recon claims.** Plan `:64` calls `tools/catalog.sql` pinned, but the query above found zero recipe-file pins for it; it is the canonical catalog dump. Plan `:67` says “AGENTS.md: no new tests”; current AGENTS instead permits a test for a named material gap, and `test-budget.json` says “Test-like files anywhere in the repo count against testFiles.” Keeping this task free of new tests is still the appropriate scope decision.

- [Unverified — needs clone run] **Remaining acceptance controls and gates (question 7).** No example exists yet, and this checkout has no `node_modules`. Red controls 1 and 3 are plausible specifications, not witnessed failures: ensure the temporary fixture actually feeds the script, the caption mutation overflows its fixed container, and the body floor is checked before other failures obscure it; retain red and restored evidence in the existing Evidence table. Both backend rendering, actual AS-12 measurements, repeatability, catalog verify, PDDA and pnpm test belong in the disposable full clone. No tests, executable fixtures or validation suites were run here.

Evidence limits: Verify-tier graph attempt used nearest project `XYZ-layout-engine`; generation `2026-10-13T02:52:30Z` is for another checkout and excludes `tools/` and `examples/`. Symbol search returned zero; coverage marked all requested code paths excluded. All code claims above therefore use direct source reads and the narrow scratch probe, not graph completeness. Startup roadmap CLI was unavailable at both router-listed paths (exit 2, file not found); no ledger state is asserted.

Handing off to Producer (claude-a) — fix R1, disposition the other findings, then open round 2 for Reviewer.

### Producer · Round 1 (claude-a)

- R1 [Should] — **Implemented.** Red control 2 now swaps in a different, structurally valid PNG under the
  same id with provenance unchanged and requires `display digest mismatch`; the plan notes why an appended
  byte is caught earlier by the PNG validator. Evidence goes in the plan's Evidence table at implementation.
- Content parity [Nit] — **Implemented.** New requirement 7 transcribes header, legend, card titles,
  connectors and branch labels, and states "no connector crosses a card, cutout or label", checked in the
  AS-10 pass (no new gate). Per-issue map now covers requirements 1–7.
- Recon claims [Nit] — **Implemented.** `tools/catalog.sql` is described as the canonical dump, not a pinned
  file; pinned files named are `tools/render.mjs`, `tools/request.mjs`, recipe modules. The AGENTS test
  sentence now matches the current wording (new test only for a named material gap; none named here).
- Asset pipeline note (inspect web derivatives as well as originals; stop before an 11th call) —
  **Accepted** as stated; already within requirement 3–4 wording.
- Unverified clone-run items — **Accepted**; they are implementation evidence, recorded in the Evidence
  table with red and restored results.

Handing off to Reviewer (codex) for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
