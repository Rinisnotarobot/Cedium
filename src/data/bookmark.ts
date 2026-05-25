import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { authMiddleware } from '#/middlewares/auth'
import { Prisma } from '#/generated/prisma/client'
import {
  bookmarkArticleSchema,
  getMyBookmarksSchema,
  checkBookmarkStatusSchema,
  checkMultipleBookmarkStatusSchema,
} from '#/lib/validators/bookmark'
import type { BookmarkStatus, BookmarkListResponse, BookmarkedArticle } from '#/types/bookmark'

export const bookmarkArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(bookmarkArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    try {
      await prisma.$transaction([
        prisma.bookmark.create({
          data: { userId, articleId: data.articleId },
        }),
        prisma.article.update({
          where: { id: data.articleId },
          data: { bookmarkCount: { increment: 1 } },
        }),
      ])
      return { success: true, isBookmarked: true }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { success: true, isBookmarked: true }
        }
        if (error.code === 'P2003') {
          throw new Error('文章不存在')
        }
      }
      throw error
    }
  })

export const unbookmarkArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(bookmarkArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const result = await prisma.bookmark.deleteMany({
      where: { userId, articleId: data.articleId },
    })

    if (result.count > 0) {
      await prisma.article.update({
        where: { id: data.articleId },
        data: { bookmarkCount: { decrement: 1 } },
      })
    }

    return { success: true, isBookmarked: false }
  })

export const getMyBookmarksFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getMyBookmarksSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const skip = (data.page - 1) * data.limit

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: data.limit,
        include: {
          article: {
            include: {
              author: { select: { id: true, name: true, image: true } },
              tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
            },
          },
        },
      }),
      prisma.bookmark.count({ where: { userId } }),
    ])

    const bookmarkedArticles: BookmarkedArticle[] = bookmarks.map((b) => ({
      id: b.article.id,
      title: b.article.title,
      slug: b.article.slug,
      excerpt: b.article.excerpt,
      coverImage: b.article.coverImage,
      author: b.article.author,
      tags: b.article.tags?.map((t) => t.tag),
      likeCount: b.article.likeCount,
      bookmarkCount: b.article.bookmarkCount,
      bookmarkedAt: b.createdAt,
    }))

    return {
      bookmarks: bookmarkedArticles,
      meta: { total, page: data.page, limit: data.limit },
    } as BookmarkListResponse
  })

export const checkBookmarkStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkBookmarkStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_articleId: { userId, articleId: data.articleId } },
    })

    return { isBookmarked: !!bookmark } as BookmarkStatus
  })

export const checkMultipleBookmarkStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkMultipleBookmarkStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, articleId: { in: data.articleIds } },
      select: { articleId: true },
    })

    const bookmarkedIds = new Set(bookmarks.map((b) => b.articleId))

    return data.articleIds.map((id) => ({
      articleId: id,
      isBookmarked: bookmarkedIds.has(id),
    }))
  })