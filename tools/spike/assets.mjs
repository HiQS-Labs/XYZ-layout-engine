import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ASSETS_DIR = fileURLToPath(new URL('./assets', import.meta.url));

// Generated raster illustrations (transparent PNG, web-sized copies of the gpt-image originals; see
// assets/SOURCES.md) take precedence over the hand-authored SVG of the same id.
export async function resolveIllustration(id) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid illustration id: ${id}`);
  }
  const web = path.join(ASSETS_DIR, 'generated', 'web', `${id}.png`);
  try {
    const webReal = await fs.realpath(web);
    const expectedRoot = await fs.realpath(path.join(ASSETS_DIR, 'generated', 'web'));
    if (!webReal.startsWith(expectedRoot)) throw new Error('symlink escape rejection');

    const png = await fs.readFile(webReal);
    if (png.length > 5 * 1024 * 1024) throw new Error(`PNG too large for ${id}`);
    if (png.length < 24 || png.readUInt32BE(0) !== 0x89504e47 || png.readUInt32BE(4) !== 0x0d0a1a0a) {
      throw new Error(`Invalid PNG signature for ${id}`);
    }
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    if (width > 8192 || height > 8192 || width * height > 16777216) {
      throw new Error(`PNG dimensions too large for ${id}`);
    }
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
