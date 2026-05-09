import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../context/ToastContext'

function Trigger({ message, type }) {
  const { showToast } = useToast()
  return (
    <button type="button" onClick={() => showToast(message, type)}>
      fire
    </button>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a success toast with the message and check icon', () => {
    render(
      <ToastProvider>
        <Trigger message="all good" type="success" />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('fire').click()
    })
    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('all good')
    expect(toast).toHaveTextContent('✅')
    expect(toast.className).toMatch(/bg-\[#22c55e\]/)
  })

  it('renders an error toast with red styling', () => {
    render(
      <ToastProvider>
        <Trigger message="bad" type="error" />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('fire').click()
    })
    const toast = screen.getByRole('alert')
    expect(toast.className).toMatch(/bg-red-600/)
    expect(toast).toHaveTextContent('❌')
  })

  it('renders an info toast with yellow styling', () => {
    render(
      <ToastProvider>
        <Trigger message="hint" type="info" />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('fire').click()
    })
    const toast = screen.getByRole('alert')
    expect(toast.className).toMatch(/bg-yellow-600/)
    expect(toast).toHaveTextContent('ℹ️')
  })

  it('dismisses when the close button is tapped', () => {
    render(
      <ToastProvider>
        <Trigger message="bye" type="info" />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('fire').click()
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => {
      screen.getByLabelText('Dismiss').click()
      vi.advanceTimersByTime(500)
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('auto-dismisses after 3 seconds', () => {
    render(
      <ToastProvider>
        <Trigger message="time" type="info" />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('fire').click()
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
