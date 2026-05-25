import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { authMiddleware } from '#/middlewares/auth'
import { Prisma } from '#/generated/prisma/client'
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  likeCommentSchema,
  checkCommentLikeStatusSchema,
  checkMultipleCommentLikeStatusSchema,
} from '#/lib/validators/comment'
import type {
  Comment,
  CommentListResponse,
  CommentLikeStatus,
  MultipleCommentLikeStatus,
  CommentSortType,
} from '#/types/comment'

/**
 * 发表评论或回复
 * - 需认证
 * - parentId 为 null 表示顶层评论，有值表示回复
 * - 回复只能针对顶层评论（2层嵌套限制）
 */
export const createCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 验证文章存在
    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
      select: { id: true, authorId: true },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    // 如果是回复，验证父评论存在且是顶层评论
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { id: true, parentId: true, articleId: true },
      })

      if (!parent) {
        throw new Error('父评论不存在')
      }

      if (parent.articleId !== data.articleId) {
        throw new Error('父评论不属于该文章')
      }

      if (parent.parentId !== null) {
        throw new Error('不支持多层嵌套回复')
      }
    }

    try {
      const [comment] = await prisma.$transaction([
        prisma.comment.create({
          data: {
            content: data.content,
            articleId: data.articleId,
            userId,
            parentId: data.parentId ?? null,
          },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        }),
        prisma.article.update({
          where: { id: data.articleId },
          data: { commentCount: { increment: 1 } },
        }),
      ])

      return {
        ...comment,
        isLiked: false,
        isOwner: true,
        isArticleAuthor: article.authorId === userId,
      } as Comment
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('您已在该位置发表过评论')
        }
      }
      throw error
    }
  })

/**
 * 编辑评论
 * - 需认证
 * - 仅评论作者可编辑
 */
export const updateCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 并行查询评论和文章
    const comment = await prisma.comment.findUnique({
      where: { id: data.id },
      select: { id: true, userId: true, articleId: true },
    })

    if (!comment) {
      throw new Error('评论不存在')
    }

    if (comment.userId !== userId) {
      throw new Error('无权限编辑此评论')
    }

    const article = await prisma.article.findUnique({
      where: { id: comment.articleId },
      select: { authorId: true },
    })

    const updated = await prisma.comment.update({
      where: { id: data.id },
      data: { content: data.content },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return {
      ...updated,
      isOwner: true,
      isArticleAuthor: article?.authorId === userId,
    } as Comment
  })

/**
 * 删除评论
 * - 需认证
 * - 评论作者或文章作者可删除
 * - 删除时同时删除子回复并更新计数
 */
export const deleteCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 并行查询评论、文章和回复数量
    const [comment, article, repliesCount] = await Promise.all([
      prisma.comment.findUnique({
        where: { id: data.id },
        select: { id: true, userId: true, articleId: true, parentId: true },
      }),
      prisma.article.findUnique({
        where: { id: data.articleId },
        select: { authorId: true },
      }),
      prisma.comment.count({
        where: { parentId: data.id },
      }),
    ])

    if (!comment) {
      throw new Error('评论不存在')
    }

    if (!article) {
      throw new Error('文章不存在')
    }

    const isOwner = comment.userId === userId
    const isArticleAuthor = article.authorId === userId

    if (!isOwner && !isArticleAuthor) {
      throw new Error('无权限删除此评论')
    }

    const totalToDelete = 1 + repliesCount

    await prisma.$transaction([
      // 删除子回复
      prisma.comment.deleteMany({
        where: { parentId: data.id },
      }),
      // 删除评论本身
      prisma.comment.delete({
        where: { id: data.id },
      }),
      // 更新文章评论计数
      prisma.article.update({
        where: { id: data.articleId },
        data: { commentCount: { decrement: totalToDelete } },
      }),
    ])

    return { success: true, deletedCount: totalToDelete }
  })

/**
 * 获取文章评论列表
 * - 公开接口，但登录用户会获取点赞状态
 * - 支持排序：oldest, newest, hot
 * - 包含嵌套回复（最多2层）
 */
export const getCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator(getCommentsSchema)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    const skip = (data.page - 1) * data.limit

    // 获取文章作者ID
    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
      select: { authorId: true },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    const SORT_ORDER: Record<CommentSortType, Prisma.CommentOrderByWithRelationInput[]> = {
      oldest: [{ createdAt: 'asc' }],
      newest: [{ createdAt: 'desc' }],
      hot: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
    }

    const orderBy = SORT_ORDER[data.sort]

    // 获取顶层评论
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId: data.articleId, parentId: null },
        orderBy,
        skip,
        take: data.limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
      }),
      prisma.comment.count({
        where: { articleId: data.articleId, parentId: null },
      }),
    ])

    // 获取用户点赞状态（仅登录用户）
    let likedCommentIds: Set<string> = new Set()
    if (userId) {
      const allCommentIds = [
        ...comments.map((c) => c.id),
        ...comments.flatMap((c) => c.replies?.map((r) => r.id) ?? []),
      ]

      if (allCommentIds.length > 0) {
        const likes = await prisma.commentLike.findMany({
          where: { userId, commentId: { in: allCommentIds } },
          select: { commentId: true },
        })
        likedCommentIds = new Set(likes.map((l) => l.commentId))
      }
    }

    // 构建响应
    const formattedComments: Comment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      userId: comment.userId,
      parentId: comment.parentId,
      likeCount: comment.likeCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      isLiked: likedCommentIds.has(comment.id),
      isOwner: userId === comment.userId,
      isArticleAuthor: userId === article.authorId,
      replies: comment.replies?.map((reply) => ({
        id: reply.id,
        content: reply.content,
        articleId: reply.articleId,
        userId: reply.userId,
        parentId: reply.parentId,
        likeCount: reply.likeCount,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        user: reply.user,
        isLiked: likedCommentIds.has(reply.id),
        isOwner: userId === reply.userId,
        isArticleAuthor: userId === article.authorId,
        replies: undefined, // 回复不再有嵌套
      })),
    }))

    return {
      comments: formattedComments,
      meta: { total, page: data.page, limit: data.limit },
    } as CommentListResponse
  })

/**
 * 点赞评论
 * - 需认证
 * - 使用事务确保计数一致性
 * - 幂等处理重复点赞
 */
export const likeCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(likeCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    try {
      await prisma.$transaction([
        prisma.commentLike.create({
          data: { userId, commentId: data.commentId },
        }),
        prisma.comment.update({
          where: { id: data.commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      return { success: true, isLiked: true }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { success: true, isLiked: true } // 已点赞，幂等处理
        }
        if (error.code === 'P2003') {
          throw new Error('评论不存在')
        }
      }
      throw error
    }
  })

/**
 * 取消点赞评论
 * - 需认证
 * - 使用事务确保一致性
 */
export const unlikeCommentFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(likeCommentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    await prisma.$transaction([
      prisma.commentLike.deleteMany({
        where: { userId, commentId: data.commentId },
      }),
      prisma.comment.update({
        where: { id: data.commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ])

    return { success: true, isLiked: false }
  })

/**
 * 检查评论点赞状态
 * - 需认证
 */
export const checkCommentLikeStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkCommentLikeStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId: data.commentId },
      },
    })

    return { isLiked: !!like } as CommentLikeStatus
  })

/**
 * 批量检查评论点赞状态
 * - 需认证
 */
export const checkMultipleCommentLikeStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(checkMultipleCommentLikeStatusSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const likes = await prisma.commentLike.findMany({
      where: { userId, commentId: { in: data.commentIds } },
      select: { commentId: true },
    })

    const likedIds = new Set(likes.map((l) => l.commentId))

    return data.commentIds.map((id) => ({
      commentId: id,
      isLiked: likedIds.has(id),
    })) as MultipleCommentLikeStatus[]
  })