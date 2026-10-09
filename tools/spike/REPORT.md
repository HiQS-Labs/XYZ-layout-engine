# GH-1 Phase 0 renderer spike — evidence and decision

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1
Plan: `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` · PRD: `PROJECT/2-WORKING/SPECS-PRD.md` §5.3, §7.6, §10
Evidence directory: `tools/spike/output/` (regenerate with `pnpm run spike:render`, gate with `pnpm run spike:verify`)

Except where a figure is explicitly labelled as a development observation, every number below is read from the delivered `tools/spike/output/measurements.json` and `tools/spike/output/runtime.json` (`generatedAt` 2026-10-09T03:35:09.431Z; a fresh `spike:render` rewrites both files and the timing figures will move by a few milliseconds) (commit of Phase 2 approval: see `relay-system/2026-10-08/gh1-spike-p2-postbuild.md`, STATUS Approved after three Codex review rounds). Where a claim could not be measured, it says so.

Artwork revision (2026-10-09): the nutrition fixture and scene were rebuilt to match `PROJECT/2-WORKING/layout-engine-reference.png` — seven transparent illustrations generated with OpenAI gpt-image-2.5-flare using the reference as a style input, Inter Bold added for headings, hand-authored SVG benefit icons, and the reference's layout (flanking callouts, vertical benefits panel, footer pill). Current figures are from the post-revision render; the two development observations in §5 are labelled as such. Provenance: `tools/spike/assets/SOURCES.md`.

Provenance note: Phases 2 and 3 were built by the orchestrating Claude session after two agy builder attempts failed harness containment (probe scripts written off-lane; XYZ-forge #1001, #1002). Codex remained the independent reviewer throughout.

## 1. Commands and results

| Command | Exit | Decisive output |
|---|---|---|
| `pnpm install` (lockfile pinned) | 0 | `satori 0.36.0`, `@resvg/resvg-js 2.6.2`, `playwright 1.64.0` |
| `node tools/spike/render.mjs` | 0 | `render: satori: eligible` · `render: playwright: eligible` · `render: selection candidates: satori, playwright` |
| `pnpm run spike:verify` | 0 | `VERDICT: PASS` — Phase 1 + Phase 2 assertions hold |
| Red control: append 1 byte to `output/satori.png` | 1 | `VERDICT: FAIL` · `Basis: satori.png does not match the recorded digest` |
| Red control: set `capabilities.playwright.heroFit=false` | 1 | `VERDICT: FAIL` · `Basis: playwright: capability heroFit does not match evidence` |
| Red controls from Codex QA (forged held-but-eligible backend; text box moved off-region with stale flags; native licence record blanked; tampered probe PNGs; zero-size English layout box; hero document overflow with stale flag) | 1 each | each fails on a named assertion; receipts in the relay thread |
| `SPIKE_RENDER_DEADLINE_MS=1500 node tools/spike/render.mjs` | 2 | deadline fired, browser closed, 0 Chrome processes afterwards |
| Red control (2026-10-09): append 1 byte to `assets/generated/web/water_bottle.png` | 1 | `VERDICT: FAIL` · `Basis: generated/web/water_bottle.png digest not recorded in SOURCES.md` |
| `SPIKE_INJECT_FAILURE=1 node tools/spike/render.mjs` | 1 | injected failure after launch; `finally` closed the browser, 0 Chrome processes |

Both controls were restored and the gate re-run green before commit.

## 2. Environment

| Item | Value | Source |
|---|---|---|
| Hardware | Apple M1 Max, 10 cores, 64 GiB | `runtime.environment` |
| OS | Darwin 24.6.0 (`osRelease`), arm64 | `runtime.environment` |
| Node | v22.22.3 | `runtime.environment.node` |
| satori | 0.36.0, MPL-2.0 | `runtime.dependencies.satori` |
| @resvg/resvg-js | 2.6.2, MPL-2.0 (JS wrapper + `@resvg/resvg-js-darwin-arm64` 2.6.2 native binding, MPL-2.0) | `runtime.dependencies.resvg_js`, `.resvg_native_binding` |
| playwright | 1.64.0, Apache-2.0 | `runtime.dependencies.playwright` |
| Browser | Chrome for Testing 156.0.8078.4, Playwright revision 1248 (Google Chrome build, not bare Chromium). Bundle root carries only `ABOUT` ("Copyright Google LLC", credits at chrome://credits); third-party notices are not a readable file, so its licence status is **recorded as unverified for shipping** | `runtime.dependencies.chromium` |
| Fonts | Inter 4.0 Regular (sha256 `64f8be6e…1123`) and Bold (sha256 `0cb1bc13…0bc1`), OFL-1.1, same release archive | `tools/spike/assets/SOURCES.md`, verifier constant |
| Transitive (satori) | yoga-layout 3.2.1 MIT · harfbuzzjs 0.10.0 MIT · @shuding/opentype.js 1.4.0-beta.0 MIT · linebreak 1.1.0 MIT | `runtime.dependencies.transitive` |

Package licences are read from each installed manifest at render time (`provenance` is the realpath of the manifest); a lookup that fails is recorded as unverified and fails the gate. MPL-2.0 is file-level copyleft and within the PRD exception; the resvg binding ships a prebuilt binary that is not modified here. No GPL/AGPL string appears in any recorded licence. Open licence item for the operator: review Chrome for Testing's terms and chrome://credits before the browser path ships (the Satori path has no such dependency).

## 3. Timings (milliseconds; `performance.now`)

| Backend | Cold (one-off) | Warm stage: min / upper median (sorted index 5 of 10) / max over 10 samples (after 1 warmup) | Stage boundary |
|---|---|---|---|
| Satori + resvg | 267.6 total (68.2 dynamic import + wasm init, 191.5 first layout+raster) | 136.0 / 137.9 / 138.8 | `satori()` layout + resvg rasterize + PNG encode, nutrition 1000×1000 with seven inline PNG illustrations |
| Playwright/Chromium | 429.7 total (launch + context + first page+screenshot 274.9) | 256.9 / 260.9 / 262.8 | setContent + fonts.ready + geometry evaluate + screenshot (clip) on a running browser and context; page create/close excluded |

Raster illustrations dominate: before the artwork revision (earlier layout with hand-authored SVG art) the warm medians were 26.5 ms (Satori) and 68.8 ms (Chromium); both backends now decode about 2.9 MB of PNG per render. Limits of these numbers: one machine, one fixture, single process, no concurrency. They are not a p95 or an SLA (PRD §10 targets stay hypotheses). Both cold numbers are backend initialization inside an already-running Node process: the static `@resvg/resvg-js` and `playwright` imports happen at module load before any timer. Fresh-process startup was not measured.

## 4. Memory

| Backend | Observed | Limitation |
|---|---|---|
| Satori + resvg | Node process rss ≈ 472 MiB, heapUsed ≈ 133 MiB after the warm loop | Same process also holds the Playwright client and prior render buffers; not a per-render delta |
| Playwright/Chromium | Node process rss ≈ 662 MiB, heapUsed ≈ 276 MiB | Chromium RSS could not be observed: `Browser.process()` is unavailable in Playwright 1.64.0's API surface, so renderer/GPU memory is unmeasured here |

Treat memory as a floor for the Node side only. A production limit for the browser path needs a worker-level measurement (cgroup or `ps` on the launched PID), which this spike does not provide.

## 5. Geometry and text measurement (the layout-ownership gate, PRD §5.1)

| Capability | Satori | Playwright/Chromium |
|---|---|---|
| Labeled element bounds | Yes: `onNodeDetected` reports `left/top/width/height` and `textContent` per node with an `id` (satori 0.36.0) | Yes: `getBoundingClientRect` per `[id]` |
| Text extent evidence | The laid-out text element box (Yoga + Satori's own line breaking). Glyph ink beyond that box is not separately observable | `Range.getBoundingClientRect`, `scrollWidth/clientWidth`, `scrollHeight/clientHeight`, line-box count |
| Overflow judgement | Element box must lie inside its declared region and the canvas | Same, plus scroll-vs-client overflow |
| Bounded fitting | ≤10 re-renders, font-size only, unresolved ids reported | Same |
| Repeat determinism (PNG sha256) | Yes (`digests.satori.deterministic=true`; SVG also byte-stable) | Yes (`digests.playwright.deterministic=true`) |
| SVG export | Yes (`output/satori.svg`, 1000×1000 viewBox) | No: `page.screenshot` is raster-only; declared unsupported, not faked |

Fitting outcomes: baseline, prescribed long-copy override, and hero all fit at iteration 0 in both backends (`cases.*.*.fitting.iterations = 0`, `unresolved = []`). The override wraps the headline to three lines and the long item caption to four lines in both backends without clipping; the central leaf, sized `height: 100%` of the flexible middle row, shrinks from 518.0 px to 363.0 px (Satori; Chromium 518.5 → 363.5) so nothing overflows.

Two backend differences surfaced during the artwork revision and are kept as findings. Their numbers are **orchestrator development observations** from intermediate renders that were superseded by the fixes below; they are not in the delivered JSON (whose six acceptance cases all fit at iteration 0), and no intermediate evidence file was retained:

- **Line-height vs glyph box (Chromium only).** With Inter Bold at `line-height: 1.15`, Chromium reported `scrollHeight > clientHeight` on the headline; the fitting loop then shrank it from 50 px to 29.5 px (5 iterations; 21.5 px in the override) before rounding let it pass. Font-size fitting cannot cure a size-independent line-height ratio, so the loop degraded the design instead of fixing it. Satori's element-box hook cannot observe this overflow at all. Fixed by `line-height: 1.25` for headings; implication for Phase 1: fitting needs a line-height floor (or line-height as a fitting knob), not only font size.
- **Image stretch sizing.** An `<img>` with only a width and `align-self: stretch` filled the row in Chromium (518 px) but kept its intrinsic aspect height in Satori (480 px), which overlapped the bottom row in the override case; the verifier's overlap check failed the build. Explicit `height: 100%` resolves to the row height in both (delivered `hero_img` heights differ by at most 0.5 px). Implication: recipes must size images explicitly; do not rely on stretch semantics across backends.

One Chromium-only capability worth keeping: its scroll/client metrics expose glyph-box vs line-box excess (`text.*.scrollMetrics`), which is exactly how the first finding above was caught.

Conclusion for the gate: both backends expose enough authoritative geometry for fitting and constraint checks without a second layout engine. Satori's evidence is coarser (element boxes only); Chromium's is finer (ink-level scroll metrics) but comes with a browser.

## 6. Script and font capability (pinned Inter Regular 4.0)

| Script | Satori | Chromium |
|---|---|---|
| English ("Fuel your day") — mandatory | rendered by pinned font | rendered by pinned font (measureText 254.7 with Inter vs 222.2 fallback-only) |
| Accented Latin ("café") | rendered by pinned font | rendered by pinned font |
| CJK ("营养") | **uncovered**: `loadAdditionalAsset` fired for segment `营养` (`ja-JP|zh-CN|zh-TW|zh-HK`); no fallback supplied; `.notdef` placeholder boxes drawn (agent-observed in `probe-satori.png`) | rendered via system fallback (agent-observed readable glyphs in `probe-playwright.png`); Chromium substituted a system face per glyph, identity not exposed; measureText widths are corroboration only |
| Emoji ("⚡") | **uncovered** (`emoji` segment); placeholder box | rendered via system fallback (agent-observed) |

Implication: v1 English is supported by both. CJK and emoji are not v1 claims. Satori would need explicit fallback fonts via `loadAdditionalAsset` (adds font assets and license review); Chromium silently depends on host system fonts, which breaks reproducibility across machines unless fonts are pinned and system fallback is disabled.

## 7. Product-hero smoke

`tools/spike/hero-fixture.json` is a structured input (eyebrow, headline, tagline, price, CTA, separate `bottle` illustration) rendered at 1200×630 by both backends. Both PNGs are exactly 1200×630 (`cases.hero.*.pngSize`), no document overflow (Chromium `documentOverflow.overflows=false`), all five text ids fit at iteration 0. Visual: the two renders are near-identical; see `hero-satori.png` and `hero-playwright.png`.

## 8. Fidelity against the reference (agent visual assessment)

Agent assessment, not human acceptance: after the artwork revision both baseline PNGs follow the reference's composition closely — bold headline with leaf ornaments and subtitle; balanced-nutrition scale and skip-the-spike group flanking a large glowing leaf; four captioned items (jar, container, wrap, bottle); a vertical four-row benefits panel with icons; and a footer pill with tagline. Text is readable, unclipped and non-overlapping (verifier-checked). Cross-backend geometry (delivered bounds, 98 labelled boxes over baseline and override): median per-box difference 0.63 px, largest 3.58 px (`baseline` `header_headline`, width 597 vs 600.58); override `hero` y is 264 vs 262.5. The renders are visually similar; this is not a pixel-parity claim. Remaining differences from the reference: illustrations are drawn somewhat smaller with more whitespace than the reference; the headline uses Inter Bold rather than the reference's condensed display face; the leaf does not extend down into the bottom row as it does in the reference; benefit icons are flat SVG approximations; and the generated illustrations are close stylistic matches, not copies. **Human visual acceptance remains pending** (operator review of artwork); this report does not grant it.

## 9. Proposed resource limits (rationale from measurements above)

| Limit | Proposed default | Basis |
|---|---|---|
| Input fixture JSON | ≤ 256 KiB | The fixture references assets by id and is 1988 bytes. Note the resolved scene with inline data-URL images is ≈ 3.8 MB here, so limits must apply to fixture and assets separately |
| Illustration assets | ≤ 1 MiB per asset, ≤ 8 MiB per render, SVG or PNG only | Web-sized generated PNGs are ≤ 629 KiB each and 2.9 MB total for seven; full-size gpt-image originals are 1.3–2.2 MB and should be downscaled before use |
| Output size | ≤ 4096×4096 px, ≤ 16 MiB PNG | Largest spike PNG is 550,004 bytes (satori.png); satori.svg is 4.0 MB because it embeds the images |
| Render time | 5 s soft / 30 s hard per request (Satori); 10 s / 60 s (Chromium) | Observed warm medians 137.9 ms and 260.9 ms with raster art; cold 267.6 / 429.7 ms; >15× headroom on the slowest path |
| Fitting iterations | 10 | Plan-prescribed cap; all cases fit at 0 |
| Memory | Satori worker 512 MiB; Chromium worker 1 GiB (placeholder, unmeasured) | Node rss ≈ 662 MiB observed; Chromium RSS unmeasured, so its number is a placeholder to be measured in Phase 1 |
| Concurrency | Satori: one render per event-loop task, N workers = cores; Chromium: pool of 2–4 contexts per browser | Not measured; proposed from stage costs, to be validated under load before remote acceptance |

These are targets derived from one-machine observations, to be frozen only after Phase 1 measurements on the deployment hardware (PRD §10).

## 10. Recommendation

**Default backend: Satori → resvg-js.** Reasons, in order: (1) it passed every mandatory check (English text, baseline/long-copy/hero fitting, exact canvas, determinism, labeled geometry); (2) warm render median is 137.9 ms vs 260.9 ms for Chromium on this machine (raster artwork) and needs no browser process; (3) it emits SVG, which Chromium cannot; (4) its geometry hook (`onNodeDetected`) is sufficient for fitting and constraint validation as PRD §5.1 requires.

**Keep Playwright/Chromium as the recipe-declared fallback** for scripts the pinned fonts do not cover and for CSS beyond Satori's subset, exactly as PRD §7.6 already proposes. It also passed every mandatory check, so this is a choice on cost and portability, not capability.

Known gaps carried into Phase 1: fitting needs a line-height floor or knob (font size alone cannot cure line-height overflow); recipes must size images explicitly (stretch semantics differ); asset limits must separate fixture size from resolved data-URL size; the delivered acceptance cases never exercise fitting's shrink path (all fit at iteration 0); it was exercised only in the superseded development render described in §5, where it degraded the headline instead of fixing it; Satori needs explicit fallback fonts for non-Latin scripts; glyph-ink overflow is invisible to Satori's hook (use conservative line-height defaults); Chromium memory is unmeasured; the `globalThis.__dirname` shim for Satori 0.36.0's ESM loader must be revisited when the dependency is bumped.

Selection status: `measurements.selection.status = "candidates"` with both backends eligible. Human artwork acceptance: pending.
