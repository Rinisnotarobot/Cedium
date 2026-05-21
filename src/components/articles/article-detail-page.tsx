import { PageContainer } from "#/components/layout"
import { Skeleton } from "#/components/ui/skeleton"
import { Badge } from "#/components/ui/badge"
import { Clock, ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useArticle } from "#/hooks"
import { ArticleContent } from "./article-content"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { estimateReadTime } from "#/lib/utils/article-content"
import { Button } from "#/components/ui/button"
import { Route } from "#/routes/articles.$slug"

function ArticleDetailSkeleton() {
  return (
    <PageContainer width="3xl" variant="spaced">
      <header className="mb-8">
        <Skeleton className="h-4 w-16 mb-4" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </header>
      <main className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </main>
    </PageContainer>
  )
}

export function ArticleDetailPage() {
  const { slug } = Route.useParams()
  const { data, isLoading, error } = useArticle(slug)

  if (isLoading) {
    return <ArticleDetailSkeleton />
  }

  if (error || !data?.success || !data?.data) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <p className="text-muted-foreground mb-6">
            该文章可能已被删除或尚未发布
          </p>
          <Button variant="outline" asChild>
            <Link to="/articles">返回文章列表</Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  const article = data.data
  const avatarColor = getAvatarColor(article.author?.name || "")
  const readTime = estimateReadTime(article.content)

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

          {/* 分隔线 */}
          <div className="h-px bg-border" />
        </header>

        {/* 文章内容 */}
        <main className="min-h-[50vh]">
          <ArticleContent content={article.content} />
        </main>

        {/* 文章底部 */}
        <footer className="pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {article.publishedAt && (
                <Badge variant="outline" className="text-xs">
                  已发布
                </Badge>
              )}
            </div>
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