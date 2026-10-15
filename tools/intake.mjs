// Agent translation happens in skills/design-intake. This entry point only validates data.
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeRequest, invalid } from './request.mjs';
import { CAPABILITIES, preflight } from './recipes/design-intake.mjs';
export async function runCLI(args, options = {}) {
  if (args.length === 1 && args[0] === 'capabilities') return CAPABILITIES;
  const [verb, inputPath, ...flags] = args;
  if (verb !== 'check' || !inputPath || flags.length % 2) throw invalid('usage', 'intake capabilities | check <fixture.json> [--backend satori|playwright] [--format png,svg,html,html-inline]');
  const req = { inputPath, recipe: 'design-intake' }, seen = new Set();
  for (let i = 0; i < flags.length; i += 2) {
    if (!['--backend','--format'].includes(flags[i]) || seen.has(flags[i])) throw invalid('usage', 'unknown or duplicate option');
    seen.add(flags[i]); req[flags[i].slice(2)] = flags[i+1];
  }
  const { fixture } = await normalizeRequest(req, options);
  const { assets, ...report } = await preflight(fixture, options);
  return { ...report, scope: 'Structural/capability preflight only. Render to verify glyph coverage and text fit; inspect visual fidelity separately.' };
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCLI(process.argv.slice(2)).then(result => { console.log(JSON.stringify(result, null, 2)); if (result.ready === false) process.exitCode = 1; })
    .catch(error => { console.error(JSON.stringify({ ready: false, error: error.message })); process.exitCode = 1; });
}
