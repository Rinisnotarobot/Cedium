import { createFileRoute, notFound } from "@tanstack/react-router"
import { getArticleByIdFn } from "#/data/articles"
import { ArticleDetailPage } from "#/components/articles"

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleByIdFn({ data: { id: params.slug } })
    if (!article) {
      throw notFound()
    }
    return { article }
  },
  component: ArticleDetailPage,
})