# RELAY · PR #40 pre-merge QA (GH-8 higgsfield-cli skill)
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
6. **Commit only the relay file** (`relay(pr-40-pre-merge-qa-gh-8-higgsfield-cli-skill): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/pr40-body.md** — the read-only path that
  `relay-drive.sh --artifact-file /private/tmp/claude-501/-Users-noelsaw-Documents-GH-Repos-XYZ-layout-engine/f26adb12-61a9-4776-9e97-f18f3477c914/scratchpad/pr40-body.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-12
- Also review (in this worktree): the whole PR diff `git diff 9f5aa79 c49d7e69` (8 files: `skills/higgsfield-cli/SKILL.md`, `SOP.md`, `CHANGELOG.md`, `PROJECT/1-INBOX/GH-8-HIGGSFIELD-SPIKE.md`, `releases.db`, `releases.sql`, and the two relay threads `relay-system/2026-10-12/gh8-cli-skill-plan.codex.md` / `gh8-cli-skill-final.codex.md`). The PR body above is what GitHub shows for PR #40; base `main` = `9f5aa79` (unchanged since branching), head `c49d7e69`.
- Context: the final implementation QA (`gh8-cli-skill-final.codex.md`) approved `b6c26b8`. After that, one commit (`c49d7e6`) removed "(or any image)" from the skill's description per that review's Nit. This pre-merge review is the operator's gate before squash-merging into `main` (a public repo).
- Operational envelope: a docs-only change (one new skill file, doc edits, one ledger rating) for one operator's local agent workflow. No script, test, dependency or workflow, on purpose. Do not ask for one.
- Definition of Done: safe to squash-merge as is.

Questions:
1. Is the post-approval commit `c49d7e6` exactly the one-line description change, with nothing else?
2. Does the PR body accurately describe the diff, and does it avoid any GitHub closing keyword next to `#8` (issue #8 must stay open until closed by hand after merge)? GitHub currently reports 0 closing-issue references.
3. Is the `releases.sql` / `releases.db` change only GH-8's rating 40/10/50/30 → 40/10/50/85 plus the generation counter, with no other row touched?
4. Public-repo hygiene: does any changed file contain a home-directory path, an account email, a token, a key-file path or a signed URL query string? (The scratch path in this Setup is a sandbox temp path, not a home directory.)
5. Anything in the diff that would make `main` wrong after merge (broken link, contradicted SOP rule, wrong command)?

Grade each finding [Blocker]/[Should]/[Nit]/[Pass]; a [Blocker] or [Should] asking for a behaviour change needs Observed input / Affected scope / Falsifier lines. Set STATUS: Approved if it can merge as is.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
