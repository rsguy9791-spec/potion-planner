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
          variant="tonal" color="error" size="small"
          prepend-icon="mdi-refresh"
          @click="resetAll"
        >
          Reset
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <div class="app-layout">

        <!-- Two-column scrollable area (stacks vertically on mobile) -->
        <div class="columns-area">

          <!-- Left column: targets + supplies -->
          <div class="scroll-col" style="flex: 5">
            <TargetList
              :targets="targets"
              :available-targets="availableTargets"
              :herblore-level="inputs.herbloreLevel"
              class="mb-3"
              @add="addTarget"
              @remove="removeTarget"
              @set-potion="setTargetPotion"
              @set-qty="setTargetQty"
            />

            <SupplyTable
              :inputs="inputs"
              @set-herb-clean="setHerbClean"
              @set-herb-grimy="setHerbGrimy"
              @set-herb-unf="setHerbUnf"
              @set-item-qty="setItemQty"
              @set-potion-three-dose="setPotionThreeDose"
              @set-potion-four-dose="setPotionFourDose"
              @set-potion-six-dose="setPotionSixDose"
              @reset-category="resetCategory"
            />
          </div>

          <!-- Right column: results -->
          <div class="scroll-col" style="flex: 7">
            <SummaryBanner
              v-if="result"
              :shortfalls="result.shortfalls"
              :achievability="result.achievability"
            />
            <ResultsTable :result="result" @update-have="onUpdateHave" />
          </div>

        </div>
      </div>
    </v-main>

    <RecipesSidebar v-model="sidebarOpen" eager />
    <PerksSidebar v-model="perksOpen" :config="inputs.perks" @update="setConfig" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LevelInput from '@/components/LevelInput.vue'
import TargetList from '@/components/TargetList.vue'
import SupplyTable from '@/components/SupplyTable.vue'
import ResultsTable from '@/components/ResultsTable.vue'
import RecipesSidebar from '@/components/RecipesSidebar.vue'
import SummaryBanner from '@/components/SummaryBanner.vue'
import PerksSidebar from '@/components/PerksSidebar.vue'
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
  setHerbClean,
  setHerbGrimy,
  setHerbUnf,
  setItemQty,
  setPotionThreeDose,
  setPotionFourDose,
  setPotionSixDose,
  resetAll,
  resetCategory,
  setConfig,
} = useCalculator()

const sidebarOpen = ref(false)
const perksOpen = ref(false)

watch(sidebarOpen, v => { if (v) perksOpen.value = false })
watch(perksOpen, v => { if (v) sidebarOpen.value = false })

function onUpdateHave(id: string, kind: string, value: number) {
  if (kind === 'herb') {
    setHerbClean(id, value)
  } else {
    setItemQty(id, value)
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  padding: 12px;
  gap: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.columns-area {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.scroll-col {
  overflow-y: auto;
  min-width: 0;
}

@media (max-width: 768px) {
  .app-layout {
    height: auto;
    overflow: visible;
  }

  .columns-area {
    flex-direction: column;
    overflow: visible;
    flex: unset;
  }

  .scroll-col {
    overflow-y: visible;
    flex: unset !important;
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
