# RELAY · GH-2 plan QA: regression canaries and CI-suite ratchet
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
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
6. **Commit only the relay file** (`relay(gh2-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md` (the plan). Source paths it plans against: `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/scene.mjs`, `tools/spike/assets.mjs`, `package.json`, `AGENTS.md`, `GUIDING-PRINCIPLES.md`, `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the plan satisfies issue #2 (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/2). That means a minimal regression suite with high-level canaries, run by one local command and aimed mainly at catching regressions, plus ratchet rules that mechanically prevent over-expansion of the test/CI suite. It extends the existing render/verify code rather than adding a parallel system, every check has a falsifiable red control, and complexity stays commensurate with a spike of about 1,000 lines.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

This is plan QA, before any code is written. Operational envelope: a local renderer spike, about 1,000 lines of plain .mjs, on a single developer machine, with no CI today. GH-1 lists "CI machinery" as a non-goal. Grade against issue #2 and commensurate complexity. Do not ask for enterprise test infrastructure, a coverage regime, or multi-platform goldens unless a stated requirement needs them.

Read the plan in full and the source paths in Setup. You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`. Do not run the renderer, tests or gates here.

Questions:
1. Grounding: are the recon claims true against the code? Specifically: `render.mjs` runs `main()` on import and writes to a fixed `output/<date>-<package>/` folder; `verify.mjs` reads the newest folder; nothing currently re-renders and compares. Is the determinism claim (byte-identical PNG/SVG/HTML on re-render on the same machine) labelled with its limits?
2. Do the four canaries cover the regressions that matter most for this spike, without overlap or padding? Is a high-value canary missing, or is one redundant with `spike:verify`?
3. The output-root override (`SPIKE_OUTPUT_ROOT`) is the only production-code change. Is it the smallest change that keeps tests from touching committed evidence? Does it preserve the recorded `output/<run>/...` paths and the verifier contract?
4. C2's platform-gated digest comparison skips digests unless platform, arch and Chromium version match, but always compares geometry within 0.5 px. Is that honest and sufficient? Could it pass vacuously, for example with zero boxes compared?
5. Is the ratchet (budget file plus runner checks) mechanical, cheap, and hard to bypass by accident? It checks file count, `test(` count, the `guards:` prefix, workflow count, history-matches-budget, and wall time. Can it be gamed trivially, for example via `it(`, `describe(`, or test files under another extension or folder? Is anything over-built?
6. Do the rules belong in AGENTS.md plus `test-budget.json`, with one source of truth and no duplicated rule text?
7. Are rollback and the red controls sufficient and falsifiable? That covers the three runner controls, plus C4 as a built-in red control.

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
