import type { Recipe, RecipeIngredient } from '@/types'

export function isCleansingSaveable(inp: RecipeIngredient, index: number): boolean {
  if (index === 0) return false                    // primary input (vial, base potion) — never saved
  if (inp.cleansingSaveable === false) return false // explicit exception (runes etc.)
  return true                                      // secondary, herb_clean, misc, potion at index 1+
}

/**
 * The scroll's 10% save chance is applied differently depending on recipe type:
 * - twoStepMix recipes (standard 3-dose potions): two independent mixing steps,
 *   each saveable ingredient gets its own 10% roll → multiplier = 0.9 each.
 * - Multi-ingredient recipes (e.g. overloads): the 10% is shared evenly across
 *   all N saveable ingredients → each gets (10/N)% → multiplier = 1 - 0.1/N.
 * Returns 1 when scroll is off or no ingredients are saveable.
 */
export function cleansingMultiplier(recipe: Recipe, scrollActive: boolean): number {
  if (!scrollActive) return 1
  if (recipe.twoStepMix) return 0.9
  const saveableCount = recipe.inputs.filter((inp, idx) => isCleansingSaveable(inp, idx)).length
  return saveableCount > 0 ? 1 - 0.1 / saveableCount : 1
}
