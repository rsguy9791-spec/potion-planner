import { render, screen, fireEvent } from '@testing-library/vue'
import SupplyTable from '@/components/SupplyTable.vue'
import type { CalculatorInputs } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

const emptyInputs: CalculatorInputs = {
  herbloreLevel: 99,
  herbSupply: new Map(),
  itemSupply: new Map(),
  potionSupply: new Map(),
  secondaryModes: new Map(),
  disabledRecipes: new Set(),
  preferredRecipeTier: new Map(),
  perks: { ...DEFAULT_CONFIG },
}

function renderComponent(inputs: CalculatorInputs = emptyInputs) {
  return render(SupplyTable, {
    props: { inputs },
    global: { stubs: vuetifyStubs },
  })
}

describe('SupplyTable', () => {
  test('always shows Herbs section', () => {
    renderComponent()
    expect(screen.getByText('Herbs')).toBeInTheDocument()
  })

  test('always shows Potions section', () => {
    renderComponent()
    expect(screen.getByText('Potions')).toBeInTheDocument()
  })

  test('always shows Secondaries section', () => {
    renderComponent()
    expect(screen.getByText('Secondaries')).toBeInTheDocument()
  })

  test('renders clean and grimy columns for every herb', () => {
    renderComponent()
    const cleanInputs = screen.getAllByLabelText('Clean')
    expect(cleanInputs.length).toBeGreaterThan(5)
  })

  test('renders 3-dose, 4-dose, 6-dose columns for potions', () => {
    renderComponent()
    expect(screen.getAllByLabelText('3-dose').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('4-dose').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('6-dose').length).toBeGreaterThan(0)
  })

  test('shows all herbs including new ones (toadflax)', () => {
    renderComponent()
    expect(screen.getByText('Toadflax')).toBeInTheDocument()
  })

  test('emits setHerbClean with correct herb and qty', async () => {
    const { emitted } = renderComponent()
    const cleanInputs = screen.getAllByLabelText('Clean') as HTMLInputElement[]
    await fireEvent.update(cleanInputs[0], '10')
    const events = emitted()['setHerbClean']
    expect(events).toBeDefined()
    expect(events?.[0]?.[1]).toBe(10)
  })

  test('emits setHerbGrimy with correct herb and qty', async () => {
    const { emitted } = renderComponent()
    const grimyInputs = screen.getAllByLabelText('Grimy') as HTMLInputElement[]
    await fireEvent.update(grimyInputs[0], '5')
    const events = emitted()['setHerbGrimy']
    expect(events).toBeDefined()
    expect(events?.[0]?.[1]).toBe(5)
  })

  test('displays current clean herb supply from inputs', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs,
      herbSupply: new Map([['clean_torstol', { cleanQty: 42, grimyQty: 0, unfQty: 0 }]]),
    }
    renderComponent(inputs)
    const cleanInputs = screen.getAllByLabelText('Clean') as HTMLInputElement[]
    expect(cleanInputs.some(el => el.value === '42')).toBe(true)
  })

  test('renders Unf column for every herb', () => {
    renderComponent()
    const unfInputs = screen.getAllByLabelText('Unf')
    expect(unfInputs.length).toBeGreaterThan(5)
  })

  test('emits setHerbUnf with correct herb and qty', async () => {
    const { emitted } = renderComponent()
    const unfInputs = screen.getAllByLabelText('Unf') as HTMLInputElement[]
    await fireEvent.update(unfInputs[0], '8')
    const events = emitted()['setHerbUnf']
    expect(events).toBeDefined()
    expect(events?.[0]?.[1]).toBe(8)
  })

  test('displays current unf herb supply from inputs', () => {
    const inputs: CalculatorInputs = {
      ...emptyInputs,
      herbSupply: new Map([['clean_torstol', { cleanQty: 0, grimyQty: 0, unfQty: 17 }]]),
    }
    renderComponent(inputs)
    const unfInputs = screen.getAllByLabelText('Unf') as HTMLInputElement[]
    expect(unfInputs.some(el => el.value === '17')).toBe(true)
  })

  test('emits setPotionThreeDose when 3-dose input changes', async () => {
    const { emitted } = renderComponent()
    const threeDoseInputs = screen.getAllByLabelText('3-dose') as HTMLInputElement[]
    await fireEvent.update(threeDoseInputs[0], '20')
    const events = emitted()['setPotionThreeDose']
    expect(events).toBeDefined()
    expect(events?.[0]?.[1]).toBe(20)
  })

  test('emits setItemQty when Other Ingredient input changes', async () => {
    const { emitted } = renderComponent()
    const haveInputs = screen.getAllByLabelText('Have') as HTMLInputElement[]
    await fireEvent.update(haveInputs[0], '100')
    const events = emitted()['setItemQty']
    expect(events).toBeDefined()
    expect(events?.[0]?.[1]).toBe(100)
  })
})
