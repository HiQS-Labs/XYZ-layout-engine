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

## Unverified container checks (Docker daemon unavailable on host)

`docker info` exited 1 on the execution host (`Cannot connect to the Docker daemon` on both the default
Colima socket and `desktop-linux`). Accordingly, actual container-runtime execution is explicitly recorded as
unverified here rather than inferred from mirror runs:

- `[Unverified — Docker daemon unavailable on host]` `docker build --target renderer -t xyz-renderer .`
- `[Unverified — Docker daemon unavailable on host]` `docker run --rm --memory=2g --cpus=1.5 --user "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/job:/work" -w /work xyz-renderer node /app/tools/render.mjs ...` (Linux arbitrary non-`pwuser` UID permissions and `/ms-playwright` launch)
- `[Unverified — Docker daemon unavailable on host]` `docker build -t xyz-studio .` and `docker compose up --build` (default `studio` stage image build and container startup)

Not run: `utils/pdda/pdda.sh doc-ready` LLM review (self-skips without `PDDA_LLM_BIN`).
