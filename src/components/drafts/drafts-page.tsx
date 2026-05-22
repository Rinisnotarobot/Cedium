import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { PageContainer, PageHeader } from "#/components/layout"
import { Card, CardContent } from "#/components/ui/card"
import { Clock, Edit3, Trash2, Send, MoreVertical } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
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
import { useDeleteArticle, usePublishArticle } from "#/hooks"
import { Route } from "#/routes/_app/me/drafts"
import type { Article } from "#/types/article"

function DraftCard({
  draft,
  onDelete,
  onPublish,
}: {
  draft: Article
  onDelete: (id: string) => void
  onPublish: (id: string) => void
}) {
  return (
    <Card className="hover:shadow-md hover:border-border/80 transition-all duration-200 group">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <Link
              to="/write"
              search={{ id: draft.id }}
              className="font-semibold leading-snug group-hover:text-primary transition-colors"
            >
              {draft.title || "无标题"}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/write" search={{ id: draft.id }}>
                    <Edit3 className="size-4 mr-2" />
                    编辑
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPublish(draft.id)}>
                  <Send className="size-4 mr-2" />
                  发布
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(draft.id)}
                >
                  <Trash2 className="size-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {draft.excerpt || "暂无摘要"}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {draft.content ? `${draft.content.length} 字` : "0 字"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{new Date(draft.updatedAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DraftsPage() {
  const router = useRouter()
  const data = Route.useLoaderData()
  const deleteArticle = useDeleteArticle()
  const publishArticle = usePublishArticle()

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState<string | null>(null)

  const drafts = data?.articles ?? []
  const total = data?.meta?.total ?? 0

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteArticle.mutate(deleteTarget, {
        onSuccess: () => {
          router.invalidate()
          setDeleteTarget(null)
        },
      })
    }
  }

  function handlePublishConfirm() {
    if (publishTarget) {
      publishArticle.mutate({ id: publishTarget }, {
        onSuccess: () => {
          router.invalidate()
          setPublishTarget(null)
        },
      })
    }
  }

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="草稿箱" description="继续编辑您未完成的文章" />

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无草稿</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/write">开始写作</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground tabular-nums">
              {total} 篇草稿
            </span>
          </div>
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onDelete={setDeleteTarget}
                onPublish={setPublishTarget}
              />
            ))}
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除草稿</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这篇草稿吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 发布确认对话框 */}
      <AlertDialog
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>发布文章</AlertDialogTitle>
            <AlertDialogDescription>
              确定要发布这篇文章吗？发布后所有人都可以看到。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishConfirm}>
              发布
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}