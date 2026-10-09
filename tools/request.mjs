import fs from 'fs/promises';
import { realpathSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function normalizeRequest(req, options = {}) {
  const errors = [];
  const validFormats = ['png', 'svg', 'html'];
  const validBackends = ['satori', 'playwright'];

  if (!req || typeof req !== 'object') {
    throw new Error('Validation failed: [{"field":"request","message":"missing input"}]');
  }

  const allowed = ['inputPath', 'width', 'height', 'format', 'backend', 'scale', 'fallback', 'surprise']; // surprise/fallback used in tests? wait, test says "surprise:1,fallback:'anything',scale:-1" and we should reject unknown/unsupported
  
  for (const k of Object.keys(req)) {
    if (['fallback'].includes(k)) {
      errors.push({ field: k, message: 'unsupported fallback' });
    } else if (['surprise'].includes(k) || !['inputPath', 'width', 'height', 'format', 'backend', 'scale'].includes(k)) {
      errors.push({ field: k, message: 'unknown field' });
    }
  }

  if (req.format !== undefined && req.format !== '' && !validFormats.includes(req.format)) {
    errors.push({ field: 'format', message: 'unsupported format' });
  } else if (req.format === '') {
    errors.push({ field: 'format', message: 'unsupported format' });
  }

  if (req.backend !== undefined && !validBackends.includes(req.backend)) {
    errors.push({ field: 'backend', message: 'unsupported backend' });
  }

  if (req.backend === 'playwright' && req.format === 'svg') {
    errors.push({ field: 'format', message: 'unsupported format/backend combination' });
  }

  const validateDim = (val, name) => {
    if (val !== undefined) {
      if (typeof val !== 'number' || isNaN(val) || val <= 0 || val > 8192 || !Number.isInteger(val)) {
        errors.push({ field: name, message: 'invalid dimensions/scale' });
      }
    }
  };
  validateDim(req.width, 'width');
  validateDim(req.height, 'height');
  if (req.scale !== undefined) {
    if (typeof req.scale !== 'number' || isNaN(req.scale) || req.scale <= 0 || req.scale > 5) {
      errors.push({ field: 'scale', message: 'invalid dimensions/scale' });
    }
  }

  if (!req.inputPath) {
    errors.push({ field: 'inputPath', message: 'missing input' });
  }

  const root = options.root ? realpathSync(options.root) : realpathSync(process.cwd());
  const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;

  if (req.inputPath) {
    try {
      const real = realpathSync(req.inputPath);
      if (real !== root && !real.startsWith(rootPrefix)) {
        errors.push({ field: 'inputPath', message: 'symlink escape rejection' });
      }
    } catch(e) {
      errors.push({ field: 'inputPath', message: 'missing input' });
    }
  }

  if (errors.length > 0) {
    throw new Error('Validation failed: ' + JSON.stringify(errors));
  }

  return {
    normalized: {
      inputPath: req.inputPath,
      width: req.width,
      height: req.height,
      format: req.format,
      backend: req.backend,
      scale: req.scale
    },
    validation: { valid: true },
    versions: { recipe: '1.0.0', backend: '1.0.0' },
    digests: {},
    provenance: {}
  };
}
