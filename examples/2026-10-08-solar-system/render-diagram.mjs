import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
process.env.SPIKE_LIBRARY_ONLY='1';
const {loadSatori,renderSatori,renderPlaywright}=await import('./runtime/tools/spike/render.mjs');
const {chromium}=await import('./runtime/node_modules/playwright/index.mjs');
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const fixture=JSON.parse(await fs.readFile(path.join(ROOT,'fixture.json'),'utf8'));
const {width:W,height:H,center:{x:cx,y:cy}}=fixture;
const fonts={regular:await fs.readFile(path.join(ROOT,'runtime/tools/spike/assets/font.ttf')),bold:await fs.readFile(path.join(ROOT,'runtime/tools/spike/assets/font-bold.ttf'))};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const data=(mime,b)=>`data:${mime};base64,${Buffer.from(b).toString('base64')}`;
const svgData=s=>data('image/svg+xml',s);
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const txt=(id,text,style={})=>node('span',id,{fontSize:28,lineHeight:1.3,color:'#e9eff9',...style},text);
const img=(id,src,x,y,w,h=w,extra={})=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h,objectFit:'contain',...extra},undefined,{src});
const originalAssets={},assets={};
const ids=['sun',...fixture.planets.map(p=>p.asset||p.id),fixture.belt.asset||'asteroid-belt','milky-way'];
await fs.mkdir(path.join(ROOT,'assets/web'),{recursive:true});
await loadSatori();
for(const id of ids){
  const original=await fs.readFile(path.join(ROOT,'assets',id+'.png'));
  const receipt=JSON.parse(await fs.readFile(path.join(ROOT,'assets',id+'.result.json'),'utf8'));
  assert.equal(sha(original),receipt.image.sha256,`${id}: source digest`);
  assert.equal(receipt.alpha?.verified,true,`${id}: transparency`);
  originalAssets[id]={source:'assets/'+id+'.png',sha256:sha(original),model:receipt.model,endpoint:receipt.endpoint,recipeRef:receipt.recipeRef,publication:receipt.publication,alpha:receipt.alpha};
  // Display-size export through the existing layout renderer, preserving the individual original.
  const displayH=Math.round(640*original.readUInt32BE(20)/original.readUInt32BE(16));
  const resized=await renderSatori(box(null,{width:640,height:displayH},[img(null,data('image/png',original),0,0,640,displayH)]),fonts,640,displayH);
  await fs.writeFile(path.join(ROOT,'assets/web',id+'.png'),resized.png);
  assets[id]=data('image/png',resized.png);
  originalAssets[id].display={path:'assets/web/'+id+'.png',sha256:sha(resized.png),bytes:resized.png.length};
}
// Deterministic decorative star field and orbit strokes; no custom text or layout measurements.
let seed=82631;
const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const stars=Array.from({length:165},()=>`<circle cx="${(rand()*W).toFixed(2)}" cy="${(rand()*H).toFixed(2)}" r="${(rand()*1.6+.4).toFixed(2)}" fill="#b9cce8" opacity="${(rand()*.4+.1).toFixed(2)}"/>`).join('');
const background=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="a"><stop stop-color="#132444"/><stop offset="1" stop-color="#060c1b"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#a)"/>${stars}</svg>`);
const orbits=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${fixture.planets.map(p=>`<ellipse cx="${cx}" cy="${cy}" rx="${p.radiusX}" ry="${p.radiusY}" fill="none" stroke="${p.index==='03'?'#477a99':'#3c506e'}" stroke-opacity="${p.index==='03'?'.7':'.48'}" stroke-width="${p.index==='03'?2.5:1.7}"/>`).join('')}</svg>`);
const leaders=[];
const texts=[];
const textNode=(id,s,sty)=>{texts.push(id);return txt(id,s,sty)};
const label=(id,name,kind,x,y,color,index)=>box('label_'+id,{position:'absolute',left:x,top:y,width:260,flexDirection:'column',gap:5},[
 textNode(id+'_name',name,{fontSize:34,fontWeight:700,color}),
 textNode(id+'_kind',(index?index+'  /  ':'')+kind.toUpperCase(),{fontSize:18,letterSpacing:1.1,color:'#9eadc3'})
]);
const children=[img('starfield',background,0,0,W,H),img('orbits',orbits,0,0,W,H)];
children.push(box('header',{position:'absolute',left:100,top:87,width:1530,flexDirection:'column',gap:18},[
 textNode('eyebrow',fixture.eyebrow,{fontSize:23,letterSpacing:4.4,color:'#b4c5de',fontWeight:700}),
 textNode('title',fixture.title,{fontSize:108,fontWeight:700,letterSpacing:-4,color:'#f4f6fb',lineHeight:1.2}),
 textNode('subtitle',fixture.subtitle,{fontSize:30,color:'#aabbd3'})
]));
children.push(box('intro',{position:'absolute',left:102,top:365,width:1160,flexDirection:'column',gap:10},[
 textNode('intro_heading','A journey from our star to the outer planets',{fontSize:28,color:'#d8e4f4'}),
 textNode('intro_note','Read the numbered planets in order outward from the Sun.',{fontSize:23,color:'#8298b6'})
]));
// Galaxy inset: an explicitly schematic location on a generated artist impression, not an observed map.
children.push(box('galaxy_panel',{position:'absolute',left:1770,top:73,width:530,height:454,border:'1px solid #33435e',borderRadius:28,backgroundColor:'#0b1529',padding:30,flexDirection:'column'},[
 textNode('galaxy_title','THE MILKY WAY',{fontSize:23,letterSpacing:3,fontWeight:700,color:'#bdcde3'}),
 textNode('galaxy_note',fixture.galaxy.note,{position:'absolute',left:30,top:406,fontSize:15,color:'#7c91ae'})
]));
children.push(img('asset_milky-way',assets['milky-way'],1785,135,340));
children.push(box('galaxy_location',{position:'absolute',left:2115,top:245,width:164,flexDirection:'column',gap:8},[
 textNode('location_title','YOU ARE HERE',{fontSize:15,letterSpacing:1.4,fontWeight:700,color:'#f4d79f'}),
 textNode('location_name','Solar System',{fontSize:24,fontWeight:700}),
 textNode('location_arm','Orion Spur',{fontSize:20,color:'#aabbd3'})
]));
const galaxyMarker=svgData('<svg xmlns="http://www.w3.org/2000/svg" width="530" height="454"><path d="M 289 221 L 322 211 L 341 211" fill="none" stroke="#f4d79f" stroke-width="2"/><circle cx="284" cy="222" r="6" fill="#f4d79f"/><circle cx="284" cy="222" r="15" fill="none" stroke="#f4d79f" stroke-opacity=".5" stroke-width="1.5"/></svg>');
children.push(img('galaxy_marker',galaxyMarker,1770,73,530,454));
// The belt is a distinct transparent wide PNG, composed directly through both render paths.
children.push(img('asset_asteroid-belt',assets[fixture.belt.asset||'asteroid-belt'],cx-530,cy-350,1060,700,{objectFit:'fill'}));
children.push(img('asset_sun',assets.sun,cx-110,cy-110,220));
children.push(label('sun',fixture.sun.name,fixture.sun.kind,fixture.sun.labelX,fixture.sun.labelY,'#f6cf82'));
for(const p of fixture.planets){
 const radians=p.angle*Math.PI/180;
 const x=cx+p.radiusX*Math.cos(radians),y=cy+p.radiusY*Math.sin(radians);
 children.push(img('asset_'+p.id,assets[p.asset||p.id],x-p.imageSize/2,y-p.imageSize/2,p.imageSize));
 children.push(label(p.id,p.name,p.kind,p.labelX,p.labelY,p.color,p.index));
 const nearestX=Math.max(p.labelX,Math.min(x,p.labelX+235));
 const labelTop=p.labelY>y;
 const toY=labelTop?p.labelY-12:p.labelY+83;
 const startY=y+(labelTop?1:-1)*p.imageSize*.34;
 leaders.push(`<path d="M ${x.toFixed(2)} ${startY.toFixed(2)} L ${nearestX.toFixed(2)} ${toY}" fill="none" stroke="${p.color}" stroke-opacity=".52" stroke-width="1.5"/>`);
}
leaders.push('<path d="M 870 1230 L 815 1285 L 680 1285" fill="none" stroke="#c4ad84" stroke-opacity=".7" stroke-width="1.5"/>');
children.push(img('label_leaders',svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${leaders.join('')}</svg>`),0,0,W,H));
children.push(box('label_belt',{position:'absolute',left:fixture.belt.labelX,top:fixture.belt.labelY,width:440,flexDirection:'column',gap:7},[
 textNode('belt_name',fixture.belt.name,{fontSize:30,color:'#d4c09c',fontWeight:700}),
 textNode('belt_detail',fixture.belt.detail,{fontSize:20,color:'#95a7c0'})
]));
children.push(box('footer_rule',{position:'absolute',left:100,top:1520,width:2200,height:1,backgroundColor:'#34465f'},[]));
children.push(box('footer',{position:'absolute',left:100,top:1550,width:2200,flexDirection:'column',gap:18},[
 box('footer_summary',{width:2200,justifyContent:'space-between',alignItems:'center'},[
  textNode('footer_message','ONE STAR  /  EIGHT PLANETS  /  OUR GALACTIC HOME',{fontSize:22,letterSpacing:1.6,color:'#d0dbee',fontWeight:700}),
  textNode('footer_credit','XYZ LAYOUT ENGINE',{fontSize:17,letterSpacing:2,color:'#7289a8'})
 ]),
 textNode('scale_note',fixture.disclaimer,{fontSize:19,color:'#8499b5'}),
 textNode('source_note','Astronomy: NASA Science · Artwork: AI-generated artist impressions',{fontSize:16,color:'#6d84a5'})
]));
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:'#060c1b',fontFamily:'Inter',overflow:'hidden'},children);
await fs.writeFile(path.join(ROOT,'scene.json'),JSON.stringify(scene));
const result=await renderSatori(scene,fonts,W,H);
await fs.writeFile(path.join(ROOT,'solar-system.png'),result.png);
await fs.writeFile(path.join(ROOT,'solar-system.svg'),result.svg);
// Independent browser view and text-overflow evidence reuse the same renderer and scene.
const browser=await chromium.launch({headless:true});
let chromiumResult;
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 context.setDefaultTimeout(30000);
 chromiumResult=await renderPlaywright(context,scene,fonts,W,H);
 await context.close();
}finally{await browser.close()}
await fs.writeFile(path.join(ROOT,'solar-system-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,'solar-system-render.html'),chromiumResult.html);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:#060c1b}#canvas{transform-origin:top left}#canvas img{cursor:pointer}#canvas img:hover{outline:1px dashed #89b5d8}span[contenteditable]{outline:1px dashed #577da4;cursor:text}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();document.querySelectorAll('span').forEach(e=>{e.title='Double-click to edit this label';e.addEventListener('dblclick',()=>{e.contentEditable='true';e.focus()});e.addEventListener('blur',()=>e.removeAttribute('contenteditable'))});</script></body>`);
await fs.writeFile(path.join(ROOT,'solar-system.html'),responsive);
const findings=[];
for(const id of texts){
 const b=result.textBoxes[id],p=chromiumResult.textBoxes[id];
 if(!b||!p) findings.push({id,reason:'missing text geometry'});
 else if(b.x<0||b.y<0||b.x+b.width>W+.5||b.y+b.height>H+.5||p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1) findings.push({id,reason:'text overflow',satori:b,chromium:p});
}
const names=texts.filter(id=>id.endsWith('_name')&&id!=='location_name');
for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
 const a=result.bounds['label_'+names[i].replace('_name','')],b=result.bounds['label_'+names[j].replace('_name','')];
 if(a&&b&&Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1)findings.push({reason:'overlapping labels',ids:[names[i],names[j]]});
}
assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
const evidence={renderer:'Existing GH-1 renderSatori / renderPlaywright functions',generatedAt:new Date().toISOString(),width:W,height:H,imageNodes:(function collect(n){return [...(n.type==='img'&&n.props?.id?.startsWith('asset_')?[n.props.id]:[]),...(Array.isArray(n.props?.children)?n.props.children.flatMap(collect):[])]})(scene),assets:originalAssets,artifactDigests:{png:sha(result.png),svg:sha(result.svg),html:sha(responsive),chromiumPng:sha(chromiumResult.png)},textIds:texts,satoriBounds:result.bounds,chromiumText:chromiumResult.textBoxes,findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(evidence.imageNodes.length,11,'Sun + eight planets + asteroid belt + galaxy must be separate image nodes');
assert.equal(findings.length,0,JSON.stringify(findings));
console.log('PASS: 11 separate image nodes; source/transparency digests verified; 2400x1700 output; labels in bounds and no browser text overflow or label overlap.');
