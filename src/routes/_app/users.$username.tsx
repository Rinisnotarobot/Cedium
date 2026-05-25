import { createFileRoute, notFound } from "@tanstack/react-router"
import { getUserProfileDataFn } from "#/data/follow"
import { UserProfilePage } from "#/components/users"

export const Route = createFileRoute("/_app/users/$username")({
  loader: async ({ params }) => {
    const result = await getUserProfileDataFn({
      data: { username: params.username, page: 1, limit: 20 }
    })

    if (!result.author) {
      throw notFound()
    }

    return result
  },
  component: UserProfilePage,
})