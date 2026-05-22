import { createFileRoute } from "@tanstack/react-router"
import { getMyArticlesFn } from "#/data/articles"
import { DraftsPage } from "#/components/drafts"
import { ArticleStatus } from "#/generated/prisma/enums"

export const Route = createFileRoute("/_app/me/drafts")({
  loader: async () => {
    const result = await getMyArticlesFn({ data: { status: ArticleStatus.DRAFT } })
    return result
  },
  component: DraftsPage,
})