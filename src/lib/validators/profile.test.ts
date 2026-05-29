import { describe, test, expect } from 'vitest'
import { profileSchema } from './profile'

describe('profileSchema', () => {
  test('accepts valid profile data', () => {
    const result = profileSchema.safeParse({
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      pronouns: 'they',
    })
    expect(result.success).toBe(true)
  })

  test('accepts empty image', () => {
    const result = profileSchema.safeParse({
      name: 'Test User',
      image: '',
    })
    expect(result.success).toBe(true)
  })

  test('rejects name shorter than 2 characters', () => {
    const result = profileSchema.safeParse({
      name: 'T',
      image: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('姓名至少需要2个字符')
    }
  })

  test('rejects name over 50 characters', () => {
    const result = profileSchema.safeParse({
      name: 'a'.repeat(51),
      image: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('姓名不能超过50个字符')
    }
  })

  test('rejects invalid image URL', () => {
    const result = profileSchema.safeParse({
      name: 'Test User',
      image: 'invalid-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的图片URL')
    }
  })

  test('rejects bio over 160 characters', () => {
    const result = profileSchema.safeParse({
      name: 'Test User',
      image: '',
      bio: 'a'.repeat(161),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('简介不能超过160个字符')
    }
  })

  test('rejects pronouns over 4 characters', () => {
    const result = profileSchema.safeParse({
      name: 'Test User',
      image: '',
      pronouns: 'theythem',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('代称不能超过4个字符')
    }
  })
})