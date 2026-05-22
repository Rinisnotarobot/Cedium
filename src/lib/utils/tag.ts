import type { Tag } from '#/types/tag'

/**
 * 根据查询搜索标签列表
 * - 纯函数，不依赖 React hooks
 * - 匹配标签名称和 slug
 */
export function searchTags(tags: Tag[] | undefined, query: string): Tag[] {
  if (!tags) return []
  if (!query.trim()) return tags

  const lowerQuery = query.toLowerCase()
  return tags.filter(tag =>
    tag.name.toLowerCase().includes(lowerQuery) ||
    tag.slug.toLowerCase().includes(lowerQuery)
  )
}