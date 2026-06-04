import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import { SavedStatus } from './saved-status'

describe('SavedStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    test('returns null when lastSaved is null', () => {
      const { container } = render(<SavedStatus lastSaved={null} isSaving={false} />)
      expect(container.firstChild).toBeNull()
    })

    test('renders when lastSaved is provided', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(new Date('2024-01-01T12:00:30Z'))

      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      expect(screen.getByText('刚刚')).toBeInTheDocument()
    })

    test('shows check icon', () => {
      const lastSaved = new Date()
      const { container } = render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      // SVG icon exists
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('isSaving state', () => {
    test('is hidden when isSaving is true', () => {
      const lastSaved = new Date()
      const { container } = render(<SavedStatus lastSaved={lastSaved} isSaving={true} />)

      expect(container.firstChild).toHaveClass('opacity-0')
    })

    test('is visible when isSaving is false', () => {
      const lastSaved = new Date()
      const { container } = render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      expect(container.firstChild).not.toHaveClass('opacity-0')
    })
  })

  describe('formatTime', () => {
    test('shows "刚刚" for less than 60 seconds', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(new Date('2024-01-01T12:00:30Z'))

      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      expect(screen.getByText('刚刚')).toBeInTheDocument()
    })

    test('shows minutes ago for less than 1 hour', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(new Date('2024-01-01T12:05:00Z'))

      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      expect(screen.getByText('5分钟前')).toBeInTheDocument()
    })

    test('shows time format for more than 1 hour', () => {
      // Use local time - hours are rendered based on local timezone
      const now = new Date()
      const lastSaved = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

      vi.setSystemTime(now)
      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      // Should show HH:MM format
      const hours = String(lastSaved.getHours()).padStart(2, '0')
      const minutes = String(lastSaved.getMinutes()).padStart(2, '0')
      expect(screen.getByText(`${hours}:${minutes}`)).toBeInTheDocument()
    })

    test('shows correct time at exactly 60 seconds boundary', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(new Date('2024-01-01T12:01:00Z')) // exactly 60 seconds

      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      expect(screen.getByText('1分钟前')).toBeInTheDocument()
    })

    test('shows correct time at exactly 3600 seconds boundary', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(new Date('2024-01-01T13:00:00Z')) // exactly 1 hour

      render(<SavedStatus lastSaved={lastSaved} isSaving={false} />)

      const hours = String(lastSaved.getHours()).padStart(2, '0')
      const minutes = String(lastSaved.getMinutes()).padStart(2, '0')
      expect(screen.getByText(`${hours}:${minutes}`)).toBeInTheDocument()
    })
  })
})