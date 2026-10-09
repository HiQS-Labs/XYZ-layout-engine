// Phase 2 spike renderer: renders the same scene tree through Satori+resvg and Chromium (Playwright),
// collects backend-owned geometry/text evidence, runs a bounded fitting loop, probes script support,
// times warm/cold stages, and writes tools/spike/output/<YYYY-MM-DD>-<package name>/{*.png,*.html,satori.svg,measurements.json,runtime.json}.
//
// Scope guard: this is evidence collection for a backend decision, not an engine. No layout or font
// metrics are computed here; every number comes from the backend under test.
import fs from 'fs/promises';
import { readFileSync, realpathSync, readdirSync } from 'fs';
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
import { getFonts } from './assets.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Source limitation (observed, satori 0.36.0): the ESM bundle's wasm loader reads the CommonJS
// global `__dirname`; without this shim `import('satori')` throws ERR_AMBIGUOUS_MODULE_SYNTAX on Node 22.
globalThis.__dirname = HERE;

// All evidence for one render run goes in output/<local YYYY-MM-DD>-<package name>/; a same-day
// re-render overwrites that day's folder, earlier days' folders are left as they are.
const RUN_DATE = new Date().toLocaleDateString('en-CA');
const RUN_DIR = `${RUN_DATE}-${JSON.parse(readFileSync(path.join(HERE, '..', '..', 'package.json'), 'utf8')).name}`;
const OUT = path.join(HERE, 'output', RUN_DIR);
const rel = f => `output/${RUN_DIR}/${f}`;
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
let deadlineHit = false;
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
    fonts: [{ name: FONT_FAMILY, data: font.regular, weight: 400, style: 'normal' }, { name: FONT_FAMILY, data: font.bold, weight: 700, style: 'normal' }],
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
@font-face{font-family:'${FONT_FAMILY}';font-weight:400;src:url(data:font/ttf;base64,${font.regular.toString('base64')})}
@font-face{font-family:'${FONT_FAMILY}';font-weight:700;src:url(data:font/ttf;base64,${font.bold.toString('base64')})}
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
h1,h2,p{margin:0}span,div,p,h1,h2{display:flex}
</style></head><body>${toHtml(scene)}</body></html>`;
}

async function renderPlaywright(context, scene, font, width, height) {
  const page = await context.newPage();
  try {
    const t0 = performance.now();
    const html = toDocument(scene, font, width, height);
    await page.setContent(html, { waitUntil: 'load' });
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
    return { png, html, ...evidence, stageMs };
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
// Package manifests are read from the filesystem next to the package that depends on them (pnpm's
// strict layout does not expose transitive packages from the spike root, and "exports" maps block
// require('<pkg>/package.json')). A lookup that fails is recorded as such; it is never reported as read.
function nodeModulesAncestor(dir) {
  let d = dir;
  while (path.basename(d) !== 'node_modules') { const up = path.dirname(d); if (up === d) throw new Error(`no node_modules ancestor for ${dir}`); d = up; }
  return d;
}
function pkgInfo(name, hostName = null) {
  try {
    let manifest;
    if (hostName) {
      const hostDir = path.dirname(require.resolve(`${hostName}/package.json`));
      manifest = path.join(nodeModulesAncestor(hostDir), ...name.split('/'), 'package.json');
    } else {
      manifest = require.resolve(`${name}/package.json`);
    }
    const p = JSON.parse(readFileSync(manifest, 'utf8'));
    const rel = path.relative(path.dirname(HERE), realpathSync(manifest));
    return { name: p.name, version: p.version, license: p.license ?? null, verified: typeof p.license === 'string', provenance: `${rel}#license` };
  } catch (e) {
    return { name, version: null, license: null, verified: false, error: e.message };
  }
}
function chromiumInfo(browser) {
  // Playwright ships "Chrome for Testing", a Google Chrome build, not a bare Chromium build. Its
  // bundle root carries an ABOUT file pointing at chrome://credits; no standalone LICENSE/credits file
  // is present at the bundle root, so third-party notices are not vendored and are recorded as such.
  const info = { version: browser.version(), title: null, revision: null, license: null, verified: false, source: 'playwright-managed download' };
  try {
    const pwDir = path.dirname(require.resolve('playwright/package.json'));
    const core = path.join(nodeModulesAncestor(pwDir), 'playwright-core');
    const entry = JSON.parse(readFileSync(path.join(core, 'browsers.json'), 'utf8')).browsers.find(b => b.name === 'chromium');
    info.title = entry?.title ?? null; info.revision = entry?.revision ?? null; info.browserVersionPinned = entry?.browserVersion ?? null;
    const exe = chromium.executablePath();
    const bundleRoot = exe.slice(0, exe.indexOf('.app/')).replace(/\/[^/]*$/, '');
    const rootFiles = readdirSync(bundleRoot);
    info.bundleRoot = bundleRoot;
    info.noticeFilesAtBundleRoot = rootFiles.filter(f => /about|license|credits|notice/i.test(f));
    const about = rootFiles.includes('ABOUT') ? readFileSync(path.join(bundleRoot, 'ABOUT'), 'utf8') : null;
    info.aboutExcerpt = about ? about.split('\n').filter(Boolean).slice(0, 2).join(' / ') : null;
    info.license = 'Google Chrome for Testing terms (ABOUT: "Copyright Google LLC", credits at chrome://credits); not BSD-3-Clause Chromium source';
    info.licenseEvidenceLimit = 'third-party notices are inside the browser (chrome://credits), not a file this spike can read; treat as unverified for shipping until the operator reviews them';
  } catch (e) { info.error = e.message; }
  return info;
}
function licenseNotes(deps) {
  const notes = [];
  const ok = d => d && d.verified;
  if (ok(deps.satori) && ok(deps.resvg_js)) notes.push(`satori ${deps.satori.version} and @resvg/resvg-js ${deps.resvg_js.version} are ${deps.satori.license} / ${deps.resvg_js.license} (read from their manifests). MPL-2.0 is within the PRD exception.`);
  notes.push(ok(deps.resvg_native_binding)
    ? `${deps.resvg_native_binding.name} ${deps.resvg_native_binding.version} is ${deps.resvg_native_binding.license} (read from ${deps.resvg_native_binding.provenance}); it bundles the resvg Rust crate as a prebuilt .node binary, unmodified here.`
    : `native resvg binding license UNVERIFIED: ${deps.resvg_native_binding?.error ?? 'not read'}.`);
  const tv = deps.transitive.filter(ok), tf = deps.transitive.filter(d => !ok(d));
  if (tv.length) notes.push(`Transitive satori packages read from their manifests: ${tv.map(d => `${d.name} ${d.version} ${d.license}`).join(', ')}.`);
  if (tf.length) notes.push(`Transitive packages NOT read (unverified): ${tf.map(d => `${d.name} (${d.error})`).join(', ')}.`);
  notes.push(ok(deps.playwright) ? `playwright ${deps.playwright.version} is ${deps.playwright.license}.` : 'playwright license UNVERIFIED.');
  notes.push(deps.chromium?.license ? `Browser: ${deps.chromium.title ?? 'chromium'} ${deps.chromium.version} — ${deps.chromium.license}. ${deps.chromium.licenseEvidenceLimit}` : 'Browser license UNVERIFIED.');
  return notes;
}
function processRssKb(pid) {
  if (!pid) return null;
  try { return Number(execFileSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8' }).trim()) || null; } catch { return null; }
}
// `median` is the upper median for even sample counts (sorted index n/2), as reported in REPORT.md.
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
  const font = await getFonts();
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
      resvg_native_binding: pkgInfo(`@resvg/resvg-js-${process.platform}-${process.arch}`, '@resvg/resvg-js'),
      playwright: pkgInfo('playwright'),
      transitive: ['yoga-layout', 'harfbuzzjs', '@shuding/opentype.js', 'linebreak'].map(n => pkgInfo(n, 'satori')),
      chromium: null,
      font: { files: ['tools/spike/assets/font.ttf', 'tools/spike/assets/font-bold.ttf'], family: 'Inter 4.0 Regular 400 + Bold 700', license: 'OFL-1.1', verified: true, provenance: 'tools/spike/assets/SOURCES.md + verifier sha256 constants' }
    },
    licenseNotes: null,
    units: { time: 'milliseconds (performance.now)', memory: 'bytes unless named *Kb (ps rss, kilobytes)' },
    stageBoundaries: {
      satori_cold: 'dynamic import("satori") + yoga wasm init + first satori() layout + first resvg render + PNG encode, same process, after the fixture/font were already read',
      satori_warm: 'satori() layout + resvg render + PNG encode for the nutrition scene; satoriMs/resvgMs split recorded per sample',
      playwright_cold: 'chromium.launch + newContext + newPage + setContent + fonts.ready + geometry evaluate + screenshot (clip to canvas) + page close (whole helper inside the timer)',
      playwright_warm: 'setContent + fonts.ready + geometry evaluate + screenshot (clip) on an already-launched browser and context; page creation (before the timer) and page close (after it) are excluded',
      importNote: 'static imports of @resvg/resvg-js and playwright run at module load before any timer; cold numbers are backend initialization within an already-started process, not fresh-process startup',
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
    runDir: RUN_DIR,
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
      satori: `supported: satori emits SVG; written to ${rel('satori.svg')}`,
      playwright: 'unsupported: Chromium page.screenshot emits raster only; no vector export path exists in this backend'
    },
    cases: {}, probes: {}, digests: {}, capabilities: {}
  };

  let browser = null;
  // Finite deadline: close the browser (bounded by 5 s) before exiting 2. It cannot interrupt a
  // synchronous resvg rasterization already on the stack; it fires at the next event-loop turn.
  const deadline = setTimeout(async () => {
    deadlineHit = true;
    console.error(`render: deadline of ${RENDER_DEADLINE_MS}ms exceeded; closing browser and aborting`);
    if (browser) await Promise.race([browser.close().catch(() => {}), new Promise(r => setTimeout(r, 5000))]);
    process.exit(2);
  }, RENDER_DEADLINE_MS);
  deadline.unref?.();

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
    runtime.dependencies.chromium = chromiumInfo(browser);
    runtime.licenseNotes = licenseNotes(runtime.dependencies);
    // Failure-path control (operator-only): SPIKE_INJECT_FAILURE=1 throws here, after the browser is
    // up, to prove the finally block closes it. Never set in normal runs.
    if (process.env.SPIKE_INJECT_FAILURE === '1') throw new Error('injected failure after browser launch (SPIKE_INJECT_FAILURE)');
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
        // Chromium's input is an HTML document: save exactly what page.setContent loaded (fonts and
        // illustrations inline as data URLs, so the file reproduces the render offline when opened).
        const htmlFile = b === 'playwright' ? c.file(b).replace(/\.png$/, '.html') : null;
        if (htmlFile) await fs.writeFile(path.join(OUT, htmlFile), fit.result.html);
        if (b === 'satori' && c.name === 'baseline') await fs.writeFile(path.join(OUT, 'satori.svg'), fit.result.svg);
        measurements.cases[c.name][b] = {
          png: rel(c.file(b)), pngSize: pngSize(png), sha256: sha256(png),
          html: htmlFile ? { path: rel(htmlFile), bytes: Buffer.byteLength(fit.result.html), sha256: sha256(fit.result.html) } : undefined,
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
    measurements.probeArtifacts = {
      satori: { png: rel('probe-satori.png'), pngSize: pngSize(sProbe.png), sha256: sha256(sProbe.png) },
      playwright: { png: rel('probe-playwright.png'), pngSize: pngSize(pProbe.png), sha256: sha256(pProbe.png) }
    };
    // Chromium advance widths with the pinned family vs a nonexistent family (forcing system fallback):
    // corroboration only, interpreted below; the fallback face identity is not exposed by the DOM.
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
      // Font coverage is a property of the pinned font file; satori's segmenter reports uncovered
      // segments (same font file both backends use). Chromium falls back per glyph to a system face it
      // does not name. measureText pinned-vs-fallback widths are corroboration with limits (a fallback
      // chain can differ between the two font-family values), never a coverage oracle. A nonzero text box
      // is layout evidence only; what was painted is a separate visual observation of the probe PNGs.
      const covered = missing.length === 0;
      const widthsDiffer = Math.abs(w.pinnedFamilyWidth - w.fallbackOnlyWidth) > 0.01;
      const sBox = sProbe.textBoxes[`probe_${p.id}`] ?? null;
      const pBox = pProbe.textBoxes[`probe_${p.id}`] ?? null;
      measurements.probes[p.id] = {
        text: p.text, mandatory: !!p.mandatory,
        satori: {
          observation: covered ? 'rendered_by_pinned_font' : 'uncovered_by_pinned_font',
          uncoveredSegments: missing,
          fallbackSupplied: false,
          consequence: covered ? 'none' : `requested glyphs unavailable in the pinned font; satori drew .notdef placeholder boxes for the uncovered segment (visible in ${rel('probe-satori.png')}); no fallback font was provided via loadAdditionalAsset`,
          layoutBox: sBox, layoutBoxNonEmpty: !!sBox && sBox.width > 0,
          visualObservation: `see ${rel('probe-satori.png')}; placeholders are agent-observed, not machine-detected`
        },
        playwright: {
          observation: covered ? 'rendered_by_pinned_font' : 'rendered_via_system_fallback',
          pinnedFontCoverage: covered ? 'covered' : 'uncovered (segments listed under satori.uncoveredSegments; same font file)',
          measureText: { ...w, pinnedVsFallbackWidthsDiffer: widthsDiffer, interpretation: 'corroboration only; equal widths suggest no pinned glyphs, differing widths do not prove coverage' },
          fallbackIdentity: covered ? null : 'not exposed by the DOM; Chromium substituted a system face per glyph',
          layoutBox: pBox, layoutBoxNonEmpty: !!pBox && pBox.width > 0,
          visualObservation: `see ${rel('probe-playwright.png')}; readable glyphs for fallback scripts are agent-observed, not machine-detected`
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
      // Mandatory English evidence: pinned-font coverage AND a finite, positive laid-out text box.
      const en = measurements.probes.english[b];
      const englishOk = en.observation === 'rendered_by_pinned_font' && en.layoutBoxNonEmpty === true && en.layoutBox.width > 0 && en.layoutBox.height > 0;
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
    console.log(`render: wrote ${Object.keys(measurements.cases).length} cases x 2 backends, probes, digests to tools/spike/output/${RUN_DIR}/`);
    for (const [b, c] of Object.entries(measurements.capabilities)) console.log(`render: ${b}: ${c.status}${c.failedMandatory.length ? ' (' + c.failedMandatory.join(', ') + ')' : ''}`);
    console.log(`render: selection ${measurements.selection.status}${measurements.selection.eligible.length ? ': ' + measurements.selection.eligible.join(', ') : ''}`);
  } finally {
    clearTimeout(deadline);
    if (browser) await browser.close().catch(() => {});
  }
}

if (process.env.SPIKE_LIBRARY_ONLY !== '1') main().catch(err => {
  console.error('render: FAILED', err?.stack || err);
  process.exit(deadlineHit ? 2 : 1);
});

// Artifact-local library exports; original source remains unchanged.
export { loadSatori, renderSatori, renderPlaywright, toDocument };
