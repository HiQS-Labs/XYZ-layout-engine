# RELAY · GH-13 final QA: design-diagram skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
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
6. **Commit only the relay file** (`relay(gh13-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the committed implementation on branch feat/diagram-design-skill (diff main to HEAD): `skills/design-diagram/SKILL.md`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-13-DIAGRAM-DESIGN-SKILL.md`, `relay-system/2026-10-09/gh13-plan-qa.md`. Context: `examples/2026-10-09-rag-system/render-diagram.mjs`, `examples/2026-10-09-rag-system/fixture.json`, `examples/2026-10-09-rag-system/README.md`, `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-08-solar-system/render-diagram.mjs`, `PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md`, `tools/spike/assets.mjs`, `test-budget.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-09
- Definition of Done: issue #13 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/13) is satisfied exactly as the approved plan states (requirements 1-6): a design-diagram skill pointing at the RAG example with evidenced traps, hand-drawn SVG default, operator-requested install only, changelog entry; no scaffolder, dependency, test, workflow or engine change.

## QA brief (read before reviewing)

This is final QA of a finished, committed change. Operational envelope: one Markdown skill file (51 lines) for a local single-developer repo. Grade against issue #13, the approved plan and commensurate complexity. Do not ask for a scaffolder, tests, CI, or a shared runtime refactor.

Read the diff and the context files in full. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run renderers, tests or gates (the Producer's evidence is in the plan's Evidence section).

Questions:
1. Map plan requirements 1-6 to `skills/design-diagram/SKILL.md` lines. Anything missing or padded?
2. Truth check against the RAG example: do the claims in procedure steps 2 to 8 match `examples/2026-10-09-rag-system/render-diagram.mjs` (the `REQUIRED` set, `icons` object, lane keys `ingest`/`store`/`query`, `expectedText`, `assert.equal(found.length,10)`, footer rule at `H - 160` and footer block at `H - 132`, fixture keys read by name, `fixture.sources` unused, `source_note` string)? Quote any mismatch.
3. Do the seven trap rows' evidence pointers resolve to what they claim (the cited files, sections and line numbers)? Is any trap overclaimed beyond what the evidence shows (traps 4, 5 and 6 are labelled working patterns or build observations)?
4. Do the CHANGELOG entry and the plan's Evidence table claim only what was shown (path probe counts, three falsifiers, cold run PASS and three red controls, eight gaps found and fixed, not re-run cold)? Any overclaim?
5. Install section: is it safe and consistent with "does not install itself"?
6. Does the diff touch `tools/spike/**`, `package.json`, `test-budget.json`, add a test, workflow or dependency, or any accidental file?
7. Does the skill contradict `AGENTS.md`, `GUIDING-PRINCIPLES.md` or the repo's PR base (`main`)?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
