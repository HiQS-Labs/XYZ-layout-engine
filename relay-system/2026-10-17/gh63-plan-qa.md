# RELAY · GH-63 plan QA: vibe-coding loop example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-17.
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

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
