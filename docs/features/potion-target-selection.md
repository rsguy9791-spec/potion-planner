# Feature: Potion Target Selection

Users select one or more potions to craft with quantities. Multiple targets share supply and are resolved together.

## Behaviour

- Dropdown filtered to `levelRequired <= herbloreLevel`; potions grouped by category
- Recipe groups (e.g. Vulnerability Bomb) show one entry; the calculator picks the highest unlocked variant
- Targets with no potion selected or `qty ≤ 0` are ignored at calculation time
- Removing the last target inserts a blank one automatically

## Key files

- `src/composables/useCalculator.ts` — `targets`, `addTarget`, `removeTarget`, `setTargetPotion`, `setTargetQty`, `availableTargets`
- `src/components/TargetList.vue`
