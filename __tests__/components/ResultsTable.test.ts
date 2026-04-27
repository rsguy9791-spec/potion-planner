import { render, screen } from '@testing-library/vue'
import ResultsTable from '@/components/ResultsTable.vue'
import type { CalculationResult, CraftStep, IngredientResult } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

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
    stepKind: 'potion',
    crafts: 10,
    outputDose: 3,
    xpGained: 0,
    inputs: [],
    ...overrides,
  }
}

function renderComponent(r: CalculationResult | null) {
  return render(ResultsTable, {
    props: { result: r },
    global: { stubs: vuetifyStubs },
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

describe('ResultsTable — step rendering', () => {
  test('renders unfinished steps in their own group', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [
        makeStep({ potionId: 'irit_potion_unf', name: 'Irit potion (unf)', stepKind: 'unfinished', category: 'unfinished', outputDose: 1 }),
        makeStep({ potionId: 'super_attack', name: 'Super attack', stepKind: 'potion', category: 'super' }),
      ],
    }))
    expect(screen.getByText(/unfinished potions/i)).toBeInTheDocument()
    expect(screen.getByText(/Irit potion \(unf\)/)).toBeInTheDocument()
  })

  test('shows XP for potion steps when xpGained > 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 1000 })],
    }))
    expect(screen.getAllByText(/XP:.*1,000/).length).toBeGreaterThanOrEqual(1)
  })

  test('hides XP line when xpGained is 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 0 })],
    }))
    expect(screen.queryByText(/XP:/)).not.toBeInTheDocument()
  })

  test('shows total XP when any potion step has xpGained > 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      steps: [
        makeStep({ potionId: 'super_attack', xpGained: 1000 }),
        makeStep({ potionId: 'overload', xpGained: 1000 }),
      ],
    }))
    expect(screen.getByText(/Total XP:/)).toBeInTheDocument()
  })

  test('does not show unfinished heading when no unf steps present', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      steps: [makeStep({ potionId: 'overload', name: 'Overload', category: 'overload', stepKind: 'potion' })],
    }))
    expect(screen.queryByText(/unfinished potions/i)).not.toBeInTheDocument()
  })
})
