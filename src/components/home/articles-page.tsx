import { PageContainer, PageHeader } from "#/components/layout"
import { Route } from "#/routes/_app/articles"
import { MediumArticleCard } from "#/components/articles/medium-article-card"
import { useMultipleBookmarkStatus, useMultipleLikeStatus } from "#/hooks/queries"

export function ArticlesPage() {
  const data = Route.useLoaderData()

  const articles = data?.articles ?? []
  const total = data?.meta?.total ?? 0

  // 批量获取所有文章的收藏/点赞状态（解决 N+1 问题）
  const articleIds = articles.map((a) => a.id)
  const { data: bookmarkStatuses } = useMultipleBookmarkStatus(articleIds)
  const { data: likeStatuses } = useMultipleLikeStatus(articleIds)

  // 构建状态映射表
  const bookmarkMap = new Map(bookmarkStatuses?.map((s) => [s.articleId, s.isBookmarked]))
  const likeMap = new Map(likeStatuses?.map((s) => [s.articleId, s.isLiked]))

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

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="文章" description="探索技术、架构与工程实践" />

      {/* 文章列表 */}
      {articles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              全部文章
            </h2>
            <span className="text-xs text-muted-foreground/60 tabular-nums">
              {total} 篇
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {articles.map((article) => (
              <MediumArticleCard
                key={article.id}
                article={article}
                category={article.tags?.[0]?.slug}
                isBookmarked={bookmarkMap.get(article.id)}
                isLiked={likeMap.get(article.id)}
              />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}