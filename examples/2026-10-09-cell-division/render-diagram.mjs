import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Reuses the pinned GH-1 render code in the Solar System example (no second copy). The guard must be set
// before the awaited dynamic import: a static import would run the spike's experiment main() first.
process.env.SPIKE_LIBRARY_ONLY='1';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../2026-10-08-solar-system/runtime/',import.meta.url);
const {loadSatori,renderSatori,renderPlaywright}=await import(new URL('tools/spike/render.mjs',RT).href);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
const fixture=JSON.parse(await fs.readFile(path.join(ROOT,'fixture.json'),'utf8'));
const {width:W,height:H,groups,stages}=fixture;
const fonts={regular:await fs.readFile(new URL('tools/spike/assets/font.ttf',RT)),bold:await fs.readFile(new URL('tools/spike/assets/font-bold.ttf',RT))};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const svgData=s=>`data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const img=(id,src,x,y,w,h=w,extra={})=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h,objectFit:'contain',...extra},undefined,{src});

// What a mitosis diagram must show: the six stages in cycle order, one column each, grouped as
// growth (interphase), mitosis (prophase to telophase) and the split (cytokinesis). The fixture has to supply
// exactly these, so an empty, trimmed or reordered fixture cannot pass by checking only what was rendered.
const REQUIRED=['interphase','prophase','metaphase','anaphase','telophase','cytokinesis'];
const REQUIRED_GROUPS={growth:['interphase'],mitosis:['prophase','metaphase','anaphase','telophase'],split:['cytokinesis']};
assert.deepEqual(stages.map(s=>s.id),REQUIRED,'fixture must hold exactly the six mitosis stages in cycle order');
assert.deepEqual(stages.map(s=>s.col),[0,1,2,3,4,5],'one column per stage, left to right');
for(const [g,ids] of Object.entries(REQUIRED_GROUPS))assert.deepEqual(stages.filter(s=>s.group===g).map(s=>s.id),ids,`fixture group ${g} must hold exactly the required stages`);
assert.deepEqual(Object.keys(fixture.panels).sort(),['same','why'],'fixture must hold the "why" and "same" note panels');
assert.ok(typeof fixture.sources?.[0]==='string'&&fixture.sources[0].trim(),'fixture.sources[0] must hold the reference line');

// Hand-authored vector icons (96x96, stroke only), one per stage. Schematic: two or three chromosomes stand in
// for the real number.
const ico=(color,inner)=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const X=(cx,cy,s=6)=>`M${cx-s} ${cy-s-2} L${cx+s} ${cy+s+2} M${cx+s} ${cy-s-2} L${cx-s} ${cy+s+2}`;
const icons={
 interphase:'<circle cx="48" cy="48" r="40"/><circle cx="46" cy="52" r="20"/><path d="M36 54 C35 44 44 42 45 49 S54 60 56 51 S50 41 43 44 M40 60 C46 63 52 62 56 58" stroke-width="3"/><circle cx="66" cy="26" r="2.5"/><circle cx="73" cy="32" r="2.5"/>',
 prophase:`<circle cx="48" cy="48" r="40"/><circle cx="48" cy="48" r="23" stroke-dasharray="6 7"/><path d="${X(41,43)} ${X(56,54)}"/><circle cx="22" cy="28" r="3"/><circle cx="74" cy="68" r="3"/>`,
 metaphase:`<circle cx="48" cy="48" r="40"/><circle cx="16" cy="48" r="3"/><circle cx="80" cy="48" r="3"/><path d="M19 47 L41 28 M19 48 H41 M19 49 L41 68 M77 47 L55 28 M77 48 H55 M77 49 L55 68" stroke-width="2.5" opacity=".75"/><path d="${X(48,28,5)} ${X(48,48,5)} ${X(48,68,5)}"/>`,
 anaphase:'<ellipse cx="48" cy="48" rx="44" ry="34"/><circle cx="12" cy="48" r="3"/><circle cx="84" cy="48" r="3"/><path d="M15 47 L28 34 M15 49 L28 62 M81 47 L68 34 M81 49 L68 62" stroke-width="2.5" opacity=".75"/><path d="M38 28 L29 34 L38 40 M38 56 L29 62 L38 68 M58 28 L67 34 L58 40 M58 56 L67 62 L58 68"/><path d="M42 48 H54" stroke-dasharray="3 5"/>',
 telophase:'<path d="M48 24 C34 10 6 20 6 48 C6 76 34 86 48 72 C62 86 90 76 90 48 C90 20 62 10 48 24 Z"/><circle cx="28" cy="48" r="13"/><circle cx="68" cy="48" r="13"/><path d="M21 48 C24 43 28 53 31 47 S34 46 35 48 M61 48 C64 43 68 53 71 47 S74 46 75 48"/><path d="M48 6 V14 M48 90 V82"/>',
 cytokinesis:'<circle cx="25" cy="48" r="21"/><circle cx="71" cy="48" r="21"/><circle cx="25" cy="48" r="8"/><circle cx="71" cy="48" r="8"/><path d="M21 48 C23 45 25 51 28 48 M67 48 C69 45 71 51 74 48"/>'
};
for(const s of stages)assert.ok(icons[s.id],`no icon drawn for stage ${s.id}`);

// Layout: one row of six cards that reads left to right, a dashed return loop under it (the cycle), then notes.
const COLX=c=>100+c*376,CARD_W=312,CARD_H=450,CARD_Y=470,ICON=176;
const LOOP_Y=CARD_Y+CARD_H+56,PANEL_Y=LOOP_Y+92,PANEL_H=190;
const groupColor=g=>groups[g].color;
const texts=[],container={},seenText=new Set();
const textNode=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seenText.has(id),`duplicate text id ${id}`);
 seenText.add(id);texts.push(id);if(within)container[id]=within;
 return node('span',id,{fontSize:28,lineHeight:1.3,color:'#e9eff9',...style},s);
};
const iconIds=[];
const cardFor=s=>{
 const x=COLX(s.col),color=groupColor(s.group),cid='card_'+s.id;
 iconIds.push('asset_'+s.id);
 return box(cid,{position:'absolute',left:x,top:CARD_Y,width:CARD_W,height:CARD_H,border:'2px solid #2b3d57',borderRadius:26,backgroundColor:'#0b1628'},[
  box('stepbox_'+s.id,{position:'absolute',left:24,top:24,width:80},[textNode(s.id+'_step',s.step,{fontSize:22,fontWeight:700,letterSpacing:2,color},cid)]),
  img('asset_'+s.id,ico(color,icons[s.id]),(CARD_W-ICON)/2,48,ICON),
  box('body_'+s.id,{position:'absolute',left:24,top:252,width:CARD_W-48,flexDirection:'column',gap:10},[
   textNode(s.id+'_title',s.title,{fontSize:34,fontWeight:700,color:'#f4f6fb'},cid),
   textNode(s.id+'_desc',s.desc,{fontSize:22,lineHeight:1.35,color:'#9eadc3'},cid)
  ])
 ]);
};

// Deterministic faint rings and dust plus arrows are decorative layers, not stage icons.
let seed=90817;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const rings=Array.from({length:16},()=>`<circle cx="${(rand()*W).toFixed(1)}" cy="${(rand()*H).toFixed(1)}" r="${(rand()*120+40).toFixed(1)}" fill="none" stroke="#9fd8e8" stroke-width="2" opacity="${(rand()*.025+.015).toFixed(3)}"/>`).join('');
const dust=Array.from({length:90},()=>`<circle cx="${(rand()*W).toFixed(1)}" cy="${(rand()*H).toFixed(1)}" r="${(rand()*1.4+.4).toFixed(2)}" fill="#bfe3ea" opacity="${(rand()*.25+.06).toFixed(2)}"/>`).join('');
const backdrop=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="a" cx=".5" cy=".4"><stop stop-color="#112a3c"/><stop offset="1" stop-color="#050c17"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#a)"/>${rings}${dust}</svg>`);
const arrows=[];
const head=(x,y,dir,color)=>{const d=12,w=9;const p={r:[[x,y],[x-d,y-w],[x-d,y+w]],u:[[x,y],[x-w,y+d],[x+w,y+d]]}[dir];return `<polygon points="${p.map(q=>q.join(',')).join(' ')}" fill="${color}"/>`};
const line=(d,color,dash,width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const AY=CARD_Y+48+ICON/2;
for(let i=0;i+1<stages.length;i++){
 const x1=COLX(stages[i].col)+CARD_W+10,x2=COLX(stages[i+1].col)-10,c=groupColor(stages[i+1].group);
 arrows.push(line(`M ${x1} ${AY} L ${x2-10} ${AY}`,c),head(x2,AY,'r',c));
}
const fromX=COLX(5)+CARD_W/2,toX=COLX(0)+CARD_W/2,loopC=groupColor('growth');
arrows.push(line(`M ${fromX} ${CARD_Y+CARD_H+8} L ${fromX} ${LOOP_Y} L ${toX} ${LOOP_Y} L ${toX} ${CARD_Y+CARD_H+22}`,loopC,'10 8'),head(toX,CARD_Y+CARD_H+8,'u',loopC));
// Group brackets above the cards, matching the group labels.
const span={};for(const s of stages){span[s.group]??=[s.col,s.col];span[s.group][1]=s.col}
for(const [g,[a,b]] of Object.entries(span)){
 const x1=COLX(a)+6,x2=COLX(b)+CARD_W-6,y=CARD_Y-22,c=groupColor(g);
 arrows.push(line(`M ${x1} ${y+8} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y+8}`,c,null,2));
}
const arrowLayer=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${arrows.join('')}</svg>`);

const panel=(key,x,y,w,h,accent)=>{
 const p=fixture.panels[key],pid='panel_'+key;
 return box(pid,{position:'absolute',left:x,top:y,width:w,height:h,border:'1px solid #2b3d57',borderLeft:`6px solid ${accent}`,borderRadius:24,backgroundColor:'#0a1424',padding:30,paddingLeft:36,flexDirection:'column',gap:14},[
  textNode(pid+'_title',p.title,{fontSize:20,letterSpacing:2.6,fontWeight:700,color:accent},pid),
  textNode(pid+'_body',p.body,{fontSize:27,lineHeight:1.4,color:'#b3c3d8'},pid)
 ]);
};

const children=[img('backdrop',backdrop,0,0,W,H),img('arrows',arrowLayer,0,0,W,H)];
children.push(box('header',{position:'absolute',left:100,top:80,width:2200,flexDirection:'column',gap:18},[
 textNode('eyebrow',fixture.eyebrow,{fontSize:23,letterSpacing:4.4,color:'#a9cfdc',fontWeight:700}),
 textNode('title',fixture.title,{fontSize:108,fontWeight:700,letterSpacing:-3,color:'#f4f6fb',lineHeight:1.2}),
 textNode('subtitle',fixture.subtitle,{fontSize:32,color:'#aabbd3'})
]));
for(const [g,[a,b]] of Object.entries(span))children.push(textNode('group_'+g,groups[g].label,{position:'absolute',left:COLX(a)+6,top:CARD_Y-64,width:COLX(b)+CARD_W-COLX(a)-12,fontSize:21,letterSpacing:2.2,fontWeight:700,color:groupColor(g)}));
for(const s of stages)children.push(cardFor(s));
const edge=(id,s,x,y,w)=>box('edgebox_'+id,{position:'absolute',left:x,top:y,width:w,justifyContent:'center'},[textNode(id,s,{fontSize:22,color:'#9eadc3'})]);
children.push(edge('edge_cycle',fixture.edges.cycle,COLX(1),LOOP_Y+14,COLX(4)+CARD_W-COLX(1)));
const half=(2200-40)/2;
children.push(panel('why',100,PANEL_Y,half,PANEL_H,groupColor('mitosis')));
children.push(panel('same',100+half+40,PANEL_Y,half,PANEL_H,groupColor('growth')));
children.push(box('footer_rule',{position:'absolute',left:100,top:H-160,width:2200,height:1,backgroundColor:'#2f4560'},[]));
children.push(box('footer',{position:'absolute',left:100,top:H-132,width:2200,flexDirection:'column',gap:16},[
 box('footer_summary',{width:2200,justifyContent:'space-between',alignItems:'center'},[
  textNode('footer_message',fixture.footerMessage,{fontSize:22,letterSpacing:1.6,color:'#d0dbee',fontWeight:700}),
  textNode('footer_credit','XYZ LAYOUT ENGINE',{fontSize:17,letterSpacing:2,color:'#7289a8'})
 ]),
 textNode('scale_note',fixture.disclaimer,{fontSize:19,color:'#8499b5'}),
 textNode('source_note','Reference: '+fixture.sources[0],{fontSize:16,color:'#6d84a5'})
]));
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:'#050c17',fontFamily:'Inter',overflow:'hidden'},children);

await loadSatori();
const result=await renderSatori(scene,fonts,W,H);
const browser=await chromium.launch({headless:true});
let chromiumResult;
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 context.setDefaultTimeout(30000);
 chromiumResult=await renderPlaywright(context,scene,fonts,W,H);
 await context.close();
}finally{await browser.close()}

// Non-vacuous checks: required ids are named above, so a missing or empty set fails by id.
const findings=[];
const finite=b=>b&&[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0;
const inside=(b,o,t=1)=>b.x>=o.x-t&&b.y>=o.y-t&&b.x+b.width<=o.x+o.width+t&&b.y+b.height<=o.y+o.height+t;
const canvas={x:0,y:0,width:W,height:H};
const backends={satori:{text:result.textBoxes,bounds:result.bounds},chromium:{text:chromiumResult.textBoxes,bounds:chromiumResult.bounds}};
const expectedText=[...REQUIRED.flatMap(id=>[id+'_step',id+'_title',id+'_desc']),'eyebrow','title','subtitle',...Object.keys(REQUIRED_GROUPS).map(g=>'group_'+g),'edge_cycle','footer_message','footer_credit','scale_note','source_note',...['why','same'].flatMap(k=>['panel_'+k+'_title','panel_'+k+'_body'])];
for(const id of expectedText)if(!texts.includes(id))findings.push({id,reason:'required text id missing from scene'});
assert.ok(texts.length>=expectedText.length&&texts.length>0,'scene must contain the required text ids');
for(const [name,b] of Object.entries(backends)){
 for(const id of texts){
  const t=b.text[id];
  if(!finite(t)){findings.push({id,backend:name,reason:'missing or non-finite text geometry'});continue}
  if(!inside(t,canvas,.5))findings.push({id,backend:name,reason:'text outside canvas',box:t});
  const c=container[id];
  if(c){const cb=b.bounds[c];if(!finite(cb))findings.push({id,backend:name,reason:'missing container geometry',container:c});else if(!inside(t,cb,1.5))findings.push({id,backend:name,reason:'text escapes its container',container:c,box:t,containerBox:cb})}
 }
 for(const id of iconIds){
  const ib=b.bounds[id],cb=b.bounds['card_'+id.slice(6)];
  if(!finite(ib))findings.push({id,backend:name,reason:'missing or non-finite icon geometry'});
  else if(!inside(ib,canvas,.5)||(finite(cb)&&!inside(ib,cb,1)))findings.push({id,backend:name,reason:'icon outside canvas or card',box:ib});
 }
 for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
  const a=b.text[texts[i]],c=b.text[texts[j]];
  if(finite(a)&&finite(c)&&Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>1&&Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>1)findings.push({backend:name,reason:'overlapping text',ids:[texts[i],texts[j]]});
 }
}
for(const id of texts){
 const p=chromiumResult.textBoxes[id];
 if(finite(p)&&(p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1))findings.push({id,backend:'chromium',reason:'text overflow',box:p});
}
const found=(function collect(n){return [...(n.type==='img'&&n.props?.id?.startsWith('asset_')?[n.props.id]:[]),...(Array.isArray(n.props?.children)?n.props.children.flatMap(collect):[])]})(scene);
assert.deepEqual([...found].sort(),REQUIRED.map(id=>'asset_'+id).sort(),'one separate image node per required stage icon, no more, no fewer');
assert.equal(found.length,REQUIRED.length);
assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
assert.equal(chromiumResult.png.readUInt32BE(16),W);assert.equal(chromiumResult.png.readUInt32BE(20),H);

const outPng=path.join(ROOT,'cell-division.png');
await fs.writeFile(outPng,result.png);
await fs.writeFile(path.join(ROOT,'cell-division-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,'cell-division.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:#050c17}#canvas{transform-origin:top left}span[contenteditable]{outline:1px dashed #577da4;cursor:text}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();document.querySelectorAll('span').forEach(e=>{e.title='Double-click to edit this label';e.addEventListener('dblclick',()=>{e.contentEditable='true';e.focus()});e.addEventListener('blur',()=>e.removeAttribute('contenteditable'))});</script></body>`);
await fs.writeFile(path.join(ROOT,'cell-division.html'),responsive);
const evidence={renderer:'Existing GH-1 renderSatori / renderPlaywright functions, pinned in ../2026-10-08-solar-system/runtime',art:'hand-drawn stroke-only SVG icons (Higgsfield verdict pending)',generatedAt:new Date().toISOString(),width:W,height:H,stages:stages.map(s=>s.id),imageNodes:found,textIds:texts,artifactDigests:{png:sha(result.png),svg:sha(result.svg),html:sha(responsive),chromiumPng:sha(chromiumResult.png)},satoriBounds:result.bounds,chromiumText:chromiumResult.textBoxes,findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${found.length} separate icon nodes; ${texts.length} text ids present and unique; ${W}x${H} in both backends; text and icons inside canvas and cards in Satori and Chromium; no text overflow or overlap.`);
