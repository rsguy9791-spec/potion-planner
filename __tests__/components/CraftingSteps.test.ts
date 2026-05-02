import { render, screen } from '@testing-library/vue'
import CraftingSteps from '@/components/CraftingSteps.vue'
import type { CalculationResult, CraftStep, ShortfallItem } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

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

function makeResult(overrides: Partial<CalculationResult>): CalculationResult {
  return {
    targets: [],
    ingredients: [],
    steps: [],
    shortfalls: [],
    achievability: [],
    ...overrides,
  }
}

function renderComponent(result: CalculationResult | null) {
  return render(CraftingSteps, {
    props: { result },
    global: {
      stubs: {
        ...vuetifyStubs,
        SummaryBanner: {
          props: ['shortfalls', 'achievability'],
          template: '<div class="summary-banner">{{ shortfalls.length }} shortfalls</div>',
        },
      },
    },
  })
}

describe('CraftingSteps — header', () => {
  test('always renders "Crafting Steps" heading', () => {
    renderComponent(null)
    expect(screen.getByText('Crafting Steps')).toBeInTheDocument()
  })

  test('shows placeholder text when result is null', () => {
    renderComponent(null)
    expect(screen.getByText(/add targets to see crafting steps/i)).toBeInTheDocument()
  })

  test('shows XP total in header when totalXp > 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 1750 })],
    }))
    // XP appears in both the header span and the step body — assert presence without requiring uniqueness
    expect(screen.queryAllByText(/1,750 XP/).length).toBeGreaterThan(0)
  })

  test('does not show XP total when all xpGained = 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 0 })],
    }))
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
  })
})

describe('CraftingSteps — empty steps', () => {
  test('shows covered message when result has targets but no steps', () => {
    renderComponent(makeResult({ targets: [{ name: 'Overload', qty: 1 }] }))
    expect(screen.getByText(/your supplies cover everything/i)).toBeInTheDocument()
  })
})

describe('CraftingSteps — potion steps', () => {
  test('renders numbered step label', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ name: 'Super attack', crafts: 10 })],
    }))
    expect(screen.getByText(/Make 10 × Super attack/)).toBeInTheDocument()
  })

  test('shows per-step XP when xpGained > 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 1000 })],
    }))
    expect(screen.queryAllByText(/1,000 XP/).length).toBeGreaterThan(0)
  })

  test('hides per-step XP when xpGained = 0', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ xpGained: 0 })],
    }))
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
  })

  test('shows output dose in step label', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep({ outputDose: 3 })],
    }))
    expect(screen.getByText(/3-dose/)).toBeInTheDocument()
  })

  test('renders step inputs with quantities', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 1 }],
      steps: [makeStep({
        inputs: [
          { id: 'eye_of_newt', name: 'Eye of newt', kind: 'secondary', qty: 10, rawQty: 10 },
        ],
      })],
    }))
    expect(screen.getByText('Eye of newt')).toBeInTheDocument()
  })

  test('shows scroll savings on input when qty < rawQty', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 100 }],
      steps: [makeStep({
        inputs: [
          { id: 'eye_of_newt', name: 'Eye of newt', kind: 'secondary', qty: 90, rawQty: 100 },
        ],
      })],
    }))
    expect(screen.getByText(/90/)).toBeInTheDocument()
    expect(screen.getByText(/\+10/)).toBeInTheDocument()
  })

  test('multiple steps are numbered sequentially', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 1 }],
      steps: [
        makeStep({ potionId: 'super_attack', name: 'Super attack', category: 'super' }),
        makeStep({ potionId: 'extreme_attack', name: 'Extreme attack', category: 'extreme' }),
      ],
    }))
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('2.')).toBeInTheDocument()
    expect(screen.queryAllByText(/Super attack/).length).toBeGreaterThan(0)
    expect(screen.queryAllByText(/Extreme attack/).length).toBeGreaterThan(0)
  })
})

describe('CraftingSteps — unfinished potion steps', () => {
  test('renders "Unfinished Potions" heading when unf steps present', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [
        makeStep({ potionId: 'irit_potion_unf', name: 'Irit potion (unf)', stepKind: 'unfinished', category: 'unfinished', outputDose: 1 }),
        makeStep({ potionId: 'super_attack', name: 'Super attack', stepKind: 'potion', category: 'super' }),
      ],
    }))
    expect(screen.getByText(/unfinished potions/i)).toBeInTheDocument()
  })

  test('does not render unfinished heading when no unf steps', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [makeStep()],
    }))
    expect(screen.queryByText(/unfinished potions/i)).not.toBeInTheDocument()
  })

  test('renders unfinished step name', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Super attack', qty: 10 }],
      steps: [
        makeStep({ potionId: 'irit_potion_unf', name: 'Irit potion (unf)', stepKind: 'unfinished', category: 'unfinished', outputDose: 1 }),
      ],
    }))
    expect(screen.getByText(/Irit potion \(unf\)/)).toBeInTheDocument()
  })
})

describe('CraftingSteps — summary banner', () => {
  test('renders SummaryBanner when shortfalls are present', () => {
    const shortfall: ShortfallItem = { id: 'extreme_attack', name: 'Extreme attack', qty: 1 }
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 5 }],
      shortfalls: [shortfall],
      achievability: [],
    }))
    expect(screen.getByText(/1 shortfalls/)).toBeInTheDocument()
  })

  test('does not render SummaryBanner when no shortfalls', () => {
    renderComponent(makeResult({
      targets: [{ name: 'Overload', qty: 5 }],
      shortfalls: [],
    }))
    expect(screen.queryByText(/shortfalls/)).not.toBeInTheDocument()
  })
})
