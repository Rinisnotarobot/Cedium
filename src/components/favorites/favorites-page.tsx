import { Link } from "@tanstack/react-router"
import { PageContainer, PageHeader } from "#/components/layout"
import { Badge } from "#/components/ui/badge"
import { Clock, Heart, Bookmark } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar"
import { Skeleton } from "#/components/ui/skeleton"
import { useMyBookmarks } from "#/hooks/queries"
import { useUnbookmarkArticle } from "#/hooks/mutations"
import type { BookmarkedArticle } from "#/types/bookmark"

function FavoriteCard({ article }: { article: BookmarkedArticle }) {
  const unbookmarkMutation = useUnbookmarkArticle()

  const handleRemove = () => {
    unbookmarkMutation.mutate(article.id)
  }

  return (
    <article className="flex gap-4 py-4 border-b border-border/20 hover:bg-muted/30 -mx-3 px-3 rounded-lg transition-colors">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={article.author?.image ?? undefined} />
        <AvatarFallback>{article.author?.name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">{article.author?.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{typeof article.bookmarkedAt === 'string' ? article.bookmarkedAt : new Date(article.bookmarkedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Link
          to="/articles/$slug"
          params={{ slug: article.slug }}
          className="block"
        >
          <h2 className="font-semibold leading-snug hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>
        </Link>

        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-1">
            {article.tags?.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {article.likeCount} 赞
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-primary hover:text-primary"
              onClick={handleRemove}
            >
              <Bookmark className="size-4 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 py-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Heart className="size-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">暂无收藏</p>
      <p className="text-sm text-muted-foreground mt-1">浏览文章时点击收藏按钮即可收藏</p>
      <Button variant="outline" className="mt-4" asChild>
        <Link to="/">探索文章</Link>
      </Button>
    </div>
  )
}

export function FavoritesPage() {
  const { data, isLoading, error } = useMyBookmarks()

  if (isLoading) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <PageHeader
          title="收藏"
          description="您收藏的文章列表"
        />
        <LoadingState />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer width="3xl" variant="spaced">
        <PageHeader
          title="收藏"
          description="您收藏的文章列表"
        />
        <div className="text-center py-12">
          <p className="text-destructive">加载失败</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </PageContainer>
    )
  }

  const bookmarks = data?.bookmarks || []
  const total = data?.meta?.total || 0

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader
        title="收藏"
        description="您收藏的文章列表"
      />

      {bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground tabular-nums">
              {total} 篇收藏
            </span>
          </div>
          <div className="divide-y divide-border/20">
            {bookmarks.map((article) => (
              <FavoriteCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  )
}