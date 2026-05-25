import { createServerFn } from '@tanstack/react-start'
import { uploadImage, validateFileType, MAX_FILE_SIZE } from '#/lib/r2'
import { authMiddleware } from '#/middlewares/auth'

/**
 * 上传文章图片
 * - FormData 验证：文件大小检查
 * - Handler 中补充文件签名验证
 * - R2 上传：存储到 images/{userId}/ 目录
 * - 返回图片公开 URL
 */
export const uploadImageFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    const file = input.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('请选择文件')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件大小不能超过 10MB')
    }

    return { file }
  })
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const buffer = Buffer.from(await data.file.arrayBuffer())

    if (!validateFileType(buffer, data.file.type)) {
      throw new Error('仅支持 JPEG、PNG、WebP 格式')
    }

    const { url } = await uploadImage(userId, buffer, data.file.type)

    return { url }
  })