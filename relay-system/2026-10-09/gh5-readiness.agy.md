# RELAY · GH-5 final prepared-input and readiness QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: codex-producer (relay closed)
STATUS: Approved
ROUND: 1 / 2

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
6. **Commit only the relay file** (`relay(gh-5-final-prepared-input-and-readiness-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-5-MVP-FOUNDATION.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: agy   ·   Producer: codex-producer
- Started: 2026-10-08
- Definition of Done: _<fill in the acceptance criteria the Reviewer grades against>_

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Final prepared-input review

Read the WHOLE current canonical GH-5 plan (seeded read-only artifact), YAML, all briefs and readiness/receipt.json and logs under relay-system/2026-10-09/gh5-readiness/. Read the existing Codex plan approval gh5-marathon-plan.codex.md: contact-sheet fix is resolved. Scope is unchanged since that approval; final edits convert four existing acceptance bullets to checkboxes, name debug-mantra, record review metadata and add the required pending wave-QA overlay to the computed schedule. Both source issue and capture preserve identical acceptance text; direct preflight now matches 4/4. Verify ponytail and readiness for exact p1->p2->p3->p4->p5 order, Agy builder/Codex reviewer, pnpm test gate, full clone/main untouched and zero paid calls. Do not claim runtime or human/provider acceptance.

The native planner core --check passed before adding the mandatory GH-784 pending QA checklist; the generated core is retained as gh5-generated-core.md. Compare the current scheduling core to that snapshot. A future whole-file --check will expose the manual QA overlay; don't misstate it as unmodified generated bytes. Current deep compute, direct preflight and full YAML dry-run each exited0. Two installed governance warnings and historical GH1 escalation records are documented/preserved, not silently fixed.

Write ONLY this relay; no source edits, git, live provider calls, tests or off-lane scratch. Give only concrete blocking failures with citations; no speculative additions. Check final source/contract/write-set correspondence including both runtime consumers and all eleven verified supplied assets. Exact reviewed HEAD must be cited. On PASS set STATUS Approved and terminally tick done GH5-MARATHON-READINESS-AGY as agy (NOT release to producer). On FAIL release to codex-producer and cite cheapest bounded correction. Append literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes/no, and citations; preserve prior text and EOF marker. Approval is launch readiness only; wave tests/post-build Codex receipt/human gates remain pending.  [Unverified — no citation]

## Log

### Reviewer · Round 1 · agy

VERDICT: PASS
Basis: Verified readiness for exact `gh5-p1` -> `gh5-p5` phase order, `agy` builder and `codex` reviewer, `pnpm test` gate, and full clone with untouched main branch. Deep compute, direct preflight, and full YAML dry-run all passed with exit 0 (`gh5-compute.log`, `gh5-direct-preflight.log`, `gh5-full-dry-run.log`). The generated core (`gh5-generated-core.md`) correctly reflects the initial scheduling core; the manual QA overlay added to the current plan is documented and not misstated as unmodified generated bytes. Two existing governance warnings and historical GH1 escalation records are accurately preserved in `receipt.json`. Source/contract/write-set alignment matches the Codex plan approval, preserving both runtime consumers and all 11 verified display assets. Zero live paid provider calls are made (deferred until operator budget is provided). Exact reviewed HEAD is `6137a0d8dfb45b80decfd8d5217a77d76196d8bc`.
swept file: yes

- [Pass] **Verified readiness configuration.** `file:relay-system/2026-10-09/gh5-readiness/receipt.json:57-62` confirms the `gh5-p1` to `gh5-p5` order. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:65-67` identifies `agy` as the builder and `codex` as the reviewer. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:68` sets the `pnpm test` gate. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:7` confirms `full_clone: true`, and `file:relay-system/2026-10-09/gh5-readiness/receipt.json:4` records operator authorization for `origin/main`. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:77` defers live paid provider benchmarks. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:55` documents the manual QA overlay and core check. `file:relay-system/2026-10-09/gh5-readiness/receipt.json:53` and `file:relay-system/2026-10-09/gh5-readiness/receipt.json:81` preserve existing governance warnings and GH1 escalation records. Both consumers and all 11 display assets were verified by the independent Codex review (`file:relay-system/2026-10-09/gh5-marathon-plan.codex.md:171`).

Relay closed (Approved), no further turn needed.

### Attestation · relay-drive — 2026-10-09T06:46:16Z
task: GH5-MARATHON-READINESS-AGY
reviewer: agy
status: Approved
reviewed-head: 6137a0d8dfb45b80decfd8d5217a77d76196d8bc
added-range: 7539+2161
added-sha256: 8980e0362b992565b068fea9da69dda7b777a789a71dcdbce93a32a0c83738db
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->

