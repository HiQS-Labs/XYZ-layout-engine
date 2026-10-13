# RELAY · GH-8 close-out plan QA: Higgsfield CLI skill
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
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
6. **Commit only the relay file** (`relay(gh-8-close-out-plan-qa-higgsfield-cli-skill): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the plan section "## Close-out: the Higgsfield CLI skill (added 2026-10-12)" at the end of `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`. Nothing is implemented yet.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-12
- Operational envelope: one operator's local Mac, an agent following a Markdown skill to run the already-installed, already-signed-in `higgsfield` CLI a few times a week for diagram art. Not a service, not CI, not multi-tenant. Machinery must stay commensurate: the plan deliberately adds no script, test or dependency. Do not ask for a runner, a test, or a provider abstraction unless you can show a stated requirement that the plan cannot meet without it.
- Read in full: the plan section above; `SOP.md`; `skills/design-diagram/SKILL.md` (format and install pattern to copy); `examples/2026-10-09-cell-division/inspect-alpha.mjs`; `examples/2026-10-09-cell-division/assets/provenance.json`; skim `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (the runner the plan chooses not to generalise); `test-budget.json`; `AGENTS.md`.
- Operator decision (not for re-litigation): the CLI is the default route; Phases 1 to 4 of #8 are dropped; #8 closes after this skill lands.
- Definition of Done (for the plan): every requirement is grounded in a real repo path or live CLI fact; the plan meets the operator's ask (a reusable skill that invokes the Higgsfield CLI for verified transparent PNGs) with the smallest surface; spend, secrecy and no-silent-upload rules from `SOP.md` and `AGENTS.md` are carried; the verification is falsifiable (includes a red control).

Questions:
1. Is each Recon claim accurate against the cited files? Cite file:line for any you dispute.
2. Does any requirement from the operator ask or from `SOP.md` go missing from Requirements 1 to 5?
3. Is "skill only, no new script" the right call given the envelope, or does a stated requirement (spend cap, alpha proof, provenance, redaction) actually need code? Answer with the concrete requirement and why prose cannot carry it.
4. Is the verification enough to catch a wrong skill (wrong flag, wrong path, inspector not proving alpha)? Is the red control (earth.png true / solar-system.png false) meaningful?
5. Anything over-built, or anything the plan should drop?

Grade each finding [Blocker]/[Should]/[Nit]/[Pass]; a [Blocker] or [Should] asking for a behaviour change needs Observed input / Affected scope / Falsifier lines. Set STATUS: Approved if the plan can be implemented as written (Nits allowed).

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
