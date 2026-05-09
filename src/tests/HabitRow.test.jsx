import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HabitRow from '../components/HabitRow'

describe('HabitRow', () => {
  it('renders the label', () => {
    render(<HabitRow label="Test habit" done={false} onToggle={() => {}} />)
    expect(screen.getByText('Test habit')).toBeInTheDocument()
  })

  it('renders subtext when provided', () => {
    render(
      <HabitRow
        label="x"
        subtext="hint here"
        done={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('hint here')).toBeInTheDocument()
  })

  it('does not render subtext when not provided', () => {
    render(<HabitRow label="x" done={false} onToggle={() => {}} />)
    expect(screen.queryByText('hint here')).toBeNull()
  })

  it('shows checkmark when done=true', () => {
    const { container } = render(
      <HabitRow label="x" done={true} onToggle={() => {}} />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show checkmark when done=false', () => {
    const { container } = render(
      <HabitRow label="x" done={false} onToggle={() => {}} />
    )
    expect(container.querySelector('svg')).toBeNull()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<HabitRow label="x" done={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('has strikethrough on the label when done=true', () => {
    render(<HabitRow label="finished" done={true} onToggle={() => {}} />)
    expect(screen.getByText('finished')).toHaveClass('line-through')
  })
})
