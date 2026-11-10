// Hallmark (nutlope/hallmark) layout and theme reader for XYZ Layout Engine.
// Requires pointing to a local Hallmark checkout via HALLMARK_PATH or --from <path>.
// Extracts live theme definitions and macrostructure templates directly from Hallmark source files.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveHallmarkPath(explicitPath) {
  const candidate = explicitPath || process.env.HALLMARK_PATH || '../hallmark';
  const resolved = path.resolve(process.cwd(), candidate);
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Hallmark repository not found at "${resolved}".\n` +
      `Please clone https://github.com/nutlope/hallmark and specify its path using:\n` +
      `  --from /path/to/hallmark  OR  export HALLMARK_PATH=/path/to/hallmark`
    );
  }
  return resolved;
}

export function loadThemes(hallmarkRoot) {
  const root = resolveHallmarkPath(hallmarkRoot);
  // Hallmark keeps themes either under skills/hallmark/references/themes or references/themes
  const candidates = [
    path.join(root, 'skills/hallmark/references/themes'),
    path.join(root, 'references/themes'),
    path.join(root, 'skills/hallmark/themes')
  ];
  const themesDir = candidates.find(dir => fs.existsSync(dir));
  if (!themesDir) {
    throw new Error(`Unable to locate themes directory in Hallmark at "${root}". Checked: ${candidates.join(', ')}`);
  }

  const manifestPath = path.join(themesDir, 'index.json');
  let themeList = [];
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const raw = Array.isArray(data.themes) ? data.themes : (Array.isArray(data) ? data : []);
      themeList = raw.map(t => ({ slug: t.slug || t.name, name: t.name || t.slug }));
    } catch (e) {
      // Fall back to scanning markdown files
    }
  }

  if (themeList.length === 0) {
    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    themeList = files.map(file => {
      const slug = path.basename(file, '.md');
      return { slug, name: slug };
    });
  }

  return themeList.map(item => {
    const filePath = path.join(themesDir, `${item.slug}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = parseThemeMarkdown(item.slug, content);
      return { ...item, ...parsed, palette: parsed.palette };
    }
    return { ...item, palette: {} };
  });
}

function mapRole(r) {
  const lower = r.toLowerCase();
  if (lower.startsWith('paper') || lower.startsWith('background') || lower.startsWith('surface')) {
    return lower.includes('surface') ? 'surface' : 'paper';
  }
  if (lower.startsWith('ink') || lower.startsWith('text') || lower.startsWith('foreground')) return 'ink';
  if (lower.startsWith('accent')) return 'accent';
  if (lower.startsWith('muted')) return 'muted';
  if (lower.startsWith('rule')) return 'rule';
  if (lower.startsWith('secondary')) return 'secondary';
  return null;
}

export function parseThemeMarkdown(slug, content) {
  const theme = { slug, name: slug, palette: {} };

  // 1. CSS Custom Properties: --color-<role>: <value>;
  const cssVarRegex = /--color-([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = cssVarRegex.exec(content)) !== null) {
    const rawRole = match[1].toLowerCase();
    const val = match[2].trim();
    const role = mapRole(rawRole);
    if (role && !theme.palette[role]) {
      theme.palette[role] = val;
    }
  }

  // 2. Table row pattern: | Role | Color | ... |
  const tableRegex = /\|\s*(Paper|Ink|Accent|Muted|Rule|Surface|Secondary)\b[^|]*\|\s*([^|\n]+?)\s*\|/gi;
  while ((match = tableRegex.exec(content)) !== null) {
    const role = mapRole(match[1]);
    const cell = match[2].trim();
    const colorMatch = cell.match(/((?:oklch|rgb|hsl|rgba|hsla)\([^)]+\)|#[0-9a-fA-F]{3,8})/);
    const val = colorMatch ? colorMatch[1] : cell;
    if (role && !theme.palette[role]) {
      theme.palette[role] = val;
    }
  }

  // 3. Bounded key-value declarations (supports multiline frontmatter and multiple per line: "paper: #fff; ink: #111")
  const kvRegex = /\b(paper|ink|accent|muted|rule|surface|secondary)\b\s*[:=]\s*["']?((?:oklch|rgb|hsl|rgba|hsla)\([^)]+\)|#[0-9a-fA-F]{3,8}|[^\s;"']+?)["']?(?:[;,]|\s*$)/gim;
  while ((match = kvRegex.exec(content)) !== null) {
    const role = mapRole(match[1]);
    const val = match[2].trim();
    if (role && !theme.palette[role]) {
      theme.palette[role] = val;
    }
  }

  return theme;
}

export function loadMacrostructures(hallmarkRoot) {
  const root = resolveHallmarkPath(hallmarkRoot);
  const candidates = [
    path.join(root, 'skills/hallmark/references/macrostructures'),
    path.join(root, 'references/macrostructures')
  ];
  const macroDir = candidates.find(dir => fs.existsSync(dir));
  if (!macroDir) {
    throw new Error(`Unable to locate macrostructures directory in Hallmark at "${root}". Checked: ${candidates.join(', ')}`);
  }

  const files = fs.readdirSync(macroDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  return files.map(file => {
    const slug = path.basename(file, '.md');
    const content = fs.readFileSync(path.join(macroDir, file), 'utf8');
    const firstLine = content.split('\n').find(l => l.startsWith('#')) || `# ${slug}`;
    const name = firstLine.replace(/^#+\s*/, '').trim();
    return { slug, name, file: path.join(macroDir, file) };
  });
}

export function readMacrostructure(hallmarkRoot, target) {
  const macros = loadMacrostructures(hallmarkRoot);
  
  // 1. Exact slug match
  const exact = macros.find(m => m.slug === target);
  if (exact) {
    return { ...exact, content: fs.readFileSync(exact.file, 'utf8') };
  }

  // 2. Delimited numeric ID resolution (e.g. "1" or "01" -> "01-bento-grid")
  const num = parseInt(target, 10);
  if (!isNaN(num) && String(num) === target.replace(/^0+/, '') || target === '00' || target === '0') {
    const padded = String(num).padStart(2, '0');
    const numMatches = macros.filter(m => m.slug.startsWith(`${padded}-`) || m.slug.startsWith(`${num}-`));
    if (numMatches.length === 1) {
      return { ...numMatches[0], content: fs.readFileSync(numMatches[0].file, 'utf8') };
    }
    if (numMatches.length > 1) {
      throw new Error(`Ambiguous macrostructure numeric ID "${target}". Matches: ${numMatches.map(m => m.slug).join(', ')}`);
    }
  }

  // 3. Delimited prefix matching with ambiguity check
  const prefixMatches = macros.filter(m => m.slug === target || m.slug.startsWith(`${target}-`) || m.slug.startsWith(target));
  if (prefixMatches.length === 1) {
    return { ...prefixMatches[0], content: fs.readFileSync(prefixMatches[0].file, 'utf8') };
  }
  if (prefixMatches.length > 1) {
    throw new Error(`Ambiguous macrostructure target "${target}". Matches: ${prefixMatches.map(m => m.slug).join(', ')}`);
  }

  throw new Error(`Macrostructure "${target}" not found in Hallmark. Available: ${macros.map(m => m.slug).join(', ')}`);
}

export function runCLI(args) {
  let hallmarkPath = null;
  const filteredArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from') {
      if (!args[i + 1] || args[i + 1].startsWith('-')) {
        throw new Error('--from option requires a directory path argument.');
      }
      hallmarkPath = args[++i];
    } else if (args[i].startsWith('--from=')) {
      hallmarkPath = args[i].slice('--from='.length);
      if (!hallmarkPath) {
        throw new Error('--from option requires a directory path argument.');
      }
    } else {
      filteredArgs.push(args[i]);
    }
  }

  const [cmd = 'list', target, ...extra] = filteredArgs;
  if (extra.length > 0) {
    throw new Error(`Unexpected positional argument: "${extra[0]}".\nUsage: node tools/hallmark.mjs [--from <path>] [list | macro <slug> | theme <slug>]`);
  }

  if (cmd === 'list') {
    if (target) {
      throw new Error(`Unexpected argument "${target}" for command "list".\nUsage: node tools/hallmark.mjs [--from <path>] list`);
    }
    return {
      hallmarkPath: resolveHallmarkPath(hallmarkPath),
      macrostructures: loadMacrostructures(hallmarkPath).map(m => ({ slug: m.slug, name: m.name })),
      themes: loadThemes(hallmarkPath).map(t => ({ slug: t.slug || t.name, name: t.name, palette: t.palette }))
    };
  }
  if (cmd === 'macro') {
    if (!target) throw new Error(`Missing target slug for command "macro".\nUsage: node tools/hallmark.mjs [--from <path>] macro <slug>`);
    return readMacrostructure(hallmarkPath, target);
  }
  if (cmd === 'theme') {
    if (!target) throw new Error(`Missing target slug for command "theme".\nUsage: node tools/hallmark.mjs [--from <path>] theme <slug>`);
    const themes = loadThemes(hallmarkPath);
    const found = themes.find(t => (t.slug || t.name) === target);
    if (!found) throw new Error(`Theme "${target}" not found.`);
    return found;
  }
  throw new Error(`Unknown command "${cmd}".\nUsage: node tools/hallmark.mjs [--from <path>] [list | macro <slug> | theme <slug>]`);
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = runCLI(process.argv.slice(2));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}
