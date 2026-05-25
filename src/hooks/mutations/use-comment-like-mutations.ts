import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentKeys } from '#/hooks/keys/comment-keys'
import { likeCommentFn, unlikeCommentFn } from '#/data/comment'
import type { UseMutationOptions } from '#/hooks/types'
import type { Comment, CommentSortType } from '#/types/comment'
import {
  updateBatchStatusInCache,
  rollbackBatchStatusInCache,
} from '#/hooks/utils/optimistic-update'
import { toast } from 'sonner'
import { getErrorMessage } from '#/hooks/utils/get-error-message'

interface UseCommentLikeOptions extends UseMutationOptions {
  /** 评论列表更新后的回调（用于 invalidate） */
  onListUpdate?: () => void
}

interface CommentLikeParams {
  commentId: string
  articleId: string
  sort: CommentSortType
}

/**
 * 辅助函数：更新评论列表中的点赞计数（包括嵌套回复）
 */
function updateCommentLikeCount(
  comments: Comment[],
  commentId: string,
  delta: number,
  isLiked: boolean
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        likeCount: comment.likeCount + delta,
        isLiked,
      }
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: updateCommentLikeCount(comment.replies, commentId, delta, isLiked),
      }
    }
    return comment
  })
}

/**
 * 点赞评论 Mutation
 */
export function useLikeComment(options?: UseCommentLikeOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CommentLikeParams) =>
      likeCommentFn({ data: { commentId: params.commentId } }),
    onMutate: (params) => {
      // 取消正在进行的查询
      queryClient.cancelQueries({ queryKey: commentKeys.status(params.commentId) })
      queryClient.cancelQueries({ queryKey: commentKeys.multipleStatusBase() })

      const listQueryKey = commentKeys.list(params.articleId, params.sort)
      queryClient.cancelQueries({ queryKey: listQueryKey })

      // 保存旧值用于回滚
      const previousStatus = queryClient.getQueryData<{ isLiked: boolean }>(
        commentKeys.status(params.commentId)
      )
      const previousList = queryClient.getQueryData<{ comments: Comment[] }>(listQueryKey)

      // 乐观更新个体状态
      queryClient.setQueryData(commentKeys.status(params.commentId), { isLiked: true })

      // 批量更新状态缓存
      updateBatchStatusInCache(
        queryClient,
        commentKeys.multipleStatusBase(),
        params.commentId,
        'isLiked',
        true
      )

      // 乐观更新评论列表中的点赞计数
      queryClient.setQueryData(listQueryKey, (old: { comments: Comment[] } | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: updateCommentLikeCount(old.comments, params.commentId, 1, true),
        }
      })

      return { previousStatus, previousList }
    },
    onError: (error, params, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(commentKeys.status(params.commentId), context.previousStatus)
      }

      // 回滚批量状态
      const previousLiked = context?.previousStatus?.isLiked ?? false
      rollbackBatchStatusInCache(
        queryClient,
        commentKeys.multipleStatusBase(),
        params.commentId,
        'isLiked',
        previousLiked
      )

      // 回滚列表
      if (context?.previousList) {
        const listQueryKey = commentKeys.list(params.articleId, params.sort)
        queryClient.setQueryData(listQueryKey, context.previousList)
      }

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: () => {
      toast.success('已点赞')
      options?.onSuccess?.()
    },
    onSettled: (_, __, params) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.status(params.commentId) })
      queryClient.invalidateQueries({ queryKey: commentKeys.multipleStatusBase() })
      queryClient.invalidateQueries({ queryKey: commentKeys.list(params.articleId, params.sort) })
    },
  })
}

/**
 * 取消点赞评论 Mutation
 */
export function useUnlikeComment(options?: UseCommentLikeOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CommentLikeParams) =>
      unlikeCommentFn({ data: { commentId: params.commentId } }),
    onMutate: (params) => {
      // 取消正在进行的查询
      queryClient.cancelQueries({ queryKey: commentKeys.status(params.commentId) })
      queryClient.cancelQueries({ queryKey: commentKeys.multipleStatusBase() })

      const listQueryKey = commentKeys.list(params.articleId, params.sort)
      queryClient.cancelQueries({ queryKey: listQueryKey })

      // 保存旧值用于回滚
      const previousStatus = queryClient.getQueryData<{ isLiked: boolean }>(
        commentKeys.status(params.commentId)
      )
      const previousList = queryClient.getQueryData<{ comments: Comment[] }>(listQueryKey)

      // 乐观更新个体状态
      queryClient.setQueryData(commentKeys.status(params.commentId), { isLiked: false })

      // 批量更新状态缓存
      updateBatchStatusInCache(
        queryClient,
        commentKeys.multipleStatusBase(),
        params.commentId,
        'isLiked',
        false
      )

      // 乐观更新评论列表中的点赞计数
      queryClient.setQueryData(listQueryKey, (old: { comments: Comment[] } | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: updateCommentLikeCount(old.comments, params.commentId, -1, false),
        }
      })

      return { previousStatus, previousList }
    },
    onError: (error, params, context) => {
      // 回滚个体状态
      if (context?.previousStatus) {
        queryClient.setQueryData(commentKeys.status(params.commentId), context.previousStatus)
      }

      // 回滚批量状态
      const previousLiked = context?.previousStatus?.isLiked ?? false
      rollbackBatchStatusInCache(
        queryClient,
        commentKeys.multipleStatusBase(),
        params.commentId,
        'isLiked',
        previousLiked
      )

      // 回滚列表
      if (context?.previousList) {
        const listQueryKey = commentKeys.list(params.articleId, params.sort)
        queryClient.setQueryData(listQueryKey, context.previousList)
      }

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: () => {
      toast.success('已取消点赞')
      options?.onSuccess?.()
    },
    onSettled: (_, __, params) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.status(params.commentId) })
      queryClient.invalidateQueries({ queryKey: commentKeys.multipleStatusBase() })
      queryClient.invalidateQueries({ queryKey: commentKeys.list(params.articleId, params.sort) })
    },
  })
}