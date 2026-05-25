export interface BookmarkStatus {
  isBookmarked: boolean
}

export interface BookmarkedArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  author: {
    id: string
    name: string
    image: string | null
  }
  tags?: Array<{
    id: string
    name: string
    slug: string
  }>
  likeCount: number
  bookmarkCount: number
  bookmarkedAt: Date | string
}

export interface BookmarkListResponse {
  bookmarks: BookmarkedArticle[]
  meta: {
    total: number
    page: number
    limit: number
  }
}