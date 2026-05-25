import { z } from 'zod'
import { paginationSchema } from '#/lib/validators/article'
import { articleIdSchema } from '#/lib/validators/common'

export const bookmarkArticleSchema = z.object({
  articleId: articleIdSchema,
})
export type BookmarkArticleInput = z.infer<typeof bookmarkArticleSchema>

export const getMyBookmarksSchema = paginationSchema
export type GetMyBookmarksInput = z.infer<typeof getMyBookmarksSchema>

export const checkBookmarkStatusSchema = z.object({
  articleId: articleIdSchema,
})
export type CheckBookmarkStatusInput = z.infer<typeof checkBookmarkStatusSchema>

export const checkMultipleBookmarkStatusSchema = z.object({
  articleIds: z.array(articleIdSchema).min(1).max(100, '最多查询100篇文章状态'),
})
export type CheckMultipleBookmarkStatusInput = z.infer<typeof checkMultipleBookmarkStatusSchema>