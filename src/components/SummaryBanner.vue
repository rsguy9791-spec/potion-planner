<template>
  <v-alert
    v-if="shortfalls.length > 0"
    type="warning"
    variant="tonal"
    class="mb-2"
    :title="`Cannot fully complete target${achievability.length > 1 ? 's' : ''}`"
  >
    <div class="text-body-2 mt-1">
      <div class="font-weight-medium mb-1">Missing untradeable items:</div>
      <ul class="pl-4">
        <li v-for="sf in shortfalls" :key="sf.id">
          {{ sf.qty.toLocaleString() }}× {{ sf.name }}
        </li>
      </ul>

      <template v-if="achievability.length > 0">
        <div class="font-weight-medium mt-2 mb-1">Maximum achievable:</div>
        <ul class="pl-4">
          <li v-for="a in achievability" :key="a.potionId">
            {{ a.name }}: {{ a.possible.toLocaleString() }} of {{ a.requested.toLocaleString() }} requested
          </li>
        </ul>
      </template>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import type { ShortfallItem, TargetAchievability } from '@/types'

defineProps<{
  shortfalls: ShortfallItem[]
  achievability: TargetAchievability[]
}>()
</script>
