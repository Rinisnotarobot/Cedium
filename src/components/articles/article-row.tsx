import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { cn } from "#/lib/utils"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { Clock, Edit3, Trash2, Send, Archive, RotateCcw, Eye, MoreHorizontal } from "lucide-react"
import { ArticleStatus } from "#/generated/prisma/enums"
import type { Article } from "#/types/article"

type ArticleAction = "delete" | "publish" | "unpublish" | "archive" | "restore"

interface ArticleRowProps {
  article: Article
  status: ArticleStatus
  onAction: (action: ArticleAction, id: string) => void
}

const STATUS_TEXT: Record<ArticleStatus, string> = {
  [ArticleStatus.DRAFT]: "草稿",
  [ArticleStatus.PUBLISHED]: "已发布",
  [ArticleStatus.ARCHIVED]: "已归档",
}

export function ArticleRow({ article, status, onAction }: ArticleRowProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wordCount = article.content?.length ?? 0
  const updatedAt = new Date(article.updatedAt).toLocaleDateString("zh-CN")

  return (
    <div className={cn(
      "group flex items-center justify-between py-4 px-2 -mx-2 rounded-lg",
      "transition-[background-color] duration-150 ease-out",
      "hover:bg-muted/40",
      dropdownOpen && "bg-muted/40"
    )}>
      {/* 左侧：标题和元信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {status === ArticleStatus.DRAFT ? (
            <Link
              to="/write"
              search={{ id: article.id }}
              className={cn(
                "font-medium leading-snug truncate",
                "transition-[color] duration-150 ease-out",
                "hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-sm"
              )}
            >
              {article.title || "无标题"}
            </Link>
          ) : (
            <Link
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className={cn(
                "font-medium leading-snug truncate",
                "transition-[color] duration-150 ease-out",
                "hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-sm"
              )}
            >
              {article.title || "无标题"}
            </Link>
          )}
          <span className="text-xs text-muted-foreground/60 shrink-0">
            {STATUS_TEXT[status]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="tabular-nums">{wordCount} 字</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 opacity-60" />
            <span>{updatedAt}</span>
          </span>
          {article.excerpt && (
            <span className="truncate max-w-[200px] opacity-60 text-wrap-pretty">
              {article.excerpt}
            </span>
          )}
        </div>
      </div>

      {/* 右侧：操作 */}
      <div className={cn(
        "flex items-center shrink-0 gap-1",
        "opacity-0 translate-x-2",
        "group-hover:opacity-100 group-hover:translate-x-0",
        "group-focus-within:opacity-100 group-focus-within:translate-x-0",
        dropdownOpen && "opacity-100 translate-x-0",
        "transition-[opacity,transform] duration-200 ease-out"
      )}>
        {status === ArticleStatus.DRAFT && (
          <>
            <ActionButton asChild>
              <Link to="/write" search={{ id: article.id }}>
                <Edit3 className="size-3.5 mr-1.5" />
                编辑
              </Link>
            </ActionButton>
            <ActionButton onClick={() => onAction("publish", article.id)}>
              <Send className="size-3.5 mr-1.5" />
              发布
            </ActionButton>
          </>
        )}
        {status === ArticleStatus.PUBLISHED && (
          <>
            <ActionButton asChild>
              <Link to="/articles/$slug" params={{ slug: article.slug }}>
                <Eye className="size-3.5 mr-1.5" />
                查看
              </Link>
            </ActionButton>
            <ActionButton asChild>
              <Link to="/write" search={{ id: article.id }}>
                <Edit3 className="size-3.5 mr-1.5" />
                编辑
              </Link>
            </ActionButton>
          </>
        )}
        {status === ArticleStatus.ARCHIVED && (
          <>
            <ActionButton asChild>
              <Link to="/articles/$slug" params={{ slug: article.slug }}>
                <Eye className="size-3.5 mr-1.5" />
                查看
              </Link>
            </ActionButton>
            <ActionButton onClick={() => onAction("restore", article.id)}>
              <Send className="size-3.5 mr-1.5" />
              恢复
            </ActionButton>
          </>
        )}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "size-9 flex items-center justify-center rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                "focus-visible:ring-2 focus-visible:ring-ring/50",
                "transition-[color,background-color] duration-150 ease-out",
                "active:scale-[0.95]"
              )}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {status === ArticleStatus.DRAFT && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onAction("delete", article.id)}
              >
                <Trash2 className="size-4 mr-2" />
                删除
              </DropdownMenuItem>
            )}
            {status === ArticleStatus.PUBLISHED && (
              <>
                <DropdownMenuItem onClick={() => onAction("unpublish", article.id)}>
                  <RotateCcw className="size-4 mr-2" />
                  撤销发布
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("archive", article.id)}>
                  <Archive className="size-4 mr-2" />
                  归档
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onAction("delete", article.id)}
                >
                  <Trash2 className="size-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </>
            )}
            {status === ArticleStatus.ARCHIVED && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onAction("delete", article.id)}
              >
                <Trash2 className="size-4 mr-2" />
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// 动作按钮组件 - 确保一致的样式和触感
function ActionButton({
  children,
  onClick,
  asChild
}: {
  children: React.ReactNode
  onClick?: () => void
  asChild?: boolean
}) {
  const baseClasses = cn(
    "h-9 px-3.5 text-xs font-medium",
    "rounded-md border border-transparent",
    "text-muted-foreground hover:text-foreground hover:border-border/40 hover:bg-muted/40",
    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
    "transition-[color,background-color,border-color] duration-150 ease-out",
    "active:scale-[0.97]"
  )

  if (asChild) {
    return (
      <Button variant="ghost" size="sm" className={baseClasses} asChild>
        {children}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" className={baseClasses} onClick={onClick}>
      {children}
    </Button>
  )
}