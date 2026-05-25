import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeKeys } from '#/hooks/keys/like-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import { likeArticleFn, unlikeArticleFn } from '#/data/like'
import type { UseMutationOptions } from '#/hooks/types'
import {
  createToggleOnMutate,
  createToggleOnError,
  createToggleOnSuccess,
  createToggleOnSettled,
} from '#/hooks/utils/optimistic-update'

export function useLikeArticle(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => likeArticleFn({ data: { articleId } }),
    onMutate: createToggleOnMutate<{ isLiked: boolean }>(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
      statusField: 'isLiked',
      newStatus: true,
    }),
    onError: createToggleOnError(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
      statusField: 'isLiked',
      options,
    }),
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已点赞',
      invalidateKeys: (id) => [likeKeys.myLikes(), articleKeys.detail(id), articleKeys.lists()],
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
    onMutate: createToggleOnMutate<{ isLiked: boolean }>(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
      statusField: 'isLiked',
      newStatus: false,
    }),
    onError: createToggleOnError(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
      statusField: 'isLiked',
      options,
    }),
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已取消点赞',
      invalidateKeys: (id) => [likeKeys.myLikes(), articleKeys.detail(id), articleKeys.lists()],
      options,
    }),
    onSettled: createToggleOnSettled(queryClient, {
      statusKey: likeKeys.status,
      batchBaseKey: likeKeys.multipleStatusBase,
    }),
  })
}