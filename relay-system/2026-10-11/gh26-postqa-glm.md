# RELAY · #26 post-QA review of landed code on main and recipe run-through
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
6. **Commit only the relay file** (`relay(26-post-qa-review-of-landed-code-on-main-and-recipe-run-through): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the code on `main` at `7d66787`. In scope: `tools/render.mjs`, `tools/request.mjs`, `tools/profile.mjs`, `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/spike/test/canaries.test.mjs`, `test-budget.json`, `README.md`, `ROUTER.md`, `PROJECT/2-WORKING/SPECS-PRD.md`. Context: issue #26 (this review), #23 (open follow-ups from the PR #18 review, so do not re-report them), and #20 (the plan).
- Reviewer: commandcode (GLM 5.3, effort high)   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done: an independent review of how the four landed PRs (#18 offline MVP, #22 recipe catalog, #24 design records, #25 `--save`/`--out` hardening) fit together, backed by actually running both recipes and the catalog CLI. Every claim in README and ROUTER about commands, exit codes and outputs is checked against a real run. Findings are graded and cited, with no paid provider calls.

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI and library in an early-stage public repo. There are no tenants and no network service. Grade against the stated requirements with commensurate complexity; do not demand enterprise machinery or unrequested threat models. Each PR already had its own review. Your value is the seams between them and **running the code**.

**How to run things here (mandatory):**
- Before anything else: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`. Write every output under `.relay-scratch/` and nowhere else. `node_modules` is available.
- **Never run a command that writes to a tracked file in this worktree.** That turn fails as an off-lane edit. For `design add` or anything else that writes to the catalog, run it against an exported copy: `mkdir -p .relay-scratch/repo && git archive HEAD | tar -x -C .relay-scratch/repo && ln -s "$PWD/node_modules" .relay-scratch/repo/node_modules`, then `node .relay-scratch/repo/tools/catalog.mjs ...` (the CLI resolves its root from the script's own location).
- Do not run `pnpm test`; the producer runs the gate in a full clone. Do not call any paid provider (HiQS, Higgsfield, `--generate`). Read those paths only.
- Quote the command, its exit code and the decisive output line for every run you cite.

**A. Run the recipes (README "Install and Offline Workflow", steps 2 to 4):**
1. Nutrition: copy `tools/spike/fixture.json` to `.relay-scratch/`, render with `--format png,svg,html,html-inline`, apply the README's two `--set` edits with `--save`, then re-render. Does the saved JSON hold the edit? Do the outputs and `manifest.json` `current` match README step 4?
2. Solar System: the README step 3 flow with `--recipe solar-system`. Does the edit persist, and does the re-render reflect it?
3. Determinism: render the same fixture twice to two output folders. Are the SVG bytes identical? If not, what differs?

**B. Catalog and designs:** `node tools/catalog.mjs list`, `show solar-system`, `verify`, `design list`, `design show <id>` for each of the three seeds, and `--json` variants. In the exported copy: one `design add`, a duplicate add, a misspelled subcommand, and a hand-tampered `catalog.sql`. Do the exit codes match README's table (0, 1, 2)?

**C. Negative controls (each must be refused with a named error and leave files untouched):** `--save` onto `package.json`; `--save` onto an export's `manifest.json`; `--out .`; `--out .git`; a headline made of one 120-character unbreakable word; an unsupported canvas size; an unknown `--recipe`; a `--set` path that does not exist in the schema. Run these in `.relay-scratch/`, or in the exported copy where the target is a repo-root file.

**D. Seams and code (review the whole files, not just recent diffs):**
4. Does each concern have one owner: schema validation, final geometry and text fit, the catalog write path, the receipt that marks a render `verified`? Name any duplicated helper or second write path with file:line. #23 already lists S3 to S10, so only add new ones.
5. Does `tools/render.mjs`'s use of the catalog (verified or unverified receipts) behave correctly when the catalog is missing, tampered, or has a design-only error? Show it with a run.
6. Do README, ROUTER and SPECS-PRD claims match behaviour? Quote any statement that a run contradicts.
7. Is anything over-built or dead for an MVP with two recipes and three designs?

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, a run table (command, exit, decisive line), then `VERDICT: PASS|FAIL|PARKED`, `Basis:` and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** whatever your verdict, append your block and commit only this file. If and only if you approve, also set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh26-postqa-glm --agent commandcode`. **Never run `tick release --to done`.** If you do not approve, set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh26-postqa-glm --agent commandcode --to claude-a`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
