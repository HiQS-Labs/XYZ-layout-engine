// Agent translation happens in skills/design-intake. This entry point only validates data.
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeRequest, invalid } from './request.mjs';
import { CAPABILITIES, preflight } from './recipes/design-intake.mjs';
import { lintFixture } from './craft-lint.mjs';
export async function runCLI(args, options = {}) {
  if (args.length === 1 && args[0] === 'capabilities') return CAPABILITIES;
  const [verb, inputPath, ...flags] = args;
  if (verb !== 'check' || !inputPath) throw invalid('usage', 'intake capabilities | check <fixture.json> [--backend satori|playwright] [--format png,svg,html,html-inline] [--craft]');
  const req = { inputPath, recipe: 'design-intake' }, seen = new Set();
  let checkCraft = false;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === '--craft') {
      if (seen.has('--craft')) throw invalid('usage', 'duplicate --craft option');
      seen.add('--craft');
      checkCraft = true;
      continue;
    }
    if (i + 1 >= flags.length) throw invalid('usage', 'missing value for option ' + flags[i]);
    if (!['--backend','--format'].includes(flags[i]) || seen.has(flags[i])) throw invalid('usage', 'unknown or duplicate option');
    seen.add(flags[i]); req[flags[i].slice(2)] = flags[i+1];
    i++;
  }
  const { fixture } = await normalizeRequest(req, options);
  const { assets, ...report } = await preflight(fixture, options);
  if (checkCraft) {
    const craft = lintFixture(fixture, options);
    report.craft = craft;
    if (!craft.ok) report.ready = false;
  }
  return { ...report, scope: 'Structural/capability preflight only. Render to verify glyph coverage and text fit; inspect visual fidelity separately.' };
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCLI(process.argv.slice(2)).then(result => { console.log(JSON.stringify(result, null, 2)); if (result.ready === false) process.exitCode = 1; })
    .catch(error => { console.error(JSON.stringify({ ready: false, error: error.message })); process.exitCode = 1; });
}
