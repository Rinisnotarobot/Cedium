import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { uploadAvatar, deleteAvatar, validateFileType, MAX_FILE_SIZE } from '#/lib/r2'
import { prisma } from '#/db'

const json = (data: object, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export const Route = createFileRoute('/api/upload/avatar')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return json({ success: false, error: '未登录' }, 401)
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
          return json({ success: false, error: '请选择文件' }, 400)
        }

        if (file.size > MAX_FILE_SIZE) {
          return json({ success: false, error: '文件大小不能超过 10MB' }, 400)
        }

        const contentType = file.type
        const buffer = Buffer.from(await file.arrayBuffer())

        if (!validateFileType(buffer, contentType)) {
          return json({ success: false, error: '仅支持 JPEG、PNG、WebP 格式' }, 400)
        }

        try {
          const { url } = await uploadAvatar(session.user.id, buffer, contentType)
          const oldImage = session.user.image

          await Promise.all([
            oldImage ? deleteAvatar(oldImage).catch(() => {}) : Promise.resolve(),
            prisma.user.update({
              where: { id: session.user.id },
              data: { image: url },
            }),
          ])

          return json({ success: true, url }, 200)
        } catch {
          return json({ success: false, error: '上传失败，请稍后重试' }, 500)
        }
      },
    },
  },
})