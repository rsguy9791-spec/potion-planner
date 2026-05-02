import { computed } from 'vue'
import type { IngredientId, PotionCategory, HerbSupplyRow, PotionSupplyRow, ItemSupplyRow } from '@/types'
import { INGREDIENTS, INGREDIENT_MAP, SUPPLY_POTION_IDS, RECIPE_BY_ID } from '@/data/recipes'
import { CATEGORY_ORDER } from '@/data/constants'
import { useCalculator } from './useCalculator'

export function useSupply() {
  const {
    inputs, result,
    setHerbClean, setHerbGrimy, setHerbUnf,
    setItemQty,
    setPotionThreeDose, setPotionFourDose, setPotionSixDose,
    resetCategory,
  } = useCalculator()

  const data = computed(() => {
    const resultById = new Map(
      (result.value?.ingredients ?? []).map(r => [r.id, r])
    )

    // Potions used as inputs in crafting steps should surface in the supply list
    // even when fully covered by crafting (they never enter the accumulator in that case)
    const intermediatePotionIds = new Set(
      (result.value?.steps ?? []).flatMap(s =>
        s.inputs.filter(i => i.kind === 'potion').map(i => i.id)
      )
    )

    function base(id: IngredientId, r: ReturnType<typeof resultById.get>) {
      const totalNeeded = r?.totalNeeded ?? 0
      const rawQty = r?.rawQty ?? 0
      return { id, totalNeeded, rawQty, scrollSavings: rawQty - totalNeeded, remaining: r?.stillNeeded ?? 0 }
    }

    function makeHerbRow(id: IngredientId, name: string, tradeable: boolean): HerbSupplyRow {
      const r = resultById.get(id)
      const b = base(id, r)
      const hs = inputs.herbSupply.get(id)
      return {
        ...b, name, kind: 'herb', herbId: id, tradeable,
        qtyClean: hs?.cleanQty ?? 0,
        qtyGrimy: hs?.grimyQty ?? 0,
        qtyUnf: hs?.unfQty ?? 0,
        isNeeded: b.totalNeeded > 0,
      }
    }

    function makePotionRow(id: IngredientId, name: string, category: PotionCategory, isFlask: boolean, tradeable: boolean): PotionSupplyRow {
      const r = resultById.get(id)
      const b = base(id, r)
      const ps = inputs.potionSupply.get(id)
      return {
        ...b, name, kind: 'potion', category, isFlask, tradeable,
        qtyThree: ps?.threeDose ?? 0,
        qtyFour: ps?.fourDose ?? 0,
        qtySix: ps?.sixDose ?? 0,
        isNeeded: b.totalNeeded > 0 || intermediatePotionIds.has(id),
      }
    }

    function makeItemRow(id: IngredientId, name: string, kind: ItemSupplyRow['kind'], tradeable: boolean): ItemSupplyRow {
      const r = resultById.get(id)
      const b = base(id, r)
      return {
        ...b, name, kind, tradeable,
        qty: inputs.itemSupply.get(id) ?? 0,
        isNeeded: b.totalNeeded > 0,
      }
    }

    // Herb rows (clean + grimy + unf inputs combined)
    const herbRows: HerbSupplyRow[] = INGREDIENTS
      .filter(i => i.kind === 'herb' && !i.id.startsWith('grimy_'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(herb => makeHerbRow(herb.id, herb.name, herb.tradeable !== false))

    // Potions grouped by category
    const potionsByCategory = new Map<PotionCategory, PotionSupplyRow[]>()
    for (const id of SUPPLY_POTION_IDS) {
      const recipe = RECIPE_BY_ID.get(id)
      const name = recipe?.name ?? INGREDIENT_MAP.get(id)?.name ?? id
      const category = (recipe?.category ?? 'regular') as PotionCategory
      const isFlask = (recipe?.outputDose ?? 3) === 6
      const tradeable = recipe?.tradeable !== false
      const row = makePotionRow(id, name, category, isFlask, tradeable)
      const bucket = potionsByCategory.get(category) ?? []
      bucket.push(row)
      potionsByCategory.set(category, bucket)
    }

    const activePotionCategories = CATEGORY_ORDER.filter(cat => potionsByCategory.has(cat))

    const secondaryRows: ItemSupplyRow[] = INGREDIENTS
      .filter(i => i.kind === 'secondary')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(i => makeItemRow(i.id, i.name, 'secondary', i.tradeable !== false))

    const vialRows: ItemSupplyRow[] = INGREDIENTS
      .filter(i => i.kind === 'vial' || i.kind === 'misc')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(i => makeItemRow(i.id, i.name, i.kind as ItemSupplyRow['kind'], i.tradeable !== false))

    return { herbRows, potionsByCategory, activePotionCategories, secondaryRows, vialRows }
  })

  return {
    data,
    setHerbClean, setHerbGrimy, setHerbUnf,
    setItemQty,
    setPotionThreeDose, setPotionFourDose, setPotionSixDose,
    resetCategory,
  }
}
