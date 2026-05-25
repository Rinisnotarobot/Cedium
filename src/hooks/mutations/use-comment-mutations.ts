import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentKeys } from '#/hooks/keys/comment-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import {
  createCommentFn,
  updateCommentFn,
  deleteCommentFn,
} from '#/data/comment'
import { getErrorMessage } from '#/hooks/utils/get-error-message'
import type { Comment, CommentSortType } from '#/types/comment'

interface UseCreateCommentOptions {
  onSuccess?: (comment: Comment) => void
  onError?: (error: string) => void
}

interface UseUpdateCommentOptions {
  onSuccess?: (comment: Comment) => void
  onError?: (error: string) => void
}

interface UseDeleteCommentOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * 发表评论 Mutation
 * - 乐观更新：立即添加临时评论到列表
 * - 失败回滚：移除临时评论
 * - 成功同步：替换临时 ID 为真实 ID
 */
export function useCreateComment(options?: UseCreateCommentOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      articleId: string
      content: string
      parentId?: string
      sort: CommentSortType
    }) =>
      createCommentFn({
        data: { articleId: params.articleId, content: params.content, parentId: params.parentId },
      }),
    onMutate: (params) => {
      const queryKey = commentKeys.list(params.articleId, params.sort)

      // 取消正在进行的查询
      queryClient.cancelQueries({ queryKey })

      // 保存旧值用于回滚
      const previousData = queryClient.getQueryData<Comment[]>(queryKey)

      // 创建临时评论
      const tempId = `temp-${Date.now()}`
      const tempComment: Comment = {
        id: tempId,
        content: params.content,
        articleId: params.articleId,
        userId: 'temp-user',
        parentId: params.parentId ?? null,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'temp-user', name: '您', image: null },
        isLiked: false,
        isOwner: true,
        isArticleAuthor: false,
        replies: undefined,
      }

      // 乐观更新：如果是顶层评论，添加到列表；如果是回复，添加到父评论的 replies
      if (params.parentId) {
        // 回复：更新父评论的 replies
        queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
          if (!old) return old
          return old.map((comment) => {
            if (comment.id === params.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies ?? []), tempComment],
              }
            }
            return comment
          })
        })
      } else {
        // 顶层评论：添加到列表开头或末尾（根据排序）
        queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
          if (!old) return [tempComment]
          return params.sort === 'newest'
            ? [tempComment, ...old]
            : [...old, tempComment]
        })
      }

      return { previousData, tempId }
    },
    onError: (error, params, context) => {
      // 回滚
      if (context?.previousData) {
        const queryKey = commentKeys.list(params.articleId, params.sort)
        queryClient.setQueryData(queryKey, context.previousData)
      }

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (newComment, params, context) => {
      const queryKey = commentKeys.list(params.articleId, params.sort)

      // 替换临时评论为真实评论
      if (params.parentId) {
        queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
          if (!old) return old
          return old.map((comment) => {
            if (comment.id === params.parentId) {
              return {
                ...comment,
                replies: (comment.replies ?? []).map((reply) =>
                  reply.id === context?.tempId ? newComment : reply
                ),
              }
            }
            return comment
          })
        })
      } else {
        queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
          if (!old) return [newComment]
          return old.map((comment) =>
            comment.id === context?.tempId ? newComment : comment
          )
        })
      }

      // 更新文章评论计数
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(params.articleId) })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })

      toast.success('评论发表成功')
      options?.onSuccess?.(newComment)
    },
    onSettled: (_, __, params) => {
      // 最终同步
      queryClient.invalidateQueries({ queryKey: commentKeys.list(params.articleId, params.sort) })
      queryClient.invalidateQueries({ queryKey: commentKeys.count(params.articleId) })
    },
  })
}

/**
 * 编辑评论 Mutation
 * - 乐观更新：立即更新评论内容
 * - 失败回滚：恢复旧内容
 */
export function useUpdateComment(options?: UseUpdateCommentOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string; content: string; articleId: string; sort: CommentSortType }) =>
      updateCommentFn({ data: { id: params.id, content: params.content } }),
    onMutate: (params) => {
      const queryKey = commentKeys.list(params.articleId, params.sort)

      // 取消正在进行的查询
      queryClient.cancelQueries({ queryKey })

      // 保存旧值
      const previousData = queryClient.getQueryData<Comment[]>(queryKey)

      // 乐观更新：更新评论内容
      queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
        if (!old) return old
        return old.map((comment) => {
          if (comment.id === params.id) {
            return { ...comment, content: params.content }
          }
          // 检查 replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === params.id ? { ...reply, content: params.content } : reply
              ),
            }
          }
          return comment
        })
      })

      return { previousData }
    },
    onError: (error, params, context) => {
      if (context?.previousData) {
        const queryKey = commentKeys.list(params.articleId, params.sort)
        queryClient.setQueryData(queryKey, context.previousData)
      }

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (updatedComment, _params) => {
      toast.success('评论已更新')
      options?.onSuccess?.(updatedComment)
    },
    onSettled: (_, __, params) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(params.articleId, params.sort) })
    },
  })
}

/**
 * 删除评论 Mutation
 * - 乐观更新：立即移除评论（含子回复）
 * - 失败回滚：恢复评论
 */
export function useDeleteComment(options?: UseDeleteCommentOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string; articleId: string; sort: CommentSortType }) =>
      deleteCommentFn({ data: { id: params.id, articleId: params.articleId } }),
    onMutate: (params) => {
      const queryKey = commentKeys.list(params.articleId, params.sort)

      // 取消正在进行的查询
      queryClient.cancelQueries({ queryKey })

      // 保存旧值
      const previousData = queryClient.getQueryData<Comment[]>(queryKey)

      // 乐观更新：移除评论及其子回复
      queryClient.setQueryData(queryKey, (old: Comment[] | undefined) => {
        if (!old) return old

        // 检查是否是顶层评论
        const targetComment = old.find((c) => c.id === params.id)
        if (targetComment) {
          // 移除顶层评论
          return old.filter((c) => c.id !== params.id)
        }

        // 检查是否是回复
        return old.map((comment) => {
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== params.id),
            }
          }
          return comment
        })
      })

      return { previousData }
    },
    onError: (error, params, context) => {
      if (context?.previousData) {
        const queryKey = commentKeys.list(params.articleId, params.sort)
        queryClient.setQueryData(queryKey, context.previousData)
      }

      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, params) => {
      // 更新文章评论计数
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(params.articleId) })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })

      toast.success('评论已删除')
      options?.onSuccess?.()
    },
    onSettled: (_, __, params) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(params.articleId, params.sort) })
      queryClient.invalidateQueries({ queryKey: commentKeys.count(params.articleId) })
    },
  })
}