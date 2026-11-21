// Run from the evaluator's checkout; hand the model only the candidate ZIP.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [folder, ballotFile] = process.argv.slice(2);
if (!folder) throw Error('Usage: node grade.mjs OUTPUT_DIRECTORY [completed-ballot.json]');
const rubric = JSON.parse(await fs.readFile(new URL('./rubric.json', import.meta.url)));
const ballot = ballotFile ? JSON.parse(await fs.readFile(ballotFile)) : null;
if (ballot && (ballot.version !== rubric.version ||
    Object.keys(ballot.answers ?? {}).length !== rubric.observations.length)) {
  throw Error('Expected one answer per criterion and the current rubric version');
}
const rows = [];
let captions = "";
function record(id, possible, pass, evidence) {
  rows.push({ id, possible, earned: pass === null ? null : pass ? possible : 0, evidence });
}
for (const [id, points, question] of rubric.observations) {
  const answer = ballot?.answers[id];
  if (ballot && (typeof answer?.pass !== 'boolean' || !answer.evidence?.trim())) {
    throw Error('Missing verdict or evidence for ' + id);
  }
  record(id, points, answer?.pass ?? null, answer?.evidence ?? question);
}
async function input(name) {
  const file = path.join(folder, name);
  try {
    const stat = await fs.lstat(file);
    return stat.isFile() && stat.size <= 64 * 1024 * 1024 ? await fs.readFile(file) : null;
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
const [png, html] = await Promise.all([input('poster.png'), input('index.html')]);
const browser = await chromium.launch();
try {
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:1000,height:1000}});
  // Serve the submitted HTML from memory. All other resource requests are blocked.
  const url = 'https://submission.invalid/';
  const blocked = [];
  await context.route('**/*', route => {
    if (html && route.request().url() === url && route.request().isNavigationRequest()) {
      return route.fulfill({contentType:'text/html',body:html});
    }
    blocked.push(route.request().resourceType());
    return route.abort();
  });
  await context.routeWebSocket('**/*', socket => { blocked.push('websocket'); socket.close(); });
  const probe = await context.newPage();
  // Bound decoded dimensions before asking Chromium to open a submitted PNG.
  async function imageStats(bytes) {
    return probe.evaluate(async src => {
      const im = new Image(); im.src = src; await im.decode();
      const c = document.createElement('canvas'); c.width = c.height = 32;
      const g = c.getContext('2d'); g.fillStyle = 'white'; g.fillRect(0,0,32,32); g.drawImage(im,0,0,32,32);
      const p = g.getImageData(0,0,32,32).data;
      const colors = new Set();
      for(let i=0;i<p.length;i+=4) colors.add((p[i]>>4)*256+(p[i+1]>>4)*16+(p[i+2]>>4));
      return {width:im.naturalWidth,height:im.naturalHeight,colors:colors.size};
    }, 'data:image/png;base64,'+bytes.toString('base64')).catch(()=>null);
  }
  let stats;
  if (png?.length >= 33 && png.subarray(0,8).toString('hex') === '89504e470d0a1a0a' &&
      png.readUInt32BE(16) * png.readUInt32BE(20) <= 16_000_000) {
    stats = await imageStats(png);
  }
  const picture = stats && Math.min(stats.width,stats.height)>=800 && stats.colors>=8;
  record('png', 6, !!picture, stats ?? 'Missing or invalid PNG');
  let offline=false, match=false, detail='Missing HTML';
  if (html) {
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e=>errors.push(e.message));
    try {
      if (picture) await page.setViewportSize({width:stats.width,height:stats.height});
      await page.goto(url,{waitUntil:'load',timeout:10000});
      await page.locator('body').screenshot({timeout:5000,animations:'disabled'});
      const visible = await page.evaluate(()=>({
        title:document.title,
        text:document.body.innerText.trim().length,
        graphics:document.querySelectorAll('img,svg,canvas').length,
        imagesReady:[...document.images].every(i=>i.complete && i.naturalWidth>0)
      }));
      const shot = await page.screenshot({timeout:5000,animations:'disabled'});
      const painted = await imageStats(shot);
      offline = painted?.colors >= 2 && visible.imagesReady && !blocked.length && !errors.length;
      if (offline) captions = await page.evaluate(() => {
        const words = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode, parent = node.parentElement;
          if (!parent || !parent.checkVisibility({opacityProperty:true,visibilityProperty:true})) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          const box = range.getBoundingClientRect();
          if (box.width && box.height && box.bottom > 0 && box.right > 0 &&
              box.left < innerWidth && box.top < innerHeight) words.push(node.textContent);
        }
        return words.join(' ').replace(/\s+/g,' ').toLowerCase();
      });
      detail={...visible,paintedColors:painted?.colors,blocked,errors};
      if (offline && picture) {
        const error = await probe.evaluate(async urls=>{
          const samples=await Promise.all(urls.map(async src=>{
            const im=new Image(); im.src=src; await im.decode();
            const c=document.createElement('canvas'); c.width=c.height=80;
            const g=c.getContext('2d'); g.fillStyle='white'; g.fillRect(0,0,80,80); g.drawImage(im,0,0,80,80);
            return g.getImageData(0,0,80,80).data;
          }));
          return samples[0].reduce((sum,v,i)=>sum+Math.abs(v-samples[1][i]),0)/(80*80*3);
        },[png,shot].map(b=>'data:image/png;base64,'+b.toString('base64')));
        detail.meanChannelDifference=error; match=error<=3;
      }
    } catch(e) {detail=String(e.message).slice(0,300);}
  }
  record('html',6,offline,detail);
  record('sameDesign',8,match,'HTML viewport at PNG dimensions; 80×80 RGB mean error threshold 3/255.');
} finally { await browser.close(); }
const possible=rows.reduce((sum,r)=>sum+r.possible,0);
if(possible!==100) throw Error('Rubric must total 100');
const earned=rows.reduce((sum,r)=>sum+(r.earned??0),0);
const pending=rows.filter(r=>r.earned===null).reduce((sum,r)=>sum+r.possible,0);
// Concept proximity is a repeatable proxy for technical coverage, not a semantic verdict.
const concepts = [
  ['editWords', /headline|heading|title/, /fixture|json/],
  ['swapArt', /leaf|illustration|artwork/, /asset|replace|swap|choose/],
  ['geometry', /leaf|hero_img/, /(?:left[\s:=\x27"]+262|top[\s:=\x27"]+-34|width[\s:=\x27"]+428|height[\s:=\x27"]+640)\b/],
  ['runtime', /node\.?js|node runtime/, /recipe|javascript/],
  ['styling', /css/, /style|position|width|layout/],
  ['vector', /satori/, /svg/],
  ['raster', /resvg/, /png/],
  ['browser', /playwright/, /chromium/],
  ['capture', /chromium/, /png|screenshot/],
  ['portable', /offline|self-contained/, /html/]
];
function nearby(a,b) {
  for (const hit of captions.matchAll(new RegExp(a.source,'g'))) {
    if (b.test(captions.slice(Math.max(0,hit.index-200),hit.index+hit[0].length+200))) return true;
  }
  return false;
}
const technicalCoverage = concepts.map(([id,a,b])=>({id,points:nearby(a,b)?8:0}));
const artifactPoints = rows.slice(-3).reduce((sum,r)=>sum+r.earned,0);
const automatedPercent = artifactPoints + technicalCoverage.reduce((sum,r)=>sum+r.points,0);
console.log(JSON.stringify({version:rubric.version,automatedPercent,technicalCoverage,gradePercent:pending?null:earned,
  earned,pending,possible,criteria:rows},null,2));
