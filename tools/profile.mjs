// Profiling lives outside the canary budget. Every output must be explicitly placed in scratch.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { publishArtifacts, selectedRun } from './render.mjs';
let processRequest, rendererPath;
const io = { assetReadMs: 0, fontReadMs: 0, inputSchemaReadMs: 0, base64EncodeMs: 0 };
const category = file => {
  const name = file instanceof URL ? fileURLToPath(file) : String(file);
  if (name.endsWith('.ttf')) return 'fontReadMs';
  if (/\/assets\//.test(name) && /\.(png|svg)$/.test(name)) return 'assetReadMs';
  if (name.endsWith('.json') && !name.includes('.relay-scratch')) return 'inputSchemaReadMs';
};
// Profiling-only observation of actual filesystem calls; restored when this process exits.
const readFile = fs.readFile.bind(fs);
function observeReads() {
  const bufferString = Buffer.prototype.toString;
  Buffer.prototype.toString = function(...args) {
    if (args[0] !== 'base64') return bufferString.apply(this, args);
    const start = performance.now();
    try { return bufferString.apply(this, args); } finally { io.base64EncodeMs += performance.now() - start; }
  };
  const open = fs.open.bind(fs);
  fs.readFile = async (file, ...args) => {
    const key = category(file), t = performance.now();
    try { return await readFile(file, ...args); } finally { if (key) io[key] += performance.now() - t; }
  };
  fs.open = async (file, ...args) => {
    const key = category(file), t = performance.now(), handle = await open(file, ...args);
    if (key) {
      io[key] += performance.now() - t;
      for (const method of ['stat', 'read', 'close']) {
        const original = handle[method].bind(handle);
        handle[method] = async (...values) => {
          const start = performance.now();
          try { return await original(...values); } finally { io[key] += performance.now() - start; }
        };
      }
    }
    return handle;
  };
}
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const own = fileURLToPath(import.meta.url);
const repo = path.resolve(path.dirname(own), '..');
const fixtures = { nutrition: 'tools/spike/fixture.json', 'solar-system': 'examples/2026-10-08-solar-system/fixture.json' };
async function sample(recipe, format, output) {
  const owned = await fs.mkdtemp(path.join(output, 'sample-'));
  try {
    for (const key of Object.keys(io)) io[key] = 0;
    const start = performance.now();
    const op = await processRequest({ inputPath: fixtures[recipe], recipe, format }, { root: repo });
    const rendered = performance.now();
    const publication = await publishArtifacts(op, 'publication', { root: owned });
    const written = performance.now();
    const folder = selectedRun(publication.root);
    for (const [name, expected] of Object.entries(publication.manifest.digests)) {
      if (digest(await fs.readFile(path.join(folder, name))) !== expected) throw new Error('Published digest mismatch');
    }
    if (!op.request.validation.valid || Object.values(op.result.textBoxes).some(b => b.present && b.overflow)) throw new Error('Geometry verification failed');
    const end = performance.now();
    await fs.rm(publication.root, { recursive: true, force: true });
    return { ...op.timings, ...io, sceneValidateEncodeMs: Math.max(0, op.timings.sceneAssetMs - io.assetReadMs), derivativeTransformMs: 0, renderMs: rendered - start, writeExportMs: written - rendered, verificationMs: end - written, totalMs: end - start, peakNodeRssBytes: process.resourceUsage().maxRSS * 1024, browserRssBytes: null, browserUsed: false, dimensions: [op.request.normalized.width, op.request.normalized.height], digests: op.request.digests, geometrySha256: digest(JSON.stringify(op.result.textBoxes)) };
  } finally { await fs.rm(owned, { recursive: true, force: true }); }
}
function summary(samples) {
  return Object.fromEntries(Object.keys(samples[0]).filter(k => k.endsWith('Ms')).map(k => {
    const mean = samples.reduce((n, s) => n + s[k], 0) / samples.length;
    return [k, { mean, variance: samples.reduce((n, s) => n + (s[k] - mean) ** 2, 0) / samples.length, min: Math.min(...samples.map(s => s[k])), max: Math.max(...samples.map(s => s[k])) }];
  }));
}
async function main() {
  const [mode, recipe, format, output, reference] = process.argv.slice(2);
  if (!['fresh', 'warm', 'sample'].includes(mode) || !fixtures[recipe] || !format || !output) throw new Error('Usage: node tools/profile.mjs fresh|warm recipe format absolute-scratch-directory');
  observeReads();
  const root = await fs.realpath(output);
  rendererPath = reference ? await fs.realpath(reference) : path.join(repo, 'tools/render.mjs');
  ({ processRequest } = await import(rendererPath));
  if (mode === 'sample') { console.log(JSON.stringify(await sample(recipe, format, root))); return; }
  const count = mode === 'fresh' ? 5 : 10, samples = [];
  if (mode === 'warm') {
    const prime = await fs.mkdtemp(path.join(root, 'prime-'));
    try { await sample(recipe, format, prime); } finally { await fs.rm(prime, { recursive: true, force: true }); }
  }
  for (let i = 0; i < count; i++) {
    const childRoot = await fs.mkdtemp(path.join(root, 'profile-'));
    try {
      if (mode === 'fresh') {
        const t = performance.now();
        const child = spawnSync(process.execPath, [own, 'sample', recipe, format, childRoot, rendererPath], { cwd: repo, encoding: 'utf8', timeout: 60000 });
        if (child.status !== 0) throw new Error(child.stderr || 'Profile child failed');
        samples.push({ ...JSON.parse(child.stdout), processTotalMs: performance.now() - t });
      } else samples.push(await sample(recipe, format, childRoot));
    } finally { await fs.rm(childRoot, { recursive: true, force: true }); }
  }
  const versions = {};
  for (const name of ['satori', '@resvg/resvg-js', 'playwright']) versions[name] = JSON.parse(await fs.readFile(path.join(repo, 'node_modules', name, 'package.json'))).version;
  console.log(JSON.stringify({ mode, recipe, format, count, rendererSha256: digest(await readFile(rendererPath)), warmup: mode === 'warm' ? 'one excluded priming sample' : 'none', runtime: process.version, platform: `${process.platform}-${process.arch}`, versions, memoryScope: mode === 'fresh' ? 'isolated sample process peak RSS' : 'isolated warm process lifetime peak RSS including earlier samples', provider: 'not invoked', stages: 'assetReadMs observes open/stat/read/close; base64EncodeMs observes Buffer base64 calls across the operation (overlaps other stages); sceneValidateEncodeMs is sceneAssetMs minus asset reads (PNG validation, base64 encoding and scene construction combined); derivativeTransformMs=0 (direct supplied images); layoutMs includes cold import; rasterMs includes PNG encoding', summary: summary(samples), samples }, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === own) main().catch(e => { console.error(e); process.exitCode = 1; });
