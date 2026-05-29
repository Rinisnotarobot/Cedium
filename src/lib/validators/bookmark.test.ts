import { describe, test, expect } from 'vitest'
import {
  bookmarkArticleSchema,
  checkBookmarkStatusSchema,
  checkMultipleBookmarkStatusSchema,
} from './bookmark'

describe('bookmarkArticleSchema', () => {
  test('accepts valid articleId', () => {
    const result = bookmarkArticleSchema.safeParse({ articleId: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty articleId', () => {
    const result = bookmarkArticleSchema.safeParse({ articleId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })

  test('rejects articleId over 50 characters', () => {
    const result = bookmarkArticleSchema.safeParse({ articleId: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID格式无效')
    }
  })
})

describe('checkBookmarkStatusSchema', () => {
  test('accepts valid articleId', () => {
    const result = checkBookmarkStatusSchema.safeParse({ articleId: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty articleId', () => {
    const result = checkBookmarkStatusSchema.safeParse({ articleId: '' })
    expect(result.success).toBe(false)
  })

  test('rejects articleId over 50 characters', () => {
    const result = checkBookmarkStatusSchema.safeParse({ articleId: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID格式无效')
    }
  })
})

describe('checkMultipleBookmarkStatusSchema', () => {
  test('accepts valid articleIds array', () => {
    const result = checkMultipleBookmarkStatusSchema.safeParse({
      articleIds: ['id1', 'id2', 'id3'],
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty array', () => {
    const result = checkMultipleBookmarkStatusSchema.safeParse({
      articleIds: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects array over 100 items', () => {
    const result = checkMultipleBookmarkStatusSchema.safeParse({
      articleIds: Array(101).fill('id'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('最多查询100篇文章状态')
    }
  })
})