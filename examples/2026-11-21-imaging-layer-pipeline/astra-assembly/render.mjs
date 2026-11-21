import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { publishForReview } from '../../../tools/review.mjs';

const local = file => new URL(file, import.meta.url);
const source = local('../../2026-10-13-nutrition-infographic/renders-v4.1/playwright/render-inline.html');
const astra = JSON.parse(await fs.readFile(local('../fixture.json'), 'utf8'));
const recipe = JSON.parse(await fs.readFile(local('recipe.json'), 'utf8'));
if (recipe.showStyleLayer === undefined) recipe.showStyleLayer = false;
if (typeof recipe.autoAssemble !== 'boolean' || typeof recipe.showStyleLayer !== 'boolean' || !Number.isFinite(recipe.holdMs) || recipe.holdMs < 0 ||
    !Number.isFinite(recipe.assemblyMs) || recipe.assemblyMs <= 0) throw Error('Invalid assembly playback settings');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: {width:1000,height:1000}, reducedMotion:'reduce' });
  await page.context().setOffline(true);
  await page.goto(source.href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => img.decode())]));
  const scene = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas');
    const slots = [...canvas.querySelectorAll('img')].map(img => {
      const {x,y,width,height} = img.getBoundingClientRect();
      return {x,y,width,height};
    });
    const fonts = [...document.styleSheets[0].cssRules].filter(r => r.type === CSSRule.FONT_FACE_RULE);
    const regions = ['header','hero','lower','footer','hero_img'].map(id => {
      const {x,y,width,height} = document.getElementById(id).getBoundingClientRect();
      return {id,x,y,width,height};
    });
    const {left,top,width,height} = document.querySelector('#hero_img').style;
    return { poster:canvas.outerHTML, slots, regions, left, top, width, height, fonts:fonts.map(r=>r.cssText).join('\n') };
  });
  const esc = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const values = { ...astra.theme.palette, ...scene, slots:JSON.stringify(scene.slots), recipe:JSON.stringify(recipe),
    jsLeft:parseFloat(scene.left), jsTop:parseFloat(scene.top),
    boxes:scene.regions.map(({id,x,y,width,height}) =>
      `<rect class="${id === 'hero_img' ? 'leaf-box' : 'region-box'}" x="${x}" y="${y}" width="${width}" height="${height}"/>`).join(''),
    title:esc(astra.headline), text:esc(astra.textNote), art:esc(astra.artNote),
    script:await fs.readFile(local('assembly.js'),'utf8') };
  const template = await fs.readFile(local('diagram.html'),'utf8');
  await fs.writeFile(local('index.html'), template.replace(/{{(\w+)}}/g, (_,key)=>values[key]));
  await page.setViewportSize({width:1000,height:850});
  await page.goto(local('index.html').href);
  await page.waitForSelector('[data-ready]');
  await page.addStyleTag({content:'nav{display:none!important}'});
  await page.locator('main').screenshot({path:fileURLToPath(local('assembled.png'))});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(() => draw(0));
  await page.screencast.start({path:fileURLToPath(local('assembly.webm')),size:{width:1000,height:850}});
  await page.evaluate(() => play(settings.holdMs));
  await page.waitForFunction(() => progress === 1, null, {timeout:recipe.holdMs+recipe.assemblyMs+10000});
  // Leave the final composed screen on screen long enough to read.
  await page.waitForTimeout(1500);
  await page.screencast.stop();
  console.log(await publishForReview('imaging-layer-pipeline-astra-assembly',
    ['index.html','assembled.png','assembly.webm'].map(file=>fileURLToPath(local(file))),{note:'Astra’s exploded sheets assemble into the live Fuel Well poster.'}));
} finally {
  await browser.close();
}
