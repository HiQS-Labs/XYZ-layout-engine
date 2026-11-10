// Editorial Asset Provider for XYZ Layout Engine.
// Compiles isolated, high-DPI transparent editorial components (infographics, cards, badges)
// from recipe fixtures for direct embedding into external web applications (React, Next.js, Vite).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeRequest, readBounded, LIMITS } from './request.mjs';
import { renderSatori } from './render.mjs';

export async function exportEditorialAsset(fixturePath, options = {}) {
  const root = options.root ?? process.cwd();
  const resolved = path.resolve(root, fixturePath);
  const raw = await fs.readFile(resolved, 'utf8');
  const fixture = JSON.parse(raw);

  const format = options.format ?? 'png'; // 'png' | 'svg'
  const scale = Number(options.scale ?? 2); // 1 | 2 | 3
  const isTransparent = options.transparent !== false; // default true
  const elementId = options.element ?? null;

  let recipe;
  if (fixture.id === 'design-intake') {
    recipe = await import('./recipes/design-intake.mjs');
  } else if (fixture.id === 'nutrition-infographic') {
    recipe = await import('./recipes/nutrition.mjs');
  } else if (fixture.id === 'solar-system-diagram') {
    recipe = await import('./recipes/solar-system.mjs');
  } else if (fixture.id === 'recursive-process-diagram') {
    recipe = await import('./recipes/recursive-process.mjs');
  } else {
    recipe = await import('./recipes/design-intake.mjs');
  }

  await recipe.validate(fixture, { root });

  const font = recipe.FONT
    ? { regular: await readBounded(recipe.FONT.regular, LIMITS.assetBytes, 'font'), bold: await readBounded(recipe.FONT.bold, LIMITS.assetBytes, 'font') }
    : (await import('./spike/assets.mjs')).getFonts();

  const family = recipe.FONT?.family ?? 'Inter';
  const scene = await recipe.buildScene(fixture, {}, { root });

  if (isTransparent && scene.props?.style) {
    scene.props.style.backgroundColor = 'transparent';
  }

  const { svg } = await renderSatori(scene, font, fixture.width, fixture.height, family, { raster: false });

  let targetSvg = svg;
  let assetWidth = fixture.width;
  let assetHeight = fixture.height;

  if (elementId && Array.isArray(fixture.elements)) {
    const elem = fixture.elements.find(e => e.id === elementId);
    if (!elem) throw new Error(`Element with id '${elementId}' not found in fixture.`);
    assetWidth = elem.width;
    assetHeight = elem.height;

    // Crop via SVG viewBox and dimension override (stripping any existing viewBox)
    targetSvg = svg
      .replace(/\sviewBox="[^"]*"/, '')
      .replace(
        /<svg\b([^>]*?)width="(\d+)"\s+height="(\d+)"([^>]*)>/,
        `<svg$1width="${assetWidth * scale}" height="${assetHeight * scale}" viewBox="${elem.x} ${elem.y} ${assetWidth} ${assetHeight}"$4>`
      );
  } else if (scale !== 1) {
    targetSvg = svg
      .replace(/\sviewBox="[^"]*"/, '')
      .replace(
        /<svg\b([^>]*?)width="(\d+)"\s+height="(\d+)"([^>]*)>/,
        `<svg$1width="${assetWidth * scale}" height="${assetHeight * scale}" viewBox="0 0 ${assetWidth} ${assetHeight}"$4>`
      );
  }

  let outputBuffer;
  if (format === 'svg') {
    outputBuffer = Buffer.from(targetSvg, 'utf8');
  } else {
    const { Resvg } = await import('@resvg/resvg-js');
    const resvg = new Resvg(targetSvg, {
      font: { loadSystemFonts: false }
    });
    outputBuffer = resvg.render().asPng();
  }

  const outPath = options.out
    ? path.resolve(root, options.out)
    : path.resolve(path.dirname(resolved), `${elementId ? `${elementId}-` : ''}asset@${scale}x.${format}`);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, outputBuffer);

  const markup = `<img src="${path.basename(outPath)}" width="${assetWidth}" height="${assetHeight}" alt="${fixture.title ?? 'Editorial Asset'}" loading="lazy" decoding="async" />`;

  return {
    path: outPath,
    format,
    scale,
    width: assetWidth * scale,
    height: assetHeight * scale,
    logicalWidth: assetWidth,
    logicalHeight: assetHeight,
    markup
  };
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2);
  let fixturePath = null, element = null, format = 'png', scale = 2, out = null, transparent = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture' && args[i+1]) { fixturePath = args[++i]; }
    else if (args[i] === '--element' && args[i+1]) { element = args[++i]; }
    else if (args[i] === '--format' && args[i+1]) { format = args[++i]; }
    else if (args[i] === '--scale' && args[i+1]) { scale = Number(args[++i]); }
    else if (args[i] === '--out' && args[i+1]) { out = args[++i]; }
    else if (args[i] === '--opaque') { transparent = false; }
    else if (!fixturePath && !args[i].startsWith('--')) { fixturePath = args[i]; }
  }

  if (!fixturePath) {
    console.error('Usage: node tools/export-editorial-asset.mjs <fixture.json> [--element <id>] [--format png|svg] [--scale 1|2|3] [--out <path>] [--opaque]');
    process.exit(1);
  }

  try {
    const result = await exportEditorialAsset(fixturePath, { element, format, scale, out, transparent });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('export-editorial-asset error:', err.message);
    process.exit(1);
  }
}
