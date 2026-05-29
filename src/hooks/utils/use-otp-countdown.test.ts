import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useOtpCountdown } from './use-otp-countdown'

describe('useOtpCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('default values', () => {
    test('initialCountdown defaults to 60', () => {
      const { result } = renderHook(() => useOtpCountdown())
      expect(result.current.countdown).toBe(0)

      act(() => {
        result.current.startCountdown()
      })
      expect(result.current.countdown).toBe(60)
    })

    test('resetOnClose defaults to false', () => {
      const { result, rerender } = renderHook(
        ({ dialogOpen }) => useOtpCountdown({ dialogOpen }),
        { initialProps: { dialogOpen: true } }
      )

      act(() => {
        result.current.startCountdown(30)
      })
      expect(result.current.countdown).toBe(30)

      rerender({ dialogOpen: false })
      expect(result.current.countdown).toBe(30)
    })

    test('countdown starts at 0', () => {
      const { result } = renderHook(() => useOtpCountdown())
      expect(result.current.countdown).toBe(0)
    })
  })

  describe('countdown logic', () => {
    test('countdown decreases by 1 each second', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(10)
      })
      expect(result.current.countdown).toBe(10)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.countdown).toBe(9)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.countdown).toBe(8)
    })

    test('timer stops when countdown reaches 0', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(2)
      })
      expect(result.current.countdown).toBe(2)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.countdown).toBe(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.countdown).toBe(0)

      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.countdown).toBe(0)
    })

    test('cleanup clears interval on unmount', () => {
      const { result, unmount } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(60)
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(5000)
      })
      // No error means interval was cleaned up
    })
  })

  describe('startCountdown', () => {
    test('starts countdown with initialCountdown by default', () => {
      const { result } = renderHook(() =>
        useOtpCountdown({ initialCountdown: 45 })
      )

      act(() => {
        result.current.startCountdown()
      })
      expect(result.current.countdown).toBe(45)
    })

    test('starts countdown with custom seconds', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(30)
      })
      expect(result.current.countdown).toBe(30)
    })

    test('can restart countdown when already running', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(60)
      })
      expect(result.current.countdown).toBe(60)

      act(() => {
        vi.advanceTimersByTime(30000)
      })
      expect(result.current.countdown).toBe(30)

      act(() => {
        result.current.startCountdown(45)
      })
      expect(result.current.countdown).toBe(45)
    })
  })

  describe('resetCountdown', () => {
    test('sets countdown to 0 immediately', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(60)
      })
      expect(result.current.countdown).toBe(60)

      act(() => {
        result.current.resetCountdown()
      })
      expect(result.current.countdown).toBe(0)
    })

    test('stops the timer', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(10)
      })

      act(() => {
        result.current.resetCountdown()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.countdown).toBe(0)
    })
  })

  describe('canResend', () => {
    test('is false when countdown > 0', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(60)
      })
      expect(result.current.canResend).toBe(false)
    })

    test('is true when countdown <= 0', () => {
      const { result } = renderHook(() => useOtpCountdown())
      expect(result.current.canResend).toBe(true)
    })

    test('becomes true after countdown finishes', () => {
      const { result } = renderHook(() => useOtpCountdown())

      act(() => {
        result.current.startCountdown(3)
      })
      expect(result.current.canResend).toBe(false)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.canResend).toBe(false)

      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(result.current.countdown).toBe(0)
      expect(result.current.canResend).toBe(true)
    })
  })

  describe('resetOnClose', () => {
    test('resets countdown when dialogOpen becomes false', () => {
      const { result, rerender } = renderHook(
        ({ dialogOpen }) => useOtpCountdown({ resetOnClose: true, dialogOpen }),
        { initialProps: { dialogOpen: true } }
      )

      act(() => {
        result.current.startCountdown(30)
      })
      expect(result.current.countdown).toBe(30)

      rerender({ dialogOpen: false })
      expect(result.current.countdown).toBe(0)
    })

    test('does not reset when resetOnClose is false', () => {
      const { result, rerender } = renderHook(
        ({ dialogOpen }) => useOtpCountdown({ resetOnClose: false, dialogOpen }),
        { initialProps: { dialogOpen: true } }
      )

      act(() => {
        result.current.startCountdown(30)
      })

      rerender({ dialogOpen: false })
      expect(result.current.countdown).toBe(30)
    })

    test('does not reset when dialogOpen is undefined', () => {
      const { result } = renderHook(() =>
        useOtpCountdown({ resetOnClose: true })
      )

      act(() => {
        result.current.startCountdown(30)
      })
      expect(result.current.countdown).toBe(30)
    })

    test('does not reset when dialogOpen stays true', () => {
      const { result, rerender } = renderHook(
        ({ dialogOpen }) => useOtpCountdown({ resetOnClose: true, dialogOpen }),
        { initialProps: { dialogOpen: true } }
      )

      act(() => {
        result.current.startCountdown(30)
      })

      rerender({ dialogOpen: true })
      expect(result.current.countdown).toBe(30)
    })
  })
})