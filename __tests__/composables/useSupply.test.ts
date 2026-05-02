import { ref, reactive } from 'vue'
import type { CalculationResult, CalculatorInputs } from '@/types'

// Build minimal mock inputs and result that useCalculator would return
const mockInputs = reactive<Pick<CalculatorInputs, 'herbSupply' | 'itemSupply' | 'potionSupply'>>({
  herbSupply: new Map(),
  itemSupply: new Map(),
  potionSupply: new Map(),
})
const mockResult = ref<CalculationResult | null>(null)

jest.mock('@/composables/useCalculator', () => ({
  useCalculator: () => ({
    inputs: mockInputs,
    result: mockResult,
    setHerbClean: jest.fn(),
    setHerbGrimy: jest.fn(),
    setHerbUnf: jest.fn(),
    setItemQty: jest.fn(),
    setPotionThreeDose: jest.fn(),
    setPotionFourDose: jest.fn(),
    setPotionSixDose: jest.fn(),
    resetCategory: jest.fn(),
  }),
}))

// Import after mock is in place
import { useSupply } from '@/composables/useSupply'

function makeIngredientResult(id: string, overrides = {}) {
  return { id, name: id, kind: 'herb' as const, totalNeeded: 0, rawQty: 0, currentlyHave: 0, stillNeeded: 0, tradeable: true, ...overrides }
}

beforeEach(() => {
  mockInputs.herbSupply = new Map()
  mockInputs.itemSupply = new Map()
  mockInputs.potionSupply = new Map()
  mockResult.value = null
})

describe('useSupply — herb rows', () => {
  test('returns herb rows for all clean herbs in ingredient list', () => {
    const { data } = useSupply()
    expect(data.value.herbRows.length).toBeGreaterThan(0)
    expect(data.value.herbRows.every(r => r.kind === 'herb')).toBe(true)
  })

  test('excludes grimy herbs from herb rows', () => {
    const { data } = useSupply()
    expect(data.value.herbRows.some(r => r.id.startsWith('grimy_'))).toBe(false)
  })

  test('populates qtyClean/qtyGrimy/qtyUnf from herbSupply', () => {
    mockInputs.herbSupply.set('clean_irit', { cleanQty: 10, grimyQty: 5, unfQty: 3 })
    const { data } = useSupply()
    const irit = data.value.herbRows.find(r => r.id === 'clean_irit')!
    expect(irit.qtyClean).toBe(10)
    expect(irit.qtyGrimy).toBe(5)
    expect(irit.qtyUnf).toBe(3)
  })

  test('isNeeded is true when totalNeeded > 0', () => {
    mockResult.value = {
      targets: [], steps: [], shortfalls: [], achievability: [],
      ingredients: [makeIngredientResult('clean_irit', { kind: 'herb', totalNeeded: 10, rawQty: 10 })],
    }
    const { data } = useSupply()
    const irit = data.value.herbRows.find(r => r.id === 'clean_irit')!
    expect(irit.isNeeded).toBe(true)
    expect(irit.totalNeeded).toBe(10)
  })

  test('isNeeded is false when totalNeeded = 0', () => {
    const { data } = useSupply()
    const row = data.value.herbRows[0]
    expect(row.isNeeded).toBe(false)
  })

  test('scrollSavings = rawQty - totalNeeded', () => {
    mockResult.value = {
      targets: [], steps: [], shortfalls: [], achievability: [],
      ingredients: [makeIngredientResult('clean_irit', { kind: 'herb', totalNeeded: 90, rawQty: 100 })],
    }
    const { data } = useSupply()
    const irit = data.value.herbRows.find(r => r.id === 'clean_irit')!
    expect(irit.scrollSavings).toBe(10)
  })

  test('remaining = stillNeeded from result', () => {
    mockResult.value = {
      targets: [], steps: [], shortfalls: [], achievability: [],
      ingredients: [makeIngredientResult('clean_irit', { kind: 'herb', totalNeeded: 10, rawQty: 10, stillNeeded: 4 })],
    }
    const { data } = useSupply()
    const irit = data.value.herbRows.find(r => r.id === 'clean_irit')!
    expect(irit.remaining).toBe(4)
  })
})

describe('useSupply — potion rows', () => {
  test('groups potions by category', () => {
    const { data } = useSupply()
    expect(data.value.potionsByCategory.size).toBeGreaterThan(0)
  })

  test('all potion rows have kind=potion', () => {
    const { data } = useSupply()
    for (const rows of data.value.potionsByCategory.values()) {
      expect(rows.every(r => r.kind === 'potion')).toBe(true)
    }
  })

  test('populates qtyThree/qtyFour from potionSupply', () => {
    mockInputs.potionSupply.set('super_attack', { threeDose: 4, fourDose: 2, sixDose: 0 })
    const { data } = useSupply()
    const rows = [...data.value.potionsByCategory.values()].flat()
    const sa = rows.find(r => r.id === 'super_attack')!
    expect(sa.qtyThree).toBe(4)
    expect(sa.qtyFour).toBe(2)
  })

  test('isNeeded for potion used as intermediate step input', () => {
    mockResult.value = {
      targets: [], shortfalls: [], achievability: [],
      ingredients: [],
      steps: [{
        potionId: 'overload', name: 'Overload', category: 'overload', stepKind: 'potion',
        crafts: 1, outputDose: 3, xpGained: 0,
        inputs: [{ id: 'super_attack', name: 'Super attack', kind: 'potion', qty: 1, rawQty: 1 }],
      }],
    }
    const { data } = useSupply()
    const rows = [...data.value.potionsByCategory.values()].flat()
    const sa = rows.find(r => r.id === 'super_attack')!
    expect(sa.isNeeded).toBe(true)
  })
})

describe('useSupply — secondary rows', () => {
  test('returns secondary rows', () => {
    const { data } = useSupply()
    expect(data.value.secondaryRows.length).toBeGreaterThan(0)
    expect(data.value.secondaryRows.every(r => r.kind === 'secondary')).toBe(true)
  })

  test('populates qty from itemSupply', () => {
    mockInputs.itemSupply.set('eye_of_newt', 30)
    const { data } = useSupply()
    const row = data.value.secondaryRows.find(r => r.id === 'eye_of_newt')!
    expect(row.qty).toBe(30)
  })
})

describe('useSupply — vial rows', () => {
  test('returns vial and misc rows', () => {
    const { data } = useSupply()
    expect(data.value.vialRows.length).toBeGreaterThan(0)
    expect(data.value.vialRows.every(r => r.kind === 'vial' || r.kind === 'misc')).toBe(true)
  })
})
