import { useQuery } from '@tanstack/react-query'
import { commentKeys } from '#/hooks/keys/comment-keys'
import {
  getCommentsFn,
  checkCommentLikeStatusFn,
  checkMultipleCommentLikeStatusFn,
} from '#/data/comment'
import { authClient } from '#/lib/auth-client'
import type { CommentSortType } from '#/types/comment'

const STALE_TIME_MS = 30_000

export function useComments(
  articleId: string,
  sort: CommentSortType = 'oldest',
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: commentKeys.list(articleId, sort),
    queryFn: () => getCommentsFn({ data: { articleId, sort, page, limit } }),
    enabled: !!articleId,
  })
}

export function useCommentLikeStatus(
  commentId: string,
  options?: { enabled?: boolean },
) {
  const { data: session } = authClient.useSession()

  return useQuery({
    queryKey: commentKeys.status(commentId),
    queryFn: () => checkCommentLikeStatusFn({ data: { commentId } }),
    enabled: options?.enabled !== false && !!session && !!commentId,
    staleTime: STALE_TIME_MS,
  })
}

export function useMultipleCommentLikeStatus(
  commentIds: string[],
  options?: { enabled?: boolean },
) {
  const { data: session } = authClient.useSession()

  return useQuery({
    queryKey: commentKeys.multipleStatus(commentIds),
    queryFn: () =>
      checkMultipleCommentLikeStatusFn({ data: { commentIds } }),
    enabled:
      options?.enabled !== false && !!session && commentIds.length > 0,
    staleTime: STALE_TIME_MS,
  })
}