// Hallmark (nutlope/hallmark) layout and theme reader for XYZ Layout Engine.
// Provides preset themes and macrostructure skeletons compatible with design-intake@1.0.5.

export const THEMES = Object.freeze({
  riso: {
    id: 'riso',
    name: 'Riso',
    description: 'Tactile Risograph print aesthetic with saturated duotone spot inks and warm unbleached paper surface.',
    palette: {
      paper: '#fbf8ee',
      ink: '#182236',
      accent: '#ff4e36',
      secondary: '#2da882',
      subtle: '#ebe4d0'
    },
    settings: {
      cornerRadius: 12,
      borderWidth: 2
    }
  },
  distil: {
    id: 'distil',
    name: 'Distil',
    description: 'Swiss technical/editorial minimalism with high-contrast slate ink, precise rules, and electric cobalt focus.',
    palette: {
      paper: '#f4f4f4',
      ink: '#11161d',
      accent: '#0055ff',
      muted: '#68707d',
      surface: '#e8eaed'
    },
    settings: {
      cornerRadius: 4,
      borderWidth: 1
    }
  }
});

export const MACROSTRUCTURES = Object.freeze({
  bento: {
    id: 'bento',
    name: '01 · Bento Grid',
    description: 'Modular, irregular quadrant layout with deliberate asymmetric weighting and multi-tier density.',
    aspectRatio: '1:1',
    defaultCanvas: { width: 1200, height: 1200, spacing: 24 }
  },
  'stat-led': {
    id: 'stat-led',
    name: '04 · Stat-Led',
    description: 'Metrics-dominant hierarchy anchored by a high-contrast hero KPI block and structured narrative callouts.',
    aspectRatio: '1:1',
    defaultCanvas: { width: 1200, height: 1200, spacing: 24 }
  }
});

export function getTheme(id) {
  const theme = THEMES[id];
  if (!theme) throw new Error(`Unknown Hallmark theme '${id}'. Available: ${Object.keys(THEMES).join(', ')}`);
  return theme;
}

export function getMacrostructure(id) {
  const macro = MACROSTRUCTURES[id];
  if (!macro) throw new Error(`Unknown Hallmark macrostructure '${id}'. Available: ${Object.keys(MACROSTRUCTURES).join(', ')}`);
  return macro;
}

export function runCLI(args) {
  const [cmd = 'list', target] = args;
  if (cmd === 'list') {
    return {
      themes: Object.values(THEMES).map(t => ({ id: t.id, name: t.name, description: t.description })),
      macrostructures: Object.values(MACROSTRUCTURES).map(m => ({ id: m.id, name: m.name, description: m.description }))
    };
  }
  if (cmd === 'theme' && target) return getTheme(target);
  if (cmd === 'macro' && target) return getMacrostructure(target);
  throw new Error(`Usage: node tools/hallmark.mjs [list | theme <id> | macro <id>]`);
}

import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = runCLI(process.argv.slice(2));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}
