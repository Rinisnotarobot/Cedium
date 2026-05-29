import { useState, useCallback } from "react";
import type { Comment } from "#/types/comment";

interface UseCommentInteractionOptions {
  comment: Comment;
  currentUserId: string | null;
  articleAuthorId: string;
  onLike: (commentId: string) => void;
  onUnlike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

interface CommentInteractionState {
  isEditing: boolean;
  isReplying: boolean;
  dropdownOpen: boolean;
}

interface CommentInteractionActions {
  startEdit: () => void;
  cancelEdit: () => void;
  startReply: () => void;
  cancelReply: () => void;
  toggleDropdown: () => void;
  setDropdownOpen: (open: boolean) => void;
  handleToggleLike: () => void;
  handleDelete: () => void;
}

interface CommentPermission {
  canEdit: boolean;
  canDelete: boolean;
  isArticleAuthor: boolean;
}

interface UseCommentInteractionReturn {
  state: CommentInteractionState;
  actions: CommentInteractionActions;
  permission: CommentPermission;
}

export function useCommentInteraction({
  comment,
  currentUserId,
  articleAuthorId,
  onLike,
  onUnlike,
  onDelete,
}: UseCommentInteractionOptions): UseCommentInteractionReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 权限计算
  const isOwner = currentUserId === comment.userId;
  const isArticleAuthor = currentUserId === articleAuthorId;
  const canEdit = isOwner;
  const canDelete = isOwner || isArticleAuthor;

  // Actions
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setIsReplying(false);
    setDropdownOpen(false);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const startReply = useCallback(() => {
    setIsReplying(true);
    setIsEditing(false);
  }, []);

  const cancelReply = useCallback(() => {
    setIsReplying(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleToggleLike = useCallback(() => {
    if (comment.isLiked) {
      onUnlike(comment.id);
    } else {
      onLike(comment.id);
    }
  }, [comment.id, comment.isLiked, onLike, onUnlike]);

  const handleDelete = useCallback(() => {
    onDelete(comment.id);
    setDropdownOpen(false);
  }, [comment.id, onDelete]);

  return {
    state: { isEditing, isReplying, dropdownOpen },
    actions: {
      startEdit,
      cancelEdit,
      startReply,
      cancelReply,
      toggleDropdown,
      setDropdownOpen,
      handleToggleLike,
      handleDelete,
    },
    permission: { canEdit, canDelete, isArticleAuthor },
  };
}