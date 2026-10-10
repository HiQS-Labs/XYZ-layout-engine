import { fileURLToPath } from 'node:url';
import { runCLI } from '../../tools/render.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
runCLI([fileURLToPath(new URL('fixture.json', import.meta.url)), '--recipe', 'solar-system', '--out', 'tools/output/solar-system', ...process.argv.slice(2)], { root })
  .then(receipt => console.log(JSON.stringify(receipt, null, 2)))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
