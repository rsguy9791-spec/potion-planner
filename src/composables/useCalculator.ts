import { reactive, computed, watch } from 'vue'
import type { CalculatorInputs, CalculationResult, HerbSupply, PotionSupply, TargetPotion, SecondaryMode, PerksConfiguration } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { calculateAll } from '@/lib/calculator'
import { RECIPES, RECIPE_GROUPS, INGREDIENT_MAP } from '@/data/recipes'

const DEFAULT_LEVEL = 120
const STORAGE_KEY = 'pots_calculator'

function emptyHerbSupply(): HerbSupply {
  return { cleanQty: 0, grimyQty: 0, unfQty: 0 }
}

function emptyPotionSupply(): PotionSupply {
  return { threeDose: 0, fourDose: 0, sixDose: 0 }
}

const inputs = reactive<CalculatorInputs>({
  herbloreLevel: DEFAULT_LEVEL,
  herbSupply: new Map(),
  itemSupply: new Map(),
  potionSupply: new Map(),
  secondaryModes: new Map(),
  disabledRecipes: new Set(),
  preferredRecipeTier: new Map(),
  perks: { ...DEFAULT_CONFIG },
})

const targets = reactive<TargetPotion[]>([{ potionId: '', qty: 1 }])

// ─── Persistence ──────────────────────────────────────────────────────────────

const STATE_VERSION = 1

function serializeState() {
  return JSON.stringify({
    version: STATE_VERSION,
    herbloreLevel: inputs.herbloreLevel,
    herbSupply: [...inputs.herbSupply.entries()],
    itemSupply: [...inputs.itemSupply.entries()],
    potionSupply: [...inputs.potionSupply.entries()],
    secondaryModes: [...inputs.secondaryModes.entries()],
    disabledRecipes: [...inputs.disabledRecipes],
    preferredRecipeTier: [...inputs.preferredRecipeTier.entries()],
    config: inputs.perks,
    targets: [...targets],
  })
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const data = JSON.parse(saved)
    if (data.version !== STATE_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    inputs.herbloreLevel = data.herbloreLevel ?? DEFAULT_LEVEL
    inputs.herbSupply = new Map(
      (data.herbSupply ?? []).map(([id, s]: [string, any]) => [
        id, { cleanQty: s.cleanQty ?? 0, grimyQty: s.grimyQty ?? 0, unfQty: s.unfQty ?? 0 },
      ])
    )
    inputs.itemSupply = new Map(data.itemSupply ?? [])
    inputs.potionSupply = new Map(data.potionSupply ?? [])
    inputs.secondaryModes = new Map(data.secondaryModes ?? [])
    inputs.disabledRecipes = new Set(data.disabledRecipes ?? [])
    inputs.preferredRecipeTier = new Map(data.preferredRecipeTier ?? [])
    // Migrate old scrollOfCleansing boolean into config
    const migratedScroll = !!data.scrollOfCleansing
    inputs.perks = { ...DEFAULT_CONFIG, scrollOfCleansing: migratedScroll, ...(data.config ?? {}) }
    if (Array.isArray(data.targets) && data.targets.length > 0) {
      targets.splice(0, targets.length, ...data.targets)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

loadFromStorage()

watch(serializeState, (json) => {
  localStorage.setItem(STORAGE_KEY, json)
})

const result = computed<CalculationResult | null>(() => {
  const active = targets.filter(t => t.potionId && t.qty > 0)
  if (active.length === 0) return null
  return calculateAll(inputs, active)
})

function addTarget() {
  targets.push({ potionId: '', qty: 1 })
}

function removeTarget(index: number) {
  targets.splice(index, 1)
  if (targets.length === 0) targets.push({ potionId: '', qty: 1 })
}

function setTargetPotion(index: number, potionId: string) {
  targets[index].potionId = potionId
}

function setTargetQty(index: number, qty: number) {
  targets[index].qty = qty
}

function patchHerb(id: string, patch: Partial<HerbSupply>) {
  inputs.herbSupply.set(id, { ...(inputs.herbSupply.get(id) ?? emptyHerbSupply()), ...patch })
}

function patchPotion(id: string, patch: Partial<PotionSupply>) {
  inputs.potionSupply.set(id, { ...(inputs.potionSupply.get(id) ?? emptyPotionSupply()), ...patch })
}

function setHerbClean(id: string, qty: number) { patchHerb(id, { cleanQty: qty }) }
function setHerbGrimy(id: string, qty: number) { patchHerb(id, { grimyQty: qty }) }
function setHerbUnf(id: string, qty: number) { patchHerb(id, { unfQty: qty }) }

function setItemQty(itemId: string, qty: number) {
  inputs.itemSupply.set(itemId, qty)
}

function setPotionThreeDose(id: string, qty: number) { patchPotion(id, { threeDose: qty }) }
function setPotionFourDose(id: string, qty: number) { patchPotion(id, { fourDose: qty }) }
function setPotionSixDose(id: string, qty: number) { patchPotion(id, { sixDose: qty }) }

function setSecondaryMode(id: string, mode: SecondaryMode) {
  if (mode === 'default') inputs.secondaryModes.delete(id)
  else inputs.secondaryModes.set(id, mode)
}

function toggleRecipe(key: string) {
  if (inputs.disabledRecipes.has(key)) inputs.disabledRecipes.delete(key)
  else inputs.disabledRecipes.add(key)
}

function setPreferredTier(groupKey: string, recipeId: string | null) {
  if (recipeId) inputs.preferredRecipeTier.set(groupKey, recipeId)
  else inputs.preferredRecipeTier.delete(groupKey)
}

function setConfig(key: keyof PerksConfiguration, value: boolean | number) {
  inputs.perks = { ...inputs.perks, [key]: value } as PerksConfiguration
}

function resetAll() {
  inputs.herbloreLevel = DEFAULT_LEVEL
  inputs.herbSupply = new Map()
  inputs.itemSupply = new Map()
  inputs.potionSupply = new Map()
  inputs.secondaryModes = new Map()
  inputs.disabledRecipes = new Set()
  inputs.preferredRecipeTier = new Map()
  inputs.perks = { ...DEFAULT_CONFIG }
  targets.splice(0, targets.length)
  targets.push({ potionId: '', qty: 1 })
}

function resetCategory(category: 'herbs' | 'secondaries' | 'potions' | 'vials') {
  if (category === 'herbs') {
    inputs.herbSupply = new Map()
  } else if (category === 'potions') {
    inputs.potionSupply = new Map()
  } else {
    const targetKinds = new Set(
      category === 'secondaries' ? ['secondary'] : ['vial', 'misc'],
    )
    const newSupply = new Map(inputs.itemSupply)
    for (const id of newSupply.keys()) {
      if (targetKinds.has(INGREDIENT_MAP.get(id)?.kind ?? '')) newSupply.delete(id)
    }
    inputs.itemSupply = newSupply
  }
}

/** All target-selectable recipes, filtered to the player's level. Excludes unf recipes (xpPerCraft === 0). */
const availableTargets = computed(() =>
  RECIPES.filter(r =>
    r.xpPerCraft > 0 &&
    r.levelRequired <= inputs.herbloreLevel &&
    (!r.recipeGroup || RECIPE_GROUPS.get(r.recipeGroup)?.[0]?.id === r.id)
  )
)

export function useCalculator() {
  return {
    inputs,
    targets,
    result,
    availableTargets,
    addTarget,
    removeTarget,
    setTargetPotion,
    setTargetQty,
    setHerbClean,
    setHerbGrimy,
    setHerbUnf,
    setItemQty,
    setPotionThreeDose,
    setPotionFourDose,
    setPotionSixDose,
    setSecondaryMode,
    toggleRecipe,
    setPreferredTier,
    setConfig,
    resetAll,
    resetCategory,
  }
}
