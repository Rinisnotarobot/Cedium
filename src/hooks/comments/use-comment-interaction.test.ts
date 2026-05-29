import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@/test/utils/test-utils'
import { useCommentInteraction } from './use-comment-interaction'
import type { Comment } from '#/types/comment'

// Mock comment data
const createMockComment = (overrides?: Partial<Comment>): Comment => ({
  id: 'comment-1',
  userId: 'user-1',
  content: 'Test comment content',
  articleId: 'article-1',
  parentId: null,
  likeCount: 5,
  isLiked: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  user: {
    id: 'user-1',
    name: 'Test User',
    image: null,
  },
  replies: [],
  ...overrides,
})

describe('useCommentInteraction', () => {
  const mockCallbacks = {
    onLike: vi.fn(),
    onUnlike: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    mockCallbacks.onLike.mockClear()
    mockCallbacks.onUnlike.mockClear()
    mockCallbacks.onDelete.mockClear()
  })

  describe('permissions', () => {
    test('canEdit is true when currentUserId matches comment.userId', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canEdit).toBe(true)
    })

    test('canEdit is false when currentUserId does not match', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-2',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canEdit).toBe(false)
    })

    test('canEdit is false when currentUserId is null', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: null,
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canEdit).toBe(false)
    })

    test('canDelete is true for comment owner', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-2',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canDelete).toBe(true)
    })

    test('canDelete is true for article author', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'author-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canDelete).toBe(true)
    })

    test('canDelete is false for other users', () => {
      const comment = createMockComment({ userId: 'user-1' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-3',
          articleAuthorId: 'author-2',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.canDelete).toBe(false)
    })

    test('isArticleAuthor matches currentUserId === articleAuthorId', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'author-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.permission.isArticleAuthor).toBe(true)
    })
  })

  describe('edit mode', () => {
    test('startEdit sets isEditing to true', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.state.isEditing).toBe(false)

      act(() => {
        result.current.actions.startEdit()
      })

      expect(result.current.state.isEditing).toBe(true)
    })

    test('startEdit closes isReplying', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startReply()
      })
      expect(result.current.state.isReplying).toBe(true)

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.isReplying).toBe(false)
      expect(result.current.state.isEditing).toBe(true)
    })

    test('startEdit closes dropdownOpen', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.toggleDropdown()
      })
      expect(result.current.state.dropdownOpen).toBe(true)

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.dropdownOpen).toBe(false)
    })

    test('cancelEdit sets isEditing to false', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.isEditing).toBe(true)

      act(() => {
        result.current.actions.cancelEdit()
      })
      expect(result.current.state.isEditing).toBe(false)
    })
  })

  describe('reply mode', () => {
    test('startReply sets isReplying to true', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.state.isReplying).toBe(false)

      act(() => {
        result.current.actions.startReply()
      })

      expect(result.current.state.isReplying).toBe(true)
    })

    test('startReply closes isEditing', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.isEditing).toBe(true)

      act(() => {
        result.current.actions.startReply()
      })
      expect(result.current.state.isEditing).toBe(false)
      expect(result.current.state.isReplying).toBe(true)
    })

    test('cancelReply sets isReplying to false', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startReply()
      })
      expect(result.current.state.isReplying).toBe(true)

      act(() => {
        result.current.actions.cancelReply()
      })
      expect(result.current.state.isReplying).toBe(false)
    })
  })

  describe('dropdown', () => {
    test('toggleDropdown toggles dropdownOpen', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      expect(result.current.state.dropdownOpen).toBe(false)

      act(() => {
        result.current.actions.toggleDropdown()
      })
      expect(result.current.state.dropdownOpen).toBe(true)

      act(() => {
        result.current.actions.toggleDropdown()
      })
      expect(result.current.state.dropdownOpen).toBe(false)
    })

    test('setDropdownOpen sets specific value', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.setDropdownOpen(true)
      })
      expect(result.current.state.dropdownOpen).toBe(true)

      act(() => {
        result.current.actions.setDropdownOpen(false)
      })
      expect(result.current.state.dropdownOpen).toBe(false)
    })
  })

  describe('handleToggleLike', () => {
    test('calls onLike when comment.isLiked is false', () => {
      const comment = createMockComment({ isLiked: false })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.handleToggleLike()
      })

      expect(mockCallbacks.onLike).toHaveBeenCalledWith('comment-1')
      expect(mockCallbacks.onUnlike).not.toHaveBeenCalled()
    })

    test('calls onUnlike when comment.isLiked is true', () => {
      const comment = createMockComment({ isLiked: true })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.handleToggleLike()
      })

      expect(mockCallbacks.onUnlike).toHaveBeenCalledWith('comment-1')
      expect(mockCallbacks.onLike).not.toHaveBeenCalled()
    })

    test('passes correct commentId to callbacks', () => {
      const comment = createMockComment({ id: 'custom-comment-id' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.handleToggleLike()
      })

      expect(mockCallbacks.onLike).toHaveBeenCalledWith('custom-comment-id')
    })
  })

  describe('handleDelete', () => {
    test('calls onDelete with correct commentId', () => {
      const comment = createMockComment({ id: 'delete-test-id' })
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.handleDelete()
      })

      expect(mockCallbacks.onDelete).toHaveBeenCalledWith('delete-test-id')
    })

    test('closes dropdown after delete', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.setDropdownOpen(true)
      })
      expect(result.current.state.dropdownOpen).toBe(true)

      act(() => {
        result.current.actions.handleDelete()
      })
      expect(result.current.state.dropdownOpen).toBe(false)
    })
  })

  describe('state isolation', () => {
    test('edit and reply modes are mutually exclusive', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.isEditing).toBe(true)
      expect(result.current.state.isReplying).toBe(false)

      act(() => {
        result.current.actions.startReply()
      })
      expect(result.current.state.isEditing).toBe(false)
      expect(result.current.state.isReplying).toBe(true)

      act(() => {
        result.current.actions.startEdit()
      })
      expect(result.current.state.isEditing).toBe(true)
      expect(result.current.state.isReplying).toBe(false)
    })

    test('multiple startEdit calls keep isEditing true', () => {
      const comment = createMockComment()
      const { result } = renderHook(() =>
        useCommentInteraction({
          comment,
          currentUserId: 'user-1',
          articleAuthorId: 'author-1',
          ...mockCallbacks,
        })
      )

      act(() => {
        result.current.actions.startEdit()
      })
      act(() => {
        result.current.actions.startEdit()
      })

      expect(result.current.state.isEditing).toBe(true)
    })
  })
})