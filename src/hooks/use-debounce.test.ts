import { describe, test, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))
    expect(result.current).toBe('test')
  })

  test('debounces value changes', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'changed', delay: 500 })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')
  })

  test('cancels previous timeout on rapid changes', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('c')
  })

  test('updates delay dynamically', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    rerender({ value: 'changed', delay: 100 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('changed')
  })

  test('works with numbers', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    )

    expect(result.current).toBe(0)

    rerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(42)
  })

  test('works with objects', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'initial' } } }
    )

    rerender({ value: { name: 'updated' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.name).toBe('updated')
  })
})