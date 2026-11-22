import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Version 2 of the XYZ Forge example: the skills become the subject. Same shared renderer, bundled
// Barlow Condensed and belief-reference vocabulary as examples/xyz-forge/today/system-v1/.
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

// The operator-named factory commands (six nodes; /review-pr rides as an alias) must all be present; the diagram is about them.
const FACTORY=['daily','workhorse','startTask','marathon','review','merge'];
for(const k of FACTORY)assert.ok(N[k]?.token?.startsWith('/'),`factory node ${k} needs a slash-command token`);
assert.equal(N.review.alias,'/review-pr','review node must carry the /review-pr alias');
assert.equal(fixture.rails.skills.length,5,'five method skills');
assert.equal(fixture.records.entries.length,3,'three durable record stores');

// Geometry has one owner: this table. Reading line at y830; /start-task is the largest node.
const MY=830,COL={daily:190,intake:470,build:900,review:1340,land:1680,github:1980};
const RULES=[330,640,1150,1510,1830];
const DAILY_R=80,GH_R=58,OP={x:190,y:520,r:38};
const SMALL=[120,124],IDEA_Y=770,TRIAGE_Y=900;
const WH={y:560,w:170,h:180},ST={w:250,h:280},MAR={y:1200,w:170,h:170},REV={w:200,h:220},MRG={w:200,h:220};
const ATE={x:190,y:1190,w:150,h:160};
const RAIL_X=[760,900,1040,1180,1320],RAIL_Y=1390,RAIL=[120,112];
const SHELF={x:140,y:1526,w:1920,h:104},DIV=[340,920,1490];
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
// A centred token inside a node; an optional second line carries an alias.
const centred=(id,s,cx,cy,w,style,sub)=>box('tok_'+id,{position:'absolute',left:cx-w/2,top:cy-50,width:w,height:100,flexDirection:'column',justifyContent:'center',alignItems:'center'},[
 T(id+'_token',s,{lineHeight:1.25,...style},'tok_'+id),
 ...(sub?[T(id+'_alias',sub,{fontSize:20,color:P.muted,lineHeight:1.25},'tok_'+id)]:[])
]);

// Vector layer. Solid = control flow; dashed = record reads/writes; dotted = stage rules.
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
const colOf=Object.fromEntries(stages.map(s=>[s.id,COL[s.id]]));
for(const x of RULES)svg.push(`<line x1="${x}" y1="215" x2="${x}" y2="335" stroke="${P.rule}" stroke-width="2"/>`);
for(const s of stages)svg.push(`<circle cx="${colOf[s.id]}" cy="245" r="22" fill="${P.surface}" stroke="${P.rule}" stroke-width="2"/>`);
// Nodes: daily and the operator as circles; factory commands as point-up hexagons; GitHub dashed.
svg.push(`<circle cx="${COL.daily}" cy="${MY}" r="${DAILY_R}" fill="${P.surface}" stroke="${P.rule}" stroke-width="3"/>`);
svg.push(`<circle cx="${OP.x}" cy="${OP.y}" r="${OP.r}" fill="${P.surface}" stroke="${P.rule}" stroke-width="3"/>`);
hex(COL.intake,IDEA_Y,...SMALL,{edge:P.rule});hex(COL.intake,TRIAGE_Y,...SMALL,{edge:P.rule});
hex(COL.build,WH.y,WH.w,WH.h);hex(COL.build,MY,ST.w,ST.h);hex(COL.build,MAR.y,MAR.w,MAR.h);
hex(COL.review,MY,REV.w,REV.h);hex(COL.land,MY,MRG.w,MRG.h);
svg.push(`<circle cx="${COL.github}" cy="${MY}" r="${GH_R}" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-dasharray="6 6"/>`);
hex(ATE.x,ATE.y,ATE.w,ATE.h);
for(const x of RAIL_X)hex(x,RAIL_Y,...RAIL,{edge:P.rule});
svg.push(`<rect x="${SHELF.x}" y="${SHELF.y}" width="${SHELF.w}" height="${SHELF.h}" rx="16" fill="${P.accent}" stroke="${P.accentEdge}" stroke-width="2"/>`);
for(const x of DIV.slice(1))svg.push(`<line x1="${x}" y1="${SHELF.y+18}" x2="${x}" y2="${SHELF.y+SHELF.h-18}" stroke="${P.accentEdge}" stroke-width="1.5"/>`);
// Operator loop: /daily coaches the operator, who directs intake and authorizes merges.
route([[COL.daily,MY-DAILY_R-6],[COL.daily,OP.y+OP.r+4]]);
route([[OP.x,OP.y-OP.r],[OP.x,405],[COL.intake,405],[COL.intake,IDEA_Y-SMALL[1]/2-4]]);
route([[COL.intake,405],[COL.land,405],[COL.land,MY-MRG.h/2-4]],{});
// Main line.
const STL=COL.build-ST.w/2;
route([[COL.intake+SMALL[0]/2+6,IDEA_Y],[STL-6,IDEA_Y]]);
route([[COL.intake+SMALL[0]/2+6,TRIAGE_Y-10],[STL+8,TRIAGE_Y-10]]);
route([[COL.build,WH.y+WH.h/2+4],[COL.build,MY-ST.h/2-4]]);
route([[COL.build+ST.w/2+6,MY],[COL.review-REV.w/2-6,MY]]);
route([[COL.review+REV.w/2+6,MY],[COL.land-MRG.w/2-6,MY]]);
route([[COL.land+MRG.w/2+6,MY],[COL.github-GH_R-6,MY]],{start:true});
svg.push(`<path d="M 1262 900 C 1222 992, 1062 992, 1003 930" fill="none" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round"/>`,head(996,922,Math.atan2(922-992,996-1062)));
// Batch lane: intake to /marathon, whose lane PRs also go to review.
route([[COL.intake+SMALL[0]/2,TRIAGE_Y+SMALL[1]/4],[600,TRIAGE_Y+SMALL[1]/4],[600,MAR.y],[COL.build-MAR.w/2-6,MAR.y]]);
route([[COL.build+MAR.w/2+6,MAR.y],[COL.review,MAR.y],[COL.review,MY+REV.h/2+6]]);
// ATE runs end in one GitHub issue, which enters the factory through /triage.
route([[ATE.x+ATE.w/2+6,ATE.y],[330,ATE.y],[330,TRIAGE_Y+SMALL[1]/4],[COL.intake-SMALL[0]/2-6,TRIAGE_Y+SMALL[1]/4]]);
// Record connectors.
const DASH='7 7';
route([[COL.intake,1070],[COL.intake,SHELF.y-4]],{dash:DASH});
route([[COL.land,1072],[COL.land,SHELF.y-4]],{dash:DASH});
svg.push(`<line x1="1520" y1="1685" x2="1568" y2="1685" stroke="${S}" stroke-width="${STROKE}"/>`,`<line x1="1700" y1="1685" x2="1748" y2="1685" stroke="${S}" stroke-width="${STROKE}" stroke-dasharray="${DASH}"/>`);

const ico=(inner,size=64)=>svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${P.muted}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const icons={
 daily:'<circle cx="32" cy="32" r="26"/><path d="M32 14 V32 L44 38"/>',
 operator:'<circle cx="32" cy="22" r="10"/><path d="M12 56 C12 42 22 36 32 36 C42 36 52 42 52 56"/>'
};
const iconIds=['icon_daily','icon_operator'];

const children=[img('vectors',svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg.join('')}</svg>`),0,0,W,H)];
children.push(box('title_panel',{position:'absolute',left:240,top:58,width:1720,height:90,borderRadius:16,border:`2px solid ${P.rule}`,backgroundColor:P.surface,boxShadow:'0 4px 0 #e4e3dc',justifyContent:'center',alignItems:'center'},[T('title',fixture.title,{fontSize:40,letterSpacing:1},'title_panel')]));
children.push(box('sub',{position:'absolute',left:240,top:166,width:1720,justifyContent:'center'},[T('subtitle',fixture.subtitle,{fontSize:20,color:P.muted,textAlign:'center'})]));
const fArrow=svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="12"><path d="M1 6 H15" stroke="${P.ink}" stroke-width="1.6"/><polygon points="21,6 14,2 14,10" fill="${P.ink}"/></svg>`);
for(const s of stages){
 const x=colOf[s.id];
 children.push(box('num_'+s.id,{position:'absolute',left:x-22,top:225,width:44,height:40,justifyContent:'center',alignItems:'center'},[T('num_'+s.id+'_token',String(s.number),{fontSize:22,lineHeight:1.25})]));
 children.push(box('formula_'+s.id,{position:'absolute',left:x-160,top:282,width:320,justifyContent:'center',alignItems:'center',gap:10},s.formula.flatMap((f,i)=>[...(i?[node('img',null,{width:22,height:12},undefined,{src:fArrow})]:[]),T(`formula_${s.id}_${i}`,f,{fontSize:26})])));
}
children.push(box('ext_head',{position:'absolute',left:COL.github-90,top:232,width:180,justifyContent:'center'},[T('external_header','EXTERNAL',{fontSize:17,letterSpacing:2,color:P.muted})]));
// Icons and tokens.
children.push(img('icon_daily',ico(icons.daily,56),COL.daily-28,MY-46,56));
children.push(box('tok_daily',{position:'absolute',left:COL.daily-60,top:MY+14,width:120,justifyContent:'center'},[T('daily_token',N.daily.token,{fontSize:28,fontWeight:700,lineHeight:1.25},'tok_daily')]));
children.push(img('icon_operator',ico(icons.operator,48),OP.x-24,OP.y-24,48));
children.push(centred('idea',N.idea.token,COL.intake,IDEA_Y,SMALL[0]-10,{fontSize:22,fontWeight:700}));
children.push(centred('triage',N.triage.token,COL.intake,TRIAGE_Y,SMALL[0]-10,{fontSize:22,fontWeight:700}));
children.push(centred('workhorse',N.workhorse.token,COL.build,WH.y,WH.w-12,{fontSize:30,fontWeight:700}));
children.push(centred('starttask',N.startTask.token,COL.build,MY,ST.w-20,{fontSize:44,fontWeight:700}));
children.push(centred('marathon',N.marathon.token,COL.build,MAR.y,MAR.w-12,{fontSize:30,fontWeight:700}));
children.push(centred('review',N.review.token,COL.review,MY,REV.w-16,{fontSize:32,fontWeight:700},N.review.alias));
children.push(centred('merge',N.merge.token,COL.land,MY,MRG.w-12,{fontSize:30,fontWeight:700}));
children.push(centred('github',N.github.token,COL.github,MY,GH_R*2-12,{fontSize:24}));
children.push(centred('ate',N.ate.token,ATE.x,ATE.y,ATE.w-12,{fontSize:30,fontWeight:700}));
for(let i=0;i<RAIL_X.length;i++)children.push(centred('rail'+i,fixture.rails.skills[i].token,RAIL_X[i],RAIL_Y,RAIL[0]-8,{fontSize:17,fontWeight:700}));
// Labels.
children.push(label('daily',COL.daily-115,MY+DAILY_R+14,230,N.daily.label,N.daily.caption));
children.push(label('operator',OP.x+OP.r+12,OP.y-26,220,N.operator.label,N.operator.caption,'left'));
children.push(label('intake',COL.intake-118,TRIAGE_Y+SMALL[1]/2+14,236,N.intake.label,N.intake.caption));
children.push(label('workhorse',COL.build+WH.w/2+12,WH.y-60,210,N.workhorse.label,N.workhorse.caption,'left'));
children.push(label('starttask',COL.build-120,MY+ST.h/2+14,240,N.startTask.label,N.startTask.caption));
children.push(label('marathon',612,MAR.y-118,COL.build-MAR.w/2-620,N.marathon.label,N.marathon.caption,'right'));
children.push(label('review',COL.review-110,MY-REV.h/2-118,220,N.review.label,N.review.caption));
children.push(label('merge',COL.land-115,MY+MRG.h/2+14,230,N.merge.label,N.merge.caption));
children.push(label('ate',ATE.x-120,ATE.y+ATE.h/2+14,240,N.ate.label,N.ate.caption));
children.push(label('github',COL.github-90,MY+GH_R+14,180,N.github.label,N.github.caption));
fixture.rails.skills.forEach((r,i)=>children.push(box('railcap'+i,{position:'absolute',left:RAIL_X[i]-66,top:RAIL_Y+RAIL[1]/2+8,width:132,justifyContent:'center'},[T('rail'+i+'_caption',r.caption,{fontSize:16,color:P.muted,textAlign:'center'})])));
children.push(box('rails_head',{position:'absolute',left:RAIL_X[0]-60,top:1296,width:400},[T('rails_label',fixture.rails.label,{fontSize:17,fontWeight:700,letterSpacing:2,color:P.muted})]));
// Edge labels.
children.push(edgeText('coaching',E.coaching,COL.daily+12,630,150));
children.push(edgeText('directs',E.directs,COL.intake+12,560,120));
children.push(edgeText('authorizes',E.authorizes,COL.land+12,560,140));
children.push(edgeText('plan',E.plan,COL.build+12,648,150));
children.push(edgeText('readypr',E.readyPr,COL.build+ST.w/2+6,MY-32,COL.review-REV.w/2-COL.build-ST.w/2-12,'center'));
children.push(edgeText('approved',E.approved,COL.review+REV.w/2+6,MY-32,COL.land-MRG.w/2-COL.review-REV.w/2-12,'center'));
children.push(edgeText('github',E.github,COL.land+MRG.w/2+6,MY-64,COL.github-GH_R-COL.land-MRG.w/2-12,'center'));
children.push(edgeText('revise',E.revise,1040,994,200,'center'));
children.push(edgeText('batch',E.batch,612,MAR.y+10,180));
children.push(edgeText('laneprs',E.lanePrs,COL.review+12,1070,100));
children.push(edgeText('ateissue',E.ateIssue,342,1086,120));
children.push(edgeText('intakerec',E.intakeRec,COL.intake+12,1300,150));
children.push(edgeText('mergerec',E.mergeRec,COL.land+12,1240,170));
// Durable records shelf.
children.push(box('shelf_head',{position:'absolute',left:SHELF.x+24,top:SHELF.y,width:DIV[0]-SHELF.x-40,height:SHELF.h,alignItems:'center'},[T('records_label',fixture.records.label,{fontSize:18,fontWeight:700,letterSpacing:2},'shelf_head')]));
fixture.records.entries.forEach((r,i)=>{
 const x0=DIV[i],x1=DIV[i+1]??SHELF.x+SHELF.w,id='rec'+i;
 children.push(box('recbox'+i,{position:'absolute',left:x0+24,top:SHELF.y,width:x1-x0-48,height:SHELF.h,alignItems:'center',gap:16},[
  T(id+'_token',r.token,{fontSize:34,color:P.muted,lineHeight:1.25},'recbox'+i),
  box('rectext'+i,{flexDirection:'column',gap:3,flexShrink:1},[T(id+'_label',r.label,{fontSize:21,fontWeight:700},'recbox'+i),T(id+'_caption',r.caption,{fontSize:17,color:P.muted},'recbox'+i)])
 ]));
});
children.push(box('footer',{position:'absolute',left:140,top:1660,width:1340,flexDirection:'column',gap:6},[
 T('footer_note',fixture.footer.note,{fontSize:16,color:P.muted}),
 T('footer_source',fixture.footer.source,{fontSize:15,color:P.muted})
]));
children.push(box('legend_c',{position:'absolute',left:1576,top:1674,width:110},[T('legend_control',fixture.legend.control,{fontSize:16,color:P.muted})]));
children.push(box('legend_r',{position:'absolute',left:1756,top:1674,width:200},[T('legend_records',fixture.legend.records,{fontSize:16,color:P.muted})]));
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

const NAME='xyz-forge-software-factory';
await fs.writeFile(path.join(ROOT,NAME+'.png'),result.png);
await fs.writeFile(path.join(ROOT,NAME+'-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,NAME+'.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:${P.background}}#canvas{transform-origin:top left}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();</script></body>`);
await fs.writeFile(path.join(ROOT,NAME+'.html'),responsive);
const evidence={renderer:'Shared root tools/render.mjs renderSatori / renderPlaywright; bundled Barlow Condensed',width:W,height:H,textIds:texts,iconIds,artifactDigests:{png:sha(result.png),chromiumPng:sha(chromiumResult.png),html:sha(responsive)},findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${texts.length} text ids and ${iconIds.length} icons; ${W}x${H} in both backends; no unsupported glyphs, escapes, overflow or overlap.`);
