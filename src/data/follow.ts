import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { authMiddleware } from '#/middlewares/auth'
import {
  followUserSchema,
  getFollowersSchema,
  getFollowingSchema,
  checkFollowStatusSchema,
  getFollowStatsSchema,
} from '#/lib/validators/follow'
import { getArticlesByAuthorSchema } from '#/lib/validators/article'
import { ArticleStatus } from '#/generated/prisma/enums'
import type { FollowUser, FollowStats, FollowStatus } from '#/types/follow'

type Tag = { id: string; name: string; slug: string }

/**
 * 关注用户
 * - 需认证
 * - 不能关注自己
 * - 使用 upsert 避免 TOCTOU 竞态条件
 */
export const followUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(followUserSchema)
  .handler(async ({ data, context }) => {
    const followerId = context.session.user.id

    if (followerId === data.userId) {
      throw new Error('不能关注自己')
    }

    const target = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    })

    if (!target) {
      throw new Error('用户不存在')
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId: data.userId,
        },
      },
      create: {
        followerId,
        followingId: data.userId,
      },
      update: {},
    })

    return { success: true }
  })

/**
 * 取消关注用户
 * - 需认证
 * - 静默处理未关注的情况
 */
export const unfollowUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(followUserSchema)
  .handler(async ({ data, context }) => {
    const followerId = context.session.user.id

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: data.userId,
      },
    })

    return { success: true }
  })

/**
 * 获取关注统计
 * - 公开接口
 * - 返回 followerCount 和 followingCount
 */
export const getFollowStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(getFollowStatsSchema)
  .handler(async ({ data }) => {
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: data.userId },
      }),
      prisma.follow.count({
        where: { followerId: data.userId },
      }),
    ])

    return { followerCount, followingCount } as FollowStats
  })

/**
 * 获取粉丝列表
 * - 公开接口
 * - 返回 FollowUser 数组
 */
export const getFollowersFn = createServerFn({ method: 'GET' })
  .inputValidator(getFollowersSchema)
  .handler(async ({ data }) => {
    const skip = (data.page - 1) * data.limit

    const follows = await prisma.follow.findMany({
      where: { followingId: data.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: data.limit,
      include: {
        follower: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    })

    const followers = follows.map((f) => f.follower) as FollowUser[]
    const total = await prisma.follow.count({
      where: { followingId: data.userId },
    })

    return {
      followers,
      meta: { total, page: data.page, limit: data.limit },
    }
  })

/**
 * 获取关注列表
 * - 公开接口
 * - 返回 FollowUser 数组
 */
export const getFollowingFn = createServerFn({ method: 'GET' })
  .inputValidator(getFollowingSchema)
  .handler(async ({ data }) => {
    const skip = (data.page - 1) * data.limit

    const follows = await prisma.follow.findMany({
      where: { followerId: data.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: data.limit,
      include: {
        following: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    })

    const following = follows.map((f) => f.following) as FollowUser[]
    const total = await prisma.follow.count({
      where: { followerId: data.userId },
    })

    return {
      following,
      meta: { total, page: data.page, limit: data.limit },
    }
  })

/**
 * 检查关注状态
 * - 需认证
 * - 返回 isFollowing 状态
 */
export const checkFollowStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkFollowStatusSchema)
  .handler(async ({ data, context }) => {
    const followerId = context.session.user.id

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: data.targetUserId,
        },
      },
    })

    return { isFollowing: !!follow } as FollowStatus
  })

/**
 * 获取用户资料页完整数据
 * - 公开接口
 * - 包含文章列表、关注统计、是否已关注
 * - 自动检测当前用户
 */
export const getUserProfileDataFn = createServerFn({ method: 'GET' })
  .inputValidator(getArticlesByAuthorSchema)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    const skip = (data.page - 1) * data.limit

    // 查找用户
    const user = data.authorId
      ? await prisma.user.findUnique({
          where: { id: data.authorId },
          select: { id: true, name: true, image: true, bio: true },
        })
      : await prisma.user.findFirst({
          where: { name: data.username || '' },
          select: { id: true, name: true, image: true, bio: true },
        })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 获取文章列表
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          authorId: user.id,
          status: ArticleStatus.PUBLISHED,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: data.limit,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          tags: {
            include: { tag: true }
          }
        },
      }),
      prisma.article.count({
        where: {
          authorId: user.id,
          status: ArticleStatus.PUBLISHED,
        },
      }),
    ])

    // 获取关注统计
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
    ])

    // 判断是否是自己
    const isSelf = session?.user?.id === user.id

    // 获取关注状态（仅非自己且有登录时）
    let isFollowing = false
    if (!isSelf && session?.user) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      })
      isFollowing = !!follow
    }

    return {
      articles: articles.map(article => ({
        ...article,
        tags: article.tags?.map(at => at.tag) as Tag[]
      })),
      meta: { total, page: data.page, limit: data.limit },
      author: user,
      followStats: { followerCount, followingCount },
      isSelf,
      isFollowing,
      currentUserId: session?.user?.id,
    }
  })