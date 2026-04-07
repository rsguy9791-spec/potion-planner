import { calculateAll, getIngredientList } from '@/lib/calculator'
import type { CalculatorInputs, TargetPotion } from '@/types'

function emptyInputs(level: number): CalculatorInputs {
  return {
    herbloreLevel: level,
    herbSupply: new Map(),
    itemSupply: new Map(),
    potionSupply: new Map(),
    secondaryModes: new Map(),
    disabledRecipes: new Set(),
    preferredRecipeTier: new Map(),
    scrollOfCleansing: false,
  }
}

function target(potionId: string, qty: number): TargetPotion[] {
  return [{ potionId, qty }]
}

function calc(inputs: CalculatorInputs, potionId: string, qty: number) {
  return calculateAll(inputs, target(potionId, qty))
}

function qty(result: ReturnType<typeof calculateAll>, id: string): number {
  return result.ingredients.find(i => i.id === id)?.totalNeeded ?? 0
}

// ─── Full chain resolution ────────────────────────────────────────────────────

describe('Standard Overload full chain (zero supply)', () => {
  const result = calc(emptyInputs(96), 'overload', 1)

  test('produces ingredients', () => {
    expect(result.ingredients.length).toBeGreaterThan(0)
  })

  test('requires 1 clean torstol', () => {
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBe(1)
  })

  test('requires 1 clean avantoe (for extreme attack)', () => {
    const avantoe = result.ingredients.find(i => i.id === 'clean_avantoe')
    expect(avantoe?.totalNeeded).toBe(1)
  })

  test('requires 1 clean irit (for super attack, via extreme attack)', () => {
    const irit = result.ingredients.find(i => i.id === 'clean_irit')
    expect(irit?.totalNeeded).toBe(1)
  })

  test('requires 1 eye of newt (for super attack)', () => {
    const eye = result.ingredients.find(i => i.id === 'eye_of_newt')
    expect(eye?.totalNeeded).toBe(1)
  })

  test('requires 5 grenwall spikes (for extreme ranging)', () => {
    const spikes = result.ingredients.find(i => i.id === 'grenwall_spikes')
    expect(spikes?.totalNeeded).toBe(5)
  })

  test('requires 5 congealed blood (for super necromancy)', () => {
    const blood = result.ingredients.find(i => i.id === 'congealed_blood')
    expect(blood?.totalNeeded).toBe(5)
  })

  test('still needed equals total needed when no supply', () => {
    for (const ing of result.ingredients) {
      expect(ing.stillNeeded).toBe(ing.totalNeeded)
    }
  })
})

describe('Multiple overloads scale correctly', () => {
  test('10 overloads need 10 clean torstol', () => {
    const result = calc(emptyInputs(96), 'overload', 10)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBe(10)
  })

  test('10 overloads need 10 clean irit', () => {
    const result = calc(emptyInputs(96), 'overload', 10)
    const irit = result.ingredients.find(i => i.id === 'clean_irit')
    expect(irit?.totalNeeded).toBe(10)
  })
})

// ─── Multi-target aggregation ─────────────────────────────────────────────────

describe('Multiple targets', () => {
  test('aggregates ingredients from two targets', () => {
    const result = calculateAll(emptyInputs(96), [
      { potionId: 'overload', qty: 2 },
      { potionId: 'overload', qty: 3 },
    ])
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBe(5)
  })

  test('returns target names in result', () => {
    const result = calculateAll(emptyInputs(96), [
      { potionId: 'overload', qty: 10 },
    ])
    expect(result.targets[0].name).toBe('Overload')
    expect(result.targets[0].qty).toBe(10)
  })

  test('empty targets returns empty result', () => {
    const result = calculateAll(emptyInputs(96), [])
    expect(result.ingredients).toHaveLength(0)
    expect(result.targets).toHaveLength(0)
  })
})

// ─── Supply deduction ─────────────────────────────────────────────────────────

describe('Supply deduction', () => {
  test('herb supply reduces stillNeeded', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      herbSupply: new Map([['clean_torstol', { cleanQty: 1, grimyQty: 0, unfQty: 0 }]]),
    }
    const result = calc(inputs, 'overload', 1)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.stillNeeded).toBe(0)
    expect(torstol?.currentlyHave).toBe(1)
  })

  test('grimy herbs count toward supply', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      herbSupply: new Map([['clean_torstol', { cleanQty: 0, grimyQty: 1, unfQty: 0 }]]),
    }
    const result = calc(inputs, 'overload', 1)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.stillNeeded).toBe(0)
  })

  test('item supply reduces stillNeeded', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      itemSupply: new Map([['eye_of_newt', 5]]),
    }
    const result = calc(inputs, 'overload', 1)
    const eye = result.ingredients.find(i => i.id === 'eye_of_newt')
    expect(eye?.stillNeeded).toBe(0)
    expect(eye?.currentlyHave).toBe(5)
  })

  test('partial supply shows correct deficit', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      herbSupply: new Map([['clean_torstol', { cleanQty: 3, grimyQty: 0, unfQty: 0 }]]),
    }
    const result = calc(inputs, 'overload', 10)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBe(10)
    expect(torstol?.currentlyHave).toBe(3)
    expect(torstol?.stillNeeded).toBe(7)
  })
})

// ─── Dose pool mixing ─────────────────────────────────────────────────────────

describe('Dose pool: potion supply deduction', () => {
  test('having super attack (3-dose) covers the extreme attack requirement', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      potionSupply: new Map([
        ['super_attack', { threeDose: 1, fourDose: 0, sixDose: 0 }],
      ]),
    }
    const result = calc(inputs, 'overload', 1)
    const irit = result.ingredients.find(i => i.id === 'clean_irit')
    expect(irit).toBeUndefined()
  })

  test('4-dose potions count toward 3-dose requirement via dose pool', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      potionSupply: new Map([
        ['super_attack', { threeDose: 0, fourDose: 1, sixDose: 0 }],
      ]),
    }
    const result = calc(inputs, 'overload', 1)
    const irit = result.ingredients.find(i => i.id === 'clean_irit')
    expect(irit).toBeUndefined()
  })

  test('insufficient dose pool still requires crafting', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      potionSupply: new Map([
        ['super_attack', { threeDose: 1, fourDose: 0, sixDose: 0 }],
      ]),
    }
    const result = calc(inputs, 'overload', 2)
    const irit = result.ingredients.find(i => i.id === 'clean_irit')
    expect(irit?.totalNeeded).toBe(1)
  })
})

// ─── Level-gated recipe selection ────────────────────────────────────────────

describe('Vulnerability bomb level-gating', () => {
  test('level 103 player uses base recipe (5 soul runes)', () => {
    const result = calc(emptyInputs(103), 'vuln_bomb_103', 1)
    const soul = result.ingredients.find(i => i.id === 'soul_rune')
    expect(soul?.totalNeeded).toBe(5)
  })

  test('level 107 player uses improved recipe (3 soul runes)', () => {
    const result = calc(emptyInputs(107), 'vuln_bomb_103', 1)
    const soul = result.ingredients.find(i => i.id === 'soul_rune')
    expect(soul?.totalNeeded).toBe(3)
  })

  test('level 103 player gets 2 bottled dinosaur roar', () => {
    const result = calc(emptyInputs(103), 'vuln_bomb_103', 1)
    const roar = result.ingredients.find(i => i.id === 'bottled_dinosaur_roar')
    expect(roar?.totalNeeded).toBe(2)
  })

  test('level 107 player gets 1 bottled dinosaur roar', () => {
    const result = calc(emptyInputs(107), 'vuln_bomb_103', 1)
    const roar = result.ingredients.find(i => i.id === 'bottled_dinosaur_roar')
    expect(roar?.totalNeeded).toBe(1)
  })
})

// ─── Minimum level enforcement ────────────────────────────────────────────────

describe('Level enforcement', () => {
  test('level 95 player cannot resolve overload recipe', () => {
    const result = calc(emptyInputs(95), 'overload', 1)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol).toBeUndefined()
  })

  test('level 96 player can resolve overload recipe', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBe(1)
  })
})

// ─── Zero quantity ────────────────────────────────────────────────────────────

describe('Zero / empty targets', () => {
  test('returns empty for zero qty', () => {
    const result = calculateAll(emptyInputs(96), [{ potionId: 'overload', qty: 0 }])
    expect(result.ingredients).toHaveLength(0)
  })

  test('returns empty for no targets', () => {
    const result = calculateAll(emptyInputs(96), [])
    expect(result.ingredients).toHaveLength(0)
  })
})

// ─── New potions ──────────────────────────────────────────────────────────────

describe('Saradomin brew', () => {
  test('requires clean toadflax and crushed nest', () => {
    const result = calc(emptyInputs(81), 'saradomin_brew', 1)
    expect(result.ingredients.find(i => i.id === 'clean_toadflax')?.totalNeeded).toBe(1)
    expect(result.ingredients.find(i => i.id === 'crushed_nest')?.totalNeeded).toBe(1)
    expect(result.ingredients.find(i => i.id === 'vial_of_water')?.totalNeeded).toBe(1)
  })
})

describe('Prayer renewal', () => {
  test('requires clean fellstalk and morchella mushroom', () => {
    const result = calc(emptyInputs(94), 'prayer_renewal', 1)
    expect(result.ingredients.find(i => i.id === 'clean_fellstalk')?.totalNeeded).toBe(1)
    expect(result.ingredients.find(i => i.id === 'morchella_mushroom')?.totalNeeded).toBe(1)
  })
})

describe('Holy overload', () => {
  test('requires overload(4) and prayer_renewal(4) and crystal flask', () => {
    const result = calc(emptyInputs(97), 'holy_overload', 1)
    const flask = result.ingredients.find(i => i.id === 'crystal_flask')
    expect(flask?.totalNeeded).toBe(1)
    // Should also trace through to overload's ingredients
    const torstol = result.ingredients.find(i => i.id === 'clean_torstol')
    expect(torstol?.totalNeeded).toBeGreaterThan(0)
    // And prayer renewal's ingredients
    const fellstalk = result.ingredients.find(i => i.id === 'clean_fellstalk')
    expect(fellstalk?.totalNeeded).toBeGreaterThan(0)
  })
})

// ─── getIngredientList ────────────────────────────────────────────────────────

describe('getIngredientList', () => {
  test('returns non-empty list for overload at level 96', () => {
    const list = getIngredientList('overload', 96)
    expect(list.length).toBeGreaterThan(0)
  })

  test('includes vial_of_water for overload chain', () => {
    const list = getIngredientList('overload', 96)
    expect(list.find(i => i.id === 'vial_of_water')).toBeDefined()
  })
})

// ─── Combination potions ──────────────────────────────────────────────────────

describe('Supreme attack combo', () => {
  test('needs crystal flask and traces to herbs', () => {
    const result = calc(emptyInputs(93), 'supreme_attack_combo', 1)
    const flask = result.ingredients.find(i => i.id === 'crystal_flask')
    expect(flask?.totalNeeded).toBe(1)
    const avantoe = result.ingredients.find(i => i.id === 'clean_avantoe')
    expect(avantoe?.totalNeeded).toBeGreaterThan(0)
  })
})

// ─── 1000 Overloads (Scroll of Cleansing) ────────────────────────────────────
//
// Expected values for 1000 overloads WITHOUT scroll (raw):
//   Overload has 6 saveable inputs (index 1-6). Without scroll, multiplier = 1.
//   Each of the 6 extreme potions requires 1 super potion.
//   Each super potion requires 1 vial + 1 herb + 1-5 secondaries.
//
//   vial_of_water:      6000   (1000 each from 6 super potions)
//   clean_irit:         1000   (super_attack)
//   eye_of_newt:        1000
//   clean_kwuarm:       1000   (super_strength)
//   limpwurt_root:      1000
//   clean_cadantine:    1000   (super_defence)
//   white_berries:      1000
//   clean_lantadyme:    2000   (1000 super_magic + 1000 extreme_defence)
//   potato_cactus:      1000
//   clean_dwarf_weed:   2000   (1000 super_ranging + 1000 extreme_strength)
//   wine_of_zamorak:    1000
//   clean_spirit_weed:  1000   (super_necromancy)
//   congealed_blood:    5000   (5 × 1000)
//   clean_avantoe:      1000   (extreme_attack)
//   ground_mud_rune:    1000   (extreme_magic)
//   grenwall_spikes:    5000   (5 × 1000 extreme_ranging)
//   ground_miasma_rune: 1000   (extreme_necromancy)
//   clean_torstol:      1000   (overload itself)
//
// Expected values for 1000 overloads WITH scroll:
//   Overload: 6 saveable inputs → multiplier = 1 − 0.1/6 ≈ 0.98333
//     extreme_attack  (index 0): NOT saveable → 1000 crafts
//     extreme_strength … extreme_necromancy + clean_torstol (indices 1-6):
//       ceil(1000 × 0.98333) = ceil(983.33) = 984 crafts / qty each
//
//   Extreme potions each have 1 saveable ingredient (herb/secondary at index 1),
//   multiplier = 1 − 0.1/1 = 0.9:
//     extreme_attack (1000 crafts):  clean_avantoe = ceil(1000 × 0.9) = 900
//     extreme_strength (984 crafts): clean_dwarf_weed = ceil(984 × 0.9) = ceil(885.6) = 886
//     extreme_defence (984 crafts):  clean_lantadyme = 886
//     extreme_magic (984 crafts):    ground_mud_rune = 886
//     extreme_ranging (984 crafts):  grenwall_spikes = ceil(984 × 5 × 0.9) = ceil(4428) = 4428
//     extreme_necromancy (984):      ground_miasma_rune = 886
//
//   Super potions use twoStepMix=true → each saveable (herb at idx 1, secondary at idx 2)
//   independently gets multiplier = 0.9; vial at idx 0 is never saved:
//     super_attack (1000 crafts):  vial=1000, clean_irit=900, eye_of_newt=900
//     super_strength (984):        vial=984, clean_kwuarm=886, limpwurt_root=886
//     super_defence (984):         vial=984, clean_cadantine=886, white_berries=886
//     super_magic (984):           vial=984, clean_lantadyme=886, potato_cactus=886
//     super_ranging (984):         vial=984, clean_dwarf_weed=886, wine_of_zamorak=886
//     super_necromancy (984):      vial=984, clean_spirit_weed=886, congealed_blood=ceil(984×5×0.9)=4428
//
//   Totals with scroll:
//     vial_of_water:      1000+984×5 = 5920
//     clean_irit:         900
//     eye_of_newt:        900
//     clean_kwuarm:       886
//     limpwurt_root:      886
//     clean_cadantine:    886
//     white_berries:      886
//     clean_lantadyme:    886 (super_magic) + 886 (extreme_defence) = 1772
//     potato_cactus:      886
//     clean_dwarf_weed:   886 (super_ranging) + 886 (extreme_strength) = 1772
//     wine_of_zamorak:    886
//     clean_spirit_weed:  886
//     congealed_blood:    4430  (scrolls save rounded amounts)
//     clean_avantoe:      900   (extreme_attack used 1000 super_attacks which aren't saved)
//     ground_mud_rune:    886
//     grenwall_spikes:    4430  (scrolls save rounded amounts)
//     ground_miasma_rune: 886
//     clean_torstol:      984

describe('1000 Overloads — no scroll', () => {
  const result = calc(emptyInputs(96), 'overload', 1000)

  test('vial_of_water: 6000', () => expect(qty(result, 'vial_of_water')).toBe(6000))
  test('clean_irit: 1000', () => expect(qty(result, 'clean_irit')).toBe(1000))
  test('eye_of_newt: 1000', () => expect(qty(result, 'eye_of_newt')).toBe(1000))
  test('clean_kwuarm: 1000', () => expect(qty(result, 'clean_kwuarm')).toBe(1000))
  test('limpwurt_root: 1000', () => expect(qty(result, 'limpwurt_root')).toBe(1000))
  test('clean_cadantine: 1000', () => expect(qty(result, 'clean_cadantine')).toBe(1000))
  test('white_berries: 1000', () => expect(qty(result, 'white_berries')).toBe(1000))
  test('clean_lantadyme: 2000', () => expect(qty(result, 'clean_lantadyme')).toBe(2000))
  test('potato_cactus: 1000', () => expect(qty(result, 'potato_cactus')).toBe(1000))
  test('clean_dwarf_weed: 2000', () => expect(qty(result, 'clean_dwarf_weed')).toBe(2000))
  test('wine_of_zamorak: 1000', () => expect(qty(result, 'wine_of_zamorak')).toBe(1000))
  test('clean_spirit_weed: 1000', () => expect(qty(result, 'clean_spirit_weed')).toBe(1000))
  test('congealed_blood: 5000', () => expect(qty(result, 'congealed_blood')).toBe(5000))
  test('clean_avantoe: 1000', () => expect(qty(result, 'clean_avantoe')).toBe(1000))
  test('ground_mud_rune: 1000', () => expect(qty(result, 'ground_mud_rune')).toBe(1000))
  test('grenwall_spikes: 5000', () => expect(qty(result, 'grenwall_spikes')).toBe(5000))
  test('ground_miasma_rune: 1000', () => expect(qty(result, 'ground_miasma_rune')).toBe(1000))
  test('clean_torstol: 1000', () => expect(qty(result, 'clean_torstol')).toBe(1000))
})

describe('1000 Overloads — with scroll of cleansing', () => {
  const inputs: CalculatorInputs = { ...emptyInputs(96), scrollOfCleansing: true }
  const result = calc(inputs, 'overload', 1000)

  test('vial_of_water: 5920', () => expect(qty(result, 'vial_of_water')).toBe(5920))
  test('clean_irit: 900', () => expect(qty(result, 'clean_irit')).toBe(900))
  test('eye_of_newt: 900', () => expect(qty(result, 'eye_of_newt')).toBe(900))
  test('clean_kwuarm: 886', () => expect(qty(result, 'clean_kwuarm')).toBe(886))
  test('limpwurt_root: 886', () => expect(qty(result, 'limpwurt_root')).toBe(886))
  test('clean_cadantine: 886', () => expect(qty(result, 'clean_cadantine')).toBe(886))
  test('white_berries: 886', () => expect(qty(result, 'white_berries')).toBe(886))
  test('clean_lantadyme: 1772', () => expect(qty(result, 'clean_lantadyme')).toBe(1772))
  test('potato_cactus: 886', () => expect(qty(result, 'potato_cactus')).toBe(886))
  test('clean_dwarf_weed: 1772', () => expect(qty(result, 'clean_dwarf_weed')).toBe(1772))
  test('wine_of_zamorak: 886', () => expect(qty(result, 'wine_of_zamorak')).toBe(886))
  test('clean_spirit_weed: 886', () => expect(qty(result, 'clean_spirit_weed')).toBe(886))
  test('congealed_blood: 4430', () => expect(qty(result, 'congealed_blood')).toBe(4430))
  test('clean_avantoe: 900', () => expect(qty(result, 'clean_avantoe')).toBe(900))
  test('ground_mud_rune: 886', () => expect(qty(result, 'ground_mud_rune')).toBe(886))
  test('grenwall_spikes: 4430', () => expect(qty(result, 'grenwall_spikes')).toBe(4430))
  test('ground_miasma_rune: 886', () => expect(qty(result, 'ground_miasma_rune')).toBe(886))
  test('clean_torstol: 984', () => expect(qty(result, 'clean_torstol')).toBe(984))
})

describe('1000 Elder overloads — with scroll of cleansing', () => {
  const inputs: CalculatorInputs = { ...emptyInputs(106), scrollOfCleansing: true }
  const result = calc(inputs, 'elder_overload', 1000)

  // Herbs
  test('clean_spirit_weed: 2349', () => expect(qty(result, 'clean_spirit_weed')).toBe(2349))
  test('clean_irit: 2368',        () => expect(qty(result, 'clean_irit')).toBe(2368))
  test('clean_avantoe: 1184',     () => expect(qty(result, 'clean_avantoe')).toBe(1184))
  test('clean_kwuarm: 2349',      () => expect(qty(result, 'clean_kwuarm')).toBe(2349))
  test('clean_cadantine: 2349',   () => expect(qty(result, 'clean_cadantine')).toBe(2349))
  test('clean_lantadyme: 3514',   () => expect(qty(result, 'clean_lantadyme')).toBe(3514))
  test('clean_dwarf_weed: 3514',  () => expect(qty(result, 'clean_dwarf_weed')).toBe(3514))
  test('clean_torstol: 1294',     () => expect(qty(result, 'clean_torstol')).toBe(1294))
  test('clean_fellstalk: 950',    () => expect(qty(result, 'clean_fellstalk')).toBe(950))

  // Secondaries
  test('eye_of_newt: 2368',       () => expect(qty(result, 'eye_of_newt')).toBe(2368))
  test('limpwurt_root: 2349',     () => expect(qty(result, 'limpwurt_root')).toBe(2349))
  test('white_berries: 2349',     () => expect(qty(result, 'white_berries')).toBe(2349))
  test('potato_cactus: 2349',     () => expect(qty(result, 'potato_cactus')).toBe(2349))
  test('wine_of_zamorak: 2349',   () => expect(qty(result, 'wine_of_zamorak')).toBe(2349))
  test('congealed_blood: 11745',  () => expect(qty(result, 'congealed_blood')).toBe(11745))
  test('ground_mud_rune: 1165',   () => expect(qty(result, 'ground_mud_rune')).toBe(1165))
  test('grenwall_spikes: 5825',   () => expect(qty(result, 'grenwall_spikes')).toBe(5825))
  test('ground_miasma_rune: 1165',() => expect(qty(result, 'ground_miasma_rune')).toBe(1165))
  test('primal_extract: 950',     () => expect(qty(result, 'primal_extract')).toBe(950))
  test('crystal_flask: 1000',     () => expect(qty(result, 'crystal_flask')).toBe(1000))
})

// ─── Disabled recipes ─────────────────────────────────────────────────────────

describe('Disabled recipes', () => {
  test('disabled recipe appears as a purchase, not its ingredients', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      disabledRecipes: new Set(['super_attack']),
    }
    const result = calc(inputs, 'overload', 1)
    // super_attack should now be a required purchase
    expect(result.ingredients.find(i => i.id === 'super_attack')?.totalNeeded).toBe(1)
    // its ingredients should NOT be calculated
    expect(result.ingredients.find(i => i.id === 'clean_irit')).toBeUndefined()
    expect(result.ingredients.find(i => i.id === 'eye_of_newt')).toBeUndefined()
    // other ingredients in the chain are unaffected
    expect(result.ingredients.find(i => i.id === 'clean_avantoe')?.totalNeeded).toBe(1)
  })

  test('disabled recipe with existing supply: remainder becomes purchase', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      disabledRecipes: new Set(['super_attack']),
      potionSupply: new Map([['super_attack', { threeDose: 1, fourDose: 0, sixDose: 0 }]]),
    }
    const result = calc(inputs, 'overload', 3)
    // 3 super_attack needed total, 1 covered by supply, 2 to purchase
    const sa = result.ingredients.find(i => i.id === 'super_attack')
    expect(sa?.totalNeeded).toBe(3)
    expect(sa?.currentlyHave).toBe(1)
    expect(sa?.stillNeeded).toBe(2)
  })
})

// ─── Secondary modes ──────────────────────────────────────────────────────────

describe('Secondary mode: skip', () => {
  test('skip mode on a secondary causes the whole recipe to be purchased', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      secondaryModes: new Map([['eye_of_newt', 'skip']]),
    }
    const result = calc(inputs, 'overload', 1)
    // super_attack cannot be crafted (eye_of_newt is skipped), so it's a purchase
    expect(result.ingredients.find(i => i.id === 'super_attack')?.totalNeeded).toBe(1)
    expect(result.ingredients.find(i => i.id === 'clean_irit')).toBeUndefined()
    expect(result.ingredients.find(i => i.id === 'eye_of_newt')).toBeUndefined()
  })
})

describe('Secondary mode: use_available', () => {
  test('use_available caps crafts to supply, remainder becomes purchase', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      secondaryModes: new Map([['eye_of_newt', 'use_available']]),
      itemSupply: new Map([['eye_of_newt', 3]]),
    }
    // 5 overloads → 5 super_attacks needed; only 3 eye_of_newt available
    const result = calc(inputs, 'overload', 5)
    // 3 crafted (using the available eye_of_newt), 2 purchased
    expect(result.ingredients.find(i => i.id === 'eye_of_newt')?.totalNeeded).toBe(3)
    expect(result.ingredients.find(i => i.id === 'super_attack')?.totalNeeded).toBe(2)
  })

  test('use_available with enough supply: no purchases needed', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      secondaryModes: new Map([['eye_of_newt', 'use_available']]),
      itemSupply: new Map([['eye_of_newt', 10]]),
    }
    const result = calc(inputs, 'overload', 5)
    expect(result.ingredients.find(i => i.id === 'eye_of_newt')?.totalNeeded).toBe(5)
    expect(result.ingredients.find(i => i.id === 'super_attack')).toBeUndefined()
  })
})

// ─── Achievability ────────────────────────────────────────────────────────────

describe('Achievability', () => {
  test('no shortfalls returns empty achievability', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    // overload chain has no untradeable shortfalls when fully craftable
    expect(result.achievability).toHaveLength(0)
  })

  test('untradeable shortfall produces achievability entry', () => {
    // Disable extreme_attack (untradeable) — player cannot craft or buy it
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      disabledRecipes: new Set(['extreme_attack']),
    }
    const result = calc(inputs, 'overload', 5)
    // extreme_attack is untradeable and still needed → shortfall
    expect(result.shortfalls.find(s => s.id === 'extreme_attack')).toBeDefined()
    // achievability: 0 overloads possible without extreme_attack
    const ach = result.achievability.find(a => a.potionId === 'overload')
    expect(ach).toBeDefined()
    expect(ach?.possible).toBe(0)
    expect(ach?.requested).toBe(5)
  })

  test('partial supply of untradeable ingredient reduces possible, not to zero', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(96),
      disabledRecipes: new Set(['extreme_attack']),
      potionSupply: new Map([['extreme_attack', { threeDose: 2, fourDose: 0, sixDose: 0 }]]),
    }
    const result = calc(inputs, 'overload', 5)
    const ach = result.achievability.find(a => a.potionId === 'overload')
    expect(ach?.possible).toBeGreaterThan(0)
    expect(ach?.possible).toBeLessThan(5)
  })
})

// ─── Craft steps ──────────────────────────────────────────────────────────────

describe('Craft steps', () => {
  test('steps are returned in post-order (children before parents)', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    expect(result.steps.length).toBeGreaterThan(0)
    // overload must be the last step (it is the root)
    expect(result.steps[result.steps.length - 1].potionId).toBe('overload')
  })

  test('intermediate potions appear as steps', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    const ids = result.steps.map(s => s.potionId)
    expect(ids).toContain('super_attack')
    expect(ids).toContain('extreme_attack')
    expect(ids).toContain('overload')
    // super_attack must appear before extreme_attack
    expect(ids.indexOf('super_attack')).toBeLessThan(ids.indexOf('extreme_attack'))
    // extreme_attack must appear before overload
    expect(ids.indexOf('extreme_attack')).toBeLessThan(ids.indexOf('overload'))
  })

  test('craft count matches requested quantity', () => {
    const result = calc(emptyInputs(96), 'overload', 7)
    const overloadStep = result.steps.find(s => s.potionId === 'overload')
    expect(overloadStep?.crafts).toBe(7)
  })

  test('step inputs reflect scroll savings when active', () => {
    const inputs: CalculatorInputs = { ...emptyInputs(96), scrollOfCleansing: true }
    const result = calc(inputs, 'overload', 1000)
    const superAttackStep = result.steps.find(s => s.potionId === 'super_attack')
    const iritInput = superAttackStep?.inputs.find(i => i.id === 'clean_irit')
    expect(iritInput).toBeDefined()
    // scroll should reduce qty below rawQty for saveable inputs
    expect(iritInput!.qty).toBeLessThan(iritInput!.rawQty)
  })
})

// ─── Unfinished potion supply ─────────────────────────────────────────────────
//
// super_attack (twoStepMix): vial_of_water + clean_irit → unf_irit, then + eye_of_newt → potion
//
// With N crafts and U unfinished potions in supply:
//   step1Crafts = N − U   (vial + herb only needed for these)
//   secondary always needed for all N crafts
//   scroll of cleansing (multiplier 0.9) applies independently per step

describe('Unf supply — partial (10 super attacks, 3 unf irit)', () => {
  const inputs: CalculatorInputs = {
    ...emptyInputs(45),
    herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 3 }]]),
  }
  const result = calc(inputs, 'super_attack', 10)

  test('vial_of_water reduced to 7 (step1Crafts = 10 − 3)', () => {
    expect(qty(result, 'vial_of_water')).toBe(7)
  })

  test('clean_irit reduced to 7', () => {
    expect(qty(result, 'clean_irit')).toBe(7)
  })

  test('eye_of_newt unchanged at 10 (secondary always needed)', () => {
    expect(qty(result, 'eye_of_newt')).toBe(10)
  })

  test('unfStep.crafts = 7, fromSupply = 3', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.unfStep?.crafts).toBe(7)
    expect(step?.unfStep?.fromSupply).toBe(3)
  })

  test('unfStep.herbName is set', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.unfStep?.herbName).toBeTruthy()
  })

  test('step inputs: vial qty = 7', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    const vialInput = step?.inputs.find(i => i.id === 'vial_of_water')
    expect(vialInput?.qty).toBe(7)
  })

  test('step inputs: eye_of_newt qty = 10', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    const eyeInput = step?.inputs.find(i => i.id === 'eye_of_newt')
    expect(eyeInput?.qty).toBe(10)
  })

  test('step inputs: unfinished_potion entry inserted after herb with qty = 3', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    const unfEntry = step?.inputs.find(i => i.kind === 'unfinished_potion')
    expect(unfEntry).toBeDefined()
    expect(unfEntry?.id).toBe('clean_irit')   // same id as the herb
    expect(unfEntry?.qty).toBe(3)
    expect(unfEntry?.name).toMatch(/unf/i)
    // positioned after herb, before secondary
    const herbIdx = step!.inputs.findIndex(i => i.kind === 'herb')
    const unfIdx  = step!.inputs.findIndex(i => i.kind === 'unfinished_potion')
    const eyeIdx  = step!.inputs.findIndex(i => i.id === 'eye_of_newt')
    expect(unfIdx).toBe(herbIdx + 1)
    expect(unfIdx).toBeLessThan(eyeIdx)
  })
})

describe('Unf supply — full coverage (10 super attacks, 10 unf irit)', () => {
  const inputs: CalculatorInputs = {
    ...emptyInputs(45),
    herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 10 }]]),
  }
  const result = calc(inputs, 'super_attack', 10)

  test('vial_of_water required = 0 (all covered by unf supply)', () => {
    expect(qty(result, 'vial_of_water')).toBe(0)
  })

  test('clean_irit required = 0', () => {
    expect(qty(result, 'clean_irit')).toBe(0)
  })

  test('eye_of_newt still required = 10', () => {
    expect(qty(result, 'eye_of_newt')).toBe(10)
  })

  test('unfStep.crafts = 0, fromSupply = 10', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.unfStep?.crafts).toBe(0)
    expect(step?.unfStep?.fromSupply).toBe(10)
  })
})

describe('Unf supply — no unf in supply (unfStep still present, all crafted)', () => {
  const result = calc(emptyInputs(45), 'super_attack', 10)

  test('unfStep present on twoStepMix step', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.unfStep).toBeDefined()
  })

  test('unfStep.crafts = 10, fromSupply = 0', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.unfStep?.crafts).toBe(10)
    expect(step?.unfStep?.fromSupply).toBe(0)
  })

  test('vial and herb totals unchanged (10 each)', () => {
    expect(qty(result, 'vial_of_water')).toBe(10)
    expect(qty(result, 'clean_irit')).toBe(10)
    expect(qty(result, 'eye_of_newt')).toBe(10)
  })
})

// Scroll of cleansing with unf supply:
//   step1Crafts = 70 (100 − 30 unf)
//   vial: not scrollable → 70
//   clean_irit: scrollable, base = step1Crafts → ceil(70 × 0.9) = ceil(63) = 63
//   eye_of_newt: scrollable, base = craftsToExecute → ceil(100 × 0.9) = 90
describe('Unf supply + Scroll of Cleansing (100 super attacks, 30 unf irit)', () => {
  const inputs: CalculatorInputs = {
    ...emptyInputs(45),
    scrollOfCleansing: true,
    herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 30 }]]),
  }
  const result = calc(inputs, 'super_attack', 100)

  test('vial_of_water = 70 (step1Crafts, not scrollable)', () => {
    expect(qty(result, 'vial_of_water')).toBe(70)
  })

  test('clean_irit = 63 (scroll on step1Crafts: ceil(70 × 0.9))', () => {
    expect(qty(result, 'clean_irit')).toBe(63)
  })

  test('eye_of_newt = 90 (scroll on all crafts: ceil(100 × 0.9))', () => {
    expect(qty(result, 'eye_of_newt')).toBe(90)
  })

  test('step inputs match: vial qty = 70, irit qty = 63, eye qty = 90', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.inputs.find(i => i.id === 'vial_of_water')?.qty).toBe(70)
    expect(step?.inputs.find(i => i.id === 'clean_irit')?.qty).toBe(63)
    expect(step?.inputs.find(i => i.id === 'eye_of_newt')?.qty).toBe(90)
  })

  test('scroll savings visible: irit rawQty = 70, qty = 63', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    const iritInput = step?.inputs.find(i => i.id === 'clean_irit')
    expect(iritInput?.rawQty).toBe(70)
    expect(iritInput?.qty).toBe(63)
  })
})

describe('Non-twoStepMix recipes unaffected by unfQty', () => {
  // overload is not twoStepMix; its extreme sub-recipes are not either
  test('unfStep is absent on overload step', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    const overloadStep = result.steps.find(s => s.potionId === 'overload')
    expect(overloadStep?.unfStep).toBeUndefined()
  })

  test('unf pool for a different herb does not bleed into unrelated recipe', () => {
    // supply irit (unf) while crafting super_strength (uses kwuarm)
    const inputs: CalculatorInputs = {
      ...emptyInputs(55),
      herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 5 }]]),
    }
    const result = calc(inputs, 'super_strength', 10)
    // clean_kwuarm should be 10 (unf irit doesn't help here)
    expect(qty(result, 'clean_kwuarm')).toBe(10)
    expect(qty(result, 'vial_of_water')).toBe(10)
  })
})
