import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookmarkKeys } from '#/hooks/keys/bookmark-keys'
import { articleKeys } from '#/hooks/keys/article-keys'
import { bookmarkArticleFn, unbookmarkArticleFn } from '#/data/bookmark'
import type { UseMutationOptions } from '#/hooks/types'
import {
  createToggleOnMutate,
  createToggleOnError,
  createToggleOnSuccess,
  createToggleOnSettled,
} from '#/hooks/utils/optimistic-update'

export function useBookmarkArticle(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => bookmarkArticleFn({ data: { articleId } }),
    onMutate: createToggleOnMutate<{ isBookmarked: boolean }>(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
      statusField: 'isBookmarked',
      newStatus: true,
    }),
    onError: createToggleOnError(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
      statusField: 'isBookmarked',
      options,
    }),
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已收藏',
      invalidateKeys: (id) => [bookmarkKeys.myBookmarks(), articleKeys.detail(id)],
      options,
    }),
    onSettled: createToggleOnSettled(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
    }),
  })
}

export function useUnbookmarkArticle(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: string) => unbookmarkArticleFn({ data: { articleId } }),
    onMutate: createToggleOnMutate<{ isBookmarked: boolean }>(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
      statusField: 'isBookmarked',
      newStatus: false,
    }),
    onError: createToggleOnError(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
      statusField: 'isBookmarked',
      options,
    }),
    onSuccess: createToggleOnSuccess(queryClient, {
      successMessage: '已取消收藏',
      invalidateKeys: (id) => [bookmarkKeys.myBookmarks(), articleKeys.detail(id)],
      options,
    }),
    onSettled: createToggleOnSettled(queryClient, {
      statusKey: bookmarkKeys.status,
      batchBaseKey: bookmarkKeys.multipleStatusBase,
    }),
  })
}