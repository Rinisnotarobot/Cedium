import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { WriteToolbar } from './write-toolbar'

describe('WriteToolbar', () => {
  describe('rendering', () => {
    test('renders Markdown indicator', () => {
      const onToggle = vi.fn()
      render(<WriteToolbar collapsed={false} onToggle={onToggle} />)

      expect(screen.getByText('Markdown')).toBeInTheDocument()
    })

    test('renders collapse button when not collapsed', () => {
      const onToggle = vi.fn()
      render(<WriteToolbar collapsed={false} onToggle={onToggle} />)

      expect(screen.getByText('收起工具栏')).toBeInTheDocument()
    })

    test('renders expand button when collapsed', () => {
      const onToggle = vi.fn()
      render(<WriteToolbar collapsed={true} onToggle={onToggle} />)

      expect(screen.getByText('展开工具栏')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    test('calls onToggle when button is clicked', () => {
      const onToggle = vi.fn()
      render(<WriteToolbar collapsed={false} onToggle={onToggle} />)

      fireEvent.click(screen.getByText('收起工具栏'))

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    test('calls onToggle when expand button is clicked', () => {
      const onToggle = vi.fn()
      render(<WriteToolbar collapsed={true} onToggle={onToggle} />)

      fireEvent.click(screen.getByText('展开工具栏'))

      expect(onToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('icons', () => {
    test('shows ChevronUp when not collapsed', () => {
      const onToggle = vi.fn()
      const { container } = render(<WriteToolbar collapsed={false} onToggle={onToggle} />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    test('shows ChevronDown when collapsed', () => {
      const onToggle = vi.fn()
      const { container } = render(<WriteToolbar collapsed={true} onToggle={onToggle} />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})