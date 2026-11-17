// Node 22 ESM asset generation runner replicating generate-assets.py
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import { inspectPng } from '../../spike/assets.mjs';

import {
  SOLAR_SYSTEM_JOBS,
  SOLAR_SYSTEM_SUBJECTS,
  ATTEMPT_DIR,
  neverDispatched,
  validateManifestMap,
  jobDigest,
  admitJobs
} from '../core/jobs.mjs';
import { canonicalJson, parseJsonText, sha256Sync, PyNumber } from '../core/json.mjs';
import { receiptTextSolar, redactSolar } from '../core/redact.mjs';
import { acquireLock } from './lock.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../../examples/2026-10-08-solar-system');

export function atomicWrite(targetPath, text) {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  const tempPath = path.join(dir, `.tmp-${crypto.randomUUID()}`);
  try {
    const fd = fs.openSync(tempPath, 'w');
    fs.writeFileSync(fd, text, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.renameSync(tempPath, targetPath);
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore
    }
  }
}

export function readManifestInternal(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return {};
  }
  const stat = fs.lstatSync(manifestPath);
  if (stat.isSymbolicLink()) {
    throw new Error('unsafe manifest symlink; reconcile before dispatch');
  }
  if (stat.size > 8 * 1024 * 1024) {
    throw new Error('unsafe manifest or manifest byte budget exceeded');
  }
  const text = fs.readFileSync(manifestPath, 'utf8');
  const data = JSON.parse(text);
  validateManifestMap(data);
  return data;
}

export function readManifest(manifestPath) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  return readManifestInternal(manifestPath);
}

export function updateManifest(manifestPath, digest, updates) {
  const manifest = readManifestInternal(manifestPath);
  if (!manifest[digest]) {
    manifest[digest] = {};
  }
  Object.assign(manifest[digest], updates);
  atomicWrite(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest[digest];
}

export function validateOutput(outPath, receiptPath, state = null, background = 'transparent', expectedRecipe = null, maxAttempts = 1, deadline = null) {
  try {
    for (const p of [outPath, receiptPath]) {
      if (!fs.existsSync(p)) return false;
      const stat = fs.lstatSync(p);
      if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 35 * 1024 * 1024) {
        return false;
      }
    }
    const receiptText = fs.readFileSync(receiptPath, 'utf8');
    const result = JSON.parse(receiptText);
    if (!result || typeof result !== 'object') return false;

    const attempts = result.attempts;
    const count = Array.isArray(attempts) ? attempts.length : attempts;
    if (
      (expectedRecipe !== null && result.recipeRef !== expectedRecipe) ||
      typeof count !== 'number' ||
      typeof count === 'boolean' ||
      count < 1 ||
      count > maxAttempts
    ) {
      return false;
    }

    const image = result.image || {};
    const outBytes = fs.readFileSync(outPath);
    const digest = sha256Sync(outBytes);
    const outStat = fs.statSync(outPath);

    if (
      (result.status !== 'success' && result.status !== 'ok') ||
      image.sha256 !== digest ||
      image.bytes !== outStat.size
    ) {
      return false;
    }

    if (state) {
      const receiptBytes = fs.readFileSync(receiptPath);
      const receiptDigest = sha256Sync(receiptBytes);
      if (state.image_sha256 && state.image_sha256 !== digest) return false;
      if (state.receipt_sha256 && state.receipt_sha256 !== receiptDigest) return false;
    }

    if (background === 'transparent') {
      const alpha = result.alpha || {};
      if (
        !alpha ||
        alpha.verified !== true ||
        alpha.hasAlphaChannel !== true ||
        typeof alpha.transparentPixelRatio !== 'number' ||
        alpha.transparentPixelRatio <= 0 ||
        alpha.transparentPixelRatio > 1
      ) {
        return false;
      }
    }

    // Authoritative PNG validation reusing tools/spike/assets.mjs (inspectPng) + @resvg/resvg-js
    const { width, height } = inspectPng(outBytes);
    if (background === 'transparent') {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><image width='${width}' height='${height}' href='data:image/png;base64,${outBytes.toString('base64')}'/></svg>`;
      const pixels = new Resvg(svg).render().pixels;
      let transparent = false;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 255) {
          transparent = true;
          break;
        }
      }
      if (!transparent) return false;
    }

    if (deadline && Date.now() / 1000 >= deadline) return false;
    return true;
  } catch {
    return false;
  }
}

export function runJob(job, digest, manifestPath, assetsDir, caller, timeout, maxBudget = null, deadline = null, maxAttempts = 1, callerManifest = null, lockHandle = null) {
  const state = readManifest(manifestPath)[digest] || {};
  if (state.status === 'complete') {
    return validateOutput(
      path.join(assetsDir, state.output),
      path.join(assetsDir, state.receipt),
      state,
      job.background,
      job._recipe_ref,
      maxAttempts,
      deadline
    );
  }
  if (state.status && state.status !== 'pending') {
    console.log(`${job.id}: unresolved state requires explicit retry`);
    return false;
  }

  const nowSec = Date.now() / 1000;
  const remaining = deadline ? Math.min(timeout, deadline - nowSec) : timeout;
  if (remaining <= 0) {
    console.log('whole-run deadline exceeded before dispatch');
    return false;
  }

  if (maxBudget !== null) {
    const records = Object.values(readManifest(manifestPath));
    const costs = [];
    for (const v of records) {
      if (v.cost) costs.push(v.cost);
      if (Array.isArray(v.history)) {
        for (const h of v.history) {
          if (h && h.cost) costs.push(h.cost);
        }
      }
    }
    const spent = costs.reduce((acc, c) => (c && typeof c.usd === 'number' ? acc + c.usd : acc), 0);
    if (spent >= maxBudget) {
      console.log('observable cost budget exceeded before dispatch');
      return false;
    }
  }

  const attemptUuid = crypto.randomUUID().replace(/-/g, '');
  const attemptDir = path.join(assetsDir, `${job.id}_${digest}_${attemptUuid}`);
  fs.mkdirSync(attemptDir, { recursive: true });

  const out = path.join(attemptDir, 'image.png');
  const receipt = path.join(attemptDir, 'receipt.json');

  const args = ['image', '--prompt', job.prompt, '--out', out];
  for (const field of ['model', 'size', 'quality', 'background']) {
    args.push(`--${field}`, job[field]);
  }
  if (callerManifest) {
    if (sha256Sync(fs.readFileSync(callerManifest)) !== job._manifest_sha256) {
      throw new Error('caller manifest changed after admission');
    }
    args.push('--manifest', callerManifest);
  }
  if (sha256Sync(fs.readFileSync(caller)) !== job._caller_sha256) {
    throw new Error('caller changed after admission');
  }

  const refs = job.references || [];
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const ext = path.extname(ref);
    const snapshot = path.join(attemptDir, `reference-${i}${ext}`);
    const refBytes = fs.readFileSync(ref);
    if (refBytes.length > 35 * 1024 * 1024) {
      throw new Error('reference grew after admission');
    }
    fs.writeFileSync(snapshot, refBytes);
    if (sha256Sync(refBytes) !== job.reference_digests[i]) {
      throw new Error('reference changed after admission');
    }
    args.push('--reference', snapshot);
  }

  const params = job.parameters || {};
  const sortedParamKeys = Object.keys(params).sort();
  for (const k of sortedParamKeys) {
    const val = params[k];
    const text = typeof val === 'string' ? val : JSON.stringify(val);
    args.push('--param', `${k}=${text}`);
  }

  updateManifest(manifestPath, digest, {
    status: 'in-flight',
    output: path.relative(assetsDir, out),
    receipt: path.relative(assetsDir, receipt)
  });

  const startMonotonic = Date.now();
  if (lockHandle) {
    lockHandle.registerAttempt(attemptUuid);
  }

  let child;
  let stdoutBuf = '';
  let stderrBuf = '';
  let timedOut = false;

  try {
    const timeLimitMs = Math.max(1, Math.floor(remaining * 1000));
    child = child_process.spawn('node', [caller, ...args], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (lockHandle && child.pid) {
      lockHandle.registerChild(child.pid);
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
      }
    }, timeLimitMs);

    child.stdout.on('data', d => { stdoutBuf += d.toString(); });
    child.stderr.on('data', d => { stderrBuf += d.toString(); });

    const exitPromise = new Promise(resolve => {
      child.on('close', code => {
        clearTimeout(timer);
        resolve(code);
      });
      child.on('error', () => {
        clearTimeout(timer);
        resolve(1);
      });
    });

    const exitCode = child_process.spawnSync ? null : null; // async wrapper
    // Wait for exit synchronously
    const code = child_process.execSync ? null : null;
  } catch (err) {
    updateManifest(manifestPath, digest, {
      status: 'unknown',
      reason: 'caller or receipt interrupted; explicit reconciliation required'
    });
    return false;
  }
}

// Synchronous and async execution wrapper
export function executeJobSync(job, digest, manifestPath, assetsDir, caller, timeout, maxBudget = null, deadline = null, maxAttempts = 1, callerManifest = null, lockHandle = null) {
  const state = readManifest(manifestPath)[digest] || {};
  if (state.status === 'complete') {
    return validateOutput(
      path.join(assetsDir, state.output),
      path.join(assetsDir, state.receipt),
      state,
      job.background,
      job._recipe_ref,
      maxAttempts,
      deadline
    );
  }
  if (state.status && state.status !== 'pending') {
    console.log(`${job.id}: unresolved state requires explicit retry`);
    return false;
  }

  const nowSec = Date.now() / 1000;
  const remaining = deadline ? Math.min(timeout, deadline - nowSec) : timeout;
  if (remaining <= 0) {
    console.log('whole-run deadline exceeded before dispatch');
    return false;
  }

  if (maxBudget !== null) {
    const records = Object.values(readManifest(manifestPath));
    const costs = [];
    for (const v of records) {
      if (v.cost) costs.push(v.cost);
      if (Array.isArray(v.history)) {
        for (const h of v.history) {
          if (h && h.cost) costs.push(h.cost);
        }
      }
    }
    const spent = costs.reduce((acc, c) => (c && typeof c.usd === 'number' ? acc + c.usd : acc), 0);
    if (spent >= maxBudget) {
      console.log('observable cost budget exceeded before dispatch');
      return false;
    }
  }

  const attemptUuid = crypto.randomUUID().replace(/-/g, '');
  const attemptDir = path.join(assetsDir, `${job.id}_${digest}_${attemptUuid}`);
  fs.mkdirSync(attemptDir, { recursive: true });

  const out = path.join(attemptDir, 'image.png');
  const receipt = path.join(attemptDir, 'receipt.json');

  const args = ['image', '--prompt', job.prompt, '--out', out];
  for (const field of ['model', 'size', 'quality', 'background']) {
    args.push(`--${field}`, job[field]);
  }
  if (callerManifest) {
    if (sha256Sync(fs.readFileSync(callerManifest)) !== job._manifest_sha256) {
      throw new Error('caller manifest changed after admission');
    }
    args.push('--manifest', callerManifest);
  }
  if (sha256Sync(fs.readFileSync(caller)) !== job._caller_sha256) {
    throw new Error('caller changed after admission');
  }

  const refs = job.references || [];
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const ext = path.extname(ref);
    const snapshot = path.join(attemptDir, `reference-${i}${ext}`);
    const refBytes = fs.readFileSync(ref);
    if (refBytes.length > 35 * 1024 * 1024) {
      throw new Error('reference grew after admission');
    }
    fs.writeFileSync(snapshot, refBytes);
    if (sha256Sync(refBytes) !== job.reference_digests[i]) {
      throw new Error('reference changed after admission');
    }
    args.push('--reference', snapshot);
  }

  const params = job.parameters || {};
  const sortedParamKeys = Object.keys(params).sort();
  for (const k of sortedParamKeys) {
    const val = params[k];
    const text = typeof val === 'string' ? val : JSON.stringify(val);
    args.push('--param', `${k}=${text}`);
  }

  updateManifest(manifestPath, digest, {
    status: 'in-flight',
    output: path.relative(assetsDir, out),
    receipt: path.relative(assetsDir, receipt)
  });

  const startMonotonic = Date.now();
  if (lockHandle) {
    lockHandle.registerAttempt(attemptUuid);
  }

  const timeLimitMs = Math.max(1, Math.floor(remaining * 1000));
  const res = child_process.spawnSync('node', [caller, ...args], {
    timeout: timeLimitMs,
    encoding: 'utf8',
    killSignal: 'SIGKILL'
  });

  if (res.error && res.error.code === 'ETIMEDOUT') {
    atomicWrite(receipt, receiptTextSolar(res.stdout || ''));
    updateManifest(manifestPath, digest, {
      status: 'unknown',
      reason: 'timeout; reconcile saved output before explicit retry'
    });
    return false;
  }

  const text = receiptTextSolar(res.stdout || '');
  atomicWrite(receipt, text);

  let result = null;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('invalid receipt');
  }
  if (!result || typeof result !== 'object') {
    throw new Error('invalid receipt');
  }

  const attempts = result.attempts;
  const count = Array.isArray(attempts) ? attempts.length : attempts;
  const valid =
    res.status === 0 &&
    typeof count === 'number' &&
    typeof count !== 'boolean' &&
    count >= 1 &&
    count <= maxAttempts &&
    validateOutput(out, receipt, null, job.background, job._recipe_ref, maxAttempts, deadline) &&
    result.recipeRef === job._recipe_ref;

  const status = valid ? 'complete' : (neverDispatched(result) ? 'failed' : 'unknown');
  updateManifest(manifestPath, digest, {
    status,
    exit: res.status,
    latency_seconds: (Date.now() - startMonotonic) / 1000,
    attempts: attempts,
    usage: result.usage,
    cost: result.cost,
    image_sha256: fs.existsSync(out) ? sha256Sync(fs.readFileSync(out)) : null,
    receipt_sha256: sha256Sync(fs.readFileSync(receipt)),
    stage_metrics: 'unavailable from configured caller'
  });

  if (!valid) {
    console.log(`${job.id}: corrupt output or unresolved caller result; inspect immutable receipt`);
  }
  return valid;
}

export function generate(jobList, assetsDir, caller, options = {}) {
  const {
    maxCalls = 11,
    forceRetry = false,
    timeout = 220,
    maxBudget = null,
    maxWorkers = 3,
    runTimeout = 900,
    maxAttempts = 1,
    dryRun = false
  } = options;

  const deadline = (Date.now() / 1000) + runTimeout;
  const assetsDirPath = path.resolve(assetsDir);
  fs.mkdirSync(assetsDirPath, { recursive: true });

  if (
    typeof maxCalls !== 'number' || maxCalls < 0 || maxCalls > 32 ||
    typeof maxWorkers !== 'number' || maxWorkers < 1 || maxWorkers > 3 ||
    maxAttempts !== 1 ||
    typeof timeout !== 'number' || timeout <= 0 || timeout > 900 ||
    typeof runTimeout !== 'number' || runTimeout <= 0 || runTimeout > 3600 ||
    (maxBudget !== null && (!Number.isFinite(maxBudget) || maxBudget < 0))
  ) {
    throw new Error('invalid call/worker/attempt/deadline/budget bounds');
  }

  const callerPath = path.resolve(caller);
  if (!fs.existsSync(callerPath)) {
    throw new Error('configured caller must be a regular file');
  }
  const callerStat = fs.lstatSync(callerPath);
  if (callerStat.isSymbolicLink() || !callerStat.isFile()) {
    throw new Error('configured caller must be a regular file');
  }

  const lockPath = path.join(assetsDirPath, 'generation.lock');
  const lock = acquireLock(lockPath);
  if (!lock) {
    console.log('concurrent manifest ownership; safely refusing');
    return false;
  }

  try {
    const callerBytes = fs.readFileSync(callerPath);
    const callerSha256 = sha256Sync(callerBytes);
    const callerManifestPath = path.join(path.dirname(path.dirname(callerPath)), 'assets', 'image-manifest.json');
    let manifestBytes = null;
    let callerManifestRef = null;
    if (fs.existsSync(callerManifestPath)) {
      manifestBytes = fs.readFileSync(callerManifestPath);
      callerManifestRef = callerManifestPath;
    }

    const referenceStats = new Map();
    for (const j of jobList) {
      for (const ref of j.references || []) {
        if (!referenceStats.has(ref)) {
          if (typeof ref !== 'string' || !path.isAbsolute(ref)) {
            referenceStats.set(ref, { isAbsolute: false });
            continue;
          }
          try {
            const lstat = fs.lstatSync(ref);
            referenceStats.set(ref, {
              isAbsolute: true,
              isFile: lstat.isFile(),
              isSymlink: lstat.isSymbolicLink(),
              size: lstat.size,
              sha256: sha256Sync(fs.readFileSync(ref))
            });
          } catch {
            referenceStats.set(ref, { isAbsolute: true, isFile: false });
          }
        }
      }
    }

    const admitted = admitJobs(jobList, callerSha256, manifestBytes, referenceStats);
    if (Date.now() / 1000 >= deadline) {
      console.log('whole-run deadline exceeded during admission');
      return false;
    }

    const manifestPath = path.join(assetsDirPath, 'manifest.json');
    const manifest = readManifest(manifestPath);
    const planned = [];

    for (const job of admitted) {
      const refDigests = (job.references || []).map(r => referenceStats.get(r)?.sha256 || '');
      job.reference_digests = refDigests;
      const digest = jobDigest(job, refDigests);
      const state = manifest[digest] || {};
      const status = state.status;

      if (status && !['pending', 'in-flight', 'complete', 'unknown', 'failed'].includes(status)) {
        throw new Error('unknown manifest state; reconcile before dispatch');
      }

      // Check existing attempt directories
      if (!status && !forceRetry) {
        const attemptPrefix = `${job.id}_${digest}_`;
        const dirEntries = fs.readdirSync(assetsDirPath);
        const hasAttempt = dirEntries.some(name => {
          if (name.startsWith(attemptPrefix)) {
            const stat = fs.statSync(path.join(assetsDirPath, name));
            return stat.isDirectory() && ATTEMPT_DIR.test(name);
          }
          return false;
        });
        if (hasAttempt) {
          console.log(`${job.id}: attempt folders exist but the manifest has no record; restore manifest.json or reconcile before --force-retry`);
          return false;
        }
      }

      if (status === 'complete') {
        const paths = [state.output || '', state.receipt || ''];
        if (!paths.every(p => p && !path.isAbsolute(p) && !p.includes('..') && path.resolve(assetsDirPath, p).startsWith(assetsDirPath))) {
          throw new Error('unsafe manifest artifact path');
        }
        if (validateOutput(path.join(assetsDirPath, paths[0]), path.join(assetsDirPath, paths[1]), state, job.background, job._recipe_ref, maxAttempts, deadline)) {
          continue;
        }
        if (!forceRetry) {
          console.log(`${job.id}: corrupt output requires explicit replacement`);
          return false;
        }
      } else if (['in-flight', 'unknown'].includes(status) && !forceRetry) {
        console.log(`${job.id}: ${status} requires explicit retry`);
        return false;
      } else if (status === 'failed') {
        const receipt = path.join(assetsDirPath, state.receipt || '');
        if (
          !fs.existsSync(receipt) ||
          sha256Sync(fs.readFileSync(receipt)) !== state.receipt_sha256 ||
          !neverDispatched(JSON.parse(fs.readFileSync(receipt, 'utf8')))
        ) {
          throw new Error('failed state lacks authoritative non-dispatch receipt');
        }
      }

      planned.push([job, digest]);
    }

    console.log(planned.length ? `Planned calls: ${planned.length}` : '0 planned calls.');
    if (planned.length > maxCalls) {
      console.log('Cap exceeded; zero dispatches');
      return false;
    }
    console.log('Provider price/stage metrics unavailable before dispatch; call cap is hard, dollar cap observes recorded cost only.');

    if (Date.now() / 1000 >= deadline) {
      console.log('whole-run deadline exceeded before dispatch');
      return false;
    }

    if (dryRun || planned.length === 0) {
      return true;
    }

    for (const [job, digest] of planned) {
      const prior = manifest[digest] || {};
      const history = (prior.history || []).slice();
      if (Object.keys(prior).length > 0) {
        const snapshot = { ...prior };
        delete snapshot.history;
        history.push(snapshot);
      }
      updateManifest(manifestPath, digest, {
        status: 'pending',
        job_id: job.id,
        input: job,
        history,
        cost: null
      });
    }

    const sunIndex = planned.findIndex(([j]) => j.id === 'sun');
    if (sunIndex !== -1) {
      const sunItem = planned[sunIndex];
      const sunOk = executeJobSync(
        sunItem[0],
        sunItem[1],
        manifestPath,
        assetsDirPath,
        callerPath,
        timeout,
        maxBudget,
        deadline,
        maxAttempts,
        callerManifestRef,
        lock
      );
      if (!sunOk) {
        console.log('Sun validation failed. Halting batch.');
        return false;
      }
      planned.splice(sunIndex, 1);
    }

    const outcomes = [];
    for (const [job, digest] of planned) {
      const ok = executeJobSync(
        job,
        digest,
        manifestPath,
        assetsDirPath,
        callerPath,
        timeout,
        maxBudget,
        deadline,
        maxAttempts,
        callerManifestRef,
        lock
      );
      outcomes.push(ok);
      if (!ok) break;
    }

    return outcomes.every(Boolean);
  } finally {
    lock.release();
  }
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const args = process.argv.slice(2);
  const getOpt = (name, fallback = null) => {
    const idx = args.indexOf(name);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : fallback;
  };
  const hasFlag = name => args.includes(name);

  try {
    const caller = getOpt('--caller', process.env.HIQS_CHAIN_CALLER);
    if (!caller) {
      throw new Error('HIQS_CHAIN_CALLER not set');
    }
    const assetsDir = getOpt('--assets-dir', path.join(ROOT, 'assets'));
    const jobsFile = getOpt('--jobs');
    let jobList = SOLAR_SYSTEM_JOBS;
    if (jobsFile) {
      jobList = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
    }

    const maxCalls = parseInt(getOpt('--max-calls', '11'), 10);
    const maxBudget = getOpt('--max-budget') !== null ? parseFloat(getOpt('--max-budget')) : null;
    const timeout = parseFloat(getOpt('--timeout', '220'));
    const runTimeout = parseFloat(getOpt('--run-timeout', '900'));
    const maxAttempts = parseInt(getOpt('--max-attempts', '1'), 10);
    const maxWorkers = parseInt(getOpt('--max-workers', '3'), 10);
    const forceRetry = hasFlag('--force-retry');
    const dryRun = hasFlag('--dry-run');

    const ok = generate(jobList, assetsDir, caller, {
      maxCalls,
      maxBudget,
      timeout,
      runTimeout,
      maxAttempts,
      maxWorkers,
      forceRetry,
      dryRun
    });
    process.exit(ok ? 0 : 4);
  } catch (err) {
    console.error(err.message);
    process.exit(4);
  }
}
