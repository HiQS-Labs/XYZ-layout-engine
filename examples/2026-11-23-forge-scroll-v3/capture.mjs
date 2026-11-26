import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2]);
const url = pathToFileURL(path.join(dir, 'index.html')).href;
const browser = await chromium.launch();
const receipt = {};
try {
  for (const [name, width, height] of [['desktop',1440,900], ['mobile',390,844]]) {
    const page = await browser.newPage({viewport:{width,height}, deviceScaleFactor:1, serviceWorkers:'block'});
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.route('**/*', route => {
      const target = route.request().url();
      if (target === url || /^(data|blob):/.test(target)) return route.continue();
      errors.push('Nonembedded resource requested');
      return route.abort();
    });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      sections: Array.from(document.querySelectorAll('section')).filter(s=>s.getBoundingClientRect().height>0).length,
      headings: Array.from(document.querySelectorAll('h1,h2'), h=>h.innerText),
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      brokenImages: Array.from(document.images).filter(i=>!i.complete || !i.naturalWidth).length
    }));
    for (const [suffix, fullPage] of [['first',false],['full',true]]) {
      await page.screenshot({path:path.join(dir,name+'-'+suffix+'.png'),fullPage,animations:'disabled'});
    }
    receipt[name] = {...layout, errors};
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(dir,'layout.json'), JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
