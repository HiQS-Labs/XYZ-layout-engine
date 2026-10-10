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
const {width:W,height:H,lanes,stages}=fixture;
const fonts={regular:await fs.readFile(new URL('tools/spike/assets/font.ttf',RT)),bold:await fs.readFile(new URL('tools/spike/assets/font-bold.ttf',RT))};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const svgData=s=>`data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const img=(id,src,x,y,w,h=w,extra={})=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h,objectFit:'contain',...extra},undefined,{src});

// What a RAG diagram must show. The fixture has to supply exactly these stages, so an empty or trimmed
// fixture cannot pass by checking only what happened to be rendered.
const REQUIRED={ingest:['docs','chunk','embed_index'],store:['store'],query:['question','embed_query','retrieve','augment','llm','answer']};
for(const [lane,ids] of Object.entries(REQUIRED))assert.deepEqual(stages.filter(s=>s.lane===lane).map(s=>s.id),ids,`fixture lane ${lane} must hold exactly the required stages`);
assert.equal(new Set(stages.map(s=>s.id)).size,stages.length,'stage ids must be unique');

// Hand-authored vector icons (96x96, stroke only), one per stage.
const ico=(color,inner)=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const embedBars='<path d="M24 18 H16 V78 H24 M72 18 H80 V78 H72"/><path d="M34 62 V46 M44 62 V30 M54 62 V40 M64 62 V52"/>';
const icons={
 docs:'<path d="M28 14 H56 L70 28 V82 H28 Z"/><path d="M56 14 V28 H70"/><path d="M38 44 H60 M38 56 H60 M38 68 H52"/>',
 chunk:'<rect x="18" y="16" width="60" height="16" rx="4"/><rect x="18" y="40" width="60" height="16" rx="4"/><rect x="18" y="64" width="60" height="16" rx="4"/><path d="M30 24 H44 M30 48 H44 M30 72 H44"/>',
 embed_index:embedBars,
 embed_query:embedBars,
 store:'<ellipse cx="48" cy="24" rx="28" ry="10"/><path d="M20 24 V72 C20 78 32 84 48 84 C64 84 76 78 76 72 V24"/><path d="M20 48 C20 54 32 60 48 60 C64 60 76 54 76 48"/>',
 question:'<path d="M18 20 H78 V62 H46 L30 78 V62 H18 Z"/><path d="M40 36 C40 28 56 28 56 36 C56 42 48 43 48 49"/><circle cx="48" cy="55" r="1.5"/>',
 retrieve:'<circle cx="42" cy="42" r="22"/><path d="M58 58 L80 80"/><circle cx="34" cy="38" r="2"/><circle cx="46" cy="34" r="2"/><circle cx="44" cy="48" r="2"/>',
 augment:'<rect x="14" y="30" width="46" height="54" rx="6"/><rect x="36" y="14" width="46" height="54" rx="6"/><path d="M59 31 V51 M49 41 H69"/>',
 llm:'<circle cx="48" cy="48" r="10"/><circle cx="18" cy="26" r="6"/><circle cx="78" cy="26" r="6"/><circle cx="18" cy="70" r="6"/><circle cx="78" cy="70" r="6"/><path d="M23 30 L40 42 M73 30 L56 42 M23 66 L40 54 M73 66 L56 54"/>',
 answer:'<path d="M16 18 H80 V62 H50 L34 78 V62 H16 Z"/><path d="M30 34 H66 M30 46 H52"/><circle cx="68" cy="62" r="14"/><path d="M62 62 L67 67 L75 57"/>'
};
for(const s of stages)assert.ok(icons[s.id],`no icon drawn for stage ${s.id}`);

// Layout: three horizontal bands (ingest, store, query) on a six-column grid.
const COLX=c=>100+c*380,CARD_W=300,CARD_H=250,BAND_Y={ingest:460,store:790,query:1140};
const laneColor=lane=>lanes[lane].color;
const texts=[],container={},seenText=new Set();
const textNode=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seenText.has(id),`duplicate text id ${id}`);
 seenText.add(id);texts.push(id);if(within)container[id]=within;
 return node('span',id,{fontSize:28,lineHeight:1.3,color:'#e9eff9',...style},s);
};
const iconIds=[];
const cardFor=s=>{
 const x=COLX(s.col),y=BAND_Y[s.lane],color=laneColor(s.lane),cid='card_'+s.id;
 iconIds.push('asset_'+s.id);
 return box(cid,{position:'absolute',left:x,top:y,width:CARD_W,height:CARD_H,border:`2px solid ${s.lane==='store'?color:'#33435e'}`,borderRadius:26,backgroundColor:'#0b1529'},[
  img('asset_'+s.id,ico(color,icons[s.id]),24,22,96),
  box('stepbox_'+s.id,{position:'absolute',left:CARD_W-24-80,top:26,width:80,justifyContent:'flex-end'},[textNode(s.id+'_step',s.step,{fontSize:22,fontWeight:700,letterSpacing:2,color},cid)]),
  box('body_'+s.id,{position:'absolute',left:24,top:128,width:CARD_W-48,flexDirection:'column',gap:8},[
   textNode(s.id+'_title',s.title,{fontSize:32,fontWeight:700,color:'#f4f6fb'},cid),
   textNode(s.id+'_desc',s.desc,{fontSize:21,lineHeight:1.3,color:'#9eadc3'},cid)
  ])
 ]);
};

// Deterministic star dust and arrows are decorative layers, not stage icons.
let seed=40719;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const dust=Array.from({length:120},()=>`<circle cx="${(rand()*W).toFixed(1)}" cy="${(rand()*H).toFixed(1)}" r="${(rand()*1.4+.4).toFixed(2)}" fill="#b9cce8" opacity="${(rand()*.3+.08).toFixed(2)}"/>`).join('');
const backdrop=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="a" cx=".5" cy=".35"><stop stop-color="#132444"/><stop offset="1" stop-color="#060c1b"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#a)"/>${dust}</svg>`);
const arrows=[];
const head=(x,y,dir,color)=>{const d=12,w=9;const p={r:[[x,y],[x-d,y-w],[x-d,y+w]],d:[[x,y],[x-w,y-d],[x+w,y-d]],u:[[x,y],[x-w,y+d],[x+w,y+d]]}[dir];return `<polygon points="${p.map(q=>q.join(',')).join(' ')}" fill="${color}"/>`};
const line=(d,color,dash)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
for(const lane of ['ingest','query']){
 const row=stages.filter(s=>s.lane===lane);
 for(let i=0;i+1<row.length;i++){
  const y=BAND_Y[lane]+CARD_H/2,x1=COLX(row[i].col)+CARD_W+8,x2=COLX(row[i+1].col)-8,c=laneColor(lane);
  arrows.push(line(`M ${x1} ${y} L ${x2-10} ${y}`,c),head(x2,y,'r',c));
 }
}
const sc=COLX(2);
arrows.push(line(`M ${sc+150} ${BAND_Y.ingest+CARD_H+6} L ${sc+150} ${BAND_Y.store-16}`,laneColor('ingest')),head(sc+150,BAND_Y.store-6,'d',laneColor('ingest')));
arrows.push(line(`M ${sc+90} ${BAND_Y.query-6} L ${sc+90} ${BAND_Y.store+CARD_H+16}`,laneColor('query')),head(sc+90,BAND_Y.store+CARD_H+6,'u',laneColor('query')));
arrows.push(line(`M ${sc+210} ${BAND_Y.store+CARD_H+6} L ${sc+210} ${BAND_Y.query-16}`,laneColor('store')),head(sc+210,BAND_Y.query-6,'d',laneColor('store')));
const byY=BAND_Y.query+CARD_H+46,qx=COLX(0)+CARD_W/2,ax=COLX(3)+CARD_W/2;
arrows.push(line(`M ${qx} ${BAND_Y.query+CARD_H+6} L ${qx} ${byY} L ${ax} ${byY} L ${ax} ${BAND_Y.query+CARD_H+22}`,laneColor('query'),'10 8'),head(ax,BAND_Y.query+CARD_H+8,'u',laneColor('query')));
const arrowLayer=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${arrows.join('')}</svg>`);

const panel=(key,x,y,w,h)=>{
 const p=fixture.panels[key],pid='panel_'+key;
 return box(pid,{position:'absolute',left:x,top:y,width:w,height:h,border:'1px solid #33435e',borderRadius:24,backgroundColor:'#0a1325',padding:30,flexDirection:'column',gap:14},[
  textNode(pid+'_title',p.title,{fontSize:20,letterSpacing:2.6,fontWeight:700,color:'#bdcde3'},pid),
  textNode(pid+'_body',p.body,{fontSize:26,lineHeight:1.4,color:'#aabbd3'},pid)
 ]);
};

const children=[img('backdrop',backdrop,0,0,W,H),img('arrows',arrowLayer,0,0,W,H)];
children.push(box('header',{position:'absolute',left:100,top:80,width:2200,flexDirection:'column',gap:18},[
 textNode('eyebrow',fixture.eyebrow,{fontSize:23,letterSpacing:4.4,color:'#b4c5de',fontWeight:700}),
 textNode('title',fixture.title,{fontSize:108,fontWeight:700,letterSpacing:-3,color:'#f4f6fb',lineHeight:1.2}),
 textNode('subtitle',fixture.subtitle,{fontSize:32,color:'#aabbd3'})
]));
children.push(textNode('lane_ingest',lanes.ingest.label,{position:'absolute',left:100,top:BAND_Y.ingest-52,fontSize:22,letterSpacing:2.2,fontWeight:700,color:laneColor('ingest')}));
children.push(textNode('lane_query',lanes.query.label,{position:'absolute',left:100,top:BAND_Y.query-52,fontSize:22,letterSpacing:2.2,fontWeight:700,color:laneColor('query')}));
for(const s of stages)children.push(cardFor(s));
children.push(panel('stored',COLX(3),BAND_Y.ingest,COLX(5)+CARD_W-COLX(3),CARD_H));
children.push(panel('why',100,BAND_Y.store,COLX(2)-100-80,CARD_H));
children.push(panel('how',COLX(3),BAND_Y.store,COLX(5)+CARD_W-COLX(3),CARD_H));
const edge=(id,s,x,y,w,right)=>box('edgebox_'+id,{position:'absolute',left:x,top:y,width:w,justifyContent:right?'flex-end':'flex-start'},[textNode(id,s,{fontSize:20,color:'#9eadc3'})]);
children.push(edge('edge_write',fixture.edges.write,sc+170,BAND_Y.ingest+CARD_H+22,340));
children.push(edge('edge_query_vector',fixture.edges.queryVector,sc+78-300,BAND_Y.store+CARD_H+12,300,true));
children.push(edge('edge_chunks',fixture.edges.chunks,sc+232,BAND_Y.store+CARD_H+12,360));
children.push(edge('edge_question',fixture.edges.question,qx+60,byY+14,1100));
children.push(box('footer_rule',{position:'absolute',left:100,top:1500,width:2200,height:1,backgroundColor:'#34465f'},[]));
children.push(box('footer',{position:'absolute',left:100,top:1528,width:2200,flexDirection:'column',gap:16},[
 box('footer_summary',{width:2200,justifyContent:'space-between',alignItems:'center'},[
  textNode('footer_message',fixture.footerMessage,{fontSize:22,letterSpacing:1.6,color:'#d0dbee',fontWeight:700}),
  textNode('footer_credit','XYZ LAYOUT ENGINE',{fontSize:17,letterSpacing:2,color:'#7289a8'})
 ]),
 textNode('scale_note',fixture.disclaimer,{fontSize:19,color:'#8499b5'}),
 textNode('source_note','Pattern: Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (2020), arXiv:2005.11401',{fontSize:16,color:'#6d84a5'})
]));
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:'#060c1b',fontFamily:'Inter',overflow:'hidden'},children);

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
const expectedText=[...stages.flatMap(s=>[s.id+'_step',s.id+'_title',s.id+'_desc']),'eyebrow','title','subtitle','lane_ingest','lane_query','edge_write','edge_query_vector','edge_chunks','edge_question','footer_message','footer_credit','scale_note','source_note',...Object.keys(fixture.panels).flatMap(k=>['panel_'+k+'_title','panel_'+k+'_body'])];
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
assert.deepEqual([...found].sort(),stages.map(s=>'asset_'+s.id).sort(),'one separate image node per required stage icon, no more, no fewer');
assert.equal(found.length,10);
assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
assert.equal(chromiumResult.png.readUInt32BE(16),W);assert.equal(chromiumResult.png.readUInt32BE(20),H);

const outPng=path.join(ROOT,'rag-system.png');
await fs.writeFile(outPng,result.png);
await fs.writeFile(path.join(ROOT,'rag-system-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,'rag-system.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:#060c1b}#canvas{transform-origin:top left}span[contenteditable]{outline:1px dashed #577da4;cursor:text}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();document.querySelectorAll('span').forEach(e=>{e.title='Double-click to edit this label';e.addEventListener('dblclick',()=>{e.contentEditable='true';e.focus()});e.addEventListener('blur',()=>e.removeAttribute('contenteditable'))});</script></body>`);
await fs.writeFile(path.join(ROOT,'rag-system.html'),responsive);
const evidence={renderer:'Existing GH-1 renderSatori / renderPlaywright functions, pinned in ../2026-10-08-solar-system/runtime',generatedAt:new Date().toISOString(),width:W,height:H,stages:stages.map(s=>s.id),imageNodes:found,textIds:texts,artifactDigests:{png:sha(result.png),svg:sha(result.svg),html:sha(responsive),chromiumPng:sha(chromiumResult.png)},satoriBounds:result.bounds,chromiumText:chromiumResult.textBoxes,findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${found.length} separate icon nodes; ${texts.length} text ids present and unique; ${W}x${H} in both backends; text and icons inside canvas and cards in Satori and Chromium; no text overflow or overlap.`);
