import { cn } from '#/lib/utils'
import { useCommentInteraction } from '#/hooks'
import { CommentContent, CommentActions, CommentEditForm, CommentReplyInput } from './comment-card/index'
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
  const { state, actions, permission } = useCommentInteraction({
    comment,
    currentUserId,
    articleAuthorId,
    onLike,
    onUnlike,
    onDelete,
  })

  // 编辑模式 - 返回编辑表单
  if (state.isEditing) {
    return (
      <CommentEditForm
        comment={comment}
        sort={sort}
        onSuccess={actions.cancelEdit}
        onCancel={actions.cancelEdit}
      />
    )
  }

  return (
    <div className={cn('group relative', isReply ? 'py-3' : 'py-4')}>
      <CommentContent
        comment={comment}
        articleAuthorId={articleAuthorId}
        isReply={isReply}
      />

      <CommentActions
        comment={comment}
        isReply={isReply}
        canEdit={permission.canEdit}
        canDelete={permission.canDelete}
        onLike={actions.handleToggleLike}
        onReply={actions.startReply}
        onEdit={actions.startEdit}
        onDelete={actions.handleDelete}
        dropdownOpen={state.dropdownOpen}
        onDropdownChange={actions.setDropdownOpen}
      />

      {/* 回复输入框 */}
      {state.isReplying && (
        <CommentReplyInput
          comment={comment}
          sort={sort}
          onSuccess={actions.cancelReply}
          onCancel={actions.cancelReply}
        />
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
  )
}