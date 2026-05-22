import { z } from 'zod'

// 文章状态枚举
export const articleStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
export type ArticleStatus = z.infer<typeof articleStatusSchema>

// 创建文章
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题不能超过100个字符'),
  excerpt: z.string().max(200, '摘要不能超过200个字符').optional(),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().url('请输入有效的图片URL').optional().nullable(),
})
export type CreateArticleInput = z.infer<typeof createArticleSchema>

// 更新文章
export const updateArticleSchema = z.object({
  id: z.string().min(1, '文章ID不能为空'),
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题不能超过100个字符')
    .optional(),
  excerpt: z.string().max(200, '摘要不能超过200个字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  coverImage: z.string().url('请输入有效的图片URL').optional().nullable(),
})
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

// 发布文章
export const publishArticleSchema = z.object({
  id: z.string().min(1, '文章ID不能为空'),
})
export type PublishArticleInput = z.infer<typeof publishArticleSchema>

// 归档文章
export const archiveArticleSchema = z.object({
  id: z.string().min(1, '文章ID不能为空'),
})
export type ArchiveArticleInput = z.infer<typeof archiveArticleSchema>

// 分页参数
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})
export type PaginationInput = z.infer<typeof paginationSchema>

// 获取文章详情
export const getArticleByIdSchema = z.object({
  id: z.string().min(1, '文章ID不能为空'),
})
export type GetArticleByIdInput = z.infer<typeof getArticleByIdSchema>

// 获取我的文章列表（带状态过滤）
export const getMyArticlesSchema = paginationSchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})
export type GetMyArticlesInput = z.infer<typeof getMyArticlesSchema>

// 获取公开文章列表
export const getPublishedArticlesSchema = paginationSchema
export type GetPublishedArticlesInput = z.infer<typeof getPublishedArticlesSchema>

// 获取作者文章列表
export const getArticlesByAuthorSchema = paginationSchema.extend({
  username: z.string().optional(),
  authorId: z.string().optional(),
}).refine(
  (data) => data.username || data.authorId,
  { message: '请提供用户名或用户ID' },
)
export type GetArticlesByAuthorInput = z.infer<typeof getArticlesByAuthorSchema>

// 删除文章
export const deleteArticleSchema = z.object({
  id: z.string().min(1, '文章ID不能为空'),
})
export type DeleteArticleInput = z.infer<typeof deleteArticleSchema>