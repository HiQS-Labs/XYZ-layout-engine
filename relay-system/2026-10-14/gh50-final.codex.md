# RELAY · GH50 WebP artwork final QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
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
6. **Commit only the relay file** (`relay(gh50-webp-artwork-final-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-50-WEBP-ARTWORK.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-50-WEBP-ARTWORK.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Definition of Done: the committed implementation at this branch's HEAD satisfies issue #50 and the
  Approved plan (`relay-system/2026-10-14/gh50-plan.codex.md`, round 3), and the questions below have
  no open Blocker.

**This is the final QA of the committed diff, not the plan.** Base is `ed56529`; implementation is
`bdf4e6f` (engine + assets + catalog) and `2faf201` (renders, evidence, docs, existing-test edit).
Review the code by reading the files at HEAD, and `git diff ed56529..HEAD -- tools/` for the change.

**Requirements.** Optional, MVP-level transparent WebP artwork beside PNG; the latest diagram
(`examples/2026-10-12-belief-reference/`, recipe `recursive-process`) uses WebP. Operator decision:
WebP + Chromium PNG; Satori PNG refuses clearly (resvg-js 2.6.2 silently drops WebP). No new npm
dependency, no new test file or `test()` block (`test-budget.json`).

**Operational envelope.** Local single-operator CLI renderer, trusted catalog-pinned recipes, committed
artwork. Grade against the requirements and commensurate complexity; challenge overbuilding.

**Read:** `tools/request.mjs` (inspectWebp, readPinnedPngs), `tools/render.mjs` (lines ~111, ~245,
~352-357, ~443, ~477, ~495), `tools/profile.mjs:14`, `tools/catalog.mjs` (recursive-process declared
files), `tools/recipes/recursive-process.mjs` (header, version, reader call),
`tools/spike/test/canaries.test.mjs` (GH-36 block ~263-290), `tools/catalog.sql` / `tools/design-log.jsonl`
(new 6.0.0 rows), `examples/2026-10-12-belief-reference/` (provenance.json, README.md v6 section,
verification-v6.json, SHA256SUMS, renders-v6/), root `README.md`, `CHANGELOG.md` top entry, and the
evidence `relay-system/2026-10-14/gh50-verification/controls.md`. The plan with its acceptance map and
implementation results is seeded as the artifact.

**Questions.**
1. Does each requirement R1–R6 in the plan's acceptance map hold in the actual code and evidence? Cite
   any claim in the results table or CHANGELOG that the code or evidence does not support.
2. Is `inspectWebp` correct for its stated contract (bounded reads before field access, RIFF length,
   VP8X alpha flag, VP8L signature/alpha bit/14-bit dims, budget accounting matching `inspectPng`)?
3. Is the Satori refusal correct and non-misfiring (SVG/HTML-only Satori, Playwright's raster:false
   coverage pass, the fitting loop's `attempt === 0` placement)?
4. Did a parallel loader, writer or publisher slip in, or did any file pinned by nutrition or
   solar-system change? Are PNG-default callers byte-identical in behaviour?
5. Do the catalog changes (6.0.0 publish, declared `.webp` files, new design) follow the CLI-only rule
   and leave history rows untouched?
6. Is the C1 edit within `test-budget.json` (no new test file/block/registry), and do the edited
   assertions still exercise the original non-fit and unsupported-font controls?
7. Is the 55/20/50/60 rating still consistent with the delivered evidence?
8. Anything over-engineered, under-verified, or out of scope (e.g. the `SHA256SUMS` stale-line removal)?

Output graded findings with file:line citations per the protocol.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: FAIL
Basis: Block on B1: the new Satori refusal rejects admitted PNG-only copy. R1–R3/R5–R6 otherwise have coherent source and retained evidence; R4 needs its predicate narrowed before approval.
swept file: yes

Read the whole seeded artifact, the approved round-3 plan, and the whole runtime files named in Setup, including existing paths outside the WebP edits; read the C1/C4 controls and retained evidence. No additional pre-existing runtime defect identified within the trusted local CLI envelope. Graph tools were unavailable; direct source reads used. No git, renderer execution, suite, executable fixture, or PDDA gate was run; only the relay file is edited.

- **[Blocker] B1 — label text misfires the WebP refusal (`tools/render.mjs:250`).** The predicate searches every serialized scene property, including ordinary text. Nutrition accepts bounded subtitle copy (`tools/request.mjs:139`, `tools/recipes/nutrition.mjs:82–87`) and places it directly in a text node (`nutrition.mjs:208`), while its artwork reader still defaults to PNG (`nutrition.mjs:136`). Thus a PNG-only scene can get the backend error. This violates the non-misfiring R4 condition and preservation of PNG callers; the normal-fixture parity claim at `.relay-artifacts/GH-50-WEBP-ARTWORK.md:205` does not cover this input. Fix: inspect actual `img` source fields through scene children, retaining the Satori/raster condition. Extend an existing canary, such as the data-URL-as-copy control at `tools/spike/test/canaries.test.mjs:450–452`, to include PNG and WebP-looking label text; no new test block/file is needed. Reversibility: Easy.
  Observed input: nutrition `tools/spike/fixture.json`, `format:'png'`, `sections.header.subtitle='data:image/webp'`; the narrow probe below passes request normalization and fixture shape validation, reads a real pinned PNG, then executes the exact current refusal statement on the corresponding text/image scene. It throws despite `imageSourcePng=true`. This is an observed guard failure; full CLI execution remains **[Unverified — needs clone run]**.
  Affected scope: Satori PNG requests whose scene contains `data:image/webp` in copy or metadata but has no WebP image source. Keep rejecting actual WebP image sources.
  Falsifier: in the disposable clone, the same nutrition PNG request must succeed; `recursive-process@6.0.0` Satori PNG must still reject, Satori SVG/HTML must succeed, and Playwright PNG must succeed. If this admitted copy never reaches the guard in the actual recipe, B1 is disproven.
  Probe command (Node v22.22.3; exit **0**; output captured in `$TMPDIR/b1-minimal.log`):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module > "$TMPDIR/b1-minimal.log" <<'JS'
  import { readFileSync } from 'node:fs';
  import { normalizeRequest, validateFixtureShape, readPinnedPngs, invalid } from './tools/request.mjs';
  const { fixture } = await normalizeRequest({inputPath:'tools/spike/fixture.json',format:'png',edits:[{path:'sections.header.subtitle',value:'data:image/webp'}]});
  validateFixtureShape(fixture, JSON.parse(readFileSync('tools/spike/fixture.json')));
  const art = await readPinnedPngs(new URL('./examples/2026-10-13-nutrition-infographic/',import.meta.url),'provenance.json',['leaf_glow']);
  const scene = {type:'div',props:{children:[{type:'h2',props:{children:fixture.sections.header.subtitle}},{type:'img',props:{src:art.leaf_glow}}]}};
  const line = readFileSync('tools/render.mjs','utf8').split('\n').find(s=>s.includes('if (raster && attempt === 0 && JSON.stringify(scene)'));
  const guard = new Function('raster','attempt','scene','invalid',line);
  console.log('schema=accepted imageSourcePng='+art.leaf_glow.startsWith('data:image/png;'));
  for(const text of ['data:image/webp','data:image/png']) {
    scene.props.children[0].props.children=text;
    try { guard(true,0,scene,invalid); console.log(text+': allowed'); }
    catch(e) { console.log(text+': '+e.message); }
  }
  JS
  ```
  Decisive output: `schema=accepted imageSourcePng=true`; `data:image/webp: Validation failed: [{"field":"backend","message":"WebP artwork is not rasterized by Satori/resvg; use --backend playwright for PNG"}]`; the `data:image/png` label control reports `allowed`.

- **[Pass] R1/R2 preserve the existing reader and implement the stated header-only contract.** `tools/request.mjs:32–47,52–69` bounds reads before field access, checks RIFF length, decodes VP8X alpha/canvas fields and VP8L signature/alpha/14-bit dimensions, and shares the same limits and aggregate accounting as `tools/spike/assets.mjs:22–26`. PNG pin selection and returned MIME remain the defaults; no second loader is introduced. Narrow `node --input-type=module` header probes (exit **0**, `$TMPDIR/header-probe.log`) reported all six assets `256×256`, `aggregate={"bytes":128652,"pixels":393216}`, `truncatedRejected=30 RangeErrors=0`, opaque VP8/VP8X/VP8L rejected, dimension/area/aggregate limits rejected, and `wrongRIFF: Invalid WebP container`. These checks do not claim to validate the compressed body.

- **[Pass] R3 and the backend placement use the existing owners.** WebP is admitted at `tools/render.mjs:111,354–357,445,479,497` and categorized at `tools/profile.mjs:14`; anchors, digest checks and containment remain. The one publisher remains `publishArtifacts → publishStaged` (`render.mjs:491–503,434–469`). Satori SVG/HTML requests have `raster=false` (`render.mjs:211`); Playwright's first-attempt Satori coverage call also has `raster:false` (`render.mjs:241–247`) and bypasses the refusal branch. Checking artwork on attempt zero is adequate for the current recipes, whose selected artwork does not depend on fitting sizes (`tools/recipes/recursive-process.mjs:70–74`); B1 concerns what is inspected, not that placement.

- **[Pass] R5/R6 retained evidence supports the delivered diagram.** Recipe 6.0.0 selects WebP (`tools/recipes/recursive-process.mjs:6,72`), declares six WebP files (`tools/catalog.mjs:140–146`), and has the new version/design rows (`tools/catalog.sql:34,284`; `tools/design-log.jsonl:10`). Read-only commands `node tools/catalog.mjs verify --json` and `node tools/catalog.mjs export --check` both exited **0**, with `{"valid":true,"errors":[]}` and `{"canonical":true}`. `(cd examples/2026-10-12-belief-reference && shasum -a 256 -c SHA256SUMS)` exited **0**: **75/75 OK**. Per-asset probes used `dwebp <asset.webp> -pam -o <scratch.pam>` and `cwebp -quiet -lossless -exact <display.png> -o <scratch.webp>` (all exit **0**, outputs only under `$TMPDIR`); Python PAM/hash queries (exit **0**) found all six `alphaMinMax=(0,255)`, corners `[0,0,0,0]`, and `conversionByteEqual=True`, totaling PNG **221372** / WebP **128652** bytes, matching `provenance.json:23–36` and the other five entries. Retained-export queries (`python3 -B -`, exit **0**) found both manifests list **14** files, both inline documents and the Satori SVG contain **10** WebP images covering exactly the six provenance pins, and retained output digests agree with `verification-v6.json:18–36`. Lossless decode/comparison of the two retained Chromium PNGs reported **13142 / 2144000** changed pixels, maximum channel delta **1**, supporting `CHANGELOG.md:7`. Viewed `renders-v6/playwright/render.png` at original resolution and `thumbnail.png` at 420px: artwork is present with no new exterior halo, hierarchy remains reference-directed (AS-1/4), and fine captions still need full-size viewing (AS-10). No unsupported Satori PNG visual claim is made.

- **[Pass] The C1 edit stays within the existing budget and preserves its negative-control targets.** `tools/spike/test/canaries.test.mjs:272–289` separates Satori SVG/HTML from Playwright PNG, asserts actual WebP Satori-PNG refusal, and selects SVG for non-fit/CJK controls. The original assertions remain. Offline image-load checks still require nonzero decoded width (`canaries.test.mjs:39–46`). There are four existing `test()` declarations at lines **54,406,431,439**, matching `test-budget.json`; `package.json` still lists only the existing three renderer dependencies. The recorded 4/4 in 41s is producer evidence (`relay-system/2026-10-14/gh50-verification/controls.md:54`), not an independently rerun suite.

- **[Nit] N1 — current design summary still stops at 5.0.0.** `README.md:119` says Belief Updating designs are pinned through `5.0.0`, although the new design is pinned to `6.0.0` (`tools/catalog.sql:284`). Update that range to include 6.0.0. The current rendering commands and capability explanation are already correct (`README.md:61–68,160–164`).

- **[Pass] The MVP scope and 55/20/50/60 prioritization remain proportionate.** The rating rationale at `.relay-artifacts/GH-50-WEBP-ARTWORK.md:187–192` is a prioritization judgment, not a measured performance score. The small reader/allowlist/guard extension avoids a decoder dependency and parallel publishing machinery. Removing the `.DS_Store` checksum line is reasonable evidence hygiene: the remaining manifest passes 75/75 and retains v3–v5 output hashes (`examples/2026-10-12-belief-reference/SHA256SUMS:44–62`; `CHANGELOG.md:7`). No additional runtime mechanism is warranted by B1.

**[Unverified — needs clone run]** Fresh rendering/offline browser loads, C1 runtime and red mutations, PDDA gates, and B1's full CLI falsifiers. The two corrections at `gh50-verification/controls.md:44–50` explicitly qualify misleading raw control lines; do not treat the uncorrected `ok (no error)` lines as passes. **Not independently compared with base:** historical rows, unrelated pinned-file/dependency bytes, and baseline PNG/SVG digests; git was prohibited. Current declared files and catalog integrity pass, and the producer records baseline parity at `controls.md:8–13`.

Root cause: the R4 predicate treats serialized label copy as an image source; Fix site: `tools/render.mjs:250`; Why not upstream/downstream: the copy is valid and already has an existing data-URL-text preservation control, so restricting fixture text or changing the asset reader would mask the wrong renderer predicate.

Handing off to Producer (claude-a) — address B1, disposition N1, run the existing checks and falsifiers in the disposable full clone, then open round 2. STATUS remains Open; release the coordination token to claude-a.

### Producer · Round 1 response

- B1 — Disposition: **Accepted.** Reproduced: the predicate serialized the whole scene. Fix in `3a90608` (`tools/render.mjs`, Satori branch): a small recursive walk returns true only for `img` nodes whose `props.src` starts with `data:image/webp;`; the Satori/raster/attempt-0 condition is unchanged. The existing C4 data-URL-as-copy control (`canaries.test.mjs:450-454`) now also renders that subtitle set to `data:image/webp;base64,Zg==` as Satori PNG. No new test block or file.
  Evidence (`relay-system/2026-10-14/gh50-verification/controls.md`, "Final QA round 1"): your falsifiers pass via the CLI (nutrition PNG with WebP-looking subtitle valid; recursive-process Satori PNG refused; Satori SVG valid). `pnpm test` 4/4 in 44.1 s. Red control in the verify clone at `3a90608` with the old predicate restored: `not ok 4` failing on exactly the backend refusal.
- N1 — Disposition: **Accepted.** `README.md` design summary now reads `recursive-process@1.0.0`..`6.0.0`.
- CHANGELOG and the plan's R4 result row updated to say the refusal applies to WebP image sources, not label text.

Requesting round 2 review of HEAD.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
