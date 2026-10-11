# RELAY · #23 generation safety (S3, S4, S5, S7, empty job list) code QA
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
6. **Commit only the relay file** (`relay(23-generation-safety-s3-s4-s5-s7-empty-job-list-code-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit `2c14244` (`git show 2c14244`), touching `examples/2026-10-08-solar-system/generate-assets.py`, `tools/spike/test/canaries.test.mjs` (C1 generator block), `examples/2026-10-08-solar-system/README.md` and `CHANGELOG.md`. Context: issue #23 items S3, S4, S5 and S7 and the "empty job list" item; a real caller receipt is at `examples/2026-10-08-solar-system/assets/sun.result.json`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-11
- Definition of Done:
  - Each of the five #23 items is fixed at its root cause, not at a symptom.
  - The fix is the least mechanism for a local single-developer generator: no new dependency, test file or workflow.
  - No existing guard is weakened. That covers resume identity, the lock, the call cap, the deadline, alpha and digest validation, and the Sun-first rule.
  - Every guard has a C1 assertion that fails when the guard is removed.
  - The docs match the behaviour.
  - No paid provider call is needed to verify any of it.

## QA brief (read before reviewing)

Operational envelope: a local CLI that spends real money through an external caller. The protections that matter are against paying twice and against committing credentials. Grade against that, with commensurate complexity.

What the producer measured (re-measure what you can):
- A stub-caller reproduction on `main` before the fix showed each defect: an empty list exited 0; the signed query string was kept in 2 files; a deleted manifest allowed a second call; `dispatched:false` per attempt was recorded as `unknown`; and killing the generator mid-call then running `--force-retry` made a second call while the orphaned caller was still running. After the fix, all five are refused or correct.
- Mutation red controls: removing each guard individually makes `pnpm test` exit 1 (C1). The gate is 4/4 in 35.9 s.

You may run narrow probes in `.relay-scratch/` or `$TMPDIR` only. Run `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"` first. For example, import the module with `importlib` and call `redact`, `receipt_text` or `never_dispatched`, or run the generator with a stub caller you write under `.relay-scratch/`. Do not run `pnpm test` here, and never call a real provider.

Questions:
1. S4: does handing the run lock to the caller (`pass_fds`) actually keep a forced retry out while an orphaned caller lives? Can the lock leak past normal completion, or be held by something other than the caller? Does the timeout path still release it (process group kill)?
2. S7: can `redact`/`receipt_text` lose data the rest of the code needs, or break validation (`validate_output` re-reads the receipt and checks `receipt_sha256`)? Is there a realistic signed-URL shape it misses, for example a URL inside a non-JSON receipt, or a URL-encoded or escaped query?
3. S3: is the `ATTEMPT_DIR` pattern exactly what `run_job` creates? Any false positive on the committed `assets/` folder or a fresh run? Is a manifest that is present but emptied (`{}`) a gap worth stating?
4. S5: is treating "every attempt says `dispatched:false`" as safe to re-plan correct against the real receipt shape? Could a partially dispatched result be misread as failed?
5. Did anything else change behaviour unintentionally (atomic writes, the error message for job-list size, receipt bytes no longer being verbatim caller output)?
6. Anything over-built, or missing from the README or CHANGELOG?

Output: graded findings (`[Blocker]`, `[Should]`, `[Nit]`, `[Pass]`) with file:line citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`. Every `[Blocker]` or `[Should]` requesting a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** append your block and commit only this file. If and only if you approve: set `STATUS: Approved` and `NEXT: done` at the top **and** run `tick done RELAY-gh23-gen-safety-qa --agent codex`. **Never run `tick release --to done`.** If you do not approve: set `NEXT: Producer`, keep `STATUS: Open`, and run `tick release RELAY-gh23-gen-safety-qa --agent codex --to claude-a`.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
