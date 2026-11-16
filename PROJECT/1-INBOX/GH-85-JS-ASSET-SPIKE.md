---
gh_issue: 85
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/85
title: "Spike: port Python asset-generation scripts to JavaScript in a new folder for eventual Lovable Vite TanStack use"
goal: "Port the active Python asset-generation scripts to ESM JavaScript in a new folder (preserving existing .py files) with a runtime-agnostic core for future Lovable Vite TanStack integration."
owner: Antigravity
status: "Active — technical spike plan in review"
updated: 2026-11-16
created: 2026-11-16
doc_type: spike
reversibility: "Easy — additive new folder tools/asset-gen-spike/, docs, and offline verification script; existing Python scripts, tests, and catalog are untouched."
---

# GH-85 · JS Asset-Generation Spike (Lovable Vite TanStack Portability)

Capture of [#85](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/85). The live issue holds the high-level scope and stays the discussion surface.

## Status

| What was just completed | What's next |
|---|---|
| Provisioned fresh clone on `feat/XYZ-layout-engine-gh85-js-asset-spike-2026-11-16`, completed recon of Python asset scripts (`generate-assets.py`, `higgsfield-cli-spike.py`, `higgsfield-spike.py`) and `tools/` Node dependencies. | Codex plan QA (`relay-system/2026-11-16/gh85-plan-qa.md`), then build `tools/asset-gen-spike/` and run offline parity + Vite-portability verification. |

## Asks

- Port the active Python asset-generation scripts to JavaScript (ESM) in a **new folder** (`tools/asset-gen-spike/`) without replacing or deleting the existing Python scripts yet.
- Structure the JS port for eventual use in a **Lovable Vite + TanStack** app (pure runtime-agnostic ESM core separate from Node CLI/filesystem/subprocess adapters).
- Document parity, lock/runtime tradeoffs, and what remains Node/server-side vs browser/Vite-ready across `tools/`.

## Deferred / Out of Scope

- Replacing or deleting `examples/2026-10-08-solar-system/generate-assets.py`, `examples/2026-10-09-cell-division/higgsfield-cli-spike.py`, or updating `tools/spike/test/canaries.test.mjs` to point at JS (deferred until spike acceptance).
- Porting `examples/2026-10-09-cell-division/higgsfield-spike.py` (REST API route is NO-GO for transparency per `SOP.md`; 0 of 12 alpha).
- Porting PDDA/XYZ-forge governance scripts (`utils/py/`, `utils/pdda/`, `.xyz/` — owned by `HiQS-Labs/XYZ-forge` per `AGENTS.md`).
- Building a live Vite/React UI or modifying `test-budget.json` / adding `*.test.mjs` files.

## Acceptance

- Pure ESM modules under `tools/asset-gen-spike/core/` contain zero `node:*` imports and pass an isolated zero-Node-builtin import/execution check.
- `tools/asset-gen-spike/node/generate-assets.mjs` reproduces `generate-assets.py` admission, `jobDigest` (cross-verified byte-for-byte against Python on all 13 Solar System jobs + references), manifest resume/lineage, signed-URL redaction, atomic writes, lockfile + orphaned-child protection, `--dry-run`, `--max-calls`, `--max-budget`, `--timeout`, `--run-timeout`, `--force-retry`, and PNG/alpha verification offline.
- `tools/asset-gen-spike/node/higgsfield-cli.mjs` reproduces `higgsfield-cli-spike.py` spend-gate (`cap`, `spent_by_balance`, `est_sum`), strict JSON finite-number parsing, secret/email scrubbing, exclusive lock, `init-ledger`, `run --dry-run`, and all 11 offline `selftest` controls.
- `node tools/asset-gen-spike/verify.mjs` passes all parity + red/green controls offline with exit 0.
- Existing Python files have zero diff (`git diff -- '*.py'` empty); `pnpm test` and `utils/pdda/pdda.sh run` pass with 0 errors.

## Rating (2026-11-16)

`rated 50/20/50/65` — pri 50: operator-requested technical spike now to unblock Lovable Vite TanStack portability; sev 20: no defect in existing local Python scripts, gap is Python runtime dependency blocking JS-only web/edge stacks; appeal 50: neutral (no operator score supplied); effort 65: bounded additive spike (~1.3k LOC across two active Python scripts ported cleanly into pure core + Node adapters + offline verifier + report). Recurrence: none (0 prior issues/PRs in repo history for JS port of Python scripts).

## Plan

**Observed (base `e100f57`).**
- Core layout/rendering (`tools/render.mjs`, `tools/request.mjs`, `tools/recipes/*.mjs`, `tools/intake.mjs`, `tools/craft-lint.mjs`) is already Node ESM, but uses `node:fs`, `node:crypto`, `node:zlib`, `node:child_process`, `node:sqlite` (`tools/catalog.mjs`), `@resvg/resvg-js` (native addon), and `playwright`.
- Remaining product Python scripts are:
  1. `examples/2026-10-08-solar-system/generate-assets.py` (393 LOC): HiQS caller batch runner with strict job admission, `job_digest`, `manifest.json` atomic updates, `fcntl.flock` + FD inheritance across caller subprocess, URL query redaction, PNG + transparency verification (via `@resvg/resvg-js` + `tools/spike/assets.mjs`). Tested by `tools/spike/test/canaries.test.mjs` lines 343–454.
  2. `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (894 LOC): Higgsfield CLI transparent PNG runner with credit spend gate (`CAP_CREDITS = 20.0`), strict finite JSON parsing, JSONL ledger, email/JWT/Bearer/query redaction, `fcntl.flock`, `init-ledger`, and 11 offline `selftest` controls.
  3. `examples/2026-10-09-cell-division/higgsfield-spike.py` (916 LOC): historical REST API probe, NO-GO per `SOP.md`.

**Outcome sought.**
A standalone, zero-new-dependency ESM folder `tools/asset-gen-spike/` proving 1:1 behavioral parity with both active Python scripts while isolating pure Web-Standard business logic (`core/`) from Node CLI/OS bindings (`node/`) so a Lovable Vite + TanStack app (or Supabase Edge Function) can directly import `core/` and see the exact boundary for the remaining `tools/` modules.

**Smallest viable bet.**
1. `tools/asset-gen-spike/core/` (zero `node:*` imports; Web Crypto `crypto.subtle`, `TextEncoder`, `Uint8Array`/`DataView`, `URL`, `fetch`):
   - `json.mjs`: `parseStrictJson` (rejects non-finite tokens like `NaN`/`Infinity`, oversized/unsafe inputs), `canonicalJson` (sorted object keys matching Python `json.dumps(..., sort_keys=True, separators=(',',':'))`), `sha256Hex` (async Web Crypto SHA-256).
   - `redact.mjs`: `redactUrls`, `redactSecrets`, `redact`, `scrubObj`, `urlNoQuery`, `hasEmail`, `receiptText` (parity with both Python redactors, idempotent).
   - `png.mjs`: pure `Uint8Array` + `DataView` CRC32 table + PNG signature/IHDR/tRNS/IDAT/IEND structural validator (zero `node:zlib`, zero `Buffer`) plus browser-compatible `inspectAlphaFromImageData` helper (for Vite `OffscreenCanvas` / `ImageData`).
   - `spend-gate.mjs`: `creditsOf`, `gateAllows`, `spendTotal`, `baselineCredits`, `estSumOf`, `planLedgerRows`, `checkHiggsfieldJob`, `goEligible`, `jobFields`.
   - `jobs.mjs`: `SOLAR_SYSTEM_SUBJECTS`, `SOLAR_SYSTEM_JOBS`, `admitJobs` (exact validation rules, parameter/reference bounds, Sun-first invariant), `jobDigest`, `neverDispatched`, `validateManifestMap`.
2. `tools/asset-gen-spike/node/` (thin Node 22 ESM CLI/OS adapters):
   - `lock.mjs`: exclusive non-blocking lockfile (`O_CREAT | O_EXCL` via `fs.openSync(..., 'wx')`) storing `{ parentPid, childPids }` so both active parent runs and orphaned child caller processes block concurrent runs (including `--force-retry`) until all recorded PIDs exit, while safely detecting dead PIDs with zero native addons.
   - `generate-assets.mjs`: CLI & exportable runner porting `generate-assets.py` (`--max-calls`, `--max-budget`, `--timeout`, `--run-timeout`, `--max-attempts`, `--max-workers`, `--force-retry`, `--dry-run`, `--caller`, `--assets-dir`, `--jobs`), reusing `@resvg/resvg-js` + `core/png.mjs` for PNG pixel transparency verification, and `detached: true` process-group `SIGKILL` on timeout.
   - `higgsfield-cli.mjs`: CLI & exportable runner porting `higgsfield-cli-spike.py` (`selftest`, `run [--dry-run] [--only L]`, `init-ledger`, `--ledger`, `--raw-dir`, offline guard `HIGGSFIELD_CLI_SPIKE_OFFLINE=1` + `HIGGSFIELD_CLI_SPIKE_FAKE_DIR`, `inspect-alpha.mjs` integration).
3. `tools/asset-gen-spike/verify.mjs` (offline verification runner; not named `*.test.mjs` and not in a `test/` dir so `test-budget.json` stays untouched):
   - Pure-ESM check: confirms zero `node:*` imports in `core/*`.
   - Cross-language parity check: compares `core/jobs.mjs` `jobDigest` outputs against `generate-assets.py` `job_digest` on the 13 Solar System jobs and reference fixtures.
   - Generator recovery controls: runs every control from `canaries.test.mjs` lines 344–454 against `node/generate-assets.mjs` (resume, unchanged dry-run, max-calls 0, A->B->A lineage, corrupt output, unknown/in-flight refuse, Sun-first gate, concurrent lock, orphaned child lock, timeout kill + no blind retry, missing output, reference snapshot + invalidation, broken/symlinked manifest, unsafe/exponent numbers, recipeRef mismatch, signed-URL redaction, unparseable leak redaction, `neverDispatched`).
   - Higgsfield CLI controls: runs `node tools/asset-gen-spike/node/higgsfield-cli.mjs selftest` (all 11 controls) and asserts `11/11 controls passed`.
4. `tools/asset-gen-spike/REPORT.md`: documents parity evidence, Node lock tradeoff vs POSIX `flock`, and the Lovable Vite + TanStack portability matrix for all `tools/` modules (`core/*` + `tools/recipes/*` + `satori` in browser vs `@resvg/resvg-wasm` vs Edge/Node boundary for `playwright`, `node:sqlite` catalog, and CLI callers).

**Not built.** Removing or editing existing `.py` files, modifying `canaries.test.mjs` or `test-budget.json`, adding npm dependencies, porting REST NO-GO `higgsfield-spike.py`, porting PDDA `utils/py/`, or scaffolding a Vite app.

**Alternative rejected.** Replacing `generate-assets.py` and `higgsfield-cli-spike.py` in-place immediately or writing monolithic Node-only `.mjs` clones: violates the user's explicit instruction ("Don't replace the Python files yet, create the JS in a new folder") and fails to isolate browser/Vite-portable logic from Node OS adapters.

**Rollback.** Delete `tools/asset-gen-spike/` and `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md`. Zero impact on existing runtime or tests.

**Acceptance (falsifiable).**
- Main path: `node tools/asset-gen-spike/verify.mjs` exits 0 with all parity, purity, generator recovery, and 11/11 Higgsfield selftest controls green.
- Adjacent path: `node tools/asset-gen-spike/node/generate-assets.mjs --caller <stub> --assets-dir <tmp> --dry-run --max-calls 13` plans 13 calls without writing manifest/prompts, and `--max-calls 0` refuses exit 4; `node tools/asset-gen-spike/node/higgsfield-cli.mjs selftest` exits 0 with `11/11 controls passed`.
- Repo invariants: `git diff -- '*.py'` is empty; `pnpm test` passes 4/4 canaries within 60s; `utils/pdda/pdda.sh run` passes with 0 errors.
