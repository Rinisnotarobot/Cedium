import { describe, test, expect } from 'vitest'
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  likeCommentSchema,
  checkCommentLikeStatusSchema,
  checkMultipleCommentLikeStatusSchema,
} from './comment'

describe('createCommentSchema', () => {
  test('accepts valid comment', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'article-id',
      content: 'Test comment content',
    })
    expect(result.success).toBe(true)
  })

  test('accepts comment with parentId', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'article-id',
      content: 'Reply content',
      parentId: 'parent-comment-id',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty content', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'article-id',
      content: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论内容不能为空')
    }
  })

  test('rejects content over 1000 characters', () => {
    const result = createCommentSchema.safeParse({
      articleId: 'article-id',
      content: 'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论内容不能超过1000个字符')
    }
  })

  test('rejects empty articleId', () => {
    const result = createCommentSchema.safeParse({
      articleId: '',
      content: 'Test comment',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })
})

describe('updateCommentSchema', () => {
  test('accepts valid update', () => {
    const result = updateCommentSchema.safeParse({
      id: 'comment-id',
      content: 'Updated content',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = updateCommentSchema.safeParse({
      id: '',
      content: 'Updated content',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论ID不能为空')
    }
  })
})

describe('deleteCommentSchema', () => {
  test('accepts valid delete', () => {
    const result = deleteCommentSchema.safeParse({
      id: 'comment-id',
      articleId: 'article-id',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = deleteCommentSchema.safeParse({
      id: '',
      articleId: 'article-id',
    })
    expect(result.success).toBe(false)
  })
})

describe('getCommentsSchema', () => {
  test('applies defaults', () => {
    const result = getCommentsSchema.safeParse({ articleId: 'article-id' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(10)
      expect(result.data.sort).toBe('oldest')
    }
  })

  test('accepts valid sort options', () => {
    const result = getCommentsSchema.safeParse({
      articleId: 'article-id',
      sort: 'newest',
    })
    expect(result.success).toBe(true)
  })
})

describe('likeCommentSchema', () => {
  test('accepts valid commentId', () => {
    const result = likeCommentSchema.safeParse({ commentId: 'comment-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty commentId', () => {
    const result = likeCommentSchema.safeParse({ commentId: '' })
    expect(result.success).toBe(false)
  })

  test('rejects commentId over 50 characters', () => {
    const result = likeCommentSchema.safeParse({ commentId: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论ID格式无效')
    }
  })
})

describe('checkCommentLikeStatusSchema', () => {
  test('accepts valid commentId', () => {
    const result = checkCommentLikeStatusSchema.safeParse({ commentId: 'comment-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty commentId', () => {
    const result = checkCommentLikeStatusSchema.safeParse({ commentId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论ID不能为空')
    }
  })

  test('rejects commentId over 50 characters', () => {
    const result = checkCommentLikeStatusSchema.safeParse({ commentId: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论ID格式无效')
    }
  })
})

describe('checkMultipleCommentLikeStatusSchema', () => {
  test('accepts valid commentIds array', () => {
    const result = checkMultipleCommentLikeStatusSchema.safeParse({
      commentIds: ['id1', 'id2', 'id3'],
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty array', () => {
    const result = checkMultipleCommentLikeStatusSchema.safeParse({
      commentIds: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('评论ID列表不能为空')
    }
  })

  test('rejects array over 100 items', () => {
    const result = checkMultipleCommentLikeStatusSchema.safeParse({
      commentIds: Array(101).fill('id'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('最多查询100条评论状态')
    }
  })
})