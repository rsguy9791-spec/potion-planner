# Feature: Recipe Chain Calculator

Recursive depth-first traversal of the recipe DAG from target potions down to raw ingredients.

## `resolveChain` algorithm

1. `selectBestRecipe` — highest unlocked level variant; respects `preferredRecipeTier`
2. No recipe found:
   - Known potion (in `RECIPE_BY_ID`) but level-locked → deduct from dose pool, add remainder as purchase
   - Unknown id (raw ingredient) → add qty to accumulator directly
3. Recipe in `disabledRecipes` → consume dose pool, add remainder as purchase (always added to accumulator, even at 0, so potion appears in results when fully covered by supply)
4. Dose pool deduction — consume `min(available, required)` doses; compute `craftsNeeded = ceil(remaining / outputDose)`
5. Secondary mode check (`computeCraftLimits`):
   - Any input has `skip` mode → entire recipe becomes a purchase
   - `use_available` inputs → cap crafts to floor(available / perCraft); remainder becomes purchases
6. Consume `use_available` secondary pool for crafts that will execute
7. Recurse into inputs (applying Scroll of Cleansing multiplier); accumulate non-potion inputs directly
8. Post-order: record craft count after all inputs resolved (children before parents)
9. Remaining crafts (from `use_available` cap) become required supply of this potion
10. Cycle guard via `visiting: Set<IngredientId>` — throws on cycle detection

## Multi-target

`calculateAll` runs each target sequentially sharing one dose pool and secondary pool. Supply is deducted globally, not per-target.

## Scroll of Cleansing

`inputs[0]` is never saved. Multiplier depends on recipe type:

- **`twoStepMix: true`** (standard 3-dose potions) — each saveable input gets an independent 10% roll → multiplier **0.9** each
- **Everything else** — 10% shared across N saveable inputs → multiplier `1 − 0.1/N` each

`calculateAll` runs a single pass. The accumulator stores `{ qty, rawQty }` pairs — `qty` is scroll-adjusted, `rawQty` is unmodified — so the UI can show both without a second traversal.

## Level-gated variants

Recipes with `recipeGroup` are selected by highest unlocked level. Users can pin a specific tier via `preferredRecipeTier`.

## Key files

- `src/lib/calculator/index.ts` — `calculateAll`
- `src/lib/calculator/resolution.ts` — `resolveChain`, `buildDosePool`, `buildSecondaryPool`
- `src/lib/calculator/scroll.ts` — `cleansingMultiplier`, `isCleansingSaveable`
- `src/lib/calculator/builders.ts` — `buildResults`, `buildSteps`
- `src/lib/calculator/achievability.ts` — `computeAchievability`
- `src/lib/calculator/types.ts` — `ResolveConfig`, `ResolveState`, `Accumulator`
- `src/data/recipes.ts` — `RECIPE_BY_ID`, `RECIPE_GROUPS`, `INGREDIENT_MAP`, `selectBestRecipe`
- `src/types/index.ts` — `Recipe`, `RecipeIngredient`, `CalculatorInputs`, `CalculationResult`
