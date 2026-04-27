import type { IngredientId, CalculatorInputs, TargetPotion, ShortfallItem, TargetAchievability } from '@/types'
import { RECIPE_BY_ID } from '@/data/recipes'
import type { ResolveConfig } from './types'
import { resolveChain, emptyResolveState } from './resolution'

export function computeAchievability(
  activeTargets: TargetPotion[],
  shortfalls: ShortfallItem[],
  inputs: CalculatorInputs,
): TargetAchievability[] {
  if (shortfalls.length === 0) return []

  return activeTargets.flatMap(target => {
    const recipe = RECIPE_BY_ID.get(target.potionId)
    const name = recipe?.name ?? target.potionId
    const ingredientsPerCraft = getIngredientsPerCraft(target.potionId, inputs)

    let possible = target.qty
    for (const sf of shortfalls) {
      const neededPerCraft = ingredientsPerCraft.get(sf.id)?.qty ?? 0
      if (neededPerCraft > 0) {
        const maxCrafts = target.qty - Math.ceil(sf.qty / neededPerCraft)
        possible = Math.min(possible, Math.max(0, maxCrafts))
      }
    }

    return possible < target.qty ? [{ potionId: target.potionId, name, requested: target.qty, possible }] : []
  })
}

function getIngredientsPerCraft(targetId: IngredientId, inputs: CalculatorInputs) {
  const config: ResolveConfig = {
    level: inputs.herbloreLevel,
    secondaryModes: inputs.secondaryModes,
    disabledRecipes: inputs.disabledRecipes,
    preferredTier: inputs.preferredRecipeTier,
    perks: inputs.perks,
  }
  const state = emptyResolveState()
  const recipe = RECIPE_BY_ID.get(targetId)
  resolveChain(targetId, recipe?.outputDose ?? 3, 1, config, state)
  return state.accumulator
}
