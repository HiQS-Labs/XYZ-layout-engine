# RELAY · #36 recursive-process recipe: final QA
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
6. **Commit only the relay file** (`relay(36-recursive-process-recipe-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: the diff from da97d78 to HEAD on the feat/gh36-recursive-process branch. Code: `tools/render.mjs`, `tools/request.mjs`, `tools/catalog.mjs`, `tools/recipes/recursive-process.mjs`, `tools/spike/test/canaries.test.mjs`. Data: `tools/catalog.sql`, `tools/design-log.jsonl`. Example folder: `examples/2026-10-11-belief-updating/README.md`, `examples/2026-10-11-belief-updating/fixture.json`, `examples/2026-10-11-belief-updating/render-diagram.mjs`, `examples/2026-10-11-belief-updating/receipt.json`, `examples/2026-10-11-belief-updating/belief-updating.png`. Docs: `README.md`, `CHANGELOG.md`, `tools/fonts/barlow-condensed/SOURCE.md`. Plan with filled evidence: `PROJECT/2-WORKING/GH-36-RECURSIVE-PROCESS-RECIPE.md`. Plan QA thread: `relay-system/2026-10-11/gh36-plan-qa.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done: the seven numbered acceptance checks in the plan, as approved in plan QA round 3, are met and evidenced. The implementation matches decisions D1 to D10 (including D6, the AS-rule departures). It adds no second writer or subsystem, and no new test file or `test()` block.

## QA brief (read before reviewing)

Operational envelope: a local, single-developer, early-stage public repo. Grade against the approved plan and commensurate complexity.

Producer evidence, recorded in the plan's Evidence section:
- **Preservation matrix:** all 14 nutrition and solar artifacts are byte-identical from the `main` baseline to the final tree, and the baseline itself was run twice.
- **Red controls:** five guard removals, each turning `pnpm test` red.
- **Gates:** `pnpm test` 4/4 in 37.3 s; `catalog verify` valid; `export --check` canonical; both thin-caller receipts `verified: true`; the save check left the original fixture untouched; PDDA no errors.

Two build-time decisions that the plan did not spell out beforehand; please judge them:
- (a) Formula tokens render without IDs, so the fit loop does not check them. Validation bounds their width instead: at most three tokens of one letter and one digit. Plan-QA round 1's F6 note assumed tokens would carry leaf IDs.
- (b) Line height is 1.2, not D10's 1.1, because Barlow's 1.2 em line box made Chromium report overflow at every size.

Also new: the canvas is 1600×1340, not 1600×1400, after visual review. The committed receipts have `inputPath` rewritten to repo-relative; the README says so.

Questions:
1. Is each acceptance check (1–7) actually met by the code and the evidence? Name any that is overstated.
2. Is the D3 font change still a no-op for recipes without `FONT` on every path, including `toDocument` at the compact HTML and inline HTML sites?
3. Does the recipe's `validate` enforce its domains fully, including one to three formula tokens, and are its errors named? Is anything accepted that should not be?
4. Are decisions (a) and (b) sound and honestly documented? Is the receipt `inputPath` rewrite acceptable?
5. Is the C1 extension within the ratchet (no new test), and is `assertOfflineExport` a faithful refactor of the old nutrition block?
6. Does the example README's AS report match the rendered PNG and `SYSTEM-INSTRUCTIONS.md`?

You may run read-only probes under `.relay-scratch/` after `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`. Do not run `pnpm test`.

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. A `[Blocker]` or `[Should]` asking for a change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules (forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh36-final-qa --agent codex`. **Never run `tick release --to done`.** Otherwise set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh36-final-qa --agent codex --to claude-a`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
