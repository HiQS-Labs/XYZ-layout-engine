import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const packetDir = path.resolve(outputDir, '..');
const read = relative => fs.readFile(path.join(packetDir, relative));
const base64 = bytes => bytes.toString('base64');

const [template, regular, bold, poster, leaf] = await Promise.all([
  read('output/source.html').then(bytes => bytes.toString('utf8')),
  read('fonts/BarlowCondensed-Regular.ttf'),
  read('fonts/BarlowCondensed-Bold.ttf'),
  read('nutrition/render.png'),
  read('nutrition/assets/web/leaf_glow.png'),
]);

const replacements = {
  __FONT_REGULAR__: base64(regular),
  __FONT_BOLD__: base64(bold),
  __POSTER__: base64(poster),
  __LEAF__: base64(leaf),
};
let html = template;
for (const [token, value] of Object.entries(replacements)) html = html.replaceAll(token, value);
if (/__[A-Z_]+__/.test(html)) throw new Error('Unresolved template token');

await fs.writeFile(path.join(outputDir, 'index.html'), html);
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
    offline: true,
  });
  const page = await context.newPage();
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/^https?:/.test(request.url())) externalRequests.push(request.url());
  });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(Array.from(document.images, image => image.decode())));
  await page.screenshot({ path: path.join(outputDir, 'poster.png'), fullPage: false });
  if (errors.length || externalRequests.length) {
    throw new Error(JSON.stringify({ errors, externalRequests }));
  }
  await context.close();
} finally {
  await browser.close();
}

console.log('Built output/index.html and output/poster.png at 1600 × 1200.');
