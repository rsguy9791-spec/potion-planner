<template>
  <v-text-field
    :model-value="modelValue"
    type="number"
    min="1"
    max="120"
    label="Herblore level"
    density="compact"
    variant="outlined"
    hide-details="auto"
    :rules="[levelRule]"
    style="min-width: 100px"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function levelRule(v: unknown) {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1 || n > 120) return 'Level must be 1–120'
  return true
}

function onInput(v: unknown) {
  const n = Number(v)
  if (Number.isInteger(n) && n >= 1 && n <= 120) emit('update:modelValue', n)
}
</script>
