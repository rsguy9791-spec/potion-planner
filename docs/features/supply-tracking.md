# Feature: Supply Tracking

Enter your current inventory so the calculator knows what you already have. It subtracts your supply from the total requirements, reducing both the ingredients needed and the crafts scheduled.

## Herb supply

For each herb, you can enter three quantities using the icon-labelled inputs:

- **Leaf icon** — clean herbs in your bank
- **Liquid-spot icon** — grimy herbs (treated as clean for calculation purposes)
- **Half-circle icon** — pre-made unfinished potions for that herb

Entering unfinished potions reduces how many scratch herb+vial mixes the calculator schedules. For example, if you need 10 prayer potions and have 4 ranarr unf, the Unfinished Potions group will show only 6 mixes instead of 10.

## Secondary supply

Enter quantities of secondaries you already have. Per-secondary gathering behaviour is configured separately in the Recipes sidebar (Gather / Cap / Skip modes).

## Potion supply

Enter existing potions by dose size using the numeric icon inputs (3, 4, or 6). Flasks only show the 6-dose input. The calculator converts these to a dose pool and deducts them from requirements before scheduling any crafts.

## Vials & bases

Enter vials of water, coconut milk, and other crafting bases.

---

## Clearing supply

The **⋯ menu** at the top of the Supply list panel lets you:

- **Show all** / **Collapse all** — expand or hide non-needed rows across all sections
- **Clear supply** — zero out all values in a specific section (Herbs, Potions, Secondaries, or Vials & Bases)

The **Reset All** button in the app bar clears everything including targets.

---

## Architecture

Supply state lives in `useCalculator` (module-level singleton). `useSupply` wraps it, exposes a `data` computed property containing typed supply rows, and re-exports all setters so supply-view components only need to import from `useSupply`.

### Supply row types

`SupplyRow` is a discriminated union:

- `HerbSupplyRow` (`kind: 'herb'`) — `qtyClean`, `qtyGrimy`, `qtyUnf`
- `PotionSupplyRow` (`kind: 'potion'`) — `qtyThree`, `qtyFour`, `qtySix`; `isFlask` flag
- `ItemSupplyRow` (`kind: 'secondary' | 'vial' | 'misc'`) — `qty`

All variants share a `SupplyRowBase` with `totalNeeded`, `rawQty`, `scrollSavings`, `remaining`, and `isNeeded`.

### Key files

- `src/composables/useSupply.ts` — `data` computed, typed row builders, re-exports setters
- `src/composables/useCalculator.ts` — supply state, `patchHerb`/`patchPotion` helpers, `resetCategory`
- `src/components/SupplyColumn.vue` — accordion panel layout, show-all/collapse-all logic
- `src/components/SupplyTable.vue` — per-row inputs with icon badges; uses discriminated union + `v-for` alias cast pattern
- `src/types/index.ts` — `HerbSupplyRow`, `PotionSupplyRow`, `ItemSupplyRow`, `SupplyRow`
