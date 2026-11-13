# RELAY · PR #83 independent QA (Kimi K3.1 Pro): external-module public API
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-12.
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh82-kimi-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/plugin-api.mjs` and the rest of PR #83 (https://github.com/HiQS-Labs/XYZ-layout-engine/pull/83), the diff from base `4e08148` to this branch's HEAD: `package.json`, `README.md` ("Using the engine from another repository"), `ROUTER.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/SPECS-PRD.md` §6.5, `PROJECT/2-WORKING/GH-82-PLUGIN-API.md` (plan), `TESTS-RESULTS/2026-11-12-GH-82/README.md` (evidence).
- Reviewer: kimi (K3.1 Pro)   ·   Producer: claude-a
- Started: 2026-11-12
- **Independence:** form your own assessment first. Two earlier Codex reviews exist under `relay-system/2026-11-12/gh82-*-qa.md`; read them only after you have written your findings, and do not copy their conclusions.
- **Operational envelope:** a local, single-operator rendering engine (Node 22 ESM, pnpm). One external repository links this checkout as a package (`"xyz-layout-engine": "link:../XYZ-layout-engine"`) and needs two engine functions. Grade against the PR's stated goal and commensurate complexity; do not demand npm publishing, semver policy, multi-tenant isolation or a plugin framework. The repo caps its test suite (`test-budget.json`: 4 canaries); a request for a new test file is out of scope. `releases.db`/`releases.sql` changes are writes by the repo's ledger CLI, not hand edits.
- **Depth:** this is a deep review. Read `tools/render.mjs`, `tools/review.mjs` and `tools/request.mjs` in full, not just the diff, and reason about Node's package `exports` resolution rules precisely.

Questions:
1. Correctness of resolution: with the `exports` map in `package.json`, does `import { launchPlaywright, publishForReview } from 'xyz-layout-engine'` resolve and work from a pnpm `link:` consumer? Consider symlink realpath behaviour (does the engine's `playwright` dependency resolve from the engine's own `node_modules`?), ESM-only consumers, and a CommonJS `require()` consumer. Is any of these broken or misleadingly documented?
2. Does adding `exports` break or change anything inside this repo: `pnpm test`, `pnpm render`, the spike (`tools/spike/render.mjs`, which reads `package.json` and calls `require.resolve`), any tool or skill that imports the engine by name? Cite lines.
3. Import-time side effects: does importing `tools/plugin-api.mjs` run anything (CLI entry, file writes, browser launch, network) through `tools/render.mjs` → `tools/request.mjs` and `tools/review.mjs`? Cite the guards.
4. `publishForReview` from a linked consumer: where does it write, can a consumer-supplied `project` name escape `REVIEW/` (path traversal such as `../x`), and is the README's "replaces" wording accurate? If traversal is possible, is it new exposure created by this PR or pre-existing behaviour now made public?
5. Is the public surface the right size: two names, a re-export file, and the `./package.json` subpath? Is anything over-built, missing, or inconsistent between `tools/plugin-api.mjs`, README, ROUTER, CHANGELOG and SPECS-PRD?
6. Evidence: does each row in `TESTS-RESULTS/2026-11-12-GH-82/README.md` observe the real outcome, and would the checks reject an unchanged base (no `exports`)? Mark anything you cannot verify as `[Unverified]`.
7. Privacy: this repo is public. Does the diff contain absolute home paths, emails, tokens, or the name of a private repository?

Definition of Done: the PR delivers a working, correctly documented two-name public API with no regression and no private data; every Blocker/Should carries `Observed input:`, `Affected scope:` and `Falsifier:` lines.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
