# GH-1 Phase 0 renderer spike — evidence and decision

Umbrella: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/1
Plan: `PROJECT/2-WORKING/GH-1-RENDERER-SPIKE.md` · PRD: `PROJECT/2-WORKING/SPECS-PRD.md` §5.3, §7.6, §10
Evidence directory: `tools/spike/output/` (regenerate with `pnpm run spike:render`, gate with `pnpm run spike:verify`)

Every number below is read from the delivered `tools/spike/output/measurements.json` and `tools/spike/output/runtime.json` (`generatedAt` 2026-10-09T00:16:57.399Z; a fresh `spike:render` rewrites both files and the timing figures will move by a few milliseconds) (commit of Phase 2 approval: see `relay-system/2026-10-08/gh1-spike-p2-postbuild.md`, STATUS Approved after three Codex review rounds). Where a claim could not be measured, it says so.

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
| Font | Inter Regular 4.0, OFL-1.1, sha256 `64f8be6e…1123` | `tools/spike/assets/SOURCES.md`, verifier constant |
| Transitive (satori) | yoga-layout 3.2.1 MIT · harfbuzzjs 0.10.0 MIT · @shuding/opentype.js 1.4.0-beta.0 MIT · linebreak 1.1.0 MIT | `runtime.dependencies.transitive` |

Package licences are read from each installed manifest at render time (`provenance` is the realpath of the manifest); a lookup that fails is recorded as unverified and fails the gate. MPL-2.0 is file-level copyleft and within the PRD exception; the resvg binding ships a prebuilt binary that is not modified here. No GPL/AGPL string appears in any recorded licence. Open licence item for the operator: review Chrome for Testing's terms and chrome://credits before the browser path ships (the Satori path has no such dependency).

## 3. Timings (milliseconds; `performance.now`)

| Backend | Cold (one-off) | Warm stage: min / median / max over 10 samples (after 1 warmup) | Stage boundary |
|---|---|---|---|
| Satori + resvg | 152.7 total (72.4 dynamic import + wasm init, 74.8 first layout+raster) | 25.5 / 26.5 / 27.7 | `satori()` layout + resvg rasterize + PNG encode, nutrition 1000×1000 |
| Playwright/Chromium | 425.7 total (launch + context + first page+screenshot 103.7) | 66.8 / 68.8 / 72.1 | setContent + fonts.ready + geometry evaluate + screenshot (clip) on a running browser and context; page create/close excluded |

Limits of these numbers: one machine, one fixture, single process, no concurrency. They are not a p95 or an SLA (PRD §10 targets stay hypotheses). Both cold numbers are backend initialization inside an already-running Node process: the static `@resvg/resvg-js` and `playwright` imports happen at module load before any timer. Fresh-process startup was not measured.

## 4. Memory

| Backend | Observed | Limitation |
|---|---|---|
| Satori + resvg | Node process rss ≈ 270 MB, heapUsed ≈ 65 MB after the warm loop | Same process also holds the Playwright client and prior render buffers; not a per-render delta |
| Playwright/Chromium | Node process rss ≈ 276 MB, heapUsed ≈ 65 MB | Chromium RSS could not be observed: `Browser.process()` is unavailable in Playwright 1.64.0's API surface, so renderer/GPU memory is unmeasured here |

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

Fitting outcomes: baseline, prescribed long-copy override, and hero all fit at iteration 0 in both backends (`cases.*.*.fitting.iterations = 0`, `unresolved = []`). The override wrapped the headline to two lines and the long item caption to three lines in both backends without clipping (Chromium `lineCount = 3` for `item_1_caption`; Satori box 210×66 at 18 px). One Chromium-only capability worth keeping: its scroll/client metrics can expose a glyph box exceeding its line box (`text.*.scrollMetrics`), which Satori's element-box hook cannot see. In the delivered hero case the headline records `scrollHeight = clientHeight = 154` at `line-height: 1.2`; no overflow of that kind is present in the delivered evidence.

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

Agent assessment, not human acceptance: both baseline PNGs reproduce the reference's hierarchy (headline/subtitle, central leaf-and-glow, two upper callouts, four lower items with captions, four-item benefits panel, footer banner) with readable text, no clipping, and no unintended overlap (verifier-checked). The two backends are broadly similar but not pixel-identical: element positions differ by whole pixels (for example `item_1_caption` y = 772 in Satori vs 774 in Chromium; override `hero_img` y = 262 vs 264.5), and text anti-aliasing differs. Fidelity gaps versus the reference are both artwork and composition: the hand-authored vector illustrations are deliberately simple placeholders; the benefits panel is a horizontal bottom strip where the reference uses a vertical side panel; the reference's callouts carry body copy and icons that the fixture does not. **Human visual acceptance remains pending** (operator review of artwork); this report does not grant it.

## 9. Proposed resource limits (rationale from measurements above)

| Limit | Proposed default | Basis |
|---|---|---|
| Input scene JSON | ≤ 256 KiB | The 1000×1000 fixture plus inline data-URL assets is < 20 KiB; 256 KiB leaves 10× headroom for richer recipes |
| Illustration assets | ≤ 1 MiB per asset, ≤ 8 MiB per render, SVG or PNG only | Inline SVG data URLs here are < 1 KiB each; data URLs inflate 4/3; keep total well under the 16 MB artifact ceiling |
| Output size | ≤ 4096×4096 px, ≤ 16 MiB PNG | Spike outputs are ≤ 134 KB at 1000×1000 and 1200×630 |
| Render time | 5 s soft / 30 s hard per request (Satori); 10 s / 60 s (Chromium) | Observed medians 26.5 ms and 68.8 ms; >100× headroom covers cold starts (152.7 ms / 425.7 ms) and larger scenes |
| Fitting iterations | 10 | Plan-prescribed cap; all cases fit at 0 |
| Memory | Satori worker 512 MiB; Chromium worker 1 GiB (placeholder, unmeasured) | Node rss ≈ 276 MB observed; Chromium RSS unmeasured, so its number is a placeholder to be measured in Phase 1 |
| Concurrency | Satori: one render per event-loop task, N workers = cores; Chromium: pool of 2–4 contexts per browser | Not measured; proposed from stage costs, to be validated under load before remote acceptance |

These are targets derived from one-machine observations, to be frozen only after Phase 1 measurements on the deployment hardware (PRD §10).

## 10. Recommendation

**Default backend: Satori → resvg-js.** Reasons, in order: (1) it passed every mandatory check (English text, baseline/long-copy/hero fitting, exact canvas, determinism, labeled geometry); (2) warm render median is 26.5 ms vs 68.8 ms for Chromium on this machine and needs no browser process; (3) it emits SVG, which Chromium cannot; (4) its geometry hook (`onNodeDetected`) is sufficient for fitting and constraint validation as PRD §5.1 requires.

**Keep Playwright/Chromium as the recipe-declared fallback** for scripts the pinned fonts do not cover and for CSS beyond Satori's subset, exactly as PRD §7.6 already proposes. It also passed every mandatory check, so this is a choice on cost and portability, not capability.

Known gaps carried into Phase 1: fitting's shrink path was never exercised (every case fit at iteration 0), so it is implemented but untested; Satori needs explicit fallback fonts for non-Latin scripts; glyph-ink overflow is invisible to Satori's hook (use conservative line-height defaults); Chromium memory is unmeasured; the `globalThis.__dirname` shim for Satori 0.36.0's ESM loader must be revisited when the dependency is bumped.

Selection status: `measurements.selection.status = "candidates"` with both backends eligible. Human artwork acceptance: pending.
