import type { IngredientId, PotionDose, SecondaryMode, RecipeGroup } from '@/types'

export type DosePool = Map<IngredientId, number>

/** Accumulated ingredient quantities: effective (scroll-adjusted) and raw (unadjusted). */
export type AccEntry = { qty: number; rawQty: number }
export type Accumulator = Map<IngredientId, AccEntry>

export function accAdd(acc: Accumulator, id: IngredientId, qty: number, rawQty: number): void {
  const e = acc.get(id)
  if (e) { e.qty += qty; e.rawQty += rawQty }
  else acc.set(id, { qty, rawQty })
}

/** Immutable settings that configure the resolution — never written during traversal. */
export interface ResolveConfig {
  level: number
  secondaryModes: Map<IngredientId, SecondaryMode>
  disabledRecipes: Set<IngredientId>
  preferredTier: Map<RecipeGroup, IngredientId>
  scrollOfCleansing: boolean
}

/** Mutable working state and output collectors, written throughout traversal. */
export interface ResolveState {
  dosePool: DosePool
  /** Doses consumed from the player's supply pool (used to derive currentlyHave in results). */
  dosesConsumedFromSupply: Map<IngredientId, number>
  secondaryPool: Map<IngredientId, number>
  accumulator: Accumulator
  visiting: Set<IngredientId>
  craftCounts: Map<IngredientId, number>
  craftOrder: IngredientId[]
  /** Tracks actual scroll-adjusted consumption of each potion at a dose ≠ its native outputDose. */
  decantConsumed: Map<IngredientId, { targetDose: PotionDose; count: number }>
  /** Available unfinished potions, keyed by clean herb id. */
  unfPool: Map<IngredientId, number>
  /** Unfinished potions consumed from supply per recipe id (twoStepMix recipes only). */
  unfConsumed: Map<IngredientId, number>
}
