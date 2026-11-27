const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.dirname(__dirname);
const read = p => fs.readFileSync(path.join(root,p));
const embed = (p,mime) => 'data:'+mime+';base64,'+read(p).toString('base64');
const poster = embed('nutrition/render.png','image/png');
const font = embed('fonts/BarlowCondensed-Bold.ttf','font/ttf');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fuel Well • Poster edit guide</title><style>
@font-face{font-family:b;src:url(${font})}*{box-sizing:border-box}body{margin:0;background:#342336;color:#fff6e9;font-family:Arial,sans-serif}main{width:100%;container-type:inline-size}.sheet{font-size:2cqw;padding:4.5cqw}.mast,.legend{display:flex;justify-content:space-between;font:bold .8em monospace;letter-spacing:.1em}.mast{border-bottom:2px solid #a98d9e;padding-bottom:1em}.mast b{color:#daf675}h1,h2,h3,p{margin:0}h1,h2,h3{font-family:b,Arial,sans-serif}h1{font-size:5.5em;letter-spacing:-.035em;line-height:1;margin:.18em 0 .22em}.legend{background:#daf675;color:#302133;padding:.8em 1em}.spread{display:grid;grid-template-columns:37% 60%;gap:3%;margin:1.2em 0}.notes{display:flex;flex-direction:column;justify-content:space-around}.num,.pin{background:#ffac89;color:#342336;border-radius:100%;display:inline-grid;place-items:center;font:bold 1em monospace;width:1.7em;height:1.7em}.second{background:#daf675}h2{font-size:2.1em;line-height:1.12;margin:.13em 0}.notes code{font-size:.91em;line-height:1.4;color:#ffd2bd}.notes p{line-height:1.36;margin-top:.5em}.proof{margin:0;position:relative;align-self:center;background:#fff6e9;padding:.35em}.proof img{width:100%;display:block}.pin{position:absolute;border:2px solid #342336;left:-.6em;top:5%}.pin.second{left:39%;top:36%}.route{border-top:2px solid #a98d9e;padding-top:.8em}.route h2{font-size:2.2em}.steps{margin-top:.65em;display:flex;align-items:stretch;color:#342336}.step{background:#f6eddf;padding:.65em .75em;flex:1}.step:last-child{background:#daf675}.arrow{align-self:center;color:#ffac89;padding:0 .27em;font-weight:bold}.step small{display:block;font:.74em monospace;margin-bottom:.4em}.step b{font:1.55em b}.step p{font-size:.86em;margin-top:.21em}
</style><main><div class="sheet"><div class="mast"><b>NUTRITION / POSTER HANDOFF</b><span>FIELD GUIDE &nbsp; 01</span></div><h1>Editing Fuel Well.</h1><div class="legend"><span>SOURCE &nbsp; nutrition/fixture.json</span><span>PRINT ↘</span></div><div class="spread"><div class="notes"><article><span class="num">1</span><h2>Rewrite the title</h2><code>sections.header<br>.headline</code><p>Change the words across the top of the poster.</p></article><article><span class="num second">2</span><h2>Swap the leaf</h2><code>sections.hero<br>.illustrationId</code><p>Change <strong>leaf_glow</strong> to <strong>parfait_jar</strong> to put the jar in the center.</p></article></div><figure class="proof"><img src="${poster}" alt="Fuel Well. Live Well. poster with a large central green leaf"><span class="pin">1</span><span class="pin second">2</span></figure></div><section class="route"><h2>From fixture to PNG</h2><div class="steps"><div class="step"><small>nutrition.mjs</small><b>Build scene</b><p>Place text and art.</p></div><span class="arrow">→</span><div class="step"><small>render.mjs</small><b>Playwright</b><p>Screenshot the page.</p></div><span class="arrow">→</span><div class="step"><small>1000 × 1000</small><b>render.png</b><p>Finished poster.</p></div></div></section></div></main></html>`;
(async()=>{
 const file=path.join(__dirname,'index.html');
 fs.writeFileSync(file,html);
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:1200}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('node:url').pathToFileURL(file).href);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
 if(errors.length)throw Error(errors.join('\n'));
 await page.locator('main').screenshot({path:path.join(__dirname,'poster.png')});
 }finally{await browser.close()}
})();
