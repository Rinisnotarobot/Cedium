import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { articleKeys } from '#/hooks/keys/article-keys'
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArchiveArticleInput,
} from '#/lib/validators/article'
import type { Article } from '#/types/article'
import { getErrorMessage } from '#/hooks/utils/get-error-message'

interface CreateArticleResult {
  article: Article
}

interface UpdateArticleResult {
  article: Article
}

interface UseCreateArticleOptions {
  onSuccess?: (article: Article) => void
  onError?: (error: string) => void
}

interface UseUpdateArticleOptions {
  onSuccess?: (article: Article) => void
  onError?: (error: string) => void
}

interface UsePublishArticleOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseArchiveArticleOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseDeleteArticleOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

async function createArticle(variables: CreateArticleInput): Promise<CreateArticleResult> {
  const res = await fetch('/api/articles/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })

  const result = await res.json()

  if (!result.success) {
    throw new Error(result.error || '创建失败')
  }

  return { article: result.data }
}

async function updateArticle(variables: UpdateArticleInput): Promise<UpdateArticleResult> {
  const res = await fetch(`/api/articles/${variables.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })

  const result = await res.json()

  if (!result.success) {
    throw new Error(result.error || '更新失败')
  }

  return { article: result.data }
}

async function publishArticle(variables: PublishArticleInput): Promise<void> {
  const res = await fetch('/api/articles/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })

  const result = await res.json()

  if (!result.success) {
    throw new Error(result.error || '发布失败')
  }
}

async function archiveArticle(variables: ArchiveArticleInput): Promise<void> {
  const res = await fetch('/api/articles/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  })

  const result = await res.json()

  if (!result.success) {
    throw new Error(result.error || '归档失败')
  }
}

async function deleteArticle(id: string): Promise<void> {
  const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
  const result = await res.json()

  if (!result.success) {
    throw new Error(result.error || '删除失败')
  }
}

export function useCreateArticle(options?: UseCreateArticleOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() })
      toast.success('文章已创建')
      options?.onSuccess?.(data.article)
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}

export function useUpdateArticle(options?: UseUpdateArticleOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateArticle,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() })
      toast.success('文章已更新')
      options?.onSuccess?.(data.article)
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}

export function usePublishArticle(options?: UsePublishArticleOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishArticle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      toast.success('文章已发布')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}

export function useArchiveArticle(options?: UseArchiveArticleOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveArticle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      toast.success('文章已归档')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}

export function useDeleteArticle(options?: UseDeleteArticleOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.myArticles() })
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(id) })
      toast.success('文章已删除')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}