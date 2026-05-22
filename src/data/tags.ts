import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { authMiddleware } from '#/middlewares/auth'
import { createTagSchema, tagSlugSchema } from '#/lib/validators/tag'
import { generateSlug } from '#/lib/utils/slug'
import type { Tag } from '#/types/tag'

/**
 * 获取所有标签（公开）
 * - 按名称升序排序
 */
export const getAllTagsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    })
    return tags as Tag[]
  })

/**
 * 通过 slug 获取标签（公开）
 */
export const getTagBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator(tagSlugSchema)
  .handler(async ({ data }) => {
    const tag = await prisma.tag.findUnique({
      where: { slug: data.slug },
    })
    return tag as Tag | null
  })

/**
 * 创建标签（需认证）
 * - 自动生成 slug
 * - 使用 upsert 避免 TOCTOU 竞态条件
 */
export const createTagFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createTagSchema)
  .handler(async ({ data }) => {
    const slug = generateSlug(data.name)

    // 使用 upsert 避免竞态条件
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name: data.name }, // 如果已存在，更新名称
      create: { name: data.name, slug },
    })
    return tag as Tag
  })

/**
 * 确保标签存在（需认证）
 * - 使用 upsert 避免 TOCTOU 竞态条件
 * - 返回标签 slug
 */
export const ensureTagExistsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createTagSchema)
  .handler(async ({ data }) => {
    const slug = generateSlug(data.name)

    // 使用 upsert 避免竞态条件
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: data.name, slug },
    })
    return tag.slug
  })