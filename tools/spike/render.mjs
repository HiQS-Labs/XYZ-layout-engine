// Phase 2 spike renderer: renders the same scene tree through Satori+resvg and Chromium (Playwright),
// collects backend-owned geometry/text evidence, runs a bounded fitting loop, probes script support,
// times warm/cold stages, and writes tools/spike/output/{*.png,satori.svg,measurements.json,runtime.json}.
//
// Scope guard: this is evidence collection for a backend decision, not an engine. No layout or font
// metrics are computed here; every number comes from the backend under test.
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { Resvg } from '@resvg/resvg-js';
import { chromium } from 'playwright';
import { createScene, createHeroScene, NUTRITION_TEXT_IDS, HERO_TEXT_IDS, NUTRITION_CONTAINMENT, HERO_CONTAINMENT, DEFAULT_SIZES } from './scene.mjs';
import { getFont } from './assets.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Source limitation (observed, satori 0.36.0): the ESM bundle's wasm loader reads the CommonJS
// global `__dirname`; without this shim `import('satori')` throws ERR_AMBIGUOUS_MODULE_SYNTAX on Node 22.
globalThis.__dirname = HERE;

const OUT = path.join(HERE, 'output');
const require = createRequire(import.meta.url);
const RENDER_DEADLINE_MS = Number(process.env.SPIKE_RENDER_DEADLINE_MS || 240_000);
const FIT_MAX_ITERATIONS = 10;
const FIT_SHRINK = 0.9;
const WARM_SAMPLES = 10;
const FONT_FAMILY = 'Inter';
const SCRIPT_PROBES = [
  { id: 'english', text: 'Fuel your day', mandatory: true },
  { id: 'latin_accented', text: 'café' },
  { id: 'cjk', text: '营养' },
  { id: 'emoji', text: '⚡' }
];

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const round = n => Math.round(n * 100) / 100;
const rect = r => ({ x: round(r.x ?? r.left), y: round(r.y ?? r.top), width: round(r.width), height: round(r.height) });
const right = r => r.x + r.width;
const bottom = r => r.y + r.height;
const containedIn = (inner, outer, tol = 0.5) =>
  inner.x >= outer.x - tol && inner.y >= outer.y - tol && right(inner) <= right(outer) + tol && bottom(inner) <= bottom(outer) + tol;
const pngSize = buf => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) });

// ---------------------------------------------------------------- Satori + resvg --------------
let satori;
async function loadSatori() {
  const t0 = performance.now();
  ({ default: satori } = await import('satori'));
  return performance.now() - t0;
}

async function renderSatori(scene, font, width, height) {
  const nodes = [];
  const missingSegments = [];
  const t0 = performance.now();
  const svg = await satori(scene, {
    width, height,
    fonts: [{ name: FONT_FAMILY, data: font, weight: 400, style: 'normal' }],
    onNodeDetected: n => nodes.push(n),
    // Fires once per text segment the pinned font cannot cover. Returning [] provides no fallback
    // font, so the observation is: segment uncovered, glyphs not supplied by the pinned font.
    loadAdditionalAsset: async (languageCode, segment) => { missingSegments.push({ languageCode, segment }); return []; }
  });
  const tLayout = performance.now();
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
  const t1 = performance.now();
  const bounds = {};
  const textBoxes = {};
  for (const n of nodes) {
    const id = n.props?.id;
    if (!id) continue;
    bounds[id] = rect(n);
    if (typeof n.textContent === 'string') textBoxes[id] = { ...rect(n), text: n.textContent };
  }
  return { svg, png, bounds, textBoxes, missingSegments, satoriMs: round(tLayout - t0), resvgMs: round(t1 - tLayout), stageMs: round(t1 - t0) };
}

// ---------------------------------------------------------------- Chromium (Playwright) --------
function cssValue(k, v) {
  const unitless = new Set(['fontWeight', 'lineHeight', 'flex', 'opacity', 'zIndex']);
  return typeof v === 'number' && !unitless.has(k) ? `${v}px` : v;
}
function toHtml(node) {
  if (node == null || node === false) return '';
  if (typeof node === 'string') return node.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (Array.isArray(node)) return node.map(toHtml).join('');
  const { type, props } = node;
  const style = Object.entries(props.style || {})
    .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${cssValue(k, v)}`)
    .join(';');
  const attrs = Object.entries(props)
    .filter(([k]) => k !== 'children' && k !== 'style')
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
  if (type === 'img') return `<img ${attrs} style="${style}">`;
  return `<${type} ${attrs} style="${style}">${toHtml(props.children)}</${type}>`;
}
function toDocument(scene, font, width, height) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'${FONT_FAMILY}';src:url(data:font/ttf;base64,${font.toString('base64')})}
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
h1,h2,p{margin:0}span,div,p,h1,h2{display:flex}
</style></head><body>${toHtml(scene)}</body></html>`;
}

async function renderPlaywright(context, scene, font, width, height) {
  const page = await context.newPage();
  try {
    const t0 = performance.now();
    await page.setContent(toDocument(scene, font, width, height), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const evidence = await page.evaluate(({ family }) => {
      const canvasEl = document.getElementById('canvas');
      const bounds = {};
      const textBoxes = {};
      for (const el of document.querySelectorAll('[id]')) {
        const r = el.getBoundingClientRect();
        bounds[el.id] = { x: r.x, y: r.y, width: r.width, height: r.height };
        const ownText = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (ownText.length) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const tr = range.getBoundingClientRect();
          textBoxes[el.id] = {
            x: tr.x, y: tr.y, width: tr.width, height: tr.height,
            text: el.textContent,
            scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
            scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
            lineCount: range.getClientRects().length
          };
        }
      }
      const fontCheck = document.fonts.check(`16px '${family}'`);
      return {
        bounds, textBoxes, fontLoaded: fontCheck,
        document: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight },
        canvas: canvasEl ? { scrollWidth: canvasEl.scrollWidth, scrollHeight: canvasEl.scrollHeight } : null
      };
    }, { family: FONT_FAMILY });
    const png = await page.screenshot({ clip: { x: 0, y: 0, width, height }, fullPage: false });
    const stageMs = round(performance.now() - t0);
    for (const k of Object.keys(evidence.bounds)) evidence.bounds[k] = rect(evidence.bounds[k]);
    for (const [k, v] of Object.entries(evidence.textBoxes)) evidence.textBoxes[k] = { ...rect(v), text: v.text, scrollWidth: v.scrollWidth, clientWidth: v.clientWidth, scrollHeight: v.scrollHeight, clientHeight: v.clientHeight, lineCount: v.lineCount };
    return { png, ...evidence, stageMs };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------- Text fitting evidence -------
// Text overflow is judged only from backend-reported boxes: the laid-out text box must stay inside its
// allocated region (nearest labeled ancestor box) and the canvas. Chromium adds scroll/client metrics.
function textEvidence(backend, result, textIds, containment, canvas) {
  const parentOf = {};
  for (const [p, kids] of Object.entries(containment)) for (const k of kids) parentOf[k] = p;
  const out = {};
  for (const id of textIds) {
    const box = result.textBoxes[id];
    if (!box) { out[id] = { present: false }; continue; }
    const region = result.bounds[parentOf[id]] || canvas;
    const insideRegion = containedIn(box, region);
    const insideCanvas = containedIn(box, canvas);
    let overflow = !insideRegion || !insideCanvas;
    const detail = { present: true, text: box.text, box: rect(box), region: rect(region), insideRegion, insideCanvas };
    if (backend === 'playwright') {
      detail.scrollOverflow = box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1;
      detail.scrollMetrics = { scrollWidth: box.scrollWidth, clientWidth: box.clientWidth, scrollHeight: box.scrollHeight, clientHeight: box.clientHeight };
      detail.lineCount = box.lineCount;
      overflow = overflow || detail.scrollOverflow;
    }
    detail.overflow = overflow;
    out[id] = detail;
  }
  return out;
}
const overflowingIds = ev => Object.entries(ev).filter(([, d]) => d.present && d.overflow).map(([id]) => id);

// Bounded fitting: shrink only the overflowing text ids by FIT_SHRINK per iteration, at most
// FIT_MAX_ITERATIONS re-renders. Iteration 0 is the unmodified render. Reports failure explicitly.
async function fitCase(backend, renderFn, buildScene, textIds, containment, width, height) {
  const canvas = { x: 0, y: 0, width, height };
  let sizes = {};
  const steps = [];
  let result = await renderFn(await buildScene(sizes));
  let ev = textEvidence(backend, result, textIds, containment, canvas);
  let bad = overflowingIds(ev);
  steps.push({ iteration: 0, sizes: { ...sizes }, overflowing: bad });
  for (let i = 1; i <= FIT_MAX_ITERATIONS && bad.length; i++) {
    for (const id of bad) sizes[id] = round((sizes[id] ?? DEFAULT_SIZES[id] ?? 18) * FIT_SHRINK);
    result = await renderFn(await buildScene(sizes));
    ev = textEvidence(backend, result, textIds, containment, canvas);
    bad = overflowingIds(ev);
    steps.push({ iteration: i, sizes: { ...sizes }, overflowing: bad });
  }
  return { result, evidence: ev, fit: bad.length === 0, iterations: steps.length - 1, steps, finalSizes: sizes, unresolved: bad };
}

// ---------------------------------------------------------------- Runtime facts ---------------
function pkgInfo(name) {
  const p = require(`${name}/package.json`);
  return { name: p.name, version: p.version, license: p.license, provenance: `node_modules/${name}/package.json#license` };
}
function processRssKb(pid) {
  if (!pid) return null;
  try { return Number(execFileSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8' }).trim()) || null; } catch { return null; }
}
function stats(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  return { samples: arr.map(round), min: round(s[0]), median: round(s[Math.floor(s.length / 2)]), mean: round(mean), max: round(s[s.length - 1]) };
}

// ---------------------------------------------------------------- Main -----------------------
async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const fixture = JSON.parse(await fs.readFile(path.join(HERE, 'fixture.json'), 'utf8'));
  const heroFixture = JSON.parse(await fs.readFile(path.join(HERE, 'hero-fixture.json'), 'utf8'));
  const font = await getFont();
  const { width: W, height: H } = fixture;
  const { width: HW, height: HH } = heroFixture;

  const runtime = {
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version, platform: process.platform, arch: process.arch, osRelease: os.release(),
      cpu: os.cpus()[0]?.model || 'unknown', cpuCount: os.cpus().length, totalMemoryBytes: os.totalmem()
    },
    dependencies: {
      satori: pkgInfo('satori'),
      resvg_js: pkgInfo('@resvg/resvg-js'),
      resvg_native_binding: (() => { try { return pkgInfo(`@resvg/resvg-js-${process.platform}-${process.arch}`); } catch (e) { return { error: e.message }; } })(),
      playwright: pkgInfo('playwright'),
      transitive: ['yoga-layout', 'harfbuzzjs', '@shuding/opentype.js', 'linebreak'].map(n => { try { return pkgInfo(n); } catch { return { name: n, error: 'not resolvable from spike root' }; } }),
      chromium: null,
      font: { file: 'tools/spike/assets/font.ttf', family: 'Inter Regular 4.0', license: 'OFL-1.1', provenance: 'tools/spike/assets/SOURCES.md' }
    },
    licenseNotes: [
      'satori and @resvg/resvg-js (JS wrapper and the darwin-arm64 native binding) are MPL-2.0; MPL-2.0 is within the PRD exception. The binding bundles the resvg Rust crate (MPL-2.0) as a prebuilt .node binary; no source modification is made here.',
      'playwright is Apache-2.0; the downloaded Chromium build is BSD-3-Clause plus third-party notices shipped in the browser bundle (not vendored into this repo).',
      'Transitive satori dependencies listed above are MIT. Licenses are read from each package manifest at render time (provenance field), not inferred from other releases.'
    ],
    units: { time: 'milliseconds (performance.now)', memory: 'bytes unless named *Kb (ps rss, kilobytes)' },
    stageBoundaries: {
      satori_cold: 'dynamic import("satori") + yoga wasm init + first satori() layout + first resvg render + PNG encode, same process, after the fixture/font were already read',
      satori_warm: 'satori() layout + resvg render + PNG encode for the nutrition scene; satoriMs/resvgMs split recorded per sample',
      playwright_cold: 'chromium.launch + newContext + newPage + setContent + fonts.ready + geometry evaluate + screenshot (clip to canvas) + page close',
      playwright_warm: 'newPage + setContent + fonts.ready + geometry evaluate + screenshot + page close on an already-launched browser and context',
      warmup: 'one unmeasured warm render per backend precedes the timed samples; ten samples are recorded; this is not a production p95'
    },
    memoryNotes: [
      'nodeProcess.* is process.memoryUsage() of this Node process (heapUsed = V8 heap, rss = resident set) and excludes Chromium.',
      'chromium.browserProcessRssKb is `ps -o rss` of the browser main process only; renderer/GPU child processes are not summed. It is an observable floor, not a total.'
    ],
    satori: {}, playwright: {}
  };

  const measurements = {
    generatedAt: runtime.generatedAt,
    fixture: { id: fixture.id, width: W, height: H },
    hero: { id: heroFixture.id, width: HW, height: HH },
    fitting: { maxIterations: FIT_MAX_ITERATIONS, shrinkFactor: FIT_SHRINK, knob: 'fontSize of overflowing text ids only' },
    override: {
      applied: {
        'sections.header.headline': 'Fuel your whole day with balanced nutrition and lasting energy',
        'sections.items[0].caption': 'Fresh whole foods, easy to carry, wherever your busy day takes you'
      }
    },
    svgExport: {
      satori: 'supported: satori emits SVG; written to output/satori.svg',
      playwright: 'unsupported: Chromium page.screenshot emits raster only; no vector export path exists in this backend'
    },
    cases: {}, probes: {}, digests: {}, capabilities: {}
  };

  const deadline = setTimeout(() => {
    console.error(`render: deadline of ${RENDER_DEADLINE_MS}ms exceeded; aborting`);
    process.exit(2);
  }, RENDER_DEADLINE_MS);
  deadline.unref?.();

  let browser = null;
  try {
    // ---- Satori cold
    const tColdS = performance.now();
    const importMs = await loadSatori();
    const baseScene = await createScene(fixture);
    const firstS = await renderSatori(baseScene, font, W, H);
    runtime.satori.cold = { totalMs: round(performance.now() - tColdS), importMs: round(importMs), firstStageMs: firstS.stageMs };

    // ---- Playwright cold
    const tColdP = performance.now();
    browser = await chromium.launch({ headless: true });
    runtime.dependencies.chromium = { version: browser.version(), source: 'playwright-managed download', license: 'BSD-3-Clause (Chromium) + bundled third-party notices' };
    let context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const firstP = await renderPlaywright(context, baseScene, font, W, H);
    runtime.playwright.cold = { totalMs: round(performance.now() - tColdP), firstStageMs: firstP.stageMs, fontLoaded: firstP.fontLoaded };

    const backends = {
      satori: { render: (scene, w = W, h = H) => renderSatori(scene, font, w, h) },
      playwright: { render: (scene, w = W, h = H) => renderPlaywright(context, scene, font, w, h) }
    };

    // ---- Cases: baseline, override, hero — each with bounded fitting evidence
    const overrideFixture = structuredClone(fixture);
    overrideFixture.sections.header.headline = measurements.override.applied['sections.header.headline'];
    overrideFixture.sections.items[0].caption = measurements.override.applied['sections.items[0].caption'];

    const caseDefs = [
      { name: 'baseline', build: sizes => createScene(fixture, sizes), ids: NUTRITION_TEXT_IDS, containment: NUTRITION_CONTAINMENT, w: W, h: H, file: b => `${b}.png` },
      { name: 'override', build: sizes => createScene(overrideFixture, sizes), ids: NUTRITION_TEXT_IDS, containment: NUTRITION_CONTAINMENT, w: W, h: H, file: b => `override-${b}.png` },
      { name: 'hero', build: sizes => createHeroScene(heroFixture, sizes), ids: HERO_TEXT_IDS, containment: HERO_CONTAINMENT, w: HW, h: HH, file: b => `hero-${b}.png` }
    ];
    for (const c of caseDefs) {
      measurements.cases[c.name] = {};
      for (const [b, be] of Object.entries(backends)) {
        if (b === 'playwright' && (c.w !== W || c.h !== H)) { await context.close(); context = await browser.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 }); }
        const fit = await fitCase(b, scene => be.render(scene, c.w, c.h), c.build, c.ids, c.containment, c.w, c.h);
        const png = fit.result.png;
        await fs.writeFile(path.join(OUT, c.file(b)), png);
        if (b === 'satori' && c.name === 'baseline') await fs.writeFile(path.join(OUT, 'satori.svg'), fit.result.svg);
        measurements.cases[c.name][b] = {
          png: `output/${c.file(b)}`, pngSize: pngSize(png), sha256: sha256(png),
          bounds: fit.result.bounds, text: fit.evidence,
          fitting: { fit: fit.fit, iterations: fit.iterations, finalSizes: fit.finalSizes, unresolved: fit.unresolved, steps: fit.steps },
          missingFontSegments: fit.result.missingSegments ?? undefined,
          documentOverflow: b === 'playwright' ? { scrollWidth: fit.result.document.scrollWidth, scrollHeight: fit.result.document.scrollHeight, canvas: fit.result.canvas, overflows: fit.result.document.scrollWidth > c.w || fit.result.document.scrollHeight > c.h } : undefined
        };
        if (b === 'playwright' && (c.w !== W || c.h !== H)) { await context.close(); context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }); }
      }
    }

    // ---- Repeat renders (determinism) on the fitted baseline sizes
    for (const [b, be] of Object.entries(backends)) {
      const sizes = measurements.cases.baseline[b].fitting.finalSizes;
      const again = await be.render(await createScene(fixture, sizes));
      measurements.digests[b] = {
        baseline: measurements.cases.baseline[b].sha256,
        repeat: sha256(again.png),
        override: measurements.cases.override[b].sha256,
        deterministic: sha256(again.png) === measurements.cases.baseline[b].sha256,
        svgRepeat: b === 'satori' ? sha256(again.svg) === sha256((await fs.readFile(path.join(OUT, 'satori.svg')))) : undefined
      };
    }

    // ---- Script probes (capability observations, not assumptions)
    const probeScene = texts => ({
      type: 'div',
      props: { id: 'canvas', style: { display: 'flex', flexDirection: 'column', width: 600, height: 400, padding: 20, gap: 12, backgroundColor: 'white', fontFamily: FONT_FAMILY, fontSize: 40, color: '#111' },
        children: texts.map(p => ({ type: 'span', props: { id: `probe_${p.id}`, children: p.text } })) }
    });
    await context.close(); context = await browser.newContext({ viewport: { width: 600, height: 400 }, deviceScaleFactor: 1 });
    const sProbe = await renderSatori(probeScene(SCRIPT_PROBES), font, 600, 400);
    const pProbe = await renderPlaywright(context, probeScene(SCRIPT_PROBES), font, 600, 400);
    await fs.writeFile(path.join(OUT, 'probe-satori.png'), sProbe.png);
    await fs.writeFile(path.join(OUT, 'probe-playwright.png'), pProbe.png);
    // Chromium glyph-coverage evidence: canvas measureText with the pinned family vs a nonexistent
    // family (forcing system fallback). Equal advance widths mean the pinned font did not supply the
    // glyphs and Chromium fell back; the fallback face identity is not exposed by the DOM.
    const page = await context.newPage();
    let widths;
    try {
      await page.setContent(toDocument({ type: 'div', props: { id: 'canvas', children: '' } }, font, 10, 10));
      await page.evaluate(async ({ probes, family }) => { await document.fonts.load(`40px '${family}'`, probes.map(p => p.text).join('')); await document.fonts.ready; }, { probes: SCRIPT_PROBES, family: FONT_FAMILY });
      widths = await page.evaluate(({ probes, family }) => {
        const ctx = document.createElement('canvas').getContext('2d');
        const out = {};
        for (const p of probes) {
          ctx.font = `40px '${family}'`; const pinned = ctx.measureText(p.text).width;
          ctx.font = `40px '__no_such_font_xyz__'`; const fallback = ctx.measureText(p.text).width;
          out[p.id] = { pinnedFamilyWidth: pinned, fallbackOnlyWidth: fallback };
        }
        return out;
      }, { probes: SCRIPT_PROBES, family: FONT_FAMILY });
    } finally { await page.close(); }
    for (const p of SCRIPT_PROBES) {
      const missing = sProbe.missingSegments.filter(m => p.text.includes(m.segment));
      const w = widths[p.id];
      // Font coverage is a property of the pinned font file; satori's segmenter reports uncovered segments.
      // Chromium falls back per glyph to a system face it does not name, so its observation is split into
      // coverage (from the font) and rendering (from the page): equal pinned-vs-fallback advance widths
      // corroborate that the pinned face supplied none of the glyphs.
      const covered = missing.length === 0;
      const widthsDiffer = Math.abs(w.pinnedFamilyWidth - w.fallbackOnlyWidth) > 0.01;
      measurements.probes[p.id] = {
        text: p.text, mandatory: !!p.mandatory,
        satori: {
          observation: missing.length ? 'uncovered_by_pinned_font' : 'rendered_by_pinned_font',
          uncoveredSegments: missing,
          fallbackSupplied: false,
          consequence: missing.length ? 'glyphs not drawn (no fallback font provided via loadAdditionalAsset)' : 'none',
          textBox: sProbe.textBoxes[`probe_${p.id}`] ?? null
        },
        playwright: {
          observation: covered ? 'rendered_by_pinned_font' : 'rendered_via_system_fallback',
          pinnedFontCoverage: covered ? 'covered' : 'uncovered (segments listed under satori.uncoveredSegments; same font file)',
          measureText: { ...w, pinnedVsFallbackWidthsDiffer: widthsDiffer },
          fallbackIdentity: covered ? null : 'not exposed by DOM; Chromium substituted a system face per glyph',
          glyphsDrawn: (pProbe.textBoxes[`probe_${p.id}`]?.width ?? 0) > 0,
          textBox: pProbe.textBoxes[`probe_${p.id}`] ?? null
        }
      };
    }
    await context.close(); context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

    // ---- Warm timings: one warmup, ten samples, nutrition baseline
    const warmSceneS = await createScene(fixture, measurements.cases.baseline.satori.fitting.finalSizes);
    const warmSceneP = await createScene(fixture, measurements.cases.baseline.playwright.fitting.finalSizes);
    await renderSatori(warmSceneS, font, W, H);
    const sTimes = [], sSplit = [];
    for (let i = 0; i < WARM_SAMPLES; i++) { const r = await renderSatori(warmSceneS, font, W, H); sTimes.push(r.stageMs); sSplit.push({ satoriMs: r.satoriMs, resvgMs: r.resvgMs }); }
    runtime.satori.warm = { workload: 'nutrition baseline 1000x1000', ...stats(sTimes), split: sSplit };
    runtime.satori.memory = { nodeProcess: process.memoryUsage() };
    await renderPlaywright(context, warmSceneP, font, W, H);
    const pTimes = [];
    for (let i = 0; i < WARM_SAMPLES; i++) { const r = await renderPlaywright(context, warmSceneP, font, W, H); pTimes.push(r.stageMs); }
    runtime.playwright.warm = { workload: 'nutrition baseline 1000x1000', ...stats(pTimes) };
    runtime.playwright.memory = { nodeProcess: process.memoryUsage(), chromium: { browserProcessRssKb: processRssKb(browser.process?.()?.pid), pid: browser.process?.()?.pid ?? null, note: browser.process ? undefined : "Browser.process() unavailable in this Playwright build; Chromium RSS not observable here" } };

    // ---- Capability table + eligibility (a held backend is a recorded outcome, not a pass)
    for (const b of Object.keys(backends)) {
      const cases = measurements.cases;
      const englishOk = measurements.probes.english[b].observation === 'rendered_by_pinned_font';
      const cap = {
        englishReferenceText: englishOk,
        baselineFit: cases.baseline[b].fitting.fit,
        longCopyFit: cases.override[b].fitting.fit,
        heroFit: cases.hero[b].fitting.fit,
        heroCanvasExact: cases.hero[b].pngSize.width === HW && cases.hero[b].pngSize.height === HH,
        repeatDeterministic: measurements.digests[b].deterministic,
        labeledGeometry: Object.keys(cases.baseline[b].bounds).length > 0,
        textMeasurement: b === 'satori' ? 'onNodeDetected laid-out text element boxes (satori 0.36.0); glyph ink beyond the box is not separately observable' : 'Range.getBoundingClientRect + scroll/client metrics per text element',
        svgExport: measurements.svgExport[b],
        scripts: Object.fromEntries(SCRIPT_PROBES.map(p => [p.id, measurements.probes[p.id][b].observation]))
      };
      const mandatory = ['englishReferenceText', 'baselineFit', 'longCopyFit', 'heroFit', 'heroCanvasExact', 'repeatDeterministic', 'labeledGeometry'];
      cap.failedMandatory = mandatory.filter(k => cap[k] !== true);
      cap.eligibleForRecommendation = cap.failedMandatory.length === 0;
      cap.status = cap.eligibleForRecommendation ? 'eligible' : 'held';
      measurements.capabilities[b] = cap;
    }
    measurements.selection = (() => {
      const eligible = Object.entries(measurements.capabilities).filter(([, c]) => c.eligibleForRecommendation).map(([b]) => b);
      return eligible.length ? { status: 'candidates', eligible, note: 'Recommendation is written in Phase 3 REPORT.md from this evidence; human artwork acceptance remains pending.' } : { status: 'BLOCKED', eligible: [], note: 'No backend passed every mandatory check; do not select a backend.' };
    })();

    await fs.writeFile(path.join(OUT, 'measurements.json'), JSON.stringify(measurements, null, 2));
    await fs.writeFile(path.join(OUT, 'runtime.json'), JSON.stringify(runtime, null, 2));
    console.log(`render: wrote ${Object.keys(measurements.cases).length} cases x 2 backends, probes, digests to tools/spike/output/`);
    for (const [b, c] of Object.entries(measurements.capabilities)) console.log(`render: ${b}: ${c.status}${c.failedMandatory.length ? ' (' + c.failedMandatory.join(', ') + ')' : ''}`);
    console.log(`render: selection ${measurements.selection.status}${measurements.selection.eligible.length ? ': ' + measurements.selection.eligible.join(', ') : ''}`);
  } finally {
    clearTimeout(deadline);
    if (browser) await browser.close().catch(() => {});
  }
}

main().catch(err => {
  console.error('render: FAILED', err?.stack || err);
  process.exit(1);
});
