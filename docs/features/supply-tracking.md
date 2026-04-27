# Feature: Supply Tracking

Enter your current inventory so the calculator knows what you already have. It subtracts your supply from the total requirements, reducing both the ingredients needed and the crafts scheduled.

## Herb supply

For each herb, you can enter:

- **Clean** — clean herbs in your bank
- **Grimy** — grimy herbs (treated as clean for calculation purposes)
- **Unf** — pre-made unfinished potions for that herb

Entering unfinished potions reduces how many scratch herb+vial mixes the calculator schedules. For example, if you need 10 prayer potions and have 4 ranarr unf, the Unfinished Potions group will show only 6 mixes instead of 10.

## Secondary supply

Enter quantities of secondaries you already have. Per-secondary gathering behaviour is configured separately in the Recipes sidebar (Gather / Cap / Skip modes).

## Potion supply

Enter existing potions by dose size. The calculator converts these to a dose pool and deducts them from requirements before scheduling any crafts.

## Vials & bases

Enter vials of water, coconut milk, and other crafting bases.

---

## Clearing supply

Each supply section has a **Clear** button to zero out all values in that section at once. The **Reset All** button in the app bar clears everything including targets.
