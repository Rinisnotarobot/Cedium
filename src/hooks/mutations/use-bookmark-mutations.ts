import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bookmarkKeys } from '#/hooks/keys/bookmark-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import { bookmarkArticleFn, unbookmarkArticleFn } from '#/data/bookmark'
import { getErrorMessage } from '#/hooks/utils/get-error-message'

interface UseEngagementOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

type MultipleBookmarkStatus = { articleId: string; isBookmarked: boolean }[]

export function useBookmarkArticle(options?: UseEngagementOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => bookmarkArticleFn({ data: { articleId } }),
    onMutate: (articleId) => {
      // 取消正在进行的查询，防止乐观更新被覆盖
      queryClient.cancelQueries({ queryKey: bookmarkKeys.status(articleId) })

      // 保存旧值用于回滚
      const previousStatus = queryClient.getQueryData<{ isBookmarked: boolean }>(bookmarkKeys.status(articleId))

      // 乐观更新个体状态
      queryClient.setQueryData(bookmarkKeys.status(articleId), { isBookmarked: true })

      // 同时更新所有批量状态查询
      queryClient.getQueryCache().findAll({ queryKey: bookmarkKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleBookmarkStatus | undefined
        if (data && Array.isArray(data)) {
          const updated = data.map(item =>
            item.articleId === articleId ? { ...item, isBookmarked: true } : item
          )
          queryClient.setQueryData(query.queryKey, updated)
        }
      })

      return { previousStatus }
    },
    onError: (error, articleId, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(bookmarkKeys.status(articleId), context.previousStatus)
      }

      // 回滚批量状态
      const previousBookmarked = context?.previousStatus?.isBookmarked ?? false
      queryClient.getQueryCache().findAll({ queryKey: bookmarkKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleBookmarkStatus | undefined
        if (data && Array.isArray(data)) {
          const rolledBack = data.map(item =>
            item.articleId === articleId ? { ...item, isBookmarked: previousBookmarked } : item
          )
          queryClient.setQueryData(query.queryKey, rolledBack)
        }
      })

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, articleId) => {
      // 重新获取相关数据以确保一致性
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.myBookmarks() })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) })
      toast.success('已收藏')
      options?.onSuccess?.()
    },
    onSettled: (_, __, articleId) => {
      // 最终确保数据同步
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(articleId) })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.multipleStatusBase() })
    },
  })
}

export function useUnbookmarkArticle(options?: UseEngagementOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => unbookmarkArticleFn({ data: { articleId } }),
    onMutate: (articleId) => {
      queryClient.cancelQueries({ queryKey: bookmarkKeys.status(articleId) })

      const previousStatus = queryClient.getQueryData<{ isBookmarked: boolean }>(bookmarkKeys.status(articleId))

      // 乐观更新个体状态
      queryClient.setQueryData(bookmarkKeys.status(articleId), { isBookmarked: false })

      // 同时更新所有批量状态查询
      queryClient.getQueryCache().findAll({ queryKey: bookmarkKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleBookmarkStatus | undefined
        if (data && Array.isArray(data)) {
          const updated = data.map(item =>
            item.articleId === articleId ? { ...item, isBookmarked: false } : item
          )
          queryClient.setQueryData(query.queryKey, updated)
        }
      })

      return { previousStatus }
    },
    onError: (error, articleId, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(bookmarkKeys.status(articleId), context.previousStatus)
      }

      // 回滚批量状态
      const previousBookmarked = context?.previousStatus?.isBookmarked ?? false
      queryClient.getQueryCache().findAll({ queryKey: bookmarkKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleBookmarkStatus | undefined
        if (data && Array.isArray(data)) {
          const rolledBack = data.map(item =>
            item.articleId === articleId ? { ...item, isBookmarked: previousBookmarked } : item
          )
          queryClient.setQueryData(query.queryKey, rolledBack)
        }
      })

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.myBookmarks() })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) })
      toast.success('已取消收藏')
      options?.onSuccess?.()
    },
    onSettled: (_, __, articleId) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(articleId) })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.multipleStatusBase() })
    },
  })
}