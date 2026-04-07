<template>
  <div>
    <div v-if="!result" class="text-medium-emphasis pa-4">
      Add at least one target potion and enter your current supplies to see results.
    </div>

    <template v-else>
      <div v-if="result.targets.length" class="text-caption text-medium-emphasis px-1 pb-2">
        <span v-for="(t, i) in result.targets" :key="i">
          {{ t.qty.toLocaleString() }}× {{ t.name }}<span v-if="i < result.targets.length - 1">, </span>
        </span>
      </div>

      <div v-if="result.targets.length && !result.ingredients.length" class="text-medium-emphasis pa-4">
        Your supplies cover it all!
      </div>

      <!-- ── Ingredient groups ─────────────────────────────────────────────── -->
      <v-expansion-panels v-model="openPanels" multiple variant="accordion" elevation="2">
        <v-expansion-panel v-for="groupName in visibleGroups" :key="groupName" :value="groupName">
          <v-expansion-panel-title>
            <span>{{ groupName }}</span>
            <span class="text-caption text-medium-emphasis ml-2">
              ({{ grouped[groupName]?.length ?? 0 }})
            </span>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="pa-0">
            <v-table density="compact">
              <thead class=" text-medium-emphasis">
                <tr>
                  <th class="text-left">Ingredient</th>
                  <th class="text-right" style="width:110px; white-space:nowrap">Total Needed</th>
                  <th class="text-right" style="width:90px; white-space:nowrap">Have</th>
                  <th class="text-right" style="width:100px; white-space:nowrap">Still Need</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in grouped[groupName]" :key="row.id" :class="rowClass(row)">
                  <td>
                    <v-icon v-if="!row.tradeable && row.stillNeeded > 0" icon="mdi-lock" size="x-small"
                      class="mr-1 text-warning" />
                    {{ row.name }}
                  </td>
                  <td class="text-right">
                    <v-tooltip v-if="row.rawQty !== row.totalNeeded"
                      :text="`Without scroll: ${row.rawQty.toLocaleString()}`" location="left">
                      <template #activator="{ props: tip }">
                        <span v-bind="tip" class="tooltip-qty">
                          {{ row.totalNeeded.toLocaleString() }}
                          <v-icon icon="mdi-leaf" size="x-small" color="success" />
                        </span>
                      </template>
                    </v-tooltip>
                    <span v-else>{{ row.totalNeeded.toLocaleString() }}</span>
                  </td>
                  <td class="text-right have-cell">
                    <v-text-field v-if="row.kind !== 'potion'" :model-value="row.currentlyHave" type="number" min="0"
                      density="compact" variant="plain" hide-details class="have-input text-high-emphasis"
                      style="max-width:70px; margin-left: auto"
                      @update:model-value="v => emit('updateHave', row.id, row.kind, Math.max(0, Number(v)))" />
                    <span v-else>{{ row.currentlyHave.toLocaleString() }}</span>
                  </td>
                  <td class="text-right font-weight-bold need-cell">
                    {{ row.stillNeeded === 0 ? '-' : row.stillNeeded.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- ── Crafting Steps ────────────────────────────────────────────────── -->
      <v-expansion-panels v-if="result.steps.length" v-model="stepsOpen" variant="accordion" elevation="2" class="mt-2">
        <v-expansion-panel value="steps" title="Crafting Steps">
          <v-expansion-panel-text class="pa-3">
            <div v-for="(step, i) in sortedSteps" :key="step.potionId" class="mb-3">
              <div class="text-body-2 font-weight-medium">
                <span class="text-medium-emphasis"> {{ i + 1 }}.</span> Make {{ step.crafts.toLocaleString() }} ×
                {{ step.name }}
                <span class="text-caption text-medium-emphasis">({{ step.outputDose }}-dose)</span>
              </div>
              <div v-if="step.unfStep && step.unfStep.crafts > 0" class="text-caption ml-4 text-medium-emphasis">
                ↳ {{ step.unfStep.crafts.toLocaleString() }} × {{ step.unfStep.herbName }} (unf)
              </div>
              <div class="text-caption text-medium-emphasis ml-4 mt-1">
                <ul class="pa-0 ma-0" style="list-style-type: none">
                  <li v-for="inp in step.inputs" :key="inp.kind + '-' + inp.id">
                    {{ inp.qty.toLocaleString() }}<template v-if="inp.rawQty !== inp.qty"> (<span
                        class="text-success">+{{ (inp.rawQty - inp.qty).toLocaleString() }} <v-icon icon="mdi-leaf"
                          size="x-small" /></span>)</template>
                    × <span class="text-high-emphasis">{{ inp.name }}</span><template v-if="inp.dose"> ({{ inp.dose
                      }}-dose)</template><template v-if="inp.decantFrom"> <span
                        style="color: rgb(var(--v-theme-info))"><v-icon icon="mdi-transfer" size="x-small"
                          class="ml-1" />{{ inp.decantFrom.fromCount.toLocaleString() }} {{ inp.decantFrom.fromDose
                          }}-dose</span></template>
                  </li>
                </ul>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalculationResult, IngredientResult, PotionCategory } from '@/types'

const props = defineProps<{
  result: CalculationResult | null
}>()

const emit = defineEmits<{
  updateHave: [id: string, kind: string, value: number]
}>()

const KIND_GROUP: Record<string, string> = {
  herb: 'Herbs',
  secondary: 'Secondaries',
  potion: 'Potions',
  vial: 'Vials',
  misc: 'Vials',
}

const GROUP_ORDER = ['Herbs', 'Secondaries', 'Potions', 'Vials']

const grouped = computed(() => {
  if (!props.result) return {} as Record<string, IngredientResult[]>
  const groups: Record<string, IngredientResult[]> = {}
  for (const ing of props.result.ingredients) {
    const label = KIND_GROUP[ing.kind] ?? 'Other'
    if (!groups[label]) groups[label] = []
    groups[label].push(ing)
  }
  return groups
})

const visibleGroups = computed(() =>
  GROUP_ORDER.filter(g => (grouped.value[g]?.length ?? 0) > 0)
)

const STEP_TIER_RANK: Partial<Record<PotionCategory, number>> = {
  regular: 0,
  super: 1,
  renewals: 2,
  extreme: 3,
  overload:4,
  combination: 5,
  bombs: 6,
  powerbursts: 7,
}

const sortedSteps = computed(() => {
  if (!props.result) return []
  const steps = props.result.steps
  const stepIds = new Set(steps.map(s => s.potionId))

  // For each step, track which other crafted steps it directly depends on
  const deps = new Map(steps.map(s => [
    s.potionId,
    new Set(s.inputs.map(i => i.id).filter(id => stepIds.has(id))),
  ]))

  // Greedy topological sort: always pick the lowest-tier step whose deps are satisfied.
  // This groups by tier as much as possible while never violating the dependency order.
  const done = new Set<string>()
  const result: typeof steps = []
  while (result.length < steps.length) {
    const ready = steps.filter(s =>
      !done.has(s.potionId) &&
      [...deps.get(s.potionId)!].every(d => done.has(d)),
    )
    ready.sort((a, b) => (STEP_TIER_RANK[a.category] ?? 9) - (STEP_TIER_RANK[b.category] ?? 9))
    result.push(ready[0])
    done.add(ready[0].potionId)
  }
  return result
})

const openPanels = ref([...GROUP_ORDER])
const stepsOpen = ref(['steps'])

function rowClass(row: IngredientResult) {
  if (row.stillNeeded === 0) return 'row-ok text-medium-emphasis'
  if (!row.tradeable) return 'row-untradeable'
  return 'row-deficit'
}
</script>

<style scoped>
.row-ok td.need-cell {
  color: rgb(var(--v-theme-success));
}

.row-deficit td.need-cell {
  color: rgb(var(--v-theme-error));
}

.row-untradeable td.need-cell {
  color: rgb(var(--v-theme-warning));
}

.tooltip-qty {
  cursor: default;
  white-space: nowrap;
}

.have-cell {
  vertical-align: middle;
  padding-top: 0;
  padding-bottom: 0;
}

.have-input :deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: unset !important;
}

.have-input :deep(.v-input__control) {
  min-height: unset !important;
}
</style>
