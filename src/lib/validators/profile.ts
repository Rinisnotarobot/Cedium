import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  image: z.string().url('请输入有效的图片URL').or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>