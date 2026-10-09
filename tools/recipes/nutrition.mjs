import { createScene, NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES } from '../spike/scene.mjs';

export const version = '1.0.0';
export const name = 'nutrition';

export async function buildNutritionScene(fixture, sizes) {
  return createScene(fixture, sizes);
}

export { NUTRITION_TEXT_IDS, NUTRITION_CONTAINMENT, DEFAULT_SIZES };
