import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { launchPlaywright, renderPlaywright, renderSatori } from '../../tools/render.mjs';
import { publishForReview } from '../../tools/review.mjs';
import { fontFamily, height, sceneFor, width } from './recipe.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const { slides } = await readJson(new URL('deck.json', import.meta.url));
const theme = await readJson(process.env.THEME ?? new URL('theme.json', import.meta.url));
const out = path.resolve(process.env.OUT_DIR ?? path.join(root, 'temp/layout-engine-deck'));
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
const title = 'XYZ Layout Engine';
const ids = slides.map(slide => slide.id);
assert.ok(ids.length > 0, 'Expected at least one slide');
assert.equal(new Set(ids).size, ids.length, 'Expected distinct slide IDs');
assert.ok(ids.every(id => /^[a-z0-9-]+$/.test(id)), 'Invalid slide ID');
for (const directory of ['renders', 'chromium', 'slides']) {
  await fs.mkdir(path.join(out, directory), { recursive: true });
}

const dataUri = (type, bytes) => 'data:' + type + ';base64,' + Buffer.from(bytes).toString('base64');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const bookendArt = new Map();
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
    bookendArt.set(id, dataUri('image/png', bytes));
  }
}
const nutritionPreview = dataUri('image/png', await fs.readFile(new URL(
  '../2026-10-13-nutrition-infographic/renders-v4/satori/thumbnail.png', import.meta.url)));
let profileLink;
const vectors = [];
const viewerFrames = new Map();
const verification = [];
const browser = await launchPlaywright();
try {
  const context = await browser.newContext({ viewport: { width, height } });
  const encoder = await context.newPage();
  for (const [index, slide] of slides.entries()) {
    const background = backgrounds.length && !bookendArt.has(slide.id) && index % 2 === 1
      ? backgrounds[Math.floor(index / 2) % backgrounds.length] : undefined;
    const { scene, textIds } = sceneFor(slide, theme, family, bookendArt.get(slide.id), background, nutritionPreview);
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
    <title>${title}</title><style>
    @page{size:${width}px ${height}px;margin:0}body{margin:0}
    section{position:relative;break-after:page}section:last-child{break-after:auto}
    img{display:block;width:${width}px;height:${height}px}
    </style><body>${frames}</body></html>`, { waitUntil: 'load' });
  await page.pdf({ path: path.join(out, 'deck.pdf'), preferCSSPageSize: true, printBackground: true });
} finally {
  await browser.close();
}

await fs.writeFile(path.join(out, 'verification.json'), JSON.stringify({
  width, height, themeSha256: digest(JSON.stringify(theme)), slides: verification,
}, null, 2) + '\n');
await fs.writeFile(path.join(out, 'deck.json'), JSON.stringify({ title, width, height, slides: ids }));
await promisify(execFile)(process.execPath, [path.join(root, 'tools/deck-viewer.mjs'), out]);
// Keep the full-resolution PNGs for export. Embed each presentation frame in
// the viewer's slide data and reuse it for the stage, thumbnails and grid.
const html = await fs.readFile(path.join(out, 'index.html'), 'utf8');
let offline = html
  .replace(/"png":"renders\/([a-z0-9-]+)\.png"/g, (_, id) => '"png":"' + viewerFrames.get(id) + '"')
  .replace(/(src|href)="renders\/([a-z0-9-]+)\.png"/g, (_, attr, id) => `data-frame-${attr}="${id}"`)
  .replace('function show(k)', `
const localFrames = new Map(S.map(slide => [slide.slug, slide.png]));
for (const attr of ['src', 'href']) {
  const key = 'data-frame-' + attr;
  for (const element of document.querySelectorAll('[' + key + ']')) {
    element.setAttribute(attr, localFrames.get(element.getAttribute(key)));
  }
}
function show(k)`)
  .replace('<img id="frame" ', '<img id="frame" src="' + viewerFrames.get(ids[0]) + '" ')
  .replace('<div class="bar">', '<noscript><p>Open the <a href="deck.pdf">PDF edition</a> to view all slides.</p></noscript><div class="bar">');
if (profileLink) {
  const { id, url, x, y, w, h } = profileLink;
  const css = `<style>.stage{position:relative}.profile-link{display:none;position:absolute;left:${100*x/width}%;top:${100*y/height}%;width:${100*w/width}%;height:${100*h/height}%}.stage:has(#frame[alt^="Slide ${id}:"]) .profile-link{display:block}</style>`;
  offline = offline.replace('</head>', css + '</head>').replace('</a></div>\n<p class="caption">',
    `</a><a class="profile-link" href="${url}" aria-label="Noel Saw on LinkedIn"></a></div>\n<p class="caption">`);
}
const viewer = path.join(out, 'deck.html');
await fs.writeFile(viewer, offline);
if (publish) {
  console.log(await publishForReview('layout-engine-deck', [
    path.join(out, 'deck.pdf'), viewer,
  ], { note: `XYZ Layout Engine overview presented by Noel Saw. ${ids.length} slides.` }));
}
