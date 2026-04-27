<template>
  <v-navigation-drawer v-model="model" location="right" width="360" temporary eager>
    <v-toolbar density="compact" color="surface">
      <v-toolbar-title class="text-body-1 font-weight-medium">Perks</v-toolbar-title>
      <template #append>
        <v-btn icon="mdi-close" variant="text" size="small" @click="model = false" />
      </template>
    </v-toolbar>

    <v-list>
      <!-- ── Bonuses ────────────────────────────────────────────────────────── -->
      <v-list-subheader>Bonuses</v-list-subheader>

      <Toggle
        :model-value="config.scrollOfCleansing"
        label="Scroll of Cleansing"
        description="Chance to save secondary ingredients"
        @update:model-value="emit('update', 'scrollOfCleansing', $event)"
      />

      <Toggle
        :model-value="config.factoryOutfit"
        label="Factory outfit"
        description="⅛ chance of 4-dose output on 3-dose recipes"
        @update:model-value="emit('update', 'factoryOutfit', $event)"
      />

      <Toggle
        :model-value="config.modifiedBotanistMask"
        label="Modified botanist mask"
        description="+5% chance to duplicate potion"
        @update:model-value="emit('update', 'modifiedBotanistMask', $event)"
      />

      <Toggle
        :model-value="config.portableWell"
        label="Portable well"
        description="+5% chance to duplicate potion"
        @update:model-value="emit('update', 'portableWell', $event)"
      />

      <Toggle
        :model-value="config.broochOfTheGods"
        :disabled="!config.portableWell"
        label="Brooch of the Gods"
        description="Well upgrade to +10% duplicate chance"
        @update:model-value="emit('update', 'broochOfTheGods', $event)"
      />

      <v-list-item v-if="duplicateBonus > 0" class="pt-0 pb-2">
        <div class="text-caption text-medium-emphasis">Total duplicate bonus: {{ duplicateBonus }}%</div>
      </v-list-item>

      <v-divider />

      <!-- ── XP Boosts ──────────────────────────────────────────────────────── -->
      <v-list-subheader>XP Boosts</v-list-subheader>

      <Toggle
        :model-value="config.perfectJujuPotion"
        label="Perfect juju potion"
        description="+5% XP on combination potions"
        @update:model-value="emit('update', 'perfectJujuPotion', $event)"
      />

      <v-list-item>
        <div class="text-body-2 mb-1 d-flex justify-space-between">
          <span>Clan fealty</span>
          <span class="text-medium-emphasis">{{ config.clanFealtyPercent }}%</span>
        </div>
        <v-slider :model-value="config.clanFealtyPercent" min="0" max="6" step="1" hide-details density="compact"
          class="mb-2" @update:model-value="v => emit('update', 'clanFealtyPercent', v)" />
      </v-list-item>

      <v-list-item>
        <div class="text-body-2 mb-1 d-flex justify-space-between">
          <span>Botanist's outfit XP</span>
          <span class="text-medium-emphasis">{{ config.botanistXpPercent }}%</span>
        </div>
        <v-slider :model-value="config.botanistXpPercent" min="0" max="6" step="1" hide-details density="compact"
          class="mb-2" @update:model-value="v => emit('update', 'botanistXpPercent', v)" />
      </v-list-item>

      <v-list-item>
        <v-text-field :model-value="config.customXpPercent" type="number" min="0" label="Custom XP %" density="compact"
          variant="outlined" hide-details
          @update:model-value="v => emit('update', 'customXpPercent', Math.max(0, Number(v)))" />
      </v-list-item>

      <v-list-item v-if="totalXpBoost > 0" class="pt-0 pb-2">
        <div class="text-caption text-medium-emphasis">Total XP boost: +{{ totalXpBoostLabel }}</div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PerksConfiguration } from '@/types'
import Toggle from './Toggle.vue'

const model = defineModel<boolean>()

const props = defineProps<{
  config: PerksConfiguration
}>()

const emit = defineEmits<{
  update: [key: keyof PerksConfiguration, value: boolean | number]
}>()

const totalXpBoost = computed(() =>
  props.config.clanFealtyPercent + props.config.botanistXpPercent + props.config.customXpPercent
)

const totalXpBoostLabel = computed(() => {
  const base = totalXpBoost.value
  const withJuju = base + (props.config.perfectJujuPotion ? 5 : 0)
  if (base === withJuju) return `${base}%`
  return `${base}% (combination potions ${withJuju}%)`
})

const duplicateBonus = computed(() => {
  const mask = props.config.modifiedBotanistMask ? 5 : 0
  const well = props.config.portableWell ? (props.config.broochOfTheGods ? 10 : 5) : 0
  return mask + well
})
</script>
