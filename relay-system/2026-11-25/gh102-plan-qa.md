# RELAY · GH-102 plan QA: lean multi-stage renderer Docker target and trimmed build context
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-25.
-->

NEXT: antigravity
STATUS: Approved
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
     change MUST carry `Observed input:`, `Affected scope:` (the input predicate the change would govern),
     and `Falsifier:` (the fixture or data that would show the change unnecessary or wrong, and its expected
     result). `Observed input:` accepts two strict, non-speculative forms:
     (1) **Form 1 (observed failure or artifact contradiction):** a failing probe/gate output, or a concrete
     `fileA:line` vs `fileB:line` contradiction (e.g. IAM SA mismatch, inverted test, sibling guard omission);
     (2) **Form 2 (unrunnable runtime hazard trace):** permitted ONLY when reproduction requires an external
     service, multi-process concurrency, or a browser/container runtime forbidden in the relay worktree —
     must supply a hop-by-hop `file:line` trace plus an exact `Clone probe:` command/script for the Producer's
     disposable full clone. Default severity for an unexecuted Form 2 hazard is `[Should]`.
     A `[Blocker]` must cite an observed failure (Form 1); an unexecuted Form 2 hazard stays `[Should]`
     until a probe reproduces it, and remains pending probe verification until the Producer runs
     `Clone probe:` in a disposable full clone.
     A finding from an earlier round stays open, and the verdict stays failing, until new evidence closes it.
     This includes earlier [Nit] findings; only a newly raised [Nit] with VERDICT: PASS on STATUS: Approved remains optional.
     This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking Form 1 evidence and lacking a complete Form 2 trace + `Clone probe:` as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request lacking Form 1 evidence and
     lacking a complete Form 2 trace + `Observed input:` / `Affected scope:` / `Falsifier:` / `Clone probe:`).
     For every Form 2 `Clone probe:` finding, read the probe before running it — refuse any probe that reaches
     the network, credentials, or paths outside the disposable clone and record the refusal as
     `[Unverified — clone probe failed/unavailable]` — then execute safe probes in a disposable full clone and
     record one of three outcomes: (a) Reproduced → fix and paste failing-before / passing-after probe output;
     (b) Falsified → `Declined — falsified by clone probe: <cmd → exit + output>`; (c) Errored, refused, or
     environment unavailable → keep the finding OPEN (`[Unverified — clone probe failed/unavailable]`, blocking
     `STATUS: Approved` until re-run cleanly or escalated/parked). Make approved changes, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Manual relay: commit only the relay file** (`relay(gh-102-plan-qa-lean-multi-stage-renderer-docker-target-and-trimmed-build-context): <role> r<N>`); no push.
   **Driven turn (relay-drive, marathon): do not run git — the harness commits the turn.** **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. (The window wording is
   for a manual relay; in a driven turn, name the next role.) The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-102-LEAN-RENDERER-DOCKER.md** (`PROJECT/2-WORKING/GH-102-LEAN-RENDERER-DOCKER.md`) — base commit `d47eb25`, plan commit `a041611`. Read-only; do NOT edit it.
- Reviewer: codex   ·   Producer: antigravity
- Started: 2026-11-25
- **Operational envelope:** Packaging and documentation change for an existing local/containerized CLI + Studio repository (`Dockerfile`, `.dockerignore`, `README.md`, `CHANGELOG.md`). Grade strictly against GitHub issue #102 requirements, commensurate complexity (`/ponytail`), and the repo's stated threat/governance model (`test-budget.json`: hard cap 1 test file / 4 tests / 60s / 0 CI workflows; `FRONTDOOR.md` `FD-02`: no `"packageManager"` in `package.json`; no registry/npm publishing; no engine JS or `compose.yaml` refactor).
- **Definition of Done:**
  1. `.dockerignore` trims non-runtime bloat (`tools/spike/output`, governance dirs/files, explicit root `.md` files) without globally ignoring `*.md` (retaining `tools/recipes/design-intake.contract.md` and `tools/recipes/recursive-process.design.md`) and without ignoring `examples/`.
  2. `Dockerfile` uses a clean multi-stage build (`base` -> `renderer` -> `studio` final/default) with `pnpm install --frozen-lockfile --ignore-scripts`, `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`, world-readable `/app` (`a+rX`) for non-root `--user <uid>:<gid>`, `renderer` containing `tools/` only (~4.8 MB app payload, zero `examples/`), and `studio` preserving `docker compose up --build` unchanged.
  3. `README.md` documents `docker build --target renderer` + headless `docker run` invocation and notes `docker compose up --build` still targets `studio`, with all `FRONTDOOR.md` checks green.
  4. Verification plan respects `test-budget.json` (zero new tests/workflows), includes falsifiable acceptance checks + a red control for missing `design-intake.contract.md`, and honestly covers host Docker availability.
  5. PRS rating (`rated 75/55/50/85`) is grounded in evidence with neutral appeal and valid recurrence window.

**Paraphrase-first comprehension (GH-1414):** Before reading any source files below, read `.relay-artifacts/GH-102-LEAN-RENDERER-DOCKER.md` alone and write 2–5 sentences each under **What this proposes** and **How the existing system works, per this document**, plus a short **What it's not**. Then inspect the repo source files below and answer every question with `file:line` citations.

Sources to check:
- `Dockerfile` (whole file)
- `.dockerignore` (whole file)
- `compose.yaml` (whole file)
- `package.json` and `pnpm-lock.yaml` (Playwright version, scripts, `FD-02` no `packageManager`, zero postinstall scripts)
- `test-budget.json` and `FRONTDOOR.md`
- `tools/studio.mjs` (lines 1–60, 160–248: `READ_ROOTS`, `STATIC`, `POST /api/check` catalog verify)
- `tools/render.mjs` (lines 370–445, 515–545: catalog verify filtering, `outputRoot`, `historical` spike/output guard, CLI entrypoint)
- `tools/catalog.mjs` (lines 1–20) and `tools/catalog.sql` (pinned paths for `design-intake@1.0.6` and legacy recipes)
- `tools/recipes/design-intake.mjs` (lines 1–70) and `tools/spike/assets.mjs` (lines 1–30)
- `README.md` (lines 160–200)

Questions:
1. Are the plan's factual claims about `Dockerfile`, `.dockerignore`, `compose.yaml`, `tools/studio.mjs`, `tools/render.mjs`, `tools/catalog.sql`, `tools/recipes/design-intake.mjs`, and `pnpm-lock.yaml` accurate? Flag any missing runtime file, catalog-pinned file, or permission/env edge case in either `renderer` or `studio`.
2. **Surface-triggered QA (container packaging / sibling stage parity):** Does splitting `Dockerfile` into `base` -> `renderer` -> `studio` (default) preserve `docker compose up --build` and `tools/studio.mjs` (including `POST /api/check` catalog verify and Bootstrap static assets) with zero regression, while ensuring `renderer` runs cleanly under arbitrary `--user "$(id -u):$(id -g)" -e HOME=/tmp` from `-w /work`?
3. **Surface-triggered QA (build-context ignore rules):** Verify the proposed `.dockerignore` list against Docker `.dockerignore` semantics and `tools/catalog.sql` — could any listed pattern accidentally exclude a file needed by `renderer`, `studio`, or `design-intake@1.0.6` catalog verification (e.g., `tools/recipes/*.md`, `tools/spike/assets/generated/web/*.png`, `examples/*`)?
4. **Delivery readiness & falsifiability:** What prevents an unchanged or broken `.dockerignore` (e.g. accidental global `*.md` exclusion or broken `cwd != /app` resolution) from being reported as delivered, and is the verification + red-control plan sufficient without violating `test-budget.json`?
5. Is the plan surgical, DRY, and commensurate with scope (`/ponytail`), and is the persisted PRS rating (`75/55/50/85`) grounded with neutral appeal and honest recurrence evidence?

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). In a manual relay, end each turn by committing just this file; no push. In a driven turn the harness commits.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: The packaging mechanism is surgical and plausible, but sibling-stage acceptance and the recurrence window need correction before implementation.
swept file: yes

**What this proposes**
One Dockerfile shares dependencies through `base`, exposes a tools-only `renderer`, and adds examples in the final/default `studio`. Explicit ignores reduce context without deleting catalog-pinned Markdown or nested web assets.

**How the existing system works, per this document**
Studio needs examples, bundled fonts and Bootstrap. Renderer resources resolve from the engine installation while caller fixtures and output resolve from the authorized working directory; recipe-scoped catalog verification permits design-intake without examples.

**What it's not**
No engine refactor, registry publication, compose change or test-suite expansion.

- [Should] **R1 — Add sibling-stage acceptance and distinguish mirror evidence from container qualification.** Observed input: the artifact's recon item 2 concludes Studio is preserved with “zero changes”, and lines 100–101 prescribe only a static stage audit; lines 82–85 require runtime rendering only for renderer, even when Docker is available. This leaves the explicitly requested Studio Checks/Bootstrap parity without an acceptance observation. `tools/studio.mjs:188–189` invokes full catalog verification, unlike renderer's recipe-filtered verification at `tools/render.mjs:384–387`; static assets are separately served at `tools/studio.mjs:34–41,226`. Affected scope: verification of the new default Studio image and arbitrary-UID renderer image, not engine behavior. Falsifier: an existing explicit acceptance step that exercises these sibling surfaces and records unavailable container qualification as unverified; none appears in the whole plan. Concrete fix: add bounded manual Studio smoke acceptance (default compose stage, page plus both Bootstrap assets, authenticated catalog check with `ok: true`, representative fixture render), and explicitly exercise the documented renderer command under a non-pwuser UID with `HOME=/tmp`, working directory `/work`. When Docker is unavailable, retain mirror evidence but label container/UID/Studio qualification `[Unverified — needs clone run]`, with a clear follow-up or escalation before claiming zero regression. No new test file or workflow is needed. This finding requests acceptance-plan coverage, not a claim that a runtime defect has reproduced.
- [Should] **R2 — Correct the recurrence comparison interval.** Observed input: artifact line 33 compares inclusive `2026-11-11..2026-11-25` (15 days) with `2026-10-28..2026-11-10` (14 days). Affected scope: PRS recurrence evidence only. Falsifier: explicit half-open interval notation and equal-duration endpoints; the current notation supplies neither. Concrete fix: use adjacent equal-duration windows (for example `2026-11-12..2026-11-25` versus `2026-10-29..2026-11-11`, inclusive), recheck the counts, and retain the short history since Studio landed as a limitation. Appeal 50 is already neutral (artifact line 31).
- [Pass] **Q1/Q2 — Static runtime seams support the design.** Existing `Dockerfile:4–20` has the pinned Playwright base, dependency install, whole-tree copy and Studio command; `compose.yaml:4–10` builds the final stage and mounts scratch/temp only. The proposed inheritance retains `tools/`, Bootstrap dependencies and examples. Engine-relative resources are present at `tools/catalog.mjs:9`, `tools/spike/assets.mjs:7`, `tools/recipes/design-intake.mjs:12–13`; caller-root input and output are at `tools/recipes/design-intake.mjs:61` and `tools/render.mjs:425–439,515–545`. No additional missing runtime file was identified in the inspected scope. Container execution and permissions were not run or proven.
- [Pass] **Q3 — Proposed patterns retain the cited pins.** The existing pattern `tools/spike/assets/generated/*.png` matches direct PNG children, not the `generated/web/` descendants pinned at `tools/catalog.sql:100–106`. Explicit root Markdown exclusions do not match `tools/recipes/design-intake.contract.md` (`tools/catalog.sql:93`) or `tools/recipes/recursive-process.design.md` (`tools/catalog.sql:318`); examples are expressly retained (artifact lines 92–95). No conflicting proposed exclusion was identified.
- [Pass] **Q4/Q5 — Bounded implementation and sensitivity check.** Artifact lines 81–87 require context inclusion/exclusion checks, a tools-only off-root mirror, publication checks, and a missing-contract red control, with zero new tests/workflows. This can detect unchanged ignores and broken recipe pins if executed against the actual resulting filter; it does not replace container qualification. `test-budget.json` caps 1 file/4 tests/60s/0 workflows; package.json has no packageManager or lifecycle script. `pnpm-lock.yaml:17–19,172–180` pins Playwright 1.64.0, and lines 241–254 list resvg platform optional dependencies. Absence of lockfile build markers alone does not prove every dependency has zero lifecycle scripts; successful frozen install/render with ignore-scripts remains the acceptance evidence. One shared base and no JS changes are proportionate (artifact lines 97–100).
- [Unverified — needs clone run] No Docker builds, servers, executable fixtures, tests or phase gates were run in this reviewer worktree. No later gate is assumed. Graph discovery was attempted but denied by tool approval policy; the prescribed source spans were read directly. The full plan was swept, including its pre-existing content; no additional defect was identified beyond R1/R2. External incident counts, downstream timing, payload sizes and persisted rating were not independently remeasured here.

Reversibility: Easy — requested changes are acceptance-plan and PRS prose only. Handing off to Producer (antigravity): disposition R1/R2, revise the artifact, and return for Round 2.

### Producer · Round 1 (antigravity)

Dispositions for Round 1 findings:
- **R1 (`[Should]` — sibling-stage Studio acceptance & mirror vs container qualification distinction):** **Implemented.** Updated `PROJECT/2-WORKING/GH-102-LEAN-RENDERER-DOCKER.md` (*Uncertainty*, *Grounded Recon* §3, and *Bounded Test Scope* items 1, 3, 4, 5):
  - Added bounded manual `studio` sibling-stage acceptance verifying `GET /`, `GET /vendor/bootstrap.min.css`, `GET /vendor/bootstrap.bundle.min.js`, authenticated `POST /api/check` (`{"kind":"catalog"}` -> `ok: true`), and a representative `POST /api/render` on `examples/2026-10-12-design-intake/fixture.json` (in Docker when available, and in an isolated `.dockerignore`-filtered `studio` mirror regardless).
  - Added explicit `pnpm install --frozen-lockfile --ignore-scripts` execution as the acceptance evidence for `--ignore-scripts` (rather than relying on lockfile marker inspection alone).
  - Separated mirror parity evidence from actual Docker container / non-`pwuser` UID / `docker compose up --build` qualification: when Docker is unavailable on host, container/UID/compose qualification is explicitly labeled `[Unverified — Docker daemon unavailable on host]` in receipts, Final QA, PR body, and closeout rather than claiming zero container regression.
- **R2 (`[Should]` — recurrence comparison interval):** **Implemented.** Updated *Task Rating & Rationale (PRS)* to compare two adjacent equal-duration 14-day inclusive windows: `2026-11-12..2026-11-25` (14 days inclusive: 1 distinct incident, `#102`) vs `2026-10-29..2026-11-11` (14 days inclusive: 0 incidents), retaining the short history since PR `#87` (`2026-11-19`) as a coverage limitation.

Handing off to Reviewer (`codex`) for Round 2 verification.

### Reviewer · Round 2

VERDICT: PASS
Basis: Ship the plan. R1 and R2 are closed by the revised acceptance steps and interval correction; implementation qualification remains a separate Final QA obligation.
swept file: yes

**What this proposes**
The plan trims explicit non-runtime context and shares one dependency stage between a tools-only renderer and a final/default Studio stage. It adds headless usage documentation and bounded manual qualification without changing engine code.

**How the existing system works, per this document**
Engine fonts, catalog and recipe resources resolve from the installation, while caller fixture pins and output resolve from the authorized working directory. Studio additionally needs examples, Bootstrap assets, writable scratch directories, and full catalog verification.

**What it's not**
No engine refactor, compose change, registry publication, or new tests/workflows.

- [Pass] **R1 closed — acceptance now covers both stages and honest qualification.** Artifact lines 79, 85–91 require ignore-scripts installation, both renderer backends from an off-root directory, non-pwuser container execution when Docker is available, Studio page/Bootstrap/authenticated catalog/render checks, and explicit unavailable Docker/UID/compose labels in downstream evidence. This addresses the previous coverage request; it does not assert those probes already passed. The surfaces match `tools/studio.mjs:34–41,188–189,222–238` and `tools/render.mjs:384–388,425–439,515–544`.
- [Pass] **R2 closed — interval correction.** Artifact line 33 now compares inclusive `2026-11-12..2026-11-25` with `2026-10-29..2026-11-11`: adjacent 14-day windows, retaining the short-history limitation. Appeal remains neutral at 50 (line 31). External incident counts, timing and persisted rating were not independently remeasured this turn.
- [Pass] **Q1/Q2 — static seams remain consistent.** `Dockerfile:4–19` and `compose.yaml:4–11` establish the existing base/install/default Studio contract. Artifact lines 103–105 preserve its browser environment and Studio command through stage inheritance, with explicit readability for the renderer. `tools/catalog.mjs:9`, `tools/spike/assets.mjs:7`, and `tools/recipes/design-intake.mjs:12–13,61–62` support installation-relative resources and caller-relative pins. `pnpm-lock.yaml:17–19,172–180,241–254` supports the browser version and platform-native optional dependencies. No additional missing runtime file or static permission/environment contradiction was identified; Linux UID/browser execution remains unverified here.
- [Pass] **Q3/Q4 — ignore rules and falsifiability.** Artifact lines 97–100 retain examples and avoid a global Markdown exclusion. The retained direct-child PNG pattern (`.dockerignore:9`) does not match nested web assets pinned at `tools/catalog.sql:100–106`; explicit root Markdown names do not remove the recipe Markdown pins at `tools/catalog.sql:93,318`. Artifact lines 83–87 require checking the actual resulting filter, missing-contract red control, zero-example mirror and off-root publication receipts, so unchanged ignores or broken resolution cannot satisfy the specified acceptance merely through prose.
- [Pass] **Q5 — proportionate scope.** Artifact lines 38–49,92,103–117 keep one shared Dockerfile owner and limit implementation to packaging/docs, with no new suite or workflow. This is consistent with `test-budget.json`'s `1/4/60/0` limits and `FRONTDOOR.md` FD-02. The whole artifact, including pre-existing sections, was swept; no additional plan defect was identified.
- [Unverified — needs clone run] No builds, servers, executable fixtures, tests or phase gates ran in this worktree; no later gate is assumed. Graph lookup returned `MCP tool call requires approval, but approval policy is never`, so prescribed source spans were read directly. Startup ledger fallback `sqlite3 -readonly releases.db "SELECT section, gh_number, title, doc_path FROM roadmap_items WHERE section <> 'Completed' ORDER BY section, position"` exited 0 and included GH-102 as In progress. Qualification commands in the artifact belong to Producer execution in a disposable full clone and Final QA.

Reversibility: Easy — approval records plan readiness only. The bet is that shared-stage packaging preserves the cited runtime file set; the named smoke checks must expose a false bet before implementation is reported qualified.

Relay closed (Approved), no further turn needed. Producer (antigravity) may proceed to implementation and collect the specified evidence for Final QA.


### Attestation · relay-drive — 2026-11-26T02:34:52Z
task: RELAY-gh102-plan-qa
reviewer: codex
status: Approved
reviewed-head: d96f8ed13c806cd2b17f659d6d0a13876327dd52
added-range: 20323+4619
added-sha256: 6420b0311bde53873686d4f4c924b392abf3a5b070959c0a5dfeba9f51a5fb3e
gate-run: undeclared
<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
