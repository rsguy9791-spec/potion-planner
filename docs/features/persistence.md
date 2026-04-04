# Feature: Persistence

All calculator state is saved to and restored from `localStorage` (key: `pots_calculator`) automatically.

## Serialised fields

`herbloreLevel`, `herbSupply`, `itemSupply`, `potionSupply`, `secondaryModes`, `disabledRecipes`, `preferredRecipeTier`, `scrollOfCleansing`, `targets`

Maps/Sets are serialised as entry arrays. A `version` field (`STATE_VERSION = 1`) is included; a version mismatch clears localStorage and resets to defaults. Corrupt JSON also clears localStorage.

## Mechanism

A `watch` on a `serializeState` computed string writes to `localStorage` on every state change. `loadFromStorage` runs once on composable initialisation.

## Key files

- `src/composables/useCalculator.ts` — `serializeState`, `loadFromStorage`
