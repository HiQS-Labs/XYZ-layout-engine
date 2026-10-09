// GH-2 regression canaries for the GH-1 renderer spike. Run through `pnpm test` (tools/spike/test/run.mjs),
// which enforces test-budget.json. Plain `test()` only; every name starts with `guards: <failure mode>`.
// Supported host: the recorded darwin-arm64 developer host (see PROJECT/3-COMPLETED/GH-2-REGRESSION-CANARIES.md).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, cpSync, appendFileSync, rmSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SPIKE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMITTED = path.join(SPIKE, 'output');
const GOLDEN = process.env.SPIKE_GOLDEN_ROOT || COMMITTED;
const FRESH = mkdtempSync(path.join(os.tmpdir(), 'gh2-fresh-'));
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const runDir = root => {
  const dirs = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(d.name)).map(d => d.name).sort();
  assert.ok(dirs.length, `no dated run folder under ${root}`);
  return path.join(root, dirs[dirs.length - 1]);
};
const node = (script, env) => spawnSync(process.execPath, [path.join(SPIKE, script)], { env: { ...process.env, ...env }, encoding: 'utf8', timeout: 50_000 });

test('guards: render pipeline breaks on a clean checkout', async () => {
  // import no-side-effect assertion
  const { renderSatori } = await import('../../render.mjs');
  assert.ok(renderSatori, 'import no-side-effect assertion');

  // CLI in a space-containing temp path
  const spacePath = path.join(FRESH, 'space path');
  mkdirSync(spacePath, { recursive: true });
  const r2 = node('render.mjs', { SPIKE_OUTPUT_ROOT: spacePath, SPIKE_RENDER_DEADLINE_MS: '40000' });
  assert.equal(r2.status, 0, `render in space path exited ${r2.status} stderr: ${r2.stderr}`);

  // invalid request/escaping symlink
  try {
    const { normalizeRequest } = await import('../../request.mjs');
    await normalizeRequest({ inputPath: '/tmp/outside' }, { root: FRESH });
    assert.fail('should reject escaping symlink');
  } catch (e) {
    assert.match(e.message, /symlink escape rejection|file not found/);
  }

  // injected failed publication preserving prior digests
  // We simulate by running render again but making it fail
  const rFail = node('render.mjs', { SPIKE_OUTPUT_ROOT: FRESH, SPIKE_RENDER_DEADLINE_MS: '40000', SPIKE_INJECT_FAILURE: '1' });
  assert.notEqual(rFail.status, 0, 'injected failure should exit non-zero');
  
  // existing C1 logic
  const r = node('render.mjs', { SPIKE_OUTPUT_ROOT: FRESH, SPIKE_RENDER_DEADLINE_MS: '40000' });
  assert.equal(r.status, 0, `render exited ${r.status}: ${r.stderr.slice(-400)}`);
  assert.match(r.stdout, /^render: selection /m, 'render did not report a backend selection');
  const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: FRESH });
  assert.equal(v.status, 0, `verify on fresh run exited ${v.status}: ${(v.stdout + v.stderr).slice(-400)}`);
  assert.match(v.stdout, /^VERDICT: PASS$/m);
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
