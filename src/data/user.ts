import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { authMiddleware } from '#/middlewares/auth'
import {
  uploadAvatar,
  deleteAvatar,
  validateFileType,
  MAX_FILE_SIZE,
} from '#/lib/r2'
import { profileSchema } from '#/lib/validators/profile'

// ===== 写操作 (POST, 需认证) =====

/**
 * 上传头像
 * - FormData 验证：文件大小检查
 * - Handler 中补充文件签名验证
 * - R2 上传：生成唯一 key，上传文件
 * - 旧头像删除：如果存在旧头像则删除
 * - 数据库更新：更新 user.image
 */
export const uploadAvatarFn = createServerFn({ method: 'POST' })
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
    const oldImage = context.session.user.image

    const buffer = Buffer.from(await data.file.arrayBuffer())

    if (!validateFileType(buffer, data.file.type)) {
      throw new Error('仅支持 JPEG、PNG、WebP 格式')
    }

    const { url } = await uploadAvatar(userId, buffer, data.file.type)

    await Promise.all([
      oldImage ? deleteAvatar(oldImage).catch(() => {}) : Promise.resolve(),
      prisma.user.update({
        where: { id: userId },
        data: { image: url },
      }),
    ])

    return { url }
  })

/**
 * 更新用户资料
 * - Zod schema 验证
 * - 更新 name, image, bio, pronouns
 * - 返回更新后的用户信息
 */
export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(profileSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image || null,
        bio: data.bio,
        pronouns: data.pronouns,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        pronouns: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  })