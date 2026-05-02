import type { IngredientId, PotionDose, CalculatorInputs, Recipe } from '@/types'
import { RECIPE_BY_ID, selectBestRecipe, UNF_BY_HERB } from '@/data/recipes'
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
  // Seed unfinished-potion supply from herbSupply.unfQty via UNF_BY_HERB mapping
  for (const [herbId, supply] of inputs.herbSupply) {
    if (supply.unfQty <= 0) continue
    const unfId = UNF_BY_HERB.get(herbId)
    if (unfId) pool.set(unfId, (pool.get(unfId) ?? 0) + supply.unfQty)
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
  const nonPotionInputs = recipe.inputs.filter(inp => inp.kind !== 'potion' && inp.kind !== 'unfinished_potion')

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
  const multiplier = cleansingMultiplier(recipe, config.perks.scrollOfCleansing)

  state.visiting.add(recipe.id)
  for (const [index, input] of recipe.inputs.entries()) {
    if (input.kind === 'potion' || input.kind === 'unfinished_potion') {
      const saveable = config.perks.scrollOfCleansing && isCleansingSaveable(input, index)
      const effectiveCrafts = saveable ? Math.ceil(craftsToExecute * multiplier) : craftsToExecute

      if (input.kind === 'potion' && input.dose) {
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

      // Unfinished potions are always dose-1 single items
      const requiredDose = input.dose ?? 1
      resolveChain(input.id, requiredDose, effectiveCrafts * input.qty, config, state)
    } else {
      const saveable = config.perks.scrollOfCleansing && isCleansingSaveable(input, index)
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
    accAdd(state.accumulator, id, n, n)
    return
  }

  // ── Dose pool deduction ──────────────────────────────────────────────────────
  const dosesStillNeeded = deductFromDosePool(id, qty, requiredDose, state)
  if (dosesStillNeeded <= 0) return

  let craftsNeeded = Math.ceil(dosesStillNeeded / recipe.outputDose)

  // ── Factory outfit: effective output dose for 3-dose recipes ────────────────
  const cfg = config.perks
  if (cfg.factoryOutfit && recipe.outputDose === 3) {
    craftsNeeded = Math.ceil(dosesStillNeeded / (3 + 1 / 8))
  }

  // ── Duplicate-potion bonuses ─────────────────────────────────────────────────
  const maskExtra = cfg.modifiedBotanistMask ? 5 : 0
  const wellExtra = (cfg.portableWell && recipe.type !== 'combination') ? (cfg.broochOfTheGods ? 10 : 5) : 0
  const totalExtraPercent = maskExtra + wellExtra
  if (totalExtraPercent > 0) {
    craftsNeeded = Math.ceil(craftsNeeded / (1 + totalExtraPercent / 100))
  }

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
    if (inp.kind === 'potion' || inp.kind === 'unfinished_potion') continue
    if (config.secondaryModes.get(inp.id) !== 'use_available') continue
    const available = state.secondaryPool.get(inp.id) ?? 0
    state.secondaryPool.set(inp.id, available - craftsToExecute * inp.qty)
  }

  // ── Recurse for crafts we can execute ────────────────────────────────────────
  if (craftsToExecute > 0) {
    recurseInputs(recipe, craftsToExecute, config, state)

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
