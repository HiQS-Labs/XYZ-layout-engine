import { invalid, LIMITS, readBounded, readPinnedPngs, validateFixtureShape } from '../request.mjs';

// Reference-directed recursive process. Geometry is deterministic; the six illustrations are pinned PNG assets.
// Fixed semantic structure; bounded copy and palette remain fixture-owned.
export const version = '5.0.0';
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
  title: 32, subtitle: 18, stage_1_num: 20, stage_2_num: 20, stage_3_num: 20, stage_4_num: 20,
  ...Object.fromEntries(NODES.flatMap(n => [[`${n}_label`, 20], [`${n}_caption`, 16]])),
  trail_label: 20, footer_note: 15, footer_source: 14
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

const ART_ROOT = new URL('../../examples/2026-10-12-belief-reference/', import.meta.url);
const ART_IDS = ['activating-event', 'person-profile', 'negative-consequence', 'positive-consequence', 'examination', 'revised-philosophy'];
const node = (type, id, style, children, extra = {}) => ({ type, props: { ...(id ? { id } : {}), style, children, ...extra } });
const box = (id, style, children) => node('div', id, { display: 'flex', ...style }, children);
const svgData = s => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
// Reference coordinates are uniformly fitted into the supported canvas; they are never stretched.
const W = 1600, H = 1340, SCALE = H / 1294, OFFSET = (W - 1320 * SCALE) / 2;
const at = (x, y, w, h, extra = {}) => ({ position: 'absolute', left: OFFSET + x * SCALE, top: y * SCALE, width: w * SCALE, height: h * SCALE, ...extra });
function notation(value, size, color) {
  const glyph = (v, n, more = {}) => node('span', null, { fontSize: n * SCALE, lineHeight: 1.3, fontWeight: 400, color, ...more }, v);
  return box(null, { alignItems: 'baseline' }, [glyph(value[0], size), ...(value.length > 1 ? [glyph(value.slice(1), size * 0.58, { transform: `translateY(${size * 0.15 * SCALE}px)` })] : [])]);
}
export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes }, p = fixture.theme.palette;
  const assets = await readPinnedPngs(ART_ROOT, 'provenance.json', ART_IDS);
  const text = (id, content, style = {}) => node('span', id, { flexShrink: 0, fontSize: s[id] * SCALE, lineHeight: 1.3, color: p.ink, ...style }, content);
  const artwork = (id, asset, x, y, w, h = w) => node('img', id, at(x, y, w, h, { objectFit: 'contain' }), undefined, { src: assets[asset], alt: asset.replaceAll('-', ' ') });
  const group = (id, data, x, y, w, h) => box(id, at(x, y, w, h, { flexDirection: 'column', alignItems: 'center', gap: 4 * SCALE, paddingLeft: 3 * SCALE, paddingRight: 3 * SCALE }), [
    text(`${id}_label`, data.label, { textAlign: 'center', fontWeight: 700 }),
    text(`${id}_caption`, data.caption, { textAlign: 'center', color: p.muted })
  ]);
  const hex = (x, y, w, h) => `${x},${y-h/2} ${x+w/2},${y-h/4} ${x+w/2},${y+h/4} ${x},${y+h/2} ${x-w/2},${y+h/4} ${x-w/2},${y-h/4}`;
  const path = (d, color = p.muted, width = 2) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const head = (x, y, dir = 'r', color = p.muted) => `<path d="${dir === 'r' ? `M${x-9} ${y-5}L${x} ${y}L${x-9} ${y+5}` : dir === 'u' ? `M${x-5} ${y+9}L${x} ${y}L${x+5} ${y+9}` : `M${x-5} ${y-9}L${x} ${y}L${x+5} ${y-9}`}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
  const shapes = [];
  // Reference-specific title panel, stage rules, hexagons and consequence cards (AS exceptions).
  shapes.push(`<rect x="75" y="71" width="1170" height="80" rx="18" fill="${p.rule}" opacity=".28"/><rect x="75" y="67" width="1170" height="80" rx="18" fill="${p.surface}" stroke="${p.rule}"/>`);
  // Each rule yields to occupied labels and causal paths; all stop before the footer.
  const dividers = [
    'M180 215V448M180 842V1178',
    'M418 215V570M418 842V996M418 1098V1178',
    'M660 215V406M660 1102V1178',
    'M955 215V484M955 842V1178'
  ];
  for (const d of dividers) shapes.push(path(d, p.rule, 1));
  for (const x of [300,540,805,1095]) shapes.push(`<circle cx="${x}" cy="238" r="21" fill="${p.background}" stroke="${p.rule}"/>`);
  shapes.push(`<circle cx="105" cy="648" r="62" fill="${p.surface}" stroke="${p.rule}" stroke-width="2"/>`);
  for (const [x,w,h] of [[310,180,190],[662,180,190]]) {
    shapes.push(`<polygon points="${hex(x,651,w,h)}" fill="${p.rule}" opacity=".3"/><polygon points="${hex(x,648,w,h)}" fill="${p.surface}" stroke="${p.muted}" stroke-width="2"/>`);
  }
  for (const x of [890,1026,1163]) shapes.push(`<polygon points="${hex(x,744,86,100)}" fill="${p.surface}" stroke="${p.rule}" stroke-width="2"/>`);
  for (const x of [465,735]) shapes.push(`<rect x="${x-52.5}" y="858" width="105" height="140" rx="12" fill="${p.surface}" stroke="${p.rule}" stroke-width="1.5"/>`);
  // Wide continuation is a directional band, not an extra causal edge from E.
  shapes.push(`<path d="M790 620H1215V596L1275 648L1215 700V676H790Z" fill="${p.accent}" fill-opacity=".3" stroke="${p.muted}" stroke-width="1.5"/>`);
  shapes.push(path('M168 648H213'),head(213,648),path('M407 648H565'),head(565,648));
  shapes.push(path('M310 868Q310 928 403 928'),head(403,928));
  shapes.push(path('M465 850C465 803 546 759 598 716'),path('M588 717L598 716L595 726'));
  shapes.push(path('M638 868V908Q638 928 658 928H674'),head(674,928));
  shapes.push(path('M789 928H824V690'),head(824,690,'u'));
  shapes.push(path('M662 546V430H699'),head(699,430));
  shapes.push(path('M793 430H817'),head(817,430));
  for (const [a,b] of [[939,981],[1075,1118]]) shapes.push(path(`M${a} 744H${b-5}`),head(b-5,744));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g transform="translate(${OFFSET} 0) scale(${SCALE})">${shapes.join('')}</g></svg>`;
  const children = [node('img', 'structure', { position:'absolute',left:0,top:0,width:W,height:H }, undefined, { src: svgData(svg) }),
    box('header', at(95,82,1130,132,{flexDirection:'column',alignItems:'center',gap:40*SCALE}), [text('title',fixture.title,{fontWeight:400,textAlign:'center'}),text('subtitle',fixture.subtitle,{color:p.muted,textAlign:'center'})])];
  fixture.stages.forEach((stage,i) => children.push(box(`stage_${i+1}`,at([300,540,805,1095][i]-21,216,42,44,{alignItems:'center',justifyContent:'center'}),[text(`stage_${i+1}_num`,String(stage.number))])));
  // Formula tokens remain fixture-driven; arrows and subscripts are engine geometry.
  for (const [i,x] of [[0,224],[1,478]]) {
    const parts = [];
    fixture.stages[i].formula.split(' ').forEach((t,k) => { if(k)parts.push(node('img',null,{width:20*SCALE,height:14*SCALE,flexShrink:0},undefined,{src:svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14"><path d="M1 7H18M12 2L18 7L12 12" fill="none" stroke="${p.muted}" stroke-width="1.5"/></svg>`)}));parts.push(notation(t,28,p.ink)); });
    children.push(box(null,at(x,320,230,48,{alignItems:'center',gap:8*SCALE}),parts));
  }
  children.push(artwork('activating_event_art','activating-event',47,590,116),artwork('examination_art','examination',675,360,120),artwork('revised_philosophy_art','revised-philosophy',824,367,112,126));
  for(const [x,y,w] of [[250,744,120],[602,744,120],[853,802,74],[989,802,74],[1126,802,74]]) children.push(artwork(null,'person-profile',x,y,w));
  fixture.consequences.forEach((c,i)=>children.push(artwork(`consequence_${i+1}_art`,`${c.polarity}-consequence`,[422,692][i],900,86)));
  children.push(box(null,at(250,591,120,100,{justifyContent:'center',alignItems:'center'}),[notation(fixture.states[0].token,72,p.ink)]),box(null,at(602,591,120,100,{justifyContent:'center',alignItems:'center'}),[notation(fixture.states[1].token,78,p.ink)]));
  const trail = [fixture.states[1].token,...fixture.trail.tokens.filter(t=>t!=='…')].slice(0,3);
  trail.forEach((t,i)=>children.push(box(null,at([850,986,1123][i],711,80,60,{justifyContent:'center',alignItems:'center'}),[notation(t,32,p.ink)])));
  children.push(box(null,at(1240,709,60,60,{alignItems:'center'}),[notation('…',32,p.muted)]));
  children.push(group('event_1',fixture.events[0],8,464,186,112),group('event_2',fixture.events[1],421,1088,226,104));
  children.push(group('state_1',fixture.states[0],205,448,210,104),group('state_2',fixture.states[1],485,450,164,112));
  fixture.consequences.forEach((c,i)=>{
    const x=[412.5,682.5][i];children.push(box(null,at(x,863,105,40,{justifyContent:'center'}),[notation(c.token,30,p.ink)]));
    children.push(group(`consequence_${i+1}`,c,x-42,1008,189,78));
  });
  children.push(box(null,at(705,318,60,44,{justifyContent:'center'}),[notation(fixture.branch.examination.token,30,p.ink)]),box(null,at(850,318,60,44,{justifyContent:'center'}),[notation(fixture.branch.outcome.token,30,p.ink)]));
  children.push(group('examination',fixture.branch.examination,675,486,140,104),group('outcome',fixture.branch.outcome,813,500,160,104));
  children.push(box('trail',at(945,556,310,64,{justifyContent:'center',alignItems:'center'}),[text('trail_label',fixture.trail.label,{textAlign:'center'})]));
  children.push(box('footer',at(75,1194,1170,90,{flexDirection:'column',gap:8*SCALE}),[text('footer_note',fixture.footer.note,{color:p.muted}),text('footer_source',fixture.footer.source,{color:p.muted})]));
  return box('canvas',{position:'relative',width:W,height:H,backgroundColor:p.background,fontFamily:FONT.family,color:p.ink,overflow:'hidden'},children);
}
