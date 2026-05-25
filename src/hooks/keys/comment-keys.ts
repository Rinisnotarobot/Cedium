export const commentKeys = {
  all: ['comment'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (articleId: string, sort: string) =>
    [...commentKeys.all, 'list', articleId, sort] as const,
  myComments: () => [...commentKeys.all, 'my'] as const,
  status: (commentId: string) =>
    [...commentKeys.all, 'status', commentId] as const,
  multipleStatusBase: () => [...commentKeys.all, 'status'] as const,
  multipleStatus: (commentIds: string[]) =>
    [...commentKeys.all, 'status', commentIds] as const,
  count: (articleId: string) =>
    [...commentKeys.all, 'count', articleId] as const,
}