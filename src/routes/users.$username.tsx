import { createFileRoute } from "@tanstack/react-router"
import { UserProfilePage } from "#/components/users"

export const Route = createFileRoute("/users/$username")({
  component: UserProfilePage,
})