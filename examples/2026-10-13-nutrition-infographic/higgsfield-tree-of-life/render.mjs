import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { publishForReview } from '../../../tools/review.mjs';

const file = name => fileURLToPath(new URL(name, import.meta.url));
let html = await fs.readFile(file('poster.html'), 'utf8');
const pictures = [...html.matchAll(/src="(assets\/[\w-]+\.png)"/g)].map(match => match[1]);
const art = new Set(pictures);
if (pictures.length !== 15 || art.size !== 13) throw Error('Expected 15 picture slots and 13 assets');
const fonts = [...html.matchAll(/url\((barlow-[^)]+)\)/g)].map(match => match[1]);
for (const path of [...art, ...fonts]) {
  const data = await fs.readFile(file(path));
  const mime = path.endsWith('.png') ? 'image/png' : path.endsWith('.ttf') ? 'font/ttf' : 'font/woff2';
  html = html.replaceAll(path, 'data:' + mime + ';base64,' + data.toString('base64'));
}
const license = await fs.readFile(file('OFL.txt'), 'utf8');
html = html.replace('</head>', '<script type="text/plain" id="font-license">' + license + '</script>\n</head>');
const pagePath = file('fuel-well.html');
await fs.writeFile(pagePath, html);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, offline: true });
  await page.goto(new URL('fuel-well.html', import.meta.url).href);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode()));
    if ([...document.images].some(img => !img.src.startsWith('data:image/png;base64,'))) throw Error('Unexpected image source');
    if ([...document.fonts].some(font => font.status !== 'loaded')) throw Error('Font failed to load');
    const outside = [...document.querySelectorAll('h1,h2,span,img')].filter(el => {
      const box = el.getBoundingClientRect();
      return box.x < 0 || box.y < 0 || box.right > 1000.1 || box.bottom > 1000.1;
    });
    if (outside.length) throw Error('Poster overflow ' + outside.map(el => el.id));
  });
  await page.screenshot({ path: file('fuel-well.png') });
} finally {
  await browser.close();
}
await publishForReview('fuel-well-higgsfield-tree-of-life', [pagePath, file('fuel-well.png')], {
  note: 'Fuel Well. Live Well. · Tree of life edition with original Higgsfield illustrations.'
});
