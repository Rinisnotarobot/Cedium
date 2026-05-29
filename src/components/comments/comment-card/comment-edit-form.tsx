import { CommentInput } from "../comment-input";
import { useUpdateComment } from "#/hooks/mutations";
import type { Comment, CommentSortType } from "#/types/comment";

interface CommentEditFormProps {
  comment: Comment;
  sort: CommentSortType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CommentEditForm({
  comment,
  sort,
  onSuccess,
  onCancel,
}: CommentEditFormProps) {
  const updateMutation = useUpdateComment();

  return (
    <div className="py-4">
      <CommentInput
        articleId={comment.articleId}
        initialContent={comment.content}
        onSuccess={onSuccess}
        onCancel={onCancel}
        isEditMode
        editCommentId={comment.id}
        updateMutation={updateMutation}
        sort={sort}
      />
    </div>
  );
}