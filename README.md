# RS3 Potion Planner

A calculator for planning potion crafting in RuneScape 3. Enter your target potions and current supplies to get a full ingredient breakdown, crafting steps, and shortfall warnings.

**Live site:** https://rsguy9791-spec.github.io/potion-planner/

## Features

- **Multi-target planning** — queue several potions at once; supply is shared across all targets
- **Full recipe chain resolution** — traces every intermediate step down to raw herbs and secondaries
- **Supply tracking** — enter your current herbs (clean, grimy, and unfinished), potions, and secondaries to see what you still need
- **Unfinished potion supply** — declare pre-made unf potions per herb to reduce the number of scratch mixes scheduled
- **Crafting steps** — ordered step list with unfinished potions grouped separately, XP per step, and decant notes for dose mismatches
- **XP tracking** — per-step and total XP display, boosted by configurable boosts (clan fealty, botanist outfit, perfect juju, custom %)
- **Perks panel** — configure Scroll of Cleansing, Factory outfit, Modified botanist mask, Portable well, and Brooch of the Gods to adjust craft counts
- **Recipe management** — disable specific recipes (treat as purchases) or pin a specific tier for level-variant potions (e.g. Vulnerability bomb)
- **Secondary modes** — per-secondary settings: Gather (calculate normally), Cap (use only what you have), or Skip (buy the whole recipe output)
- **Shortfall warnings** — highlights untradeable items that can't be obtained and shows the maximum achievable quantity per target

## Stack

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vitejs.dev/)
- [Vuetify 3](https://vuetifyjs.com/) (Material Design components)

## Development

```bash
yarn install
yarn dev        # dev server at http://localhost:5173
yarn build      # type-check + production build
yarn test       # run unit tests
```

## Project structure

```
src/
  components/       Vue components (App, TargetList, SupplyTable, ResultsTable, …)
  composables/      useCalculator — reactive state + persistence
  data/             recipes.ts, ingredients.ts, constants.ts
  lib/calculator/   core calculation engine (resolution, builders, scroll, achievability)
  types/            shared TypeScript types
__tests__/
  components/       component tests (Testing Library + Vuetify)
  lib/              calculator unit tests
```
