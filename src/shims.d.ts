// Vuetify CSS import — no type declarations needed
declare module 'vuetify/styles'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
