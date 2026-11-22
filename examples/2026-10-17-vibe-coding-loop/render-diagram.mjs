import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
// "The Vibe-Coding Loop" (#63): a four-step cycle with an exit, small generated cutouts grounded with
// two-layer contact/cast shadows (AS-11), and a type scale computed from S (AS-12). Same shared renderer
// and layout checks as the GH-55/GH-60 examples; cutouts are loaded through readPinnedPngs.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../',import.meta.url);
const {renderSatori,renderPlaywright}=await import(new URL('tools/render.mjs',RT).href);
const {readPinnedPngs}=await import(new URL('tools/request.mjs',RT).href);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
// FIXTURE overrides the fixture path (red controls run against a temporary copy).
const fixturePath=process.env.FIXTURE?path.resolve(process.env.FIXTURE):path.join(ROOT,'fixture.json');
const fixture=JSON.parse(await fs.readFile(fixturePath,'utf8'));
const {width:W,height:H,theme:{palette:P,type:TY}}=fixture;
const FAMILY=TY.family;
const fontFile=f=>fs.readFile(new URL(`tools/fonts/barlow-condensed/BarlowCondensed-${f}.ttf`,RT));
const fonts={regular:await fontFile('Regular'),bold:await fontFile('Bold')};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const b64=(b,type)=>`data:${type};base64,${Buffer.from(b).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);

// AS-12: every size is a share of S, the canvas's shorter side.
const S=Math.min(W,H);
const PX=Object.fromEntries(Object.entries(TY.pct).map(([k,v])=>[k,Math.round(S*v)]));
// Cap height from the bold face's OS/2 table, for the graphic-to-headline balance check.
const capHeight=ttf=>{const n=ttf.readUInt16BE(4);const tab={};for(let i=0;i<n;i++){const o=12+i*16;tab[ttf.toString('latin1',o,o+4)]=ttf.readUInt32BE(o+8)}return ttf.readInt16BE(tab['OS/2']+88)/ttf.readUInt16BE(tab.head+18)};
const CAP=capHeight(fonts.bold)*PX.headline;

// Geometry has one owner: this table.
const M=100;
const CARD={w:440,h:250},EXIT={x:1220,y:725,w:280,h:300};
const COL=[100,660],ROW=[360,750];
const STEP_AT=[[0,0],[1,0],[1,1],[0,1]]; // describe, generate, see, refine — clockwise
const cardOf=i=>({x:COL[STEP_AT[i][0]],y:ROW[STEP_AT[i][1]],...CARD});
const cx=c=>c.x+c.w/2,cy=c=>c.y+c.h/2;
const STAGE={dx:20,w:160,h:170,floor:226}; // cutout stage inside a loop card
const TEXT={dx:196,w:220};
const RULE_Y=1070;

const cutouts=await readPinnedPngs(pathToFileURL(ROOT+'/'),'provenance.json',[...fixture.steps.map(s=>s.asset),fixture.exit.asset]);

const v=[]; // vector layer: connectors and ground shadows, under the cutouts
const head=(x,y,dir,c,len=18,half=10)=>{const [ux,uy]={right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]}[dir];return `<polygon points="${x},${y} ${x-ux*len-uy*half},${y-uy*len-ux*half} ${x-ux*len+uy*half},${y-uy*len+ux*half}" fill="${c}"/>`};
const arrow=(x0,y0,x1,y1,c,w=3)=>{const dir=x1>x0?'right':x1<x0?'left':y1>y0?'down':'up';const back=16;const ex=x1-Math.sign(x1-x0)*back,ey=y1-Math.sign(y1-y0)*back;return `<line x1="${x0}" y1="${y0}" x2="${ex}" y2="${ey}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`+head(x1,y1,dir,c)};
let gid=0;
const ground=(vx0,vx1,floorY)=>{
 const vw=vx1-vx0,mx=(vx0+vx1)/2,id=++gid;
 // One light from the upper right: the cast ellipse falls lower-left of the contact ellipse.
 const cast={cx:mx-vw*0.14,cy:floorY+2,rx:vw*0.52,ry:11},contact={cx:mx,cy:floorY-1,rx:vw*0.34,ry:5};
 return `<defs><radialGradient id="cast${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.shadow}" stop-opacity="0.24"/><stop offset="45%" stop-color="${P.shadow}" stop-opacity="0.14"/><stop offset="100%" stop-color="${P.shadow}" stop-opacity="0"/></radialGradient><radialGradient id="contact${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${P.shadow}" stop-opacity="0.45"/><stop offset="55%" stop-color="${P.shadow}" stop-opacity="0.22"/><stop offset="100%" stop-color="${P.shadow}" stop-opacity="0"/></radialGradient></defs>`+
  `<ellipse cx="${cast.cx}" cy="${cast.cy}" rx="${cast.rx}" ry="${cast.ry}" transform="rotate(-4 ${cast.cx} ${cast.cy})" fill="url(#cast${id})"/><ellipse cx="${contact.cx}" cy="${contact.cy}" rx="${contact.rx}" ry="${contact.ry}" fill="url(#contact${id})"/>`;
};
// Place a cutout so its visible base sits on floorY, centred on stageCx, fitted inside maxW x maxH.
const graphics=[];
const placeCutout=(asset,stageCx,floorY,maxW,maxH)=>{
 const b=fixture.assets[asset].visibleBox,vw=b.x1-b.x0,vh=b.y1-b.y0,s=Math.min(maxW/vw,maxH/vh);
 const left=Math.round(stageCx-(b.x0+b.x1)/2*s),top=Math.round(floorY-b.y1*s),size=Math.round(512*s);
 graphics.push({asset,visibleHeight:Math.round(vh*s),visibleWidth:Math.round(vw*s)});
 v.push(ground(left+b.x0*s,left+b.x1*s,floorY));
 return node('img','img_'+asset,{position:'absolute',left,top,width:size,height:size},undefined,{src:cutouts[asset]});
};

// Text.
const texts=[],container={},seen=new Set(),sizes=new Set();
const T=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seen.has(id),`duplicate text id ${id}`);
 seen.add(id);texts.push(id);if(within)container[id]=within;sizes.add(style.fontSize);
 return node('span',id,{color:P.ink,lineHeight:1.2,...style},s);
};
const at=(id,x,y,w,style,children)=>box(id,{position:'absolute',left:x,top:y,width:w,...style},children);
const ty={
 headline:{fontSize:PX.headline,fontWeight:700,lineHeight:1.2,textTransform:'uppercase'},
 subhead:{fontSize:PX.subhead,fontWeight:400},
 cardTitle:{fontSize:PX.subhead,fontWeight:700,lineHeight:1.2,textTransform:'uppercase'},
 label:{fontSize:PX.label,fontWeight:700},
 tag:{fontSize:PX.body,fontWeight:700,letterSpacing:2},
 body:{fontSize:PX.body,fontWeight:400,lineHeight:1.25,color:P.muted},
};
const actor=a=>({fill:P[a+'Fill'],line:P[a+'Line'],ink:P[a+'Ink']});

const cards=[],imgs=[],labels=[];
fixture.steps.forEach((st,i)=>{
 const c=cardOf(i),a=actor(st.actor);
 cards.push(box('card_'+st.id,{position:'absolute',left:c.x,top:c.y,width:c.w,height:c.h,backgroundColor:a.fill,border:`2px solid ${a.line}`,borderRadius:16}));
 imgs.push(placeCutout(st.asset,c.x+STAGE.dx+STAGE.w/2,c.y+STAGE.floor,STAGE.w,STAGE.h));
 labels.push(at('text_'+st.id,c.x+TEXT.dx,c.y+24,TEXT.w,{height:c.h-48,flexDirection:'column',justifyContent:'center',gap:8},[
  T('tag_'+st.id,`${st.number} · ${fixture.actors[st.actor].tag}`,{...ty.tag,color:a.ink},'text_'+st.id),
  T('title_'+st.id,st.title,ty.cardTitle,'text_'+st.id),
  T('caption_'+st.id,st.caption,ty.body,'text_'+st.id)
 ]));
});
// Exit: rocket above its text, the card centred on the second row.
cards.push(box('card_exit',{position:'absolute',left:EXIT.x,top:EXIT.y,width:EXIT.w,height:EXIT.h,backgroundColor:P.exitFill,border:`2px dashed ${P.exitInk}`,borderRadius:16}));
imgs.push(placeCutout(fixture.exit.asset,cx(EXIT),EXIT.y+140,140,112));
labels.push(at('text_exit',EXIT.x+24,EXIT.y+150,EXIT.w-48,{height:EXIT.h-174,flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6},[
 T('tag_exit',fixture.exit.tag,{...ty.tag,color:P.exitInk},'text_exit'),
 T('title_exit',fixture.exit.title,ty.cardTitle,'text_exit'),
 T('caption_exit',fixture.exit.caption,{...ty.body,textAlign:'center'},'text_exit')
]));

// Connectors: forward around the loop, the return arrow in the "you" colour, the exit in its own.
const [c1,c2,c3,c4]=[0,1,2,3].map(cardOf);
v.push(arrow(c1.x+c1.w,cy(c1),c2.x-1,cy(c2),P.connector));
v.push(arrow(cx(c2),c2.y+c2.h,cx(c3),c3.y-1,P.connector));
v.push(arrow(c3.x,cy(c3),c4.x+c4.w+1,cy(c4),P.connector));
v.push(arrow(cx(c4),c4.y,cx(c1),c1.y+c1.h+1,P.youInk,4));
v.push(arrow(c3.x+c3.w,cy(c3),EXIT.x-1,cy(c3),P.exitInk));
const gapMid=(c1.x+c1.w+c2.x)/2,exitMid=(c3.x+c3.w+EXIT.x)/2,LBL=PX.label*1.2;
labels.push(at('lbl_notyet_box',gapMid-60,cy(c3)-LBL-12,120,{justifyContent:'center'},[T('lbl_notyet',fixture.connectors.notYet,{...ty.label,color:P.muted})]));
labels.push(at('lbl_works_box',exitMid-60,cy(c3)-LBL-12,120,{justifyContent:'center'},[T('lbl_works',fixture.connectors.itWorks,{...ty.label,color:P.exitInk})]));
labels.push(at('lbl_repeat_box',cx(c4)+16,(c1.y+c1.h+c4.y)/2-LBL/2,280,{},[T('lbl_repeat',fixture.connectors.repeat,{...ty.label,color:P.youInk})]));

// Header, legend, footer.
const header=[
 at('eyebrow_box',W-M-400,84,400,{justifyContent:'flex-end'},[T('eyebrow',fixture.eyebrow,{...ty.label,color:P.muted,letterSpacing:2})]),
 at('title_box',M,62,W-2*M-420,{},[T('title',fixture.title,ty.headline)]),
 at('subtitle_box',M,206,960,{},[T('subtitle',fixture.subtitle,ty.subhead)]),
 at('steering_box',M,258,960,{},[T('steering',fixture.steering,ty.body)]),
 // The legend sits in the diagram's free top-right cell, beside the cards it explains.
 ...fixture.legend.map((l,i)=>at('legend_'+l.actor,EXIT.x,ROW[0]+40+i*44,EXIT.w,{alignItems:'center',gap:10},[
  box(null,{width:22,height:22,borderRadius:6,backgroundColor:actor(l.actor).fill,border:`2px solid ${actor(l.actor).line}`}),
  T('legend_'+l.actor+'_name',l.name,{...ty.tag,color:actor(l.actor).ink,letterSpacing:0}),
  T('legend_'+l.actor+'_role',l.role,ty.body)
 ])),
 box('rule',{position:'absolute',left:M,top:RULE_Y,width:W-2*M,height:2,backgroundColor:P.rule}),
 at('footer_box',M,RULE_Y+18,W-2*M,{},[T('footer',fixture.footer,ty.body)])
];

const ink=node('img','ink',{position:'absolute',left:0,top:0,width:W,height:H},undefined,{src:b64(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${v.join('')}</svg>`,'image/svg+xml')});
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:P.ground,fontFamily:FAMILY,overflow:'hidden'},[...cards,ink,...imgs,...labels,...header]);

const result=await renderSatori(scene,fonts,W,H,FAMILY);
const browser=await chromium.launch({headless:true});
let chromiumResult;
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 context.setDefaultTimeout(30000);
 chromiumResult=await renderPlaywright(context,scene,fonts,W,H,FAMILY);
 await context.close();
}finally{await browser.close()}

const findings=[];
// AS-12 checks first, so a type-scale failure is not hidden behind layout findings.
const titleBox=result.textBoxes.title;
const maxGraphic=Math.max(...graphics.map(g=>g.visibleHeight));
const as12={
 S,px:PX,distinctSizes:[...sizes].sort((a,b)=>b-a),
 headlinePctOfS:TY.pct.headline,bodyPctOfS:TY.pct.body,headlineToBody:+(PX.headline/PX.body).toFixed(2),
 headlinePctOfWidth:titleBox?+(titleBox.width/W).toFixed(3):null,
 capHeightPx:+CAP.toFixed(1),maxGraphicHeightPx:maxGraphic,maxGraphicToCap:+(maxGraphic/CAP).toFixed(2),
 legendLabelToSwatch:+(PX.body/22).toFixed(2)
};
if(sizes.size>4)findings.push({reason:'AS-12: more than 4 font sizes',sizes:as12.distinctSizes});
if(TY.pct.headline<0.07||TY.pct.headline>0.10)findings.push({reason:'AS-12: headline outside 7-10% of S',pct:TY.pct.headline});
if(TY.pct.body<0.018)findings.push({reason:'AS-12: body below the 1.8% of S floor',pct:TY.pct.body});
if(as12.headlineToBody<4)findings.push({reason:'AS-12: headline:body below 4:1',ratio:as12.headlineToBody});
if(!(as12.headlinePctOfWidth>=0.5&&as12.headlinePctOfWidth<=0.85))findings.push({reason:'AS-12: headline width outside 50-85% of canvas',pct:as12.headlinePctOfWidth});
if(as12.maxGraphicToCap>3)findings.push({reason:'AS-12: graphic taller than 3x headline cap height',ratio:as12.maxGraphicToCap});
if(as12.legendLabelToSwatch<0.7)findings.push({reason:'AS-12: legend label under 70% of swatch height'});
// Layout checks: glyph coverage, canvas and container containment, overflow and text overlap in both backends.
if(result.missingSegments.length)findings.push({backend:'satori',reason:'unsupported glyphs',segments:result.missingSegments});
if(!chromiumResult.fontLoaded)findings.push({backend:'chromium',reason:'Barlow Condensed did not load'});
const finite=b=>b&&[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0;
const inside=(b,o,t=1)=>b.x>=o.x-t&&b.y>=o.y-t&&b.x+b.width<=o.x+o.width+t&&b.y+b.height<=o.y+o.height+t;
const canvas={x:0,y:0,width:W,height:H};
const backends={satori:{text:result.textBoxes,bounds:result.bounds},chromium:{text:chromiumResult.textBoxes,bounds:chromiumResult.bounds}};
for(const [name,b] of Object.entries(backends)){
 for(const id of texts){
  const t=b.text[id];
  if(!finite(t)){findings.push({id,backend:name,reason:'missing or non-finite text geometry'});continue}
  if(!inside(t,canvas,.5))findings.push({id,backend:name,reason:'text outside canvas',box:t});
  const c=container[id];
  if(c){const cb=b.bounds[c];if(!finite(cb))findings.push({id,backend:name,reason:'missing container geometry',container:c});else if(!inside(t,cb,1.5))findings.push({id,backend:name,reason:'text escapes its container',container:c,box:t,containerBox:cb})}
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
assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
assert.equal(chromiumResult.png.readUInt32BE(16),W);assert.equal(chromiumResult.png.readUInt32BE(20),H);

// Red controls write their outputs to OUT_DIR so the committed artifacts stay untouched.
const OUT=process.env.OUT_DIR?path.resolve(process.env.OUT_DIR):ROOT;
const NAME='vibe-coding-loop';
await fs.writeFile(path.join(OUT,NAME+'.png'),result.png);
await fs.writeFile(path.join(OUT,NAME+'-chromium.png'),chromiumResult.png);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:${P.ground}}#canvas{transform-origin:top left}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();</script></body>`);
await fs.writeFile(path.join(OUT,NAME+'.html'),responsive);
const evidence={renderer:'Shared root tools/render.mjs renderSatori / renderPlaywright; vendored Barlow Condensed; cutouts via readPinnedPngs',width:W,height:H,as12,graphics,textIds:texts,artifactDigests:{png:sha(result.png),chromiumPng:sha(chromiumResult.png),html:sha(responsive)},findings};
await fs.writeFile(path.join(OUT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${texts.length} text ids; ${W}x${H} in both backends; AS-12 sizes ${as12.distinctSizes.join('/')} px; no unsupported glyphs, escapes, overflow or overlap.`);
