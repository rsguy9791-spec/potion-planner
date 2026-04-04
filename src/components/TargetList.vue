<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center justify-space-between pt-4 pb-2 px-4">
      <span>Target potions</span>
      <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="emit('add')">
        Add
      </v-btn>
    </v-card-title>
    <v-card-text class="text-medium-emphasis text-body-small pt-0 pb-2">
      Add your target potions and selected quantities
    </v-card-text>

    <v-card-text class="pa-2">
      <v-row
        v-for="(target, index) in targets"
        :key="index"
        align="center"
        no-gutters
        class="mb-2 px-2"
      >
        <v-col cols="6" class="pr-1">
          <v-autocomplete
            :model-value="target.potionId"
            :items="selectItems"
            item-title="title"
            item-value="value"
            label="Potion"
            density="compact"
            variant="outlined"
            hide-details
            :custom-filter="filterPotions"
            @update:model-value="v => emit('setPotion', index, String(v ?? ''))"
          />
        </v-col>
        <v-col cols="1" class="d-flex align-center justify-center">
          <v-tooltip location="right" max-width="320">
            <template #activator="{ props: tip }">
              <v-icon
                v-bind="tip"
                size="small"
                :color="target.potionId ? 'primary' : 'default'"
                style="opacity: 0.7; cursor: default"
              >mdi-information-outline</v-icon>
            </template>
            <span style="white-space: pre-line">{{ getRecipeTip(target.potionId) }}</span>
          </v-tooltip>
        </v-col>
        <v-col cols="4" class="pr-1">
          <v-text-field
            :model-value="target.qty"
            type="number"
            min="1"
            label="Qty"
            density="compact"
            variant="outlined"
            hide-details="auto"
            :rules="[qtyRule]"
            @update:model-value="v => onQty(index, v)"
          />
        </v-col>
        <v-col cols="1" class="d-flex justify-center">
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="error"
            aria-label="Remove target"
            @click="emit('remove', index)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe, TargetPotion } from '@/types'
import { RECIPE_BY_ID, INGREDIENT_MAP, selectBestRecipe } from '@/data/recipes'
import { POPULAR_POTION_IDS } from '@/data/constants'

const props = defineProps<{
  targets: TargetPotion[]
  availableTargets: Recipe[]
  herbloreLevel: number
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
  setPotion: [index: number, potionId: string]
  setQty: [index: number, qty: number]
}>()


type SelectItem =
  | { title: string; value: string }
  | { title: string; value: string; props: { disabled: boolean } }
  | { title: string; props: { disabled: boolean } }

const selectItems = computed((): SelectItem[] => {
  const available = props.availableTargets
  const availableIds = new Set(available.map(r => r.id))

  const toEntry = (r: Recipe): SelectItem => {
    const title = `${r.name} (${r.levelRequired}+)`
    if (availableIds.has(r.id)) return { title, value: r.id }
    return { title, value: r.id, props: { disabled: true } }
  }

  // Popular: always shown, disabled if player's level is too low
  const popularEntries = POPULAR_POTION_IDS
    .map(id => RECIPE_BY_ID.get(id))
    .filter((r): r is Recipe => r !== undefined)
    .map(toEntry)

  // Remaining: level-unlocked, excluding popular, sorted by levelRequired descending
  const popularSet = new Set(POPULAR_POTION_IDS)
  const remaining = available
    .filter(r => !popularSet.has(r.id))
    .sort((a, b) => b.levelRequired - a.levelRequired)
    .map(toEntry)

  const items: SelectItem[] = []
  if (popularEntries.length) {
    items.push({ title: 'Popular', props: { disabled: true } })
    items.push(...popularEntries)
  }
  if (remaining.length) {
    items.push({ title: 'All Potions', props: { disabled: true } })
    items.push(...remaining)
  }
  return items
})

function filterPotions(value: string, query: string, item?: { raw: SelectItem }): boolean {
  // Always show group headers (they have no 'value' key)
  if (!item?.raw || !('value' in item.raw)) return true
  return value.toLowerCase().includes(query.toLowerCase())
}

function qtyRule(v: unknown) {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 ? true : 'Min 1'
}

function onQty(index: number, v: unknown) {
  const n = Number(v)
  if (Number.isInteger(n) && n >= 1) emit('setQty', index, n)
}

function getRecipeTip(potionId: string): string {
  if (!potionId) return 'Select a potion'
  const recipe = selectBestRecipe(potionId, props.herbloreLevel)
  if (!recipe) return 'Level too low for this potion'
  const ingredients = recipe.inputs.map(inp => {
    const name = INGREDIENT_MAP.get(inp.id)?.name ?? RECIPE_BY_ID.get(inp.id)?.name ?? inp.id
    const dose = inp.dose ? ` (${inp.dose}-dose)` : ''
    return `${inp.qty}× ${name}${dose}`
  }).join('\n')
  const tierNote = recipe.recipeGroup ? ` — tier ${recipe.levelRequired}+` : ''
  return `${recipe.name}${tierNote}\n${ingredients}`
}
</script>
