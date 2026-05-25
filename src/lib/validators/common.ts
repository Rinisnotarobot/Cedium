import { z } from 'zod'

/**
 * 文章 ID schema - 用于 like, bookmark, comment 等多个验证器
 * CUID 格式通常为 25 字符，设置最大 50 字符以容错
 */
export const articleIdSchema = z
  .string()
  .min(1, '文章ID不能为空')
  .max(50, '文章ID格式无效')