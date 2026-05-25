import { useQuery } from '@tanstack/react-query'
import { bookmarkKeys } from '#/hooks/keys/bookmark-keys'
import { getMyBookmarksFn, checkBookmarkStatusFn, checkMultipleBookmarkStatusFn } from '#/data/bookmark'

const STALE_TIME_MS = 30_000

export function useMyBookmarks(page = 1, limit = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookmarkKeys.myBookmarks(),
    queryFn: () => getMyBookmarksFn({ data: { page, limit } }),
    enabled: options?.enabled !== false,
  })
}

export function useBookmarkStatus(articleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookmarkKeys.status(articleId),
    queryFn: () => checkBookmarkStatusFn({ data: { articleId } }),
    enabled: options?.enabled !== false && !!articleId,
    staleTime: STALE_TIME_MS,
  })
}

export function useMultipleBookmarkStatus(articleIds: string[], options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookmarkKeys.multipleStatus(articleIds),
    queryFn: () => checkMultipleBookmarkStatusFn({ data: { articleIds } }),
    enabled: options?.enabled !== false && articleIds.length > 0,
    staleTime: STALE_TIME_MS,
  })
}