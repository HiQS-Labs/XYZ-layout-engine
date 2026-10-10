# RELAY · GH5 Wave 1 post-build independent QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Reviewer
STATUS: Open
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
6. **Commit only the relay file** (`relay(gh5-wave-1-post-build-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: Full changed runtime and callers: tools/request.mjs, tools/render.mjs, tools/profile.mjs, tools/recipes/nutrition.mjs, tools/recipes/solar-system.mjs, tools/spike/assets.mjs, tools/spike/render.mjs, tools/spike/scene.mjs, tools/spike/verify.mjs, tools/spike/test/canaries.test.mjs, examples/2026-10-08-solar-system/generate-assets.py, render-diagram.mjs, contact-sheet.mjs; package.json/pnpm-lock.yaml/test-budget.json; whole README.md, tools/MVP-REPORT.md, Solar README.md, PROJECT/2-WORKING/SPECS-PRD.md, CHANGELOG.md; canonical GH-5 and MARATHON-PLAN-2026-10-09 docs/YAML/briefs; final-verification and phase acceptance receipts.
- Reviewer: codex   ·   Producer: coordinator
- Started: 2026-10-09
- Definition of Done: Separate final Wave 1 post-build QA of the integrated committed candidate before feature push/ready PR. All material findings resolved or explicitly scoped pending human/provider/Later gates; honest evidence and no regression against the bounded local MVP. Review whole relevant files, not merely newest docs. Exact reviewed SHA attested by native supervisor.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Final independent Wave 1 review

Goal: review the entire GH-5 local MVP diff versus integrated origin/main 447f7aa, plus current execution docs and proof. This is a separate final review, not a recycled Phase 5 receipt. Independent Codex reviewer did not author this implementation; coordinator authored surgical repairs and owns the integrated fresh-full-clone suite/PDDA receipts. Read ROUTER/principles/AGENTS and canonical execution scope. Graph project is unindexed in parent; disclose unavailable graph in your seat and use exact source fallback. The frozen-lockfile install/full suite ran in a real non-shallow disposable clone at integrated 6e54db1, four tests/29.4s; source bytes unchanged by subsequent acceptance documentation. Actual fresh workflows retain exact edits/readback/selectors/hashes and both-recipe compact/inline browser fonts/images/zero HTTP(S), not OS network-sandbox/provider claims. Native Phases 2–5 accepted; Phase 1 explicitly accepted via independent recovery review/test that superseded its stopped lane, no fabricated phase.approved.

Operational envelope: trusted two fixed-canvas recipes, local serial library/CLI, optional explicitly configured POSIX paid caller. No server/tenant/service/queue/editor/provider client/new dependencies/tests/workflows. Secure admission and unknown paid outcomes matter; speculative enterprise frameworks do not. You are not alone: preserve all source, write ONLY this relay and disposable scratch. No git/install/suite/validate.sh/executable fixture/browser/paid calls during this reviewer flight. Narrow read-only source/proof parsing and copied module/admitted operation probes in TMPDIR/.relay-scratch allowed; Python -B prevents bytecode. No probes against immutable fixtures/assets/goldens. You must grade any unavailable full-clone measurements honestly.

Questions:
1. Does one shared admission/render/publication/save path preserve strict fields/types/recipe versions, filesystem confinement, safe trusted-SVG/direct-PNG subset and preallocation resource bounds, import safety, finally browser cleanup, last-good immutable manifests, exact artifact digests and durable save failure ordering? Bound claims to actual source/current serial envelope. Whole core files and their material call paths are in scope.
2. Do nutrition/Solar recipe and migrated demo/contact-sheet callers retain trusted fonts, eleven verified supplied selected PNGs (including refined IDs), actual readable fitting/exhaustion/painted visibility, original artwork/fixture geometry and no copied-runtime/originals dependency? Incoming main examples retain bytes; inspect their direct renderer calls for compatibility where material, without modifying those unrelated examples.
3. Does existing generator enforce caller/recipe/input/reference identity, Sun-first admission, file/whole-batch ownership, reserve-before-dispatch limits, one paid attempt, validated output/alpha/receipt reuse, bounded process-group cancellation, durable unknown states and no blind paid replay? The thirteen default jobs exceed default cap eleven; explicit dry-run cap13 is documented and source unchanged. Distinguish controlled stub behavior from live-provider evidence.
4. Are requested-format raster skipping, compact/inline escaped/confined asset packaging, manifest-owned digests, durable --set/--save and retained 16 groups/120 samples accurately reported? Profiling samples/stats round separately, so do not mistake display rounding for precise measurement drift. No PNG speedup/latency SLA/p95/provider claim; no derivative cache because current workloads have no useful derivative transform. Verify final renderer fingerprint binding and retained geometry/byte identities.
5. Are existing four canaries meaningful for named failure modes and still one file/four tests/60s/zero workflows, with no source-fixture/golden/test-budget changes? Current integrated-canaries.log, integrated-pdda.log, integrated-checks.json and main-integration.json show actual outcomes and limits. Canonical ledger union/rebuild check is clean generation32 and preserves other work; no raw SQLite edits or unrelated issue close.
6. Are current acceptance docs honest about completed machine phases vs pending human migrated-artwork approval, exact deployed caller revision, Chromium redistribution notices, unsupported hard render interruption/RSS/concurrency/stage-correlation diagnostics, live-provider benchmarking and Later HTTP/MCP/tenant work? Final checklist QA/adjudication remain pending until this review completes. On approval, coordinator will record this terminal receipt/checklist/status only, run root-bound pre-PR gate and open a ready PR, keeping GH5 open. The substantive reviewed source/docs must not change after approval without further QA.

Output: append one native Reviewer block with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no; concise graded cited findings, concrete fix and input/scope/falsifier for every Should/Blocker. Say explicitly if no additional pre-existing defect is found in the declared whole-file sweep. Record commands/exits/decisive output for probes and limitations. Only independent reviewer sets first STATUS: Approved; tick done GH5-WAVE1-POSTBUILD-QA-20261009 --agent codex on approval or release to coordinator if changes requested. No artifact edits; supervisor commits/attests exact candidate. Approval covers candidate and allows receipt-only acceptance recording, not new code or rewritten product claims. Explicit handoff.

## Log

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
