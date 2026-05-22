import { createFileRoute } from "@tanstack/react-router"
import { getPublishedArticlesFn } from "#/data/articles"
import { ArticlesPage } from "#/components/home"

export const Route = createFileRoute("/_app/articles")({
  loader: async () => {
    const result = await getPublishedArticlesFn({ data: { page: 1, limit: 20 } })
    return result
  },
  component: ArticlesPage,
})