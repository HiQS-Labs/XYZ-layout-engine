import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { publishForReview } from '../../../tools/review.mjs';

const here = name => new URL(name, import.meta.url);
const neon = new URL('../benchmark/runs/gemini-4-neon-xhigh/', import.meta.url);
const recipe = JSON.parse(await fs.readFile(here('recipe.json'), 'utf8'));
if (typeof recipe.entranceAnimation !== 'boolean') throw Error('entranceAnimation must be true or false');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const data = (bytes, mime) => 'data:' + mime + ';base64,' + bytes.toString('base64');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, reducedMotion: 'reduce' });
  await page.context().setOffline(true);
  await page.goto(new URL('output/index.html', neon).href);
  await page.evaluate(() => document.fonts.ready);

  // Reuse Neon's three real planes, dropping measurement annotations at this smaller scale.
  await page.addStyleTag({content: `
    .plane-scale {position:fixed!important;inset:0!important;transform:none!important}
    .p-canvas {border-radius:0;background:transparent!important}
    .p-grid-zone,.p-items-grid {border:5px dashed #76936a}
    .p-css-tag,.p-dim-size,.p-dim-left,.p-dim-top,.p-leaf-frame {display:none!important}
    .p-headline-highlight {background:none;border:none;box-shadow:none}
    html,body {background:transparent!important}
  `});
  await page.evaluate(() => {
    const planes = [...document.querySelectorAll('.plane-scale')];
    if (planes.length !== 3) throw Error('Expected three editable planes in the Neon source');
    document.body.replaceChildren(...planes);
    planes.forEach(plane => plane.style.display = 'none');
  });

  async function texture(src) {
    return page.evaluate(async src => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 540;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', 0.85);
    }, src);
  }
  const images = [];
  for (const plane of await page.locator('.plane-scale').all()) {
    await plane.evaluate(node => node.style.display = 'block');
    images.push(await texture(data(await page.screenshot({omitBackground:true}), 'image/png')));
    await plane.evaluate(node => node.style.display = 'none');
  }
  images.push(await texture(data(await fs.readFile(new URL('nutrition/render.png', neon)), 'image/png')));

  const s = Math.min(recipe.width, recipe.height);
  const tokens = [
    ...Object.entries(recipe.theme.palette).map(([role, color]) => '--' + role + ':' + color),
    ...Object.entries(recipe.theme.type).map(([role, fraction]) => '--' + role + ':' + Math.round(s * fraction) + 'px')
  ].join(';') + ';';
  const motion = step => 'data-step="' + step + '" data-side="' + (step % 2 ? 'right' : 'left') + '" style="--delay:' + step * 330 + 'ms"';
  const stages = recipe.stages.map(({title, caption}, i) => `
    <figure ${motion(i)}>
      <div class="image ${i === 3 ? 'proof' : 'plane'}"><img src="${images[i]}" alt="${esc(title)} of the Fuel Well nutrition poster"></div>
      <figcaption><h2><span class="mark" aria-hidden="true">${i === 3 ? '→' : '0' + (i+1)}</span>${esc(title)}</h2><p>${esc(caption)}</p></figcaption>
    </figure>`).join('');
  const routes = recipe.exports.map(({name, path}, i) => `
    <div class="route" ${motion(4+i)}><strong>${esc(name)}</strong><p>${esc(path)}</p></div>`).join('');
  const font = async weight => data(await fs.readFile(new URL('fonts/BarlowCondensed-' + weight + '.ttf', neon)), 'font/ttf');
  const fields = { title: esc(recipe.title), intro: esc(recipe.intro), motion: recipe.entranceAnimation,
    regular: await font('Regular'), bold: await font('Bold'), stages, routes, tokens, width: recipe.width };
  const html = (await fs.readFile(here('diagram.html'), 'utf8')).replace(/{{(\w+)}}/g, (_, key) => fields[key]);
  await fs.writeFile(here('index.html'), html);
  await page.setViewportSize({width: recipe.width, height: recipe.height});
  await page.goto(here('index.html').href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => img.decode())]));
  await page.screenshot({path:fileURLToPath(here('poster.png'))});
  console.log(await publishForReview('imaging-layer-pipeline-neon-motion',
    ['index.html','poster.png'].map(name => fileURLToPath(here(name))),
    {note:'Neon fork showing the layout, lettering and artwork of the Fuel Well poster.'}));
} finally {
  await browser.close();
}
