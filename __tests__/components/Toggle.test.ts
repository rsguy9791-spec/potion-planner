import { render, screen, fireEvent } from '@testing-library/vue'
import Toggle from '@/components/Toggle.vue'
import { vuetifyStubs } from '../utils/stubs'

function renderToggle(overrides: { modelValue?: boolean; label?: string; description?: string; disabled?: boolean } = {}) {
  return render(Toggle, {
    props: { modelValue: false, label: 'Test toggle', ...overrides },
    global: { stubs: vuetifyStubs },
  })
}

describe('Toggle', () => {
  test('renders label text', () => {
    renderToggle({ label: 'Scroll of Cleansing' })
    expect(screen.getByText('Scroll of Cleansing')).toBeInTheDocument()
  })

  test('renders description when provided', () => {
    renderToggle({ description: 'Saves secondary ingredients' })
    expect(screen.getByText('Saves secondary ingredients')).toBeInTheDocument()
  })

  test('does not render description when omitted', () => {
    renderToggle({ label: 'No desc' })
    expect(screen.queryByText('Saves secondary ingredients')).not.toBeInTheDocument()
  })

  test('renders checkbox unchecked when modelValue is false', () => {
    renderToggle({ modelValue: false })
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  test('renders checkbox checked when modelValue is true', () => {
    renderToggle({ modelValue: true })
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  test('emits update:modelValue true when unchecked checkbox is changed', async () => {
    const { emitted } = renderToggle({ modelValue: false })
    const checkbox = screen.getByRole('checkbox')
    await fireEvent.change(checkbox, { target: { checked: true } })
    expect(emitted()['update:modelValue']).toBeDefined()
    expect(emitted()['update:modelValue']?.[0]).toEqual([true])
  })

  test('emits update:modelValue false when checked checkbox is changed', async () => {
    const { emitted } = renderToggle({ modelValue: true })
    const checkbox = screen.getByRole('checkbox')
    await fireEvent.change(checkbox, { target: { checked: false } })
    expect(emitted()['update:modelValue']?.[0]).toEqual([false])
  })

  test('disabled prop disables the checkbox', () => {
    renderToggle({ disabled: true })
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
  })

  test('not disabled by default', () => {
    renderToggle()
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.disabled).toBe(false)
  })
})
