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
  for (const key of Object.keys(req)) if (!['inputPath', 'width', 'height', 'format', 'backend', 'scale'].includes(key)) throw invalid(key, 'unknown or unsupported field');
  const width = req.width ?? 1000, height = req.height ?? 1000;
  for (const [key, value] of [['width', width], ['height', height]]) {
    if (!Number.isInteger(value) || value <= 0 || value > 8192) throw invalid(key, 'invalid dimension');
  }
  if (width * height > LIMITS.renderPixels) throw invalid('width', 'render area exceeds budget');
  // Phase 1 delivers a fixed nutrition canvas; adaptive recipes/scaling belong to the next phase.
  if (width !== 1000 || height !== 1000) throw invalid('width', 'nutrition v1 requires 1000x1000');
  if (req.scale !== undefined && req.scale !== 1) throw invalid('scale', 'only scale 1 is supported');
  const format = req.format ?? 'png', backend = req.backend ?? 'satori';
  if (!['png', 'svg', 'html'].includes(format)) throw invalid('format', 'unsupported format');
  if (!['satori', 'playwright'].includes(backend)) throw invalid('backend', 'unsupported backend');
  if (backend === 'playwright' && format === 'svg') throw invalid('format', 'Playwright has no SVG export');
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
  return { normalized: { inputPath, width, height, format, backend, scale: 1 }, fixture, input };
}
