import { PageContainer } from "#/components/layout"
import { Badge } from "#/components/ui/badge"
import { Clock, ArrowLeft, Heart, Bookmark } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArticleContent } from "./article-content"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { estimateReadTime } from "#/lib/utils/article-content"
import { Button } from "#/components/ui/button"
import { cn } from "#/lib/utils"
import { Route } from "#/routes/articles.$slug"
import { useBookmarkStatus, useLikeStatus } from "#/hooks/queries"
import { useBookmarkArticle, useUnbookmarkArticle, useLikeArticle, useUnlikeArticle } from "#/hooks/mutations"
import { authClient } from "#/lib/auth-client"

export function ArticleDetailPage() {
  const { article } = Route.useLoaderData()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  // 获取收藏和点赞状态
  const { data: bookmarkStatus } = useBookmarkStatus(article.id)
  const { data: likeStatus } = useLikeStatus(article.id)

  // 获取 mutation hooks
  const bookmarkMutation = useBookmarkArticle()
  const unbookmarkMutation = useUnbookmarkArticle()
  const likeMutation = useLikeArticle()
  const unlikeMutation = useUnlikeArticle()

  const isBookmarked = bookmarkStatus?.isBookmarked ?? false
  const isLiked = likeStatus?.isLiked ?? false

  const avatarColor = getAvatarColor(article.author?.name || "")
  const readTime = estimateReadTime(article.content)

  const toggleBookmark = () => {
    if (!session) {
      navigate({ to: "/login" })
      return
    }

    if (isBookmarked) {
      unbookmarkMutation.mutate(article.id)
    } else {
      bookmarkMutation.mutate(article.id)
    }
  }

  const toggleLike = () => {
    if (!session) {
      navigate({ to: "/login" })
      return
    }

    if (isLiked) {
      unlikeMutation.mutate(article.id)
    } else {
      likeMutation.mutate(article.id)
    }
  }

  return (
    <PageContainer width="3xl" variant="spaced">
      {/* 返回按钮 */}
      <header className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link to="/articles">
            <ArrowLeft className="size-4 mr-1.5" />
            返回文章列表
          </Link>
        </Button>
      </header>

      {/* 文章标题 */}
      <article className="space-y-8">
        <header className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* 作者信息 */}
          <div className="flex items-center gap-4">
            <Link
              to="/users/$username"
              params={{ username: article.author?.name || "" }}
            >
              <div
                className={`size-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white/20 hover:ring-primary/50 transition-all`}
              >
                {article.author?.name?.charAt(0) || "?"}
              </div>
            </Link>
            <div className="flex flex-col">
              <Link
                to="/users/$username"
                params={{ username: article.author?.name || "" }}
                className="font-semibold hover:text-primary transition-colors"
              >
                {article.author?.name || "未知作者"}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {new Date(article.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{readTime} 分钟阅读</span>
                </div>
              </div>
            </div>
          </div>

          {/* 标签显示 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Link
                  key={tag.slug}
                  to="/articles"
                  search={{ tag: tag.slug }}
                  className="transition-colors"
                >
                  <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary">
                    #{tag.slug}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* 分隔线 */}
          <div className="h-px bg-border" />
        </header>

        {/* 文章内容 */}
        <main className="min-h-[50vh]">
          <ArticleContent content={article.content} />
        </main>

        {/* 文章底部 - 互动按钮 */}
        <footer className="pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            {/* 左侧：互动按钮 */}
            <div className="flex items-center gap-4">
              {/* 点赞按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                className={cn(
                  "gap-1.5",
                  isLiked && "text-red-500 hover:text-red-500"
                )}
              >
                <Heart className={cn("size-4", isLiked && "fill-current")} />
                <span className="tabular-nums">{article.likeCount || 0}</span>
              </Button>

              {/* 收藏按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                className={cn(
                  "gap-1.5",
                  isBookmarked && "text-primary hover:text-primary"
                )}
              >
                <Bookmark className={cn("size-4", isBookmarked && "fill-current")} />
                <span>{isBookmarked ? "已收藏" : "收藏"}</span>
              </Button>
            </div>

            {/* 右侧：返回按钮 */}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/articles">
                <ArrowLeft className="size-4 mr-1.5" />
                返回文章列表
              </Link>
            </Button>
          </div>
        </footer>
      </article>
    </PageContainer>
  )
}