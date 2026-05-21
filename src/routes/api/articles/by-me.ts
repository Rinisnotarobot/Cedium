import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { prisma } from '#/db'
import { json, parsePagination } from '#/lib/api-utils'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/by-me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const url = new URL(request.url)
        const { page, limit } = parsePagination(url, { page: 1, limit: 20 })
        const statusParam = url.searchParams.get('status')

        const skip = (page - 1) * limit

        const whereClause = statusParam
          ? { authorId: session.user.id, status: statusParam as ArticleStatus }
          : { authorId: session.user.id }

        try {
          const [articles, total] = await Promise.all([
            prisma.article.findMany({
              where: whereClause,
              orderBy: { updatedAt: 'desc' },
              skip,
              take: limit,
            }),
            prisma.article.count({ where: whereClause }),
          ])

          return json({
            success: true,
            data: articles,
            meta: { total, page, limit },
          }, 200)
        } catch (error) {
          console.error('Fetch my articles failed:', error)
          return json({ success: false, error: '获取文章列表失败' }, 500)
        }
      },
    },
  },
})