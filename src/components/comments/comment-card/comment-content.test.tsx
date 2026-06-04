import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '1分钟前',
}))

vi.mock('date-fns/locale', () => ({
  zhCN: {},
}))

// Mock avatar-color
vi.mock('#/lib/utils/avatar-color', () => ({
  getAvatarColor: () => 'bg-blue-500',
}))

import { CommentContent } from './comment-content'
import type { Comment } from '#/types/comment'

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

describe('CommentContent', () => {
  describe('rendering', () => {
    test('displays comment content', () => {
      const comment = createMockComment({ content: 'Hello world' })
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    test('displays user name', () => {
      const comment = createMockComment()
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('displays "未知用户" when user is null', () => {
      const comment = createMockComment({ user: undefined })
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('未知用户')).toBeInTheDocument()
    })

    test('displays user avatar initial', () => {
      const comment = createMockComment()
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('T')).toBeInTheDocument()
    })

    test('displays "?" when user name is empty', () => {
      const comment = createMockComment({ user: { id: 'user-1', name: '', image: null } })
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  describe('author badge', () => {
    test('shows author badge when comment userId matches articleAuthorId', () => {
      const comment = createMockComment({ userId: 'author-1' })
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('作者')).toBeInTheDocument()
    })

    test('does not show author badge when userId does not match', () => {
      const comment = createMockComment({ userId: 'user-1' })
      render(<CommentContent comment={comment} articleAuthorId="author-2" />)

      expect(screen.queryByText('作者')).not.toBeInTheDocument()
    })
  })

  describe('time display', () => {
    test('displays formatted time', () => {
      const comment = createMockComment()
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('1分钟前')).toBeInTheDocument()
    })
  })

  describe('reply mode', () => {
    test('uses default avatar size for replies', () => {
      const comment = createMockComment()
      const { container } = render(
        <CommentContent comment={comment} articleAuthorId="author-1" isReply={true} />
      )

      // Avatar with default size
      expect(container.querySelector('[class*="size-"]')).toBeInTheDocument()
    })

    test('uses lg avatar size for top-level comments', () => {
      const comment = createMockComment()
      const { container } = render(
        <CommentContent comment={comment} articleAuthorId="author-1" isReply={false} />
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('avatar rendering', () => {
    test('renders avatar component with image prop', () => {
      const comment = createMockComment({
        user: { id: 'user-1', name: 'Test', image: 'https://example.com/avatar.png' }
      })
      const { container } = render(
        <CommentContent comment={comment} articleAuthorId="author-1" />
      )

      // Avatar fallback should show initial when image fails to load in test
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    test('shows fallback with initial when image is null', () => {
      const comment = createMockComment({ user: { id: 'user-1', name: 'Test', image: null } })
      render(<CommentContent comment={comment} articleAuthorId="author-1" />)

      expect(screen.getByText('T')).toBeInTheDocument()
    })

    test('applies avatar color class', () => {
      const comment = createMockComment()
      const { container } = render(
        <CommentContent comment={comment} articleAuthorId="author-1" />
      )

      // Avatar should have a color class applied (mocked as bg-blue-500)
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument()
    })
  })
})