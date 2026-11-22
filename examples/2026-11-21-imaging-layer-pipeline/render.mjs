import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { publishForReview } from '../../tools/review.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(dir, '../2026-10-13-nutrition-infographic');
const posterDir = path.join(source, 'renders-v4.1/playwright');
const fixture = JSON.parse(await fs.readFile(path.join(dir, 'fixture.json')));
const nutrition = JSON.parse(await fs.readFile(path.join(source, 'fixture.json')));
const data = async (file, mime) => 'data:' + mime + ';base64,' + (await fs.readFile(file)).toString('base64');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const short = Math.min(fixture.width, fixture.height);
const px = fraction => Math.round(short * fraction) + 'px';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:1000,height:1000}});
  await page.context().setOffline(true);
  await page.goto(new URL('../2026-10-13-nutrition-infographic/renders-v4.1/playwright/render-inline.html', import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  // Preserve real poster coordinates when pulling the lettering away from the art.
  await page.addStyleTag({content:'*{background:transparent!important;border-color:transparent!important}img{visibility:hidden}'});
  const lettering = 'data:image/png;base64,' + (await page.screenshot({omitBackground:true})).toString('base64');
  const art = async id => data(path.join(source,'assets/web',id+'.png'),'image/png');
  const fonts = await Promise.all(['Regular','Bold'].map(weight => data(path.resolve(dir,'../../tools/fonts/barlow-condensed/BarlowCondensed-'+weight+'.ttf'),'font/ttf')));
  const {ink,paper,accent,rule} = fixture.theme.palette;
  const template = await fs.readFile(path.join(dir,'diagram.html'),'utf8');
  const values = {
    width:fixture.width,height:fixture.height,ink,paper,accent,rule,
    regular:fonts[0],bold:fonts[1],display:px(.096),heading:px(.034),body:px(.023),
    title:esc(fixture.headline),text:esc(fixture.textNote),art:esc(fixture.artNote),
    satori:esc(fixture.satoriNote),chromium:esc(fixture.chromiumNote),
    recipe:esc(fixture.recipeNote),output:esc(fixture.outputNote),lettering,
    leaf:await art(nutrition.sections.hero.illustrationId),
    foods:(await Promise.all(nutrition.sections.items.map(async i => '<img alt="" src="'+await art(i.illustrationId)+'">'))).join(''),
    poster:await data(path.join(posterDir,'render.png'),'image/png')
  };
  const html = template.replace(/{{(\w+)}}/g,(_,key) => values[key]);
  const htmlFile = path.join(dir,'index.html'), pngFile = path.join(dir,'poster.png');
  await fs.writeFile(htmlFile,html);
  await page.setViewportSize({width:fixture.width,height:fixture.height});
  await page.goto(new URL('index.html',import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:pngFile});
  await publishForReview('imaging-layer-pipeline',[pngFile,htmlFile],{note:'How XYZ Layout Engine assembles the nutrition poster.'});
} finally {
  await browser.close();
}
