# Recon Map — landed PRs32/37
Commit: ab94133cf548a163fbf85647d185a9522900e4d0. Mode: direct source fallback (all82 graph projects checked; project unindexed). Lanes A/D in parent, B/E catalog reviewer, C/E recipe reviewer; all read-only apart from isolated controls.

## Subject and seams
- CLI tools/render.mjs:498 -> processRequest:175 -> normalizeRequest tools/request.mjs:30 -> fixed trusted recipe selection render:183 -> recipe.validate -> FONT/getFonts render:198 -> shared backends and fit loop:234 -> publishArtifacts:482 -> publishStaged:425.
- Recipe boundaries: mangajdm-promo.mjs:17 validation, :24 supplied artwork loader, :43 scene; recursive-process.mjs:8 vendored URL fonts, :36 validation, :69 fixed geometry. Entry calls through the library, render CLI, belief thin caller and tools/profile.mjs:55.
- State: request:103 sole fixture save with atomic rename; render:425 run publication + final manifest pointer; catalog.mjs:280 sole catalog/design-log owner with lock, history guard:238, generated dump:352, append:354. No persistent alternate writer introduced.
- Contracts: four fixed recipe identities/canvases, png/svg/html/html-inline with no PlaywrightSVG, local bounded file inputs/outputs, immutable catalog versions and designs. Existing output receipts and docs specify fit/fonts/provenance.
- Failure checks: C1 strict input/save/publication/offline/domain controls; C4 content/catalog/log/lock checks. The confirmed catalog log-append failure falls outside the existing C4 durability controls.
- DRY: canonical readBounded, validateFixtureShape, inspectPng and publisher reused. Manga local asset-loading orchestration repeats Solar; consolidation is deferred to a future recipe version rather than changing pinned1.0.0.

## Unknowns and limits
- No full-repo or cross-service audit. Review is scoped to six changed runtime JS files, their immediate consumers, both recipe modules/fixtures and persistence owner.
- HTTP/MCP are product targets; no claim of live end-to-end transport verification. Traced actual library/CLI/profiling and example consumers.
- Process/power-loss recovery and broad concurrent writer stress beyond existing C4 checks were not tested. Catalog append failure was injected in an isolated data root, not production.
- Human visual/brand/editorial approval remains pending.

## Experiments
- Fresh pnpm test:4/4 in37.8s unchanged60s.
- Direct recipe runs:8 fixture/backend records,28 formats;16 offlineHTML pages,0network;4Satori PNGs match committed goldens.
-11 invalid-input/domain controls pass.
- Two guard removals turn targeted assertions from exit0 to exit1; restore exact original source/assets; catalog verify valid.
- Catalog appendEACCES injection commits immutable row without log; duplicate retry refuses. Pre-existing from51b7a47; exact current lines352/354/358.
- ForeignCWD rendering succeeds; trailingnewline token refuses. Both suspected defects disproved.
- RELEASES/catalog checks valid. Plain full-clone PDDA0errors33governancewarnings; prior installed primary has9, due differing ignored runtime/legacy-reference availability, not changed governance sources.
