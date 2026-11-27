// Matched controls share typography, imagery and dimensions. Only the message varies.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [reference, dest] = process.argv.slice(2);
if (!dest) throw Error('Usage: node controls.mjs nutrition/render.png NEW_DIRECTORY');
const poster = (await fs.readFile(reference)).toString('base64');
const browser = await chromium.launch();
try {
  await fs.mkdir(dest);
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  for (const variant of ['concise', 'dense', 'reversed']) {
    const route = variant === 'reversed' ? 'resvg creates SVG. Satori turns it into PNG.' : 'Satori creates SVG. resvg turns it into PNG.';
    await page.setContent(`<style>*{box-sizing:border-box}body{margin:48px;background:#f5f2e8;color:#153e32;font:30px system-ui}h1{font-size:60px;margin:0 0 44px}img{float:right;width:490px;margin-left:44px}h2{margin:24px 0 5px;font-size:32px}p{margin:0 0 18px}aside{font-size:20px;border-top:1px solid;margin-top:44px;padding-top:15px}</style>
      <h1>Editing Fuel Well</h1><img src="data:image/png;base64,${poster}">
      <h2>Change the headline</h2><p>Edit the headline in the fixture to change the words at the top.</p>
      <h2>Replace the leaf</h2><p>Change the hero illustration ID to swap this artwork.</p>
      <h2>Export the poster</h2><p>${route}</p>
      ${variant === 'dense' ? '<aside>The fixture also sets the subtitle, footer banner, background, panel border, palette, icon IDs, callout titles and food captions. The recipe positions the hero independently of the type. Chromium can lay out the HTML and capture an image.</aside>' : ''}`);
    await page.locator('img').evaluate(img => img.decode());
    await page.screenshot({path:path.join(dest, variant + '.png')});
  }
} finally { await browser.close(); }
