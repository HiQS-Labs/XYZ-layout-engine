// Reusable backend operations extracted from the spike
import { performance } from 'perf_hooks';

import { fileURLToPath } from 'url';
import path from 'path';

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
