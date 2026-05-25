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

/**
 * 关注用户 mutation hook
 */
export function useFollowUser(options?: UseFollowUserOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: FollowUserInput) => followUserFn({ data: variables }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
      // 刷新当前用户的关注状态
      queryClient.invalidateQueries({ queryKey: ['follow', 'status'] })
      toast.success('已关注')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followKeys.stats(variables.userId) })
      // 刷新当前用户的关注状态
      queryClient.invalidateQueries({ queryKey: ['follow', 'status'] })
      toast.success('已取消关注')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      options?.onError?.(message)
    },
  })
}