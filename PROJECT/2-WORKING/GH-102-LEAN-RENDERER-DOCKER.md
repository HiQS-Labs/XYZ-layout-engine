---
gh_issue: 102
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/102
title: "Container runtime packaging: add lean multi-stage renderer Docker target and trim build context for headless consumers"
goal: "Add a lean multi-stage renderer Docker target, trim non-runtime Docker build context without breaking catalog pins or Studio, and document headless container invocation"
status: "Active (PR #103 open; host + Linux Docker verified)"
created: 2026-11-25
updated: 2026-11-25
owner: Antigravity
doc_type: feature
branch: feat/XYZ-layout-engine-gh102-lean-renderer-docker-2026-11-25
effort: 1
complexity: 1
risk: 1
phases: 1
---

# GH-102 — Lean Multi-Stage Renderer Docker Target & Trimmed Build Context

## Status

| What was just completed | What's next |
|---|---|
| Final Codex Relay QA approved (`relay-system/2026-11-25/gh102-final-qa.md`), PR `#103` opened targeting `main`, live `linux/amd64` Docker verification passed (`renderer` build/run + arbitrary UID `12345:12345` + `docker compose up -d --build` Studio across all 4 recipes), and QA doc nits polished (`TESTS-RESULTS/2026-11-25+GH-102/README.md`). | Await operator merge of PR `#103`, then archive `GH-102` to `PROJECT/3-COMPLETED/` via `/merge-cleanup`. |

## Task Rating & Rationale (PRS)

- **Persisted rating (`releases.db`, 2026-11-25):** `rated 75/55/50/85` (rank sum `265`; no operator `ovr`).
- **Severity (`55`):** External headless Linux container consumers (triggered by `BinoidCBD/LTVera-Pandas#1281` / PR `#1282`) cannot build a lean, SHA-pinned renderer image without copying ~274 MB of `examples/`, ~16 MB of `tools/spike/output/`, and ~8.6 MB of governance files, or falling back to ad-hoc `git archive` + runtime `npx pnpm install` (`6,249 ms` startup overhead + live npm network dependency). No data loss or crash in local workflows or Studio.
- **Priority (`75`):** Directly unblocks clean containerized headless rendering for downstream consumers and was explicitly scheduled via `/start-task`.
- **Appeal (`50`):** Neutral per task rating policy (no explicit user score supplied).
- **Effort / cheapness (`85`):** High cheapness — 3 small files (`Dockerfile`, `.dockerignore`, `README.md`), zero engine JS changes required.
- **Recurrence evidence:** Two adjacent equal-duration 14-day inclusive windows in `HiQS-Labs/XYZ-layout-engine`: `2026-11-12..2026-11-25` (14 days inclusive: 1 distinct incident, `#102` opened `2026-11-25`) vs `2026-10-29..2026-11-11` (14 days inclusive: 0 incidents). Coverage limitation: `Dockerfile` and XYZ Studio only landed in PR `#87` on `2026-11-19`, so baseline container history is short. No prior open or merged PR covers this seam (`prior_art_recon.py --query Dockerfile`).
- **Uncertainty:** Docker daemon is currently stopped on the local macOS host (`colima` / `desktop-linux` unreachable). If Docker remains unavailable during verification, mirror-based runtime verification proves `.dockerignore` filtering, `--ignore-scripts` install/render parity, `cwd != /app` `design-intake` rendering + `catalog.verified === true`, and `tools/studio.mjs` sibling-stage endpoints, while actual Docker image build / Linux arbitrary-UID container execution is recorded explicitly as `[Unverified — Docker daemon unavailable on host]`.

## Preflight Bet Check (Solution-Fit)

- **Reversibility:** `Easy` — pure container build recipe (`Dockerfile`, `.dockerignore`) and user documentation (`README.md`); zero engine code, schema, catalog, or `compose.yaml` changes.
- **Outcome sought:** Headless Linux container consumers can build a deterministic, pre-baked `renderer` image containing only `package.json`, `pnpm-lock.yaml`, `node_modules`, Playwright Chromium, and `tools/` (~4.8 MB app payload, zero `examples/`, zero runtime npm installs), executable from an arbitrary mounted `-w /work` directory under `--user "$(id -u):$(id -g)"`, while `docker compose up --build` continues serving XYZ Studio with all `examples/` unchanged.
- **Smallest viable bet:**
  - Trim explicit non-runtime repo bloat in `.dockerignore` (`tools/spike/output`, governance directories, ledger files, and explicit root `.md` files) while keeping `examples/` and all `tools/` catalog-pinned files (including `tools/recipes/design-intake.contract.md` and `tools/recipes/recursive-process.design.md`).
  - Split `Dockerfile` into three stages: `base` (Playwright image + `pnpm@10` + `pnpm install --frozen-lockfile --ignore-scripts` + world-readable perms), `renderer` (`COPY tools ./tools` + `chmod -R a+rX`), and `studio` (default final stage adding `examples/`, `.relay-scratch`, `temp`, port 4173, `tools/studio.mjs`).
  - Document the `renderer` build/run command and default `studio` behavior concisely in `README.md`.
  - **Explicit non-goals:** No npm or registry publishing, no changes to `tools/plugin-api.mjs` or Playwright version, no changes to `compose.yaml` or `package.json` (preserving `FD-02`: no `"packageManager"`), no refactoring of `tools/recipes/*`, no new test files/tests/CI workflows (`test-budget.json`).
- **Alternatives rejected:**
  1. *Adding `examples/` to `.dockerignore`:* Rejected — breaks `docker compose up --build` because `compose.yaml` does not bind-mount `examples/` and `tools/studio.mjs:28` (`READ_ROOTS = ['examples', '.relay-scratch', 'temp']`) requires `examples/` in the container.
  2. *Adding a second `Dockerfile.renderer`:* Rejected (Ponytail / DRY) — duplicates base image tag, `pnpm` install, and `PLAYWRIGHT_BROWSERS_PATH` across two Dockerfiles that can drift; a single multi-stage `Dockerfile` has one canonical `base` stage and preserves `docker compose up --build` via the final `studio` stage.
  3. *Ignoring `*.md` globally in `.dockerignore`:* Rejected — breaks `design-intake@1.0.6` and `recursive-process@6.0.1` catalog verification because `tools/recipes/design-intake.contract.md` and `tools/recipes/recursive-process.design.md` are SHA-256 pinned in `tools/catalog.sql`.
- **Rollback / containment:** Revert the PR commit (`git revert`); restores the single-stage `Dockerfile`, prior `.dockerignore`, and prior `README.md` with zero state or schema migration.

## Grounded Recon (`origin/main@d47eb25`)

Verified read-only on `d47eb2530f3b37e867d591e277339137e04c6982`:

1. **Repo payload breakdown (`du -sh`):**
   - `examples/`: `274M` (required by `studio`, unneeded by headless `renderer`)
   - `tools/`: `21M` total, of which `tools/spike/output/` is `16M` (historical GH-1 evidence, unneeded at runtime) and runtime `tools/` minus `tools/spike/output/` is `~4.8M` (`tools/spike/assets/` `3.6M`, `tools/fonts/` `624K`, `tools/recipes/` `76K`, `tools/catalog.sql` `88K`, JS modules `<400K`).
   - Non-runtime governance/docs currently sent in Docker build context: `relay-system/` (`5.3M`), `PROJECT/` (`2.2M`), `marathon-system/` (`408K`), `releases.db` (`284K`), `utils/` (`244K`), `releases.sql` (`124K`), `CHANGELOG.md` (`124K`), `TESTS-RESULTS/` (`108K`), `skills/` (`44K`), `README.md` (`36K`), `docs/` (`24K`), plus root governance `.md`/config files (`~80K`).
2. **Studio seam (`compose.yaml`, `tools/studio.mjs`):**
   - `compose.yaml:4-9`: `build: .` (targets final stage), bind-mounts only `./.relay-scratch:/app/.relay-scratch` and `./temp:/app/temp`.
   - `tools/studio.mjs:25-39`: `process.chdir(ROOT)`, `READ_ROOTS = ['examples', '.relay-scratch', 'temp']`, `STATIC` serves `tools/studio/*`, `node_modules/bootstrap/dist/*`, and `tools/fonts/barlow-condensed/*`. `POST /api/check` (`catalog`, lines `188-189`) calls `catalogCLI(['verify'])`, which verifies all `tools/` and `examples/` paths in `tools/catalog.sql`.
   - Conclusion: Keeping `examples/` out of `.dockerignore` and copying `examples/` in the final `studio` stage preserves the file set `compose.yaml` and `tools/studio.mjs` expect without editing either file.
3. **Headless renderer seam (`tools/render.mjs`, `tools/catalog.mjs`, `tools/recipes/design-intake.mjs`, `tools/spike/assets.mjs`):**
   - `tools/catalog.mjs:9`: `const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')` resolves `tools/catalog.sql` and pinned `tools/*` files relative to the engine install dir (`/app`), independent of `process.cwd()`.
   - `tools/spike/assets.mjs:7`: `ASSETS_DIR = fileURLToPath(new URL('./assets', import.meta.url))` resolves Inter fonts and SVGs relative to `/app/tools/spike/assets`.
   - `tools/recipes/design-intake.mjs:12-13,61`: loads Barlow Condensed fonts via `import.meta.url`, resolves caller fixture/source/artwork pins relative to `options.root ?? process.cwd()`.
   - `tools/render.mjs:425-428` and `tools/request.mjs:156`: `outputRoot(target, authorizedRoot = process.cwd())` writes artifacts relative to `process.cwd()`; `historical = fileURLToPath(new URL('./spike/output', import.meta.url))` is purely a lexical `within()` guard and does not require `tools/spike/output` to exist on disk.
   - `tools/catalog.sql`: `design-intake@1.0.6` (`rcv-5efad770-687a-416a-b759-1900f383b200`) pins only files under `tools/` (including `tools/recipes/design-intake.contract.md`). `tools/render.mjs:374-390` filters verification errors to the active recipe's own pinned paths, so `design-intake` yields `catalog.verified === true` even without `examples/`.
   - `pnpm-lock.yaml`: lists Playwright `1.64.0` and `@resvg/resvg-js` platform `optionalDependencies` with no build-script markers; actual acceptance evidence for `--ignore-scripts` comes from executing `pnpm install --frozen-lockfile --ignore-scripts` followed by Satori + Playwright renders.
4. **Governance & test guardrails:**
   - `test-budget.json`: hard cap `testFiles: 1, tests: 4, maxSeconds: 60, ciWorkflows: 0`.
   - `FRONTDOOR.md` (`FD-02`): `package.json` must NOT contain `"packageManager"`; all relative links in `README.md` must resolve; `FD-01`..`FD-10` check block must print empty output.
   - Non-root UID execution: `/app`, `/app/package.json`, `/app/node_modules`, and `/app/tools` must be world-readable/traversable (`0755`/`0644` via `chmod -R a+rX`) so `--user "$(id -u):$(id -g)" -e HOME=/tmp` works on Linux regardless of build-host umask.

## Bounded Test Scope & Explicit Non-Scope

- **In scope (zero new test files, tests, or CI workflows):**
  1. **Repo qualification gates:**
     - `npx --yes pnpm@10 install --frozen-lockfile --ignore-scripts` + `npx --yes pnpm@10 test` (all 4 existing canaries pass within 60s budget, proving `--ignore-scripts` install supports both Satori/resvg and Playwright).
     - `utils/pdda/pdda.sh run` (0 errors).
     - `FRONTDOOR.md` deterministic read-only check block (empty output).
  2. **`.dockerignore` build-context & red-control verification:**
     - Parse the actual committed `.dockerignore` and verify every `tools/*` path pinned in `tools/catalog.sql` survives filtering, `examples/` survives for `studio`, `tools/spike/output` and governance dirs/root `.md` files are excluded, and filtered `tools/` payload is ~4.8 MB.
     - **Red control:** delete `tools/recipes/design-intake.contract.md` in a throwaway copy of the `renderer` mirror and confirm `design-intake` render flips `catalog.verified` from `true` to `false` (proving the check catches an accidental global `*.md` ignore).
  3. **Renderer stage runtime verification (main path + adjacent path):**
     - **When Docker daemon is healthy on host:** build `docker build --target renderer -t xyz-renderer .` and run the exact documented headless command under a non-`pwuser` UID (`--user "$(id -u):$(id -g)" -e HOME=/tmp -v ...:/work -w /work`) for both `--backend playwright --format png,html` (main path) and `--backend satori --format png,svg,html,html-inline` (adjacent path), checking `catalog.verified === true`, `validation.valid === true`, `fitting.fit === true`, and `verifyPublication` valid.
     - **Mirror evidence (always run; sole runtime evidence when Docker daemon is unavailable):** build an isolated `renderer`-stage mirror containing ONLY `package.json`, `pnpm-lock.yaml`, `node_modules` (installed via `--frozen-lockfile --ignore-scripts`), and `.dockerignore`-filtered `tools/` (zero `examples/`, zero `tools/spike/output/`), and run `node <mirror>/tools/render.mjs` from a separate `/work`-style `cwd != <mirror>` for both `--backend playwright --format png,html` and `--backend satori --format png,svg,html,html-inline`, confirming `catalog.verified === true`, `validation.valid === true`, `fitting.fit === true`, and `verifyPublication` returning `{ valid: true }`.
  4. **Studio sibling-stage verification:**
     - **When Docker daemon is healthy on host:** build default `studio` stage (`docker build -t xyz-studio .`), start it, and verify `GET /` (200), `GET /vendor/bootstrap.min.css` (200), `GET /vendor/bootstrap.bundle.min.js` (200), authenticated `POST /api/check` (`{"kind":"catalog"}` -> `ok: true`), and a representative `POST /api/render` on an `examples/` fixture.
     - **Mirror evidence (always run; fallback when Docker daemon is unavailable):** build an isolated `studio`-stage mirror containing ONLY `package.json`, `pnpm-lock.yaml`, `node_modules`, `.dockerignore`-filtered `tools/`, `.dockerignore`-filtered `examples/`, `.relay-scratch/`, and `temp/` (no governance dirs or `tools/spike/output/`), launch `node tools/studio.mjs` on an ephemeral loopback port, and verify `GET /` (200, extracts `__STUDIO_TOKEN__`), `GET /vendor/bootstrap.min.css` (200), `GET /vendor/bootstrap.bundle.min.js` (200), authenticated `POST /api/check` (`{"kind":"catalog"}` -> `ok: true`), and authenticated `POST /api/render` on `examples/2026-10-12-design-intake/fixture.json` (200, `receipt.validation.valid === true`).
  5. **Truthful container-qualification labeling:** If Docker daemon is unavailable on the execution host, retain all mirror evidence and receipts under `TESTS-RESULTS/2026-11-25+GH-102/`, AND explicitly mark Docker image build, Linux non-`pwuser` `--user` container execution, and `docker compose up --build` as `[Unverified — Docker daemon unavailable on host]` in the receipt, Final QA packet, PR body, and issue closeout (never claiming Docker container qualification passed without running Docker).
- **Explicit non-scope:** No new test files, no 5th canary test, no budget change to `test-budget.json`, no CI workflows, no speculative wrapper scripts.

## Ordered Implementation Plan

1. **Trim `.dockerignore` (canonical Docker build-context filter):**
   - Keep existing entries (`.git`, `node_modules`, `.relay-scratch`, `temp`, `REVIEW`, `.claude`, `.aider`, `.DS_Store`, `tools/spike/assets/generated/*.png`).
   - Add explicit non-runtime directories and files: `.agents`, `.gemini`, `.xyz`, `.tick`, `tools/spike/output`, `relay-system`, `PROJECT`, `marathon-system`, `TESTS-RESULTS`, `skills`, `utils`, `docs`, `releases.db`, `releases.sql`, `.pdda-mode`, `.gitignore`, `test-budget.json`, `compose.yaml`, and explicit root Markdown docs (`AGENTS.md`, `CHANGELOG.md`, `DESIGN.md`, `FRONTDOOR.md`, `GUIDING-PRINCIPLES.md`, `README.md`, `ROUTER.md`, `SOP.md`, `SYSTEM-INSTRUCTIONS.md`).
   - Never add a global `*.md` pattern and never exclude `examples/`.
   - *Inline verification:* evaluate the committed `.dockerignore` rules against the repo tree and `tools/catalog.sql`.

2. **Convert `Dockerfile` to multi-stage (`base` -> `renderer` -> `studio` default):**
   - `FROM mcr.microsoft.com/playwright:v1.64.0-noble AS base`: `WORKDIR /app`, `RUN npm install -g pnpm@10 && chown pwuser:pwuser /app && chmod 755 /app`, `USER pwuser`, `COPY --chown=pwuser:pwuser package.json pnpm-lock.yaml ./`, `RUN pnpm install --frozen-lockfile --ignore-scripts && chmod -R a+rX /app/package.json /app/node_modules`, `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`.
   - `FROM base AS renderer`: `COPY --chown=pwuser:pwuser tools ./tools`, `RUN chmod -R a+rX /app/tools`, `CMD ["node", "/app/tools/render.mjs"]`.
   - `FROM renderer AS studio` (final/default stage): `COPY --chown=pwuser:pwuser examples ./examples`, `RUN mkdir -p .relay-scratch temp`, `ENV STUDIO_HOST=0.0.0.0 STUDIO_PORT=4173`, `EXPOSE 4173`, `CMD ["node", "tools/studio.mjs"]`.
   - *Inline verification:* Dockerfile instruction/stage audit + Docker build/run when daemon is healthy (or explicit `[Unverified — Docker daemon unavailable on host]` alongside mirror parity runs).

3. **Document headless container usage in `README.md`:**
   - Update the Docker paragraph under `### XYZ Studio (tools/studio.mjs): local browser front end` and add a concise `### Headless renderer container` subsection showing:
     - `docker build --target renderer -t xyz-renderer .`
     - `docker run --rm --memory=2g --cpus=1.5 --user "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/job:/work" -w /work xyz-renderer node /app/tools/render.mjs fixture.json --recipe design-intake --backend playwright --format png,html --out out`
     - Explicit note that `docker compose up --build` still targets the default `studio` stage (with `examples/`), and that `renderer` omits `examples/` and `tools/spike/output/` while keeping `/app/tools` and `/app/node_modules` world-readable for non-root UIDs.
   - *Inline verification:* run `FRONTDOOR.md` read-only check block (must print empty output, including relative link verification).

4. **Update `CHANGELOG.md` and run final verification + smoke checks:**
   - Add a concise `CHANGELOG.md` entry per `PROJECT/PDDA.md`.
   - Execute all items in *Bounded Test Scope*, write receipts under `TESTS-RESULTS/2026-11-25+GH-102/`, and run Final Codex Relay QA on the committed diff and evidence.

## QA Gates

- **Pre-implementation Plan QA:** Codex relay review in `relay-system/2026-11-25/gh102-plan-qa.md` must reach `STATUS: Approved` before implementation edits begin.
- **Final Implementation QA:** Codex relay review in `relay-system/2026-11-25/gh102-final-qa.md` must reach `STATUS: Approved` on the committed diff, smoke receipts, and qualification results before PR publication.

## Verification Results

- Detailed receipts: [`TESTS-RESULTS/2026-11-25+GH-102/README.md`](../../TESTS-RESULTS/2026-11-25+GH-102/README.md) and [`provenance.jsonl`](../../TESTS-RESULTS/2026-11-25+GH-102/provenance.jsonl).
- **Passed on host:** `pnpm install --frozen-lockfile --ignore-scripts` (`320 ms`), `pnpm test` (`4 canaries in 31.3s`, budget `60s`), `utils/pdda/pdda.sh run` (`0 errors`), `FRONTDOOR.md` deterministic read-only checks (empty output), `.dockerignore` catalog/payload audit (`24/24` `tools/*` pins and `39/39` `examples/*` pins retained; `tools/` = `4.81 MB`), `renderer` mirror smoke for Playwright (`png,html`) and Satori (`png,svg,html,html-inline`) from `cwd != engine` (`catalog.verified: true`, `verifyPublication.valid: true`), red control (removing `tools/recipes/design-intake.contract.md` flips `catalog.verified` to `false`), and `studio` sibling-stage mirror (`GET /`, Bootstrap assets, `POST /api/check` catalog `ok: true`, `POST /api/render` `200`).
- **Passed on live `linux/amd64` Docker (`ltvera-dev`, Docker `29.5.2` / BuildKit `v0.34.0`, 2026-11-25):** `docker build --target renderer` (`5.06 MB` BuildKit context transfer, `1.02 GB` image, `/app/tools` = `5.1M`, zero `examples/` or `tools/spike/output/`), headless `docker run --memory=2g --cpus=1.5 --user` Playwright (`2631 ms`, `verifyPublication` 6 files) and Satori (`1370 ms`, `verifyPublication` 8 files) plus arbitrary non-`/etc/passwd` UID `12345:12345` Playwright (all `validation.valid: true`, `fitting.fit: true`, `catalog.verified: true`, non-root host ownership verified), default `CMD` clean exit `1`, `docker build` default `studio` (`1.25 GB`, `examples/2026-10-13-nutrition-infographic/DESIGN.md` retained while root `/app/DESIGN.md` excluded), and live `docker compose up -d --build` Studio smoke (`GET /` + Bootstrap assets `200`, `POST /api/check` catalog `ok: true`, `POST /api/render` `200` + `catalogVerified: true` across all 4 recipes).
