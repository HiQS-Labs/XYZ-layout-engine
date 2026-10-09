# RELAY · GH-2 plan QA: regression canaries and CI-suite ratchet
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 3

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

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: The four-canary design is proportionate to issue #2, but its success assertion, comparison proof, and budget enforcement need bounded corrections before implementation. These are plan findings from source inspection, not a runtime-suite result.
swept file: yes

Read the entire plan and every Setup source/document in full; also inspected the committed measurements/runtime and targeted REPORT evidence. Verify-tier intent, direct-source fallback: `list_projects(limit=100)` returned all 82 projects, none for this checkout or its task clone; `check_index_coverage` for the nine Setup/artifact paths and `tools/spike` returned `project not found or not indexed`. No graph generation is available. Local reference search traced package scripts → renderer/verifier → scene/assets; no extra runtime caller appeared in that bounded source/config search. Startup README and local releases CLI are absent from the seeded worktree. Issue #2 was fetched through the GitHub connector; its acceptance asks for one local command “in well under a minute,” named guards, a mechanically reviewable budget/admission rule, and no new framework.

- [Should] **R1 — C1 requires output the renderer cannot emit.** `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md:59` requires exit 0 and `VERDICT: PASS` “from both.” Renderer success output is `render: wrote`, backend status, and selection (`tools/spike/render.mjs:538`); only the verifier prints that verdict (`tools/spike/verify.mjs:290`). Fix the plan to require renderer exit 0 and verifier exit 0 + PASS; retain the output-root override as the only runtime change.
  Observed input: the existing successful renderer contract, also recorded at `tools/spike/REPORT.md:18`. Read-only probe `python3 -c 'from pathlib import Path; s=Path("tools/spike/render.mjs").read_text(); print("VERDICT: PASS occurrences:", s.count("VERDICT: PASS"))'` exited 0: `VERDICT: PASS occurrences: 0` (output stored in `.relay-scratch/tmp/c1-log-probe.out`).
  Affected scope: C1's assertion on renderer stdout.
  Falsifier: in a disposable clone, an unchanged successful render must satisfy C1; `SPIKE_INJECT_FAILURE=1` must make C1 fail (existing injection at `render.mjs:369`). If success actually emits PASS without a runtime change, this finding is unnecessary.

- [Should] **R2 — the ratchet permits ordinary uncounted test forms.** Plan lines 70–72 count only `*.test.mjs` and `test(`, with no restriction on other Node test APIs or locations/extensions. Fix by defining and mechanically enforcing one bounded test-file/API convention, rejecting alternate test declarations/discovery forms rather than adding a parser framework. Include executed-test accounting so skip/todo/zero execution cannot masquerade as four passing canaries. Add a red control for the ordinary bypass below.
  Observed input: append `import { it } from 'node:test'; it("guards: fifth canary", () => {});` to the sole test file: file count stays one and the added declaration contains zero `test(` calls. Probe `python3 -c 'import re; s="it(\"guards: fifth canary\", () => {});"; print("append to canaries.test.mjs:", s); print("test( count:",len(re.findall(r"\btest\(",s))); print("extra.test.js counted by *.test.mjs:", "extra.test.js".endswith(".test.mjs"))'` exited 0: `test( count: 0`; `extra.test.js counted by *.test.mjs: False` (scratch output `ratchet-probe.out`). This measures the plan's literal predicates, not an implemented runner.
  Affected scope: spike-owned tests and the test runner's discovered/executed declarations; exclude installed harness/dependency/scratch trees explicitly. Account for `it`, suites/subtests, skipped tests, and normal `.test.js`/`.spec.*` or alternate-directory additions by rejecting or counting them under the chosen convention.
  Falsifier: clone red controls must reject the fifth `it` and alternate-extension test before tests execute; the original four canaries must execute and pass without a budget increase. If the chosen enforcement already rejects both, this gap is closed.

- [Should] **R3 — make C2 non-vacuous and give its comparator a red control.** Plan lines 60–62 say geometry matches but do not require exact case/backend/label sets, finite coordinates, or a positive comparison count; line 81 records only runner controls and C4. Fix by comparing the committed and fresh case/backend/label key sets first, then finite `x/y/width/height` values within 0.5 px, with an explicit compared-box count. Pin the golden artifact list independently of the fresh output. Specify clone red controls for missing labels, geometry drift, and an enabled golden digest mismatch, plus C1's existing failure injection; reuse C4 as the verifier/C3 red control.
  Observed input: committed baseline/satori `bounds.callout_1_img` exists at `tools/spike/output/2026-10-08-xyz-layout-engine-spike/measurements.json:81`. Removing that image label from fresh measurements leaves it outside the verifier's required-section list (`tools/spike/verify.mjs:186`); the verifier iterates only remaining bounds (`verify.mjs:87`). An intersection-only C2 comparison could miss this loss while PNG bytes stay unchanged. The plan does not exclude that implementation; no comparator exists yet to run.
  Affected scope: C2 comparisons of all three existing cases × both backends; no new fixtures or platforms.
  Falsifier: clone controls removing that one fresh label, moving one coordinate by 1 px, and changing one golden-comparison artifact byte must each fail C2 at the intended assertion; unchanged evidence must compare a nonzero number of boxes and pass. A digest-ineligible host must still exercise geometry and report digest checks skipped.

- [Should] **R4 — a post-exit stopwatch does not bound a stalled run.** Plan line 77 checks wall time only after `node --test` returns. Specify a finite parent-controlled deadline for the test subprocess and its render child, with cleanup on timeout/failure, using Node facilities and the existing renderer deadline where possible. Add one clone timeout red control; no new service or watchdog package.
  Observed input: plan budget `maxSeconds: 60` (line 66) versus existing `SPIKE_RENDER_DEADLINE_MS || 240_000` (`tools/spike/render.mjs:33`). A render waiting for its existing deadline can outlive the suite budget; a never-returning test prevents the proposed after-return check entirely. This is a source-derived gap, not an observed hung run.
  Affected scope: the local runner's test subprocess and descendants, including Chromium; preserve normal renderer cleanup (`render.mjs:346`, `render.mjs:541`).
  Falsifier: a disposable-clone controlled stall with a short temporary budget must exit nonzero within the deadline plus a documented small cleanup allowance, leaving no test/render/browser child; the normal suite must stay green. If the planned runner already enforces that deadline, no additional mechanism is needed.

- [Nit] **State the supported host honestly.** C2's digest skip does not make the whole suite portable: C3 checks the committed native binding against the current process platform/arch (`tools/spike/verify.mjs:242`), while committed `runtime.json:28` is `@resvg/resvg-js-darwin-arm64`. Prefer explicitly limiting this spike command to the recorded developer host and stating the existing verifier limitation; cross-platform gate redesign is outside this issue. Also replace “pure builders” (plan line 33) with scene builders and filesystem asset loaders (`tools/spike/assets.mjs:11`, `tools/spike/scene.mjs:68`). This sweep found the host coupling in pre-existing source; no other material pre-existing defect was identified within the stated local-spike scope.
- [Nit] **Resolve the budget-decrease contradiction.** Line 79 says budgets can drop freely; line 74 requires exact history equality for any change. State whether decreases need a history entry without new admission justification, or adjust the equality rule accordingly. Keep the detailed policy in `test-budget.json` and only its pointer in AGENTS.md. Rollback should also remove that added pointer (line 50).
- [Pass] **Reuse and scope are appropriate.** Plan lines 46–49 and 54–56 extend the existing writer/reader, use `node:test`, and add no workflow/dependency. Writer paths are physical `OUT` plus logical `rel()` (`tools/spike/render.mjs:30`); verifier has both scan and physical `out()` reads (`tools/spike/verify.mjs:15`, `verify.mjs:18`). Implementation must route both physical reader operations through the override while keeping logical `output/<run>/...` unchanged. Four canaries need no additional parallel suite; C3 deliberately reuses the existing gate and C4 targets its recorded-digest assertion (`verify.mjs:161`).
- [Unverified — needs clone run] Plan line 35's fresh-render byte stability and 8.1-second observation were not reproduced here. Its same-machine/environment limits are stated, and the report records repeat determinism (`tools/spike/REPORT.md:72`), but this review does not certify fresh golden equality, suite timing, runtime red controls, or PDDA results. Those runs belong to implementation/clone validation and the harness gate.

Review outcome: changes requested. Reversibility: Easy — amend the plan, then implement its single runner and existing-source override; no artifact/source edits were made by this reviewer.
Handing off to claude-a (Producer) — disposition R1–R4 and the nits, revise the plan, then return for round 2. Go to the Producer window and say 'take your turn'.

### Producer · Round 1 → 2 (claude-a)

Plan revised in `911f757`; see the Implementation section of `PROJECT/2-WORKING/GH-2-REGRESSION-CANARIES.md`.

- **R1 [Should] — Implemented.** C1 now requires renderer exit 0 plus a stdout line starting `render: selection`. It then requires verifier exit 0 with `VERDICT: PASS`. Recorded red control: `SPIKE_INJECT_FAILURE=1` must fail C1.
- **R2 [Should] — Implemented.** The convention is one file and plain `test()` only. Before any test runs, the runner rejects:
  - `it(`, `describe(`, `suite(`, `.skip`, `.todo`, `.only`, `skip:` and `todo:`
  - any test-like file outside `node_modules/` and `.xyz/` beyond the budget, matching `/\.(test|spec)\.[cm]?[jt]sx?$/` or under a `test`, `tests` or `__tests__` directory other than the runner itself
  
  For executed-test accounting, the TAP summary must show `# pass` equal to the declared count and no greater than the budget, with fail, skip and todo at 0. New red controls cover a fifth `it(` and an extra `x.test.js`.
- **R3 [Should] — Implemented.** C2 first requires equal case/backend/label key sets. It then requires finite coordinates within 0.5 px, and a printed compared-box count greater than 0. Digests are compared only on a matching host; otherwise C2 prints `digests: skipped (host differs)` while geometry is still enforced. The golden root can be overridden with `SPIKE_GOLDEN_ROOT` so the comparator has red controls: a removed label, a 1 px move, and a byte change with its digest. Each must fail.
- **R4 [Should] — Implemented.** The runner spawns `node --test` in its own process group with a `maxSeconds` parent deadline: SIGTERM, then SIGKILL after 5 s, then fail. The render child gets `SPIKE_RENDER_DEADLINE_MS=40000`, so the existing renderer deadline closes Chrome. Red control: a temporary `maxSeconds: 3` must fail with no leftover node, render or Chrome process, checked with `pgrep`.
- **Nit (host) — Implemented.** A "Supported host" paragraph says the suite targets the recorded darwin-arm64 host. C3 inherits the verifier's platform-binding check, so other hosts fail C3 by design.
- **Nit (budget decrease) — Implemented.** Any budget change, up or down, needs a history entry. A decrease needs only a reason; an increase must also name the issue and the failure mode. The policy text lives only in `test-budget.json`, with only a pointer in AGENTS.md. Rollback now includes removing that pointer.
- **[Pass] — acknowledged.** Both physical reader paths in `verify.mjs`, the scan and `out()`, will use the override.

VERDICT: PASS
Basis: every round-1 finding is reflected in the plan with a falsifiable red control; scope is unchanged (one test file, one runner, one budget file, two env overrides).

Handing off to codex (Reviewer) — round 2 against `911f757`; go to the Reviewer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
