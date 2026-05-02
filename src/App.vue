<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>RS3 Potion Planner</v-app-bar-title>
      <v-spacer />
      <div class="d-flex align-center ga-2 mr-2">
        <LevelInput v-model="inputs.herbloreLevel" />
        <v-btn
          variant="tonal" color="white" size="small"
          prepend-icon="mdi-chevron-double-up"
          @click="perksOpen = true"
        >
          Perks
        </v-btn>
        <v-btn
          variant="tonal" color="white" size="small"
          prepend-icon="mdi-book-open-variant"
          @click="sidebarOpen = true"
        >
          Recipes
        </v-btn>
        <v-btn
          variant="tonal" color="white" size="small"
          icon="mdi-database-export" density="comfortable"
          @click="dataOpen = true"
        />
        <v-btn
          variant="tonal" color="error" size="small"
          prepend-icon="mdi-refresh"
          @click="resetAll"
        >
          Reset
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <div class="app-grid" :class="{ 'col1-collapsed': col1Collapsed }">

        <!-- Col 1: Targets (collapsible to the left) -->
        <div class="grid-col">
          <template v-if="!col1Collapsed">
            <TargetList
              :targets="targets"
              :available-targets="availableTargets"
              :herblore-level="inputs.herbloreLevel"
              @add="addTarget"
              @remove="removeTarget"
              @set-potion="setTargetPotion"
              @set-qty="setTargetQty"
              @toggle-collapse="col1Collapsed = true"
            />
          </template>
          <div v-else class="collapsed-tab" @click="col1Collapsed = false">
            <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
            <span class="collapsed-label">Target Potions</span>
          </div>
        </div>

        <!-- Col 2: Unified supply + results -->
        <div class="grid-col">
          <SupplyColumn />
        </div>

        <!-- Col 3: Crafting steps (includes summary banner) -->
        <div class="grid-col">
          <CraftingSteps :result="result" />
        </div>

      </div>
    </v-main>

    <RecipesSidebar v-model="sidebarOpen" eager />
    <PerksSidebar v-model="perksOpen" :config="inputs.perks" @update="setConfig" />
    <DataDialog v-model="dataOpen" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LevelInput from '@/components/LevelInput.vue'
import TargetList from '@/components/TargetList.vue'
import SupplyColumn from '@/components/SupplyColumn.vue'
import CraftingSteps from '@/components/CraftingSteps.vue'
import RecipesSidebar from '@/components/RecipesSidebar.vue'
import PerksSidebar from '@/components/PerksSidebar.vue'
import DataDialog from '@/components/DataDialog.vue'
import { useCalculator } from '@/composables/useCalculator'

const {
  inputs,
  targets,
  result,
  availableTargets,
  addTarget,
  removeTarget,
  setTargetPotion,
  setTargetQty,
  resetAll,
  setConfig,
} = useCalculator()

const dataOpen = ref(false)
const openPanel = ref<'sidebar' | 'perks' | null>(null)
const sidebarOpen = computed({
  get: () => openPanel.value === 'sidebar',
  set: (v: boolean) => { openPanel.value = v ? 'sidebar' : null },
})
const perksOpen = computed({
  get: () => openPanel.value === 'perks',
  set: (v: boolean) => { openPanel.value = v ? 'perks' : null },
})
const col1Collapsed = ref(false)
</script>

<style scoped>
.app-grid {
  display: grid;
  grid-template-columns: 25% 50% 25%;
  gap: 12px;
  height: calc(100vh - 64px);
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.app-grid.col1-collapsed {
  grid-template-columns: 44px 1fr 25%;
}

.grid-col {
  overflow-y: auto;
  min-width: 0;
}

.collapsed-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  height: fit-content;
  gap: 8px;
  transition: background 0.15s;
}

.collapsed-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.collapsed-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .app-grid,
  .app-grid.col1-collapsed {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .grid-col {
    overflow-y: visible;
  }

  .collapsed-tab {
    flex-direction: row;
    width: 100%;
    height: auto;
  }

  .collapsed-label {
    writing-mode: horizontal-tb;
    transform: none;
  }
}
</style>

<style>
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
