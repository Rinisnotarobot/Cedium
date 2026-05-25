import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { likeKeys } from '#/hooks/keys/like-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import { likeArticleFn, unlikeArticleFn } from '#/data/like'
import { getErrorMessage } from '#/hooks/utils/get-error-message'

interface UseEngagementOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

type MultipleLikeStatus = { articleId: string; isLiked: boolean }[]

export function useLikeArticle(options?: UseEngagementOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => likeArticleFn({ data: { articleId } }),
    onMutate: (articleId) => {
      // 取消正在进行的查询，防止乐观更新被覆盖
      queryClient.cancelQueries({ queryKey: likeKeys.status(articleId) })

      // 保存旧值用于回滚
      const previousStatus = queryClient.getQueryData<{ isLiked: boolean }>(likeKeys.status(articleId))

      // 乐观更新个体状态
      queryClient.setQueryData(likeKeys.status(articleId), { isLiked: true })

      // 同时更新所有批量状态查询（找到包含该 articleId 的缓存）
      queryClient.getQueryCache().findAll({ queryKey: likeKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleLikeStatus | undefined
        if (data && Array.isArray(data)) {
          const updated = data.map(item =>
            item.articleId === articleId ? { ...item, isLiked: true } : item
          )
          queryClient.setQueryData(query.queryKey, updated)
        }
      })

      return { previousStatus }
    },
    onError: (error, articleId, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(likeKeys.status(articleId), context.previousStatus)
      }

      // 回滚批量状态
      const previousLiked = context?.previousStatus?.isLiked ?? false
      queryClient.getQueryCache().findAll({ queryKey: likeKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleLikeStatus | undefined
        if (data && Array.isArray(data)) {
          const rolledBack = data.map(item =>
            item.articleId === articleId ? { ...item, isLiked: previousLiked } : item
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
      queryClient.invalidateQueries({ queryKey: likeKeys.myLikes() })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      toast.success('已点赞')
      options?.onSuccess?.()
    },
    onSettled: (_, __, articleId) => {
      // 最终确保数据同步
      queryClient.invalidateQueries({ queryKey: likeKeys.status(articleId) })
      queryClient.invalidateQueries({ queryKey: likeKeys.multipleStatusBase() })
    },
  })
}

export function useUnlikeArticle(options?: UseEngagementOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => unlikeArticleFn({ data: { articleId } }),
    onMutate: (articleId) => {
      queryClient.cancelQueries({ queryKey: likeKeys.status(articleId) })

      const previousStatus = queryClient.getQueryData<{ isLiked: boolean }>(likeKeys.status(articleId))

      // 乐观更新个体状态
      queryClient.setQueryData(likeKeys.status(articleId), { isLiked: false })

      // 同时更新所有批量状态查询
      queryClient.getQueryCache().findAll({ queryKey: likeKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleLikeStatus | undefined
        if (data && Array.isArray(data)) {
          const updated = data.map(item =>
            item.articleId === articleId ? { ...item, isLiked: false } : item
          )
          queryClient.setQueryData(query.queryKey, updated)
        }
      })

      return { previousStatus }
    },
    onError: (error, articleId, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(likeKeys.status(articleId), context.previousStatus)
      }

      // 回滚批量状态
      const previousLiked = context?.previousStatus?.isLiked ?? false
      queryClient.getQueryCache().findAll({ queryKey: likeKeys.multipleStatusBase() }).forEach(query => {
        const data = query.state.data as MultipleLikeStatus | undefined
        if (data && Array.isArray(data)) {
          const rolledBack = data.map(item =>
            item.articleId === articleId ? { ...item, isLiked: previousLiked } : item
          )
          queryClient.setQueryData(query.queryKey, rolledBack)
        }
      })

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: likeKeys.myLikes() })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      toast.success('已取消点赞')
      options?.onSuccess?.()
    },
    onSettled: (_, __, articleId) => {
      queryClient.invalidateQueries({ queryKey: likeKeys.status(articleId) })
      queryClient.invalidateQueries({ queryKey: likeKeys.multipleStatusBase() })
    },
  })
}