import { invalid, LIMITS, readBounded, readPinnedPngs, validateFixtureShape } from '../request.mjs';

export const name = 'mangajdm-promo';
export const version = '3.0.0';
export const TEXT_IDS = ['eyebrow', 'issue', 'line1', 'line2', 'art_note', 'deck', 'cta', 'website'];
export const CONTAINMENT = { masthead: ['eyebrow', 'issue'], headline: ['line1', 'line2'], art_caption: ['art_note'], message: ['deck'], action: ['cta'], destination: ['website'] };
export const DEFAULT_SIZES = { eyebrow: 24, issue: 24, line1: 156, line2: 88, art_note: 24, deck: 32, cta: 32, website: 36 };
const EXAMPLE = new URL('../../examples/2026-10-11-mangajdm-promos/', import.meta.url);
const ART = ['r34', 'integra', 'silvia-shirt'];

export async function validate(fixture) {
  const shape = JSON.parse(await readBounded(new URL('01-icon.fixture.json', EXAMPLE), LIMITS.inputBytes));
  if (fixture.theme.palette) shape.theme = { palette: { paper: '#ffffff', ink: '#000000', accent: '#ff0000' } };
  validateFixtureShape(fixture, shape);
  if (!ART.includes(fixture.art)) throw invalid('fixture.art', 'select a pinned MangaJDM artwork');
  return fixture;
}

async function loadAssets(art) {
  return readPinnedPngs(EXAMPLE, 'provenance.json', ['logo', art]);
}

const box = (id, style, children) => ({ type: 'div', props: { id, style: { display: 'flex', ...style }, children } });
const image = (id, src, style) => ({ type: 'img', props: { id, src, alt: id === 'logo' ? 'MangaJDM' : 'MangaJDM supplied artwork', style } });

// The supplied portrait, landscape and garment assets determine three editorial compositions.
// 8px spacing, square edges, no shadows; Inter deliberately preserves the brand series.
export async function buildScene(fixture, sizes = {}) {
  const s = { ...DEFAULT_SIZES, ...sizes };
  const { paper, ink, accent } = fixture.theme.palette ?? fixture.theme;
  const assets = await loadAssets(fixture.art);
  const text = (id, content, style = {}) => ({ type: 'span', props: { id, style: { flexShrink: 0, fontSize: s[id], lineHeight: 1.3, color: ink, ...style }, children: content } });
  const at = (left, top, width, height, extra = {}) => ({ position: 'absolute', left, top, width, height, ...extra });
  const r34 = fixture.art === 'r34', eras = fixture.art === 'integra';
  const children = [
    image('artwork', assets[fixture.art], r34 ? at(0, 0, 1080, 1920, { objectFit: 'contain' }) : eras ? at(0, 624, 1080, 611, { objectFit: 'contain' }) : at(114, 536, 852, 1136, { objectFit: 'contain' })),
    ...(r34 ? [box('caption_paper', at(48, 1680, 984, 240, { backgroundColor: paper }), [])] : []),
    image('logo', assets.logo, at(40, 24, 248, 124, { objectFit: 'contain' })),
    box('masthead', at(64, 152, 952, 40, { justifyContent: 'space-between' }), [
      text('eyebrow', fixture.eyebrow, { fontWeight: 700, letterSpacing: 2 }),
      text('issue', fixture.issue, { color: accent, fontWeight: 700 })
    ]),
    box('headline', at(56, 216, 968, 352, { flexDirection: 'column' }), [
      text('line1', fixture.headline.line1, { fontWeight: 700, letterSpacing: -7, lineHeight: 1.3 }),
      text('line2', fixture.headline.line2, { fontWeight: 700, letterSpacing: -3, lineHeight: 1.3, color: accent })
    ]),
    box('art_caption', at(64, eras ? 1280 : 1696, 952, 40), [text('art_note', fixture.artNote, { fontWeight: 700, letterSpacing: 2 })]),
    box('message', at(64, eras ? 1352 : 1744, 952, 88), [text('deck', fixture.deck, { fontSize: s.deck, lineHeight: 1.3, fontWeight: 400 })]),
    box('action', at(64, eras ? 1496 : 1808, 952, 48), [text('cta', fixture.cta, { color: accent, fontWeight: 700 })]),
    box('destination', at(64, 1864, 952, 48), [text('website', fixture.website, { fontWeight: 700, letterSpacing: -1 })])
  ];
  return box('canvas', { position: 'relative', width: fixture.width, height: fixture.height, backgroundColor: paper, color: ink, fontFamily: 'Inter', overflow: 'hidden' }, children);
}
