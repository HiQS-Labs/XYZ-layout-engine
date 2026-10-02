import fs from 'fs/promises';
import path from 'path';

const ASSETS_DIR = new URL('./assets', import.meta.url).pathname;

export async function resolveIllustration(id) {
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
