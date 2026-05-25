import { Link } from "@tanstack/react-router"
import { MediumArticleCard } from "#/components/articles/medium-article-card"
import { cn } from "#/lib/utils"
import { Heart, Bookmark } from "lucide-react"
import { useMyLikes, useMultipleBookmarkStatus, useMultipleLikeStatus } from "#/hooks/queries"
import { Skeleton } from "#/components/ui/skeleton"
import type { Article } from "#/types/article"

interface ProfileTabContentProps {
  activeTab: string
  articles: Article[]
  author: {
    id: string
    name: string
    image: string | null
    bio: string | null
  } | null
  variant?: "desktop" | "mobile"
}

function ActivityLoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 py-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityItem({ activity }: { activity: { type: 'like'; article: { id: string; title: string; slug: string; excerpt: string | null }; createdAt: Date | string } }) {
  const icon = activity.type === 'like' ? Heart : Bookmark
  const text = activity.type === 'like' ? '赞了' : '收藏了'
  const IconComponent = icon

  return (
    <div className="flex gap-3 py-3 border-b border-border/20">
      <div className="shrink-0 size-6 rounded-full bg-muted flex items-center justify-center">
        <IconComponent className={cn("size-3", activity.type === 'like' && "text-red-500")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">
          {text} · {typeof activity.createdAt === 'string' ? activity.createdAt : new Date(activity.createdAt).toLocaleDateString()}
        </p>
        <Link
          to="/articles/$slug"
          params={{ slug: activity.article.slug }}
          className="block"
        >
          <h3 className="font-medium leading-snug hover:text-primary transition-colors line-clamp-2">
            {activity.article.title}
          </h3>
        </Link>
        {activity.article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {activity.article.excerpt}
          </p>
        )}
      </div>
    </div>
  )
}

export function ProfileTabContent({
  activeTab,
  articles,
  author,
  variant = "desktop",
}: ProfileTabContentProps) {
  // 获取用户活动记录（点赞列表）- 仅在 activity tab 活跃时启用
  const { data: likesData, isLoading: likesLoading } = useMyLikes(1, 10, { enabled: activeTab === "activity" })

  // 批量获取文章列表的收藏/点赞状态 - 仅在 home tab 活跃时启用（解决 N+1 问题）
  const articleIds = articles.map((a) => a.id)
  const isHomeTab = activeTab === "home" && articleIds.length > 0
  const { data: bookmarkStatuses } = useMultipleBookmarkStatus(articleIds, { enabled: isHomeTab })
  const { data: likeStatuses } = useMultipleLikeStatus(articleIds, { enabled: isHomeTab })

  const bookmarkMap = new Map(bookmarkStatuses?.map((s) => [s.articleId, s.isBookmarked]))
  const likeMap = new Map(likeStatuses?.map((s) => [s.articleId, s.isLiked]))

  return (
    <>
      {activeTab === "home" && (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                该用户暂无公开发布的文章
              </p>
            </div>
          ) : (
            <div className={cn(variant === "desktop" && "divide-y divide-border/20")}>
              {articles.map((article) => (
                <MediumArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarkMap.get(article.id)}
                  isLiked={likeMap.get(article.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "activity" && (
        <>
          {likesLoading ? (
            <ActivityLoadingState />
          ) : likesData?.likes?.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">暂无活动记录</p>
              <p className="text-sm text-muted-foreground mt-1">点赞文章后会在这里显示</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {likesData?.likes?.map((like) => (
                <ActivityItem
                  key={like.id}
                  activity={{
                    type: 'like',
                    article: like,
                    createdAt: like.likedAt,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "lists" && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">暂无公开列表</p>
        </div>
      )}

      {activeTab === "about" && (
        <div className="py-8">
          {author?.bio ? (
            <div className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              该用户暂无个人介绍
            </p>
          )}
        </div>
      )}
    </>
  )
}