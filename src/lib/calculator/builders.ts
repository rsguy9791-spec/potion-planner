import type { IngredientId, PotionDose, CalculatorInputs, IngredientResult, CraftStep, PerksConfiguration } from '@/types'
import { RECIPE_BY_ID, INGREDIENT_MAP } from '@/data/recipes'
import type { Accumulator } from './types'
import { cleansingMultiplier, isCleansingSaveable } from './scroll'

const KIND_ORDER: Record<string, number> = {
  herb: 0,
  secondary:  1,
  potion:     2,
  vial:       3,
  misc:       3,
}

export function buildResults(
  accumulator: Accumulator,
  dosesConsumedFromSupply: Map<IngredientId, number>,
  inputs: CalculatorInputs,
): IngredientResult[] {
  const results: IngredientResult[] = []

  for (const [id, { qty: netNeeded, rawQty: rawNetNeeded }] of accumulator) {
    const def = INGREDIENT_MAP.get(id)
    const recipeEntry = !def ? RECIPE_BY_ID.get(id) : undefined
    const name = def?.name ?? recipeEntry?.name ?? id
    const kind = def?.kind ?? (recipeEntry ? 'potion' : 'misc')
    const tradeable = def?.tradeable ?? recipeEntry?.tradeable ?? true

    let currentlyHave = 0
    let totalNeeded = netNeeded

    if (kind === 'herb') {
      const cleanId = id.startsWith('clean_') ? id : (def?.pairedHerbId ?? id)
      const herbSupply = inputs.herbSupply.get(cleanId)
      if (herbSupply) currentlyHave = herbSupply.cleanQty + herbSupply.grimyQty
    } else if (kind === 'potion' || kind === 'unfinished_potion') {
      const consumedDoses = dosesConsumedFromSupply.get(id) ?? 0
      const outputDose = recipeEntry?.outputDose ?? 3
      currentlyHave = Math.floor(consumedDoses / outputDose)
      totalNeeded = netNeeded + currentlyHave
    } else {
      currentlyHave = inputs.itemSupply.get(id) ?? 0
    }

    const rawQty = (kind === 'potion' || kind === 'unfinished_potion')
      ? rawNetNeeded + currentlyHave
      : rawNetNeeded

    results.push({
      id, name, kind, totalNeeded, rawQty, currentlyHave,
      stillNeeded: Math.max(0, totalNeeded - currentlyHave),
      tradeable,
    })
  }

  results.sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) || a.name.localeCompare(b.name))
  return results
}

export function buildSteps(
  craftCounts: Map<IngredientId, number>,
  craftOrder: IngredientId[],
  decantConsumed: Map<IngredientId, { targetDose: PotionDose; count: number }>,
  perks: PerksConfiguration,
): CraftStep[] {
  const crafted = new Set(craftCounts.keys())
  const decantMap = new Map<IngredientId, { dose: PotionDose; count: number }>()
  for (const [id, consumed] of decantConsumed) {
    if (crafted.has(id)) decantMap.set(id, { dose: consumed.targetDose, count: consumed.count })
  }

  return craftOrder
    .filter(id => (craftCounts.get(id) ?? 0) > 0)
    .map(id => {
      const crafts = craftCounts.get(id)!
      const recipe = RECIPE_BY_ID.get(id)!
      const multiplier = cleansingMultiplier(recipe, perks.scrollOfCleansing)
      const stepKind: CraftStep['stepKind'] = recipe.category === 'unfinished' ? 'unfinished' : 'potion'

      const inputs = recipe.inputs.map((inp, index) => {
        const name = INGREDIENT_MAP.get(inp.id)?.name ?? RECIPE_BY_ID.get(inp.id)?.name ?? inp.id
        const rawQty = crafts * inp.qty
        const saveable = perks.scrollOfCleansing && isCleansingSaveable(inp, index)
        const qty = saveable ? Math.ceil(crafts * multiplier) * inp.qty : rawQty

        let decantFrom: { fromDose: PotionDose; fromCount: number } | undefined
        if (inp.kind === 'potion' && inp.dose) {
          const decant = decantMap.get(inp.id)
          if (decant && decant.dose === inp.dose) {
            const childRecipe = RECIPE_BY_ID.get(inp.id)
            if (childRecipe && childRecipe.outputDose !== inp.dose) {
              decantFrom = {
                fromDose: childRecipe.outputDose,
                fromCount: Math.ceil(qty * inp.dose / childRecipe.outputDose),
              }
            }
          }
        }

        return { id: inp.id, name, kind: inp.kind, qty, rawQty, dose: inp.dose, ...(decantFrom ? { decantFrom } : {}) }
      })

      // XP calculation
      const baseBoostPercent = perks.clanFealtyPercent + perks.botanistXpPercent + perks.customXpPercent
      const jujuBonus = perks.perfectJujuPotion && recipe.category === 'combination' ? 5 : 0
      const boostMultiplier = 1 + (baseBoostPercent + jujuBonus) / 100
      const xpGained = recipe.xpPerCraft ? Math.round(crafts * recipe.xpPerCraft * boostMultiplier) : 0

      return {
        potionId: id,
        name: recipe.name,
        category: recipe.category,
        stepKind,
        crafts,
        outputDose: recipe.outputDose,
        inputs,
        xpGained,
      } satisfies CraftStep
    })
}
