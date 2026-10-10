import { createScene, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES } from '../spike/scene.mjs';
import fs from 'node:fs/promises';
import { invalid, LIMITS, validateFixtureShape } from '../request.mjs';

export const version = '1.0.0';
export const name = 'nutrition';
export const TEXT_IDS = NUTRITION_TEXT_IDS;
export const CONTAINMENT = NUTRITION_CONTAINMENT;

export async function validate(fixture) {
  const shape = JSON.parse(await fs.readFile(new URL('../spike/fixture.json', import.meta.url), 'utf8'));
  shape.sections.header.caption = ''; // Only optional delivered text field.
  validateFixtureShape(fixture, shape);
  if (fixture.width * fixture.height > LIMITS.renderPixels) throw invalid('fixture.width', 'render area exceeds budget');
  return fixture;
}

export async function buildScene(fixture, sizes) {
  return createScene(fixture, sizes);
}

// Keep old exports for backward compatibility during transition if needed
export { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES, validate as validateNutrition, buildScene as buildNutritionScene };
