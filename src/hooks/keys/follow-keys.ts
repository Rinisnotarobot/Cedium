export const followKeys = {
  all: ['follow'] as const,
  stats: (userId: string) => [...followKeys.all, 'stats', userId] as const,
  statusBase: () => [...followKeys.all, 'status'] as const,
  status: (userId: string, targetUserId: string) =>
    [...followKeys.all, 'status', userId, targetUserId] as const,
  followers: (userId: string) => [...followKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...followKeys.all, 'following', userId] as const,
}