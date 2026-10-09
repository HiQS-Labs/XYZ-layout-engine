import { createScene, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES } from '../spike/scene.mjs';
import fs from 'node:fs/promises';
import { invalid, LIMITS } from '../request.mjs';

export const version = '1.0.0';
export const name = 'nutrition';

export async function validateNutrition(fixture) {
  const shape = JSON.parse(await fs.readFile(new URL('../spike/fixture.json', import.meta.url), 'utf8'));
  shape.sections.header.caption = ''; // Only optional delivered text field.
  const walk = (value, expected, field) => {
    if (Array.isArray(expected)) {
      if (!Array.isArray(value) || value.length !== expected.length) throw invalid(field, `requires ${expected.length} entries`);
      value.forEach((v, i) => walk(v, expected[i], `${field}[${i}]`));
    } else if (expected && typeof expected === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid(field, 'must be an object');
      for (const key of Object.keys(value)) if (!Object.hasOwn(expected, key)) throw invalid(`${field}.${key}`, 'unknown field');
      for (const key of Object.keys(expected)) {
        if (field === 'fixture.sections.header' && key === 'caption' && value[key] === undefined) continue;
        walk(value[key], expected[key], `${field}.${key}`);
      }
    } else if (typeof expected === 'number') {
      if (!Number.isInteger(value) || value <= 0 || value > 8192) throw invalid(field, 'invalid dimension');
    } else {
      if (typeof value !== 'string' || value.length > 2048 || (value.length === 0 && !field.endsWith('.caption'))) throw invalid(field, 'requires bounded text');
      if (field.startsWith('fixture.theme.') && !/^#[0-9a-f]{6}$/i.test(value)) throw invalid(field, 'requires #rrggbb color');
      if (/\.(illustrationId|ornamentId|endIconId|iconId)$/.test(field) && !/^[A-Za-z0-9_-]+$/.test(value)) throw invalid(field, 'invalid asset id');
      if (field.endsWith('.id') && value !== expected) throw invalid(field, 'unsupported recipe identity');
    }
  };
  walk(fixture, shape, 'fixture');
  if (fixture.width * fixture.height > LIMITS.renderPixels) throw invalid('fixture.width', 'render area exceeds budget');
  return fixture;
}

export async function buildNutritionScene(fixture, sizes) {
  return createScene(fixture, sizes);
}

export { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES };
