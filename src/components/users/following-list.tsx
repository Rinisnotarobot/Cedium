import { useFollowing } from "#/hooks/queries"
import { UserListItem } from "#/components/users/user-list-item"
import type { FollowUser } from "#/types/follow"

interface FollowingListProps {
  userId: string
  limit?: number
  followingCount?: number
}

export function FollowingList({ userId, limit = 5, followingCount }: FollowingListProps) {
  const { data, isLoading } = useFollowing({ userId, page: 1, limit })

  const users = data?.following ?? []
  const total = data?.meta?.total ?? followingCount ?? 0

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2">
            <div className="size-6 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">暂无关注用户</p>
    )
  }

  return (
    <div className="space-y-1">
      {users.map((user: FollowUser) => (
        <UserListItem key={user.id} user={user} />
      ))}
      {total > limit && (
        <p className="text-xs text-muted-foreground pt-2">
          还有 {total - limit} 位关注用户
        </p>
      )}
    </div>
  )
}