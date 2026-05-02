import { render, screen, fireEvent } from '@testing-library/vue'
import SupplyColumn from '@/components/SupplyColumn.vue'
import { ref } from 'vue'
import { vuetifyStubs } from '../utils/stubs'

const mockResetCategory = jest.fn()

function makeData(overrides = {}) {
  return {
    herbRows: [],
    secondaryRows: [],
    vialRows: [],
    potionsByCategory: new Map(),
    activePotionCategories: [],
    ...overrides,
  }
}

const mockData = ref(makeData())

jest.mock('@/composables/useSupply', () => ({
  useSupply: () => ({
    data: mockData,
    resetCategory: mockResetCategory,
    setHerbClean: jest.fn(),
    setHerbGrimy: jest.fn(),
    setHerbUnf: jest.fn(),
    setItemQty: jest.fn(),
    setPotionThreeDose: jest.fn(),
    setPotionFourDose: jest.fn(),
    setPotionSixDose: jest.fn(),
  }),
}))

beforeEach(() => {
  mockResetCategory.mockClear()
  mockData.value = makeData()
})

function renderComponent() {
  return render(SupplyColumn, { global: { stubs: vuetifyStubs } })
}

describe('SupplyColumn — structure', () => {
  test('renders Supply list heading', () => {
    renderComponent()
    expect(screen.getByText('Supply list')).toBeInTheDocument()
  })

  test('renders herbs & unfinished accordion section', () => {
    renderComponent()
    // accordion title uses <span>, menu item is plain text — selector narrows to span
    expect(screen.getByText(/herbs.*unfinished/i, { selector: 'span' })).toBeInTheDocument()
  })

  test('renders Secondaries accordion section', () => {
    renderComponent()
    expect(screen.getByText('Secondaries', { selector: 'span' })).toBeInTheDocument()
  })

  test('renders Potions accordion section', () => {
    renderComponent()
    expect(screen.getByText('Potions', { selector: 'span' })).toBeInTheDocument()
  })

  test('renders Vials & Bases accordion section', () => {
    renderComponent()
    expect(screen.getByText(/vials.*bases/i, { selector: 'span' })).toBeInTheDocument()
  })
})

describe('SupplyColumn — needed count badge', () => {
  test('shows needed count in herb section when rows are needed', () => {
    mockData.value = makeData({
      herbRows: [
        { id: 'clean_irit', name: 'Irit leaf', kind: 'herb', isNeeded: true, totalNeeded: 5, remaining: 0, tradeable: true, scrollSavings: 0, rawQty: 5, herbId: 'clean_irit', qtyClean: 0, qtyGrimy: 0, qtyUnf: 0 },
        { id: 'clean_kwuarm', name: 'Kwuarm', kind: 'herb', isNeeded: false, totalNeeded: 0, remaining: 0, tradeable: true, scrollSavings: 0, rawQty: 0, herbId: 'clean_kwuarm', qtyClean: 0, qtyGrimy: 0, qtyUnf: 0 },
      ],
    })
    renderComponent()
    expect(screen.getByText('(1 needed)')).toBeInTheDocument()
  })

  test('does not show needed count when no rows are needed', () => {
    renderComponent()
    expect(screen.queryByText(/needed/)).not.toBeInTheDocument()
  })
})

describe('SupplyColumn — clear supply menu', () => {
  test('calls resetCategory(herbs) when Herbs menu item clicked', async () => {
    renderComponent()
    // Menu item renders as plain div; accordion title is inside a <span> — use plain text match
    await fireEvent.click(screen.getByText('Herbs'))
    expect(mockResetCategory).toHaveBeenCalledWith('herbs')
  })

  test('calls resetCategory(potions) when Potions menu item clicked', async () => {
    renderComponent()
    // 'Potions' appears in both the menu (plain div) and the accordion (inside a span)
    // The menu item appears first in the DOM
    await fireEvent.click(screen.getAllByText('Potions')[0])
    expect(mockResetCategory).toHaveBeenCalledWith('potions')
  })

  test('calls resetCategory(secondaries) when Secondaries menu item clicked', async () => {
    renderComponent()
    await fireEvent.click(screen.getAllByText('Secondaries')[0])
    expect(mockResetCategory).toHaveBeenCalledWith('secondaries')
  })

  test('calls resetCategory(vials) when Vials & Bases menu item clicked', async () => {
    renderComponent()
    await fireEvent.click(screen.getAllByText('Vials & Bases')[0])
    expect(mockResetCategory).toHaveBeenCalledWith('vials')
  })
})
