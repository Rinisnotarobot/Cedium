import { describe, test, expect } from 'vitest'
import {
  followUserSchema,
  getFollowersSchema,
  getFollowingSchema,
  checkFollowStatusSchema,
  getFollowStatsSchema,
} from './follow'

describe('followUserSchema', () => {
  test('accepts valid userId', () => {
    const result = followUserSchema.safeParse({ userId: 'user-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty userId', () => {
    const result = followUserSchema.safeParse({ userId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('用户ID不能为空')
    }
  })
})

describe('getFollowersSchema', () => {
  test('applies defaults', () => {
    const result = getFollowersSchema.safeParse({ userId: 'user-id' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('accepts valid pagination', () => {
    const result = getFollowersSchema.safeParse({
      userId: 'user-id',
      page: 2,
      limit: 30,
    })
    expect(result.success).toBe(true)
  })

  test('rejects limit over 50', () => {
    const result = getFollowersSchema.safeParse({
      userId: 'user-id',
      limit: 51,
    })
    expect(result.success).toBe(false)
  })
})

describe('getFollowingSchema', () => {
  test('applies defaults', () => {
    const result = getFollowingSchema.safeParse({ userId: 'user-id' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })
})

describe('checkFollowStatusSchema', () => {
  test('accepts valid targetUserId', () => {
    const result = checkFollowStatusSchema.safeParse({ targetUserId: 'target-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty targetUserId', () => {
    const result = checkFollowStatusSchema.safeParse({ targetUserId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('目标用户ID不能为空')
    }
  })
})

describe('getFollowStatsSchema', () => {
  test('accepts valid userId', () => {
    const result = getFollowStatsSchema.safeParse({ userId: 'user-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty userId', () => {
    const result = getFollowStatsSchema.safeParse({ userId: '' })
    expect(result.success).toBe(false)
  })
})