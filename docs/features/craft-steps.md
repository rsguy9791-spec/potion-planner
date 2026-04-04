# Feature: Craft Steps

An ordered list of crafting steps derived from the calculation, shown in a collapsible panel below the ingredient table.

## Behaviour

Steps are in **post-order** (children before parents) — base potions first, overloads last. Only potions with a craft count > 0 after supply deduction appear.

Each step shows: craft count, potion name, output dose, and total input quantities consumed.

## Decant steps

When a crafted potion must be used at a **different dose** than it produces (e.g. overloads produce 3-dose but supreme overload needs 4-dose), the consuming step's input shows a decant note inline:

```
3. Make 2× Overload (3-dose)
4. Make 1× Supreme overload (6-dose)
   2× Overload (4-dose) [↔ decant 2 3-dose], ...
```

`decantFrom.fromCount` = how many crafted-dose potions to decant. Only appears when the ingredient was actually crafted (not fully covered by supply at the target dose).

## Implementation

`craftCounts: Map<id, number>` and `craftOrder: id[]` are collected in post-order during `resolveChain`. `buildSteps` converts these to `CraftStep[]` and annotates inputs with `decantFrom` when a dose mismatch exists for a crafted ingredient.

```ts
interface CraftStep {
  potionId: IngredientId
  name: string
  category: PotionCategory
  crafts: number
  outputDose: PotionDose
  inputs: Array<{
    id: IngredientId
    name: string
    qty: number          // scroll-adjusted quantity
    rawQty: number       // unadjusted quantity (equals qty when scroll inactive or not saveable)
    dose?: PotionDose
    decantFrom?: { fromDose: PotionDose; fromCount: number }
  }>
}
```

## Key files

- `src/lib/calculator/builders.ts` — `buildSteps` (decant annotation is inline, no separate `buildDecantMap`)
- `src/lib/calculator/resolution.ts` — craft tracking (`craftCounts`, `craftOrder`, `decantConsumed`) in `resolveChain`
- `src/types/index.ts` — `CraftStep`
- `src/components/ResultsTable.vue` — renders steps and decant lines
