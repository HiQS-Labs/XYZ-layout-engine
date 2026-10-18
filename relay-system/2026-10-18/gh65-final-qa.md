# RELAY · GH-65 final QA: XYZ Forge lenses and prior-art search
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-18.
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
6. **Commit only the relay file** (`relay(gh65-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `examples/xyz-forge/README.md` and the rest of the committed implementation on
  this branch versus main at b38e0d3 (git diff -M b38e0d3..HEAD): everything under examples/xyz-forge/,
  root `.gitignore`, the top entry of `CHANGELOG.md`, and the plan, acceptance checks and Evidence table in
  `PROJECT/2-WORKING/GH-65-XYZ-FORGE-LENSES.md`. Approved plan QA thread:
  `relay-system/2026-10-18/gh65-plan-qa.md`. View the PNGs directly for visual checks:
  `examples/xyz-forge/today/software-factory-v2/xyz-forge-software-factory.png`,
  `examples/xyz-forge/future/shift-proposal/xyz-forge-shift-proposal.png`.
- Operational envelope: documentation examples in a public repo, rendered locally by one developer.
  Grade against the plan's requirements 1–7 and acceptance checks with commensurate complexity; do not ask
  for new nodes, recipes, tests or engine machinery the approved plan scoped out.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-18
- Definition of Done: requirements 1–7 are met by the committed files; Evidence claims match the files;
  v1 is a pure rename apart from its `RT` line and README paths; no pinned or tested path changed; no
  live reference under examples/ names an old folder.

### Questions for the Reviewer
1. Moves: are the three folders pure renames apart from the stated edits? Does each script's `RT` reach
   the repo root from its new depth, and is v1's rendered output unchanged (compare blob hashes across the
   rename)?
2. Links and paths: does every relative link in the index and three READMEs resolve? Any live old-path
   reference left under examples/ (generated HTML included)?
3. Captions: do the v2 `/start-task` and shift Open captions state the prior-art check where it runs, and
   does each generated HTML caption element match its fixture? Is shortening "Codex plan QA" to "Codex QA"
   acceptable given the plan allows shortening without losing meaning?
4. Visual: in the two PNGs, any new crowding or overlap caused by the longer captions? Is the Evidence
   table's AS-10 statement (tight above the routes label; captions unreadable at 1/3 scale, pre-existing)
   honest?
5. Hygiene: any accidental files (.relay-scratch, .xyz, .claude, node_modules), or changes outside scope?
   Is the `.gitignore` hunk exactly the three requested lines?
6. Flag anything over- or under-engineered. Cite `file:line`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
