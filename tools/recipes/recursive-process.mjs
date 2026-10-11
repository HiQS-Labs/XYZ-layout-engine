import { invalid, LIMITS, readBounded, validateFixtureShape } from '../request.mjs';

// Recursive process: four stage columns, A -> B -> C cycles, an examination branch (D -> E)
// and a continuous-revision trail. Fixed structure; the copy and palette come from the fixture.
export const version = '1.0.0';
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
  title: 56, subtitle: 25, stage_1_num: 20, stage_2_num: 20, stage_3_num: 20, stage_4_num: 20,
  ...Object.fromEntries(NODES.flatMap(n => [[`${n}_label`, 22], [`${n}_caption`, 18]])),
  trail_label: 22, footer_note: 17, footer_source: 16
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
const flowImg = (svg, w, h = w) => node('img', null, { width: w, height: h, flexShrink: 0 }, undefined, { src: svgData(svg) });

// Visual system (AS-5): 8 px spacing scale, one 12 px card radius, one 2 px stroke, no shadows or gradients.
// Barlow Condensed's line box is 1.2 em (hhea 1000/-200), so no text uses a line height below 1.2:
// Chromium reports a tighter line as overflow at every size.
const STROKE = 2, RADIUS = 12;
const W = 1600, H = 1340, MARGIN = 80, COL = (W - 2 * MARGIN) / 4;
const cx = i => MARGIN + COL * i + COL / 2;
const TOP_Y = 420, MID_Y = 726, CARD_Y = 980, CARD_H = 154, RING = 54;

// Barlow Condensed has no subscript digits or arrow glyph, so an index is a smaller lowered span and arrows are SVG.
function token(value, size, color) {
  const glyph = (text, fontSize, extra = {}) => node('span', null, { fontSize, fontWeight: 700, lineHeight: 1.2, color, ...extra }, text);
  if (value === '…' || value.length === 1) return glyph(value, size);
  return box(null, { alignItems: 'flex-end' }, [glyph(value[0], size), glyph(value.slice(1), Math.round(size * 0.58), { marginBottom: -Math.round(size * 0.1) })]);
}
const arrowGlyph = (color, w = 26) => flowImg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="14" viewBox="0 0 ${w} 14"><path d="M1 7H${w - 9}" stroke="${color}" stroke-width="${STROKE}" fill="none"/><path d="M${w - 10} 2L${w - 2} 7L${w - 10} 12Z" fill="${color}"/></svg>`, w, 14);

const ICONS = {
  conversation: c => `<path d="M14 22h40a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H34l-10 9v-9H14a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z"/><path d="M66 38h16a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-4v8l-9-8H54a6 6 0 0 1-6-6v-2"/>`,
  broken: c => `<rect x="6" y="36" width="34" height="24" rx="12"/><rect x="56" y="36" width="34" height="24" rx="12"/><path d="M48 24v8M48 64v8M40 28l-4-6M56 28l4-6M40 68l-4 6M56 68l4 6"/>`,
  linked: c => `<rect x="10" y="34" width="44" height="28" rx="14"/><rect x="42" y="34" width="44" height="28" rx="14"/>`,
  examine: c => `<circle cx="40" cy="40" r="24"/><path d="M58 58l24 24"/><path d="M33 34a7 7 0 1 1 10 6c-2 1-3 3-3 5v2"/><circle cx="40" cy="53" r="1.5" fill="${c}"/>`,
  revise: c => `<path d="M24 12h34l14 14v58H24z"/><path d="M58 12v14h14"/><path d="M36 58a12 12 0 1 0 4-14"/><path d="M38 38v8h8"/>`
};
const icon = (kind, color, size) => flowImg(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${ICONS[kind](color)}</svg>`, size);

const hexPoints = (x, y, h) => {
  const r = h / 2;
  return Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k - Math.PI / 2; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
};
const head = (x, y, dir, color) => {
  const s = 9, pts = { r: [[x, y], [x - s, y - s * 0.6], [x - s, y + s * 0.6]], u: [[x, y], [x - s * 0.6, y + s], [x + s * 0.6, y + s]], d: [[x, y], [x - s * 0.6, y - s], [x + s * 0.6, y - s]] }[dir];
  return `<path d="M${pts.map(p => p.join(' ')).join('L')}Z" fill="${color}"/>`;
};
const line = (d, color, width = STROKE) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;

export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes }, p = fixture.theme.palette;
  const text = (id, value, style = {}) => node('span', id, { flexShrink: 0, fontSize: s[id], lineHeight: 1.3, color: p.ink, ...style }, value);
  const group = (id, x, y, width, height, tok, tokSize, tokColor, labelText, caption, align = 'center') => box(id, { position: 'absolute', left: x, top: y, width, height, flexDirection: 'column', alignItems: align, gap: 4 }, [
    ...(tok ? [token(tok, tokSize, tokColor)] : []),
    text(`${id}_label`, labelText, { fontWeight: 700, lineHeight: 1.2, textAlign: align }),
    text(`${id}_caption`, caption, { color: p.muted, textAlign: align })
  ]);

  const overlay = [];
  // Stage dividers and footer rule.
  for (let i = 1; i < 4; i++) overlay.push(line(`M${MARGIN + COL * i} 236V1160`, p.rule, 1));
  overlay.push(line(`M${MARGIN} 1180H${W - MARGIN}`, p.rule, 1));
  // Event, examination and outcome rings.
  for (const [x, y, r, stroke] of [[cx(0), TOP_Y, RING, p.rule], [cx(1), TOP_Y, RING, p.rule], [cx(2), TOP_Y, RING, p.accent], [cx(2), MID_Y, 64, p.accent]]) {
    overlay.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.surface}" stroke="${stroke}" stroke-width="${STROKE}"/>`);
  }
  // State hexagons: the updated belief is drawn larger (AS-4).
  const HEX = [180, 220];
  HEX.forEach((h, i) => overlay.push(`<polygon points="${hexPoints(cx(i), MID_Y, h)}" fill="${p.surface}" stroke="${i ? p.ink : p.rule}" stroke-width="${STROKE}"/>`));
  // Trail hexagons.
  const trailX = [1240, 1360, 1470], TRAIL_Y = MID_Y;
  fixture.trail.tokens.forEach((t, k) => { if (t !== '…') overlay.push(`<polygon points="${hexPoints(trailX[k], TRAIL_Y, 84)}" fill="${p.surface}" stroke="${p.accent}" stroke-width="${STROKE}"/>`); });
  // Connectors: neutral flow in muted, the revision path in the accent only (AS-2).
  for (const i of [0, 1]) {
    overlay.push(line(`M${cx(i)} 606V${MID_Y - HEX[i] / 2 - 4}`, p.muted), head(cx(i), MID_Y - HEX[i] / 2 - 2, 'd', p.muted));
    overlay.push(line(`M${cx(i)} ${MID_Y + HEX[i] / 2 + 104}V${CARD_Y - 6}`, p.muted), head(cx(i), CARD_Y - 2, 'd', p.muted));
  }
  overlay.push(line(`M${cx(0) + 150} ${CARD_Y + CARD_H / 2}H425V${TOP_Y}H${cx(1) - RING - 6}`, p.muted), head(cx(1) - RING - 2, TOP_Y, 'r', p.muted));
  overlay.push(line(`M${cx(1) + 96} ${MID_Y}H780V${TOP_Y}H${cx(2) - RING - 6}`, p.accent), head(cx(2) - RING - 2, TOP_Y, 'r', p.accent));
  overlay.push(line(`M${cx(2)} 606V${MID_Y - 64 - 6}`, p.accent), head(cx(2), MID_Y - 64 - 2, 'd', p.accent));
  overlay.push(line(`M${cx(2) + 64} ${MID_Y}H${trailX[0] - 46}`, p.accent, 4), head(trailX[0] - 38, MID_Y, 'r', p.accent));
  overlay.push(line(`M${cx(1) + 150} ${CARD_Y + CARD_H / 2}H${trailX[0]}V${TRAIL_Y + 46}`, p.muted), head(trailX[0], TRAIL_Y + 44, 'u', p.muted));
  for (let k = 0; k < 2; k++) overlay.push(line(`M${trailX[k] + 40} ${TRAIL_Y}H${trailX[k + 1] - 46}`, p.accent), head(trailX[k + 1] - 42, TRAIL_Y, 'r', p.accent));

  const children = [img('structure', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${overlay.join('')}</svg>`, 0, 0, W, H)];

  children.push(box('header', { position: 'absolute', left: MARGIN, top: 56, width: W - 2 * MARGIN, height: 160, flexDirection: 'column', gap: 12 }, [
    text('title', fixture.title, { fontWeight: 700, lineHeight: 1.2 }),
    text('subtitle', fixture.subtitle, { color: p.muted, maxWidth: 1100 })
  ]));

  fixture.stages.forEach((stage, i) => {
    const tokens = stage.formula.split(' ');
    const formula = [];
    tokens.forEach((t, k) => { if (k) formula.push(arrowGlyph(p.muted)); formula.push(token(t, 34, p.muted)); });
    children.push(box(`stage_${i + 1}`, { position: 'absolute', left: MARGIN + COL * i, top: 236, width: COL, height: 104, flexDirection: 'column', alignItems: 'center', gap: 10 }, [
      box(null, { width: 40, height: 40, borderRadius: 20, border: `${STROKE}px solid ${p.rule}`, alignItems: 'center', justifyContent: 'center' }, [
        text(`stage_${i + 1}_num`, String(stage.number), { fontWeight: 700, color: p.muted, lineHeight: 1 })
      ]),
      box(null, { alignItems: 'center', gap: 10 }, formula)
    ]));
  });

  // Icons sit inside their rings.
  for (const [kind, x, y, size, color] of [['conversation', cx(0), TOP_Y, 64, p.ink], ['conversation', cx(1), TOP_Y, 64, p.ink], ['examine', cx(2), TOP_Y, 64, p.accent], ['revise', cx(2), MID_Y, 76, p.accent]]) {
    children.push(box(null, { position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size }, [icon(kind, color, size)]));
  }

  fixture.events.forEach((e, i) => children.push(group(`event_${i + 1}`, cx(i) - 150, 482, 300, 120, e.token, 28, p.ink, e.label, e.caption)));
  fixture.states.forEach((st, i) => {
    children.push(box(null, { position: 'absolute', left: cx(i) - 80, top: MID_Y - 40, width: 160, height: 80, alignItems: 'center', justifyContent: 'center' }, [token(st.token, i ? 64 : 54, p.ink)]));
    children.push(group(`state_${i + 1}`, cx(i) - 150, MID_Y + HEX[i] / 2 + 10, 300, 90, null, 0, null, st.label, st.caption));
  });
  fixture.consequences.forEach((c, i) => {
    const color = c.polarity === 'negative' ? p.negative : p.positive;
    children.push(box(null, { position: 'absolute', left: cx(i) - 150, top: CARD_Y, width: 300, height: CARD_H, border: `${STROKE}px solid ${color}`, borderRadius: RADIUS, backgroundColor: p.surface, padding: 16, gap: 16, alignItems: 'center' }, [
      icon(c.polarity === 'negative' ? 'broken' : 'linked', color, 64),
      box(`consequence_${i + 1}`, { flexDirection: 'column', gap: 4, width: 186, height: 118, justifyContent: 'center' }, [
        token(c.token, 28, color),
        text(`consequence_${i + 1}_label`, c.label, { fontWeight: 700, lineHeight: 1.2 }),
        text(`consequence_${i + 1}_caption`, c.caption, { color: p.muted })
      ])
    ]));
  });
  children.push(group('examination', cx(2) - 150, 482, 300, 120, fixture.branch.examination.token, 28, p.accent, fixture.branch.examination.label, fixture.branch.examination.caption));
  children.push(group('outcome', cx(2) - 150, MID_Y + 74, 300, 120, fixture.branch.outcome.token, 28, p.accent, fixture.branch.outcome.label, fixture.branch.outcome.caption));

  children.push(box('trail', { position: 'absolute', left: MARGIN + COL * 3 + 20, top: MID_Y - 112, width: COL - 20, height: 40, alignItems: 'flex-end' }, [
    text('trail_label', fixture.trail.label, { fontWeight: 700, lineHeight: 1.2, color: p.accent })
  ]));
  fixture.trail.tokens.forEach((t, k) => children.push(box(null, { position: 'absolute', left: trailX[k] - 40, top: TRAIL_Y - 24, width: 80, height: 48, alignItems: 'center', justifyContent: 'center' }, [token(t, 30, t === '…' ? p.accent : p.ink)])));

  children.push(box('footer', { position: 'absolute', left: MARGIN, top: 1200, width: W - 2 * MARGIN, height: 120, flexDirection: 'column', gap: 8 }, [
    text('footer_note', fixture.footer.note, { color: p.muted }),
    text('footer_source', fixture.footer.source, { color: p.muted })
  ]));

  return box('canvas', { position: 'relative', width: W, height: H, backgroundColor: p.background, fontFamily: FONT.family, color: p.ink, overflow: 'hidden' }, children);
}
