import { z } from 'zod'
import { paginationSchema } from '#/lib/validators/article'
import { articleIdSchema } from '#/lib/validators/common'

export const likeArticleSchema = z.object({
  articleId: articleIdSchema,
})
export type LikeArticleInput = z.infer<typeof likeArticleSchema>

export const getMyLikesSchema = paginationSchema
export type GetMyLikesInput = z.infer<typeof getMyLikesSchema>

export const checkLikeStatusSchema = z.object({
  articleId: articleIdSchema,
})
export type CheckLikeStatusInput = z.infer<typeof checkLikeStatusSchema>

export const checkMultipleLikeStatusSchema = z.object({
  articleIds: z.array(articleIdSchema).min(1).max(100, '最多查询100篇文章状态'),
})
export type CheckMultipleLikeStatusInput = z.infer<typeof checkMultipleLikeStatusSchema>