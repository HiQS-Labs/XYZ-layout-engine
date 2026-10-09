// Reusable backend operations extracted from the spike
import { performance } from 'perf_hooks';

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'node:fs/promises';
import { readFileSync, realpathSync, existsSync } from 'node:fs';
import crypto from 'node:crypto';
import { normalizeRequest, within, LIMITS, invalid, readBounded } from './request.mjs';

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

export async function renderSatori(scene, font, width, height, fontFamily = 'Inter') {
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
  const { Resvg } = await import('@resvg/resvg-js');
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
      return `${k}="${escapeHtml(v)}"`;
    })
    .join(' ');
  if (type === 'img') return `<img ${attrs} style="${escapeHtml(style)}">`;
  return `<${type} ${attrs} style="${escapeHtml(style)}">${toHtml(props.children)}</${type}>`;
}
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function toDocument(scene, font, width, height, fontFamily = 'Inter') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'${fontFamily}';font-weight:400;src:url(data:font/ttf;base64,${font.regular.toString('base64')})}
@font-face{font-family:'${fontFamily}';font-weight:700;src:url(data:font/ttf;base64,${font.bold.toString('base64')})}
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
h1,h2,p{margin:0}span,div,p,h1,h2{display:flex}
</style></head><body>${toHtml(scene)}</body></html>`;
}

export async function launchPlaywright() {
  const { chromium } = await import('playwright');
  return await chromium.launch({ headless: true });
}

export async function renderPlaywright(context, scene, font, width, height, fontFamily = 'Inter') {
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
    const png = await page.screenshot({ clip: { x: 0, y: 0, width, height }, fullPage: false });
    const stageMs = round(performance.now() - t0);
    for (const k of Object.keys(evidence.bounds)) evidence.bounds[k] = rect(evidence.bounds[k]);
    for (const [k, v] of Object.entries(evidence.textBoxes)) evidence.textBoxes[k] = { ...rect(v), text: v.text, scrollWidth: v.scrollWidth, clientWidth: v.clientWidth, scrollHeight: v.scrollHeight, clientHeight: v.clientHeight, lineCount: v.lineCount };
    return { png, html, ...evidence, stageMs };
  } finally {
    await page.close();
  }
}

export async function processRequest(reqObj, options = {}) {
  const { getFonts } = await import('./spike/assets.mjs');
  const { buildNutritionScene, validateNutrition, version: recipeVersion, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT } = await import('./recipes/nutrition.mjs');
  const { normalized, fixture, input } = await normalizeRequest(reqObj, options);
  await validateNutrition(fixture);
  fixture.width = normalized.width; fixture.height = normalized.height;
  const fonts = await getFonts();
  const scene = await buildNutritionScene(fixture, {});
  let result;
  if (normalized.backend === 'playwright') {
    const browser = await launchPlaywright();
    try {
      const context = await browser.newContext({ viewport: { width: normalized.width, height: normalized.height }, deviceScaleFactor: 1, javaScriptEnabled: false });
      await context.route('**/*', route => route.abort());
      try { result = await renderPlaywright(context, scene, fonts, normalized.width, normalized.height); }
      finally { await context.close(); }
    } finally { await browser.close(); }
  } else {
    result = await renderSatori(scene, fonts, normalized.width, normalized.height);
  }
  const errors = [];
  const parents = Object.fromEntries(Object.entries(NUTRITION_CONTAINMENT).flatMap(([parent, kids]) => kids.map(kid => [kid, parent])));
  for (const id of NUTRITION_TEXT_IDS.filter(id => id !== 'header_caption' || fixture.sections.header.caption)) {
    const box = result.textBoxes[id];
    if (!box || ![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) errors.push({ field: id, message: 'missing/invalid text geometry' });
    else if (box.x < -0.5 || box.y < -0.5 || box.x + box.width > normalized.width + 0.5 || box.y + box.height > normalized.height + 0.5) errors.push({ field: id, message: 'text outside canvas' });
    else {
      const region = result.bounds[parents[id]];
      if (!region || box.x < region.x - 0.5 || box.y < region.y - 0.5 || box.x + box.width > region.x + region.width + 0.5 || box.y + box.height > region.y + region.height + 0.5 || box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1) errors.push({ field: id, message: 'text outside its region' });
    }
  }
  if (result.missingSegments?.length || result.fontLoaded === false) errors.push({ field: 'font', message: 'unsupported text/font' });
  if (!result.png || result.png.readUInt32BE(16) !== normalized.width || result.png.readUInt32BE(20) !== normalized.height) errors.push({ field: 'artifact', message: 'wrong PNG dimensions' });
  if (errors.length) throw new Error('Validation failed: ' + JSON.stringify(errors));
  const format = normalized.format;
  const bytes = format === 'png' ? result.png : Buffer.from(format === 'svg' ? result.svg : (result.html ?? toDocument(scene, fonts, normalized.width, normalized.height)));
  if (!bytes.length || bytes.length > LIMITS.outputBytes) throw invalid('artifact', 'output byte budget exceeded');
  const digest = sha256(bytes);
  const artifact = { name: `render.${format}`, mime: { png: 'image/png', svg: 'image/svg+xml', html: 'text/html' }[format], width: normalized.width, height: normalized.height, bytes, sha256: digest };
  const request = { normalized, versions: { recipe: recipeVersion, backend: normalized.backend === 'playwright' ? '1.64.0' : '0.36.0' }, validation: { valid: true, errors: [] }, digests: { [format]: digest }, provenance: { inputPath: normalized.inputPath, inputSha256: sha256(input), backend: normalized.backend } };
  return { request, result, artifacts: [artifact] };
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
    const entries = await fs.readdir(stage, { withFileTypes: true }), files = [], digests = {};
    let total = 0;
    for (const entry of entries) {
      if (!entry.isFile() || entry.name === 'manifest.json') throw invalid('artifact', 'unexpected staged entry');
      const bytes = await readBounded(path.join(stage, entry.name), LIMITS.outputBytes, 'artifact');
      total += bytes.length;
      if (!bytes.length || total > LIMITS.outputBytes) throw invalid('artifact', 'output byte budget exceeded');
      files.push(entry.name); digests[entry.name] = sha256(bytes);
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

export async function publishArtifacts(operation, destination, options = {}) {
  if (!operation.request.validation.valid) throw invalid('validation', 'cannot publish failed operation');
  const out = await outputRoot(destination, options.root);
  const stage = await fs.mkdtemp(path.join(out, '.staging-'));
  try {
    for (const artifact of operation.artifacts) {
      if (!/^render\.(png|svg|html)$/.test(artifact.name) || sha256(artifact.bytes) !== artifact.sha256) throw invalid('artifact', 'invalid artifact identity/digest');
      await fs.writeFile(path.join(stage, artifact.name), artifact.bytes, { flag: 'wx' });
    }
    await fs.writeFile(path.join(stage, 'result.json'), JSON.stringify(operation.request, null, 2));
    return await publishStaged(stage, out, options);
  } finally { await fs.rm(stage, { recursive: true, force: true }); }
}

// Thin local CLI: node tools/render.mjs fixture.json --out tools/output/local [--format svg] [--backend playwright]
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  (async () => {
    const [inputPath, ...args] = process.argv.slice(2), req = { inputPath };
    let destination = 'tools/output/local';
    for (let i = 0; i < args.length; i += 2) {
      if (!args[i + 1]) throw invalid(args[i], 'missing option value');
      if (args[i] === '--out') destination = args[i + 1];
      else if (['--format', '--backend'].includes(args[i])) req[args[i].slice(2)] = args[i + 1];
      else throw invalid(args[i], 'unsupported option');
    }
    const operation = await processRequest(req);
    const publication = await publishArtifacts(operation, destination, { failBeforeCommit: process.env.RENDER_INJECT_PUBLICATION_FAILURE === '1' });
    console.log(JSON.stringify({ ...operation.request, publication }, null, 2));
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
