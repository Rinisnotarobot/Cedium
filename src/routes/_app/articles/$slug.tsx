import { createFileRoute, notFound } from "@tanstack/react-router"
import { getArticleByIdFn } from "#/data/articles"
import { ArticleDetailPage } from "#/components/articles"
import { articleKeys } from "#/hooks/keys/article-keys"

export const Route = createFileRoute("/_app/articles/$slug")({
  loader: async ({ params, context }) => {
    const article = await getArticleByIdFn({ data: { id: params.slug } })
    if (!article) {
      throw notFound()
    }

    // 将文章数据放入 Query 缓存，以便组件能响应实时更新
    const queryClient = context.queryClient
    queryClient.setQueryData(articleKeys.detail(article.id), article)

    return { article }
  },
  component: ArticleDetailPage,
})