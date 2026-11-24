import assert from 'node:assert/strict';
import { buildViewer, viewerHtml } from '../../tools/deck-viewer.mjs';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchPlaywright, renderPlaywright, renderSatori } from '../../tools/render.mjs';
import { publishForReview } from '../../tools/review.mjs';
import { fontFamily, height, sceneFor, width } from './recipe.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const customDeck = process.env.DECK;
const manifest = await readJson(customDeck ?? new URL('deck.json', import.meta.url));
const { slides } = manifest;
const title = customDeck ? manifest.title : 'XYZ Layout Engine';
const project = customDeck ? manifest.project : 'layout-engine-deck';
assert.ok(typeof title === 'string' && title.trim());
assert.match(project, /^[a-z0-9-]+$/);
const theme = await readJson(process.env.THEME ?? new URL(customDeck ? 'theme-riso.json' : 'theme.json', import.meta.url));
const out = path.resolve(process.env.OUT_DIR ?? path.join(root, 'temp', project));
const publish = !process.env.OUT_DIR && !process.env.THEME;
// The shared renderer accepts one family with multiple registered faces. Use the
// deck’s type-role weights to select the three embedded Neo-Mirai font files.
const neoMirai = theme.fontProfile === 'neo-mirai';
const family = neoMirai ? 'Neo Mirai Deck' : fontFamily;
const font = file => fs.readFile(path.join(root, 'tools/fonts', file));
const fonts = neoMirai ? {
  regular: await font('neo-mirai/ZenOldMincho-Regular.ttf'),
  bold: await font('neo-mirai/ChakraPetch-SemiBold.ttf'),
  faces: [
    { weight: 300, data: await font('neo-mirai/ChakraPetch-Light.ttf') },
    { weight: 500, data: await font('neo-mirai/AzeretMono-Medium.ttf') },
  ],
} : {
  regular: await font('barlow-condensed/BarlowCondensed-Regular.ttf'),
  bold: await font('barlow-condensed/BarlowCondensed-Bold.ttf'),
};
const ids = slides.map(slide => slide.id);
assert.ok(ids.length > 0, 'Expected at least one slide');
assert.equal(new Set(ids).size, ids.length, 'Expected distinct slide IDs');
assert.ok(ids.every(id => /^[a-z0-9-]+$/.test(id)), 'Invalid slide ID');
for (const directory of ['renders', 'chromium', 'slides']) {
  await fs.mkdir(path.join(out, directory), { recursive: true });
}

const dataUri = (type, bytes) => 'data:' + type + ';base64,' + Buffer.from(bytes).toString('base64');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const slideArt = new Map();
const backgrounds = [];
if (neoMirai) {
  const provenance = await readJson(new URL('assets/provenance.json', import.meta.url));
  for (const file of theme.alternatingBackgrounds ?? []) {
    const bytes = await fs.readFile(new URL('assets/' + file, import.meta.url));
    assert.equal(digest(bytes), provenance[file].original.sha256, file + ' asset digest mismatch');
    backgrounds.push(dataUri('image/png', bytes));
  }
  for (const [id, file] of [['welcome', 'amber-transit.png'], ['thanks', 'moon-observatory.png']]) {
    const bytes = await fs.readFile(new URL('assets/' + file, import.meta.url));
    assert.equal(digest(bytes), provenance[file].original.sha256, file + ' asset digest mismatch');
    slideArt.set(id, dataUri('image/png', bytes));
  }
}
let bookendQr, nutritionPreview;
if (!customDeck) {
  const mugFile = 'coffee-mug.png';
  const mug = await fs.readFile(new URL('assets/' + mugFile, import.meta.url));
  const mugReceipt = (await readJson(new URL('assets/provenance.json', import.meta.url)))[mugFile];
  assert.equal(digest(mug), mugReceipt.original.sha256, 'Coffee mug digest mismatch');
  slideArt.set('sponsors', dataUri('image/png', mug));
  bookendQr = dataUri('image/png', await fs.readFile(new URL('assets/bookend-qr.png', import.meta.url)));
  nutritionPreview = dataUri('image/png', await fs.readFile(new URL(
    '../2026-10-13-nutrition-infographic/renders-v4/satori/thumbnail.png', import.meta.url)));
}
let profileLink;
const vectors = [];
const viewerFrames = new Map();
const verification = [];
const browser = await launchPlaywright();
try {
  const context = await browser.newContext({ viewport: { width, height } });
  const encoder = await context.newPage();
  for (const [index, slide] of slides.entries()) {
    const background = backgrounds.length && !slideArt.has(slide.id) && index % 2 === 1
      ? backgrounds[Math.floor(index / 2) % backgrounds.length] : undefined;
    const content = slide.layout === 'contents' ? { ...slide, previews: slides.map(s => s.preview) } : slide;
    const { scene, textIds } = sceneFor(content, theme, family, slideArt.get(slide.id), background, nutritionPreview, bookendQr);
    const satori = await renderSatori(scene, fonts, width, height, family);
    const chromium = await renderPlaywright(context, scene, fonts, width, height, family);
    assert.deepEqual(satori.missingSegments, [], slide.id + ' has missing glyphs');
    assert.ok(chromium.fontLoaded, slide.id + ' did not load its font');

    const metrics = {};
    for (const [name, result] of Object.entries({ satori, chromium })) {
      const seen = [];
      for (const id of textIds) {
        const label = [slide.id, name, id].join('/');
        const rect = result.textBoxes[id];
        const slot = result.bounds[id + '-slot'];
        assert.ok(rect?.text.trim() && rect.width > 0 && rect.height > 0, label + ' has no text');
        const { x, y, width: w, height: h } = rect;
        assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, label + ' escaped canvas');
        assert.ok(x + w <= slot.x + slot.width + 1, label + ' overflowed its width');
        for (const other of seen) {
          assert.ok(x >= other.x + other.width || x + w <= other.x ||
            y >= other.y + other.height || y + h <= other.y, label + ' overlaps other text');
        }
        seen.push(rect);
      }
      metrics[name] = {
        headlineWidthPct: Math.round(result.textBoxes.headline.width / width * 1000) / 10,
        pngSha256: digest(result.png),
      };
    }
    verification.push({ id: slide.id, textCount: textIds.length, ...metrics });
    await fs.writeFile(path.join(out, 'renders', slide.id + '.png'), satori.png);
    await fs.writeFile(path.join(out, 'chromium', slide.id + '.png'), chromium.png);
    await fs.writeFile(path.join(out, 'slides', slide.id + '.json'), JSON.stringify({
      title: slide.title, eyebrow: slide.section,
    }));
    if (slide.profile) {
      const url = new URL(slide.profile);
      assert.equal(url.origin, 'https://www.linkedin.com');
      const { x, y, width: w, height: h } = satori.textBoxes.profile;
      profileLink = { id: slide.id, url: url.href, x, y, w, h };
    }
    vectors.push(dataUri('image/svg+xml', satori.svg));
    const frame = await encoder.evaluate(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', 0.84);
    }, dataUri('image/png', satori.png));
    viewerFrames.set(slide.id, frame);
    console.log('Verified both backends:', slide.id);
  }

  // As in the talk deck, print one renderer-produced frame per page.
  const page = await context.newPage();
  function profileAnchor(style) {
    return '<a aria-label="Noel Saw on LinkedIn" href="' + profileLink.url + '" style="' + style + '"></a>';
  }
  const frames = vectors.map((src, i) => {
    const link = ids[i] === profileLink?.id ? profileAnchor(
      `position:absolute;left:${profileLink.x}px;top:${profileLink.y}px;width:${profileLink.w}px;height:${profileLink.h}px`
    ) : '';
    return '<section><img src="' + src + '">' + link + '</section>';
  }).join('');
  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8">
    <title></title><style>
    @page{size:${width}px ${height}px;margin:0}body{margin:0}
    section{position:relative;break-after:page}section:last-child{break-after:auto}
    img{display:block;width:${width}px;height:${height}px}
    </style><body>${frames}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(value => { document.title = value; }, title);
  await page.pdf({ path: path.join(out, 'deck.pdf'), preferCSSPageSize: true, printBackground: true });
} finally {
  await browser.close();
}

await fs.writeFile(path.join(out, 'verification.json'), JSON.stringify({
  width, height, themeSha256: digest(JSON.stringify(theme)), slides: verification,
}, null, 2) + '\n');
await fs.writeFile(path.join(out, 'deck.json'), JSON.stringify({ title, width, height, slides: ids }));
const model = await buildViewer(out);
const relative = filename => filename;
await fs.writeFile(path.join(out, 'index.html'), viewerHtml(model, relative));
const offline = viewerHtml(model, relative, {
  frames: viewerFrames,
  link: profileLink && { ...profileLink, label: 'Noel Saw on LinkedIn' },
});
const viewer = path.join(out, 'deck.html');
await fs.writeFile(viewer, offline);
if (!customDeck && process.argv.includes('--release')) {
  const edition = neoMirai ? 'neo-mirai' : 'riso';
  const releaseDir = fileURLToPath(new URL('renders/' + edition + '/', import.meta.url));
  await fs.mkdir(releaseDir, { recursive: true });
  const exports = {};
  for (const filename of ['deck.html', 'deck.pdf']) {
    const bytes = await fs.readFile(path.join(out, filename));
    exports[filename] = digest(bytes);
    await fs.writeFile(path.join(releaseDir, filename), bytes);
  }
  const receipt = await readJson(path.join(out, 'verification.json'));
  await fs.writeFile(path.join(releaseDir, 'verification.json'),
    JSON.stringify({ ...receipt, exports }, null, 2) + '\n');
}
if (publish) {
  console.log(await publishForReview(project, [
    path.join(out, 'deck.pdf'), viewer,
  ], { note: `${title}. ${ids.length} slides.` }));
}
