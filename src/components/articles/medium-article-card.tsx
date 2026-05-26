import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import { timeAgo } from "#/lib/utils/time";
import { Bookmark, MoreHorizontal, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import type { Article } from "#/types/article";
import { useBookmarkStatus, useLikeStatus } from "#/hooks/queries";
import {
  useBookmarkArticle,
  useUnbookmarkArticle,
  useLikeArticle,
  useUnlikeArticle,
} from "#/hooks/mutations";
import { authClient } from "#/lib/auth-client";

interface MediumArticleCardProps {
  article: Article;
  category?: string;
  /** 批量状态：父组件提供时跳过个体查询 */
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export function MediumArticleCard({
  article,
  category,
  isBookmarked: propBookmarked,
  isLiked: propLiked,
}: MediumArticleCardProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // 仅在父组件未提供状态时启用个体查询（避免 N+1）
  const shouldFetchBookmark = propBookmarked === undefined;
  const shouldFetchLike = propLiked === undefined;

  const { data: bookmarkStatus } = useBookmarkStatus(article.id, {
    enabled: shouldFetchBookmark,
  });
  const { data: likeStatus } = useLikeStatus(article.id, {
    enabled: shouldFetchLike,
  });

  // 获取 mutation hooks（带错误回调以回滚乐观更新）
  const bookmarkMutation = useBookmarkArticle();
  const unbookmarkMutation = useUnbookmarkArticle();
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();

  // 状态来自 prop 或查询结果
  const isBookmarked = propBookmarked ?? bookmarkStatus?.isBookmarked ?? false;
  const isLiked = propLiked ?? likeStatus?.isLiked ?? false;

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({
      to: "/users/$username",
      params: { username: article.author?.name || "" },
    });
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    if (isBookmarked) {
      unbookmarkMutation.mutate(article.id);
    } else {
      bookmarkMutation.mutate(article.id);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
  };

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
          "-mx-3 px-3 rounded-lg",
          "transition-colors duration-150",
          "gap-3 lg:gap-6",
        )}
      >
        {/* 左侧：文字内容 */}
        <div className="flex-1 min-w-0">
          {/* 顶部发布信息栏 */}
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
            {category && <span className="truncate">{category}</span>}
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
              "text-base lg:text-xl",
              "line-clamp-3 lg:line-clamp-2",
              "transition-colors",
            )}
          >
            {article.title}
          </h2>

          {/* 摘要 - 桌面端显示 */}
          <p
            className={cn(
              "hidden lg:block",
              "text-muted-foreground text-sm leading-relaxed",
              "line-clamp-2",
            )}
          >
            {article.excerpt || "暂无摘要"}
          </p>

          {/* 底部互动栏 */}
          <div className="flex items-center justify-between mt-2">
            {/* 左侧：点赞 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLike}
                className={cn(
                  "flex items-center gap-1",
                  "text-muted-foreground hover:text-red-500 transition-colors",
                  isLiked && "text-red-500",
                )}
              >
                <Heart
                  className={cn(
                    "size-3.5 lg:size-4",
                    isLiked && "fill-current",
                  )}
                />
              </button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {article.likeCount}
              </span>
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
                  isBookmarked && "text-primary",
                )}
              >
                <Bookmark
                  className={cn(
                    "size-3.5 lg:size-4",
                    isBookmarked && "fill-current",
                  )}
                />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "size-7 lg:size-9 flex items-center justify-center rounded-md",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      "transition-colors",
                    )}
                  >
                    <MoreHorizontal className="size-3.5 lg:size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
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
              "lg:w-[140px] lg:h-[95px]",
            )}
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className={cn(
                "w-full h-full object-cover",
                "group-hover:scale-105 transition-transform duration-300",
              )}
            />
          </figure>
        )}
      </article>
    </Link>
  );
}
