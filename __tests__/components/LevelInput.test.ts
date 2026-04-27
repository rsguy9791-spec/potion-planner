import { render, screen, fireEvent } from '@testing-library/vue'
import LevelInput from '@/components/LevelInput.vue'
import { vuetifyStubs } from '../utils/stubs'

function renderComponent(modelValue = 99) {
  return render(LevelInput, {
    props: { modelValue },
    global: { stubs: vuetifyStubs },
  })
}

describe('LevelInput', () => {
  test('renders a number input', () => {
    renderComponent()
    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
  })

  test('displays the current model value', () => {
    renderComponent(96)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('96')
  })

  test('has label "Herblore level"', () => {
    renderComponent()
    expect(screen.getByLabelText('Herblore level')).toBeInTheDocument()
  })

  test('emits update:modelValue with a valid level', async () => {
    const { emitted } = renderComponent(99)
    const input = screen.getByRole('spinbutton')
    await fireEvent.update(input, '106')
    const events = emitted()['update:modelValue']
    expect(events).toBeDefined()
    expect(events?.[0]).toEqual([106])
  })

  test('does not emit for out-of-range value (>120)', async () => {
    const { emitted } = renderComponent(99)
    const input = screen.getByRole('spinbutton')
    await fireEvent.update(input, '999')
    expect(emitted()['update:modelValue']).toBeUndefined()
  })

  test('does not emit for level 0', async () => {
    const { emitted } = renderComponent(99)
    const input = screen.getByRole('spinbutton')
    await fireEvent.update(input, '0')
    expect(emitted()['update:modelValue']).toBeUndefined()
  })

  test('emits level 120 (maximum)', async () => {
    const { emitted } = renderComponent(99)
    const input = screen.getByRole('spinbutton')
    await fireEvent.update(input, '120')
    expect(emitted()['update:modelValue']?.[0]).toEqual([120])
  })

  test('emits level 1 (minimum)', async () => {
    const { emitted } = renderComponent(99)
    const input = screen.getByRole('spinbutton')
    await fireEvent.update(input, '1')
    expect(emitted()['update:modelValue']?.[0]).toEqual([1])
  })
})
