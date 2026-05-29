import { describe, test, expect } from 'vitest'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  newPasswordSchema,
} from './auth'

describe('loginSchema', () => {
  test('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址')
    }
  })

  test('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码至少需要8个字符')
    }
  })
})

describe('signupSchema', () => {
  test('accepts valid signup data', () => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '两次输入的密码不一致')).toBe(true)
    }
  })

  test('rejects short name', () => {
    const result = signupSchema.safeParse({
      name: 'T',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('姓名至少需要2个字符')
    }
  })

  test('rejects password over 128 characters', () => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'a'.repeat(129),
      confirmPassword: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '密码不能超过128个字符')).toBe(true)
    }
  })
})

describe('forgotPasswordSchema', () => {
  test('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  test('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  test('accepts valid passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  test('rejects password over 128 characters', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'a'.repeat(129),
      confirmPassword: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '密码不能超过128个字符')).toBe(true)
    }
  })
})

describe('changePasswordSchema', () => {
  test('accepts valid password change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects mismatched new passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  test('rejects newPassword over 128 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpassword123',
      newPassword: 'a'.repeat(129),
      confirmPassword: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '密码不能超过128个字符')).toBe(true)
    }
  })
})

describe('newPasswordSchema', () => {
  test('accepts valid passwords', () => {
    const result = newPasswordSchema.safeParse({
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects mismatched passwords', () => {
    const result = newPasswordSchema.safeParse({
      newPassword: 'newpassword123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '两次输入的密码不一致')).toBe(true)
    }
  })

  test('rejects short password', () => {
    const result = newPasswordSchema.safeParse({
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '密码至少需要8个字符')).toBe(true)
    }
  })

  test('rejects password over 128 characters', () => {
    const result = newPasswordSchema.safeParse({
      newPassword: 'a'.repeat(129),
      confirmPassword: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === '密码不能超过128个字符')).toBe(true)
    }
  })
})