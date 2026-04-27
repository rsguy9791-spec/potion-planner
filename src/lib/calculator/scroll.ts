import type { Recipe, RecipeIngredient } from '@/types'

export function isCleansingSaveable(inp: RecipeIngredient, index: number): boolean {
  if (index === 0) return false                    // primary input (vial, base potion) — never saved
  if (inp.cleansingSaveable === false) return false // explicit exception (runes etc.)
  return true                                      // secondary, herb, misc, potion at index 1+
}

/**
 * The scroll's 10% save chance is shared evenly across all N saveable ingredients
 * → each gets (10/N)% → multiplier = 1 - 0.1/N.
 * Returns 1 when scroll is off or no ingredients are saveable.
 */
export function cleansingMultiplier(recipe: Recipe, scrollActive: boolean): number {
  if (!scrollActive) return 1
  const saveableCount = recipe.inputs.filter((inp, idx) => isCleansingSaveable(inp, idx)).length
  return saveableCount > 0 ? 1 - 0.1 / saveableCount : 1
}
