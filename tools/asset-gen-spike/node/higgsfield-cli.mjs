// Node 22 ESM Higgsfield CLI runner replicating higgsfield-cli-spike.py
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  CAP_CREDITS,
  BASELINE_CREDITS,
  CLI_TIMEOUT_S,
  CREATE_TIMEOUT_S,
  CLEAN_FAILURES,
  JOB_TYPE,
  creditsOf,
  gateAllows,
  spendTotal,
  baselineCredits,
  estSumOf,
  checkHiggsfieldJob,
  goEligible,
  jobFields,
  planLedgerRows
} from '../core/spend-gate.mjs';
import { parseJsonText, canonicalJson, sha256Sync, compareCodePoints } from '../core/json.mjs';
import {
  redactSecrets,
  redactHiggsfield,
  scrubObj,
  urlNoQuery,
  excerpt,
  containsEmail
} from '../core/redact.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../../examples/2026-10-09-cell-division');
const REPO = path.resolve(ROOT, '../..');
const LEDGER = path.join(ROOT, 'cli-spike-ledger.jsonl');
const INSPECTOR = path.join(ROOT, 'inspect-alpha.mjs');

const INTER =
  'A single isolated animal cell in interphase, clean scientific illustration: a round cell with one large ' +
  'nucleus containing a nucleolus, a few mitochondria and soft cytoplasm, flat clean style, soft lighting, ' +
  'subject only on a transparent background, no backdrop, no shadow, no text, no labels';
const CYTO =
  'Two animal daughter cells at the end of cell division (cytokinesis), joined by a narrow pinched bridge, each ' +
  'with a round nucleus and a few mitochondria, clean scientific illustration, flat clean style, soft lighting, ' +
  'subject only on a transparent background, no backdrop, no shadow, no text, no labels';

export function jobParams(variant, quality, background, prompt) {
  return {
    prompt,
    variant,
    quality,
    resolution: '1k',
    aspect_ratio: '1:1',
    background
  };
}

export const MATRIX = [
  ['T1-smoke-interphase', jobParams('flare', 'low', 'transparent', INTER)],
  ['T2-cytokinesis', jobParams('flare', 'low', 'transparent', CYTO)],
  ['T3-sunburst-interphase', jobParams('sunburst', 'low', 'transparent', INTER)],
  ['T4-flare-medium-interphase', jobParams('flare', 'medium', 'transparent', INTER)],
  ['C1-flare-opaque-interphase', jobParams('flare', 'low', 'opaque', INTER)]
];

export const SMOKE = {
  label: 'T1-smoke-interphase',
  job_id: '13dd16ee-df0c-4d00-8ec6-fc4eac5965a8',
  sha256: 'ebe91c71dd84c22eae2274276ee95f62031bbba2d912e3e3e61fd93cb2938961',
  bytes: 1203763,
  est_credits: 0.25,
  balance_after: 700.75
};

export class Refuse extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export class Stop extends Error {}
export class Offline extends Error {}

export function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function formatJsonPy(obj) {
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(formatJsonPy).join(', ')}]`;
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort(compareCodePoints);
    return `{${keys.map(k => `${JSON.stringify(k)}: ${formatJsonPy(obj[k])}`).join(', ')}}`;
  }
  return JSON.stringify(obj);
}

export function say(obj, stream = process.stdout) {
  const text = typeof obj === 'string' ? obj : formatJsonPy(obj);
  const redacted = redactHiggsfield(text);
  stream.write(redacted + '\n');
}

export class Ledger {
  constructor(ledgerPath) {
    this.path = path.resolve(ledgerPath);
  }

  rows() {
    if (!fs.existsSync(this.path)) return [];
    const text = fs.readFileSync(this.path, 'utf8');
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => parseJsonText(l));
  }

  append(row) {
    const enriched = scrubObj({ ts: nowIso(), ...row });
    const line = JSON.stringify(enriched);
    if (containsEmail(line)) {
      throw new Error('refusing to write an email address to the ledger');
    }
    const dir = path.dirname(this.path);
    fs.mkdirSync(dir, { recursive: true });
    const fd = fs.openSync(this.path, 'a');
    fs.writeSync(fd, line + '\n', null, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    return enriched;
  }
}

export async function exclusiveLock(ledgerPath, callback) {
  const lockPath = ledgerPath.replace(/\.jsonl$/, '') + '.lock';
  let fd;
  try {
    fd = fs.openSync(lockPath, 'wx');
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Refuse(5, `another process holds ${path.basename(lockPath)}; refusing to start (one process at a time)`);
    }
    throw err;
  }
  try {
    return await callback();
  } finally {
    try {
      fs.closeSync(fd);
    } catch {
      // ignore
    }
    try {
      fs.unlinkSync(lockPath);
    } catch {
      // ignore
    }
  }
}

export function cliBin() {
  if (process.env.HIGGSFIELD_CLI_SPIKE_OFFLINE !== '1') {
    return 'higgsfield';
  }
  const b = process.env.HIGGSFIELD_BIN || '';
  const fakeDir = process.env.HIGGSFIELD_CLI_SPIKE_FAKE_DIR;
  if (!fakeDir || !path.isAbsolute(b) || !path.resolve(b).startsWith(path.resolve(fakeDir))) {
    throw new Offline(`offline guard: refusing to run ${b}; only the selftest fake may run`);
  }
  return b;
}

export function cli(args, timeout) {
  const p = child_process.spawnSync(cliBin(), args, {
    timeout: timeout * 1000,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (p.error && p.error.code === 'ETIMEDOUT') {
    throw new Error('cli timed out');
  }
  return { status: p.status, stdout: p.stdout || '', stderr: p.stderr || '' };
}

export function paramArgs(p) {
  return [
    '--prompt', p.prompt,
    '--variant', p.variant,
    '--quality', p.quality,
    '--resolution', p.resolution,
    '--aspect_ratio', p.aspect_ratio,
    '--background', p.background
  ];
}

export async function realFetch(url) {
  if (process.env.HIGGSFIELD_CLI_SPIKE_OFFLINE === '1') {
    throw new Offline(`offline guard blocked a download of ${urlNoQuery(url)}`);
  }
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, contentType: res.headers.get('content-type'), data: buf };
}

export function runInspector(filePath) {
  const p = child_process.spawnSync('node', [INSPECTOR, filePath], {
    timeout: 180000,
    encoding: 'utf8'
  });
  const lines = (p.stdout || '').split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) {
    throw new Error(`inspector exit ${p.status}: ${(p.stderr || '').slice(-500)}`);
  }
  return JSON.parse(lines[lines.length - 1]);
}

export class Runner {
  constructor(ledgerPath = LEDGER, rawDir = null, fetchFn = realFetch, inspectorFn = runInspector, createTimeout = CREATE_TIMEOUT_S) {
    this.ledger = new Ledger(ledgerPath);
    const raw = path.resolve(rawDir || path.join(os.tmpdir(), 'higgsfield-cli-raw'));
    if (raw === REPO || raw.startsWith(REPO + path.sep)) {
      throw new Refuse(1, `raw download dir must be outside the repository: ${raw}`);
    }
    this.rawDir = raw;
    this.fetch = fetchFn;
    this.inspector = inspectorFn;
    this.createTimeout = createTimeout;
  }

  cost(params) {
    let res;
    try {
      res = cli(['generate', 'cost', JOB_TYPE, ...paramArgs(params), '--json'], CLI_TIMEOUT_S);
    } catch (e) {
      throw new Stop(`generate cost failed: ${e.message}`);
    }
    if (res.status !== 0) {
      throw new Stop(`generate cost exited ${res.status}: ${excerpt(res.stderr || res.stdout)}`);
    }
    try {
      return creditsOf(res.stdout, true);
    } catch (e) {
      throw new Stop(`generate cost gave no usable price (${e.message}): ${excerpt(res.stdout)}`);
    }
  }

  balance() {
    let res;
    try {
      res = cli(['account', 'status', '--json'], CLI_TIMEOUT_S);
    } catch (e) {
      throw new Stop(`account status failed: ${e.message}`);
    }
    if (res.status !== 0) {
      throw new Stop(`account status exited ${res.status}`);
    }
    try {
      return creditsOf(res.stdout, false);
    } catch (e) {
      throw new Stop(`account status gave no usable balance (${e.message})`);
    }
  }

  gate(params, rows) {
    const est = this.cost(params);
    const bal = this.balance();
    const base = baselineCredits(rows);
    const spent = Math.round((base - bal) * 1e6) / 1e6;
    const estSum = estSumOf(rows);
    const total = spendTotal(spent, estSum, est);
    const g = {
      est_credits: est,
      balance_before: bal,
      baseline_credits: base,
      spent_by_balance: spent,
      est_sum_before: estSum,
      total_if_run: total,
      cap_credits: CAP_CREDITS
    };
    return { allows: gateAllows(total), g };
  }

  balanceAfter(before) {
    try {
      const after = this.balance();
      return { balance_after: after, measured_credits: Math.round((before - after) * 1e6) / 1e6 };
    } catch (e) {
      return { balance_after: null, balance_after_error: e.message };
    }
  }

  stop(label, attempt, message, extra = {}) {
    this.ledger.append({
      event: 'stopped',
      phase: 'create',
      label,
      attempt_id: attempt,
      final_status: 'ambiguous',
      error: message,
      ...extra
    });
    throw new Stop(
      `${label}: ambiguous create outcome, not retried; run stopped. ${message}. ` +
      `Check the Higgsfield history and balance before any further paid call.`
    );
  }

  async runLabel(label, params) {
    let check;
    try {
      check = this.gate(params, this.ledger.rows());
    } catch (e) {
      this.ledger.append({ event: 'stopped', phase: 'gate', label, error: e.message });
      throw e;
    }
    const { allows, g } = check;
    if (!allows) {
      this.ledger.append({ event: 'refused', label, params, ...g });
      throw new Refuse(
        3,
        `spend gate: max(spent by balance ${g.spent_by_balance}, sum of estimates ` +
        `${g.est_sum_before}) + estimate ${g.est_credits} = ${g.total_if_run} is over the ` +
        `cap of ${CAP_CREDITS} credits; ${label} not created`
      );
    }
    const attempt = crypto.randomUUID();
    this.ledger.append({
      event: 'reserve',
      label,
      attempt_id: attempt,
      job_type: JOB_TYPE,
      params,
      ...g
    });
    say({ label, step: 'reserved', est_credits: g.est_credits, total_if_run: g.total_if_run });

    let res;
    try {
      res = cli(['generate', 'create', JOB_TYPE, ...paramArgs(params), '--wait', '--json'], this.createTimeout);
    } catch (e) {
      this.stop(label, attempt, `create could not be run: ${e.message}`);
    }
    if (res.status !== 0) {
      this.stop(label, attempt, `create exited ${res.status}: ${excerpt(res.stderr || res.stdout)}`);
    }

    let jobs;
    try {
      jobs = parseJsonText(res.stdout);
    } catch {
      this.stop(label, attempt, `create output is not JSON: ${excerpt(res.stdout)}`);
    }
    if (!Array.isArray(jobs) || jobs.length !== 1 || !jobs[0] || typeof jobs[0] !== 'object') {
      this.stop(label, attempt, `expected a JSON list holding one job: ${excerpt(res.stdout)}`);
    }
    const job = jobs[0];
    const status = job.status;
    if (status !== 'completed' && !CLEAN_FAILURES.has(status)) {
      this.stop(label, attempt, `create returned status '${status}', not completed`, { job_id: job.id });
    }

    const row = {
      event: 'result',
      label,
      attempt_id: attempt,
      params_requested: params,
      ...jobFields(job),
      est_credits: g.est_credits,
      balance_before: g.balance_before
    };
    const { echoedBackground, flags } = checkHiggsfieldJob(params, job);
    row.echoed_background = echoedBackground;
    row.flags = flags;

    if (status === 'completed') {
      await this.downloadAndInspect(label, job, row);
    } else {
      flags.push('not_completed');
    }
    Object.assign(row, this.balanceAfter(g.balance_before));
    row.go_eligible = goEligible(params, row);
    this.ledger.append(row);

    say({
      label,
      step: 'result',
      final_status: status,
      flags,
      real_alpha: row.inspection?.real_alpha,
      go_eligible: row.go_eligible,
      measured_credits: row.measured_credits
    });
  }

  async downloadAndInspect(label, job, row) {
    const url = job.result_url;
    if (typeof url !== 'string' || !url.startsWith('https://')) {
      row.flags.push('no_https_result_url');
      return;
    }
    row.result_url = urlNoQuery(url);
    let status, contentType, data, error = null;
    try {
      const resp = await this.fetch(url);
      status = resp.status;
      contentType = resp.contentType;
      data = resp.data;
      if (status !== 200 || !data || data.length === 0 || data.length > 64 * 1024 * 1024) {
        error = `download HTTP ${status}`;
      }
    } catch (e) {
      error = `${e.name || 'Error'}: ${e.message}`;
    }

    if (error) {
      row.download_error = excerpt(error);
      row.flags.push('download_failed');
      return;
    }

    fs.mkdirSync(this.rawDir, { recursive: true });
    let ext = '.png';
    try {
      ext = path.extname(new URL(url).pathname).toLowerCase() || '.bin';
    } catch {
      // ignore
    }
    const cleanId = String(job.id || 'noid').slice(0, 8);
    const fileName = `${label}-${cleanId}${ext}`.replace(/[^A-Za-z0-9._-]+/g, '-');
    const outFile = path.join(this.rawDir, fileName);
    fs.writeFileSync(outFile, data);

    row.file = fileName;
    row.bytes = data.length;
    row.sha256 = sha256Sync(data);
    row.content_type = contentType;

    try {
      row.inspection = this.inspector(outFile);
    } catch (e) {
      row.inspection_error = excerpt(e.message);
      row.flags.push('inspection_failed');
    }
  }
}

export async function runCmd(runner, only = null, dryRun = false) {
  if (only && !MATRIX.some(([l]) => l === only)) {
    throw new Refuse(1, `unknown label ${only}; known: ${MATRIX.map(([l]) => l).join(', ')}`);
  }
  const rows = runner.ledger.rows();
  const { todo, skipped } = planLedgerRows(rows, MATRIX, only);
  for (const [label, why] of skipped) {
    say({ label, skipped: why });
  }

  if (dryRun) {
    const bal = runner.balance();
    const base = baselineCredits(rows);
    const spent = Math.round((base - bal) * 1e6) / 1e6;
    const estSum = estSumOf(rows);
    let running = spendTotal(spent, estSum, 0.0);
    say({
      dry_run: true,
      baseline_credits: base,
      balance: bal,
      spent_by_balance: spent,
      est_sum: estSum,
      counted_spent: running,
      cap_credits: CAP_CREDITS
    });
    for (const [label, params] of todo) {
      const est = runner.cost(params);
      running = spendTotal(running, running, est);
      say({
        label,
        would_run: true,
        est_credits: est,
        projected_total: running,
        gate_allows: gateAllows(running)
      });
    }
    return 0;
  }

  for (const [label, params] of todo) {
    await runner.runLabel(label, params);
  }
  say({ run: 'done', ran: todo.map(([l]) => l), skipped: skipped.map(([l]) => l) });
  return 0;
}

export function initLedger(ledger, smokeJson, smokePng, inspector = runInspector) {
  if (ledger.rows().length > 0) {
    throw new Refuse(1, 'the ledger already has rows; init-ledger only writes the first two');
  }
  const jobs = parseJsonText(fs.readFileSync(smokeJson, 'utf8'));
  if (!Array.isArray(jobs) || jobs.length !== 1 || !jobs[0] || typeof jobs[0] !== 'object') {
    throw new Refuse(1, 'smoke JSON must be a list holding one job');
  }
  const job = jobs[0];
  const data = fs.readFileSync(smokePng);
  const sha = sha256Sync(data);
  if (job.id !== SMOKE.job_id || sha !== SMOKE.sha256 || data.length !== SMOKE.bytes) {
    throw new Refuse(1, 'smoke files do not match the recorded job id, sha256 and size');
  }

  const [label, params] = MATRIX[0];
  const echoed = job.params || {};
  const sent = {
    prompt: echoed.prompt,
    variant: echoed.model,
    quality: echoed.quality,
    resolution: echoed.resolution,
    aspect_ratio: echoed.aspect_ratio,
    background: echoed.background
  };
  if (JSON.stringify(sent) !== JSON.stringify(params)) {
    throw new Refuse(1, 'the smoke job parameters differ from the T1 matrix entry');
  }

  ledger.append({
    event: 'baseline',
    credits: BASELINE_CREDITS,
    note: 'Account balance before the first CLI generation, read by the orchestrator with `higgsfield account status --json` (credits only recorded).'
  });

  const row = {
    event: 'result',
    label,
    attempt_id: null,
    params_requested: params,
    ...jobFields(job),
    est_credits: SMOKE.est_credits,
    balance_before: BASELINE_CREDITS,
    balance_after: SMOKE.balance_after,
    measured_credits: Math.round((BASELINE_CREDITS - SMOKE.balance_after) * 1e6) / 1e6,
    result_url: urlNoQuery(job.result_url),
    file: path.basename(smokePng),
    bytes: data.length,
    sha256: sha,
    content_type: null,
    note: 'Smoke call run by the orchestrator with `higgsfield generate create ... --wait --json` before this runner existed; recorded by init-ledger. Price from `generate cost` (0.25); content type not captured at download.'
  };
  const { echoedBackground, flags } = checkHiggsfieldJob(params, job);
  row.echoed_background = echoedBackground;
  row.flags = flags;
  row.inspection = inspector(smokePng);
  row.go_eligible = goEligible(params, row);
  ledger.append(row);

  say({
    init_ledger: ledger.path,
    baseline: BASELINE_CREDITS,
    label,
    real_alpha: row.inspection?.real_alpha,
    go_eligible: row.go_eligible
  });
  return 0;
}

export async function exitCode(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Refuse) {
      say(`REFUSED (exit ${err.code}): ${err.message}`, process.stderr);
      return err.code;
    }
    if (err instanceof Stop || err instanceof Offline) {
      say(`STOPPED (exit 4): ${err.message}`, process.stderr);
      return 4;
    }
    say(err.stack || err.message, process.stderr);
    return 1;
  }
}

// ---------------------------------------------------- Selftest
export const SHIM_CODE = `#!/usr/bin/env python3
import json, os, sys, time
here = os.path.dirname(os.path.abspath(__file__))
scn_path, log_path = os.path.join(here, 'scenario.json'), os.path.join(here, 'calls.jsonl')
scn = json.load(open(scn_path))
args = sys.argv[1:]
kind = {('generate', 'cost'): 'cost', ('generate', 'create'): 'create', ('account', 'status'): 'account'}.get(tuple(args[:2]), 'other')
with open(log_path, 'a') as f:
    f.write(json.dumps({'kind': kind, 'args': args}) + '\\n')
opt = lambda name: args[args.index(name) + 1] if name in args else None
if kind == 'cost':
    r = scn['cost']
    sys.stdout.write(r if isinstance(r, str) else json.dumps({'credits': r}))
    sys.exit(scn.get('cost_rc', 0))
if kind == 'account':
    r = scn['balance']
    if isinstance(r, str):
        sys.stdout.write(r)
    else:
        doc = {'credits': r, 'subscription_plan_type': 'starter'}
        if scn.get('email'):
            doc['email'] = scn['email']
        sys.stdout.write(json.dumps(doc))
    sys.exit(0)
if kind == 'create':
    mode = scn.get('create', 'completed')
    if mode == 'sleep':
        time.sleep(5)
    if mode == 'exit1':
        sys.exit(1)
    if mode == 'leaky':
        sys.stderr.write(scn['stderr'])
        sys.exit(1)
    if mode == 'garbage':
        print('Submitting job... done')
        sys.exit(0)
    if scn.get('charge') and isinstance(scn['balance'], (float, int)):
        scn['balance'] = round(float(scn['balance']) - float(scn['cost']), 6)
        json.dump(scn, open(scn_path, 'w'))
    n = sum(1 for line in open(log_path) if json.loads(line)['kind'] == 'create')
    jid = '00000000-0000-4000-8000-%012d' % n
    params = {'aspect_ratio': opt('--aspect_ratio'), 'background': scn.get('echo_background') or opt('--background'),
              'height': 1024, 'width': 1024, 'model': opt('--variant'), 'prompt': opt('--prompt'),
              'quality': opt('--quality'), 'resolution': opt('--resolution'), 'remove_bg': False, 'medias': [],
              'reference_elements': []}
    print(json.dumps([{'id': jid, 'job_type': args[2], 'status': mode if mode in ('running', 'failed', 'nsfw') else 'completed',
                       'display_name': 'GPT Image 2.5', 'created_at': '2026-10-09T00:00:00Z', 'params': params,
                       'result_url': 'https://cdn.example.invalid/u/%s.png?sig=selftest' % jid,
                       'min_result_url': 'https://cdn.example.invalid/u/%s_min.webp' % jid}]))
    sys.exit(0)
sys.exit(2)
`;

export async function selftest() {
  const results = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hf-cli-selftest-"));
  const fakeDir = path.join(tmp, "fakebin");
  fs.mkdirSync(fakeDir);
  const shim = path.join(fakeDir, "higgsfield");
  fs.writeFileSync(shim, SHIM_CODE, { mode: 0o755 });

  process.env.HIGGSFIELD_BIN = shim;
  process.env.HIGGSFIELD_CLI_SPIKE_OFFLINE = "1";
  process.env.HIGGSFIELD_CLI_SPIKE_FAKE_DIR = fakeDir;

  const pngPath = path.resolve(ROOT, "../2026-10-08-solar-system/assets/web/mercury.png");
  const png = fs.readFileSync(pngPath);
  const fetched = [];

  const fakeFetch = async url => {
    fetched.push(url);
    return { status: 200, contentType: "image/png", data: png };
  };
  const stubInspector = filePath => ({ file: path.basename(filePath), real_alpha: true, note: "selftest stub" });

  const scenario = (opts = {}) => {
    fs.writeFileSync(path.join(fakeDir, "scenario.json"), JSON.stringify({ cost: 0.25, balance: 701.0, charge: true, ...opts }));
    fs.writeFileSync(path.join(fakeDir, "calls.jsonl"), "");
    fetched.length = 0;
  };

  const calls = kind => {
    const p = path.join(fakeDir, "calls.jsonl");
    if (!fs.existsSync(p)) return [];
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map(JSON.parse).filter(c => !kind || c.kind === kind);
  };

  const ledger = (name, ...rows) => {
    const led = new Ledger(path.join(tmp, `${name}.jsonl`));
    led.append({ event: "baseline", credits: 701.0, note: "selftest" });
    for (const r of rows) led.append(r);
    return led;
  };

  const run = async (led, opts = {}) => {
    const { only = null, dry = false, inspector = stubInspector, timeout = CREATE_TIMEOUT_S, fetch = fakeFetch } = opts;
    const runner = new Runner(led.path, path.join(tmp, "raw"), fetch, inspector, timeout);
    let captured = "";
    const origOut = process.stdout.write;
    const origErr = process.stderr.write;
    process.stdout.write = (chunk) => {
      captured += chunk ? chunk.toString() : "";
      return true;
    };
    process.stderr.write = (chunk) => {
      captured += chunk ? chunk.toString() : "";
      return true;
    };
    let code;
    try {
      code = await exitCode(async () => await runCmd(runner, only, dry));
    } finally {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    }
    return { code, out: captured };
  };

  const events = (led, ev, lbl = null) => {
    return led.rows().filter(r => r.event === ev && (!lbl || r.label === lbl));
  };

  const control = async (name, fn) => {
    try {
      const detail = await fn();
      results.push([name, true, detail]);
    } catch (e) {
      results.push([name, false, `${e.name || "Error"}: ${e.message}`]);
    }
  };

  // c1: cap refusal
  await control("(i) cap refusal 19.7+0.5 / 19.5+0.5", async () => {
    const led = ledger("c1");
    scenario({ cost: 0.5, balance: 681.3 });
    const { code, out } = await run(led, { only: "T2-cytokinesis" });
    if (code !== 3 || !out.includes("spend gate")) throw new Error(`19.7 spent + 0.5 not refused (exit ${code})`);
    if (calls("create").length !== 0) throw new Error("a refused call reached create");
    const ref = events(led, "refused")[0];
    if (ref.spent_by_balance !== 19.7 || ref.total_if_run !== 20.2) throw new Error(`refused row ${JSON.stringify(ref)}`);
    scenario({ cost: 0.5, balance: 681.5 });
    const r2 = await run(led, { only: "T2-cytokinesis" });
    const res = events(led, "reserve")[0];
    if (r2.code !== 0 || calls("create").length !== 1) throw new Error(`19.5 + 0.5 not allowed (exit ${r2.code})`);
    if (res.spent_by_balance !== 19.5 || res.total_if_run !== 20.0) throw new Error(`reserve row ${JSON.stringify(res)}`);
    if (!gateAllows(20.0) || gateAllows(20.000001)) throw new Error("gate boundary check");
    if ([NaN, Infinity, -Infinity].some(gateAllows)) throw new Error("non-finite allowed");
    if (!Number.isNaN(spendTotal(NaN, 1.0, 0.5)) || !Number.isNaN(spendTotal(1.0, NaN, 0.5))) throw new Error("spendTotal nan");
    return "balance 681.3 (19.7 spent) + 0.5 = 20.2 refused, exit 3, 0 creates; 681.5 (19.5) + 0.5 = 20.0 allowed, 1 create; gate refuses nan/inf/-inf and a NaN in either max() argument";
  });

  // c2: unusable cost or balance stops
  await control("(ii) unusable cost or balance stops", async () => {
    const bad = ['{"credits": NaN}', '{"credits": Infinity}', '{"credits": "inf"}', '{"credits": -1}', "not json", "", "{}", '{"credits": true}', '{"credits": 1e999}'];
    const cases = bad.concat(['{"credits": 0}']).map(b => ["cost", b]).concat(bad.map(b => ["balance", b]));
    for (let n = 0; n < cases.length; n++) {
      const [which, reply] = cases[n];
      scenario({ [which]: reply });
      const led = ledger(`c2-${n}`);
      const { code } = await run(led, { only: "T2-cytokinesis" });
      if (code !== 4) throw new Error(`${which} ${reply}: exit ${code}`);
      if (calls("create").length !== 0 || events(led, "reserve").length !== 0) throw new Error(`${which} ${reply}: reserved or created`);
      if (events(led, "stopped")[0].phase !== "gate") throw new Error("stopped phase not gate");
    }
    scenario({ cost_rc: 1 });
    const rRc = await run(ledger("c2-rc"), { only: "T2-cytokinesis" });
    if (rRc.code !== 4 || calls("create").length !== 0) throw new Error(`cost exit 1: exit ${rRc.code}`);
    return `${cases.length} unusable cost/balance replies and a failing cost command -> exit 4, gate-stopped row, 0 creates`;
  });

  // c3: balance lag
  await control("(iii) balance lag uses the larger", async () => {
    const led = ledger("c3", { event: "result", label: "selftest-seed", est_credits: 18.75, final_status: "completed" });
    scenario({ cost: 0.5, balance: 701.0, charge: false });
    const { code } = await run(led);
    if (code !== 3) throw new Error(`exit ${code}, expected third call refused`);
    if (calls("create").length !== 2) throw new Error(`${calls("create").length} creates, expected 2`);
    const [r1, r2] = events(led, "reserve");
    const ref = events(led, "refused")[0];
    const got = [r1, r2, ref].map(r => [r.spent_by_balance, r.est_sum_before, r.total_if_run]);
    const expected = [[0.0, 18.75, 19.25], [0.0, 19.25, 19.75], [0.0, 19.75, 20.25]];
    if (JSON.stringify(got) !== JSON.stringify(expected)) throw new Error(`arithmetic ${JSON.stringify(got)}`);
    if (ref.label !== "T3-sunburst-interphase" || !events(led, "result", "T2-cytokinesis").length) throw new Error("labels");
    return "balance stays 701 (0 spent by balance); estimates 18.75 -> 19.25 -> 19.75: T1 at 19.25 and T2 at 19.75 allowed, T3 refused";
  });

  // c4: ambiguous creates stop
  await control("(iv) ambiguous create stops, no retry", async () => {
    for (const mode of ["exit1", "garbage", "running", "sleep"]) {
      scenario({ create: mode });
      const led = ledger(`c4-${mode}`);
      const { code } = await run(led, { timeout: mode === "sleep" ? 1 : CREATE_TIMEOUT_S });
      if (code !== 4) throw new Error(`${mode}: exit ${code}`);
      if (calls("create").length !== 1) throw new Error(`${mode}: create count`);
      const evs = led.rows().map(r => r.event);
      if (JSON.stringify(evs) !== JSON.stringify(["baseline", "reserve", "stopped"])) throw new Error(`${mode}: events`);
      if (events(led, "stopped")[0].attempt_id !== events(led, "reserve")[0].attempt_id) throw new Error(`${mode}: attempt mismatch`);
      scenario();
      const rRetry = await run(led, { only: "T1-smoke-interphase" });
      if (rRetry.code !== 0 || calls("create").length !== 0 || !rRetry.out.includes("never retried")) {
        throw new Error(`${mode}: label retried`);
      }
    }
    scenario({ create: "failed" });
    const ledFailed = ledger("c4-failed");
    const rFailed = await run(ledFailed);
    if (rFailed.code !== 0 || calls("create").length !== 5) throw new Error(`clean failure: exit ${rFailed.code}`);
    if (!events(ledFailed, "result").every(r => r.final_status === "failed" && !r.go_eligible)) throw new Error("failed rows");
    if (estSumOf(ledFailed.rows()) !== 1.25) throw new Error("failed calls not counted at estimate");
    return "exit 1 with no output, non-JSON output, status running and timeout -> stopped row, exit 4, 1 create; clean failed x5 recorded";
  });

  // c5: second process refused by lock
  await control("(v) second process refused by the lock", async () => {
    const led = ledger("c5");
    scenario();
    await exclusiveLock(led.path, () => {
      const p = child_process.spawnSync("node", [__filename, "--ledger", led.path, "--raw-dir", path.join(tmp, "raw"), "run"], {
        encoding: "utf8"
      });
      if (p.status !== 5 || !(p.stderr || "").includes("another process")) {
        throw new Error(`second process exit ${p.status}: ${p.stderr}`);
      }
    });
    if (calls().length !== 0) throw new Error("the refused process called CLI");
    await exclusiveLock(led.path, () => {});
    return "second process exit 5 while lock was held, 0 CLI calls; lock reacquired after release";
  });

  // c6: param echo mismatch
  await control("(vi) param echo mismatch flagged", async () => {
    scenario({ echo_background: "opaque" });
    const led = ledger("c6");
    const { code } = await run(led, { only: "T2-cytokinesis" });
    const r = events(led, "result")[0];
    if (code !== 0 || r.echoed_background !== "opaque" || !r.flags.includes("param_not_echoed")) throw new Error(`row ${JSON.stringify(r)}`);
    if (r.inspection.real_alpha !== true || r.go_eligible !== false) throw new Error("mismatch still GO-eligible");
    scenario();
    const led2 = ledger("c6b");
    await run(led2, { only: "T2-cytokinesis" });
    if (events(led2, "result")[0].go_eligible !== true) throw new Error("clean echo should be GO-eligible");
    return "echo opaque for transparent -> flags [param_not_echoed], go_eligible false (clean echo: true)";
  });

  // c7: resumable, dry run, pipeline
  await control("(vii) resumable, dry run, pipeline", async () => {
    const prior = MATRIX.slice(0, 4).map(([l]) => ({ event: "result", label: l, est_credits: 0.25, final_status: "completed" }));
    const led = ledger("c7", ...prior);
    scenario({ balance: 700.0 });
    const { code, out } = await run(led, { dry: true });
    if (code !== 0 || calls("create").length !== 0 || events(led, "reserve").length !== 0) throw new Error("dry run created or reserved");
    const would = out.split("\n").filter(l => l.includes('"would_run"')).map(l => JSON.parse(l).label);
    if (JSON.stringify(would) !== JSON.stringify(["C1-flare-opaque-interphase"]) || !out.includes('"projected_total": 1.25')) {
      throw new Error(`dry run output: ${out}`);
    }
    const rReal = await run(led, { inspector: runInspector });
    const made = calls("create");
    if (rReal.code !== 0 || made.length !== 1 || !made[0].args.includes("opaque")) {
      throw new Error(`exit ${rReal.code}, creates: ${JSON.stringify(made)}`);
    }
    const r = events(led, "result", "C1-flare-opaque-interphase")[0];
    if (r.result_url.includes("?") || r.sha256 !== sha256Sync(png)) throw new Error("url/sha");
    if (r.content_type !== "image/png" || r.inspection.real_alpha !== true) throw new Error("pipeline inspection");
    if (r.balance_before !== 700.0 || r.balance_after !== 699.75 || r.measured_credits !== 0.25) throw new Error("balance accounting");
    if (r.go_eligible !== false) throw new Error("opaque requested control must not be GO-eligible");
    scenario({ balance: 699.75 });
    const rRerun = await run(led);
    if (rRerun.code !== 0 || calls("create").length !== 0) throw new Error("rerun created a job");
    return "T1-T4 have results: dry run lists only C1; run creates only C1; rerun creates nothing";
  });

  // c8: no email in ledger
  await control("(viii) no email in the ledger", async () => {
    scenario({ email: "selftest.person@example.com" });
    const led = ledger("c8");
    const { code, out } = await run(led);
    const text = fs.readFileSync(led.path, "utf8");
    if (code !== 0 || calls("create").length !== 5) throw new Error(`exit ${code}`);
    if (text.includes("example.com") || text.includes("@") || text.includes("email")) throw new Error("email in ledger");
    if (out.includes("example.com")) throw new Error("email printed to stdout");

    // Stateless email refusal check (GH-86 QA: assert subsequent email appends both fail)
    let ref1 = false, ref2 = false;
    try { led.append({ event: "x", note: "mail someone@example.com here" }); } catch { ref1 = true; }
    try { led.append({ event: "x", note: "other@example.com" }); } catch { ref2 = true; }
    if (!ref1 || !ref2) throw new Error(`stateless email refusal failed: ref1=${ref1}, ref2=${ref2}`);

    return "shim account JSON carried an email; 5 creates; ledger and output contain no email; sequential email appends refused statelessly";
  });

  // c9: inspector controls
  await control("(ix) inspector controls", () => {
    const transparent = path.resolve(ROOT, "../2026-10-08-solar-system/assets/web/earth.png");
    const opaque = path.resolve(ROOT, "../2026-10-08-solar-system/solar-system.png");
    const a = runInspector(transparent);
    const b = runInspector(opaque);
    if (a.real_alpha !== true || a.minAlpha !== 0) throw new Error(`transparent: ${JSON.stringify(a)}`);
    if (b.real_alpha !== false || b.minAlpha !== 255 || b.opaqueCornerCount !== 4) throw new Error(`opaque: ${JSON.stringify(b)}`);
    return `earth.png real_alpha true; solar-system.png real_alpha false`;
  });

  // c10: tokens and signed URLs never reach ledger
  await control("(x) tokens and signed URLs never reach the ledger", async () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZWxmdGVzdCJ9.c2VsZnRlc3Qtc2lnbmF0dXJl";
    const secrets = ["SECRETSIG", "Expires=1", "abc.def.ghi-longtokenvalue", jwt, "tokvalue123456", "acctok987654", "DLSECRET", "X-Amz-Expires=60"];
    scenario({
      create: "leaky",
      stderr:
        "error: upload https://cdn.example/x.png?sig=SECRETSIG&Expires=1 failed\n" +
        `${jwt}\n` +
        'retry with token=tokvalue123456 {"access_token": "acctok987654"}\n' +
        "Authorization: Bearer abc.def.ghi-longtokenvalue\n"
    });
    const ledA = ledger("c10a");
    const rA = await run(ledA, { only: "T2-cytokinesis" });
    if (rA.code !== 4 || calls("create").length !== 1) throw new Error(`leaky create: exit ${rA.code}`);

    const leakyFetch = async url => {
      throw new Error("GET https://cdn.example.invalid/u/x.png?X-Amz-Signature=DLSECRET&X-Amz-Expires=60 returned 403");
    };
    scenario();
    const ledB = ledger("c10b");
    const rB = await run(ledB, { only: "T2-cytokinesis", fetch: leakyFetch });
    const rRes = events(ledB, "result")[0];
    if (rB.code !== 0 || !rRes.flags.includes("download_failed")) throw new Error(`download failure: exit ${rB.code}`);

    const text = fs.readFileSync(ledA.path, "utf8") + fs.readFileSync(ledB.path, "utf8");
    const outTotal = rA.out + rB.out;
    for (const s of secrets) {
      if (text.includes(s)) throw new Error(`${s} reached the ledger`);
      if (outTotal.includes(s)) throw new Error(`${s} reached stdout/stderr`);
    }
    if (!text.includes("https://cdn.example/x.png?<query-stripped>") || !text.includes("https://cdn.example.invalid/u/x.png?<query-stripped>")) {
      throw new Error("stripped form missing from ledger");
    }
    if (!rA.out.includes("https://cdn.example/x.png?<query-stripped>")) {
      throw new Error("stripped form missing from stderr");
    }
    if (redactSecrets(redactSecrets(text)) !== text) throw new Error("redaction not idempotent");
    return "stderr with signed URL, Auth header, JWT, token, download exception: none in ledger or stdout; query-stripped forms recorded";
  });

  // c11: HIGGSFIELD_BIN only under offline guard
  await control("(xi) HIGGSFIELD_BIN only under the offline guard", () => {
    const env = { ...process.env };
    delete env.HIGGSFIELD_CLI_SPIKE_OFFLINE;
    delete env.HIGGSFIELD_CLI_SPIKE_FAKE_DIR;
    env.HIGGSFIELD_BIN = shim;

    const probe = child_process.spawnSync("node", ["-e", `
      import { cliBin } from ${JSON.stringify(fileURLToPath(import.meta.url))};
      console.log(cliBin());
    `], { env, encoding: "utf8" });

    if (probe.status !== 0 || probe.stdout.trim() !== "higgsfield") {
      throw new Error(`guard off: ${probe.stdout} ${probe.stderr}`);
    }
    if (cliBin() !== shim) throw new Error("guard on: override not honoured");
    return 'guard off + HIGGSFIELD_BIN=fake -> "higgsfield"; guard on -> fake shim path';
  });

  // c12: realFetch rejected by offline guard caught gracefully
  await control("(xii) realFetch rejected by offline guard caught gracefully", async () => {
    const rawDir = path.join(tmp, "raw-realfetch");
    const runner = new Runner(ledger("c12").path, rawDir, realFetch, stubInspector);
    const row = { flags: [] };
    const job = { id: "test-real", result_url: "https://cdn.example.invalid/u/test.png" };
    await runner.downloadAndInspect("T1-offline", job, row);
    if (!row.flags.includes("download_failed") || !row.download_error || !row.download_error.includes("offline guard blocked a download")) {
      throw new Error(`expected download_failed with offline guard message, got: ${JSON.stringify(row)}`);
    }
    return "realFetch under offline guard caught and formatted into download_error without unhandled rejection";
  });

  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    // ignore
  }

  for (const [name, ok, detail] of results) {
    say(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
  }
  const failed = results.filter(r => !r[1]);
  say(`selftest: ${results.length - failed.length}/${results.length} controls passed`);
  return failed.length ? 1 : 0;
}

// ---------------------------------------------------- Main CLI
export async function main(argv = process.argv.slice(2)) {
  const getOpt = (name, fallback = null) => {
    const idx = argv.indexOf(name);
    return idx !== -1 && idx + 1 < argv.length ? argv[idx + 1] : fallback;
  };
  const hasFlag = name => argv.includes(name);

  const cmd = argv.find(a => !a.startsWith('--'));
  const ledgerPath = getOpt('--ledger', LEDGER);
  const rawDir = getOpt('--raw-dir');

  if (cmd === 'selftest') {
    return await selftest();
  }

  const go = async () => {
    return await exclusiveLock(ledgerPath, async () => {
      if (cmd === 'init-ledger') {
        const smokeJson = getOpt('--smoke-json');
        const smokePng = getOpt('--smoke-png');
        if (!smokeJson || !smokePng) {
          throw new Refuse(1, 'init-ledger requires --smoke-json and --smoke-png');
        }
        return initLedger(new Ledger(ledgerPath), smokeJson, smokePng);
      }
      if (cmd === 'run') {
        const only = getOpt('--only');
        const dryRun = hasFlag('--dry-run');
        return await runCmd(new Runner(ledgerPath, rawDir), only, dryRun);
      }
      throw new Refuse(1, `unknown command: ${cmd}`);
    });
  };

  return await exitCode(go);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const code = await main();
  process.exit(code);
}
