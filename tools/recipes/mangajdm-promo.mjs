import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { invalid, LIMITS, readBounded, within, validateFixtureShape } from '../request.mjs';
import { inspectPng } from '../spike/assets.mjs';

export const name = 'mangajdm-promo';
export const version = '1.0.0';
export const TEXT_IDS = ['eyebrow', 'issue', 'line1', 'line2', 'art_note', 'deck', 'cta', 'website'];
export const CONTAINMENT = { masthead: ['eyebrow', 'issue'], headline: ['line1', 'line2'], art_caption: ['art_note'], message: ['deck'], action: ['cta'], destination: ['website'] };
export const DEFAULT_SIZES = { eyebrow: 24, issue: 24, line1: 100, line2: 100, art_note: 24, deck: 32, cta: 32, website: 36 };
const EXAMPLE = new URL('../../examples/2026-10-11-mangajdm-promos/', import.meta.url);
const ART = ['r34', 'integra', 'silvia-shirt'];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

export async function validate(fixture) {
  const shape = JSON.parse(await readBounded(new URL('01-icon.fixture.json', EXAMPLE), LIMITS.inputBytes));
  validateFixtureShape(fixture, shape);
  if (!ART.includes(fixture.art)) throw invalid('fixture.art', 'select a pinned MangaJDM artwork');
  return fixture;
}

async function loadAssets(art) {
  const proof = JSON.parse(await readBounded(new URL('provenance.json', EXAMPLE), LIMITS.inputBytes));
  const root = await fs.realpath(fileURLToPath(new URL('assets/web/', EXAMPLE)));
  if (!within(await fs.realpath(fileURLToPath(EXAMPLE)), root)) throw invalid('asset', 'asset namespace symlink escape rejection');
  const assets = {}, budget = { bytes: 0, pixels: 0 };
  for (const id of ['logo', art]) {
    const target = await fs.realpath(path.join(root, `${id}.png`));
    if (!within(root, target)) throw invalid(`asset.${id}`, 'symlink escape rejection');
    const bytes = await readBounded(target, LIMITS.assetBytes, `asset.${id}`);
    inspectPng(bytes, budget);
    if (hash(bytes) !== proof.assets[id]?.display?.sha256) throw invalid(`asset.${id}`, 'display digest mismatch');
    assets[id] = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  return assets;
}

const box = (id, style, children) => ({ type: 'div', props: { id, style: { display: 'flex', ...style }, children } });
const image = (id, src, style) => ({ type: 'img', props: { id, src, alt: id === 'logo' ? 'MangaJDM' : 'MangaJDM supplied artwork', style } });

export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes }, { paper, ink, accent } = fixture.theme;
  const assets = await loadAssets(fixture.art);
  const text = (id, content, style = {}) => ({ type: 'span', props: { id, style: { flexShrink: 0, fontSize: s[id], lineHeight: 1.3, color: ink, ...style }, children: content } });
  const at = (left, top, width, height, extra = {}) => ({ position: 'absolute', left, top, width, height, ...extra });
  const pattern = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="${ink}" opacity=".10"/></pattern></defs><rect width="1080" height="1920" fill="url(#dots)"/><path d="M 1010 1760 L 1080 1690 M 938 1760 L 1080 1618 M 866 1760 L 1080 1546" stroke="${accent}" stroke-width="8"/></svg>`;
  return box('canvas', { position: 'relative', width: fixture.width, height: fixture.height, backgroundColor: paper, color: ink, fontFamily: 'Inter', overflow: 'hidden' }, [
    image('paper_pattern', `data:image/svg+xml;base64,${Buffer.from(pattern).toString('base64')}`, at(0, 0, 1080, 1920)),
    box('top_bar', at(0, 0, 1080, 106, { backgroundColor: accent }), []),
    box('bottom_bar', at(0, 1790, 1080, 130, { backgroundColor: ink }), []),
    box('masthead_rule', at(80, 135, 840, 5, { backgroundColor: ink }), []),
    image('logo', assets.logo, at(0, 161, 320, 110, { objectFit: 'contain' })),
    box('masthead', at(80, 283, 840, 34, { justifyContent: 'space-between', alignItems: 'center' }), [
      text('eyebrow', fixture.eyebrow, { letterSpacing: 2, fontWeight: 700 }),
      text('issue', `VOL.01 / ${fixture.issue}`, { color: accent, fontWeight: 700 })
    ]),
    box('headline', at(76, 338, 844, 254, { flexDirection: 'column', justifyContent: 'flex-start', gap: 3 }), [
      text('line1', fixture.headline.line1, { fontWeight: 700, letterSpacing: -5, lineHeight: 1.25 }),
      text('line2', fixture.headline.line2, { fontWeight: 700, letterSpacing: -5, lineHeight: 1.25, color: accent })
    ]),
    box('art_frame', at(80, 596, 840, 772, { flexDirection: 'column', border: `4px solid ${ink}`, backgroundColor: '#ffffff', overflow: 'hidden' }), [
      image('artwork', assets[fixture.art], { width: 832, height: 708, objectFit: fixture.art === 'r34' ? 'cover' : 'contain', objectPosition: fixture.art === 'r34' ? '50% 65%' : '50% 50%' }),
      box('art_caption', { width: 832, height: 56, paddingLeft: 22, alignItems: 'center', backgroundColor: ink }, [
        text('art_note', fixture.artNote, { color: paper, fontWeight: 700, letterSpacing: 1.4 })
      ])
    ]),
    box('message', at(80, 1396, 840, 70, { alignItems: 'flex-start' }), [text('deck', fixture.deck)]),
    box('action', at(80, 1490, 650, 66, { backgroundColor: accent, alignItems: 'center', paddingLeft: 24, paddingRight: 24 }), [
      text('cta', fixture.cta, { color: '#ffffff', fontWeight: 700 })
    ]),
    box('destination', at(80, 1580, 840, 50, { alignItems: 'center' }), [text('website', fixture.website, { fontWeight: 700, letterSpacing: -1 })])
  ]);
}
