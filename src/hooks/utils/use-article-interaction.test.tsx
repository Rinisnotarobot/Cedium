import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useArticleInteraction } from './use-article-interaction'
import { createTestQueryClient } from '@/test/utils/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'

// Mock all external dependencies
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockSession: { data: { user: { id: string } } | null } = { data: null }

vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockSession,
  },
}))

vi.mock('#/hooks/queries', () => ({
  useBookmarkStatus: (_articleId: string, options?: { enabled?: boolean }) => ({
    data: options?.enabled ? { isBookmarked: false } : undefined,
  }),
  useLikeStatus: (_articleId: string, options?: { enabled?: boolean }) => ({
    data: options?.enabled ? { isLiked: false } : undefined,
  }),
}))

const mockMutations = {
  bookmark: { mutate: vi.fn(), isPending: false },
  unbookmark: { mutate: vi.fn(), isPending: false },
  like: { mutate: vi.fn(), isPending: false },
  unlike: { mutate: vi.fn(), isPending: false },
}

vi.mock('#/hooks/mutations', () => ({
  useBookmarkArticle: () => mockMutations.bookmark,
  useUnbookmarkArticle: () => mockMutations.unbookmark,
  useLikeArticle: () => mockMutations.like,
  useUnlikeArticle: () => mockMutations.unlike,
}))

// Wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient()
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useArticleInteraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.data = null
    mockMutations.bookmark.isPending = false
    mockMutations.unbookmark.isPending = false
    mockMutations.like.isPending = false
    mockMutations.unlike.isPending = false
  })

  describe('state initialization', () => {
    test('uses initialBookmarked from props (skips queries)', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: true,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isBookmarked).toBe(true)
    })

    test('uses initialLiked from props (skips queries)', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialLiked: true,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isLiked).toBe(true)
    })

    test('queries when initial props not provided', () => {
      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      // When no initial props, defaults to false (from mocked query)
      expect(result.current.state.isBookmarked).toBe(false)
      expect(result.current.state.isLiked).toBe(false)
    })

    test('falls back to false when query returns undefined', () => {
      // Top-level mock already handles this scenario
      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      // When queries return undefined (from initial mock), defaults to false
      expect(result.current.state.isBookmarked).toBe(false)
      expect(result.current.state.isLiked).toBe(false)
    })
  })

  describe('login verification', () => {
    test('navigates to login when unauthenticated user toggles bookmark', () => {
      mockSession.data = null // No session

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.actions.toggleBookmark(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
      expect(mockMutations.bookmark.mutate).not.toHaveBeenCalled()
    })

    test('navigates to login when unauthenticated user toggles like', () => {
      mockSession.data = null

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.actions.toggleLike(mockEvent)
      })

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
      expect(mockMutations.like.mutate).not.toHaveBeenCalled()
    })

    test('does not navigate when user is authenticated', () => {
      mockSession.data = { user: { id: 'user-1' } }

      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: false,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleBookmark()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Mutation calls', () => {
    beforeEach(() => {
      mockSession.data = { user: { id: 'user-1' } }
    })

    test('toggleBookmark calls bookmarkArticle when not bookmarked', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: false,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleBookmark()
      })

      expect(mockMutations.bookmark.mutate).toHaveBeenCalledWith('article-1')
      expect(mockMutations.unbookmark.mutate).not.toHaveBeenCalled()
    })

    test('toggleBookmark calls unbookmarkArticle when already bookmarked', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: true,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleBookmark()
      })

      expect(mockMutations.unbookmark.mutate).toHaveBeenCalledWith('article-1')
      expect(mockMutations.bookmark.mutate).not.toHaveBeenCalled()
    })

    test('toggleLike calls likeArticle when not liked', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialLiked: false,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleLike()
      })

      expect(mockMutations.like.mutate).toHaveBeenCalledWith('article-1')
      expect(mockMutations.unlike.mutate).not.toHaveBeenCalled()
    })

    test('toggleLike calls unlikeArticle when already liked', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialLiked: true,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleLike()
      })

      expect(mockMutations.unlike.mutate).toHaveBeenCalledWith('article-1')
      expect(mockMutations.like.mutate).not.toHaveBeenCalled()
    })

    test('uses correct articleId in mutation calls', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'custom-article-id',
            initialLiked: false,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleLike()
      })

      expect(mockMutations.like.mutate).toHaveBeenCalledWith('custom-article-id')
    })
  })

  describe('event handling', () => {
    test('prevents default and stops propagation', () => {
      mockSession.data = { user: { id: 'user-1' } }

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.actions.toggleBookmark(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    test('works without event parameter', () => {
      mockSession.data = { user: { id: 'user-1' } }

      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: false,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.actions.toggleBookmark()
      })

      expect(mockMutations.bookmark.mutate).toHaveBeenCalled()
    })

    test('works with minimal event object', () => {
      mockSession.data = { user: { id: 'user-1' } }

      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: false,
          }),
        { wrapper: createWrapper() }
      )

      // Minimal event with noop methods
      const minimalEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.actions.toggleBookmark(minimalEvent)
      })

      expect(minimalEvent.preventDefault).toHaveBeenCalled()
      expect(minimalEvent.stopPropagation).toHaveBeenCalled()
      expect(mockMutations.bookmark.mutate).toHaveBeenCalled()
    })
  })

  describe('isPending aggregation', () => {
    test('isPending is false when all mutations are idle', () => {
      mockMutations.bookmark.isPending = false
      mockMutations.unbookmark.isPending = false
      mockMutations.like.isPending = false
      mockMutations.unlike.isPending = false

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isPending).toBe(false)
    })

    test('isPending is true when bookmark mutation is pending', () => {
      mockMutations.bookmark.isPending = true

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isPending).toBe(true)
    })

    test('isPending is true when like mutation is pending', () => {
      mockMutations.like.isPending = true

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isPending).toBe(true)
    })

    test('isPending is true when multiple mutations are pending', () => {
      mockMutations.bookmark.isPending = true
      mockMutations.like.isPending = true

      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isPending).toBe(true)
    })
  })

  describe('state priority', () => {
    test('initialBookmarked takes priority over query result', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialBookmarked: true,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isBookmarked).toBe(true)
    })

    test('initialLiked takes priority over query result', () => {
      const { result } = renderHook(
        () =>
          useArticleInteraction({
            articleId: 'article-1',
            initialLiked: true,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isLiked).toBe(true)
    })

    test('defaults to false when neither initial nor query provides value', () => {
      // Top-level mock returns undefined for disabled queries
      const { result } = renderHook(
        () => useArticleInteraction({ articleId: 'article-1' }),
        { wrapper: createWrapper() }
      )

      expect(result.current.state.isBookmarked).toBe(false)
      expect(result.current.state.isLiked).toBe(false)
    })
  })
})