import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { authMiddleware } from '#/middlewares/auth'
import { ArticleStatus } from '#/generated/prisma/enums'
import {
  createArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  archiveArticleSchema,
  getArticleByIdSchema,
  getMyArticlesSchema,
  getPublishedArticlesSchema,
  getArticlesByAuthorSchema,
  deleteArticleSchema,
} from '#/lib/validators/article'

// ===== 写操作 (POST, 需认证) =====

/**
 * 创建草稿文章
 * - 检查草稿数量上限 (10篇)
 * - 事务: 创建文章 + 增加 draftCount
 */
export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { draftCount: true },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.draftCount >= 10) {
      throw new Error('草稿数量已达上限（10篇）')
    }

    const [article] = await prisma.$transaction([
      prisma.article.create({
        data: {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          authorId: userId,
          status: ArticleStatus.DRAFT,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { draftCount: { increment: 1 } },
      }),
    ])

    return article
  })

/**
 * 更新文章内容
 * - 验证所有权
 * - 更新 title, excerpt, content, coverImage
 */
export const updateArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限编辑此文章')
    }

    const article = await prisma.article.update({
      where: { id: data.id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
      },
    })

    return article
  })

/**
 * 发布草稿文章
 * - 验证 DRAFT 状态
 * - 验证所有权
 * - 事务: 更新状态 + 设置 publishedAt + 减少 draftCount
 */
export const publishArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(publishArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true, status: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限发布此文章')
    }

    if (existing.status !== ArticleStatus.DRAFT) {
      throw new Error('只能发布草稿状态的文章')
    }

    await prisma.$transaction([
      prisma.article.update({
        where: { id: data.id },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { draftCount: { decrement: 1 } },
      }),
    ])
  })

/**
 * 归档已发布文章
 * - 验证 PUBLISHED 状态
 * - 验证所有权
 * - 更新状态为 ARCHIVED (不涉及 draftCount)
 */
export const archiveArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(archiveArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true, status: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限归档此文章')
    }

    if (existing.status !== ArticleStatus.PUBLISHED) {
      throw new Error('只能归档已发布的文章')
    }

    await prisma.article.update({
      where: { id: data.id },
      data: { status: ArticleStatus.ARCHIVED },
    })
  })

/**
 * 删除文章
 * - DRAFT 状态: 事务删除 + 减少 draftCount
 * - 其他状态: 直接删除
 */
export const deleteArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true, status: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限删除此文章')
    }

    if (existing.status === ArticleStatus.DRAFT) {
      await prisma.$transaction([
        prisma.article.delete({ where: { id: data.id } }),
        prisma.user.update({
          where: { id: userId },
          data: { draftCount: { decrement: 1 } },
        }),
      ])
    } else {
      await prisma.article.delete({ where: { id: data.id } })
    }
  })

// ===== 读操作 (GET, 混合认证) =====

/**
 * 获取文章详情
 * - 公开文章 (PUBLISHED): 无需认证
 * - 私有文章 (DRAFT/ARCHIVED): 需认证 + 所有权验证
 * - 支持按 slug 或 id 查找
 */
export const getArticleByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getArticleByIdSchema)
  .handler(async ({ data }) => {
    // 可选的 session 检查（不通过中间件强制）
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    // 按 slug 或 id 查找
    const article = await prisma.article.findFirst({
      where: {
        OR: [{ slug: data.id }, { id: data.id }],
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    // 公开文章无需认证
    if (article.status === ArticleStatus.PUBLISHED) {
      return article
    }

    // 私有文章需要认证 + 所有权验证
    if (!session?.user) {
      throw new Error('未登录')
    }

    if (session.user.id !== article.authorId) {
      throw new Error('无权限查看此文章')
    }

    return article
  })

/**
 * 获取我的文章列表
 * - 按作者 ID 过滤
 * - 可选状态过滤
 * - 按 updatedAt DESC 排序
 */
export const getMyArticlesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getMyArticlesSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const skip = (data.page - 1) * data.limit

    const whereClause = data.status
      ? { authorId: userId, status: data.status }
      : { authorId: userId }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: data.limit,
      }),
      prisma.article.count({ where: whereClause }),
    ])

    return {
      articles,
      meta: { total, page: data.page, limit: data.limit },
    }
  })

/**
 * 获取公开文章列表
 * - 公开接口，无需认证
 * - 按 PUBLISHED 状态过滤
 * - 包含作者信息
 * - 按 publishedAt DESC 排序
 */
export const getPublishedArticlesFn = createServerFn({ method: 'GET' })
  .inputValidator(getPublishedArticlesSchema)
  .handler(async ({ data }) => {
    const skip = (data.page - 1) * data.limit

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: data.limit,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    ])

    return {
      articles,
      meta: { total, page: data.page, limit: data.limit },
    }
  })

/**
 * 获取作者文章列表
 * - 公开接口，无需认证
 * - 接受 username 或 authorId
 * - 返回作者公开文章 + 作者信息
 */
export const getArticlesByAuthorFn = createServerFn({ method: 'GET' })
  .inputValidator(getArticlesByAuthorSchema)
  .handler(async ({ data }) => {
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
        },
      }),
      prisma.article.count({
        where: {
          authorId: user.id,
          status: ArticleStatus.PUBLISHED,
        },
      }),
    ])

    return {
      articles,
      meta: { total, page: data.page, limit: data.limit },
      author: user,
    }
  })