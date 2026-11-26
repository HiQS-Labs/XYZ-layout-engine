# RELAY · GH-102 plan QA: lean multi-stage renderer Docker target and trimmed build context
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-25.
-->

NEXT: Reviewer
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

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
