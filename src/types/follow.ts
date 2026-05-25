export interface FollowUser {
  id: string
  name: string
  image: string | null
  bio: string | null
}

export interface FollowRelation {
  followerId: string
  followingId: string
  createdAt: Date | string
  follower?: FollowUser
  following?: FollowUser
}

export interface FollowStats {
  followerCount: number
  followingCount: number
}

export interface FollowStatus {
  isFollowing: boolean
}