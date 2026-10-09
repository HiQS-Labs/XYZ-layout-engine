// GH-2 regression canaries for the GH-1 renderer spike. Run through `pnpm test` (tools/spike/test/run.mjs),
// which enforces test-budget.json. Plain `test()` only; every name starts with `guards: <failure mode>`.
// Supported host: the recorded darwin-arm64 developer host (see PROJECT/3-COMPLETED/GH-2-REGRESSION-CANARIES.md).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, cpSync, appendFileSync, rmSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processRequest, selectedRun, toDocument, publishArtifacts, outputRoot } from '../../render.mjs';
import { normalizeRequest } from '../../request.mjs';
import { validateNutrition } from '../../recipes/nutrition.mjs';
import { inspectPng } from '../assets.mjs';

const SPIKE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMITTED = path.join(SPIKE, 'output');
const GOLDEN = process.env.SPIKE_GOLDEN_ROOT || COMMITTED;
const FRESH = mkdtempSync(path.join(os.tmpdir(), 'gh2-fresh-'));
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const runDir = root => {
  const dirs = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(d.name)).map(d => d.name).sort();
  assert.ok(dirs.length, `no dated run folder under ${root}`);
  return selectedRun(path.join(root, dirs[dirs.length - 1]));
};
const node = (script, env) => spawnSync(process.execPath, [path.join(SPIKE, script)], { env: { ...process.env, ...env }, encoding: 'utf8', timeout: 50_000 });

test('guards: render pipeline breaks on a clean checkout', async () => {
  const root = path.resolve(SPIKE, '..', '..');
  const srcCheck = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(path.join(SPIKE, 'render.mjs'))}); await import(${JSON.stringify(path.join(root, 'tools/render.mjs'))});`], { env: { ...process.env, SPIKE_OUTPUT_ROOT: FRESH }, encoding: 'utf8' });
  assert.equal(srcCheck.status, 0, srcCheck.stderr);
  assert.deepEqual(readdirSync(FRESH), [], 'imports wrote output');
  const space = path.join(FRESH, 'space path');
  mkdirSync(space);
  cpSync(path.join(root, 'tools'), path.join(space, 'tools'), { recursive: true });
  cpSync(path.join(root, 'package.json'), path.join(space, 'package.json'));
  symlinkSync(path.join(root, 'node_modules'), path.join(space, 'node_modules'), 'dir');
  const cli = (args, env = {}) => spawnSync(process.execPath, [path.join(space, 'tools/render.mjs'), 'tools/spike/fixture.json', '--out', 'local-output', ...args], { cwd: space, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 15_000 });
  const first = cli([]);
  assert.equal(first.status, 0, first.stderr);
  const firstReceipt = JSON.parse(first.stdout);
  assert.equal(firstReceipt.normalized.backend, 'satori');
  assert.equal(firstReceipt.validation.valid, true);
  const local = path.join(space, 'local-output');
  const snapshot = target => {
    const selected = selectedRun(target), manifest = readFileSync(path.join(target, 'manifest.json'));
    const rec = JSON.parse(manifest);
    return { selected, manifest: sha256(manifest), digests: Object.fromEntries(rec.files.map(file => [file, sha256(readFileSync(path.join(selected, file)))])) };
  };
  const beforeSecond = snapshot(local);
  const second = cli(['--format', 'svg']);
  assert.equal(second.status, 0, second.stderr);
  assert.notEqual(snapshot(local).selected, beforeSecond.selected, 'second same-day publication did not advance');
  assert.match(readFileSync(path.join(selectedRun(local), 'render.svg'), 'utf8'), /<svg/);
  const prior = snapshot(local);
  const late = cli([], { RENDER_INJECT_PUBLICATION_FAILURE: '1' });
  assert.equal(late.status, 1, late.stderr);
  assert.match(late.stderr, /injected late publication failure/);
  assert.deepEqual(snapshot(local), prior, 'late failure changed selected manifest or referenced bytes');
  assert.ok(!readdirSync(local).some(f => f.startsWith('.staging-') || f.startsWith('.manifest-')), 'orphan stage/pointer');
  const unknown = cli(['--fallback', 'browser']);
  assert.equal(unknown.status, 1); assert.match(unknown.stderr, /unsupported option/);

  const fixturePath = path.join(SPIKE, 'fixture.json');
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, surprise: 1 }), /surprise/);
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, scale: 0.1 }), /scale/);
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, width: 8192, height: 8192, scale: 0.1 }), /budget/);
  await assert.rejects(normalizeRequest({ inputPath: SPIKE }), /regular file/);
  const tooBig = path.join(space, 'huge.json'); writeFileSync(tooBig, ' '.repeat(262145));
  await assert.rejects(normalizeRequest({ inputPath: tooBig }, { root: space }), /byte budget/);
  symlinkSync(fixturePath, path.join(space, 'escape.json'));
  await assert.rejects(normalizeRequest({ inputPath: 'escape.json' }, { root: space }), /symlink escape/);
  const data = JSON.parse(readFileSync(fixturePath));
  await assert.rejects(validateNutrition({ ...data, surprise: 1 }), /fixture.surprise/);
  await assert.rejects(validateNutrition({ ...data, width: 1000000000 }), /fixture.width/);
  await assert.rejects(validateNutrition({ ...data, theme: { ...data.theme, background: 'red"><script>1</script>' } }), /background/);
  const html = toDocument({ type: 'div', props: { style: { backgroundColor: 'red"><script>1</script>' }, children: 'control' } }, { regular: Buffer.alloc(0), bold: Buffer.alloc(0) }, 100, 100);
  assert.ok(!html.includes('<script>'), 'serializer allows attribute escape');
  const bad = Buffer.alloc(24); Buffer.from('89504e470d0a1a0a', 'hex').copy(bad); bad.writeUInt32BE(1, 16); bad.writeUInt32BE(1, 20);
  assert.throws(() => inspectPng(bad), /Invalid PNG/);
  const validPng = readFileSync(path.join(SPIKE, 'assets/generated/web/balance_scale.png'));
  assert.ok(inspectPng(validPng).width > 0);
  const broken = Buffer.from(validPng); broken[broken.length - 1] ^= 1;
  assert.throws(() => inspectPng(broken), /checksum/);
  const web = path.join(space, 'tools/spike/assets/generated/web');
  mkdirSync(web + '-escape'); writeFileSync(path.join(web + '-escape', 'outside.png'), validPng);
  symlinkSync(path.join(web + '-escape', 'outside.png'), path.join(web, 'linked.png'));
  const assetProbe = spawnSync(process.execPath, ['--input-type=module', '-e', `const {resolveIllustration}=await import(${JSON.stringify(path.join(space, 'tools/spike/assets.mjs'))}); try { await resolveIllustration('linked'); process.exitCode=9; } catch(e) { if(!e.message.includes('symlink escape')) throw e; }`], { encoding: 'utf8' });
  assert.equal(assetProbe.status, 0, assetProbe.stderr);
  await assert.rejects(outputRoot(path.join(SPIKE, 'output')), /read-only/);
  symlinkSync(root, path.join(space, 'output-escape'), 'dir');
  await assert.rejects(outputRoot('output-escape/new-output', space), /symlink escape/);

  // Native browser launch substitution proves owning cleanup on a postlaunch error without leaving Chromium alive.
  const { chromium } = await import('playwright');
  const launch = chromium.launch; let closes = 0;
  chromium.launch = async () => ({ newContext: async () => { throw new Error('injected context failure'); }, close: async () => { closes++; } });
  try { await assert.rejects(processRequest({ inputPath: fixturePath, backend: 'playwright' }), /injected context failure/); assert.equal(closes, 1); }
  finally { chromium.launch = launch; }
  const operation = await processRequest({ inputPath: fixturePath, format: 'html' });
  assert.equal(operation.artifacts[0].mime, 'text/html');
  assert.match(operation.artifacts[0].bytes.toString(), /<!doctype html>/);
  operation.request.validation.valid = false;
  await assert.rejects(publishArtifacts(operation, 'rejected', { root: space }), /cannot publish/);

  const r = node('render.mjs', { SPIKE_OUTPUT_ROOT: FRESH, SPIKE_RENDER_DEADLINE_MS: '40000' });
  assert.equal(r.status, 0, r.stderr.slice(-1000));
  assert.match(r.stdout, /^render: selection /m);
  const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: FRESH });
  assert.equal(v.status, 0, (v.stdout + v.stderr).slice(-1000));
  assert.match(v.stdout, /^VERDICT: PASS$/m);
  console.log('# C1: import/space CLI, admission, HTML, browser cleanup and two-success/late-failure publication controls passed');
});

test('guards: unintended visual or layout drift', () => {
  const fresh = runDir(FRESH), golden = runDir(GOLDEN);
  const fm = JSON.parse(readFileSync(path.join(fresh, 'measurements.json'))), gm = JSON.parse(readFileSync(path.join(golden, 'measurements.json')));
  const keys = m => Object.entries(m.cases).flatMap(([c, per]) => Object.entries(per).flatMap(([b, rec]) => Object.keys(rec.bounds).map(l => `${c}/${b}/${l}`))).sort();
  assert.deepEqual(keys(fm), keys(gm), 'case/backend/label sets differ between fresh and golden runs');
  let compared = 0;
  for (const k of keys(gm)) {
    const [c, b, l] = k.split('/');
    const f = fm.cases[c][b].bounds[l], g = gm.cases[c][b].bounds[l];
    for (const d of ['x', 'y', 'width', 'height']) {
      assert.ok(Number.isFinite(f[d]) && Number.isFinite(g[d]), `${k}.${d} is not finite`);
      assert.ok(Math.abs(f[d] - g[d]) <= 0.5, `${k}.${d} drifted: fresh ${f[d]} vs golden ${g[d]}`);
    }
    compared++;
  }
  assert.ok(compared > 0, 'compared zero boxes');
  console.log(`# C2 geometry: ${compared} boxes compared within 0.5 px`);
  const host = r => { const j = JSON.parse(readFileSync(path.join(r, 'runtime.json'))); return `${j.environment.platform}/${j.environment.arch}/${j.dependencies.chromium?.version}`; };
  if (host(fresh) !== host(golden)) { console.log(`# C2 digests: skipped (host differs: ${host(fresh)} vs ${host(golden)})`); return; }
  const files = readdirSync(golden).filter(f => /\.(png|svg|html)$/.test(f)).sort();
  assert.ok(files.length > 0, 'no golden artifacts to compare');
  for (const f of files) assert.equal(sha256(readFileSync(path.join(fresh, f))), sha256(readFileSync(path.join(golden, f))), `${f} differs from golden`);
  console.log(`# C2 digests: ${files.length} artifacts byte-identical`);
});

test('guards: committed evidence no longer satisfies the gate', () => {
  const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: COMMITTED }); // pinned: an exported override must not redirect this gate
  assert.equal(v.status, 0, `verify on committed evidence exited ${v.status}: ${(v.stdout + v.stderr).slice(-400)}`);
  assert.match(v.stdout, /^VERDICT: PASS$/m);
});

test('guards: the verifier stops detecting tampering', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'gh2-tamper-'));
  try {
    const src = runDir(COMMITTED);
    cpSync(src, path.join(root, path.basename(src)), { recursive: true });
    appendFileSync(path.join(root, path.basename(src), 'satori.png'), 'x');
    const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: root });
    assert.equal(v.status, 1, `tampered evidence was not rejected (exit ${v.status})`);
    assert.match(v.stderr, /does not match the recorded digest/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

after(() => rmSync(FRESH, { recursive: true, force: true }));
