import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Reuses the import-safe shared renderer, root dependencies and the bundled Barlow Condensed faces.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../../../',import.meta.url);
const {renderSatori,renderPlaywright}=await import(new URL('tools/render.mjs',RT).href);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
const fixture=JSON.parse(await fs.readFile(path.join(ROOT,'fixture.json'),'utf8'));
const {width:W,height:H,theme:{palette:P},stages,edges:E}=fixture;
const FAMILY='Barlow Condensed';
const fonts={regular:await fs.readFile(new URL('tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf',RT)),bold:await fs.readFile(new URL('tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf',RT))};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const svgData=s=>`data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const img=(id,src,x,y,w,h=w)=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h},undefined,{src});

assert.deepEqual(stages.map(s=>s.id),['intake','plan','execute','gate','deliver'],'fixture must hold the five forge stages in order');
assert.equal(fixture.modes.length,4,'four alternative execution modes');
assert.equal(fixture.records.entries.length,3,'three durable record stores');

// Geometry has one owner: this table. Main reading line at y720; the harness is the largest node.
const MY=720,COL={intake:210,plan:520,execute:900,gate:1290,deliver:1600,github:1850};
const HEX={plan:[150,170],execute:[230,260],gate:[150,170],deliver:[150,170]};
const RULES=[365,710,1095,1445,1725];
const OP={x:1445,y:470,r:38},INTAKE_R=70,GH_R=62;
const MODE_Y=945,MODE_W=90,MODE_H=100,MODE_X=[725,842,958,1075];
const CARD_Y=1110,CARD_W=130,CARD_H=120,RUN={workspaces:640,adapters:900,tick:1180};
const SHELF={x:140,y:1366,w:1620,h:104},DIV=[340,830,1270];
const hexPts=(cx,cy,w,h)=>[[cx,cy-h/2],[cx+w/2,cy-h/4],[cx+w/2,cy+h/4],[cx,cy+h/2],[cx-w/2,cy+h/4],[cx-w/2,cy-h/4]];

const texts=[],container={},seen=new Set();
const T=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seen.has(id),`duplicate text id ${id}`);
 seen.add(id);texts.push(id);if(within)container[id]=within;
 return node('span',id,{fontSize:18,lineHeight:1.3,color:P.ink,...style},s);
};
// Belief-reference typography: bold label over a muted caption, centred unless told otherwise.
const label=(id,x,y,w,title,caption,align='center')=>box('lab_'+id,{position:'absolute',left:x,top:y,width:w,flexDirection:'column',alignItems:align==='center'?'center':align==='right'?'flex-end':'flex-start',gap:4},[
 T(id+'_label',title,{fontSize:23,fontWeight:700,textAlign:align}),
 ...(caption?[T(id+'_caption',caption,{fontSize:18,color:P.muted,textAlign:align})]:[])
]);
const edgeText=(id,s,x,y,w,align='left')=>box('edge_'+id,{position:'absolute',left:x,top:y,width:w,justifyContent:align==='right'?'flex-end':align==='center'?'center':'flex-start'},[T('edge_'+id+'_text',s,{fontSize:17,color:P.muted,textAlign:align})]);
const centred=(id,s,cx,cy,w,style)=>box('tok_'+id,{position:'absolute',left:cx-w/2,top:cy-40,width:w,height:80,justifyContent:'center',alignItems:'center'},[T(id+'_token',s,{lineHeight:1.25,...style})]);

// Vector layer: rules, nodes and connectors. Solid = control flow; dashed = record reads/writes.
const svg=[];
const S=P.muted,STROKE=2;
const pts=a=>a.map(p=>p.join(',')).join(' ');
const head=(x,y,ang,c=S)=>{const d=13,w=6.5,cs=Math.cos(ang),sn=Math.sin(ang);return `<polygon points="${pts([[x,y],[x-d*cs+w*sn,y-d*sn-w*cs],[x-d*cs-w*sn,y-d*sn+w*cs]])}" fill="${c}"/>`};
const unit=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return [dx/l,dy/l]};
// Polyline with 18px rounded elbows; shortened ends leave room for the arrowheads.
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
for(const x of RULES)svg.push(`<line x1="${x}" y1="215" x2="${x}" y2="335" stroke="${P.rule}" stroke-width="2"/>`);
for(const s of stages)svg.push(`<circle cx="${COL[s.id]}" cy="245" r="22" fill="${P.surface}" stroke="${P.rule}" stroke-width="2"/>`);
svg.push(`<line x1="140" y1="365" x2="1760" y2="365" stroke="${P.rule}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`);
for(const [id,[w,h]] of Object.entries(HEX))svg.push(`<polygon points="${pts(hexPts(COL[id],MY,w,h))}" fill="${P.surface}" stroke="${S}" stroke-width="${STROKE}" stroke-linejoin="round"/>`);
svg.push(`<circle cx="${COL.intake}" cy="${MY}" r="${INTAKE_R}" fill="${P.surface}" stroke="${P.rule}" stroke-width="3"/>`);
svg.push(`<circle cx="${COL.github}" cy="${MY}" r="${GH_R}" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-dasharray="6 6"/>`);
svg.push(`<circle cx="${OP.x}" cy="${OP.y}" r="${OP.r}" fill="${P.surface}" stroke="${P.rule}" stroke-width="3"/>`);
for(const x of MODE_X)svg.push(`<polygon points="${pts(hexPts(x,MODE_Y,MODE_W,MODE_H))}" fill="${P.surface}" stroke="${P.rule}" stroke-width="2" stroke-linejoin="round"/>`);
for(const x of Object.values(RUN))svg.push(`<rect x="${x-CARD_W/2}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="16" fill="${P.surface}" stroke="${P.rule}" stroke-width="2"/>`);
svg.push(`<rect x="${SHELF.x}" y="${SHELF.y}" width="${SHELF.w}" height="${SHELF.h}" rx="16" fill="${P.accent}" stroke="${P.accentEdge}" stroke-width="2"/>`);
for(const x of DIV.slice(1))svg.push(`<line x1="${x}" y1="${SHELF.y+18}" x2="${x}" y2="${SHELF.y+SHELF.h-18}" stroke="${P.accentEdge}" stroke-width="1.5"/>`);
// Main reading line and its loops.
const hw=id=>HEX[id][0]/2;
route([[COL.intake+INTAKE_R+6,MY],[COL.plan-hw('plan')-6,MY]]);
route([[COL.plan+hw('plan')+6,MY],[COL.execute-hw('execute')-6,MY]]);
route([[COL.execute+hw('execute')+6,MY],[COL.gate-hw('gate')-6,MY]]);
route([[COL.gate+hw('gate')+6,MY],[COL.deliver-hw('deliver')-6,MY]]);
route([[COL.deliver+hw('deliver')+6,MY],[COL.github-GH_R-6,MY]],{start:true});
svg.push(`<path d="M 1238 656 C 1196 584, 1062 574, 1004 626" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round"/>`,head(996,634,Math.atan2(634-574,996-1050)));
// Operator routes: direction above the line, escalation up from the gates, approval down to delivery.
const top=id=>MY-HEX[id][1]/2;
route([[OP.x,OP.y-OP.r],[OP.x,400],[COL.intake,400],[COL.intake,MY-INTAKE_R-4]]);
route([[COL.gate,top('gate')-4],[COL.gate,OP.y],[OP.x-OP.r-4,OP.y]]);
route([[OP.x+OP.r,OP.y],[COL.deliver,OP.y],[COL.deliver,top('deliver')-4]]);
// Harness spine to the agent adapters (through the gap between Relay and Swarm), and runtime links.
route([[COL.execute,MY+HEX.execute[1]/2+4],[COL.execute,CARD_Y-4]],{start:true});
route([[RUN.adapters-CARD_W/2-4,CARD_Y+60],[RUN.workspaces+CARD_W/2+4,CARD_Y+60]]);
route([[RUN.adapters+CARD_W/2+4,CARD_Y+60],[RUN.tick-CARD_W/2-4,CARD_Y+60]],{start:true});
// Record connectors land on the shelf top.
const DASH='7 7';
route([[COL.intake,938],[COL.intake,SHELF.y-4]],{dash:DASH});
route([[COL.plan,SHELF.y-4],[COL.plan,MY+HEX.plan[1]/2+4]],{dash:DASH});
route([[COL.gate,938],[COL.gate,SHELF.y-4]],{dash:DASH,start:true});
route([[COL.deliver,938],[COL.deliver,SHELF.y-4]],{dash:DASH});
// Footer legend samples.
svg.push(`<line x1="1430" y1="1515" x2="1478" y2="1515" stroke="${S}" stroke-width="${STROKE}"/>`,`<line x1="1610" y1="1515" x2="1658" y2="1515" stroke="${S}" stroke-width="${STROKE}" stroke-dasharray="${DASH}"/>`);

// Hand-drawn stroke icons; each depicts what its node does.
const ico=(inner,size=64)=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${P.muted}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const icons={
 intake:'<path d="M8 36 L16 14 H48 L56 36 V52 H8 Z"/><path d="M8 36 H22 L26 42 H38 L42 36 H56"/><path d="M32 4 V26 M24 18 L32 26 L40 18"/>',
 operator:'<circle cx="32" cy="22" r="10"/><path d="M12 56 C12 42 22 36 32 36 C42 36 52 42 52 56"/>',
 adapters:'<rect x="6" y="12" width="52" height="40" rx="5"/><path d="M6 22 H58"/><path d="M16 32 L23 38 L16 44 M28 44 H40"/>',
 tick:'<rect x="14" y="28" width="36" height="26" rx="4"/><path d="M22 28 V20 C22 9 42 9 42 20 V28"/><path d="M32 38 V45"/>',
 workspaces:'<circle cx="18" cy="12" r="5"/><circle cx="18" cy="52" r="5"/><circle cx="46" cy="22" r="5"/><path d="M18 17 V47 M46 27 C46 38 18 34 18 47"/>'
};
const iconIds=['icon_intake','icon_operator',...Object.keys(RUN).map(k=>'icon_'+k)];

const children=[img('vectors',svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg.join('')}</svg>`),0,0,W,H)];
children.push(box('title_panel',{position:'absolute',left:240,top:58,width:1520,height:90,borderRadius:16,border:`2px solid ${P.rule}`,backgroundColor:P.surface,boxShadow:'0 4px 0 #e4e3dc',justifyContent:'center',alignItems:'center'},[T('title',fixture.title,{fontSize:40,letterSpacing:1})],));
container.title='title_panel';
children.push(box('sub',{position:'absolute',left:240,top:166,width:1520,justifyContent:'center'},[T('subtitle',fixture.subtitle,{fontSize:20,color:P.muted})]));
// Stage markers and formulas; formula arrows are geometry because Barlow Condensed lacks the arrow glyph.
const fArrow=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="12"><path d="M1 6 H15" stroke="${P.ink}" stroke-width="1.6"/><polygon points="21,6 14,2 14,10" fill="${P.ink}"/></svg>`);
for(const s of stages){
 children.push(centred('num_'+s.id,String(s.number),COL[s.id],245,44,{fontSize:22,color:P.ink}));
 children.push(box('formula_'+s.id,{position:'absolute',left:COL[s.id]-150,top:282,width:300,justifyContent:'center',alignItems:'center',gap:10},s.formula.flatMap((f,i)=>[...(i?[node('img',null,{width:22,height:12},undefined,{src:fArrow})]:[]),T(`formula_${s.id}_${i}`,f,{fontSize:26})])));
}
children.push(box('ext_head',{position:'absolute',left:COL.github-90,top:232,width:180,justifyContent:'center'},[T('external_header',fixture.external.header.toUpperCase(),{fontSize:17,letterSpacing:2,color:P.muted})]));
children.push(box('skills',{position:'absolute',left:560,top:352,width:880,justifyContent:'center'},[box('skills_pad',{paddingLeft:14,paddingRight:14,backgroundColor:P.background},[T('skills_text',fixture.skills,{fontSize:18,color:P.muted,lineHeight:1.4})])]));
// Main nodes.
const st=Object.fromEntries(stages.map(s=>[s.id,s]));
children.push(img('icon_intake',ico(icons.intake),COL.intake-32,MY-32,64));
for(const id of ['plan','gate','deliver'])children.push(centred(id,st[id].token,COL[id],MY,HEX[id][0],{fontSize:40}));
children.push(centred('execute',st.execute.token,COL.execute,MY,HEX.execute[0],{fontSize:52}));
children.push(centred('github',fixture.external.token,COL.github,MY,GH_R*2-12,{fontSize:24}));
children.push(img('icon_operator',ico(icons.operator,48),OP.x-24,OP.y-24,48));
children.push(label('intake',COL.intake-122,MY+INTAKE_R+14,244,st.intake.label,st.intake.caption));
children.push(label('plan',COL.plan-120,520,240,st.plan.label,st.plan.caption));
children.push(label('execute',COL.execute-120,520,240,st.execute.label,st.execute.caption));
children.push(label('gate',COL.gate-108,MY+HEX.gate[1]/2+14,216,st.gate.label,st.gate.caption));
children.push(label('deliver',COL.deliver-128,MY+HEX.deliver[1]/2+14,256,st.deliver.label,st.deliver.caption));
children.push(label('github',COL.github-95,MY+GH_R+14,190,fixture.external.label,fixture.external.caption));
children.push(label('operator',OP.x-95,OP.y+OP.r+10,190,fixture.operator.label,fixture.operator.caption));
// Execution modes: alternatives, so the trail has no arrows between them.
fixture.modes.forEach((m,i)=>{
 children.push(centred('mode'+i,m.token,MODE_X[i],MODE_Y,MODE_W-8,{fontSize:20,fontWeight:700}));
 children.push(box('modecap'+i,{position:'absolute',left:MODE_X[i]-50,top:MODE_Y+MODE_H/2+8,width:100,justifyContent:'center'},[T('mode'+i+'_caption',m.caption,{fontSize:16,color:P.muted,textAlign:'center'})]));
});
// Runtime cards with labels below, as the reference's consequence cards.
for(const [k,x] of Object.entries(RUN)){
 children.push(img('icon_'+k,ico(icons[k]),x-32,CARD_Y+CARD_H/2-32,64));
 children.push(label(k,x-100,CARD_Y+CARD_H+12,200,fixture.runtime[k].label,fixture.runtime[k].caption));
}
// Connector labels.
children.push(edgeText('directs',E.directs,COL.intake+14,470,150));
children.push(edgeText('blocked',E.blocked,COL.gate-196,494,184,'right'));
children.push(edgeText('approvals',E.approvals,COL.deliver+12,520,120));
children.push(edgeText('revise',E.revise,1040,550,170,'center'));
children.push(edgeText('verified',E.verified,COL.gate+hw('gate'),MY-32,COL.deliver-hw('deliver')-COL.gate-hw('gate'),'center'));
children.push(edgeText('github',E.github,COL.deliver+hw('deliver')+6,MY-64,COL.github-GH_R-COL.deliver-hw('deliver')-12,'center'));
children.push(edgeText('dispatch',E.dispatch,COL.execute+12,1066,140));
children.push(edgeText('claims',E.claims,RUN.adapters+CARD_W/2+4,CARD_Y+30,RUN.tick-RUN.adapters-CARD_W-8,'center'));
children.push(edgeText('workin',E.workIn,RUN.workspaces+CARD_W/2+4,CARD_Y+30,RUN.adapters-RUN.workspaces-CARD_W-8,'center'));
children.push(edgeText('intakerec',E.intakeRec,COL.intake+12,1110,120));
children.push(edgeText('planrec',E.planRec,COL.plan+12,1040,140));
children.push(edgeText('gaterec',E.gateRec,COL.gate+12,1110,150));
children.push(edgeText('deliverrec',E.deliverRec,COL.deliver+12,1110,150));
// Durable records shelf.
children.push(box('shelf_head',{position:'absolute',left:SHELF.x+24,top:SHELF.y,width:DIV[0]-SHELF.x-40,height:SHELF.h,alignItems:'center'},[T('records_label',fixture.records.label,{fontSize:18,fontWeight:700,letterSpacing:2,color:P.ink})]));
fixture.records.entries.forEach((r,i)=>{
 const x0=DIV[i],x1=DIV[i+1]??SHELF.x+SHELF.w,id='rec'+i;
 children.push(box('recbox'+i,{position:'absolute',left:x0+24,top:SHELF.y,width:x1-x0-48,height:SHELF.h,alignItems:'center',gap:16},[
  T(id+'_token',r.token,{fontSize:34,color:P.muted,lineHeight:1.25}),
  box('rectext'+i,{flexDirection:'column',gap:3,flexShrink:1},[T(id+'_label',r.label,{fontSize:21,fontWeight:700}),T(id+'_caption',r.caption,{fontSize:17,color:P.muted})])
 ]));
 for(const k of ['_token','_label','_caption'])container[id+k]='recbox'+i;
});
// Footer.
children.push(box('footer',{position:'absolute',left:140,top:1496,width:1220,flexDirection:'column',gap:6},[
 T('footer_note',fixture.footer.note,{fontSize:16,color:P.muted}),
 T('footer_source',fixture.footer.source,{fontSize:15,color:P.muted})
]));
children.push(box('legend_c',{position:'absolute',left:1486,top:1504,width:110},[T('legend_control',fixture.legend.control,{fontSize:16,color:P.muted})]));
children.push(box('legend_r',{position:'absolute',left:1666,top:1504,width:180},[T('legend_records',fixture.legend.records,{fontSize:16,color:P.muted})]));
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

await fs.writeFile(path.join(ROOT,'xyz-forge-system.png'),result.png);
await fs.writeFile(path.join(ROOT,'xyz-forge-system-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,'xyz-forge-system.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:${P.background}}#canvas{transform-origin:top left}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();</script></body>`);
await fs.writeFile(path.join(ROOT,'xyz-forge-system.html'),responsive);
const evidence={renderer:'Shared root tools/render.mjs renderSatori / renderPlaywright; bundled Barlow Condensed',width:W,height:H,textIds:texts,iconIds,artifactDigests:{png:sha(result.png),chromiumPng:sha(chromiumResult.png),html:sha(responsive)},findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${texts.length} text ids and ${iconIds.length} icons; ${W}x${H} in both backends; no unsupported glyphs, escapes, overflow or overlap.`);
