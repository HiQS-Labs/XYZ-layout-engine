# GH-102 verification receipt — 2026-11-25

Manual and automated checks for the lean multi-stage `Dockerfile` (`base` → `renderer` → `studio` default),
trimmed `.dockerignore`, and `README.md` headless container documentation. No test file, canary test, or CI
workflow was added (`test-budget.json`: 1 file, 4 tests, 60 s, 0 workflows; `FRONTDOOR.md` `FD-02`: no
`packageManager` in `package.json`).

All local checks ran inside the dissociated task clone on branch
`feat/XYZ-layout-engine-gh102-lean-renderer-docker-2026-11-25` (Node v22, `npx --yes pnpm@10` -> pnpm 10.34.9,
macOS).

## Verified checks (executed on host)

| Check | Command / Scope | Observed | Verdict |
|---|---|---|---|
| Frozen install without scripts | `npx --yes pnpm@10 install --frozen-lockfile --ignore-scripts` | `Done in 320ms using pnpm v10.34.9` (29 packages, zero lifecycle scripts executed) | Pass |
| Existing canary suite | `npx --yes pnpm@10 test` | `test-budget: PASS — 4 canaries in 31.3s (budget 60s)` (`1/1 files, 4/4 tests, 0/0 workflows`) | Pass |
| PDDA governance gate | `utils/pdda/pdda.sh run` | Exit 0 (`no errors, 35 warning(s) to review`; all warnings are pre-existing baseline warnings in `issue-doc-sync` and `governance`; 0 errors/0 warnings in `frontmatter`, `status-table`, `hardcoded-paths`, `roadmap-coverage`, `changelog`, `stale`, `marathon-qa`) | Pass |
| Front-door checks | `FRONTDOOR.md` deterministic read-only check block (`FD-01`..`FD-10`) | Empty stdout and empty stderr (`FD-02` clean, all `README.md` relative links valid) | Pass |
| `.dockerignore` & payload audit | Parse committed `.dockerignore` (36 rules) against repo tree and `tools/catalog.sql` | 24/24 `tools/*` catalog pins retained; 39/39 `examples/*` catalog pins retained; filtered `tools/` payload = 89 files / `4.81 MB`; `rendererHasExamples: false`, `rendererHasSpikeOutput: false`, `rendererHasDesignIntakeContract: true` | Pass |
| `renderer` mirror — main path (Playwright, `cwd != engine`) | Isolated `renderer` mirror (`package.json`, `pnpm-lock.yaml`, `node_modules` installed with `--ignore-scripts`, `.dockerignore`-filtered `tools/`, zero `examples/`, zero `tools/spike/output/`); `node <mirror>/tools/render.mjs` from separate `/work` `cwd` with `--recipe design-intake --backend playwright --format png,html` | Exit 0; `catalog.verified: true` (`design-intake@1.0.6`), `validation.valid: true`, `fitting.fit: true`, `verifyPublication: { valid: true, files: 6, bytes: 278231 }` | Pass (mirror) |
| `renderer` mirror — adjacent path (Satori, `cwd != engine`) | Same isolated `renderer` mirror and `/work` `cwd` with `--recipe design-intake --backend satori --format png,svg,html,html-inline` | Exit 0; `catalog.verified: true`, `validation.valid: true`, `fitting.fit: true`, `verifyPublication: { valid: true, files: 8, bytes: 720290 }` | Pass (mirror) |
| Red control — missing contract doc | Throwaway copy of `renderer` mirror with `tools/recipes/design-intake.contract.md` deleted; same `design-intake` render | `catalog.verified: false` (`missing/unreadable declared file`), proving the check detects accidental global `*.md` exclusion | Rejects broken candidate |
| `studio` sibling-stage mirror | Isolated `studio` mirror (`package.json`, `pnpm-lock.yaml`, `node_modules`, `.dockerignore`-filtered `tools/` + `examples/`, `.relay-scratch/`, `temp/`, zero governance dirs or `tools/spike/output/`); launched `node tools/studio.mjs` on ephemeral loopback port | `GET /` `200`, `GET /vendor/bootstrap.min.css` `200` (`232800 B`), `GET /vendor/bootstrap.bundle.min.js` `200` (`80721 B`), `POST /api/check` (`{"kind":"catalog"}`) `200` (`ok: true, errors: 0`), `POST /api/render` (`examples/2026-10-12-design-intake/fixture.json`) `200` (`118 ms`, `valid: true`, `catalogVerified: true`) | Pass (mirror) |

## Verified container checks (live `linux/amd64` Docker on `ltvera-dev`, 2026-11-25)

Executed against PR `#103` commit `5295e10a` on native `linux/amd64` (`Linux 6.1.0-56-cloud-amd64`, Docker `29.5.2`, BuildKit `v0.34.0`), closing the earlier local-host Docker daemon gap (all disposable containers/images removed after verification):

| Check | Command / Scope | Observed | Verdict |
|---|---|---|---|
| Lean `renderer` build & FS audit | `docker build --target renderer -t xyz-renderer .` | BuildKit context transfer `5.06 MB` (`0.1s`); image `1.02 GB` (`linux/amd64`), `/app/tools` = `5.1M`; `pwuser` = `1001:1001`; `tools/recipes/design-intake.contract.md` readable; `examples/`, `tools/spike/output/`, `PROJECT/`, `relay-system/`, `skills/`, `/app/README.md`, `/app/DESIGN.md`, `test-budget.json` all absent | Pass |
| `renderer` Playwright (`--user 1000:1003 -e HOME=/tmp`) | `docker run --rm --memory=2g --cpus=1.5 --user "$(id -u):$(id -g)" -e HOME=/tmp -v ...:/work -w /work ... --recipe design-intake --backend playwright --format png,html` | Exit `0` in `2631 ms`; `validation.valid: true`, `fitting.fit: true`, `catalog.verified: true` (`design-intake@1.0.6`), `verifyPublication: { valid: true, files: 6, bytes: 266693 }`; host `manifest.json` owned by `1000:1003` | Pass |
| `renderer` Satori (`--user 1000:1003 -e HOME=/tmp`) | Same container with `--backend satori --format png,svg,html,html-inline` | Exit `0` in `1370 ms`; `validation.valid: true`, `fitting.fit: true`, `catalog.verified: true`, `verifyPublication: { valid: true, files: 8, bytes: 720038 }` | Pass |
| `renderer` Playwright arbitrary non-`/etc/passwd` UID (`12345:12345`) | `docker run --rm --memory=2g --cpus=1.5 --user 12345:12345 -e HOME=/tmp ... --backend playwright --format png,html` | Exit `0`; `validation.valid: true`, `fitting.fit: true`, `catalog.verified: true`; host `manifest.json` owned by `12345:12345` (proves `a+rX` + `/ms-playwright` Chromium launch under unlisted UID) | Pass |
| `renderer` default `CMD` (no args) | `docker run --rm xyz-renderer` | Exits `1` cleanly: `Validation failed: [{"field":"inputPath","message":"missing input"}]` | Pass |
| Default `studio` build & FS audit | `docker build -t xyz-studio .` | Image `1.25 GB` (`linux/amd64`); `examples/2026-10-13-nutrition-infographic/DESIGN.md` and `tools/recipes/design-intake.contract.md` present; root `/app/DESIGN.md`, `/app/README.md`, `PROJECT/`, `relay-system/`, `skills/`, `tools/spike/output/`, `test-budget.json` absent | Pass |
| Live `docker compose up -d --build` Studio | Exact `compose.yaml` on `127.0.0.1:4173` | `GET /` `200`, Bootstrap CSS/JS + `app.js` + BarlowCondensed TTF `200`, `POST /api/check` (`catalog`) `200` (`ok: true`, `errors: []`), `POST /api/render` `200` (`valid: true`, `catalogVerified: true`) across all 4 recipes (`design-intake` PW `1541 ms`, `nutrition` Satori `1067 ms`, `solar-system` Satori `2710 ms`, `recursive-process` PW `839 ms`) | Pass |

Not run: `utils/pdda/pdda.sh doc-ready` LLM review (self-skips without `PDDA_LLM_BIN`).
