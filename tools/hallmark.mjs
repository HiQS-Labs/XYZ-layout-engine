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
  let themesDir = candidates.find(dir => fs.existsSync(dir));
  if (!themesDir) {
    throw new Error(`Unable to locate themes directory in Hallmark at "${root}". Checked: ${candidates.join(', ')}`);
  }

  const manifestPath = path.join(themesDir, 'index.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (Array.isArray(data.themes)) return data.themes;
      if (Array.isArray(data)) return data;
    } catch (e) {
      // Fall back to scanning files
    }
  }

  // Scan markdown files if manifest is not present or unparseable
  const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  return files.map(file => {
    const slug = path.basename(file, '.md');
    const content = fs.readFileSync(path.join(themesDir, file), 'utf8');
    return parseThemeMarkdown(slug, content);
  });
}

export function parseThemeMarkdown(slug, content) {
  const theme = { slug, name: slug, palette: {} };
  // Extract colors from markdown content or frontmatter if present
  const lines = content.split('\n');
  for (const line of lines) {
    const hexMatches = line.match(/(#[0-9a-fA-F]{6})/g);
    if (!hexMatches) continue;
    const lower = line.toLowerCase();
    if (lower.includes('paper') || lower.includes('background') || lower.includes('surface')) {
      if (!theme.palette.paper) theme.palette.paper = hexMatches[0];
    } else if (lower.includes('ink') || lower.includes('text') || lower.includes('foreground')) {
      if (!theme.palette.ink) theme.palette.ink = hexMatches[0];
    } else if (lower.includes('accent')) {
      if (!theme.palette.accent) theme.palette.accent = hexMatches[0];
    } else if (lower.includes('secondary') || lower.includes('muted')) {
      if (!theme.palette.secondary) theme.palette.secondary = hexMatches[0];
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

export function readMacrostructure(hallmarkRoot, slug) {
  const macros = loadMacrostructures(hallmarkRoot);
  const target = macros.find(m => m.slug === slug || m.slug.startsWith(slug));
  if (!target) {
    throw new Error(`Macrostructure "${slug}" not found in Hallmark. Available: ${macros.map(m => m.slug).join(', ')}`);
  }
  return { ...target, content: fs.readFileSync(target.file, 'utf8') };
}

export function runCLI(args) {
  let hallmarkPath = null;
  const filteredArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      hallmarkPath = args[++i];
    } else {
      filteredArgs.push(args[i]);
    }
  }

  const [cmd = 'list', target] = filteredArgs;
  if (cmd === 'list') {
    return {
      hallmarkPath: resolveHallmarkPath(hallmarkPath),
      macrostructures: loadMacrostructures(hallmarkPath).map(m => ({ slug: m.slug, name: m.name })),
      themes: loadThemes(hallmarkPath).map(t => ({ slug: t.slug || t.name, name: t.name, palette: t.palette }))
    };
  }
  if (cmd === 'macro' && target) {
    return readMacrostructure(hallmarkPath, target);
  }
  if (cmd === 'theme' && target) {
    const themes = loadThemes(hallmarkPath);
    const found = themes.find(t => (t.slug || t.name) === target);
    if (!found) throw new Error(`Theme "${target}" not found.`);
    return found;
  }
  throw new Error(`Usage: node tools/hallmark.mjs [--from <path>] [list | macro <slug> | theme <slug>]`);
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
