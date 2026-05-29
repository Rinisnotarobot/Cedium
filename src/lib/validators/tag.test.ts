import { describe, test, expect } from 'vitest'
import { createTagSchema, tagSlugSchema } from './tag'

describe('createTagSchema', () => {
  test('accepts valid tag name', () => {
    const result = createTagSchema.safeParse({ name: 'Test Tag' })
    expect(result.success).toBe(true)
  })

  test('accepts Chinese tag name', () => {
    const result = createTagSchema.safeParse({ name: '测试标签' })
    expect(result.success).toBe(true)
  })

  test('rejects empty name', () => {
    const result = createTagSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标签名不能为空')
    }
  })

  test('rejects name over 30 characters', () => {
    const result = createTagSchema.safeParse({ name: 'a'.repeat(31) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标签名不能超过30个字符')
    }
  })
})

describe('tagSlugSchema', () => {
  test('accepts valid slug', () => {
    const result = tagSlugSchema.safeParse({ slug: 'test-tag' })
    expect(result.success).toBe(true)
  })

  test('accepts Chinese slug', () => {
    const result = tagSlugSchema.safeParse({ slug: '测试标签' })
    expect(result.success).toBe(true)
  })

  test('rejects empty slug', () => {
    const result = tagSlugSchema.safeParse({ slug: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标签 slug 不能为空')
    }
  })
})