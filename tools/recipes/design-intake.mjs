// Trusted adapter for LLM-authored data. No input code, HTML, CSS or network fetches.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { invalid, readBounded, within, LIMITS } from '../request.mjs';
import { inspectPng } from '../spike/assets.mjs';

export const name = 'design-intake';
export const version = '1.0.5';
export const FONT = {
  family: 'Barlow Condensed',
  regular: new URL('../fonts/barlow-condensed/BarlowCondensed-Regular.ttf', import.meta.url),
  bold: new URL('../fonts/barlow-condensed/BarlowCondensed-Bold.ttf', import.meta.url)
};
export const CAPABILITIES = Object.freeze({
  schemaVersion: 1, recipe: name, version,
  features: ['absolute-layout', 'solid-fill', 'text', 'png-artwork', 'single-font'],
  fonts: { family: FONT.family, weights: [400, 700], glyphs: 'checked by the renderer; no system fallback' },
  elements: ['text', 'image', 'rect'],
  backends: { satori: ['png', 'svg', 'html', 'html-inline'], playwright: ['png', 'html', 'html-inline'] },
  limits: { elements: 100, artwork: 32, inputBytes: LIMITS.inputBytes, renderPixels: LIMITS.renderPixels },
  unsupported: ['multiple font families', 'arbitrary CSS/HTML/JavaScript', 'gradients', 'remote assets', 'responsive layouts'],
  paths: 'relative to the authorized root, not to the fixture',
  artwork: 'non-interlaced 8-bit RGBA PNG, pinned SHA-256 and dimensions; background intent needs visual inspection'
});
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const check = (ok, field, message) => { if (!ok) throw invalid(field, message); };
const object = (v, keys, field) => {
  check(v && typeof v === 'object' && !Array.isArray(v), field, 'requires an object');
  check(Object.keys(v).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(v, k)), field, `requires exactly: ${keys.join(', ')}`);
};
const text = (v, field, max = 2048) => check(typeof v === 'string' && v.trim().length > 0 && v.length <= max, field, 'requires bounded nonempty text');
const number = (v, field, min, max) => check(Number.isFinite(v) && v >= min && v <= max, field, `requires number ${min}..${max}`);
const id = (v, field) => check(typeof v === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(v), field, 'requires a lowercase identifier');
const array = (v, field, min, max) => check(Array.isArray(v) && v.length >= min && v.length <= max, field, `requires ${min}..${max} entries`);
const digest = (v, field) => check(typeof v === 'string' && /^[a-f0-9]{64}$/.test(v), field, 'requires SHA-256');
const identifier = e => `intake_text_${e.id}`;
const region = e => `intake_region_${e.id}`;

async function pinned(root, pin, field, limit) {
  text(pin.path, `${field}.path`);
  check(!path.isAbsolute(pin.path) && !/[:\\\0]/.test(pin.path) && !pin.path.split('/').some(p => p === '..' || !p), `${field}.path`, 'requires a relative local path without traversal');
  digest(pin.sha256, `${field}.sha256`);
  let file;
  try { file = await fs.realpath(path.resolve(root, pin.path)); }
  catch { throw invalid(`${field}.path`, 'missing local file'); }
  check(within(root, file), `${field}.path`, 'symlink escape rejection');
  const bytes = await readBounded(file, limit, field);
  check(hash(bytes) === pin.sha256, `${field}.sha256`, 'digest mismatch; source or asset changed');
  return bytes;
}

// Structural validity is separate from readiness: missing generated artwork is a draft, never renderable.
export async function preflight(f, options = {}) {
  object(f, ['id', 'schemaVersion', 'width', 'height', 'source', 'requirements', 'settings', 'artwork', 'elements'], 'fixture');
  check(f.id === name && f.schemaVersion === 1, 'fixture.id', 'requires design-intake schemaVersion 1');
  for (const k of ['width', 'height']) check(Number.isInteger(f[k]) && f[k] > 0 && f[k] <= 8192, k, 'invalid canvas dimension');
  check(f.width * f.height <= LIMITS.renderPixels, 'width', 'render area exceeds budget');
  object(f.source, ['path', 'sha256'], 'source');
  check(typeof f.source.path === 'string' && /\.md$/i.test(f.source.path), 'source.path', 'requires a Markdown source');
  const root = await fs.realpath(options.root ?? process.cwd());
  const source = (await pinned(root, f.source, 'source', LIMITS.inputBytes)).toString('utf8');
  text(source, 'source', LIMITS.inputBytes);
  object(f.settings, ['palette', 'fontFamily', 'type', 'spacing', 'cornerRadius', 'borderWidth'], 'settings');
  const s = f.settings, unsupported = [], pending = [];
  check(s.palette && typeof s.palette === 'object' && !Array.isArray(s.palette), 'settings.palette', 'requires palette roles');
  const roles = Object.keys(s.palette);
  check(roles.length >= 2 && roles.length <= 12 && roles.includes('paper') && roles.includes('ink'), 'settings.palette', 'requires paper and ink roles, at most 12');
  for (const [k,v] of Object.entries(s.palette)) { id(k, 'settings.palette'); check(typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v), `settings.palette.${k}`, 'requires #rrggbb'); }
  text(s.fontFamily, 'settings.fontFamily');
  if (s.fontFamily !== FONT.family) unsupported.push({ field: 'settings.fontFamily', message: `only ${FONT.family} is supported; no substitution` });
  number(s.spacing, 'settings.spacing', 1, 128);
  number(s.cornerRadius, 'settings.cornerRadius', 0, 128);
  number(s.borderWidth, 'settings.borderWidth', 0, 16);
  object(s.type, ['display', 'body'], 'settings.type');
  for (const [k,v] of Object.entries(s.type)) {
    object(v, ['size', 'weight', 'lineHeight'], `settings.type.${k}`);
    number(v.size, `settings.type.${k}.size`, 12, 512);
    check([400,700].includes(v.weight), `settings.type.${k}.weight`, 'only 400 and 700 supported');
    number(v.lineHeight, `settings.type.${k}.lineHeight`, 1, 2);
  }
  array(f.requirements, 'requirements', 1, 100);
  for (const [i,r] of f.requirements.entries()) {
    const field = `requirements.${i}`;
    object(r, ['quote', 'feature', 'target', 'status', 'reason'], field);
    for (const k of ['quote', 'feature', 'reason']) text(r[k], `${field}.${k}`);
    check(source.includes(r.quote), `${field}.quote`, 'must quote the pinned source exactly');
    check(['mapped','unsupported'].includes(r.status), `${field}.status`, 'requires mapped or unsupported');
    if (r.status === 'unsupported') check(r.target === null, `${field}.target`, 'unsupported requirements use null target');
    if (r.status === 'unsupported' || !CAPABILITIES.features.includes(r.feature)) unsupported.push({ field, message: r.reason, feature: r.feature });
    else {
      text(r.target, `${field}.target`);
      const keys = r.target.split('.');
      check(['settings','artwork','elements','width','height'].includes(keys[0]) && keys.every(k => /^[a-zA-Z0-9_]+$/.test(k) && !['__proto__','constructor','prototype'].includes(k)), `${field}.target`, 'requires a settings/artwork/layout field');
      let value = f;
      for (const key of keys) { check(value != null && Object.hasOwn(Object(value), key), `${field}.target`, 'unknown mapping target'); value = value[key]; }
    }
  }
  object(f.artwork, ['style', 'items'], 'artwork');
  text(f.artwork.style, 'artwork.style');
  array(f.artwork.items, 'artwork.items', 0, 32);
  const assets = {}, assetIds = new Set(), budget = { bytes: 0, pixels: 0 };
  let plannedPixels = 0;
  for (const [i,a] of f.artwork.items.entries()) {
    const field = `artwork.items.${i}`;
    object(a, ['id', 'prompt', 'width', 'height', 'file'], field);
    id(a.id, `${field}.id`); check(!assetIds.has(a.id), `${field}.id`, 'duplicate artwork ID'); assetIds.add(a.id);
    object(a.prompt, ['subject', 'view', 'lighting', 'background', 'exclusions'], `${field}.prompt`);
    for (const [k,v] of Object.entries(a.prompt)) text(v, `${field}.prompt.${k}`);
    for (const k of ['width','height']) check(Number.isInteger(a[k]) && a[k] > 0 && a[k] <= 8192, `${field}.${k}`, 'invalid image dimension');
    plannedPixels += a.width * a.height;
    check(plannedPixels <= LIMITS.assetPixels, field, 'planned aggregate asset area exceeds budget');
    if (a.file === null) { pending.push({ field: `${field}.file`, message: `artwork ${a.id} is not pinned` }); continue; }
    object(a.file, ['path', 'sha256'], `${field}.file`);
    check(typeof a.file.path === 'string' && a.file.path.endsWith('.png'), `${field}.file.path`, 'requires PNG');
    const bytes = await pinned(root, a.file, `${field}.file`, LIMITS.assetBytes);
    let info;
    try { info = inspectPng(bytes, budget); } catch (e) { throw invalid(field, e.message); }
    check(info.width === a.width && info.height === a.height, field, 'PNG dimensions differ from declared artwork size');
    assets[a.id] = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  array(f.elements, 'elements', 1, 100);
  const ids = new Set(), texts = [], usedArt = new Set();
  for (const [i,e] of f.elements.entries()) {
    const field = `elements.${i}`;
    check(e && ['text','image','rect'].includes(e.type), field, 'unsupported element type');
    const fields = { text: ['text','role','color','align'], image: ['asset','alt'], rect: ['fill','stroke'] }[e.type];
    object(e, ['id','type','x','y','width','height',...fields], field);
    id(e.id, `${field}.id`); check(!ids.has(e.id), `${field}.id`, 'duplicate element ID'); ids.add(e.id);
    number(e.x, `${field}.x`, 0, f.width); number(e.y, `${field}.y`, 0, f.height);
    number(e.width, `${field}.width`, 1, f.width); number(e.height, `${field}.height`, 1, f.height);
    check(e.x + e.width <= f.width && e.y + e.height <= f.height, field, 'element outside canvas');
    for (const k of ['x','y','width','height']) check(Number.isInteger(e[k] / s.spacing), `${field}.${k}`, 'must follow settings.spacing grid');
    const color = k => check(typeof e[k] === 'string' && Object.hasOwn(s.palette, e[k]), `${field}.${k}`, 'unknown palette role');
    if (e.type === 'text') {
      text(e.text, `${field}.text`); check(['display','body'].includes(e.role), `${field}.role`, 'unknown type role');
      color('color'); check(['left','center','right'].includes(e.align), `${field}.align`, 'unsupported text alignment');
      for (const other of texts) check(e.x >= other.x + other.width || other.x >= e.x + e.width || e.y >= other.y + other.height || other.y >= e.y + e.height, field, `text region overlaps ${other.id}`);
      texts.push(e);
    } else if (e.type === 'image') {
      check(assetIds.has(e.asset), `${field}.asset`, 'unknown artwork ID'); text(e.alt, `${field}.alt`); usedArt.add(e.asset);
    } else { color('fill'); color('stroke'); }
  }
  check(texts.length > 0 && texts.length <= 64, 'elements', 'requires 1..64 text elements');
  check(usedArt.size === assetIds.size, 'artwork.items', 'every artwork must be placed in the layout');
  return { ready: !unsupported.length && !pending.length, unsupported, pending, assets };
}
export async function validate(fixture, options = {}) {
  const result = await preflight(fixture, options);
  check(result.ready, 'intake', JSON.stringify([...result.unsupported, ...result.pending]));
  return fixture;
}
export function textContract(f) {
  const texts = f.elements.filter(e => e.type === 'text');
  return {
    TEXT_IDS: texts.map(identifier),
    CONTAINMENT: Object.fromEntries(texts.map(e => [region(e), [identifier(e)]])),
    DEFAULT_SIZES: Object.fromEntries(texts.map(e => [identifier(e), f.settings.type[e.role].size]))
  };
}
export async function buildScene(f, sizes = {}, options = {}) {
  const { ready, assets } = await preflight(f, options);
  check(ready, 'intake', 'package is not ready');
  const s = f.settings;
  const box = (id, style, children) => ({ type: 'div', props: { id, style: { display: 'flex', ...style }, children } });
  const nodes = [...f.elements].sort((a,b) => ['rect','image','text'].indexOf(a.type) - ['rect','image','text'].indexOf(b.type)).map(e => {
    const at = { position: 'absolute', left: e.x, top: e.y, width: e.width, height: e.height };
    if (e.type === 'rect') return box(`intake_rect_${e.id}`, { ...at, backgroundColor: s.palette[e.fill], border: `${s.borderWidth}px solid ${s.palette[e.stroke]}`, borderRadius: s.cornerRadius }, []);
    if (e.type === 'image') return { type: 'img', props: { id: `intake_image_${e.id}`, src: assets[e.asset], alt: e.alt, style: { ...at, objectFit: 'contain' } } };
    const type = s.type[e.role];
    return box(region(e), { ...at, alignItems: 'flex-start', justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[e.align] }, [
      { type: 'span', props: { id: identifier(e), style: { fontSize: sizes[identifier(e)] ?? type.size, fontWeight: type.weight, lineHeight: type.lineHeight, color: s.palette[e.color], textAlign: e.align, maxWidth: e.width, flexShrink: 0 }, children: e.text } }
    ]);
  });
  return box('canvas', { position: 'relative', width: f.width, height: f.height, backgroundColor: s.palette.paper, fontFamily: FONT.family }, nodes);
}
