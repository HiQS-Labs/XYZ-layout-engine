# RELAY · GH-10 and GH-9 marathon plan QA: recipe catalog then stacking flags
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
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
6. **Commit only the relay file** (`relay(gh10-gh9-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-10-RECIPE-CATALOG.md`, `PROJECT/2-WORKING/GH-9-STACKING-RESPONSIVE-FLAGS.md`, `PROJECT/2-WORKING/recipe-catalog/MARATHON.yaml`, `PROJECT/2-WORKING/responsive-flags/MARATHON.yaml`, `PROJECT/2-WORKING/recipe-catalog/PREP-NOTES.md`. Briefs: `PROJECT/2-WORKING/recipe-catalog/briefs/gh10-p0.md`, `PROJECT/2-WORKING/recipe-catalog/briefs/gh10-p1.md`, `PROJECT/2-WORKING/recipe-catalog/briefs/gh10-p2.md`, `PROJECT/2-WORKING/recipe-catalog/briefs/gh10-p3.md`, `PROJECT/2-WORKING/responsive-flags/briefs/gh9-p0.md`, `PROJECT/2-WORKING/responsive-flags/briefs/gh9-p1.md`, `PROJECT/2-WORKING/responsive-flags/briefs/gh9-p2.md`, `PROJECT/2-WORKING/responsive-flags/briefs/gh9-p3.md`. Source paths the plans build on: `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/spike/scene.mjs`, `tools/spike/test/canaries.test.mjs`, `test-budget.json`, `PROJECT/2-WORKING/SPECS-PRD.md`, `PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: the two plans are executable by an unattended marathon without inventing scope: claims match the files (this clone is based on the GH-5 head, PR #18); GH-10 is a minimal recipe identity catalog (serial + slug + semver, SQLite ledger, CLI) that extends the existing canonical patterns and rejects republishing different content under the same version; GH-9 adds only the `responsive` and `stackOrder` scene-build flags with no second layout engine, no runtime measurement and no CSS media queries; every phase has an acceptance check that can fail and a red control; write-sets are honest and serial; the repo's no-new-tests / test-budget / no-new-dependency rules are respected or the exception names a failure mode; rollback and reversibility reads are honest; the Swarm Preflight Contract JSON is valid and the YAML keys match the existing mvp-foundation YAML.

## QA brief (read before reviewing)

Operational envelope: a local single-developer library and CLI, no tenants, no network service. Grade against the stated requirements and commensurate complexity; do not demand enterprise multi-tenant machinery. Ledger writes (`releases.db`, `releases.sql`) are done by the orchestrator through the existing writer, not by the plans.

Questions:
1. Grounding: do the file:line claims about `tools/render.mjs`, `tools/request.mjs`, the recipes, the canaries, `test-budget.json` and `SPECS-PRD.md` match the files in this clone? Anything unsupported or overstated?
2. GH-10 minimality: is `node:sqlite` plus a committed text dump (`tools/catalog.sql`, database rebuilt in memory) the smallest mechanism? Does Phase 0 decide the engine from evidence? Is rejection of same-version/different-content republishing actually enforced and falsifiable? Is the serial scheme (RCP-0001 nutrition, RCP-0002 solar-system) reasonable and is its Costly reversibility named?
3. GH-9 determinism: does the plan keep resolution at scene-build time from the declared canvas width, with byte-identical output for unflagged recipes as a hard gate? Does it avoid a second layout engine?
4. Phase quality: does each phase have an acceptance check that can fail, a red control, and a write-set that matches the YAML `artifact` list? Is anything in a brief outside its allowed files? Is the serial ordering and `depends_on` correct, and does GH-9 correctly depend on GH-10?
5. Test and dependency discipline: does the plan avoid new test files, CI workflows and dependencies, or record a named failure mode that existing canaries cannot cover? Is the single-canary-extension approach reasonable given the review of PR #18 flagged the first canary as already very large?
6. Stacking risk: the stack is cut from PR #18, which has changes requested (text-fit blocker in `tools/render.mjs`, `--save` and `--out` hardening in `tools/request.mjs` and `tools/render.mjs`). Does PREP-NOTES.md handle the rebase honestly, and are write-set collisions with those fixes named?
7. Wording: no GitHub closing keywords (`Closes`, `Fixes`, `Resolves`) next to issue numbers anywhere; no PII, credentials or absolute home paths in the docs (this is a public repo).

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines. Set STATUS Approved only on PASS.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
