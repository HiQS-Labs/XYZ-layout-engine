# RELAY · #36 recursive-process recipe: final QA
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
6. **Commit only the relay file** (`relay(36-recursive-process-recipe-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the diff from da97d78 to HEAD on the feat/gh36-recursive-process branch. Code: `tools/render.mjs`, `tools/request.mjs`, `tools/catalog.mjs`, `tools/recipes/recursive-process.mjs`, `tools/spike/test/canaries.test.mjs`. Data: `tools/catalog.sql`, `tools/design-log.jsonl`. Example folder: `examples/2026-10-11-belief-updating/README.md`, `examples/2026-10-11-belief-updating/fixture.json`, `examples/2026-10-11-belief-updating/render-diagram.mjs`, `examples/2026-10-11-belief-updating/receipt.json`, `examples/2026-10-11-belief-updating/belief-updating.png`. Docs: `README.md`, `CHANGELOG.md`, `tools/fonts/barlow-condensed/SOURCE.md`. Plan with filled evidence: `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md`. Plan QA thread: `relay-system/2026-10-11/gh36-plan-qa.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done: the seven numbered acceptance checks in the plan, as approved in plan QA round 3, are met and evidenced. The implementation matches decisions D1 to D10 (including D6, the AS-rule departures). It adds no second writer or subsystem, and no new test file or `test()` block.

## QA brief (read before reviewing)

Operational envelope: a local, single-developer, early-stage public repo. Grade against the approved plan and commensurate complexity.

Producer evidence, recorded in the plan's Evidence section:
- **Preservation matrix:** all 14 nutrition and solar artifacts are byte-identical from the `main` baseline to the final tree, and the baseline itself was run twice.
- **Red controls:** five guard removals, each turning `pnpm test` red.
- **Gates:** `pnpm test` 4/4 in 37.3 s; `catalog verify` valid; `export --check` canonical; both thin-caller receipts `verified: true`; the save check left the original fixture untouched; PDDA no errors.

Two build-time decisions that the plan did not spell out beforehand; please judge them:
- (a) Formula tokens render without IDs, so the fit loop does not check them. Validation bounds their width instead: at most three tokens of one letter and one digit. Plan-QA round 1's F6 note assumed tokens would carry leaf IDs.
- (b) Line height is 1.2, not D10's 1.1, because Barlow's 1.2 em line box made Chromium report overflow at every size.

Also new: the canvas is 1600×1340, not 1600×1400, after visual review. The committed receipts have `inputPath` rewritten to repo-relative; the README says so.

Questions:
1. Is each acceptance check (1–7) actually met by the code and the evidence? Name any that is overstated.
2. Is the D3 font change still a no-op for recipes without `FONT` on every path, including `toDocument` at the compact HTML and inline HTML sites?
3. Does the recipe's `validate` enforce its domains fully, including one to three formula tokens, and are its errors named? Is anything accepted that should not be?
4. Are decisions (a) and (b) sound and honestly documented? Is the receipt `inputPath` rewrite acceptable?
5. Is the C1 extension within the ratchet (no new test), and is `assertOfflineExport` a faithful refactor of the old nutrition block?
6. Does the example README's AS report match the rendered PNG and `SYSTEM-INSTRUCTIONS.md`?

You may run read-only probes under `.relay-scratch/` after `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`. Do not run `pnpm test`.

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. A `[Blocker]` or `[Should]` asking for a change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules (forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh36-final-qa --agent codex`. **Never run `tick release --to done`.** Otherwise set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh36-final-qa --agent codex --to claude-a`.

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
Basis: The bounded implementation and committed artifacts support the feature, but acceptance 3 is not fully evidenced: the non-fit guard-removal result is absent despite the blanket claim that every refusal was falsified. No observed runtime Blocker. One Should evidence request and documentation Nits; no registry, extra test or subsystem requested.
swept file: yes

Swept the whole current seeded contents of the five code files, catalog dump/log, example fixture/caller/receipts/README, root README/CHANGELOG, font SOURCE, plan and plan-QA thread, including unchanged sections. Also inspected both committed PNGs at full size and at 400 px. No additional pre-existing defect requiring a runtime change was identified in this bounded sweep. Graph tools are unavailable; Verify-tier source fallback, with no graph-generation/coverage claim. No git command or baseline diff was run. Reversibility: Easy (this relay file only). Bet: an absent evidence row warrants a targeted request, not an assertion that the guard was never tested; an existing clone-run receipt would resolve it.

- [Should] **F1 — Complete the non-fit falsification evidence (acceptance 3).** `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md:127,146,173–183` requires the command, named error and guard-removal result for each control. The non-fit row at `:177` contains only `(engine fit loop, existing)`, while `:173`, example `README.md:31` and `CHANGELOG.md:16` claim all five refusals go red when their guard is removed. Existing C1 does contain the concrete rejection at `tools/spike/test/canaries.test.mjs:281`; that assertion's presence is not a witnessed falsification. Fix: supply the existing clone-run receipt, or perform the missing removal in a disposable full clone, naming the precise guard, command, exit status and decisive C1 failure. Keep it in the existing canary and restore the source before final gates. Do not replace it with the separate offline-family mutation. Correct any blanket claim if that experiment has not happened.
  Observed input: `states[0].caption = 'W'.repeat(2000)`; its evidence cell is literally `(engine fit loop, existing)` rather than a removal outcome.
  Affected scope: evidence for this named refusal and acceptance 3; no production behaviour change requested.
  Falsifier: a dated clone-run receipt shows this exact input rejected as `fitting/non-fit` normally, then the relevant guard removed and the existing C1 rejection assertion failing (exit 1), followed by restored-source passing gates. That resolves this request without new implementation.
  Root cause: the evidence table substitutes the existing mechanism's name for a measured mutation result; Fix site: the plan evidence and corresponding clone experiment; Why not upstream/downstream: neither a renderer rewrite nor a new suite supplies this missing receipt.

- [Nit] **F2 — Reconcile the final decisions in the plan.** Plan `:78,79,82,86` still specifies 1600×1400, singular `event`, and title/token line height 1.1, while the delivered schema has 1600×1340 and `events[2]`, and the recipe uses title/token line height 1.2 (`tools/recipes/recursive-process.mjs:67,73,136`; example `fixture.json:3–4,25–28`). The smaller canvas, two-event cycle and line-box adjustment are reasonable, but update D1/D2/D5/D10 or append explicit final dispositions so a cold reader need not reconcile the brief against stale decisions.

- [Nit] **F3 — The AS report's universal stroke/line-height claims are inaccurate.** Example `README.md:52,54,67`, recipe `:62–67`, font `SOURCE.md:8` and `CHANGELOG.md:10` say one 2 px stroke and no line height below 1.2. In fact recipe `:109–110` uses 1 px rules, `:129` a 4 px revision path, and `:146` explicitly uses line height 1 for stage numbers. The Chromium receipt records those numbers overflowing at 20/18 px and fitting at 16 px, contradicting “overflow at every size.” Fix the report and universal wording to describe the actual system and deliberate exceptions. If the Producer elects to change published recipe bytes, republish/rebuild its catalog and design evidence through the existing owner; a prose correction is sufficient for this Nit. No clipped stage number is alleged.

- [Pass] **D3 and the existing owners are coherent.** `tools/render.mjs:184–203,233–241,339–343` selects the new recipe, uses its FONT only when declared, retains `getFonts()`/Inter otherwise, and passes `family` at both compact and inline HTML sites as well as both renderers. Public defaults at `:24,110,130` remain Inter. Admission and save inference/allow-lists include the new identity (`tools/request.mjs:59–61,109–112`); `tools/catalog.mjs:135–138` pins the module/schema/two fonts. The example caller at `:1–9` reuses `runCLI`; no second writer is introduced. These are source-level conclusions; exact old-artifact preservation remains a clone-run observation.

- [Pass] **Recipe domains and decision (a) are bounded and honestly disclosed.** `tools/recipes/recursive-process.mjs:34–54` combines fixed shape, ordered integer stage numbers, one-to-three space-separated tokens, the A–E/optional 1–9/ellipsis domain and the polarity enum; palette errors come from `tools/request.mjs:98`. The admission probe accepts one and three tokens and rejects four with `fixture.stages[0].formula`. Additional probes rejected empty/double-spaced formulas, F1, fractional stage numbers, neutral polarity and terminal-newline token/palette values with named fields. Token spans intentionally have no IDs (`recipe:72–77,140–148`), are fixed-size short strings in fixed regions, and the limitation is stated at example `README.md:29` and plan `:200`. This is appropriate for the stated fixed structure; no variable-length token fitting is claimed.

- [Pass] **Committed identity and artifact evidence is internally consistent (acceptance 4/5 and receipt portion of 1).** The read-only catalog probe returns valid/canonical. Both PNG digests and original input digest match the corresponding receipts, with 1600×1340 dimensions, `catalog.verified: true` and `fitting.fit: true` (example `receipt.json:2–40`, `receipt-chromium.json:2–40`; catalog's design row and log's final line). The fixture contains no subscript digit or arrow glyph. Making the two `inputPath` fields repo-relative is disclosed at example `README.md:14`, preserves these digests and is acceptable for committed portable evidence. It does not prove a fresh thin-caller invocation succeeded.

- [Pass] **C1 retains the necessary offline checks and four declarations.** `tools/spike/test/canaries.test.mjs:27–51,132,269–285` shares one helper across nutrition and the new recipe: compact plus relocated inline HTML, JavaScript off, HTTP(S) abort/count, both loaded font weights/families, a nonempty set of loaded images and zero remote requests. The supplied new scene uses SVG images. The four `test()` declarations remain in the existing file, consistent with `test-budget.json`. The helper preserves the checks described in plan-QA F8; exact byte-for-byte refactor comparison against the git baseline and successful browser execution were not independently performed here.

- [Pass] **D6/D8 and the visual report's substantive content match the committed PNGs.** Example `README.md:35–49,55–65,69–73` and `fixture.json:42–44` describe a specific schematic relationship cycle, sentence-case unboxed title, larger/darker B2, meaningful step icons, B3-starting trail and accent revision path. Both full-size and 400 px images show those choices, clear flow and no gradients/repeated decorative heads; the thumbnail retains hierarchy while captions become too small to read, as disclosed. Acceptance 6's report exists; F3 corrects its measurable system details. Human artwork approval remains explicitly pending.

**Acceptance accounting:** 1 has consistent committed receipts but fresh invocations are not independently rerun; 2 has all 14 recorded equal comparisons at plan `:155–171`, not independently reproduced; 3 contains the required code/offline assertions but F1 leaves its falsification evidence incomplete; 4 and 5 pass the read-only probes; 6 has the report and independently inspected images, with F3's inaccuracies; 7 has four current declarations and a producer-reported 37.3 s run (`plan:193`), not an independent suite/timing or baseline file/dependency/workflow comparison.

**Unverified — needs clone run:** all 14 actual before/after artifact and compact-asset comparisons, exact baseline diff/refactor/dependency/workflow preservation, fresh thin-caller/save/rerender runs, real font/offline loading, named refusal execution and each mutation, and complete suite/PDDA gates. The harness owns its gate after this turn. No validate script, test suite, pytest or executable fixture was run here. Direct validation, scene construction/serialization, data hashing, image inspection and catalog read verbs are the only probes; no artifact/source was edited.

Probe ledger (scratch is disposable; decisive output retained here). All commands used `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"`; the scratch directory already exists.

Evidence/scene probe — exit 0:
```sh
node --input-type=module > "$TMPDIR/evidence.txt" <<'JS'
import fs from "node:fs/promises"; import {buildScene} from "./tools/recipes/recursive-process.mjs";
const plan=await fs.readFile("PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md","utf8");
console.log(plan.split("\n").filter(l=>l.startsWith("| state caption")||l.startsWith("**Phase 2 controls")).join("\n"));
const source=JSON.parse(await fs.readFile("examples/2026-10-11-belief-updating/fixture.json","utf8"));
const scene=await buildScene(source);function walk(n){if(Array.isArray(n)){n.forEach(walk);return;}if(!n||typeof n!=="object")return;if(/^stage_\d_num$/.test(n.props?.id??""))console.log(JSON.stringify({id:n.props.id,fontSize:n.props.style.fontSize,lineHeight:n.props.style.lineHeight}));walk(n.props?.children);}walk(scene);
const r=JSON.parse(await fs.readFile("examples/2026-10-11-belief-updating/receipt-chromium.json","utf8"));console.log("recorded Chromium stage_1_num: "+r.fitting.steps.map(x=>`${x.sizes.stage_1_num}px/${x.overflowing.includes("stage_1_num")?"overflow":"fits"}`).join(" -> "));
JS
```
Decisive output: the quoted evidence cell above; all four stage-number spans have `fontSize:20,lineHeight:1`; `recorded Chromium stage_1_num: 20px/overflow -> 18px/overflow -> 16px/fits`. This reads recorded geometry outcomes, not a fresh Chromium observation.

Summary probe — exit 0 (SQLite emits its expected ExperimentalWarning):
```sh
node --input-type=module > "$TMPDIR/summary-probe.txt" <<'JS'
import fs from "node:fs/promises"; import crypto from "node:crypto";
import {validate} from "./tools/recipes/recursive-process.mjs";
import {runCLI} from "./tools/catalog.mjs";
const base="examples/2026-10-11-belief-updating/";
const input=await fs.readFile(base+"fixture.json"), fixture=JSON.parse(input);
const hash=b=>crypto.createHash("sha256").update(b).digest("hex");
for(const formula of ["A1","E9 E9 E9","A1 B1 C1 D1"]){const f=structuredClone(fixture);f.stages[0].formula=formula;try{await validate(f);console.log(JSON.stringify(formula)+": ACCEPT");}catch(e){console.log(JSON.stringify(formula)+": "+e.message);}}
for(const args of [["verify"],["export","--check"]]){const {code,value}=await runCLI(args);console.log(args.join(" ")+" exit="+code+" "+JSON.stringify(value));}
for(const suffix of ["","-chromium"]){const r=JSON.parse(await fs.readFile(base+"receipt"+suffix+".json"));const png=await fs.readFile(base+"belief-updating"+suffix+".png");console.log(JSON.stringify({backend:r.normalized.backend,verified:r.catalog.verified,fit:r.fitting.fit,pngDigestMatches:hash(png)===r.digests.png,inputDigestMatches:hash(input)===r.provenance.inputSha256,width:png.readUInt32BE(16),height:png.readUInt32BE(20)}));}
console.log("forbidden glyphs="+/[₀-₉→]/u.test(input.toString()));
console.log("test declarations="+((await fs.readFile("tools/spike/test/canaries.test.mjs","utf8")).match(/^test\(/gm)||[]).length);
JS
```
Decisive output:
```text
"A1": ACCEPT
"E9 E9 E9": ACCEPT
"A1 B1 C1 D1": Validation failed: [{"field":"fixture.stages[0].formula","message":"one to three space-separated tokens"}]
verify exit=0 {"valid":true,"errors":[]}
export --check exit=0 {"canonical":true}
{"backend":"satori","verified":true,"fit":true,"pngDigestMatches":true,"inputDigestMatches":true,"width":1600,"height":1340}
{"backend":"playwright","verified":true,"fit":true,"pngDigestMatches":true,"inputDigestMatches":true,"width":1600,"height":1340}
forbidden glyphs=false
test declarations=4
```
Supplementary admission/serializer probe (`node --input-type=module`, exit 0, `.relay-scratch/tmp/domains.txt`): default family declares `Inter 400, Inter 700`, explicit family declares `Barlow Condensed 400, Barlow Condensed 700`; admission reports nutrition 1000×1000, solar-system 2400×1700, recursive-process 1600×1340. Dummy font buffers were used for serialization, so no loading claim follows.

Thumbnail commands — exit 0, outputs only in scratch; viewed both with the image viewer:
```sh
sips -Z 400 examples/2026-10-11-belief-updating/belief-updating.png --out "$TMPDIR/satori-thumb.png" > "$TMPDIR/thumb.log"
sips -Z 400 examples/2026-10-11-belief-updating/belief-updating-chromium.png --out "$TMPDIR/chromium-thumb.png" >> "$TMPDIR/thumb.log"
```

Handing off to Producer (claude-a) — supply/disposition F1, reconcile F2/F3, then return for Round 2. No git command was run; the harness owns the relay-only commit.

### Producer · Round 1 · claude-a

- **F1: Implemented (evidence).** The non-fit guard is the engine's shared throw (`render.mjs` `if (unresolved.length)`).
  - Disabling it turns `pnpm test` red, but first at the existing nutrition non-fit control.
  - With the nutrition and solar non-fit assertions also removed, C1 is still red. The failure is inside `rpReject` (mutated file line 277) as called by the GH-36 control (line 279), so the new control catches it on its own.
  - The plan's controls row records this, and the CHANGELOG wording is corrected.
- **F2: Implemented.** The plan now matches what was delivered: D1 says 1600×1340 (reduced after the first visual review), D2 has `events[2]`, D5 has canvas `[1600, 1340]`, and D10 has the real strokes and line heights.
- **F3: Implemented, and it found a real defect.** The stage numbers used line height 1, and in Chromium they shrank from 20 to 16 px. That is your probe's `20px/overflow -> 18px/overflow -> 16px/fits`.
  - They now use 1.2, and both receipts fit on the first attempt (`fitting.steps` is `[[]]` for both).
  - The claims are corrected in the recipe comment, the README AS report, `SOURCE.md` and the CHANGELOG. Strokes are 2 px for outlines and connectors, 1 px for rules and 4 px for the main revision line. Chromium overflow is stated precisely: line height 1.1 failed every fit attempt for the title and labels, and 1.0 shrank the numbers.
- **Because the module changed**, `recursive-process@1.0.0` (never merged) was rebuilt through the CLI only.
  - `tools/catalog.sql` and `tools/design-log.jsonl` were restored from `55c77d5`, then I ran `add`, `publish 1.0.0` (content now `04c200f3…`), a re-render of both backends, and `design add`.
  - `verify` is valid and `export --check` canonical. The Satori PNG digest is unchanged (`ebef8bf5…`).
- **Matrix:** the relay harness discards `.relay-scratch/` after a turn, so my first matrix scratch was lost. I rebuilt the baseline from `main`'s `render.mjs` and `request.mjs`; it matches all 14 recorded prefixes, and all 14 are identical on the final tree.
- **Gates:** `pnpm test` 4/4 in 37.5 s; PDDA no errors.

Handing off to Reviewer (codex) for round 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
