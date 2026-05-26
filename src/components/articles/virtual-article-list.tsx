import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  usePublishedArticlesInfinite,
  useMultipleBookmarkStatus,
  useMultipleLikeStatus,
} from "#/hooks/queries";
import { MediumArticleCard } from "./medium-article-card";

interface VirtualArticleListProps {
  containerHeight?: number | string;
  estimatedItemHeight?: number;
}

export function VirtualArticleList({
  containerHeight = "calc(100vh - 200px)",
  estimatedItemHeight = 120,
}: VirtualArticleListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePublishedArticlesInfinite(10);

  // 展平所有页面的文章
  const allArticles = data?.pages.flatMap((page) => page.articles) ?? [];

  // 批量获取收藏/点赞状态
  const articleIds = allArticles.map((a) => a.id);
  const { data: bookmarkStatuses } = useMultipleBookmarkStatus(articleIds, {
    enabled: allArticles.length > 0,
  });
  const { data: likeStatuses } = useMultipleLikeStatus(articleIds, {
    enabled: allArticles.length > 0,
  });

  const bookmarkMap = new Map(
    bookmarkStatuses?.map((s) => [s.articleId, s.isBookmarked]),
  );
  const likeMap = new Map(likeStatuses?.map((s) => [s.articleId, s.isLiked]));

  // 虚拟滚动配置
  const virtualizer = useVirtualizer({
    count: hasNextPage ? allArticles.length + 1 : allArticles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 3,
  });

  // 滚动到底部时触发加载
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    const lastItem = virtualItems.at(-1);
    if (!lastItem) return;

    if (
      lastItem.index >= allArticles.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualizer.getVirtualItems(),
    hasNextPage,
    isFetchingNextPage,
    allArticles.length,
    fetchNextPage,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载失败</p>
      </div>
    );
  }

  if (allArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无文章</p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          等待第一篇文章的发布...
        </p>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      style={{ height: containerHeight, overflow: "auto" }}
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {/* Block-translate wrapper for better performance */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
          className="px-3"
        >
          {virtualItems.map((virtualItem) => {
            const isLoader = virtualItem.index > allArticles.length - 1;
            const article = allArticles[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{ minHeight: `${virtualItem.size}px` }}
              >
                {isLoader ? (
                  <div className="flex items-center justify-center py-8">
                    {hasNextPage ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        <span className="text-sm">加载更多...</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        没有更多文章了
                      </span>
                    )}
                  </div>
                ) : (
                  <MediumArticleCard
                    article={article}
                    isBookmarked={bookmarkMap.get(article.id)}
                    isLiked={likeMap.get(article.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
