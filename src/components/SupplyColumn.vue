<template>
  <div>
    <!-- Section header -->
    <v-card elevation="2" class="mb-0 rounded-b-0">
      <v-card-title class="d-flex align-center justify-space-between pt-3 pb-2 px-4">
        <span>Supply list</span>
        <v-menu :close-on-content-click="true">
          <template #activator="{ props: menu }">
            <v-btn icon="mdi-dots-horizontal" size="small" variant="text" v-bind="menu" />
          </template>
          <v-list density="compact" min-width="180">
            <v-list-item prepend-icon="mdi-expand-all-outline" title="Show all" @click="showAll" />
            <v-list-item prepend-icon="mdi-collapse-all-outline" title="Collapse all" @click="collapseAll" />
            <v-divider class="my-1" />
            <v-list-subheader>Clear supply</v-list-subheader>
            <v-list-item title="Herbs" @click="resetCategory('herbs')" />
            <v-list-item title="Potions" @click="resetCategory('potions')" />
            <v-list-item title="Secondaries" @click="resetCategory('secondaries')" />
            <v-list-item title="Vials &amp; Bases" @click="resetCategory('vials')" />
          </v-list>
        </v-menu>
      </v-card-title>
    </v-card>

    <v-expansion-panels v-model="openPanels" multiple variant="accordion" elevation="2">

      <!-- ── Herbs & Unfinished Potions ──────────────────────────────────── -->
      <v-expansion-panel value="herbs">
        <v-expansion-panel-title>
          <span>Herbs &amp; Unfinished Potions</span>
          <span v-if="neededCount(data.herbRows)" class="text-caption text-medium-emphasis ml-2">
            ({{ neededCount(data.herbRows) }} needed)
          </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <supply-section-table
            :rows="visibleHerbs"
            :hidden-count="hiddenCount(data.herbRows, showAllHerbs)"
            @toggle-see-more="showAllHerbs = !showAllHerbs"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ── Secondaries ──────────────────────────────────────────────────── -->
      <v-expansion-panel value="secondaries">
        <v-expansion-panel-title>
          <span>Secondaries</span>
          <span v-if="neededCount(data.secondaryRows)" class="text-caption text-medium-emphasis ml-2">
            ({{ neededCount(data.secondaryRows) }} needed)
          </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <supply-section-table
            :rows="visibleSecondaries"
            :hidden-count="hiddenCount(data.secondaryRows, showAllSecondaries)"
            @toggle-see-more="showAllSecondaries = !showAllSecondaries"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ── Potions ──────────────────────────────────────────────────────── -->
      <v-expansion-panel value="potions">
        <v-expansion-panel-title>
          <span>Potions</span>
          <span v-if="totalPotionsNeeded" class="text-caption text-medium-emphasis ml-2">
            ({{ totalPotionsNeeded }} needed)
          </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <template v-for="(cat, catIdx) in data.activePotionCategories" :key="cat">
            <v-divider v-if="catIdx > 0" />
            <div class="text-overline text-medium-emphasis px-4 pt-2 pb-0">{{ CATEGORY_LABELS[cat] }}</div>
            <supply-section-table
              :rows="visiblePotions(cat)"
              :hidden-count="hiddenCount(data.potionsByCategory.get(cat) ?? [], showAllPotions[cat] ?? false)"
              @toggle-see-more="togglePotionSeeMore(cat)"
            />
          </template>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ── Vials & Bases ────────────────────────────────────────────────── -->
      <v-expansion-panel value="vials">
        <v-expansion-panel-title>
          <span>Vials &amp; Bases</span>
          <span v-if="neededCount(data.vialRows)" class="text-caption text-medium-emphasis ml-2">
            ({{ neededCount(data.vialRows) }} needed)
          </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <supply-section-table
            :rows="visibleVials"
            :hidden-count="hiddenCount(data.vialRows, showAllVials)"
            @toggle-see-more="showAllVials = !showAllVials"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { PotionCategory, SupplyRow } from '@/types'
import { CATEGORY_LABELS } from '@/data/constants'
import { useSupply } from '@/composables/useSupply'
import SupplySectionTable from './SupplyTable.vue'

const { resetCategory, data } = useSupply()

const showAllHerbs = ref(false)
const showAllSecondaries = ref(false)
const showAllVials = ref(false)
const showAllPotions = reactive<Record<string, boolean>>({})

function neededCount(rows: SupplyRow[]) {
  return rows.filter(r => r.isNeeded).length
}

function hiddenCount(rows: SupplyRow[], showAll: boolean) {
  if (showAll) return 0
  return rows.filter(r => !r.isNeeded).length
}

const visibleHerbs = computed(() =>
  showAllHerbs.value ? data.value.herbRows : data.value.herbRows.filter(r => r.isNeeded)
)
const visibleSecondaries = computed(() =>
  showAllSecondaries.value ? data.value.secondaryRows : data.value.secondaryRows.filter(r => r.isNeeded)
)
const visibleVials = computed(() =>
  showAllVials.value ? data.value.vialRows : data.value.vialRows.filter(r => r.isNeeded)
)

function visiblePotions(cat: PotionCategory) {
  const rows = data.value.potionsByCategory.get(cat) ?? []
  return (showAllPotions[cat]) ? rows : rows.filter(r => r.isNeeded)
}

function togglePotionSeeMore(cat: PotionCategory) {
  showAllPotions[cat] = !showAllPotions[cat]
}

const totalPotionsNeeded = computed(() => {
  let count = 0
  for (const rows of data.value.potionsByCategory.values()) {
    count += rows.filter(r => r.isNeeded).length
  }
  return count
})

function showAll() {
  showAllHerbs.value = true
  showAllSecondaries.value = true
  showAllVials.value = true
  for (const cat of data.value.activePotionCategories) {
    showAllPotions[cat] = true
  }
}

function collapseAll() {
  showAllHerbs.value = false
  showAllSecondaries.value = false
  showAllVials.value = false
  for (const cat of data.value.activePotionCategories) {
    showAllPotions[cat] = false
  }
}

const openPanels = ref(['herbs', 'secondaries', 'potions', 'vials'])
</script>
