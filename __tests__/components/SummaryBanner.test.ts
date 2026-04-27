import { render, screen } from '@testing-library/vue'
import SummaryBanner from '@/components/SummaryBanner.vue'
import type { ShortfallItem, TargetAchievability } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

function renderBanner(
  shortfalls: ShortfallItem[] = [],
  achievability: TargetAchievability[] = [],
) {
  return render(SummaryBanner, {
    props: { shortfalls, achievability },
    global: { stubs: vuetifyStubs },
  })
}

describe('SummaryBanner', () => {
  test('renders nothing when there are no shortfalls', () => {
    const { container } = renderBanner([], [])
    expect(container.querySelector('.v-alert')).toBeNull()
  })

  test('renders a warning alert when shortfalls are present', () => {
    renderBanner([{ id: 'extreme_attack', name: 'Extreme attack', qty: 5 }])
    expect(screen.getByText(/cannot fully complete target/i)).toBeInTheDocument()
  })

  test('lists each missing untradeable item', () => {
    renderBanner([
      { id: 'extreme_attack', name: 'Extreme attack', qty: 3 },
      { id: 'extreme_strength', name: 'Extreme strength', qty: 2 },
    ])
    expect(screen.getByText(/extreme attack/i)).toBeInTheDocument()
    expect(screen.getByText(/extreme strength/i)).toBeInTheDocument()
  })

  test('uses singular "target" for one achievability entry', () => {
    renderBanner(
      [{ id: 'extreme_attack', name: 'Extreme attack', qty: 1 }],
      [{ potionId: 'overload', name: 'Overload', requested: 5, possible: 2 }],
    )
    expect(screen.getByText(/cannot fully complete target$/i)).toBeInTheDocument()
  })

  test('uses plural "targets" for multiple achievability entries', () => {
    renderBanner(
      [{ id: 'extreme_attack', name: 'Extreme attack', qty: 1 }],
      [
        { potionId: 'overload', name: 'Overload', requested: 5, possible: 2 },
        { potionId: 'holy_overload', name: 'Holy overload', requested: 3, possible: 0 },
      ],
    )
    expect(screen.getByText(/cannot fully complete targets$/i)).toBeInTheDocument()
  })

  test('shows maximum achievable quantities when provided', () => {
    renderBanner(
      [{ id: 'extreme_attack', name: 'Extreme attack', qty: 3 }],
      [{ potionId: 'overload', name: 'Overload', requested: 10, possible: 4 }],
    )
    expect(screen.getByText(/maximum achievable/i)).toBeInTheDocument()
    expect(screen.getByText(/overload.*4.*10/i)).toBeInTheDocument()
  })

  test('does not show achievability section when empty', () => {
    renderBanner([{ id: 'extreme_attack', name: 'Extreme attack', qty: 1 }], [])
    expect(screen.queryByText(/maximum achievable/i)).toBeNull()
  })
})
