import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  image: z.string().url('请输入有效的图片URL').or(z.literal('')),
  bio: z.string().max(160, '简介不能超过160个字符').optional(),
  pronouns: z.string().max(4, '代称不能超过4个字符').optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
