import { render, screen, fireEvent } from '@testing-library/vue'
import SupplyTable from '@/components/SupplyTable.vue'
import type { HerbSupplyRow, PotionSupplyRow, ItemSupplyRow, SupplyRow } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

jest.mock('@/composables/useSupply', () => ({
  useSupply: () => ({
    setHerbClean: jest.fn(),
    setHerbGrimy: jest.fn(),
    setHerbUnf: jest.fn(),
    setItemQty: jest.fn(),
    setPotionThreeDose: jest.fn(),
    setPotionFourDose: jest.fn(),
    setPotionSixDose: jest.fn(),
    resetCategory: jest.fn(),
    data: { value: null },
  }),
}))

const base = {
  totalNeeded: 0, rawQty: 0, scrollSavings: 0, remaining: 0,
  isNeeded: false, tradeable: true,
}

function herbRow(overrides: Partial<HerbSupplyRow> = {}): HerbSupplyRow {
  return {
    ...base, kind: 'herb', id: 'clean_irit', name: 'Irit leaf', herbId: 'clean_irit',
    qtyClean: 0, qtyGrimy: 0, qtyUnf: 0, isNeeded: true, totalNeeded: 10,
    ...overrides,
  }
}

function potionRow(overrides: Partial<PotionSupplyRow> = {}): PotionSupplyRow {
  return {
    ...base, kind: 'potion', id: 'super_attack', name: 'Super attack',
    category: 'super', isFlask: false,
    qtyThree: 0, qtyFour: 0, qtySix: 0, isNeeded: true, totalNeeded: 5,
    ...overrides,
  }
}

function flaskRow(overrides: Partial<PotionSupplyRow> = {}): PotionSupplyRow {
  return potionRow({ id: 'overload_flask', name: 'Overload flask', isFlask: true, category: 'overload', ...overrides })
}

function secondaryRow(overrides: Partial<ItemSupplyRow> = {}): ItemSupplyRow {
  return {
    ...base, kind: 'secondary', id: 'eye_of_newt', name: 'Eye of newt',
    qty: 0, isNeeded: true, totalNeeded: 10,
    ...overrides,
  }
}

function renderTable(rows: SupplyRow[], hiddenCount = 0) {
  return render(SupplyTable, {
    props: { rows, hiddenCount },
    global: { stubs: vuetifyStubs },
  })
}

describe('SupplyTable — herb rows', () => {
  test('shows Clean/Grimy/Unfinished inputs', () => {
    renderTable([herbRow()])
    expect(screen.getByLabelText('Clean')).toBeInTheDocument()
    expect(screen.getByLabelText('Grimy')).toBeInTheDocument()
    expect(screen.getByLabelText('Unfinished')).toBeInTheDocument()
  })

  test('populates herb input values', () => {
    renderTable([herbRow({ qtyClean: 50, qtyGrimy: 10, qtyUnf: 5 })])
    expect(screen.getByLabelText('Clean')).toHaveValue(50)
    expect(screen.getByLabelText('Grimy')).toHaveValue(10)
    expect(screen.getByLabelText('Unfinished')).toHaveValue(5)
  })
})

describe('SupplyTable — potion rows', () => {
  test('shows 3 dose/4 dose inputs for standard potion', () => {
    renderTable([potionRow()])
    expect(screen.getByLabelText('3 dose')).toBeInTheDocument()
    expect(screen.getByLabelText('4 dose')).toBeInTheDocument()
  })

  test('shows only 6 dose input for flask', () => {
    renderTable([flaskRow()])
    expect(screen.getByLabelText('6 dose')).toBeInTheDocument()
    expect(screen.queryByLabelText('3 dose')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('4 dose')).not.toBeInTheDocument()
  })
})

describe('SupplyTable — item rows', () => {
  test('shows single qty input for secondaries', () => {
    renderTable([secondaryRow()])
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
  })
})


describe('SupplyTable — scroll savings', () => {
  test('renders tooltip-qty span when scrollSavings > 0', () => {
    const { container } = renderTable([herbRow({ totalNeeded: 90, rawQty: 100, scrollSavings: 10 })])
    expect(container.querySelector('.tooltip-qty')).not.toBeNull()
    expect(screen.getByText('90')).toBeInTheDocument()
  })

  test('renders plain span (no tooltip) when no savings', () => {
    const { container } = renderTable([herbRow({ totalNeeded: 90, rawQty: 90, scrollSavings: 0 })])
    expect(container.querySelector('.tooltip-qty')).toBeNull()
    expect(screen.getByText('90')).toBeInTheDocument()
  })

  test('shows dash in needed column when totalNeeded is 0', () => {
    renderTable([herbRow({ totalNeeded: 0, rawQty: 0, scrollSavings: 0, isNeeded: false })])
    // Both needed and remaining columns show '—'; assert at least one is present
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})

describe('SupplyTable — see more / show less', () => {
  test('shows "N more..." button when hiddenCount > 0', () => {
    renderTable([herbRow()], 3)
    expect(screen.getByText('3 more...')).toBeInTheDocument()
  })

  test('emits toggleSeeMore when "more" button clicked', async () => {
    const { emitted } = renderTable([herbRow()], 2)
    await fireEvent.click(screen.getByText('2 more...'))
    expect(emitted()['toggleSeeMore']).toBeDefined()
  })

  test('shows "Show less" when hiddenCount=0 and some rows are not needed', () => {
    renderTable([herbRow({ isNeeded: true }), secondaryRow({ isNeeded: false })], 0)
    expect(screen.getByText('Show less')).toBeInTheDocument()
  })

  test('emits toggleSeeMore when "Show less" clicked', async () => {
    const { emitted } = renderTable([herbRow({ isNeeded: true }), secondaryRow({ isNeeded: false })], 0)
    await fireEvent.click(screen.getByText('Show less'))
    expect(emitted()['toggleSeeMore']).toBeDefined()
  })

  test('shows neither button when all rows needed and hiddenCount=0', () => {
    renderTable([herbRow({ isNeeded: true })], 0)
    expect(screen.queryByText(/more\.\.\./)).not.toBeInTheDocument()
    expect(screen.queryByText('Show less')).not.toBeInTheDocument()
  })
})

describe('SupplyTable — header', () => {
  test('hides thead when rows is empty', () => {
    renderTable([])
    expect(screen.queryByText('Ingredient')).not.toBeInTheDocument()
  })

  test('shows thead when rows present', () => {
    renderTable([herbRow()])
    expect(screen.getByText('Ingredient')).toBeInTheDocument()
  })
})

describe('SupplyTable — row styling', () => {
  test('applies row-not-needed when isNeeded=false', () => {
    const { container } = renderTable([herbRow({ isNeeded: false, totalNeeded: 0 })])
    expect(container.querySelector('.row-not-needed')).not.toBeNull()
  })

  test('applies row-ok when needed and remaining=0', () => {
    const { container } = renderTable([herbRow({ isNeeded: true, remaining: 0 })])
    expect(container.querySelector('.row-ok')).not.toBeNull()
  })

  test('applies row-deficit when needed and remaining>0 and tradeable', () => {
    const { container } = renderTable([herbRow({ isNeeded: true, remaining: 5, tradeable: true })])
    expect(container.querySelector('.row-deficit')).not.toBeNull()
  })

  test('applies row-untradeable when needed and remaining>0 and not tradeable', () => {
    const { container } = renderTable([herbRow({ isNeeded: true, remaining: 5, tradeable: false })])
    expect(container.querySelector('.row-untradeable')).not.toBeNull()
  })
})
