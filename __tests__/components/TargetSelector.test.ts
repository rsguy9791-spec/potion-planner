import { render, screen, fireEvent } from '@testing-library/vue'
import TargetList from '@/components/TargetList.vue'
import { RECIPES } from '@/data/recipes'
import type { Recipe, TargetPotion } from '@/types'
import { vuetifyStubs } from '../utils/stubs'

const allTargets: Recipe[] = RECIPES.filter(r =>
  r.category === 'overload' ||
  r.category === 'combination' ||
  r.category === 'bombs' ||
  r.category === 'extreme' ||
  r.category === 'renewals' || 
  r.category === 'powerbursts'
)

const emptyTarget: TargetPotion = { potionId: '', qty: 1 }

function renderComponent(overrides: Partial<{
  targets: TargetPotion[]
  availableTargets: Recipe[]
}> = {}) {
  return render(TargetList, {
    props: {
      herbloreLevel: 99,
      targets: [emptyTarget],
      availableTargets: allTargets,
      ...overrides,
    },
    global: { stubs: vuetifyStubs },
  })
}

describe('TargetList', () => {
  test('renders a potion select and qty input', () => {
    renderComponent()
    expect(screen.getByLabelText('Potion')).toBeInTheDocument()
    expect(screen.getByLabelText('Qty')).toBeInTheDocument()
  })

  test('renders an Add button', () => {
    renderComponent()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  test('emits add when Add button clicked', async () => {
    const { emitted } = renderComponent()
    await fireEvent.click(screen.getByText('Add'))
    expect(emitted()['add']).toBeDefined()
  })

  test('emits remove when close button clicked', async () => {
    const { emitted } = renderComponent({
      targets: [
        { potionId: 'overload', qty: 1 },
        { potionId: 'saradomin_brew', qty: 2 },
      ],
    })
    const closeBtns = screen.getAllByRole('button', { name: /remove target/i })
    await fireEvent.click(closeBtns[0])
    expect(emitted()['remove']).toBeDefined()
    expect(emitted()['remove']?.[0]).toEqual([0])
  })

  test('emits setQty with valid number', async () => {
    const { emitted } = renderComponent()
    const qtyInput = screen.getByLabelText('Qty')
    await fireEvent.update(qtyInput, '50')
    expect(emitted()['setQty']).toBeDefined()
    expect(emitted()['setQty']?.[0]).toEqual([0, 50])
  })

  test('does not emit setQty for 0', async () => {
    const { emitted } = renderComponent()
    const qtyInput = screen.getByLabelText('Qty')
    await fireEvent.update(qtyInput, '0')
    expect(emitted()['setQty']).toBeUndefined()
  })

  test('shows multiple target rows', () => {
    renderComponent({
      targets: [
        { potionId: 'overload', qty: 1 },
        { potionId: 'saradomin_brew', qty: 2 },
      ],
    })
    expect(screen.getAllByLabelText('Potion')).toHaveLength(2)
    expect(screen.getAllByLabelText('Qty')).toHaveLength(2)
  })

  test('emits toggleCollapse when collapse button clicked', async () => {
    const { emitted } = renderComponent()
    const collapseBtn = screen.getByRole('button', { name: /collapse targets/i })
    await fireEvent.click(collapseBtn)
    expect(emitted()['toggleCollapse']).toBeDefined()
  })

  test('filters available targets by level', () => {
    const level96Targets = RECIPES.filter(r =>
      (r.category === 'overload' ||
        r.category === 'combination' ||
        r.category === 'bombs' ||
        r.category === 'extreme' ||
        r.category === 'renewals' || 
        r.category === 'powerbursts') &&
      r.levelRequired <= 96 &&
      (!r.recipeGroup || r.id.endsWith('_103'))
    )
    renderComponent({ availableTargets: level96Targets })
    expect(screen.queryByText('Bombs')).toBeNull()
  })
})
