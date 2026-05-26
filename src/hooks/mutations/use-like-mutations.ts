import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeKeys } from '#/hooks/keys/like-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import { likeArticleFn, unlikeArticleFn } from '#/data/like'
import type { UseMutationOptions } from '#/hooks/types'
import type { Article } from '#/types/article'
import {
  createToggleOnMutate,
  createToggleOnError,
  createToggleOnSuccess,
  createToggleOnSettled,
} from '#/hooks/utils/optimistic-update'

/**
 * 乐观更新文章详情中的 likeCount
 */
function updateArticleLikeCount(
  queryClient: ReturnType<typeof useQueryClient>,
  articleId: string,
  delta: number
) {
  const articleData = queryClient.getQueryData<Article>(articleKeys.detail(articleId))
  if (articleData) {
    queryClient.setQueryData(articleKeys.detail(articleId), {
      ...articleData,
      likeCount: articleData.likeCount + delta,
    })
  }
}

/**
 * 乐观更新无限列表中的文章 likeCount
 */
function updateInfiniteArticleLikeCount(
  queryClient: ReturnType<typeof useQueryClient>,
  articleId: string,
  delta: number
) {
  const infiniteData = queryClient.getQueryData<{ pages: Array<{ articles: Article[] }> }>(
    articleKeys.infinite()
  )
  if (!infiniteData) return

  const updatedPages = infiniteData.pages.map((page) => ({
    ...page,
    articles: page.articles.map((article) =>
      article.id === articleId ? { ...article, likeCount: article.likeCount + delta } : article
    ),
  }))

  queryClient.setQueryData(articleKeys.infinite(), { ...infiniteData, pages: updatedPages })
}

/**
 * 回滚文章详情中的 likeCount
 */
function rollbackArticleLikeCount(
  queryClient: ReturnType<typeof useQueryClient>,
  articleId: string,
  previousCount: number
) {
  const articleData = queryClient.getQueryData<Article>(articleKeys.detail(articleId))
  if (articleData) {
    queryClient.setQueryData(articleKeys.detail(articleId), {
      ...articleData,
      likeCount: previousCount,
    })
  }
}

/**
 * 回滚无限列表中的文章 likeCount
 */
function rollbackInfiniteArticleLikeCount(
  queryClient: ReturnType<typeof useQueryClient>,
  articleId: string,
  previousCount: number
) {
  const infiniteData = queryClient.getQueryData<{ pages: Array<{ articles: Article[] }> }>(
    articleKeys.infinite()
  )
  if (!infiniteData) return

  const updatedPages = infiniteData.pages.map((page) => ({
    ...page,
    articles: page.articles.map((article) =>
      article.id === articleId ? { ...article, likeCount: previousCount } : article
    ),
  }))

  queryClient.setQueryData(articleKeys.infinite(), { ...infiniteData, pages: updatedPages })
}

export function useLikeArticle(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => likeArticleFn({ data: { articleId } }),
    onMutate: (articleId: string) => {
      // 先执行原有的点赞状态乐观更新
      const context = createToggleOnMutate<{ isLiked: boolean }>(queryClient, {
        statusKey: likeKeys.status,
        batchBaseKey: likeKeys.multipleStatusBase,
        statusField: 'isLiked',
        newStatus: true,
      })(articleId)

      // 保存当前文章的 likeCount 用于回滚
      const articleData = queryClient.getQueryData<Article>(articleKeys.detail(articleId))
      const previousLikeCount = articleData?.likeCount ?? 0

      // 乐观增加 likeCount（详情页和无限列表）
      updateArticleLikeCount(queryClient, articleId, 1)
      updateInfiniteArticleLikeCount(queryClient, articleId, 1)

      return { ...context, previousLikeCount }
    },
    onError: (error: unknown, articleId: string, context: unknown) => {
      const ctx = context as { previousStatus?: { isLiked: boolean }; previousLikeCount?: number }

      // 回滚点赞状态
      createToggleOnError(queryClient, {
        statusKey: likeKeys.status,
        batchBaseKey: likeKeys.multipleStatusBase,
        statusField: 'isLiked',
        options,
      })(error, articleId, { previousStatus: ctx?.previousStatus })

      // 回滚 likeCount（详情页和无限列表）
      if (ctx?.previousLikeCount !== undefined) {
        rollbackArticleLikeCount(queryClient, articleId, ctx.previousLikeCount)
        rollbackInfiniteArticleLikeCount(queryClient, articleId, ctx.previousLikeCount)
      }
    },
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已点赞',
      invalidateKeys: (id) => [
        likeKeys.myLikes(),
        articleKeys.detail(id),
        articleKeys.lists(),
        articleKeys.infinite(),
      ],
      options,
    }),
    onSettled: createToggleOnSettled(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
    }),
  })
}

export function useUnlikeArticle(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => unlikeArticleFn({ data: { articleId } }),
    onMutate: (articleId: string) => {
      // 先执行原有的点赞状态乐观更新
      const context = createToggleOnMutate<{ isLiked: boolean }>(queryClient, {
        statusKey: likeKeys.status,
        batchBaseKey: likeKeys.multipleStatusBase,
        statusField: 'isLiked',
        newStatus: false,
      })(articleId)

      // 保存当前文章的 likeCount 用于回滚
      const articleData = queryClient.getQueryData<Article>(articleKeys.detail(articleId))
      const previousLikeCount = articleData?.likeCount ?? 0

      // 乐观减少 likeCount（详情页和无限列表）
      updateArticleLikeCount(queryClient, articleId, -1)
      updateInfiniteArticleLikeCount(queryClient, articleId, -1)

      return { ...context, previousLikeCount }
    },
    onError: (error: unknown, articleId: string, context: unknown) => {
      const ctx = context as { previousStatus?: { isLiked: boolean }; previousLikeCount?: number }

      // 回滚点赞状态
      createToggleOnError(queryClient, {
        statusKey: likeKeys.status,
        batchBaseKey: likeKeys.multipleStatusBase,
        statusField: 'isLiked',
        options,
      })(error, articleId, { previousStatus: ctx?.previousStatus })

      // 回滚 likeCount（详情页和无限列表）
      if (ctx?.previousLikeCount !== undefined) {
        rollbackArticleLikeCount(queryClient, articleId, ctx.previousLikeCount)
        rollbackInfiniteArticleLikeCount(queryClient, articleId, ctx.previousLikeCount)
      }
    },
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已取消点赞',
      invalidateKeys: (id) => [
        likeKeys.myLikes(),
        articleKeys.detail(id),
        articleKeys.lists(),
        articleKeys.infinite(),
      ],
      options,
    }),
    onSettled: createToggleOnSettled(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
    }),
  })
}