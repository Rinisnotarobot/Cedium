import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useAutosave } from './use-autosave'

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('throttled save', () => {
    test('calls saveFn when shouldSave returns true', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave, throttleDelay: 1000 })
      )

      expect(result.current.isSaving).toBe(false)

      // Use manual save instead of throttled
      await act(async () => {
        await result.current.save()
      })

      expect(saveFn).toHaveBeenCalled()
    })

    test('does not call saveFn when shouldSave returns false', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(false)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      await act(async () => {
        await result.current.save()
      })

      expect(saveFn).not.toHaveBeenCalled()
    })

    test('sets isSaving during save operation', async () => {
      let resolveSave: (value: string) => void
      const saveFn = vi.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolveSave = resolve
        })
      )
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      act(() => {
        result.current.save()
      })

      // Check isSaving is true during operation
      expect(result.current.isSaving).toBe(true)

      // Resolve the promise
      await act(async () => {
        resolveSave!('article-id')
      })

      expect(result.current.isSaving).toBe(false)
    })

    test('clears isSaving after save completes', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      await act(async () => {
        await result.current.save()
      })

      expect(result.current.isSaving).toBe(false)
    })

    test('clears isSaving after save fails', async () => {
      const saveFn = vi.fn().mockRejectedValue(new Error('Save failed'))
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      await act(async () => {
        try {
          await result.current.save()
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('keyboard shortcut', () => {
    test('Ctrl+S triggers throttled save', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableKeyboardShortcut: true, throttleDelay: 100 })
      )

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { ctrlKey: true, key: 's' })
        )
      })

      // Advance timers to allow throttle to execute
      await act(async () => {
        await vi.advanceTimersByTimeAsync(150)
      })

      // saveFn should be called via throttled save
      expect(saveFn).toHaveBeenCalled()
    })

    test('Meta+S triggers throttled save (Mac)', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableKeyboardShortcut: true, throttleDelay: 100 })
      )

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { metaKey: true, key: 's' })
        )
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(150)
      })

      expect(saveFn).toHaveBeenCalled()
    })

    test('does not trigger when enableKeyboardShortcut is false', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableKeyboardShortcut: false })
      )

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { ctrlKey: true, key: 's' })
        )
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      expect(saveFn).not.toHaveBeenCalled()
    })

    test('cleanup removes event listener on unmount', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { unmount } = renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableKeyboardShortcut: true })
      )

      unmount()

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { ctrlKey: true, key: 's' })
        )
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      expect(saveFn).not.toHaveBeenCalled()
    })
  })

  describe('beforeunload warning', () => {
    test('prevents unload when shouldSave is true', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableBeforeUnload: true })
      )

      const event = new Event('beforeunload') as BeforeUnloadEvent
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      })

      act(() => {
        window.dispatchEvent(event)
      })

      expect(shouldSave).toHaveBeenCalled()
    })

    test('does not prevent unload when shouldSave is false', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(false)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableBeforeUnload: true })
      )

      const event = new Event('beforeunload') as BeforeUnloadEvent

      act(() => {
        window.dispatchEvent(event)
      })

      expect(shouldSave).toHaveBeenCalled()
    })

    test('does not attach listener when enableBeforeUnload is false', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableBeforeUnload: false })
      )

      const event = new Event('beforeunload') as BeforeUnloadEvent

      act(() => {
        window.dispatchEvent(event)
      })

      expect(shouldSave).not.toHaveBeenCalled()
    })

    test('cleanup removes event listener on unmount', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { unmount } = renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableBeforeUnload: true })
      )

      unmount()
      shouldSave.mockClear()

      const event = new Event('beforeunload') as BeforeUnloadEvent
      act(() => {
        window.dispatchEvent(event)
      })

      expect(shouldSave).not.toHaveBeenCalled()
    })
  })

  describe('visibilitychange save', () => {
    test('triggers when visibility becomes hidden', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableVisibilitySave: true })
      )

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(shouldSave).toHaveBeenCalled()
    })

    test('does not trigger when shouldSave is false', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(false)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableVisibilitySave: true })
      )

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(shouldSave).toHaveBeenCalled() // shouldSave is called but returns false
    })

    test('does not attach listener when enableVisibilitySave is false', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableVisibilitySave: false })
      )

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(shouldSave).not.toHaveBeenCalled()
    })

    test('cleanup removes event listener on unmount', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { unmount } = renderHook(() =>
        useAutosave({ saveFn, shouldSave, enableVisibilitySave: true })
      )

      unmount()
      shouldSave.mockClear()

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(shouldSave).not.toHaveBeenCalled()
    })
  })

  describe('manual save', () => {
    test('save() calls saveFn directly', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave, throttleDelay: 5000 })
      )

      await act(async () => {
        await result.current.save()
      })

      expect(saveFn).toHaveBeenCalled()
    })

    test('save() returns result from saveFn', async () => {
      const saveFn = vi.fn().mockResolvedValue('returned-article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      let saveResult: string | null = null
      await act(async () => {
        saveResult = await result.current.save()
      })

      expect(saveResult).toBe('returned-article-id')
    })

    test('save() returns null when shouldSave is false', async () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(false)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      let saveResult: string | null = 'initial'
      await act(async () => {
        saveResult = await result.current.save()
      })

      expect(saveResult).toBeNull()
      expect(saveFn).not.toHaveBeenCalled()
    })

    test('save() sets isSaving state', async () => {
      let resolveSave: (value: string) => void
      const saveFn = vi.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolveSave = resolve
        })
      )
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      act(() => {
        result.current.save()
      })

      expect(result.current.isSaving).toBe(true)

      await act(async () => {
        resolveSave!('id')
      })

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('cancel', () => {
    test('cancel() is callable', () => {
      const saveFn = vi.fn().mockResolvedValue('article-id')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result } = renderHook(() =>
        useAutosave({ saveFn, shouldSave })
      )

      expect(result.current.cancel).toBeDefined()
      expect(typeof result.current.cancel).toBe('function')
    })
  })

  describe('refs sync', () => {
    test('saveFn updates correctly on rerender', async () => {
      const saveFn1 = vi.fn().mockResolvedValue('id-1')
      const saveFn2 = vi.fn().mockResolvedValue('id-2')
      const shouldSave = vi.fn().mockReturnValue(true)

      const { result, rerender } = renderHook(
        ({ saveFn }) => useAutosave({ saveFn, shouldSave }),
        { initialProps: { saveFn: saveFn1 } }
      )

      rerender({ saveFn: saveFn2 })

      await act(async () => {
        await result.current.save()
      })

      expect(saveFn2).toHaveBeenCalled()
      expect(saveFn1).not.toHaveBeenCalled()
    })

    test('shouldSave updates correctly on rerender', async () => {
      const saveFn = vi.fn().mockResolvedValue('id')
      const shouldSave1 = vi.fn().mockReturnValue(true)
      const shouldSave2 = vi.fn().mockReturnValue(false)

      const { result, rerender } = renderHook(
        ({ shouldSave }) => useAutosave({ saveFn, shouldSave }),
        { initialProps: { shouldSave: shouldSave1 } }
      )

      rerender({ shouldSave: shouldSave2 })

      await act(async () => {
        await result.current.save()
      })

      expect(saveFn).not.toHaveBeenCalled()
    })
  })

  describe('default values', () => {
    test('enableKeyboardShortcut defaults to true', async () => {
      const saveFn = vi.fn().mockResolvedValue('id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() => useAutosave({ saveFn, shouldSave, throttleDelay: 100 }))

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { ctrlKey: true, key: 's' })
        )
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(150)
      })

      expect(saveFn).toHaveBeenCalled()
    })

    test('enableBeforeUnload defaults to true', () => {
      const saveFn = vi.fn().mockResolvedValue('id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() => useAutosave({ saveFn, shouldSave }))

      const event = new Event('beforeunload') as BeforeUnloadEvent

      act(() => {
        window.dispatchEvent(event)
      })

      expect(shouldSave).toHaveBeenCalled()
    })

    test('enableVisibilitySave defaults to true', () => {
      const saveFn = vi.fn().mockResolvedValue('id')
      const shouldSave = vi.fn().mockReturnValue(true)

      renderHook(() => useAutosave({ saveFn, shouldSave }))

      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(shouldSave).toHaveBeenCalled()
    })
  })
})