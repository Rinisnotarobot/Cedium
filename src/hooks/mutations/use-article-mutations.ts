import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { articleKeys } from "#/hooks/keys/article-keys";
import {
  createArticleFn,
  updateArticleFn,
  publishArticleFn,
  archiveArticleFn,
  deleteArticleFn,
} from "#/data/articles";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArchiveArticleInput,
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
    mutationFn: (id: string) => deleteArticleFn({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() });
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id) });
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
