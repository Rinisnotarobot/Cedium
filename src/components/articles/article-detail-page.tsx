import { PageContainer } from "#/components/layout";
import { Badge } from "#/components/ui/badge";
import { Clock, ArrowLeft, Heart, Bookmark, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ArticleContent } from "./article-content";
import { CommentList } from "#/components/comments";
import { getAvatarColor } from "#/lib/utils/avatar-color";
import { estimateReadTime } from "#/lib/utils/article-content";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "#/components/ui/avatar";
import { cn } from "#/lib/utils";
import { Route } from "#/routes/_app/articles/$slug";
import { useQuery } from "@tanstack/react-query";
import { articleKeys } from "#/hooks/keys/article-keys";
import { useArticleInteraction } from "#/hooks";
import { getArticleByIdFn } from "#/data/articles";

export function ArticleDetailPage() {
  const loaderData = Route.useLoaderData();

  // 使用 useQuery 获取文章数据，以响应实时更新（如点赞计数）
  // loader 已将数据放入缓存，这里配合 queryFn 实现数据刷新
  const { data: article } = useQuery({
    queryKey: articleKeys.detail(loaderData.article.id),
    queryFn: () => getArticleByIdFn({ data: { id: loaderData.article.id } }),
    initialData: loaderData.article,
    staleTime: 1000 * 60 * 5, // 5 分钟内不重新请求
  });

  // 使用统一的交互 hook
  const { state, actions } = useArticleInteraction({ articleId: article.id });

  const avatarColor = getAvatarColor(article.author?.name || "");
  const readTime = estimateReadTime(article.content);

  return (
    <PageContainer width="3xl" variant="spaced">
      {/* 返回按钮 */}
      <header className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground"
        >
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
              <Avatar size="lg" className="ring-2 ring-white/20 hover:ring-primary/50 transition-all">
                <AvatarImage src={article.author?.image || undefined} alt={article.author?.name || ""} />
                <AvatarFallback className={avatarColor + " text-white font-semibold text-lg"}>
                  {article.author?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
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
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  to="/search"
                  search={{ q: tag.slug }}
                  className="transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
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
                onClick={actions.toggleLike}
                className={cn(
                  "gap-1.5",
                  state.isLiked && "text-red-500 hover:text-red-500",
                )}
              >
                <Heart className={cn("size-4", state.isLiked && "fill-current")} />
                <span className="tabular-nums">{article.likeCount || 0}</span>
              </Button>

              {/* 收藏按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.toggleBookmark}
                className={cn(
                  "gap-1.5",
                  state.isBookmarked && "text-primary hover:text-primary",
                )}
              >
                <Bookmark
                  className={cn("size-4", state.isBookmarked && "fill-current")}
                />
                <span>{state.isBookmarked ? "已收藏" : "收藏"}</span>
              </Button>

              {/* 评论计数 */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
              >
                <MessageCircle className="size-4" />
                <span className="tabular-nums">
                  {article.commentCount || 0}
                </span>
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

        {/* 评论区域 */}
        <section className="pt-8 border-t border-border">
          <CommentList
            articleId={article.id}
            articleAuthorId={article.authorId}
          />
        </section>
      </article>
    </PageContainer>
  );
}
