<template>
  <v-table density="compact" class="supply-tbl">
    <thead v-if="rows.length > 0" class="text-medium-emphasis">
      <tr>
        <th class="text-left">Ingredient</th>
        <th style="min-width:140px">Quantity</th>
        <th class="text-right" style="width:80px">Needed</th>
        <th class="text-right" style="width:82px">Remaining</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id" :class="rowClass(row)">
        <!-- Ingredient -->
        <td>
          <v-icon v-if="!row.tradeable && row.remaining > 0" icon="mdi-lock" size="x-small" class="mr-1 text-warning" />
          <span :class="{ 'text-medium-emphasis': !row.isNeeded }">{{ row.name }}</span>
        </td>

        <!-- Quantity inputs -->
        <td class="qty-cell">
          <div class="qty-flex">
            <template v-if="row.kind === 'herb'" v-for="h in [asHerb(row)]">
              <v-text-field v-bind="fieldProps" :model-value="h.qtyClean" aria-label="Clean"
                @update:model-value="v => setHerbClean(row.id, parse(v))" prepend-inner-icon="mdi-leaf" />
              <v-text-field v-bind="fieldProps" :model-value="h.qtyGrimy" aria-label="Grimy"
                @update:model-value="v => setHerbGrimy(row.id, parse(v))" prepend-inner-icon="mdi-liquid-spot" />
              <v-text-field v-bind="fieldProps" :model-value="h.qtyUnf" aria-label="Unfinished"
                @update:model-value="v => setHerbUnf(row.id, parse(v))" prepend-inner-icon="mdi-circle-half-full" />
            </template>
            <template v-else-if="row.kind === 'potion'" v-for="p in [asPotion(row)]">
              <template v-if="p.isFlask">
                <v-text-field v-bind="fieldProps" :model-value="p.qtySix" aria-label="6 dose"
                  @update:model-value="v => setPotionSixDose(row.id, parse(v))" prepend-inner-icon="mdi-numeric-6" />
              </template>
              <template v-else>
                <v-text-field v-bind="fieldProps" :model-value="p.qtyThree" aria-label="3 dose"
                  @update:model-value="v => setPotionThreeDose(row.id, parse(v))" prepend-inner-icon="mdi-numeric-3" />
                <v-text-field v-bind="fieldProps" :model-value="p.qtyFour" aria-label="4 dose"
                  @update:model-value="v => setPotionFourDose(row.id, parse(v))" prepend-inner-icon="mdi-numeric-4" />
              </template>
            </template>
            <template v-else v-for="item in [asItem(row)]">
              <v-text-field v-bind="fieldProps" :model-value="item.qty" aria-label="Quantity"
                @update:model-value="v => setItemQty(row.id, parse(v))" prepend-inner-icon="mdi-pound"
                class="qty-tf--single" />
            </template>
          </div>
        </td>

        <!-- Needed (scroll savings shown as tooltip when active) -->
        <td class="text-right needed-cell">
          <v-tooltip v-if="row.totalNeeded > 0 && row.scrollSavings > 0"
            :text="`Without scroll: ${row.rawQty.toLocaleString()}`" location="left">
            <template #activator="{ props: tip }">
              <span v-bind="tip" class="tooltip-qty">
                {{ row.totalNeeded.toLocaleString() }}
                <v-icon icon="mdi-leaf" size="x-small" color="success" />
              </span>
            </template>
          </v-tooltip>
          <span v-else>{{ row.totalNeeded > 0 ? row.totalNeeded.toLocaleString() : '—' }}</span>
        </td>

        <!-- Remaining -->
        <td class="text-right remaining-cell font-weight-bold">
          {{ row.remaining > 0 ? row.remaining.toLocaleString() : '—' }}
        </td>
      </tr>

      <!-- See more / Show less toggle -->
      <tr v-if="hiddenCount > 0">
        <td colspan="4" class="text-center py-1">
          <v-btn variant="text" size="small" density="compact" @click="emit('toggleSeeMore')">
            {{ hiddenCount }} more...
          </v-btn>
        </td>
      </tr>
      <tr v-else-if="hasSeenMore">
        <td colspan="4" class="text-center py-1">
          <v-btn variant="text" size="small" density="compact" @click="emit('toggleSeeMore')">
            Show less
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplyRow, HerbSupplyRow, PotionSupplyRow, ItemSupplyRow } from '@/types'
import { useSupply } from '@/composables/useSupply'

const props = defineProps<{
  rows: SupplyRow[]
  hiddenCount: number
}>()

const emit = defineEmits<{ toggleSeeMore: [] }>()

const {
  setHerbClean, setHerbGrimy, setHerbUnf, setItemQty,
  setPotionThreeDose, setPotionFourDose, setPotionSixDose,
} = useSupply()

const fieldProps = {
  type: 'number', min: 0, density: 'default', variant: 'outlined',
  hideDetails: true, class: 'qty-tf',
} as const

function parse(v: unknown): number {
  return Math.max(0, Number(v) || 0)
}

const hasSeenMore = computed(() =>
  props.hiddenCount === 0 && props.rows.some(r => !r.isNeeded)
)

function rowClass(row: SupplyRow) {
  if (!row.isNeeded) return 'row-not-needed'
  if (row.remaining === 0) return 'row-ok'
  if (!row.tradeable) return 'row-untradeable'
  return 'row-deficit'
}

const asHerb = (row: SupplyRow) => row as HerbSupplyRow
const asPotion = (row: SupplyRow) => row as PotionSupplyRow
const asItem = (row: SupplyRow) => row as ItemSupplyRow
</script>

<style scoped>
.supply-tbl :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.qty-cell {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  vertical-align: middle;
}

.qty-flex {
  display: flex;
  gap: 3px;
  align-items: center;
}

.qty-tf {
  width: 60px;
  flex-shrink: 0;
  margin: 0 2px;
}

.qty-tf--single {
  width: 72px;
}

.qty-tf :deep(.v-field--prepended) {
  padding-inline-start: 0 !important;
}

.qty-tf :deep(.v-field__prepend-inner) {
  padding-inline: 4px;
  align-self: stretch;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px 0 0 4px;
}

.qty-tf :deep(.v-field__prepend-inner .v-icon) {
  font-size: 1rem;
  opacity: 0.55;
}

.qty-tf :deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: unset !important;
  font-size: 0.8rem;
}

.qty-tf :deep(.v-input__control) {
  min-height: unset !important;
}

.row-ok .remaining-cell {
  color: rgb(var(--v-theme-success));
}

.row-deficit .remaining-cell {
  color: rgb(var(--v-theme-error));
}

.row-untradeable .remaining-cell {
  color: rgb(var(--v-theme-warning));
}

.row-not-needed .needed-cell,
.row-not-needed .remaining-cell {
  opacity: 0.35;
}

.tooltip-qty {
  cursor: default;
  white-space: nowrap;
}
</style>
