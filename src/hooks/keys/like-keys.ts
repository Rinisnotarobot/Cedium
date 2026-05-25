export const likeKeys = {
  all: ['like'] as const,
  lists: () => [...likeKeys.all, 'list'] as const,
  myLikes: () => [...likeKeys.all, 'my'] as const,
  status: (articleId: string) => [...likeKeys.all, 'status', articleId] as const,
  multipleStatusBase: () => [...likeKeys.all, 'status'] as const,
  multipleStatus: (articleIds: string[]) => [...likeKeys.all, 'status', articleIds] as const,
  count: (articleId: string) => [...likeKeys.all, 'count', articleId] as const,
}