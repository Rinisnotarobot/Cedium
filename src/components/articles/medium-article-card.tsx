import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { cn } from "#/lib/utils"
import { timeAgo } from "#/lib/utils/time"
import { Bookmark, MoreHorizontal, Heart, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import type { Article } from "#/types/article"

interface MediumArticleCardProps {
  article: Article
  category?: string
}

export function MediumArticleCard({ article, category }: MediumArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate({
      to: "/users/$username",
      params: { username: article.author?.name || "" },
    })
  }

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <article
        className={cn(
          "group flex items-start justify-between",
          "py-4 border-b border-border/20",
          "hover:bg-muted/30 -mx-3 px-3 rounded-lg",
          "transition-colors duration-150",
          // 移动端：紧凑间距
          "gap-3 lg:gap-6"
        )}
      >
        {/* 左侧：文字内容 */}
        <div className="flex-1 min-w-0">
          {/* 顶部发布信息栏 */}
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
            {category && (
              <span className="truncate">{category}</span>
            )}
            {!category && article.author?.name && (
              <>
                <button
                  type="button"
                  onClick={handleUserClick}
                  className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[120px]"
                >
                  {article.author.name}
                </button>
                <span>·</span>
              </>
            )}
            <span className="shrink-0">{timeAgo(article.createdAt)}</span>
          </div>

          {/* 标题 */}
          <h2
            className={cn(
              "font-bold leading-snug mb-1.5",
              // 移动端：标题更紧凑，折行更多
              "text-base lg:text-xl",
              "line-clamp-3 lg:line-clamp-2",
              "group-hover:text-primary transition-colors"
            )}
          >
            {article.title}
          </h2>

          {/* 摘要 - 桌面端显示 */}
          <p
            className={cn(
              "hidden lg:block",
              "text-muted-foreground text-sm leading-relaxed",
              "line-clamp-2"
            )}
          >
            {article.excerpt || "暂无摘要"}
          </p>

          {/* 底部互动栏 */}
          <div className="flex items-center justify-between mt-2">
            {/* 左侧：收藏/点赞 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="size-3.5 lg:size-4 text-yellow-500" />
              </div>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 text-muted-foreground",
                  "hover:text-foreground transition-colors"
                )}
              >
                <Heart className="size-3.5 lg:size-4" />
              </button>
            </div>

            {/* 右侧：操作 */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={toggleBookmark}
                className={cn(
                  "size-7 lg:size-9 flex items-center justify-center rounded-md",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  "transition-colors",
                  isBookmarked && "text-primary"
                )}
              >
                <Bookmark
                  className={cn("size-3.5 lg:size-4", isBookmarked && "fill-current")}
                />
              </button>
              <DropdownMenu
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "size-7 lg:size-9 flex items-center justify-center rounded-md",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      "transition-colors"
                    )}
                  >
                    <MoreHorizontal className="size-3.5 lg:size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem>收藏文章</DropdownMenuItem>
                  <DropdownMenuItem>分享</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    不感兴趣
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* 右侧：封面图片 */}
        {article.coverImage && (
          <figure
            className={cn(
              "shrink-0 relative overflow-hidden rounded-md",
              // 移动端：缩略图更小
              "w-[72px] h-[54px]",
              "lg:w-[140px] lg:h-[95px]"
            )}
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className={cn(
                "w-full h-full object-cover",
                "group-hover:scale-105 transition-transform duration-300"
              )}
            />
          </figure>
        )}
      </article>
    </Link>
  )
}