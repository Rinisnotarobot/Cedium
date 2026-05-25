import { z } from 'zod'
import { paginationSchema } from '#/lib/validators/article'

export const articleIdSchema = z.string().min(1, '文章ID不能为空')

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
  articleIds: z.array(articleIdSchema),
})
export type CheckMultipleLikeStatusInput = z.infer<typeof checkMultipleLikeStatusSchema>