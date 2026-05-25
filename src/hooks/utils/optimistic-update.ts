import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from './get-error-message'
import type { UseMutationOptions } from '../types'

/**
 * 批量状态项类型 - 用于 like/bookmark/comment 的批量状态查询
 */
type BatchStatusItem = Record<string, string | boolean>

/**
 * 批量更新缓存中匹配 base key 的所有查询的状态
 */
export function updateBatchStatusInCache(
  queryClient: QueryClient,
  baseKey: readonly unknown[],
  itemId: string,
  statusField: string,
  newStatus: boolean
): void {
  queryClient.getQueryCache().findAll({ queryKey: baseKey as unknown[] }).forEach((query) => {
    const data = query.state.data as BatchStatusItem[] | undefined
    if (data && Array.isArray(data) && data.length > 0) {
      const idField = 'articleId' in data[0] ? 'articleId' : 'commentId'
      const hasChange = data.some((item) => item[idField] === itemId)
      if (hasChange) {
        const updated = data.map((item) =>
          item[idField] === itemId ? { ...item, [statusField]: newStatus } : item
        )
        queryClient.setQueryData(query.queryKey, updated)
      }
    }
  })
}

/**
 * 回滚批量状态缓存
 */
export function rollbackBatchStatusInCache(
  queryClient: QueryClient,
  baseKey: readonly unknown[],
  itemId: string,
  statusField: string,
  previousStatus: boolean
): void {
  updateBatchStatusInCache(queryClient, baseKey, itemId, statusField, previousStatus)
}

/**
 * 创建 toggle mutation 的 onMutate 处理函数
 */
export function createToggleOnMutate<TStatus extends Record<string, boolean>>(
  queryClient: QueryClient,
  config: {
    statusKey: (id: string) => readonly unknown[]
    batchBaseKey: () => readonly unknown[]
    statusField: string
    newStatus: boolean
  }
) {
  return (id: string) => {
    queryClient.cancelQueries({ queryKey: config.statusKey(id) as unknown[] })
    queryClient.cancelQueries({ queryKey: config.batchBaseKey() as unknown[] })

    const previousStatus = queryClient.getQueryData<TStatus>(config.statusKey(id))

    queryClient.setQueryData(config.statusKey(id) as unknown[], { [config.statusField]: config.newStatus } as TStatus)

    updateBatchStatusInCache(
      queryClient,
      config.batchBaseKey(),
      id,
      config.statusField,
      config.newStatus
    )

    return { previousStatus }
  }
}

/**
 * 创建 toggle mutation 的 onError 处理函数
 */
export function createToggleOnError<TContext extends { previousStatus?: Record<string, boolean> }>(
  queryClient: QueryClient,
  config: {
    statusKey: (id: string) => readonly unknown[]
    batchBaseKey: () => readonly unknown[]
    statusField: string
    options?: UseMutationOptions
  }
) {
  return (error: unknown, id: string, context: TContext | undefined) => {
    if (context?.previousStatus) {
      queryClient.setQueryData(config.statusKey(id) as unknown[], context.previousStatus)
    }

    const previousValue = context?.previousStatus?.[config.statusField] ?? false
    rollbackBatchStatusInCache(
      queryClient,
      config.batchBaseKey(),
      id,
      config.statusField,
      previousValue
    )

    const message = getErrorMessage(error)
    toast.error(message)
    config.options?.onError?.(message)
  }
}

/**
 * 创建 toggle mutation 的 onSuccess 处理函数
 */
export function createToggleOnSuccess(
  queryClient: QueryClient,
  config: {
    successMessage: string
    invalidateKeys?: (id: string) => (readonly unknown[])[]
    options?: UseMutationOptions
  }
) {
  return (_: unknown, id: string) => {
    if (config.invalidateKeys) {
      config.invalidateKeys(id).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as unknown[] })
      })
    }
    toast.success(config.successMessage)
    config.options?.onSuccess?.()
  }
}

/**
 * 创建 toggle mutation 的 onSettled 处理函数
 */
export function createToggleOnSettled(
  queryClient: QueryClient,
  config: {
    statusKey: (id: string) => readonly unknown[]
    batchBaseKey: () => readonly unknown[]
    invalidateKeys?: (id: string) => (readonly unknown[])[]
  }
) {
  return (_: unknown, __: unknown, id: string) => {
    queryClient.invalidateQueries({ queryKey: config.statusKey(id) as unknown[] })
    queryClient.invalidateQueries({ queryKey: config.batchBaseKey() as unknown[] })
    if (config.invalidateKeys) {
      config.invalidateKeys(id).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as unknown[] })
      })
    }
  }
}