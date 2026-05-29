import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useDraftState } from './use-draft-state'
import type { Article } from '#/types/article'

// Mock article data
const createMockArticle = (overrides?: Partial<Article>): Article => ({
  id: 'article-1',
  title: 'Test Article Title',
  slug: 'test-article-title',
  content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] }] }),
  excerpt: 'Test excerpt',
  coverImage: null,
  status: 'DRAFT',
  authorId: 'author-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-15T12:00:00Z'),
  publishedAt: null,
  likeCount: 0,
  bookmarkCount: 0,
  author: {
    id: 'author-1',
    name: 'Test Author',
    image: null,
  },
  tags: [
    { id: 'tag-1', name: 'Technology', slug: 'technology' },
    { id: 'tag-2', name: 'React', slug: 'react' },
  ],
  ...overrides,
})

describe('useDraftState', () => {
  describe('initialization', () => {
    test('initializes with empty draft for new article (no id)', () => {
      const { result } = renderHook(() => useDraftState({}))

      expect(result.current.draft.title).toBe('')
      expect(result.current.draft.excerpt).toBe('')
      expect(result.current.draft.content).toBe('')
      expect(result.current.draft.selectedTags).toEqual([])
      expect(result.current.draft.articleId).toBeNull()
      expect(result.current.draft.toolbarCollapsed).toBe(false)
      expect(result.current.lastSaved).toBeNull()
    })

    test('loads existing article when id and existingArticle provided', () => {
      const article = createMockArticle()
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.draft.title).toBe('Test Article Title')
      expect(result.current.draft.excerpt).toBe('Test excerpt')
      expect(result.current.draft.articleId).toBe('article-1')
    })

    test('parses JSON content from existing article', () => {
      const article = createMockArticle()
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      const content = result.current.draft.content
      expect(content).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] }],
      })
    })

    test('handles invalid JSON content gracefully (returns raw string)', () => {
      const article = createMockArticle({
        content: 'This is not valid JSON',
      })
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.draft.content).toBe('This is not valid JSON')
    })

    test('extracts tag slugs from existing article tags', () => {
      const article = createMockArticle()
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.draft.selectedTags).toEqual(['technology', 'react'])
    })

    test('handles article without tags', () => {
      const article = createMockArticle({ tags: [] })
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.draft.selectedTags).toEqual([])
    })

    test('sets lastSaved from existing article updatedAt', () => {
      const article = createMockArticle()
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.lastSaved).toEqual(new Date('2024-01-15T12:00:00Z'))
    })

    test('handles article without excerpt', () => {
      const article = createMockArticle({ excerpt: undefined })
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.draft.excerpt).toBe('')
    })
  })

  describe('setters', () => {
    test('setTitle updates only title field', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setTitle('New Title')
      })

      expect(result.current.draft.title).toBe('New Title')
      expect(result.current.draft.excerpt).toBe('')
      expect(result.current.draft.content).toBe('')
    })

    test('setExcerpt updates only excerpt field', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setExcerpt('New excerpt')
      })

      expect(result.current.draft.excerpt).toBe('New excerpt')
      expect(result.current.draft.title).toBe('')
    })

    test('setContent updates only content field', () => {
      const { result } = renderHook(() => useDraftState({}))

      const newContent = { type: 'doc', content: [] }
      act(() => {
        result.current.setters.setContent(newContent)
      })

      expect(result.current.draft.content).toEqual(newContent)
      expect(result.current.draft.title).toBe('')
    })

    test('setSelectedTags updates only selectedTags field', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setSelectedTags(['tag1', 'tag2'])
      })

      expect(result.current.draft.selectedTags).toEqual(['tag1', 'tag2'])
      expect(result.current.draft.title).toBe('')
    })

    test('setArticleId updates only articleId field', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setArticleId('new-article-id')
      })

      expect(result.current.draft.articleId).toBe('new-article-id')
      expect(result.current.draft.title).toBe('')
    })

    test('setToolbarCollapsed updates toolbarCollapsed independently', () => {
      const { result } = renderHook(() => useDraftState({}))

      expect(result.current.draft.toolbarCollapsed).toBe(false)

      act(() => {
        result.current.setters.setToolbarCollapsed(true)
      })

      expect(result.current.draft.toolbarCollapsed).toBe(true)
    })
  })

  describe('draftRef', () => {
    test('draftRef.current syncs with draft state', () => {
      const { result } = renderHook(() => useDraftState({}))

      expect(result.current.draftRef.current.title).toBe('')

      act(() => {
        result.current.setters.setTitle('Synced Title')
      })

      expect(result.current.draftRef.current.title).toBe('Synced Title')
    })

    test('draftRef provides latest value in async context', async () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setTitle('Async Test')
      })

      // Simulate async access
      await act(async () => {
        const draftFromRef = result.current.draftRef.current
        expect(draftFromRef.title).toBe('Async Test')
      })
    })
  })

  describe('reset', () => {
    test('reset clears all draft fields to initial', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setTitle('Title to reset')
        result.current.setters.setExcerpt('Excerpt to reset')
        result.current.setters.setSelectedTags(['tag1'])
      })

      expect(result.current.draft.title).toBe('Title to reset')

      act(() => {
        result.current.reset()
      })

      expect(result.current.draft.title).toBe('')
      expect(result.current.draft.excerpt).toBe('')
      expect(result.current.draft.selectedTags).toEqual([])
      expect(result.current.draft.articleId).toBeNull()
    })

    test('reset clears lastSaved', () => {
      const article = createMockArticle()
      const { result } = renderHook(() =>
        useDraftState({ id: 'article-1', existingArticle: article })
      )

      expect(result.current.lastSaved).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.lastSaved).toBeNull()
    })

    test('reset clears toolbarCollapsed', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setters.setToolbarCollapsed(true)
      })

      expect(result.current.draft.toolbarCollapsed).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.draft.toolbarCollapsed).toBe(false)
    })
  })

  describe('setLastSaved', () => {
    test('setLastSaved updates lastSaved state', () => {
      const { result } = renderHook(() => useDraftState({}))

      const newDate = new Date('2024-06-01T10:00:00Z')
      act(() => {
        result.current.setLastSaved(newDate)
      })

      expect(result.current.lastSaved).toEqual(newDate)
    })

    test('setLastSaved can set to null', () => {
      const { result } = renderHook(() => useDraftState({}))

      act(() => {
        result.current.setLastSaved(new Date())
      })
      expect(result.current.lastSaved).not.toBeNull()

      act(() => {
        result.current.setLastSaved(null)
      })
      expect(result.current.lastSaved).toBeNull()
    })
  })

  describe('mode switching', () => {
    test('switching from edit to new mode clears draft', () => {
      const article = createMockArticle()
      const { result, rerender } = renderHook(
        ({ id, existingArticle }) => useDraftState({ id, existingArticle }),
        { initialProps: { id: 'article-1' as string | undefined, existingArticle: article as Article | undefined } }
      )

      expect(result.current.draft.title).toBe('Test Article Title')

      rerender({ id: undefined, existingArticle: undefined })

      expect(result.current.draft.title).toBe('')
      expect(result.current.draft.articleId).toBeNull()
      expect(result.current.lastSaved).toBeNull()
    })

    test('switching from new to edit mode loads article', () => {
      const article = createMockArticle()
      const { result, rerender } = renderHook(
        ({ id, existingArticle }) => useDraftState({ id, existingArticle }),
        { initialProps: { id: undefined as string | undefined, existingArticle: undefined as Article | undefined } }
      )

      expect(result.current.draft.title).toBe('')

      rerender({ id: 'article-1' as string | undefined, existingArticle: article as Article | undefined })

      expect(result.current.draft.title).toBe('Test Article Title')
      expect(result.current.draft.articleId).toBe('article-1')
    })
  })
})