# Technical Spike Report: Porting Python Asset-Generation Scripts to JavaScript

## Overview
This spike investigates and proves the complete porting of the repository's Python asset-generation scripts to modern JavaScript (ESM, Node 22+). The primary architectural goal is separating pure, Web-Standard business logic (suitable for eventual browser/Vite/TanStack web applications and Edge Functions) from Node-specific OS and CLI subprocess adapters.

Existing Python scripts (`examples/2026-10-08-solar-system/generate-assets.py` and `examples/2026-10-09-cell-division/higgsfield-cli-spike.py`) remain 100% untouched and functional (`git diff -- '*.py'` is empty).

---

## Architecture & File Structure

```
tools/asset-gen-spike/
├── core/                        # Zero node:* dependencies (Web-Standard ESM)
│   ├── json.mjs                 # Strict JSON parsing, canonical key sorting, float parity, SHA-256
│   ├── redact.mjs               # Solar System & Higgsfield secret/URL/email redaction
│   ├── png.mjs                  # Pure Uint8Array PNG header inspector & ImageData alpha helper
│   ├── spend-gate.mjs           # Credit limits, balance calculation, ledger evaluation, gate rules
│   └── jobs.mjs                 # Solar System job definitions, strict admission, job digest
├── node/                        # Node 22 OS & CLI adapters
│   ├── lock.mjs                 # Fail-closed exclusive lockfile with pre-spawn intent registration
│   ├── generate-assets.mjs      # Port of generate-assets.py (reusing tools/spike/assets.mjs)
│   └── higgsfield-cli.mjs       # Port of higgsfield-cli-spike.py with 11/11 offline controls
├── verify.mjs                   # Standalone offline test suite (respects test-budget.json)
└── REPORT.md                    # Portability matrix and architectural findings
```

---

## Measured Parity & Verification Evidence

All verification passes offline via `node tools/asset-gen-spike/verify.mjs`:

1. **Zero `node:*` Imports in `core/`**:
   - Every module under `core/` depends strictly on Web Standards (`Uint8Array`, `DataView`, `TextEncoder`, `URL`, `crypto.subtle`).
   - Verified by static scan during `verify.mjs` (0 violations).

2. **Cross-Language Differential Parity with Python**:
   - `jobDigest` produces byte-for-byte identical SHA-256 hashes against `generate-assets.py`'s `job_digest` across all 13 Solar System jobs.
   - Preserves Python numeric serialization distinctions: distinguishing `1.0` (emitted as `1.0` via `pyFloat`) from `1` (emitted as `1`), signed negative zero `-0.0`, safe integers up to `9007199254740991`, and rejecting scientific notation exponents (e.g. `0.00001` / `1e-5` rejected per Python's `'e' in json.dumps(v).lower()`).
   - Key sorting order matches Python dictionary ordering across ASCII and Unicode characters.

3. **Higgsfield CLI Controls**:
   - All 11 offline controls in `selftest` pass (11/11 controls green).
   - Verifies spend cap refusal (`19.7 + 0.5 = 20.2` refused; `19.5 + 0.5 = 20.0` allowed), unusable cost/balance refusal (NaN, Infinity, non-numeric), balance lag accounting, ambiguous create fail-closed handling, process lockouts, background echo verification, resume pipeline, secret/email scrubbing, inspector alpha detection, and offline environment guards.

4. **Generator Recovery & Race Controls**:
   - Replicates all controls from `canaries.test.mjs:344-454` against `node/generate-assets.mjs`.
   - Verified resume with zero duplicate calls, unchanged dry-run, max-calls zero refusal, A->B->A lineage retention, corrupt output refusal, unresolved state refusal, Sun-first gating, signed-URL and unparseable leak scrubbing, and `neverDispatched` non-dispatch receipts.
   - **Deterministic Race Controls**: Synchronous pre-spawn `inFlightAttempts` intent registration prevents successor-unlinking races. Stale or ambiguous locks fail-closed (`concurrent manifest ownership; safely refusing`), requiring explicit operator reconciliation before retry.

---

## Lock Comparison: Node Lockfile vs POSIX `flock`

| Feature | Python (`fcntl.flock`) | Node Adapter (`node/lock.mjs`) |
| :--- | :--- | :--- |
| **Kernel Primitive** | POSIX kernel file table lock | File creation with `O_CREAT \| O_EXCL` (`wx` flag) |
| **FD Inheritance** | Held by kernel across child spawn via inherited file descriptor | Process-tracked metadata (`{ parentPid, childPids, inFlightAttempts }`) |
| **Parent Crash Window** | Kernel maintains lock if child inherits FD; released when last process closes FD | Synchronous pre-spawn registration of intent; stale locks fail-closed |
| **Successor Race Safety** | Automatic kernel cleanup when all descriptors close | **Zero automatic unlinking**: stale locks are never stolen automatically, eliminating the two-reclaimer race by design |
| **Portability** | Unix / POSIX only (fails on Windows without `msvcrt`) | Fully portable across POSIX, Windows, and containerized filesystems |

---

## Lovable Vite + TanStack Portability Matrix

When porting this functionality to a Lovable Vite + TanStack web application, the subsystems divide across the browser/server boundary as follows:

| Subsystem / Module | Browser / Client (Vite + React) | Edge Function / Node Server | Recommendation |
| :--- | :---: | :---: | :--- |
| **`core/json.mjs`** |  Yes |  Yes | Runs natively in any modern browser via standard Web APIs. |
| **`core/redact.mjs`** |  Yes |  Yes | Zero dependencies, pure regex and string parsing. |
| **`core/png.mjs`** |  Yes |  Yes | Header inspection uses `Uint8Array`; alpha inspection uses `ImageData`. |
| **`core/spend-gate.mjs`** |  Yes |  Yes | Pure ledger arithmetic and gate verification. |
| **`core/jobs.mjs`** |  Yes |  Yes | Job descriptors, digest computation, and pure validation. |
| **`tools/recipes/*.mjs`** |  Yes |  Yes | Pure layout descriptors (grids, type hierarchy, proportions). |
| **SVG Generation (`satori`)** |  Yes |  Yes | `satori` runs in browser environments using standard WASM yoga. |
| **Raster Rendering (`@resvg/resvg-js`)** | ⚠️ Partial |  Yes | `@resvg/resvg-js` is a native Node addon. In the browser, swap to `@resvg/resvg-wasm` or render via `<canvas>` / `OffscreenCanvas`. |
| **Subprocess Execution (`node/`)** | ❌ No |  Yes | Browser cannot spawn CLI binaries. Host CLI runners in Supabase Edge Functions or backend API endpoints. |
| **SQLite Catalog (`tools/catalog.mjs`)** | ❌ No |  Yes | Browser uses TanStack Query caching and Supabase Postgres / REST API instead of local SQLite. |
| **Visual Regression (`playwright`)** | ❌ No |  Yes | CI/Node test runner only; not part of production web runtime. |
