import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { prisma } from '#/db'
import { json } from '#/lib/api-utils'
import { createArticleSchema } from '#/lib/validators/article'
import { ArticleStatus } from '#/generated/prisma/enums'

export const Route = createFileRoute('/api/articles/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const body = await request.json()
        const result = createArticleSchema.safeParse(body)

        if (!result.success) {
          const errors = result.error.issues.map(e => e.message).join(', ')
          return json({ success: false, error: errors }, 400)
        }

        const { title, excerpt, content, coverImage } = result.data

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { draftCount: true },
        })

        if (!user) {
          return json({ success: false, error: '用户不存在' }, 404)
        }

        if (user.draftCount >= 10) {
          return json({ success: false, error: '草稿数量已达上限（10篇）' }, 400)
        }

        try {
          const [article] = await prisma.$transaction([
            prisma.article.create({
              data: {
                title,
                excerpt,
                content,
                coverImage,
                authorId: session.user.id,
                status: ArticleStatus.DRAFT,
              },
            }),
            prisma.user.update({
              where: { id: session.user.id },
              data: { draftCount: { increment: 1 } },
            }),
          ])

          return json({ success: true, data: article }, 201)
        } catch (error) {
          console.error('Create article failed:', error)
          return json({ success: false, error: '创建失败，请稍后重试' }, 500)
        }
      },
    },
  },
})