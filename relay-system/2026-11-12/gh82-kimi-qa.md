# RELAY · PR #83 independent QA (Kimi K3.1 Pro): external-module public API
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-12.
-->

NEXT: Producer
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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh82-kimi-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/plugin-api.mjs` and the rest of PR #83 (https://github.com/HiQS-Labs/XYZ-layout-engine/pull/83), the diff from base `4e08148` to this branch's HEAD: `package.json`, `README.md` ("Using the engine from another repository"), `ROUTER.md`, `CHANGELOG.md`, `PROJECT/2-WORKING/SPECS-PRD.md` §6.5, `PROJECT/2-WORKING/GH-82-PLUGIN-API.md` (plan), `TESTS-RESULTS/2026-11-12-GH-82/README.md` (evidence).
- Reviewer: kimi (K3.1 Pro)   ·   Producer: claude-a
- Started: 2026-11-12
- **Independence:** form your own assessment first. Two earlier Codex reviews exist under `relay-system/2026-11-12/gh82-*-qa.md`; read them only after you have written your findings, and do not copy their conclusions.
- **Operational envelope:** a local, single-operator rendering engine (Node 22 ESM, pnpm). One external repository links this checkout as a package (`"xyz-layout-engine": "link:../XYZ-layout-engine"`) and needs two engine functions. Grade against the PR's stated goal and commensurate complexity; do not demand npm publishing, semver policy, multi-tenant isolation or a plugin framework. The repo caps its test suite (`test-budget.json`: 4 canaries); a request for a new test file is out of scope. `releases.db`/`releases.sql` changes are writes by the repo's ledger CLI, not hand edits.
- **Depth:** this is a deep review. Read `tools/render.mjs`, `tools/review.mjs` and `tools/request.mjs` in full, not just the diff, and reason about Node's package `exports` resolution rules precisely.

Questions:
1. Correctness of resolution: with the `exports` map in `package.json`, does `import { launchPlaywright, publishForReview } from 'xyz-layout-engine'` resolve and work from a pnpm `link:` consumer? Consider symlink realpath behaviour (does the engine's `playwright` dependency resolve from the engine's own `node_modules`?), ESM-only consumers, and a CommonJS `require()` consumer. Is any of these broken or misleadingly documented?
2. Does adding `exports` break or change anything inside this repo: `pnpm test`, `pnpm render`, the spike (`tools/spike/render.mjs`, which reads `package.json` and calls `require.resolve`), any tool or skill that imports the engine by name? Cite lines.
3. Import-time side effects: does importing `tools/plugin-api.mjs` run anything (CLI entry, file writes, browser launch, network) through `tools/render.mjs` → `tools/request.mjs` and `tools/review.mjs`? Cite the guards.
4. `publishForReview` from a linked consumer: where does it write, can a consumer-supplied `project` name escape `REVIEW/` (path traversal such as `../x`), and is the README's "replaces" wording accurate? If traversal is possible, is it new exposure created by this PR or pre-existing behaviour now made public?
5. Is the public surface the right size: two names, a re-export file, and the `./package.json` subpath? Is anything over-built, missing, or inconsistent between `tools/plugin-api.mjs`, README, ROUTER, CHANGELOG and SPECS-PRD?
6. Evidence: does each row in `TESTS-RESULTS/2026-11-12-GH-82/README.md` observe the real outcome, and would the checks reject an unchanged base (no `exports`)? Mark anything you cannot verify as `[Unverified]`.
7. Privacy: this repo is public. Does the diff contain absolute home paths, emails, tokens, or the name of a private repository?

Definition of Done: the PR delivers a working, correctly documented two-name public API with no regression and no private data; every Blocker/Should carries `Observed input:`, `Affected scope:` and `Falsifier:` lines.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 (kimi)

swept file: yes
VERDICT: FAIL
Basis: The two-name linked ESM API resolves correctly and `publishForReview` rejects path traversal, but the public documentation omits an observed CommonJS limitation and `REVIEW/README.md` still teaches a deep import. I swept all named PR files plus `tools/render.mjs`, `tools/request.mjs`, `tools/review.mjs`, `tools/spike/render.mjs`, and `REVIEW/README.md`; no additional pre-existing defects were found in that sweep.

- [Should] **Document the public entry point as ESM-only (or deliberately add CommonJS support).** The README shows ESM `import` but never states that `require()` cannot load the root (`README.md:173-202`). On the declared Node 22 runtime, `review.mjs` has top-level `await` in its CLI guard (`tools/review.mjs:48-51`), so the re-export (`tools/plugin-api.mjs:15`) makes an otherwise require-able ESM graph fail.
  - Probe (scratch consumer symlinked to this checkout): `cd .relay-scratch/gh82-review && node -e "try { const m = require('xyz-layout-engine'); console.log('cjs', Object.keys(m)); } catch (e) { console.log('cjs_error', e.code, e.message); process.exitCode = 1; }"`; exit 1; decisive output: `cjs_error ERR_REQUIRE_ASYNC_MODULE require() cannot be used on an ESM graph with top-level await. Use import() instead.` `--experimental-print-required-tla` identified `tools/review.mjs` as the source.
  - Observed input: `require('xyz-layout-engine')` from a linked CommonJS consumer on Node v22.22.3.
  - Affected scope: CommonJS consumers using synchronous `require()` for the package root; ESM imports and CommonJS dynamic `import()` are separate paths.
  - Falsifier: The same probe exiting 0 and returning both `launchPlaywright` and `publishForReview` would disprove the limitation; it currently exits 1. Concrete fix: add one explicit ESM-only/`import()` sentence to README (smallest), or remove top-level await if synchronous `require()` is intended to be supported.
- [Nit] **The review-folder guide still bypasses the new public seam.** `REVIEW/README.md:16-19` tells every project to use `import { publishForReview } from '<repo>/tools/review.mjs'`, while `tools/plugin-api.mjs:3-6` and `README.md:198-202` declare other engine paths non-public. Concrete fix: use `from 'xyz-layout-engine'` for external projects, or explicitly label the existing example as internal-only.
- [Pass] **Linked ESM resolution, export size, deep-path blocking, and the package-json subpath are correct.** `package.json:5-9` maps only the root and `./package.json`; `tools/plugin-api.mjs:13-15` exports exactly the two intended functions. Probe: `cd .relay-scratch/gh82-review && node --input-type=module -e "const m = await import('xyz-layout-engine'); console.log('esm', Object.keys(m).sort().join(','), typeof m.launchPlaywright, typeof m.publishForReview)"`; exit 0; output: `esm launchPlaywright,publishForReview function function`. Separate probes returned `deep_error ERR_PACKAGE_PATH_NOT_EXPORTED` and `package_json xyz-layout-engine-spike`, both with the intended result. `import.meta.resolve()` realpathed the link to `tools/plugin-api.mjs`; consequently the dynamic Playwright import at `tools/render.mjs:137-140` resolves from the engine's own dependency tree, not the consumer's.
- [Pass] **Plain ESM import has no CLI, write, browser, or network side effect.** The render CLI is gated by direct-path identity (`tools/render.mjs:542-545`), the review CLI by entry URL (`tools/review.mjs:48-51`), and Playwright/Satori/resvg loads occur only inside functions (`tools/render.mjs:12-18`, `tools/render.mjs:49-52`, `tools/render.mjs:137-140`). `tools/request.mjs` defines operations but invokes none. The ESM probe above printed only the export keys and exited 0.
- [Pass] **`publishForReview` is rooted in the engine checkout, rejects `../` traversal, and “Replaces” is accurate.** `reviewRoot` derives from the module URL (`tools/review.mjs:9`); the plain-folder regex rejects separators and dot-prefixed names (`tools/review.mjs:14-16`); removal then copying/reindexing implements replacement (`tools/review.mjs:17-22`, `README.md:192-195`). Probe: `cd .relay-scratch/gh82-review && node --input-type=module -e "import { publishForReview } from 'xyz-layout-engine'; try { await publishForReview('../escape', []); } catch (e) { console.log('traversal_error', e.message); }"`; exit 0; output: `traversal_error review project name "../escape" must be a plain folder name`. This exposure is pre-existing behavior now re-exported, not a new traversal introduced by the exports map.
- [Pass] **The exports map does not intercept the repo's direct/relative execution paths.** Scripts invoke files directly (`package.json:10-16`); the spike imports `../render.mjs` and reads the manifest by filesystem path (`tools/spike/render.mjs:16`, `tools/spike/render.mjs:27`); its `require.resolve` calls target dependencies, not this package (`tools/spike/render.mjs:122-145`). Scoped searches of `tools/`, `examples/`, and `skills/` found no runtime import of this engine by package name. Runtime regression suites remain listed as unverified below.
- [Pass] **The unchanged-base red control rejects the root import for the stated reason.** A scratch consumer linked to a scratch copy of the current manifest with only `exports` removed ran `node --input-type=module -e "try { await import('xyz-layout-engine'); } catch (e) { console.log('base_error', e.code, e.message.split('\\n')[0]); process.exitCode=1; }"`; exit 1; decisive output began `base_error ERR_MODULE_NOT_FOUND Cannot find package .../node_modules/xyz-layout-engine/index.js`, matching the receipt's rejection claim (`TESTS-RESULTS/2026-11-12-GH-82/README.md:14`). This checks the manifest mechanism, not the producer's historical clone run.
- [Unverified — needs clone run] **Full runtime and evidence rows remain harness-owned.** I did not run `pnpm test`, PDDA, Chromium, the publication smoke, or the real-consumer comparison under this turn's restrictions. Those rows (`TESTS-RESULTS/2026-11-12-GH-82/README.md:10-12`, `:15`) record observed outcomes but have no raw logs here; the clone gate must verify them. The import/deep-link/base-control portions were independently probed above.
- [Pass] **No private data appears in the GH-82 additions reviewed.** The new API/package/doc/evidence sections use placeholders or public HiQS-Labs URLs (`tools/plugin-api.mjs:1-15`, `README.md:173-202`, `PROJECT/2-WORKING/GH-82-PLUGIN-API.md:1-76`, `TESTS-RESULTS/2026-11-12-GH-82/README.md:1-17`); no absolute home path, email, credential, token, or private-repository name was found.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
