import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@/test/utils/test-utils'
import { useIsBreakpoint } from './use-is-breakpoint'

describe('useIsBreakpoint', () => {
  beforeEach(() => {
    // Mock matchMedia
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  test('returns false for max mode with width above breakpoint', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    window.matchMedia = matchMediaMock

    const { result } = renderHook(() => useIsBreakpoint('max', 768))
    expect(result.current).toBe(false)
  })

  test('returns true for max mode with width below breakpoint', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    window.matchMedia = matchMediaMock

    const { result } = renderHook(() => useIsBreakpoint('max', 768))
    expect(result.current).toBe(true)
  })

  test('returns true for min mode with width above breakpoint', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    window.matchMedia = matchMediaMock

    const { result } = renderHook(() => useIsBreakpoint('min', 1024))
    expect(result.current).toBe(true)
  })

  test('uses default values when not provided', () => {
    const { result } = renderHook(() => useIsBreakpoint())
    // Default mode='max', breakpoint=768, mock returns false for max-width queries
    expect(result.current).toBe(false)
  })
})