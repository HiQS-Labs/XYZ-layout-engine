import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const { renderSatori, publishArtifacts } = await import('../../tools/render.mjs');
const { loadAssets, ASSET_IDS } = await import('../../tools/recipes/solar-system.mjs');
const { getFonts } = await import('../../tools/spike/assets.mjs');

const fonts = await getFonts();
const ids = ASSET_IDS, assets = await loadAssets();
const cells = await Promise.all(ids.map(async (id, i) => ({
  type: 'div',
  props: {
    style: { display: 'flex', flexDirection: 'column', position: 'absolute', left: (i % 4) * 300, top: Math.floor(i / 4) * 290, width: 300, height: 290, alignItems: 'center' },
    children: [
      { type: 'img', props: { src: assets[id], style: { width: 250, height: 250, objectFit: 'contain' } } },
      { type: 'span', props: { style: { fontSize: 18, color: '#e6edf7' }, children: id } }
    ]
  }
})));

const r = await renderSatori({ type: 'div', props: { style: { display: 'flex', width: 1200, height: 870, backgroundColor: '#070e20', fontFamily: 'Inter' }, children: cells } }, fonts, 1200, 870);

if (r.missingSegments.length || r.png.readUInt32BE(16) !== 1200 || r.png.readUInt32BE(20) !== 870) throw new Error('Contact-sheet render validation failed');
const digest = createHash('sha256').update(r.png).digest('hex');
const publication = await publishArtifacts({
  request: { validation: { valid: true, errors: [] }, provenance: { recipe: 'solar-system contact sheet', assets: ids }, digests: { png: digest } },
  artifacts: [{ name: 'render.png', bytes: r.png, sha256: digest }]
}, 'tools/output/solar-system-contact-sheet', { root: fileURLToPath(new URL('../../', import.meta.url)) });
console.log(JSON.stringify(publication, null, 2));
