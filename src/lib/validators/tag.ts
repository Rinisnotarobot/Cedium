import { z } from 'zod'

// 创建标签
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, '标签名不能为空')
    .max(30, '标签名不能超过30个字符'),
})
export type CreateTagInput = z.infer<typeof createTagSchema>

// 标签 slug 验证（用于 URL）
export const tagSlugSchema = z.object({
  slug: z.string().min(1, '标签 slug 不能为空'),
})
export type TagSlugInput = z.infer<typeof tagSlugSchema>