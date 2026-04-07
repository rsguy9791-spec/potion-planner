<template>
  <v-card elevation="9">
    <v-card-title class="d-flex align-center justify-space-between pt-4 pb-2 px-4">
      <span>My supplies</span>
    </v-card-title>
    <v-card-text class="text-medium-emphasis text-body-small">
      <span>Enter your current supplies to calculate required ingredients</span>
    </v-card-text>
  </v-card>
  <v-expansion-panels v-model="openPanels" multiple variant="accordion" elevation="2">

    <!-- ── Herbs ───────────────────────────────────────────────────────────── -->
    <v-expansion-panel value="herbs">
      <v-expansion-panel-title>
        <div class="d-flex align-center" style="width:100%">
          <span>Herbs</span>
          <v-spacer />
          <v-btn variant="tonal" color="error" size="small" prepend-icon="mdi-refresh"
            @click.stop="emit('resetCategory', 'herbs')">
            Clear
          </v-btn>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-2">
        <v-row v-for="herb in HERB_ROWS" :key="herb.cleanId" align="center" no-gutters class="mb-2">
          <v-col cols="3" class="text-body-2 pr-2" style="font-size:0.8rem">{{ herb.name }}</v-col>
          <v-col cols="3" class="pr-1">
            <v-text-field :model-value="getHerbClean(herb.cleanId)" type="number" min="0" label="Clean"
              density="compact" variant="outlined" hide-details
              @update:model-value="v => emit('setHerbClean', herb.cleanId, Math.max(0, Number(v)))" />
          </v-col>
          <v-col cols="3" class="pr-1">
            <v-text-field :model-value="getHerbGrimy(herb.cleanId)" type="number" min="0" label="Grimy"
              density="compact" variant="outlined" hide-details
              @update:model-value="v => emit('setHerbGrimy', herb.cleanId, Math.max(0, Number(v)))" />
          </v-col>
          <v-col cols="3">
            <v-text-field :model-value="getHerbUnf(herb.cleanId)" type="number" min="0" label="Unf"
              density="compact" variant="outlined" hide-details
              @update:model-value="v => emit('setHerbUnf', herb.cleanId, Math.max(0, Number(v)))" />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- ── Secondaries ────────────────────────────────────────────────────── -->
    <v-expansion-panel value="secondaries">
      <v-expansion-panel-title>
        <div class="d-flex align-center" style="width:100%">
          <span>Secondaries</span>
          <v-spacer />
          <v-btn variant="tonal" color="error" size="small" prepend-icon="mdi-refresh"
            @click.stop="emit('resetCategory', 'secondaries')">
            Clear
          </v-btn>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-2">
        <v-row v-for="item in SECONDARY_ROWS" :key="item.id" align="center" no-gutters class="mb-2">
          <v-col cols="8" class="text-body-2 pr-2" style="font-size:0.8rem">
            {{ item.name }}
          </v-col>
          <v-col cols="4">
            <v-text-field :model-value="getItemQty(item.id)" type="number" min="0" label="Have" density="compact"
              variant="outlined" hide-details
              @update:model-value="v => emit('setItemQty', item.id, Math.max(0, Number(v)))" />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- ── Potions ────────────────────────────────────────────────────────── -->
    <v-expansion-panel value="potions">
      <v-expansion-panel-title>
        <div class="d-flex align-center" style="width:100%">
          <span>Potions</span>
          <v-spacer />
          <v-btn variant="tonal" color="error" size="small" prepend-icon="mdi-refresh"
            @click.stop="emit('resetCategory', 'potions')">
            Clear
          </v-btn>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-2">

        <template v-for="(cat, catIdx) in activePotionCategories" :key="cat">
          <v-divider v-if="catIdx > 0" class="my-2" />
          <div class="text-overline text-medium-emphasis mb-1">{{ CATEGORY_LABELS[cat] }}</div>

          <template v-for="p in groupedPotionRows.get(cat)" :key="p.id">
            <v-row align="center" no-gutters class="mb-2">
              <template v-if="p.isFlask">
                <v-col cols="8" class="text-body-2 pr-2" style="font-size:0.8rem">{{ p.name }}</v-col>
                <v-col cols="4">
                  <v-text-field :model-value="getPotionDose(p.id, 'sixDose')" type="number" min="0" label="6-dose"
                    density="compact" variant="outlined" hide-details
                    @update:model-value="v => emit('setPotionSixDose', p.id, Math.max(0, Number(v)))" />
                </v-col>
              </template>
              <template v-else>
                <v-col cols="4" class="text-body-2 pr-2" style="font-size:0.8rem">{{ p.name }}</v-col>
                <v-col cols="4" class="pr-1">
                  <v-text-field :model-value="getPotionDose(p.id, 'threeDose')" type="number" min="0" label="3-dose"
                    density="compact" variant="outlined" hide-details
                    @update:model-value="v => emit('setPotionThreeDose', p.id, Math.max(0, Number(v)))" />
                </v-col>
                <v-col cols="4">
                  <v-text-field :model-value="getPotionDose(p.id, 'fourDose')" type="number" min="0" label="4-dose"
                    density="compact" variant="outlined" hide-details
                    @update:model-value="v => emit('setPotionFourDose', p.id, Math.max(0, Number(v)))" />
                </v-col>
              </template>
            </v-row>
          </template>
        </template>

      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- ── Vials & Bases ──────────────────────────────────────────────────── -->
    <v-expansion-panel value="vials">
      <v-expansion-panel-title>
        <div class="d-flex align-center" style="width:100%">
          <span>Vials &amp; Bases</span>
          <v-spacer />
          <v-btn variant="tonal" color="error" size="small" prepend-icon="mdi-refresh"
            @click.stop="emit('resetCategory', 'vials')">
            Clear
          </v-btn>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-2">
        <v-row v-for="item in VIAL_ROWS" :key="item.id" align="center" no-gutters class="mb-2">
          <v-col cols="8" class="text-body-2 pr-2" style="font-size:0.8rem">
            {{ item.name }}
          </v-col>
          <v-col cols="4">
            <v-text-field :model-value="getItemQty(item.id)" type="number" min="0" label="Have" density="compact"
              variant="outlined" hide-details
              @update:model-value="v => emit('setItemQty', item.id, Math.max(0, Number(v)))" />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { INGREDIENTS, INGREDIENT_MAP, SUPPLY_POTION_IDS, RECIPE_BY_ID } from '@/data/recipes'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/constants'
import type { CalculatorInputs, PotionCategory } from '@/types'

const props = defineProps<{
  inputs: CalculatorInputs
}>()

const emit = defineEmits<{
  setHerbClean: [herbId: string, qty: number]
  setHerbGrimy: [herbId: string, qty: number]
  setHerbUnf: [herbId: string, qty: number]
  setItemQty: [itemId: string, qty: number]
  setPotionThreeDose: [potionId: string, qty: number]
  setPotionFourDose: [potionId: string, qty: number]
  setPotionSixDose: [potionId: string, qty: number]
  resetCategory: [category: 'herbs' | 'secondaries' | 'potions' | 'vials']
}>()

// ─── Static row definitions ───────────────────────────────────────────────────

const HERB_ROWS = (() => {
  const seen = new Set<string>()
  return INGREDIENTS
    .filter(i => i.kind === 'herb_clean' && i.id.startsWith('clean_'))
    .filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true })
    .map(i => ({ cleanId: i.id, name: i.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()

const SECONDARY_ROWS = INGREDIENTS
  .filter(i => i.kind === 'secondary')
  .map(i => ({ id: i.id, name: i.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const VIAL_ROWS = INGREDIENTS
  .filter(i => i.kind === 'vial' || i.kind === 'misc')
  .map(i => ({ id: i.id, name: i.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const ALL_POTION_ROWS = SUPPLY_POTION_IDS.map(id => {
  const recipe = RECIPE_BY_ID.get(id)
  return {
    id,
    name: recipe?.name ?? INGREDIENT_MAP.get(id)?.name ?? id,
    isFlask: (recipe?.outputDose ?? 3) === 6,
    category: (recipe?.category ?? 'potions') as PotionCategory,
  }
})

const groupedPotionRows = new Map<PotionCategory, typeof ALL_POTION_ROWS>()
for (const row of ALL_POTION_ROWS) {
  const bucket = groupedPotionRows.get(row.category) ?? []
  bucket.push(row)
  groupedPotionRows.set(row.category, bucket)
}

const activePotionCategories = computed(() =>
  CATEGORY_ORDER.filter(cat => (groupedPotionRows.get(cat)?.length ?? 0) > 0)
)

// ─── Panel state ─────────────────────────────────────────────────────────────

const openPanels = ref(['herbs', 'secondaries', 'potions', 'vials'])

// ─── Supply readers ───────────────────────────────────────────────────────────

function getHerbClean(herbId: string) {
  return props.inputs.herbSupply.get(herbId)?.cleanQty ?? 0
}
function getHerbGrimy(herbId: string) {
  return props.inputs.herbSupply.get(herbId)?.grimyQty ?? 0
}
function getHerbUnf(herbId: string) {
  return props.inputs.herbSupply.get(herbId)?.unfQty ?? 0
}
function getItemQty(itemId: string) {
  return props.inputs.itemSupply.get(itemId) ?? 0
}
function getPotionDose(potionId: string, key: 'threeDose' | 'fourDose' | 'sixDose') {
  return props.inputs.potionSupply.get(potionId)?.[key] ?? 0
}
</script>
