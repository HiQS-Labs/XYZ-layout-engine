# RELAY · GH50 WebP artwork plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
-->

NEXT: Producer
STATUS: Approved
ROUND: 3 / 3

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
6. **Commit only the relay file** (`relay(gh50-webp-artwork-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
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
- Definition of Done: the plan is approved for implementation when it satisfies issue #50
  (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50) and the questions below have no open Blocker.

**Requirements (from the operator and issue #50).** Add optional, MVP-level transparent WebP artwork
beside the PNG path, and make the latest diagram (`examples/2026-10-12-belief-reference/`, recipe
`recursive-process`) use WebP files. Operator decision: WebP + Chromium PNG. SVG/HTML exports and the
Playwright PNG support WebP; the default Satori PNG refuses with a clear error (resvg-js 2.6.2 silently
drops WebP). No new npm dependency; no new test file (test-budget.json ratchet).

**Operational envelope.** Local single-operator CLI renderer with trusted, catalog-pinned recipes and
committed artwork. Grade against these requirements and commensurate complexity, not multi-tenant or
untrusted-upload threat models. Challenge speculative machinery.

**Read these sources** (the plan cites line numbers on base `ed56529`):
- `tools/request.mjs` (readPinnedPngs, readBounded, LIMITS)
- `tools/spike/assets.mjs` (inspectPng)
- `tools/render.mjs` (processRequest Satori/Playwright branch ~236-250; HTML extractor ~340-352)
- `tools/catalog.mjs` (declaredFiles ~120-148, snapshot, publish)
- `tools/recipes/recursive-process.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`
- `tools/spike/test/canaries.test.mjs` (assertOfflineExport ~28-52; GH-36 block ~263-284) and `test-budget.json`
- `examples/2026-10-12-belief-reference/` (provenance.json, README.md, verification-v5.json, SHA256SUMS)

**Questions.**
1. Are the plan's claims grounded in the actual code paths (line refs, which files the catalog pins for
   which recipe, the HTML extractor's refusal)? Cite any claim that is wrong.
2. Is any requirement from issue #50 missing or mis-scoped?
3. Does the plan extend the existing reader/inspector/extractor owners rather than adding a parallel
   loader or writer? Is keeping the `readPinnedPngs` name (to avoid editing pinned nutrition/solar
   modules) the right trade?
4. Is the `inspectWebp` header contract (RIFF size, VP8X alpha flag or VP8L alpha bit, plain VP8 refused,
   shared budgets) sufficient and correct for `cwebp -lossless -exact` output, without overbuilding?
5. Is the Satori PNG refusal placed at the right owner and condition? Can it misfire (e.g. on SVG-only
   or HTML-only Satori runs, or on the Playwright coverage pass that calls renderSatori with raster:false)?
6. Is 6.0.0 (major) the correct semver under the repo's catalog rules, and are blast radius, rollback,
   the PR #43 overlap and the acceptance map/red controls sufficient and falsifiable?
7. Is editing the existing C1 GH-36 block (no new test() or file) consistent with test-budget.json rules?
8. Is the 55/20/50/60 rating grounded (appeal neutral, effort = cheapness)?

Output graded findings with file:line citations per the protocol.

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
Basis: Block implementation until the HTML serializer accepts WebP. The plan otherwise follows issue #50's operator-selected backend split, but its canary adaptation and rollback instructions also need correction.
swept file: yes

Reviewed the entire seeded plan, including pre-existing sections, against the named sources and the live issue. Graph tools were unavailable; used direct source reads and narrow probes. No test suite, executable fixture, validate.sh or Git command was run. Review-file edit reversibility: **Easy**.

- **[Blocker] B1 — R3 omits the HTML serializer's independent allowlist.** `.relay-artifacts/GH-50-WEBP-ARTWORK.md:85` changes only extraction. `tools/render.mjs:111` rejects both `data:image/webp` and `assets/<digest>.webp`; `renderPlaywright` calls `toDocument` at line 143, and both HTML export paths also reach it (lines 348–359). Therefore the planned Playwright PNG and both backends' HTML exports still throw after implementing R3 as written. Extend both branches of the existing `toHtml` source allowlist to WebP, retaining its anchored trusted-source restriction; include that owner in R3 and its acceptance map.
  Observed input: a real conversion of `examples/2026-10-12-belief-reference/assets/web/examination.png` using `cwebp -quiet -lossless -exact ... -o "$TMPDIR/examination.webp"` produced a 13,718-byte VP8L file, 256×256, alpha bit 1, matching RIFF length. Passing its base64 data URL to `toHtml({type:"img",props:{src}})` threw `Validation failed: [{"field":"src","message":"only embedded trusted images are supported"}]`. Conversion plus Node probe exited 0 (the exception was caught and printed). Independent exact probe command: `node --input-type=module <<'JS'` with the following body, then `JS` (exit 0):
  ```js
  import { toHtml } from "./tools/render.mjs";
  for (const src of ["data:image/png;base64,AAAA", "data:image/webp;base64,AAAA", "assets/" + "a".repeat(64) + ".webp"]) {
    try { console.log(src + " => " + toHtml({type:"img",props:{src}})); }
    catch (error) { console.log(src + " => " + error.message); }
  }
  ```
  Decisive output: PNG serialized to `<img src="data:image/png;base64,AAAA" style="">`; both WebP inputs printed the validation error above. This measures the allowlist, independently of decoding.
  Affected scope: trusted embedded WebP images and hashed local WebP assets passing through `toHtml`/`toDocument`.
  Falsifier: after the targeted allowlist edit, both WebP forms serialize; PNG/SVG still serialize and an external HTTP image remains rejected. The existing offline C1 then loads the converted artwork in compact and inline exports.

- **[Should] S1 — preserve existing non-fit and unsupported-font controls when adding R4.** Step 5 names only `canaries.test.mjs:263–276`, but `rpReject` at `tools/spike/test/canaries.test.mjs:277–287` still requests default Satori PNG. R4 will intercept the valid-shape long-caption and CJK cases before fitting/glyph checks, producing the backend refusal instead of their expected errors. Change this helper to request Satori SVG (or another supported path), retaining the original assertions; keep the WebP PNG rejection as its own assertion in the existing C1.
  Observed input: line 282 sets `states[0].caption = 'W'.repeat(2000)` and expects `/non-fit/`; line 287 sets `events[0].caption = 'Belief 漢'` and expects `/unsupported text\/font/`; line 280 sends both with `format: 'png'`. R4 explicitly refuses before rendering (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:88–92`).
  Affected scope: the existing recursive-process render-level negative controls; schema-domain controls should remain intact.
  Falsifier: in a disposable clone, both edited controls reach their original errors while the separate valid-fixture Satori PNG request receives the Playwright guidance. **[Unverified — needs clone run]**: interception is a source-derived consequence of the proposed change, not a measured suite failure.

- **[Should] S2 — distinguish source rollback from catalog-history deletion.** The instruction “revert the PR” at `.relay-artifacts/GH-50-WEBP-ARTWORK.md:61–64` also reverses the new `catalog.sql`/design-log rows, contradicting the adjacent promise that v6 and its design remain. Describe a selective source rollback retaining the published rows, design log and referenced v6 artifact; restore the v5 module, reader, provenance and declaration set consistently, then verify the current v5 pins and retained designs. No new rollback mechanism is needed. `tools/catalog.mjs:237–249` prohibits historical row removal on import, and `tools/catalog.mjs:219–222` still checks every retained design artifact.

- **[Pass] Ownership, version and test size:** keeping `readPinnedPngs` and placing the opt-in inspector in request.mjs avoids unrelated pinned-module edits: `tools/catalog.mjs:125–146` pins assets.mjs for all three recipes and request.mjs only for recursive-process; existing callers are `nutrition.mjs:136`, `solar-system.mjs:87`, `recursive-process.mjs:71`. Major 6.0.0 fits `README.md:103–106` because previously admitted output bytes change as well as PNG capability. Extending the existing C1 fits `test-budget.json`'s “Only plain node:test test()” rule and its 4-test/1-file budget; actual ≤60s remains a clone gate.

- **[Pass] MVP envelope and refusal condition:** R4's “Satori branch” plus `raster` condition (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:88–92`) correctly excludes SVG/HTML-only calls and the Playwright `raster:false` coverage pass (`tools/render.mjs:211,241–249`). The RIFF/VP8L header proposal matches the measured converter output above and the [WebP container](https://developers.google.com/speed/webp/docs/riff_container) and [lossless header specification](https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification); it is reasonable for trusted committed derivatives. Header flags are not a pixel-decoding guarantee. At implementation, bound header reads/chunk payloads before accessing dimension fields; retain the planned real-alpha inspection rather than adding a decoder dependency.

- **[Nit] Evidence precision:** lines 154–155 overstate runtime malformed-body detection: `renderPlaywright` checks geometry/fonts and screenshots at `tools/render.mjs:143–174`; `naturalWidth` is checked by the C1 helper (`canaries.test.mjs:39–46`), not ordinary rendering. State that committed-asset validation/C1 supplies this evidence. Several extractor references are stale: the actual regex/map are `tools/render.mjs:352–355`. PR #43's live file list also overlaps canaries, README and CHANGELOG, so include these in the rebase note. The 55/20/50/60 rationale at plan lines 159–161 is reasonable judgment with appeal neutral and effort interpreted as cheapness; it is not an objective measurement.

Root cause: WebP is refused by two existing HTML boundaries, while the plan changes only extraction; Fix site: extend the existing serializer allowlist and extractor together; Why not upstream/downstream: recipe-specific workarounds would duplicate the transport rule, and Chromium never receives the currently rejected source.

Handing off to Producer (claude-a) — address B1, S1 and S2, disposition the remaining notes, then request the next review. Implementation and runtime gates remain unverified until the authorized disposable-clone run.

### Producer · Round 1 response

Revised plan committed at `PROJECT/2-WORKING/GH-50-WEBP-ARTWORK.md` (re-seeded as the artifact).

- B1 — Disposition: **Accepted.** Confirmed at `tools/render.mjs:111`: the `toHtml` `src` regex allows only `png|svg+xml` data URLs and `assets/<sha256>.(png|svg)`. R3 now names both owners: (a) the `toHtml` allowlist gains `webp` in both branches of the same anchored regex; (b) the extractor regex/map at `render.mjs:352-355` gains `image/webp → webp`. Acceptance map R3 now includes "Playwright PNG renders"; red control (b) is split per owner.
- S1 — Disposition: **Accepted.** Confirmed `rpReject` sends `format: 'png'` (`canaries.test.mjs:280`). Step 5 switches it to `format: 'svg'`, keeps every assertion, and adds the WebP Satori-PNG refusal as a separate assertion on the valid fixture. Will be measured in the clone run.
- S2 — Disposition: **Accepted.** Rollback rewritten as a selective source rollback with a forward version publish; retains `catalog.sql` 6.0.0 rows, `design-log.jsonl`, the v6 design artifact and the `.webp` files it hashes; then `catalog verify`.
- Nit — Disposition: **Accepted.** Malformed-body evidence attributed to committed-asset inspection (step 3) and C1's helper, not ordinary rendering; extractor line refs corrected to 352-355; PR #43 rebase note now lists canaries, README and CHANGELOG. Header-read bounding stated explicitly for `inspectWebp`.

Requesting round 2 review.

### Reviewer · Round 2

VERDICT: FAIL
Basis: Block implementation until the plan extends the existing publication allowlists as well as HTML serialization/extraction. Prior B1, S1 and S2 are addressed in the revised design; one additional end-to-end boundary remains missing.
swept file: yes

Reviewed all 185 lines of the seeded plan, including unchanged sections, and traced the named reader, recipe, HTML, catalog, publication and canary paths. The additional findings below are the remaining defects found in this sweep. Graph tools are unavailable in this session, so project/generation and index coverage could not be established; used direct source reads and targeted literal searches. Live issue #50 and PR #43 could not be refreshed: web fetch returned cache misses, and both `gh ... view ... --json ...` queries failed with `error connecting to api.github.com`. Requirement review uses this relay's supplied operator/issue contract; the current PR state is unverified. No Git command, test suite, executable fixture or validate.sh was run. Probe logs are scratch-only and decisive output is preserved below. Review-file edit reversibility: **Easy**.

- **[Blocker] B2 — R3 stops before the three publication allowlists.** `.relay-artifacts/GH-50-WEBP-ARTWORK.md:90–94` admits and extracts WebP, but `runCLI` then calls `publishArtifacts` (`tools/render.mjs:528`), whose path check at line 495 refuses `assets/<sha256>.webp` with `invalid artifact identity/digest`. Adding WebP there alone still fails `publishStaged` at line 443 (`unexpected staged asset`), and publication verification independently refuses it at line 477 (`invalid artifact path`). Thus the planned compact exports in R6 and C1 cannot be delivered. Extend those three existing asset-extension alternatives to `png|svg|webp|ttf`, preserving the anchored paths, file checks, hashes, containment and budgets. Name these existing owners in R3/step 2; make the acceptance map require successful CLI publication and `verifyPublication` for both complete exports. Add a manual red control in the existing evidence location showing removal of each allowance fails at its own boundary; no new test block or publisher is needed.
  Observed input: `assets/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.webp` (the basename alone for staging) is a valid digest-shaped WebP name emitted by the planned extractor. A read-only probe evaluated the exact existing regexes extracted from `tools/render.mjs:443,477,495`; all rejected that input while accepting the otherwise identical PNG name. Command (exit **0**, output saved under `$TMPDIR/publication-allowlists.log`):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module > "$TMPDIR/publication-allowlists.log" <<'JS'
  import { readFileSync } from "node:fs";
  const source = readFileSync("tools/render.mjs", "utf8").split("\n");
  const digest = "a".repeat(64);
  for (const line of [443, 477, 495]) {
    const pattern = source[line-1].match(/!\/(.*)\/\.test/)[1];
    const re = new RegExp(pattern);
    const png = line === 443 ? `${digest}.png` : `assets/${digest}.png`;
    const webp = line === 443 ? `${digest}.webp` : `assets/${digest}.webp`;
    console.log(`tools/render.mjs:${line} PNG=${re.test(png)} WebP=${re.test(webp)} input=${webp}`);
  }
  JS
  ```
  Decisive output: `tools/render.mjs:443 PNG=true WebP=false`, `tools/render.mjs:477 PNG=true WebP=false`, `tools/render.mjs:495 PNG=true WebP=false` (each line also printed the input above). This measures admission, independently of image decoding; complete export execution remains **[Unverified — needs clone run]**.
  Affected scope: digest-named WebP assets in compact offline HTML exports, through artifact publication, staging and manifest verification; inline-only exports do not carry separate WebP asset names.
  Falsifier: in the disposable clone, both backends' planned compact/inline exports publish and pass `verifyPublication`, existing PNG/SVG/font exports still pass, and wrong-digest or escaping paths remain rejected. If the unchanged three regexes already admit the exact WebP paths, this finding is unnecessary; the measured result is the opposite.

- **[Should] S3 — R6 must update the current example command, not only add a limits sentence.** `.relay-artifacts/GH-50-WEBP-ARTWORK.md:113–114` specifies only a new root README capabilities line. `README.md:61–64` still presents the current diagram as v5/PNG and recommends `--format png,svg,html,html-inline` without a backend. Under R4 this whole command refuses. Replace the current example with explicit Playwright `png,html,html-inline` and Satori `svg,html,html-inline` commands and update its current artwork/version references (including the current identity at `README.md:77`). Keep historical replay instructions tied to their historical source commits.
  Observed input: `node tools/render.mjs examples/2026-10-12-belief-reference/fixture.json --recipe recursive-process --format png,svg,html,html-inline --out .relay-scratch/belief-reference` (`README.md:64`). A narrow normalization probe (exit **0**, `$TMPDIR/readme-request.log`) used `node --input-type=module` with `import { normalizeRequest } from "./tools/request.mjs"; const { normalized } = await normalizeRequest({ inputPath: "examples/2026-10-12-belief-reference/fixture.json", recipe: "recursive-process", format: "png,svg,html,html-inline" }); console.log(JSON.stringify({backend: normalized.backend, formats: normalized.formats, raster: normalized.formats.includes("png")}));`. Decisive output: `{"backend":"satori","formats":["png","svg","html","html-inline"],"raster":true}`. Its eventual R4 rejection is source-derived, **[Unverified — needs clone run]**.
  Affected scope: the README's current recursive-process v6 rendering example; historical v3–v5 commands remain valid on their documented source commits.
  Falsifier: run both replacement commands in the disposable clone and require successful exports. A single command that includes SVG and PNG cannot cover this split: Satori refuses WebP PNG by R4, and Playwright rejects SVG at `tools/request.mjs:94`.

- **[Pass] Prior findings are addressed at plan level.** R3 now explicitly extends `toHtml` and the extractor together (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:90–94`); step 5 preserves `rpReject`'s non-fit/glyph assertions by selecting SVG and separates the valid-fixture PNG refusal (lines 138–148). Rollback now keeps history and publishes restored PNG source under a fresh version (lines 61–69), matching `tools/catalog.mjs:237–249` and its retained-design verification at lines 219–222. These are design dispositions, not executed implementation passes.

- **[Pass] The bounded MVP design remains appropriate.** R1/R2 retain the existing reader and budget/containment path, with no unrelated pinned-module rename (plan lines 73–88; `tools/request.mjs:31–46`, `tools/catalog.mjs:125–146`). The specified bounded RIFF/VP8X/VP8L header reads and separate decoded-alpha evidence fit the trusted committed-asset envelope; the header fields match the [container specification](https://developers.google.com/speed/webp/docs/riff_container) and [lossless specification](https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification). The existing alpha inspector already recognizes both WebP header forms and decodes through Chromium (`examples/2026-10-09-cell-division/inspect-alpha.mjs`, `header`/`pixelStats`). R4's backend/raster condition (plan lines 96–100) avoids SVG/HTML-only refusal and the Playwright `raster:false` coverage call (`tools/render.mjs:211,241–249`). Major 6.0.0 follows the changed-artifact rule (`README.md:103–106`); the unchanged four-test/one-file budget and neutral-appeal/cheapness rationale remain coherent (plan lines 144,175–177; `test-budget.json`). Decode, digest parity, visual inspection, actual runtime ≤60s and all clone gates remain **[Unverified — needs clone run]**.

Root cause: the plan extends HTML image admission but omits the existing export publication/verification asset namespace; Fix site: the three asset-path checks in tools/render.mjs and R3's acceptance map; Why not upstream/downstream: changing the reader or recipe cannot make a WebP path pass those independent publisher checks, and a parallel publisher would duplicate the existing owner.

Handing off to Producer (claude-a) — incorporate B2, disposition S3, retain the accepted prior fixes, then request round 3 review. Runtime gates remain for the authorized disposable clone.

### Producer · Round 2 response

Revised plan committed (re-seeded as the artifact).

- B2 — Disposition: **Accepted.** Confirmed `render.mjs:443,477,495` admit only `png|svg|ttf` asset names. New R3(c) extends all three alternatives to include `webp`, keeping anchors, digests, file and containment checks. Step 2 and acceptance map R3 now require both complete exports to publish through the CLI and pass `verifyPublication`; red control (b) adds per-boundary removal of each allowance with its exact error.
- Sweep to avoid another missed boundary: every PNG/SVG-only literal in `tools/render.mjs`, `tools/request.mjs` and `tools/profile.mjs` was enumerated. WebP-relevant sites: `render.mjs:111,352,355,443,477,495` (all now in R3) and `request.mjs:39,44` (R1). `profile.mjs:14` (profiling timing category only) also gains `webp`. Remaining `png` literals are the render output format, out of scope.
- S3 — Disposition: **Accepted.** R6 now replaces the root README's current recursive-process example (`README.md:61-64`) with 6.0.0, WebP artwork and two commands (Playwright `png,html,html-inline`; Satori `svg,html,html-inline`), updates the current-identity list at `README.md:77`, and keeps historical replays tied to their source commits. Both commands run in the clone verification.
- Note on PR #43 / issue refresh: verified locally on 2026-10-14 from this session (PR #43 base `main`, touches `catalog.sql`, `catalog.mjs`, `recursive-process.mjs`, `render.mjs`, `request.mjs`); the rebase note stands.

This is round 3 of 3. Requesting final plan review.

### Reviewer · Round 3

VERDICT: PASS
Basis: Approve the plan for implementation within the supplied local, trusted-artwork MVP contract. B1, B2 and S1–S3 are addressed at plan level; no open Blocker remains. Implementation correctness and runtime gates are not claimed.
swept file: yes

Read the entire 199-line seeded plan, including unchanged sections, and the relay history; traced the reader, scene, backend, HTML, publication, catalog and existing C1 paths. No additional pre-existing defect in the seeded plan was found in this sweep. Graph tools are unavailable, so project/generation and coverage could not be established; direct source reads and literal searches supplied the evidence. Live issue #50 and PR #43 refreshes returned web cache misses; requirements use the supplied relay contract, and current remote PR state remains unverified. Both startup roadmap entry paths are absent in this isolated tree (Python exit 2); no lifecycle write was attempted. No Git command, suite, executable fixture, validate.sh or artifact edit was performed. Relay-only edit reversibility: **Easy**; the bet is that source-grounded design approval can precede the explicitly required disposable-clone gates.

- **[Pass] Prior end-to-end boundary findings are closed in the design.** R3 now includes `toHtml`, extraction and all three publisher/verifier checks (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:90–101`; `tools/render.mjs:111,352–355,443,477,495`). Step 5 names independent removal controls and the acceptance map requires CLI publication plus `verifyPublication` (plan lines 157–172). The corrected README split is explicit at plan lines 120–126 and fits `tools/request.mjs:89–94`. This closes B1/B2/S3 without adding another serializer or publisher.
  Narrow admission probe (exit **0**, `$TMPDIR/r3-boundaries.log`):
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  node --input-type=module > "$TMPDIR/r3-boundaries.log" <<'JS'
  import { readFileSync } from "node:fs";
  const lines = readFileSync("tools/render.mjs", "utf8").split("\n");
  const d = "a".repeat(64);
  for (const line of [111, 443, 477, 495]) {
    const pattern = lines[line - 1].match(/!\/(.*)\/\.test/)[1];
    const current = new RegExp(pattern);
    const proposed = new RegExp(pattern.replaceAll("png|svg", "png|webp|svg"));
    const inputs = line === 111 ? [`data:image/webp;base64,AAAA`, `assets/${d}.webp`] : [line === 443 ? `${d}.webp` : `assets/${d}.webp`];
    for (const input of inputs) console.log(`line=${line} current=${current.test(input)} proposed=${proposed.test(input)} input=${input}`);
    const invalid = line === 111 ? ["https://example.test/a.webp", `assets/../${d}.webp`] : [`../${d}.webp`, `assets/${d}.exe`];
    console.log(`line=${line} invalidRejected=${invalid.every(x => !proposed.test(x))}`);
  }
  JS
  ```
  Decisive output: both line-111 WebP forms and the WebP names at lines 443/477/495 reported `current=false proposed=true`; each boundary reported `invalidRejected=true`. This evaluates the proposed regex expansion in memory only; it does not prove image decode or complete publication.

- **[Pass] Existing ownership and backend boundaries remain coherent.** R1/R2 retain `readPinnedPngs` and its shared bounded/contained read path (plan lines 73–88; `tools/request.mjs:12–46`). Keeping the inspector outside `assets.mjs` avoids changing the other recipes’ declared modules (`tools/catalog.mjs:125–146`). R4 is restricted to the Satori raster branch (plan lines 103–107; `tools/render.mjs:211,241–249`), so SVG/HTML-only operations and Playwright’s non-raster coverage pass remain allowed by design. S1 is explicitly handled by switching `rpReject` to SVG while retaining its original assertions (plan lines 150–156; `tools/spike/test/canaries.test.mjs:277–287`).

- **[Pass] Header validation is proportionate to the committed-asset envelope.** R2 plus the bounded-read qualification (plan lines 81–88,182–185) specifies RIFF length, VP8X/VP8L alpha and dimension checks; those fields agree with the [container specification](https://developers.google.com/speed/webp/docs/riff_container) and [lossless specification](https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification). It correctly separates header admission from decoded transparency. Step 3 requires `real_alpha: true`; the existing inspector derives that from decoded pixels at `examples/2026-10-09-cell-division/inspect-alpha.mjs:67–72`. No decoder dependency or wider parser is justified by this scope.

- **[Pass] Catalog history, semver and evidence scope are accounted for.** The selective rollback retains history and publishes restored source under a fresh identity (plan lines 61–69), consistent with `tools/catalog.mjs:209–222,237–249,333–342`. Major 6.0.0 is appropriate for changed artifacts and the lost Satori PNG capability (`README.md:103–106`; plan lines 109–115). Extending C1 without a new block/file fits `test-budget.json`’s four-test/one-file rule; its 60-second limit remains a measured implementation gate. R6 and step 6 require the supported Playwright PNG visual review and updated evidence (plan lines 117–126,163–175). The 55/20/50/60 rationale is defensible prioritization judgment with neutral appeal and effort interpreted as cheapness (plan lines 187–192), not an empirical score.

**[Unverified — needs clone run]** PNG digest preservation for nutrition/solar-system, six real WebP conversions and alpha inspections, actual Satori refusal, both complete CLI exports and offline loads, removal/tamper controls, retained-file hashes, visual review, catalog checks, `pnpm test` runtime and PDDA gates. These are implementation acceptance obligations already specified by the plan, not evidence obtained in this turn.

Relay closed (Approved), no further review turn needed. Producer (claude-a) owns implementation and the disposable-clone verification; completing the coordination token with `done`.


### Attestation · relay-drive — 2026-10-14T16:52:47Z
task: GH50-PLAN-20261014
reviewer: codex
status: Approved
reviewed-head: a792cacefe3b89441505d189d17b99a7c1437956
added-range: 27348+6026
added-sha256: fc8b9cf87aff47bd29e0b31c73ab3a8c76cb44771f2f2c799d35ba3f454519d8
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
