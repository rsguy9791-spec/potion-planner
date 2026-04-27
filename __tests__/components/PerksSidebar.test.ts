import { render, screen, fireEvent } from '@testing-library/vue'
import PerksSidebar from '@/components/PerksSidebar.vue'
import type { PerksConfiguration } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

function makeConfig(overrides: Partial<PerksConfiguration> = {}): PerksConfiguration {
  return { ...DEFAULT_CONFIG, ...overrides }
}

function renderSidebar(config: PerksConfiguration = makeConfig()) {
  return render(PerksSidebar, {
    props: { modelValue: true, config },
    global: { stubs: vuetifyStubs },
  })
}

describe('PerksSidebar — toggle event emissions', () => {
  test('scrollOfCleansing toggle emits update with boolean value', async () => {
    const { emitted } = renderSidebar()
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is scrollOfCleansing
    await fireEvent.change(checkboxes[0], { target: { checked: true } })
    const events = emitted()['update'] as [string, boolean | number][][]
    expect(events).toBeDefined()
    const [key, value] = events[events.length - 1]
    expect(key).toBe('scrollOfCleansing')
    expect(value).toBe(true)
  })

  test('factoryOutfit toggle emits update with correct key', async () => {
    const { emitted } = renderSidebar()
    const checkboxes = screen.getAllByRole('checkbox')
    await fireEvent.change(checkboxes[1], { target: { checked: true } })
    const events = emitted()['update'] as [string, boolean | number][][]
    const [key] = events[events.length - 1]
    expect(key).toBe('factoryOutfit')
  })

  test('perfectJujuPotion toggle emits update with correct key', async () => {
    const { emitted } = renderSidebar()
    // perfectJujuPotion is the last checkbox (after scroll, factory, mask, well, brooch)
    const checkboxes = screen.getAllByRole('checkbox')
    await fireEvent.change(checkboxes[5], { target: { checked: true } })
    const events = emitted()['update'] as [string, boolean | number][][]
    const [key] = events[events.length - 1]
    expect(key).toBe('perfectJujuPotion')
  })
})

describe('PerksSidebar — brooch disabled state', () => {
  test('brooch checkbox is disabled when portableWell is false', () => {
    renderSidebar(makeConfig({ portableWell: false }))
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    // Order: scroll(0), factory(1), mask(2), well(3), brooch(4), juju(5)
    expect(checkboxes[4].disabled).toBe(true)
  })

  test('brooch checkbox is enabled when portableWell is true', () => {
    renderSidebar(makeConfig({ portableWell: true }))
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    expect(checkboxes[4].disabled).toBe(false)
  })
})

describe('PerksSidebar — duplicate bonus summary', () => {
  test('shows no total duplicate bonus line when all off', () => {
    renderSidebar(makeConfig())
    expect(screen.queryByText(/Total duplicate bonus/)).not.toBeInTheDocument()
  })

  test('shows 5% total when mask is on', () => {
    renderSidebar(makeConfig({ modifiedBotanistMask: true }))
    expect(screen.getByText(/Total duplicate bonus: 5%/)).toBeInTheDocument()
  })

  test('shows 10% total for well+brooch', () => {
    renderSidebar(makeConfig({ portableWell: true, broochOfTheGods: true }))
    expect(screen.getByText(/Total duplicate bonus: 10%/)).toBeInTheDocument()
  })

  test('shows 15% total for mask+well+brooch', () => {
    renderSidebar(makeConfig({ modifiedBotanistMask: true, portableWell: true, broochOfTheGods: true }))
    expect(screen.getByText(/Total duplicate bonus: 15%/)).toBeInTheDocument()
  })
})

describe('PerksSidebar — XP boost summary', () => {
  test('shows no XP boost line when all boosts are zero', () => {
    renderSidebar(makeConfig())
    expect(screen.queryByText(/Total XP boost/)).not.toBeInTheDocument()
  })

  test('shows total XP boost when clan fealty is set', () => {
    renderSidebar(makeConfig({ clanFealtyPercent: 5 }))
    expect(screen.getByText(/Total XP boost: \+5%/)).toBeInTheDocument()
  })

  test('shows combined boost from multiple sources', () => {
    renderSidebar(makeConfig({ clanFealtyPercent: 3, botanistXpPercent: 6 }))
    expect(screen.getByText(/Total XP boost: \+9%/)).toBeInTheDocument()
  })

  test('shows juju combination note when perfectJujuPotion is active', () => {
    renderSidebar(makeConfig({ clanFealtyPercent: 5, perfectJujuPotion: true }))
    expect(screen.getByText(/combination potions 10%/)).toBeInTheDocument()
  })

  test('does not show XP boost line when only juju is on and numeric boosts are zero', () => {
    // totalXpBoost = clanFealty + botanist + custom — juju alone doesn't trigger the summary line
    renderSidebar(makeConfig({ perfectJujuPotion: true }))
    expect(screen.queryByText(/Total XP boost/)).not.toBeInTheDocument()
  })
})

describe('PerksSidebar — visibility', () => {
  test('does not render content when modelValue is false', () => {
    render(PerksSidebar, {
      props: { modelValue: false, config: makeConfig() },
      global: { stubs: vuetifyStubs },
    })
    expect(screen.queryByText('Bonuses')).not.toBeInTheDocument()
  })

  test('renders content when modelValue is true', () => {
    renderSidebar()
    expect(screen.getByText('Bonuses')).toBeInTheDocument()
    expect(screen.getByText('XP Boosts')).toBeInTheDocument()
  })
})
