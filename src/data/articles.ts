import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { authMiddleware } from '#/middlewares/auth'
import { ArticleStatus } from '#/generated/prisma/enums'
import { deleteImages } from '#/lib/r2'
import { findOrphanImages, extractR2ImageUrls } from '#/lib/utils/image'
import {
  createArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  archiveArticleSchema,
  unpublishArticleSchema,
  restoreArticleSchema,
  getArticleByIdSchema,
  getMyArticlesSchema,
  getPublishedArticlesSchema,
  getPublishedArticlesInfiniteSchema,
  searchArticlesSchema,
  getArticlesByAuthorSchema,
  deleteArticleSchema,
} from '#/lib/validators/article'
import type { Tag } from '#/types/tag'

async function ensureTagIds(slugs: string[]): Promise<string[]> {
  const existingTags = await prisma.tag.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })

  const slugToId = new Map(existingTags.map(t => [t.slug, t.id]))
  const missingSlugs = slugs.filter(slug => !slugToId.has(slug))

  if (missingSlugs.length > 0) {
    await prisma.tag.createMany({
      data: missingSlugs.map(slug => ({ name: slug, slug })),
      skipDuplicates: true,
    })

    const newTags = await prisma.tag.findMany({
      where: { slug: { in: missingSlugs } },
      select: { id: true, slug: true },
    })

    newTags.forEach(t => slugToId.set(t.slug, t.id))
  }

  return slugs.map(slug => slugToId.get(slug)!)
}

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
          tags: data.tags ? {
            create: data.tags.map(slug => ({
              tag: { connect: { slug } }
            }))
          } : undefined
        },
        include: {
          tags: { include: { tag: true } }
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { draftCount: { increment: 1 } },
      }),
    ])

    // 转换 tags 格式：从 Prisma 嵌套格式转为 Tag 数组
    const articleWithTags = {
      ...article,
      tags: article.tags?.map(at => at.tag) as Tag[]
    }
    return articleWithTags
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
      select: { authorId: true, content: true, coverImage: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限编辑此文章')
    }

    const orphanImages = findOrphanImages(existing.content, data.content)
    if (existing.coverImage && existing.coverImage !== data.coverImage) {
      orphanImages.push(existing.coverImage)
    }

    if (data.tags) {
      await prisma.articleTag.deleteMany({ where: { articleId: data.id } })

      const tagIds = await ensureTagIds(data.tags)

      await prisma.articleTag.createMany({
        data: tagIds.map(tagId => ({ articleId: data.id, tagId })),
        skipDuplicates: true,
      })
    }

    const article = await prisma.article.update({
      where: { id: data.id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
      },
      include: {
        tags: { include: { tag: true } }
      }
    })

    if (orphanImages.length > 0) {
      try {
        await deleteImages(orphanImages)
      } catch (error) {
        console.error('Failed to delete orphan images:', {
          articleId: data.id,
          urls: orphanImages,
          error,
        })
      }
    }

    const articleWithTags = {
      ...article,
      tags: article.tags?.map(at => at.tag) as Tag[]
    }
    return articleWithTags
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
      select: { authorId: true, status: true, title: true, content: true },
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

    // 检查标题是否为空
    if (!existing.title || existing.title.trim() === '') {
      throw new Error('文章标题不能为空')
    }

    // 检查内容是否为空（空字符串或空 Tiptap JSON）
    const contentStr = existing.content || ''
    let isEmptyContent = contentStr.trim() === ''

    // 尝试解析 Tiptap JSON 格式
    if (!isEmptyContent && contentStr.startsWith('{')) {
      try {
        const parsed = JSON.parse(contentStr)
        // Tiptap doc 结构: { type: 'doc', content: [...] }
        if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
          isEmptyContent = parsed.content.length === 0
        }
      } catch {
        // JSON 解析失败，说明不是 JSON 格式，内容不为空
      }
    }

    if (isEmptyContent) {
      throw new Error('文章内容不能为空')
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
 * 撤销发布文章
 * - 验证 PUBLISHED 状态
 * - 验证所有权
 * - 事务: 更新状态为 DRAFT + 清除 publishedAt + 增加 draftCount
 */
export const unpublishArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(unpublishArticleSchema)
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
      throw new Error('无权限操作此文章')
    }

    if (existing.status !== ArticleStatus.PUBLISHED) {
      throw new Error('只能撤销已发布的文章')
    }

    await prisma.$transaction([
      prisma.article.update({
        where: { id: data.id },
        data: {
          status: ArticleStatus.DRAFT,
          publishedAt: null,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { draftCount: { increment: 1 } },
      }),
    ])
  })

/**
 * 恢复归档文章
 * - 验证 ARCHIVED 状态
 * - 验证所有权
 * - 更新状态为 PUBLISHED（不涉及 draftCount）
 */
export const restoreArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(restoreArticleSchema)
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
      throw new Error('无权限操作此文章')
    }

    if (existing.status !== ArticleStatus.ARCHIVED) {
      throw new Error('只能恢复已归档的文章')
    }

    await prisma.article.update({
      where: { id: data.id },
      data: { status: ArticleStatus.PUBLISHED },
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
      select: { authorId: true, status: true, content: true, coverImage: true },
    })

    if (!existing) {
      throw new Error('文章不存在')
    }

    if (existing.authorId !== userId) {
      throw new Error('无权限删除此文章')
    }

    const imageUrls = extractR2ImageUrls(existing.content)
    if (existing.coverImage) {
      imageUrls.push(existing.coverImage)
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

    if (imageUrls.length > 0) {
      try {
        await deleteImages(imageUrls)
      } catch (error) {
        console.error('Failed to delete article images:', {
          articleId: data.id,
          urls: imageUrls,
          error,
        })
      }
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
        tags: {
          include: {
            tag: true
          }
        }
      },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    // 转换 tags 格式
    const articleWithTags = {
      ...article,
      tags: article.tags?.map(at => at.tag) as Tag[]
    }

    // 公开文章无需认证
    if (article.status === ArticleStatus.PUBLISHED) {
      return articleWithTags
    }

    // 私有文章需要认证 + 所有权验证
    if (!session?.user) {
      throw new Error('未登录')
    }

    if (session.user.id !== article.authorId) {
      throw new Error('无权限查看此文章')
    }

    return articleWithTags
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
          tags: {
            include: { tag: true }
          }
        },
      }),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    ])

    return {
      articles: articles.map(article => ({
        ...article,
        tags: article.tags?.map(at => at.tag) as Tag[]
      })),
      meta: { total, page: data.page, limit: data.limit },
    }
  })

/**
 * 获取公开文章列表 (Cursor 分页 - 用于无限滚动)
 * - 公开接口，无需认证
 * - 使用 cursor-based pagination
 * - 返回 nextCursor 和 hasMore
 */
export const getPublishedArticlesInfiniteFn = createServerFn({ method: 'GET' })
  .inputValidator(getPublishedArticlesInfiniteSchema)
  .handler(async ({ data }) => {
    const take = data.limit + 1 // 多取一条判断是否有下一页

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      cursor: data.cursor ? { id: data.cursor } : undefined,
      skip: data.cursor ? 1 : 0, // cursor 时跳过第一条（已在上页末尾）
      take,
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } }
      },
    })

    const hasMore = articles.length > data.limit
    const nextCursor = hasMore ? articles[data.limit - 1].id : undefined

    return {
      articles: articles.slice(0, data.limit).map(article => ({
        ...article,
        tags: article.tags?.map(at => at.tag) as Tag[]
      })),
      nextCursor,
      hasMore,
    }
  })

/**
 * 搜索文章 (Cursor 分页)
 * - 公开接口，无需认证
 * - 搜索标题、摘要、内容、标签（不区分大小写）
 */
export const searchArticlesFn = createServerFn({ method: 'GET' })
  .inputValidator(searchArticlesSchema)
  .handler(async ({ data }) => {
    const take = data.limit + 1
    const searchQuery = data.query.toLowerCase()

    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { excerpt: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { some: { tag: { name: { contains: searchQuery, mode: 'insensitive' } } } } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      cursor: data.cursor ? { id: data.cursor } : undefined,
      skip: data.cursor ? 1 : 0,
      take,
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } }
      },
    })

    const hasMore = articles.length > data.limit
    const nextCursor = hasMore ? articles[data.limit - 1].id : undefined

    return {
      articles: articles.slice(0, data.limit).map(article => ({
        ...article,
        tags: article.tags?.map(at => at.tag) as Tag[]
      })),
      nextCursor,
      hasMore,
      query: data.query,
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

    return {
      articles: articles.map(article => ({
        ...article,
        tags: article.tags?.map(at => at.tag) as Tag[]
      })),
      meta: { total, page: data.page, limit: data.limit },
      author: user,
    }
  })

/**
 * 获取我的文章统计数据
 * - 需认证
 * - 返回各状态文章数量
 */
export const getMyArticlesStatsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    const [draft, published, archived] = await Promise.all([
      prisma.article.count({ where: { authorId: userId, status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { authorId: userId, status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { authorId: userId, status: ArticleStatus.ARCHIVED } }),
    ])

    return {
      draft,
      published,
      archived,
      total: draft + published + archived,
    }
  })