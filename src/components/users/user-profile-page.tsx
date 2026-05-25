import { useState } from "react"
import { cn } from "#/lib/utils"
import { Route } from "#/routes/_app/users.$username"
import { ProfileSidebar } from "#/components/users/profile-sidebar"
import { ProfileTabs } from "#/components/users/profile-tabs"
import { ProfileTabContent } from "#/components/users/profile-tab-content"
import { MobileProfileHeader } from "#/components/users/mobile-profile-header"
import { PageContainer } from "#/components/layout"

export function UserProfilePage() {
  const data = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState("home")

  const articles = data?.articles ?? []
  const author = data?.author
  const followStats = data?.followStats ?? { followerCount: 0, followingCount: 0 }
  const isSelf = data?.isSelf ?? false
  const isFollowing = data?.isFollowing ?? false

  return (
    <PageContainer width="6xl" variant="spaced">
      {/* 移动端：顶部横幅名片区 */}
      <div className="lg:hidden border-b border-border/30">
        <MobileProfileHeader
          author={author}
          followStats={followStats}
          isSelf={isSelf}
          isFollowing={isFollowing}
        />

        {/* 移动端：紧凑标签导航 */}
        <div className="px-4 pb-2">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* 桌面端：两栏布局 */}
      <div className="hidden lg:flex gap-8 xl:gap-12">
        {/* 左侧核心内容栏 - 65-70% */}
        <div className="flex-1 min-w-0">
          {/* 作者大标题 */}
          <header className="mb-6">
            <h1
              className={cn(
                "text-3xl font-extrabold tracking-tight",
                "text-foreground"
              )}
            >
              {author?.name || "未知用户"}
            </h1>
          </header>

          {/* 二级横向标签页 */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* 文章列表 */}
          <section className="mt-6">
            <ProfileTabContent
              activeTab={activeTab}
              articles={articles}
              author={author}
              variant="desktop"
            />
          </section>
        </div>

        {/* 右侧侧边栏 - 30-35% */}
        <aside className="w-[280px] xl:w-[320px] shrink-0">
          <ProfileSidebar
            author={author}
            followStats={followStats}
            isSelf={isSelf}
            isFollowing={isFollowing}
          />
        </aside>
      </div>

      {/* 移动端：文章列表 */}
      <section className="lg:hidden mt-4">
        <ProfileTabContent
          activeTab={activeTab}
          articles={articles}
          author={author}
          variant="mobile"
        />
      </section>
    </PageContainer>
  )
}