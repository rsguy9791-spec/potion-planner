import type { Recipe, RecipeGroup } from '@/types'
export { INGREDIENTS, INGREDIENT_MAP, UNF_BY_HERB } from './ingredients'

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const RECIPES: Recipe[] = [
  // ── Basic potions — unf step ───────────────────────────────────────────────
  {
    id: 'harralander_potion_unf', name: 'Harralander potion (unf)',
    levelRequired: 18, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',    kind: 'vial', qty: 1 },
      { id: 'clean_harralander',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'guthix_rest', name: 'Guthix rest',
    levelRequired: 18, outputDose: 3, category: 'regular', xpPerCraft: 59.5,
    inputs: [
      { id: 'harralander_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'clean_marrentill',       kind: 'herb',              qty: 1 },
    ],
  },
  {
    id: 'energy_potion', name: 'Energy potion',
    levelRequired: 26, outputDose: 3, category: 'regular', xpPerCraft: 67.5,
    inputs: [
      { id: 'harralander_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'chocolate_dust',         kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'ranarr_potion_unf', name: 'Ranarr potion (unf)',
    levelRequired: 38, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_ranarr',  kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'prayer_potion', name: 'Prayer potion',
    levelRequired: 38, outputDose: 3, category: 'regular', xpPerCraft: 87.5,
    inputs: [
      { id: 'ranarr_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'snape_grass',       kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'spirit_weed_potion_unf', name: 'Spirit weed potion (unf)',
    levelRequired: 40, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',    kind: 'vial', qty: 1 },
      { id: 'clean_spirit_weed',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'summoning_potion', name: 'Summoning potion',
    levelRequired: 40, outputDose: 3, category: 'regular', xpPerCraft: 92,
    inputs: [
      { id: 'spirit_weed_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'cockatrice_egg',         kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'irit_potion_unf', name: 'Irit potion (unf)',
    levelRequired: 45, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_irit',    kind: 'herb', qty: 1 },
    ],
  },

  // ── Super potions ──────────────────────────────────────────────────────────
  {
    id: 'super_attack', name: 'Super attack',
    levelRequired: 45, outputDose: 3, category: 'super', xpPerCraft: 100,
    inputs: [
      { id: 'irit_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'eye_of_newt',     kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'lantadyme_potion_unf', name: 'Lantadyme potion (unf)',
    levelRequired: 46, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_lantadyme',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'antifire', name: 'Antifire potion',
    levelRequired: 46, outputDose: 3, category: 'regular', xpPerCraft: 157.5,
    inputs: [
      { id: 'lantadyme_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'dragon_scale_dust',    kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'super_antipoison', name: 'Super antipoison',
    levelRequired: 48, outputDose: 3, category: 'super', xpPerCraft: 106.3,
    inputs: [
      { id: 'irit_potion_unf',    kind: 'unfinished_potion', qty: 1 },
      { id: 'unicorn_horn_dust',  kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'avantoe_potion_unf', name: 'Avantoe potion (unf)',
    levelRequired: 52, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_avantoe', kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'super_energy', name: 'Super energy',
    levelRequired: 52, outputDose: 3, category: 'super', xpPerCraft: 117.5,
    inputs: [
      { id: 'avantoe_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'mort_myre_fungus',   kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'wergali_potion_unf', name: 'Wergali potion (unf)',
    levelRequired: 54, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_wergali', kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'runecrafting_potion', name: 'Runecrafting potion',
    levelRequired: 54, outputDose: 3, category: 'regular', xpPerCraft: 122.5,
    inputs: [
      { id: 'wergali_potion_unf',  kind: 'unfinished_potion', qty: 1 },
      { id: 'seasonal_sheep_wool', kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'kwuarm_potion_unf', name: 'Kwuarm potion (unf)',
    levelRequired: 55, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_kwuarm',  kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'super_strength', name: 'Super strength',
    levelRequired: 55, outputDose: 3, category: 'super', xpPerCraft: 125,
    inputs: [
      { id: 'kwuarm_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'limpwurt_root',     kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'snapdragon_potion_unf', name: 'Snapdragon potion (unf)',
    levelRequired: 63, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_snapdragon',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'super_restore', name: 'Super restore',
    levelRequired: 63, outputDose: 3, category: 'super', xpPerCraft: 142.5,
    inputs: [
      { id: 'snapdragon_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'red_spiders_eggs',      kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'cadantine_potion_unf', name: 'Cadantine potion (unf)',
    levelRequired: 66, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_cadantine',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'super_defence', name: 'Super defence',
    levelRequired: 66, outputDose: 3, category: 'super', xpPerCraft: 150,
    inputs: [
      { id: 'cadantine_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'white_berries',        kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'dwarf_weed_potion_unf', name: 'Dwarf weed potion (unf)',
    levelRequired: 72, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_dwarf_weed',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'super_ranging', name: 'Super ranging',
    levelRequired: 72, outputDose: 3, category: 'super', xpPerCraft: 162.5,
    inputs: [
      { id: 'dwarf_weed_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'wine_of_zamorak',       kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'super_magic', name: 'Super magic',
    levelRequired: 76, outputDose: 3, category: 'super', xpPerCraft: 172.5,
    inputs: [
      { id: 'lantadyme_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'potato_cactus',        kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'super_runecrafting', name: 'Super runecrafting potion',
    levelRequired: 75, outputDose: 3, category: 'super', xpPerCraft: 170,
    inputs: [
      { id: 'runecrafting_potion', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'yak_milk',            kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'stamina_potion', name: 'Stamina potion',
    levelRequired: 77, outputDose: 3, category: 'renewals', xpPerCraft: 175,
    inputs: [
      { id: 'super_energy',  kind: 'potion', qty: 1, dose: 3 },
      { id: 'vial_of_water', kind: 'vial',   qty: 1 },
      { id: 'clean_arbuck',  kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'invention_potion', name: 'Invention potion',
    levelRequired: 77, outputDose: 3, category: 'regular', xpPerCraft: 175,
    inputs: [
      { id: 'snapdragon_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'chinchompa_residue',    kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'toadflax_potion_unf', name: 'Toadflax potion (unf)',
    levelRequired: 81, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water', kind: 'vial', qty: 1 },
      { id: 'clean_toadflax',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'saradomin_brew', name: 'Saradomin brew',
    levelRequired: 81, outputDose: 3, category: 'regular', xpPerCraft: 180,
    inputs: [
      { id: 'toadflax_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'crushed_nest',        kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'weapon_poison_pp_unf', name: 'Weapon poison++ (unf)',
    levelRequired: 82, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'coconut_milk',   kind: 'vial', qty: 1 },
      { id: 'cave_nightshade',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'weapon_poison_pp', name: 'Weapon poison++',
    levelRequired: 82, outputDose: 3, category: 'super', xpPerCraft: 190,
    inputs: [
      { id: 'weapon_poison_pp_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'poison_ivy_berries',   kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'bloodweed_potion_unf', name: 'Bloodweed potion (unf)',
    levelRequired: 82, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_bloodweed',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'aggression_potion', name: 'Aggression potion',
    levelRequired: 82, outputDose: 3, category: 'regular', xpPerCraft: 185,
    inputs: [
      { id: 'bloodweed_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'searing_ashes',        kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'super_necromancy', name: 'Super necromancy',
    levelRequired: 79, outputDose: 3, category: 'super', xpPerCraft: 177.5,
    inputs: [
      { id: 'spirit_weed_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'congealed_blood',        kind: 'secondary',          qty: 5 },
    ],
  },

  // ── Adrenaline potions ─────────────────────────────────────────────────────
  {
    id: 'adrenaline_potion', name: 'Adrenaline potion',
    levelRequired: 84, outputDose: 3, category: 'regular', xpPerCraft: 200,
    inputs: [
      { id: 'super_energy', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'papaya_fruit', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'super_antifire', name: 'Super antifire',
    levelRequired: 85, outputDose: 3, category: 'super', xpPerCraft: 210,
    inputs: [
      { id: 'antifire',        kind: 'potion',    qty: 1, dose: 3 },
      { id: 'phoenix_feather', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'super_invention', name: 'Super invention potion',
    levelRequired: 87, outputDose: 3, category: 'super', xpPerCraft: 220,
    inputs: [
      { id: 'invention_potion', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'spider_fangs',     kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'super_adrenaline', name: 'Super adrenaline potion',
    levelRequired: 87, outputDose: 3, category: 'super', xpPerCraft: 200,
    inputs: [
      { id: 'adrenaline_potion',  kind: 'potion',    qty: 1, dose: 3 },
      { id: 'adrenaline_crystal', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'summoning_renewal', name: 'Summoning renewal potion',
    levelRequired: 88, outputDose: 3, category: 'renewals', xpPerCraft: 220,
    inputs: [
      { id: 'spirit_weed_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'tombshroom',             kind: 'secondary',          qty: 1 },
    ],
  },

  // ── Extreme potions ────────────────────────────────────────────────────────
  {
    id: 'extreme_attack', name: 'Extreme attack',
    levelRequired: 88, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 220,
    inputs: [
      { id: 'super_attack',  kind: 'potion', qty: 1, dose: 3 },
      { id: 'clean_avantoe', kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'extreme_strength', name: 'Extreme strength',
    levelRequired: 89, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 230,
    inputs: [
      { id: 'super_strength',  kind: 'potion', qty: 1, dose: 3 },
      { id: 'clean_dwarf_weed',kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'extreme_defence', name: 'Extreme defence',
    levelRequired: 90, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 240,
    inputs: [
      { id: 'super_defence',   kind: 'potion', qty: 1, dose: 3 },
      { id: 'clean_lantadyme', kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'extreme_runecrafting', name: 'Extreme runecrafting potion',
    levelRequired: 91, outputDose: 3, category: 'extreme', xpPerCraft: 250,
    inputs: [
      { id: 'super_runecrafting', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'spider_venom',       kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'extreme_magic', name: 'Extreme magic',
    levelRequired: 91, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 250,
    inputs: [
      { id: 'super_magic',     kind: 'potion',    qty: 1, dose: 3 },
      { id: 'ground_mud_rune', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'extreme_ranging', name: 'Extreme ranging',
    levelRequired: 92, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 260,
    inputs: [
      { id: 'super_ranging',   kind: 'potion',    qty: 1, dose: 3 },
      { id: 'grenwall_spikes', kind: 'secondary', qty: 5 },
    ],
  },
  {
    id: 'extreme_necromancy', name: 'Extreme necromancy',
    levelRequired: 93, outputDose: 3, category: 'extreme', tradeable: false, xpPerCraft: 265,
    inputs: [
      { id: 'super_necromancy',   kind: 'potion',    qty: 1, dose: 3 },
      { id: 'ground_miasma_rune', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'extreme_invention', name: 'Extreme invention potion',
    levelRequired: 95, outputDose: 3, category: 'extreme', xpPerCraft: 300,
    inputs: [
      { id: 'super_invention',  kind: 'potion',    qty: 1, dose: 3 },
      { id: 'mycelial_webbing', kind: 'secondary', qty: 1 },
    ],
  },

  // ── Combination potions ────────────────────────────────────────────────────
  {
    id: 'replenishment', name: 'Replenishment potion',
    levelRequired: 87, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 256.9,
    inputs: [
      { id: 'crystal_flask',     kind: 'vial',   qty: 1 },
      { id: 'adrenaline_potion', kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_restore',     kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'wyrmfire', name: 'Wyrmfire potion',
    levelRequired: 89, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 275.7,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'antifire',       kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antifire', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'enhanced_replenishment', name: 'Enhanced replenishment potion',
    levelRequired: 90, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 256.9,
    inputs: [
      { id: 'replenishment',      kind: 'potion',    qty: 1, dose: 6 },
      { id: 'adrenaline_crystal', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'supreme_attack_combo', name: 'Supreme attack',
    levelRequired: 93, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 240,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'super_attack',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'extreme_attack', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'supreme_strength_combo', name: 'Supreme strength',
    levelRequired: 93, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 266.3,
    inputs: [
      { id: 'crystal_flask',    kind: 'vial',   qty: 1 },
      { id: 'super_strength',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'extreme_strength', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'supreme_defence_combo', name: 'Supreme defence',
    levelRequired: 93, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 292.5,
    inputs: [
      { id: 'crystal_flask',   kind: 'vial',   qty: 1 },
      { id: 'super_defence',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'extreme_defence', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'supreme_ranging_combo', name: 'Supreme ranging',
    levelRequired: 93, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 217.5,
    inputs: [
      { id: 'crystal_flask',   kind: 'vial',   qty: 1 },
      { id: 'super_ranging',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'extreme_ranging', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'supreme_magic_combo', name: 'Supreme magic',
    levelRequired: 93, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 316.9,
    inputs: [
      { id: 'crystal_flask', kind: 'vial',   qty: 1 },
      { id: 'super_magic',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'extreme_magic', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'super_prayer_renewal', name: 'Super prayer renewal',
    levelRequired: 96, outputDose: 6, category: 'combination', xpPerCraft: 208.2,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'prayer_potion',  kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_renewal', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'brightfire', name: 'Brightfire potion',
    levelRequired: 94, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 300,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'super_antifire', kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_renewal', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'spiritual_prayer', name: 'Spiritual prayer potion',
    levelRequired: 110, outputDose: 6, category: 'combination', tradeable: false, xpPerCraft: 850,
    inputs: [
      { id: 'crystal_flask',    kind: 'vial',   qty: 1 },
      { id: 'primal_extract',   kind: 'misc',   qty: 1 },
      { id: 'prayer_potion',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'summoning_potion', kind: 'potion', qty: 1, dose: 4 },
    ],
  },

  // ── Brews & Renewals ───────────────────────────────────────────────────────
  {
    id: 'fellstalk_potion_unf', name: 'Fellstalk potion (unf)',
    levelRequired: 94, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'vial_of_water',  kind: 'vial', qty: 1 },
      { id: 'clean_fellstalk',kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'prayer_renewal', name: 'Prayer renewal',
    levelRequired: 94, outputDose: 3, category: 'renewals', xpPerCraft: 190,
    inputs: [
      { id: 'fellstalk_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'morchella_mushroom',   kind: 'secondary',          qty: 1 },
    ],
  },
  {
    id: 'arbuck_potion_unf', name: 'Arbuck potion (unf)',
    levelRequired: 95, outputDose: 1, category: 'unfinished', xpPerCraft: 0,
    inputs: [
      { id: 'primal_extract', kind: 'vial', qty: 1 },
      { id: 'clean_arbuck',   kind: 'herb', qty: 1 },
    ],
  },
  {
    id: 'harvest_potion', name: 'Harvest potion',
    levelRequired: 95, outputDose: 3, category: 'regular', xpPerCraft: 300,
    inputs: [
      { id: 'arbuck_potion_unf', kind: 'unfinished_potion', qty: 1 },
      { id: 'watermelon',        kind: 'secondary',          qty: 1 },
    ],
  },

  // ── Overloads ──────────────────────────────────────────────────────────────
  {
    id: 'overload', name: 'Overload',
    levelRequired: 96, outputDose: 3, category: 'overload', tradeable: false, xpPerCraft: 1000,
    inputs: [
      { id: 'extreme_attack',     kind: 'potion', qty: 1, dose: 3 },
      { id: 'extreme_strength',   kind: 'potion', qty: 1, dose: 3 },
      { id: 'extreme_defence',    kind: 'potion', qty: 1, dose: 3 },
      { id: 'extreme_magic',      kind: 'potion', qty: 1, dose: 3 },
      { id: 'extreme_ranging',    kind: 'potion', qty: 1, dose: 3 },
      { id: 'extreme_necromancy', kind: 'potion', qty: 1, dose: 3 },
      { id: 'clean_torstol',      kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'holy_overload', name: 'Holy overload',
    levelRequired: 97, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 350,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'overload',       kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_renewal', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'aggroverload', name: 'Aggroverload',
    levelRequired: 96, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 325,
    inputs: [
      { id: 'crystal_flask',     kind: 'vial',   qty: 1 },
      { id: 'overload',          kind: 'potion', qty: 1, dose: 4 },
      { id: 'aggression_potion', kind: 'potion', qty: 1, dose: 4 },
      { id: 'clean_arbuck',      kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'overload_salve', name: 'Overload salve',
    levelRequired: 97, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 500,
    inputs: [
      { id: 'crystal_flask',    kind: 'vial',   qty: 1 },
      { id: 'overload',         kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_renewal',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_potion',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antipoison', kind: 'potion', qty: 1, dose: 4 },
      { id: 'antifire',         kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antifire',   kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'searing_overload', name: 'Searing overload',
    levelRequired: 97, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 350,
    inputs: [
      { id: 'crystal_flask',  kind: 'vial',   qty: 1 },
      { id: 'overload',       kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antifire', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'holy_aggroverload', name: 'Holy aggroverload',
    levelRequired: 98, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 600,
    recipeGroup: 'holy_aggroverload', variantLabel: 'From overload',
    inputs: [
      { id: 'crystal_flask',     kind: 'vial',      qty: 1 },
      { id: 'overload',          kind: 'potion',    qty: 1, dose: 4 },
      { id: 'aggression_potion', kind: 'potion',    qty: 1, dose: 4 },
      { id: 'prayer_renewal',    kind: 'potion',    qty: 1, dose: 4 },
      { id: 'spider_venom',      kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'holy_aggroverload_from_aggroverload', name: 'Holy aggroverload',
    levelRequired: 98, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 275,
    recipeGroup: 'holy_aggroverload', variantLabel: 'From aggroverload',
    inputs: [
      { id: 'aggroverload',   kind: 'potion',    qty: 1, dose: 6 },
      { id: 'prayer_renewal', kind: 'potion',    qty: 1, dose: 4 },
      { id: 'spider_venom',   kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'holy_aggroverload_from_holy', name: 'Holy aggroverload',
    levelRequired: 98, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 250,
    recipeGroup: 'holy_aggroverload', variantLabel: 'From holy overload',
    inputs: [
      { id: 'holy_overload',     kind: 'potion',    qty: 1, dose: 6 },
      { id: 'aggression_potion', kind: 'potion',    qty: 1, dose: 4 },
      { id: 'spider_venom',      kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'perfect_plus', name: 'Perfect plus potion',
    levelRequired: 99, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 1000,
    inputs: [
      { id: 'crystal_flask',       kind: 'vial',      qty: 1 },
      { id: 'overload',            kind: 'potion',    qty: 1, dose: 4 },
      { id: 'harmony_moss',        kind: 'secondary', qty: 1 },
      { id: 'crystal_tree_blossom',kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'supreme_overload', name: 'Supreme overload',
    levelRequired: 98, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 600,
    inputs: [
      { id: 'crystal_flask',    kind: 'vial',   qty: 1 },
      { id: 'overload',         kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_attack',     kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_defence',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_strength',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_ranging',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_magic',      kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_necromancy', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'supreme_overload_salve', name: 'Supreme overload salve',
    levelRequired: 99, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 700,
    inputs: [
      { id: 'crystal_flask',    kind: 'vial',   qty: 1 },
      { id: 'supreme_overload', kind: 'potion', qty: 1, dose: 6 },
      { id: 'prayer_renewal',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_potion',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antipoison', kind: 'potion', qty: 1, dose: 4 },
      { id: 'antifire',         kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antifire',   kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'elder_overload', name: 'Elder overload',
    levelRequired: 106, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 850,
    inputs: [
      { id: 'supreme_overload', kind: 'potion', qty: 1, dose: 6 },
      { id: 'primal_extract',   kind: 'vial',   qty: 1 },
      { id: 'clean_fellstalk',  kind: 'herb',   qty: 1 },
    ],
  },
  {
    id: 'elder_overload_salve', name: 'Elder overload salve',
    levelRequired: 107, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 750,
    recipeGroup: 'elder_overload_salve', variantLabel: 'From elder overload',
    inputs: [
      { id: 'elder_overload',   kind: 'potion', qty: 1, dose: 6 },
      { id: 'prayer_renewal',   kind: 'potion', qty: 1, dose: 4 },
      { id: 'prayer_potion',    kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antipoison', kind: 'potion', qty: 1, dose: 4 },
      { id: 'antifire',         kind: 'potion', qty: 1, dose: 4 },
      { id: 'super_antifire',   kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'elder_overload_salve_from_supreme_overload', name: 'Elder overload salve',
    levelRequired: 107, outputDose: 6, category: 'overload', tradeable: false, xpPerCraft: 900,
    recipeGroup: 'elder_overload_salve', variantLabel: 'From supreme salve',
    inputs: [
      { id: 'supreme_overload_salve', kind: 'potion', qty: 1, dose: 6 },
      { id: 'primal_extract',         kind: 'vial',   qty: 1 },
      { id: 'clean_fellstalk',        kind: 'herb',   qty: 1 },
    ],
  },

  // ── Restore additions ──────────────────────────────────────────────────────
  {
    id: 'super_guthix_rest', name: 'Super Guthix rest',
    levelRequired: 93, outputDose: 3, category: 'super', xpPerCraft: 59.5,
    inputs: [
      { id: 'guthix_rest',    kind: 'potion',    qty: 1, dose: 3 },
      { id: 'wine_of_guthix', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'super_saradomin_brew', name: 'Super Saradomin brew',
    levelRequired: 93, outputDose: 3, category: 'super', xpPerCraft: 180,
    inputs: [
      { id: 'saradomin_brew',    kind: 'potion',    qty: 1, dose: 3 },
      { id: 'wine_of_saradomin', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'weapon_poison_ppp', name: 'Weapon poison+++',
    levelRequired: 100, outputDose: 3, category: 'extreme', xpPerCraft: 700,
    inputs: [
      { id: 'weapon_poison_pp', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'poison_slime',     kind: 'secondary', qty: 1 },
      { id: 'primal_extract',   kind: 'misc',      qty: 1 },
    ],
  },

  // ── Adrenaline Renewal ─────────────────────────────────────────────────────
  {
    id: 'adrenaline_renewal_115', name: 'Adrenaline renewal',
    levelRequired: 115, outputDose: 4, category: 'renewals',
    recipeGroup: 'adrenaline_renewal', tradeable: false, xpPerCraft: 1700,
    inputs: [
      { id: 'super_adrenaline',      kind: 'potion',    qty: 1, dose: 4 },
      { id: 'primal_extract',        kind: 'vial',      qty: 1 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 2 },
      { id: 'clean_arbuck',          kind: 'herb',      qty: 1 },
    ],
  },
  {
    id: 'adrenaline_renewal_119', name: 'Adrenaline renewal',
    levelRequired: 119, outputDose: 4, category: 'renewals',
    recipeGroup: 'adrenaline_renewal', tradeable: false, xpPerCraft: 1700,
    inputs: [
      { id: 'super_adrenaline',      kind: 'potion',    qty: 1, dose: 3 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 1 },
      { id: 'clean_arbuck',          kind: 'herb',      qty: 1 },
    ],
  },

  // ── Vulnerability Bomb ─────────────────────────────────────────────────────
  {
    id: 'vuln_bomb_103', name: 'Vulnerability bomb',
    levelRequired: 103, outputDose: 1, category: 'bombs', recipeGroup: 'vuln_bomb', xpPerCraft: 1100,
    inputs: [
      { id: 'bomb_vial',             kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'soul_rune',             kind: 'secondary', qty: 5, cleansingSaveable: false },
      { id: 'chaos_rune',            kind: 'secondary', qty: 5, cleansingSaveable: false },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 2 },
      { id: 'clean_dwarf_weed',      kind: 'herb',      qty: 1 },
    ],
  },
  {
    id: 'vuln_bomb_107', name: 'Vulnerability bomb',
    levelRequired: 107, outputDose: 1, category: 'bombs', recipeGroup: 'vuln_bomb', xpPerCraft: 1100,
    inputs: [
      { id: 'bomb_vial',             kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'soul_rune',             kind: 'secondary', qty: 3, cleansingSaveable: false },
      { id: 'chaos_rune',            kind: 'secondary', qty: 3, cleansingSaveable: false },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 1 },
      { id: 'clean_dwarf_weed',      kind: 'herb',      qty: 1 },
    ],
  },

  // ── Poison Bomb ────────────────────────────────────────────────────────────
  {
    id: 'poison_bomb_99', name: 'Poison bomb',
    levelRequired: 99, outputDose: 1, category: 'bombs', recipeGroup: 'poison_bomb', xpPerCraft: 950,
    inputs: [
      { id: 'bomb_vial',        kind: 'misc',   qty: 1 },
      { id: 'primal_extract',   kind: 'misc',   qty: 1 },
      { id: 'clean_irit',       kind: 'herb',   qty: 1 },
      { id: 'poison_slime',     kind: 'secondary', qty: 2 },
      { id: 'weapon_poison_pp', kind: 'potion', qty: 1, dose: 4 },
    ],
  },
  {
    id: 'poison_bomb_103', name: 'Poison bomb',
    levelRequired: 103, outputDose: 1, category: 'bombs', recipeGroup: 'poison_bomb', xpPerCraft: 950,
    inputs: [
      { id: 'bomb_vial',        kind: 'misc',   qty: 1 },
      { id: 'primal_extract',   kind: 'misc',   qty: 1 },
      { id: 'clean_irit',       kind: 'herb',   qty: 1 },
      { id: 'poison_slime',     kind: 'secondary', qty: 1 },
      { id: 'weapon_poison_pp', kind: 'potion', qty: 1, dose: 3 },
    ],
  },

  // ── Sticky Bomb ────────────────────────────────────────────────────────────
  {
    id: 'sticky_bomb_101', name: 'Sticky bomb',
    levelRequired: 101, outputDose: 1, category: 'bombs', recipeGroup: 'sticky_bomb', xpPerCraft: 1000,
    inputs: [
      { id: 'bomb_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'beak_snot',       kind: 'secondary', qty: 2 },
      { id: 'dinosaur_claws',  kind: 'secondary', qty: 2 },
      { id: 'clean_cadantine', kind: 'herb',      qty: 1 },
    ],
  },
  {
    id: 'sticky_bomb_105', name: 'Sticky bomb',
    levelRequired: 105, outputDose: 1, category: 'bombs', recipeGroup: 'sticky_bomb', xpPerCraft: 1000,
    inputs: [
      { id: 'bomb_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'beak_snot',       kind: 'secondary', qty: 1 },
      { id: 'dinosaur_claws',  kind: 'secondary', qty: 1 },
      { id: 'clean_cadantine', kind: 'herb',      qty: 1 },
    ],
  },

  // ── Powerbursts ────────────────────────────────────────────────────────────
  {
    id: 'powerburst_of_opportunity_103', name: 'Powerburst of opportunity',
    levelRequired: 103, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_opportunity', xpPerCraft: 1050,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'dinosaur_claws',  kind: 'secondary', qty: 2 },
      { id: 'phasmatite',      kind: 'secondary', qty: 1 },
      { id: 'third_age_iron',  kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_opportunity_107', name: 'Powerburst of opportunity',
    levelRequired: 107, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_opportunity', xpPerCraft: 1050,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'dinosaur_claws',  kind: 'secondary', qty: 1 },
      { id: 'phasmatite',      kind: 'secondary', qty: 1 },
      { id: 'third_age_iron',  kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_vitality_105', name: 'Powerburst of vitality',
    levelRequired: 105, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_vitality', xpPerCraft: 1150,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'poison_slime',    kind: 'secondary', qty: 2 },
      { id: 'saradomin_brew',  kind: 'potion',    qty: 1, dose: 4 },
      { id: 'rocktail',        kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_vitality_109', name: 'Powerburst of vitality',
    levelRequired: 109, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_vitality', xpPerCraft: 1150,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'poison_slime',    kind: 'secondary', qty: 1 },
      { id: 'saradomin_brew',  kind: 'potion',    qty: 1, dose: 3 },
      { id: 'rocktail',        kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_masterstroke_108', name: 'Powerburst of masterstroke',
    levelRequired: 108, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_masterstroke', xpPerCraft: 1350,
    inputs: [
      { id: 'powerburst_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'runite_stone_spirit',   kind: 'secondary', qty: 3 },
      { id: 'necrite_stone_spirit',  kind: 'secondary', qty: 3 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 2 },
    ],
  },
  {
    id: 'powerburst_of_masterstroke_112', name: 'Powerburst of masterstroke',
    levelRequired: 112, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_masterstroke', xpPerCraft: 1350,
    inputs: [
      { id: 'powerburst_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'runite_stone_spirit',   kind: 'secondary', qty: 2 },
      { id: 'necrite_stone_spirit',  kind: 'secondary', qty: 2 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_sorcery_109', name: 'Powerburst of sorcery',
    levelRequired: 109, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_sorcery', xpPerCraft: 1400,
    inputs: [
      { id: 'powerburst_vial',    kind: 'misc',      qty: 1 },
      { id: 'primal_extract',     kind: 'misc',      qty: 1 },
      { id: 'super_runecrafting', kind: 'potion',    qty: 1, dose: 4 },
      { id: 'blood_rune',         kind: 'secondary', qty: 5, cleansingSaveable: false },
      { id: 'beak_snot',          kind: 'secondary', qty: 2 },
    ],
  },
  {
    id: 'powerburst_of_sorcery_113', name: 'Powerburst of sorcery',
    levelRequired: 113, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_sorcery', xpPerCraft: 1400,
    inputs: [
      { id: 'powerburst_vial',    kind: 'misc',      qty: 1 },
      { id: 'primal_extract',     kind: 'misc',      qty: 1 },
      { id: 'super_runecrafting', kind: 'potion',    qty: 1, dose: 3 },
      { id: 'blood_rune',         kind: 'secondary', qty: 3, cleansingSaveable: false },
      { id: 'beak_snot',          kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_acceleration_111', name: 'Powerburst of acceleration',
    levelRequired: 111, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_acceleration', xpPerCraft: 1500,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'stamina_potion',  kind: 'potion',    qty: 1, dose: 4 },
      { id: 'energy_potion',   kind: 'potion',    qty: 1, dose: 4 },
      { id: 'spark_chitin',    kind: 'secondary', qty: 2 },
    ],
  },
  {
    id: 'powerburst_of_acceleration_115', name: 'Powerburst of acceleration',
    levelRequired: 115, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_acceleration', xpPerCraft: 1500,
    inputs: [
      { id: 'powerburst_vial', kind: 'misc',      qty: 1 },
      { id: 'primal_extract',  kind: 'misc',      qty: 1 },
      { id: 'stamina_potion',  kind: 'potion',    qty: 1, dose: 3 },
      { id: 'energy_potion',   kind: 'potion',    qty: 1, dose: 3 },
      { id: 'spark_chitin',    kind: 'secondary', qty: 1 },
    ],
  },
  {
    id: 'powerburst_of_feats_114', name: 'Powerburst of feats',
    levelRequired: 114, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_feats', xpPerCraft: 1600,
    inputs: [
      { id: 'powerburst_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'clean_snapdragon',      kind: 'herb',      qty: 1 },
      { id: 'summoning_potion',      kind: 'potion',    qty: 1, dose: 4 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 2 },
    ],
  },
  {
    id: 'powerburst_of_feats_118', name: 'Powerburst of feats',
    levelRequired: 118, outputDose: 4, category: 'powerbursts',
    recipeGroup: 'powerburst_of_feats', xpPerCraft: 1600,
    inputs: [
      { id: 'powerburst_vial',       kind: 'misc',      qty: 1 },
      { id: 'primal_extract',        kind: 'misc',      qty: 1 },
      { id: 'clean_snapdragon',      kind: 'herb',      qty: 1 },
      { id: 'summoning_potion',      kind: 'potion',    qty: 1, dose: 3 },
      { id: 'bottled_dinosaur_roar', kind: 'secondary', qty: 1 },
    ],
  },
]

// ─── Lookup Indexes ───────────────────────────────────────────────────────────

/** All recipes indexed by their id */
export const RECIPE_BY_ID: Map<string, Recipe> = new Map(
  RECIPES.map(r => [r.id, r])
)

/**
 * Recipe groups: maps group key → array of recipes sorted ascending by levelRequired.
 * Used to find the highest unlocked recipe for level-gated alternates.
 */
export const RECIPE_GROUPS: Map<RecipeGroup, Recipe[]> = new Map()
for (const recipe of RECIPES) {
  if (recipe.recipeGroup) {
    const group = RECIPE_GROUPS.get(recipe.recipeGroup) ?? []
    group.push(recipe)
    RECIPE_GROUPS.set(recipe.recipeGroup, group)
  }
}
for (const [, group] of RECIPE_GROUPS) {
  group.sort((a, b) => a.levelRequired - b.levelRequired)
}

/**
 * All potion ids that appear as potion inputs in any recipe.
 * Used to determine which potions the user can enter supply quantities for.
 */
export const SUPPLY_POTION_IDS: string[] = (() => {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const recipe of RECIPES) {
    for (const input of recipe.inputs) {
      if (input.kind === 'potion' && !seen.has(input.id)) {
        seen.add(input.id)
        ids.push(input.id)
      }
    }
  }
  return ids
})()

/**
 * Returns the recipe to use for a given potion id, player level, and optional
 * preferred tier override. Handles recipe groups (picks highest unlocked tier
 * unless a preferred tier is specified) and direct id lookups.
 */
export function selectBestRecipe(
  id: string,
  level: number,
  preferredTier: Map<RecipeGroup, string> = new Map(),
): Recipe | undefined {
  const direct = RECIPE_BY_ID.get(id)
  if (!direct) return undefined

  if (direct.recipeGroup) {
    const preferred = preferredTier.get(direct.recipeGroup)
    if (preferred) {
      const r = RECIPE_BY_ID.get(preferred)
      return r && r.levelRequired <= level ? r : undefined
    }
    const group = RECIPE_GROUPS.get(direct.recipeGroup) ?? []
    let best: Recipe | undefined
    for (const r of group) {
      if (r.levelRequired <= level) best = r
    }
    return best
  }

  return direct.levelRequired <= level ? direct : undefined
}

/**
 * Given any potion id (including level-variant ids like vuln_bomb_107),
 * returns the canonical id used as the recipe group key, or the id itself.
 */
export function canonicalId(id: string): string {
  const recipe = RECIPE_BY_ID.get(id)
  if (recipe?.recipeGroup) {
    const group = RECIPE_GROUPS.get(recipe.recipeGroup)
    return group?.[0]?.id ?? id
  }
  return id
}
