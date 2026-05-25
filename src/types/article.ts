import type { ArticleStatus } from '#/generated/prisma/enums'
import type { Tag } from './tag'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: ArticleStatus
  authorId: string
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt: Date | string | null
  likeCount: number
  bookmarkCount: number
  author?: {
    id: string
    name: string
    image: string | null
  }
  tags?: Tag[]
}

export interface ArticleListResponse {
  success: boolean
  data: Article[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export interface ArticleDetailResponse {
  success: boolean
  data: Article
}

export interface CreateArticleResponse {
  success: boolean
  data: Article
}

export interface UpdateArticleResponse {
  success: boolean
  data: Article
}