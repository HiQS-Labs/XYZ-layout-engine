import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
// "Stop Re-Rolling the Whole Image" talk deck (#69): ten 1920x1080 slides. Each slide is a JSON fixture under slides/
// (copy only); deck.json owns the palette roles and the AS-12 type percentages; this script owns geometry, the vector
// ink layer (arrows, rules) and the checks. Same shared renderer and pattern as the vibe-coding-loop example: both
// backends, pinned PNGs through readPinnedPngs, no recipe or catalog change.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../',import.meta.url);
const {renderSatori,renderPlaywright}=await import(new URL('tools/render.mjs',RT).href);
const {readPinnedPngs}=await import(new URL('tools/request.mjs',RT).href);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
// DECK overrides the deck fixture (red controls run against a temporary copy); SLIDES=04-system,05-workflow renders a subset.
const deckPath=process.env.DECK?path.resolve(process.env.DECK):path.join(ROOT,'deck.json');
const deck=JSON.parse(await fs.readFile(deckPath,'utf8'));
const SLIDES_DIR=path.join(path.dirname(deckPath),'slides');
const only=process.env.SLIDES?new Set(process.env.SLIDES.split(',')):null;
const {width:W,height:H,theme:{palette:P,type:TY}}=deck;
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
const capHeight=ttf=>{const n=ttf.readUInt16BE(4);const tab={};for(let i=0;i<n;i++){const o=12+i*16;tab[ttf.toString('latin1',o,o+4)]=ttf.readUInt32BE(o+8)}return ttf.readInt16BE(tab['OS/2']+88)/ttf.readUInt16BE(tab.head+18)};
const CAP=capHeight(fonts.bold)*PX.headline;

// Geometry has one owner: these constants.
const M=120,CW=W-2*M,TITLE_Y=104,HEAD_Y=60,RULE_Y=1000,RADIUS=12,SWATCH=22;
const cutouts=await readPinnedPngs(pathToFileURL(ROOT+'/'),'provenance.json',['demo-before','demo-after']);
const owner=o=>o==='neutral'?{fill:P.neutralFill,line:P.rule,ink:P.muted}:{fill:P[o+'Fill'],line:P[o+'Line'],ink:P[o+'Ink']};
const ty={
 headline:{fontSize:PX.headline,fontWeight:700,lineHeight:1.2},
 subhead:{fontSize:PX.subhead,fontWeight:400,lineHeight:1.2},
 subheadBold:{fontSize:PX.subhead,fontWeight:700,lineHeight:1.2},
 label:{fontSize:PX.label,fontWeight:700,lineHeight:1.2},
 labelRegular:{fontSize:PX.label,fontWeight:400,lineHeight:1.2},
 eyebrow:{fontSize:PX.label,fontWeight:700,lineHeight:1.2,letterSpacing:2,color:P.muted},
 body:{fontSize:PX.body,fontWeight:400,lineHeight:1.25,color:P.muted},
 bodyInk:{fontSize:PX.body,fontWeight:400,lineHeight:1.25},
 bodyBold:{fontSize:PX.body,fontWeight:700,lineHeight:1.25},
 code:{fontSize:PX.body,fontWeight:400,lineHeight:1.35,whiteSpace:'pre'},
};

// Vector ink: straight arrows, elbows and hairlines, drawn under the text.
const head=(x,y,dir,c,len=18,half=10)=>{const [ux,uy]={right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]}[dir];return `<polygon points="${x},${y} ${x-ux*len-uy*half},${y-uy*len-ux*half} ${x-ux*len+uy*half},${y-uy*len+ux*half}" fill="${c}"/>`};
const dirOf=(ax,ay,bx,by)=>bx>ax?'right':bx<ax?'left':by>ay?'down':'up';
const arrow=(x0,y0,x1,y1,c,w=3)=>elbow([[x0,y0],[x1,y1]],c,w);
const elbow=(pts,c,w=3)=>{const [ax,ay]=pts.at(-2),[bx,by]=pts.at(-1);const back=16;const ex=bx-Math.sign(bx-ax)*back,ey=by-Math.sign(by-ay)*back;const pp=[...pts.slice(0,-1),[ex,ey]].map(p=>p.join(',')).join(' ');return `<polyline points="${pp}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`+head(bx,by,dirOf(ax,ay,bx,by),c)};

// Per-slide state: text registry, containers, sizes, single-line ids, placed graphics, ink.
let st;
const fresh=()=>{st={texts:[],container:{},seen:new Set(),sizes:new Set(),fsize:{},single:new Set(),graphics:[],v:[],imgs:[],footerIds:new Set(),lowerIds:new Set()}};
const T=(id,s,style,within,{single=false}={})=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!st.seen.has(id),`duplicate text id ${id}`);
 st.seen.add(id);st.texts.push(id);if(within)st.container[id]=within;st.sizes.add(style.fontSize);st.fsize[id]=style;if(single)st.single.add(id);
 return node('span',id,{color:P.ink,lineHeight:1.2,...style},s);
};
const at=(id,x,y,w,style,children)=>box(id,{position:'absolute',left:x,top:y,width:w,...style},children);
const rule=(id,x,y,w,h=2,c=P.rule)=>{st.lowerIds.add(id);return box(id,{position:'absolute',left:x,top:y,width:w,height:h,backgroundColor:c})};
const swatch=(x,y,fill,line)=>box(null,{position:'absolute',left:x,top:y,width:SWATCH,height:SWATCH,borderRadius:6,backgroundColor:fill,border:`2px solid ${line}`});
const card=(id,x,y,w,h,o,{dashed=false}={})=>{st.lowerIds.add('box_'+id);return box('box_'+id,{position:'absolute',left:x,top:y,width:w,height:h,backgroundColor:dashed?P.ground:o.fill,border:`2px ${dashed?'dashed':'solid'} ${o.line}`,borderRadius:RADIUS})};
// A card's text sits in its own container box so the containment check has explicit bounds.
const cardText=(id,x,y,w,h,children,style={})=>at('text_'+id,x,y,w,{height:h,flexDirection:'column',justifyContent:'center',gap:6,...style},children);
const placeImage=(asset,x,y,size)=>{st.graphics.push({asset,visibleHeight:size,visibleWidth:size});st.imgs.push('img_'+asset);return node('img','img_'+asset,{position:'absolute',left:x,top:y,width:size,height:size},undefined,{src:cutouts[asset]})};

// Shared header and footer. The legend (owner colours) appears only on slides that use them.
const header=(s,{legend=false}={})=>{
 const out=[at('eyebrow_box',M,HEAD_Y,900,{},[T('eyebrow',s.eyebrow,ty.eyebrow,undefined,{single:true})]),at('title_box',M,TITLE_Y,CW,{},[T('title',s.title,ty.headline)])];
 if(legend)out.push(at('legend_box',W-M-520,HEAD_Y,520,{justifyContent:'flex-end',gap:28},deck.legend.map(l=>box('legend_'+l.owner,{alignItems:'center',gap:10},[box(null,{width:SWATCH,height:SWATCH,borderRadius:6,backgroundColor:owner(l.owner).fill,border:`2px solid ${owner(l.owner).line}`}),T('legend_'+l.owner+'_name',l.name,{...ty.body,color:owner(l.owner).ink},undefined,{single:true})]))));
 return out;
};
const footer=(slug,s)=>{st.footerIds.add('footer_left');st.footerIds.add('footer_right');return [rule('footer_rule',M,RULE_Y,CW),
 at('footer_left_box',M,RULE_Y+16,1000,{},[T('footer_left',deck.footer,ty.body,undefined,{single:true})]),
 at('footer_right_box',W-M-640,RULE_Y+16,640,{justifyContent:'flex-end'},[T('footer_right',`slides/${slug}.json · ${s.number} / ${deck.slides.length}`,ty.body,undefined,{single:true})])]};

const layouts={
 title(s){
  return [at('eyebrow_box',M,120,CW,{},[T('eyebrow',s.eyebrow,ty.eyebrow,undefined,{single:true})]),
   at('title_box',M,176,CW,{},[T('title',s.title,ty.headline)]),
   at('subtitle_box',M,300,CW,{},[T('subtitle',s.subtitle,ty.subhead)]),
   rule('rule_top',M,390,CW),
   at('abstract_box',M,450,1480,{},[T('abstract',s.abstract,ty.subhead)]),
   at('split_box',M,600,1480,{},[T('split',s.split,ty.subhead)]),
   at('dogfood_box',M,790,1480,{},[T('dogfood',s.dogfood,{...ty.subhead,color:P.muted})])];
 },
 reroll(s){
  const X=840,Wd=W-M-X,out=[...header(s,{legend:true}),placeImage(s.image,M,270,640),at('ask_box',X,282,Wd,{},[T('ask',s.ask,ty.subheadBold)])];
  s.options.forEach((o,i)=>{const y=380+i*230,c=owner(o.owner);out.push(swatch(X,y+6,c.fill,c.line),at(`opt_${i}_label_box`,X+34,y,Wd-34,{},[T(`opt_${i}_label`,o.label,{...ty.label,color:c.ink},undefined,{single:true})]),at(`opt_${i}_text_box`,X,y+44,Wd,{},[T(`opt_${i}_text`,o.text,ty.bodyInk)]))});
  out.push(at('disclosure_box',X,850,Wd,{},[T('disclosure',s.disclosure,ty.body)]));
  return out;
 },
 split(s){
  const xs=[M,1160],Wd=640,y0=290,out=[...header(s,{legend:true})];
  s.columns.forEach((col,ci)=>{const x=xs[ci],c=owner(col.owner);
   out.push(rule(`bar_${ci}`,x,y0,Wd,4,c.ink),at(`col_${ci}_label_box`,x,y0+20,Wd,{},[T(`col_${ci}_label`,col.label,{...ty.label,color:c.ink},undefined,{single:true})]));
   col.items.forEach((it,i)=>out.push(at(`col_${ci}_item_${i}_box`,x,y0+80+i*96,Wd,{},[T(`col_${ci}_item_${i}`,it,ty.subhead,undefined,{single:true})])));
   out.push(at(`col_${ci}_note_box`,x,760,Wd,{},[T(`col_${ci}_note`,col.note,ty.body)]));
  });
  const n=owner('neutral');
  out.push(at('hand_label_box',800,y0+20,320,{justifyContent:'center'},[T('hand_label',s.handoff.label,{...ty.label,color:P.muted},undefined,{single:true})]));
  st.v.push(arrow(775,352,1150,352,P.connector,4));
  s.handoff.items.forEach((it,i)=>{const y=400+i*70;out.push(card(`hand_${i}`,820,y,280,56,n),cardText(`hand_${i}`,828,y,264,56,[T(`hand_${i}`,it,ty.labelRegular,`text_hand_${i}`,{single:true})],{alignItems:'center'}))});
  out.push(at('hand_note_box',800,620,320,{},[T('hand_note',s.handoff.note,{...ty.body,textAlign:'center'})]));
  return out;
 },
 system(s){
  const out=[...header(s,{legend:true})],ai=owner('ai'),en=owner('engine'),n=owner('neutral');
  const IN={x:M,w:440},RE={x:680,w:560},OU={x:1360,w:440},Y0=340,BH=120,GAP=20;
  out.push(at('in_label_box',IN.x,290,IN.w,{},[T('in_label',s.inputs.label,{...ty.label,color:ai.ink},undefined,{single:true})]));
  s.inputs.items.forEach((it,i)=>{const y=Y0+i*(BH+GAP);out.push(card('in_'+it.id,IN.x,y,IN.w,BH,ai,{dashed:!!it.dashed}),cardText('in_'+it.id,IN.x+20,y+10,IN.w-40,BH-20,[T(`in_${it.id}_title`,it.title,ty.label,'text_in_'+it.id,{single:true}),T(`in_${it.id}_text`,it.text,ty.body,'text_in_'+it.id)]));
   if(!it.dashed)st.v.push(arrow(IN.x+IN.w+2,y+BH/2,RE.x-1,y+BH/2,P.connector))});
  out.push(at('re_label_box',RE.x,290,RE.w,{},[T('re_label',s.renderer.label,{...ty.label,color:en.ink},undefined,{single:true})]),card('renderer',RE.x,Y0,RE.w,520,en),
   at('re_title_box',RE.x,Y0+12,RE.w,{justifyContent:'center'},[T('re_title',s.renderer.title,{...ty.subheadBold,color:en.ink},'box_renderer',{single:true})]));
  s.renderer.stages.forEach((sg,i)=>{const y=Y0+70+i*82,RH=66;
   if(sg.left){const w2=(RE.w-48-20)/2;[['left',RE.x+24],['right',RE.x+24+w2+20]].forEach(([k,x])=>out.push(card(`stage_${sg.id}_${k}`,x,y,w2,RH,{fill:P.ground,line:en.line}),cardText(`stage_${sg.id}_${k}`,x+10,y+4,w2-20,RH-8,[T(`stage_${sg.id}_${k}`,sg[k],{...ty.bodyBold,textAlign:'center'},`text_stage_${sg.id}_${k}`,{single:true})],{alignItems:'center'})))}
   else out.push(card('stage_'+sg.id,RE.x+24,y,RE.w-48,RH,{fill:P.ground,line:en.line}),cardText('stage_'+sg.id,RE.x+36,y+4,RE.w-72,RH-8,[T(`stage_${sg.id}`,sg.text,{...ty.bodyInk,textAlign:'center'},'text_stage_'+sg.id)],{alignItems:'center'}));
  });
  out.push(at('out_label_box',OU.x,290,OU.w,{},[T('out_label',s.outputs.label,{...ty.label,color:P.muted},undefined,{single:true})]));
  s.outputs.items.forEach((it,i)=>{const y=Y0+i*(BH+GAP);out.push(card('out_'+it.id,OU.x,y,OU.w,BH,n),cardText('out_'+it.id,OU.x+20,y+10,OU.w-40,BH-20,[T(`out_${it.id}_title`,it.title,ty.label,'text_out_'+it.id,{single:true}),T(`out_${it.id}_text`,it.text,ty.body,'text_out_'+it.id)]));
   st.v.push(arrow(RE.x+RE.w+2,y+BH/2,OU.x-1,y+BH/2,P.connector))});
  const CY=890;
  out.push(card('catalog',RE.x,CY,RE.w,100,n),cardText('catalog',RE.x+16,CY+4,RE.w-32,92,[T('catalog_title',s.catalog.title,ty.bodyBold,'text_catalog',{single:true}),T('catalog_text',s.catalog.text,ty.body,'text_catalog')],{gap:2}));
  st.v.push(arrow(RE.x+RE.w/2,CY-2,RE.x+RE.w/2,Y0+520+1,P.connector));
  out.push(at('footnote_box',OU.x,CY+2,OU.w,{},[T('footnote',s.footnote,ty.body)]));
  return out;
 },
 workflow(s){
  const out=[...header(s,{legend:true})],ai=owner('ai'),en=owner('engine');
  out.push(at('once_label_box',M,290,1200,{},[T('once_label',s.once.label,{...ty.label,color:ai.ink},undefined,{single:true})]));
  const OX=[120,720,1320],OW=480,OY=340,OH=150;
  s.once.steps.forEach((sp,i)=>{const x=OX[i];out.push(card('once_'+sp.id,x,OY,OW,OH,ai),cardText('once_'+sp.id,x+20,OY+12,OW-40,OH-24,[T(`once_${sp.id}_title`,sp.title,ty.label,'text_once_'+sp.id,{single:true}),T(`once_${sp.id}_text`,sp.text,ty.body,'text_once_'+sp.id)]));
   if(i<OX.length-1)st.v.push(arrow(x+OW+2,OY+OH/2,OX[i+1]-1,OY+OH/2,P.connector))});
  const FX=[120,560,1000,1440],FW=340,FY=680,FH=150;
  st.v.push(elbow([[OX[2]+OW/2,OY+OH+2],[OX[2]+OW/2,560],[FX[0]+FW/2,560],[FX[0]+FW/2,FY-1]],P.connector,3));
  out.push(at('handoff_box',FX[0]+FW/2+40,522,900,{},[T('handoff',s.forever.handoff,{...ty.labelRegular,color:P.muted},undefined,{single:true})]));
  out.push(at('forever_label_box',FX[0]+FW/2+40,620,1200,{},[T('forever_label',s.forever.label,{...ty.label,color:en.ink},undefined,{single:true})]));
  s.forever.steps.forEach((sp,i)=>{const x=FX[i];out.push(card('forever_'+sp.id,x,FY,FW,FH,en),cardText('forever_'+sp.id,x+16,FY+12,FW-32,FH-24,[T(`forever_${sp.id}_title`,sp.title,ty.label,'text_forever_'+sp.id,{single:true}),T(`forever_${sp.id}_text`,sp.text,ty.body,'text_forever_'+sp.id)]));
   if(i<FX.length-1)st.v.push(arrow(x+FW+2,FY+FH/2,FX[i+1]-1,FY+FH/2,P.connector))});
  st.v.push(elbow([[FX[3]+FW/2,FY+FH+2],[FX[3]+FW/2,900],[FX[1]+FW/2,900],[FX[1]+FW/2,FY+FH+1]],en.ink,4));
  out.push(at('loop_box',FX[1]+FW/2+30,912,900,{},[T('loop',s.forever.loop,{...ty.labelRegular,color:en.ink},undefined,{single:true})]));
  return out;
 },
 demo(s){
  const out=[...header(s)],ys=[290,400,490,660],LX=M,LW=560,RX=720,RW=W-M-RX;
  out.push(rule('divider',700,290,2,450));
  s.steps.forEach((sp,i)=>{const y=ys[i];
   out.push(at(`step_${i}_label_box`,LX,y,LW,{},[T(`step_${i}_label`,sp.label,ty.label)]),at(`step_${i}_text_box`,LX,y+44,LW,{},[T(`step_${i}_text`,sp.text,ty.body)]));
   sp.lines.forEach((ln,j)=>out.push(at(`cmd_${i}_${j}_box`,RX,y+j*32,RW,{},[T(`cmd_${i}_${j}`,ln,ty.code,`cmd_${i}_${j}_box`,{single:true})])));
  });
  out.push(at('watch_box',M,800,CW,{},[T('watch',s.watch,ty.subhead)]),at('env_box',M,920,CW,{},[T('env',s.env,ty.body)]));
  return out;
 },
 compare(s){
  const out=[...header(s)],IMG=600,xs=[M,760];
  [s.before,s.after].forEach((side,i)=>{const x=xs[i];out.push(placeImage(side.image,x,270,IMG),swatch(x,897,P[side.swatch],P[side.swatch]),at(`cap_${i}_box`,x+34,890,IMG-34,{},[T(`cap_${i}`,`${side.label} · ${side.headline} · ${side.primary}`,ty.label,undefined,{single:true})]))});
  const FX=1420,FW=W-M-FX;
  s.facts.forEach((f,i)=>{const y=290+i*160;out.push(at(`fact_${i}_label_box`,FX,y,FW,{},[T(`fact_${i}_label`,f.label,{...ty.label,color:P.muted},undefined,{single:true})]),at(`fact_${i}_text_box`,FX,y+40,FW,{},[T(`fact_${i}_text`,f.text,ty.bodyInk)]))});
  out.push(at('disclosure_box',M,942,1280,{},[T('disclosure',s.disclosure,ty.body,undefined,{single:true})]));
  return out;
 },
 recipes(s){
  const out=[...header(s)],PW=1000;
  s.points.forEach((p,i)=>{const y=290+i*165;out.push(at(`pt_${i}_label_box`,M,y,PW,{},[T(`pt_${i}_label`,p.label,ty.label,undefined,{single:true})]),at(`pt_${i}_text_box`,M,y+40,PW,{},[T(`pt_${i}_text`,p.text,ty.body)]))});
  const LX=1240,LW=W-M-LX,C1=300;
  out.push(at('ledger_label_box',LX,290,LW,{},[T('ledger_label',s.ledger.label,{...ty.label,color:P.muted},undefined,{single:true})]),
   at('ledger_h0_box',LX,345,C1,{},[T('ledger_h0',s.ledger.columns[0],{...ty.bodyBold,color:P.muted},undefined,{single:true})]),at('ledger_h1_box',LX+C1,345,LW-C1,{},[T('ledger_h1',s.ledger.columns[1],{...ty.bodyBold,color:P.muted},undefined,{single:true})]),rule('ledger_rule_head',LX,380,LW));
  s.ledger.rows.forEach((r,i)=>{const y=392+i*56;out.push(at(`row_${i}_slug_box`,LX,y,C1,{},[T(`row_${i}_slug`,r[0],ty.labelRegular,undefined,{single:true})]),at(`row_${i}_digest_box`,LX+C1,y+4,LW-C1,{},[T(`row_${i}_digest`,r[1],ty.body,undefined,{single:true})]),rule(`ledger_rule_${i}`,LX,y+46,LW))});
  out.push(at('ledger_note_box',LX,392+s.ledger.rows.length*56+16,LW,{},[T('ledger_note',s.ledger.note,ty.body)]));
  return out;
 },
 designmd(s){
  const out=[...header(s)],n=owner('neutral'),xs=[120,720,1320],BW=480,BY=460,BH=120;
  out.push(at('lead_box',M,280,CW,{},[T('lead',s.lead,ty.subhead)]));
  s.flow.forEach((f,i)=>{const x=xs[i];out.push(card('flow_'+f.id,x,BY,BW,BH,n),cardText('flow_'+f.id,x+20,BY+10,BW-40,BH-20,[T(`flow_${f.id}_title`,f.title,ty.label,'text_flow_'+f.id,{single:true}),T(`flow_${f.id}_text`,f.text,ty.body,'text_flow_'+f.id,{single:true})]));
   if(i<xs.length-1)st.v.push(arrow(x+BW+2,BY+BH/2,xs[i+1]-1,BY+BH/2,P.connector))});
  const SX=[120,1020],SW=780;
  s.stories.forEach((story,i)=>{const x=SX[i];out.push(at(`story_${i}_label_box`,x,650,SW,{},[T(`story_${i}_label`,story.label,{...ty.label,color:P.muted},undefined,{single:true})]),at(`story_${i}_text_box`,x,690,SW,{},[T(`story_${i}_text`,story.text,ty.bodyInk)]))});
  out.push(at('example_box',M,905,CW,{},[T('example',s.example,ty.body,undefined,{single:true})]));
  return out;
 },
 close(s){
  const out=[...header(s)],WX=M,WW=800,TX=1040,TW=W-M-TX;
  out.push(rule('divider',960,290,2,590),at('ways_label_box',WX,290,WW,{},[T('ways_label',s.ways.label,{...ty.label,color:P.muted},undefined,{single:true})]));
  s.ways.items.forEach((w,i)=>{const y=350+i*200;out.push(at(`way_${i}_title_box`,WX,y,WW,{},[T(`way_${i}_title`,`${w.n} · ${w.title}`,ty.label,undefined,{single:true})]),at(`way_${i}_text_box`,WX,y+40,WW,{},[T(`way_${i}_text`,w.text,ty.body)]))});
  out.push(at('take_label_box',TX,290,TW,{},[T('take_label',s.takeaways.label,{...ty.label,color:P.muted},undefined,{single:true})]));
  s.takeaways.items.forEach((t,i)=>out.push(at(`take_${i}_box`,TX,350+i*150,TW,{},[T(`take_${i}`,t,ty.subheadBold)])));
  out.push(at('closing_box',M,930,CW,{},[T('closing',s.closing,ty.body,undefined,{single:true})]));
  return out;
 }
};

const finite=b=>b&&[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0;
const inside=(b,o,t=1)=>b.x>=o.x-t&&b.y>=o.y-t&&b.x+b.width<=o.x+o.width+t&&b.y+b.height<=o.y+o.height+t;
const intersects=(a,c)=>Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>1&&Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>1;
const canvas={x:0,y:0,width:W,height:H};

async function renderSlide(context,slug){
 fresh();
 const s=JSON.parse(await fs.readFile(path.join(SLIDES_DIR,slug+'.json'),'utf8'));
 assert.ok(layouts[s.layout],`unknown layout ${s.layout} in ${slug}`);
 const body=layouts[s.layout](s);
 const ink=node('img','ink',{position:'absolute',left:0,top:0,width:W,height:H},undefined,{src:b64(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${st.v.join('')}</svg>`,'image/svg+xml')});
 // Layer order: cards, rules and swatches, then ink, images and text, so arrows never cover copy.
 const isLower=n=>n.type!=='img'&&(!n.props.id||st.lowerIds.has(n.props.id));
 const lower=body.filter(isLower),images=body.filter(n=>n.type==='img'),upper=body.filter(n=>n.type!=='img'&&!isLower(n));
 const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:P.ground,fontFamily:FAMILY,fontFeatureSettings:'"liga" 0',overflow:'hidden'},[...lower,ink,...images,...upper,...footer(slug,s)]);
 const result=await renderSatori(scene,fonts,W,H,FAMILY);
 const chromiumResult=await renderPlaywright(context,scene,fonts,W,H,FAMILY);
 const findings=[],exceptions=[];
 // AS-12 first, so a type-scale failure is not hidden behind layout findings.
 const titleBox=result.textBoxes.title,maxGraphic=st.graphics.length?Math.max(...st.graphics.map(g=>g.visibleHeight)):0;
 const as12={S,px:PX,distinctSizes:[...st.sizes].sort((a,b)=>b-a),headlinePctOfS:TY.pct.headline,bodyPctOfS:TY.pct.body,headlineToBody:+(PX.headline/PX.body).toFixed(2),
  headlinePctOfWidth:titleBox?+(titleBox.width/W).toFixed(3):null,headlineLines:chromiumResult.textBoxes.title?.lineCount??null,capHeightPx:+CAP.toFixed(1),maxGraphicHeightPx:maxGraphic,maxGraphicToCap:+(maxGraphic/CAP).toFixed(2),legendLabelToSwatch:+(PX.body/SWATCH).toFixed(2)};
 if(st.sizes.size>4)findings.push({reason:'AS-12: more than 4 font sizes',sizes:as12.distinctSizes});
 if(TY.pct.headline<0.07||TY.pct.headline>0.10)findings.push({reason:'AS-12: headline outside 7-10% of S',pct:TY.pct.headline});
 if(TY.pct.body<0.018)findings.push({reason:'AS-12: body below the 1.8% of S floor',pct:TY.pct.body});
 if(as12.headlineToBody<4)findings.push({reason:'AS-12: headline:body below 4:1',ratio:as12.headlineToBody});
 if(!(as12.headlinePctOfWidth>=0.5&&as12.headlinePctOfWidth<=0.85))findings.push({reason:'AS-12: headline width outside 50-85% of canvas',pct:as12.headlinePctOfWidth});
 if(as12.maxGraphicToCap>3){if(s.as12Exception)exceptions.push({rule:'AS-12 graphic vs 3x cap height',ratio:as12.maxGraphicToCap,why:s.as12Exception});else findings.push({reason:'AS-12: graphic taller than 3x headline cap height',ratio:as12.maxGraphicToCap})}
 if(as12.legendLabelToSwatch<0.7)findings.push({reason:'AS-12: legend label under 70% of swatch height'});
 // Layout checks in both backends: glyph coverage, canvas and container containment, text overlap, text over images,
 // nothing below the footer rule, single-line copy on one line, and Chromium overflow.
 if(result.missingSegments.length)findings.push({backend:'satori',reason:'unsupported glyphs',segments:result.missingSegments});
 if(!chromiumResult.fontLoaded)findings.push({backend:'chromium',reason:`${FAMILY} did not load`});
 const backends={satori:{text:result.textBoxes,bounds:result.bounds},chromium:{text:chromiumResult.textBoxes,bounds:chromiumResult.bounds}};
 for(const [name,b] of Object.entries(backends)){
  for(const id of st.texts){
   const t=b.text[id];
   if(!finite(t)){findings.push({id,backend:name,reason:'missing or non-finite text geometry'});continue}
   if(!inside(t,canvas,.5))findings.push({id,backend:name,reason:'text outside canvas',box:t});
   if(!st.footerIds.has(id)&&t.y+t.height>RULE_Y-4)findings.push({id,backend:name,reason:'text reaches the footer rule',box:t});
   const c=st.container[id];
   if(c){const cb=b.bounds[c];if(!finite(cb))findings.push({id,backend:name,reason:'missing container geometry',container:c});else if(!inside(t,cb,1.5))findings.push({id,backend:name,reason:'text escapes its container',container:c,box:t,containerBox:cb})}
   if(st.single.has(id)){const f=st.fsize[id],lines=name==='chromium'?t.lineCount:Math.round(t.height/(f.fontSize*(f.lineHeight??1.2)));if(lines!==1)findings.push({id,backend:name,reason:'single-line copy wrapped',lines,box:t})}
   for(const img of st.imgs){const ib=b.bounds[img];if(finite(ib)&&intersects(t,ib))findings.push({id,backend:name,reason:'text over an image',image:img})}
  }
  for(let i=0;i<st.texts.length;i++)for(let j=i+1;j<st.texts.length;j++){
   const a=b.text[st.texts[i]],c=b.text[st.texts[j]];
   if(finite(a)&&finite(c)&&intersects(a,c))findings.push({backend:name,reason:'overlapping text',ids:[st.texts[i],st.texts[j]]});
  }
  for(const img of st.imgs){const ib=b.bounds[img];if(!finite(ib)||!inside(ib,canvas,.5))findings.push({backend:name,reason:'image missing or outside canvas',image:img})}
 }
 for(const id of st.texts){
  const p=chromiumResult.textBoxes[id];
  if(finite(p)&&(p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1))findings.push({id,backend:'chromium',reason:'text overflow',box:p});
 }
 assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
 assert.equal(chromiumResult.png.readUInt32BE(16),W);assert.equal(chromiumResult.png.readUInt32BE(20),H);
 return {slug,layout:s.layout,as12,graphics:st.graphics,textIds:st.texts,exceptions,findings,png:result.png,chromiumPng:chromiumResult.png,html:chromiumResult.html};
}

// Red controls write their outputs to OUT_DIR so the committed artifacts stay untouched.
const OUT=process.env.OUT_DIR?path.resolve(process.env.OUT_DIR):path.join(ROOT,'renders');
await fs.mkdir(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
const slides=[];
try{
 const context=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 context.setDefaultTimeout(30000);
 for(const slug of deck.slides){
  if(only&&!only.has(slug))continue;
  const r=await renderSlide(context,slug);
  await fs.writeFile(path.join(OUT,slug+'.png'),r.png);
  await fs.writeFile(path.join(OUT,slug+'-chromium.png'),r.chromiumPng);
  slides.push({slug:r.slug,layout:r.layout,as12:r.as12,graphics:r.graphics,textCount:r.textIds.length,textIds:r.textIds,artifactDigests:{png:sha(r.png),chromiumPng:sha(r.chromiumPng)},exceptions:r.exceptions,findings:r.findings});
  console.log(`${r.findings.length?'FAIL':'ok  '} ${slug}: ${r.textIds.length} text ids; headline ${(r.as12.headlinePctOfWidth*100).toFixed(1)}% of width, ${r.as12.headlineLines} line(s); sizes ${r.as12.distinctSizes.join('/')}${r.exceptions.length?'; exceptions '+r.exceptions.length:''}`);
 }
 await context.close();
}finally{await browser.close()}
const findings=slides.flatMap(s=>s.findings.map(f=>({slide:s.slug,...f})));
const evidence={renderer:'Shared root tools/render.mjs renderSatori / renderPlaywright; vendored Barlow Condensed; demo renders via readPinnedPngs',width:W,height:H,S,px:PX,capHeightPx:+CAP.toFixed(1),slides,findings};
if(!only)await fs.writeFile(path.join(process.env.OUT_DIR?OUT:ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${slides.length} slides at ${W}x${H} in both backends; AS-12 sizes ${Object.values(PX).join('/')} px; no unsupported glyphs, escapes, overflow or overlap.`);
