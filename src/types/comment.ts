export interface Comment {
  id: string
  content: string
  articleId: string
  userId: string
  parentId: string | null
  likeCount: number
  createdAt: Date | string
  updatedAt: Date | string
  user?: {
    id: string
    name: string
    image: string | null
  }
  replies?: Comment[]
  isLiked?: boolean
  isOwner?: boolean
  isArticleAuthor?: boolean
}

export interface CommentListResponse {
  comments: Comment[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export interface CommentLikeStatus {
  isLiked: boolean
}

export type CommentSortType = 'oldest' | 'newest' | 'hot'

export interface MultipleCommentLikeStatus {
  commentId: string
  isLiked: boolean
}