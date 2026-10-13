import { invalid, LIMITS, readBounded, validateFixtureShape } from '../request.mjs';

// Recursive process: two horizontal A -> B -> C passes, a sweeping feedback route,
// an examination branch (D -> E), and a continuous-revision trail. Fixed structure; the copy and palette come from the fixture.
export const version = '2.0.0';
export const name = 'recursive-process';

export const FONT = {
  family: 'Barlow Condensed',
  regular: new URL('../fonts/barlow-condensed/BarlowCondensed-Regular.ttf', import.meta.url),
  bold: new URL('../fonts/barlow-condensed/BarlowCondensed-Bold.ttf', import.meta.url)
};

const NODES = ['event_1', 'event_2', 'state_1', 'state_2', 'consequence_1', 'consequence_2', 'examination', 'outcome'];
export const TEXT_IDS = [
  'title', 'subtitle', 'stage_1_num', 'stage_2_num', 'stage_3_num', 'stage_4_num',
  ...NODES.flatMap(n => [`${n}_label`, `${n}_caption`]),
  'trail_label', 'footer_note', 'footer_source'
];
export const CONTAINMENT = {
  header: ['title', 'subtitle'],
  ...Object.fromEntries([1, 2, 3, 4].map(i => [`stage_${i}`, [`stage_${i}_num`]])),
  ...Object.fromEntries(NODES.map(n => [n, [`${n}_label`, `${n}_caption`]])),
  trail: ['trail_label'],
  footer: ['footer_note', 'footer_source']
};
export const DEFAULT_SIZES = {
  title: 72, subtitle: 28, stage_1_num: 20, stage_2_num: 20, stage_3_num: 20, stage_4_num: 20,
  ...Object.fromEntries(NODES.flatMap(n => [[`${n}_label`, 34], [`${n}_caption`, 25]])),
  trail_label: 28, footer_note: 22, footer_source: 20
};

const EXAMPLE = new URL('../../examples/2026-10-11-belief-updating/', import.meta.url);
const TOKEN = /^(?:[A-E][1-9]?|…)$/;

export async function validate(fixture) {
  const shape = JSON.parse(await readBounded(new URL('fixture.json', EXAMPLE), LIMITS.inputBytes));
  if (Object.hasOwn(fixture, 'id')) shape.id = 'recursive-process-diagram';
  validateFixtureShape(fixture, shape);
  // The shared shape check fixes keys, lengths and text bounds; these domains are the recipe's own.
  const token = (value, field) => { if (!TOKEN.test(value)) throw invalid(field, 'token must be A-E with an optional digit 1-9, or …'); };
  fixture.stages.forEach((stage, i) => {
    if (stage.number !== i + 1) throw invalid(`fixture.stages[${i}].number`, 'stages are numbered 1 to 4 in order');
    const tokens = stage.formula.split(' ');
    if (tokens.length < 1 || tokens.length > 3) throw invalid(`fixture.stages[${i}].formula`, 'one to three space-separated tokens');
    tokens.forEach(t => token(t, `fixture.stages[${i}].formula`));
  });
  for (const key of ['events', 'states', 'consequences']) fixture[key].forEach((n, i) => token(n.token, `fixture.${key}[${i}].token`));
  for (const key of ['examination', 'outcome']) token(fixture.branch[key].token, `fixture.branch.${key}.token`);
  fixture.trail.tokens.forEach((t, i) => token(t, `fixture.trail.tokens[${i}]`));
  fixture.consequences.forEach((c, i) => {
    if (!['negative', 'positive'].includes(c.polarity)) throw invalid(`fixture.consequences[${i}].polarity`, 'polarity must be negative or positive');
  });
  return fixture;
}

const node = (type, id, style, children, extra = {}) => ({ type, props: { ...(id ? { id } : {}), style, children, ...extra } });
const box = (id, style, children) => node('div', id, { display: 'flex', ...style }, children);
const svgData = s => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
const img = (id, svg, x, y, w, h = w) => node('img', id, { position: 'absolute', left: x, top: y, width: w, height: h }, undefined, { src: svgData(svg) });

// 8px spacing scale, square geometry, solid ink and one red revision accent. No card grid.
// Barlow Condensed needs a 1.2em minimum line box on both renderers.
const W = 1600, H = 1340;
function token(value, size, color) {
  return node('span', null, {fontSize:size, lineHeight:1.3, fontWeight:700, color}, value);
}
export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes }, p = fixture.theme.palette;
  const at = (left, top, width, height, extra = {}) => ({position:'absolute',left,top,width,height,...extra});
  const text = (id, value, style = {}) => node('span', id, {flexShrink:0,fontSize:s[id],lineHeight:1.3,color:p.ink,...style},value);
  const group = (id, data, x, y, width, color = p.ink) => box(id, at(x,y,width,132,{flexDirection:'column',gap:4}), [
    box(null,{alignItems:'baseline',gap:12},[text(`${id}_label`,data.label,{fontWeight:700,color}), token(data.token,22,color)]),
    text(`${id}_caption`,data.caption,{color:p.muted})
  ]);
  const path = (d,c,w=6) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const arrow = (x,y,dir,c) => `<path d="${dir==='d'?`M${x-10} ${y-16}L${x} ${y}L${x+10} ${y-16}`:`M${x-16} ${y-10}L${x} ${y}L${x-16} ${y+10}`}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const flow = [
    path('M350 334H682',p.ink),arrow(682,334,'r',p.ink),path('M890 334H1212',p.ink),arrow(1212,334,'r',p.ink),
    path('M1414 334H1456Q1520 334 1520 398V530Q1520 586 1464 586H312Q256 586 256 642',p.ink,8),arrow(256,642,'d',p.ink),
    path('M350 714H682',p.ink),arrow(682,714,'r',p.ink),path('M890 714H1212',p.ink),arrow(1212,714,'r',p.ink),
    path('M800 920V962',p.accent,8),arrow(800,962,'d',p.accent),
    path('M896 1020H990',p.accent,8),arrow(990,1020,'r',p.accent),
    path('M1200 1020H1376',p.accent,8),arrow(1376,1020,'r',p.accent),
    path('M1414 714H1456V992',p.muted,4),arrow(1456,992,'d',p.muted)
  ];
  // Beliefs are a lens over the same event strokes; examination enlarges that lens.
  const lens = (x,y,c,question=false) => `<g transform="translate(${x} ${y})"><path d="M-60 -20H32M-60 0H48M-60 20H20" stroke="${p.rule}" stroke-width="8"/><circle r="54" fill="${p.background}" stroke="${c}" stroke-width="6"/><path d="M-30 -18H24M-30 0H30M-30 18H12M40 40L76 76" stroke="${c}" stroke-width="6" stroke-linecap="round"/>${question?`<rect x="-34" y="-34" width="68" height="68" fill="${p.background}"/><path d="M-16 -14C-16 -38 22 -38 22 -14C22 0 2 0 2 14" fill="none" stroke="${c}" stroke-width="6"/><circle cx="2" cy="28" r="4" fill="${c}"/>`:''}</g>`;
  const conversation = (x,y) => `<g transform="translate(${x} ${y})" fill="${p.background}" stroke="${p.ink}" stroke-width="6"><path d="M-66 -50H48V16H-12L-42 44V16H-66Z"/><path d="M-14 30V52H28L56 76V52H76V-8H62"/><path d="M-44 -26H24M-44 -4H6"/></g>`;
  const consequence = (x,y,broken) => `<g transform="translate(${x} ${y})" fill="none" stroke="${p.ink}" stroke-width="7"><rect x="-70" y="-24" width="72" height="48" rx="24"/><rect x="${broken?20:-2}" y="-24" width="72" height="48" rx="24"/>${broken?'<path d="M10 -60V-40M10 40V60"/>':''}</g>`;
  const drawings = [conversation(256,334),lens(800,334,p.ink),consequence(1336,334,fixture.consequences[0].polarity === 'negative'),conversation(256,714),lens(800,714,p.ink),consequence(1336,714,fixture.consequences[1].polarity === 'negative'),lens(800,1020,p.accent,true),
    `<g transform="translate(1096 1020)" fill="none" stroke="${p.accent}" stroke-width="6"><path d="M-48 -56H26L50 -32V62H-48Z M26 -56V-32H50 M-24 -12H22 M-24 8H22 M-24 28H6"/></g>`];
  const children = [img('structure',`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${flow.join('')}${drawings.join('')}</svg>`,0,0,W,H),
    box('header',at(64,40,1472,164,{flexDirection:'column',gap:8}),[text('title',fixture.title,{fontWeight:700,lineHeight:1.2}),text('subtitle',fixture.subtitle,{color:p.muted,maxWidth:1400})])];
  const stagePositions = [[64,232,420],[64,624,420],[480,968,210],[1304,968,240]];
  fixture.stages.forEach((stage,i)=>{const [x,y,w]=stagePositions[i];children.push(box(`stage_${i+1}`,at(x,y,w,36),[text(`stage_${i+1}_num`,`${String(stage.number).padStart(2,'0')} / ${['EVENT TO CONSEQUENCE','THE NEXT PASS','EXAMINE','CONTINUE'][i]}`,{fontWeight:700,color:i>1?p.accent:p.muted,letterSpacing:1})]));});
  children.push(group('event_1',fixture.events[0],80,424,360),group('state_1',fixture.states[0],624,424,360),group('consequence_1',fixture.consequences[0],1160,424,344));
  children.push(group('event_2',fixture.events[1],80,804,360),group('state_2',fixture.states[1],624,804,360),group('consequence_2',fixture.consequences[1],1160,804,344));
  children.push(group('examination',fixture.branch.examination,480,1096,400,p.accent),group('outcome',fixture.branch.outcome,928,1096,344,p.accent));
  children.push(box('trail',at(1304,1096,232,116,{flexDirection:'column',gap:8}),[text('trail_label',fixture.trail.label,{fontWeight:700,color:p.accent})]));
  children.push(box(null,at(1400,1008,136,60,{gap:16,alignItems:'center'}),fixture.trail.tokens.map(t=>token(t,32,p.accent))));
  children.push(box('footer',at(64,1240,1472,88,{flexDirection:'column',gap:4,borderTop:`1px solid ${p.rule}`,paddingTop:8}),[text('footer_note',fixture.footer.note,{color:p.muted}),text('footer_source',fixture.footer.source,{color:p.muted})]));
  return box('canvas',{position:'relative',width:W,height:H,backgroundColor:p.background,fontFamily:FONT.family,color:p.ink,overflow:'hidden'},children);
}
