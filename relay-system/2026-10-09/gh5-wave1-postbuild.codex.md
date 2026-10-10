# RELAY · GH5 Wave 1 post-build independent QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-09.
-->

NEXT: Producer
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
2. Do nutrition/Solar recipe and migrated demo/contact-sheet callers retain trusted fonts, eleven verified supplied selected PNGs (including refined IDs), actual readable fitting/exhaustion/painted visibility, original artwork/fixture geometry and no copied-runtime/originals dependency? Incoming main examples retain bytes; inspect their direct renderer calls for compatibility where material, without modifying those unrelated examples.  [Unverified — no citation]
3. Does existing generator enforce caller/recipe/input/reference identity, Sun-first admission, file/whole-batch ownership, reserve-before-dispatch limits, one paid attempt, validated output/alpha/receipt reuse, bounded process-group cancellation, durable unknown states and no blind paid replay? The thirteen default jobs exceed default cap eleven; explicit dry-run cap13 is documented and source unchanged. Distinguish controlled stub behavior from live-provider evidence.
4. Are requested-format raster skipping, compact/inline escaped/confined asset packaging, manifest-owned digests, durable --set/--save and retained 16 groups/120 samples accurately reported? Profiling samples/stats round separately, so do not mistake display rounding for precise measurement drift. No PNG speedup/latency SLA/p95/provider claim; no derivative cache because current workloads have no useful derivative transform. Verify final renderer fingerprint binding and retained geometry/byte identities.
5. Are existing four canaries meaningful for named failure modes and still one file/four tests/60s/zero workflows, with no source-fixture/golden/test-budget changes? Current integrated-canaries.log, integrated-pdda.log, integrated-checks.json and main-integration.json show actual outcomes and limits. Canonical ledger union/rebuild check is clean generation32 and preserves other work; no raw SQLite edits or unrelated issue close.
6. Are current acceptance docs honest about completed machine phases vs pending human migrated-artwork approval, exact deployed caller revision, Chromium redistribution notices, unsupported hard render interruption/RSS/concurrency/stage-correlation diagnostics, live-provider benchmarking and Later HTTP/MCP/tenant work? Final checklist QA/adjudication remain pending until this review completes. On approval, coordinator will record this terminal receipt/checklist/status only, run root-bound pre-PR gate and open a ready PR, keeping GH5 open. The substantive reviewed source/docs must not change after approval without further QA.

Output: append one native Reviewer block with literal VERDICT: PASS|FAIL|PARKED, nonempty Basis:, swept file: yes|no; concise graded cited findings, concrete fix and input/scope/falsifier for every Should/Blocker. Say explicitly if no additional pre-existing defect is found in the declared whole-file sweep. Record commands/exits/decisive output for probes and limitations. Only independent reviewer sets first STATUS: Approved; tick done GH5-WAVE1-POSTBUILD-QA-20261009 --agent codex on approval or release to coordinator if changes requested. No artifact edits; supervisor commits/attests exact candidate. Approval covers candidate and allows receipt-only acceptance recording, not new code or rewritten product claims. Explicit handoff.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: One observed integration regression prevents approval: removing the Solar System copied runtime breaks four callers brought in from current main. The integrated four-canary receipt is green but does not exercise these callers. Repair this dependency seam and obtain fresh clone evidence before final Wave 1 approval.
swept file: yes

Whole-file sweep: all runtime/caller files named in Setup, package.json, pnpm-lock.yaml, test-budget.json, README.md, tools/MVP-REPORT.md (including parsed retained measurements), Solar README, SPECS-PRD.md, CHANGELOG.md, GH-5, marathon plan/YAML and five briefs. Also inspected incoming example import/font/render call seams and the two cell helpers. No additional pre-existing defect was found in this declared sweep beyond the dependency regression below. Graph tools/project-generation/coverage queries are unavailable in this seat; exact source fallback was used, without an exhaustive graph claim. Startup releases query exited 2 because `.xyz/utils/py/releases_app.py` is absent here. The supervisor owns exact candidate-SHA attestation; this reviewer ran no git command.

- [Blocker] B1 — Deleted runtime still owns incoming caller dependencies. `examples/2026-10-09-rag-system/render-diagram.mjs:10`, `:11`, `:12`, `:15` and `examples/2026-10-09-cell-division/render-diagram.mjs:11`, `:12`, `:13`, `:16` resolve renderer, Playwright and fonts under the removed `examples/2026-10-08-solar-system/runtime/`. `examples/2026-10-09-cell-division/make-web-asset.mjs:8`, `:9`, `:20` and `inspect-alpha.mjs:9` have the same dependency. The literal first imports fail with `ERR_MODULE_NOT_FOUND`; renderer/font paths return ENOENT. This occurs before fixture reads or rendering, independent of browser availability. Byte preservation in `gh5-final-verification/main-integration.json` does not preserve executable behavior. Root shared renderer exports are present as a positive control.
  Observed input: the exact module URLs computed by those four source callers; specifically `examples/2026-10-08-solar-system/runtime/tools/spike/render.mjs` and `examples/2026-10-08-solar-system/runtime/node_modules/playwright/index.mjs` on this integrated candidate.
  Affected scope: these four existing incoming tools and their concrete runtime/font/dependency setup references (`examples/2026-10-09-rag-system/README.md:24`, cell README `:34`, `skills/design-diagram/SKILL.md:15`, `:37`). No new recipe, provider behavior or unrelated artwork change is requested.
  Falsifier: if the current candidate resolves these exact imports and font reads after its documented install, with both existing diagrams still rendering successfully in a disposable full clone, migration is unnecessary. Expected control: root `tools/render.mjs` exports loadSatori/renderSatori/renderPlaywright, and migrated callers retain prior fixture/assets and reviewed geometry/artwork.
  Fix: complete the dependency migration to the existing root renderer, root pinned fonts and installed Playwright for all four consumers; update the listed setup references/provenance wording. Preserve their fixture/artwork bytes and validation; do not restore a second copied engine or add a framework. Run the example/helper workflows only in a disposable full clone, retaining commands/exits and meaningful output comparisons, then return for review. Reversibility: Easy.
  Root cause: current-main consumers were preserved while their runtime dependency was deleted; Fix site: their import/font/setup seams; Why not downstream: catching module errors or accepting unchanged source bytes would leave documented reproduction broken.

  Probe command (no example/fixture executed; output under scratch):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module -e 'import {pathToFileURL} from "node:url"; const rt=new URL("examples/2026-10-08-solar-system/runtime/",pathToFileURL(process.cwd()+"/")); const cases=[["rag render","tools/spike/render.mjs"],["cell render","tools/spike/render.mjs"],["make-web-asset","tools/spike/render.mjs"],["inspect-alpha","node_modules/playwright/index.mjs"]]; for(const [caller,file] of cases){try{await import(new URL(file,rt));console.log(caller,"unexpectedly resolved");}catch(e){console.log(caller,e.code);process.exitCode=1;}} const shared=await import("./tools/render.mjs"); console.log("root shared exports",["loadSatori","renderSatori","renderPlaywright"].every(k=>typeof shared[k]==="function"));' > "$TMPDIR/caller-regression.log" 2>&1
  ```
  Exit 1. Decisive output: `rag render ERR_MODULE_NOT_FOUND`, `cell render ERR_MODULE_NOT_FOUND`, `make-web-asset ERR_MODULE_NOT_FOUND`, `inspect-alpha ERR_MODULE_NOT_FOUND`, `root shared exports true`. Initial `fs.access` probe of the same two renderers' four RT paths also returned ENOENT for renderer, Playwright and both fonts; exit 1.

- [Pass] Shared local source contracts remain bounded to the documented serial/trusted filesystem envelope: descriptor-bounded reads and recipe-owned admission (`tools/request.mjs:12`, `:31`, `:80`), native fitting/exhaustion and owning finally cleanup (`tools/render.mjs:176`, `:254`, `:312`), one immutable publication commit point (`:386`) and preflight → publish → atomic save ordering (`:447`–`:453`; `tools/request.mjs:103`). Compact references are generated from image/font attributes, with escaped labels (`tools/render.mjs:58`, `:296`); requested-only raster work is gated at `:36`, `:134`, `:167`. Source review, not a new render measurement. Fix: none for these bounded paths.
- [Pass] Solar source reads eleven selected derivatives with aggregate PNG admission and pinned display digests, including refined IDs (`tools/recipes/solar-system.mjs:63`, `:97`–`:111`), and rejects spatial escapes before rendering (`:66`–`:93`). Existing C1 has painted-pixel, real-shrink, exhausted-fit and unsupported-glyph controls (`tools/spike/test/canaries.test.mjs:203`–`:264`); these are stronger than rectangle/alpha metadata alone. Fix: retain these owners and controls.
- [Pass] Optional generator source retains exclusive batch ownership, caller/manifest/reference identity, Sun-first admission, reserve-before-dispatch cap checks, immutable attempts and fail-closed unknown/reuse handling (`examples/2026-10-08-solar-system/generate-assets.py:116`, `:210`, `:247`–`:315`). README distinguishes thirteen default jobs from eleven selected display files and the default cap refusal. Existing C1 stubs exercise counted resume/refinement/corruption/overlap/deadline behavior; this is recorded local-stub evidence, not a live-provider claim. Fix: none within the admitted caller envelope.
- [Pass] Retained profiling data is internally bound to current source: `tools/MVP-REPORT.md:113` contains 16 groups/120 samples, correct counts/dimensions, paired before/after artifact and geometry identities, and optimized SVG raster=0. Every optimized group fingerprints current `tools/render.mjs` as `a5b749a255ab10e3e38b7c7ccf80fce9b31f161580cb7ed47eb873ee2614079a`. No new latency measurement or PNG speedup is inferred. Fix: preserve this dataset and its limitations.
  Probe command:
  ```sh
  python3 -B - > "$TMPDIR/measurement-final.log" <<'PY'
  import hashlib,json,re
  from pathlib import Path
  report=Path("tools/MVP-REPORT.md").read_text()
  d=json.loads(re.search(r"```json\n(.*?)\n```",report,re.S).group(1))
  gs=d["groups"]; cols=d["columns"]
  assert len(gs)==16 and sum(len(g["samples"]) for g in gs)==120
  h=hashlib.sha256(Path("tools/render.mjs").read_bytes()).hexdigest()
  for g in gs:
   assert len(g["samples"])==g["count"]==(5 if g["mode"]=="fresh" else 10)
   assert g["dimensions"]==([1000,1000] if g["recipe"]=="nutrition" else [2400,1700])
   assert all(len(row)==len(cols) for row in g["samples"])
   other=next(x for x in gs if x["state"]!=g["state"] and all(x[k]==g[k] for k in ("recipe","format","mode")))
   assert g["digests"]==other["digests"] and g["geometrySha256"]==other["geometrySha256"]
   if g["state"]!="baseline":
    assert g["rendererSha256"]==h
    if g["format"]=="svg": assert all(row[cols.index("rasterMs")]==0 for row in g["samples"])
  print("16 groups; 120 samples; paired digest/geometry identities; optimized SVG raster=0; current renderer="+h)
  PY
  ```
  Exit 0. Decisive output: `16 groups; 120 samples; paired digest/geometry identities; optimized SVG raster=0; current renderer=a5b749a255ab10e3e38b7c7ccf80fce9b31f161580cb7ed47eb873ee2614079a`.
- [Pass] Receipt inspection: `gh5-final-verification/integrated-canaries.log:2` reports the unchanged one-file/four-test/60s/zero-workflow budget; closing span is `test-budget: PASS — 4 canaries in 29.4s (budget 60s)`, with 216 boxes and 12 identical artifacts. `integrated-pdda.log` closes with `no errors, 2 warning(s)`; `integrated-checks.json` records generation32/zero ledger failures. Native Phase4/5 logs close with `STATUS: Approved, gate passed`; Phase1 recovery is separately attested rather than fabricating its stopped native gate. Current GH-5/marathon checklists leave final QA/pre-PR and human/provider gates pending. Fix: preserve these receipts; add fresh evidence covering B1 before checking final acceptance.

Limitations: [Unverified — needs clone run] repaired incoming workflows and fresh post-repair full suite/PDDA/pre-PR gate. No install, suite, validate.sh, executable fixture, browser or paid call was run in this reviewer flight. Earlier fresh-workflow receipts were inspected for exact saved edits, matching rerender SVGs and loaded Inter400/700/images with zero HTTP(S); they are coordinator observations, not this seat's execution. Human migrated-artwork acceptance, deployed caller revision, Chromium redistribution notices, hard render interruption/RSS/concurrency/stage-correlation and live-provider benchmarks remain explicitly pending/Later. No additional runtime fix or claim expansion is requested.

Review outcome: changes requested; STATUS remains Open. Handing off to Producer/coordinator — repair B1, record a disposition and fresh isolated evidence, then return for Round 2. No feature push/ready PR approval is granted by this turn.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
