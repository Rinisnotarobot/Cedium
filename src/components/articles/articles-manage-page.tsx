import { useState, useCallback } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { cn } from "#/lib/utils"
import { PageContainer, PageHeader } from "#/components/layout"
import { Button } from "#/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { ArticleStatus } from "#/generated/prisma/enums"
import { getMyArticlesFn, getMyArticlesStatsFn } from "#/data/articles"
import { articleKeys } from "#/hooks/keys/article-keys"
import {
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
  useArchiveArticle,
  useRestoreArticle,
} from "#/hooks"
import { StatsBar } from "#/components/articles/stats-bar"
import { ArticleRow } from "#/components/articles/article-row"

type ArticleAction = "delete" | "publish" | "unpublish" | "archive" | "restore"

const ACTION_CONFIG: Record<ArticleAction, { title: string; description: string; actionText: string; variant?: "destructive" }> = {
  delete: {
    title: "删除文章",
    description: "确定要删除这篇文章吗？此操作无法撤销。",
    actionText: "删除",
    variant: "destructive",
  },
  publish: {
    title: "发布文章",
    description: "确定要发布这篇文章吗？发布后所有人都可以看到。",
    actionText: "发布",
  },
  unpublish: {
    title: "撤销发布",
    description: "确定要撤销发布这篇文章吗？文章将变回草稿状态，其他人将无法查看。",
    actionText: "撤销发布",
  },
  archive: {
    title: "归档文章",
    description: "确定要归档这篇文章吗？文章将从公开列表隐藏，但您仍可以查看和恢复。",
    actionText: "归档",
  },
  restore: {
    title: "恢复发布",
    description: "确定要恢复发布这篇文章吗？文章将重新出现在公开列表中。",
    actionText: "恢复发布",
  },
}

const TABS: { status: ArticleStatus; label: string }[] = [
  { status: ArticleStatus.DRAFT, label: "草稿" },
  { status: ArticleStatus.PUBLISHED, label: "已发布" },
  { status: ArticleStatus.ARCHIVED, label: "已归档" },
]

export function ArticlesManagePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ArticleStatus>(ArticleStatus.DRAFT)

  const statsQuery = useQuery({
    queryKey: articleKeys.stats(),
    queryFn: () => getMyArticlesStatsFn({ data: undefined }),
  })

  const articlesQuery = useQuery({
    queryKey: articleKeys.myArticlesWithFilter(activeTab),
    queryFn: () => getMyArticlesFn({ data: { status: activeTab } }),
  })

  const deleteArticle = useDeleteArticle()
  const publishArticle = usePublishArticle()
  const unpublishArticle = useUnpublishArticle()
  const archiveArticle = useArchiveArticle()
  const restoreArticle = useRestoreArticle()

  const [confirmState, setConfirmState] = useState<{ action: ArticleAction; targetId: string } | null>(null)

  const articles = articlesQuery.data?.articles ?? []
  const stats = statsQuery.data

  const handleAction = useCallback((action: ArticleAction, id: string) => {
    setConfirmState({ action, targetId: id })
  }, [])

  const handleConfirm = useCallback(() => {
    if (!confirmState) return

    const { action, targetId } = confirmState
    const mutation = {
      delete: deleteArticle,
      publish: publishArticle,
      unpublish: unpublishArticle,
      archive: archiveArticle,
      restore: restoreArticle,
    }[action]

    mutation.mutate({ id: targetId }, {
      onSuccess: () => {
        router.invalidate()
        setConfirmState(null)
      },
    })
  }, [confirmState, deleteArticle, publishArticle, unpublishArticle, archiveArticle, restoreArticle, router])

  const handleTabChange = (status: ArticleStatus) => {
    setActiveTab(status)
  }

  const config = confirmState ? ACTION_CONFIG[confirmState.action] : null

  // 统计数据映射
  const countByStatus: Record<ArticleStatus, number> = {
    [ArticleStatus.DRAFT]: stats?.draft ?? 0,
    [ArticleStatus.PUBLISHED]: stats?.published ?? 0,
    [ArticleStatus.ARCHIVED]: stats?.archived ?? 0,
  }

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="文章管理" description="管理您的所有文章" />

      {/* 统计条 */}
      {stats && <StatsBar stats={stats} />}

      {/* 下划线风格 Tabs */}
      <nav className="flex gap-1 border-b border-border/40 mb-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.status
          const count = countByStatus[tab.status]
          return (
            <button
              key={tab.status}
              onClick={() => handleTabChange(tab.status)}
              className={cn(
                "px-4 py-2.5 text-sm relative cursor-pointer",
                "transition-[color,opacity] duration-150 ease-out",
                "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-sm",
                "active:scale-[0.97]",
                isActive
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:opacity-80",
                isActive &&
                  "after:absolute after:-bottom-px after:left-0 after:right-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-200 after:ease-out"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 tabular-nums",
                isActive ? "opacity-70" : "opacity-50"
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </nav>

      {/* 文章列表 */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {activeTab === ArticleStatus.DRAFT && "暂无草稿"}
            {activeTab === ArticleStatus.PUBLISHED && "暂无已发布文章"}
            {activeTab === ArticleStatus.ARCHIVED && "暂无已归档文章"}
          </p>
          {activeTab === ArticleStatus.DRAFT && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/write">开始写作</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {articles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              status={activeTab}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* 确认对话框 */}
      <AlertDialog
        open={!!confirmState}
        onOpenChange={(open) => !open && setConfirmState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-wrap-pretty">{config?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                "transition-[background-color] duration-150 ease-out",
                "active:scale-[0.97]",
                config?.variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {config?.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}