import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Heart, Reply } from "lucide-react";
import type { Comment } from "#/types/comment";

interface CommentActionsProps {
  comment: Comment;
  isReply?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dropdownOpen: boolean;
  onDropdownChange: (open: boolean) => void;
}

export function CommentActions({
  comment,
  isReply,
  canEdit,
  canDelete,
  onLike,
  onReply,
  onEdit,
  onDelete,
  dropdownOpen,
  onDropdownChange,
}: CommentActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-2",
        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        "transition-opacity duration-150"
      )}
    >
      {/* 点赞 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={cn(
          "h-auto py-1 px-2 text-xs gap-1",
          comment.isLiked && "text-red-500 hover:text-red-500"
        )}
      >
        <Heart className={cn("size-3.5", comment.isLiked && "fill-current")} />
        <span className="tabular-nums">{comment.likeCount || 0}</span>
      </Button>

      {/* 回复按钮 - 仅顶层评论显示 */}
      {!isReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReply}
          className="h-auto py-1 px-2 text-xs gap-1"
        >
          <Reply className="size-3.5" />
          <span>回复</span>
        </Button>
      )}

      {/* 编辑/删除下拉菜单 */}
      {(canEdit || canDelete) && (
        <CommentDropdown
          open={dropdownOpen}
          onOpenChange={onDropdownChange}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";

interface CommentDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function CommentDropdown({
  open,
  onOpenChange,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: CommentDropdownProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "size-6 flex items-center justify-center rounded",
            "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            "transition-colors duration-150",
            open && "opacity-100"
          )}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="size-4 mr-2" />
            编辑
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4 mr-2" />
            删除
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}