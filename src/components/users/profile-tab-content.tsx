import { MediumArticleCard } from "#/components/articles/medium-article-card"
import { cn } from "#/lib/utils"
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

export function ProfileTabContent({
  activeTab,
  articles,
  author,
  variant = "desktop",
}: ProfileTabContentProps) {
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
                <MediumArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "activity" && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">暂无活动记录</p>
        </div>
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