import { describe, test, expect } from 'vitest'
import {
  likeArticleSchema,
  checkLikeStatusSchema,
  checkMultipleLikeStatusSchema,
} from './like'

describe('likeArticleSchema', () => {
  test('accepts valid articleId', () => {
    const result = likeArticleSchema.safeParse({ articleId: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty articleId', () => {
    const result = likeArticleSchema.safeParse({ articleId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })
})

describe('checkLikeStatusSchema', () => {
  test('accepts valid articleId', () => {
    const result = checkLikeStatusSchema.safeParse({ articleId: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty articleId', () => {
    const result = checkLikeStatusSchema.safeParse({ articleId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })

  test('rejects articleId over 50 characters', () => {
    const result = checkLikeStatusSchema.safeParse({ articleId: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID格式无效')
    }
  })
})

describe('checkMultipleLikeStatusSchema', () => {
  test('accepts valid articleIds array', () => {
    const result = checkMultipleLikeStatusSchema.safeParse({
      articleIds: ['id1', 'id2', 'id3'],
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty array', () => {
    const result = checkMultipleLikeStatusSchema.safeParse({
      articleIds: [],
    })
    expect(result.success).toBe(false)
  })

  test('rejects array over 100 items', () => {
    const result = checkMultipleLikeStatusSchema.safeParse({
      articleIds: Array(101).fill('id'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('最多查询100篇文章状态')
    }
  })
})