import { Link } from "@tanstack/react-router"
import { cn } from "#/lib/utils"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { Avatar, AvatarImage, AvatarFallback } from "#/components/ui/avatar"
import type { FollowUser } from "#/types/follow"

interface UserListItemProps {
  user: FollowUser
}

export function UserListItem({ user }: UserListItemProps) {
  const avatarColor = getAvatarColor(user.name || "")

  return (
    <Link
      to="/users/$username"
      params={{ username: user.name || "" }}
      className={cn(
        "flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-md",
        "hover:bg-muted/60 transition-colors"
      )}
    >
      <Avatar size="sm">
        {user.image ? (
          <AvatarImage src={user.image} alt={user.name || ""} />
        ) : (
          <AvatarFallback className={cn(avatarColor, "text-white text-xs")}>
            {user.name?.charAt(0) || "?"}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="text-sm font-medium truncate">{user.name || "未知用户"}</span>
    </Link>
  )
}