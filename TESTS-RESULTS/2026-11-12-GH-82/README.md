# GH-82 verification receipt — 2026-11-12

Manual checks for the public API (`tools/plugin-api.mjs`, `package.json` `exports`). No test was added
(`test-budget.json`: 4 canaries). All runs used a disposable full clone of the task branch at
`5fffa8b` (`git clone --no-local`, `pnpm install --frozen-lockfile`), Node v22.22.3, pnpm 12.4.1, macOS.
HEAD was identical before and after the runs; the clone's only untracked content was the local harness copy.

| Check | Command | Observed | Verdict |
|---|---|---|---|
| Existing suite | `pnpm test` | `test-budget: PASS — 4 canaries in 42.0s (budget 60s)`, fail 0 | Pass |
| Document gate | `utils/pdda/pdda.sh run` | `no errors, 35 warning(s)`; GH-82 warnings are only `issue #82 state unavailable (gh absent/offline)`; the rest also appear on `main` or are offline issue-state lookups | Pass |
| Main path | scratch consumer with `"xyz-layout-engine": "link:<verify clone>"`, `pnpm install`, `node main.mjs` (imports both names by package name, launches and closes Chromium, screenshots, calls `publishForReview('gh82-smoke', ['smoke.png'])`) | `main: launched + closed Chromium; review -> <verify clone>/REVIEW/gh82-smoke`; folder holds `smoke.png` and `review.json`; exit 0 | Pass |
| Adjacent path: deep import blocked | same consumer, `import('xyz-layout-engine/tools/render.mjs')` | `deep: ERR_PACKAGE_PATH_NOT_EXPORTED` | Pass |
| Red control: unchanged engine | same `main.mjs`, consumer linked to a checkout at base `4e08148` | `ERR_MODULE_NOT_FOUND` (`Cannot find package ...`) | Rejects unchanged candidate |
| Real consumer | a scratch copy of an external module, its single engine seam switched from file-path imports to `export { launchPlaywright, publishForReview } from 'xyz-layout-engine'`, rendering its 16×9 in page | rendered 4800×2700 px; PNG sha256 prefix `65a9bf7aa5507b68`, identical to the same page rendered through file-path imports | Pass |

Not run: `utils/pdda/pdda.sh doc-ready` LLM review (self-skips without `PDDA_LLM_BIN`).
