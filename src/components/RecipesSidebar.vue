<template>
  <v-navigation-drawer :model-value="modelValue" location="right" width="360" temporary
    @update:model-value="emit('update:modelValue', $event)">
    <v-toolbar density="compact" color="surface">
      <v-toolbar-title class="text-body-1 font-weight-medium">Recipes &amp; secondaries</v-toolbar-title>
      <template #append>
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </template>
    </v-toolbar>
    <div class="text-medium-emphasis text-body-2 px-4 py-2">
      Disable recipes or secondaries you don't want to use
    </div>
    <v-expansion-panels v-model="openPanels" multiple variant="accordion" density="compact">

      <!-- ── Recipes ──────────────────────────────────────────────────────── -->
      <v-expansion-panel value="recipes">
        <v-expansion-panel-title class="text-body-2 font-weight-medium">Recipes</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact">
            <template v-for="cat in categoryKeys" :key="cat">
              <template v-if="recipesByCat[cat]?.length">
                <div class="d-flex align-center justify-space-between px-4 py-1 text-overline text-medium-emphasis">
                  <span>{{ CATEGORY_LABELS[cat] }}</span>
                  <v-btn variant="tonal" size="x-small" :color="allDisabled(cat) ? 'warning' : 'default'"
                    @click="toggleAll(cat)">{{ allDisabled(cat) ? 'Enable all' : 'Disable all' }}</v-btn>
                </div>

                <v-list-item v-for="entry in recipesByCat[cat]" :key="entry.key" class="py-1 px-4">
                  <v-row align="center" no-gutters>
                    <v-col>
                      <div class="text-body-2">{{ entry.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ entry.levelLabel }}</div>

                      <v-select v-if="entry.isGroup" class="mx-4 mb-2 mt-0 text-medium-emphasis "
                        :model-value="inputs.preferredRecipeTier.get(entry.key) ?? ''" :items="entry.tiers"
                        density="compact" variant="underlined" hide-details
                        @update:model-value="v => setPreferredTier(entry.key, v || null)" />

                    </v-col>

                    <v-col cols="auto">
                      <v-chip :color="isDisabled(entry.key) ? 'warning' : 'default'" size="small" label
                        style="cursor: pointer; min-width: 68px; justify-content: center"
                        @click="toggleRecipe(entry.key)">
                        {{ isDisabled(entry.key) ? 'Disabled' : 'Enabled' }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-list-item>
                <v-divider class="mt-1" />
              </template>
            </template>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ── Secondaries ───────────────────────────────────────────────────── -->
      <v-expansion-panel value="secondaries">
        <v-expansion-panel-title class="text-body-2 font-weight-medium">Secondaries</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact">
            <v-list-item v-for="item in ALL_SECONDARY_ROWS" :key="item.id" class="py-0 px-4">
              <v-row align="center" no-gutters>
                <v-col class="text-body-2">{{ item.name }}</v-col>
                <v-col cols="auto">
                  <v-btn-toggle :model-value="inputs.secondaryModes.get(item.id) ?? 'default'" density="compact"
                    variant="outlined" divided mandatory
                    @update:model-value="v => setSecondaryMode(item.id, v as SecondaryMode)">
                    <v-btn value="default" size="x-small" style="font-size: 0.65rem">Gather</v-btn>
                    <v-btn value="use_available" size="x-small" style="font-size: 0.65rem">Cap</v-btn>
                    <v-btn value="skip" size="x-small" style="font-size: 0.65rem">Skip</v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SecondaryMode } from '@/types'
import { RECIPES, RECIPE_GROUPS, INGREDIENT_MAP } from '@/data/recipes'
import { useCalculator } from '@/composables/useCalculator'
import { CATEGORY_LABELS } from '@/data/constants'
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { inputs, toggleRecipe, setPreferredTier, setSecondaryMode } = useCalculator()

const openPanels = ref(['recipes', 'secondaries'])

const categoryKeys = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]


interface RecipeEntry {
  key: string
  name: string
  levelLabel: string
  isGroup: boolean
  tiers: { title: string; value: string }[]
}

const recipesByCat = computed(() => {
  const result: Record<string, RecipeEntry[]> = {}
  const seenGroups = new Set<string>()

  for (const recipe of RECIPES) {
    const cat = recipe.category
    if (!result[cat]) result[cat] = []

    if (recipe.recipeGroup) {
      if (seenGroups.has(recipe.recipeGroup)) continue
      seenGroups.add(recipe.recipeGroup)

      const group = RECIPE_GROUPS.get(recipe.recipeGroup) ?? []
      const tiers = [
        { title: 'Auto', value: '' },
        ...group.map(r => ({ title: r.variantLabel ?? `Lv ${r.levelRequired}`, value: r.id })),
      ]
      const levels = group.map(r => r.levelRequired)
      const minLv = Math.min(...levels), maxLv = Math.max(...levels)
      result[cat].push({
        key: recipe.recipeGroup,
        name: recipe.name,
        levelLabel: minLv === maxLv ? `Lv ${minLv}` : `Lv ${minLv}–${maxLv}`,
        isGroup: true,
        tiers,
      })
    } else {
      result[cat].push({
        key: recipe.id,
        name: recipe.name,
        levelLabel: `Lv ${recipe.levelRequired}`,
        isGroup: false,
        tiers: [],
      })
    }
  }

  return result
})

function isDisabled(key: string) {
  return inputs.disabledRecipes.has(key)
}

function allDisabled(cat: string): boolean {
  const entries = recipesByCat.value[cat] ?? []
  return entries.length > 0 && entries.every(e => isDisabled(e.key))
}

function toggleAll(cat: string) {
  const entries = recipesByCat.value[cat] ?? []
  const shouldDisable = !allDisabled(cat)
  for (const entry of entries) {
    if (shouldDisable && !isDisabled(entry.key)) inputs.disabledRecipes.add(entry.key)
    else if (!shouldDisable && isDisabled(entry.key)) inputs.disabledRecipes.delete(entry.key)
  }
}

// All secondary + vial/misc ingredients for the secondaries section
const ALL_SECONDARY_ROWS = (() => {
  return [...INGREDIENT_MAP.values()]
    .filter(i => i.kind === 'secondary' || i.kind === 'vial' || i.kind === 'misc')
    .map(i => ({ id: i.id, name: i.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()
</script>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0;
}
</style>
