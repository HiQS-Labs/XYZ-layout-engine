import { fileURLToPath } from 'node:url';
import { runCLI } from '../../tools/render.mjs';

// Thin caller: renders this fixture through the trusted recursive-process recipe into this folder's
// own out/ (gitignored). Pass --backend playwright or --format svg as extra arguments.
const root = fileURLToPath(new URL('../../', import.meta.url));
runCLI([fileURLToPath(new URL('fixture.json', import.meta.url)), '--recipe', 'recursive-process', '--out', 'examples/2026-10-11-belief-updating/out', ...process.argv.slice(2)], { root })
  .then(receipt => console.log(JSON.stringify(receipt, null, 2)))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
