export const bookmarkKeys = {
  all: ['bookmark'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  myBookmarks: () => [...bookmarkKeys.all, 'my'] as const,
  status: (articleId: string) => [...bookmarkKeys.all, 'status', articleId] as const,
  multipleStatusBase: () => [...bookmarkKeys.all, 'status'] as const,
  multipleStatus: (articleIds: string[]) => [...bookmarkKeys.all, 'status', articleIds] as const,
}