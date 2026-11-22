import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {publishForReview} from '../../tools/review.mjs';

const local = path => new URL(path, import.meta.url);
const html = local('renders-v4/playwright/render-inline.html');
const png = local('renders-v4/playwright/tree-of-life.png');
const tree = await fs.readFile(local('assets/web/tree_of_life.png'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:1000,height:1000}, offline:true});
  await page.goto(local('renders-v4.1/playwright/render-inline.html').href);
  await page.locator('#hero_img').evaluate((img, bytes) => {
    img.src = 'data:image/png;base64,' + bytes;
    img.alt = 'Tree of life with a green canopy, a braided trunk and spreading roots';
    // The tree fills its source frame. Give the canopy and roots clearance inside the original slot.
    img.style.padding = '43px 20px 25px';
    img.style.filter = 'none';
  }, tree.toString('base64'));
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => img.decode())]));
  await fs.writeFile(html, await page.content());
  await page.locator('#canvas').screenshot({path:fileURLToPath(png)});
  await publishForReview('nutrition-tree-of-life', [html,png].map(url=>fileURLToPath(url)),
    {note:'Fuel Well. Live Well. with the tree of life illustration.'});
} finally {
  await browser.close();
}
