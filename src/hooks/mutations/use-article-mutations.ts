import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { articleKeys } from "#/hooks/keys/article-keys";
import {
  createArticleFn,
  updateArticleFn,
  publishArticleFn,
  archiveArticleFn,
  deleteArticleFn,
  unpublishArticleFn,
  restoreArticleFn,
} from "#/data/articles";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArchiveArticleInput,
  UnpublishArticleInput,
  RestoreArticleInput,
  DeleteArticleInput,
} from "#/lib/validators/article";
import type { Article } from "#/types/article";
import { getErrorMessage } from "#/hooks/utils/get-error-message";

interface UseCreateArticleOptions {
  onSuccess?: (article: Article) => void;
  onError?: (error: string) => void;
}

interface UseUpdateArticleOptions {
  onSuccess?: (article: Article) => void;
  onError?: (error: string) => void;
}

interface UsePublishArticleOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseArchiveArticleOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseDeleteArticleOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseUnpublishArticleOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseRestoreArticleOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useCreateArticle(options?: UseCreateArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateArticleInput) =>
      createArticleFn({ data: variables }),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      toast.success("文章已创建");
      options?.onSuccess?.(article);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function useUpdateArticle(options?: UseUpdateArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateArticleInput) =>
      updateArticleFn({ data: variables }),
    onSuccess: (article, variables) => {
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      toast.success("文章已更新");
      options?.onSuccess?.(article);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function usePublishArticle(options?: UsePublishArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: PublishArticleInput) =>
      publishArticleFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      toast.success("文章已发布");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function useArchiveArticle(options?: UseArchiveArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: ArchiveArticleInput) =>
      archiveArticleFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      toast.success("文章已归档");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function useDeleteArticle(options?: UseDeleteArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeleteArticleInput) =>
      deleteArticleFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) });
      toast.success("文章已删除");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function useUnpublishArticle(options?: UseUnpublishArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UnpublishArticleInput) =>
      unpublishArticleFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.stats() });
      toast.success("文章已撤销发布");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}

export function useRestoreArticle(options?: UseRestoreArticleOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: RestoreArticleInput) =>
      restoreArticleFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: articleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: articleKeys.stats() });
      toast.success("文章已恢复发布");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
}
