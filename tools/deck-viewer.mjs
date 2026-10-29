// Browsable HTML viewer for a slide deck folder, the repeatable last step of a deck example.
//
// A deck folder is <dir>/deck.json ({ title, width, height, slides: [slug, ...] }) plus the frames its render
// script wrote: <dir>/renders/<slug>.png (Satori + resvg) and, when present, <dir>/renders/<slug>-chromium.png
// (headless Chromium). Each optional <dir>/slides/<slug>.json supplies the caption and alt text (eyebrow, title).
// The viewer is one static index.html next to those files: relative links, no inlined bytes, no dependencies, no
// timestamps, so it opens from a checkout, a file:// URL or GitHub Pages and the file repeats byte for byte.
// One slide at a time with arrow keys, a thumbnail strip, a backend switch and a grid view (the contact sheet).
//
//   node tools/deck-viewer.mjs examples/2026-10-29-talk-deck            # writes <dir>/index.html
//   node tools/deck-viewer.mjs <dir> --out <file>                        # writes elsewhere (links stay relative to <dir>)
//
// Exits 1 when deck.json or any Satori frame is missing: a viewer with broken frames must not be published.
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const outFlag = args.indexOf('--out');
if (!dir) { console.error('usage: node tools/deck-viewer.mjs <deck-dir> [--out <file>]'); process.exit(1); }
const ROOT = path.resolve(dir);
const OUT = outFlag >= 0 ? path.resolve(args[outFlag + 1]) : path.join(ROOT, 'index.html');
const rel = p => path.relative(path.dirname(OUT), path.join(ROOT, p)).split(path.sep).join('/');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));

export async function buildViewer(root) {
  const deckPath = path.join(root, 'deck.json');
  if (!existsSync(deckPath)) throw new Error(`deck-viewer: ${deckPath} not found`);
  const deck = await readJson(deckPath);
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) throw new Error('deck-viewer: deck.json has no slides');
  const slides = [];
  for (const slug of deck.slides) {
    const png = path.join(root, 'renders', `${slug}.png`);
    if (!existsSync(png)) throw new Error(`deck-viewer: missing frame renders/${slug}.png (run the deck's render script first)`);
    const fixture = path.join(root, 'slides', `${slug}.json`);
    const copy = existsSync(fixture) ? await readJson(fixture) : {};
    slides.push({
      slug,
      title: copy.title ?? slug,
      eyebrow: copy.eyebrow ?? '',
      fixture: existsSync(fixture) ? `slides/${slug}.json` : null,
      chromium: existsSync(path.join(root, 'renders', `${slug}-chromium.png`)),
    });
  }
  const backends = [{ key: '', name: 'Satori + resvg' }];
  if (slides.every(s => s.chromium)) backends.push({ key: '-chromium', name: 'Chromium' });
  const links = [['README.md', 'README'], ['DESIGN.md', 'DESIGN.md'], ['deck.pdf', 'PDF'], ['verification.json', 'Verification'], ['provenance.json', 'Provenance']]
    .filter(([f]) => existsSync(path.join(root, f)));
  return { deck, slides, backends, links };
}

export function viewerHtml({ deck, slides, backends, links }, rel) {
  const n = slides.length, W = deck.width, H = deck.height;
  const data = slides.map(s => ({ slug: s.slug, title: s.title, eyebrow: s.eyebrow, fixture: s.fixture, png: rel(`renders/${s.slug}.png`) }));
  const alt = s => `Slide ${s.slug}: ${s.eyebrow ? s.eyebrow + ' · ' : ''}${s.title}`;
  const thumbs = slides.map((s, i) => `<button class="thumb" data-i="${i}" aria-label="Go to slide ${i + 1}"><img src="${esc(rel(`renders/${s.slug}.png`))}" alt="" loading="lazy" width="${W}" height="${H}"><span>${i + 1}</span></button>`).join('');
  const grid = slides.map((s, i) => `<figure><a href="${esc(rel(`renders/${s.slug}.png`))}"><img src="${esc(rel(`renders/${s.slug}.png`))}" alt="${esc(alt(s))}" loading="lazy" width="${W}" height="${H}"></a><figcaption><b>${i + 1}</b> ${esc(s.title)}${s.fixture ? ` <code>${esc(s.fixture)}</code>` : ''}</figcaption></figure>`).join('');
  const backendUI = backends.length > 1
    ? `<fieldset class="seg" id="backend"><legend>Backend</legend>${backends.map((b, i) => `<label><input type="radio" name="backend" value="${esc(b.key)}"${i === 0 ? ' checked' : ''}>${esc(b.name)}</label>`).join('')}</fieldset>`
    : `<span class="meta">${esc(backends[0].name)}</span>`;
  const linkRow = links.map(([f, name]) => `<a href="${esc(rel(f))}">${esc(name)}</a>`).join(' · ');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(deck.title)} — deck viewer</title>
<style>
:root{--ink:#14161A;--muted:#4A5160;--rule:#D9DCE2;--fill:#F3F4F6;--accent:#1F4FC4}
body{margin:0;padding:24px;background:#fff;color:var(--ink);font:16px/1.5 system-ui,sans-serif}
main{max-width:1600px;margin:auto}
h1{font-size:28px;line-height:1.2;margin:0 0 4px}
.meta{color:var(--muted)}
.links{margin:8px 0 16px}
a{color:var(--accent)}
.bar{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;padding:12px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
button{font:inherit;padding:6px 14px;border:1px solid var(--rule);border-radius:6px;background:var(--fill);color:var(--ink);cursor:pointer}
button:hover{border-color:var(--muted)}
.seg{display:inline-flex;gap:12px;border:0;padding:0;margin:0}
.seg legend{position:absolute;left:-9999px}
.counter{font-variant-numeric:tabular-nums;min-width:5em}
.stage{margin:16px 0 8px;background:var(--fill);border:1px solid var(--rule)}
.stage img{display:block;width:100%;height:auto;aspect-ratio:${W}/${H}}
.caption{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--muted)}
.caption b{color:var(--ink)}
.strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:16px 0}
.thumb{position:relative;padding:0;background:#fff;border:2px solid var(--rule);border-radius:4px;overflow:hidden}
.thumb[aria-current="true"]{border-color:var(--accent)}
.thumb img{display:block;width:100%;height:auto}
.thumb span{position:absolute;left:4px;bottom:4px;padding:0 6px;font-size:12px;background:#fff;border-radius:3px;color:var(--muted)}
.grid{display:none;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:16px}
figure{margin:0}
.grid img{display:block;width:100%;height:auto;border:1px solid var(--rule)}
figcaption{margin:8px 0 0;color:var(--muted)}
code{font-size:14px}
body.grid-mode .stage,body.grid-mode .caption,body.grid-mode .strip{display:none}
body.grid-mode .grid{display:grid}
@media(max-width:800px){body{padding:12px}.grid{grid-template-columns:1fr}}
</style></head><body><main>
<h1>${esc(deck.title)}</h1>
<p class="meta">${n} slides · ${W} × ${H} · rendered by XYZ Layout Engine</p>
${linkRow ? `<p class="links">${linkRow}</p>` : ''}
<div class="bar">
<button id="prev" aria-label="Previous slide">← Prev</button><span class="counter" id="counter">1 / ${n}</span><button id="next" aria-label="Next slide">Next →</button>
${backendUI}
<button id="mode" aria-pressed="false">Grid</button>
<span class="meta">Keys: ← → Home End · G grid</span>
</div>
<div class="stage"><a id="full" href="${esc(data[0].png)}"><img id="frame" src="${esc(data[0].png)}" alt="${esc(alt(slides[0]))}" width="${W}" height="${H}"></a></div>
<p class="caption"><span><b id="cap-title"></b> <span id="cap-eyebrow"></span></span><span id="cap-file"></span></p>
<div class="strip" id="strip">${thumbs}</div>
<div class="grid">${grid}</div>
</main>
<script>
const S=${JSON.stringify(data)};const N=S.length;let i=0,backend='';
const $=id=>document.getElementById(id);
const src=s=>backend?s.png.replace(/\\.png$/,backend+'.png'):s.png;
function show(k){i=(k+N)%N;const s=S[i];$('frame').src=src(s);$('full').href=src(s);
$('frame').alt='Slide '+s.slug+': '+(s.eyebrow?s.eyebrow+' · ':'')+s.title;
$('counter').textContent=(i+1)+' / '+N;$('cap-title').textContent=s.title;$('cap-eyebrow').textContent=s.eyebrow;
$('cap-file').textContent=s.fixture||s.slug;
document.querySelectorAll('.thumb').forEach((t,k)=>t.setAttribute('aria-current',k===i?'true':'false'));
history.replaceState(null,'','#'+(i+1)+(backend?'/'+backend.slice(1):''));}
function mode(on){document.body.classList.toggle('grid-mode',on);$('mode').setAttribute('aria-pressed',String(on));$('mode').textContent=on?'Slides':'Grid';}
$('prev').onclick=()=>show(i-1);$('next').onclick=()=>show(i+1);
$('mode').onclick=()=>mode(!document.body.classList.contains('grid-mode'));
$('strip').addEventListener('click',e=>{const t=e.target.closest('.thumb');if(t){mode(false);show(+t.dataset.i);}});
const bk=$('backend');if(bk)bk.addEventListener('change',e=>{backend=e.target.value;show(i);});
addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;
if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ')show(i+1);else if(e.key==='ArrowLeft'||e.key==='PageUp')show(i-1);
else if(e.key==='Home')show(0);else if(e.key==='End')show(N-1);else if(e.key==='g'||e.key==='G')mode(!document.body.classList.contains('grid-mode'));else return;e.preventDefault();});
function init(){const m=/^#(\\d+)(?:\\/(\\w+))?/.exec(location.hash);
if(m&&bk&&m[2]){const r=bk.querySelector('input[value="-'+m[2]+'"]');if(r){r.checked=true;backend=r.value;}}
show(m?Math.min(N,Math.max(1,+m[1]))-1:0);}
addEventListener('hashchange',init);init();
</script></body></html>
`;
}

let model;
try { model = await buildViewer(ROOT); } catch (err) { console.error(err.message); process.exit(1); }
const html = viewerHtml(model, rel);
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, html);
console.log(`${path.relative(process.cwd(), OUT)}: ${model.slides.length} slides, ${model.backends.length} backend${model.backends.length > 1 ? 's' : ''}, ${html.length} bytes`);
