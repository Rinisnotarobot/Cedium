import { PageContainer, PageHeader } from "#/components/layout"
import { Card, CardContent } from "#/components/ui/card"
import { Badge } from "#/components/ui/badge"
import { Skeleton } from "#/components/ui/skeleton"
import { Clock, ArrowUpRight } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useArticles } from "#/hooks"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { estimateReadTime } from "#/lib/utils/article-content"
import type { Article } from "#/types/article"

function ArticleCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeaturedArticleCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeaturedArticleCard({ article }: { article: Article }) {
  const avatarColor = getAvatarColor(article.author?.name || "")
  const navigate = useNavigate()

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate({ to: "/users/$username", params: { username: article.author?.name || "" } })
  }

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg hover:border-primary/40 transition-[shadow,border-color,transform] duration-300 cursor-pointer">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
              <button
                type="button"
                onClick={handleUserClick}
                className="shrink-0 cursor-pointer"
              >
                <div
                  className={`size-14 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white/20 hover:ring-primary/50 transition-all`}
                >
                  {article.author?.name?.charAt(0) || "?"}
                </div>
              </button>
              <Badge variant="default" className="bg-primary/90">
                精选
              </Badge>
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleUserClick}
                  className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {article.author?.name || "未知作者"}
                </button>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-muted-foreground">
                  {new Date(article.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>

              <h2 className="font-bold text-xl lg:text-2xl leading-tight group-hover:text-primary transition-colors text-wrap: balance">
                {article.title}
              </h2>

              <p className="text-muted-foreground leading-relaxed line-clamp-3 lg:line-clamp-2">
                {article.excerpt || "暂无摘要"}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>{estimateReadTime(article.content)} 分钟</span>
                </div>
                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[color,transform] duration-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ArticleCard({ article }: { article: Article }) {
  const avatarColor = getAvatarColor(article.author?.name || "")
  const navigate = useNavigate()

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate({ to: "/users/$username", params: { username: article.author?.name || "" } })
  }

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <Card className="hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 transition-[shadow,border-color,transform] duration-200 cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleUserClick}
              className="shrink-0 cursor-pointer"
            >
              <div
                className={`size-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-sm hover:ring-2 hover:ring-primary/50 transition-all`}
              >
                {article.author?.name?.charAt(0) || "?"}
              </div>
            </button>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={handleUserClick}
                  className="font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                >
                  {article.author?.name || "未知作者"}
                </button>
                <span className="text-muted-foreground/40">·</span>
                <span>{new Date(article.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>

              <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 text-wrap: balance">
                {article.title}
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {article.excerpt || "暂无摘要"}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{estimateReadTime(article.content)} 分钟</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ArticlesPage() {
  const { data, isLoading, error } = useArticles(1, 20)

  const articles = data?.data ?? []
  const total = data?.meta?.total ?? 0

  if (isLoading) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <PageHeader title="文章" description="探索技术、架构与工程实践" />
        <section className="mb-8 lg:mb-12">
          <FeaturedArticleCardSkeleton />
        </section>
        <section>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <PageHeader title="文章" description="探索技术、架构与工程实践" />
        <div className="text-center py-12 text-muted-foreground">
          加载失败，请稍后重试
        </div>
      </PageContainer>
    )
  }

  if (articles.length === 0) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <PageHeader title="文章" description="探索技术、架构与工程实践" />
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无文章</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            等待第一篇文章的发布...
          </p>
        </div>
      </PageContainer>
    )
  }

  const featuredArticles = articles.slice(0, 1)
  const regularArticles = articles.slice(1)

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="文章" description="探索技术、架构与工程实践" />

      {featuredArticles.length > 0 && (
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              精选推荐
            </h2>
          </div>
          <div className="space-y-4">
            {featuredArticles.map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {regularArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-muted-foreground/30 rounded-full" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              最新发布
            </h2>
            <span className="text-xs text-muted-foreground/60 ml-auto tabular-nums">
              {total} 篇
            </span>
          </div>
          <div className="space-y-3">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}