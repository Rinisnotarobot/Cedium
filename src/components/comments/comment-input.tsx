import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'
import type { CommentSortType } from '#/types/comment'

interface CommentInputProps {
  articleId: string
  parentId?: string
  replyTo?: string
  initialContent?: string
  onSuccess: (content: string) => void
  onCancel?: () => void
  sort?: CommentSortType
  createMutation?: {
    mutate: (params: {
      articleId: string
      content: string
      parentId?: string
      sort: CommentSortType
    }) => void
  }
  updateMutation?: {
    mutate: (params: {
      id: string
      content: string
      articleId: string
      sort: CommentSortType
    }) => void
  }
  editCommentId?: string
  isEditMode?: boolean
}

export function CommentInput({
  articleId,
  parentId,
  replyTo,
  initialContent = '',
  onSuccess,
  onCancel,
  sort = 'oldest',
  createMutation,
  updateMutation,
  editCommentId,
  isEditMode = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialContent)
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const maxLength = 1000
  const charCount = content.length
  const isValid = content.trim().length > 0 && charCount <= maxLength

  const handleSubmit = () => {
    if (!isValid) return

    if (isEditMode && editCommentId && updateMutation) {
      updateMutation.mutate({
        id: editCommentId,
        content: content.trim(),
        articleId,
        sort,
      })
    } else if (createMutation) {
      createMutation.mutate({
        articleId,
        content: content.trim(),
        parentId,
        sort,
      })
    }

    onSuccess(content.trim())
    setContent('')
  }

  const handleCancel = () => {
    setContent(initialContent)
    onCancel?.()
  }

  // 未登录提示
  if (!session) {
    return (
      <div className="py-4">
        <div
          className={cn(
            'p-4 rounded-lg bg-muted/40 border border-border/50',
            'flex items-center justify-between gap-4'
          )}
        >
          <p className="text-sm text-muted-foreground">
            登录后即可发表评论
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/login' })}
          >
            登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      {/* 回复提示 */}
      {replyTo && !isEditMode && (
        <p className="text-sm text-muted-foreground mb-2">
          回复 <span className="font-medium text-foreground">@{replyTo}</span>
        </p>
      )}

      {/* 输入框 */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isEditMode ? '编辑评论...' : '发表您的看法...'}
        className={cn(
          'min-h-[80px] resize-none',
          'focus-visible:ring-primary/30'
        )}
        maxLength={maxLength}
      />

      {/* 底部操作区 */}
      <div className="flex items-center justify-between mt-2">
        {/* 字数统计 */}
        <span
          className={cn(
            'text-xs',
            charCount > maxLength ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {charCount}/{maxLength}
        </span>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {(onCancel || isEditMode) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isEditMode && content === initialContent}
            >
              取消
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {isEditMode ? '保存' : '发表'}
          </Button>
        </div>
      </div>
    </div>
  )
}