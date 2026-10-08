import fs from 'fs/promises';
import { performance } from 'perf_hooks';
import { Resvg } from '@resvg/resvg-js';
import { chromium } from 'playwright';
import { createScene } from './scene.mjs';
import { getFont } from './assets.mjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url));

function toHtml(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(toHtml).join('');
  if (!node) return '';
  const { type, props } = node;
  const style = props.style ? Object.entries(props.style).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v}${typeof v === 'number' && k !== 'fontWeight' ? 'px' : ''}`).join(';') : '';
  const attrs = Object.entries(props).filter(([k]) => k !== 'children' && k !== 'style').map(([k,v]) => `${k}="${v}"`).join(' ');
  const children = props.children ? toHtml(props.children) : '';
  if (type === 'img') return `<img style="${style}" ${attrs} />`;
  return `<${type} style="${style}" ${attrs}>${children}</${type}>`;
}

async function runSatori(satori, scene, font, width, height) {
  const start = performance.now();
  const svg = await satori(scene, {
    width, height,
    fonts: [{ name: 'Inter', data: font, weight: 400, style: 'normal' }]
  });
  const renderTime = performance.now() - start;
  
  const resvg = new Resvg(svg, { font: { loadSystemFonts: false } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  return { svg, pngBuffer, time: renderTime };
}

async function runPlaywright(scene, font, width, height) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @font-face {
            font-family: 'Inter';
            src: url(data:font/ttf;base64,${font.toString('base64')});
          }
          * { box-sizing: border-box; } body { margin: 0; }
        </style>
      </head>
      <body>
        ${toHtml(scene)}
      </body>
    </html>
  `;
  
  const start = performance.now();
  await page.setContent(html);
  
  // Collect bounds
  const bounds = await page.evaluate(() => {
    const rects = {};
    for (const el of document.querySelectorAll('[id]')) {
      const r = el.getBoundingClientRect();
      rects[el.id] = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return rects;
  });
  
  const pngBuffer = await page.screenshot({ fullPage: true });
  const renderTime = performance.now() - start;
  
  await browser.close();
  return { pngBuffer, bounds, time: renderTime };
}

async function main() {
  const { default: satori } = await import('satori');

  const fixtureStr = await fs.readFile(new URL('./fixture.json', import.meta.url), 'utf-8');
  const fixture = JSON.parse(fixtureStr);
  const font = await getFont();
  
  const measurements = {};
  const runtime = { satori: { times: [] }, playwright: { times: [] } };
  
  // Warmup Satori
  const baseScene = await createScene(fixture);
  await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  
  // Nutrition renders
  const satoriRes = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  await fs.writeFile(new URL('./output/satori.svg', import.meta.url), satoriRes.svg);
  await fs.writeFile(new URL('./output/satori.png', import.meta.url), satoriRes.pngBuffer);
  
  const playRes = await runPlaywright(baseScene, font, fixture.width, fixture.height);
  await fs.writeFile(new URL('./output/playwright.png', import.meta.url), playRes.pngBuffer);
  
  measurements.baseline = {
    satori: { error: 'Satori does not preserve node IDs in SVG, cannot extract geometry' },
    playwright: { bounds: playRes.bounds }
  };
  
  // Timings
  for (let i=0; i<10; i++) {
    const s = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
    runtime.satori.times.push(s.time);
  }
  for (let i=0; i<10; i++) {
    const p = await runPlaywright(baseScene, font, fixture.width, fixture.height);
    runtime.playwright.times.push(p.time);
  }
  
  // Hero smoke fixture
  const heroFixture = { ...fixture, width: 600, height: 400, sections: { ...fixture.sections, items: [], benefitsPanel: [] } };
  const heroScene = await createScene(heroFixture);
  const heroSatori = await runSatori(satori, heroScene, font, 600, 400);
  await fs.writeFile(new URL('./output/hero-satori.png', import.meta.url), heroSatori.pngBuffer);
  const heroPlay = await runPlaywright(heroScene, font, 600, 400);
  await fs.writeFile(new URL('./output/hero-playwright.png', import.meta.url), heroPlay.pngBuffer);
  
  // Override fixture
  const overFixture = JSON.parse(JSON.stringify(fixture));
  overFixture.sections.header.headline = "Fuel your whole day with balanced nutrition and lasting energy";
  overFixture.sections.header.subtitle = "Fresh whole foods, easy to carry, wherever your busy day takes you";
  const overScene = await createScene(overFixture);
  
  const overSatori = await runSatori(satori, overScene, font, fixture.width, fixture.height);
  const overPlay = await runPlaywright(overScene, font, fixture.width, fixture.height);
  
  measurements.override = {
    satori: { error: 'Satori does not preserve node IDs in SVG, cannot extract geometry' },
    playwright: { bounds: overPlay.bounds }
  };
  
  // Capability probes
  const probeScene = await createScene({...fixture, sections: {...fixture.sections, header: {headline: "café 营养 ⚡", subtitle: "English"}}});
  const probeSatori = await runSatori(satori, probeScene, font, fixture.width, fixture.height);
  const probePlay = await runPlaywright(probeScene, font, fixture.width, fixture.height);
  
  measurements.probes = {
    satori: { error: 'Satori does not preserve node IDs in SVG, cannot extract geometry' },
    playwright: { bounds: probePlay.bounds }
  };
  
  const hashSatori = crypto.createHash('sha256').update(satoriRes.pngBuffer).digest('hex');
  const hashPlay = crypto.createHash('sha256').update(playRes.pngBuffer).digest('hex');
  
  measurements.digests = {
    baseline: { satori: hashSatori, playwright: hashPlay }
  };
  
  await fs.writeFile(new URL('./output/measurements.json', import.meta.url), JSON.stringify(measurements, null, 2));
  await fs.writeFile(new URL('./output/runtime.json', import.meta.url), JSON.stringify(runtime, null, 2));
  
  console.log('Render phase complete');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
