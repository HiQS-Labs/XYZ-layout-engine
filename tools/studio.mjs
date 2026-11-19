// XYZ Studio: a local browser front end for the engine (GH-SPECS-PRD "optional browser preview").
//
//   pnpm studio                     # http://127.0.0.1:4173
//   node tools/studio.mjs --port 5000
//
// One node:http server on 127.0.0.1 only. Every render and save calls the engine's own processRequest,
// publishArtifacts and saveFixture in the CLI's order, so the studio adds no second validation or render path.
// Reads fixtures from examples/, .relay-scratch/ and temp/; writes renders under .relay-scratch/studio/out/
// and saved fixtures only under .relay-scratch/ or temp/ (never examples/). POSTs need the per-process
// token embedded in the page, a JSON body and a loopback Host header (blocks cross-site and DNS-rebinding calls).
// Renders run one at a time. Limit: single user, no auth beyond the token; revisit if it ever binds off-loopback.
import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { processRequest, outputRoot, publishArtifacts, selectedRun } from './render.mjs';
import { within, readBounded, LIMITS, saveFixture, invalid } from './request.mjs';
import { runCLI as catalogCLI } from './catalog.mjs';
import { lintFixture } from './craft-lint.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
process.chdir(ROOT); // engine paths (fonts, recipe assets, output roots) resolve from the repository root

const READ_ROOTS = ['examples', '.relay-scratch', 'temp'];
const WRITE_ROOTS = ['.relay-scratch', 'temp'];
const OUT_ROOT = '.relay-scratch/studio/out';
const RECIPE_BY_ID = { 'nutrition-infographic': 'nutrition', 'solar-system-diagram': 'solar-system', 'recursive-process-diagram': 'recursive-process', 'design-intake': 'design-intake' };
const SKIP_DIRS = new Set(['node_modules', 'runs', 'assets', 'receipts', '.git', 'vendor', 'img']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const STATIC = {
  '/': 'tools/studio/index.html',
  '/studio/app.js': 'tools/studio/app.js',
  '/studio/studio.css': 'tools/studio/studio.css',
  '/vendor/bootstrap.min.css': 'node_modules/bootstrap/dist/css/bootstrap.min.css',
  '/vendor/bootstrap.bundle.min.js': 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  '/fonts/BarlowCondensed-Regular.ttf': 'tools/fonts/barlow-condensed/BarlowCondensed-Regular.ttf',
  '/fonts/BarlowCondensed-Bold.ttf': 'tools/fonts/barlow-condensed/BarlowCondensed-Bold.ttf'
};
const PAGE_CSP = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

const args = process.argv.slice(2);
const PORT = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : process.env.STUDIO_PORT ?? 4173);
const TOKEN = crypto.randomBytes(24).toString('hex');
const HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

const fail = (status, error, details) => Object.assign(new Error(error), { status, details });
const rel = abs => path.relative(ROOT, abs).split(path.sep).join('/');
const recipeFor = fixture => RECIPE_BY_ID[fixture?.id] ?? (Array.isArray(fixture?.planets) ? 'solar-system' : null);
const slugFor = relPath => relPath.replace(/\.json$/, '').replace(/[^A-Za-z0-9_-]+/g, '__');

// A relative path inside one of the allowed roots, resolved through symlinks.
async function allowed(relPath, roots, { mustExist = true } = {}) {
  if (typeof relPath !== 'string' || !relPath || path.isAbsolute(relPath) || relPath.includes('\0')) throw fail(400, 'path must be relative to the repository');
  const abs = path.resolve(ROOT, relPath);
  let real = abs;
  if (mustExist) { try { real = await fs.realpath(abs); } catch { throw fail(404, `not found: ${relPath}`); } }
  else { try { real = path.join(await fs.realpath(path.dirname(abs)), path.basename(abs)); } catch { real = abs; } }
  if (!roots.some(r => within(path.join(ROOT, r), real))) throw fail(403, `outside ${roots.join(', ')}: ${relPath}`);
  return real;
}

async function readFixture(abs) {
  try { return JSON.parse((await readBounded(abs, LIMITS.inputBytes)).toString('utf8')); }
  catch { return null; }
}

async function walk(dir, depth, visit) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (depth > 0 && !SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.staging-') && full !== path.join(ROOT, '.relay-scratch/studio/out')) await walk(full, depth - 1, visit); }
    else if (entry.isFile()) await visit(full, entry.name);
  }
}

async function listFixtures() {
  const found = [];
  for (const root of READ_ROOTS) {
    await walk(path.join(ROOT, root), 5, async (full, name) => {
      if (!name.endsWith('.json') || ['manifest.json', 'result.json', 'provenance.json', 'deck.json'].includes(name)) return;
      const stat = await fs.stat(full);
      if (stat.size > LIMITS.inputBytes) return;
      const fixture = await readFixture(full), recipe = recipeFor(fixture);
      if (recipe) found.push({ path: rel(full), recipe, root, title: fixture.sections?.header?.headline ?? fixture.title ?? fixture.name ?? fixture.meta?.title ?? path.basename(path.dirname(full)), width: fixture.width ?? null, height: fixture.height ?? null });
    });
  }
  return found;
}

// Latest studio run for this fixture, else a committed preview next to it.
async function previewFor(fixturePath) {
  const out = path.join(ROOT, OUT_ROOT, slugFor(fixturePath));
  if (existsSync(path.join(out, 'manifest.json'))) {
    try { const run = selectedRun(out); if (existsSync(path.join(run, 'render.png'))) return { url: '/files/' + rel(path.join(run, 'render.png')), source: 'studio' }; } catch { /* fall through */ }
  }
  // Committed previews, best first: a thumbnail, a publication's current render.png, a loose render.png,
  // then any PNG beside the fixture (e.g. solar-system.png). Only the fixture's own folder is searched.
  const dir = path.dirname(path.join(ROOT, fixturePath));
  if (dir === path.join(ROOT, '.relay-scratch') || dir === path.join(ROOT, 'temp')) return null;
  const thumbs = [], published = [], loose = [];
  await walk(dir, 3, async (full, name) => {
    if (name === 'thumbnail.png') thumbs.push(full);
    else if (name === 'render.png') loose.push(full);
    else if (name === 'manifest.json') { try { const run = selectedRun(path.dirname(full)); if (existsSync(path.join(run, 'render.png'))) published.push(path.join(run, 'render.png')); } catch { /* not a publication */ } }
  });
  const beside = (await fs.readdir(dir)).filter(n => n.endsWith('.png') && !/contact|sheet|layout-engine-reference/.test(n)).sort().map(n => path.join(dir, n));
  const pick = thumbs[0] ?? published[0] ?? loose[0] ?? beside[0];
  return pick ? { url: '/files/' + rel(pick), source: 'committed' } : null;
}

function parseEngineError(error) {
  const m = /^Validation failed: (\[.*\])$/s.exec(error.message);
  if (m) { try { return fail(400, 'Validation failed', JSON.parse(m[1])); } catch { /* not JSON */ } }
  return fail(error.status ?? 500, error.message);
}

// Same render → publish → optional save order as runCLI in tools/render.mjs (lines 533-540), built only from
// that module's exported operations. It is not shared code because render.mjs is a catalog-declared file:
// editing it changes the pinned digest of every published recipe version. Fold this into a shared export the
// next time the recipes are republished.
async function renderAndPublish(req, { destination, save }, options) {
  const operation = await processRequest(req, options);
  const saveOptions = { ...options, recipe: operation.request.normalized.recipe, inputPath: operation.request.normalized.inputPath, input: operation.input };
  const savedTarget = save ? await saveFixture(operation.fixture, save, { ...saveOptions, validateOnly: true }) : undefined;
  const out = await outputRoot(destination, options.root);
  if (savedTarget && within(out, savedTarget)) throw invalid('save', 'fixture must be outside exported folder');
  const publication = await publishArtifacts(operation, out, options);
  const saved = save ? await saveFixture(operation.fixture, save, saveOptions) : undefined;
  return { ...operation.request, publication, ...(saved ? { saved } : {}) };
}

let queue = Promise.resolve();
const serial = fn => { const run = queue.then(fn, fn); queue = run.catch(() => {}); return run; };

function cleanRequest(body) {
  const req = { inputPath: body.inputPath };
  if (body.recipe) req.recipe = String(body.recipe);
  if (body.backend) req.backend = String(body.backend);
  const formats = new Set(String(body.format ?? 'png').split(',').filter(Boolean));
  formats.add('png'); // the preview always shows render.png
  req.format = [...formats].join(',');
  req.edits = Array.isArray(body.edits) ? body.edits.map(e => ({ path: String(e?.path ?? ''), value: e?.value })) : [];
  return req;
}

async function render(body, save) {
  await allowed(body.inputPath, READ_ROOTS);
  const req = cleanRequest(body), destination = `${OUT_ROOT}/${slugFor(body.inputPath)}`, started = performance.now();
  if (save) req.format = 'png';
  const receipt = await serial(() => renderAndPublish(req, { destination, save }, { root: ROOT })).catch(e => { throw parseEngineError(e); });
  const run = receipt.publication.directory;
  return {
    receipt, ms: Math.round(performance.now() - started), run: rel(run),
    files: Object.fromEntries(receipt.publication.manifest.files.filter(f => !f.startsWith('assets/')).map(f => [f, '/files/' + rel(path.join(run, f))])),
    ...(receipt.saved ? { saved: rel(receipt.saved) } : {})
  };
}

const api = {
  'GET /api/fixtures': async () => ({ fixtures: await listFixtures() }),
  'GET /api/recipes': async () => ({ recipes: (await catalogCLI(['list'])).value }),
  'GET /api/fixture': async (_, url) => {
    const relPath = url.searchParams.get('path'), abs = await allowed(relPath, READ_ROOTS), fixture = await readFixture(abs);
    if (!fixture) throw fail(400, 'not a readable JSON fixture');
    const editable = WRITE_ROOTS.some(r => within(path.join(ROOT, r), abs));
    const name = path.basename(relPath);
    const savePath = editable ? relPath : `.relay-scratch/studio/fixtures/${slugFor(relPath)}.json`.replace(/__fixture\.json$/, '.json');
    return { path: relPath, recipe: recipeFor(fixture), fixture, savePath, editableInPlace: editable, name };
  },
  'GET /api/gallery': async () => {
    const fixtures = await listFixtures();
    return { items: await Promise.all(fixtures.map(async f => ({ ...f, preview: await previewFor(f.path) }))) };
  },
  'POST /api/render': body => render(body),
  'POST /api/save': async body => {
    const target = await allowed(body.savePath, WRITE_ROOTS, { mustExist: false });
    if (!target.endsWith('.json')) throw fail(400, 'save path must end in .json');
    if (!WRITE_ROOTS.some(r => within(path.join(ROOT, r), path.dirname(target)))) throw fail(403, 'save path must be inside .relay-scratch/ or temp/');
    await fs.mkdir(path.dirname(target), { recursive: true });
    return render(body, rel(target));
  },
  'POST /api/check': async body => {
    if (body.kind === 'catalog') { const r = await catalogCLI(['verify']); return { kind: 'catalog', ok: r.code === 0, result: r.value }; }
    if (body.kind === 'craft') {
      const fixture = await readFixture(await allowed(body.inputPath, READ_ROOTS));
      if (!fixture) throw fail(400, 'not a readable JSON fixture');
      const result = lintFixture(fixture);
      return { kind: 'craft', ok: result.ok, result };
    }
    throw fail(400, 'unknown check; use catalog or craft');
  }
};

async function readBody(request) {
  if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) throw fail(415, 'send application/json');
  let size = 0; const chunks = [];
  for await (const chunk of request) { size += chunk.length; if (size > 64 * 1024) throw fail(413, 'request body over 64 KB'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw fail(400, 'invalid JSON body'); }
}

function send(response, status, body, type = 'application/json; charset=utf-8', headers = {}) {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', ...headers });
  response.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function serveFile(response, abs, headers = {}) {
  const type = TYPES[path.extname(abs).toLowerCase()];
  if (!type) throw fail(415, 'file type not served');
  send(response, 200, await fs.readFile(abs), type, headers);
}

const server = http.createServer(async (request, response) => {
  try {
    if (!HOSTS.has(request.headers.host)) throw fail(421, 'unexpected Host header');
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === 'GET' && url.pathname === '/') {
      const page = (await fs.readFile(path.join(ROOT, STATIC['/']), 'utf8')).replace('__STUDIO_TOKEN__', TOKEN);
      return send(response, 200, page, TYPES['.html'], { 'content-security-policy': PAGE_CSP });
    }
    if (request.method === 'GET' && STATIC[url.pathname]) return await serveFile(response, path.join(ROOT, STATIC[url.pathname]));
    if (request.method === 'GET' && url.pathname.startsWith('/files/')) {
      const abs = await allowed(decodeURIComponent(url.pathname.slice('/files/'.length)), READ_ROOTS);
      // Rendered HTML is opened as a sandboxed document with no script.
      return await serveFile(response, abs, abs.endsWith('.html') ? { 'content-security-policy': "sandbox; default-src 'self' data:; style-src 'self' 'unsafe-inline' data:; script-src 'none'" } : {});
    }
    const handler = api[`${request.method} ${url.pathname}`];
    if (!handler) throw fail(404, 'not found');
    if (request.method === 'POST') {
      if (request.headers['x-studio-token'] !== TOKEN) throw fail(403, 'missing or wrong studio token; reload the page');
      const origin = request.headers.origin;
      if (origin && !HOSTS.has(origin.replace(/^http:\/\//, ''))) throw fail(403, 'cross-origin request refused');
      return send(response, 200, await handler(await readBody(request), url));
    }
    return send(response, 200, await handler(undefined, url));
  } catch (error) {
    const status = error.status ?? 500;
    if (status >= 500) console.error(error);
    send(response, status, { error: error.message, ...(error.details ? { details: error.details } : {}) });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`XYZ Studio on http://127.0.0.1:${PORT} (reads examples/, .relay-scratch/, temp/; writes .relay-scratch/studio/)`));
