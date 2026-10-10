# RELAY · GH-5 Phase 4 HTML gate repair and candidate independent QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 1 / 1

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
6. **Commit only the relay file** (`relay(gh-5-phase-4-html-gate-repair-and-candidate-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/render.mjs`, `tools/request.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`, `tools/profile.mjs`, `package.json`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`, `tools/MVP-REPORT.md`; recovery receipts under `relay-system/2026-10-09/gh5-phase4-recovery/`
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: Independently review the complete Phase 4 candidate and surgical HTML assertion repair. Validate the exact named HTML artifact contract, four-canary evidence, compact/self-contained export safety, durable edits/save/publication boundaries, unchanged protected fixtures, requested-format behavior, and honest profiling. No artifact writes; only this relay.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

## Current ground truth and bounded review

This is independent recovery QA, NOT a new original Phase 4 fire or phase approval. Original task MARATHON-GH5-P4-TURN remains halted after attempt 3, consuming ONE authorized Codex-builder/Agy-reviewer override. Its builder passed containment and Agy attested be3ddb5561c2aa0b487e54a85b922d0e45a27d96. The native pre-advance gate stopped because old C1 checked artifact[0] MIME; packaged fonts precede the requested render.html. C2 lacked fresh output because C1 stopped before comparison. See codex-override-attempt.log, phase4-candidate-attestation.json and html-artifact-repro.json. No Phase 5 start or native phase.approved event exists.

Smallest repair: existing C1 selects render.html by exact name, requires presence, then retains MIME/doctype assertions. No runtime ordering rewrite, weakened validation, new block/dependency/CI, or ratchet change. Full existing suite outside reviewer flight passed 4/4 in 36.8s, including actual compact/relocated-inline browser loading, both font weights/images and zero network requests; geometry and 12 artifact digests match. See html-repair-verification.log. Do not rerun full suite in the reviewer worktree. Narrow non-mutating or scratch-only probes are welcome.

Review the ENTIRE declared source files, not just the assertion diff. Read ROUTER/AGENTS/GUIDING and canonical GH-5 Phase 4; use exact source fallback if MCP or ledger CLI unavailable. Report real pre-existing defects in these owners. Preserve source fixtures/assets/goldens/receipts; scratch goes under TMPDIR/.relay-scratch only, never root helper/cache files. No git, paid generation, original-task mutation, force, counters, push/merge, or Phase 5 start. The original P4 brief's historical prospective authorization has been consumed; current YAML is HELD.

Check that the 120 before/after samples and performance claims are tied to the final renderer fingerprint and do not imply PNG/provider speedups or browser RSS. Check compact asset references, escaped text/URLs, validated manifest content and last-good atomic publication, saved edit rerender plus failed edit/save preservation, bounded resources and geometry/glyph checks. Current scope remains the local serial CLI; no speculative service/concurrency framework requests. New findings need Observed input, Affected scope, Falsifier and an actual failure for Blocker.

Append ### Round 1 · Reviewer · codex with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no, cited graded findings and exact probe results/limits. Do not claim native advancement or completed marathon. Only independent reviewer may set STATUS: Approved. On approval use env-pinned absolute tick done GH5-P4-HTML-RECOVERY-QA-20261009 --agent codex; otherwise release to coordinator. Explicit closure/handoff. Supervisor commits/attests only this independent QA.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
