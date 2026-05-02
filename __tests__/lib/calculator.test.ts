import { calculateAll } from '@/lib/calculator'
import type { CalculatorInputs, TargetPotion, PerksConfiguration } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { RECIPES } from '@/data/recipes'

function emptyInputs(level: number): CalculatorInputs {
  return {
    herbloreLevel: level,
    herbSupply: new Map(),
    itemSupply: new Map(),
    potionSupply: new Map(),
    secondaryModes: new Map(),
    disabledRecipes: new Set(),
    preferredRecipeTier: new Map(),
    perks: { ...DEFAULT_CONFIG },
  }
}

function withScroll(inputs: CalculatorInputs): CalculatorInputs {
  return { ...inputs, perks: { ...inputs.perks, scrollOfCleansing: true } }
}

function withPerks(inputs: CalculatorInputs, perks: Partial<PerksConfiguration>): CalculatorInputs {
  return { ...inputs, perks: { ...inputs.perks, ...perks } }
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
  const inputs = withScroll(emptyInputs(96))
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
  const inputs = withScroll(emptyInputs(106))
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
    const inputs = withScroll(emptyInputs(96))
    const result = calc(inputs, 'overload', 1000)
    // clean_irit is in the irit_potion_unf step (split recipe model)
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    const iritInput = unfStep?.inputs.find(i => i.id === 'clean_irit')
    expect(iritInput).toBeDefined()
    expect(iritInput!.qty).toBeLessThan(iritInput!.rawQty)
  })
})

// ─── Unfinished potion supply ─────────────────────────────────────────────────
//
// super_attack uses a split-recipe model:
//   irit_potion_unf recipe: vial_of_water + clean_irit → 1 unf (dose 1)
//   super_attack recipe: irit_potion_unf (unfinished_potion) + eye_of_newt → 3-dose potion
//
// With N crafts and U unfinished potions in supply:
//   irit_potion_unf crafts = N − U  (vial + herb only needed for these)
//   super_attack crafts = N
//   scroll of cleansing (multiplier 0.9) applies independently per step

describe('Unf supply — partial (10 super attacks, 3 unf irit)', () => {
  const inputs: CalculatorInputs = {
    ...emptyInputs(45),
    herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 3 }]]),
  }
  const result = calc(inputs, 'super_attack', 10)

  test('vial_of_water reduced to 7 (irit_potion_unf crafts = 10 − 3)', () => {
    expect(qty(result, 'vial_of_water')).toBe(7)
  })

  test('clean_irit reduced to 7', () => {
    expect(qty(result, 'clean_irit')).toBe(7)
  })

  test('eye_of_newt unchanged at 10 (secondary always needed)', () => {
    expect(qty(result, 'eye_of_newt')).toBe(10)
  })

  test('irit_potion_unf step has crafts = 7 (3 from supply)', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(unfStep?.crafts).toBe(7)
  })

  test('irit_potion_unf step has stepKind = "unfinished"', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(unfStep?.stepKind).toBe('unfinished')
  })

  test('irit_potion_unf step inputs: vial qty = 7', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(unfStep?.inputs.find(i => i.id === 'vial_of_water')?.qty).toBe(7)
  })

  test('super_attack step inputs: eye_of_newt qty = 10', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.inputs.find(i => i.id === 'eye_of_newt')?.qty).toBe(10)
  })

  test('super_attack step inputs: irit_potion_unf qty = 10 (total needed)', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    const unfInput = step?.inputs.find(i => i.id === 'irit_potion_unf')
    expect(unfInput?.kind).toBe('unfinished_potion')
    expect(unfInput?.qty).toBe(10)
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

  test('irit_potion_unf step absent (all covered by supply)', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(unfStep).toBeUndefined()
  })
})

describe('Unf supply — no unf in supply (all crafted)', () => {
  const result = calc(emptyInputs(45), 'super_attack', 10)

  test('irit_potion_unf step present (all must be crafted)', () => {
    const step = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(step).toBeDefined()
  })

  test('irit_potion_unf step has crafts = 10', () => {
    const step = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(step?.crafts).toBe(10)
  })

  test('vial and herb totals unchanged (10 each)', () => {
    expect(qty(result, 'vial_of_water')).toBe(10)
    expect(qty(result, 'clean_irit')).toBe(10)
    expect(qty(result, 'eye_of_newt')).toBe(10)
  })
})

// Scroll of cleansing with unf supply (split-recipe model):
//   irit_potion_unf crafts = 70 (100 − 30 unf), saveableCount = 1 (clean_irit at idx 1)
//     vial: not scrollable → 70
//     clean_irit: scrollable → ceil(70 × 0.9) = 63
//   super_attack crafts = 100, saveableCount = 1 (eye_of_newt at idx 1)
//     eye_of_newt: scrollable → ceil(100 × 0.9) = 90
describe('Unf supply + Scroll of Cleansing (100 super attacks, 30 unf irit)', () => {
  const inputs: CalculatorInputs = {
    ...withScroll(emptyInputs(45)),
    herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 30 }]]),
  }
  const result = calc(inputs, 'super_attack', 100)

  test('vial_of_water = 70 (not scrollable)', () => {
    expect(qty(result, 'vial_of_water')).toBe(70)
  })

  test('clean_irit = 63 (scroll on irit_potion_unf step: ceil(70 × 0.9))', () => {
    expect(qty(result, 'clean_irit')).toBe(63)
  })

  test('eye_of_newt = 90 (scroll on super_attack step: ceil(100 × 0.9))', () => {
    expect(qty(result, 'eye_of_newt')).toBe(90)
  })

  test('irit_potion_unf step inputs: vial=70, irit=63', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    expect(unfStep?.inputs.find(i => i.id === 'vial_of_water')?.qty).toBe(70)
    expect(unfStep?.inputs.find(i => i.id === 'clean_irit')?.qty).toBe(63)
  })

  test('super_attack step inputs: eye_of_newt = 90', () => {
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step?.inputs.find(i => i.id === 'eye_of_newt')?.qty).toBe(90)
  })

  test('scroll savings visible on irit_potion_unf step: irit rawQty=70, qty=63', () => {
    const unfStep = result.steps.find(s => s.potionId === 'irit_potion_unf')
    const iritInput = unfStep?.inputs.find(i => i.id === 'clean_irit')
    expect(iritInput?.rawQty).toBe(70)
    expect(iritInput?.qty).toBe(63)
  })
})

describe('Unf supply isolation', () => {
  test('overload step does not produce torstol_potion_unf (uses clean_torstol directly)', () => {
    const result = calc(emptyInputs(96), 'overload', 1)
    const torstolUnfStep = result.steps.find(s => s.potionId === 'torstol_potion_unf')
    expect(torstolUnfStep).toBeUndefined()
  })

  test('unf pool for a different herb does not bleed into unrelated recipe', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs(55),
      herbSupply: new Map([['clean_irit', { cleanQty: 0, grimyQty: 0, unfQty: 5 }]]),
    }
    const result = calc(inputs, 'super_strength', 10)
    expect(qty(result, 'clean_kwuarm')).toBe(10)
    expect(qty(result, 'vial_of_water')).toBe(10)
  })
})

// ─── Factory outfit perk ──────────────────────────────────────────────────────

describe('factoryOutfit perk', () => {
  // 100 super attacks = 300 doses needed.
  // Without outfit: ceil(300/3) = 100 crafts.
  // With outfit:    ceil(300/3.125) = 96 crafts → 96 irit_potion_unf needed → 96 herbs/vials.
  const base = calc(emptyInputs(45), 'super_attack', 100)
  const outfit = calc(withPerks(emptyInputs(45), { factoryOutfit: true }), 'super_attack', 100)

  test('reduces finishing-step crafts for 3-dose recipes', () => {
    expect(qty(base, 'eye_of_newt')).toBe(100)
    expect(qty(outfit, 'eye_of_newt')).toBe(96)
  })

  test('reduces upstream unfinished-potion crafts accordingly', () => {
    expect(qty(base, 'clean_irit')).toBe(100)
    expect(qty(outfit, 'clean_irit')).toBe(96)
    expect(qty(outfit, 'vial_of_water')).toBe(96)
  })

  test('does not reduce unfinished steps independently (outputDose=1)', () => {
    // The unf step itself has outputDose=1, so outfit only helps via fewer crafts requested.
    // Outfit-reduced finishing (96 crafts) requests 96 unf potions → 96 herbs — not further reduced.
    expect(qty(outfit, 'clean_irit')).toBe(96)
  })
})

// ─── Duplicate bonus perks ────────────────────────────────────────────────────

describe('duplicate bonus perks', () => {
  // 100 super attacks — all calculations at level 45.
  //
  // mask only (5%):
  //   finishing: ceil(100/1.05)=96, 96 eye_of_newt
  //   unf:       ceil(96/1.05)=92,  92 irit herbs + vials
  //
  // well only (5%): identical to mask
  //
  // well + brooch (10%):
  //   finishing: ceil(100/1.10)=91, 91 eye_of_newt
  //   unf:       ceil(91/1.10)=83,  83 irit herbs + vials
  //
  // mask + well (10%): same as well+brooch
  //
  // mask + well + brooch (15%):
  //   finishing: ceil(100/1.15)=87, 87 eye_of_newt
  //   unf:       ceil(87/1.15)=76,  76 irit herbs + vials

  test('modifiedBotanistMask (5%) reduces finishing and unf-step crafts', () => {
    const result = calc(withPerks(emptyInputs(45), { modifiedBotanistMask: true }), 'super_attack', 100)
    expect(qty(result, 'eye_of_newt')).toBe(96)
    expect(qty(result, 'clean_irit')).toBe(92)
    expect(qty(result, 'vial_of_water')).toBe(92)
  })

  test('portableWell (5%) applies the same reduction as mask alone', () => {
    const result = calc(withPerks(emptyInputs(45), { portableWell: true }), 'super_attack', 100)
    expect(qty(result, 'eye_of_newt')).toBe(96)
    expect(qty(result, 'clean_irit')).toBe(92)
  })

  test('broochOfTheGods upgrades well from 5% to 10%', () => {
    const wellOnly = calc(withPerks(emptyInputs(45), { portableWell: true }), 'super_attack', 100)
    const withBrooch = calc(withPerks(emptyInputs(45), { portableWell: true, broochOfTheGods: true }), 'super_attack', 100)
    expect(qty(wellOnly, 'clean_irit')).toBe(92)
    expect(qty(withBrooch, 'clean_irit')).toBe(83)
    expect(qty(withBrooch, 'eye_of_newt')).toBe(91)
  })

  test('mask + well combined gives 10% total bonus', () => {
    const result = calc(withPerks(emptyInputs(45), { modifiedBotanistMask: true, portableWell: true }), 'super_attack', 100)
    expect(qty(result, 'clean_irit')).toBe(83)
    expect(qty(result, 'eye_of_newt')).toBe(91)
  })

  test('mask + well + brooch gives 15% total bonus', () => {
    const result = calc(withPerks(emptyInputs(45), { modifiedBotanistMask: true, portableWell: true, broochOfTheGods: true }), 'super_attack', 100)
    expect(qty(result, 'clean_irit')).toBe(76)
    expect(qty(result, 'eye_of_newt')).toBe(87)
  })

  test('brooch alone has no effect (requires portableWell)', () => {
    const broochOnly = calc(withPerks(emptyInputs(45), { broochOfTheGods: true }), 'super_attack', 100)
    expect(qty(broochOnly, 'clean_irit')).toBe(100)
  })
})

// ─── XP calculation ───────────────────────────────────────────────────────────

describe('XP calculation', () => {
  test('unfinished potion steps always have 0 XP', () => {
    const result = calc(emptyInputs(45), 'super_attack', 1)
    const unfStep = result.steps.find(s => s.stepKind === 'unfinished')
    expect(unfStep).toBeDefined()
    expect(unfStep!.xpGained).toBe(0)
  })

  test('finishing potion steps have positive XP', () => {
    const result = calc(emptyInputs(45), 'super_attack', 1)
    const step = result.steps.find(s => s.potionId === 'super_attack')
    expect(step!.xpGained).toBeGreaterThan(0)
  })

  test('XP scales with number of crafts', () => {
    const one = calc(emptyInputs(45), 'super_attack', 1)
    const ten = calc(emptyInputs(45), 'super_attack', 10)
    const xp1 = one.steps.find(s => s.potionId === 'super_attack')!.xpGained
    const xp10 = ten.steps.find(s => s.potionId === 'super_attack')!.xpGained
    expect(xp10).toBe(xp1 * 10)
  })

  test('clanFealtyPercent boosts XP proportionally', () => {
    const base = calc(emptyInputs(45), 'super_attack', 10)
    const boosted = calc(withPerks(emptyInputs(45), { clanFealtyPercent: 10 }), 'super_attack', 10)
    const baseXp = base.steps.find(s => s.potionId === 'super_attack')!.xpGained
    const boostedXp = boosted.steps.find(s => s.potionId === 'super_attack')!.xpGained
    expect(boostedXp).toBeGreaterThan(baseXp)
    expect(boostedXp / baseXp).toBeCloseTo(1.1, 1)
  })

  test('botanistXpPercent boosts XP proportionally', () => {
    const base = calc(emptyInputs(45), 'super_attack', 10)
    const boosted = calc(withPerks(emptyInputs(45), { botanistXpPercent: 6 }), 'super_attack', 10)
    const baseXp = base.steps.find(s => s.potionId === 'super_attack')!.xpGained
    const boostedXp = boosted.steps.find(s => s.potionId === 'super_attack')!.xpGained
    expect(boostedXp / baseXp).toBeCloseTo(1.06, 1)
  })

  test('multiple XP boosts are additive not multiplicative', () => {
    const base = calc(emptyInputs(45), 'super_attack', 10)
    const boosted = calc(withPerks(emptyInputs(45), { clanFealtyPercent: 3, botanistXpPercent: 6, customXpPercent: 1 }), 'super_attack', 10)
    const baseXp = base.steps.find(s => s.potionId === 'super_attack')!.xpGained
    const boostedXp = boosted.steps.find(s => s.potionId === 'super_attack')!.xpGained
    expect(boostedXp / baseXp).toBeCloseTo(1.1, 1) // 3+6+1 = 10%
  })

  test('perfectJujuPotion adds 5% XP on combination steps', () => {
    const comboRecipe = RECIPES.find(r => r.category === 'combination' && r.xpPerCraft > 0)
    if (!comboRecipe) return

    const base = calc(emptyInputs(120), comboRecipe.id, 1)
    const withJuju = calc(withPerks(emptyInputs(120), { perfectJujuPotion: true }), comboRecipe.id, 1)
    const comboStep = base.steps.find(s => s.potionId === comboRecipe.id)
    const comboStepJuju = withJuju.steps.find(s => s.potionId === comboRecipe.id)

    if (comboStep && comboStepJuju) {
      expect(comboStepJuju.xpGained).toBeGreaterThan(comboStep.xpGained)
      expect(comboStepJuju.xpGained / comboStep.xpGained).toBeCloseTo(1.05, 1)
    }
  })

  test('perfectJujuPotion has no effect on non-combination steps', () => {
    const base = calc(emptyInputs(45), 'super_attack', 10)
    const withJuju = calc(withPerks(emptyInputs(45), { perfectJujuPotion: true }), 'super_attack', 10)
    const baseXp = base.steps.find(s => s.potionId === 'super_attack')!.xpGained
    const jujuXp = withJuju.steps.find(s => s.potionId === 'super_attack')!.xpGained
    expect(jujuXp).toBe(baseXp)
  })
})
