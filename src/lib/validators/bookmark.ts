import { z } from 'zod'
import { paginationSchema } from '#/lib/validators/article'

export const articleIdSchema = z.string().min(1, '文章ID不能为空')

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
  articleIds: z.array(articleIdSchema),
})
export type CheckMultipleBookmarkStatusInput = z.infer<typeof checkMultipleBookmarkStatusSchema>