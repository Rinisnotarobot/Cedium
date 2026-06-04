import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { CommentActions } from './comment-actions'
import type { Comment } from '#/types/comment'

const createMockComment = (overrides?: Partial<Comment>): Comment => ({
  id: 'comment-1',
  userId: 'user-1',
  content: 'Test comment',
  articleId: 'article-1',
  parentId: null,
  likeCount: 5,
  isLiked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', name: 'User', image: null },
  replies: [],
  ...overrides,
})

describe('CommentActions', () => {
  const mockCallbacks = {
    onLike: vi.fn(),
    onReply: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDropdownChange: vi.fn(),
  }

  beforeEach(() => {
    mockCallbacks.onLike.mockClear()
    mockCallbacks.onReply.mockClear()
    mockCallbacks.onEdit.mockClear()
    mockCallbacks.onDelete.mockClear()
    mockCallbacks.onDropdownChange.mockClear()
  })

  describe('like button', () => {
    test('displays like count', () => {
      const comment = createMockComment({ likeCount: 10 })
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(screen.getByText('10')).toBeInTheDocument()
    })

    test('calls onLike when clicked', () => {
      const comment = createMockComment({ likeCount: 5 })
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      // Click the like button by finding it via aria-label or role
      const likeButton = screen.getByRole('button', { name: /5/ })
      fireEvent.click(likeButton)

      expect(mockCallbacks.onLike).toHaveBeenCalled()
    })

    test('shows red color when liked', () => {
      const comment = createMockComment({ isLiked: true })
      const { container } = render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(container.querySelector('.text-red-500')).toBeInTheDocument()
    })

    test('does not show red color when not liked', () => {
      const comment = createMockComment({ isLiked: false })
      const { container } = render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(container.querySelector('.text-red-500')).not.toBeInTheDocument()
    })

    test('shows filled heart icon when liked', () => {
      const comment = createMockComment({ isLiked: true })
      const { container } = render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      // Heart icon should have fill-current class when liked
      const heartIcon = container.querySelector('.fill-current')
      expect(heartIcon).toBeInTheDocument()
    })

    test('does not show filled heart when not liked', () => {
      const comment = createMockComment({ isLiked: false })
      const { container } = render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(container.querySelector('.fill-current')).not.toBeInTheDocument()
    })
  })

  describe('reply button', () => {
    test('shows reply button for top-level comments', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          isReply={false}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(screen.getByText('回复')).toBeInTheDocument()
    })

    test('hides reply button for reply comments', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          isReply={true}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(screen.queryByText('回复')).not.toBeInTheDocument()
    })

    test('calls onReply when clicked', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          isReply={false}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      fireEvent.click(screen.getByText('回复'))

      expect(mockCallbacks.onReply).toHaveBeenCalled()
    })
  })

  describe('dropdown menu', () => {
    test('shows dropdown when canEdit or canDelete is true', () => {
      const comment = createMockComment()
      const { container } = render(
        <CommentActions
          comment={comment}
          canEdit={true}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      expect(container.querySelector('button')).toBeInTheDocument()
    })

    test('hides dropdown when no permissions', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={false}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      // Only like and reply buttons visible, no dropdown trigger
      expect(screen.queryByLabelText('更多')).not.toBeInTheDocument()
    })

    test('shows dropdown when canDelete only is true', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={true}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      // Dropdown trigger should exist
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(2) // like + reply + dropdown
    })

    test('shows dropdown when both canEdit and canDelete are true', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={true}
          canDelete={true}
          dropdownOpen={false}
          {...mockCallbacks}
        />
      )

      // Both edit and delete should be available when dropdown opens
      expect(screen.getAllByRole('button').length).toBeGreaterThan(2)
    })

    test('shows edit option when canEdit is true', async () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={true}
          canDelete={false}
          dropdownOpen={true}
          {...mockCallbacks}
        />
      )

      expect(screen.getByText('编辑')).toBeInTheDocument()
    })

    test('shows delete option when canDelete is true', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={true}
          dropdownOpen={true}
          {...mockCallbacks}
        />
      )

      expect(screen.getByText('删除')).toBeInTheDocument()
    })

    test('calls onEdit when edit clicked', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={true}
          canDelete={false}
          dropdownOpen={true}
          {...mockCallbacks}
        />
      )

      fireEvent.click(screen.getByText('编辑'))

      expect(mockCallbacks.onEdit).toHaveBeenCalled()
    })

    test('calls onDelete when delete clicked', () => {
      const comment = createMockComment()
      render(
        <CommentActions
          comment={comment}
          canEdit={false}
          canDelete={true}
          dropdownOpen={true}
          {...mockCallbacks}
        />
      )

      fireEvent.click(screen.getByText('删除'))

      expect(mockCallbacks.onDelete).toHaveBeenCalled()
    })
  })
})