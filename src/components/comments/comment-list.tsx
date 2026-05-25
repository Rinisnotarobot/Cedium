import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { CommentCard } from './comment-card'
import { CommentInput } from './comment-input'
import { useComments } from '#/hooks/queries/use-comment-queries'
import {
  useCreateComment,
  useDeleteComment,
} from '#/hooks/mutations/use-comment-mutations'
import {
  useLikeComment,
  useUnlikeComment,
} from '#/hooks/mutations/use-comment-like-mutations'
import { authClient } from '#/lib/auth-client'
import type { CommentSortType } from '#/types/comment'

interface CommentListProps {
  articleId: string
  articleAuthorId: string
}

const SORT_OPTIONS: { value: CommentSortType; label: string }[] = [
  { value: 'oldest', label: '最早' },
  { value: 'newest', label: '最新' },
  { value: 'hot', label: '最热' },
]

export function CommentList({ articleId, articleAuthorId }: CommentListProps) {
  const [sort, setSort] = useState<CommentSortType>('oldest')
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id ?? null

  // 获取评论列表
  const { data, isLoading, error } = useComments(articleId, sort)
  const comments = data?.comments ?? []
  const total = data?.meta?.total ?? 0

  // 获取 mutation hooks
  const createMutation = useCreateComment()
  const deleteMutation = useDeleteComment()
  const likeMutation = useLikeComment()
  const unlikeMutation = useUnlikeComment()

  // 处理点赞
  const handleLike = (commentId: string) => {
    likeMutation.mutate({ commentId, articleId, sort })
  }

  const handleUnlike = (commentId: string) => {
    unlikeMutation.mutate({ commentId, articleId, sort })
  }

  // 处理删除
  const handleDelete = (commentId: string) => {
    deleteMutation.mutate({ id: commentId, articleId, sort })
  }

  return (
    <div className="space-y-6">
      {/* 标题和排序 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          评论 <span className="text-muted-foreground">({total})</span>
        </h3>

        {/* 排序切换 */}
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => setSort(option.value)}
              className={cn(
                'text-xs',
                sort === option.value && 'bg-muted text-foreground'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 发表评论输入框 */}
      <div className="border-b border-border pb-2">
        <CommentInput
          articleId={articleId}
          sort={sort}
          createMutation={createMutation}
          onSuccess={() => {}}
        />
      </div>

      {/* 评论列表 */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          加载中...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-destructive">
          加载失败，请刷新页面重试
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          暂无评论，来发表第一条评论吧！
        </div>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              articleAuthorId={articleAuthorId}
              currentUserId={currentUserId}
              sort={sort}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}