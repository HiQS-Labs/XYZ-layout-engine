---
gh_issue: 50
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50
title: "Optional transparent WebP artwork; switch the belief-reference diagram to WebP"
goal: "Let a trusted recipe opt into pinned transparent WebP artwork, and render the belief-reference diagram from WebP, without silently dropping artwork on the Satori PNG path."
status: "Implemented and verified; final Codex QA next"
created: 2026-10-14
updated: 2026-10-14
owner: Claude
doc_type: feedback
branch: feat/XYZ-layout-engine-gh50-webp-artwork-2026-10-14
effort: 2
complexity: 2
risk: 2
phases: 1
non_goals:
  - WebP as a render output format (render.webp)
  - Converting other recipes or examples to WebP
  - Upgrading resvg or adding a WebP decoder or any npm dependency
  - Removing the existing PNG artwork files
---

# GH-50 — Optional transparent WebP artwork

## Status

| What was just completed | What's next |
|---|---|
| Plan QA Approved (round 3). Steps 1–7 implemented (`bdf4e6f` + evidence commit); all acceptance checks and seven red controls pass. | Final Codex relay QA on the committed diff; then push and open the PR against `main`. |

## Observed problem

The engine reads pinned recipe artwork only as PNG: `readPinnedPngs` in `tools/request.mjs:31`
resolves `assets/web/<id>.png`, validates it with `inspectPng` (`tools/spike/assets.mjs:10`), checks
its SHA-256 against the provenance file and returns a `data:image/png` URL. The compact HTML export
extracts only `image/png`, `image/svg+xml` and `font/ttf` data URLs (`tools/render.mjs:346-348`), and
refuses anything else as `unsupported offline asset`.

Probes on base `ed56529` (Node v22.22.3, darwin-arm64), using the 256×256 `examination` artwork:

- Satori 0.36.0 embeds `data:image/webp` in its SVG unchanged.
- `@resvg/resvg-js` 2.6.2 (newest stable; only 2.7.0 alphas exist) **silently drops WebP**: the PNG
  painted 9,346 pixels, both lossless and lossy WebP painted 0, and none of the three raised an error.
- Chromium (Playwright 1.64.0) decodes the lossless WebP (`cwebp 1.6.0 -lossless -exact`) with the
  same alpha as the PNG (9,347 painted pixels, equal alpha sum). RGB bytes after canvas readback are
  not byte-identical, so v6 render digests will differ from v5.

Operator decision (2026-10-14): WebP + Chromium PNG. Satori PNG must refuse, not silently drop.

## Preflight bet check

- **Outcome sought:** a recipe can ship smaller transparent artwork (the six assets drop from about
  216 KB as PNG; lossless WebP is roughly 40% smaller on the probe asset) while keeping the same
  pinning and safety guarantees, and the latest diagram uses it.
- **Smallest viable bet:** an optional `format` argument on the existing reader, a WebP header check
  next to it, one more MIME in the HTML asset extractor, and one renderer refusal. Only
  `recursive-process` opts in.
- **Alternatives rejected:** PNG twins for the Satori raster (operator declined: two formats to pin
  and keep in sync); upgrading resvg (no stable release supports WebP); a decoder dependency (sharp)
  violates the no-dependency rule; WebP as an output format answers a different question.
- **Rollback / containment:** a selective source rollback, not a whole-PR revert. Restore the v5
  `recursive-process.mjs`, the `readPinnedPngs` call, and the PNG declaration set in `catalog.mjs`
  together, and publish the restored module as a new version through the CLI (the module version must
  move forward; 5.0.0 is not reusable). Keep `catalog.sql`'s 6.0.0 rows, `design-log.jsonl`, the v6
  design's artifact `renders-v6/playwright/render.png` and the `.webp` files it hashes, because
  `catalog.mjs:219-222` checks every retained design artifact and import refuses removing history
  (`catalog.mjs:237-249`). Then run `node tools/catalog.mjs verify`. The engine-level WebP support
  (R1-R4) can stay; it is inert without a WebP recipe. Reversibility: **Easy** for source; the
  catalog publication is durable history (as for every prior version).

## Requirements and design

R1. **Opt-in WebP reader.** Extend `readPinnedPngs(example, provenance, ids, format = 'png')` in
`tools/request.mjs`. `format` is `'png'` or `'webp'` (anything else throws). For `'webp'` it resolves
`assets/web/<id>.webp`, validates with a new `inspectWebp(bytes, budget)`, compares SHA-256 against
`proof.assets[id].webp.sha256`, and returns `data:image/webp;base64,…`. Realpath containment, the
5 MiB per-asset budget and the aggregate byte/pixel budget are shared, not copied. The name stays
`readPinnedPngs`: renaming it would edit `nutrition.mjs` and `solar-system.mjs`, which are pinned
catalog modules, and force unrelated version bumps.

R2. **`inspectWebp` lives in `tools/request.mjs`, not `tools/spike/assets.mjs`.** `assets.mjs` is a
declared catalog file of the nutrition, solar-system and recursive-process recipes
(`tools/catalog.mjs:124-146`); `request.mjs` is declared only by recursive-process. Contract (narrow,
like `inspectPng`'s v1 subset): `RIFF` size field equals file length − 8; form type `WEBP`; first chunk
is either `VP8X` with the alpha flag set (canvas width/height from its 24-bit fields + 1) or `VP8L`
with signature `0x2f` and the alpha-is-used bit set (14-bit dims + 1). Plain `VP8` (no alpha) is
refused as `requires transparent WebP`. Dimensions obey the existing 8192 / `LIMITS.assetPixels`
limits and feed the same aggregate budget. It does not decode pixels; Chromium is the decoder.

R3. **HTML boundaries (two owners, extended together).** (a) The `toHtml` source allowlist at
`tools/render.mjs:111` accepts `data:image/webp;base64,…` and `assets/<sha256>.webp` in its existing
anchored regex; this is the path `renderPlaywright` (`toDocument`, line 143) and both HTML exports use.
(b) The compact-export extractor regex and extension map at `tools/render.mjs:352-355` gain
`image/webp → webp`, so compact HTML writes `assets/<sha256>.webp`. (c) The three existing publication
asset-name checks admit `webp` in their extension alternatives, keeping every anchor, digest, file and
containment check: `publishStaged` staged-asset check (`render.mjs:443`), `verifyPublication` manifest
path check (`render.mjs:477`) and `publishArtifacts` artifact identity check (`render.mjs:495`).
External or other sources stay rejected. A full sweep of PNG/SVG-only literals in `tools/render.mjs`,
`tools/request.mjs` and `tools/profile.mjs` found these six render sites plus `profile.mjs:14`, whose
asset-timing category also gains `webp` (profiling label only). The remaining `png` literals are the
render output format itself (`render.png`, resvg/screenshot raster), which this issue does not change.

R4. **Satori PNG refusal.** In `processRequest`'s Satori branch, when `raster` is true and the built
scene contains a `data:image/webp` source, throw
`invalid('backend', 'WebP artwork is not rasterized by Satori/resvg; use --backend playwright for PNG')`
before rendering. Satori SVG/HTML/HTML-inline remain allowed. The check lives in the renderer (the one
owner of backend behaviour), not in the recipe, so any future WebP recipe gets it.

R5. **Diagram switch.** `examples/2026-10-12-belief-reference/assets/web/<id>.webp` for the six IDs,
converted from the existing pinned display PNGs with `cwebp -lossless -exact` (operator tool, not a
runtime dependency). `provenance.json` gains a `webp: {path, width, height, bytes, sha256, converter}`
entry per asset beside `display`. `recursive-process.mjs` passes `'webp'`, bumps to **6.0.0** (major:
the Satori PNG output is now refused, a narrower capability), and its header comment says WebP.
`tools/catalog.mjs` declares the six `.webp` files for recursive-process instead of the `.png` files.
Publish 6.0.0 through `node tools/catalog.mjs publish`; earlier versions' rows stay untouched.

R6. **Evidence and docs.** Render v6 into `renders-v6/` (Playwright `png,html,html-inline`; Satori
`svg,html,html-inline`), write `verification-v6.json` in the v5 shape, add a "Version 6" section to the
example README, update `SHA256SUMS`, and record a new catalog design pinned to `recursive-process@6.0.0`
and `renders-v6/playwright/render.png`. Root README: the current recursive-process example
(`README.md:61-64`) becomes `recursive-process@6.0.0` with WebP artwork and two commands, Playwright
`png,html,html-inline` and Satori `svg,html,html-inline` (no single command can do both: Satori
refuses WebP PNG and Playwright rejects SVG at `request.mjs:94`); the current-identity list at
`README.md:77` names 6.0.0 and moves 5.0.0 to history; "Capabilities and Limits" gains one line on
optional WebP artwork and the Satori PNG limit. Historical v3-v5 replay instructions in the example
README stay tied to their source commits. `CHANGELOG.md` entry.

## Blast radius

- `tools/request.mjs`: reader used by nutrition, solar-system and recursive-process. Default `'png'`
  keeps the first two byte-for-byte on the same code path; their pinned declared files do not change.
- `tools/render.mjs`: not a catalog-declared file. The extractor change is additive; the refusal only
  fires when a scene carries WebP, which today only recursive-process 6.0.0 does.
- `tools/catalog.mjs`, `tools/catalog.sql`, `tools/design-log.jsonl`: through the CLI only.
- Open PR #43 also bumps `recursive-process` (to 5.0.1) and edits `catalog.sql`, `render.mjs` and
  `request.mjs`. Whichever lands second rebases and re-publishes; no overlap in the edited lines of
  `request.mjs` (its recipe list vs our reader) or `render.mjs` (its recipe dispatch vs our allowlist
  and extractor). It also touches `canaries.test.mjs`, `README.md` and `CHANGELOG.md`; include those
  in the rebase.

## Ordered implementation with inline verification

1. R2 + R1 in `tools/request.mjs`. Verify: render nutrition and solar-system (Satori, `png,svg`) and
   compare digests against the same command on `ed56529`; they must match.
2. R3 (a)-(c) + R4 in `tools/render.mjs`; `webp` in the `tools/profile.mjs:14` asset category.
3. R5 assets + provenance: convert six PNGs, record hashes, confirm each `.webp` passes `inspectWebp`
   and `node examples/2026-10-09-cell-division/inspect-alpha.mjs` reports `real_alpha: true`.
4. R5 recipe + catalog declaration, bump to 6.0.0, `node tools/catalog.mjs publish recursive-process 6.0.0`,
   then `node tools/catalog.mjs verify` and `export --check` (exit 0).
5. Update the existing GH-36 block of canary C1 (`tools/spike/test/canaries.test.mjs:263-287`): Satori
   renders `svg,html,html-inline` and a separate assertion requires the valid fixture's Satori `png`
   to reject with `/use --backend playwright/`; Playwright keeps `png,html,html-inline`; both keep
   `assertOfflineExport`, which proves WebP images load offline in compact and inline HTML. The
   `rpReject` helper (line 280) switches from `format: 'png'` to `format: 'svg'` so its non-fit and
   unsupported-font controls still reach their original errors instead of the new refusal; all its
   assertions stay unchanged. No new `test()` block, file, dependency or budget change.
   Red controls (manual, recorded): (a) with R4 removed, the Satori PNG assertion fails; (b) with
   R3(a) removed, Playwright PNG fails `only embedded trusted images`; with R3(b) removed, compact
   HTML fails `unsupported offline asset`; with each R3(c) allowance removed in turn, compact export
   fails at that boundary (`invalid artifact identity/digest`, `unexpected staged asset`,
   `invalid artifact path`); (c) a tampered `.webp` byte fails `webp digest mismatch`;
   (d) a plain lossy-no-alpha `VP8` file fails `requires transparent WebP`.
6. R6 renders, evidence, docs, design record. Inspect the Playwright PNG at full size and a 420px
   thumbnail (AS-10): all six illustrations present, transparent edges, no halo against `#f5f3ec`.
7. Gates: `pnpm test` (4 tests, 1 file, ≤ 60 s), `node tools/catalog.mjs verify`, `utils/pdda/pdda.sh run`.

## Acceptance map

| Requirement | Check |
|---|---|
| R1/R2 | Step 1 digests unchanged; step 5 controls (c) and (d); step 4 verify |
| R3 | Playwright PNG renders; both complete exports publish through the CLI and pass `verifyPublication`; C1 `assertOfflineExport` on Satori and Playwright compact and inline HTML; control (b) |
| R4 | C1 Satori PNG rejection; control (a) |
| R5 | catalog verify/show 6.0.0 lists six `.webp`; inspect-alpha `real_alpha: true` |
| R6 | `verification-v6.json`, `shasum -a 256 -c SHA256SUMS`, AS-10 visual inspection |
| No new deps/tests | `package.json`/lockfile unchanged; test budget unchanged |

## Test scope and non-scope

In scope: one edit to the existing C1 block plus manual red controls recorded in this doc. Not in
scope: a WebP fuzzer, a decoder-based pixel validator, cross-browser checks, a new test file or CI.
`inspectWebp` is a header validator only, and it bounds every header read before touching dimension
fields. Ordinary rendering does not prove a WebP body decodes; that evidence comes from committed-asset
validation (inspect-alpha `real_alpha: true`, step 3) and C1's offline check (`naturalWidth > 0`,
`canaries.test.mjs:39-46`).

## Rating rationale (2026-10-14)

`rated 55/20/50/60` (pri/sev/appeal/effort). Severity 20: a feature, no defect or data risk today.
Priority 55: operator requested it now; nothing blocked on it. Appeal 50: neutral (no explicit
operator score). Effort 60: about a day; small edits in three engine files plus evidence regeneration.
Recurrence: not applicable (feature); no prior WebP issues or PRs (`gh` search 2026-10-14).

## Risks

- Satori-PNG users of `recursive-process` must add `--backend playwright` from 6.0.0. Mitigation: the
  refusal names the fix; v5 remains reproducible from its source commit.
- Chromium's WebP decode is assumed stable across Playwright versions; the C1 offline check would catch
  a regression.

## Implementation results (2026-10-14)

| Requirement | Result |
|---|---|
| R1/R2 | `inspectWebp` + opt-in `readPinnedPngs(..., 'webp')` in `tools/request.mjs`. Nutrition and solar-system Satori PNG/SVG digests identical to `ed56529`. Controls (c) tamper → `webp digest mismatch`, (d) plain VP8 → `requires transparent WebP`. |
| R3 | Six render.mjs sites plus `profile.mjs:14`. Both v6 exports publish through the CLI and pass `verifyPublication` (14 files each); removing each allowance fails at its own boundary. |
| R4 | Satori PNG refuses with `use --backend playwright for PNG` for WebP image sources only (final QA B1 fix `3a90608`); WebP-looking label text in a PNG-only scene still rasterizes; removing the guard renders silently (the defect). |
| R5 | Six lossless WebP files (128,652 vs 221,372 bytes), all `real_alpha: true`; `recursive-process@6.0.0` published; catalog `verify` valid, `export --check` canonical. |
| R6 | `renders-v6/`, `verification-v6.json`, example and root README, `SHA256SUMS` (75 entries OK), design `2026-10-14-belief-reference-webp`, CHANGELOG. AS-10: full-size and 420px Chromium PNG inspected, artwork present, no halo; 13,142 / 2,144,000 pixels differ from v5 by ≤ 1/255. |
| Tests | Existing C1 GH-36 block edited; `pnpm test` 4/4 in 41 s; budget unchanged; no dependency change. |

Evidence: `relay-system/2026-10-14/gh50-verification/controls.md`.
