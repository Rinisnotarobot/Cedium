import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { prisma } from '#/db'
import { json } from '#/lib/api-utils'
import { archiveArticleSchema } from '#/lib/validators/article'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/archive')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const body = await request.json()
        const result = archiveArticleSchema.safeParse(body)

        if (!result.success) {
          return json({ success: false, error: result.error.issues[0].message }, 400)
        }

        const { id } = result.data

        const existing = await prisma.article.findUnique({
          where: { id },
          select: { authorId: true, status: true },
        })

        if (!existing) {
          return json({ success: false, error: '文章不存在' }, 404)
        }

        if (existing.authorId !== session.user.id) {
          return json({ success: false, error: '无权限归档此文章' }, 403)
        }

        if (existing.status !== ArticleStatus.PUBLISHED) {
          return json({ success: false, error: '只能归档已发布的文章' }, 400)
        }

        try {
          await prisma.article.update({
            where: { id },
            data: { status: ArticleStatus.ARCHIVED },
          })

          return json({ success: true }, 200)
        } catch (error) {
          console.error('Archive article failed:', error)
          return json({ success: false, error: '归档失败，请稍后重试' }, 500)
        }
      },
    },
  },
})