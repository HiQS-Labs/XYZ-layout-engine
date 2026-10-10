import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { invalid, LIMITS, readBounded, within, validateFixtureShape } from '../request.mjs';
import { inspectPng } from '../spike/assets.mjs';

export const version = '1.0.0';
export const name = 'solar-system';

export const SOLAR_SYSTEM_TEXT_IDS = [
  'eyebrow', 'title', 'subtitle', 'intro_heading', 'intro_note',
  'galaxy_title', 'galaxy_note', 'location_title', 'location_name', 'location_arm',
  'sun_name', 'sun_kind', 'mercury_name', 'mercury_kind', 'venus_name', 'venus_kind',
  'earth_name', 'earth_kind', 'mars_name', 'mars_kind', 'jupiter_name', 'jupiter_kind',
  'saturn_name', 'saturn_kind', 'uranus_name', 'uranus_kind', 'neptune_name', 'neptune_kind',
  'belt_name', 'belt_detail', 'footer_message', 'footer_credit', 'scale_note', 'source_note'
];

export const SOLAR_SYSTEM_CONTAINMENT = {
  header: ['eyebrow', 'title', 'subtitle'],
  intro: ['intro_heading', 'intro_note'],
  galaxy_panel: ['galaxy_title', 'galaxy_note'],
  galaxy_location: ['location_title', 'location_name', 'location_arm'],
  label_sun: ['sun_name', 'sun_kind'],
  label_mercury: ['mercury_name', 'mercury_kind'],
  label_venus: ['venus_name', 'venus_kind'],
  label_earth: ['earth_name', 'earth_kind'],
  label_mars: ['mars_name', 'mars_kind'],
  label_jupiter: ['jupiter_name', 'jupiter_kind'],
  label_saturn: ['saturn_name', 'saturn_kind'],
  label_uranus: ['uranus_name', 'uranus_kind'],
  label_neptune: ['neptune_name', 'neptune_kind'],
  label_belt: ['belt_name', 'belt_detail'],
  footer: ['footer_summary', 'scale_note', 'source_note'],
  footer_summary: ['footer_message', 'footer_credit']
};

export const DEFAULT_SIZES = {
  eyebrow: 23, title: 108, subtitle: 30,
  intro_heading: 28, intro_note: 23,
  galaxy_title: 23, galaxy_note: 15,
  location_title: 15, location_name: 24, location_arm: 20,
  sun_name: 34, sun_kind: 18,
  mercury_name: 34, mercury_kind: 18,
  venus_name: 34, venus_kind: 18,
  earth_name: 34, earth_kind: 18,
  mars_name: 34, mars_kind: 18,
  jupiter_name: 34, jupiter_kind: 18,
  saturn_name: 34, saturn_kind: 18,
  uranus_name: 34, uranus_kind: 18,
  neptune_name: 34, neptune_kind: 18,
  belt_name: 30, belt_detail: 20,
  footer_message: 22, footer_credit: 17,
  scale_note: 19, source_note: 16
};

// Keep old exports
export const TEXT_IDS = SOLAR_SYSTEM_TEXT_IDS;
export const CONTAINMENT = SOLAR_SYSTEM_CONTAINMENT;

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

export const ASSET_IDS = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn-clean', 'uranus', 'neptune', 'asteroid-belt-diagram', 'milky-way'];
const EXAMPLE = new URL('../../examples/2026-10-08-solar-system/', import.meta.url);

export async function validate(fixture) {
  const shape = JSON.parse(await readBounded(new URL('fixture.json', EXAMPLE), LIMITS.inputBytes));
  if (Object.hasOwn(fixture, 'id')) shape.id = 'solar-system-diagram';
  validateFixtureShape(fixture, shape);
  // Supported local geometry stays on the recipe canvas before native SVG rasterization.
  const W = fixture.width, H = fixture.height, { x: cx, y: cy } = fixture.center;
  const rect = (x, y, width, height, field) => {
    if (![x, y, width, height].every(Number.isFinite) || width < 1 || height < 1 || x < 0 || y < 0 || x + width > W || y + height > H) throw invalid(field, 'unsupported off-canvas geometry');
  };
  rect(cx - fixture.sun.imageSize / 2, cy - fixture.sun.imageSize / 2, fixture.sun.imageSize, fixture.sun.imageSize, 'fixture.sun.imageSize');
  rect(cx - 530, cy - 350, 1060, 700, 'fixture.center');
  rect(fixture.sun.labelX, fixture.sun.labelY, 260, 100, 'fixture.sun.label');
  rect(fixture.belt.labelX, fixture.belt.labelY, 440, 80, 'fixture.belt.label');
  for (const [i, planet] of fixture.planets.entries()) {
    const field = `fixture.planets[${i}]`;
    if (planet.radiusX < 1 || cx - planet.radiusX < 0 || cx + planet.radiusX > W) throw invalid(`${field}.radiusX`, 'unsupported off-canvas orbit');
    if (planet.radiusY < 1 || cy - planet.radiusY < 0 || cy + planet.radiusY > H) throw invalid(`${field}.radiusY`, 'unsupported off-canvas orbit');
    const angle = planet.angle * Math.PI / 180, size = planet.imageSize;
    rect(cx + planet.radiusX * Math.cos(angle) - size / 2, cy + planet.radiusY * Math.sin(angle) - size / 2, size, size, `${field}.imageSize`);
    rect(planet.labelX, planet.labelY, 260, 100, `${field}.label`);
  }
  return fixture;
}

// Read the exact pinned display derivatives; no copies, full-size originals, provider or host fallback.
export async function loadAssets() {
  const proof = JSON.parse(await readBounded(new URL('verification.json', EXAMPLE), LIMITS.inputBytes));
  const root = await fs.realpath(fileURLToPath(new URL('assets/web/', EXAMPLE)));
  if (!within(await fs.realpath(fileURLToPath(EXAMPLE)), root)) throw invalid('asset', 'asset namespace symlink escape rejection');
  const assets = {}, budget = { bytes: 0, pixels: 0 };
  for (const id of ASSET_IDS) {
    const target = await fs.realpath(path.join(root, `${id}.png`));
    if (!within(root, target)) throw invalid(`asset.${id}`, 'symlink escape rejection');
    const bytes = await readBounded(target, LIMITS.assetBytes, `asset.${id}`);
    inspectPng(bytes, budget);
    if (sha256(bytes) !== proof.assets[id]?.display?.sha256) throw invalid(`asset.${id}`, 'display digest mismatch');
    assets[id] = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  return assets;
}

const node = (type, id, style, children, extra = {}) => ({ type, props: { ...(id ? { id } : {}), style, children, ...extra } });
const box = (id, style, children) => node('div', id, { display: 'flex', ...style }, children);
const text = (id, txt, style = {}, sizes) => node('span', id, { flexShrink: 0, fontSize: sizes[id] ?? 28, lineHeight: 1.3, color: '#e9eff9', ...style }, txt);
const img = (id, src, x, y, w, h = w, extra = {}) => node('img', id, { position: 'absolute', left: x, top: y, width: w, height: h, objectFit: 'contain', ...extra }, undefined, { src });

const data = (mime, b) => `data:${mime};base64,${Buffer.from(b).toString('base64')}`;
const svgData = s => data('image/svg+xml', s);

export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const W = fixture.width;
  const H = fixture.height;
  const cx = fixture.center.x;
  const cy = fixture.center.y;

  const assets = await loadAssets();

  let seed = 82631;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 };
  const stars = Array.from({ length: 165 }, () => `<circle cx="${(rand() * W).toFixed(2)}" cy="${(rand() * H).toFixed(2)}" r="${(rand() * 1.6 + .4).toFixed(2)}" fill="#b9cce8" opacity="${(rand() * .4 + .1).toFixed(2)}"/>`).join('');
  const background = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="a"><stop stop-color="#132444"/><stop offset="1" stop-color="#060c1b"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#a)"/>${stars}</svg>`);
  const orbits = svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${fixture.planets.map(p => `<ellipse cx="${cx}" cy="${cy}" rx="${p.radiusX}" ry="${p.radiusY}" fill="none" stroke="${p.index === '03' ? '#477a99' : '#3c506e'}" stroke-opacity="${p.index === '03' ? '.7' : '.48'}" stroke-width="${p.index === '03' ? 2.5 : 1.7}"/>`).join('')}</svg>`);

  const leaders = [];
  const label = (id, name, kind, x, y, color, index) => box('label_' + id, { position: 'absolute', left: x, top: y, width: 260, flexDirection: 'column', gap: 5 }, [
    text(id + '_name', name, { fontWeight: 700, color }, s),
    text(id + '_kind', (index ? index + '  /  ' : '') + kind.toUpperCase(), { letterSpacing: 1.1, color: '#9eadc3' }, s)
  ]);

  const children = [img('starfield', background, 0, 0, W, H), img('orbits', orbits, 0, 0, W, H)];

  children.push(box('header', { position: 'absolute', left: 100, top: 87, width: 1530, height: 253, flexDirection: 'column', gap: 18 }, [
    text('eyebrow', fixture.eyebrow, { letterSpacing: 4.4, color: '#b4c5de', fontWeight: 700 }, s),
    text('title', fixture.title, { fontWeight: 700, letterSpacing: -4, color: '#f4f6fb', lineHeight: 1.25 }, s),
    text('subtitle', fixture.subtitle, { color: '#aabbd3' }, s)
  ]));

  children.push(box('intro', { position: 'absolute', left: 102, top: 365, width: 1160, flexDirection: 'column', gap: 10 }, [
    text('intro_heading', 'A journey from our star to the outer planets', { color: '#d8e4f4' }, s),
    text('intro_note', 'Read the numbered planets in order outward from the Sun.', { color: '#8298b6' }, s)
  ]));

  children.push(box('galaxy_panel', { position: 'absolute', left: 1770, top: 73, width: 530, height: 454, border: '1px solid #33435e', borderRadius: 28, backgroundColor: '#0b1529', padding: 30, flexDirection: 'column' }, [
    text('galaxy_title', 'THE MILKY WAY', { letterSpacing: 3, fontWeight: 700, color: '#bdcde3' }, s),
    text('galaxy_note', fixture.galaxy.note, { position: 'absolute', left: 30, top: 406, color: '#7c91ae' }, s)
  ]));

  children.push(img('asset_milky-way', assets['milky-way'], 1785, 135, 340));

  children.push(box('galaxy_location', { position: 'absolute', left: 2115, top: 245, width: 164, flexDirection: 'column', gap: 8 }, [
    text('location_title', 'YOU ARE HERE', { letterSpacing: 1.4, fontWeight: 700, color: '#f4d79f' }, s),
    text('location_name', 'Solar System', { fontWeight: 700 }, s),
    text('location_arm', 'Orion Spur', { color: '#aabbd3' }, s)
  ]));

  const galaxyMarker = svgData('<svg xmlns="http://www.w3.org/2000/svg" width="530" height="454"><path d="M 289 221 L 322 211 L 341 211" fill="none" stroke="#f4d79f" stroke-width="2"/><circle cx="284" cy="222" r="6" fill="#f4d79f"/><circle cx="284" cy="222" r="15" fill="none" stroke="#f4d79f" stroke-opacity=".5" stroke-width="1.5"/></svg>');
  children.push(img('galaxy_marker', galaxyMarker, 1770, 73, 530, 454));

  children.push(img('asset_asteroid-belt', assets['asteroid-belt-diagram'], cx - 530, cy - 350, 1060, 700, { objectFit: 'fill' }));
  children.push(img('asset_sun', assets.sun, cx - fixture.sun.imageSize / 2, cy - fixture.sun.imageSize / 2, fixture.sun.imageSize));
  children.push(label('sun', fixture.sun.name, fixture.sun.kind, fixture.sun.labelX, fixture.sun.labelY, '#f6cf82'));

  for (const p of fixture.planets) {
    const radians = p.angle * Math.PI / 180;
    const x = cx + p.radiusX * Math.cos(radians), y = cy + p.radiusY * Math.sin(radians);
    children.push(img('asset_' + p.id, assets[p.asset || p.id], x - p.imageSize / 2, y - p.imageSize / 2, p.imageSize));
    children.push(label(p.id, p.name, p.kind, p.labelX, p.labelY, p.color, p.index));
    const nearestX = Math.max(p.labelX, Math.min(x, p.labelX + 235));
    const labelTop = p.labelY > y;
    const toY = labelTop ? p.labelY - 12 : p.labelY + 83;
    const startY = y + (labelTop ? 1 : -1) * p.imageSize * .34;
    leaders.push(`<path d="M ${x.toFixed(2)} ${startY.toFixed(2)} L ${nearestX.toFixed(2)} ${toY}" fill="none" stroke="${p.color}" stroke-opacity=".52" stroke-width="1.5"/>`);
  }

  leaders.push('<path d="M 870 1230 L 815 1285 L 680 1285" fill="none" stroke="#c4ad84" stroke-opacity=".7" stroke-width="1.5"/>');
  children.push(img('label_leaders', svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${leaders.join('')}</svg>`), 0, 0, W, H));

  children.push(box('label_belt', { position: 'absolute', left: fixture.belt.labelX, top: fixture.belt.labelY, width: 440, flexDirection: 'column', gap: 7 }, [
    text('belt_name', fixture.belt.name, { color: '#d4c09c', fontWeight: 700 }, s),
    text('belt_detail', fixture.belt.detail, { color: '#95a7c0' }, s)
  ]));

  children.push(box('footer_rule', { position: 'absolute', left: 100, top: 1520, width: 2200, height: 1, backgroundColor: '#34465f' }, []));

  children.push(box('footer', { position: 'absolute', left: 100, top: 1550, width: 2200, flexDirection: 'column', gap: 18 }, [
    box('footer_summary', { width: 2200, justifyContent: 'space-between', alignItems: 'center' }, [
      text('footer_message', 'ONE STAR  /  EIGHT PLANETS  /  OUR GALACTIC HOME', { letterSpacing: 1.6, color: '#d0dbee', fontWeight: 700 }, s),
      text('footer_credit', 'XYZ LAYOUT ENGINE', { letterSpacing: 2, color: '#7289a8' }, s)
    ]),
    text('scale_note', fixture.disclaimer, { color: '#8499b5' }, s),
    text('source_note', 'Astronomy: NASA Science · Artwork: AI-generated artist impressions', { color: '#6d84a5' }, s)
  ]));

  return box('canvas', { position: 'relative', width: W, height: H, backgroundColor: '#060c1b', fontFamily: 'Inter', overflow: 'hidden' }, children);
}
