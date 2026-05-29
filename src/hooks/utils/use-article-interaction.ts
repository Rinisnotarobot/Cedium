import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { useBookmarkStatus, useLikeStatus } from "#/hooks/queries";
import {
  useBookmarkArticle,
  useUnbookmarkArticle,
  useLikeArticle,
  useUnlikeArticle,
} from "#/hooks/mutations";

interface UseArticleInteractionOptions {
  articleId: string;
  /** 跳过个体查询 - 父组件提供时避免 N+1 */
  initialBookmarked?: boolean;
  initialLiked?: boolean;
}

interface ArticleInteractionState {
  isBookmarked: boolean;
  isLiked: boolean;
  isPending: boolean;
}

interface ArticleInteractionActions {
  toggleBookmark: (e?: React.MouseEvent) => void;
  toggleLike: (e?: React.MouseEvent) => void;
}

interface UseArticleInteractionReturn {
  state: ArticleInteractionState;
  actions: ArticleInteractionActions;
}

export function useArticleInteraction({
  articleId,
  initialBookmarked,
  initialLiked,
}: UseArticleInteractionOptions): UseArticleInteractionReturn {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // 条件查询：父组件提供状态时跳过（避免 N+1）
  const shouldFetchBookmark = initialBookmarked === undefined;
  const shouldFetchLike = initialLiked === undefined;

  const { data: bookmarkStatus } = useBookmarkStatus(articleId, {
    enabled: shouldFetchBookmark,
  });
  const { data: likeStatus } = useLikeStatus(articleId, {
    enabled: shouldFetchLike,
  });

  // Mutation hooks
  const bookmarkMutation = useBookmarkArticle();
  const unbookmarkMutation = useUnbookmarkArticle();
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();

  // 状态来自 prop 或查询结果
  const isBookmarked = initialBookmarked ?? bookmarkStatus?.isBookmarked ?? false;
  const isLiked = initialLiked ?? likeStatus?.isLiked ?? false;

  // 计算 pending 状态
  const isPending =
    bookmarkMutation.isPending ||
    unbookmarkMutation.isPending ||
    likeMutation.isPending ||
    unlikeMutation.isPending;

  // 登录检查
  const requireAuth = (e?: React.MouseEvent): boolean => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!session) {
      navigate({ to: "/login" });
      return false;
    }
    return true;
  };

  // Toggle 收藏
  const toggleBookmark = (e?: React.MouseEvent): void => {
    if (!requireAuth(e)) return;
    if (isBookmarked) {
      unbookmarkMutation.mutate(articleId);
    } else {
      bookmarkMutation.mutate(articleId);
    }
  };

  // Toggle 点赞
  const toggleLike = (e?: React.MouseEvent): void => {
    if (!requireAuth(e)) return;
    if (isLiked) {
      unlikeMutation.mutate(articleId);
    } else {
      likeMutation.mutate(articleId);
    }
  };

  return {
    state: { isBookmarked, isLiked, isPending },
    actions: { toggleBookmark, toggleLike },
  };
}