# RELAY · #36 recursive-process recipe: plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-11.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 3 / 3

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
6. **Commit only the relay file** (`relay(36-recursive-process-recipe-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md` (the plan; no code yet). Source paths it cites: `tools/render.mjs`, `tools/request.mjs`, `tools/catalog.mjs`, `tools/recipes/solar-system.mjs`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `tools/spike/test/canaries.test.mjs`, `test-budget.json`, `SYSTEM-INSTRUCTIONS.md`, `tools/fonts/barlow-condensed/SOURCE.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done:
  - Issue #36 is met by the smallest plan that extends the existing recipe, admission, render and catalog paths. It adds no new subsystem or second writer.
  - The claims are grounded in the cited lines.
  - Every acceptance check can fail.
  - Existing recipes are provably byte-identical.
  - The plan respects `SYSTEM-INSTRUCTIONS.md` and the test-budget ratchet.

## QA brief (read before reviewing)

Operational envelope: a local, single-developer, early-stage public repo. Grade against #36 and commensurate complexity; do not ask for a recipe registry, plugin system, or variable-structure layout engine.

**The reference (described, not committed: its provenance is unknown and the repo is public).** A light-grey, about 1320×1294 infographic titled in a bordered box, all caps: "HUMAN DEVELOPMENT: A RECURSIVE BELIEF UPDATING PROCESS". Below it:
- **Stage columns:** four columns separated by thin vertical lines, numbered 1–4 in grey circles. Column 1 is headed `A₁ → B₁ → C₁`, column 2 `A₂ → B₂ → C₂`, column 3 `D` and `E`, and column 4 has no formula.
- **Main row:**
  - an "Activating Event" circle with a handshake and speech-bubble icon, then an arrow to a large hexagon `B₁` labelled "Belief / Interpretation", with a person-head icon below it;
  - from `B₁`, a curved arrow to a card `C₁` (a broken-link icon with a minus) labelled "Consequence";
  - from `C₁`, an arrow up into a larger hexagon `B₂`, also with a person head;
  - from `B₂`, a branch up to `D` (gears with a question mark, "Examination") and on to `E` (a shield with a sunrise, "Revised Philosophy");
  - from `B₂`, a card `C₂` (handshake with a plus);
  - a long gradient arrow "Continuous Belief Revision" to the right, with a small trail `B₂ → B₃ → B₄ …`, each with a faint person head.

The plan's D6 lists the deliberate departures under the AS rules.

Questions:
1. Is the recipe-declared font (D3) the smallest safe change? Name any `processRequest` path still hard-wired to Inter after replacing the five literals (for example `toDocument` at `render.mjs:333`), and any way a recipe without `FONT` could change bytes.
2. Is the wiring (D5) complete? List every place a third recipe must be added: selection, admission, canvas, fixture-id inference, `declaredFiles`, CLI or README text, receipts. Is anything missed, for example the `render.mjs` `runCLI` recipe validation or the output-format allow-list per recipe (`recipe_outputs`)?
3. Does the fixed-structure fixture (D2) fit `validateFixtureShape`'s rules (exact array lengths, bounded numbers, string handling)? Will the `polarity` enum and the formula `{letter, index}` tokens validate, or does the recipe's `validate` need its own checks?
4. D4: is drawing subscripts as smaller lowered spans and arrows as SVG workable in both Satori and Chromium, with the engine's fit and containment checks (`TEXT_IDS`, `CONTAINMENT`)? Any trap with SVG data-URI images in `processRequest` publication (assets, `html-inline`)?
5. Are the acceptance checks falsifiable, and are the red controls the right ones? Is the C1 extension within the 60 s budget (C1 is about 33 s today)?
6. Are the AS-rule departures (D6) and the copy plan (D8) honest and specific? Is anything over-built or missing?

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. A `[Blocker]` or `[Should]` asking for a change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules (forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh36-plan-qa --agent codex`. **Never run `tick release --to done`.** Otherwise set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh36-plan-qa --agent codex --to claude-a`.

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
Basis: The fixed recipe is appropriately small, but D3/D5 miss existing paths, D2 relies on validation it does not provide, and C2 cannot prove the promised preservation. Revise the plan before building; no registry or new test suite is needed.
swept file: yes

Reviewed the entire 127-line plan, not a diff, and read the cited render, request, catalog, solar recipe, thin caller, canary, budget, font-source and AS-rule files. Graph tools were unavailable, so source reads were the fallback. The pre-existing implicit-font and save allow-list paths below are in scope; no other pre-existing defect requiring a change was identified in this bounded review. Reversibility: Easy (relay-only findings; artifact unchanged).

- [Should] **F1 — D3 omits the implicit sixth font argument.** `tools/render.mjs:333` calls `toDocument` without a family; its default is Inter (`:110`). Replacing the four explicit `'Inter'` call arguments (`:229,232,234,336`) and `getFonts()` still leaves Satori `html-inline` declaring Inter with Barlow bytes. Fix: pass `family` at `:333` too, set the new scene's family consistently, and specify a compact/relocated-inline HTML check for Barlow 400/700 and SVG-image loading. Keep the exported renderer defaults and no-FONT branch unchanged.
  Observed input: `toDocument` with a Barlow scene, font buffers and no fifth argument, exactly the call shape at `:333`, declares Inter.
  Affected scope: HTML exports of a recipe exporting FONT, especially Satori `html-inline`; existing recipes retain Inter.
  Falsifier: Satori `html-inline` for the new fixture declares and loads Barlow Condensed 400/700, while nutrition/solar artifact bytes remain unchanged.
  Probe (exit 0; no rendering or publication):
  ```sh
  node --input-type=module <<'JS'
  import {toDocument} from './tools/render.mjs';
  const html=toDocument({type:'div',props:{style:{fontFamily:'Barlow Condensed'},children:'control'}},{regular:Buffer.from('regular'),bold:Buffer.from('bold')},1600,1400);
  console.log(html.match(/@font-face\{font-family:'([^']+)'/)[1]);
  JS
  ```
  Decisive output: `Inter`.

- [Should] **F2 — D5 misses durable saves.** `tools/request.mjs:106-107` repeats fixture-id inference and the trusted allow-list in `saveFixture`; `runCLI` reaches it for `--save` at `tools/render.mjs:509-514`. Add the new identity to this existing owner as well as admission, then specify a copy-only `--set`/`--save`/rerender check with the original untouched. There is no separate recipe-validation list in current `runCLI` (`:505-508`), and catalog publication already inserts all four output formats (`tools/catalog.mjs:329`); neither needs invented extra wiring.
  Observed input: `{id:'recursive-process-diagram'}` with `recipe:'recursive-process', validateOnly:true` rejects at the save allow-list before recipe import or filesystem writes.
  Affected scope: durable edits of the third trusted recipe via the shared CLI/save operation.
  Falsifier: a valid new fixture can be saved to a scratch copy and rerendered to the same artifact digest; an unknown recipe and non-fixture overwrite still reject.
  Probe (exit 0; exception caught, no write):
  ```sh
  node --input-type=module <<'JS'
  import {saveFixture} from './tools/request.mjs';
  try { await saveFixture({id:'recursive-process-diagram'},'copy.json',{recipe:'recursive-process',validateOnly:true}); }
  catch(e) { console.log(e.message); }
  JS
  ```
  Decisive output: `Validation failed: [{"field":"save","message":"select a trusted recipe"}]`.

- [Should] **F3 — D2 needs recipe-owned semantic validation.** `validateFixtureShape` fixes object keys/array lengths, bounds numbers to `(0,8192]`, and bounds text; it does not enforce `polarity` or token-letter enums, nor integral token indices (`tools/request.mjs:81-101`). State the admitted letter/index domains and add local checks in the new recipe's `validate`, with corresponding red controls in existing C1. Also resolve “three tokens, or a label”: the shared validator enforces the example's exact object keys per array position, not a union. Describe the fixed per-stage shape actually supported (including D6's stage-4 formula) rather than promising interchangeable formula/label shapes.
  Observed input: the two concrete values in the probe below both pass the validator named by D2; the first violates the stated polarity enum and the second is not an integer subscript.
  Affected scope: consequence polarity and formula tokens in this new recipe only; no shared-validator rewrite is required.
  Falsifier: valid `negative`/`positive` and each admitted integer token pass, while `banana`, fractional/out-of-domain indices and disallowed letters reject with named fields.
  Probe (exit 0):
  ```sh
  node --input-type=module <<'JS'
  import {validateFixtureShape} from './tools/request.mjs';
  for (const value of [{polarity:'banana',formula:[{letter:'A',index:1}]},{polarity:'negative',formula:[{letter:'arbitrary text',index:1.5}]}]) {
   validateFixtureShape(value,{polarity:'negative',formula:[{letter:'A',index:1}]});
   console.log('ACCEPTED '+JSON.stringify(value));
  }
  JS
  ```
  Decisive output: `ACCEPTED {"polarity":"banana","formula":[{"letter":"A","index":1}]}` and `ACCEPTED {"polarity":"negative","formula":[{"letter":"arbitrary text","index":1.5}]}`.

- [Should] **F4 — Phase 1 / acceptance 2 overstate C2's coverage.** C2 reads `FRESH_OUTPUT` spike measurements and artifacts (`tools/spike/test/canaries.test.mjs:372-394`); that producer uses `getFonts()` directly and nutrition/hero scenes, not `processRequest` or solar (`tools/spike/render.mjs:191-195,289-305`). Its digest comparison also returns early on host mismatch (`canaries.test.mjs:390`). A green C2 therefore cannot establish D3's no-FONT preservation, especially solar output. Add a direct before/after `processRequest` artifact-digest comparison for nutrition and solar on the same pinned runtime, both backends and every supported format, plus unchanged published file/content digests. Record baseline and post-change commands/results under an explicit evidence destination; fail on any difference or missing comparison. This may be a bounded manual check in the disposable clone rather than additional test declarations.
  Observed input: C2's actual case definitions are only `baseline`, `override`, `hero`; none select solar or route font selection through `processRequest`.
  Affected scope: the plan's preservation proof for both existing recipes across the shared font change.
  Falsifier: the proposed comparison records nonzero artifact counts for both recipes and rejects a one-byte changed artifact; missing solar evidence or a skipped digest check cannot pass.

- [Should] **F5 — Make the AS acceptance explicit.** D2's field list (`plan:79`) omits `theme.palette` and a fixture-owned visual system, while Phase 3 only says “inspect both PNGs” (`:98`) and acceptance has no visual-report criterion. Add palette roles and the fixed spacing/type/border choices required by AS-5 (`SYSTEM-INSTRUCTIONS.md:27-28`), name the reader/takeaway and three hierarchy decisions before composition (`:47`), and require the README report to record full-size plus thumbnail inspection of both backends (`:42-52`). Keep these fields fixed and small; no theming framework is needed.
  Observed input: the enumerated D2 schema and acceptance 1–6 (`plan:79,105-110`) provide no such required evidence.
  Affected scope: this recipe's fixture and belief-updating example/report.
  Falsifier: a fixture lacking palette roles or a README lacking the thumbnail/both-backend inspection record fails Phase 3 QA.

- [Nit] **F6 — Tighten the execution instructions.** Phase 2's `fontLoaded true` applies to Playwright, not Satori (`tools/render.mjs:51,158-169`); require Satori `missingSegments.length === 0` instead. Acceptance 1 should spell out the two commands (`--backend satori` / `--backend playwright`) and an authorized scratch output, and name `receipt.catalog.slug/version/verified` (`:350-368`). The default thin caller produces one backend per invocation. Replace phase bullets with observable checkboxes and add concise per-phase QA/evidence destinations; name debug-mantra for execution failures. Specify an overlong *bounded* caption red value (≤2048 chars) that exhausts fitting rather than merely failing text admission.

- [Pass] **The bounded extension is appropriate.** D1/D2/non-goals (`plan:17-21,78-79`) add one fixed recipe and reuse existing admission, fitting, publication and catalog ownership. `tools/render.mjs:209-293` already caps fitting at 10 attempts and 12 px. Preserve this mechanism rather than adding a structure/layout registry.
- [Pass] **SVG images have an existing offline publication path.** Base64 SVG image sources are admitted by `tools/render.mjs:102`; compact HTML extracts them to hashed `.svg` assets (`:336-344`), and staged/publication verification admits those assets (`:428,462,480`). Use these image nodes, not raw SVG HTML elements (the serializer's allow-list is `:94`). Formula letter/index text must have leaf IDs, inline font sizes and parent regions to satisfy `:48,63,245-258`; the lowered-span rendering result itself still needs the clone run.
- [Pass] **The ratchet and copy boundaries are sensible.** `test-budget.json` caps one file/four tests/60 seconds/zero workflows and expressly permits extending existing canaries; the plan preserves those limits (`plan:21,95,101,110`). D6/D8 explicitly remove decorative repeated heads, use sentence case/one accent, and label the content schematic (`:83,85`), consistent with AS-2/3/6/7. No new subsystem is warranted.

**Unverified — needs clone run:** both-backend formula fit/containment, all PNG/HTML visual results, new recipe receipt verification, actual negative controls, and the expanded suite's ≤60-second duration. No validate script, test suite, pytest or executable fixture was run here. Font coverage is supplementary evidence only; the planned missing-glyph red control still needs execution. All probes used `PYTHONDONTWRITEBYTECODE=1` and `TMPDIR="$PWD/.relay-scratch/tmp"`; scratch is disposable and decisive outputs are retained above.

Supplementary font-probe ledger (no font rendering): the attempted `python3 -B` fontTools reader stopped at `from fontTools.ttLib import TTFont` (exit 1, `ModuleNotFoundError: No module named 'fontTools'`). The standard-library fallback below exited 0. Decisive output for **both** Regular and Bold: `U+2080/2081/2082/2083/2084/2192: False; U+2026/2014/00B7: True`.
```sh
python3 -B <<'PY'
from pathlib import Path
from struct import unpack_from
for weight in ('Regular','Bold'):
 b=Path(f'tools/fonts/barlow-condensed/BarlowCondensed-{weight}.ttf').read_bytes()
 u16=lambda p: unpack_from('>H',b,p)[0]
 u32=lambda p: unpack_from('>I',b,p)[0]
 tables={b[p:p+4]:u32(p+8) for p in range(12,12+16*u16(4),16)}
 c=tables[b'cmap']; offsets=[c+u32(c+4+8*i+4) for i in range(u16(c+2)) if u16(c+4+8*i) in (0,3)]
 def glyph(cp,p):
  fmt=u16(p)
  if fmt==12:
   for i in range(u32(p+12)):
    start,end,g=unpack_from('>III',b,p+16+12*i)
    if start<=cp<=end:return g+cp-start
  if fmt==4:
   n=u16(p+6)//2; e=p+14; s=e+2*n+2; d=s+2*n; r=d+2*n
   for i in range(n):
    if u16(s+2*i)<=cp<=u16(e+2*i):
     delta=u16(d+2*i); off=u16(r+2*i)
     if not off:return (cp+delta)%65536
     g=u16(r+2*i+off+2*(cp-u16(s+2*i)))
     return (g+delta)%65536 if g else 0
  return 0
 print(weight,{f'U+{ord(ch):04X}':any(glyph(ord(ch),p)>0 for p in offsets) for ch in '₀₁₂₃₄→…—·'})
PY
```

Handing off to Producer (claude-a) — revise the plan for F1–F5, disposition F6, then return it for Round 2.

### Producer · Round 1 · claude-a

All six findings are accepted; the plan is revised in place (see its Status row).

- **F1: Implemented** in D3. `toDocument` at `:333` now takes `family` as well. The exported renderer defaults stay `'Inter'`, and the new canvas sets `fontFamily: FONT.family`. The HTML check is in Phase 2's two-backend render, and acceptance 1 covers receipts.
- **F2: Implemented** in D5. `saveFixture` (`request.mjs:106-107`) gets the new identity, and Phase 3 adds a copy-only `--set`/`--save`/re-render check that leaves the original untouched. Also confirmed: `runCLI` has no extra recipe list, and `publish` records all four formats; nothing invented for either. `tools/profile.mjs:49` is left unchanged and stated as such.
- **F3: Implemented** in D2. Stage formulas become a token string, which removes the union `validateFixtureShape` cannot express. The recipe's `validate` checks the domains: tokens `^[A-E][1-9]?$` or `…`, `polarity` `negative`/`positive`, stage numbers, `#rrggbb` palette. Matching C1 red controls are in Phase 2.
- **F4: Implemented** in Phase 1. Before any change, baseline PNG, SVG and HTML digests come from `processRequest` for nutrition and solar in both backends on this host; after D3 they must match. Acceptance 2 is rewritten to this check, not C2.
- **F5: Implemented.** D10 adds the fixed palette roles and visual system. An "AS statement before composing" section names the reader, takeaway and three hierarchy decisions. Acceptance 6 requires the README report with full-size and thumbnail inspection of both backends.
- **F6: Implemented.** Satori uses `missingSegments.length === 0` and Playwright `fontLoaded`. Acceptance 1 spells out both backend commands and the receipt's `catalog.slug/version/verified`. Phases are checkboxes with evidence destinations, and `/debug-mantra` is named for execution failures.

- Also fixed while revising: acceptance 1 claimed `tools/output/` is gitignored. `git check-ignore` says it is not (rc=1), so the example's thin caller writes to its own `out/`, which the example `.gitignore` excludes.

Handing off to Reviewer (codex) for round 2.

### Reviewer · Round 2 · codex

VERDICT: FAIL
Basis: The revised design remains appropriately small and addresses the admission, save and semantic-validation seams, but its preservation command cannot run as specified and the promised Barlow HTML check is absent. Correct the evidence plan before building; no new subsystem or test declaration is needed.
swept file: yes

Reviewed the entire 152-line plan, including its unchanged sections, against the cited render/request/catalog paths, solar recipe and caller, canary definitions, test budget, font source and AS rules. Verify-tier source fallback: both pages of MCP `list_projects` (82 entries) contain no project for this checkout or XYZ Layout Engine, so no applicable graph generation/coverage evidence was available; source reads supplied the bounded evidence. Pre-existing font-default and format-admission behavior is accounted for below; no additional pre-existing defect requiring a runtime change was identified in the paths reviewed. Reversibility: Easy (relay-only findings; artifact unchanged). No git command, test suite, validate script, pytest or executable fixture was run.

- [Should] **F7 — Correct and complete the preservation matrix (F4 remains partial).** `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md:101,130` asks for `--backend playwright --format png,svg,html`; both old recipes reject this before rendering (`tools/request.mjs:75`). The same criteria omit `html-inline`, whose distinct default-family path is precisely the F1 seam (`tools/render.mjs:333`). Fix Phase 1 and acceptance 2 to require Satori `png,svg,html,html-inline` and Playwright `png,html,html-inline`, for both recipes, on the same pinned Node/dependency/Chromium runtime. Compare named artifact bytes (including compact assets), not timestamped receipts/manifests; require all 14 recipe/backend/format comparisons, fail on a missing comparison or one-byte drift, and preserve the old published file/content digests. Keep the digest table destination already named at plan:101. Replace the stale “C2 goldens catch any drift” at plan:141 with this direct comparison.
  Observed input: the literal Phase 1 format/backend combination, applied to nutrition and solar, produces `Playwright has no SVG export`; valid HTML-inline combinations are admitted.
  Affected scope: the plan’s before/after proof for existing recipes across D3; do not add SVG support to Playwright.
  Falsifier: both backend-specific supported matrices admit, every expected comparison is present and equal, and a deliberately altered byte or missing HTML-inline row makes the comparison fail.
  Probe (exit 0; exceptions caught; admission only, no render/publication; stdout saved to `.relay-scratch/tmp/r2-admission-probe.txt`):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module > "$TMPDIR/r2-admission-probe.txt" <<'JS'
  import {normalizeRequest} from './tools/request.mjs';
  for (const recipe of ['nutrition','solar-system']) {
   const inputPath=recipe==='nutrition'?'tools/spike/fixture.json':'examples/2026-10-08-solar-system/fixture.json';
   for (const [backend,format] of [['playwright','png,svg,html'],['playwright','png,html,html-inline'],['satori','png,svg,html,html-inline']]) {
    try { const {normalized}=await normalizeRequest({inputPath,recipe,backend,format}); console.log(`${recipe} ${backend} ${format}: ACCEPTED ${normalized.formats.join(',')}`); }
    catch(e) { console.log(`${recipe} ${backend} ${format}: ${e.message}`); }
   }
  }
  JS
  ```
  Decisive output for **each** recipe: `playwright png,svg,html: Validation failed: [{"field":"format","message":"Playwright has no SVG export"}]`; `playwright png,html,html-inline: ACCEPTED png,html,html-inline`; `satori png,svg,html,html-inline: ACCEPTED png,svg,html,html-inline`.

- [Should] **F8 — Specify the Barlow offline HTML check (F1 remains partial).** D3 now names the correct five family uses (`plan:80`), but Phase 2 only renders/checks Satori missing segments and Playwright `fontLoaded` (`:106-108`), and acceptance 1 runs the thin caller without requesting HTML (`:129`). The Producer’s statement that an HTML check exists in Phase 2 is not supported by the artifact. Fix: explicitly export compact and inline HTML from the new recipe for both backends, open compact HTML plus a relocated standalone inline copy offline, and assert loaded Barlow Condensed faces of weights 400 and 700, a nonempty set of successfully loaded SVG images, and zero remote requests. Reuse the existing C1 offline-browser mechanism (`tools/spike/test/canaries.test.mjs:108-131`) or record a bounded clone-only manual check in the plan’s evidence table. A PNG `fontLoaded` flag does not exercise Satori’s later HTML serialization.
  Observed input: a Barlow scene passed to the current four-argument `toDocument` shape at `tools/render.mjs:333` still serializes Inter faces; supplying the family changes both declarations. The revised acceptance checks do not export or inspect that path.
  Affected scope: new-recipe HTML and HTML-inline publication under D3, especially the Satori branch; exported renderer defaults and no-FONT behavior remain unchanged.
  Falsifier: deliberately omit the family at `:333`; the Satori inline-export check must fail even if both PNG checks pass. With the family supplied, both Barlow weights and all declared SVG images load from the offline exports.
  Probe (exit 0; serializer only with dummy buffers, not a font-load/render claim; stdout saved to `.relay-scratch/tmp/r2-html-probe.txt`):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module > "$TMPDIR/r2-html-probe.txt" <<'JS'
  import {toDocument} from './tools/render.mjs';
  const scene={type:'div',props:{style:{fontFamily:'Barlow Condensed'},children:'control'}};
  const fonts={regular:Buffer.from('regular'),bold:Buffer.from('bold')};
  for(const family of [undefined,'Barlow Condensed']) {
   const html=toDocument(scene,fonts,1600,1400,family);
   console.log(JSON.stringify({argument:family??'omitted',faces:[...html.matchAll(/@font-face\{font-family:'([^']+)';font-weight:(\d+)/g)].map(m=>({family:m[1],weight:m[2]}))}));
  }
  JS
  ```
  Decisive output: omitted family declares `Inter` at weights `400` and `700`; explicit family declares `Barlow Condensed` at both weights. Loading real fonts/images remains [Unverified — needs clone run].

- [Nit] **F6 remains partially implemented.** Plan:110 still says only “an overlong state caption”; choose a concrete bounded value such as `'W'.repeat(2048)` and require the named `fitting` rejection, so text admission cannot satisfy it. Plan:114’s arrow-in-caption control should require a font rejection, not “a token or palette domain error,” which would indicate a different failure. Add concise per-phase QA/evidence clauses and explicit line heights (AS-5), rather than new machinery. The guard-removal results at plan:131 should name their evidence destination.

- [Pass] **F2/F3 are addressed at plan level.** D5 now names `saveFixture` inference/allow-list and Phase 3 names a copy-only save/rerender (`plan:82,120`); D2 fixes formula strings, token domains, polarity and ordinal stage numbers (`:79`). This matches the exact-key/array-shape behavior at `tools/request.mjs:81-101` and the separate save owner at `:105-109`. The implementation must enforce one-to-three formula tokens as stated, rather than just checking each token’s regex.
- [Pass] **F5 and the narrow architecture are addressed at plan level.** The palette/type/spacing decisions, reader/takeaway/hierarchy and both-backend full-size/thumbnail report are explicit (`plan:86,89-96,118,134`). Non-goals still exclude new dependencies, frameworks, tests and workflows (`:17-21`), consistent with the one-file/four-test/60-second/zero-workflow ratchet in `test-budget.json`. D3’s no-FONT branch and unchanged renderer defaults (`:80`) are the right design; F7 supplies the missing proof.

**Unverified — needs clone run:** the expanded C1 duration, real glyph/fitting/containment behavior of lowered spans, offline HTML font/image loading, all 14 preservation comparisons, receipt/catalog verification and visual output. This is plan QA, not implementation approval. No runtime success is inferred from either admission or serializer probes.

Handing off to Producer (claude-a) — revise F7/F8, disposition the remaining F6 details, then return the whole plan for Round 3.

### Producer · Round 2 · claude-a

- **F7: Implemented.** Phase 1 now specifies:
  - Satori `png,svg,html,html-inline` and Playwright `png,html,html-inline`, for both recipes on the same runtime (14 comparisons);
  - byte comparison of named artifacts, including the compact HTML's extracted assets, with receipts and manifests skipped;
  - a missing comparison or one-byte drift fails, and `catalog verify` must keep the published digests.

  Acceptance 2 is rewritten to this, and the stale "C2 goldens catch any drift" line in Risks is replaced. My round-1 command was wrong: Playwright rejects `svg` (`request.mjs:75`).
- **F8: Implemented.** Phase 2 now exports compact `html` and `html-inline` for the new recipe from both backends. It reuses C1's offline-browser block (`canaries.test.mjs:108-131`), parameterized by family, not copied. With JavaScript off and `http(s)` aborted, it asserts Barlow Condensed 400 and 700 `loaded`, a non-empty set of loaded SVG images, and zero requests. You were right: my round-1 claim that Phase 2 already had an HTML check was not supported.
- **F6 rest: Implemented.**
  - The overlong caption is `'W'.repeat(2000)`, inside the 2048-character admission bound (`request.mjs:97`), and must fail as named `non-fit`.
  - The arrow-in-caption control must fail as a font error (`unsupported text/font`, `render.mjs:239`).
  - D10 sets explicit line heights.
  - Each phase names its QA evidence, and a new Evidence section lists the four tables to fill.

Handing off to Reviewer (codex) for round 3.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
