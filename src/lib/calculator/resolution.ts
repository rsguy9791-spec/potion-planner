import type { IngredientId, PotionDose, CalculatorInputs, Recipe } from '@/types'
import { RECIPE_BY_ID, selectBestRecipe } from '@/data/recipes'
import { accAdd, type Accumulator, type DosePool, type ResolveConfig, type ResolveState } from './types'
import { cleansingMultiplier, isCleansingSaveable } from './scroll'

export function buildSecondaryPool(inputs: CalculatorInputs): Map<IngredientId, number> {
  const pool = new Map<IngredientId, number>()
  for (const [id, mode] of inputs.secondaryModes) {
    if (mode === 'use_available') {
      pool.set(id, inputs.itemSupply.get(id) ?? 0)
    }
  }
  return pool
}

function totalDoses(supply: { threeDose: number; fourDose: number; sixDose: number }): number {
  return supply.threeDose * 3 + supply.fourDose * 4 + supply.sixDose * 6
}

export function buildDosePool(inputs: CalculatorInputs): DosePool {
  const pool: DosePool = new Map()
  for (const [id, supply] of inputs.potionSupply) {
    pool.set(id, totalDoses(supply))
  }
  return pool
}

function deductFromDosePool(
  id: IngredientId,
  qty: number,
  requiredDose: PotionDose,
  state: ResolveState,
): number {
  const dosesRequired = qty * requiredDose
  const dosesAvailable = state.dosePool.get(id) ?? 0
  const consumed = Math.min(dosesAvailable, dosesRequired)
  state.dosePool.set(id, dosesAvailable - consumed)
  if (consumed > 0) {
    state.dosesConsumedFromSupply.set(id, (state.dosesConsumedFromSupply.get(id) ?? 0) + consumed)
  }
  return dosesRequired - consumed
}

/**
 * Returns how many crafts to execute vs. buy as supply, based on secondary modes.
 * Returns null when a 'skip' mode forces the entire recipe to become a purchase.
 */
function computeCraftLimits(
  recipe: Recipe,
  craftsNeeded: number,
  config: ResolveConfig,
  state: ResolveState,
): { craftsToExecute: number; craftsToBuy: number } | null {
  const nonPotionInputs = recipe.inputs.filter(inp => inp.kind !== 'potion')

  if (nonPotionInputs.some(inp => config.secondaryModes.get(inp.id) === 'skip')) {
    return null
  }

  let craftsToExecute = craftsNeeded
  for (const inp of nonPotionInputs) {
    if (config.secondaryModes.get(inp.id) !== 'use_available') continue
    const available = state.secondaryPool.get(inp.id) ?? 0
    craftsToExecute = Math.min(craftsToExecute, Math.floor(available / inp.qty))
  }

  return { craftsToExecute, craftsToBuy: craftsNeeded - craftsToExecute }
}

function recurseInputs(
  recipe: Recipe,
  craftsToExecute: number,
  config: ResolveConfig,
  state: ResolveState,
): void {
  const multiplier = cleansingMultiplier(recipe, config.scrollOfCleansing)

  state.visiting.add(recipe.id)
  for (const [index, input] of recipe.inputs.entries()) {
    if (input.kind === 'potion') {
      const saveable = config.scrollOfCleansing && isCleansingSaveable(input, index)
      let effectiveCrafts = saveable ? Math.ceil(craftsToExecute * multiplier) : craftsToExecute

      if (input.dose) {
        const childRecipe = RECIPE_BY_ID.get(input.id)
        if (childRecipe && input.dose !== childRecipe.outputDose) {
          // Track scroll-adjusted consumption at the non-native dose for decant display.
          const existing = state.decantConsumed.get(input.id)
          state.decantConsumed.set(input.id, {
            targetDose: input.dose,
            count: (existing?.count ?? 0) + effectiveCrafts * input.qty,
          })
        }
      }

      resolveChain(input.id, input.dose!, effectiveCrafts * input.qty, config, state)
    } else {
      const saveable = config.scrollOfCleansing && isCleansingSaveable(input, index)
      const qty = saveable
        ? Math.ceil(craftsToExecute * multiplier) * input.qty
        : craftsToExecute * input.qty
      const rawQty = craftsToExecute * input.qty
      accAdd(state.accumulator, input.id, qty, rawQty)
    }
  }
  state.visiting.delete(recipe.id)
}

export function resolveChain(
  id: IngredientId,
  requiredDose: PotionDose,
  qty: number,
  config: ResolveConfig,
  state: ResolveState,
): void {
  if (qty <= 0) return

  if (state.visiting.has(id)) {
    throw new Error(`Cycle detected in recipe graph at: ${id}`)
  }

  const recipe = selectBestRecipe(id, config.level, config.preferredTier)

  if (!recipe) {
    if (RECIPE_BY_ID.has(id)) {
      const dosesStillNeeded = deductFromDosePool(id, qty, requiredDose, state)
      if (dosesStillNeeded > 0) {
        const n = Math.ceil(dosesStillNeeded / requiredDose)
        accAdd(state.accumulator, id, n, n)
      }
    } else {
      accAdd(state.accumulator, id, qty, qty)
    }
    return
  }

  // ── Recipe disabled: treat as purchase ───────────────────────────────────────
  const recipeKey = recipe.recipeGroup ?? recipe.id
  if (config.disabledRecipes.has(recipe.id) || config.disabledRecipes.has(recipeKey)) {
    const stillNeeded = deductFromDosePool(id, qty, requiredDose, state)
    const n = stillNeeded > 0 ? Math.ceil(stillNeeded / requiredDose) : 0
    // Always add to accumulator (even with 0) so the potion appears in the
    // ingredients list when supply covers the need.
    accAdd(state.accumulator, id, n, n)
    return
  }

  // ── Dose pool deduction ──────────────────────────────────────────────────────
  const dosesStillNeeded = deductFromDosePool(id, qty, requiredDose, state)
  if (dosesStillNeeded <= 0) return

  const craftsNeeded = Math.ceil(dosesStillNeeded / recipe.outputDose)

  // ── Secondary mode handling ──────────────────────────────────────────────────
  const craftLimits = computeCraftLimits(recipe, craftsNeeded, config, state)
  if (craftLimits === null) {
    // skip mode: entire recipe becomes a purchase
    accAdd(state.accumulator, id, craftsNeeded, craftsNeeded)
    return
  }

  const { craftsToExecute, craftsToBuy } = craftLimits

  // Consume use_available secondary pool for crafts we will execute
  for (const inp of recipe.inputs) {
    if (inp.kind === 'potion') continue
    if (config.secondaryModes.get(inp.id) !== 'use_available') continue
    const available = state.secondaryPool.get(inp.id) ?? 0
    state.secondaryPool.set(inp.id, available - craftsToExecute * inp.qty)
  }

  // ── Recurse for crafts we can execute ────────────────────────────────────────
  if (craftsToExecute > 0) {
    recurseInputs(recipe, craftsToExecute, config, state)

    // Post-order: record this craft after all inputs are resolved (children before parents).
    // Use recipe.id (not id) so that tier-variant recipes are stored under their own key,
    // allowing buildSteps to look up the correct recipe (e.g. elder_overload_salve_from_salve
    // instead of the default elder_overload_salve when "From supreme salve" is selected).
    if (!state.craftCounts.has(recipe.id)) state.craftOrder.push(recipe.id)
    state.craftCounts.set(recipe.id, (state.craftCounts.get(recipe.id) ?? 0) + craftsToExecute)
  }

  // ── Remaining crafts become required supply of this potion ───────────────────
  if (craftsToBuy > 0) {
    accAdd(state.accumulator, id, craftsToBuy, craftsToBuy)
  }
}

export function emptyResolveState(): ResolveState {
  return {
    dosePool: new Map(),
    dosesConsumedFromSupply: new Map(),
    secondaryPool: new Map(),
    accumulator: new Map() as Accumulator,
    visiting: new Set(),
    craftCounts: new Map(),
    craftOrder: [],
    decantConsumed: new Map(),
  }
}
