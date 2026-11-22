// Rebuild: node output/build.mjs   (writes output/index.html and output/poster.png)
// Edit captions in output/src/content.json; layout and styling live in this file.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const out = path.dirname(fileURLToPath(import.meta.url));
const packet = path.resolve(out, '..');
const W = 2000, H = 1560;
const read = p => fs.readFile(path.join(packet, p));
const uri = async (p, mime = 'image/png') => `data:${mime};base64,${(await read(p)).toString('base64')}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const c = JSON.parse(await fs.readFile(path.join(out, 'src/content.json'), 'utf8'));
const fixture = JSON.parse(await read('nutrition/fixture.json'));
const { header, hero, items } = fixture.sections;
const heroId = hero.illustrationId;
const art = {};
for (const id of [heroId, ...hero.callouts.map(x => x.illustrationId), ...items.map(x => x.illustrationId)])
  art[id] = await uri(`nutrition/assets/web/${id}.png`);
const finished = await uri('nutrition/render.png');
const fontR = await uri('fonts/BarlowCondensed-Regular.ttf', 'font/ttf');
const fontB = await uri('fonts/BarlowCondensed-Bold.ttf', 'font/ttf');

const bars = [[84, 445, 190], [100, 478, 160], [750, 445, 140], [740, 478, 160], [55, 847, 105], [35, 878, 145], [257, 847, 90], [230, 878, 145],
  [440, 847, 112], [420, 878, 150], [645, 847, 92], [622, 878, 140], [850, 703, 70], [850, 767, 96], [850, 822, 76], [850, 877, 92], [200, 947, 400]]
  .map(([x, y, w]) => `<i style="left:${x}px;top:${y}px;width:${w}px"></i>`).join('');
const itemX = [28, 222, 420, 618];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)}</title>
<style>
@font-face{font-family:'Barlow Condensed';font-weight:400;src:url(${fontR})}
@font-face{font-family:'Barlow Condensed';font-weight:700;src:url(${fontB})}
*{box-sizing:border-box;margin:0}
html,body{background:#10241a}
#fit{overflow:hidden}
#stage{position:relative;width:${W}px;height:${H}px;transform-origin:0 0;overflow:hidden;font-family:'Barlow Condensed',sans-serif;color:#fbfaf3;
  background:radial-gradient(ellipse at 55% 45%,#24512f 0%,#17361f 55%,#0f2416 100%)}
.kicker{position:absolute;left:60px;top:38px;font-size:30px;letter-spacing:5px;color:#b9d79b}
h1{position:absolute;left:56px;top:62px;font-size:138px;line-height:1.1;font-weight:700;letter-spacing:2px}
.sub{position:absolute;left:1180px;top:118px;font-size:52px;color:#d8ecc0;width:780px;text-align:right}
.col{position:absolute;top:248px;font-size:40px;font-weight:700;letter-spacing:4px;color:#b9d79b}
.col b{display:inline-block;width:44px;height:6px;background:#7fb04a;vertical-align:middle;margin-right:14px}
.card{position:absolute;left:56px;width:580px;background:#fbfaf3;color:#1f2a1c;border-radius:22px;padding:24px 28px 22px 28px;border-left:18px solid var(--k);box-shadow:0 14px 30px rgba(0,0,0,.35)}
.card h2{white-space:nowrap;font-size:43px;line-height:1;font-weight:700;color:#1f2a1c;padding-left:92px;min-height:76px;display:flex;align-items:center}
.badge{position:absolute;width:76px;height:76px;border-radius:50%;background:var(--k);color:#fff;font-weight:700;font-size:56px;line-height:76px;text-align:center;box-shadow:0 0 0 6px #fff,0 6px 14px rgba(0,0,0,.4);z-index:6}
.card .badge{left:22px;top:24px}
.file{display:inline-block;margin-top:14px;font-size:31px;font-weight:700;color:#fff;background:#2f5d27;border-radius:8px;padding:2px 14px;letter-spacing:.5px}
pre{margin-top:12px;font:600 21px/1.35 ui-monospace,Menlo,Consolas,monospace;background:#eef3df;border:2px solid #b9d79b;border-radius:10px;padding:10px 14px;color:#3d4639;white-space:pre}
pre mark{background:var(--k);color:#fff;border-radius:5px;padding:1px 5px}
.note{margin-top:12px;font-size:29px;line-height:1.18;color:#3d4639}
.swap{display:flex;gap:18px;align-items:center;margin-top:12px}
.swap img{width:88px;height:132px;object-fit:contain;background:repeating-conic-gradient(#dfe6cf 0 25%,#fff 0 50%) 0 0/22px 22px;border:3px solid var(--k);border-radius:8px}
.swap pre{margin-top:0;flex:1}
.plane{position:absolute;width:470px;height:470px;transform-origin:0 0;transform:skewY(-14deg) scaleX(.62);border:5px solid #fbfaf3;border-radius:10px;overflow:hidden;box-shadow:-14px 16px 26px rgba(0,0,0,.4)}
.inner{position:relative;width:1000px;height:1000px;transform-origin:0 0;transform:scale(.47)}
.inner img{position:absolute;object-fit:contain}
.words{background:rgba(214,236,190,.2)}
.words .hl{position:absolute;left:0;top:20px;width:1000px;text-align:center;font-size:66px;font-weight:700;letter-spacing:1.2px;color:#fff;text-transform:uppercase;white-space:nowrap}
.words .hl span{background:var(--k1);padding:0 22px;border-radius:10px}
.words .st{position:absolute;left:0;top:104px;width:1000px;text-align:center;font-size:36px;color:#fbfaf3}
.words i{position:absolute;height:18px;border-radius:9px;background:#d8ecc0;opacity:.85}
.artp{background:rgba(214,236,190,.2)}
.paper{background:radial-gradient(circle at 50% 44%,#fffef8 0%,#f7f3e3 58%,#ede6cf 100%)}
.paper u{position:absolute;border:4px solid #b9d79b;background:#f4f8ea;border-radius:22px}
.ring2{position:absolute;left:250px;top:120px;width:500px;height:600px;border:14px solid var(--k2);border-radius:50%}
.lname{position:absolute;font-size:38px;font-weight:700;letter-spacing:2px;color:#fbfaf3;line-height:1}
.lname small{display:block;font-size:26px;font-weight:400;letter-spacing:0;color:#d8ecc0;margin-top:5px;width:148px;line-height:1.1}
.fin{position:absolute;left:1352px;top:372px;width:592px;height:592px;border:6px solid #fbfaf3;border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
.fin img{width:100%;height:100%;display:block}
.fin .r{position:absolute;border:7px solid var(--k);box-shadow:0 0 0 3px #fff,inset 0 0 0 3px #fff}
.seenote{position:absolute;left:1352px;top:984px;width:592px;text-align:center;font-size:30px;color:#d8ecc0}
svg{position:absolute;left:0;top:0;z-index:5;pointer-events:none}
.route{position:absolute;left:56px;top:1176px;width:1888px}
.route h3{font-size:40px;font-weight:700;letter-spacing:4px;color:#b9d79b}
.steps{display:flex;margin-top:10px;gap:0}
.step{flex:1;height:172px;background:#fbfaf3;color:#1f2a1c;padding:14px 20px 0 62px;clip-path:polygon(0 0,calc(100% - 40px) 0,100% 50%,calc(100% - 40px) 100%,0 100%,40px 50%);margin-right:-18px}
.step:first-child{clip-path:polygon(0 0,calc(100% - 40px) 0,100% 50%,calc(100% - 40px) 100%,0 100%);padding-left:26px;border-radius:14px 0 0 14px}
.step:last-child{background:#7fb04a;margin-right:0}
.step em{font-style:normal;font-size:24px;letter-spacing:1px;color:#2f5d27;font-weight:700;display:block;white-space:nowrap}
.step strong{font-size:46px;line-height:1;display:block;white-space:nowrap}
.step p{font-size:26px;line-height:1.12;margin-top:6px;color:#3d4639;max-width:285px}
.step:last-child p,.step:last-child em{color:#12300f}
.cmd{display:flex;align-items:center;gap:22px;margin-top:16px}
.cmd span{font-size:28px;font-weight:700;letter-spacing:2px;color:#b9d79b;white-space:nowrap}
.cmd code{font:600 29px/1 ui-monospace,Menlo,Consolas,monospace;background:#0b1a10;border:2px solid #7fb04a;color:#eaf6d8;border-radius:10px;padding:14px 20px;white-space:nowrap}
.tip{margin-top:12px;font-size:28px;color:#d8ecc0}.tip code{font:600 24px/1 ui-monospace,Menlo,Consolas,monospace;color:#eaf6d8;background:#0b1a10;border-radius:6px;padding:4px 10px;margin-left:8px}
</style></head>
<body><div id="fit"><div id="stage" style="--k1:#f26a1b;--k2:#2f7df6">
<div class="kicker">${esc(c.kicker)}</div>
<h1>${esc(c.title)}</h1>
<div class="sub">${esc(c.subtitle)}</div>

<div class="col" style="left:56px"><b></b>${esc(c.columns.edit)}</div>
<div class="col" style="left:690px"><b></b>${esc(c.columns.build)}</div>
<div class="col" style="left:1352px"><b></b>${esc(c.columns.see)}</div>

<div class="card" style="top:316px;--k:var(--k1)" data-a="c1">
  <div class="badge">1</div><h2>${esc(c.edit1.heading)}</h2>
  <div class="file">${esc(c.edit1.file)}</div>
  <pre>"header": {
  "headline": <mark>"${esc(header.headline)}"</mark></pre>
  <div class="note">${esc(c.edit1.note)}</div>
</div>

<div class="card" style="top:700px;--k:var(--k2)" data-a="c2">
  <div class="badge">2</div><h2>${esc(c.edit2.heading)}</h2>
  <div class="file">nutrition/assets/web/${esc(heroId)}.png</div>
  <div class="swap"><img src="${art[heroId]}" alt="hero artwork file"><pre>"hero": {
  "illustrationId":
    <mark>"${esc(heroId)}"</mark></pre></div>
  <div class="note">${esc(c.edit2.note)}</div>
</div>

<div class="plane paper" style="left:1030px;top:500px;z-index:1"><div class="inner">
  <u style="left:788px;top:684px;width:186px;height:236px"></u><u style="left:32px;top:932px;width:938px;height:52px;border-radius:26px"></u>
</div></div>
<div class="plane artp" style="left:865px;top:500px;z-index:2"><div class="inner">
  <img src="${art[hero.callouts[0].illustrationId]}" style="left:44px;top:226px;width:280px;height:210px" alt="">
  <img src="${art[hero.callouts[1].illustrationId]}" style="left:676px;top:226px;width:280px;height:210px" alt="">
  ${items.map((it, i) => `<img src="${art[it.illustrationId]}" style="left:${itemX[i]}px;top:672px;width:160px;height:170px" alt="">`).join('')}
  <img data-a="p2" src="${art[heroId]}" style="left:286px;top:112px;width:428px;height:640px" alt="hero artwork">
  <div class="ring2"></div>
</div></div>
<div class="plane words" style="left:700px;top:500px;z-index:3"><div class="inner">
  <div class="hl"><span data-a="p1">${esc(header.headline)}</span></div>
  <div class="st">${esc(header.subtitle)}</div>${bars}
</div></div>
${c.layers.map((l, i) => `<div class="lname" style="left:${708 + i * 165}px;top:990px">${esc(l.name)}<small>${esc(l.note)}</small></div>`).join('')}

<div class="fin">
  <img src="${finished}" alt="Finished Fuel Well poster">
  <div class="r" data-a="f1" style="--k:var(--k1);left:14%;top:2%;width:72%;height:7.4%;border-radius:14px"></div>
  <div class="r" data-a="f2" style="--k:var(--k2);left:33%;top:13.5%;width:34%;height:56%;border-radius:50%"></div>
  <div class="badge" style="--k:var(--k1);left:-40px;top:-6px">1</div>
  <div class="badge" style="--k:var(--k2);left:-40px;top:230px">2</div>
</div>
<div class="seenote">${esc(c.seeNote)}</div>

<svg id="wires" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
  <marker id="m1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#f26a1b"/></marker>
  <marker id="m2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2f7df6"/></marker>
</defs></svg>

<div class="route">
  <h3>${esc(c.routeTitle)}</h3>
  <div class="steps">${c.route.map(s => `<div class="step"><em>${esc(s.where)}</em><strong>${esc(s.name)}</strong><p>${esc(s.does)}</p></div>`).join('')}</div>
  <div class="cmd"><span>${esc(c.commandLabel)}</span><code>${esc(c.command)}</code></div>
  <div class="tip">${esc(c.commandTip)}<code>${esc(c.commandTipCode)}</code></div>
</div>
</div></div>
<script>
(function(){
  var stage=document.getElementById('stage'),fit=document.getElementById('fit'),svg=document.getElementById('wires');
  function box(k){var s=stage.getBoundingClientRect(),r=document.querySelector('[data-a="'+k+'"]').getBoundingClientRect(),z=s.width/${W};
    return {l:(r.left-s.left)/z,t:(r.top-s.top)/z,r:(r.right-s.left)/z,b:(r.bottom-s.top)/z,cx:((r.left+r.right)/2-s.left)/z,cy:((r.top+r.bottom)/2-s.top)/z};}
  function seg(n,col,a,e){
    var k=Math.max(50,(e[0]-a[0])*.45),d='M'+a[0]+' '+a[1]+' C'+(a[0]+k)+' '+a[1]+' '+(e[0]-k)+' '+e[1]+' '+e[0]+' '+e[1];
    svg.insertAdjacentHTML('beforeend','<path d="'+d+'" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" marker-end="url(#m'+n+')"/><circle cx="'+a[0]+'" cy="'+a[1]+'" r="13" fill="'+col+'" stroke="#fff" stroke-width="5"/>');}
  function wire(n,col,a,p,e){seg(n,col,a,[p.l-14,p.cy+(p.b-p.t)*.2]);seg(n,col,[p.r+14,p.cy-(p.b-p.t)*.2],e);}
  function draw(){
    var c1=box('c1'),p1=box('p1'),f1=box('f1'),c2=box('c2'),p2=box('p2'),f2=box('f2');
    wire(1,'#f26a1b',[c1.r,c1.t+62],p1,[f1.l-8,f1.cy]);
    wire(2,'#2f7df6',[c2.r,c2.t+62],p2,[f2.l-8,f2.cy]);}
  function size(){var z=Math.min(1,document.documentElement.clientWidth/${W});stage.style.transform='scale('+z+')';fit.style.height=(${H}*z)+'px';}
  size();draw();window.addEventListener('resize',size);
})();
</script>
</body></html>
`;

await fs.writeFile(path.join(out, 'index.html'), html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('file://' + path.join(out, 'index.html'));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(out, 'poster.png'), clip: { x: 0, y: 0, width: W, height: H } });
// 400 px preview used only to check the thumbnail read; not a deliverable.
await page.setViewportSize({ width: 400, height: 280 });
await page.screenshot({ path: path.join(out, 'src/preview-400.png') });
await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('wrote output/index.html and output/poster.png');
