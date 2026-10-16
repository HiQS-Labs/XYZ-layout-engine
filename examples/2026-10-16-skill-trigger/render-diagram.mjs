import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// "Why your skill never runs" (#60): a recreation of an operator-supplied parchment plate, with the GH-55
// layout checks. The plate needs four Alegreya faces (regular, bold and both italics). The shared
// renderSatori/renderPlaywright register only regular and bold, and tools/render.mjs is pinned by published
// recipe versions, so this script runs the two backends itself (renderBoth below). It reuses toDocument for
// the HTML and adds the italic @font-face rules.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../',import.meta.url);
const {toDocument,loadSatori}=await import(new URL('tools/render.mjs',RT).href);
await loadSatori();
const {default:satori}=await import('satori');
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
const {Resvg}=await import(new URL('node_modules/@resvg/resvg-js/index.js',RT).href);
const fixture=JSON.parse(await fs.readFile(path.join(ROOT,'fixture.json'),'utf8'));
const {width:W,height:H,theme:{palette:P,type:TY}}=fixture;
const FAMILY=TY.family;
const face=f=>fs.readFile(new URL(`tools/fonts/alegreya/alegreya-latin-${f}.woff`,RT));
const fonts={regular:await face('400-normal'),bold:await face('700-normal')};
const italics=[{data:await face('400-italic'),weight:400},{data:await face('700-italic'),weight:700}];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const b64=(b,type)=>`data:${type};base64,${Buffer.from(b).toString('base64')}`;
const node=(type,id,style,children,extra={})=>({type,props:{...(id?{id}:{}),style,children,...extra}});
const box=(id,style,children)=>node('div',id,{display:'flex',...style},children);
const img=(id,src,x,y,w,h=w)=>node('img',id,{position:'absolute',left:x,top:y,width:w,height:h},undefined,{src});
// Seeded PRNG: stains, jitter and splatter are identical on every run.
let seed=20261016;const rnd=()=>((seed=Math.imul(seed^seed>>>15,1|seed)+0x6d2b79f5|0,((seed^seed>>>13)>>>0)/4294967296));

// Geometry has one owner: this table. The diagram reads left to right on y1386.
const FRAME={x0:62,y0:58,x1:1862,y1:1876},RULE_Y=984,MY=1386;
const TAG={x0:310,y0:1306,x1:572,y1:1462,tip:622,eye:[590,1386]};
const BAN={x0:828,x1:928,y0:1206,y1:1584,notch:1530};
const GATE={cx:995,r:57};
const CARD={x:1210,y:1312,w:282,h:146};
const WASH={cx:918,cy:1388,r:250};
const TITLE={top:296,step:198};

// Paper: rendered once at half size by resvg, embedded as a PNG, so both backends share its pixels.
const TEX=960,k=TEX/W;
const stain=(cx,cy,rx,ry,a)=>`<g filter="url(#ragged)"><ellipse cx="${cx*k}" cy="${cy*k}" rx="${rx*k}" ry="${ry*k}" fill="${P.stain}" fill-opacity="${a}"/><ellipse cx="${cx*k}" cy="${cy*k}" rx="${rx*k}" ry="${ry*k}" fill="none" stroke="${P.stain}" stroke-opacity="${a*1.4}" stroke-width="3"/></g>`;
const paperSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${TEX}" height="${TEX}"><defs>
<filter id="wash" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves="5" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0.52  0 0 0 0 0.46  0 0 0 0 0.37  2.2 0 0 0 -1.12"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.025 0.055 0.09 0.12"/></feComponentTransfer></filter>
<filter id="ragged" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="3" seed="5"/><feDisplacementMap in="SourceGraphic" scale="45" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1"/></filter>
<filter id="fiber" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0.36 0 0 0 -0.13"/></filter>
</defs><rect width="${TEX}" height="${TEX}" fill="${P.paper}"/><rect width="${TEX}" height="${TEX}" filter="url(#wash)"/>
${stain(1720,170,340,280,.10)}${stain(1520,560,170,130,.06)}${stain(140,1720,320,250,.09)}${stain(1760,1760,210,170,.06)}${stain(430,1100,150,90,.04)}
<rect width="${TEX}" height="${TEX}" filter="url(#fiber)"/></svg>`;
const paperPng=new Resvg(paperSvg,{font:{loadSystemFonts:false}}).render().asPng();

// Ink layer.
const v=[];
const pl=(pts,w,o)=>`<polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${P.ink}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sketch=(a,b,passes=2,w=2.2)=>{let o='';for(let p=0;p<passes;p++){const s=[];for(let i=0;i<=8;i++){const t=i/8;s.push([a[0]+(b[0]-a[0])*t+(rnd()-.5)*2.4,a[1]+(b[1]-a[1])*t+(rnd()-.5)*2.4])}o+=pl(s,p?w*.6:w,p?.55:.9)}return o};
const sketchRect=(x0,y0,x1,y1,passes,w,over=6)=>sketch([x0-over,y0],[x1+over,y0],passes,w)+sketch([x1,y0-over],[x1,y1+over],passes,w)+sketch([x1+over,y1],[x0-over,y1],passes,w)+sketch([x0,y1+over],[x0,y0-over],passes,w);
const head=(x,y,ang,c=P.ink,d=26,w=11)=>{const cs=Math.cos(ang),sn=Math.sin(ang);return `<polygon points="${x},${y} ${x-d*cs+w*sn},${y-d*sn-w*cs} ${x-d*.55*cs},${y-d*.55*sn} ${x-d*cs-w*sn},${y-d*sn+w*cs}" fill="${c}"/>`};
const splat=(cx,cy,n,r)=>{let o='';for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,d=r*(.3+rnd()),s=.8+rnd()*rnd()*7;o+=`<circle cx="${(cx+Math.cos(a)*d).toFixed(1)}" cy="${(cy+Math.sin(a)*d).toFixed(1)}" r="${s.toFixed(1)}" fill="${P.ink}" fill-opacity="${(.45+rnd()*.4).toFixed(2)}"/>`}return o};
v.push(`<defs><filter id="wc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="40" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3"/></filter><filter id="paper" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8"/><feDisplacementMap in="SourceGraphic" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`);
// Frame, kicker brush stroke and section rule.
v.push(sketchRect(FRAME.x0,FRAME.y0,FRAME.x1,FRAME.y1,2,2.6),sketchRect(FRAME.x0+14,FRAME.y0+14,FRAME.x1-14,FRAME.y1-14,1,1.4));
v.push(`<path d="M146 316 C 220 311, 330 313, 402 314" stroke="${P.ink}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M150 322 C 240 320, 320 321, 380 320" stroke="${P.ink}" stroke-width="1.4" fill="none" opacity=".5"/>`);
v.push(sketch([146,RULE_Y],[1772,RULE_Y],2,2));
// The wash disc behind the trigger.
v.push(`<g filter="url(#wc)"><circle cx="${WASH.cx}" cy="${WASH.cy}" r="${WASH.r}" fill="${P.stain}" fill-opacity=".14"/><circle cx="${WASH.cx}" cy="${WASH.cy}" r="${WASH.r}" fill="none" stroke="${P.stain}" stroke-opacity=".2" stroke-width="5"/></g>`);
// PROMPT luggage tag with its eyelet.
const tagPath=`M${TAG.x0} ${TAG.y0} L${TAG.x1} ${TAG.y0} L${TAG.tip} ${MY} L${TAG.x1} ${TAG.y1} L${TAG.x0} ${TAG.y1} Z`;
v.push(`<g filter="url(#paper)"><path d="${tagPath}" fill="${P.tag}"/><path d="${tagPath}" fill="none" stroke="${P.tagEdge}" stroke-width="10" stroke-opacity=".35"/></g><path d="${tagPath}" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linejoin="round"/>`);
v.push(`<path d="M${TAG.x0+12} ${TAG.y0+14} c 8 -4 14 2 10 8 M${TAG.x0+12} ${TAG.y1-14} c 8 4 14 -2 10 -8" stroke="${P.tagEdge}" stroke-width="1.6" fill="none"/>`);
v.push(`<circle cx="${TAG.eye[0]}" cy="${TAG.eye[1]}" r="11" fill="${P.card}" stroke="${P.ink}" stroke-width="3"/><circle cx="${TAG.eye[0]}" cy="${TAG.eye[1]}" r="4.5" fill="${P.ink}"/>`);
// Prompt reaches the description: dashed arrow from the eyelet.
v.push(`<path d="M604 ${MY} L786 ${MY}" stroke="${P.ink}" stroke-width="3.2" stroke-dasharray="16 11" stroke-linecap="round"/>`,head(812,MY,0));
// Miss branch: dashed curve down from the tag.
v.push(`<path d="M600 1448 C 640 1500, 676 1560, 682 1638" stroke="${P.ink}" stroke-width="3" stroke-dasharray="14 11" fill="none" stroke-linecap="round"/>`,head(684,1672,Math.PI/2+.04));
// DESCRIPTION banner: rod with scroll finials, ribbon with shaded folds, swallowtail.
const ribbon=`M${BAN.x0} ${BAN.y0} L${BAN.x1} ${BAN.y0} L${BAN.x1} ${BAN.y1} L${(BAN.x0+BAN.x1)/2} ${BAN.notch} L${BAN.x0} ${BAN.y1} Z`;
v.push(`<g filter="url(#paper)"><path d="${ribbon}" fill="${P.banner}"/><path d="M${BAN.x0} ${BAN.y0} L${BAN.x0+22} ${BAN.y0} L${BAN.x0+22} ${BAN.y1-10} L${BAN.x0} ${BAN.y1} Z" fill="${P.bannerShade}" fill-opacity=".55"/><path d="M${BAN.x1-18} ${BAN.y0} L${BAN.x1} ${BAN.y0} L${BAN.x1} ${BAN.y1} L${BAN.x1-18} ${BAN.y1-12} Z" fill="${P.bannerShade}" fill-opacity=".45"/></g>`);
v.push(`<path d="${ribbon}" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${BAN.x0+10} ${BAN.y0+30} L${BAN.x0+10} ${BAN.y1-34} M${BAN.x1-10} ${BAN.y0+30} L${BAN.x1-10} ${BAN.y1-34}" stroke="${P.ink}" stroke-width="1" opacity=".45"/>`);
v.push(`<path d="M${BAN.x0+14} ${BAN.y1-36} q 12 -10 22 0 q -8 10 -18 4 M${BAN.x1-14} ${BAN.y1-36} q -12 -10 -22 0 q 8 10 18 4" stroke="${P.ink}" stroke-width="1.4" fill="none" opacity=".7"/>`);
v.push(`<rect x="${BAN.x0-26}" y="${BAN.y0-14}" width="${BAN.x1-BAN.x0+52}" height="14" rx="6" fill="#8a7a66" stroke="${P.ink}" stroke-width="2.4"/>`);
const scroll=(cx,d)=>`<path d="M${cx} ${BAN.y0-7} c ${d*10} -2 ${d*20} -12 ${d*14} -24 c ${-d*5} -10 ${-d*22} -8 ${-d*22} 4 c 0 10 ${d*12} 13 ${d*16} 4" stroke="${P.ink}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx} ${BAN.y0-7} c ${d*14} 4 ${d*22} 18 ${d*14} 30 c ${-d*6} 8 ${-d*18} 4 ${-d*16} -6" stroke="${P.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
v.push(scroll(BAN.x0-26,-1),scroll(BAN.x1+26,1));
v.push(`<g filter="url(#wc)"><ellipse cx="942" cy="1556" rx="13" ry="24" fill="${P.ink}" fill-opacity=".92"/><circle cx="792" cy="1220" r="13" fill="${P.ink}" fill-opacity=".5"/></g>`);
// The match test: a "?" diamond, then the ornate accent arrow to the skill.
const dia=`${GATE.cx},${MY-GATE.r} ${GATE.cx+GATE.r},${MY} ${GATE.cx},${MY+GATE.r} ${GATE.cx-GATE.r},${MY}`;
v.push(`<g filter="url(#paper)"><polygon points="${dia}" fill="${P.accent}" fill-opacity=".88"/></g><polygon points="${dia}" fill="none" stroke="${P.accentDeep}" stroke-width="2.4" stroke-linejoin="round"/>`);
v.push(`<path d="M1054 ${MY-3} C 1098 ${MY-10}, 1138 ${MY-10}, 1172 ${MY-6} L1172 ${MY+6} C 1138 ${MY+10}, 1098 ${MY+10}, 1054 ${MY+3} Z" fill="${P.accent}" stroke="${P.accentDeep}" stroke-width="1.6"/>`);
v.push(`<path d="M1070 ${MY-6} c 2 -16 18 -24 30 -16 c 9 6 4 18 -6 15 c -6 -2 -5 -9 1 -9 M1070 ${MY+6} c 2 16 18 24 30 16 c 9 -6 4 -18 -6 -15 c -6 2 -5 9 1 9" stroke="${P.accentDeep}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
v.push(`<polygon points="1206,${MY} 1158,${MY-29} 1171,${MY} 1158,${MY+29}" fill="${P.accent}" stroke="${P.accentDeep}" stroke-width="2"/>`);
// SKILL card stack: the skill's full contents sit behind the visible card.
const card=(x,y,fill,w)=>`<rect x="${x}" y="${y}" width="${CARD.w}" height="${CARD.h}" rx="12" fill="${fill}"/>`+sketchRect(x,y,x+CARD.w,y+CARD.h,2,w,5);
v.push(card(CARD.x+36,CARD.y-26,'#ece2cf',1.8),card(CARD.x+18,CARD.y-13,'#efe6d4',2),card(CARD.x,CARD.y,P.card,2.6));
v.push(`<path d="M${CARD.x+4} ${CARD.y+CARD.h+8} L${CARD.x+CARD.w-6} ${CARD.y+CARD.h+10}" stroke="${P.ink}" stroke-width="5" opacity=".16"/>`);
// Closing-line swashes.
v.push(`<path d="M596 1778 c -18 -4 -22 -22 -6 -26 c 12 -2 16 12 4 14 M600 1766 C 626 1758, 660 1760, 682 1766" stroke="${P.ink}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M1240 1766 C 1266 1758, 1298 1760, 1316 1768 c 14 8 8 24 -6 20 c -10 -3 -6 -14 4 -10" stroke="${P.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
v.push(splat(700,1140,22,90),splat(1000,1590,24,90),splat(290,1330,14,70),splat(1560,1470,16,90),splat(530,340,8,60),splat(1420,450,10,40),splat(960,1170,6,40));

// Text.
const texts=[],container={},seen=new Set(),rotated={};
const T=(id,s,style,within)=>{
 assert.ok(typeof s==='string'&&s.trim(),`text ${id} must be non-empty`);
 assert.ok(!seen.has(id),`duplicate text id ${id}`);
 seen.add(id);texts.push(id);if(within)container[id]=within;
 return node('span',id,{color:P.ink,lineHeight:1.4,...style},s);
};
const at=(id,x,y,w,style,children)=>box(id,{position:'absolute',left:x,top:y,width:w,...style},children);
const ty=(t,extra={})=>({fontSize:t.size,fontWeight:t.weight??400,fontStyle:t.style??'normal',...(t.lineHeight?{lineHeight:t.lineHeight}:{}),...(t.tracking?{letterSpacing:t.tracking}:{}),...extra});
const children=[img('paper',b64(paperPng,'image/png'),0,0,W,H),img('ink',b64(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${v.join('')}</svg>`,'image/svg+xml'),0,0,W,H)];
children.push(at('kicker_box',146,238,700,{},[T('kicker',fixture.kicker,ty(TY.kicker))]));
// Tight display leading: each title line gets its own box, stepped by TITLE.step (less than one line box).
children.push(at('title_box_1',136,TITLE.top,1500,{},[T('title_1',fixture.title[0],ty(TY.title,{color:P.accent}))]));
children.push(at('title_box_2',136,TITLE.top+TITLE.step,1500,{},[T('title_2',fixture.title[1],ty(TY.title,{color:P.accent,fontStyle:'italic'}))]));
children.push(at('subtitle_box',146,776,960,{height:160},[T('subtitle',fixture.subtitle,ty(TY.subtitle),'subtitle_box')]));
children.push(at('tag_box',TAG.x0+8,TAG.y0+20,TAG.x1-TAG.x0-12,{height:TAG.y1-TAG.y0-40,flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6},[
 T('prompt_label',fixture.prompt.label,ty(TY.label),'tag_box'),
 T('prompt_example',fixture.prompt.example,ty(TY.caption),'tag_box')
]));
children.push(at('trigger_box',BAN.x0-110,1092,BAN.x1-BAN.x0+220,{justifyContent:'center'},[T('trigger_note',fixture.description.note,ty(TY.annotation))]));
// DESCRIPTION reads bottom to top along the ribbon.
const DL={w:330,h:56,cx:(BAN.x0+BAN.x1)/2,cy:1378};
rotated.description_label={cx:DL.cx,cy:DL.cy};
children.push(at('description_box',DL.cx-DL.w/2,DL.cy-DL.h/2,DL.w,{height:DL.h,justifyContent:'center',alignItems:'center',transform:'rotate(-90deg)'},[T('description_label',fixture.description.label,ty(TY.label,{fontSize:38,letterSpacing:3}))]));
children.push(at('gate_box',GATE.cx-40,MY-46,80,{height:92,justifyContent:'center',alignItems:'center'},[T('gate',fixture.gate,{fontSize:58,fontWeight:700,color:P.card})]));
children.push(at('contents_box',1168,1222,470,{justifyContent:'center'},[T('skill_contents',fixture.skill.contents,ty(TY.caption,{fontSize:29}))]));
children.push(at('card_box',CARD.x+8,CARD.y+10,CARD.w-16,{height:CARD.h-20,flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6},[
 T('skill_label',fixture.skill.label,ty(TY.labelStrong),'card_box'),
 T('skill_caption',fixture.skill.caption,ty(TY.caption),'card_box')
]));
children.push(at('miss_box',712,1606,320,{flexDirection:'column'},fixture.miss.map((s,i)=>T('miss_'+i,s,ty(TY.annotation)))));
children.push(at('closing_box',650,1722,620,{justifyContent:'center'},[T('closing',fixture.closing,ty(TY.closing))]));
children.push(at('footer_box',FRAME.x0,FRAME.y1+10,FRAME.x1-FRAME.x0,{justifyContent:'center'},[T('footer',fixture.footer,ty(TY.footer,{color:P.muted}))]));
const scene=box('canvas',{position:'relative',width:W,height:H,backgroundColor:P.paper,fontFamily:FAMILY,overflow:'hidden'},children);

// renderBoth: the shared renderer's two backends with all four faces (see the header note).
async function renderBoth(){
 const nodes=[],missingSegments=[];
 const svg=await satori(scene,{width:W,height:H,
  fonts:[[fonts.regular,400,'normal'],[fonts.bold,700,'normal'],...italics.map(f=>[f.data,f.weight,'italic'])].map(([data,weight,style])=>({name:FAMILY,data,weight,style})),
  onNodeDetected:n=>nodes.push(n),
  loadAdditionalAsset:async(languageCode,segment)=>{missingSegments.push({languageCode,segment});return []}});
 const satoriResult={svg,png:new Resvg(svg,{font:{loadSystemFonts:false}}).render().asPng(),bounds:{},textBoxes:{},missingSegments};
 for(const n of nodes){const id=n.props?.id;if(!id)continue;const b={x:n.left,y:n.top,width:n.width,height:n.height};satoriResult.bounds[id]=b;if(typeof n.textContent==='string')satoriResult.textBoxes[id]={...b,text:n.textContent}}
 const faceCss=italics.map(f=>`@font-face{font-family:'${FAMILY}';font-weight:${f.weight};font-style:italic;src:url(data:font/woff;base64,${f.data.toString('base64')})}\n`).join('');
 const html=toDocument(scene,fonts,W,H,FAMILY).replace('*{box-sizing',faceCss+'*{box-sizing');
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
  page.setDefaultTimeout(30000);
  await page.setContent(html,{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  const evidence=await page.evaluate(family=>{
   const bounds={},textBoxes={};
   for(const el of document.querySelectorAll('[id]')){
    const r=el.getBoundingClientRect();bounds[el.id]={x:r.x,y:r.y,width:r.width,height:r.height};
    if([...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())){
     const range=document.createRange();range.selectNodeContents(el);const t=range.getBoundingClientRect();
     textBoxes[el.id]={x:t.x,y:t.y,width:t.width,height:t.height,text:el.textContent,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
    }
   }
   const loaded=[...document.fonts].filter(f=>f.family.replace(/['"]/g,'')===family&&f.status==='loaded').map(f=>`${f.weight}/${f.style}`).sort();
   return {bounds,textBoxes,loadedFaces:loaded};
  },FAMILY);
  return {satoriResult,chromiumResult:{...evidence,html,png:await page.screenshot({clip:{x:0,y:0,width:W,height:H}})}};
 }finally{await browser.close()}
}
const {satoriResult:result,chromiumResult}=await renderBoth();

// Satori reports layout boxes before transforms; turn the rotated label's box the way it is drawn.
for(const [id,{cx,cy}] of Object.entries(rotated)){const b=result.textBoxes[id];if(b)Object.assign(b,{x:cx-b.height/2,y:cy-b.width/2,width:b.height,height:b.width})}

// Layout checks: glyph coverage, canvas and container containment, overflow and text overlap in both backends.
const findings=[];
if(result.missingSegments.length)findings.push({backend:'satori',reason:'unsupported glyphs',segments:result.missingSegments});
// Chromium only loads a face that the page uses, so all four loaded means every face rendered.
if(chromiumResult.loadedFaces.join()!=='400/italic,400/normal,700/italic,700/normal')findings.push({backend:'chromium',reason:'Alegreya faces not all loaded',loaded:chromiumResult.loadedFaces});
const finite=b=>b&&[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0;
const inside=(b,o,t=1)=>b.x>=o.x-t&&b.y>=o.y-t&&b.x+b.width<=o.x+o.width+t&&b.y+b.height<=o.y+o.height+t;
const canvas={x:0,y:0,width:W,height:H};
// The two title lines are set tighter than Alegreya's content area (about 1.3 em), as in the source plate, so
// their text boxes overlap by design while the glyphs do not; inspect the title visually instead (AS-10).
const TIGHT=new Set(['title_1|title_2']);
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
  if(TIGHT.has(texts[i]+'|'+texts[j]))continue;
  if(finite(a)&&finite(c)&&Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>1&&Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>1)findings.push({backend:name,reason:'overlapping text',ids:[texts[i],texts[j]]});
 }
}
for(const id of texts){
 const p=chromiumResult.textBoxes[id];
 if(finite(p)&&(p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1))findings.push({id,backend:'chromium',reason:'text overflow',box:p});
}
assert.equal(result.png.readUInt32BE(16),W);assert.equal(result.png.readUInt32BE(20),H);
assert.equal(chromiumResult.png.readUInt32BE(16),W);assert.equal(chromiumResult.png.readUInt32BE(20),H);

const NAME='skill-trigger';
await fs.writeFile(path.join(ROOT,NAME+'.png'),result.png);
await fs.writeFile(path.join(ROOT,NAME+'-chromium.png'),chromiumResult.png);
await fs.writeFile(path.join(ROOT,NAME+'.svg'),result.svg);
const responsive=chromiumResult.html.replace('</head>',`<style>html,body{width:100%!important;height:100%!important;overflow:auto!important;background:${P.paper}}#canvas{transform-origin:top left}</style></head>`).replace('</body>',`<script>function fit(){const s=Math.min(1,innerWidth/${W});document.getElementById('canvas').style.transform='scale('+s+')';document.body.style.minHeight=(${H}*s)+'px'}addEventListener('resize',fit);fit();</script></body>`);
await fs.writeFile(path.join(ROOT,NAME+'.html'),responsive);
const evidence={renderer:'Satori + resvg and Playwright/Chromium run by this script (renderBoth) with four vendored Alegreya faces; HTML from the shared tools/render.mjs toDocument',loadedFaces:chromiumResult.loadedFaces,width:W,height:H,textIds:texts,artifactDigests:{paper:sha(paperPng),png:sha(result.png),chromiumPng:sha(chromiumResult.png),html:sha(responsive)},findings};
await fs.writeFile(path.join(ROOT,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(findings.length,0,JSON.stringify(findings,null,1));
console.log(`PASS: ${texts.length} text ids; ${W}x${H} in both backends; no unsupported glyphs, escapes, overflow or overlap.`);
