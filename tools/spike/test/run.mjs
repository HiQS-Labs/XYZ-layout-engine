// `pnpm test`: enforces the test/CI budget in test-budget.json, then runs the canaries under a hard deadline.
// Node built-ins only. Policy text lives in test-budget.json; this file only enforces it.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CANARIES = path.join(HERE, 'canaries.test.mjs');
const SELF = fileURLToPath(import.meta.url);
const fail = msg => { console.error(`test-budget: FAIL — ${msg}`); process.exit(1); };

const cfg = JSON.parse(readFileSync(path.join(ROOT, 'test-budget.json'), 'utf8'));
const { budget, history } = cfg;
for (const k of ['testFiles', 'tests', 'maxSeconds', 'ciWorkflows']) if (!Number.isInteger(budget?.[k]) || budget[k] < 0) fail(`budget.${k} must be a non-negative integer`);
if (!Array.isArray(history) || !history.length) fail('history must record at least one budget');
for (const [i, h] of history.entries()) if (!/^https:\/\/github\.com\/.+\/issues\/\d+$/.test(h.issue || '') || !(h.reason || '').trim()) fail(`history[${i}] needs an issue URL and a reason`);
if (!isDeepStrictEqual(history[history.length - 1].budget, budget)) fail('budget changed without a matching history entry (the last history[].budget must equal budget)');

// Test-like files anywhere in the repo, excluding dependencies and the vendored harness.
const SKIP = new Set(['node_modules', '.git', '.xyz', '.tick']);
const testLike = [];
(function walk(dir, inTestDir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, inTestDir || ['test', 'tests', '__tests__'].includes(e.name));
    else if (p !== SELF && (inTestDir || /\.(test|spec)\.[cm]?[jt]sx?$/.test(e.name))) testLike.push(path.relative(ROOT, p));
  }
})(ROOT, false);
if (testLike.length > budget.testFiles) fail(`${testLike.length} test files exceed budget.testFiles=${budget.testFiles}: ${testLike.join(', ')}`);

const src = readFileSync(CANARIES, 'utf8');
const banned = src.match(/\b(it|describe|suite)\s*\(|\.(skip|todo|only)\b|\b(skip|todo)\s*:/g);
if (banned) fail(`canaries use forbidden test forms (${[...new Set(banned)].join(', ')}); only plain test() is allowed`);
// Canaries are top-level declarations: `test(` at the start of a line. Any other `test(` call form is
// rejected below, so comments and strings cannot hide or pad the count.
const names = [...src.matchAll(/^test\(\s*(['"`])(.*?)\1/gm)].map(m => m[2]);
const declared = (src.match(/^test\(/gm) || []).length;
const code = src.replace(/\/\/.*$/gm, '');
if ((code.match(/(?<![.\w$])test\s*\(/g) || []).length !== declared) fail('test() must only be called at the start of a line (top-level canaries)');
if (declared === 0) fail('zero canaries declared');
if (declared > budget.tests) fail(`${declared} tests exceed budget.tests=${budget.tests}`);
if (names.length !== declared || names.some(n => !n.startsWith('guards: '))) fail('every test name must be a string literal starting with "guards: "');

const wf = path.join(ROOT, '.github', 'workflows');
const workflows = existsSync(wf) ? readdirSync(wf).filter(f => /\.ya?ml$/.test(f)) : [];
if (workflows.length > budget.ciWorkflows) fail(`${workflows.length} CI workflows exceed budget.ciWorkflows=${budget.ciWorkflows}`);

console.log(`test-budget: ok — ${testLike.length}/${budget.testFiles} files, ${declared}/${budget.tests} tests, ${workflows.length}/${budget.ciWorkflows} workflows, deadline ${budget.maxSeconds}s`);

// Run under a parent deadline in a separate process group so a stall cannot outlive the budget.
const t0 = Date.now();
const child = spawn(process.execPath, ['--test', '--test-reporter=tap', CANARIES], { cwd: ROOT, detached: true, stdio: ['ignore', 'pipe', 'inherit'] });
let tap = '';
child.stdout.on('data', d => { tap += d; process.stdout.write(d); });
let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 5000).unref();
}, budget.maxSeconds * 1000);
child.on('close', code => {
  clearTimeout(timer);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  // The group leader can close before the delayed SIGKILL fires; escalate now so nothing that ignored
  // SIGTERM outlives this process.
  if (timedOut) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} fail(`deadline: suite exceeded budget.maxSeconds=${budget.maxSeconds}s and was killed`); }
  const n = k => Number((tap.match(new RegExp(`^# ${k} (\\d+)$`, 'm')) || [])[1] ?? NaN);
  const pass = n('pass'), failN = n('fail'), skip = n('skipped'), todo = n('todo');
  if (code !== 0 || failN !== 0) fail(`canaries failed (exit ${code}, fail ${failN})`);
  if (!(pass >= 1) || pass !== declared || pass > budget.tests) fail(`executed ${pass} passing tests, declared ${declared}, budget ${budget.tests}`);
  if (skip !== 0 || todo !== 0) fail(`skip ${skip} / todo ${todo} must be 0`);
  console.log(`test-budget: PASS — ${pass} canaries in ${secs}s (budget ${budget.maxSeconds}s)`);
});
