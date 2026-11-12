// The one place a human looks for finished output: REVIEW/<project>/ at the repo root, plus REVIEW/index.html.
// Renderers call publishForReview() as their last step; see REVIEW/README.md for the convention.
// CLI: node tools/review.mjs <project-name> <file> [file ...]   (copies the files, then rebuilds the index)
//      node tools/review.mjs                                   (rebuilds the index only)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const reviewRoot = fileURLToPath(new URL('../REVIEW/', import.meta.url));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isImage = f => /\.(png|jpe?g|webp|svg)$/i.test(f);

// Replace REVIEW/<project>/ with exactly these files, so the folder never holds stale output.
export async function publishForReview(project, files, { note = '' } = {}) {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(project)) throw Error(`review project name "${project}" must be a plain folder name`);
  const dir = path.join(reviewRoot, project);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  for (const f of files) await fs.copyFile(f, path.join(dir, path.basename(f)));
  await fs.writeFile(path.join(dir, 'review.json'), JSON.stringify({ project, note, source: path.relative(path.dirname(reviewRoot), path.dirname(files[0] ?? dir)), files: files.map(f => path.basename(f)) }, null, 2) + '\n');
  await rebuildIndex();
  return dir;
}

export async function rebuildIndex() {
  await fs.mkdir(reviewRoot, { recursive: true });
  const projects = [];
  for (const d of (await fs.readdir(reviewRoot, { withFileTypes: true })).filter(d => d.isDirectory())) {
    const dir = path.join(reviewRoot, d.name), files = (await fs.readdir(dir)).filter(f => f !== 'review.json').sort();
    const meta = JSON.parse(await fs.readFile(path.join(dir, 'review.json'), 'utf8').catch(() => '{}'));
    projects.push({ name: d.name, files, note: meta.note ?? '', mtime: (await fs.stat(dir)).mtimeMs });
  }
  projects.sort((a, b) => b.mtime - a.mtime); // newest first
  const href = (p, f) => `${encodeURIComponent(p)}/${encodeURIComponent(f)}`;
  const body = projects.map(p => {
    // Show previews when a project has them, otherwise every image; link everything.
    const images = p.files.filter(isImage), shown = images.some(f => /preview/i.test(f)) ? images.filter(f => /preview/i.test(f)) : images;
    return `<section><h2>${esc(p.name)}</h2>${p.note ? `<p>${esc(p.note)}</p>` : ''}<div class="shots">${shown.map(f => `<a href="${href(p.name, f)}"><img loading="lazy" src="${href(p.name, f)}" alt="${esc(f)}"></a>`).join('')}</div><p class="files">${p.files.map(f => `<a href="${href(p.name, f)}">${esc(f)}</a>`).join(' · ')}</p></section>`;
  }).join('\n');
  await fs.writeFile(path.join(reviewRoot, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Review</title><style>
body{margin:0;padding:24px 16px;font:16px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#111}@media(prefers-color-scheme:dark){body{background:#151515;color:#eee}a{color:#9cc4ff}}
h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 8px;border-top:2px solid currentColor;padding-top:12px}.shots{display:flex;flex-wrap:wrap;gap:12px}.shots img{max-width:min(100%,640px);max-height:520px;display:block;border:1px solid #8884}.files{font-size:14px;word-break:break-word}
</style><h1>Review</h1><p>${projects.length} project${projects.length === 1 ? '' : 's'}, newest first. Final output only; sources live in each project's own folder.</p>
${body || '<p>Nothing published for review yet.</p>'}
</html>`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [project, ...files] = process.argv.slice(2);
  if (project && !files.length) { console.error('usage: node tools/review.mjs <project-name> <file> [file ...]'); process.exit(2); }
  console.log(project ? await publishForReview(project, files.map(f => path.resolve(f))) : (await rebuildIndex(), path.join(reviewRoot, 'index.html')));
}
