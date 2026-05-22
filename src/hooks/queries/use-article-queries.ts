import { useQuery } from '@tanstack/react-query'
import { articleKeys } from '#/hooks/keys/article-keys'
import type { ArticleListResponse, ArticleDetailResponse } from '#/types/article'

export function useArticles(page = 1, limit = 10) {
  return useQuery({
    queryKey: articleKeys.list({ page, limit }),
    queryFn: async (): Promise<ArticleListResponse> => {
      const res = await fetch(`/api/articles?page=${page}&limit=${limit}`)
      return res.json()
    },
  })
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: async (): Promise<ArticleDetailResponse> => {
      const res = await fetch(`/api/articles/${id}`)
      return res.json()
    },
    enabled: !!id,
  })
}

export function useMyArticles(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: articleKeys.myArticlesWithFilter(status),
    queryFn: async (): Promise<ArticleListResponse> => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.append('status', status)
      const res = await fetch(`/api/articles/by-me?${params}`)
      return res.json()
    },
  })
}

interface ArticlesByAuthorResponse extends ArticleListResponse {
  author?: {
    id: string
    name: string
    image: string | null
    bio: string | null
  }
}

export function useArticlesByAuthor(username: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: articleKeys.byAuthor(username),
    queryFn: async (): Promise<ArticlesByAuthorResponse> => {
      const params = new URLSearchParams({ username, page: String(page), limit: String(limit) })
      const res = await fetch(`/api/articles/by-author?${params}`)
      return res.json()
    },
    enabled: !!username,
  })
}