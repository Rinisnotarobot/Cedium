import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "#/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "#/components/ui/avatar";
import { getAvatarColor } from "#/lib/utils/avatar-color";
import type { Comment } from "#/types/comment";

interface CommentContentProps {
  comment: Comment;
  articleAuthorId: string;
  isReply?: boolean;
}

export function CommentContent({
  comment,
  articleAuthorId,
  isReply = false,
}: CommentContentProps) {
  const avatarColor = getAvatarColor(comment.user?.name || "");
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div className="flex items-start gap-3">
      {/* 用户头像 */}
      <Avatar size={isReply ? "default" : "lg"} className="ring-2 ring-white/20">
        <AvatarImage
          src={comment.user?.image || undefined}
          alt={comment.user?.name || ""}
        />
        <AvatarFallback className={cn("text-white font-semibold", avatarColor)}>
          {comment.user?.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      {/* 评论内容 */}
      <div className="flex-1 min-w-0">
        {/* 用户名和时间 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-medium text-sm">
            {comment.user?.name || "未知用户"}
          </span>
          {comment.userId === articleAuthorId && (
            <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              作者
            </span>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>

        {/* 评论文本 */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}