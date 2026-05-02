<template>
  <div>
    <!-- Section header -->
    <v-card elevation="2" class="rounded-b-0">
      <v-card-title class="d-flex align-center pt-3 pb-1 px-4">
        <span>Crafting Steps</span>
        <v-spacer />
        <span v-if="totalXp > 0" class="text-caption font-weight-medium" style="color: rgb(var(--v-theme-primary))">
          {{ totalXp.toLocaleString() }} XP
        </span>
      </v-card-title>

      <template v-if="result">
        <!-- Summary banner inside col 3 -->
        <SummaryBanner v-if="result.shortfalls.length" :shortfalls="result.shortfalls"
          :achievability="result.achievability" class="mt-2" />

        <div v-if="!result.steps.length" class="text-medium-emphasis text-body-2 pa-3">
          Your supplies cover everything.
        </div>

        <template v-else>
          <!-- Unfinished potions -->
          <template v-if="unfSteps.length">
            <div class="text-overline text-medium-emphasis px-3 pt-3 pb-1">Unfinished Potions</div>
            <div v-for="step in unfSteps" :key="step.potionId" class="px-3 pb-2">
              <div class="text-body-2 font-weight-medium">
                Make {{ step.crafts.toLocaleString() }} × {{ step.name }}
              </div>
              <div class="text-caption text-medium-emphasis ml-3 mt-1">
                <ul class="pa-0 ma-0" style="list-style-type: none">
                  <li v-for="inp in step.inputs" :key="inp.kind + '-' + inp.id">
                    {{ inp.qty.toLocaleString() }}<template v-if="inp.rawQty !== inp.qty">
                      (<span class="text-success">+{{ (inp.rawQty - inp.qty).toLocaleString() }}
                        <v-icon icon="mdi-leaf" size="x-small" /></span>)</template>
                    × <span class="text-high-emphasis">{{ inp.name }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <v-divider v-if="potionSteps.length" class="mx-3" />
          </template>

          <!-- Potion steps -->
          <div v-for="(step, i) in potionSteps" :key="step.potionId" class="px-3 pt-2 pb-1">
            <div class="text-body-2 font-weight-medium">
              <span class="text-medium-emphasis">{{ i + 1 }}.</span>
              Make {{ step.crafts.toLocaleString() }} × {{ step.name }}
              <span class="text-caption text-medium-emphasis">({{ step.outputDose }}-dose)</span>

            </div>
            <div class="text-caption text-medium-emphasis ml-3 mt-1">
              <ul class="pa-0 ma-0" style="list-style-type: none">
                <li v-for="inp in step.inputs" :key="inp.kind + '-' + inp.id">
                  {{ inp.qty.toLocaleString() }}<template v-if="inp.rawQty !== inp.qty">
                    (<span class="text-success">+{{ (inp.rawQty - inp.qty).toLocaleString() }}
                      <v-icon icon="mdi-leaf" size="x-small" /></span>)</template>
                  × <span class="text-high-emphasis">{{ inp.name }}</span><template v-if="inp.dose">
                    ({{ inp.dose }}-dose)</template><template v-if="inp.decantFrom">
                    <span style="color: rgb(var(--v-theme-secondary))">
                      <v-icon icon="mdi-transfer" size="x-small" class="ml-1" />{{
                        inp.decantFrom.fromCount.toLocaleString() }} {{ inp.decantFrom.fromDose }}-dose</span>
                  </template>
                </li>
              </ul>
            </div>
            <div v-if="step.xpGained > 0" class="text-caption ml-3 " style="color: rgb(var(--v-theme-primary))">
              {{ step.xpGained.toLocaleString() }} XP
            </div>
          </div>
        </template>
      </template>

      <div v-else class="text-medium-emphasis text-body-2 pa-3">
        Add targets to see crafting steps.
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationResult, PotionCategory } from '@/types'
import SummaryBanner from './SummaryBanner.vue'

const STEP_TIER_RANK: Partial<Record<PotionCategory, number>> = {
  unfinished: 0, regular: 1, super: 2, renewals: 3,
  extreme: 4, overload: 5, combination: 6, bombs: 7, powerbursts: 8,
}

const props = defineProps<{
  result: CalculationResult | null
}>()

const sortedSteps = computed(() => {
  if (!props.result) return []
  const steps = props.result.steps
  const stepIds = new Set(steps.map(s => s.potionId))
  const deps = new Map(steps.map(s => [
    s.potionId,
    new Set(s.inputs.map(i => i.id).filter(id => stepIds.has(id))),
  ]))
  const done = new Set<string>()
  const result: typeof steps = []
  while (result.length < steps.length) {
    const ready = steps.filter(s =>
      !done.has(s.potionId) && [...deps.get(s.potionId)!].every(d => done.has(d))
    )
    ready.sort((a, b) => (STEP_TIER_RANK[a.category] ?? 9) - (STEP_TIER_RANK[b.category] ?? 9))
    result.push(ready[0])
    done.add(ready[0].potionId)
  }
  return result
})

const unfSteps = computed(() => sortedSteps.value.filter(s => s.stepKind === 'unfinished'))
const potionSteps = computed(() => sortedSteps.value.filter(s => s.stepKind === 'potion'))
const totalXp = computed(() => potionSteps.value.reduce((sum, s) => sum + s.xpGained, 0))
</script>
