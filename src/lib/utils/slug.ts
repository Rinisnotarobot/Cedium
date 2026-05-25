/**
 * 生成标签/文章 slug
 * - 转小写
 * - 空格替换为连字符
 * - 移除特殊字符
 * - 支持中文字符
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-一-龥]/g, '')
}