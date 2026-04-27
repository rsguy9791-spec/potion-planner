import type { IngredientDef, IngredientId } from '@/types'

export const INGREDIENTS: IngredientDef[] = [
  // Herbs (clean)
  { id: 'clean_irit',        name: 'Irit leaf',         kind: 'herb', pairedHerbId: 'grimy_irit' },
  { id: 'clean_kwuarm',      name: 'Kwuarm',             kind: 'herb', pairedHerbId: 'grimy_kwuarm' },
  { id: 'clean_cadantine',   name: 'Cadantine',          kind: 'herb', pairedHerbId: 'grimy_cadantine' },
  { id: 'clean_dwarf_weed',  name: 'Dwarf weed',         kind: 'herb', pairedHerbId: 'grimy_dwarf_weed' },
  { id: 'clean_lantadyme',   name: 'Lantadyme',          kind: 'herb', pairedHerbId: 'grimy_lantadyme' },
  { id: 'clean_spirit_weed', name: 'Spirit weed',        kind: 'herb', pairedHerbId: 'grimy_spirit_weed' },
  { id: 'clean_avantoe',     name: 'Avantoe',            kind: 'herb', pairedHerbId: 'grimy_avantoe' },
  { id: 'clean_torstol',     name: 'Torstol',            kind: 'herb', pairedHerbId: 'grimy_torstol' },
  { id: 'clean_fellstalk',   name: 'Fellstalk',          kind: 'herb', pairedHerbId: 'grimy_fellstalk' },
  { id: 'clean_toadflax',    name: 'Toadflax',           kind: 'herb', pairedHerbId: 'grimy_toadflax' },
  { id: 'clean_snapdragon',  name: 'Snapdragon',         kind: 'herb', pairedHerbId: 'grimy_snapdragon' },
  { id: 'clean_arbuck',      name: 'Arbuck',             kind: 'herb', pairedHerbId: 'grimy_arbuck' },
  { id: 'clean_ranarr',      name: 'Ranarr weed',        kind: 'herb', pairedHerbId: 'grimy_ranarr' },
  { id: 'clean_bloodweed',   name: 'Bloodweed',          kind: 'herb', pairedHerbId: 'grimy_bloodweed' },
  { id: 'clean_harralander', name: 'Harralander',        kind: 'herb', pairedHerbId: 'grimy_harralander' },
  { id: 'clean_marrentill',  name: 'Marrentill',         kind: 'herb', pairedHerbId: 'grimy_marrentill' },
  { id: 'clean_wergali',     name: 'Wergali',            kind: 'herb', pairedHerbId: 'grimy_wergali' },
  // Cave nightshade is treated as a herb for weapon_poison++ crafting
  { id: 'cave_nightshade',   name: 'Cave nightshade',    kind: 'herb' },
  // Herbs (grimy)
  { id: 'grimy_irit',        name: 'Grimy irit leaf',    kind: 'herb', pairedHerbId: 'clean_irit' },
  { id: 'grimy_kwuarm',      name: 'Grimy kwuarm',       kind: 'herb', pairedHerbId: 'clean_kwuarm' },
  { id: 'grimy_cadantine',   name: 'Grimy cadantine',    kind: 'herb', pairedHerbId: 'clean_cadantine' },
  { id: 'grimy_dwarf_weed',  name: 'Grimy dwarf weed',   kind: 'herb', pairedHerbId: 'clean_dwarf_weed' },
  { id: 'grimy_lantadyme',   name: 'Grimy lantadyme',    kind: 'herb', pairedHerbId: 'clean_lantadyme' },
  { id: 'grimy_spirit_weed', name: 'Grimy spirit weed',  kind: 'herb', pairedHerbId: 'clean_spirit_weed' },
  { id: 'grimy_avantoe',     name: 'Grimy avantoe',      kind: 'herb', pairedHerbId: 'clean_avantoe' },
  { id: 'grimy_torstol',     name: 'Grimy torstol',      kind: 'herb', pairedHerbId: 'clean_torstol' },
  { id: 'grimy_fellstalk',   name: 'Grimy fellstalk',    kind: 'herb', pairedHerbId: 'clean_fellstalk' },
  { id: 'grimy_toadflax',    name: 'Grimy toadflax',     kind: 'herb', pairedHerbId: 'clean_toadflax' },
  { id: 'grimy_snapdragon',  name: 'Grimy snapdragon',   kind: 'herb', pairedHerbId: 'clean_snapdragon' },
  { id: 'grimy_arbuck',      name: 'Grimy arbuck',       kind: 'herb', pairedHerbId: 'clean_arbuck' },
  { id: 'grimy_ranarr',      name: 'Grimy ranarr weed',  kind: 'herb', pairedHerbId: 'clean_ranarr' },
  { id: 'grimy_bloodweed',   name: 'Grimy bloodweed',    kind: 'herb', pairedHerbId: 'clean_bloodweed' },
  { id: 'grimy_harralander', name: 'Grimy harralander',  kind: 'herb', pairedHerbId: 'clean_harralander' },
  { id: 'grimy_marrentill',  name: 'Grimy marrentill',   kind: 'herb', pairedHerbId: 'clean_marrentill' },
  { id: 'grimy_wergali',     name: 'Grimy wergali',      kind: 'herb', pairedHerbId: 'clean_wergali' },
  // Unfinished potions — pairedHerbId points to the herb that produces each unf
  { id: 'harralander_potion_unf', name: 'Harralander potion (unf)', kind: 'unfinished_potion', pairedHerbId: 'clean_harralander' },
  { id: 'spirit_weed_potion_unf', name: 'Spirit weed potion (unf)', kind: 'unfinished_potion', pairedHerbId: 'clean_spirit_weed' },
  { id: 'wergali_potion_unf',     name: 'Wergali potion (unf)',     kind: 'unfinished_potion', pairedHerbId: 'clean_wergali' },
  { id: 'snapdragon_potion_unf',  name: 'Snapdragon potion (unf)',  kind: 'unfinished_potion', pairedHerbId: 'clean_snapdragon' },
  { id: 'irit_potion_unf',        name: 'Irit potion (unf)',        kind: 'unfinished_potion', pairedHerbId: 'clean_irit' },
  { id: 'kwuarm_potion_unf',      name: 'Kwuarm potion (unf)',      kind: 'unfinished_potion', pairedHerbId: 'clean_kwuarm' },
  { id: 'cadantine_potion_unf',   name: 'Cadantine potion (unf)',   kind: 'unfinished_potion', pairedHerbId: 'clean_cadantine' },
  { id: 'dwarf_weed_potion_unf',  name: 'Dwarf weed potion (unf)',  kind: 'unfinished_potion', pairedHerbId: 'clean_dwarf_weed' },
  { id: 'lantadyme_potion_unf',   name: 'Lantadyme potion (unf)',   kind: 'unfinished_potion', pairedHerbId: 'clean_lantadyme' },
  { id: 'ranarr_potion_unf',      name: 'Ranarr potion (unf)',      kind: 'unfinished_potion', pairedHerbId: 'clean_ranarr' },
  { id: 'avantoe_potion_unf',     name: 'Avantoe potion (unf)',     kind: 'unfinished_potion', pairedHerbId: 'clean_avantoe' },
  { id: 'bloodweed_potion_unf',   name: 'Bloodweed potion (unf)',   kind: 'unfinished_potion', pairedHerbId: 'clean_bloodweed' },
  { id: 'toadflax_potion_unf',    name: 'Toadflax potion (unf)',    kind: 'unfinished_potion', pairedHerbId: 'clean_toadflax' },
  { id: 'fellstalk_potion_unf',   name: 'Fellstalk potion (unf)',   kind: 'unfinished_potion', pairedHerbId: 'clean_fellstalk' },
  { id: 'arbuck_potion_unf',      name: 'Arbuck potion (unf)',      kind: 'unfinished_potion', pairedHerbId: 'clean_arbuck' },
  { id: 'weapon_poison_pp_unf',   name: 'Weapon poison++ (unf)',    kind: 'unfinished_potion', pairedHerbId: 'cave_nightshade' },
  // Secondaries
  { id: 'adrenaline_crystal',    name: 'Adrenaline crystal',     kind: 'secondary' },
  { id: 'beak_snot',             name: 'Beak snot',              kind: 'secondary' },
  { id: 'chinchompa_residue',    name: 'Chinchompa residue',     kind: 'secondary' },
  { id: 'chocolate_dust',        name: 'Chocolate dust',         kind: 'secondary' },
  { id: 'cockatrice_egg',        name: 'Cockatrice egg',         kind: 'secondary' },
  { id: 'blood_rune',            name: 'Blood rune',             kind: 'secondary' },
  { id: 'bottled_dinosaur_roar', name: 'Bottled dinosaur roar',  kind: 'secondary' },
  { id: 'chaos_rune',            name: 'Chaos rune',             kind: 'secondary' },
  { id: 'congealed_blood',       name: 'Congealed blood',        kind: 'secondary' },
  { id: 'crushed_nest',          name: 'Crushed nest',           kind: 'secondary' },
  { id: 'crystal_tree_blossom',  name: 'Crystal tree blossom',   kind: 'secondary' },
  { id: 'dinosaur_claws',        name: 'Dinosaur claws',         kind: 'secondary' },
  { id: 'dragon_scale_dust',     name: 'Dragon scale dust',      kind: 'secondary' },
  { id: 'eye_of_newt',           name: 'Eye of newt',            kind: 'secondary' },
  { id: 'grenwall_spikes',       name: 'Grenwall spikes',        kind: 'secondary' },
  { id: 'ground_miasma_rune',    name: 'Ground miasma rune',     kind: 'secondary' },
  { id: 'ground_mud_rune',       name: 'Ground mud rune',        kind: 'secondary' },
  { id: 'harmony_moss',          name: 'Harmony moss',           kind: 'secondary' },
  { id: 'limpwurt_root',         name: 'Limpwurt root',          kind: 'secondary' },
  { id: 'morchella_mushroom',    name: 'Morchella mushroom',     kind: 'secondary' },
  { id: 'mort_myre_fungus',      name: 'Mort myre fungus',       kind: 'secondary' },
  { id: 'mycelial_webbing',      name: 'Mycelial webbing',       kind: 'secondary' },
  { id: 'necrite_stone_spirit',  name: 'Necrite stone spirit',   kind: 'secondary' },
  { id: 'papaya_fruit',          name: 'Papaya fruit',           kind: 'secondary' },
  { id: 'phasmatite',            name: 'Phasmatite',             kind: 'secondary' },
  { id: 'phoenix_feather',       name: 'Phoenix feather',        kind: 'secondary' },
  { id: 'poison_ivy_berries',    name: 'Poison ivy berries',     kind: 'secondary' },
  { id: 'poison_slime',          name: 'Poison slime',           kind: 'secondary' },
  { id: 'potato_cactus',         name: 'Potato cactus',          kind: 'secondary' },
  { id: 'red_spiders_eggs',      name: "Red spiders' eggs",      kind: 'secondary' },
  { id: 'rocktail',              name: 'Rocktail',               kind: 'secondary' },
  { id: 'runite_stone_spirit',   name: 'Runite stone spirit',    kind: 'secondary' },
  { id: 'searing_ashes',         name: 'Searing ashes',          kind: 'secondary' },
  { id: 'snape_grass',           name: 'Snape grass',            kind: 'secondary' },
  { id: 'soul_rune',             name: 'Soul rune',              kind: 'secondary' },
  { id: 'seasonal_sheep_wool',   name: 'Seasonal sheep wool',    kind: 'secondary' },
  { id: 'spark_chitin',          name: 'Spark chitin',           kind: 'secondary' },
  { id: 'spider_fangs',          name: 'Spider fangs',           kind: 'secondary' },
  { id: 'spider_venom',          name: 'Spider venom',           kind: 'secondary' },
  { id: 'third_age_iron',        name: 'Third-age iron',         kind: 'secondary' },
  { id: 'tombshroom',            name: 'Tombshroom',             kind: 'secondary' },
  { id: 'unicorn_horn_dust',     name: 'Unicorn horn dust',      kind: 'secondary' },
  { id: 'watermelon',            name: 'Watermelon',             kind: 'secondary' },
  { id: 'white_berries',         name: 'White berries',          kind: 'secondary' },
  { id: 'wine_of_guthix',        name: 'Wine of Guthix',         kind: 'secondary' },
  { id: 'wine_of_saradomin',     name: 'Wine of Saradomin',      kind: 'secondary' },
  { id: 'wine_of_zamorak',       name: 'Wine of Zamorak',        kind: 'secondary' },
  { id: 'yak_milk',              name: 'Yak milk',               kind: 'secondary' },
  // Vials & Misc
  { id: 'bomb_vial',       name: 'Bomb vial',       kind: 'vial' },
  { id: 'coconut_milk',    name: 'Coconut milk',    kind: 'vial' },
  { id: 'crystal_flask',   name: 'Crystal flask',   kind: 'vial' },
  { id: 'powerburst_vial', name: 'Powerburst vial', kind: 'vial' },
  { id: 'primal_extract',  name: 'Primal extract',  kind: 'vial' },
  { id: 'vial_of_water',   name: 'Vial of water',   kind: 'vial' },
]

export const INGREDIENT_MAP: Map<string, IngredientDef> = new Map(
  INGREDIENTS.map(i => [i.id, i])
)

/**
 * Maps each herb id → its unfinished potion ingredient id.
 * Built from all unfinished_potion IngredientDefs that carry a pairedHerbId.
 * Used by buildDosePool to seed unf supply and by SupplyTable to derive herb rows.
 */
export const UNF_BY_HERB: Map<IngredientId, IngredientId> = new Map(
  INGREDIENTS
    .filter((i): i is IngredientDef & { pairedHerbId: string } =>
      i.kind === 'unfinished_potion' && i.pairedHerbId !== undefined
    )
    .map(i => [i.pairedHerbId, i.id])
)
