import { useQuery } from '@tanstack/react-query'
import { likeKeys } from '#/hooks/keys/like-keys'
import { getMyLikesFn, checkLikeStatusFn, checkMultipleLikeStatusFn } from '#/data/like'

const STALE_TIME_MS = 30_000

export function useMyLikes(page = 1, limit = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likeKeys.myLikes(),
    queryFn: () => getMyLikesFn({ data: { page, limit } }),
    enabled: options?.enabled !== false,
  })
}

export function useLikeStatus(articleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likeKeys.status(articleId),
    queryFn: () => checkLikeStatusFn({ data: { articleId } }),
    enabled: options?.enabled !== false && !!articleId,
    staleTime: STALE_TIME_MS,
  })
}

export function useMultipleLikeStatus(articleIds: string[], options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likeKeys.multipleStatus(articleIds),
    queryFn: () => checkMultipleLikeStatusFn({ data: { articleIds } }),
    enabled: options?.enabled !== false && articleIds.length > 0,
    staleTime: STALE_TIME_MS,
  })
}