# RELAY · GH-55 plan QA: XYZ Forge diagram example
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
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
6. **Commit only the relay file** (`relay(gh-55-plan-qa-xyz-forge-diagram-example): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-55-XYZ-FORGE-DIAGRAM.md` (the plan). Drafted sources it
  describes, for grounding: `examples/2026-10-14-xyz-forge-system/{fixture.json,render-diagram.mjs,README.md}`.
  Precedents: `examples/2026-10-09-rag-system/render-diagram.mjs`, `PROJECT/3-COMPLETED/GH-11-RAG-DIAGRAM-EXAMPLE.md`,
  `examples/2026-10-12-belief-reference/{fixture.json,README.md}`, `tools/recipes/recursive-process.design.md`,
  `tools/render.mjs` (`renderSatori`, `renderPlaywright`), `SYSTEM-INSTRUCTIONS.md` (AS-1..AS-10), `test-budget.json`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Operational envelope: a single documentation example in a local, single-repo layout engine. Grade against
  the stated requirements and commensurate complexity. Do not ask for new tests (the repo's `test-budget.json`
  ratchet forbids them without a named failure mode), a new recipe, catalog machinery or image generation.
- Definition of Done: the plan is grounded in the actual paths; it satisfies the operator ask (redesign the
  supplied XYZ Forge system diagram with the belief-reference look and feel, saved in `examples/`); it extends
  the existing example pattern rather than building a parallel system; acceptance checks are falsifiable with
  a red control; rating and rollback are honest.

Questions:

1. Are the recon claims true? In particular: `recursive-process` cannot carry this subject without a new
   recipe; the RAG example's pattern and `tools/render.mjs` signatures match how `render-diagram.mjs` uses
   them; `missingSegments` is a real field.
2. Do requirements 2 and 3 capture content and style parity with the source and the belief reference? Are the
   stated simplifications (record connectors landing on the shelf as a whole; harness "writes evidence" and
   harness↔tick edges folded) acceptable, or do they misstate how the system works?
3. Does `render-diagram.mjs` keep one geometry owner and reuse the shared renderer, without duplicating
   renderer logic beyond what the RAG precedent already does?
4. Are the acceptance checks sufficient and falsifiable (including the red control), and is anything required
   missing (e.g. CHANGELOG, PDDA gate, `pnpm test` budget)?
5. Is the `rated 30/10/50/85` rationale honest (appeal neutral), and is the rollback statement accurate?

Flag anything wrong, missing or over/under-engineered, citing file:line. Set STATUS: Approved if it passes.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
