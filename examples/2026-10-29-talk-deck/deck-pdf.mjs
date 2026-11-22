import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
// Optional: one deck.pdf from the ten Satori PNGs, printed by the Chromium that is already installed for Playwright.
// Each page is the slide at its native 1920x1080 pixel size. Chromium stamps creation/modification dates into the PDF,
// so they are replaced by a fixed value of the same length (byte offsets unchanged) to keep the file reproducible.
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const RT=new URL('../../',import.meta.url);
const {chromium}=await import(new URL('node_modules/playwright/index.mjs',RT).href);
const deck=JSON.parse(await fs.readFile(path.join(ROOT,'deck.json'),'utf8'));
const OUT=process.env.OUT_DIR?path.resolve(process.env.OUT_DIR):ROOT;
const pages=[];
for(const slug of deck.slides){
 const png=await fs.readFile(path.join(ROOT,'renders',slug+'.png'));
 pages.push(`<div style="width:${deck.width}px;height:${deck.height}px;break-after:page"><img src="data:image/png;base64,${png.toString('base64')}" width="${deck.width}" height="${deck.height}" style="display:block"></div>`);
}
const html=`<!doctype html><html><head><meta charset="utf-8"><title>${deck.title}</title><style>@page{size:${deck.width}px ${deck.height}px;margin:0}html,body{margin:0}</style></head><body>${pages.join('')}</body></html>`;
const browser=await chromium.launch({headless:true});
let pdf;
try{const page=await browser.newPage();await page.setContent(html,{waitUntil:'load'});pdf=await page.pdf({width:`${deck.width}px`,height:`${deck.height}px`,printBackground:true,preferCSSPageSize:true});}
finally{await browser.close()}
const fixed=Buffer.from(pdf.toString('latin1').replace(/\/(CreationDate|ModDate) \(D:\d{14}[^)]*\)/g,(m,k)=>`/${k} (${'D:20261029000000'.padEnd(m.length-k.length-4)})`),'latin1');
await fs.writeFile(path.join(OUT,'deck.pdf'),fixed);
console.log(`deck.pdf: ${deck.slides.length} pages, ${fixed.length} bytes, sha256 ${crypto.createHash('sha256').update(fixed).digest('hex')}`);
