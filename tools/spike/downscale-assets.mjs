// One-time step after generating illustrations: write web-sized copies (longest side 640 px) of
// tools/spike/assets/generated/<id>.png into generated/web/<id>.png, preserving alpha. The 1–3 MB
// originals stay out of git (see .gitignore); their sha256 is recorded in <id>.result.json.
// Uses resvg, already a spike dependency, so no image library is added.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets', 'generated');
const MAX = 640;
await fs.mkdir(path.join(DIR, 'web'), { recursive: true });
for (const f of (await fs.readdir(DIR)).filter(f => f.endsWith('.png')).sort()) {
  const buf = await fs.readFile(path.join(DIR, f));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><image width="${w}" height="${h}" href="data:image/png;base64,${buf.toString('base64')}"/></svg>`;
  const fit = w >= h ? { mode: 'width', value: MAX } : { mode: 'height', value: MAX };
  const out = new Resvg(svg, { fitTo: fit, background: 'rgba(0,0,0,0)' }).render().asPng();
  await fs.writeFile(path.join(DIR, 'web', f), out);
  console.log(`${f}: ${w}x${h} ${buf.length}B -> ${out.readUInt32BE(16)}x${out.readUInt32BE(20)} ${out.length}B`);
}
