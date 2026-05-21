import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import { json, parsePagination } from '#/lib/api-utils'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { page, limit } = parsePagination(url)
        const skip = (page - 1) * limit

        try {
          const [articles, total] = await Promise.all([
            prisma.article.findMany({
              where: { status: ArticleStatus.PUBLISHED },
              orderBy: { publishedAt: 'desc' },
              skip,
              take: limit,
              include: {
                author: {
                  select: { id: true, name: true, image: true },
                },
              },
            }),
            prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
          ])

          return json({
            success: true,
            data: articles,
            meta: { total, page, limit },
          }, 200)
        } catch (error) {
          console.error('Fetch articles failed:', error)
          return json({ success: false, error: '获取文章列表失败' }, 500)
        }
      },
    },
  },
})