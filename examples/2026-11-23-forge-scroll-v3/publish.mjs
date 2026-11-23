import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publishForReview } from '../../tools/review.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-scroll-'));
try {
  const report = path.join(stage,'results.md');
  const source = await fs.readFile(path.join(root,'results.md'), 'utf8');
  await fs.writeFile(report, source.replace(/\n\[Original judge ballots[^\n]+/, '').replaceAll(/runs\/(opus|neon|sol)\/index\.html/g, '$1.html').replace(' See entries.json for raw judge reasons and source-located answers.', ''));
  const files = [report];
  for (const name of ['opus','neon','sol']) {
    const dest = path.join(stage,name+'.html');
    await fs.copyFile(path.join(root,'runs',name,'index.html'),dest);
    files.push(dest);
  }
  await publishForReview('forge-scroll-v3', files, {note:'Three standalone Forge landing pages and their benchmark results.'});
} finally { await fs.rm(stage,{recursive:true,force:true}); }
