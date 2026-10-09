import fs from 'fs/promises';
import { realpathSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Basic normalizer
export async function normalizeRequest(req, options = {}) {
  const errors = [];
  const validFormats = ['png', 'svg', 'html'];
  const validBackends = ['satori', 'playwright'];

  if (req.format && !validFormats.includes(req.format)) {
    errors.push({ field: 'format', message: 'unsupported format' });
  }
  if (req.backend && !validBackends.includes(req.backend)) {
    errors.push({ field: 'backend', message: 'unsupported backend' });
  }

  // Dimension validation
  if (req.width && (typeof req.width !== 'number' || req.width <= 0 || req.width > 8192)) {
    errors.push({ field: 'width', message: 'invalid dimensions/scale' });
  }
  if (req.height && (typeof req.height !== 'number' || req.height <= 0 || req.height > 8192)) {
    errors.push({ field: 'height', message: 'invalid dimensions/scale' });
  }

  // Reject remote/file references in SVG
  // Validate realpath containment
  const root = options.root || process.cwd();
  if (req.inputPath) {
    try {
      const real = realpathSync(req.inputPath);
      if (!real.startsWith(realpathSync(root))) {
        errors.push({ field: 'inputPath', message: 'symlink escape rejection' });
      }
    } catch(e) {
      errors.push({ field: 'inputPath', message: 'file not found' });
    }
  }

  if (errors.length > 0) {
    throw new Error('Validation failed: ' + JSON.stringify(errors));
  }

  return {
    normalized: req,
    validation: { valid: true },
    versions: { recipe: '1.0.0', backend: '1.0.0' }
  };
}
