# Feature: Supply Tracking

Players declare existing inventory so the calculator can subtract it from requirements.

## Categories

| Field | Type | Notes |
|---|---|---|
| `herbSupply` | `Map<cleanHerbId, { cleanQty, grimyQty }>` | Grimy counts as clean at calculation time |
| `potionSupply` | `Map<potionId, { threeDose, fourDose, sixDose }>` | Stored as total dose pool; mixed sizes handled correctly. Flasks (6-dose) show only a 6-dose field. |
| `itemSupply` | `Map<itemId, qty>` | Secondaries, vials, misc |

The dose pool is shared across all targets and consumed during chain resolution.

## Secondary modes

Per-secondary gathering behaviour is configured in the Recipes sidebar (`secondaryModes` map), not the supply table. See `recipe-management` spec.

## UI

`SupplyTable.vue` has four static sections (Herbs, Secondaries, Potions, Vials & Bases), each with a Clear button. Rows are derived from the full `INGREDIENTS` list and `SUPPLY_POTION_IDS` — all known ingredients are always shown, not filtered to current targets. Potions are grouped by category with category labels.

## Key files

- `src/composables/useCalculator.ts` — `setHerbClean/Grimy`, `setItemQty`, `setPotionThreeDose/FourDose/SixDose`, `resetCategory`
- `src/components/SupplyTable.vue`
- `src/lib/calculator/resolution.ts` — `buildDosePool`, `buildSecondaryPool`
