import { cn } from "#/lib/utils"
import { getAvatarColor } from "#/lib/utils/avatar-color"
import { Button } from "#/components/ui/button"
import { UserPlus, UserCheck, Edit } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useFollowUser, useUnfollowUser } from "#/hooks/mutations"
import type { FollowStats } from "#/types/follow"

interface ProfileSidebarProps {
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

export function ProfileSidebar({
  author,
  followStats,
  isSelf,
  isFollowing,
}: ProfileSidebarProps) {
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
    <aside className="w-full space-y-6">
      {/* 个人名片区 */}
      <div className="flex flex-col items-center text-center py-6">
        {/* 圆形大头像 */}
        <div
          className={cn(
            "size-24 rounded-full flex items-center justify-center",
            "text-white font-semibold text-3xl",
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
        <h2 className="text-xl font-bold mt-4">{author?.name || "未知用户"}</h2>

        {/* 粉丝数量 */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{followStats.followerCount} Followers</span>
          <span>{followStats.followingCount} Following</span>
        </div>

        {/* 简介 */}
        {author?.bio && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-[240px]">
            {author.bio}
          </p>
        )}

        {/* 按钮区 */}
        {isSelf ? (
          <Link to="/me/settings">
            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full max-w-[200px] font-medium"
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
              "mt-4 w-full max-w-[200px] font-medium",
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
      </div>

      {/* Following 列表 */}
      <div className="border-t border-border/30 pt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Following
        </h3>
        <p className="text-sm text-muted-foreground">
          暂无关注用户
        </p>
      </div>

      {/* Lists 书单 */}
      <div className="border-t border-border/30 pt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Lists
        </h3>
        <p className="text-sm text-muted-foreground">
          暂无公开书单
        </p>
      </div>
    </aside>
  )
}