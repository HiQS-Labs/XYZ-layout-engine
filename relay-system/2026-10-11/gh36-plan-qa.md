# RELAY · #36 recursive-process recipe: plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-11.
-->

NEXT: Reviewer
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

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
