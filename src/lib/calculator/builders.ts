import type { IngredientId, PotionDose, CalculatorInputs, IngredientResult, CraftStep } from '@/types'
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
    } else if (kind === 'potion') {
      const consumedDoses = dosesConsumedFromSupply.get(id) ?? 0
      const outputDose = recipeEntry?.outputDose ?? 3
      currentlyHave = Math.floor(consumedDoses / outputDose)
      totalNeeded = netNeeded + currentlyHave
    } else {
      currentlyHave = inputs.itemSupply.get(id) ?? 0
    }

    const rawQty = kind === 'potion' ? rawNetNeeded + currentlyHave : rawNetNeeded

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
  scrollOfCleansing: boolean,
  unfConsumed: Map<IngredientId, number>,
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
      const multiplier = cleansingMultiplier(recipe, scrollOfCleansing)
      const fromSupply = unfConsumed.get(id) ?? 0
      const step1Crafts = recipe.twoStepMix ? crafts - fromSupply : crafts

      // For twoStepMix recipes, identify the herb so we can insert the unf-from-supply
      // entry immediately after it in one forward pass (no post-hoc mutation).
      const herbRecipeInput = recipe.twoStepMix
        ? recipe.inputs.find(i => i.kind === 'herb')
        : undefined
      const herbName = herbRecipeInput
        ? (INGREDIENT_MAP.get(herbRecipeInput.id)?.name ?? herbRecipeInput.id)
        : ''

      const inputs = recipe.inputs.flatMap((inp, index) => {
        const name = INGREDIENT_MAP.get(inp.id)?.name ?? RECIPE_BY_ID.get(inp.id)?.name ?? inp.id
        const isStep1Input = recipe.twoStepMix && (inp.kind === 'vial' || inp.kind === 'herb')
        const craftsBase = isStep1Input ? step1Crafts : crafts
        const rawQty = craftsBase * inp.qty
        const saveable = scrollOfCleansing && isCleansingSaveable(inp, index)
        const qty = saveable ? Math.ceil(craftsBase * multiplier) * inp.qty : rawQty

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

        const entry = { id: inp.id, name, kind: inp.kind, qty, rawQty, dose: inp.dose, ...(decantFrom ? { decantFrom } : {}) }

        // After the herb, emit the unf-from-supply entry (if any) so it sits naturally
        // between the step-1 inputs (vial + herb) and the step-2 secondary.
        if (inp.kind === 'herb' && fromSupply > 0) {
          return [entry, { id: inp.id, name: `${herbName} (unf)`, kind: 'unfinished_potion' as const, qty: fromSupply, rawQty: fromSupply }]
        }

        return [entry]
      })

      const step: CraftStep = {
        potionId: id,
        name: recipe.name,
        category: recipe.category,
        crafts,
        outputDose: recipe.outputDose,
        inputs,
      }

      if (recipe.twoStepMix) {
        step.unfStep = { crafts: step1Crafts, fromSupply, herbName }
      }

      return step
    })
}
