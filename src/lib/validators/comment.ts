import { z } from 'zod'
import { paginationSchema } from '#/lib/validators/article'
import { articleIdSchema } from '#/lib/validators/common'

export const commentIdSchema = z.string().min(1, '评论ID不能为空').max(50, '评论ID格式无效')
export const parentIdSchema = z.string().min(1, '父评论ID不能为空').max(50, '父评论ID格式无效')

export const commentContentSchema = z
  .string()
  .min(1, '评论内容不能为空')
  .max(1000, '评论内容不能超过1000个字符')

export const createCommentSchema = z.object({
  articleId: articleIdSchema,
  content: commentContentSchema,
  parentId: parentIdSchema.optional(),
})
export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const updateCommentSchema = z.object({
  id: commentIdSchema,
  content: commentContentSchema,
})
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

export const deleteCommentSchema = z.object({
  id: commentIdSchema,
  articleId: articleIdSchema,
})
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>

export const getCommentsSchema = paginationSchema.extend({
  articleId: articleIdSchema,
  sort: z.enum(['oldest', 'newest', 'hot']).default('oldest'),
})
export type GetCommentsInput = z.infer<typeof getCommentsSchema>

export const likeCommentSchema = z.object({
  commentId: commentIdSchema,
})
export type LikeCommentInput = z.infer<typeof likeCommentSchema>

export const checkCommentLikeStatusSchema = z.object({
  commentId: commentIdSchema,
})
export type CheckCommentLikeStatusInput = z.infer<typeof checkCommentLikeStatusSchema>

export const checkMultipleCommentLikeStatusSchema = z.object({
  commentIds: z.array(commentIdSchema).min(1, '评论ID列表不能为空').max(100, '最多查询100条评论状态'),
})
export type CheckMultipleCommentLikeStatusInput = z.infer<typeof checkMultipleCommentLikeStatusSchema>