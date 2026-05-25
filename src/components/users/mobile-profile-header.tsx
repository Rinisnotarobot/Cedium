import { cn } from "#/lib/utils"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { Button } from "#/components/ui/button"
import { MoreHorizontal, UserPlus, UserCheck, Edit } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useFollowUser, useUnfollowUser } from "#/hooks/mutations"
import type { FollowStats } from "#/types/follow"

interface MobileProfileHeaderProps {
  author: {
    id: string
    name: string
    image: string | null
    bio: string | null
  } | null
  followStats: FollowStats
  isSelf: boolean
  isFollowing: boolean
}

export function MobileProfileHeader({
  author,
  followStats,
  isSelf,
  isFollowing,
}: MobileProfileHeaderProps) {
  const avatarColor = getAvatarColor(author?.name || "")
  const followMutation = useFollowUser()
  const unfollowMutation = useUnfollowUser()

  const handleFollowClick = () => {
    if (!author?.id) return
    if (isFollowing) {
      unfollowMutation.mutate({ userId: author.id })
    } else {
      followMutation.mutate({ userId: author.id })
    }
  }

  const isLoading = followMutation.isPending || unfollowMutation.isPending

  return (
    <header className="flex flex-col items-center py-6">
      {/* 顶部：三点菜单 */}
      <div className="w-full flex justify-end mb-4">
        <button
          type="button"
          className="size-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* 圆形大头像 */}
      <div
        className={cn(
          "size-20 rounded-full flex items-center justify-center",
          "text-white font-semibold text-2xl",
          "ring-4 ring-white/10",
          avatarColor
        )}
      >
        {author?.image ? (
          <img
            src={author.image}
            alt={author.name}
            className="size-full rounded-full object-cover"
          />
        ) : (
          author?.name?.charAt(0) || "?"
        )}
      </div>

      {/* 名字 */}
      <h1 className="text-xl font-bold mt-3 text-primary">
        {author?.name || "未知用户"}
      </h1>

      {/* 粉丝数 */}
      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
        <span className="font-medium">{followStats.followerCount.toLocaleString()}</span>
        <span>followers</span>
        <span className="font-medium">{followStats.followingCount.toLocaleString()}</span>
        <span>following</span>
      </div>

      {/* 简介 */}
      {author?.bio && (
        <p className="text-sm text-muted-foreground mt-3 text-center max-w-[280px] leading-relaxed">
          {author.bio}
        </p>
      )}

      {/* 按钮区 */}
      {isSelf ? (
        <Link to="/me/settings">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "mt-4 w-full font-semibold"
            )}
          >
            <Edit className="size-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      ) : (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="lg"
          className={cn(
            "mt-4 w-full font-semibold",
            !isFollowing && "bg-foreground text-background hover:bg-foreground/90"
          )}
          onClick={handleFollowClick}
          disabled={isLoading}
        >
          {isFollowing ? (
            <>
              <UserCheck className="size-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      )}
    </header>
  )
}