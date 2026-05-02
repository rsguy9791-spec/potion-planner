<template>
  <v-dialog v-model="model" max-width="640">
    <v-card title="Export / Import State">
      <v-card-text>
        <v-textarea
          v-model="json"
          rows="14"
          variant="outlined"
          density="compact"
          hide-details
          spellcheck="false"
          style="font-family: monospace; font-size: 0.78rem;"
        />
        <div v-if="error" class="text-error text-caption mt-2">{{ error }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn prepend-icon="mdi-content-copy" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cancel</v-btn>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-import" @click="apply">Import</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCalculator } from '@/composables/useCalculator'

const model = defineModel<boolean>()

const { serializeState, importState } = useCalculator()

const json = ref('')
const error = ref('')
const copied = ref(false)

watch(model, (open) => {
  if (open) {
    json.value = JSON.stringify(JSON.parse(serializeState()), null, 2)
    error.value = ''
  }
})

async function copy() {
  await navigator.clipboard.writeText(json.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function apply() {
  error.value = ''
  try {
    importState(json.value)
    model.value = false
  } catch (e: any) {
    error.value = e?.message ?? 'Invalid JSON'
  }
}
</script>
