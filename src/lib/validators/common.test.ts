import { describe, test, expect } from 'vitest'
import { articleIdSchema } from './common'

describe('articleIdSchema', () => {
  test('accepts valid articleId', () => {
    const result = articleIdSchema.safeParse('article-id')
    expect(result.success).toBe(true)
  })

  test('accepts CUID format', () => {
    const result = articleIdSchema.safeParse('clp123456789abcdefghij')
    expect(result.success).toBe(true)
  })

  test('rejects empty articleId', () => {
    const result = articleIdSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })

  test('rejects articleId over 50 characters', () => {
    const result = articleIdSchema.safeParse('a'.repeat(51))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID格式无效')
    }
  })
})