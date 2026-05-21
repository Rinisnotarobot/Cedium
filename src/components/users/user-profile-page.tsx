import { PageContainer } from "#/components/layout"
import { Card, CardContent } from "#/components/ui/card"
import { Skeleton } from "#/components/ui/skeleton"
import { Clock } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useArticlesByAuthor } from "#/hooks"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { estimateReadTime } from "#/lib/utils/article-content"
import { Button } from "#/components/ui/button"
import { Route } from "#/routes/users.$username"
import type { Article } from "#/types/article"

function UserProfileSkeleton() {
  return (
    <PageContainer width="3xl" variant="spaced">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </header>
      <section>
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}

function UserArticleCard({ article }: { article: Article }) {
  const avatarColor = getAvatarColor(article.author?.name || "")

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="block"
    >
      <Card className="hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 transition-[shadow,border-color,transform] duration-200 cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div
              className={`size-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-sm shrink-0`}
            >
              {article.author?.name?.charAt(0) || "?"}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(article.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>

              <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
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

export function UserProfilePage() {
  const { username } = Route.useParams()
  const { data, isLoading, error } = useArticlesByAuthor(username, 1, 20)

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (error || !data?.success) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">用户不存在</h1>
          <p className="text-muted-foreground mb-6">
            该用户可能尚未注册或用户名不正确
          </p>
          <Button variant="outline" asChild>
            <Link to="/articles">返回文章列表</Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  const articles = data.data ?? []
  const total = data.meta?.total ?? 0
  const author = data.author
  const avatarColor = getAvatarColor(author?.name || "")

  return (
    <PageContainer width="3xl" variant="spaced">
      {/* 用户信息 */}
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`size-16 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-xl ring-2 ring-white/20`}
          >
            {author?.name?.charAt(0) || "?"}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{author?.name || "未知用户"}</h1>
            {author?.bio && (
              <p className="text-muted-foreground mt-1">{author.bio}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <span>{total} 篇文章</span>
            </div>
          </div>
        </div>
      </header>

      {/* 文章列表 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            发布的文章
          </h2>
          <span className="text-xs text-muted-foreground/60 ml-auto tabular-nums">
            {total} 篇
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">该用户暂无公开发布的文章</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <UserArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* 底部导航 */}
      <footer className="pt-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/articles">
            <Clock className="size-4 mr-1.5" />
            查看全部文章
          </Link>
        </Button>
      </footer>
    </PageContainer>
  )
}