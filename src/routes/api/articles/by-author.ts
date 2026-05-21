import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '#/db'
import { json, parsePagination } from '#/lib/api-utils'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/by-author')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const username = url.searchParams.get('username')
        const authorId = url.searchParams.get('authorId')
        const { page, limit } = parsePagination(url)
        const skip = (page - 1) * limit

        if (!username && !authorId) {
          return json({ success: false, error: '请提供用户名或用户ID' }, 400)
        }

        try {
          // 先查询用户
          const user = authorId
            ? await prisma.user.findUnique({
                where: { id: authorId },
                select: { id: true, name: true, image: true, bio: true },
              })
            : await prisma.user.findFirst({
                where: { name: username || '' },
                select: { id: true, name: true, image: true, bio: true },
              })

          if (!user) {
            return json({ success: false, error: '用户不存在' }, 404)
          }

          // 查询用户已发布的文章
          const [articles, total] = await Promise.all([
            prisma.article.findMany({
              where: {
                authorId: user.id,
                status: ArticleStatus.PUBLISHED,
              },
              orderBy: { publishedAt: 'desc' },
              skip,
              take: limit,
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

          return json({
            success: true,
            data: articles,
            meta: { total, page, limit },
            author: user,
          }, 200)
        } catch (error) {
          console.error('Fetch articles by author failed:', error)
          return json({ success: false, error: '获取文章列表失败' }, 500)
        }
      },
    },
  },
})