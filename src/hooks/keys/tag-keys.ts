export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  allTags: () => [...tagKeys.lists(), 'all'] as const,
  bySlug: (slug: string) => [...tagKeys.all, 'by-slug', slug] as const,
}