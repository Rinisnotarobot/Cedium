import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { prisma } from '#/db'
import { json } from '#/lib/api-utils'
import { updateArticleSchema } from '#/lib/validators/article'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { id } = params
        const session = await auth.api.getSession({ headers: request.headers })

        // 优先按 slug 查找（公开访问），找不到再按 id 查找（内部操作）
        const article = await prisma.article.findFirst({
          where: {
            OR: [{ slug: id }, { id }],
          },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        })

        if (!article) {
          return json({ success: false, error: '文章不存在' }, 404)
        }

        if (article.status !== ArticleStatus.PUBLISHED) {
          if (!session?.user || session.user.id !== article.authorId) {
            return json({ success: false, error: '无权限查看此文章' }, 403)
          }
        }

        return json({ success: true, data: article }, 200)
      },

      PUT: async ({ request, params }) => {
        const { id } = params
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const body = await request.json()
        const result = updateArticleSchema.safeParse({ ...body, id })

        if (!result.success) {
          const errors = result.error.issues.map(e => e.message).join(', ')
          return json({ success: false, error: errors }, 400)
        }

        const existing = await prisma.article.findUnique({
          where: { id },
          select: { authorId: true, status: true },
        })

        if (!existing) {
          return json({ success: false, error: '文章不存在' }, 404)
        }

        if (existing.authorId !== session.user.id) {
          return json({ success: false, error: '无权限编辑此文章' }, 403)
        }

        const { title, excerpt, content, coverImage } = result.data

        try {
          const article = await prisma.article.update({
            where: { id },
            data: { title, excerpt, content, coverImage },
          })

          return json({ success: true, data: article }, 200)
        } catch (error) {
          console.error('Update article failed:', error)
          return json({ success: false, error: '更新失败，请稍后重试' }, 500)
        }
      },

      DELETE: async ({ request, params }) => {
        const { id } = params
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const existing = await prisma.article.findUnique({
          where: { id },
          select: { authorId: true, status: true },
        })

        if (!existing) {
          return json({ success: false, error: '文章不存在' }, 404)
        }

        if (existing.authorId !== session.user.id) {
          return json({ success: false, error: '无权限删除此文章' }, 403)
        }

        try {
          if (existing.status === ArticleStatus.DRAFT) {
            await prisma.$transaction([
              prisma.article.delete({ where: { id } }),
              prisma.user.update({
                where: { id: session.user.id },
                data: { draftCount: { decrement: 1 } },
              }),
            ])
          } else {
            await prisma.article.delete({ where: { id } })
          }

          return json({ success: true }, 200)
        } catch (error) {
          console.error('Delete article failed:', error)
          return json({ success: false, error: '删除失败，请稍后重试' }, 500)
        }
      },
    },
  },
})