# RELAY · GH38 final implementation QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-12.
-->

NEXT: Producer
STATUS: Approved
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
6. **Commit only the relay file** (`relay(gh38-final): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/gh38-final-packet.md** — the read-only path that
  `relay-drive.sh --artifact-file relay-system/2026-10-12/gh38-final-packet.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: author
- Started: 2026-10-12
- Definition of Done: The two fixes, ordinary I/O scope, immutable history/output preservation, safety and existing-budget checks in gh38-final-packet.md and the canonical plan.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: PASS
Basis: Ship the two scoped fixes. Complete changed runtime files and the existing canary consumer were swept; no actionable pre-existing defect was found. Ordinary I/O compensation meets the stated envelope without another persistence owner. Reversibility: Easy source changes; recipe publications retain immutable history.
swept file: yes

- [Pass] Catalog boundaries: `tools/catalog.mjs:253` skips obsolete-temp cleanup after committed rename; `:351` stages the log before catalog publication; `:363` restores exact bytes or absence; `:368` reports "recovery required" on failed compensation. Exclusive ownership and immutable guards remain at `:286` and `:238`. No correction needed.
- [Pass] Existing C4 targets both failed publications and asserts both stores unchanged, lock release, and successful retry (`tools/spike/test/canaries.test.mjs:519`, `:529`, `:532`). Retained compensation mutation fails at `:530`; retained PNG digest mutation fails at `:468` with "Missing expected rejection." Receipts: `relay-system/2026-10-12/gh38-verification/compensation-red.log:1`, `png-digest-red.log:1` in the same directory. Four retained manual controls cover missing log, partial staged write, commit cleanup, and explicit failed rollback (`recovery-controls.source.txt:3`, `recovery-controls.json:1` in that directory). No additional suite or test required.
- [Pass] Shared PNG loading keeps selection in the recipes (`tools/recipes/solar-system.mjs:85`, `tools/recipes/mangajdm-promo.mjs:18`), bounded descriptor reads (`tools/request.mjs:12`), base/root containment and digest checks (`:31`), and existing CRC/decompression/aggregate budgets (`tools/spike/assets.mjs:10`). Both modules declare 1.0.1. No parallel registry, fallback, or scene change added.
- [Pass] Read-only snapshot probe: command `python3 -B .relay-scratch/static-review.py`, exit 0. Decisive output: candidate `6bcb9b32453a23b5a1d224669ca434a36718eadc`, "committed_source_matches_worktree": true, "baseline_rows": 76, "retained_rows": 76, "log_identical": true, "examples_fonts_unchanged": true, "matrix_equal": true. Raw object reads checked SHA-1 without invoking git. The packed baseline tools/spike tree could not be expanded; the canary diff and unchanged asset owner were instead compared with the existing baseline checkout whose main ref is ab94133. This is a bounded review, not an exhaustive repository audit. History receipt: `relay-system/2026-10-12/gh38-verification/history-preservation.json:2`; recipe history also inspected in `tools/catalog.sql`.
- [Pass] Saved matrix probe: command `python3 -B -` reading baseline-matrix.json/final-matrix.json and comparing decoded records, exit 0. Decisive output: "before/after equal: True fixture/backend records: 10 format records: 35". Includes digests, compact assets and fit records (`relay-system/2026-10-12/gh38-verification/baseline-matrix.json:1`, `final-matrix.json:1` in that directory). This measures retained evidence equality, not fresh renders.
- [Pass] Narrow runtime probe: command `node --input-type=module - <<'JS'`, exit 0. It invokes read-only catalog verify/export, reads the eleven Solar assets, temporarily redirects fs.open from sun.png to earth.png, then substitutes an outside realpath for assets/web. Each substitution is restored in finally; no disk contents change. Decisive output: "catalog verify/export: 0/0; Solar assets: 11; substituted valid PNG: digest rejected; namespace escape: rejected". Relevant owners: `tools/catalog.mjs:296`, `tools/request.mjs:36`, `:43`.
- [Unverified — needs clone run] Fresh suite execution was intentionally not performed in this review worktree. Retained full-clone receipt reports "PASS — 4 canaries in 39.3s (budget 60s)" (`relay-system/2026-10-12/gh38-verification/canaries.log:1`); budget remains four tests/one file/zero workflows (`test-budget.json:12`). Harness gate owns fresh execution. Retained PDDA reports no errors/two governance warnings (`pdda.log:1` in the same evidence directory). Those warnings and human artwork/Forge reconciliation remain in issue38, not completed by this verdict.

No Blocker or Should findings. Only this relay file was edited; temporary analysis files stayed in .relay-scratch. No git invocation, fixture execution, validation suite, paid call, or artifact edit was performed.

Relay closed (Approved), no further turn needed. Producer author may continue authorized landing after the harness gate.


### Attestation · relay-drive — 2026-10-12T21:01:30Z
task: GH38-FINAL-20261012
reviewer: codex
status: Approved
reviewed-head: 6bcb9b32453a23b5a1d224669ca434a36718eadc
added-range: 5458+4489
added-sha256: 60d6d919a5d243c0731808ff48aefdc0f60d6061dda87a9c2af21f6009e949e4
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
