import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, '姓名至少需要2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(128, '密码不能超过128个字符'),
    confirmPassword: z.string().min(8, '密码至少需要8个字符'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(128, '密码不能超过128个字符'),
    confirmPassword: z.string().min(8, '密码至少需要8个字符'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, '密码至少需要8个字符'),
    newPassword: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(128, '密码不能超过128个字符'),
    confirmPassword: z.string().min(8, '密码至少需要8个字符'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>