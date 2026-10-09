import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

export const LIMITS = { inputBytes: 256 * 1024, assetBytes: 5 * 1024 * 1024, assetPixels: 16777216, renderPixels: 16777216, outputBytes: 64 * 1024 * 1024 };
export const within = (root, target) => { const rel = path.relative(root, target); return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel)); };
export const invalid = (field, message) => new Error('Validation failed: ' + JSON.stringify([{ field, message }]));

// One descriptor and at most limit+1 bytes, even if the file grows after stat.
export async function readBounded(file, limit, field = 'inputPath') {
  const handle = await fs.open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw invalid(field, 'must be a regular file');
    if (stat.size > limit) throw invalid(field, 'byte budget exceeded');
    const buffer = Buffer.alloc(limit + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await handle.read(buffer, size, buffer.length - size, null);
      if (!bytesRead) break;
      size += bytesRead;
    }
    if (size > limit) throw invalid(field, 'byte budget exceeded');
    return Buffer.from(buffer.subarray(0, size));
  } finally { await handle.close(); }
}

export async function normalizeRequest(req, options = {}) {
  if (!req || typeof req !== 'object' || Array.isArray(req)) throw invalid('request', 'must be an object');
  for (const key of Object.keys(req)) if (!['inputPath', 'width', 'height', 'format', 'backend', 'scale', 'recipe'].includes(key)) throw invalid(key, 'unknown or unsupported field');

  if (typeof req.inputPath !== 'string' || !req.inputPath) throw invalid('inputPath', 'missing input');
  const root = await fs.realpath(options.root ?? process.cwd());
  let inputPath;
  try { inputPath = await fs.realpath(path.resolve(root, req.inputPath)); }
  catch { throw invalid('inputPath', 'missing input'); }
  if (!within(root, inputPath)) throw invalid('inputPath', 'symlink escape rejection');
  const input = await readBounded(inputPath, LIMITS.inputBytes);
  let fixture;
  try { fixture = JSON.parse(input.toString('utf8')); }
  catch { throw invalid('inputPath', 'invalid JSON'); }

  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) throw invalid('fixture', 'must be an object');
  const recipe = req.recipe ?? (fixture?.id === 'nutrition-infographic' ? 'nutrition' : fixture?.id === 'solar-system-diagram' ? 'solar-system' : undefined);
  if (!['nutrition', 'solar-system'].includes(recipe)) throw invalid('recipe', 'select a trusted nutrition or solar-system recipe');
  const dimensions = recipe === 'nutrition' ? [1000, 1000] : [2400, 1700];
  const width = req.width ?? fixture.width ?? 1000, height = req.height ?? fixture.height ?? 1000;
  for (const [key, value] of [['width', width], ['height', height]]) {
    if (!Number.isInteger(value) || value <= 0 || value > 8192) throw invalid(key, 'invalid dimension');
  }
  if (width * height > LIMITS.renderPixels) throw invalid('width', 'render area exceeds budget');

  if (width !== dimensions[0] || height !== dimensions[1]) throw invalid('width', 'only the recipe-owned canvas is supported');
  if (req.scale !== undefined && req.scale !== 1) throw invalid('scale', 'only scale 1 is supported');
  const format = req.format ?? 'png', backend = req.backend ?? 'satori';
  if (!['png', 'svg', 'html'].includes(format)) throw invalid('format', 'unsupported format');
  if (!['satori', 'playwright'].includes(backend)) throw invalid('backend', 'unsupported backend');
  if (backend === 'playwright' && format === 'svg') throw invalid('format', 'Playwright has no SVG export');

  return { normalized: { inputPath, width, height, format, backend, scale: 1, recipe }, fixture, input };
}

// Existing delivered shapes own the schema; both trusted recipes share bounded traversal.
export function validateFixtureShape(value, expected, field = 'fixture') {
  if (Array.isArray(expected)) {
    if (!Array.isArray(value) || value.length !== expected.length) throw invalid(field, `requires ${expected.length} entries`);
    value.forEach((item, i) => validateFixtureShape(item, expected[i], `${field}[${i}]`));
  } else if (expected && typeof expected === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid(field, 'must be an object');
    for (const key of Object.keys(value)) if (!Object.hasOwn(expected, key)) throw invalid(`${field}.${key}`, 'unknown field');
    for (const key of Object.keys(expected)) {
      if (field === 'fixture.sections.header' && key === 'caption' && value[key] === undefined) continue;
      validateFixtureShape(value[key], expected[key], `${field}.${key}`);
    }
  } else if (typeof expected === 'number') {
    const angle = field.endsWith('.angle');
    if (!Number.isFinite(value) || (angle ? Math.abs(value) > 360 : value <= 0 || value > 8192)) throw invalid(field, 'invalid bounded geometry');
    if ((field === 'fixture.width' || field === 'fixture.height') && value !== expected) throw invalid(field, 'only recipe-owned dimensions are supported');
  } else {
    if (typeof value !== 'string' || value.length > 2048 || (!value.length && !field.endsWith('.caption'))) throw invalid(field, 'requires bounded text');
    if ((field.startsWith('fixture.theme.') || field.endsWith('.color')) && !/^#[0-9a-f]{6}$/i.test(value)) throw invalid(field, 'requires #rrggbb color');
    if (/\.(illustrationId|ornamentId|endIconId|iconId)$/.test(field) && !/^[A-Za-z0-9_-]+$/.test(value)) throw invalid(field, 'invalid asset id');
    if (/\.(id|asset|index)$/.test(field) && value !== expected) throw invalid(field, 'unsupported recipe identity or asset');
  }
}
