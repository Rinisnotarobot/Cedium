import { z } from 'zod'

export const followUserSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
})
export type FollowUserInput = z.infer<typeof followUserSchema>

export const getFollowersSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})
export type GetFollowersInput = z.infer<typeof getFollowersSchema>

export const getFollowingSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})
export type GetFollowingInput = z.infer<typeof getFollowingSchema>

export const checkFollowStatusSchema = z.object({
  targetUserId: z.string().min(1, '目标用户ID不能为空'),
})
export type CheckFollowStatusInput = z.infer<typeof checkFollowStatusSchema>

export const getFollowStatsSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
})
export type GetFollowStatsInput = z.infer<typeof getFollowStatsSchema>