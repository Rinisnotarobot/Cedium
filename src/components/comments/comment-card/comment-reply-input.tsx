import { CommentInput } from "../comment-input";
import { useCreateComment } from "#/hooks/mutations";
import type { Comment, CommentSortType } from "#/types/comment";

interface CommentReplyInputProps {
  comment: Comment;
  sort: CommentSortType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CommentReplyInput({
  comment,
  sort,
  onSuccess,
  onCancel,
}: CommentReplyInputProps) {
  const createMutation = useCreateComment();

  return (
    <div className="mt-3">
      <CommentInput
        articleId={comment.articleId}
        parentId={comment.id}
        replyTo={comment.user?.name}
        onSuccess={onSuccess}
        onCancel={onCancel}
        createMutation={createMutation}
        sort={sort}
      />
    </div>
  );
}