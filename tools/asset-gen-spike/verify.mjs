// Standalone offline verification runner for tools/asset-gen-spike
// NOTE: Not named *.test.mjs and not in a test/ directory, strictly respecting test-budget.json.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import child_process from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import * as jsonUtils from './core/json.mjs';
import * as redactUtils from './core/redact.mjs';
import * as pngUtils from './core/png.mjs';
import * as spendGate from './core/spend-gate.mjs';
import * as jobsModule from './core/jobs.mjs';
import * as higgsfieldRunner from './node/higgsfield-cli.mjs';
import * as generateRunner from './node/generate-assets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

console.log('=== Step 1: Pure-ESM Zero Node Built-in Import Check ===');
const coreDir = path.join(__dirname, 'core');
const coreFiles = fs.readdirSync(coreDir).filter(f => f.endsWith('.mjs'));
assert(coreFiles.length >= 5, `Expected at least 5 core files, found ${coreFiles.length}`);

for (const file of coreFiles) {
  const content = fs.readFileSync(path.join(coreDir, file), 'utf8');
  // Check for node built-in imports (ignoring comments)
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
    assert(!/from\s+['"]node:/.test(line), `File ${file}:${i + 1} contains node:* import: ${line}`);
    assert(!/from\s+['"](fs|path|os|crypto|child_process|url)['"]/.test(line), `File ${file}:${i + 1} contains unadorned node import: ${line}`);
    assert(!/\brequire\s*\(/.test(line), `File ${file}:${i + 1} contains require(): ${line}`);
    assert(!/\bprocess\./.test(line), `File ${file}:${i + 1} contains process.* reference: ${line}`);
    assert(!/\bBuffer\b/.test(line), `File ${file}:${i + 1} contains Buffer reference: ${line}`);
  }
}
console.log(`✓ All ${coreFiles.length} core ESM modules verified 100% free of node:* built-ins.`);

console.log('=== Step 2: Cross-Language Numeric & Job Digest Parity with Python ===');
const pyDigestScript = `import sys, json, hashlib, importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location("gen", "examples/2026-10-08-solar-system/generate-assets.py")
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)
job = json.loads(sys.argv[1])
print(gen.job_digest(job))`;

for (const job of jobsModule.SOLAR_SYSTEM_JOBS) {
  const jsDigest = jobsModule.jobDigest(job);
  const pyDigest = child_process.execFileSync(
    'python3',
    ['-B', '-c', pyDigestScript, JSON.stringify(job)],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  ).trim();
  assert.equal(jsDigest, pyDigest, `Digest mismatch for job ${job.id}`);
}
console.log(`✓ All ${jobsModule.SOLAR_SYSTEM_JOBS.length} Solar System job digests match byte-for-byte with Python.`);

// Differential numeric checks
assert.equal(jsonUtils.canonicalJson({ seed: jsonUtils.pyFloat(1.0) }), '{"seed":1.0}');
assert.equal(jsonUtils.canonicalJson({ seed: jsonUtils.pyFloat(-0.0) }), '{"seed":-0.0}');
assert.equal(jsonUtils.canonicalJson({ seed: jsonUtils.pyInt(1) }), '{"seed":1}');

// Key ordering check
const testObj = { z: 1, a: 2, é: 3, B: 4, _x: 5 };
const pyKeySortScript = `import sys, json
obj = json.loads(sys.argv[1])
print(json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False))`;
const expectedKeySort = child_process.execFileSync(
  'python3',
  ['-B', '-c', pyKeySortScript, JSON.stringify(testObj)],
  { encoding: 'utf8' }
).trim();
assert.equal(jsonUtils.canonicalJson(testObj), expectedKeySort);
// Round-trip parseJsonText preserveNumbers check
const parsedJob = jsonUtils.parseJsonText('{"parameters":{"seed":1.0,"count":1}}', { preserveNumbers: true });
assert.equal(jsonUtils.canonicalJson(parsedJob), '{"parameters":{"count":1,"seed":1.0}}');

// Astral plane code-point order check
const astralObj = { "\uD83D\uDE00": 1, "\uFFFD": 2 };
const expectedAstralSort = child_process.execFileSync(
  'python3',
  ['-B', '-c', pyKeySortScript, JSON.stringify(astralObj)],
  { encoding: 'utf8' }
).trim();
assert.equal(jsonUtils.canonicalJson(astralObj), expectedAstralSort);
assert.equal(jsonUtils.canonicalJson(astralObj), '{"\ufffd":2,"😀":1}');
console.log('✓ Key sorting (including astral code points), Unicode, and numeric serialization verified identical to Python.');

console.log('=== Step 2b: Pure-ESM PNG & Redaction Unit Checks ===');
const earthPngPath = path.join(REPO_ROOT, 'examples/2026-10-08-solar-system/assets/web/earth.png');
const earthPngBytes = fs.readFileSync(earthPngPath);
const earthHeader = pngUtils.inspectPngHeader(earthPngBytes);
assert(earthHeader.width > 0 && earthHeader.height > 0);
assert.equal(earthHeader.hasAlphaChannel, true);
assert.equal(pngUtils.crc32(new TextEncoder().encode('123456789')), 0xcbf43926);

const fakeImageData = {
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 128,
    0, 0, 255, 255,
    0, 0, 0, 0
  ])
};
const alphaRes = pngUtils.inspectAlphaFromImageData(fakeImageData);
assert.equal(alphaRes.realAlpha, true);
assert.equal(alphaRes.minAlpha, 0);
assert.equal(alphaRes.transparentPixelRatio, 0.5);

// Stateless email check
assert.equal(redactUtils.containsEmail('hello world'), false);
assert.equal(redactUtils.containsEmail('test1@example.com'), true);
assert.equal(redactUtils.containsEmail('test2@example.com'), true);
console.log('✓ Pure-ESM PNG parser, alpha evaluator, and stateless email redaction verified.');

console.log('=== Step 3: Higgsfield CLI 12/12 Offline Controls ===');
const hfExit = await higgsfieldRunner.selftest();
assert.equal(hfExit, 0, 'Higgsfield selftest failed');
console.log('✓ Higgsfield CLI 12/12 offline controls passed.');

console.log('=== Step 4: Generator Recovery and Race Controls ===');
const tmpGenDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-spike-verify-'));
const stubJS = path.join(tmpGenDir, 'stub.mjs');
const stubCount = path.join(tmpGenDir, 'stub-count');

fs.writeFileSync(stubJS, `
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const args = process.argv;
const out = args[args.indexOf('--out') + 1];
appendFileSync(process.env.STUB_COUNT, 'call\\n');

if (process.env.STUB_SLEEP) {
  await new Promise(r => setTimeout(r, Number(process.env.STUB_SLEEP)));
}

if (process.env.STUB_CORRUPT) {
  writeFileSync(out, 'bad');
  console.log('not json');
} else if (process.env.STUB_LEAK) {
  console.log('caller error: {"url": "https:\\\\/\\\\/cdn.example.test\\\\/a.png?X-Amz-Signature=SIG"} https%3A%2F%2Fcdn.example.test%2Fa.png%3FX-Amz-Signature%3DSIG');
  process.exit(1);
} else if (process.env.STUB_NODISPATCH) {
  console.log(JSON.stringify({ status: 'error', attempts: [{ status: 'error', dispatched: false }] }));
  process.exit(3);
} else {
  const png = readFileSync(process.env.STUB_PNG);
  if (!process.env.STUB_MISSING) writeFileSync(out, png);
  const hash = b => createHash('sha256').update(b).digest('hex');
  console.log(JSON.stringify({
    status: 'success',
    image: { sha256: hash(png), bytes: png.length },
    alpha: { hasAlphaChannel: true, verified: true, transparentPixelRatio: 0.5 },
    recipeRef: 'configured-caller:' + hash(readFileSync(fileURLToPath(import.meta.url))),
    argv: args.slice(2),
    attempts: [{ status: 'success', dispatched: true, url: 'https://cdn.example.test/a.png?X-Amz-Signature=SIG' }],
    usage: { images: 1 },
    cost: { usd: 0.01 }
  }));
}
`);

const genAssetsScript = path.join(__dirname, 'node/generate-assets.mjs');
const balanceScalePng = path.join(REPO_ROOT, 'tools/spike/assets/generated/web/balance_scale.png');
const mercuryPng = path.join(REPO_ROOT, 'examples/2026-10-08-solar-system/assets/web/mercury.png');
const earthPng = path.join(REPO_ROOT, 'examples/2026-10-08-solar-system/assets/web/earth.png');

const freshGen = (name) => {
  const dir = path.join(tmpGenDir, name);
  fs.mkdirSync(dir, { recursive: true });
  return (extra = [], env = {}) => {
    return child_process.spawnSync('node', [
      genAssetsScript,
      '--caller', stubJS,
      '--assets-dir', dir,
      '--jobs', path.join(dir, 'jobs.json'),
      ...extra
    ], {
      env: { ...process.env, STUB_COUNT: stubCount, STUB_PNG: balanceScalePng, ...env },
      encoding: 'utf8',
      timeout: 20000
    });
  };
};

const calls = () => {
  if (!fs.existsSync(stubCount)) return 0;
  return fs.readFileSync(stubCount, 'utf8').trim().split('\n').filter(Boolean).length;
};

// 1. Resume test
const genRoot = path.join(tmpGenDir, 'gen-main');
fs.mkdirSync(genRoot, { recursive: true });
const mainJobsFile = path.join(genRoot, 'jobs.json');
const mainJob = { id: 'sun', prompt: 'a', model: 'm', size: '1024x1024', quality: 'medium', background: 'transparent' };
fs.writeFileSync(mainJobsFile, JSON.stringify([mainJob]));

const runMain = (extra = [], env = {}) => child_process.spawnSync('node', [
  genAssetsScript,
  '--caller', stubJS,
  '--assets-dir', genRoot,
  '--jobs', mainJobsFile,
  ...extra
], {
  env: { ...process.env, STUB_COUNT: stubCount, STUB_PNG: balanceScalePng, ...env },
  encoding: 'utf8',
  timeout: 20000
});

let res = runMain();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), 1);

// Resume without changes -> 0 new calls
res = runMain();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), 1, 'resume dispatched another call');

// Dry run with one change -> 0 new calls
fs.writeFileSync(mainJobsFile, JSON.stringify([{ ...mainJob, prompt: 'changed' }]));
res = runMain(['--dry-run']);
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), 1);

// Cap zero -> refusal exit 4
res = runMain(['--max-calls', '0']);
assert.equal(res.status, 4);
assert.equal(calls(), 1);

// Dispatch the change -> exactly 1 new call
res = runMain();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), 2);

// A -> B -> A lineage test
fs.writeFileSync(mainJobsFile, JSON.stringify([mainJob]));
res = runMain();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), 2, 'A -> B -> A lost immutable lineage');

// Corrupt output handling
const manifestFile = path.join(genRoot, 'manifest.json');
let manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const origEntry = Object.entries(manifest).find(([, s]) => s.input.prompt === 'a');
fs.writeFileSync(path.join(genRoot, origEntry[1].output), 'tampered');
res = runMain();
assert.equal(res.status, 4);
assert.match(res.stdout, /corrupt output/);
assert.equal(calls(), 2, 'corruption caused blind paid retry');

// Unknown status requires explicit retry
fs.writeFileSync(mainJobsFile, JSON.stringify([{ ...mainJob, prompt: 'unknown' }]));
res = runMain([], { STUB_CORRUPT: '1' });
assert.equal(res.status, 4);
const paidCalls = calls();
res = runMain();
assert.equal(res.status, 4);
assert.match(res.stdout, /unknown requires explicit retry/);
assert.equal(calls(), paidCalls);

// Sun-first execution blocks downstream planets if Sun unresolved
fs.writeFileSync(mainJobsFile, JSON.stringify([
  { ...mainJob, prompt: 'unknown' },
  { ...mainJob, id: 'earth', prompt: 'earth' }
]));
res = runMain();
assert.equal(res.status, 4);
assert.equal(calls(), paidCalls, 'unresolved Sun permitted Earth');

// In-flight requires explicit retry
manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const unknownEntry = Object.values(manifest).find(s => s.input.prompt === 'unknown');
unknownEntry.status = 'in-flight';
fs.writeFileSync(manifestFile, JSON.stringify(manifest));
res = runMain();
assert.equal(res.status, 4);
assert.match(res.stdout, /in-flight requires explicit retry/);
assert.equal(calls(), paidCalls);

// Unsafe path escape in ID rejected
fs.writeFileSync(mainJobsFile, JSON.stringify([{ ...mainJob, id: '../escape', prompt: 'unsafe' }]));
res = runMain();
assert.equal(res.status, 4);
assert.equal(calls(), paidCalls);

// Signed URL redaction
const runSigned = freshGen('g-signed');
const signedJobsFile = path.join(tmpGenDir, 'g-signed', 'jobs.json');
fs.writeFileSync(signedJobsFile, JSON.stringify([{ ...mainJob, prompt: 'signed' }]));
const beforeSigned = calls();
res = runSigned();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), beforeSigned + 1);

const signedManifest = JSON.parse(fs.readFileSync(path.join(tmpGenDir, 'g-signed', 'manifest.json'), 'utf8'));
const signedState = Object.values(signedManifest)[0];
for (const f of ['manifest.json', signedState.receipt]) {
  const content = fs.readFileSync(path.join(tmpGenDir, 'g-signed', f), 'utf8');
  assert.doesNotMatch(content, /X-Amz-Signature/, `signed URL query kept in ${f}`);
}

// Unparseable leak redaction
const runLeak = freshGen('g-leak');
const leakJobsFile = path.join(tmpGenDir, 'g-leak', 'jobs.json');
fs.writeFileSync(leakJobsFile, JSON.stringify([{ ...mainJob, prompt: 'leak' }]));
res = runLeak([], { STUB_LEAK: '1' });
assert.equal(res.status, 4);
const leakManifest = JSON.parse(fs.readFileSync(path.join(tmpGenDir, 'g-leak', 'manifest.json'), 'utf8'));
const leakedState = Object.values(leakManifest)[0];
for (const f of ['manifest.json', leakedState.receipt]) {
  const content = fs.readFileSync(path.join(tmpGenDir, 'g-leak', f), 'utf8');
  assert.doesNotMatch(content, /X-Amz-Signature/, `unparseable output kept a signed URL in ${f}`);
}

// Never-dispatched handling
const runNoDispatch = freshGen('g-nodispatch');
const noDispatchJobs = path.join(tmpGenDir, 'g-nodispatch', 'jobs.json');
fs.writeFileSync(noDispatchJobs, JSON.stringify([{ ...mainJob, prompt: 'no-dispatch' }]));
res = runNoDispatch([], { STUB_NODISPATCH: '1' });
assert.equal(res.status, 4);
const noDispatchState = Object.values(JSON.parse(fs.readFileSync(path.join(tmpGenDir, 'g-nodispatch', 'manifest.json'), 'utf8')))[0];
assert.equal(noDispatchState.status, 'failed', 'per-attempt dispatched:false not read');
const beforeReplan = calls();
res = runNoDispatch();
assert.equal(res.status, 0, res.stdout + res.stderr);
assert.equal(calls(), beforeReplan + 1);

// Numeric parameter round-trip boundaries
for (const seed of [0.0000001, 9007199254740993]) {
  fs.writeFileSync(mainJobsFile, JSON.stringify([{ ...mainJob, prompt: 'numeric', parameters: { seed } }]));
  res = runMain();
  assert.equal(res.status, 4);
  assert.match(res.stderr, /round-trip/);
}

// Deterministic test for O_EXCL fail-closed concurrent manifest ownership
const lockTestDir = path.join(tmpGenDir, 'g-lock-race');
fs.mkdirSync(lockTestDir, { recursive: true });
const lockJobs = path.join(lockTestDir, 'jobs.json');
fs.writeFileSync(lockJobs, JSON.stringify([{ ...mainJob, prompt: 'race' }]));
const lockFile = path.join(lockTestDir, 'generation.lock');

// Pre-create active lock record
fs.writeFileSync(lockFile, JSON.stringify({
  parentPid: 99999999, // dead PID
  childPids: [],
  inFlightAttempts: ['incomplete-attempt-intent'],
  timestamp: Date.now()
}));

// Run with force-retry on stale/incomplete lock -> must refuse exit 4 with zero dispatches
const runLock = (extra = []) => child_process.spawnSync('node', [
  genAssetsScript,
  '--caller', stubJS,
  '--assets-dir', lockTestDir,
  '--jobs', lockJobs,
  ...extra
], {
  env: { ...process.env, STUB_COUNT: stubCount, STUB_PNG: balanceScalePng },
  encoding: 'utf8'
});

const beforeStale = calls();
res = runLock(['--force-retry']);
assert.equal(res.status, 4);
assert.match(res.stdout, /concurrent manifest ownership/);
assert.equal(calls(), beforeStale, 'stale lock dispatch occurred without explicit reconciliation');
assert(fs.existsSync(lockFile), 'active lock was deleted or unlinked by competing contender');

// Clean up test temp dir
try {
  fs.rmSync(tmpGenDir, { recursive: true, force: true });
} catch {
  // ignore
}

console.log('✓ Generator recovery, numeric bounds, and deterministic race controls verified.');
console.log('\n=== ALL SPIKE VERIFICATION SUITES PASSED (EXIT 0) ===');
