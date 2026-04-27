import type { IngredientId, CalculatorInputs, IngredientResult, CalculationResult, TargetPotion, ShortfallItem } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { RECIPE_BY_ID } from '@/data/recipes'
import type { ResolveConfig } from './types'
import { resolveChain, emptyResolveState, buildDosePool, buildSecondaryPool } from './resolution'
import { buildResults, buildSteps } from './builders'
import { computeAchievability } from './achievability'

export function calculateAll(
  inputs: CalculatorInputs,
  targets: TargetPotion[],
): CalculationResult {
  const activeTargets = targets.filter(t => t.potionId && t.qty > 0)

  if (activeTargets.length === 0) {
    return { targets: [], ingredients: [], steps: [], shortfalls: [], achievability: [] }
  }

  const config: ResolveConfig = {
    level: inputs.herbloreLevel,
    secondaryModes: inputs.secondaryModes,
    disabledRecipes: inputs.disabledRecipes,
    preferredTier: inputs.preferredRecipeTier,
    perks: inputs.perks,
  }

  const state = {
    ...emptyResolveState(),
    dosePool: buildDosePool(inputs),
    secondaryPool: buildSecondaryPool(inputs),
  }

  for (const target of activeTargets) {
    const recipe = RECIPE_BY_ID.get(target.potionId)
    resolveChain(target.potionId, recipe?.outputDose ?? 3, target.qty, config, state)
  }

  const targetSummary = activeTargets.map(t => ({
    name: RECIPE_BY_ID.get(t.potionId)?.name ?? t.potionId,
    qty: t.qty,
  }))

  const ingredients = buildResults(state.accumulator, state.dosesConsumedFromSupply, inputs)

  const shortfalls: ShortfallItem[] = ingredients
    .filter(r => !r.tradeable && r.stillNeeded > 0)
    .map(r => ({ id: r.id, name: r.name, qty: r.stillNeeded }))

  return {
    targets: targetSummary,
    ingredients,
    steps: buildSteps(state.craftCounts, state.craftOrder, state.decantConsumed, inputs.perks),
    shortfalls,
    achievability: computeAchievability(activeTargets, shortfalls, inputs),
  }
}

export function getIngredientList(
  targetPotionId: IngredientId,
  level: number,
): IngredientResult[] {
  const emptyInputs: CalculatorInputs = {
    herbloreLevel: level,
    herbSupply: new Map(),
    itemSupply: new Map(),
    potionSupply: new Map(),
    secondaryModes: new Map(),
    disabledRecipes: new Set(),
    preferredRecipeTier: new Map(),
    perks: { ...DEFAULT_CONFIG },
  }
  const config: ResolveConfig = {
    level,
    secondaryModes: new Map(),
    disabledRecipes: new Set(),
    preferredTier: new Map(),
    perks: { ...DEFAULT_CONFIG },
  }
  const state = emptyResolveState()
  const recipe = RECIPE_BY_ID.get(targetPotionId)
  resolveChain(targetPotionId, recipe?.outputDose ?? 3, 1, config, state)
  return buildResults(state.accumulator, state.dosesConsumedFromSupply, emptyInputs)
}
