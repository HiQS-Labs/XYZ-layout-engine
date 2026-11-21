#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { buildHtml } from './template.mjs';

const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(OUT_DIR, '..');

async function toDataUri(relPath, mime) {
  const buf = await fs.readFile(path.join(ROOT_DIR, relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function extractInlineIcons(inlineHtml) {
  const allImgs = [...inlineHtml.matchAll(/<img\s+([^>]+)>/g)].map(m => {
    const id = (m[1].match(/id="([^"]+)"/) || [])[1] || null;
    const src = (m[1].match(/src="([^"]+)"/) || [])[1] || '';
    return { id, src };
  });
  const byId = id => allImgs.find(x => x.id === id)?.src ?? '';
  const ornament = allImgs[0]?.src ?? '';
  const heart = allImgs.at(-1)?.src ?? '';
  const benefitIcons = [
    byId('benefit_1_icon'),
    byId('benefit_2_icon'),
    byId('benefit_3_icon'),
    byId('benefit_4_icon'),
  ];
  return { ornament, heart, benefitIcons };
}

async function main() {
  const [captionsRaw, fixtureRaw, inlineHtml, fontRegBuf, fontBoldBuf] = await Promise.all([
    fs.readFile(path.join(OUT_DIR, 'captions.json'), 'utf8'),
    fs.readFile(path.join(ROOT_DIR, 'nutrition/fixture.json'), 'utf8'),
    fs.readFile(path.join(ROOT_DIR, 'nutrition/render-inline.html'), 'utf8'),
    fs.readFile(path.join(ROOT_DIR, 'fonts/BarlowCondensed-Regular.ttf')),
    fs.readFile(path.join(ROOT_DIR, 'fonts/BarlowCondensed-Bold.ttf')),
  ]);

  const captions = JSON.parse(captionsRaw);
  const fixture = JSON.parse(fixtureRaw);
  const { ornament, heart, benefitIcons } = extractInlineIcons(inlineHtml);

  const pngIds = [
    'leaf_glow',
    'balance_scale',
    'skip_spike',
    'parfait_jar',
    'snack_container',
    'chicken_wrap',
    'water_bottle',
  ];
  const pngEntries = await Promise.all(
    pngIds.map(async id => [id, await toDataUri(`nutrition/assets/web/${id}.png`, 'image/png')])
  );
  const renderPng = await toDataUri('nutrition/render.png', 'image/png');

  const browser = await chromium.launch({ headless: true });
  try {
    // 1. Extract an authentic 6x nearest-neighbor pixel zoom of "WELL." from nutrition/render.png
    const cropPage = await browser.newPage();
    const pixelCropPng = await cropPage.evaluate(async src => {
      const img = new Image();
      img.src = src;
      await img.decode();
      // Sample 44x21 native pixels around "WE" of "WELL." in render.png at 4x integer scale
      const sw = 44, sh = 21, scale = 4;
      const sx = 347, sy = 33;
      const c = document.createElement('canvas');
      c.width = sw * scale;
      c.height = sh * scale;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    }, renderPng);
    await cropPage.close();

    const html = buildHtml({
      captions,
      fixture,
      fonts: {
        regular: fontRegBuf.toString('base64'),
        bold: fontBoldBuf.toString('base64'),
      },
      assets: {
        ...Object.fromEntries(pngEntries),
        renderPng,
        pixelCropPng,
        ornament,
        heart,
        benefitIcons,
      },
    });

    const htmlPath = path.join(OUT_DIR, 'index.html');
    const pngPath = path.join(OUT_DIR, 'poster.png');
    await fs.writeFile(htmlPath, html, 'utf8');

    // 2. Render output/index.html in an offline-locked 1600x1200 Chromium viewport
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1,
      javaScriptEnabled: false,
    });
    await context.route('**/*', route => route.abort());
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map(img => (img.complete ? Promise.resolve() : img.decode()))
      );
    });

    const pngBytes = await page.screenshot({
      clip: { x: 0, y: 0, width: 1600, height: 1200 },
      fullPage: false,
    });
    await fs.writeFile(pngPath, pngBytes);
    await context.close();

    console.log(
      JSON.stringify(
        {
          ok: true,
          html: 'output/index.html',
          htmlBytes: Buffer.byteLength(html),
          png: 'output/poster.png',
          pngBytes: pngBytes.length,
          width: 1600,
          height: 1200,
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
