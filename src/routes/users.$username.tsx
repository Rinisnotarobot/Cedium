import { createFileRoute, notFound } from "@tanstack/react-router"
import { getArticlesByAuthorFn } from "#/data/articles"
import { UserProfilePage } from "#/components/users"

export const Route = createFileRoute("/users/$username")({
  loader: async ({ params }) => {
    const result = await getArticlesByAuthorFn({
      data: { username: params.username, page: 1, limit: 20 }
    })
    if (!result.author) {
      throw notFound()
    }
    return result
  },
  component: UserProfilePage,
})