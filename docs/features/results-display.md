# Feature: Results Display

The right-hand column shows crafting steps and a summary banner when there are shortfalls.

## Crafting Steps panel (`CraftingSteps.vue`)

Steps are ordered topologically so inputs are crafted before the potions that consume them. Each step shows:

- Craft count and potion name
- Output dose size
- Input quantities (scroll savings shown in green when active)
- XP earned for that step

Unfinished-potion steps appear in a separate group above the regular steps; they show no XP.

A **Total XP** figure is shown in the panel header whenever there is any XP to display.

## Summary banner (`SummaryBanner.vue`)

Appears above the steps when `shortfalls.length > 0`. Lists untradeable items that can't be obtained and the max achievable quantity per affected target.

## Supply list panel (`SupplyColumn.vue` + `SupplyTable.vue`)

The left column shows an accordion with four sections: Herbs & Unfinished Potions, Secondaries, Potions, and Vials & Bases. Each section uses `SupplyTable` to render rows.

### Row colouring

| State | Colour | Condition |
|---|---|---|
| Covered | Green remaining | `remaining === 0` and `isNeeded` |
| Deficit | Red remaining | `remaining > 0`, tradeable |
| Untradeable shortfall | Orange remaining + lock icon | `remaining > 0`, untradeable |
| Not needed | Dimmed | `isNeeded === false` |

### Scroll of Cleansing savings

When `scrollSavings > 0`, the Needed cell shows a leaf icon and a tooltip with the unmodified (`rawQty`) quantity.

## Key files

- `src/components/CraftingSteps.vue`
- `src/components/SupplyColumn.vue`
- `src/components/SupplyTable.vue`
- `src/components/SummaryBanner.vue`
- `src/lib/calculator/builders.ts` — `buildResults`, `buildSteps`
- `src/lib/calculator/achievability.ts` — `computeAchievability`
