import { render, screen } from '@testing-library/vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResultsTable from '@/components/ResultsTable.vue'
import type { CalculationResult, CraftStep, IngredientResult } from '@/types'

const vuetify = createVuetify({ components, directives })

function ing(overrides: Partial<IngredientResult> = {}): IngredientResult {
  return {
    id: 'clean_torstol',
    name: 'Torstol',
    kind: 'herb',
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

function makeStep(overrides: Partial<CraftStep> = {}): CraftStep {
  return {
    potionId: 'super_attack',
    name: 'Super attack',
    category: 'super',
    crafts: 10,
    outputDose: 3,
    inputs: [],
    ...overrides,
  }
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
        ing({ id: 'clean_torstol', name: 'Torstol', kind: 'herb' }),
        ing({ id: 'eye_of_newt', name: 'Eye of newt', kind: 'secondary' }),
      ],
    }))
    expect(screen.getByText('Herbs')).toBeInTheDocument()
    expect(screen.getByText('Secondaries')).toBeInTheDocument()
  })
})

describe('ResultsTable — unf sub-step display', () => {
  test('shows ↳ sub-step when crafts > 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ unfStep: { crafts: 7, fromSupply: 3, herbName: 'Irit leaf' } })],
    }))
    expect(screen.getByText(/↳.*7.*Irit leaf.*unf/i)).toBeInTheDocument()
  })

  test('hides ↳ sub-step when all unfinished come from supply (crafts = 0)', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ unfStep: { crafts: 0, fromSupply: 10, herbName: 'Irit leaf' } })],
    }))
    expect(screen.queryByText(/↳/)).not.toBeInTheDocument()
  })

  test('shows unf-from-supply as an ingredient line when present in inputs', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({
        inputs: [
          { id: 'vial_of_water', name: 'Vial of water',  kind: 'vial',       qty: 7,  rawQty: 7 },
          { id: 'clean_irit',    name: 'Irit leaf',       kind: 'herb', qty: 7,  rawQty: 7 },
          { id: 'clean_irit',    name: 'Irit leaf (unf)', kind: 'unfinished_potion', qty: 3,  rawQty: 3 },
          { id: 'eye_of_newt',   name: 'Eye of newt',     kind: 'secondary',  qty: 10, rawQty: 10 },
        ],
        unfStep: { crafts: 7, fromSupply: 3, herbName: 'Irit leaf' },
      })],
    }))
    expect(screen.getByText('Irit leaf (unf)')).toBeInTheDocument()
  })

  test('no unf ingredient line when fromSupply = 0 (not injected into inputs)', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({
        inputs: [
          { id: 'vial_of_water', name: 'Vial of water', kind: 'vial',       qty: 10, rawQty: 10 },
          { id: 'clean_irit',    name: 'Irit leaf',      kind: 'herb', qty: 10, rawQty: 10 },
          { id: 'eye_of_newt',   name: 'Eye of newt',    kind: 'secondary',  qty: 10, rawQty: 10 },
        ],
        unfStep: { crafts: 10, fromSupply: 0, herbName: 'Irit leaf' },
      })],
    }))
    // No unfinished_potion entry in inputs → "Irit leaf (unf)" only appears in the ↳ sub-step div,
    // not as a standalone ingredient name in the list.
    expect(screen.queryByText('Irit leaf (unf)')).toBeNull()
  })

  test('does not show unf sub-step when unfStep is absent', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      steps: [makeStep({ potionId: 'overload', name: 'Overload', category: 'overload', unfStep: undefined })],
    }))
    expect(screen.queryByText(/unf/i)).not.toBeInTheDocument()
  })
})
