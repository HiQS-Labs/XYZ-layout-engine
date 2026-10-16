// Accessible PDF export: the same scene the PNG/SVG/HTML exports draw, printed by Chromium as a tagged PDF.
//
// A scene says how a diagram looks; an accessibility spec says what it means:
//   { title, lang, headings: {textId: 'h1'|'h2'|'h3'}, images: {imgId: 'alt text' | ''}, figures: {groupId: 'alt text'},
//     order: [topLevelId | '*'], unnamedImages: 'decorative', artifacts: [textId], unnamedText: 'artifact' }
// `artifacts` (and unnamedText: 'artifact') hide label fragments from assistive technology - letters and numbers inside a
// diagram that only make sense visually - and are allowed only because the diagram's alt text must then describe them.
// Text nodes become headings or paragraphs, every image needs alt text ('' marks it decorative), and `order` sets
// the reading order of the canvas's top-level children ('*' keeps the rest in scene order). `figures` describes a group
// that carries meaning but has no text or image (colour swatches): a transparent image with that alt text is laid over it,
// because Chromium tags only real content, not painted backgrounds. Reordering keeps the
// painted stacking through z-index, so the page looks the same while assistive technology reads it in order.
//
// Verification reads the PDF back: the tag tree, alt text, language, title and the text of each tag in tag order
// (decoded through the embedded ToUnicode maps), plus a contrast audit of every text run against the pixels behind it.
import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cssValue, toDocument, launchPlaywright, processRequest, loadSatori, renderSatori } from './render.mjs';
import { readBounded, LIMITS } from './request.mjs';

const TAGS = new Set(['h1', 'h2', 'h3']);
// Chromium tags an image only if it paints something, so the overlay paints white at 0.4% opacity: at most a
// one-level change per channel, invisible, and inside the visual check's tolerance.
const CLEAR = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" preserveAspectRatio="none"><rect width="10" height="10" fill="#ffffff" fill-opacity="0.004"/></svg>').toString('base64');
const isText = children => typeof children === 'string' || (Array.isArray(children) && children.length > 0 && children.every(c => typeof c === 'string'));

export function semanticScene(scene, spec) {
  const usedHeadings = new Set(), usedImages = new Set(), usedFigures = new Set(), usedArtifacts = new Set(), seq = [];
  const walk = node => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== 'object') return node;
    const props = { ...node.props }, id = props.id;
    let type = node.type;
    if (id && Object.hasOwn(spec.figures ?? {}, id)) {
      const alt = spec.figures[id];
      if (typeof alt !== 'string' || !alt.trim()) throw new Error(`accessibility: figure ${id} needs alt text`);
      usedFigures.add(id); seq.push({ type: 'Figure', id: id + '__figure', alt });
      const pos = props.style?.position;
      props.style = { ...props.style, ...(pos === 'absolute' || pos === 'relative' ? {} : { position: 'relative' }) };
      const overlay = { type: 'img', props: { id: id + '__figure', src: CLEAR, alt, style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } } };
      props.children = [overlay, ...[walk(props.children)].flat()];
      return { type, props };
    }
    if (type === 'img') {
      // Unnamed images (shadows, ornaments) are decorative only when the spec says so explicitly.
      if (!id && spec.unnamedImages === 'decorative') { props.alt = ''; return { type, props }; }
      if (!id || !Object.hasOwn(spec.images ?? {}, id)) throw new Error(`accessibility: image ${id ?? '(no id)'} needs alt text, or '' to mark it decorative`);
      const alt = spec.images[id];
      if (typeof alt !== 'string') throw new Error(`accessibility: alt text for ${id} must be a string`);
      props.alt = alt; usedImages.add(id);
      if (alt.trim()) seq.push({ type: 'Figure', id, alt });
      // Chromium paints a CSS-filtered image (e.g. drop-shadow) as an effect layer and drops its tag. Keep the
      // filtered image as painted art inside a wrapper that takes over its box, and tag a transparent overlay instead.
      if (alt.trim() && props.style?.filter) {
        const BOX = ['position', 'left', 'top', 'right', 'bottom', 'zIndex', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
        const outer = {}, inner = {};
        for (const [k, v] of Object.entries(props.style)) (BOX.includes(k) ? outer : inner)[k] = v;
        if (outer.position !== 'absolute') outer.position = 'relative';
        const painted = { type: 'img', props: { ...props, id: id + '__art', alt: '', style: { ...inner, width: '100%', height: '100%' } } };
        const overlay = { type: 'img', props: { id, src: CLEAR, alt, style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } } };
        return { type: 'div', props: { id: id + '__box', style: { display: 'flex', ...outer }, children: [painted, overlay] } };
      }
    } else if (isText(props.children) && ((!id && spec.unnamedText === 'artifact') || (id && spec.artifacts?.includes(id)))) {
      props['aria-hidden'] = 'true'; if (id) usedArtifacts.add(id);
      return { type, props };
    } else if (isText(props.children)) {
      const tag = id && spec.headings?.[id];
      if (tag && !TAGS.has(tag)) throw new Error(`accessibility: heading ${id} must be h1, h2 or h3`);
      type = tag || 'p';
      if (tag) usedHeadings.add(id);
      seq.push({ type: type.toUpperCase(), id, text: [props.children].flat().join('') });
    }
    if (type !== 'img') props.children = walk(props.children);
    return { type, props };
  };
  const unknownHeadings = Object.keys(spec.headings ?? {}), unknownImages = Object.keys(spec.images ?? {}), unknownFigures = Object.keys(spec.figures ?? {});
  let kids = [scene.props.children].flat();
  if (spec.order) {
    const byId = new Map(kids.map((k, i) => [k?.props?.id, i]));
    for (const id of spec.order) if (id !== '*' && !byId.has(id)) throw new Error(`accessibility: order names ${id}, which is not a top-level scene node`);
    const listed = new Set(spec.order.filter(id => id !== '*'));
    const rest = kids.map((k, i) => i).filter(i => !listed.has(kids[i]?.props?.id));
    const indices = spec.order.flatMap(id => id === '*' ? rest : [byId.get(id)]);
    if (!spec.order.includes('*') && rest.length) throw new Error(`accessibility: order leaves out ${rest.map(i => kids[i]?.props?.id ?? '(unnamed)').join(', ')}; add them or '*'`);
    // Keep the original paint order: later scene children are drawn on top, whatever their reading position.
    kids = indices.map(i => {
      const k = kids[i];
      if (!k || typeof k !== 'object') return k;
      if (k.props?.style?.position !== 'absolute') throw new Error(`accessibility: reordering needs absolutely positioned top-level nodes; ${k.props?.id ?? '(unnamed)'} is not`);
      return { ...k, props: { ...k.props, style: { ...k.props.style, zIndex: i + 1 } } };
    });
  }
  const out = walk({ ...scene, props: { ...scene.props, children: kids } });
  const strayHeadings = unknownHeadings.filter(id => !usedHeadings.has(id)), strayImages = [...unknownImages.filter(id => !usedImages.has(id)), ...unknownFigures.filter(id => !usedFigures.has(id)), ...(spec.artifacts ?? []).filter(id => !usedArtifacts.has(id))];
  if (strayHeadings.length || strayImages.length) throw new Error(`accessibility: spec names ids missing from the scene: ${[...strayHeadings, ...strayImages].join(', ')}`);
  return { scene: out, sequence: seq };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// render.mjs's toHtml with h3 added. Kept here rather than widening toHtml because render.mjs is a catalog-declared
// file of every published recipe: changing it would change their content digests. Same element, attribute and
// image-source rules otherwise.
const SAFE_SRC = /^data:image\/(png|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
function toSemanticHtml(node) {
  if (node == null || node === false) return '';
  if (typeof node === 'string') return esc(node);
  if (Array.isArray(node)) return node.map(toSemanticHtml).join('');
  const { type, props } = node;
  if (!['div', 'span', 'p', 'h1', 'h2', 'h3', 'img'].includes(type)) throw new Error('Unsupported HTML element');
  const style = Object.entries(props.style || {}).map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${cssValue(k, v)}`).join(';');
  const attrs = Object.entries(props).filter(([k]) => k !== 'children' && k !== 'style').map(([k, v]) => {
    if (!['id', 'src', 'alt', 'width', 'height', 'aria-hidden'].includes(k)) throw new Error('Unsupported HTML attribute');
    if (k === 'aria-hidden' && v !== 'true') throw new Error('Unsupported aria-hidden value');
    if (k === 'src' && !SAFE_SRC.test(String(v))) throw new Error('only embedded trusted images are supported');
    return `${k}="${esc(v)}"`;
  }).join(' ');
  if (type === 'img') return `<img ${attrs} style="${esc(style)}">`;
  return `<${type} ${attrs} style="${esc(style)}">${toSemanticHtml(props.children)}</${type}>`;
}
export function toAccessibleDocument(scene, fonts, width, height, family, spec) {
  if (!spec?.title?.trim()) throw new Error('accessibility: the spec needs a document title');
  if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(spec.lang ?? 'en')) throw new Error('accessibility: invalid lang');
  if (!/^[A-Za-z0-9 -]{1,80}$/.test(family)) throw new Error('accessibility: invalid font family');
  const { scene: semantic, sequence } = semanticScene(scene, spec);
  // calt off: Inter's contextual alternates (e.g. raised parentheses beside capitals) are glyphs with no Unicode
  // mapping, so Chromium omits them from ToUnicode and a screen reader would lose them. Observed on '(RGB)'.
  // liga off: ligatures map to presentation forms such as U+FB01 'ﬁ', which screen readers often misread.
  // Observed with Barlow Condensed on 'first'.
  const html = `<!doctype html><html lang="${spec.lang ?? 'en'}"><head><meta charset="utf-8"><title>${esc(spec.title)}</title><style>
@font-face{font-family:'${family}';font-weight:400;src:url(data:font/ttf;base64,${fonts.regular.toString('base64')})}
@font-face{font-family:'${family}';font-weight:700;src:url(data:font/ttf;base64,${fonts.bold.toString('base64')})}
@page{size:${width}px ${height}px;margin:0}
*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{display:block;width:${width}px;height:${height}px}
body{font-feature-settings:"calt" 0,"liga" 0;font-variant-ligatures:none}
h1,h2,h3,p{margin:0;font-size:inherit;font-weight:inherit}span,div,p,h1,h2,h3{display:flex}
</style></head><body><main>${toSemanticHtml(semantic)}</main></body></html>`;
  return { html, sequence };
}

// Contrast of every text run against what is painted behind it: the page is captured with text made transparent,
// and each run's text colour is compared with the pixels under its line boxes. The 5th-percentile pixel decides,
// so a few anti-aliased edge pixels from a neighbour do not, but a real low-contrast patch does.
const AUDIT = ({ shot }) => new Promise(resolve => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
  const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
  const im = new Image();
  im.onload = () => {
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
    const px = cx.getImageData(0, 0, im.width, im.height).data;
    const out = [];
    for (const el of document.querySelectorAll('h1,h2,h3,p')) {
      const cs = getComputedStyle(el.parentElement ? el : el);
      let opacity = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) opacity *= parseFloat(getComputedStyle(n).opacity);
      const [r, g, b, a] = parse(el.dataset.color), alpha = a * opacity, size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
      const range = document.createRange(); range.selectNodeContents(el);
      const samples = [];
      for (const rc of range.getClientRects()) {
        const step = Math.max(1, Math.floor(Math.min(rc.width, rc.height) / 8));
        for (let y = Math.max(0, Math.floor(rc.top)); y < Math.min(im.height, Math.ceil(rc.bottom)); y += step)
          for (let x = Math.max(0, Math.floor(rc.left)); x < Math.min(im.width, Math.ceil(rc.right)); x += step) {
            const i = (y * im.width + x) * 4, bg = [px[i], px[i + 1], px[i + 2]];
            samples.push(ratio([r * alpha + bg[0] * (1 - alpha), g * alpha + bg[1] * (1 - alpha), b * alpha + bg[2] * (1 - alpha)], bg));
          }
      }
      samples.sort((m, n) => m - n);
      const large = size >= 24 || (size >= 18.66 && weight >= 700), need = large ? 3 : 4.5;
      const value = samples.length ? samples[Math.floor(samples.length * .05)] : 0;
      out.push({ id: el.id, tag: el.tagName.toLowerCase(), text: el.textContent.slice(0, 60), fontSize: size, fontWeight: weight, large, ratio: Math.round(value * 100) / 100, required: need, pass: value >= need });
    }
    resolve(out);
  };
  im.src = shot;
});

export async function renderAccessiblePdf(browser, scene, fonts, width, height, family, spec) {
  const { html, sequence } = toAccessibleDocument(scene, fonts, width, height, family, spec);
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  try {
    await context.route('**/*', route => route.request().url().startsWith('data:') ? route.continue() : route.abort());
    const page = await context.newPage();
    // The visual check: the semantic page must paint exactly like the plain export of the same scene.
    await page.setContent(toDocument(scene, fonts, width, height, family), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const plain = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const semantic = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
    const pdf = await page.pdf({ width: `${width}px`, height: `${height}px`, printBackground: true, tagged: true, outline: true, preferCSSPageSize: true });
    await page.evaluate(() => { for (const el of document.querySelectorAll('h1,h2,h3,p')) { el.dataset.color = getComputedStyle(el).color; el.style.setProperty('color', 'transparent', 'important'); } });
    const backdrop = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
    const contrast = await page.evaluate(AUDIT, { shot: 'data:image/png;base64,' + backdrop.toString('base64') });
    const visual = await page.evaluate(([a, b]) => new Promise(resolve => {
      const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      Promise.all([load(a), load(b)]).then(([x, y]) => {
        const get = i => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
        const p = get(x), q = get(y); let changed = 0;
        for (let k = 0; k < p.length; k += 4) if (Math.max(Math.abs(p[k] - q[k]), Math.abs(p[k + 1] - q[k + 1]), Math.abs(p[k + 2] - q[k + 2])) > 8) changed++;
        resolve({ changedPixels: changed, totalPixels: p.length / 4 });
      });
    }), ['data:image/png;base64,' + plain.toString('base64'), 'data:image/png;base64,' + semantic.toString('base64')]);
    const report = inspectPdf(pdf);
    return { pdf, html, sequence, contrast, visual, report, verdict: verdict({ spec, sequence, contrast, visual, report }) };
  } finally {
    await context.close();
  }
}

// Every requirement as a named check; the export fails when any is false.
export function verdict({ spec, sequence, contrast, visual, report }) {
  const norm = s => (s ?? '').replace(/\s+/g, '');
  const tagged = report.order.map(e => ({ type: e.type, text: e.type === 'Figure' ? e.alt : e.text }));
  const expected = sequence.map(e => ({ type: e.type, text: e.type === 'Figure' ? e.alt : e.text }));
  const sameOrder = tagged.length === expected.length && tagged.every((e, i) => e.type === expected[i].type && norm(e.text) === norm(expected[i].text));
  const firstMismatch = sameOrder ? null : (() => { const i = tagged.findIndex((e, k) => !expected[k] || e.type !== expected[k].type || norm(e.text) !== norm(expected[k].text)); return { index: i, pdf: tagged[i] ?? null, expected: expected[i] ?? null }; })();
  const checks = {
    'single page at the canvas size': report.pages === 1,
    'tagged (MarkInfo /Marked true, StructTreeRoot)': report.marked && report.hasStructTree,
    'document language set': report.lang === (spec.lang ?? 'en'),
    'title set and shown in the title bar': report.title === spec.title && report.displayDocTitle,
    'tab order follows structure': report.tabsStructure,
    'exactly one H1': report.order.filter(e => e.type === 'H1').length === 1,
    'headings do not skip levels': report.order.filter(e => /^H\d$/.test(e.type)).every((e, i, a) => i === 0 || +e.type[1] <= +a[i - 1].type[1] + 1),
    'every figure has alt text': report.figures.every(f => f.alt && f.alt.trim()),
    'all non-decorative images are tagged figures': report.figures.length === sequence.filter(e => e.type === 'Figure').length,
    'tag order matches the reading order (text decoded from the PDF)': sameOrder,
    'all text meets WCAG AA contrast': contrast.every(c => c.pass),
    'semantic page paints like the plain export': visual.changedPixels <= visual.totalPixels * 0.0005
  };
  return { pass: Object.values(checks).every(Boolean), checks, firstMismatch, contrastFailures: contrast.filter(c => !c.pass) };
}

// ---------- A small PDF reader: enough to walk the tag tree and decode tagged text. ----------
function parseValue(s, i = 0) {
  const ws = () => { while (i < s.length) { if (/\s/.test(s[i])) i++; else if (s[i] === '%') { while (i < s.length && s[i] !== '\n') i++; } else break; } };
  const value = () => {
    ws();
    const c = s[i];
    if (c === '<' && s[i + 1] === '<') { i += 2; const d = {}; for (;;) { ws(); if (s[i] === '>' && s[i + 1] === '>') { i += 2; return d; } const k = value(); d[k.name] = value(); } }
    if (c === '[') { i++; const a = []; for (;;) { ws(); if (s[i] === ']') { i++; return a; } a.push(value()); } }
    if (c === '/') { i++; let n = ''; while (i < s.length && !/[\s/<>\[\]()%{}]/.test(s[i])) n += s[i++]; return { name: n.replace(/#([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))) }; }
    if (c === '(') { i++; let depth = 1, out = ''; while (i < s.length) { const ch = s[i++]; if (ch === '\\') { const n = s[i++]; const map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }; if (map[n]) out += map[n]; else if (/[0-7]/.test(n)) { let o = n; while (o.length < 3 && /[0-7]/.test(s[i])) o += s[i++]; out += String.fromCharCode(parseInt(o, 8)); } else if (n === '\r') { if (s[i] === '\n') i++; } else if (n !== '\n') out += n; } else if (ch === '(') { depth++; out += ch; } else if (ch === ')') { if (--depth === 0) break; out += ch; } else out += ch; } return { str: out }; }
    if (c === '<') { i++; let h = ''; while (s[i] !== '>') h += s[i++]; i++; h = h.replace(/\s/g, ''); if (h.length % 2) h += '0'; let out = ''; for (let k = 0; k < h.length; k += 2) out += String.fromCharCode(parseInt(h.slice(k, k + 2), 16)); return { str: out, hex: true }; }
    let tok = ''; while (i < s.length && !/[\s/<>\[\]()%]/.test(s[i])) tok += s[i++];
    if (/^-?\d+$/.test(tok)) { const save = i; const m = s.slice(i).match(/^\s+(\d+)\s+R(?![A-Za-z])/); if (m) { i += m[0].length; return { ref: +tok }; } i = save; }
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(tok)) return +tok;
    if (tok === 'true' || tok === 'false') return tok === 'true';
    if (tok === 'null') return null;
    return { op: tok };
  };
  return { value: value(), end: i };
}
const pdfText = v => { if (!v || v.str === undefined) return undefined; const s = v.str; if (s.charCodeAt(0) === 0xfe && s.charCodeAt(1) === 0xff) { let o = ''; for (let k = 2; k + 1 < s.length; k += 2) o += String.fromCharCode((s.charCodeAt(k) << 8) | s.charCodeAt(k + 1)); return o; } return s; };

export function inspectPdf(buffer) {
  const s = Buffer.from(buffer).toString('latin1'), objects = new Map();
  for (const m of s.matchAll(/(?:^|\s)(\d+)\s+0\s+obj\b/g)) {
    const start = m.index + m[0].length, { value, end } = parseValue(s, start);
    const rest = s.slice(end, end + 20), sm = rest.match(/^\s*stream\r?\n/);
    let stream;
    if (sm) { const len = typeof value.Length === 'number' ? value.Length : null; const at = end + sm[0].length; const raw = Buffer.from(s.slice(at, len != null ? at + len : s.indexOf('endstream', at)), 'latin1'); const filters = [value.Filter].flat().filter(Boolean).map(f => f.name); stream = filters.includes('FlateDecode') ? zlib.inflateSync(raw) : raw; }
    objects.set(+m[1], { dict: value, stream });
  }
  const R = v => (v && v.ref !== undefined ? objects.get(v.ref)?.dict : v);
  const trailer = parseValue(s, s.lastIndexOf('trailer') + 7).value;
  const catalog = R(trailer.Root), info = R(trailer.Info) ?? {};
  // Pages and their fonts' ToUnicode maps.
  const pages = [];
  const collect = n => { const d = R(n); if (d.Type?.name === 'Pages') d.Kids.forEach(collect); else pages.push(n.ref); };
  collect(catalog.Pages);
  const cmap = ref => { const map = {}; const t = objects.get(ref).stream.toString('latin1'); const hex = h => h.replace(/[<>\s]/g, '');
    const u = h => { let o = ''; for (let k = 0; k < h.length; k += 4) o += String.fromCharCode(parseInt(h.slice(k, k + 4), 16)); return o; };
    for (const b of t.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) for (const p of b[1].matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi)) map[p[1].toLowerCase()] = u(p[2]);
    for (const b of t.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) for (const p of b[1].matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*(\[[^\]]*\]|<[0-9a-f]+>)/gi)) {
      const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), w = p[1].length;
      if (p[3].startsWith('[')) [...p[3].matchAll(/<([0-9a-f]+)>/gi)].forEach((d, k) => { map[(lo + k).toString(16).padStart(w, '0')] = u(d[1]); });
      else { const base = hex(p[3]); for (let c = lo; c <= hi; c++) map[c.toString(16).padStart(w, '0')] = u((parseInt(base.slice(-4), 16) + c - lo).toString(16).padStart(4, '0').replace(/^/, base.slice(0, -4))); }
    }
    return map; };
  const mcText = new Map(); // `${pageRef}:${mcid}` -> text
  for (const pref of pages) {
    const page = objects.get(pref).dict, fonts = R(R(page.Resources)?.Font) ?? {}, fontMaps = {};
    for (const [name, ref] of Object.entries(fonts)) { const f = R(ref); fontMaps[name] = { map: f.ToUnicode ? cmap(f.ToUnicode.ref) : {}, bytes: f.Subtype?.name === 'Type0' ? 2 : 1 }; }
    const content = [page.Contents].flat().map(c => objects.get(c.ref).stream.toString('latin1')).join('\n');
    const stack = []; let font = null, ops = [], i = 0;
    const decode = str => { const f = fontMaps[font] ?? { map: {}, bytes: 1 }; let o = ''; for (let k = 0; k < str.length; k += f.bytes) { let code = ''; for (let b = 0; b < f.bytes; b++) code += (str.charCodeAt(k + b) || 0).toString(16).padStart(2, '0'); o += f.map[code] ?? ''; } return o; };
    while (i < content.length) {
      const { value, end } = parseValue(content, i); if (end <= i) break; i = end;
      if (value && value.op !== undefined) {
        const op = value.op;
        if (op === 'BDC') { const props = ops.at(-1); const tag = ops.at(-2)?.name; stack.push(props && props.MCID !== undefined ? { mcid: props.MCID, tag } : { tag }); }
        else if (op === 'BMC') stack.push({ tag: ops.at(-1)?.name });
        else if (op === 'EMC') stack.pop();
        else if (op === 'Tf') font = ops.at(-2)?.name;
        else if (op === 'Tj' || op === "'" || op === '"' || op === 'TJ') {
          const cur = [...stack].reverse().find(x => x.mcid !== undefined);
          if (cur) { const arg = ops.at(-1); const strs = op === 'TJ' ? arg.filter(x => x.str !== undefined) : [arg]; const key = `${pref}:${cur.mcid}`; mcText.set(key, (mcText.get(key) ?? '') + strs.map(x => decode(x.str)).join('')); } // runs split at kerning; spaces are glyphs
        }
        ops = [];
      } else if (value !== undefined) ops.push(value);
      else break;
    }
  }
  // Walk the structure tree depth-first: this is the order assistive technology reads.
  const order = [], figures = [], types = new Set();
  const textOf = (k, pg) => {
    if (typeof k === 'number') return mcText.get(`${pg}:${k}`) ?? '';
    if (Array.isArray(k)) return k.map(x => textOf(x, pg)).join('');
    if (k && k.ref !== undefined) { const d = R(k); if (d?.Type?.name === 'MCR') return mcText.get(`${d.Pg?.ref ?? pg}:${d.MCID}`) ?? ''; return textOf(d.K, d.Pg?.ref ?? pg); }
    if (k && k.Type?.name === 'MCR') return mcText.get(`${k.Pg?.ref ?? pg}:${k.MCID}`) ?? '';
    return '';
  };
  const visit = (k, pg) => {
    if (Array.isArray(k)) return k.forEach(x => visit(x, pg));
    const d = k && k.ref !== undefined ? R(k) : k;
    if (!d || typeof d !== 'object' || d.S === undefined) return;
    const type = d.S.name, page = d.Pg?.ref ?? pg; types.add(type);
    if (/^(H\d?|P|Figure)$/.test(type)) {
      const entry = { type, text: textOf(d.K, page).trim().replace(/\s+/g, ' '), alt: pdfText(d.Alt) };
      order.push(entry); if (type === 'Figure') figures.push(entry);
      return;
    }
    visit(d.K, page);
  };
  const root = R(catalog.StructTreeRoot);
  if (root) visit(root.K, pages[0]);
  const firstPage = objects.get(pages[0])?.dict ?? {};
  return {
    pages: pages.length, pageSize: firstPage.MediaBox, marked: R(catalog.MarkInfo)?.Marked === true, hasStructTree: !!root,
    lang: pdfText(catalog.Lang), title: pdfText(info.Title), displayDocTitle: R(catalog.ViewerPreferences)?.DisplayDocTitle === true,
    tabsStructure: pages.every(p => objects.get(p).dict.Tabs?.name === 'S'), structureTypes: [...types].sort(), order, figures
  };
}

// ---------- CLI ----------
// node tools/pdf.mjs render <fixture.json> [--recipe r] --out <file.pdf>   recipe diagrams, using recipe.accessibility()
// node tools/pdf.mjs check <file.pdf>                                       print what a PDF exposes to assistive technology
export async function exportRecipePdf(inputPath, { recipe, out } = {}) {
  // processRequest validates the fixture and fits the text; the scene is rebuilt from the recipe with the final
  // fitted sizes, and its Satori SVG must match the published render byte for byte before it is printed.
  const operation = await processRequest({ inputPath, recipe, format: 'svg' });
  const { normalized, fitting } = operation.request, { width, height } = normalized;
  const mod = await import(`./recipes/${normalized.recipe}.mjs`);
  const { accessibility } = await import(`./a11y/${normalized.recipe}.mjs`);
  const family = mod.FONT?.family ?? 'Inter';
  const fonts = mod.FONT
    ? { regular: await readBounded(mod.FONT.regular, LIMITS.assetBytes, 'font'), bold: await readBounded(mod.FONT.bold, LIMITS.assetBytes, 'font') }
    : await (await import('./spike/assets.mjs')).getFonts();
  const scene = await mod.buildScene(operation.fixture, fitting.finalSizes);
  await loadSatori();
  const rebuilt = await renderSatori(scene, fonts, width, height, family, { raster: false });
  const published = operation.artifacts.find(a => a.name.endsWith('.svg'));
  if (!published || Buffer.compare(Buffer.from(rebuilt.svg), published.bytes) !== 0) throw new Error('accessibility: rebuilt scene does not match the published render');
  const spec = accessibility(operation.fixture);
  const browser = await launchPlaywright();
  try {
    const result = await renderAccessiblePdf(browser, scene, fonts, width, height, family, spec);
    result.provenance = { recipe: normalized.recipe, version: operation.request.versions.recipe, inputPath: path.relative(process.cwd(), normalized.inputPath), svgSha256: published.sha256 };
    if (out) await writeAll(out, result);
    return result;
  } finally { await browser.close(); }
}
export async function writeAll(out, result) {
  await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await fs.writeFile(out, result.pdf);
  const { pdf, html, ...evidence } = result;
  await fs.writeFile(out.replace(/\.pdf$/, '') + '.pdf-accessibility.json', JSON.stringify(evidence, null, 2) + '\n');
}
export function summarize(result) {
  const lines = Object.entries(result.verdict.checks).map(([k, v]) => `  ${v ? 'PASS' : 'FAIL'}  ${k}`);
  const worst = [...result.contrast].sort((a, b) => a.ratio / a.required - b.ratio / b.required)[0];
  lines.push(`  tags: ${result.report.order.filter(e => /^H/.test(e.type)).length} headings, ${result.report.order.filter(e => e.type === 'P').length} paragraphs, ${result.report.figures.length} figures with alt; lowest contrast ${worst?.ratio}:1 (${worst?.id}, needs ${worst?.required}:1)`);
  if (result.verdict.firstMismatch) lines.push('  first reading-order mismatch: ' + JSON.stringify(result.verdict.firstMismatch));
  for (const c of result.verdict.contrastFailures) lines.push(`  contrast ${c.ratio}:1 < ${c.required}:1  ${c.id}  "${c.text}"`);
  return lines.join('\n');
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, file, ...args] = process.argv.slice(2);
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  (async () => {
    if (cmd === 'render') {
      const result = await exportRecipePdf(file, { recipe: opt('--recipe'), out: opt('--out') });
      console.log(`${result.verdict.pass ? 'PASS' : 'FAIL'}: ${opt('--out') ?? '(not written)'}\n${summarize(result)}`);
      if (!result.verdict.pass) process.exitCode = 1;
    } else if (cmd === 'check') {
      console.log(JSON.stringify(inspectPdf(await fs.readFile(file)), null, 2));
    } else { console.error('usage: node tools/pdf.mjs render <fixture.json> [--recipe r] --out <file.pdf> | check <file.pdf>'); process.exitCode = 2; }
  })().catch(e => { console.error(e.message); process.exitCode = 1; });
}
