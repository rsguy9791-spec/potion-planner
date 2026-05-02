/**
 * Lightweight Vuetify component stubs for unit tests.
 * Each stub renders enough HTML for Testing Library queries to work
 * (label+input associations, button roles, text content) without
 * mounting the full Vuetify component tree.
 */

let _uid = 0
const nextId = () => `stub-${++_uid}`

const slotPassthrough = { template: '<div><slot /></div>' }
const slotPassthroughSpan = { template: '<span><slot /></span>' }

export const vuetifyStubs = {
  // ── Layout ────────────────────────────────────────────────────────────────
  VCard: slotPassthrough,
  VCardTitle: slotPassthrough,
  VCardText: slotPassthrough,
  VRow: slotPassthrough,
  VCol: slotPassthrough,
  VSpacer: { template: '<span />' },
  VDivider: { template: '<hr />' },
  VList: slotPassthrough,
  // inheritAttrs:false + v-bind="$attrs" puts onClick/title directly on the root div,
  // making menu items clickable and queryable by their title text.
  VListItem: {
    inheritAttrs: false,
    template: '<div v-bind="$attrs"><slot name="prepend" />{{ $attrs.title }}<slot /></div>',
  },
  VListItemTitle: slotPassthrough,
  VListItemSubtitle: slotPassthroughSpan,
  VListSubheader: slotPassthrough,

  // ── Expansion panels (render all content unconditionally) ─────────────────
  VExpansionPanels: slotPassthrough,
  VExpansionPanel: slotPassthrough,
  VExpansionPanelTitle: slotPassthrough,
  VExpansionPanelText: slotPassthrough,

  // ── Table ─────────────────────────────────────────────────────────────────
  VTable: { template: '<table><slot /></table>' },

  // ── Feedback ──────────────────────────────────────────────────────────────
  VAlert: {
    props: ['title', 'type', 'variant'],
    template: '<div class="v-alert">{{ title }}<slot /></div>',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  VBtn: {
    template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
    emits: ['click'],
  },
  VBtnToggle: slotPassthrough,
  VChip: {
    template: '<span v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></span>',
    emits: ['click'],
  },

  // ── Icons / tooltips ──────────────────────────────────────────────────────
  VIcon: { template: '<span v-bind="$attrs"><slot /></span>' },
  VTooltip: {
    // Render activator slot so the trigger element appears in the DOM.
    template: '<div><slot name="activator" :props="{}" /></div>',
  },

  // ── Form inputs ───────────────────────────────────────────────────────────
  VTextField: {
    inheritAttrs: false,
    props: ['modelValue', 'label', 'type', 'rules'],
    emits: ['update:modelValue'],
    data() { return { uid: nextId() } },
    template: `
      <div>
        <label :for="uid">{{ label }}</label>
        <input
          :id="uid"
          :type="type || 'text'"
          :value="modelValue"
          :aria-label="$attrs['aria-label']"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
  },

  VAutocomplete: {
    inheritAttrs: false,
    props: ['modelValue', 'label', 'items'],
    emits: ['update:modelValue'],
    data() { return { uid: nextId() } },
    template: `
      <div>
        <label :for="uid">{{ label }}</label>
        <input
          :id="uid"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
  },

  VSelect: {
    inheritAttrs: false,
    props: ['modelValue', 'label', 'items'],
    emits: ['update:modelValue'],
    data() { return { uid: nextId() } },
    template: `
      <div>
        <label :for="uid">{{ label }}</label>
        <select :id="uid" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <option v-for="item in items" :key="item.value ?? item" :value="item.value ?? item">
            {{ item.title ?? item }}
          </option>
        </select>
      </div>
    `,
  },

  VSwitch: {
    props: ['modelValue', 'disabled'],
    emits: ['update:modelValue'],
    template: `<input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit('update:modelValue', $event.target.checked)" />`,
  },

  VSlider: {
    props: ['modelValue', 'min', 'max', 'step'],
    emits: ['update:modelValue'],
    template: `<input type="range" :value="modelValue" :min="min" :max="max" :step="step" @input="$emit('update:modelValue', Number($event.target.value))" />`,
  },

  // ── Menu ──────────────────────────────────────────────────────────────────
  VMenu: {
    template: '<div><slot name="activator" :props="{}" /><slot /></div>',
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  VNavigationDrawer: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue"><slot /></div>',
  },

  VToolbar: slotPassthrough,
  VToolbarTitle: slotPassthrough,
}
