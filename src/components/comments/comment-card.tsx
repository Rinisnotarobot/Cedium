import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Heart, Reply, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '#/components/ui/avatar'
import { getAvatarColor } from '#/lib/utils/avatar-color'
import { CommentInput } from './comment-input'
import { useUpdateComment, useCreateComment } from '#/hooks/mutations/use-comment-mutations'
import type { Comment, CommentSortType } from '#/types/comment'

interface CommentCardProps {
  comment: Comment
  articleAuthorId: string
  currentUserId: string | null
  sort: CommentSortType
  onLike: (commentId: string) => void
  onUnlike: (commentId: string) => void
  onDelete: (commentId: string) => void
  isReply?: boolean
}

export function CommentCard({
  comment,
  articleAuthorId,
  currentUserId,
  sort,
  onLike,
  onUnlike,
  onDelete,
  isReply = false,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const updateMutation = useUpdateComment()
  const createMutation = useCreateComment()

  const isOwner = currentUserId === comment.userId
  const isArticleAuthor = currentUserId === articleAuthorId
  const canEdit = isOwner
  const canDelete = isOwner || isArticleAuthor

  const avatarColor = getAvatarColor(comment.user?.name || '')
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: zhCN,
  })

  const handleToggleLike = () => {
    if (comment.isLiked) {
      onUnlike(comment.id)
    } else {
      onLike(comment.id)
    }
  }

  if (isEditing) {
    return (
      <div className="py-4">
        <CommentInput
          articleId={comment.articleId}
          initialContent={comment.content}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
          isEditMode
          editCommentId={comment.id}
          updateMutation={updateMutation}
          sort={sort}
        />
      </div>
    )
  }

  return (
    <div className={cn('group relative', isReply ? 'py-3' : 'py-4')}>
      <div className="flex items-start gap-3">
        {/* 用户头像 */}
        <Avatar size={isReply ? 'default' : 'lg'} className="ring-2 ring-white/20">
          <AvatarImage src={comment.user?.image || undefined} alt={comment.user?.name || ''} />
          <AvatarFallback className={cn('text-white font-semibold', avatarColor)}>
            {comment.user?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          {/* 用户名和时间 */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-medium text-sm">{comment.user?.name || '未知用户'}</span>
            {comment.userId === articleAuthorId && (
              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                作者
              </span>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {/* 评论文本 */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* 操作按钮 */}
          <div
            className={cn(
              'flex items-center gap-2 mt-2',
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
              'transition-opacity duration-150'
            )}
          >
            {/* 点赞 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
              className={cn(
                'h-auto py-1 px-2 text-xs gap-1',
                comment.isLiked && 'text-red-500 hover:text-red-500'
              )}
            >
              <Heart className={cn('size-3.5', comment.isLiked && 'fill-current')} />
              <span className="tabular-nums">{comment.likeCount || 0}</span>
            </Button>

            {/* 回复按钮 - 仅顶层评论显示 */}
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="h-auto py-1 px-2 text-xs gap-1"
              >
                <Reply className="size-3.5" />
                <span>回复</span>
              </Button>
            )}

            {/* 编辑/删除下拉菜单 */}
            {(canEdit || canDelete) && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'size-6 flex items-center justify-center rounded',
                      'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                      'transition-colors duration-150',
                      dropdownOpen && 'opacity-100'
                    )}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="size-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 回复输入框 */}
          {isReplying && (
            <div className="mt-3">
              <CommentInput
                articleId={comment.articleId}
                parentId={comment.id}
                replyTo={comment.user?.name}
                onSuccess={() => setIsReplying(false)}
                onCancel={() => setIsReplying(false)}
                createMutation={createMutation}
                sort={sort}
              />
            </div>
          )}

          {/* 嵌套回复 */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-border/50 space-y-2">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  articleAuthorId={articleAuthorId}
                  currentUserId={currentUserId}
                  sort={sort}
                  onLike={onLike}
                  onUnlike={onUnlike}
                  onDelete={onDelete}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}