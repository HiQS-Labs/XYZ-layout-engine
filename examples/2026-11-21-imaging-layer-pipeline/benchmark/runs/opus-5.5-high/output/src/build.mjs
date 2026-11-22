// One-command build for the "How a poster is assembled" explainer.
//   node output/src/build.mjs        (run from the packet root, or from anywhere)
// Writes output/index.html (self-contained, offline) and output/poster.png (Chromium capture of that file).
//
// Two passes in headless Chromium:
//   1. measure the real nutrition poster boxes from nutrition/render-inline.html, then render the explainer once
//      to read where the 3D-projected anchor points landed;
//   2. bake the connector/leader SVG into static HTML, write index.html, open that file and screenshot it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Playwright comes from normal Node resolution; if this copy of the packet lives outside that tree,
// fall back to the current directory or an explicit PLAYWRIGHT_PATH (folder containing playwright).
async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch (first) {
    for (const base of [process.env.PLAYWRIGHT_PATH, process.cwd()].filter(Boolean)) {
      try {
        const req = createRequire(path.join(path.resolve(base), 'noop.js'));
        const mod = await import(pathToFileURL(req.resolve('playwright')).href);
        return mod.chromium ?? mod.default.chromium;
      } catch {}
    }
    throw first;
  }
}

const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(SRC, '..');
const ROOT = path.resolve(OUT, '..');
const W = 1400;
const H = 1120;

const read = p => fs.readFile(path.join(ROOT, p));
const uri = async (p, mime) => `data:${mime};base64,${(await read(p)).toString('base64')}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Caption mini-markup: `code` and **bold**.
const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

// ---- Editable geometry -------------------------------------------------------------------------------------
// Each plane is the 1000 x 1000 poster coordinate space, scaled and turned in 3D. Back planes sit deeper (z<0).
const PLANES = {
  content: { x: -40, y: 290, z: -760, ry: -24, s: 0.52 },
  layout: { x: 390, y: 225, z: -380, ry: -24, s: 0.52 },
  render: { x: 805, y: 180, z: 0, ry: -24, s: 0.52 },
};
const PERSPECTIVE = 1600;
const ORIGIN = { x: 700, y: 450 };
// Annotation cards (2D). `anchor` is where its leader line starts.
const NOTES = {
  words: { left: 28, top: 112, width: 372, color: '#f2a93b' },
  leaf: { left: 28, top: 652, width: 372, color: '#8fd16a' },
  move: { left: 420, top: 652, width: 372, color: '#5fd0e0' },
};

async function measurePoster(page) {
  await page.goto(pathToFileURL(path.join(ROOT, 'nutrition/render-inline.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const c = document.getElementById('canvas').getBoundingClientRect();
    const out = {};
    for (const el of document.querySelectorAll('[id]')) {
      const r = el.getBoundingClientRect();
      out[el.id] = { x: r.x - c.x, y: r.y - c.y, w: r.width, h: r.height };
    }
    return out;
  });
}

function planeStyle(p) {
  return `transform:translate3d(${p.x}px,${p.y}px,${p.z}px) rotateY(${p.ry}deg) scale(${p.s})`;
}
const ptab = (t, sub) => `<div class="ptab"><b>${esc(t)}</b><span>${esc(sub)}</span></div>`;
const mk = (id, x, y) => `<i class="mk" id="mk-${id}" style="left:${x}px;top:${y}px"></i>`;
const corners = (prefix, b) =>
  mk(`${prefix}-tl`, b.x, b.y) + mk(`${prefix}-tr`, b.x + b.w, b.y) + mk(`${prefix}-bl`, b.x, b.y + b.h) + mk(`${prefix}-br`, b.x + b.w, b.y + b.h);

function contentPlane(fx, A) {
  const h = fx.sections.header;
  const hero = fx.sections.hero;
  const line = (indent, html, cls = '') => `<div class="jl ${cls}" style="padding-left:${indent * 34}px">${html}</div>`;
  const k = s => `<span class="jk">"${esc(s)}"</span>`;
  const v = s => `<span class="jv">"${esc(s)}"</span>`;
  return `
  <div class="plane p-content" style="${planeStyle(PLANES.content)}">
    ${ptab(A.C.planeContent, A.C.planeContentSub)}
    <div class="tab">fixture.json</div>
    <div class="json">
      ${line(0, '{')}
      ${line(1, `${k('sections')}: {`)}
      ${line(2, `${k('header')}: {`)}
      ${line(3, `${k('headline')}: <span class="hl-words">${v(h.headline)}</span>,<i class="mk-inline" id="mk-c-words"></i>`, 'row-words')}
      ${line(3, `${k('subtitle')}: ${v(h.subtitle.length > 22 ? h.subtitle.slice(0, 21) + '…' : h.subtitle)}`)}
      ${line(2, '},')}
      ${line(2, `${k('hero')}: {`)}
      ${line(3, `${k('illustrationId')}: <span class="hl-leaf">${v(hero.illustrationId)}</span>,<i class="mk-inline" id="mk-c-leaf"></i>`, 'row-leaf')}
      ${line(3, `${k('callouts')}: [ ${hero.callouts.length} ]`)}
      ${line(2, '},')}
      ${line(2, `${k('items')}: [ ${fx.sections.items.length} ], …`)}
      ${line(1, '}')}
      ${line(0, '}')}
    </div>
    <div class="tile">
      <img src="${A.leaf}" alt="">
      <div class="tile-name">assets/web/<br>${esc(hero.illustrationId)}.png</div>
    </div>
    ${mk('c-tile', 760, 640)}
    ${mk('c-foot', 500, 1000)}
  </div>`;
}

function layoutPlane(fx, G, A) {
  const box = (id, label, extra = '') => {
    const b = G[id];
    return `<div class="wb ${extra}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px">${label ? `<span class="wl">#${esc(label)}</span>` : ''}</div>`;
  };
  const hl = G.header_headline;
  const leaf = G.hero_img;
  const hero = G.hero;
  const ids = ['callout_1', 'callout_2', 'items', 'benefitsPanel', 'footer'];
  const small = Object.keys(G).filter(id => /^(header_subtitle|item_\d|callout_\d_img|benefit_\d_row)$/.test(id));
  return `
  <div class="plane p-layout" style="${planeStyle(PLANES.layout)}">
    ${ptab(A.C.planeLayout, A.C.planeLayoutSub)}
    ${small.map(id => box(id, '', 'faint')).join('')}
    ${ids.map(id => box(id, id)).join('')}
    <div class="wb words" style="left:${hl.x}px;top:${hl.y}px;width:${hl.w}px;height:${hl.h}px">
      <span class="ghost-head">${esc(fx.sections.header.headline)}</span><span class="wl">#header_headline</span></div>
    <img class="ghost-leaf" src="${A.leaf}" style="left:${leaf.x}px;top:${leaf.y}px;width:${leaf.w}px;height:${leaf.h}px" alt="">
    <div class="wb leafbox" style="left:${leaf.x}px;top:${leaf.y}px;width:${leaf.w}px;height:${leaf.h}px"><span class="wl">#hero_img</span></div>
    <div class="dim dim-left" style="left:${hero.x}px;top:${leaf.y + leaf.h * 0.55}px;width:${leaf.x - hero.x}px"><span>left: 262</span></div>
    <div class="dim-top" style="left:${leaf.x + leaf.w + 14}px;top:${leaf.y}px;height:${hero.y - leaf.y}px"><span>top: -34</span></div>
    <div class="dim-w" style="left:${leaf.x}px;top:${leaf.y + leaf.h + 14}px;width:${leaf.w}px"><span>width: 428 · height: 640</span></div>
    ${mk('l-words', hl.x, hl.y + hl.h / 2)}
    ${corners('l-leaf', leaf)}
    ${mk('l-move', hero.x + (leaf.x - hero.x) / 2, leaf.y + leaf.h * 0.55 + 30)}
    ${mk('l-foot', 500, 1000)}
  </div>`;
}

function renderPlane(G, A) {
  const hl = G.header_headline;
  return `
  <div class="plane p-render" style="${planeStyle(PLANES.render)}">
    ${ptab(A.C.planeRender, A.C.planeRenderSub)}
    <img src="${A.poster}" alt="Fuel Well. Live Well. nutrition poster">
    ${mk('r-words', hl.x, hl.y + hl.h / 2)}
    ${corners('r-leaf', G.hero_img)}
    ${mk('r-foot', 500, 1000)}
  </div>`;
}

function page(C, fx, G, A, M) {
  const note = (key, title, body) => {
    const n = NOTES[key];
    return `<div class="note" id="note-${key}" style="left:${n.left}px;top:${n.top}px;width:${n.width}px;--c:${n.color}">
      <div class="note-t">${esc(title)}</div><div class="note-b">${md(body)}</div></div>`;
  };
  const placard = (id, title, sub) => {
    const p = M?.[`mk-${id}`];
    const pos = p ? `left:${Math.round(p.x - 120)}px;top:${Math.round(p.y + 14)}px` : 'left:0;top:0';
    return `<div class="placard" style="${pos}"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
  };
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=${W}">
<title>${esc(C.title)} · XYZ Layout Engine</title>
<style>
@font-face{font-family:'Barlow Condensed';font-weight:400;src:url(${A.fontRegular}) format('truetype')}
@font-face{font-family:'Barlow Condensed';font-weight:700;src:url(${A.fontBold}) format('truetype')}
:root{--W:${W}px;--H:${H}px}
${A.css}
</style></head>
<body>
<main class="frame">
  <div class="floor"></div>
  <header class="title">
    <h1>${esc(C.title)}</h1>
    <p>${esc(C.subtitle)}</p>
  </header>

  <section class="stage" style="perspective:${PERSPECTIVE}px;perspective-origin:${ORIGIN.x}px ${ORIGIN.y}px">
    <div class="world">
      ${contentPlane(fx, A)}
      ${layoutPlane(fx, G, A)}
      ${renderPlane(G, A)}
    </div>
  </section>

  ${M ? wires(M) : ''}


  ${note('words', C.editWordsTitle, C.editWordsBody)}
  ${note('leaf', C.swapLeafTitle, C.swapLeafBody)}
  ${note('move', C.moveLeafTitle, C.moveLeafBody)}

  <section class="bottom">
    <div class="col col-recipe">
      <h2>${esc(C.recipeTitle)}</h2>
      <ol>
        <li>${md(C.recipeStep1)}</li>
        <li>${md(C.recipeStep2)}</li>
        <li>${md(C.recipeStep3)}</li>
      </ol>
    </div>
    <div class="col col-backends">
      <h2>${esc(C.backendsTitle)}</h2>
      <div class="lane">
        <div class="lane-name">${esc(C.satoriLane)}</div>
        <div class="chips"><span class="chip scene">scene</span><i>→</i><span class="chip">Satori</span><i>→</i><span class="chip file">SVG</span><i>→</i><span class="chip">resvg</span><i>→</i><span class="chip file png">PNG</span></div>
        <p>${md(C.satoriCaption)}</p>
      </div>
      <div class="lane">
        <div class="lane-name">${esc(C.playwrightLane)}</div>
        <div class="chips"><span class="chip scene">scene</span><i>→</i><span class="chip file">HTML + CSS</span><i>→</i><span class="chip">Playwright</span><i>›</i><span class="chip">Chromium</span><i>→</i><span class="chip file png">PNG</span></div>
        <p>${md(C.playwrightCaption)}</p>
      </div>
      <p class="either">${md(C.eitherHtml)}</p>
    </div>
    <div class="col col-compare">
      <h2>${esc(C.compareTitle)}</h2>
      <div class="cards">
        <div class="card html-card">
          <div class="card-t">${esc(C.htmlCardTitle)}</div>
          <div class="live"><span>FUEL WELL. </span><span class="sel">LIVE WELL.</span><i class="caret"></i></div>
          <div class="tag">&lt;h1&gt; text</div>
          <p>${md(C.htmlCardBody)}</p>
        </div>
        <div class="card png-card">
          <div class="card-t">${esc(C.pngCardTitle)}</div>
          <div class="pixels" style="background-image:url(${A.poster})"></div>
          <div class="tag">pixels</div>
          <p>${md(C.pngCardBody)}</p>
        </div>
      </div>
    </div>
  </section>
  <footer class="foot">${esc(C.footer)}</footer>
</main>
</body></html>`;
}

// Connectors baked as static SVG from the measured, projected anchor points.
function wires(M) {
  const P = id => M[`mk-${id}`];
  const seg = (a, b, cls) => (a && b ? `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>` : '');
  const dot = (a, cls) => (a ? `<circle class="${cls}" cx="${a.x}" cy="${a.y}" r="4.5"/>` : '');
  const elbow = (from, to, cls) => {
    if (!from || !to) return '';
    if (from.v) {
      const my = from.y + (to.y - from.y) * 0.5;
      return `<path class="${cls}" d="M${from.x},${from.y} C${from.x},${my} ${to.x},${my} ${to.x},${to.y}"/>`;
    }
    const mx = from.x + (to.x - from.x) * 0.35;
    return `<path class="${cls}" d="M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}"/>`;
  };
  const noteAnchor = key => {
    const n = NOTES[key];
    const r = M[`note-${key}`];
    if (!r) return null;
    if (key === 'words') return { x: r.x + r.w, y: r.y + 24 };
    return { x: r.x + r.w - 40, y: r.y, v: true };
  };
  const leaf = ['tl', 'tr', 'bl', 'br'];
  return `<svg class="wires" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <g>
      ${seg(P('c-words'), P('l-words'), 'ray words')}
      ${seg(P('l-words'), P('r-words'), 'ray words')}
      ${seg(P('c-leaf'), P('c-tile'), 'ray leaf thin')}
      ${leaf.map(c => seg(P(`l-leaf-${c}`), P(`r-leaf-${c}`), 'ray leaf')).join('')}
      ${elbow(P('c-tile'), P('l-leaf-tl'), 'ray leaf')}
      ${elbow(noteAnchor('words'), P('c-words'), 'lead words')}
      ${elbow(noteAnchor('leaf'), P('c-leaf'), 'lead leaf')}
      ${elbow(noteAnchor('move'), P('l-move'), 'lead move')}
      ${['c-words', 'l-words', 'r-words'].map(id => dot(P(id), 'dot words')).join('')}
      ${dot(P('c-leaf'), 'dot leaf')}${dot(P('c-tile'), 'dot leaf')}
      ${leaf.map(c => dot(P(`r-leaf-${c}`), 'dot leaf')).join('')}
      ${dot(P('l-move'), 'dot move')}
    </g></svg>`;
}

async function main() {
  const C = JSON.parse(await read('output/src/content.json'));
  const fx = JSON.parse(await read('nutrition/fixture.json'));
  const A = {
    css: await fs.readFile(path.join(SRC, 'style.css'), 'utf8'),
    poster: await uri('nutrition/render.png', 'image/png'),
    leaf: await uri(`nutrition/assets/web/${fx.sections.hero.illustrationId}.png`, 'image/png'),
    fontRegular: await uri('fonts/BarlowCondensed-Regular.ttf', 'font/ttf'),
    fontBold: await uri('fonts/BarlowCondensed-Bold.ttf', 'font/ttf'),
  };
  A.C = C;

  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    // Offline by construction: only file: and data: loads are allowed.
    await context.route('**/*', route => (/^(file|data):/.test(route.request().url()) ? route.continue() : route.abort()));
    const pg = await context.newPage();

    const G = await measurePoster(pg);

    // Pass 1: where did the 3D anchors land?
    await pg.setContent(page(C, fx, G, A, null), { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    const M = await pg.evaluate(() => {
      const out = {};
      for (const el of document.querySelectorAll('[id^="mk-"],[id^="note-"]')) {
        const r = el.getBoundingClientRect();
        out[el.id] = el.id.startsWith('note-')
          ? { x: r.x, y: r.y, w: r.width, h: r.height }
          : { x: Math.round((r.x + r.width / 2) * 10) / 10, y: Math.round((r.y + r.height / 2) * 10) / 10 };
      }
      return out;
    });

    // Pass 2: static HTML with baked wires, then capture that exact file.
    const html = page(C, fx, G, A, M);
    const htmlPath = path.join(OUT, 'index.html');
    await fs.writeFile(htmlPath, html);
    await pg.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
    await pg.screenshot({ path: path.join(OUT, 'poster.png'), clip: { x: 0, y: 0, width: W, height: H } });
    const kb = (await fs.stat(htmlPath)).size / 1024;
    console.log(`wrote output/index.html (${kb.toFixed(0)} KiB) and output/poster.png (${W}x${H})`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
