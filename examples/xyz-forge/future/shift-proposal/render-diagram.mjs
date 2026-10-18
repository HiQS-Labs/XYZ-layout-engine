import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Future proposal (XYZ-forge#1081): the /shift outer loop over the version 2 factory skills. Same shared
// renderer, bundled Barlow Condensed and belief-reference vocabulary as the two earlier versions.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../../../',import.meta.url);
const {renderSatori,renderPlaywright}=await import(new URL('tools/render.mjs',RT).href);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
const fixture=JSON.parse(await fs.readFile(path.join(ROOT,'fixture.json'),'utf8'));
const {width:W,height:H,theme:{palette:P},stages,nodes:N,edges:E}=fixture;
const FAMILY='Barlow Condensed';
const fonts={regular:await fs.readFile(new URL('tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf',RT)),bold:await fs.readFile(new URL('tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf',RT))};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const svgData=s=>`data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const img=(id,src,x,y,w,h=w)=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h},undefined,{src});

assert.equal(fixture.routes.targets.length,4,'four routed skills');
assert.equal(fixture.prerequisites.items.length,4,'four prerequisites');
assert.equal(fixture.records.entries.length,3,'three day-state stores');

// Geometry has one owner: this table. The day runs left to right on y780; Dispatch is the largest node.
const MY=780,COL={open:260,dispatch:760,merge:1340,close:1860};
const RULES=[510,1050,1600];
const OPEN={w:180,h:200},DSP={w:270,h:280},MRG={w:200,h:220},CLS={w:180,h:200};
const OP={x:1340,y:430,r:38},STALL={x:760,y:520,w:130,h:140};
const TGT_X=[520,680,840,1000],TGT_Y=1060,TGT=[120,120],BRACKET_Y=960;
const SHELF={x:140,y:1290,w:1920,h:100},DIV=[400,960,1500];
const hexPts=(cx,cy,w,h)=>[[cx,cy-h/2],[cx+w/2,cy-h/4],[cx+w/2,cy+h/4],[cx,cy+h/2],[cx-w/2,cy+h/4],[cx-w/2,cy-h/4]];

const texts=[],container={},seen=new Set();
const T=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seen.has(id),`duplicate text id ${id}`);
 seen.add(id);texts.push(id);if(within)container[id]=within;
 return node('span',id,{fontSize:18,lineHeight:1.3,color:P.ink,...style},s);
};
const label=(id,x,y,w,title,caption,align='center')=>box('lab_'+id,{position:'absolute',left:x,top:y,width:w,flexDirection:'column',alignItems:align==='center'?'center':align==='right'?'flex-end':'flex-start',gap:4},[
 T(id+'_label',title,{fontSize:23,fontWeight:700,textAlign:align}),
 ...(caption?[T(id+'_caption',caption,{fontSize:18,color:P.muted,textAlign:align})]:[])
]);
const edgeText=(id,s,x,y,w,align='left')=>box('edge_'+id,{position:'absolute',left:x,top:y,width:w,justifyContent:align==='right'?'flex-end':align==='center'?'center':'flex-start'},[T('edge_'+id+'_text',s,{fontSize:17,color:P.muted,textAlign:align})]);
const centred=(id,s,cx,cy,w,style,sub)=>box('tok_'+id,{position:'absolute',left:cx-w/2,top:cy-50,width:w,height:100,flexDirection:'column',justifyContent:'center',alignItems:'center'},[
 T(id+'_token',s,{lineHeight:1.25,...style},'tok_'+id),
 ...(sub?[T(id+'_sub',sub,{fontSize:20,color:P.muted,lineHeight:1.25},'tok_'+id)]:[])
]);

const svg=[];
const S=P.muted,STROKE=2;
const pts=a=>a.map(p=>p.join(',')).join(' ');
const head=(x,y,ang,c=S)=>{const d=13,w=6.5,cs=Math.cos(ang),sn=Math.sin(ang);return `<polygon points="${pts([[x,y],[x-d*cs+w*sn,y-d*sn-w*cs],[x-d*cs-w*sn,y-d*sn+w*cs]])}" fill="${c}"/>`};
const unit=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return [dx/l,dy/l]};
const route=(p,{dash,start=false,end=true,c=S}={})=>{
 p=p.map(q=>[...q]);
 const ue=unit(p.at(-2),p.at(-1)),us=unit(p[1],p[0]);
 const tipE=[...p.at(-1)],tipS=[...p[0]];
 if(end){p.at(-1)[0]-=ue[0]*10;p.at(-1)[1]-=ue[1]*10}
 if(start){p[0][0]-=us[0]*10;p[0][1]-=us[1]*10}
 let d=`M ${p[0][0]} ${p[0][1]}`;
 for(let i=1;i<p.length-1;i++){
  const a=unit(p[i-1],p[i]),b=unit(p[i],p[i+1]),r=18;
  d+=` L ${p[i][0]-a[0]*r} ${p[i][1]-a[1]*r} Q ${p[i][0]} ${p[i][1]} ${p[i][0]+b[0]*r} ${p[i][1]+b[1]*r}`;
 }
 d+=` L ${p.at(-1)[0]} ${p.at(-1)[1]}`;
 svg.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`);
 if(end)svg.push(head(...tipE,Math.atan2(ue[1],ue[0]),c));
 if(start)svg.push(head(...tipS,Math.atan2(us[1],us[0]),c));
};
const hex=(cx,cy,w,h,{edge=S,fill=P.surface}={})=>svg.push(`<polygon points="${pts(hexPts(cx,cy,w,h))}" fill="${fill}" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`);
for(const x of RULES)svg.push(`<line x1="${x}" y1="215" x2="${x}" y2="335" stroke="${P.rule}" stroke-width="2"/>`);
for(const s of stages)svg.push(`<circle cx="${COL[s.id]}" cy="245" r="22" fill="${P.surface}" stroke="${P.rule}" stroke-width="2"/>`);
// Phase 0 (open, close) carries the single accent; everything else is plain surface.
const PH0={fill:P.accent,edge:P.accentEdge};
hex(COL.open,MY,OPEN.w,OPEN.h,PH0);hex(COL.dispatch,MY,DSP.w,DSP.h);hex(COL.merge,MY,MRG.w,MRG.h);hex(COL.close,MY,CLS.w,CLS.h,PH0);
hex(STALL.x,STALL.y,STALL.w,STALL.h,{edge:P.rule});
for(const x of TGT_X)hex(x,TGT_Y,...TGT,{edge:P.rule});
svg.push(`<circle cx="${OP.x}" cy="${OP.y}" r="${OP.r}" fill="${P.surface}" stroke="${P.rule}" stroke-width="3"/>`);
svg.push(`<rect x="${SHELF.x}" y="${SHELF.y}" width="${SHELF.w}" height="${SHELF.h}" rx="16" fill="${P.surface}" stroke="${P.rule}" stroke-width="2"/>`);
for(const x of DIV.slice(1))svg.push(`<line x1="${x}" y1="${SHELF.y+18}" x2="${x}" y2="${SHELF.y+SHELF.h-18}" stroke="${P.rule}" stroke-width="1.5"/>`);
// The day.
const hw=(c,n)=>COL[c]+n.w/2,lw=(c,n)=>COL[c]-n.w/2;
route([[hw('open',OPEN)+6,MY],[lw('dispatch',DSP)-6,MY]]);
route([[hw('dispatch',DSP)+6,MY],[lw('merge',MRG)-6,MY]]);
route([[hw('merge',MRG)+6,MY],[lw('close',CLS)-6,MY]]);
svg.push(`<path d="M 1262 700 C 1200 598, 905 598, 846 668" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round"/>`,head(840,676,Math.atan2(676-598,840-905)));
route([[COL.dispatch,MY-DSP.h/2-4],[COL.dispatch,STALL.y+STALL.h/2+4]],{start:true});
// Operator approvals: the day plan, and both merge windows.
route([[OP.x-OP.r,OP.y],[COL.open,OP.y],[COL.open,MY-OPEN.h/2-4]]);
route([[OP.x,OP.y+OP.r],[OP.x,MY-MRG.h/2-4]]);
// Routing fan to existing skills.
svg.push(`<path d="M ${COL.dispatch} ${MY+DSP.h/2+4} L ${COL.dispatch} ${BRACKET_Y} M ${TGT_X[0]} ${BRACKET_Y} L ${TGT_X.at(-1)} ${BRACKET_Y}" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round"/>`);
for(const x of TGT_X)route([[x,BRACKET_Y],[x,TGT_Y-TGT[1]/2-4]]);
// The report seeds tomorrow: close back to open around the outside.
route([[COL.close+CLS.w/2+6,MY],[2080,MY],[2080,1230],[120,1230],[120,MY+OPEN.h/4],[COL.open-OPEN.w/2-4,MY+OPEN.h/4]]);
svg.push(`<line x1="1360" y1="1462" x2="1408" y2="1462" stroke="${S}" stroke-width="${STROKE}"/>`);
svg.push(`<polygon points="${pts(hexPts(1560,1462,26,28))}" fill="${P.accent}" stroke="${P.accentEdge}" stroke-width="1.5"/>`);

const ico=(inner,size=64)=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${P.muted}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const iconIds=['icon_operator'];

const children=[img('vectors',svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg.join('')}</svg>`),0,0,W,H)];
children.push(box('title_panel',{position:'absolute',left:240,top:58,width:1720,height:90,borderRadius:16,border:`2px solid ${P.rule}`,backgroundColor:P.surface,boxShadow:'0 4px 0 #e4e3dc',justifyContent:'center',alignItems:'center'},[T('title',fixture.title,{fontSize:40,letterSpacing:1},'title_panel')]));
children.push(box('sub',{position:'absolute',left:240,top:166,width:1720,justifyContent:'center'},[T('subtitle',fixture.subtitle,{fontSize:20,color:P.muted,textAlign:'center'})]));
const fArrow=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="12"><path d="M1 6 H15" stroke="${P.ink}" stroke-width="1.6"/><polygon points="21,6 14,2 14,10" fill="${P.ink}"/></svg>`);
for(const s of stages){
 const x=COL[s.id];
 children.push(box('num_'+s.id,{position:'absolute',left:x-22,top:225,width:44,height:40,justifyContent:'center',alignItems:'center'},[T('num_'+s.id+'_token',String(s.number),{fontSize:22,lineHeight:1.25})]));
 children.push(box('formula_'+s.id,{position:'absolute',left:x-200,top:282,width:400,justifyContent:'center',alignItems:'center',gap:10},s.formula.flatMap((f,i)=>[...(i?[node('img',null,{width:22,height:12},undefined,{src:fArrow})]:[]),T(`formula_${s.id}_${i}`,f,{fontSize:26})])));
}
children.push(img('icon_operator',ico('<circle cx="32" cy="22" r="10"/><path d="M12 56 C12 42 22 36 32 36 C42 36 52 42 52 56"/>',48),OP.x-24,OP.y-24,48));
children.push(centred('open',N.open.token,COL.open,MY,OPEN.w-16,{fontSize:38,fontWeight:700},N.open.sub));
children.push(centred('dispatch',N.dispatch.token,COL.dispatch,MY,DSP.w-20,{fontSize:48,fontWeight:700},N.dispatch.sub));
children.push(centred('merge',N.merge.token,COL.merge,MY,MRG.w-16,{fontSize:38,fontWeight:700},N.merge.sub));
children.push(centred('close',N.close.token,COL.close,MY,CLS.w-16,{fontSize:38,fontWeight:700},N.close.sub));
children.push(centred('stall',N.stall.token,STALL.x,STALL.y,STALL.w-12,{fontSize:26,fontWeight:700},N.stall.sub));
fixture.routes.targets.forEach((t,i)=>{
 children.push(centred('tgt'+i,t.token,TGT_X[i],TGT_Y,TGT[0]-8,{fontSize:18,fontWeight:700}));
 children.push(box('tgtcap'+i,{position:'absolute',left:TGT_X[i]-70,top:TGT_Y+TGT[1]/2+8,width:140,justifyContent:'center'},[T('tgt'+i+'_caption',t.caption,{fontSize:16,color:P.muted,textAlign:'center'})]));
});
children.push(box('routes_head',{position:'absolute',left:200,top:1048,width:250,justifyContent:'flex-end'},[T('routes_label',fixture.routes.label,{fontSize:17,fontWeight:700,letterSpacing:2,color:P.muted,textAlign:'right'})]));
children.push(label('open',COL.open-115,MY+OPEN.h/2+14,230,N.open.label,N.open.caption));
children.push(label('dispatch',915,MY+30,300,N.dispatch.label,N.dispatch.caption,'left'));
children.push(label('stall',STALL.x+STALL.w/2+14,STALL.y-50,240,N.stall.label,N.stall.caption,'left'));
children.push(label('merge',COL.merge-115,MY+MRG.h/2+14,230,N.merge.label,N.merge.caption));
children.push(label('close',COL.close-115,MY+CLS.h/2+14,230,N.close.label,N.close.caption));
children.push(label('operator',OP.x+OP.r+12,OP.y-26,260,N.operator.label,N.operator.caption,'left'));
children.push(edgeText('approveplan',E.approvePlan,COL.open+12,560,170));
children.push(edgeText('approvemerge',E.approveMerge,OP.x+12,560,160));
children.push(edgeText('plan',E.plan,hw('open',OPEN)+6,MY-32,lw('dispatch',DSP)-hw('open',OPEN)-12,'center'));
children.push(edgeText('prready',E.prReady,hw('dispatch',DSP)+6,MY-32,lw('merge',MRG)-hw('dispatch',DSP)-12,'center'));
children.push(edgeText('endofday',E.endOfDay,hw('merge',MRG)+6,MY-32,lw('close',CLS)-hw('merge',MRG)-12,'center'));
children.push(edgeText('refresh',E.refresh,970,574,170,'center'));
children.push(edgeText('stall',E.stall,COL.dispatch-200,596,188,'right'));
children.push(edgeText('seed',E.seed,900,1240,300,'center'));
// Prerequisites as a plain numbered list (AS-3: not boxed).
children.push(box('prereq',{position:'absolute',left:1560,top:1010,width:480,flexDirection:'column',gap:6},[
 T('prereq_label',fixture.prerequisites.label,{fontSize:17,fontWeight:700,letterSpacing:2,color:P.muted}),
 ...fixture.prerequisites.items.map((s,i)=>T('prereq'+i,`${i+1}. ${s}`,{fontSize:17,color:P.ink}))
]));
children.push(box('shelf_head',{position:'absolute',left:SHELF.x+24,top:SHELF.y,width:DIV[0]-SHELF.x-40,height:SHELF.h,alignItems:'center'},[T('records_label',fixture.records.label,{fontSize:18,fontWeight:700,letterSpacing:2},'shelf_head')]));
fixture.records.entries.forEach((r,i)=>{
 const x0=DIV[i],x1=DIV[i+1]??SHELF.x+SHELF.w,id='rec'+i;
 children.push(box('recbox'+i,{position:'absolute',left:x0+24,top:SHELF.y,width:x1-x0-48,height:SHELF.h,alignItems:'center',gap:16},[
  T(id+'_token',r.token,{fontSize:34,color:P.muted,lineHeight:1.25},'recbox'+i),
  box('rectext'+i,{flexDirection:'column',gap:3,flexShrink:1},[T(id+'_label',r.label,{fontSize:21,fontWeight:700},'recbox'+i),T(id+'_caption',r.caption,{fontSize:17,color:P.muted},'recbox'+i)])
 ]));
});
children.push(box('footer',{position:'absolute',left:140,top:1420,width:1160,flexDirection:'column',gap:6},[
 T('footer_note',fixture.footer.note,{fontSize:16,color:P.muted}),
 T('footer_source',fixture.footer.source,{fontSize:15,color:P.muted})
]));
children.push(box('legend_c',{position:'absolute',left:1416,top:1451,width:110},[T('legend_control',fixture.legend.control,{fontSize:16,color:P.muted})]));
children.push(box('legend_p',{position:'absolute',left:1582,top:1451,width:400},[T('legend_phase0',fixture.legend.phase0,{fontSize:16,color:P.muted})]));
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:P.background,fontFamily:FAMILY,overflow:'hidden'},children);

const result=await renderSatori(scene,fonts,W,H,FAMILY);
const browser=await chromium.launch({headless:true});
let chromiumResult;
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 context.setDefaultTimeout(30000);
 chromiumResult=await renderPlaywright(context,scene,fonts,W,H,FAMILY);
 await context.close();
}finally{await browser.close()}

// Layout checks: glyph coverage, canvas and container containment, overflow and text overlap in both backends.
const findings=[];
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
 for(const id of iconIds)if(!finite(b.bounds[id])||!inside(b.bounds[id],canvas,.5))findings.push({id,backend:name,reason:'icon missing or outside canvas'});
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

const NAME='xyz-forge-shift-proposal';
await fs.writeFile(path.join(ROOT,NAME+'.png'),result.png);
await fs.writeFile(path.join(ROOT,NAME+'-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,NAME+'.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:${P.background}}#canvas{transform-origin:top left}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();</script></body>`);
await fs.writeFile(path.join(ROOT,NAME+'.html'),responsive);
const evidence={renderer:'Shared root tools/render.mjs renderSatori / renderPlaywright; bundled Barlow Condensed',width:W,height:H,textIds:texts,iconIds,artifactDigests:{png:sha(result.png),chromiumPng:sha(chromiumResult.png),html:sha(responsive)},findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${texts.length} text ids and ${iconIds.length} icons; ${W}x${H} in both backends; no unsupported glyphs, escapes, overflow or overlap.`);
