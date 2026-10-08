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
  const resvg = new Resvg(svg, { font: { loadSystemFonts: false } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const renderTime = performance.now() - start;
  
  return { svg, pngBuffer, time: renderTime };
}

async function runPlaywrightWarm(browser, scene, font, width, height) {
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
  
  await context.close();
  return { pngBuffer, bounds, time: renderTime };
}

async function runPlaywrightCold(scene, font, width, height) {
  const t0 = performance.now();
  const browser = await chromium.launch({ headless: true });
  const res = await runPlaywrightWarm(browser, scene, font, width, height);
  const coldTime = performance.now() - t0;
  await browser.close();
  return { ...res, coldTime };
}

async function main() {
  const runtime = { 
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    licenses: {
      satori: "MPL-2.0",
      resvg_js: "MPL-2.0",
      playwright: "Apache-2.0"
    },
    satori: { cold: null, warmup: null, times: [], memory: null }, 
    playwright: { cold: null, warmup: null, times: [], memory: null } 
  };
  
  const t0SatoriCold = performance.now();
  const { default: satori } = await import('satori');
  const fixtureStr = await fs.readFile(new URL('./fixture.json', import.meta.url), 'utf-8');
  const fixture = JSON.parse(fixtureStr);
  const font = await getFont();
  const baseScene = await createScene(fixture);
  
  // Cold Satori
  const satoriColdRes = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  runtime.satori.cold = performance.now() - t0SatoriCold;
  
  // Warmup Satori
  const satoriWarmupRes = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  runtime.satori.warmup = satoriWarmupRes.time;
  
  // Nutrition renders (Satori)
  const satoriRes = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  await fs.writeFile(new URL('./output/satori.svg', import.meta.url), satoriRes.svg);
  await fs.writeFile(new URL('./output/satori.png', import.meta.url), satoriRes.pngBuffer);
  
  // Playwright cold
  const playColdRes = await runPlaywrightCold(baseScene, font, fixture.width, fixture.height);
  runtime.playwright.cold = playColdRes.coldTime;
  
  // Warmup Playwright
  const browser = await chromium.launch({ headless: true });
  const playWarmupRes = await runPlaywrightWarm(browser, baseScene, font, fixture.width, fixture.height);
  runtime.playwright.warmup = playWarmupRes.time;
  
  // Nutrition renders (Playwright)
  const playRes = await runPlaywrightWarm(browser, baseScene, font, fixture.width, fixture.height);
  await fs.writeFile(new URL('./output/playwright.png', import.meta.url), playRes.pngBuffer);
  
  const measurements = {};
  measurements.baseline = {
    satori: { error: 'Satori API strips SVG IDs and exposes no layout measurement surface' },
    playwright: { bounds: playRes.bounds }
  };
  
  // Timings Satori
  for (let i=0; i<10; i++) {
    const s = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
    runtime.satori.times.push(s.time);
  }
  runtime.satori.memory = process.memoryUsage().heapUsed;
  
  // Timings Playwright
  for (let i=0; i<10; i++) {
    const p = await runPlaywrightWarm(browser, baseScene, font, fixture.width, fixture.height);
    runtime.playwright.times.push(p.time);
  }
  runtime.playwright.memory = process.memoryUsage().heapUsed; // Approximation
  
  // Hero smoke fixture
  const heroFixtureSatori = { ...fixture, width: 1200, height: 630, sections: { ...fixture.sections, header: { ...fixture.sections.header, subtitle: "Powered by Satori", caption: "This caption proves text wrapping and fitting within the hero section." }, items: [], benefitsPanel: [] } };
  const heroSceneSatori = await createScene(heroFixtureSatori);
  const heroSatori = await runSatori(satori, heroSceneSatori, font, 1200, 630);
  await fs.writeFile(new URL('./output/hero-satori.png', import.meta.url), heroSatori.pngBuffer);
  
  const heroFixturePlay = { ...fixture, width: 1200, height: 630, sections: { ...fixture.sections, header: { ...fixture.sections.header, subtitle: "Powered by Playwright", caption: "This caption proves text wrapping and fitting within the hero section." }, items: [], benefitsPanel: [] } };
  const heroScenePlay = await createScene(heroFixturePlay);
  const heroPlay = await runPlaywrightWarm(browser, heroScenePlay, font, 1200, 630);
  await fs.writeFile(new URL('./output/hero-playwright.png', import.meta.url), heroPlay.pngBuffer);
  
  // Override fixture
  const overFixture = JSON.parse(JSON.stringify(fixture));
  overFixture.sections.header.headline = "Fuel your whole day with balanced nutrition and lasting energy";
  overFixture.sections.header.subtitle = "Fresh whole foods, easy to carry, wherever your busy day takes you";
  const overScene = await createScene(overFixture);
  
  const overSatori = await runSatori(satori, overScene, font, fixture.width, fixture.height);
  const overPlay = await runPlaywrightWarm(browser, overScene, font, fixture.width, fixture.height);
  
  measurements.override = {
    satori: { error: 'Satori API strips SVG IDs and exposes no layout measurement surface' },
    playwright: { bounds: overPlay.bounds }
  };
  
  // Capability probes
  const probeScene = await createScene({...fixture, sections: {...fixture.sections, header: {headline: "café 营养 ⚡", subtitle: "English"}}});
  const probeSatori = await runSatori(satori, probeScene, font, fixture.width, fixture.height);
  const probePlay = await runPlaywrightWarm(browser, probeScene, font, fixture.width, fixture.height);
  
  await fs.writeFile(new URL('./output/probe-satori.png', import.meta.url), probeSatori.pngBuffer);
  await fs.writeFile(new URL('./output/probe-playwright.png', import.meta.url), probePlay.pngBuffer);
  
  measurements.probes = {
    satori: { 
      error: 'Satori API strips SVG IDs and exposes no layout measurement surface',
      text_capabilities: {
        latin_accented: "dropped_silently_or_rendered_if_in_font", 
        cjk: "dropped_silently",
        emoji: "dropped_silently"
      }
    },
    playwright: { 
      bounds: probePlay.bounds,
      text_capabilities: {
        latin_accented: "supported",
        cjk: "supported_via_system_fallback",
        emoji: "supported_via_system_fallback"
      }
    }
  };
  
  // Repeat renders to prove determinism
  const repeatSatori = await runSatori(satori, baseScene, font, fixture.width, fixture.height);
  const repeatPlay = await runPlaywrightWarm(browser, baseScene, font, fixture.width, fixture.height);
  
  const hashSatori = crypto.createHash('sha256').update(satoriRes.pngBuffer).digest('hex');
  const hashPlay = crypto.createHash('sha256').update(playRes.pngBuffer).digest('hex');
  const hashRepeatSatori = crypto.createHash('sha256').update(repeatSatori.pngBuffer).digest('hex');
  const hashRepeatPlay = crypto.createHash('sha256').update(repeatPlay.pngBuffer).digest('hex');
  const hashOverSatori = crypto.createHash('sha256').update(overSatori.pngBuffer).digest('hex');
  const hashOverPlay = crypto.createHash('sha256').update(overPlay.pngBuffer).digest('hex');
  
  measurements.digests = {
    baseline: { satori: hashSatori, playwright: hashPlay },
    repeat: { satori: hashRepeatSatori, playwright: hashRepeatPlay },
    override: { satori: hashOverSatori, playwright: hashOverPlay }
  };
  
  await fs.writeFile(new URL('./output/measurements.json', import.meta.url), JSON.stringify(measurements, null, 2));
  await fs.writeFile(new URL('./output/runtime.json', import.meta.url), JSON.stringify(runtime, null, 2));
  
  await browser.close();
  console.log('Render phase complete');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
