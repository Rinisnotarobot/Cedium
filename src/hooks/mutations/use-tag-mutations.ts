import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagKeys } from "#/hooks/keys/tag-keys";
import { createTagFn, ensureTagExistsFn } from "#/data/tags";
import { getErrorMessage } from "#/hooks/utils/get-error-message";
import type { CreateTagInput } from "#/lib/validators/tag";
import type { Tag } from "#/types/tag";

interface UseCreateTagOptions {
  onSuccess?: (tag: Tag) => void;
  onError?: (error: string) => void;
}

interface UseEnsureTagOptions {
  onSuccess?: (slug: string) => void;
  onError?: (error: string) => void;
}

/**
 * 创建标签 mutation hook
 */
export function useCreateTag(options?: UseCreateTagOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateTagInput) =>
      createTagFn({ data: variables }),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      toast.success("标签已创建");
      options?.onSuccess?.(tag);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

/**
 * 确保标签存在 mutation hook
 * - 返回标签 slug
 */
export function useEnsureTag(options?: UseEnsureTagOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateTagInput) =>
      ensureTagExistsFn({ data: variables }),
    onSuccess: (slug) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      options?.onSuccess?.(slug);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}