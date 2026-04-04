import { render, screen } from '@testing-library/vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResultsTable from '@/components/ResultsTable.vue'
import type { CalculationResult, IngredientResult } from '@/types'

const vuetify = createVuetify({ components, directives })

function ing(overrides: Partial<IngredientResult> = {}): IngredientResult {
  return {
    id: 'clean_torstol',
    name: 'Torstol',
    kind: 'herb_clean',
    totalNeeded: 1,
    rawQty: 1,
    currentlyHave: 0,
    stillNeeded: 1,
    tradeable: true,
    ...overrides,
  }
}

function makeResult(overrides: Partial<CalculationResult>): CalculationResult {
  return { targets: [], ingredients: [], steps: [], shortfalls: [], achievability: [], ...overrides }
}

function renderComponent(r: CalculationResult | null) {
  return render(ResultsTable, {
    props: { result: r },
    global: { plugins: [vuetify] },
  })
}

describe('ResultsTable', () => {
  test('shows placeholder when result is null', () => {
    renderComponent(null)
    expect(screen.getByText(/add at least one target potion/i)).toBeInTheDocument()
  })

  test('shows all-covered alert when no ingredients needed', () => {
    renderComponent(makeResult({ targets: [{ name: 'Overload', qty: 1 }] }))
    expect(screen.getByText(/your supplies cover it all/i)).toBeInTheDocument()
  })

  test('renders table headers when ingredients are present', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      ingredients: [ing()],
    }))
    expect(screen.getByText('Total Needed')).toBeInTheDocument()
    expect(screen.getByText('Still Need')).toBeInTheDocument()
  })

  test('shows ingredient name in table', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      ingredients: [ing({ name: 'Torstol', totalNeeded: 5 })],
    }))
    expect(screen.getByText('Torstol')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('shows dash for fully-covered ingredient', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      ingredients: [ing({ totalNeeded: 1, currentlyHave: 5, stillNeeded: 0 })],
    }))
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  test('shows deficit amount for uncovered ingredient', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      ingredients: [ing({ totalNeeded: 10, currentlyHave: 3, stillNeeded: 7 })],
    }))
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  test('shows multiple targets in subtitle', () => {
    renderComponent(makeResult({
      targets: [
        { name: 'Overload', qty: 5 },
        { name: 'Saradomin brew', qty: 100 },
      ],
      ingredients: [ing()],
    }))
    expect(screen.getByText(/5.*Overload/)).toBeInTheDocument()
    expect(screen.getByText(/100.*Saradomin brew/)).toBeInTheDocument()
  })

  test('groups ingredients by kind', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      ingredients: [
        ing({ id: 'clean_torstol', name: 'Torstol', kind: 'herb_clean' }),
        ing({ id: 'eye_of_newt', name: 'Eye of newt', kind: 'secondary' }),
      ],
    }))
    expect(screen.getByText('Herbs')).toBeInTheDocument()
    expect(screen.getByText('Secondaries')).toBeInTheDocument()
  })
})
