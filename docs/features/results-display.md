# Feature: Results Display

`ResultsTable.vue` shows ingredients needed, current supply, and still-needed quantities.

## Ingredient table

Sorted: herbs → secondaries → potions → vials/misc.

| Row state | Colour | Condition |
|---|---|---|
| Covered | Green | `stillNeeded === 0` |
| Deficit | Red | `stillNeeded > 0`, tradeable |
| Untradeable shortfall | Orange | `stillNeeded > 0`, untradeable — lock icon shown |

**Scroll of Cleansing:** when `rawQty !== totalNeeded`, the Total Needed cell shows a leaf icon and a tooltip with the unmodified quantity.

**Currently Have:** editable inline for non-potion rows (herbs and items). Potion rows are read-only (derived from dose pool consumption).

## Summary banner

`SummaryBanner.vue` appears above the table when `shortfalls.length > 0`, listing untradeable items that can't be obtained and the max achievable quantity per affected target.

## Craft steps

Collapsible panel below the table. Each step shows craft count, name, output dose, and input quantities. Inputs with a `decantFrom` field render an inline decant note in info colour: `↔ decant N X-dose`.

## Key files

- `src/components/ResultsTable.vue`
- `src/components/SummaryBanner.vue`
- `src/App.vue`
- `src/lib/calculator/builders.ts` — `buildResults`, `buildSteps`
- `src/lib/calculator/achievability.ts` — `computeAchievability`
