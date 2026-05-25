import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { followKeys } from '#/hooks/keys/follow-keys'
import { followUserFn, unfollowUserFn } from '#/data/follow'
import { getErrorMessage } from '#/hooks/utils/get-error-message'
import type { FollowUserInput } from '#/lib/validators/follow'

interface UseFollowUserOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseUnfollowUserOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

type FollowStatusResult = { isFollowing: boolean }

/**
 * 关注用户 mutation hook
 */
export function useFollowUser(options?: UseFollowUserOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: FollowUserInput) => followUserFn({ data: variables }),
    onMutate: (_variables) => {
      // 取消相关查询
      queryClient.cancelQueries({ queryKey: followKeys.statusBase() })

      // 更新所有 follow status 缓存（乐观设为已关注）
      queryClient.getQueryCache().findAll({ queryKey: followKeys.statusBase() }).forEach(query => {
        const data = query.state.data as FollowStatusResult | undefined
        if (data) {
          queryClient.setQueryData(query.queryKey, { isFollowing: true })
        }
      })

      // 保存旧值用于回滚
      const previousStatuses = queryClient.getQueryCache().findAll({ queryKey: followKeys.statusBase() })
        .map(query => ({ key: query.queryKey, data: query.state.data }))

      return { previousStatuses }
    },
    onError: (error, _variables, context) => {
      // 回滚所有 follow status
      if (context?.previousStatuses) {
        context.previousStatuses.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data)
        })
      }
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
      toast.success('已关注')
      options?.onSuccess?.()
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.statusBase() })
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
    },
  })
}

/**
 * 取消关注用户 mutation hook
 */
export function useUnfollowUser(options?: UseUnfollowUserOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: FollowUserInput) => unfollowUserFn({ data: variables }),
    onMutate: (_variables) => {
      queryClient.cancelQueries({ queryKey: followKeys.statusBase() })

      // 更新所有 follow status 缓存（乐观设为未关注）
      queryClient.getQueryCache().findAll({ queryKey: followKeys.statusBase() }).forEach(query => {
        const data = query.state.data as FollowStatusResult | undefined
        if (data) {
          queryClient.setQueryData(query.queryKey, { isFollowing: false })
        }
      })

      const previousStatuses = queryClient.getQueryCache().findAll({ queryKey: followKeys.statusBase() })
        .map(query => ({ key: query.queryKey, data: query.state.data }))

      return { previousStatuses }
    },
    onError: (error, _variables, context) => {
      if (context?.previousStatuses) {
        context.previousStatuses.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data)
        })
      }
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
      toast.success('已取消关注')
      options?.onSuccess?.()
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.statusBase() })
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
    },
  })
}