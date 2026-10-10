// Reusable backend operations extracted from the spike
import { performance } from 'perf_hooks';

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'node:fs/promises';
import { readFileSync, realpathSync, existsSync, readdirSync } from 'node:fs';
import crypto from 'node:crypto';
import { normalizeRequest, within, LIMITS, invalid, readBounded, saveFixture } from './request.mjs';

let satori;
export async function loadSatori() {
  const t0 = performance.now();
  if (!satori) {
    globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url));
    ({ default: satori } = await import('satori'));
  }
  return performance.now() - t0;
}

const round = n => Math.round(n * 100) / 100;
const rect = r => ({ x: round(r.x ?? r.left), y: round(r.y ?? r.top), width: round(r.width), height: round(r.height) });

export async function renderSatori(scene, font, width, height, fontFamily = 'Inter', { raster = true } = {}) {
  const nodes = [];
  const missingSegments = [];
  const t0 = performance.now();
  await loadSatori();
  const svg = await satori(scene, {
    width, height,
    fonts: [{ name: fontFamily, data: font.regular, weight: 400, style: 'normal' }, { name: fontFamily, data: font.bold, weight: 700, style: 'normal' }],
    onNodeDetected: n => nodes.push(n),
    loadAdditionalAsset: async (languageCode, segment) => { missingSegments.push({ languageCode, segment }); return []; }
  });
  const tLayout = performance.now();
  let png;
  if (raster) {
    const { Resvg } = await import('@resvg/resvg-js');
    png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
  }
  const t1 = performance.now();
  const bounds = {};
  const textBoxes = {};
  for (const n of nodes) {
    const id = n.props?.id;
    if (!id) continue;
    bounds[id] = rect(n);
    if (typeof n.textContent === 'string') textBoxes[id] = { ...rect(n), text: n.textContent };
  }
  return { svg, png, bounds, textBoxes, missingSegments, satoriMs: round(tLayout - t0), resvgMs: raster ? round(t1 - tLayout) : 0, stageMs: round(t1 - t0) };
}

export function cssValue(k, v) {
  const unitless = new Set(['fontWeight', 'lineHeight', 'flex', 'opacity', 'zIndex']);
  return typeof v === 'number' && !unitless.has(k) ? `${v}px` : v;
}
export function toHtml(node) {
  if (node == null || node === false) return '';
  if (typeof node === 'string') return escapeHtml(node);
  if (Array.isArray(node)) return node.map(toHtml).join('');
  const { type, props } = node;
  if (!['div', 'span', 'p', 'h1', 'h2', 'img'].includes(type)) throw new Error('Unsupported HTML element');
  const style = Object.entries(props.style || {})
    .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${cssValue(k, v)}`)
    .join(';');
  const attrs = Object.entries(props)
    .filter(([k]) => k !== 'children' && k !== 'style')
    .map(([k, v]) => {
      if (!['id', 'src', 'alt', 'width', 'height'].includes(k)) throw new Error('Unsupported HTML attribute');
      if (k === 'src' && !/^(data:image\/(png|svg\+xml);base64,[A-Za-z0-9+/=]+|assets\/[a-f0-9]{64}\.(png|svg))$/.test(String(v))) throw invalid('src', 'only embedded trusted images are supported');
      return `${k}="${escapeHtml(v)}"`;
    })
    .join(' ');
  if (type === 'img') return `<img ${attrs} style="${escapeHtml(style)}">`;
  return `<${type} ${attrs} style="${escapeHtml(style)}">${toHtml(props.children)}</${type}>`;
}
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function toDocument(scene, font, width, height, fontFamily = 'Inter', assetURL = src => src) {
  const mapImages = node => {
    if (Array.isArray(node)) return node.map(mapImages);
    if (!node || typeof node !== 'object') return node;
    return { ...node, props: { ...node.props, ...(node.type === 'img' ? { src: assetURL(node.props.src) } : {}), children: mapImages(node.props.children) } };
  };
  if (!/^[A-Za-z0-9 -]{1,80}$/.test(fontFamily)) throw invalid('font', 'invalid family');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'${fontFamily}';font-weight:400;src:url(${assetURL(`data:font/ttf;base64,${font.regular.toString('base64')}`)})}
@font-face{font-family:'${fontFamily}';font-weight:700;src:url(${assetURL(`data:font/ttf;base64,${font.bold.toString('base64')}`)})}
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
h1,h2,p{margin:0}span,div,p,h1,h2{display:flex}
</style></head><body>${toHtml(mapImages(scene))}</body></html>`;
}

export async function launchPlaywright() {
  const { chromium } = await import('playwright');
  return await chromium.launch({ headless: true });
}

export async function renderPlaywright(context, scene, font, width, height, fontFamily = 'Inter', { raster = true } = {}) {
  const page = await context.newPage();
  try {
    const t0 = performance.now();
    const html = toDocument(scene, font, width, height, fontFamily);
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
    }, { family: fontFamily });
    const png = raster ? await page.screenshot({ clip: { x: 0, y: 0, width, height }, fullPage: false }) : undefined;
    const stageMs = round(performance.now() - t0);
    for (const k of Object.keys(evidence.bounds)) evidence.bounds[k] = rect(evidence.bounds[k]);
    for (const [k, v] of Object.entries(evidence.textBoxes)) evidence.textBoxes[k] = { ...rect(v), text: v.text, scrollWidth: v.scrollWidth, clientWidth: v.clientWidth, scrollHeight: v.scrollHeight, clientHeight: v.clientHeight, lineCount: v.lineCount };
    return { png, html, ...evidence, stageMs };
  } finally {
    await page.close();
  }
}

export async function processRequest(reqObj, options = {}) {
  const started = performance.now(), timings = { sceneAssetMs: 0, layoutMs: 0, rasterMs: 0 };
  const { getFonts } = await import('./spike/assets.mjs');
  const { normalized, fixture, input } = await normalizeRequest(reqObj, options);

  timings.inputMs = round(performance.now() - started);
  const validationStart = performance.now();
  let recipe;
  if (normalized.recipe === 'nutrition') {
    recipe = await import('./recipes/nutrition.mjs');
  } else if (normalized.recipe === 'solar-system') {
    recipe = await import('./recipes/solar-system.mjs');
  } else {
    throw new Error('Validation failed: ' + JSON.stringify([{ field: 'fixture.id', message: 'unsupported recipe identity' }]));
  }

  await recipe.validate(fixture);
  fixture.width = normalized.width; fixture.height = normalized.height;
  const fonts = await getFonts();

  timings.validationFontMs = round(performance.now() - validationStart);
  const raster = normalized.formats.includes('png');
  const TEXT_IDS = recipe.TEXT_IDS;
  const CONTAINMENT = recipe.CONTAINMENT;
  const parents = Object.fromEntries(Object.entries(CONTAINMENT).flatMap(([parent, kids]) => kids.map(kid => [kid, parent])));

  let browser, context;
  try {
    if (normalized.backend === 'playwright') {
      browser = await launchPlaywright();
      context = await browser.newContext({ viewport: { width: normalized.width, height: normalized.height }, deviceScaleFactor: 1, javaScriptEnabled: false });
      await context.route('**/*', route => route.abort());
    }

    const MAX_ATTEMPTS = 10;
    const MIN_SIZE = 12; // readable minimum font size
    const SHRINK_FACTOR = 0.9;

    let sizes = { ...recipe.DEFAULT_SIZES };
    let result;
    let errors = [];
    let steps = [];
    let unresolved = [];
    let scene;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      errors = [];
      const sceneStart = performance.now();
      scene = await recipe.buildScene(fixture, sizes);
      timings.sceneAssetMs += performance.now() - sceneStart;

      if (normalized.backend === 'playwright') {
        // The same pinned-font coverage oracle prevents Chromium's per-glyph system fallback.
        if (attempt === 0) {
          const coverage = await renderSatori(scene, fonts, normalized.width, normalized.height, 'Inter', { raster: false });
          if (coverage.missingSegments.length) throw invalid('font', 'unsupported text/font');
        }
        result = await renderPlaywright(context, scene, fonts, normalized.width, normalized.height, 'Inter', { raster });
      } else {
        result = await renderSatori(scene, fonts, normalized.width, normalized.height, 'Inter', { raster });
      }

      timings.layoutMs += result.satoriMs ?? result.stageMs;
      timings.rasterMs += result.resvgMs ?? 0;
      if (result.missingSegments?.length || result.fontLoaded === false) errors.push({ field: 'font', message: 'unsupported text/font' });
      if (raster && (!result.png || result.png.readUInt32BE(16) !== normalized.width || result.png.readUInt32BE(20) !== normalized.height)) errors.push({ field: 'artifact', message: 'wrong PNG dimensions' });

      if (errors.length) break;

      const overflowing = [];
      for (const id of TEXT_IDS) {
        if (id === 'header_caption' && !fixture.sections?.header?.caption) continue; // Skip optional
        const box = result.textBoxes[id];
        if (!box || ![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) {
          errors.push({ field: id, message: 'missing/invalid text geometry' });
        } else if (box.x < -0.5 || box.y < -0.5 || box.x + box.width > normalized.width + 0.5 || box.y + box.height > normalized.height + 0.5) {
          overflowing.push(id);
        } else {
          const region = result.bounds[parents[id]];
          if (!region || box.x < region.x - 0.5 || box.y < region.y - 0.5 || box.x + box.width > region.x + region.width + 0.5 || box.y + box.height > region.y + region.height + 0.5 || box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1) {
            overflowing.push(id);
          }
        }
      }

      if (errors.length) break;

      steps.push({ iteration: attempt, overflowing, sizes: { ...sizes } });
      if (overflowing.length === 0) {
        unresolved = [];
        break;
      }

      if (attempt === MAX_ATTEMPTS - 1) {
        unresolved = overflowing;
        break;
      }

      let shrunk = false;
      for (const id of overflowing) {
        if ((sizes[id] || 28) > MIN_SIZE) {
          sizes[id] = Math.max(MIN_SIZE, Math.floor((sizes[id] || 28) * SHRINK_FACTOR));
          shrunk = true;
        }
      }
      if (!shrunk) {
        unresolved = overflowing;
        break;
      }
    }

    if (unresolved.length) throw invalid('fitting', `non-fit after ${steps.length} attempts: text outside its region: ${unresolved.join(', ')}`);
    if (errors.length) throw new Error('Validation failed: ' + JSON.stringify(errors));

    // Build structure expected by verify.mjs for `text` mapping

  const canvasBounds = { x: 0, y: 0, width: normalized.width, height: normalized.height };
  const contained = (a, o) => a.x >= o.x - 0.5 && a.y >= o.y - 0.5 && a.x + a.width <= o.x + o.width + 0.5 && a.y + a.height <= o.y + o.height + 0.5;
  for (const id of TEXT_IDS) {
    if (id === 'header_caption' && !fixture.sections?.header?.caption) {
      result.textBoxes[id] = { present: false };
      continue;
    }
    const box = result.textBoxes[id];
    const region = result.bounds[parents[id]] || canvasBounds;
    const sm = box.scrollWidth ? { scrollWidth: box.scrollWidth, clientWidth: box.clientWidth, scrollHeight: box.scrollHeight, clientHeight: box.clientHeight } : undefined;
    const scrollOverflow = sm ? (sm.scrollWidth > sm.clientWidth + 1 || sm.scrollHeight > sm.clientHeight + 1) : false;
    const insideRegion = contained(box, region);
    const insideCanvas = contained(box, canvasBounds);

    result.textBoxes[id] = {
      present: true, text: box.text, box: { x: box.x, y: box.y, width: box.width, height: box.height },
      region, insideRegion, insideCanvas,
      ...(sm ? { scrollMetrics: sm, scrollOverflow } : {}),
      overflow: !insideRegion || !insideCanvas || scrollOverflow
    };
  }

  const artifacts = [], digests = {};
  const add = (name, mime, bytes) => {
    bytes = Buffer.from(bytes);
    if (!bytes.length || bytes.length > LIMITS.outputBytes) throw invalid('artifact', 'output byte budget exceeded');
    const digest = sha256(bytes);
    artifacts.push({ name, mime, width: normalized.width, height: normalized.height, bytes, sha256: digest });
    return digest;
  };
  for (const format of normalized.formats) {
    if (format === 'png' || format === 'svg') {
      digests[format] = add(`render.${format}`, format === 'png' ? 'image/png' : 'image/svg+xml', format === 'png' ? result.png : result.svg);
    } else {
      let html = result.html ?? toDocument(scene, fonts, normalized.width, normalized.height);
      if (format === 'html') {
        // Extract only image/font attributes, never label text containing a data URL.
        html = toDocument(scene, fonts, normalized.width, normalized.height, 'Inter', source => {
          const match = /^data:(image\/png|image\/svg\+xml|font\/ttf);base64,([A-Za-z0-9+/=]+)$/.exec(source);
          if (!match) throw invalid('asset', 'unsupported offline asset');
          const [, mime, encoded] = match, bytes = Buffer.from(encoded, 'base64');
          const extension = { 'image/png': 'png', 'image/svg+xml': 'svg', 'font/ttf': 'ttf' }[mime];
          const name = `assets/${sha256(bytes)}.${extension}`;
          if (!artifacts.some(a => a.name === name)) add(name, mime, bytes);
          return name;
        });
      }
      digests[format] = add(format === 'html' ? 'render.html' : 'render-inline.html', 'text/html', html);
    }
  }
  const request = { normalized, versions: { recipe: recipe.version, backend: normalized.backend === 'playwright' ? '1.64.0' : '0.36.0' }, validation: { valid: true, errors: [] }, digests, provenance: { inputPath: normalized.inputPath, inputSha256: sha256(input), fixtureSha256: sha256(JSON.stringify(fixture)), backend: normalized.backend }, fitting: { fit: unresolved.length === 0, attempts: steps.length, iterations: steps.length - 1, unresolved, steps, finalSizes: sizes } };
  timings.operationMs = round(performance.now() - started);
  return { request, result, artifacts, timings, fixture, input };
  } finally {
    try { if (context) await context.close(); } finally { if (browser) await browser.close(); }
  }
}

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

// Resolve once per reader. Legacy committed spike folders have no manifest and remain readable.
export function selectedRun(root) {
  if (!existsSync(path.join(root, 'manifest.json'))) return root;
  const manifest = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  if (!/^runs\/[a-f0-9-]+$/.test(manifest.current)) throw new Error('Invalid publication manifest');
  const target = realpathSync(path.join(root, manifest.current));
  if (!within(realpathSync(root), target)) throw new Error('Publication symlink escape');
  return target;
}

export function selectedSpikeRun(root, packageName) {
  const runs = readdirSync(root, { withFileTypes: true }).filter(entry => {
    if (!entry.isDirectory() || !/^\d{4}-\d{2}-\d{2}-/.test(entry.name) || entry.name.slice(11) !== packageName) return false;
    const folder = path.join(root, entry.name);
    // A failed first publication on a later date may leave an empty folder; it is not last-good.
    return existsSync(path.join(folder, 'manifest.json')) || existsSync(path.join(folder, 'measurements.json'));
  }).map(entry => entry.name).sort();
  if (!runs.length) throw new Error('No committed spike run found');
  const runDir = runs.at(-1);
  return { runDir, directory: selectedRun(path.join(root, runDir)) };
}

export async function outputRoot(target, authorizedRoot = process.cwd()) {
  const anchor = path.resolve(authorizedRoot), root = await fs.realpath(anchor), requested = path.resolve(anchor, target);
  const absolute = within(anchor, requested) ? path.resolve(root, path.relative(anchor, requested)) : requested;
  const historical = fileURLToPath(new URL('./spike/output', import.meta.url));
  if (!within(root, absolute) || within(historical, absolute)) throw invalid('outputRoot', 'outside authorized root or read-only spike evidence');
  let current = root;
  for (const segment of path.relative(root, absolute).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    await fs.mkdir(current).catch(e => { if (e.code !== 'EEXIST') throw e; });
    current = await fs.realpath(current);
    if (!within(root, current) || within(historical, current)) throw invalid('outputRoot', 'symlink escape rejection');
  }
  return current;
}

export async function publishStaged(stage, destination, options = {}) {
  const out = await outputRoot(destination, options.root);
  const id = crypto.randomUUID(), run = path.join(out, 'runs', id), pointer = path.join(out, `.manifest-${id}.tmp`);
  let committed = false;
  try {
    const files = [], digests = {};
    let total = 0;
    for (const entry of await fs.readdir(stage, { withFileTypes: true })) {
      if (entry.isFile() && entry.name !== 'manifest.json') files.push(entry.name);
      else if (entry.isDirectory() && entry.name === 'assets') {
        for (const asset of await fs.readdir(path.join(stage, 'assets'), { withFileTypes: true })) {
          if (!asset.isFile() || !/^[a-f0-9]{64}\.(png|svg|ttf)$/.test(asset.name)) throw invalid('artifact', 'unexpected staged asset');
          files.push(`assets/${asset.name}`);
        }
      } else throw invalid('artifact', 'unexpected staged entry');
    }
    for (const name of files) {
      const bytes = await readBounded(path.join(stage, name), LIMITS.outputBytes, 'artifact');
      total += bytes.length;
      if (!bytes.length || total > LIMITS.outputBytes) throw invalid('artifact', 'output byte budget exceeded');
      digests[name] = sha256(bytes);
      if (name.startsWith('assets/') && !name.includes(digests[name])) throw invalid('artifact', 'asset content identity mismatch');
    }
    if (!files.length) throw invalid('artifact', 'empty publication');
    const manifest = { current: `runs/${id}`, files: files.sort(), digests };
    await fs.writeFile(path.join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
    await outputRoot(path.join(out, 'runs'), options.root);
    await fs.rename(stage, run);
    await fs.writeFile(pointer, JSON.stringify(manifest, null, 2), { flag: 'wx' });
    if (options.failBeforeCommit) throw new Error('injected late publication failure');
    await fs.rename(pointer, path.join(out, 'manifest.json')); // The sole commit point; no copies afterward.
    committed = true;
    return { root: out, directory: run, manifest };
  } finally {
    if (!committed) { await fs.rm(run, { recursive: true, force: true }); await fs.rm(pointer, { force: true }); }
  }
}

// Re-read every manifest-owned artifact; no external references or symlink escapes.
export async function verifyPublication(root) {
  const directory = selectedRun(root);
  const manifest = JSON.parse(await readBounded(path.join(directory, 'manifest.json'), LIMITS.inputBytes, 'manifest'));
  if (!Array.isArray(manifest.files) || !manifest.files.length || !manifest.files.includes('result.json') || manifest.files.length > 512 || new Set(manifest.files).size !== manifest.files.length) throw invalid('manifest', 'invalid file list');
  let total = 0;
  for (const name of manifest.files) {
    if (typeof name !== 'string' || !/^(result\.json|render\.(png|svg|html)|render-inline\.html|assets\/[a-f0-9]{64}\.(png|svg|ttf))$/.test(name)) throw invalid('manifest', 'invalid artifact path');
    const target = await fs.realpath(path.join(directory, name));
    if (!within(directory, target)) throw invalid('manifest', 'symlink escape');
    const bytes = await readBounded(target, LIMITS.outputBytes, 'artifact');
    total += bytes.length;
    if (!bytes.length || total > LIMITS.outputBytes || sha256(bytes) !== manifest.digests?.[name]) throw invalid(name, 'artifact does not match recorded digest/budget');
  }
  const receipt = JSON.parse(await readBounded(path.join(directory, 'result.json'), LIMITS.inputBytes, 'result'));
  if (receipt.validation?.valid !== true || receipt.fitting?.fit !== true) throw invalid('result', 'invalid render verification');
  return { valid: true, files: manifest.files.length, bytes: total };
}

export async function publishArtifacts(operation, destination, options = {}) {
  if (!operation.request.validation.valid) throw invalid('validation', 'cannot publish failed operation');
  const out = await outputRoot(destination, options.root);
  const stage = await fs.mkdtemp(path.join(out, '.staging-'));
  try {
    for (const artifact of operation.artifacts) {
      if (!/^(render\.(png|svg|html)|render-inline\.html|assets\/[a-f0-9]{64}\.(png|svg|ttf))$/.test(artifact.name) || sha256(artifact.bytes) !== artifact.sha256) throw invalid('artifact', 'invalid artifact identity/digest');
      if (artifact.name.startsWith('assets/')) await fs.mkdir(path.join(stage, 'assets'), { recursive: true });
      await fs.writeFile(path.join(stage, artifact.name), artifact.bytes, { flag: 'wx' });
    }
    await fs.writeFile(path.join(stage, 'result.json'), JSON.stringify(operation.request, null, 2));
    return await publishStaged(stage, out, options);
  } finally { await fs.rm(stage, { recursive: true, force: true }); }
}

// Shared CLI operation; example entry points reuse parsing, admission and the sole publisher.
export async function runCLI(argv, options = {}) {
  const [inputPath, ...args] = argv, req = { inputPath };
  let destination = 'tools/output/local', save;
  req.edits = [];
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i + 1]) throw invalid(args[i], 'missing option value');
    if (args[i] === '--out') destination = args[i + 1];
    else if (args[i] === '--save') save = args[i + 1];
    else if (args[i] === '--set') {
      const split = args[i + 1].indexOf('=');
      if (split < 1) throw invalid('edit', 'use field=value');
      const field = args[i + 1].slice(0, split), raw = args[i + 1].slice(split + 1);
      let value; try { value = JSON.parse(raw); } catch { value = raw; }
      req.edits.push({ path: field, value });
    }
    else if (['--format', '--backend', '--recipe'].includes(args[i])) req[args[i].slice(2)] = args[i + 1];
    else throw invalid(args[i], 'unsupported option');
  }
  const operation = await processRequest(req, options);
  const saveOptions = { ...options, recipe: operation.request.normalized.recipe, inputPath: operation.request.normalized.inputPath, input: operation.input };
  const savedTarget = save ? await saveFixture(operation.fixture, save, { ...saveOptions, validateOnly: true }) : undefined;
  const out = await outputRoot(destination, options.root);
  if (savedTarget && within(out, savedTarget)) throw invalid('save', 'fixture must be outside exported folder');
  const publication = await publishArtifacts(operation, out, { ...options, failBeforeCommit: process.env.RENDER_INJECT_PUBLICATION_FAILURE === '1' });
  const saved = save ? await saveFixture(operation.fixture, save, saveOptions) : undefined;
  return { ...operation.request, publication, ...(saved ? { saved } : {}) };
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCLI(process.argv.slice(2)).then(receipt => console.log(JSON.stringify(receipt, null, 2)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
