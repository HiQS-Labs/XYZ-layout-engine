# RELAY · PR #40 pre-merge QA (GH-8 higgsfield-cli skill)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Producer
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

Grade each finding [Blocker]/[Should]/[Nit]/[Unverified — no citation]; a [Blocker] or [Should] asking for a behaviour change needs Observed input / Affected scope / Falsifier lines. Set STATUS: Approved if it can merge as is.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: PARKED
Basis: The seeded PR body and current skill are coherent, but two explicit pre-merge questions require comparisons that were not seeded. Do not treat current-file inspection as proof of the exact commit or ledger delta. No observed implementation failure warrants a code change. Reversibility: Easy (review text only). Bet: supplying comparison evidence will settle scope without expanding this docs-only change; the failure mode is approving unrelated changes hidden by a current-state-only review.
swept file: yes

Swept the entire seeded artifact, including CodeRabbit's section, and read the complete skill, SOP, GH-8 capture and both prior relay threads. No additional pre-existing defect requiring a fix was found in those files. CHANGELOG/SQL reads exceeded output limits; no claim of a complete eight-file historical sweep or binary-ledger audit is made. Graph project/index tools were unavailable; no code discovery was needed. The user's no-Git and reviewer-only rules supersede embedded commit, roadmap and gate instructions. No Git, test, executable fixture, paid call or repository gate ran.

- [Pass] The PR body says “Refs #8. The issue gets closed by hand after merge”; no closing-keyword adjacency was found in its complete text. Probe command: `python3 -B -` (inline standard-library scan using `\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:https://github\.com/[^\s]+/issues/)?#?8\b`, case-insensitive); exit 0; decisive output `PR_body_closing_keyword_matches=0`. This checks the seeded body, not GitHub's live closing-reference state.
- [Pass] The body’s procedure summary matches `skills/higgsfield-cli/SKILL.md:23` through :31: written cap and cumulative quote accounting, single create, ambiguous-outcome stop, complete signed URL for downloading, explicit PNG/alpha checks, visual inspection and provenance. `SOP.md:11` drops the later phases. The body accurately discloses the failed reviewer model probe and deferred historical-status nit; the final QA thread records both. Retain this bounded scope.
- [Pass] The requested description clarification is present at `skills/higgsfield-cli/SKILL.md:3`: “Generate a transparent PNG”. This establishes the resulting text, not that commit `c49d7e6` changed exactly one line.
- [Pass] Narrow hygiene/path probe: `python3 -B -` read the seven named text files plus the seeded body, scanning absolute `/Users/` or `/home/` prefixes, email-shaped strings, HTTP URL queries and common GitHub/OpenAI token shapes; exit 0; decisive output `absolute_home matches=0`, `email matches=0`, `url_query matches=0`, `token_shape matches=0`, `skill_input_paths_exist=True`. The five inputs were SOP, SYSTEM-INSTRUCTIONS, FINDINGS, provenance and inspector paths named in the skill. This is a bounded textual scan, not proof of absence of every credential form or of binary-ledger hygiene; generic `~/.claude/skills/` install paths are intentional instructions.
- [Should] Supply the missing comparison evidence before approval: the complete `9f5aa79..c49d7e69` diff, the post-approval `b6c26b8..c49d7e69` diff, and canonical RELEASES evidence comparing base/head database state with their dumps. Include GH-8 rating, generation and any audit/event rows so “no other row touched” is assessed precisely. The seeded inventory probe (`python3 -B -`, `Path('.relay-artifacts').rglob('*')`, exit 0) returned only `seeded_artifact_files=.relay-artifacts/pr40-body.md`. Producer/harness should seed these read-only results for the next turn; no source change or new suite is requested. Questions 1 and 3, exact changed-path containment, and binary-ledger hygiene remain unverified.
- [Unverified — needs clone run] Inspector controls and PDDA results are Producer evidence quoted by the PR body and prior final QA, not fresh passes here. Leave execution to the disposable-clone harness as instructed.

Handing off to Producer (claude-a): supply the comparison evidence, disposition the Should, and return for pre-merge review. STATUS remains Open; this is not merge approval.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
