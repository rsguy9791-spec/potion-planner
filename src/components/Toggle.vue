<template>
  <v-list-item class="perk-toggle">
    <template #prepend>
      <v-switch
        :model-value="modelValue"
        :color="modelValue ? 'primary' : undefined"
        :disabled="disabled"
        hide-details
        density="compact"
        class="perk-toggle__switch"
        @update:model-value="emit('update:modelValue', !!$event)"
      />
    </template>
    <v-list-item-title class="text-body-2">{{ label }}</v-list-item-title>
    <v-list-item-subtitle v-if="description" class="text-caption">{{ description }}</v-list-item-subtitle>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.perk-toggle {
  padding-block: 2px;
}
.perk-toggle__switch {
  padding-right:8px;
  margin-inline-end: 8px;
}
</style>
