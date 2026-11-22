# RELAY · GH-82 plan QA: external-module public API
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-12.
-->

NEXT: done
STATUS: Approved
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
6. **Commit only the relay file** (`relay(gh82-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `PROJECT/1-INBOX/GH-82-PLUGIN-API.md` (the plan, sections Asks, Deferred, Acceptance, Rating, Plan) — base commit `4e08148`.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-12
- **Operational envelope:** a local, single-operator rendering engine (Node ESM, pnpm, no npm publishing). One external
  module in a separate repository links this checkout as a package. Grade against the stated requirements and
  commensurate complexity; do not demand multi-tenant, versioning or plugin-framework machinery. The repo caps its
  test suite (`test-budget.json`: 4 canaries); asking for a new test file is out of scope.

**Paraphrase first (before reading any source file):** under `What this proposes` and
`How the existing system works, per this document`, write 2-5 sentences each from the plan alone, plus a short
`What it's not`. Then read the sources below and answer the questions as a source-backed assessment.

Sources to check: `package.json`, `tools/render.mjs` (`launchPlaywright` near line 137; recipe dispatch near line 195),
`tools/review.mjs` (`publishForReview`), `tools/request.mjs` (recipe allowlists near lines 101 and 148),
`tools/spike/render.mjs` (package name read near line 27; `require.resolve` near line 126), `test-budget.json`,
`PROJECT/2-WORKING/SPECS-PRD.md` §6.5.

Questions:
1. Is every factual claim in the plan's "Observed" paragraph true at the cited lines? In particular: does anything in the
   repo resolve this package by name, so that adding `exports` could break it?
2. Does adding `"exports"` with only `.` and `./package.json` change behaviour for any existing in-repo command
   (`pnpm test`, `pnpm render`, the spike's `pkgInfo`)? Cite the line that shows it does or does not.
3. Is importing `tools/render.mjs` from `tools/plugin-api.mjs` free of side effects at import time (no CLI run, no
   browser launch, no file writes)? Cite the top-level statements.
4. Does `publishForReview` resolve `REVIEW/` relative to the engine file (so a linked consumer writes into the engine
   checkout's git-ignored `REVIEW/`) rather than the consumer's cwd? Cite it.
5. Is the deferral of `XYZ_RECIPE_PATHS` justified by the three hardcoded recipe sites, or is there a smaller way
   to support external recipes now that the plan misses?
6. What prevents an unchanged candidate (no `exports`, no `plugin-api.mjs`) from passing the acceptance checks — is
   the red control real?
7. Is anything over-built or missing for the stated outcome?

Definition of Done: plan claims are source-true, the acceptance checks would reject an unchanged candidate, and the scope is the smallest that delivers a declared external surface.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex

VERDICT: PASS
Basis: Approve the plan within the local, single-operator envelope. The declared two-name surface is small, the cited mechanisms support it, and the unchanged package fails the proposed acceptance. This approves planning, not unexecuted implementation checks.
swept file: yes

**What this proposes**
The plan adds one package entry point exposing only `launchPlaywright` and `publishForReview`. An external repository links the checkout under `xyz-layout-engine`; documentation declares those two names public while preserving the actual package name.

**How the existing system works, per this document**
The document says the external module currently uses file-path imports and the engine has neither `main` nor `exports`. It says the spike reads the package name for output naming, while request normalization, saving and rendering restrict recipe identities to built-ins.

**What it's not**
No external recipe loader, publishing, package rename, versioning policy, discovery, hooks or additional test file. These paraphrases were formed from the entire plan before reading implementation sources.

- [Pass] **Q1–2: package resolution and compatibility.** `package.json:2–19` has the stated name, no `main`/`exports`, and scripts that execute files directly (`test` at line 9, `render` at line 10). `tools/spike/render.mjs:27` reads the manifest through an explicit filesystem path. Its `require.resolve` calls at lines 126, 129 and 144 resolve dependency manifests; actual `pkgInfo` arguments at lines 204–208 are satori/resvg/playwright and transitives, never this engine. Source search over JS/ESM/CJS found no engine package-name import or resolver call. Adding the proposed map does not redirect these entry points, their relative engine imports (`tools/spike/render.mjs:16`), or `pkgInfo`. The `./package.json` export also keeps that subpath available. No fix required.
- [Pass] **Q3: import-time behavior.** `tools/render.mjs:2–25` imports built-ins and `request.mjs`, then declares helpers; `request.mjs:1–9` imports built-ins and initializes constants. The Playwright dynamic import and launch are inside `launchPlaywright` (`tools/render.mjs:137–140`), and CLI execution is guarded by the entry file's real path (`tools/render.mjs:542–545`). `tools/review.mjs:5–11` computes its root and helpers; writes are inside functions, and its CLI is guarded at lines 48–52. Reading the complete renderer and review modules found no import-time browser launch or write. No fix required.
- [Pass] **Q4: destination ownership.** `tools/review.mjs:9` sets `reviewRoot` with `new URL('../REVIEW/', import.meta.url)`; lines 16–22 publish under it. `.gitignore:13–14` ignores REVIEW outputs while retaining the convention README. Thus a normal linked consumer publishes into the engine checkout, independent of consumer cwd. No fix required.
- [Pass] **Q5, Q7: scope and smallest mechanism.** `tools/request.mjs:101–110` owns inference, admission and canvas restrictions; lines 148–151 repeat trusted admission for saving; `tools/render.mjs:195–205` dispatches explicit built-ins. An environment path alone cannot support an external recipe through this pipeline. This task exposes browser launch and review publishing without involving that pipeline; no registry or callback API is needed for the declared outcome. `SPECS-PRD.md:254–269` distinguishes the delivered local catalog from broader recipe-registry targets, so the planned note must keep that distinction. `test-budget.json` caps the suite at four tests in one file; the manual smoke respects it. No fix required.
- [Pass] **Q6: unchanged-candidate red control is real.** Narrow probe command: `export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"; mkdir -p "$TMPDIR"; node --input-type=module > "$TMPDIR/gh82-probe.log" 2>&1 <<'JS' … JS` (exit 0). The inline driver created a scratch `node_modules/xyz-layout-engine` symlink to this unchanged checkout and ran a scratch ESM script with `await import(spec)` for the root and deep path, catching and printing each error code. Decisive output: `node=v22.22.3 unchanged-linked-probe exit=0`, `xyz-layout-engine: ERR_MODULE_NOT_FOUND`, `xyz-layout-engine/tools/render.mjs: OK launchPlaywright=function`. The driver also directly imported both source modules and printed `direct imports: launchPlaywright=function publishForReview=function`, `reviewRoot engine-relative=true`, `no launch/publish invoked`. This is an import-resolution probe, not a test-suite run. The planned smoke must treat a caught root-import failure as failure; the probe's exit 0 means the measurement driver completed, not that the root import passed. No fix required.
- [Nit] In the planned consumer README, mention that publishing replaces the named project's directory (`tools/review.mjs:13–20`) and that callers close the returned browser (`tools/render.mjs:137–140`). A minimal example can communicate both existing contracts without expanding the API.
- [Unverified — needs clone run] Candidate package exports, pnpm linking/install, Chromium launch/close, publishing the PNG, `pnpm test` and PDDA have not been executed here. Run the already-planned acceptance in the disposable full clone and retain its receipt; no new suite requested. The external repository's current imports and the historical duplicate-issue search are author-supplied context, not independently observable in the seeded artifact.

Reviewed the whole plan, including Asks, Deferred, Acceptance, Rating and Plan. No pre-existing plan defect requiring correction was found. Bet: two re-exports plus package metadata meet this consumer's actual need; the failure signal would be a consumer requiring the deferred request/recipe pipeline. Reversibility: Easy, using the plan's commit rollback. Graph tools were unavailable; evidence used direct source reads and bounded literal searches, with no claim of graph coverage.

Relay closed (Approved), no further turn needed; handing the token to done.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
