export interface LikeStatus {
  isLiked: boolean
}

export interface LikedArticle {
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
  likeCount: number
  likedAt: Date | string
}

export interface LikeListResponse {
  likes: LikedArticle[]
  meta: {
    total: number
    page: number
    limit: number
  }
}