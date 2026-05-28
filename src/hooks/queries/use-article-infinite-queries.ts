import { useInfiniteQuery } from '@tanstack/react-query'
import { articleKeys } from '#/hooks/keys/article-keys'
import { getPublishedArticlesInfiniteFn, searchArticlesFn } from '#/data/articles'

const STALE_TIME_MS = 30_000

interface InfiniteArticlesResult {
  articles: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    status: string
    authorId: string
    createdAt: Date | string
    updatedAt: Date | string
    publishedAt: Date | string | null
    likeCount: number
    bookmarkCount: number
    commentCount: number
    author?: { id: string; name: string; image: string | null }
    tags?: Array<{ id: string; name: string; slug: string }>
  }>
  nextCursor: string | undefined
  hasMore: boolean
}

export function usePublishedArticlesInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: articleKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getPublishedArticlesInfiniteFn({ data: { cursor: pageParam as string | undefined, limit } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: InfiniteArticlesResult) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: STALE_TIME_MS,
  })
}

interface SearchArticlesResult extends InfiniteArticlesResult {
  query: string
}

export function useSearchArticlesInfinite(query: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: articleKeys.searchInfinite(query),
    queryFn: ({ pageParam }) =>
      searchArticlesFn({ data: { query, cursor: pageParam as string | undefined, limit } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SearchArticlesResult) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: STALE_TIME_MS,
    enabled: query.length > 0,
  })
}