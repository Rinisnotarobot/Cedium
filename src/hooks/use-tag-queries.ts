import { useQuery } from '@tanstack/react-query'
import { getAllTagsFn } from '#/data/tags'
import { tagKeys } from '#/hooks/keys/tag-keys'
import { searchTags } from '#/lib/utils/tag'
import type { Tag } from '#/types/tag'

/**
 * 获取所有标签 query hook
 */
export function useAllTags() {
  return useQuery({
    queryKey: tagKeys.allTags(),
    queryFn: () => getAllTagsFn(),
    staleTime: 1000 * 60 * 5, // 5 分钟内不重新请求
  })
}

/**
 * 根据 query 搜索标签
 * @deprecated 使用 searchTags 代替，此函数已移到 utils
 */
export function useSearchTags(tags: Tag[] | undefined, query: string): Tag[] {
  return searchTags(tags, query)
}