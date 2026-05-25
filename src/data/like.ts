import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { authMiddleware } from '#/middlewares/auth'
import { Prisma } from '#/generated/prisma/client'
import {
  likeArticleSchema,
  getMyLikesSchema,
  checkLikeStatusSchema,
  checkMultipleLikeStatusSchema,
} from '#/lib/validators/like'
import type { LikeStatus, LikeListResponse, LikedArticle } from '#/types/like'

export const likeArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(likeArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    try {
      await prisma.$transaction([
        prisma.like.create({
          data: { userId, articleId: data.articleId },
        }),
        prisma.article.update({
          where: { id: data.articleId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      return { success: true, isLiked: true }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { success: true, isLiked: true }
        }
        if (error.code === 'P2003') {
          throw new Error('文章不存在')
        }
      }
      throw error
    }
  })

export const unlikeArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(likeArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const result = await prisma.like.deleteMany({
      where: { userId, articleId: data.articleId },
    })

    if (result.count > 0) {
      await prisma.article.update({
        where: { id: data.articleId },
        data: { likeCount: { decrement: 1 } },
      })
    }

    return { success: true, isLiked: false }
  })

export const getMyLikesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getMyLikesSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const skip = (data.page - 1) * data.limit

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: data.limit,
        include: {
          article: {
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
          },
        },
      }),
      prisma.like.count({ where: { userId } }),
    ])

    const likedArticles: LikedArticle[] = likes.map((l) => ({
      id: l.article.id,
      title: l.article.title,
      slug: l.article.slug,
      excerpt: l.article.excerpt,
      coverImage: l.article.coverImage,
      author: l.article.author,
      likeCount: l.article.likeCount,
      likedAt: l.createdAt,
    }))

    return {
      likes: likedArticles,
      meta: { total, page: data.page, limit: data.limit },
    } as LikeListResponse
  })

export const checkLikeStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkLikeStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const like = await prisma.like.findUnique({
      where: { userId_articleId: { userId, articleId: data.articleId } },
    })

    return { isLiked: !!like } as LikeStatus
  })

export const checkMultipleLikeStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkMultipleLikeStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const likes = await prisma.like.findMany({
      where: { userId, articleId: { in: data.articleIds } },
      select: { articleId: true },
    })

    const likedIds = new Set(likes.map((l) => l.articleId))

    return data.articleIds.map((id) => ({
      articleId: id,
      isLiked: likedIds.has(id),
    }))
  })