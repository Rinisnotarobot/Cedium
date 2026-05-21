export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
  myArticles: () => [...articleKeys.all, 'my'] as const,
  myArticlesWithFilter: (status?: string) => [...articleKeys.myArticles(), { status }] as const,
  byAuthor: (username: string) => [...articleKeys.all, 'by-author', username] as const,
}