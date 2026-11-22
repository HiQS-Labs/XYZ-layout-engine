// Headless HTML auditing via Impeccable CLI.
// Audits rendered publication HTML against Impeccable's deterministic anti-slop rules.
// Runs offline if the impeccable binary is present, or falls back to npx impeccable detect.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function findImpeccableBin() {
  // 1. Check local environment variable
  if (process.env.IMPECCABLE_BIN && fs.existsSync(process.env.IMPECCABLE_BIN)) {
    return process.env.IMPECCABLE_BIN;
  }
  // 2. Check ~/.impeccable/bin/
  const homeBin = path.join(os.homedir(), '.impeccable', 'bin', 'impeccable');
  if (fs.existsSync(homeBin)) return homeBin;

  // 3. Check system PATH
  const which = spawnSync('which', ['impeccable'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim()) {
    return which.stdout.trim();
  }
  return null;
}

export function findHtmlFile(dir, depth = 0) {
  if (depth > 5) return null;
  const candidateInline = path.join(dir, 'render-inline.html');
  const candidateRender = path.join(dir, 'render.html');
  if (fs.existsSync(candidateInline)) return candidateInline;
  if (fs.existsSync(candidateRender)) return candidateRender;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const found = findHtmlFile(path.join(dir, entry.name), depth + 1);
        if (found) return found;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function auditHtml(targetPath, options = {}) {
  const resolved = path.resolve(process.cwd(), targetPath);
  let htmlFile = resolved;

  // If a directory was provided, locate render.html or render-inline.html
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    const found = findHtmlFile(resolved);
    if (found) htmlFile = found;
    else throw new Error(`No render.html or render-inline.html found in ${resolved}`);
  }

  if (!fs.existsSync(htmlFile)) {
    throw new Error(`Target file not found: ${htmlFile}`);
  }

  const bin = findImpeccableBin();
  let cmd, args;
  if (bin) {
    cmd = bin;
    args = ['detect', htmlFile];
  } else {
    cmd = 'npx';
    args = ['--yes', 'impeccable', 'detect', htmlFile];
  }

  if (options.json) args.push('--json');

  const proc = spawnSync(cmd, args, {
    stdio: options.silent ? 'pipe' : 'inherit',
    encoding: 'utf8',
    timeout: 30000
  });

  return {
    exitCode: proc.status,
    stdout: proc.stdout,
    stderr: proc.stderr,
    target: htmlFile,
    runner: bin ? 'native-binary' : 'npx'
  };
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node tools/impeccable/audit.mjs <path-to-render.html|run-directory> [--json]');
    process.exit(1);
  }
  const isJson = process.argv.includes('--json');
  try {
    const result = auditHtml(target, { json: isJson });
    process.exit(result.exitCode ?? 0);
  } catch (err) {
    console.error('impeccable-audit error:', err.message);
    process.exit(1);
  }
}
