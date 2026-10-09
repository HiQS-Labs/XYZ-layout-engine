# RELAY · GH-5 Phase 1 surgical repair independent QA
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
6. **Commit only the relay file** (`relay(gh-5-phase-1-surgical-repair-independent-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **MVP-REPORT.md** (embedded below — read it here).
- Reviewer: codex   ·   Producer: codex-producer
- Started: 2026-10-09

### Artifact — MVP-REPORT.md
```
# MVP Report

## Phase 1 recovery — 2026-10-09

The initial native Phase 1 lane halted at `cap-progressing-extended`, exit 4; its test gate never ran. Its escalation remains unchanged. The operator authorized workhorse repair and independent QA before a continuation. This report records orchestrator verification while no builder is active; it does not forge `phase.approved`.

Delivered local subset: nutrition recipe 1.0.0 on its 1000×1000 canvas, scale 1, Satori by default; PNG/SVG/self-contained HTML artifacts and explicit Playwright PNG/HTML. Other dimensions/scale and remote/fallback fields fail with field paths. API: `processRequest(request, {root})` returns normalized request, validation, pinned versions, input provenance, SHA-256 and requested artifact bytes/MIME/dimensions. CLI: `node tools/render.mjs tools/spike/fixture.json --out tools/output/local [--format svg|html] [--backend playwright]`. Inputs and output are confined to the authorized local root; committed spike output is read-only. JSON is limited to 256 KiB; images to direct 8-bit RGBA non-interlaced PNG or the trusted bundled SVG subset. PNG chunk bounds/order/CRC, scanline inflation/filter bytes and positive dimensions are validated before native rendering. Per-image limit: 5 MiB and 16,777,216 pixels; scene aggregate: 35 MiB encoded and 16,777,216 pixels; render area 16,777,216 pixels; total published bytes 64 MiB. The local filesystem is trusted against concurrent hostile mutation; this is not remote tenant isolation.

One publisher owns immutable `runs/<UUID>` and atomically commits `manifest.json` after all staged files are admitted/hashed. Shared operation validates text presence/region/canvas, fonts and raster size first; spike validates mandatory capability outcomes and case digests/dimensions first. No postcommit compatibility copies. `selectedRun` resolves the pointer once for readers; legacy manifest-free goldens remain readable. Browser/context/page owners close in finally; Chromium loads only for explicit browser requests or the explicit legacy comparison.

## Receipts

Host: Node v22.22.3, pnpm 12.4.1, darwin-arm64. Pinned installed renderers: Satori 0.36.0, resvg 2.6.2, Playwright 1.64.0. No dependency, test-block, test-budget or CI-workflow addition.

- Original baseline `pnpm test`: exit 0, 4/4 in 9.8s, despite the witnessed admission and markup failures. Receipt: `relay-system/2026-10-09/gh5-p1-repair/baseline.log`.
- Red controls: oversized 8192² canvas with scale 0.1 admitted; literal injected script serialized. Receipt: `relay-system/2026-10-09/gh5-p1-repair/red-controls.log`.
- Revised C1 exposed macOS `/var` versus `/private/var` guard/root aliases. Canonicalization fixed both. Root red receipt: `relay-system/2026-10-09/gh5-p1-repair/macos-root-red.log`; the earlier empty-CLI failure is recorded in repair plan/tool transcript.
- Current `pnpm test`: exit 0, four canaries in 10.8s, 216 geometry boxes within 0.5 px and 12 artifacts byte-identical. Receipt: `relay-system/2026-10-09/gh5-p1-repair/verification.log`. C1 now checks actual imports, local CLI in a space path with dependency linkage, format export, strict input/asset/HTML controls, owning browser cleanup via native launch substitution, and two successful same-day publications followed by a late failure. It re-reads selection and compares target, manifest bytes and all referenced digests, and checks orphan cleanup.
- Preservation: `git diff origin/main -- tools/spike/output examples/2026-10-08-solar-system/assets test-budget.json` is empty. Historical content, test budget and original checkout preserved. Easy rollback: revert task-branch repair; prior immutable runs/selectors and goldens are retained.
- Consult: both Codex/Agy advisory seats answered; disagreements adjudicated in `relay-system/2026-10-09/gh5-p1-repair/plan.md`. Consult is not runtime acceptance.

Independent committed-code Codex QA is pending. Phases 2–5, adaptive fitting/Solar System, generation resume, measured optimization and final integration remain pending. Human artwork acceptance and live provider measurements remain pending; no paid calls, push, PR, merge or issue closure is authorized by these receipts.
```
- Definition of Done: Independently QA the full current Phase 1 code and diff against origin/main and ff6ea60, including tools/request.mjs, tools/render.mjs, tools/recipes/nutrition.mjs, tools/spike/assets.mjs, scene.mjs, render.mjs, verify.mjs and existing C1-C4. Read the final seven findings in marathon-system/gh5-mvp-foundation--gh5-p1/RELAY.md and explicitly disposition each. Review the committed test/PDDA receipts in relay-system/2026-10-09/gh5-p1-repair/ and the honest fixed nutrition/scale subset. Confirm one atomic manifest publication boundary, last-good/history preservation, bounded strict asset and JSON admission, HTML safety, browser cleanup and usable default-lazy CLI. Full files are short; review actual source and use bounded scratch component probes for material uncertainties. Do not run the full pre-advance suite or render outside scratch, edit artifacts, push, browse or redesign the later phases. Existing green suite is evidence but not a substitute for independent review. If a blocker/should exists, give observed input, affected scope and falsifier; accept only if all required Phase 1 acceptance is met. Reviewer writes this relay only, literal VERDICT/Basis/swept file and native handoff, no fabricated approval. Graph: this clone has no indexed project; use exact source fallback. Do not start or reset the halted lane.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The repairs remove the earlier same-directory publication and admission failures, but a failed first publication on a later date hides the last-good run from both readers. The default comparison renderer and verifier also address different roots. Required Phase 1 last-good/reader acceptance is therefore incomplete.
swept file: yes

Scope: read the entire embedded and on-disk MVP report; full tools/request.mjs, tools/render.mjs, tools/recipes/nutrition.mjs, tools/spike/assets.mjs, scene.mjs, render.mjs, verify.mjs, and test/canaries.test.mjs plus test/run.mjs. Read all seven final findings in the halted lane, the repair plan and baseline/red/macOS/current/PDDA receipts. The retained source and C2–C4 bodies were included, not just repair snippets. No additional material defect was established in those retained bodies beyond the reader findings below.

Evidence limits: no graph tools are callable and Setup records no indexed project; exact source fallback was used, with no graph-generation/coverage claim. ROUTER/GUIDING-PRINCIPLES/AGENTS were read; README.md and both router-named releases_app.py paths are absent. No Git command was run: independent diffs against origin/main and ff6ea60, and the preservation-diff claim, remain **[Unverified — needs clone run]**. No suite, executable fixture, real renderer/browser, PDDA runtime, push or external posting was executed. User relay-only instructions take precedence over broader review-code skill workflows. Current suite output is a producer receipt, not a new reviewer run. Native render/CLI/geometry/byte-equivalence acceptance remains **[Unverified — needs clone run]** for the harness.

#### Open findings

- **[Blocker] A failed first run on a later date hides the prior last-good publication.**
  Locations: tools/render.mjs:204–228 (destination creation and rollback), :179–185 (manifest-free fallback); tools/spike/verify.mjs:20–24 and tools/spike/test/canaries.test.mjs:22–25 (newest-date selection); tools/spike/render.mjs:452 (caller).
  Observed input: successfully publish a scratch stage into `2026-10-08-xyz-layout-engine-spike`, then publish another stage into `2026-10-09-xyz-layout-engine-spike` with `failBeforeCommit:true`. The real publisher leaves the second dated directory containing only `runs`; the exact reader date filter chooses it, and selectedRun treats it as legacy evidence. Reading its artifact fails ENOENT while day one's artifact remains readable.
  Affected scope: the first failed publication in a new dated namespace, including validation failures after destination creation; verifier/C2 last-good selection across days. Same-day rollback works and is not the failing predicate.
  Falsifier: after a good day-one publication and failed first day-two publication, both readers still resolve day one's immutable run and its unchanged digests; a successful day-two publication advances selection; genuine legacy manifest-free goldens remain readable.
  Concrete fix: make discovery distinguish a committed run/real legacy evidence from an uncommitted dated directory, or keep that directory out of reader selection until commit. Keep one shared selection rule; do not delete a potentially concurrent or pre-existing directory indiscriminately. Extend the existing C1 control across dates without a new test block.
  Probe: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; node "$TMPDIR/cross-date.mjs"`, exit **0**, repeated with the same result. Decisive output:
  ```text
  injected: injected late publication failure
  previous run readable: OLD-CONTROL
  reader chooses: 2026-10-09-xyz-layout-engine-spike
  reader fails: ENOENT
  failed date entries: ["runs"]
  ```
  Reproduction body (the script imports fs/promises, path and the actual publishStaged/selectedRun; no renderer is invoked):
  ```js
  const root = await fs.mkdtemp(path.join(process.env.TMPDIR, 'cross-date-'));
  async function stage(value) {
    const p = await fs.mkdtemp(path.join(root, '.staging-'));
    await fs.writeFile(path.join(p, 'satori.png'), value); return p;
  }
  const old = await publishStaged(await stage('OLD-CONTROL'),
    path.join(root, '2026-10-08-xyz-layout-engine-spike'), {root});
  try {
    await publishStaged(await stage('NEW-CONTROL'),
      path.join(root, '2026-10-09-xyz-layout-engine-spike'),
      {root, failBeforeCommit: true});
  } catch (e) { console.log('injected:', e.message); }
  const dirs = (await fs.readdir(root, {withFileTypes:true}))
    .filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-xyz-layout-engine-spike$/.test(d.name))
    .map(d => d.name).sort();
  const selected = selectedRun(path.join(root, dirs.at(-1)));
  console.log('previous run readable:', await fs.readFile(path.join(old.directory, 'satori.png'), 'utf8'));
  console.log('reader chooses:', path.relative(root, selected));
  try { await fs.readFile(path.join(selected, 'satori.png')); }
  catch(e) { console.log('reader fails:', e.code); }
  console.log('failed date entries:', JSON.stringify(await fs.readdir(selected)));
  ```
  The `.png` names hold tiny synthetic bytes solely to exercise publication/selection; this is not image-validity or render proof.

- **[Should — required workflow integration] Default spike verification reads historical evidence rather than the newly rendered run.**
  Locations: tools/spike/render.mjs:29, tools/spike/verify.mjs:19; package.json:7–8. C1 passes the same SPIKE_OUTPUT_ROOT explicitly at canaries.test.mjs:107–110, hiding the default mismatch; C3 already explicitly pins COMMITTED at :142.
  Observed input: SPIKE_OUTPUT_ROOT unset and the shipped `spike:render`/`spike:verify` commands. Renderer default is `path.join(HERE, '..', 'output', 'spike')` (tools/output/spike); verifier default is `fileURLToPath(new URL('./output/', import.meta.url))` (tools/spike/output). Thus verification can pass old committed evidence without inspecting the new output.
  Affected scope: the documented/package-script explicit comparison workflow without an environment override. The local tools/render.mjs CLI is a separate entry point.
  Falsifier: with no override, comparison render and verifier resolve the same output root; tampering the new selected artifact makes verification fail. C3 must continue to verify the historical root explicitly, without modifying its contents.
  Concrete fix: align the default producer/reader root through the existing shared owner; preserve explicit historical verification and override behavior. Cover the no-override path in existing coverage or a recorded clone probe.
  Evidence command: `nl -ba tools/spike/render.mjs` and `nl -ba tools/spike/verify.mjs`, source-read exit **0**. A `node --input-type=module` read-only source query, exit **0**, printed exactly:
  ```text
  render default const OUTPUT_ROOT = process.env.SPIKE_OUTPUT_ROOT || path.join(HERE, '..', 'output', 'spike');
  verify default const OUTPUT_ROOT = process.env.SPIKE_OUTPUT_ROOT || fileURLToPath(new URL('./output/', import.meta.url));
  ```
  These are observed configuration values, not a claimed execution of either fixture command.

#### Disposition of the halted lane's final seven findings

1. **[Pass, bounded / Blocker still open above] Publication:** tools/render.mjs:218–228 now has one atomic manifest rename and no compatibility copies; verify.mjs:23 and C2's runDir use selectedRun. A scratch component probe using the actual publisher performed two successful same-day publications and a late failure, exit **0**: `same-day preserved true true FIRST SECOND`, `remaining runs 2`. This measured unchanged manifest bytes/current selection, intact first/second content and failed-run cleanup. The cross-date reader failure prevents closing the overall preservation requirement.
2. **[Pass — component/source evidence] Asset admission:** assets.mjs:10–38 checks signature, chunk bounds/order/CRC, positive bounded RGBA dimensions, bounded inflation and scanline filters; :49–53 uses component containment and bounded descriptor reads. request.mjs:10–25 bounds reads before returning bytes. Component command `node --input-type=module` importing inspectPng, exit **0**, observed `short PNG Invalid PNG signature/structure`, `CRC Invalid PNG checksum`, and valid bundled balance_scale.png `{ width: 640, height: 427 }`. Sibling-escape regression coverage is present at canaries.test.mjs:86–90; it was read, not run. Trusted bundled SVG remains explicitly limited at assets.mjs:58–66; no claim of arbitrary SVG safety.
3. **[Pass — component evidence] Scale/area honesty:** request.mjs:35–38 rejects large logical area and every scale except 1, and restricts the delivered canvas to 1000x1000. Actual normalizeRequest calls, exit **0**, rejected 8192x8192/scale 0.1 with `render area exceeds budget` and ordinary-canvas scale 0.1 with `only scale 1 is supported`; valid fixture returned `1000 1`. This meets the allowed honest subset, without claiming scaling support.
4. **[Pass — component/source evidence] JSON/fixture/HTML boundary:** request.mjs:44–53 admits a canonical bounded regular file; nutrition.mjs:11–32 rejects unknown structure, unbounded text, invalid identities and non-hex colors; render.mjs:138 makes normalized dimensions authoritative. Actual normalization/validation probes, exit **0**, rejected a directory, fixture.surprise and the malicious background `red"><script>1</script>` with their field errors. Actual toDocument of that malicious style returned `literal script false` (render.mjs:63–73 escapes the style attribute). Browser execution was not attempted.
5. **[Pass — source evidence] Browser ownership:** render.mjs:142–149 places browser close in an owning finally, including context creation/routing errors; :147–148 closes the render context and :128–129 closes the page. Context-route failure before the inner finally is covered by browser close. C1's native-launch substitution at :95–100 observes a context-creation failure, not a real browser lifecycle run. Dynamic import occurs only in launchPlaywright (:83–85); default processRequest chooses Satori at :150–151. Fresh runtime cleanup/laziness is left to the clone gate.
6. **[Pass — source/receipt evidence, reader findings excepted] Shared result/CLI/C1:** render.mjs:153–173 assembles text-region/font/raster validation, requested format bytes/MIME/dimensions, hashes, versions and input provenance; :246–260 publishes the shared operation. C1:31–105 now checks actual imports, dependency-linked space-path CLI, requested formats, field failures and late failure after two successes. The local fixed nutrition subset is explicit. verification.log:4–6,34–40 reports four passes, 216 boxes and 12 identical artifacts in 10.8s; this is an inspected receipt, not independent renderer execution. The default comparison-root mismatch is newly open above.
7. **[Pass — receipt honesty] Completion prose:** tools/MVP-REPORT.md:5,15–24 identifies the halted lane, current runtime, baseline/red/recovery receipts and pending independent/native/future work. The embedded artifact matches the on-disk report. pdda.log:42–53 records zero errors and two governance warnings (missing skill reference and unused PDDA_SYNC_TMP), not a clean warning-free run. No new approval or successful harness run is inferred. Keep the report pending until the findings and clone gate are resolved.

Probe setup: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"`, exit **0**. All synthetic stages, runs, probe script and logs stayed under .relay-scratch/tmp. The combined admission/serializer/same-day component command used actual imported functions with the concrete inputs listed above; it did not execute a fixture or a test runner. All quoted component commands exited 0 because expected rejections were caught and printed.

Bet/reversibility: **Easy** relay-only review update. A shared committed-run discovery rule and aligned default root should close the observed failures without changing renderer geometry or historical evidence; the failure mode to falsify is mistaking an empty failed-date folder for a legacy golden. Producer should repair the two findings, retain the existing four-canary budget, and obtain the clone-run evidence. No approval or halted-lane reset is authorized by this review.

handing off to codex-producer (Producer) — go to the Producer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
