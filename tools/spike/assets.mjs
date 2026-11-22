import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { crc32, inflateSync } from 'node:zlib';
import { readBounded, within, LIMITS } from '../request.mjs';

const ASSETS_DIR = fileURLToPath(new URL('./assets', import.meta.url));

// Narrow v1 PNG subset: committed derivatives are 8-bit RGBA, non-interlaced.
export function inspectPng(png, budget) {
  if (png.length < 45 || !png.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw new Error('Invalid PNG signature/structure');
  let offset = 8, width, height, ended = false, dataStarted = false;
  const compressed = [];
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset), end = offset + 12 + length;
    if (end > png.length) throw new Error('Invalid PNG chunk bounds');
    const type = png.toString('ascii', offset + 4, offset + 8), data = png.subarray(offset + 8, end - 4);
    if (crc32(png.subarray(offset + 4, end - 4)) !== png.readUInt32BE(end - 4)) throw new Error('Invalid PNG checksum');
    if (offset === 8) {
      if (type !== 'IHDR' || length !== 13) throw new Error('Invalid PNG IHDR');
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (!width || !height || width > 8192 || height > 8192 || width * height > LIMITS.assetPixels) throw new Error('PNG dimensions exceed budget');
      if (!data.subarray(8).equals(Buffer.from([8, 6, 0, 0, 0]))) throw new Error('Unsupported PNG; requires non-interlaced 8-bit RGBA');
      if (budget) {
        budget.bytes += png.length; budget.pixels += width * height;
        if (budget.bytes > 35 * 1024 * 1024 || budget.pixels > LIMITS.assetPixels) throw new Error('Aggregate asset budget exceeded');
      }
    } else if (type === 'IDAT' && !ended) { compressed.push(data); dataStarted = true; }
    else if (type === 'IEND' && length === 0 && dataStarted && end === png.length) { ended = true; }
    else throw new Error('Unsupported PNG chunk/order');
    offset = end;
  }
  if (!ended || offset !== png.length) throw new Error('Invalid PNG end');
  const stride = width * 4 + 1, expected = stride * height;
  const pixels = inflateSync(Buffer.concat(compressed), { maxOutputLength: expected });
  if (pixels.length !== expected) throw new Error('Invalid PNG scanline length');
  for (let row = 0; row < height; row++) if (pixels[row * stride] > 4) throw new Error('Invalid PNG filter');
  return { width, height };
}

// Generated raster illustrations (transparent PNG, web-sized copies of the gpt-image originals; see
// assets/SOURCES.md) take precedence over the hand-authored SVG of the same id.
export async function resolveIllustration(id, budget) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid illustration id: ${id}`);
  }
  const web = path.join(ASSETS_DIR, 'generated', 'web', `${id}.png`);
  try {
    const webReal = await fs.realpath(web);
    const expectedRoot = await fs.realpath(path.join(ASSETS_DIR, 'generated', 'web'));
    if (!within(expectedRoot, webReal)) throw new Error('symlink escape rejection');
    const png = await readBounded(webReal, LIMITS.assetBytes, `asset.${id}`);
    inspectPng(png, budget);
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const content = await fs.readFile(path.join(ASSETS_DIR, 'illustrations.svg'), 'utf-8');
  // Simple extraction of <svg id="...">...</svg>
  const regex = new RegExp(`<svg\\s+id="${id}"[^>]*>[\\s\\S]*?<\\/svg>`, 'i');
  const match = content.match(regex);
  if (!match) throw new Error(`Illustration ${id} not found`);
  
  const svg = match[0];
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

export async function getFont() {
  const fontPath = path.join(ASSETS_DIR, 'font.ttf');
  return await fs.readFile(fontPath);
}

// Both pinned weights of Inter 4.0 (same release, OFL-1.1): Regular 400 and Bold 700.
export async function getFonts() {
  return { regular: await getFont(), bold: await fs.readFile(path.join(ASSETS_DIR, 'font-bold.ttf')) };
}
