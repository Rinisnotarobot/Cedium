import { useQuery } from '@tanstack/react-query'
import { followKeys } from '#/hooks/keys/follow-keys'
import {
  getFollowStatsFn,
  getFollowersFn,
  getFollowingFn,
  checkFollowStatusFn,
} from '#/data/follow'
import type { GetFollowersInput, GetFollowingInput } from '#/lib/validators/follow'

/**
 * 获取关注统计 query hook
 */
export function useFollowStats(userId: string) {
  return useQuery({
    queryKey: followKeys.stats(userId),
    queryFn: () => getFollowStatsFn({ data: { userId } }),
    enabled: !!userId,
  })
}

/**
 * 获取粉丝列表 query hook
 */
export function useFollowers(input: GetFollowersInput) {
  return useQuery({
    queryKey: followKeys.followers(input.userId),
    queryFn: () => getFollowersFn({ data: input }),
    enabled: !!input.userId,
  })
}

/**
 * 获取关注列表 query hook
 */
export function useFollowing(input: GetFollowingInput) {
  return useQuery({
    queryKey: followKeys.following(input.userId),
    queryFn: () => getFollowingFn({ data: input }),
    enabled: !!input.userId,
  })
}

/**
 * 检查关注状态 query hook
 */
export function useFollowStatus(targetUserId: string) {
  return useQuery({
    queryKey: followKeys.status('current', targetUserId),
    queryFn: () => checkFollowStatusFn({ data: { targetUserId } }),
    enabled: !!targetUserId,
  })
}